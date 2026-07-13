import { ExtDate } from "../../libs/datelib"
import { roundCurrency, toCents, fromCents } from "../../libs/money"

import users from "../../db/models/users"
import benchmarks, { type BenchmarkMetricRow } from "../../db/models/benchmarks"
import similarUsers, { MIN_COHORT } from "../../services/similarUsers"

/**
 * Contains all the relevant averages of a user. A null field means there was
 * no data to average (e.g. an empty "similar users" cohort - see
 * server/src/services/similarUsers.ts), which the frontend renders as
 * "Prossimamente" rather than a misleading zero.
 */
export type BenchmarkMetadata = {
    generatedAt: string,
    populationSize: number,
    minimumCohortSize: number,
    cohortSizes: {
        balances: number,
        incomes: number,
        expenses: number,
        savingsRates: number
    },
    averageSimilarity: {
        balances: number | null,
        incomes: number | null,
        expenses: number | null,
        savingsRates: number | null
    }
}

/** Robust, metric-specific distribution summary. Values are rounded only at
 * the API boundary; the raw sample is never cached or returned to clients. */
export type DistributionSummary = {
    count: number,
    median: number | null,
    firstQuartile: number | null,
    thirdQuartile: number | null
}

export type LongitudinalBenchmarkPoint = {
    monthsAgo: 3 | 6 | 12,
    asOf: string,
    reliability: "low" | "medium" | "high",
    contributorCount: number,
    balances: number | null,
    incomes: number | null,
    expenses: number | null,
    savingsRates: number | null
}

export type Averages = {
    balances: number | null,
    expenses: number | null,
    incomes: number | null,
    savingsRates: number | null,
    expensesByCategory: {
        [categoryIndex: number]: number
    },
    distributions: {
        balances: DistributionSummary,
        expenses: DistributionSummary,
        incomes: DistributionSummary,
        savingsRates: DistributionSummary
    },
    longitudinal?: LongitudinalBenchmarkPoint[],
    benchmark?: BenchmarkMetadata
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
    private values: number[]

    public constructor() {
        this.sumScaled = 0
        this.count = 0
        this.values = []
    }

    public accumulate(value: number) {
        this.sumScaled += toCents(value)
        this.count++
        this.values.push(value)
    }

    /** Returns null (no data) rather than a misleading 0 when nothing was accumulated. */
    public getAverage(): number | null {
        if (this.count === 0)
            return null
        return roundCurrency(fromCents(this.sumScaled) / this.count)
    }

    public getDistribution(): DistributionSummary {
        if (this.values.length === 0) return {count: 0, median: null, firstQuartile: null, thirdQuartile: null}
        const sorted = [...this.values].sort((a, b) => a - b)
        const percentile = (p: number) => {
            const index = (sorted.length - 1) * p
            const lower = Math.floor(index)
            const upper = Math.ceil(index)
            const value = lower === upper ? sorted[lower] : sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower)
            return roundCurrency(value)
        }
        return {count: sorted.length, median: percentile(0.5), firstQuartile: percentile(0.25), thirdQuartile: percentile(0.75)}
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

    public constructor() {
        this.balances = new Accumulator()
        this.expenses = new Accumulator()
        this.incomes = new Accumulator()
        this.savingRates = new Accumulator()
        this.expensesByCategory = {}

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
        if (!this.expensesByCategory[categoryIndex])
            this.expensesByCategory[categoryIndex] = new Accumulator()
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
            }, {} as { [categoryIndex: number]: number }),
            distributions: {
                balances: this.balances.getDistribution(),
                expenses: this.expenses.getDistribution(),
                incomes: this.incomes.getDistribution(),
                savingsRates: this.savingRates.getDistribution()
            }
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
 * @param rowsByUserId Compact monthly/yearly aggregates fetched once for every user
 * @returns Averages among the provided cohorts
 */
function computeAveragesForCohorts(cohorts: MetricCohorts, rowsByUserId: Map<string, BenchmarkMetricRow>): Averages {
    const averagesData = new AveragesData()

    const balanceSet = new Set(cohorts.balance)
    const incomesSet = new Set(cohorts.incomes)
    const outflowsSet = new Set(cohorts.outflows)
    const generalSet = new Set(cohorts.general)
    const allUserIds = new Set([...balanceSet, ...incomesSet, ...outflowsSet, ...generalSet])

    for (const userId of allUserIds) {
        const row = rowsByUserId.get(userId)
        if (!row) continue

        if (balanceSet.has(userId) && row.balanceTotal !== null)
            averagesData.addBalance(row.balanceTotal)
        if (incomesSet.has(userId) && row.monthlyIncome !== null)
            averagesData.addIncome(row.monthlyIncome)
        if (outflowsSet.has(userId) && row.monthlyExpenses !== null)
            averagesData.addExpense(row.monthlyExpenses)

        if (generalSet.has(userId) && row.yearlyIncome !== null && row.yearlyIncome !== 0) {
            const savingRate = (row.yearlyIncome - (row.yearlyExpenses ?? 0)) / row.yearlyIncome * 100
            averagesData.addSavingRate(savingRate)
        }
        if (outflowsSet.has(userId)) {
            for (const [categoryIndex, total] of Object.entries(row.yearlyExpensesByCategory))
                averagesData.addExpenseByCategory(Number(categoryIndex), total)
        }
    }

    return averagesData.getAverages()
}

function reliabilityFor(count: number): LongitudinalBenchmarkPoint["reliability"] {
    if (count >= MIN_COHORT * 2) return "high"
    if (count >= MIN_COHORT) return "medium"
    return "low"
}

function longitudinalPoint(monthsAgo: 3 | 6 | 12, asOf: ExtDate, cohorts: MetricCohorts, rows: BenchmarkMetricRow[]): LongitudinalBenchmarkPoint {
    const averages = computeAveragesForCohorts(cohorts, new Map(rows.map((row) => [row.userId, row])))
    const contributorCount = Math.min(
        averages.distributions.balances.count,
        averages.distributions.incomes.count,
        averages.distributions.expenses.count
    )
    return {
        monthsAgo,
        asOf: asOf.toISOString(),
        reliability: reliabilityFor(contributorCount),
        contributorCount,
        balances: averages.balances,
        incomes: averages.incomes,
        expenses: averages.expenses,
        savingsRates: averages.savingsRates
    }
}

/**
 * Computes the averages for the last month among all users and for each user
 * @returns Object to store in the database and cache
 */
async function fetchUserAverages(): Promise<AveragesCachedData> {
    // Stage timings stay in the logs because the source query cost depends on
    // data shape. Cohort aggregation below is now CPU-only and deterministic.
    const t0 = Date.now()
    console.log("Started computation of users averages")

    const averagesCachedData: AveragesCachedData = {
        all: {
            balances: null,
            expenses: null,
            incomes: null,
            savingsRates: null,
            expensesByCategory: {},
            distributions: {
                balances: {count: 0, median: null, firstQuartile: null, thirdQuartile: null},
                expenses: {count: 0, median: null, firstQuartile: null, thirdQuartile: null},
                incomes: {count: 0, median: null, firstQuartile: null, thirdQuartile: null},
                savingsRates: {count: 0, median: null, firstQuartile: null, thirdQuartile: null}
            }
        }
    }

    const now = ExtDate.fromNow()

    // Demo and test accounts must never influence real community benchmarks.
    const allUsersList = await users.getAllBenchmarkUserIds()
    const allUserIds = allUsersList.map((user) => user.id)
    console.log(`[averages] fetched ${allUsersList.length} users (+${Date.now() - t0}ms)`)

    const currentMonth = ExtDate.fromReferenceMonthStart(now)
    const metricRows = await benchmarks.getMetricRows(allUserIds, currentMonth)
    const rowsByUserId = new Map(metricRows.map((row) => [row.userId, row]))
    console.log(`[averages] current source metrics fetched (+${Date.now() - t0}ms)`)

    const historyDates = ([3, 6, 12] as const).map((monthsAgo) => {
        const date = currentMonth.copy()
        date.moveByMonths(-monthsAgo)
        return {monthsAgo, date}
    })
    const historicalRows = await Promise.all(historyDates.map(async ({monthsAgo, date}) => ({
        monthsAgo,
        date,
        rows: await benchmarks.getMetricRows(allUserIds, date)
    })))
    console.log(`[averages] 3/6/12-month source metrics fetched (+${Date.now() - t0}ms)`)

    averagesCachedData.all = computeAveragesForCohorts(
        { balance: allUserIds, incomes: allUserIds, outflows: allUserIds, general: allUserIds }, rowsByUserId
    )
    averagesCachedData.all.benchmark = {
        generatedAt: now.toISOString(),
        populationSize: allUserIds.length,
        minimumCohortSize: MIN_COHORT,
        cohortSizes: {
            balances: allUserIds.length,
            incomes: allUserIds.length,
            expenses: allUserIds.length,
            savingsRates: allUserIds.length
        },
        averageSimilarity: {
            balances: null, incomes: null, expenses: null, savingsRates: null
        }
    }
    averagesCachedData.all.longitudinal = historicalRows.map(({monthsAgo, date, rows}) => longitudinalPoint(
        monthsAgo, date,
        {balance: allUserIds, incomes: allUserIds, outflows: allUserIds, general: allUserIds},
        rows
    ))
    console.log(`[averages] "all" cohort computed (+${Date.now() - t0}ms)`)

    // Fetched once and reused for every user below. No financial values are
    // read again while building cohorts.
    const snapshot = await similarUsers.fetchMonthlyProfilesSnapshot(now)
    console.log(`[averages] profiles snapshot fetched (+${Date.now() - t0}ms)`)

    for (const user of allUsersList) {
        const userRef = user.id
        const balanceCohort = similarUsers.selectSimilarUserIds(snapshot, userRef, "balance")
        const incomesCohort = similarUsers.selectSimilarUserIds(snapshot, userRef, "incomes")
        const outflowsCohort = similarUsers.selectSimilarUserIds(snapshot, userRef, "outflows")
        const generalCohort = similarUsers.selectSimilarUserIds(snapshot, userRef, "general")
        const userAverages = computeAveragesForCohorts({
            balance: balanceCohort.userIds,
            incomes: incomesCohort.userIds,
            outflows: outflowsCohort.userIds,
            general: generalCohort.userIds
        }, rowsByUserId)
        userAverages.benchmark = {
            generatedAt: now.toISOString(),
            populationSize: Math.max(
                balanceCohort.populationSize,
                incomesCohort.populationSize,
                outflowsCohort.populationSize,
                generalCohort.populationSize
            ),
            minimumCohortSize: MIN_COHORT,
            cohortSizes: {
                balances: balanceCohort.userIds.length,
                incomes: incomesCohort.userIds.length,
                expenses: outflowsCohort.userIds.length,
                savingsRates: generalCohort.userIds.length
            },
            averageSimilarity: {
                balances: balanceCohort.averageSimilarity,
                incomes: incomesCohort.averageSimilarity,
                expenses: outflowsCohort.averageSimilarity,
                savingsRates: generalCohort.averageSimilarity
            }
        }
        const cohorts = {
            balance: balanceCohort.userIds,
            incomes: incomesCohort.userIds,
            outflows: outflowsCohort.userIds,
            general: generalCohort.userIds
        }
        userAverages.longitudinal = historicalRows.map(({monthsAgo, date, rows}) => longitudinalPoint(monthsAgo, date, cohorts, rows))
        averagesCachedData[userRef] = userAverages
    }

    console.log(`[averages] per-user averages computed (+${Date.now() - t0}ms)`)
    console.log("Finished computation of users averages")

    return averagesCachedData
}

export default { fetchUserAverages }
