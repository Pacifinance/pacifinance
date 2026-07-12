import supabase from "../supabase"

import { ExtDate } from "../../libs/datelib"

import tags from "./tags"
import { encryptField, decryptField } from "../crypto"

const RECURRING_SELECT = `
    id, is_expense, amount, notes, day_of_month, active, next_run_date,
    payment_type:tags!recurring_transactions_payment_type_tag_id_fkey(label, client_index, type),
    category_tag:tags!recurring_transactions_category_tag_id_fkey(label, client_index, type),
    user_category:user_categories(id, label)
`

function mapTagJoin(row: any) {
    if (!row) return null
    return {label: row.label, index: row.client_index, type: row.type}
}

function toRecurring(row: any) {
    return {
        id: row.id as number,
        isExpense: row.is_expense as boolean,
        amount: row.amount as number,
        notes: decryptField(row.notes),
        paymentType: mapTagJoin(row.payment_type),
        categoryTag: mapTagJoin(row.category_tag),
        userCategory: row.user_category ? {id: row.user_category.id as number, label: row.user_category.label as string} : null,
        dayOfMonth: row.day_of_month as number,
        active: row.active as boolean,
        nextRunDate: row.next_run_date as string,
    }
}

export type RecurringInput = {
    isExpense: boolean
    amount: number
    notes: string
    paymentType: number // client index, ignored for incomes
    categoryTag: number // client index
    userCategoryId: number | null
    dayOfMonth: number // 1-28
}

/**
 * Resolves the client-index tag values (same convention as expenses.insertNew)
 * to the tag row ids actually stored on recurring_transactions.
 */
async function resolveTagIds(input: RecurringInput) {
    let paymentTypeRef = null
    let categoryTagRef = null
    if (input.isExpense) {
        if (input.paymentType === 0) return null // an expense's payment type cannot be "none"
        paymentTypeRef = await tags.getReferenceByIndexAndType(input.paymentType, tags.TagType.payment.value)
        categoryTagRef = await tags.getReferenceByIndexAndType(input.categoryTag, tags.TagType.expense.value)
    } else {
        categoryTagRef = await tags.getReferenceByIndexAndType(input.categoryTag, tags.TagType.income.value)
    }
    if (categoryTagRef === null || (input.isExpense && paymentTypeRef === null)) return null
    return {paymentTypeId: paymentTypeRef?.id ?? null, categoryTagId: categoryTagRef.id}
}

/**
 * First due date for a freshly-created template: the given day of NEXT month.
 * The user presumably just paid this month's occurrence manually (or is about
 * to), so automation only takes over starting next month.
 */
function computeInitialNextRunDate(dayOfMonth: number): Date {
    const next = ExtDate.fromNow()
    next.moveByMonths(1)
    next.setUTCDate(dayOfMonth)
    next.setUTCHours(0, 0, 0, 0)
    return next
}

function toDateOnly(d: Date) {
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, "0")
    const day = String(d.getUTCDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
}

/**
 * Lists the user's recurring transaction templates.
 */
async function getAllByUserId(user_id: string) {
    const {data, error} = await supabase.from("recurring_transactions")
        .select(RECURRING_SELECT)
        .eq("user_id", user_id)
        .order("next_run_date", {ascending: true})
    if (error) console.error("recurringTransactions.getAllByUserId: failed to read recurring transactions", error)
    if (error || !data) return []
    return data.map(toRecurring)
}

/**
 * Creates a new recurring transaction template.
 */
async function insertRecurring(user_id: string, input: RecurringInput) {
    const resolved = await resolveTagIds(input)
    if (resolved === null) return null

    const {data, error} = await supabase.from("recurring_transactions").insert({
        user_id,
        is_expense: input.isExpense,
        amount: input.amount,
        notes: encryptField(input.notes),
        payment_type_tag_id: resolved.paymentTypeId,
        category_tag_id: resolved.categoryTagId,
        user_category_id: input.userCategoryId,
        day_of_month: input.dayOfMonth,
        active: true,
        next_run_date: toDateOnly(computeInitialNextRunDate(input.dayOfMonth)),
    }).select(RECURRING_SELECT).single()
    if (error) console.error("recurringTransactions.insertRecurring: failed to insert", error)
    if (error || !data) return null
    return toRecurring(data)
}

/**
 * Updates an existing recurring transaction template, scoped to the owner.
 * Changing dayOfMonth recomputes next_run_date from today (same rule as
 * creation: next occurrence starts next month, avoiding a surprise double
 * charge this month).
 */
async function updateRecurring(user_id: string, id: number, input: RecurringInput) {
    const resolved = await resolveTagIds(input)
    if (resolved === null) return null

    const {data, error} = await supabase.from("recurring_transactions")
        .update({
            is_expense: input.isExpense,
            amount: input.amount,
            notes: encryptField(input.notes),
            payment_type_tag_id: resolved.paymentTypeId,
            category_tag_id: resolved.categoryTagId,
            user_category_id: input.userCategoryId,
            day_of_month: input.dayOfMonth,
            next_run_date: toDateOnly(computeInitialNextRunDate(input.dayOfMonth)),
            updated_at: new Date().toISOString(),
        })
        .eq("user_id", user_id)
        .eq("id", id)
        .select(RECURRING_SELECT)
        .single()
    if (error) console.error("recurringTransactions.updateRecurring: failed to update", error)
    if (error || !data) return null
    return toRecurring(data)
}

/**
 * Toggles a recurring transaction's active flag (pause/resume), scoped to the
 * owner. Resuming recomputes next_run_date so a long pause doesn't cause a
 * burst of catch-up charges.
 */
async function setActive(user_id: string, id: number, active: boolean) {
    const update: Record<string, unknown> = {active, updated_at: new Date().toISOString()}
    if (active) {
        const {data: current, error: readErr} = await supabase.from("recurring_transactions")
            .select("day_of_month").eq("user_id", user_id).eq("id", id).maybeSingle()
        if (readErr || !current) return null
        update.next_run_date = toDateOnly(computeInitialNextRunDate(current.day_of_month as number))
    }

    const {data, error} = await supabase.from("recurring_transactions")
        .update(update)
        .eq("user_id", user_id)
        .eq("id", id)
        .select(RECURRING_SELECT)
        .single()
    if (error) console.error("recurringTransactions.setActive: failed to update", error)
    if (error || !data) return null
    return toRecurring(data)
}

/**
 * Deletes a recurring transaction template owned by the user. Does not touch
 * any expenses row already generated from it.
 */
async function deleteRecurring(user_id: string, id: number) {
    const {error, count} = await supabase.from("recurring_transactions")
        .delete({count: "exact"})
        .eq("user_id", user_id)
        .eq("id", id)
    if (error) console.error("recurringTransactions.deleteRecurring: failed to delete", error)
    if (error) return null
    return {deletedCount: count ?? 0}
}

type DueRow = {
    id: number
    user_id: string
    is_expense: boolean
    amount: number
    notes: string | null
    payment_type_tag_id: number | null
    category_tag_id: number
    user_category_id: number | null
    day_of_month: number
}

/**
 * Cross-user query (cron only, service-role client — see server/src/routes/cron/cron.ts
 * for the shared-secret auth gate) of every active template due today or
 * earlier — "earlier" covers templates that missed a run because the cron
 * didn't fire (e.g. a deploy outage), so nothing is silently skipped.
 */
async function getDueRecurring(now: Date) {
    const {data, error} = await supabase.from("recurring_transactions")
        .select("id, user_id, is_expense, amount, notes, payment_type_tag_id, category_tag_id, user_category_id, day_of_month")
        .eq("active", true)
        .lte("next_run_date", toDateOnly(now))
    if (error) console.error("recurringTransactions.getDueRecurring: failed to read due templates", error)
    if (error || !data) return []
    return data as unknown as DueRow[]
}

/**
 * Inserts the expenses row for one due template (ids already resolved, so
 * this skips expenses.insertNew's client-index tag lookup) and advances the
 * template to next month. Best-effort per template: a failure on one template
 * must not stop the others in the same cron run.
 */
async function runDueTemplate(row: DueRow, runDate: Date) {
    const {error: insertError} = await supabase.from("expenses").insert({
        user_id: row.user_id,
        occurred_at: runDate.toISOString(),
        amount: row.amount,
        is_expense: row.is_expense,
        notes: row.notes, // already encrypted at rest, copied as-is
        payment_type_tag_id: row.payment_type_tag_id,
        category_tag_id: row.category_tag_id,
        user_category_id: row.user_category_id,
        // balance_asset_key/detail intentionally left null — see migration comment
    })
    if (insertError) {
        console.error(`recurringTransactions.runDueTemplate: failed to insert expense for template ${row.id}`, insertError)
        return false
    }

    const nextRun = new ExtDate(runDate)
    nextRun.moveByMonths(1)
    nextRun.setUTCDate(row.day_of_month)
    const {error: updateError} = await supabase.from("recurring_transactions")
        .update({next_run_date: toDateOnly(nextRun), updated_at: new Date().toISOString()})
        .eq("id", row.id)
    if (updateError) {
        console.error(`recurringTransactions.runDueTemplate: failed to advance template ${row.id}`, updateError)
        return false
    }
    return true
}

/**
 * Runs every due template as of `now`. Returns how many ran successfully.
 */
async function runAllDue(now: Date) {
    const due = await getDueRecurring(now)
    let ran = 0
    for (const row of due) {
        if (await runDueTemplate(row, now)) ran++
    }
    return {due: due.length, ran}
}

export default {
    getAllByUserId,
    insertRecurring,
    updateRecurring,
    setActive,
    deleteRecurring,
    runAllDue,
}
