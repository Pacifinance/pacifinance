import crypto from "crypto"

import db from "../db/db"
import { roundCurrency, toCents, fromCents, addCurrency } from "../libs/money"

export { roundCurrency, toCents, fromCents, addCurrency }

/**
 * Sanitizes user input by removing blank spaces and HTML tags
 * @param data Data to sanitize
 * @returns Sanitized data
 */
// No sanitized field (names, notes, tags...) legitimately needs to be
// longer than this; capping the scan bound to a fixed constant (rather than
// the raw, attacker-controlled string length) is what static analysis wants
// to see to rule out an unbounded-iteration DoS.
const MAX_SANITIZE_LENGTH = 10_000

/**
 * Strips every "<...>" span with a single-pass character scan instead of a
 * regex - a regex like /<[^>]*>/g both lets nested tags survive a single
 * pass (e.g. "<<script>script>" -> "<script>") and is the kind of
 * user-controlled-input pattern static analysis flags as a possible ReDoS
 * regardless of looping. This is O(n), no backtracking possible because
 * there's no regex engine involved at all.
 */
function stripTags(input: string): string {
    const bounded = input.length > MAX_SANITIZE_LENGTH ? input.slice(0, MAX_SANITIZE_LENGTH) : input
    let result = ""
    let depth = 0
    for (let i = 0; i < bounded.length; i++) {
        const char = bounded[i]
        if (char === "<") { depth++; continue }
        if (char === ">") { if (depth > 0) depth--; continue }
        if (depth === 0) result += char
    }
    return result
}

function sanitizeInput(data: string) {
    if (data === undefined || data === null) return ""
    // Remove empty spaces
    const trimmed = String(data).trim()
    // Return the sanitized input
    return stripTags(trimmed)
}

/**
 * Type-narrowing membership check against a readonly list of allowed values.
 * @param value Value to check
 * @param allowed Readonly tuple of allowed string values
 * @returns true (narrowing `value` to the tuple's union type) if allowed
 */
export function isOneOf<T extends readonly string[]>(value: string, allowed: T): value is T[number] {
    return (allowed as readonly string[]).includes(value)
}

/**
 * Normalizes a user-provided currency code to a 3-letter uppercase ISO code,
 * falling back to EUR for anything malformed.
 * @param value Raw currency input
 * @returns Normalized 3-letter currency code
 */
export function normalizeCurrency(value: unknown) {
    const currency = sanitizeInput(String(value ?? "EUR")).toUpperCase()
    return /^[A-Z]{3}$/.test(currency) ? currency : "EUR"
}

/**
 * Adds zeros to the left of a string until the desired string length is reached
 * @param s The string to pad
 * @param nCharacters Desired total length of the string after padding
 * @returns Padded string
 */
function padLeftWithZeros(s: string, nCharacters: number) {
    if (s.length >= nCharacters)
        return s
    return new Array(nCharacters - s.length + 1).join('0') + s
}

/**
 * Generates a random unique user ID. Checks each candidate against the
 * `user_code` unique index (a single indexed lookup) instead of fetching
 * every existing user ID, so cost doesn't grow with the user base.
 * @param nDigits Number of digits of the user ID
 * @returns A new user ID
 */
async function generateUserId(nDigits: number) {
    let user_id = ""
    do {
        user_id = String(crypto.randomInt(0, 10 ** nDigits))
        user_id = padLeftWithZeros(user_id, nDigits)
    } while (await db.users.userCodeExists(user_id))
    return user_id
}

export default {
    roundCurrency,
    toCents,
    fromCents,
    addCurrency,
    sanitizeInput,
    isOneOf,
    normalizeCurrency,
    generateUserId,
}
