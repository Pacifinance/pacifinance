import db from "../db/db"
import redis from "../cache/redisClient"
import { ExtDate } from "../libs/datelib"
import { rankFromBalancePool, rankFromExpensePool } from "./ranking"
import similarUsers, {
    MIN_COHORT,
    normalizeComparisonFactorGroups,
    type ComparisonFactorGroup
} from "./similarUsers"

const CACHE_TTL_SECONDS = 300

export type CustomBenchmark = {
    available: boolean,
    factors: ComparisonFactorGroup[],
    generatedAt: string,
    cohort: {
        size: number,
        populationSize: number,
        minimumSize: number,
        averageSimilarity: number | null
    },
    averages: {
        balances: number | null,
        incomes: number | null,
        expenses: number | null
    },
    rankings: {
        balance: number,
        incomes: number,
        outflows: number
    }
}

function averagePool(pool: Array<{ userId: string, total: number }>, excludedUserId: string) {
    const values = pool.filter((entry) => entry.userId !== excludedUserId).map((entry) => entry.total)
    if (values.length === 0) return null
    return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100) / 100
}

function cacheKey(userId: string, factors: ComparisonFactorGroup[]) {
    return `comparison:custom:v1:${userId}:${factors.join(",")}`
}

/**
 * Computes an on-demand peer benchmark. This is deliberately limited to the
 * three monthly/community metrics that can be aggregated by Supabase RPCs in
 * one query each. Redis makes repeated UI changes inexpensive without storing
 * any financial details in the browser or cache key.
 */
async function getCustomBenchmark(userId: string, rawFactors: unknown): Promise<CustomBenchmark> {
    const factors = normalizeComparisonFactorGroups(rawFactors)
    const key = cacheKey(userId, factors)
    let cached: CustomBenchmark | null = null
    try {
        cached = await redis.get<CustomBenchmark>(key)
    } catch (error) {
        console.warn("customBenchmark: Redis read failed, computing without cache", error)
    }
    if (cached) return cached

    const snapshot = await similarUsers.fetchProfilesSnapshot()
    const cohort = similarUsers.selectCustomSimilarUserIds(snapshot, userId, factors)
    const generatedAt = new Date().toISOString()

    const base = {
        factors,
        generatedAt,
        cohort: {
            size: cohort.userIds.length,
            populationSize: cohort.populationSize,
            minimumSize: MIN_COHORT,
            averageSimilarity: cohort.averageSimilarity
        }
    }

    // Dynamic filters can become very narrow. Unlike the broad default
    // benchmark, never return a custom result below the anonymity threshold.
    if (cohort.insufficientData || cohort.userIds.length < MIN_COHORT) {
        return {
            available: false,
            ...base,
            averages: { balances: null, incomes: null, expenses: null },
            rankings: { balance: 0, incomes: 0, outflows: 0 }
        }
    }

    // Include the requester only in percentile pools. Averages remain based
    // exclusively on peers, otherwise a small cohort would be biased by the
    // very value the user is trying to compare.
    const rankPoolIds = [...cohort.userIds, userId]
    const referenceDate = ExtDate.fromNow()
    referenceDate.moveByMonths(-1)
    const [balancePool, incomePool, expensePool] = await Promise.all([
        db.balances.getRankingPool(rankPoolIds, true),
        db.expenses.getExpenseRankingPool(rankPoolIds, false, referenceDate),
        db.expenses.getExpenseRankingPool(rankPoolIds, true, referenceDate)
    ])

    const result: CustomBenchmark = {
        available: true,
        ...base,
        averages: {
            balances: averagePool(balancePool, userId),
            incomes: averagePool(incomePool, userId),
            expenses: averagePool(expensePool, userId)
        },
        rankings: {
            balance: rankFromBalancePool(balancePool, userId),
            incomes: rankFromExpensePool(incomePool, userId, false),
            outflows: rankFromExpensePool(expensePool, userId, true)
        }
    }

    try {
        await redis.set(key, result, { ex: CACHE_TTL_SECONDS })
    } catch (error) {
        console.warn("customBenchmark: Redis write failed, serving uncached result", error)
    }
    return result
}

export default { getCustomBenchmark }
