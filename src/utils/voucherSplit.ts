/**
 * Pure helper for fixed-denomination liquidity accounts (e.g. meal vouchers
 * issued in fixed units, Edenred-style at €8/voucher — see
 * user_liquidity_accounts.unit_value). A purchase can only draw whole
 * vouchers, never a fraction of one, so any amount that isn't an exact
 * multiple of the denomination (or that exceeds the account's available
 * balance) needs a second source for the remainder.
 */

export interface VoucherSplitResult {
  /** EUR portion covered by the fixed-denomination account — always a whole multiple of unitValue. */
  voucherAmount: number;
  /** EUR portion left over, to be paid from a fallback source. 0 = no split needed. */
  remainderAmount: number;
}

/** Floating-point tolerance for whole-unit division (e.g. 11.5 / 0.1). */
const EPSILON = 1e-9;

/**
 * Splits a purchase `amount` between a fixed-denomination account and a
 * fallback source. `voucherAmount` is capped by both the purchase amount and
 * the account's `availableBalance`, and is always a whole multiple of
 * `unitValue`. Invalid inputs (non-finite/non-positive amount or unitValue)
 * put the entire amount in `remainderAmount` — nothing is affordable from an
 * account with no valid denomination.
 */
export function computeVoucherSplit(
  amount: number,
  unitValue: number,
  availableBalance: number,
): VoucherSplitResult {
  const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;
  if (!Number.isFinite(unitValue) || unitValue <= 0) {
    return { voucherAmount: 0, remainderAmount: safeAmount };
  }

  const safeBalance = Number.isFinite(availableBalance) && availableBalance > 0 ? availableBalance : 0;
  const affordableUnits = Math.floor((safeBalance + EPSILON) / unitValue);
  const neededUnits = Math.floor((safeAmount + EPSILON) / unitValue);
  const units = Math.max(0, Math.min(affordableUnits, neededUnits));

  const voucherAmount = Math.round(units * unitValue * 100) / 100;
  const remainderAmount = Math.max(0, Math.round((safeAmount - voucherAmount) * 100) / 100);
  return { voucherAmount, remainderAmount };
}
