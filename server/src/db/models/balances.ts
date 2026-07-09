import supabase from "../supabase"

import { ExtDate } from "../../libs/datelib"
import { addCurrency } from "../../libs/money"

const BALANCE_COLUMNS = "recorded_at, user_date, bank, cash, digital_services, stocks, etf, bitcoin, crypto, bonds, funds, gold, emergency_fund"

type BalanceRow = {
    recorded_at: string
    user_date: string
    bank: number, cash: number, digital_services: number, stocks: number, etf: number,
    bitcoin: number, crypto: number, bonds: number, funds: number, gold: number, emergency_fund: number
}

/**
 * Formats a date as a UTC "YYYY-MM-DD" string, matching the "date" column
 * granularity. Built from explicit UTC getters (not toISOString().split)
 * to avoid the UTC-midnight/local-timezone shift bug.
 */
function toDateOnly(d: Date) {
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, "0")
    const day = String(d.getUTCDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
}

function toBalance(row: BalanceRow) {
    return {
        date: row.recorded_at,
        userDate: row.user_date,
        bank: row.bank, cash: row.cash, digitalServices: row.digital_services,
        stocks: row.stocks, etf: row.etf, bitcoin: row.bitcoin, crypto: row.crypto,
        bonds: row.bonds, funds: row.funds, gold: row.gold, emergencyFund: row.emergency_fund
    }
}

/* ==================== Specific queries ==================== */

/**
 * Adds a balance associated to a user
 * @param user_id uuid of the user
 * @param user_date Month and year inserted by the user
 * @param bank Bank amount
 * @param cash Cash amount
 * @param digital_services Amount on digital services platforms
 * @param stocks Stocks amount
 * @param etf Etf amount
 * @param bitcoin Bitcoin amount
 * @param crypto Crypto amount
 * @param bonds Bonds amount
 * @param funds Funds amount
 * @param gold Gold amount
 * @param emergency_fund Emergency fund amount
 * @returns Balance document, or null in case of error
 */
async function insertNew(
    user_id: string, user_date: Date, bank: number, cash: number, digital_services: number,
    stocks: number, etf: number, bitcoin: number, crypto: number, bonds: number,
    funds: number, gold: number, emergency_fund: number
) {
    const {data, error} = await supabase.from("balances").insert({
        user_id,
        user_date: toDateOnly(new ExtDate(user_date)),
        bank, cash, digital_services: digital_services, stocks, etf, bitcoin, crypto,
        bonds, funds, gold, emergency_fund: emergency_fund
    }).select(BALANCE_COLUMNS).single()
    if (error) console.error("balances.insertNew: failed to insert balance", error)
    if (error || !data) return null
    return toBalance(data)
}

/**
 * Checks if there are balances associated to a user
 * @param user_id uuid of the user
 * @returns true if there are balances associated to the user, false otherwise
 */
async function balancesExistByUserId(user_id: string) {
    const {data} = await supabase.from("balances").select("id").eq("user_id", user_id).limit(1).maybeSingle()
    return data !== null
}

/**
 * Gets all the balances of a user, sorted by user-inserted date
 * @param user_id uuid of the user
 * @returns List of Balance documents
 */
async function getAllByUserId(user_id: string) {
    const {data, error} = await supabase.from("balances")
        .select(BALANCE_COLUMNS)
        .eq("user_id", user_id)
        .order("user_date", {ascending: true})
    if (error) console.error("balances.getAllByUserId: failed to read balances", error)
    if (error || !data) return null
    return data.map(toBalance)
}

/**
 * Gets the latest balance of a user
 * @param user_id uuid of the user
 * @param limit_date Exclusive upper bound (day granularity): balances on or after this date are ignored
 * @returns Balance document
 */
async function getLatestByUserId(user_id: string, limit_date: ExtDate | undefined = undefined) {
    const limit = limit_date !== undefined ? limit_date : ExtDate.fromNow()
    const {data, error} = await supabase.from("balances")
        .select(BALANCE_COLUMNS)
        .eq("user_id", user_id)
        .lt("user_date", toDateOnly(limit))
        .order("user_date", {ascending: false})
        .order("recorded_at", {ascending: false})
        .limit(1)
        .maybeSingle()
    if (error) console.error("balances.getLatestByUserId: failed to read latest balance", error)
    if (error || !data) return null
    return toBalance(data)
}

/**
 * Gets the latest balance of a user and sums all its parts together
 * @param user_id uuid of the user
 * @param limit_date Date after which balances are ignored
 * @return Total balance of the user
 */
async function getTotalLatestByUserId(user_id: string, limit_date: ExtDate | undefined = undefined) {
    const balance = await getLatestByUserId(user_id, limit_date)
    if (balance === null)
        return null
    return addCurrency(
        balance.bank, balance.cash, balance.digitalServices, balance.stocks,
        balance.etf, balance.bitcoin, balance.crypto, balance.bonds, balance.funds,
        balance.gold
    )
}

/**
 * Number of whole calendar months between two dates (UTC), `to` minus `from`.
 */
function monthsBetween(from: ExtDate, to: ExtDate) {
    return (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth())
}

/**
 * Gets one balance snapshot per month (the most recent entry inserted in
 * that month) for a user, as a single aggregate query (get_balance_history
 * RPC) instead of one query per month.
 * @param user_id uuid of the user
 * @param months Number of months back to include (e.g. 24), or undefined for the entire history
 * @returns List of {date, balance} newest-first; months with no entry get an empty balance {}
 */
async function getBalanceHistoryByUserId(user_id: string, months?: number) {
    const {data, error} = await supabase.rpc("get_balance_history", {
        p_user_id: user_id,
        p_months: months ?? null
    })
    if (error) console.error("balances.getBalanceHistoryByUserId: get_balance_history RPC failed", error)
    if (error || !data) return []

    const rows = data as (BalanceRow & {month_start: string})[]
    const byMonth = new Map<string, BalanceRow>()
    for (const row of rows)
        byMonth.set(row.month_start.slice(0, 7), row) // "YYYY-MM"

    const thisMonthStart = ExtDate.fromThisMonthStart()

    // How many months to emit: the requested window, or (for "all time") from
    // the earliest month actually present in the data (rows are newest-first).
    let span: number
    if (months !== undefined)
        span = months
    else if (rows.length === 0)
        span = 0
    else
        span = monthsBetween(new ExtDate(rows[rows.length - 1].month_start), thisMonthStart) + 1

    const balances = []
    const cursor = thisMonthStart.copy()
    for (let i = 0; i < span; i++) {
        const key = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}`
        const row = byMonth.get(key)
        balances.push({date: cursor.copy(), balance: row ? toBalance(row) : {}})
        cursor.moveByMonths(-1)
    }
    return balances
}

/**
 * Gets {userId, total} pairs for the balance-ranking pool (all users, or only
 * those "similar" to reference_user_id) via a single aggregate query
 * (get_balance_ranking_pool RPC) instead of one balance query per user.
 * @param reference_user_id uuid to restrict to "similar" users, or undefined for everyone
 * @param ignore_test_demo Exclude test/demo accounts from the pool
 */
async function getRankingPool(reference_user_id?: string, ignore_test_demo: boolean = true) {
    const {data, error} = await supabase.rpc("get_balance_ranking_pool", {
        p_reference_user: reference_user_id ?? null,
        p_ignore_test_demo: ignore_test_demo
    })
    if (error) console.error("balances.getRankingPool: get_balance_ranking_pool RPC failed", error)
    if (error || !data) return []
    return (data as any[]).map((row) => ({userId: row.user_id as string, total: Number(row.total_balance)}))
}

export default {
    insertNew,
    balancesExistByUserId,
    getAllByUserId,
    getLatestByUserId,
    getTotalLatestByUserId,
    getBalanceHistoryByUserId,
    getRankingPool
};
