import supabase from "../supabase"

import { ExtDate } from "../../libs/datelib"

import tags from "./tags"
import { encryptField, decryptField } from "../crypto"
import type { TransactionPurpose } from "../../domain/transactions"

const TRANSACTION_SELECT = `
    id, occurred_at, amount, cash_amount, exclude_from_statistics, is_expense, direction, purpose, notes,
    balance_asset_key, balance_detail_type, balance_detail_id,
    payment_type:tags!expenses_payment_type_tag_id_fkey(label, client_index, type),
    category_tag:tags!expenses_category_tag_id_fkey(label, client_index, type),
    user_category:user_categories(id, label)
`

/** Balance-source asset keys accepted by the expenses table CHECK constraint. */
export const TRANSACTION_BALANCE_ASSET_KEYS = [
    "bank", "cash", "digitalServices", "emergencyFund",
    "stocks", "etf", "bitcoin", "crypto", "bonds", "funds", "commodities"
] as const

export const TRANSACTION_BALANCE_DETAIL_TYPES = ["liquidity", "investment"] as const

/**
 * Optional balance source recorded with a transaction: the balance field (and
 * optionally the specific sub-account) the money was taken from / added to.
 */
export type TransactionBalanceSource = {
    asset_key: typeof TRANSACTION_BALANCE_ASSET_KEYS[number],
    detail_type: typeof TRANSACTION_BALANCE_DETAIL_TYPES[number] | null,
    detail_id: number | null
}

interface TagJoinRow {
    label: string
    client_index: number
    type: number
}

interface TransactionRow {
    id: number
    occurred_at: string
    amount: number
    cash_amount: number | null
    exclude_from_statistics: boolean | null
    is_expense: boolean
    direction: "income" | "outflow"
    purpose: TransactionPurpose
    notes: string
    balance_asset_key: string | null
    balance_detail_type: string | null
    balance_detail_id: number | null
    payment_type: TagJoinRow | null
    category_tag: TagJoinRow | null
    user_category: {id: number, label: string} | null
}

function mapTagJoin(row: TagJoinRow | null) {
    if (!row) return null
    return {label: row.label, index: row.client_index, type: row.type}
}

// Supabase's untyped client infers embedded *-to-one FK joins (payment_type,
// category_tag, user_category above) as arrays, since without a generated
// Database type it can't know the relationship is unique. PostgREST actually
// returns a single object for these at runtime (confirmed by every field
// access below), so the raw row is taken as unknown and cast to the shape
// we know it really has, rather than fighting the client's over-cautious
// inferred type.
function toTransaction(rawRow: unknown) {
    const row = rawRow as TransactionRow
    return {
        id: row.id as number,
        date: row.occurred_at,
        amount: row.amount as number,
        cashAmount: (row.cash_amount as number | null) ?? (row.amount as number),
        excludeFromStatistics: Boolean(row.exclude_from_statistics),
        isExpense: row.is_expense as boolean,
        direction: row.direction ?? (row.is_expense ? "outflow" : "income"),
        purpose: row.purpose ?? (row.is_expense ? "expense" : "income"),
        notes: decryptField(row.notes),
        paymentType: mapTagJoin(row.payment_type),
        categoryTag: mapTagJoin(row.category_tag),
        userCategory: row.user_category ? {id: row.user_category.id as number, label: row.user_category.label as string} : null,
        balanceAssetKey: (row.balance_asset_key as string | null) ?? null,
        balanceDetailType: (row.balance_detail_type as string | null) ?? null,
        balanceDetailId: (row.balance_detail_id as number | null) ?? null
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
 * @param balance_source Optional balance source the transaction was paid from / credited to
 * @returns Expense document, or null in case of error
 */
async function insertNew(user_id: string, date: Date, amount: number, is_expense: boolean,
    notes: string, payment_type: number, category_tag: number, user_category_id: number | null = null,
    balance_source: TransactionBalanceSource | null = null, purpose: TransactionPurpose = is_expense ? "expense" : "income") {
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

        const {data, error} = await supabase.from("transactions").insert({
        user_id,
        occurred_at: date,
        amount,
        is_expense,
        purpose,
        notes: encryptField(notes),
        payment_type_tag_id: payment_type_ref.id,
        category_tag_id: category_tag_ref.id,
        user_category_id,
        balance_asset_key: balance_source?.asset_key ?? null,
        balance_detail_type: balance_source?.detail_type ?? null,
        balance_detail_id: balance_source?.detail_id ?? null
    }).select(TRANSACTION_SELECT).single()
    if (error) console.error("transactions.insertNew: failed to insert expense", error)
    if (error || !data) return null
    return toTransaction(data)
}

export type TransactionUpdateInput = {
    id: number
    date: Date
    amount: number
    isExpense: boolean
    purpose: TransactionPurpose
    notes: string
    paymentType: number
    categoryTag: number
    userCategoryId: number | null
    balanceSource: TransactionBalanceSource | null
    sharedMode: "unchanged" | "set" | "remove"
    sharedTotal: number | null
    sharedOwnShare: number | null
}

/** Updates a transaction and its optional shared receivable atomically. */
async function updateExisting(user_id: string, input: TransactionUpdateInput) {
    const paymentIndex = input.isExpense ? input.paymentType : 0
    const categoryType = input.isExpense ? tags.TagType.expense.value : tags.TagType.income.value
    const [paymentRef, categoryRef] = await Promise.all([
        tags.getReferenceByIndexAndType(paymentIndex, tags.TagType.payment.value),
        tags.getReferenceByIndexAndType(input.categoryTag, categoryType),
    ])
    if (!paymentRef || !categoryRef) return null

    const {data, error} = await supabase.rpc("update_transaction_with_shared", {
        p_user_id: user_id,
        p_transaction_id: input.id,
        p_occurred_at: input.date,
        p_amount: input.amount,
        p_is_expense: input.isExpense,
        p_purpose: input.purpose,
        p_notes: encryptField(input.notes),
        p_payment_type_tag_id: paymentRef.id,
        p_category_tag_id: categoryRef.id,
        p_user_category_id: input.userCategoryId,
        p_balance_asset_key: input.balanceSource?.asset_key ?? null,
        p_balance_detail_type: input.balanceSource?.detail_type ?? null,
        p_balance_detail_id: input.balanceSource?.detail_id ?? null,
        p_shared_mode: input.sharedMode,
        p_shared_total: input.sharedTotal,
        p_shared_own_share: input.sharedOwnShare,
    })
    if (error) console.error("transactions.updateExisting: failed to update expense", error)
    if (error || data === null) return null
    return {id: Number(data)}
}

export type TransactionBatchInput = {
    date: Date
    amount: number
    isExpense: boolean
    purpose: TransactionPurpose
    notes: string
    paymentType: number
    categoryTag: number
    userCategoryId: number | null
    balanceSource: TransactionBalanceSource | null
    cashAmount: number | null
    excludeFromStatistics: boolean
}

/**
 * Inserts an import batch with one database write. Tag references are resolved
 * once per distinct category/payment pair, rather than once per transaction.
 */
async function insertBatch(user_id: string, inputs: TransactionBatchInput[]) {
    if (inputs.length === 0) return []

    const referenceRequests = new Map<string, {index: number, type: number}>()
    for (const input of inputs) {
        const categoryType = input.isExpense ? tags.TagType.expense.value : tags.TagType.income.value
        referenceRequests.set(`category:${categoryType}:${input.categoryTag}`, {index: input.categoryTag, type: categoryType})
        const paymentIndex = input.isExpense ? input.paymentType : 0
        referenceRequests.set(`payment:${tags.TagType.payment.value}:${paymentIndex}`, {index: paymentIndex, type: tags.TagType.payment.value})
    }

    const references = new Map<string, Awaited<ReturnType<typeof tags.getReferenceByIndexAndType>>>()
    await Promise.all(Array.from(referenceRequests.entries()).map(async ([key, request]) => {
        references.set(key, await tags.getReferenceByIndexAndType(request.index, request.type))
    }))

    const rows = inputs.map((input) => {
        const categoryType = input.isExpense ? tags.TagType.expense.value : tags.TagType.income.value
        const paymentIndex = input.isExpense ? input.paymentType : 0
        const categoryRef = references.get(`category:${categoryType}:${input.categoryTag}`)
        const paymentRef = references.get(`payment:${tags.TagType.payment.value}:${paymentIndex}`)
        if (!categoryRef || !paymentRef) return null
        return {
            user_id,
            occurred_at: input.date,
            amount: input.amount,
            cash_amount: input.cashAmount,
            exclude_from_statistics: input.excludeFromStatistics,
            is_expense: input.isExpense,
            purpose: input.purpose,
            notes: encryptField(input.notes),
            payment_type_tag_id: paymentRef.id,
            category_tag_id: categoryRef.id,
            user_category_id: input.userCategoryId,
            balance_asset_key: input.balanceSource?.asset_key ?? null,
            balance_detail_type: input.balanceSource?.detail_type ?? null,
            balance_detail_id: input.balanceSource?.detail_id ?? null,
        }
    })
    if (rows.some((row) => row === null)) return null
    const validRows = rows.filter((row): row is NonNullable<typeof row> => row !== null)

    const {data, error} = await supabase.from("transactions").insert(validRows).select(TRANSACTION_SELECT)
    if (error) console.error("transactions.insertBatch: failed to insert expenses", error)
    if (error || !data) return null
    return data.map((row) => toTransaction(row))
}

/**
 * Gets all the expenses of a user
 * @param user_id uuid of the user
 * @returns List of Expense documents
 */
async function getAllByUserId(user_id: string) {
    const {data, error} = await supabase.from("transactions")
        .select(TRANSACTION_SELECT)
        .eq("user_id", user_id)
        .order("occurred_at", {ascending: true})
    if (error) console.error("transactions.getAllByUserId: failed to read expenses", error)
    if (error || !data) return null
    return data.map(toTransaction)
}

/**
 * Timestamp of the user's most recent expense/income row, or null if they've
 * never logged one — used by the dataUpdateReminder to detect "hasn't touched
 * the app in a while" without pulling their whole history.
 */
async function getLastActivityDateByUserId(user_id: string): Promise<string | null> {
    const {data, error} = await supabase.from("transactions")
        .select("occurred_at")
        .eq("user_id", user_id)
        .order("occurred_at", {ascending: false})
        .limit(1)
        .maybeSingle()
    if (error) console.error("transactions.getLastActivityDateByUserId: failed to read latest activity", error)
    if (error || !data) return null
    return (data as {occurred_at: string}).occurred_at
}

/**
 * Gets the expenses of a user for the month
 * @param user_id uuid of the user
 * @param reference_date Date object containing the year and month to look for
 * @param is_expense_filter True to retrieve only expenses, false to retrieve only incomes, undefined for both
 * @returns List of Expense documents
 */
async function getMonthlyTransactionsByUserId(user_id: string, reference_date: ExtDate,
    is_expense_filter: boolean | undefined = undefined) {
    const month_start = ExtDate.fromReferenceMonthStart(reference_date)
    const month_end = ExtDate.fromReferenceMonthEnd(reference_date)

    let query = supabase.from("transactions")
        .select(TRANSACTION_SELECT)
        .eq("user_id", user_id)
        .gte("occurred_at", month_start.toISOString())
        .lte("occurred_at", month_end.toISOString())
    if (is_expense_filter !== undefined)
        query = query.eq("is_expense", is_expense_filter)

    const {data, error} = await query.order("occurred_at", {ascending: false})
    if (error) console.error("transactions.getMonthlyTransactionsByUserId: failed to read monthly expenses", error)
    if (error || !data) return []
    return data.map(toTransaction)
}

/**
 * Gets the last N months of expenses/incomes in a single Supabase request and
 * returns the same newest-first monthly bucket shape used by /expenses/get.
 * @param user_id uuid of the user
 * @param months Number of months to include, current month included
 * @returns List of monthly Expense arrays (newest month first), or null if the read failed
 */
/** Calendar-month anchors, newest first. Exported for the end-of-month regression test. */
export function buildRecentMonthReferences(now: Date, months: number): ExtDate[] {
    const reference_months: ExtDate[] = []
    for (let i = 0; i < months; i++) {
        // Never subtract months from today's day-of-month. On the 29th-31st,
        // Date#setUTCMonth overflows shorter months (31 Jan - 1 month, for
        // example, can land back in January), duplicating one chart bucket and
        // skipping another. A first-of-month anchor represents every month
        // exactly once regardless of when this request runs.
        reference_months.push(new ExtDate(ExtDate.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)))
    }
    return reference_months
}

async function getRecentMonthlyTransactionsByUserId(user_id: string, months: number) {
    const reference_months = buildRecentMonthReferences(ExtDate.fromNow(), months)

    const oldest = reference_months[reference_months.length - 1]
    const range_start = ExtDate.fromReferenceMonthStart(oldest)
    const range_end = ExtDate.fromReferenceMonthEnd(reference_months[0])

    const {data, error} = await supabase.from("transactions")
        .select(TRANSACTION_SELECT)
        .eq("user_id", user_id)
        .gte("occurred_at", range_start.toISOString())
        .lte("occurred_at", range_end.toISOString())
        .order("occurred_at", {ascending: false})

    // On a genuine query failure, return null (not empty buckets) so the caller can
    // tell "DB read failed" apart from "user has no transactions this month" — the
    // latter is legitimate and must not be reported as an error.
    if (error) {
        console.error("transactions.getRecentMonthlyTransactionsByUserId: failed to read recent expenses", error)
        return null
    }
    if (!data) return reference_months.map(() => [])

    const buckets = new Map<string, ReturnType<typeof toTransaction>[]>()
    for (const row of data) {
        const occurred_at = new Date(row.occurred_at)
        const key = `${occurred_at.getUTCFullYear()}-${occurred_at.getUTCMonth()}`
        const bucket = buckets.get(key) ?? []
        bucket.push(toTransaction(row))
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
async function getTotalMonthlyTransactionsByUserId(user_id: string, reference_date: ExtDate,
    is_expense_filter: boolean | undefined = undefined) {
    const transactions = await getMonthlyTransactionsByUserId(user_id, reference_date, is_expense_filter)
    if (transactions.length === 0)
        return null
    return transactions.reduce((accumulator, transaction) => (
        transaction.excludeFromStatistics ? accumulator : accumulator + transaction.amount
    ), 0)
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
    if (error) console.error("transactions.getMonthlyTotalsByUserId: get_monthly_totals RPC failed", error)
    if (error || !data) return null
    return (data as Array<{
        month_start: string
        total_outflows: number
        total_incomes: number
        total_expenses: number
        total_investments: number
        total_transfers: number
    }>).map((row) => ({
        monthStart: row.month_start,
        totalOutflows: Number(row.total_outflows),
        totalIncomes: Number(row.total_incomes),
        totalExpenses: Number(row.total_expenses),
        totalInvestments: Number(row.total_investments),
        totalTransfers: Number(row.total_transfers),
    }))
}

/**
 * Deletes a single expense/income by its row id, scoped to the owning user.
 * The precise, preferred way to delete a transaction — unlike
 * deleteTransactionByData below, it can never match more than one row (e.g. two
 * identical-looking transactions on the same day, same amount).
 * @param user_id uuid of the user
 * @param id row id of the expense
 * @returns {deletedCount} object
 */
async function deleteTransactionById(user_id: string, id: number) {
    const {error, count} = await supabase.from("transactions")
        .delete({count: "exact"})
        .eq("user_id", user_id)
        .eq("id", id)
    if (error) console.error("transactions.deleteTransactionById: failed to delete expense", error)
    if (error) return null
    return {deletedCount: count ?? 0}
}

/**
 * Deletes an expense/income of a user, given the entry date, amount and direction.
 * Fragile by nature (can match more than one row if two transactions share the
 * same date/amount/direction) — kept only for callers that don't have the row
 * id (e.g. import-undo, which deletes right after a batch insert). Prefer
 * deleteTransactionById wherever the row id is available.
 * @param user_id uuid of the user
 * @param date Date of the expense
 * @param amount Amount of the expense
 * @param is_expense True if this is entry is an expense, false if it's an income
 * @returns {deletedCount} object
 */
async function deleteTransactionByData(user_id: string, date: Date, amount: number, is_expense: boolean) {
    const {error, count} = await supabase.from("transactions")
        .delete({count: "exact"})
        .eq("user_id", user_id)
        .eq("occurred_at", new Date(date).toISOString())
        .eq("amount", amount)
        .eq("is_expense", is_expense)
    if (error) console.error("transactions.deleteTransactionByData: failed to delete expense", error)
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
async function getTransactionRankingPool(user_ids: string[] | undefined, is_expense_filter: boolean, reference_date: ExtDate) {
    const month_start = ExtDate.fromReferenceMonthStart(reference_date)
    const p_month = `${month_start.getUTCFullYear()}-${String(month_start.getUTCMonth() + 1).padStart(2, "0")}-01`
    const {data, error} = await supabase.rpc("get_expense_ranking_pool", {
        p_user_ids: user_ids ?? null,
        p_is_expense: is_expense_filter,
        p_month
    })
    if (error) console.error("transactions.getTransactionRankingPool: get_expense_ranking_pool RPC failed", error)
    if (error || !data) return []
    return (data as {user_id: string, total_amount: number}[]).map((row) => ({userId: row.user_id, total: Number(row.total_amount)}))
}

export default {
    insertNew,
    updateExisting,
    insertBatch,
    getAllByUserId,
    getLastActivityDateByUserId,
    getMonthlyTransactionsByUserId,
    getRecentMonthlyTransactionsByUserId,
    getTotalMonthlyTransactionsByUserId,
    getMonthlyTotalsByUserId,
    getTransactionRankingPool,
    deleteTransactionById,
    deleteTransactionByData
};
