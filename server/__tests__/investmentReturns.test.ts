import {describe, expect, it} from "vitest"
import {calculateTimeWeightedReturn, calculateXirr} from "../src/services/investmentReturns"

describe("investment return analytics", () => {
    it("computes an annualized money-weighted return from dated cash flows", () => {
        const result = calculateXirr([
            {date: "2025-01-01", amount: -1000},
            {date: "2026-01-01", amount: 1100}
        ])
        expect(result).not.toBeNull()
        expect(result as number).toBeCloseTo(10, 1)
    })

    it("does not claim a return when opposing cash flows are missing", () => {
        expect(calculateXirr([{date: "2025-01-01", amount: -1000}])).toBeNull()
    })

    it("removes monthly contributions from time-weighted performance", () => {
        const result = calculateTimeWeightedReturn([
            {month: "2025-01", value: 1000},
            {month: "2025-02", value: 1600},
            {month: "2025-03", value: 1760}
        ], new Map([["2025-02", 500], ["2025-03", 0]]))
        expect(result).toBeCloseTo(21, 5)
    })
})
