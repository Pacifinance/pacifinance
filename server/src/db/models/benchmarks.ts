import supabase from "../supabase"
import { ExtDate } from "../../libs/datelib"

export type BenchmarkMetricRow = {
    userId: string,
    balanceTotal: number | null,
    assetAllocation: AssetAllocation | null,
    monthlyIncome: number | null,
    monthlyExpenses: number | null,
    yearlyIncome: number | null,
    yearlyExpenses: number | null,
    yearlyExpensesByCategory: Record<number, number>
}

export type AssetAllocation = {
    liquid: number,
    investments: number,
    crypto: number
}

function numberOrNull(value: unknown) {
    return value === null || value === undefined ? null : Number(value)
}

/**
 * Loads the compact numeric source rows used to calculate every community
 * benchmark. It deliberately returns no transaction-level data.
 */
async function getMetricRows(userIds: string[], currentMonth: ExtDate): Promise<BenchmarkMetricRow[]> {
    if (userIds.length === 0) return []
    const p_current_month = `${currentMonth.getUTCFullYear()}-${String(currentMonth.getUTCMonth() + 1).padStart(2, "0")}-01`
    const {data, error} = await supabase.rpc("get_benchmark_metric_rows", {
        p_user_ids: userIds,
        p_current_month
    })
    if (error) console.error("benchmarks.getMetricRows: get_benchmark_metric_rows RPC failed", error)
    if (error || !data) return []

    return (data as any[]).map((row) => {
        const rawCategories = row.yearly_expenses_by_category && typeof row.yearly_expenses_by_category === "object"
            ? row.yearly_expenses_by_category as Record<string, unknown>
            : {}
        const yearlyExpensesByCategory = Object.entries(rawCategories).reduce((result, [index, total]) => {
            result[Number(index)] = Number(total)
            return result
        }, {} as Record<number, number>)

        return {
            userId: row.user_id as string,
            balanceTotal: numberOrNull(row.balance_total),
            assetAllocation: row.asset_allocation && typeof row.asset_allocation === "object"
                ? {
                    liquid: Number(row.asset_allocation.liquid ?? 0),
                    investments: Number(row.asset_allocation.investments ?? 0),
                    crypto: Number(row.asset_allocation.crypto ?? 0)
                }
                : null,
            monthlyIncome: numberOrNull(row.monthly_income),
            monthlyExpenses: numberOrNull(row.monthly_expenses),
            yearlyIncome: numberOrNull(row.yearly_income),
            yearlyExpenses: numberOrNull(row.yearly_expenses),
            yearlyExpensesByCategory
        }
    })
}

export default { getMetricRows }
