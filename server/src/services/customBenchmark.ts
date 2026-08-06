import db from "../db/db"
import redis from "../cache/redisClient"
import { ExtDate } from "../libs/datelib"
import type { AssetAllocation } from "../db/models/benchmarks"
import { rankFromBalancePool, rankFromTransactionPool } from "./ranking"
import similarUsers, {
    MIN_COHORT,
    normalizeComparisonFactorGroups,
    type ComparisonFactorGroup
} from "./similarUsers"

const CACHE_TTL_SECONDS = 300
const PREVIEW_CACHE_TTL_SECONDS = 60

export type CustomBenchmarkPreview = {
    factors: ComparisonFactorGroup[],
    available: boolean,
    cohort: {
        size: number,
        populationSize: number,
        minimumSize: number,
        averageSimilarity: number | null
    }
}

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
        assetAllocation: AssetAllocation | null
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

function averageAssetAllocation(rows: Array<{ assetAllocation: AssetAllocation | null }>): AssetAllocation | null {
    const allocations = rows.flatMap((row) => row.assetAllocation ? [row.assetAllocation] : [])
    if (allocations.length === 0) return null
    const average = (key: keyof AssetAllocation) => Math.round(
        allocations.reduce((sum, allocation) => sum + allocation[key], 0) / allocations.length * 100
    ) / 100
    return { liquid: average("liquid"), investments: average("investments"), crypto: average("crypto") }
}

function cacheKey(userId: string, factors: ComparisonFactorGroup[]) {
    return `comparison:custom:v1:${userId}:${factors.join(",")}`
}

function previewCacheKey(userId: string, factors: ComparisonFactorGroup[]) {
    return `comparison:preview:v1:${userId}:${factors.join(",")}`
}

/** Returns cohort size and quality without fetching financial metrics. */
async function previewCustomBenchmark(userId: string, rawFactors: unknown): Promise<CustomBenchmarkPreview> {
    const factors = normalizeComparisonFactorGroups(rawFactors)
    const key = previewCacheKey(userId, factors)
    try {
        const cached = await redis.get<CustomBenchmarkPreview>(key)
        if (cached) return cached
    } catch (error) {
        console.warn("customBenchmark: Redis preview read failed", error)
    }

    const snapshot = await similarUsers.fetchProfilesSnapshot()
    const cohort = similarUsers.selectCustomSimilarUserIds(snapshot, userId, factors)
    const result: CustomBenchmarkPreview = {
        factors,
        available: !cohort.insufficientData && cohort.userIds.length >= MIN_COHORT,
        cohort: {
            size: cohort.userIds.length,
            populationSize: cohort.populationSize,
            minimumSize: MIN_COHORT,
            averageSimilarity: cohort.averageSimilarity
        }
    }
    try {
        await redis.set(key, result, {ex: PREVIEW_CACHE_TTL_SECONDS})
    } catch (error) {
        console.warn("customBenchmark: Redis preview write failed", error)
    }
    return result
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
            averages: { balances: null, incomes: null, expenses: null, assetAllocation: null },
            rankings: { balance: 0, incomes: 0, outflows: 0 }
        }
    }

    // Include the requester only in percentile pools. Averages remain based
    // exclusively on peers, otherwise a small cohort would be biased by the
    // very value the user is trying to compare.
    const rankPoolIds = [...cohort.userIds, userId]
    const referenceDate = ExtDate.fromNow()
    referenceDate.moveByMonths(-1)
    const currentMonth = ExtDate.fromReferenceMonthStart(ExtDate.fromNow())
    const [balancePool, incomePool, outflowPool, metricRows] = await Promise.all([
        db.balances.getRankingPool(rankPoolIds, true),
        db.transactions.getTransactionRankingPool(rankPoolIds, false, referenceDate),
        db.transactions.getTransactionRankingPool(rankPoolIds, true, referenceDate),
        db.benchmarks.getMetricRows(cohort.userIds, currentMonth)
    ])

    const result: CustomBenchmark = {
        available: true,
        ...base,
        averages: {
            balances: averagePool(balancePool, userId),
            incomes: averagePool(incomePool, userId),
            expenses: averagePool(outflowPool, userId),
            assetAllocation: averageAssetAllocation(metricRows)
        },
        rankings: {
            balance: rankFromBalancePool(balancePool, userId),
            incomes: rankFromTransactionPool(incomePool, userId, false),
            outflows: rankFromTransactionPool(outflowPool, userId, true)
        }
    }

    try {
        await redis.set(key, result, { ex: CACHE_TTL_SECONDS })
    } catch (error) {
        console.warn("customBenchmark: Redis write failed, serving uncached result", error)
    }
    return result
}

export default { getCustomBenchmark, previewCustomBenchmark }
