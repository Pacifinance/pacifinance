import { describe, expect, it } from "vitest"

import { roundCurrency, toCents, fromCents, addCurrency } from "../src/libs/money"

describe("server money helpers", () => {
    it("rounds currency down to two decimals, matching the legacy roundCurrency semantics", () => {
        expect(roundCurrency(12.349)).toBe(12.34)
        expect(roundCurrency(12.341)).toBe(12.34)
        expect(roundCurrency(Number.NaN)).toBe(0)
    })

    it("converts to/from integer cents without float noise", () => {
        expect(toCents(12.34)).toBe(1234)
        expect(toCents(0.1)).toBe(10)
        expect(toCents(1.005)).toBe(100) // roundCurrency floors 1.005 -> 1.00, same as before
        expect(fromCents(1234)).toBe(12.34)
    })

    it("sums many decimal amounts without accumulating IEEE-754 drift", () => {
        // The classic float trap: 0.1 + 0.2 !== 0.3 in plain JS arithmetic.
        expect(0.1 + 0.2).not.toBe(0.3)
        expect(addCurrency(0.1, 0.2)).toBe(0.3)

        // Summing many small amounts repeatedly stays exact.
        const amounts = Array(20).fill(0.05)
        expect(addCurrency(...amounts)).toBe(1)
    })

    it("supports negative amounts (e.g. subtracting a limit from a total)", () => {
        expect(addCurrency(10.5, -3.2)).toBe(7.3)
    })
})
