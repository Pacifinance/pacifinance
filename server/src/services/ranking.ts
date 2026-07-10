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
    return {position: Math.floor(position / array.length * 100)};
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
    return is_expense_filter ? 100 - rank : rank
}

export default { computeRankOfUser, rankFromBalancePool, rankFromExpensePool }
