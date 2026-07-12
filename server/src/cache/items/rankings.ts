import { ExtDate } from "../../libs/datelib"
import { mapWithConcurrency } from "../../libs/concurrency"

import users from "../../db/models/users"
import balances from "../../db/models/balances"
import expenses from "../../db/models/expenses"
import similarUsers from "../../services/similarUsers"
import { rankFromBalancePool, rankFromExpensePool } from "../../services/ranking"

// See server/src/cache/items/averages.ts for why this exists: running every
// user's cohort queries fully sequentially made this scale linearly with the
// user count until it exceeded Vercel's function timeout.
const USER_CONCURRENCY = 6

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
    console.log("Started computation of user rankings")

    const reference_date = ExtDate.fromNow(); reference_date.moveByMonths(-1)

    const allUsersList = await users.getAllUsersIds() // test users included
    const snapshot = await similarUsers.fetchProfilesSnapshot()

    const [balancePool, incomePool, expensePool] = await Promise.all([
        balances.getRankingPool(undefined, true),
        expenses.getExpenseRankingPool(undefined, false, reference_date),
        expenses.getExpenseRankingPool(undefined, true, reference_date),
    ])

    const rankingsCachedData: RankingsCachedData = {}

    await mapWithConcurrency(allUsersList, USER_CONCURRENCY, async (user) => {
        const userRef = user.id

        const balanceCohort = similarUsers.selectSimilarUserIds(snapshot, userRef, "balance")
        const incomeCohort = similarUsers.selectSimilarUserIds(snapshot, userRef, "incomes")
        const expenseCohort = similarUsers.selectSimilarUserIds(snapshot, userRef, "outflows")

        const [balanceSimilarPool, incomeSimilarPool, expenseSimilarPool] = await Promise.all([
            balances.getRankingPool(balanceCohort.userIds, true),
            expenses.getExpenseRankingPool(incomeCohort.userIds, false, reference_date),
            expenses.getExpenseRankingPool(expenseCohort.userIds, true, reference_date),
        ])

        rankingsCachedData[userRef] = {
            balance: rankFromBalancePool(balancePool, userRef),
            incomes: rankFromExpensePool(incomePool, userRef, false),
            outflows: rankFromExpensePool(expensePool, userRef, true),
            balanceSimilar: rankFromBalancePool(balanceSimilarPool, userRef),
            incomesSimilar: rankFromExpensePool(incomeSimilarPool, userRef, false),
            outflowsSimilar: rankFromExpensePool(expenseSimilarPool, userRef, true),
        }
    })

    console.log("Finished computation of user rankings")

    return rankingsCachedData
}

export default { fetchUserRankings }
