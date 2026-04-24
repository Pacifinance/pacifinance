/**
 * Pure helpers for balance delta computations used by insert / edit / delete
 * transaction flows. These functions intentionally have no React or service
 * dependencies so they can be unit-tested in isolation.
 */

export interface BalanceDelta {
  /** ISO date identifying the month the delta applies to. */
  month: string;
  /** Signed amount in EUR. */
  value: number;
}

export interface ComputeEditDeltasParams {
  isOutflow: boolean;
  oldDate: string;
  oldAmount: number | string;
  newDate: string;
  newAmount: number | string;
}

export type EditNeedsBalanceUpdateParams = Omit<ComputeEditDeltasParams, 'isOutflow'>;

/**
 * Check whether an ISO date string (YYYY-MM-DD) belongs to a month strictly
 * before the current month/year.
 */
export const isPastMonthDate = (isoDate: string, now: Date = new Date()): boolean => {
  if (!isoDate) return false;
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return false;
  if (d.getFullYear() < now.getFullYear()) return true;
  if (d.getFullYear() > now.getFullYear()) return false;
  return d.getMonth() < now.getMonth();
};

/** Two ISO dates belong to the same calendar month (and year). */
export const isSameMonth = (a: string | Date, b: string | Date): boolean => {
  if (!a || !b) return false;
  const da = new Date(a);
  const db = new Date(b);
  if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return false;
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth();
};

/**
 * Threshold below which a currency delta is treated as zero (floating point
 * tolerance for half-a-cent).
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
 */
export const computeEditDeltas = ({
  isOutflow,
  oldDate,
  oldAmount,
  newDate,
  newAmount,
}: ComputeEditDeltasParams): BalanceDelta[] => {
  const oldAmt = Number(oldAmount) || 0;
  const newAmt = Number(newAmount) || 0;
  const oldSign = isOutflow ? +1 : -1;
  const newSign = isOutflow ? -1 : +1;
  const sameMonth = isSameMonth(oldDate, newDate);

  if (sameMonth) {
    const net = oldSign * oldAmt + newSign * newAmt;
    if (Math.abs(net) < AMOUNT_EPSILON) return [];
    return [{ month: newDate, value: net }];
  }

  const out: BalanceDelta[] = [];
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
}: EditNeedsBalanceUpdateParams): boolean => {
  const oldAmt = Number(oldAmount) || 0;
  const newAmt = Number(newAmount) || 0;
  const amountChanged = Math.abs(oldAmt - newAmt) >= AMOUNT_EPSILON;
  const monthChanged = !isSameMonth(oldDate, newDate);
  return amountChanged || monthChanged;
};
