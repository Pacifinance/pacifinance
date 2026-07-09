/**
 * Money arithmetic utilities that avoid IEEE-754 floating point drift when
 * summing many decimal amounts (e.g. balance sub-fields, transaction rows).
 *
 * No dependencies on purpose - db model files (server/src/db/models/*.ts) can
 * import this directly without going through server/src/routes/common.ts,
 * which itself depends on db/db.ts (would otherwise create a circular
 * require). Mirrored in src/utils/money.ts for the frontend - keep both in
 * sync, same convention as MockAuthContext.tsx mirroring UserContext.tsx.
 */

/**
 * Rounds a currency value to the second decimal digit. Never rounds up
 * beyond the input value (e.g. 12.349 -> 12.34, not 12.35).
 * @param n Currency value
 * @returns Rounded currency value
 */
export function roundCurrency(n: number) {
    if (n === undefined || isNaN(n)) return 0
    // Round to the second decimal digit
    let r = +n.toFixed(2) // toFixed() returns a string, but with the + in front it becomes a number
    // If the rounding was of the 'ceiling' type, make it 'floor'
    if (r > n) r -= 0.01
    // Round again to the second decimal digit to account for floating point shenanigans
    return +r.toFixed(2)
}

/**
 * Converts a currency value to integer cents. Values are first passed through
 * roundCurrency so the scaling always starts from a "clean" 2-decimal number
 * (Math.round below only has to absorb the *100 float noise, not real
 * rounding decisions).
 * @param n Currency value
 * @returns Integer number of cents
 */
export function toCents(n: number) {
    return Math.round(roundCurrency(n) * 100)
}

/**
 * Converts integer cents back to a currency value.
 * @param cents Integer number of cents
 * @returns Currency value
 */
export function fromCents(cents: number) {
    return cents / 100
}

/**
 * Sums any number of currency values in integer-cents space, so repeated
 * addition never accumulates floating point drift.
 * @param amounts Currency values to sum
 * @returns Rounded sum
 */
export function addCurrency(...amounts: number[]) {
    return fromCents(amounts.reduce((sum, n) => sum + toCents(n), 0))
}
