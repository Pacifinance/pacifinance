import { ExtDate } from "../../libs/datelib"
import { addCurrency, roundCurrency, toCents, fromCents } from "../../libs/money"

import users from "../../db/models/users"
import balances from "../../db/models/balances"
import expenses from "../../db/models/expenses"
import tags from "../../db/models/tags"
import similarUsers from "../../services/similarUsers"

/**
 * Contains all the relevant averages of a user. A null field means there was
 * no data to average (e.g. an empty "similar users" cohort - see
 * server/src/services/similarUsers.ts), which the frontend renders as
 * "Prossimamente" rather than a misleading zero.
 */
type Averages = {
    balances: number | null,
    expenses: number | null,
    incomes: number | null,
    savingsRates: number | null,
    expensesByCategory: {
        [categoryIndex: number]: number
    }
}

/**
 * Accumulates values (currency amounts or percentages, both 2-decimal
 * precision) to compute their average. Sums in integer-scaled-by-100 space so
 * repeated accumulation across many users/months never drifts from float
 * representation noise - see server/src/libs/money.ts.
 */
class Accumulator {
    private sumScaled: number
    private count: number

    public constructor() {
        this.sumScaled = 0
        this.count = 0
    }

    public accumulate(value: number) {
        this.sumScaled += toCents(value)
        this.count++
    }

    /** Returns null (no data) rather than a misleading 0 when nothing was accumulated. */
    public getAverage(): number | null {
        if (this.count === 0)
            return null
        return roundCurrency(fromCents(this.sumScaled) / this.count)
    }
}

/**
 * Accumulates the values for computing the relevant averages of a user
 */
class AveragesData {
    private balances: Accumulator
    private expenses: Accumulator
    private incomes: Accumulator
    private savingRates: Accumulator
    private expensesByCategory: {
        [categoryIndex: number]: Accumulator
    }

    public constructor(expenseCategories?: Awaited<ReturnType<typeof tags.getAllTagsByType>>) {
        this.balances = new Accumulator()
        this.expenses = new Accumulator()
        this.incomes = new Accumulator()
        this.savingRates = new Accumulator()
        this.expensesByCategory = {}

        if (expenseCategories) {
            for (const category of expenseCategories)
                this.expensesByCategory[category.index] = new Accumulator()
        }
    }

    public addBalance(value: number) {
        this.balances.accumulate(value)
    }

    public addExpense(value: number) {
        this.expenses.accumulate(value)
    }

    public addIncome(value: number) {
        this.incomes.accumulate(value)
    }

    public addSavingRate(value: number) {
        this.savingRates.accumulate(value)
    }

    public addExpenseByCategory(categoryIndex: number, value: number) {
        this.expensesByCategory[categoryIndex].accumulate(value)
    }

    public getAverages(): Averages {
        return {
            balances: this.balances.getAverage(),
            expenses: this.expenses.getAverage(),
            incomes: this.incomes.getAverage(),
            savingsRates: this.savingRates.getAverage(),
            // Categories with no contributing user are omitted entirely rather than
            // included as 0 (the map's values are plain numbers, never null).
            expensesByCategory: Object.entries(this.expensesByCategory).reduce((obj, [categoryIndex, acc]) => {
                const average = acc.getAverage()
                return average === null ? obj : {...obj, [Number(categoryIndex)]: average}
            }, {} as { [categoryIndex: number]: number })
        }
    }
}

/**
 * How the averages of all users are stored in the cache
 */
export type AveragesCachedData = {
    all: Averages,
    [user: string]: Averages // mongodb ObjectId converted to string
}

type Expense = Awaited<ReturnType<typeof expenses.getMonthlyExpensesByUserId>>[0]

/**
 * Which user ids feed which accumulator. For the "all users" bucket every
 * field is the same full list; for a given user's "similar" bucket each field
 * is that user's cohort for that specific metric (see
 * server/src/services/similarUsers.ts) - balance/incomes/outflows weigh
 * profile fields differently, and savings rate (mixing income and outflow
 * behavior) uses the blended "general" cohort.
 */
type MetricCohorts = {
    balance: string[],
    incomes: string[],
    outflows: string[],
    general: string[]
}

/**
 * Computes averages, pulling each metric only from the users in its own
 * cohort. A user contributes to the 12-month lookup (needed for the category
 * breakdown and/or the savings rate) at most once even if present in both the
 * outflows and general cohorts, since those overlap heavily in practice.
 * @param cohorts Per-metric user id lists
 * @param now Current time
 * @returns Averages among the provided cohorts
 */
async function computeAveragesForCohorts(cohorts: MetricCohorts, now: ExtDate): Promise<Averages> {
    const thisMonthStart = ExtDate.fromReferenceMonthStart(now)
    const lastMonthStart = ExtDate.fromReferenceMonthEnd(now)

    const expenseTags = await tags.getAllTagsByType(tags.TagType.expense.value)
    const averagesData = new AveragesData(expenseTags)

    const balanceSet = new Set(cohorts.balance)
    const incomesSet = new Set(cohorts.incomes)
    const outflowsSet = new Set(cohorts.outflows)
    const generalSet = new Set(cohorts.general)
    const allUserIds = new Set([...balanceSet, ...incomesSet, ...outflowsSet, ...generalSet])

    for (const userId of allUserIds) {
        // User balance up to last month
        if (balanceSet.has(userId)) {
            const balanceTotal = await balances.getTotalLatestByUserId(userId, thisMonthStart)
            if (balanceTotal !== null)
                averagesData.addBalance(balanceTotal)
        }

        // User total incomes of the last month
        if (incomesSet.has(userId)) {
            const incomesTotal = await expenses.getTotalMonthlyExpensesByUserId(userId, lastMonthStart, false)
            if (incomesTotal !== null)
                averagesData.addIncome(incomesTotal)
        }

        // User total expenses of the last month
        if (outflowsSet.has(userId)) {
            const expensesTotal = await expenses.getTotalMonthlyExpensesByUserId(userId, lastMonthStart, true)
            if (expensesTotal !== null)
                averagesData.addExpense(expensesTotal)
        }

        // Category breakdown needs outflows cohort membership; savings rate needs general
        // cohort membership. Both need a 12-month lookup, run once if either applies.
        const needsCategoryBreakdown = outflowsSet.has(userId)
        const needsSavingsRate = generalSet.has(userId)
        if (!needsCategoryBreakdown && !needsSavingsRate) continue

        let yearlyExpenses: Expense[] = []
        let expensesYearlyTotal = 0
        let incomesYearlyTotal = 0
        const month = thisMonthStart
        let countedMonths = 0
        while (countedMonths < 12) {
            countedMonths++
            month.moveByMonths(-1) // previous month

            if (needsCategoryBreakdown) {
                yearlyExpenses = [
                    ...yearlyExpenses,
                    ...(await expenses.getMonthlyExpensesByUserId(userId, month, true))
                ]
            }
            expensesYearlyTotal = addCurrency(expensesYearlyTotal, await expenses.getTotalMonthlyExpensesByUserId(userId, month, true) ?? 0)
            incomesYearlyTotal = addCurrency(incomesYearlyTotal, await expenses.getTotalMonthlyExpensesByUserId(userId, month, false) ?? 0)
        }

        // User saving rate for the full year
        if (needsSavingsRate && incomesYearlyTotal !== 0) {
            const savingRate = (incomesYearlyTotal - expensesYearlyTotal) / incomesYearlyTotal * 100
            averagesData.addSavingRate(savingRate)
        }

        // User expenses by category for the full year
        if (needsCategoryBreakdown) {
            const yearlyTotalExpensesByCategory: {[categoryIndex: number]: number} = {}
            for (const expense of yearlyExpenses) {
                if (!expense.categoryTag) continue // category_tag_id is NOT NULL in the DB; guards a failed join only
                const categoryIndex = expense.categoryTag.index
                yearlyTotalExpensesByCategory[categoryIndex] =
                    addCurrency(yearlyTotalExpensesByCategory[categoryIndex] || 0, expense.amount)
            }
            for (const categoryIndexStr of Object.keys(yearlyTotalExpensesByCategory)) {
                const categoryIndex = Number(categoryIndexStr)
                averagesData.addExpenseByCategory(categoryIndex, yearlyTotalExpensesByCategory[categoryIndex])
            }
        }
    }

    return averagesData.getAverages()
}

/**
 * Computes the averages for the last month among all users and for each user
 * @returns Object to store in the database and cache
 */
async function fetchUserAverages(): Promise<AveragesCachedData> {
    // For each user, get its total balance, total expenses and total incomes of the last month
    // Then, compute the average of all balances, expenses and incomes

    console.log("Started computation of users averages")

    const averagesCachedData: AveragesCachedData = {
        all: {
            balances: null,
            expenses: null,
            incomes: null,
            savingsRates: null,
            expensesByCategory: {}
        }
    }

    const now = ExtDate.fromNow()

    const allUsersList = await users.getAllUsersIds() // test users included
    const allUserIds = allUsersList.map((user) => user.id)
    averagesCachedData.all = await computeAveragesForCohorts(
        { balance: allUserIds, incomes: allUserIds, outflows: allUserIds, general: allUserIds }, now
    )

    // Fetched once and reused for every user below, instead of once per
    // (user, metric) pair - see similarUsers.fetchProfilesSnapshot.
    const snapshot = await similarUsers.fetchProfilesSnapshot()

    for (const user of allUsersList) {
        const userRef = user.id
        const balanceCohort = similarUsers.selectSimilarUserIds(snapshot, userRef, "balance")
        const incomesCohort = similarUsers.selectSimilarUserIds(snapshot, userRef, "incomes")
        const outflowsCohort = similarUsers.selectSimilarUserIds(snapshot, userRef, "outflows")
        const generalCohort = similarUsers.selectSimilarUserIds(snapshot, userRef, "general")
        averagesCachedData[userRef] = await computeAveragesForCohorts({
            balance: balanceCohort.userIds,
            incomes: incomesCohort.userIds,
            outflows: outflowsCohort.userIds,
            general: generalCohort.userIds
        }, now)
    }

    console.log("Finished computation of users averages")

    return averagesCachedData
}

export default { fetchUserAverages }