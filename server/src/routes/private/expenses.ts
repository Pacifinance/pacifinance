import express from "express"
import { SessionData } from "express-session"

import { ExtDate } from "../../libs/datelib"

import db from "../../db/mongo"
import common from "../common"

/**
 * Checks if an expense is valid
 * @param data Expense to check (sanitized and modified by this function)
 * @returns true if the expense is valid, false otherwise
 */
function isExpenseValid(data: any) {
    const NOTES_MAX_LENGTH = 64;
    const PAYMENT_NONE = 0; // database index of the 'none' payment type (hardcoded = bad, but it will never change...probably...)
    // Cast the amount to Number and the is_expense flag to Boolean for type integrity
    data.amount = common.roundCurrency(Number(data.amount));
    data.is_expense = Boolean(data.is_expense);
    // If the date field is not set or invalid, set it to now
    let now = ExtDate.fromNow()
    data.date = new ExtDate(data.date);
    if (data.date === undefined || isNaN(data.date.getTime()) || data.date > now) data.date = now;
    // If it's an income, the payment type is forced to 'none'
    if (!data.is_expense) data.payment_type = PAYMENT_NONE;
    // If there are no notes associated to the expense, set the notes to an empty string. Also, cast it to String for type integrity
    if (!data.notes) data.notes = "";
    data.notes = String(data.notes).substring(0, NOTES_MAX_LENGTH);
    /**
     * Return true if:
     * 1. it's an expense and all fields are valid
     * 2. it's an income and all fields but payment_type are valid
     */
    const is_expense = data.is_expense;
    const amount_valid = !isNaN(data.amount);
    const category_valid = (data.category_tag !== undefined);
    const payment_type_valid = (data.payment_type !== undefined && data.payment_type !== PAYMENT_NONE); // for expenses only
    return (
        (!is_expense && amount_valid && category_valid) ||          // condition for incomes
        (amount_valid && category_valid && payment_type_valid)      // condition for expenses
    );
}

/* === /expenses/* === */

const expensesRouter = express.Router()

expensesRouter.use(common.checkSessionMiddleware)

expensesRouter.post("/add", async (req, res) => {
    // Sanitize user input. Send status code 400 (Bad Request)
    // in case of invalid data (not numbers)
    let expense = req.body.expense;
    if (!isExpenseValid(expense))
    {
        res.status(400);
        res.send();
        return;
    }
    // Add the expense to the database
    const session = req.session as SessionData
    const doc = await db.expenses.insertNew(
        session.userId, expense.date, expense.amount, expense.is_expense,
        expense.notes, expense.payment_type, expense.category_tag
    );
    // Check if the document was inserted successfully. Send
    // status code 500 (Internal Server Error) if it failed
    if (doc === null)
    {
        res.status(500);
        res.send();
        return;
    }
    // Send status code 200 (OK)
    res.status(200);
    res.send();
});

expensesRouter.post("/get", async (req, res) => {
    // Retrieve the expenses for a full year
    let year = [];
    let reference_date = ExtDate.fromNow()
    const session = req.session as SessionData
    for (let i = 0; i <= 12; i++) {
        // Get the expenses from the database for the desired month and add them to the year array
        const expenses = await db.expenses.getMonthlyExpensesByUserId(session.userId, reference_date);
        year.push(expenses);
        // Go to the next month
        reference_date.moveByMonths(-1)
    }
    // Send the data to the client with status code 200 (OK)
    res.status(200);
    res.json(year);
});

expensesRouter.post("/delete", async (req, res) => {
    // Delete the requested expense
    const expense = req.body.expense;
    const session = req.session as SessionData
    const del_res = await db.expenses.deleteExpenseByData(session.userId, expense.date, expense.amount, expense.is_expense);
    // Check if the document was deleted successfully. Send
    // status code 500 (Internal Server Error) if it failed
    if (del_res === null || del_res.deletedCount !== 1)
    {
        res.status(500);
        res.send();
        return;
    }
    // Send status code 200 (OK)
    res.status(200);
    res.send();
});

export default expensesRouter