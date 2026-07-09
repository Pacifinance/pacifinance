/**
 * Money arithmetic utilities that avoid IEEE-754 floating point drift when
 * summing many decimal amounts (e.g. balance sub-fields, multi-row inserts).
 *
 * Mirror of server/src/routes/common.ts (roundCurrency/toCents/fromCents/
 * addCurrency) - keep both in sync, same convention as MockAuthContext.tsx
 * mirroring UserContext.tsx.
 */

/**
 * Rounds a currency value to the second decimal digit. Never rounds up
 * beyond the input value (e.g. 12.349 -> 12.34, not 12.35), matching the
 * server's roundCurrency exactly.
 * @param n Currency value
 * @returns Rounded currency value
 */
export function roundCurrency(n: number): number {
  if (n === undefined || n === null || Number.isNaN(n)) return 0;
  let r = +n.toFixed(2);
  if (r > n) r -= 0.01;
  return +r.toFixed(2);
}

/**
 * Converts a currency value to integer cents. Values are first passed
 * through roundCurrency so the scaling always starts from a "clean"
 * 2-decimal number (Math.round below only has to absorb the *100 float
 * noise, not real rounding decisions).
 * @param n Currency value
 * @returns Integer number of cents
 */
export function toCents(n: number): number {
  return Math.round(roundCurrency(n) * 100);
}

/**
 * Converts integer cents back to a currency value.
 * @param cents Integer number of cents
 * @returns Currency value
 */
export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Sums any number of currency values in integer-cents space, so repeated
 * addition never accumulates floating point drift. Use this instead of
 * `values.reduce((a, b) => a + b, 0)` for money.
 * @param amounts Currency values to sum
 * @returns Rounded sum
 */
export function addCurrency(...amounts: number[]): number {
  return fromCents(amounts.reduce((sum, n) => sum + toCents(n), 0));
}
