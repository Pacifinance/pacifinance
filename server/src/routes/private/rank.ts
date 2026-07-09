import express from "express"

import { ExtDate } from "../../libs/datelib"

import db from "../../db/db"
import similarUsers from "../../services/similarUsers"

/**
 * Computes the rank of a user among other users
 * @param array Sorted array of objects (must have a 'user' field)
 * @param target_user Target user uuid whose position must be found
 * @returns Object containing the position (top=1, bottom=array.length) and the total number of users
 */
function computeRankOfUser(array: any[], target_user: string) {
    if (array.length === 0) return {position: 0}
    let position = -1;
    for (let i = 0; i < array.length; i++) {
        if (array[i].user === target_user)
            position = array.length - i;
    }
    if (position === -1) return {position: 0}
    return {position: Math.floor(position / array.length * 100)};
}

/* === /rank/* === */

const rankRouter = express.Router()

function rankFromBalancePool(pool: Array<{userId: string, total: number}>, target_user: string) {
    const balances = pool.map((p) => ({user: p.userId, balance: p.total}));
    balances.sort((a, b) => a.balance - b.balance);
    return computeRankOfUser(balances, target_user).position
}

function rankFromExpensePool(pool: Array<{userId: string, total: number}>, target_user: string, is_expense_filter: boolean) {
    if (pool.length === 0) return 0
    const expenses = pool.map((p) => ({user: p.userId, amount: p.total}));
    expenses.sort((a, b) => a.amount - b.amount);
    const rank = computeRankOfUser(expenses, target_user).position
    return is_expense_filter ? 100 - rank : rank
}

rankRouter.post("/get", async (req, res) => {
    const target_user = req.userId as string;
    const user_type = await db.users.getTypeOfUserId(target_user);
    if (user_type === null || user_type.type >= db.users.UserType.test.value)
    {
        res.status(200).json({
            balance: 50,
            incomes: 75,
            outflows: 25,
            balanceSimilar: 50,
            incomesSimilar: 75,
            outflowsSimilar: 25,
        });
        return;
    }

    const reference_date = ExtDate.fromNow(); reference_date.moveByMonths(-1)
    const [balanceCohort, incomeCohort, expenseCohort] = await Promise.all([
        similarUsers.getSimilarUserIds(target_user, "balance"),
        similarUsers.getSimilarUserIds(target_user, "incomes"),
        similarUsers.getSimilarUserIds(target_user, "outflows"),
    ])
    const [
        balancePool,
        balanceSimilarPool,
        incomePool,
        incomeSimilarPool,
        expensePool,
        expenseSimilarPool,
    ] = await Promise.all([
        db.balances.getRankingPool(undefined, true),
        db.balances.getRankingPool(balanceCohort.userIds, true),
        db.expenses.getExpenseRankingPool(undefined, false, reference_date),
        db.expenses.getExpenseRankingPool(incomeCohort.userIds, false, reference_date),
        db.expenses.getExpenseRankingPool(undefined, true, reference_date),
        db.expenses.getExpenseRankingPool(expenseCohort.userIds, true, reference_date),
    ])

    res.status(200).json({
        balance: rankFromBalancePool(balancePool, target_user),
        incomes: rankFromExpensePool(incomePool, target_user, false),
        outflows: rankFromExpensePool(expensePool, target_user, true),
        balanceSimilar: rankFromBalancePool(balanceSimilarPool, target_user),
        incomesSimilar: rankFromExpensePool(incomeSimilarPool, target_user, false),
        outflowsSimilar: rankFromExpensePool(expenseSimilarPool, target_user, true),
    })
})

rankRouter.post("/balances", async (req, res) => {
    // If the user is of test/demo type, assign some random values
    const target_user = req.userId as string;
    const user_type = await db.users.getTypeOfUserId(target_user);
    if (user_type === null || user_type.type >= db.users.UserType.test.value)
    {
        const fake_balances = [
            {user: "0"}, {user: "1"}, {user: target_user}, {user: "2"}
        ];
        const fake_rank = computeRankOfUser(fake_balances, target_user);
        res.status(200);
        res.json(fake_rank);
        return;
    }
    // Check if the ranking is requested among all users or only similar users
    let user_ids = undefined;
    if (req.body && req.body.similar)
        user_ids = (await similarUsers.getSimilarUserIds(target_user, "balance")).userIds;
    // Get the latest-balance pool in a single aggregate query (RPC) instead
    // of one query per user
    const pool = await db.balances.getRankingPool(user_ids, true);
    const rank = {position: rankFromBalancePool(pool, target_user)};
    // Send the data to the client with status code 200 (OK)
    res.status(200);
    res.json(rank);
});

rankRouter.post("/expenses", async (req, res) => {
    // If the user is of test/demo type, assign some random values
    const target_user = req.userId as string;
    const user_type = await db.users.getTypeOfUserId(target_user);
    if (user_type === null || user_type.type >= db.users.UserType.test.value)
    {
        const fake_expenses = [
            {user: "0"}, {user: target_user}, {user: "1"}, {user: "2"}
        ];
        const fake_rank = computeRankOfUser(fake_expenses, target_user);
        res.status(200);
        res.json(fake_rank);
        return;
    }
    // Get the expenses/incomes-of-last-month pool in a single aggregate query
    // (RPC) instead of one query per user
    const reference_date = ExtDate.fromNow(); reference_date.moveByMonths(-1)
    const is_expense_filter = Boolean(req.body.expenses);
    // Check if the ranking is requested among all users or only similar users
    let user_ids = undefined;
    if (req.body && req.body.similar)
        user_ids = (await similarUsers.getSimilarUserIds(target_user, is_expense_filter ? "outflows" : "incomes")).userIds;
    const pool = await db.expenses.getExpenseRankingPool(user_ids, is_expense_filter, reference_date);
    const rank = {position: rankFromExpensePool(pool, target_user, is_expense_filter)};
    // Send the data to the client with status code 200 (OK)
    res.status(200);
    res.json(rank);
});

export default rankRouter
