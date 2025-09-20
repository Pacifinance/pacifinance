import express from "express"
import { SessionData } from "express-session";

import db from "../../db/mongo"
import common from "../common"

/**
 * Computes the rank of a user among other users
 * @param array Sorted array of objects (must have a 'user' field)
 * @param target_user Target user ID or ObjectID whose position must be found
 * @returns Object containing the position (top=1, bottom=array.length) and the total number of users
 */
function computeRankOfUser(array: any[], target_user: string) {
    let position = -1;
    for (let i = 0; i < array.length; i++) {
        if (array[i].user === target_user)
            position = array.length - i;
    }
    return {position: position, total: array.length};
}

/* === /rank/* === */

const rankRouter = express.Router()

rankRouter.use(common.checkSessionMiddleware)

rankRouter.post("/balances", async (req, res) => {
    // If the user is of test/demo type, assign some random values
    const session = req.session as SessionData
    const target_user = session.userId;
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
    // Get the list of all/similar users IDs
    const users = await db.users.getAllUsersIds(reference_user, true);
    // For each user get its latest balance up to the last day of the last month
    let now = new Date(Date.now());
    let limit_date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth()));
    let balances = [];
    for (let user of users) {
        const balance = await db.balances.getTotalLatestByUserId(user.userId, limit_date);
        if (balance !== null)
            balances.push({user: user.userId, balance: balance});
    }
    // Sort the array of balances to get the rank of the user
    balances.sort((a, b) => a.balance - b.balance);
    const rank = computeRankOfUser(balances, target_user);
    // Send the data to the client with status code 200 (OK)
    res.status(200);
    res.json(rank);
});

rankRouter.post("/expenses", async (req, res) => {
    // If the user is of test/demo type, assign some random values
    const session = req.session as SessionData
    const target_user = session.userId;
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
    // Get the list of all/similar users IDs
    const users = await db.users.getAllUsersIds(reference_user, true);
    // For each user get the expenses/incomes of the last month
    let reference_date = new Date(Date.now()); reference_date.setUTCMonth(reference_date.getUTCMonth()-1);
    let is_expense_filter = Boolean(req.body.expenses);
    let expenses = [];
    for (let user of users) {
        const total_amount = await db.expenses.getTotalMonthlyExpensesByUserId(user.userId, reference_date, is_expense_filter);
        if (total_amount !== null)
            expenses.push({user: user.userId, amount: total_amount});
    }
    // Sort the array of expenses to get the rank of the user
    expenses.sort((a, b) => a.amount - b.amount);
    const rank = computeRankOfUser(expenses, target_user);
    // Send the data to the client with status code 200 (OK)
    res.status(200);
    res.json(rank);
});

export default rankRouter