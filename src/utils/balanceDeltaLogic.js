/**
 * Pure helpers for balance delta computations used by insert / edit / delete
 * transaction flows. These functions intentionally have no React or service
 * dependencies so they can be unit-tested in isolation.
 */

/**
 * Check whether an ISO date string (YYYY-MM-DD) belongs to a month strictly
 * before the current month/year.
 *
 * @param {string} isoDate - ISO date string.
 * @param {Date} [now=new Date()] - Reference "now" (injectable for tests).
 * @returns {boolean}
 */
export const isPastMonthDate = (isoDate, now = new Date()) => {
  if (!isoDate) return false;
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return false;
  if (d.getFullYear() < now.getFullYear()) return true;
  if (d.getFullYear() > now.getFullYear()) return false;
  return d.getMonth() < now.getMonth();
};

/**
 * Two ISO dates belong to the same calendar month (and year).
 */
export const isSameMonth = (a, b) => {
  if (!a || !b) return false;
  const da = new Date(a);
  const db = new Date(b);
  if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return false;
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth();
};

/**
 * Threshold below which a currency delta is treated as zero (floating point
 * tolerance for half-a-cent). 0.005 matches the rounding used elsewhere in
 * the app for EUR-stored values.
 */
export const AMOUNT_EPSILON = 0.005;

/**
 * Compute the signed deltas that must be applied to balance snapshots when
 * an existing transaction is edited.
 *
 * Sign convention:
 *   - Outflow: deleting the old entry refunds the wallet (+old),
 *     applying the new entry charges the wallet (-new).
 *   - Income:  deleting the old entry removes the credit (-old),
 *     applying the new entry credits the wallet (+new).
 *
 * When the edit stays within the same month, the two effects are netted
 * into a single delta on that month. Otherwise two separate deltas are
 * returned: one reversing the old month, one applying the new month.
 *
 * @param {object} params
 * @param {boolean} params.isOutflow
 * @param {string}  params.oldDate - ISO date of the original transaction.
 * @param {number}  params.oldAmount - Original amount in EUR.
 * @param {string}  params.newDate - ISO date of the edited transaction.
 * @param {number}  params.newAmount - Edited amount in EUR.
 * @returns {Array<{month: string, value: number}>}
 *   Deltas with non-zero value. Empty array if nothing changed.
 */
export const computeEditDeltas = ({
  isOutflow,
  oldDate,
  oldAmount,
  newDate,
  newAmount,
}) => {
  const oldAmt = Number(oldAmount) || 0;
  const newAmt = Number(newAmount) || 0;
  const oldSign = isOutflow ? +1 : -1; // reversing the old transaction
  const newSign = isOutflow ? -1 : +1; // applying the new transaction
  const sameMonth = isSameMonth(oldDate, newDate);

  if (sameMonth) {
    const net = oldSign * oldAmt + newSign * newAmt;
    if (Math.abs(net) < AMOUNT_EPSILON) return [];
    return [{ month: newDate, value: net }];
  }

  const out = [];
  const oldVal = oldSign * oldAmt;
  const newVal = newSign * newAmt;
  if (Math.abs(oldVal) >= AMOUNT_EPSILON) out.push({ month: oldDate, value: oldVal });
  if (Math.abs(newVal) >= AMOUNT_EPSILON) out.push({ month: newDate, value: newVal });
  return out;
};

/**
 * Determine whether an edit requires any balance update.
 * Returns true if the amount changed (above epsilon) or if the month changed.
 */
export const editNeedsBalanceUpdate = ({
  oldDate,
  oldAmount,
  newDate,
  newAmount,
}) => {
  const oldAmt = Number(oldAmount) || 0;
  const newAmt = Number(newAmount) || 0;
  const amountChanged = Math.abs(oldAmt - newAmt) >= AMOUNT_EPSILON;
  const monthChanged = !isSameMonth(oldDate, newDate);
  return amountChanged || monthChanged;
};
