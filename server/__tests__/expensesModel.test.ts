import { describe, expect, it, vi } from "vitest"

vi.mock("../src/db/supabase", () => ({ default: {} }))

import { buildRecentMonthReferences } from "../src/db/models/expenses"

describe("expenses monthly buckets", () => {
    it("does not duplicate or skip short months when today is month-end", () => {
        const refs = buildRecentMonthReferences(new Date("2026-07-31T12:00:00.000Z"), 6)
        const keys = refs.map((date) => date.toISOString().slice(0, 7))

        expect(keys).toEqual(["2026-07", "2026-06", "2026-05", "2026-04", "2026-03", "2026-02"])
        expect(new Set(keys).size).toBe(keys.length)
    })
})
