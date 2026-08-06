import supabase from "../supabase"
import {calculateTimeWeightedReturn, calculateXirr, type DatedCashFlow} from "../../services/investmentReturns"

export type InvestmentBenchmarkMetric = {
    userId: string
    observedMonths: number
    activeMonths: number
    consistencyPercent: number
    averageMonthlyContribution: number
    averageTransactionsPerActiveMonth: number
    moneyWeightedReturn: number | null
    timeWeightedReturn: number | null
}

type TransactionRow = {user_id: string; side: "buy" | "sell"; total: number | null; trade_date: string}
type HoldingRow = {user_id: string; current_value: number | null; invested_amount: number | null}
type HistoryRow = {user_id: string; holding_id: number | null; instrument_id: number; user_date: string; current_value: number | null}

async function getMetrics(userIds: string[], asOf = new Date()): Promise<InvestmentBenchmarkMetric[]> {
    if (userIds.length === 0) return []
    const since = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth() - 11, 1)).toISOString().slice(0, 10)
    const [transactionsResult, holdingsResult, historyResult] = await Promise.all([
        supabase.from("user_investment_transactions").select("user_id, side, total, trade_date").in("user_id", userIds),
        supabase.from("user_investment_holdings").select("user_id, current_value, invested_amount").in("user_id", userIds),
        supabase.from("user_investment_holding_history").select("user_id, holding_id, instrument_id, user_date, current_value").in("user_id", userIds).gte("user_date", since).order("user_date", {ascending: true})
    ])
    if (transactionsResult.error) console.error("investmentBenchmarks: transactions query failed", transactionsResult.error)
    if (holdingsResult.error) console.error("investmentBenchmarks: holdings query failed", holdingsResult.error)
    if (historyResult.error) console.error("investmentBenchmarks: history query failed", historyResult.error)

    const transactions = (transactionsResult.data ?? []) as TransactionRow[]
    const holdings = (holdingsResult.data ?? []) as HoldingRow[]
    const history = (historyResult.data ?? []) as HistoryRow[]
    return userIds.map((userId) => {
        const userTransactions = transactions.filter((row) => row.user_id === userId && row.total != null)
        const monthly = new Map<string, {contribution: number; count: number; netFlow: number}>()
        const cashFlows: DatedCashFlow[] = []
        for (const row of userTransactions) {
            const total = Math.abs(Number(row.total) || 0)
            cashFlows.push({date: row.trade_date, amount: row.side === "buy" ? -total : total})
            if (row.trade_date >= since) {
                const month = row.trade_date.slice(0, 7)
                const current = monthly.get(month) ?? {contribution: 0, count: 0, netFlow: 0}
                current.count++
                current.contribution += row.side === "buy" ? total : -total
                current.netFlow += row.side === "buy" ? total : -total
                monthly.set(month, current)
            }
        }
        const terminalValue = holdings.filter((row) => row.user_id === userId)
            .reduce((sum, row) => sum + Number(row.current_value ?? row.invested_amount ?? 0), 0)
        if (terminalValue > 0) cashFlows.push({date: asOf.toISOString().slice(0, 10), amount: terminalValue})
        const active = [...monthly.values()].filter((entry) => entry.contribution > 0)
        const latestByPositionMonth = new Map<string, HistoryRow>()
        for (const row of history.filter((entry) => entry.user_id === userId && entry.current_value != null)) {
            const month = row.user_date.slice(0, 7)
            latestByPositionMonth.set(`${row.holding_id ?? `instrument-${row.instrument_id}`}:${month}`, row)
        }
        const userHistory = new Map<string, number>()
        for (const row of latestByPositionMonth.values()) {
            const month = row.user_date.slice(0, 7)
            userHistory.set(month, (userHistory.get(month) ?? 0) + Number(row.current_value))
        }
        return {
            userId,
            observedMonths: 12,
            activeMonths: active.length,
            consistencyPercent: active.length / 12 * 100,
            averageMonthlyContribution: active.reduce((sum, entry) => sum + entry.contribution, 0) / 12,
            averageTransactionsPerActiveMonth: active.length ? active.reduce((sum, entry) => sum + entry.count, 0) / active.length : 0,
            moneyWeightedReturn: calculateXirr(cashFlows),
            timeWeightedReturn: calculateTimeWeightedReturn(
                [...userHistory].map(([month, value]) => ({month, value})),
                new Map([...monthly].map(([month, entry]) => [month, entry.netFlow]))
            )
        }
    })
}

export default {getMetrics}
