import { describe, expect, it } from "vitest"

import { computeRankOfUser, rankFromExpensePool } from "../src/services/ranking"

describe("ranking percentiles", () => {
    it("reserves zero for a user that is not present in the pool", () => {
        expect(computeRankOfUser([{user: "a"}], "missing")).toEqual({position: 0})
    })

    it("uses a one-based percentile for the best value", () => {
        const pool = Array.from({length: 100}, (_, index) => ({user: String(index)}))
        expect(computeRankOfUser(pool, "99")).toEqual({position: 1})
        expect(computeRankOfUser(pool, "0")).toEqual({position: 100})
    })

    it("ranks lower outflows as better without producing a valid zero percentile", () => {
        const pool = [
            {userId: "low", total: 100},
            {userId: "middle", total: 200},
            {userId: "high", total: 300}
        ]

        expect(rankFromExpensePool(pool, "low", true)).toBe(1)
        expect(rankFromExpensePool(pool, "high", true)).toBe(100)
        expect(rankFromExpensePool(pool, "missing", true)).toBe(0)
    })
})
