/**
 * Pure rank-position math shared between the cached POST /rank/get route
 * (server/src/routes/private/rank.ts) and the monthly cron that populates the
 * "userRankings" cache entry (server/src/cache/items/rankings.ts). Kept
 * dependency-free (no cache/DB imports) so both can import it without a
 * circular dependency through cache.ts.
 */

/**
 * Computes the rank of a user among other users
 * @param array Sorted array of objects (must have a 'user' field)
 * @param target_user Target user uuid whose position must be found
 * @returns Object containing the position (top=1, bottom=array.length) and the total number of users
 */
export function computeRankOfUser(array: any[], target_user: string) {
    if (array.length === 0) return {position: 0}
    let position = -1;
    for (let i = 0; i < array.length; i++) {
        if (array[i].user === target_user)
            position = array.length - i;
    }
    if (position === -1) return {position: 0}
    // Map the best and worst observed values to the stable [1,100] endpoints.
    // Reserve 0 for "not ranked" throughout the API/UI contract.
    if (array.length === 1) return {position: 1}
    return {position: Math.ceil((position - 1) / (array.length - 1) * 99) + 1};
}

export function rankFromBalancePool(pool: Array<{userId: string, total: number}>, target_user: string) {
    const balances = pool.map((p) => ({user: p.userId, balance: p.total}));
    balances.sort((a, b) => a.balance - b.balance);
    return computeRankOfUser(balances, target_user).position
}

export function rankFromExpensePool(pool: Array<{userId: string, total: number}>, target_user: string, is_expense_filter: boolean) {
    if (pool.length === 0) return 0
    const expenses = pool.map((p) => ({user: p.userId, amount: p.total}));
    expenses.sort((a, b) => a.amount - b.amount);
    const rank = computeRankOfUser(expenses, target_user).position
    if (rank === 0) return 0
    // Lower outflows are better. Keep the percentile in [1,100], as 0 means
    // "no data" to API consumers.
    return is_expense_filter ? 101 - rank : rank
}

export default { computeRankOfUser, rankFromBalancePool, rankFromExpensePool }
