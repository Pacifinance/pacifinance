import express from "express"

import { ExtDate } from "../../libs/datelib"

import db from "../../db/db"

/**
 * Computes the rank of a user among other users
 * @param array Sorted array of objects (must have a 'user' field)
 * @param target_user Target user uuid whose position must be found
 * @returns Object containing the position (top=1, bottom=array.length) and the total number of users
 */
function computeRankOfUser(array: any[], target_user: string) {
    let position = -1;
    for (let i = 0; i < array.length; i++) {
        if (array[i].user === target_user)
            position = array.length - i;
    }
    return {position: Math.floor(position / array.length * 100)};
}

/* === /rank/* === */

const rankRouter = express.Router()

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
    let reference_user = undefined;
    if (req.body && req.body.similar)
        reference_user = target_user;
    // Get the latest-balance pool in a single aggregate query (RPC) instead
    // of one query per user
    const pool = await db.balances.getRankingPool(reference_user, true);
    const balances = pool.map((p) => ({user: p.userId, balance: p.total}));
    // Sort the array of balances to get the rank of the user
    balances.sort((a, b) => a.balance - b.balance);
    const rank = computeRankOfUser(balances, target_user);
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
    // Check if the ranking is requested among all users or only similar users
    let reference_user = undefined;
    if (req.body && req.body.similar)
        reference_user = target_user;
    // Get the expenses/incomes-of-last-month pool in a single aggregate query
    // (RPC) instead of one query per user
    const reference_date = ExtDate.fromNow(); reference_date.moveByMonths(-1)
    const is_expense_filter = Boolean(req.body.expenses);
    const pool = await db.expenses.getExpenseRankingPool(reference_user, is_expense_filter, reference_date);
    const expenses = pool.map((p) => ({user: p.userId, amount: p.total}));
    // Sort the array of expenses to get the rank of the user
    expenses.sort((a, b) => a.amount - b.amount);
    const rank = computeRankOfUser(expenses, target_user);
    if (is_expense_filter)
        rank.position = 100 - rank.position // for expenses: low values are rewarded
    // Send the data to the client with status code 200 (OK)
    res.status(200);
    res.json(rank);
});

export default rankRouter
