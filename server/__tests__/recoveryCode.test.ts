import { describe, expect, it } from "vitest"

import { WORDLIST, generateRecoveryCode, hashRecoveryCode, parseRecoveryCodeInput } from "../src/db/recoveryCode"

describe("recoveryCode", () => {
    it("has exactly 256 unique words", () => {
        expect(WORDLIST).toHaveLength(256)
        expect(new Set(WORDLIST).size).toBe(256)
    })

    it("generates a 16-character grouped block code and a 10-word phrase", () => {
        const code = generateRecoveryCode()
        expect(code.bytes).toHaveLength(10)
        expect(code.base32).toMatch(/^[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/)
        expect(code.words.split("-")).toHaveLength(10)
        for (const word of code.words.split("-")) expect(WORDLIST).toContain(word)
    })

    it("never generates ambiguous Base32 characters (I, L, O, U)", () => {
        for (let i = 0; i < 200; i++) {
            const code = generateRecoveryCode()
            expect(code.base32).not.toMatch(/[ILOU]/)
        }
    })

    it("parses its own block-code output back to the original bytes", () => {
        const code = generateRecoveryCode()
        const parsed = parseRecoveryCodeInput(code.base32)
        expect(parsed).not.toBeNull()
        expect(parsed!.equals(code.bytes)).toBe(true)
    })

    it("parses its own word-phrase output back to the original bytes", () => {
        const code = generateRecoveryCode()
        const parsed = parseRecoveryCodeInput(code.words)
        expect(parsed).not.toBeNull()
        expect(parsed!.equals(code.bytes)).toBe(true)
    })

    it("is tolerant of formatting when parsing a block code (lowercase, no dashes, extra spaces)", () => {
        const code = generateRecoveryCode()
        const messy = code.base32.toLowerCase().replace(/-/g, " ")
        const parsed = parseRecoveryCodeInput(messy)
        expect(parsed!.equals(code.bytes)).toBe(true)
    })

    it("is tolerant of formatting when parsing a word phrase (uppercase, extra whitespace)", () => {
        const code = generateRecoveryCode()
        const messy = code.words.split("-").join("   ").toUpperCase()
        const parsed = parseRecoveryCodeInput(messy)
        expect(parsed!.equals(code.bytes)).toBe(true)
    })

    it("returns null for malformed input", () => {
        expect(parseRecoveryCodeInput("")).toBeNull()
        expect(parseRecoveryCodeInput("not-a-valid-code")).toBeNull()
        expect(parseRecoveryCodeInput("ABCD-EFGH-JKMN")).toBeNull() // too short
        expect(parseRecoveryCodeInput(`${"tiger-".repeat(9)}notaword`)).toBeNull()
    })

    it("hashes deterministically and produces a 64-char hex sha256", () => {
        const code = generateRecoveryCode()
        const hash1 = hashRecoveryCode(code.bytes)
        const hash2 = hashRecoveryCode(code.bytes)
        expect(hash1).toBe(hash2)
        expect(hash1).toMatch(/^[0-9a-f]{64}$/)
    })

    it("produces different hashes for different codes", () => {
        const a = generateRecoveryCode()
        const b = generateRecoveryCode()
        expect(hashRecoveryCode(a.bytes)).not.toBe(hashRecoveryCode(b.bytes))
    })
})
