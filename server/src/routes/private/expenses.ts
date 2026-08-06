import express from "express"

import { ExtDate } from "../../libs/datelib"

import db from "../../db/db"
import { EXPENSE_BALANCE_ASSET_KEYS, EXPENSE_BALANCE_DETAIL_TYPES, ExpenseBalanceSource } from "../../db/models/expenses"
import type { ImportedReimbursementLink, ImportedSharedExpenseLink } from "../../db/models/sharedExpenses"
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
    const rawAmount = Number(data.amount)
    const amount_valid = Number.isFinite(rawAmount) && rawAmount > 0
    data.amount = common.roundCurrency(rawAmount);
    data.is_expense = Boolean(data.is_expense);
    if (data.shared_expense !== undefined) {
        const ownShare = Number(data.shared_expense?.own_share)
        const cashAmount = Number(data.cash_amount)
        if (!data.is_expense || !Number.isFinite(ownShare) || ownShare < 0
            || !Number.isFinite(cashAmount) || cashAmount <= ownShare) return false
        data.amount = common.roundCurrency(ownShare)
        data.cash_amount = common.roundCurrency(cashAmount)
    }
    if (data.reimbursement_receivable_id !== undefined && data.reimbursement_receivable_id !== null) {
        if (data.is_expense || !Number.isFinite(Number(data.reimbursement_receivable_id))) return false
        data.exclude_from_statistics = true
    }
    if (data.reimbursement_shared_expense_ref !== undefined) {
        if (data.is_expense || typeof data.reimbursement_shared_expense_ref !== "string"
            || data.reimbursement_shared_expense_ref.length > 40) return false
        data.exclude_from_statistics = true
    }
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
    res.status(200).json(doc);
});

expensesRouter.post("/update", async (req, res) => {
    const expense = req.body?.expense
    const id = Number(expense?.id)
    if (!Number.isFinite(id) || !expense) return res.status(400).send()

    const sharedEnabled = expense.shared_expense?.enabled === true
    const sharedRemove = expense.shared_expense?.enabled === false
    const validationExpense = {...expense}
    if (sharedEnabled) validationExpense.cash_amount = expense.shared_expense.total_amount
    else delete validationExpense.shared_expense
    if (!isExpenseValid(validationExpense)) return res.status(400).send()

    const sharedTotal = sharedEnabled ? common.roundCurrency(Number(expense.shared_expense.total_amount)) : null
    const sharedOwnShare = sharedEnabled ? common.roundCurrency(Number(expense.shared_expense.own_share)) : null
    if (sharedEnabled && (!Number.isFinite(sharedTotal) || !Number.isFinite(sharedOwnShare)
        || sharedTotal <= 0 || sharedOwnShare < 0 || sharedOwnShare >= sharedTotal)) {
        return res.status(400).send()
    }

    const rawUserCategoryId = expense.user_category_id
    const userCategoryId = rawUserCategoryId !== null && rawUserCategoryId !== undefined
        && Number.isFinite(Number(rawUserCategoryId)) ? Number(rawUserCategoryId) : null
    const updated = await db.expenses.updateExisting(req.userId as string, {
        id,
        date: validationExpense.date,
        amount: validationExpense.amount,
        isExpense: validationExpense.is_expense,
        notes: validationExpense.notes,
        paymentType: validationExpense.payment_type,
        categoryTag: validationExpense.category_tag,
        userCategoryId,
        balanceSource: sanitizeBalanceSource(expense.balance_source),
        sharedMode: sharedEnabled ? "set" : sharedRemove ? "remove" : "unchanged",
        sharedTotal,
        sharedOwnShare,
    })
    if (!updated) return res.status(409).send()
    res.status(200).json(updated)
})

const MAX_EXPENSE_IMPORT_BATCH = 500

expensesRouter.post("/batch-add", async (req, res) => {
    const expenses = req.body?.expenses
    if (!Array.isArray(expenses) || expenses.length === 0 || expenses.length > MAX_EXPENSE_IMPORT_BATCH) {
        res.status(400).send()
        return
    }

    const inputs = []
    for (const expense of expenses) {
        if (!expense || typeof expense !== "object" || !isExpenseValid(expense)) {
            res.status(400).send()
            return
        }
        const rawUserCategoryId = expense.user_category_id
        const userCategoryId = rawUserCategoryId !== null && rawUserCategoryId !== undefined
            && Number.isFinite(Number(rawUserCategoryId)) ? Number(rawUserCategoryId) : null
        inputs.push({
            date: expense.date as Date,
            amount: expense.amount as number,
            isExpense: expense.is_expense as boolean,
            notes: expense.notes as string,
            paymentType: expense.payment_type as number,
            categoryTag: expense.category_tag as number,
            userCategoryId,
            balanceSource: sanitizeBalanceSource(expense.balance_source),
            cashAmount: expense.cash_amount === null || expense.cash_amount === undefined
                ? null : common.roundCurrency(Number(expense.cash_amount)),
            excludeFromStatistics: expense.exclude_from_statistics === true,
        })
        const last = inputs[inputs.length - 1]
        if (last.cashAmount !== null && (!Number.isFinite(last.cashAmount) || last.cashAmount <= 0)) {
            res.status(400).send()
            return
        }
    }

    const inserted = await db.expenses.insertBatch(req.userId as string, inputs)
    if (inserted === null) {
        res.status(500).send()
        return
    }
    const sharedLinks: ImportedSharedExpenseLink[] = []
    const reimbursementLinks: ImportedReimbursementLink[] = []
    const pendingReimbursementLinks: Array<{expenseId: number; sharedRef: string; amount: number}> = []
    const sharedRefs: string[] = []
    for (let index = 0; index < inserted.length; index++) {
        const requestExpense = expenses[index]
        const insertedExpense = inserted[index]
        const ownShare = Number(requestExpense.shared_expense?.own_share)
        if (requestExpense.shared_expense && requestExpense.is_expense
            && Number.isFinite(ownShare) && ownShare >= 0 && ownShare < Number(requestExpense.cash_amount)) {
            sharedLinks.push({
                expenseId: insertedExpense.id,
                occurredAt: requestExpense.date,
                notes: requestExpense.notes,
                totalAmount: Number(requestExpense.cash_amount),
                ownShare,
            })
            sharedRefs.push(String(requestExpense.shared_expense.client_ref ?? ""))
        }
        const receivableId = Number(requestExpense.reimbursement_receivable_id)
        if (!requestExpense.is_expense && Number.isFinite(receivableId)) {
            reimbursementLinks.push({
                expenseId: insertedExpense.id,
                receivableId,
                amount: requestExpense.amount,
            })
        } else if (!requestExpense.is_expense && requestExpense.reimbursement_shared_expense_ref) {
            pendingReimbursementLinks.push({
                expenseId: insertedExpense.id,
                sharedRef: requestExpense.reimbursement_shared_expense_ref,
                amount: requestExpense.amount,
            })
        }
    }

    const receivables = await db.sharedExpenses.insertImportedReceivables(req.userId as string, sharedLinks)
    if (receivables !== null) {
        const receivableByRef = new Map(sharedRefs.map((ref, index) => [ref, receivables[index]?.id]))
        for (const link of pendingReimbursementLinks) {
            const receivableId = receivableByRef.get(link.sharedRef)
            if (receivableId !== undefined) reimbursementLinks.push({...link, receivableId})
        }
    }
    const reimbursements = await db.sharedExpenses.insertImportedReimbursements(req.userId as string, reimbursementLinks)
    // Never return a retryable 5xx after the transaction rows were committed:
    // financeService retries transient 500s and that would duplicate the whole
    // import. Surface link failures in the successful response instead.
    const linkFailures = (receivables === null ? sharedLinks.length : 0)
        + (reimbursements === null ? reimbursementLinks.length : 0)
        + (receivables === null ? pendingReimbursementLinks.length : Math.max(0, pendingReimbursementLinks.length
            - reimbursementLinks.filter((link) => pendingReimbursementLinks.some((pending) => pending.expenseId === link.expenseId)).length))
    res.status(200).json({
        inserted: inserted.length,
        transaction_ids: inserted.map((item) => item.id),
        link_failures: linkFailures,
    })
})

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
