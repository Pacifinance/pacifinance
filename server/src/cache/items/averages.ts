import { ExtDate } from "../../libs/datelib"

import users from "../../db/models/users"
import balances from "../../db/models/balances"
import expenses from "../../db/models/expenses"
import tags from "../../db/models/tags"

/**
 * Contains all the relevant averages of a user
 */
type Averages = {
    balances: number,
    expenses: number,
    incomes: number,
    savingsRates: number,
    expensesByCategory: {
        [categoryIndex: number]: number
    }
}

/**
 * Accumulates values to compute their average
 */
class Accumulator {
    private sum: number
    private count: number
    
    public constructor() {
        this.sum = 0
        this.count = 0
    }

    public accumulate(value: number) {
        this.sum += value
        this.count++
    }

    public getAverage() {
        if (this.count === 0)
            return 0
        return this.sum / this.count
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
            expensesByCategory: Object.entries(this.expensesByCategory).reduce(
                (obj, [categoryIndex, acc]) => ({...obj, [Number(categoryIndex)]: acc.getAverage()}),
                {}
            )
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

type UsersList = Awaited<ReturnType<typeof users.getAllUsersIds>>
type Expense = Awaited<ReturnType<typeof expenses.getMonthlyExpensesByUserId>>[0]

/**
 * Computes the averages given a list of users
 * @param usersList List of users
 * @param now Current time
 * @returns Averages among the provided users
 */
async function computeAverages(usersList: UsersList, now: ExtDate): Promise<Averages> {
    const thisMonthStart = ExtDate.fromReferenceMonthStart(now)
    const lastMonthStart = ExtDate.fromReferenceMonthEnd(now)

    const expenseTags = await tags.getAllTagsByType(tags.TagType.expense.value)
    const averagesData = new AveragesData(expenseTags)

    for (const user of usersList) {
        // Note: usersList only carries {id, userId} (see users.getAllUsersIds) - it never
        // included account_type, so a "skip test/demo users" check here was always a no-op
        // even before the migration (test/demo exclusion happens via getAllUsersIds'
        // ignore_test_users param instead, see fetchUserAverages below).

        // User balance up to last month
        const balanceTotal = await balances.getTotalLatestByUserId(user.id, thisMonthStart)
        if (balanceTotal !== null)
            averagesData.addBalance(balanceTotal)

        // User total expenses of the last month
        const expensesTotal = await expenses.getTotalMonthlyExpensesByUserId(user.id, lastMonthStart, true)
        if (expensesTotal !== null)
            averagesData.addExpense(expensesTotal)

        // User total incomes of the last month
        const incomesTotal = await expenses.getTotalMonthlyExpensesByUserId(user.id, lastMonthStart, false)
        if (incomesTotal !== null)
            averagesData.addIncome(incomesTotal)

        // User expenses, total expenses and total incomes for the full year
        let yearlyExpenses: Expense[] = []
        let expensesYearlyTotal = 0
        let incomesYearlyTotal = 0
        const month = thisMonthStart
        let countedMonths = 0
        while (countedMonths < 12) {
            countedMonths++
            month.moveByMonths(-1) // previous month
        
            yearlyExpenses = [
                ...yearlyExpenses,
                ...(await expenses.getMonthlyExpensesByUserId(user.id, month, true))
            ]
            expensesYearlyTotal += await expenses.getTotalMonthlyExpensesByUserId(user.id, month, true) ?? 0
            incomesYearlyTotal += await expenses.getTotalMonthlyExpensesByUserId(user.id, month, false) ?? 0
        }

        // User saving rate for the full year
        if (incomesYearlyTotal !== 0) {
            const savingRate = (incomesYearlyTotal - expensesYearlyTotal) / incomesYearlyTotal * 100
            averagesData.addSavingRate(savingRate)
        }

        // User expenses by category for the full year
        const yearlyTotalExpensesByCategory: {[categoryIndex: number]: number} = {}
        for (const expense of yearlyExpenses) {
            if (!expense.categoryTag) continue // category_tag_id is NOT NULL in the DB; guards a failed join only
            const categoryIndex = expense.categoryTag.index
            yearlyTotalExpensesByCategory[categoryIndex] =
                (yearlyTotalExpensesByCategory[categoryIndex] || 0) + expense.amount
        }
        for (const categoryIndexStr of Object.keys(yearlyTotalExpensesByCategory)) {
            const categoryIndex = Number(categoryIndexStr)
            averagesData.addExpenseByCategory(categoryIndex, yearlyTotalExpensesByCategory[categoryIndex])
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
            balances: 0,
            expenses: 0,
            incomes: 0,
            savingsRates: 0,
            expensesByCategory: {}
        }
    }

    const now = ExtDate.fromNow()

    const allUsersList = await users.getAllUsersIds() // test users included
    averagesCachedData.all = await computeAverages(allUsersList, now)

    for (const user of allUsersList) {
        const userRef = user.id
        const similarUsersList = await users.getAllUsersIds(userRef, true) // only similar, non-test users
        averagesCachedData[userRef] = await computeAverages(similarUsersList, now)
    }

    console.log("Finished computation of users averages")

    return averagesCachedData
}

export default { fetchUserAverages }