import express from "express"

import { ExtDate } from "../../libs/datelib"

import db from "../../db/db"
import { EXPENSE_BALANCE_ASSET_KEYS, EXPENSE_BALANCE_DETAIL_TYPES, ExpenseBalanceSource } from "../../db/models/expenses"
import common from "../common"

/**
 * Sanitizes the optional balance source attached to a transaction. Returns a
 * valid ExpenseBalanceSource or null (invalid/missing sources are dropped
 * silently: the source is an optional enrichment, never a reason to reject
 * the transaction itself).
 */
function sanitizeBalanceSource(raw: any): ExpenseBalanceSource | null {
    if (!raw || typeof raw !== "object") return null
    const asset_key = raw.asset_key
    if (!EXPENSE_BALANCE_ASSET_KEYS.includes(asset_key)) return null
    const detail_type = EXPENSE_BALANCE_DETAIL_TYPES.includes(raw.detail_type) ? raw.detail_type : null
    const detail_id_num = Number(raw.detail_id)
    const detail_id = (detail_type !== null && Number.isFinite(detail_id_num)) ? detail_id_num : null
    // A detail type without an id (or vice versa) is meaningless — keep only the parent key
    if (detail_type === null || detail_id === null) return {asset_key, detail_type: null, detail_id: null}
    return {asset_key, detail_type, detail_id}
}

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
    const now = ExtDate.fromNow()
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

expensesRouter.post("/add", async (req, res) => {
    // Sanitize user input. Send status code 400 (Bad Request)
    // in case of invalid data (not numbers)
    const expense = req.body?.expense;
    if (!expense || !isExpenseValid(expense))
    {
        res.status(400);
        res.send();
        return;
    }
    // Add the expense to the database
    const raw_user_category_id = expense.user_category_id
    const user_category_id = (raw_user_category_id !== null && raw_user_category_id !== undefined && Number.isFinite(Number(raw_user_category_id)))
        ? Number(raw_user_category_id) : null
    const doc = await db.expenses.insertNew(
        req.userId as string, expense.date, expense.amount, expense.is_expense,
        expense.notes, expense.payment_type, expense.category_tag, user_category_id,
        sanitizeBalanceSource(expense.balance_source)
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
    const months = 13
    const year = await db.expenses.getRecentMonthlyExpensesByUserId(req.userId as string, months)
    if (year === null) {
        res.status(500).send()
        return
    }
    res.status(200).json(year)
});

const MAX_MONTHS = 600 // 50 years, safety cap against abuse

expensesRouter.post("/monthly-totals", async (req, res) => {
    // Aggregated outflow/income totals per month (no per-transaction detail),
    // for the multi-year chart history. `months` (number, capped) or "all";
    // omitted -> full history, since this endpoint is only called on demand.
    let months: number | undefined
    if (req.body?.months !== "all") {
        const requested = Number(req.body?.months)
        if (Number.isFinite(requested) && requested > 0)
            months = Math.min(requested, MAX_MONTHS)
    }
    const totals = await db.expenses.getMonthlyTotalsByUserId(req.userId as string, months)
    if (totals === null)
    {
        res.status(500).send()
        return
    }
    res.status(200).json(totals)
})

expensesRouter.post("/month", async (req, res) => {
    // On-demand fetch of a single arbitrary month's tagged transactions (both
    // incomes and expenses), so the stats UI can view/compare history beyond
    // the 13-month window loaded by /get without fetching years of
    // transactions up front. Bounded to exactly one month per call.
    const year = Number(req.body?.year)
    const month = Number(req.body?.month) // 1-12
    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
        res.status(400).send()
        return
    }
    const reference_date = new ExtDate(ExtDate.UTC(year, month - 1, 1))
    if (reference_date > ExtDate.fromNow()) {
        res.status(400).send()
        return
    }
    const transactions = await db.expenses.getMonthlyExpensesByUserId(req.userId as string, reference_date)
    res.status(200).json(transactions)
})

expensesRouter.post("/delete", async (req, res) => {
    // Delete the requested expense. Prefer the row id (exact, can't accidentally
    // match a sibling transaction with the same date/amount/direction) — fall
    // back to the old value-match only for callers that don't have it yet
    // (e.g. import-undo, right after a batch insert).
    const expense = req.body.expense;
    const id = Number(expense?.id)
    const del_res = Number.isFinite(id)
        ? await db.expenses.deleteExpenseById(req.userId as string, id)
        : await db.expenses.deleteExpenseByData(req.userId as string, expense.date, expense.amount, expense.is_expense);
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
