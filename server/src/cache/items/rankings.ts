import { ExtDate } from "../../libs/datelib"
import { logger } from "../../libs/logger"

import users from "../../db/models/users"
import balances from "../../db/models/balances"
import transactions from "../../db/models/transactions"
import similarUsers from "../../services/similarUsers"
import { rankFromBalancePool, rankFromTransactionPool } from "../../services/ranking"

/**
 * Rank percentiles for a single user, both among all users and among their
 * "similar users" cohort (see server/src/services/similarUsers.ts) - this is
 * the exact shape POST /rank/get used to compute live, per request.
 */
export type UserRankings = {
    balance: number,
    incomes: number,
    outflows: number,
    balanceSimilar: number,
    incomesSimilar: number,
    outflowsSimilar: number
}

/**
 * How the rankings of all users are stored in the cache. Unlike
 * AveragesCachedData, there is no shared "all" bucket: a rank position is
 * always relative to one specific user, even the "among all users" variant.
 */
export type RankingsCachedData = {
    [user: string]: UserRankings // mongodb ObjectId converted to string
}

/**
 * Computes rank percentiles for every user, both against the full population
 * and against each user's own "similar users" cohort. Population-wide pools
 * are the same for every user in a given run, so they're fetched once instead
 * of once per user (as the old live POST /rank/get did every session).
 * @returns Object to store in the database and cache
 */
async function fetchUserRankings(): Promise<RankingsCachedData> {
    const t0 = Date.now()
    logger.info("Started computation of user rankings")

    const reference_date = ExtDate.fromNow(); reference_date.moveByMonths(-1)

    // Demo and test accounts must never affect real users' percentile ranks.
    const allUsersList = await users.getAllBenchmarkUserIds()
    const allUserIds = allUsersList.map((user) => user.id)
    logger.info(`[rankings] fetched ${allUsersList.length} users (+${Date.now() - t0}ms)`)

    const snapshot = await similarUsers.fetchMonthlyProfilesSnapshot(ExtDate.fromNow())
    logger.info(`[rankings] profiles snapshot fetched (+${Date.now() - t0}ms)`)

    const [balancePool, incomePool, expensePool] = await Promise.all([
        balances.getRankingPool(allUserIds, true),
        transactions.getTransactionRankingPool(allUserIds, false, reference_date),
        transactions.getTransactionRankingPool(allUserIds, true, reference_date),
    ])
    logger.info(`[rankings] population-wide pools fetched (+${Date.now() - t0}ms)`)

    const rankingsCachedData: RankingsCachedData = {}

    // All three pools above already contain every eligible user. Cohort
    // filtering is set membership in memory, rather than three extra SQL RPCs
    // for every user. This keeps the monthly job at three database queries.
    const filterPool = <T extends { userId: string }>(pool: T[], userIds: string[], userId: string) => {
        const allowed = new Set([...userIds, userId])
        return pool.filter((entry) => allowed.has(entry.userId))
    }

    for (const user of allUsersList) {
        const userRef = user.id

        const balanceCohort = similarUsers.selectSimilarUserIds(snapshot, userRef, "balance")
        const incomeCohort = similarUsers.selectSimilarUserIds(snapshot, userRef, "incomes")
        const expenseCohort = similarUsers.selectSimilarUserIds(snapshot, userRef, "outflows")

        const balanceSimilarPool = filterPool(balancePool, balanceCohort.userIds, userRef)
        const incomeSimilarPool = filterPool(incomePool, incomeCohort.userIds, userRef)
        const expenseSimilarPool = filterPool(expensePool, expenseCohort.userIds, userRef)

        rankingsCachedData[userRef] = {
            balance: rankFromBalancePool(balancePool, userRef),
            incomes: rankFromTransactionPool(incomePool, userRef, false),
            outflows: rankFromTransactionPool(expensePool, userRef, true),
            balanceSimilar: rankFromBalancePool(balanceSimilarPool, userRef),
            incomesSimilar: rankFromTransactionPool(incomeSimilarPool, userRef, false),
            outflowsSimilar: rankFromTransactionPool(expenseSimilarPool, userRef, true),
        }
    }

    logger.info(`[rankings] per-user rankings computed (+${Date.now() - t0}ms)`)
    logger.info("Finished computation of user rankings")

    return rankingsCachedData
}

export default { fetchUserRankings }
