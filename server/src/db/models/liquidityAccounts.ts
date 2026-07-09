import supabase from "../supabase"

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

export default {
    LIQUIDITY_ACCOUNT_ASSET_KEYS,
    getAccountsByUserId,
    insertAccount,
    updateAccount,
    deleteAccount,
}
