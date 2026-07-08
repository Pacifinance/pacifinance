import { describe, expect, it } from "vitest"

import common from "../src/routes/common"
import { mockDb } from "./setup"

describe("server common helpers", () => {
    it("rounds currency down to two decimals", () => {
        expect(common.roundCurrency(12.349)).toBe(12.34)
        expect(common.roundCurrency(12.341)).toBe(12.34)
        expect(common.roundCurrency(Number.NaN)).toBe(0)
    })

    it("sanitizes blank, missing, and tagged input", () => {
        expect(common.sanitizeInput(undefined as unknown as string)).toBe("")
        expect(common.sanitizeInput(null as unknown as string)).toBe("")
        expect(common.sanitizeInput("  <b>Hello</b>  ")).toBe("Hello")
    })

    it("generates padded user ids and retries collisions", async () => {
        mockDb.users.userCodeExists
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(false)

        const userId = await common.generateUserId(6)

        expect(userId).toMatch(/^\d{6}$/)
        expect(mockDb.users.userCodeExists).toHaveBeenCalledTimes(2)
    })
})
