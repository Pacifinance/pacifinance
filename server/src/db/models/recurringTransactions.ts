import supabase from "../supabase"

import { ExtDate, toDateOnly } from "../../libs/datelib"

import tags from "./tags"
import balances from "./balances"
import liquidityAccounts from "./liquidityAccounts"
import investments from "./investments"
import { encryptField, decryptField } from "../crypto"
import type { TransactionPurpose } from "../../domain/transactions"
import type { TransactionBalanceSource } from "./transactions"

const RECURRING_SELECT = `
    id, is_expense, purpose, amount, notes, day_of_month, active, next_run_date,
    balance_asset_key, balance_detail_type, balance_detail_id,
    payment_type:tags!recurring_transactions_payment_type_tag_id_fkey(label, client_index, type),
    category_tag:tags!recurring_transactions_category_tag_id_fkey(label, client_index, type),
    user_category:user_categories(id, label)
`

type TagJoin = {label: string, client_index: number, type: number} | null

interface RecurringRow {
    id: number
    is_expense: boolean
    purpose: TransactionPurpose
    amount: number
    notes: string
    day_of_month: number
    active: boolean
    next_run_date: string
    balance_asset_key: string | null
    balance_detail_type: string | null
    balance_detail_id: number | null
    payment_type: TagJoin
    category_tag: TagJoin
    user_category: {id: number, label: string} | null
}

function mapTagJoin(row: TagJoin) {
    if (!row) return null
    return {label: row.label, index: row.client_index, type: row.type}
}

// See the matching comment in transactions.ts's toExpense: Supabase's untyped
// client infers embedded *-to-one FK joins as arrays, but PostgREST actually
// returns a single object here at runtime.
function toRecurring(rawRow: unknown) {
    const row = rawRow as RecurringRow
    return {
        id: row.id,
        direction: row.is_expense ? "outflow" as const : "income" as const,
        purpose: row.purpose ?? (row.is_expense ? "expense" : "income"),
        amount: row.amount,
        notes: decryptField(row.notes),
        paymentType: mapTagJoin(row.payment_type),
        categoryTag: mapTagJoin(row.category_tag),
        userCategory: row.user_category ? {id: row.user_category.id, label: row.user_category.label} : null,
        dayOfMonth: row.day_of_month,
        active: row.active,
        nextRunDate: row.next_run_date,
        balanceAssetKey: row.balance_asset_key,
        balanceDetailType: row.balance_detail_type,
        balanceDetailId: row.balance_detail_id,
    }
}

export type RecurringInput = {
    isExpense: boolean
    purpose: TransactionPurpose
    amount: number
    notes: string
    paymentType: number // client index, ignored for incomes
    categoryTag: number // client index
    userCategoryId: number | null
    dayOfMonth: number // 1-28
    balanceSource: TransactionBalanceSource | null
}

/**
 * Resolves the client-index tag values (same convention as transactions.insertNew)
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
        purpose: input.purpose,
        amount: input.amount,
        notes: encryptField(input.notes),
        payment_type_tag_id: resolved.paymentTypeId,
        category_tag_id: resolved.categoryTagId,
        user_category_id: input.userCategoryId,
        day_of_month: input.dayOfMonth,
        active: true,
        next_run_date: toDateOnly(computeInitialNextRunDate(input.dayOfMonth)),
        balance_asset_key: input.balanceSource?.asset_key ?? null,
        balance_detail_type: input.balanceSource?.detail_type ?? null,
        balance_detail_id: input.balanceSource?.detail_id ?? null,
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
            purpose: input.purpose,
            amount: input.amount,
            notes: encryptField(input.notes),
            payment_type_tag_id: resolved.paymentTypeId,
            category_tag_id: resolved.categoryTagId,
            user_category_id: input.userCategoryId,
            day_of_month: input.dayOfMonth,
            next_run_date: toDateOnly(computeInitialNextRunDate(input.dayOfMonth)),
            balance_asset_key: input.balanceSource?.asset_key ?? null,
            balance_detail_type: input.balanceSource?.detail_type ?? null,
            balance_detail_id: input.balanceSource?.detail_id ?? null,
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
    purpose: TransactionPurpose
    amount: number
    notes: string | null
    payment_type_tag_id: number | null
    category_tag_id: number
    user_category_id: number | null
    day_of_month: number
    balance_asset_key: string | null
    balance_detail_type: "liquidity" | "investment" | null
    balance_detail_id: number | null
}

/**
 * Cross-user query (cron only, service-role client — see server/src/routes/cron/cron.ts
 * for the shared-secret auth gate) of every active template due today or
 * earlier — "earlier" covers templates that missed a run because the cron
 * didn't fire (e.g. a deploy outage), so nothing is silently skipped.
 */
async function getDueRecurring(now: Date) {
    const {data, error} = await supabase.from("recurring_transactions")
        .select(`id, user_id, is_expense, purpose, amount, notes, payment_type_tag_id, category_tag_id,
            user_category_id, day_of_month, balance_asset_key, balance_detail_type, balance_detail_id`)
        .eq("active", true)
        .lte("next_run_date", toDateOnly(now))
    if (error) console.error("recurringTransactions.getDueRecurring: failed to read due templates", error)
    if (error || !data) return []
    return data as unknown as DueRow[]
}

// camelCase asset key -> balances table column name (the same mapping as the
// client's ASSET_TO_DB_KEY in src/constants/balanceSchema.ts - duplicated
// here since client and server code never share a bundle).
const ASSET_TO_BALANCE_COLUMN: Record<string, string> = {
    bank: "bank", cash: "cash", digitalServices: "digital_services", emergencyFund: "emergency_fund",
    stocks: "stocks", etf: "etf", bitcoin: "bitcoin", crypto: "crypto",
    bonds: "bonds", funds: "funds", commodities: "commodities",
}

/**
 * Applies a due template's amount as a balance delta, mirroring what the
 * client does after a manual insert (InsertValues.tsx's applyCurrentDetailSourceDelta
 * + createBalancesJson) - but server-side, since a cron-fired template has no
 * client present to do it. Best-effort: logs and returns on failure, never
 * throws, so a delta problem can't turn an already-recorded transaction into
 * a failed cron run (same philosophy as balances/add's history-snapshot calls).
 */
async function applyRecurringBalanceDelta(
    user_id: string,
    assetKey: string | null,
    detailType: "liquidity" | "investment" | null,
    detailId: number | null,
    deltaEUR: number,
) {
    if (!assetKey || !deltaEUR) return

    if (detailType === "liquidity" && detailId !== null) {
        const accounts = await liquidityAccounts.getAccountsByUserId(user_id)
        const account = accounts.find((a) => a.id === detailId)
        if (!account) return
        await liquidityAccounts.updateAccount(user_id, account.id, {
            assetKey: account.assetKey,
            label: account.label,
            currentValue: (Number(account.currentValue) || 0) + deltaEUR,
            currency: account.currency,
            notes: account.notes,
            linkedBankKey: account.linkedBankKey,
            unitValue: account.unitValue,
            fallbackAccountId: account.fallbackAccountId,
        })
        return
    }

    if (detailType === "investment" && detailId !== null) {
        // Raw stored current_value (not the live-verified-price overlay) is the
        // correct baseline to compound a delta onto - see getHoldingsByUserId's
        // own comment on why the overlay exists and why it's a read-time-only view.
        const holdings = await investments.getHoldingsByUserId(user_id, false)
        const holding = holdings.find((h) => h.id === detailId)
        if (!holding?.instrument?.id) return
        await investments.updateHolding(user_id, holding.id, {
            instrumentId: holding.instrument.id,
            assetKey: holding.assetKey,
            positionType: holding.positionType,
            quantity: holding.quantity,
            averagePrice: holding.averagePrice,
            currentValue: (Number(holding.currentValue) || 0) + deltaEUR,
            investedAmount: holding.investedAmount,
            currency: holding.currency,
            notes: holding.notes,
            importSource: holding.importSource,
        })
        return
    }

    // No sub-account: the macro balance field itself. Append a new snapshot
    // row (balances is append-only history, never updated in place) built
    // from the most recent one with the delta applied to the chosen field.
    const column = ASSET_TO_BALANCE_COLUMN[assetKey]
    if (!column) return
    const latest = await balances.getMostRecentByUserId(user_id)
    const values: Record<string, number> = {
        bank: latest?.bank ?? 0, cash: latest?.cash ?? 0, digital_services: latest?.digitalServices ?? 0,
        stocks: latest?.stocks ?? 0, etf: latest?.etf ?? 0, bitcoin: latest?.bitcoin ?? 0, crypto: latest?.crypto ?? 0,
        bonds: latest?.bonds ?? 0, funds: latest?.funds ?? 0, commodities: latest?.commodities ?? 0,
        emergency_fund: latest?.emergencyFund ?? 0,
    }
    values[column] += deltaEUR
    await balances.insertNew(
        user_id, new Date(), values.bank, values.cash, values.digital_services,
        values.stocks, values.etf, values.bitcoin, values.crypto,
        values.bonds, values.funds, values.commodities, values.emergency_fund,
    )
}

/**
 * Inserts the expenses row for one due template (ids already resolved, so
 * this skips transactions.insertNew's client-index tag lookup), advances the
 * template to next month, and - if a balance source was configured - applies
 * its amount as a delta to that account (see applyRecurringBalanceDelta).
 * Best-effort per template: a failure on one template must not stop the
 * others in the same cron run.
 */
export async function runDueTemplate(row: DueRow, runDate: Date) {
    const {error: insertError} = await supabase.from("transactions").insert({
        user_id: row.user_id,
        occurred_at: runDate.toISOString(),
        amount: row.amount,
        is_expense: row.is_expense,
        purpose: row.purpose,
        notes: row.notes, // already encrypted at rest, copied as-is
        payment_type_tag_id: row.payment_type_tag_id,
        category_tag_id: row.category_tag_id,
        user_category_id: row.user_category_id,
        balance_asset_key: row.balance_asset_key,
        balance_detail_type: row.balance_detail_type,
        balance_detail_id: row.balance_detail_id,
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

    if (row.balance_asset_key) {
        await applyRecurringBalanceDelta(
            row.user_id, row.balance_asset_key, row.balance_detail_type, row.balance_detail_id,
            row.is_expense ? -row.amount : row.amount,
        ).catch((error) =>
            console.error(`recurringTransactions.runDueTemplate: failed to apply balance delta for template ${row.id}`, error))
    }

    return true
}

/**
 * Read-only count of a single user's active templates due within `withinDays`
 * of `now` (today included) — for the recurringDue reminder, which only needs
 * to know "is anything coming up" without running or advancing anything (that
 * still happens once a day via runAllDue above).
 */
async function getUpcomingCountForUser(user_id: string, now: Date, withinDays: number): Promise<number> {
    const horizon = new ExtDate(now)
    horizon.moveByDays(withinDays)
    const {count, error} = await supabase.from("recurring_transactions")
        .select("id", {count: "exact", head: true})
        .eq("user_id", user_id)
        .eq("active", true)
        .lte("next_run_date", toDateOnly(horizon))
    if (error) console.error("recurringTransactions.getUpcomingCountForUser: failed to read upcoming templates", error)
    return error || !count ? 0 : count
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
    getUpcomingCountForUser,
}
