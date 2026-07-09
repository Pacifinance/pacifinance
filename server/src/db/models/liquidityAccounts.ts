import supabase from "../supabase"
import { ExtDate } from "../../libs/datelib"

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
 * Formats a date as a UTC "YYYY-MM-DD" string, matching the "user_date" column
 * granularity (same helper as server/src/db/models/balances.ts::toDateOnly).
 */
function toDateOnly(d: Date) {
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, "0")
    const day = String(d.getUTCDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
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

    const {error} = await supabase.from("user_liquidity_account_history").insert(rows)
    if (error) console.error("liquidityAccounts.snapshotAccountsForUser: failed to insert history rows", error)
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
 * Reads the user's liquidity account history, newest first. `months`
 * optionally limits how far back to look (by user_date). No per-month dedup
 * RPC yet — no chart/analysis consumer exists for this data yet.
 */
async function getAccountHistoryByUserId(user_id: string, months?: number) {
    let request = supabase.from("user_liquidity_account_history")
        .select(ACCOUNT_HISTORY_SELECT)
        .eq("user_id", user_id)
        .order("user_date", {ascending: false})
        .order("recorded_at", {ascending: false})

    if (months !== undefined) {
        const cutoff = ExtDate.fromNow()
        cutoff.moveByMonths(-months)
        request = request.gte("user_date", toDateOnly(cutoff))
    }

    const {data, error} = await request
    if (error) console.error("liquidityAccounts.getAccountHistoryByUserId: failed to read history", error)
    if (error || !data) return []
    return (data as unknown as AccountHistoryRow[]).map(toAccountHistory)
}

export default {
    LIQUIDITY_ACCOUNT_ASSET_KEYS,
    getAccountsByUserId,
    insertAccount,
    updateAccount,
    deleteAccount,
    snapshotAccountsForUser,
    getAccountHistoryByUserId,
}
