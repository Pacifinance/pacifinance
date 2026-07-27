import supabase from "../supabase"
import { toDateOnly } from "../../libs/datelib"
import { roundCurrency } from "../../libs/money"
import { encryptField, decryptField } from "../crypto"

type ReceivableRow = {
    id: number
    occurred_at: string
    notes: string | null
    total_amount: number
    own_share: number
    receivable_amount: number
    settled_amount: number
    created_at: string
}

export type ReceivableInput = {
    occurredAt: Date
    notes: string
    totalAmount: number
    ownShare: number
}

const RECEIVABLE_SELECT = [
    "id", "occurred_at", "notes", "total_amount", "own_share", "receivable_amount", "settled_amount", "created_at",
].join(", ")

/** A receivable is fully recovered once settled_amount reaches receivable_amount (rounding-safe). */
function statusOf(receivableAmount: number, settledAmount: number): "pending" | "partial" | "settled" {
    if (settledAmount <= 0) return "pending"
    return settledAmount >= receivableAmount - 0.005 ? "settled" : "partial"
}

function toReceivable(row: ReceivableRow) {
    return {
        id: row.id,
        date: row.occurred_at,
        notes: decryptField(row.notes),
        totalAmount: row.total_amount,
        ownShare: row.own_share,
        receivableAmount: row.receivable_amount,
        settledAmount: row.settled_amount,
        status: statusOf(row.receivable_amount, row.settled_amount),
        createdAt: row.created_at,
    }
}

/**
 * Lists a user's shared-expense receivables (money fronted for a group,
 * still owed back), most recent first.
 */
async function getReceivablesByUserId(user_id: string) {
    const {data, error} = await supabase.from("shared_expense_receivables")
        .select(RECEIVABLE_SELECT)
        .eq("user_id", user_id)
        .order("occurred_at", {ascending: false})
    if (error) console.error("sharedExpenses.getReceivablesByUserId: failed to read receivables", error)
    if (error || !data) return []
    return (data as unknown as ReceivableRow[]).map(toReceivable)
}

/**
 * Records a new receivable. own_share is informational only here (the real
 * outflow with amount = ownShare is inserted separately via expenses.insertNew);
 * receivable_amount = totalAmount - ownShare is what's actually owed back.
 */
async function insertReceivable(user_id: string, input: ReceivableInput) {
    const receivableAmount = roundCurrency(input.totalAmount - input.ownShare)
    if (receivableAmount <= 0) return null

    const {data, error} = await supabase.from("shared_expense_receivables").insert({
        user_id,
        occurred_at: toDateOnly(input.occurredAt),
        notes: encryptField(input.notes),
        total_amount: roundCurrency(input.totalAmount),
        own_share: roundCurrency(input.ownShare),
        receivable_amount: receivableAmount,
    }).select(RECEIVABLE_SELECT).single()
    if (error) console.error("sharedExpenses.insertReceivable: failed to insert receivable", error)
    if (error || !data) return null
    return toReceivable(data as unknown as ReceivableRow)
}

/**
 * Adds `amount` to a receivable's settled total (clamped so it never exceeds
 * receivable_amount), scoped to the owning user. Never touches expense/income
 * category totals — money coming back is a balance-only event, not income.
 */
async function settleReceivable(user_id: string, receivable_id: number, amount: number) {
    const {data: existing, error: readError} = await supabase.from("shared_expense_receivables")
        .select(RECEIVABLE_SELECT).eq("user_id", user_id).eq("id", receivable_id).maybeSingle()
    if (readError) console.error("sharedExpenses.settleReceivable: failed to read receivable", readError)
    if (readError || !existing) return null

    const row = existing as unknown as ReceivableRow
    const newSettled = Math.min(row.receivable_amount, roundCurrency(row.settled_amount + amount))

    const {data, error} = await supabase.from("shared_expense_receivables")
        .update({settled_amount: newSettled})
        .eq("user_id", user_id)
        .eq("id", receivable_id)
        .select(RECEIVABLE_SELECT)
        .single()
    if (error) console.error("sharedExpenses.settleReceivable: failed to update receivable", error)
    if (error || !data) return null
    return toReceivable(data as unknown as ReceivableRow)
}

/**
 * Deletes a receivable owned by the user.
 */
async function deleteReceivable(user_id: string, receivable_id: number) {
    const {error, count} = await supabase.from("shared_expense_receivables")
        .delete({count: "exact"})
        .eq("user_id", user_id)
        .eq("id", receivable_id)
    if (error) console.error("sharedExpenses.deleteReceivable: failed to delete receivable", error)
    if (error) return null
    return {deletedCount: count ?? 0}
}

export default {
    getReceivablesByUserId,
    insertReceivable,
    settleReceivable,
    deleteReceivable,
}
