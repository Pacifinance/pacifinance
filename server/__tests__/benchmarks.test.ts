import { describe, expect, it } from "vitest"

import benchmarks from "../src/db/models/benchmarks"
import { ExtDate } from "../src/libs/datelib"
import { mockSupabase } from "./setup"

describe("benchmark metric rows", () => {
    it("loads compact aggregate rows through one RPC and normalizes numeric JSON values", async () => {
        mockSupabase.rpc.mockResolvedValue({
            data: [{
                user_id: "user-a",
                balance_total: "1234.50",
                asset_allocation: {liquid: "40.5", investments: "54.5", crypto: "5"},
                monthly_income: "2500",
                monthly_expenses: null,
                yearly_income: "30000",
                yearly_expenses: "18000",
                yearly_expenses_by_category: {"3": "4200.25"}
            }],
            error: null
        })

        await expect(benchmarks.getMetricRows(["user-a"], new ExtDate("2026-07-01"))).resolves.toEqual([{
            userId: "user-a",
            balanceTotal: 1234.5,
            assetAllocation: {liquid: 40.5, investments: 54.5, crypto: 5},
            monthlyIncome: 2500,
            monthlyExpenses: null,
            yearlyIncome: 30000,
            yearlyExpenses: 18000,
            yearlyExpensesByCategory: {3: 4200.25}
        }])
        expect(mockSupabase.rpc).toHaveBeenCalledWith("get_benchmark_metric_rows", {
            p_user_ids: ["user-a"],
            p_current_month: "2026-07-01"
        })
    })

    it("does not query Supabase for an empty population", async () => {
        await expect(benchmarks.getMetricRows([], new ExtDate("2026-07-01"))).resolves.toEqual([])
        expect(mockSupabase.rpc).not.toHaveBeenCalled()
    })
})
