import supabase from "../supabase"

import { ExtDate } from "../../libs/datelib"

import tags from "./tags"
import { encryptField, decryptField } from "../crypto"

const EXPENSE_SELECT = `
    occurred_at, amount, is_expense, notes,
    payment_type:tags!expenses_payment_type_tag_id_fkey(label, client_index, type),
    category_tag:tags!expenses_category_tag_id_fkey(label, client_index, type),
    user_category:user_categories(id, label)
`

function mapTagJoin(row: any) {
    if (!row) return null
    return {label: row.label, index: row.client_index, type: row.type}
}

function toExpense(row: any) {
    return {
        date: row.occurred_at,
        amount: row.amount as number,
        isExpense: row.is_expense as boolean,
        notes: decryptField(row.notes),
        paymentType: mapTagJoin(row.payment_type),
        categoryTag: mapTagJoin(row.category_tag),
        userCategory: row.user_category ? {id: row.user_category.id as number, label: row.user_category.label as string} : null
    }
}

/* ==================== Specific queries ==================== */

/**
 * Adds an expense associated to a user
 * @param user_id uuid of the user
 * @param date Date of the expense
 * @param amount Amount of the expense
 * @param is_expense True if this is entry is an expense, false if it's an income
 * @param notes User notes or description associated to the expense (encrypted at rest, see db/crypto.ts)
 * @param payment_type Type of payment (None, Single, Subscription or Installment)
 * @param category_tag Category tag of the expense
 * @param user_category_id Optional custom sub-category (child of category_tag), display-only
 * @returns Expense document, or null in case of error
 */
async function insertNew(user_id: string, date: Date, amount: number, is_expense: boolean,
    notes: string, payment_type: number, category_tag: number, user_category_id: number | null = null) {
    let payment_type_ref = null
    let category_tag_ref = null
    if (is_expense) {
        // For an expense the payment type cannot be zero
        if (payment_type === 0) return null
        payment_type_ref = await tags.getReferenceByIndexAndType(payment_type, tags.TagType.payment.value)
        category_tag_ref = await tags.getReferenceByIndexAndType(category_tag, tags.TagType.expense.value)
    } else {
        payment_type_ref = await tags.getReferenceByIndexAndType(0, tags.TagType.payment.value)
        category_tag_ref = await tags.getReferenceByIndexAndType(category_tag, tags.TagType.income.value)
    }
    if (payment_type_ref === null || category_tag_ref === null)
        return null

    const {data, error} = await supabase.from("expenses").insert({
        user_id,
        occurred_at: date,
        amount,
        is_expense,
        notes: encryptField(notes),
        payment_type_tag_id: payment_type_ref.id,
        category_tag_id: category_tag_ref.id,
        user_category_id
    }).select(EXPENSE_SELECT).single()
    if (error) console.error("expenses.insertNew: failed to insert expense", error)
    if (error || !data) return null
    return toExpense(data)
}

/**
 * Gets all the expenses of a user
 * @param user_id uuid of the user
 * @returns List of Expense documents
 */
async function getAllByUserId(user_id: string) {
    const {data, error} = await supabase.from("expenses")
        .select(EXPENSE_SELECT)
        .eq("user_id", user_id)
        .order("occurred_at", {ascending: true})
    if (error) console.error("expenses.getAllByUserId: failed to read expenses", error)
    if (error || !data) return null
    return data.map(toExpense)
}

/**
 * Gets the expenses of a user for the month
 * @param user_id uuid of the user
 * @param reference_date Date object containing the year and month to look for
 * @param is_expense_filter True to retrieve only expenses, false to retrieve only incomes, undefined for both
 * @returns List of Expense documents
 */
async function getMonthlyExpensesByUserId(user_id: string, reference_date: ExtDate,
    is_expense_filter: boolean | undefined = undefined) {
    const month_start = ExtDate.fromReferenceMonthStart(reference_date)
    const month_end = ExtDate.fromReferenceMonthEnd(reference_date)

    let query = supabase.from("expenses")
        .select(EXPENSE_SELECT)
        .eq("user_id", user_id)
        .gte("occurred_at", month_start.toISOString())
        .lte("occurred_at", month_end.toISOString())
    if (is_expense_filter !== undefined)
        query = query.eq("is_expense", is_expense_filter)

    const {data, error} = await query.order("occurred_at", {ascending: false})
    if (error) console.error("expenses.getMonthlyExpensesByUserId: failed to read monthly expenses", error)
    if (error || !data) return []
    return data.map(toExpense)
}

/**
 * Gets the last N months of expenses/incomes in a single Supabase request and
 * returns the same newest-first monthly bucket shape used by /expenses/get.
 * @param user_id uuid of the user
 * @param months Number of months to include, current month included
 * @returns List of monthly Expense arrays, newest month first
 */
async function getRecentMonthlyExpensesByUserId(user_id: string, months: number) {
    const reference_months = []
    const now = ExtDate.fromNow()
    for (let i = 0; i < months; i++) {
        const ref = now.copy()
        ref.moveByMonths(-i)
        reference_months.push(ref)
    }

    const oldest = reference_months[reference_months.length - 1]
    const range_start = ExtDate.fromReferenceMonthStart(oldest)
    const range_end = ExtDate.fromReferenceMonthEnd(reference_months[0])

    const {data, error} = await supabase.from("expenses")
        .select(EXPENSE_SELECT)
        .eq("user_id", user_id)
        .gte("occurred_at", range_start.toISOString())
        .lte("occurred_at", range_end.toISOString())
        .order("occurred_at", {ascending: false})

    if (error) console.error("expenses.getRecentMonthlyExpensesByUserId: failed to read recent expenses", error)
    if (error || !data) return reference_months.map(() => [])

    const buckets = new Map<string, ReturnType<typeof toExpense>[]>()
    for (const row of data) {
        const occurred_at = new Date(row.occurred_at)
        const key = `${occurred_at.getUTCFullYear()}-${occurred_at.getUTCMonth()}`
        const bucket = buckets.get(key) ?? []
        bucket.push(toExpense(row))
        buckets.set(key, bucket)
    }

    return reference_months.map((ref) => buckets.get(`${ref.getUTCFullYear()}-${ref.getUTCMonth()}`) ?? [])
}

/**
 * Gets the expenses of a user for the month and sums all the amounts
 * @param user_id uuid of the user
 * @param reference_date Date object containing the year and month to look for
 * @param is_expense_filter True to retrieve only expenses, false to retrieve only incomes, undefined for both
 * @returns Total expenses/incomes of the user for the month
 */
async function getTotalMonthlyExpensesByUserId(user_id: string, reference_date: ExtDate,
    is_expense_filter: boolean | undefined = undefined) {
    const expenses = await getMonthlyExpensesByUserId(user_id, reference_date, is_expense_filter)
    if (expenses.length === 0)
        return null
    return expenses.reduce((accumulator, expense) => accumulator + expense.amount, 0)
}

/**
 * Gets outflow/income totals per month, aggregated server-side (SQL SUM/GROUP
 * BY via the get_monthly_totals RPC) — no per-transaction detail is
 * transferred, used for multi-year chart history without the egress cost of
 * fetching years of individual transactions.
 * @param user_id uuid of the user
 * @param months Number of months back to include, or undefined for the full history
 * @returns List of {monthStart, totalOutflows, totalIncomes}, newest first
 */
async function getMonthlyTotalsByUserId(user_id: string, months?: number) {
    const {data, error} = await supabase.rpc("get_monthly_totals", {
        p_user_id: user_id,
        p_months: months ?? null
    })
    if (error) console.error("expenses.getMonthlyTotalsByUserId: get_monthly_totals RPC failed", error)
    if (error || !data) return null
    return (data as any[]).map((row) => ({
        monthStart: row.month_start as string,
        totalOutflows: Number(row.total_outflows),
        totalIncomes: Number(row.total_incomes)
    }))
}

/**
 * Deletes an expense/income of a user, given the entry date, amount and direction
 * @param user_id uuid of the user
 * @param date Date of the expense
 * @param amount Amount of the expense
 * @param is_expense True if this is entry is an expense, false if it's an income
 * @returns {deletedCount} object
 */
async function deleteExpenseByData(user_id: string, date: Date, amount: number, is_expense: boolean) {
    const {error, count} = await supabase.from("expenses")
        .delete({count: "exact"})
        .eq("user_id", user_id)
        .eq("occurred_at", new Date(date).toISOString())
        .eq("amount", amount)
        .eq("is_expense", is_expense)
    if (error) console.error("expenses.deleteExpenseByData: failed to delete expense", error)
    if (error) return null
    return {deletedCount: count ?? 0}
}

/**
 * Gets {userId, total} pairs for the expense/income-ranking pool (all users,
 * or only an explicit cohort of user ids - see
 * server/src/services/similarUsers.ts for "similar users" cohort selection)
 * for a given month, via a single aggregate query (get_expense_ranking_pool
 * RPC) instead of one query per user.
 * @param user_ids Restrict the pool to these user ids, or undefined for everyone
 * @param is_expense_filter true = expenses pool, false = incomes pool
 * @param reference_date Any date within the target month
 */
async function getExpenseRankingPool(user_ids: string[] | undefined, is_expense_filter: boolean, reference_date: ExtDate) {
    const month_start = ExtDate.fromReferenceMonthStart(reference_date)
    const p_month = `${month_start.getUTCFullYear()}-${String(month_start.getUTCMonth() + 1).padStart(2, "0")}-01`
    const {data, error} = await supabase.rpc("get_expense_ranking_pool", {
        p_user_ids: user_ids ?? null,
        p_is_expense: is_expense_filter,
        p_month
    })
    if (error) console.error("expenses.getExpenseRankingPool: get_expense_ranking_pool RPC failed", error)
    if (error || !data) return []
    return (data as any[]).map((row) => ({userId: row.user_id as string, total: Number(row.total_amount)}))
}

export default {
    insertNew,
    getAllByUserId,
    getMonthlyExpensesByUserId,
    getRecentMonthlyExpensesByUserId,
    getTotalMonthlyExpensesByUserId,
    getMonthlyTotalsByUserId,
    getExpenseRankingPool,
    deleteExpenseByData
};
