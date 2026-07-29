import supabase from "../supabase"
import { ExtDate, toDateOnly } from "../../libs/datelib"

export const LIQUIDITY_ACCOUNT_ASSET_KEYS = ["bank", "cash", "digitalServices", "emergencyFund"] as const

export type LiquidityAccountAssetKey = typeof LIQUIDITY_ACCOUNT_ASSET_KEYS[number]

type AccountRow = {
    id: number
    asset_key: LiquidityAccountAssetKey
    label: string
    current_value: number
    currency: string
    notes: string
    updated_at: string
}

export type AccountInput = {
    assetKey: LiquidityAccountAssetKey
    label: string
    currentValue: number
    currency: string
    notes: string
}

const ACCOUNT_SELECT = ["id", "asset_key", "label", "current_value", "currency", "notes", "updated_at"].join(", ")

function toAccount(row: AccountRow) {
    return {
        id: row.id,
        assetKey: row.asset_key,
        label: row.label,
        currentValue: row.current_value,
        currency: row.currency,
        notes: row.notes,
        updatedAt: row.updated_at,
    }
}

function toAccountPayload(user_id: string, input: AccountInput) {
    return {
        user_id,
        asset_key: input.assetKey,
        label: input.label,
        current_value: input.currentValue,
        currency: input.currency,
        notes: input.notes,
    }
}

/**
 * Lists the user's detailed liquidity sub-accounts.
 */
async function getAccountsByUserId(user_id: string) {
    const {data, error} = await supabase.from("user_liquidity_accounts")
        .select(ACCOUNT_SELECT)
        .eq("user_id", user_id)
        .order("updated_at", {ascending: false})
    if (error) console.error("liquidityAccounts.getAccountsByUserId: failed to read accounts", error)
    if (error || !data) return []
    return (data as unknown as AccountRow[]).map(toAccount)
}

/**
 * Creates a detailed liquidity sub-account.
 */
async function insertAccount(user_id: string, input: AccountInput) {
    const {data, error} = await supabase.from("user_liquidity_accounts")
        .insert(toAccountPayload(user_id, input))
        .select(ACCOUNT_SELECT)
        .single()
    if (error) console.error("liquidityAccounts.insertAccount: failed to insert account", error)
    if (error || !data) return null
    return toAccount(data as unknown as AccountRow)
}

/**
 * Updates a detailed liquidity sub-account, scoped to the owner.
 */
async function updateAccount(user_id: string, account_id: number, input: AccountInput) {
    const {data, error} = await supabase.from("user_liquidity_accounts")
        .update({
            asset_key: input.assetKey,
            label: input.label,
            current_value: input.currentValue,
            currency: input.currency,
            notes: input.notes,
            updated_at: new Date().toISOString(),
        })
        .eq("user_id", user_id)
        .eq("id", account_id)
        .select(ACCOUNT_SELECT)
        .single()
    if (error) console.error("liquidityAccounts.updateAccount: failed to update account", error)
    if (error || !data) return null
    return toAccount(data as unknown as AccountRow)
}

/**
 * Deletes a liquidity sub-account owned by the user.
 */
async function deleteAccount(user_id: string, account_id: number) {
    const {error, count} = await supabase.from("user_liquidity_accounts")
        .delete({count: "exact"})
        .eq("user_id", user_id)
        .eq("id", account_id)
    if (error) console.error("liquidityAccounts.deleteAccount: failed to delete account", error)
    if (error) return null
    return {deletedCount: count ?? 0}
}

/**
 * Snapshots the user's current liquidity sub-accounts into
 * user_liquidity_account_history, dated at user_date (the balance month being
 * recorded). Single bulk insert regardless of account count. Best-effort: logs
 * on failure but never throws, so it can't break /balances/add.
 */
async function snapshotAccountsForUser(user_id: string, user_date: Date) {
    const accounts = await getAccountsByUserId(user_id)
    if (accounts.length === 0) return

    const rows = accounts.map((a) => ({
        user_id,
        account_id: a.id,
        asset_key: a.assetKey,
        label: a.label,
        current_value: a.currentValue,
        currency: a.currency,
        user_date: toDateOnly(user_date),
    }))

    const {error} = await supabase.from("user_liquidity_account_history")
        .upsert(rows, {onConflict: "user_id,account_id,user_date"})
    if (error) console.error("liquidityAccounts.snapshotAccountsForUser: failed to upsert history rows", error)
}

type AccountHistoryRow = {
    id: number
    account_id: number | null
    asset_key: LiquidityAccountAssetKey
    label: string
    current_value: number
    currency: string
    user_date: string
    recorded_at: string
}

const ACCOUNT_HISTORY_SELECT = [
    "id", "account_id", "asset_key", "label", "current_value", "currency", "user_date", "recorded_at",
].join(", ")

function toAccountHistory(row: AccountHistoryRow) {
    return {
        id: row.id,
        accountId: row.account_id,
        assetKey: row.asset_key,
        label: row.label,
        currentValue: row.current_value,
        currency: row.currency,
        userDate: row.user_date,
        recordedAt: row.recorded_at,
    }
}

/**
 * Reads the user's liquidity account history, newest first. `userDate` (exact
 * match) takes precedence over `months` (a lookback window) when both are
 * given. No per-month dedup needed beyond that - the unique
 * (user_id, account_id, user_date) index guarantees at most one row per
 * account per month.
 */
async function getAccountHistoryByUserId(user_id: string, months?: number, userDate?: Date) {
    let request = supabase.from("user_liquidity_account_history")
        .select(ACCOUNT_HISTORY_SELECT)
        .eq("user_id", user_id)
        .order("user_date", {ascending: false})
        .order("recorded_at", {ascending: false})

    if (userDate !== undefined) {
        request = request.eq("user_date", toDateOnly(userDate))
    } else if (months !== undefined) {
        const cutoff = ExtDate.fromNow()
        cutoff.moveByMonths(-months)
        request = request.gte("user_date", toDateOnly(cutoff))
    }

    const {data, error} = await request
    if (error) console.error("liquidityAccounts.getAccountHistoryByUserId: failed to read history", error)
    if (error || !data) return []
    return (data as unknown as AccountHistoryRow[]).map(toAccountHistory)
}

export type AccountHistoryEntryInput = { currentValue: number }

// Same "not_found" vs "db_error" split as investments.upsertHoldingHistoryEntry
// (see that function's comment) - a schema issue here (e.g. the unique index
// on (user_id, account_id, user_date) being missing/wrong) must surface as a
// 500 with the real Postgres error, not blend into an innocuous-looking
// "account not found" 400 that hides a systemic failure.
export type UpsertAccountHistoryResult =
    | {status: "not_found"}
    | {status: "db_error"; message: string}
    | {status: "ok"; entry: ReturnType<typeof toAccountHistory>}

/**
 * Backfills/updates a single liquidity account's value for a specific month,
 * scoped to the owning user. Denormalizes the live account's label/asset_key
 * (same shape snapshotAccountsForUser already writes).
 */
async function upsertAccountHistoryEntry(
    user_id: string, account_id: number, user_date: Date, input: AccountHistoryEntryInput,
): Promise<UpsertAccountHistoryResult> {
    const {data: accountRow, error: accountErr} = await supabase.from("user_liquidity_accounts")
        .select(ACCOUNT_SELECT).eq("user_id", user_id).eq("id", account_id).maybeSingle()
    if (accountErr) {
        console.error("liquidityAccounts.upsertAccountHistoryEntry: failed to read account", accountErr)
        return {status: "db_error", message: accountErr.message}
    }
    if (!accountRow) return {status: "not_found"}

    const account = toAccount(accountRow as unknown as AccountRow)
    const row = {
        user_id,
        account_id,
        asset_key: account.assetKey,
        label: account.label,
        current_value: input.currentValue,
        currency: account.currency,
        user_date: toDateOnly(user_date),
    }

    const {data, error} = await supabase.from("user_liquidity_account_history")
        .upsert(row, {onConflict: "user_id,account_id,user_date"})
        .select(ACCOUNT_HISTORY_SELECT)
        .single()
    if (error) {
        console.error("liquidityAccounts.upsertAccountHistoryEntry: failed to upsert history row", error)
        return {status: "db_error", message: error.message}
    }
    if (!data) return {status: "db_error", message: "upsert returned no row"}
    return {status: "ok", entry: toAccountHistory(data as unknown as AccountHistoryRow)}
}

export default {
    LIQUIDITY_ACCOUNT_ASSET_KEYS,
    getAccountsByUserId,
    insertAccount,
    updateAccount,
    deleteAccount,
    snapshotAccountsForUser,
    getAccountHistoryByUserId,
    upsertAccountHistoryEntry,
}
