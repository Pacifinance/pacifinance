import type { TransactionPurpose } from '../types/transaction';
import { isTransactionPurpose } from '../types/transaction';

export const INVESTMENT_CATEGORY_INDEX = 8;
export const TAX_CATEGORY_INDEX = 10;

export const inferTransactionPurpose = (
  direction: 'income' | 'outflow',
  categoryIndex: number,
  explicitPurpose?: unknown,
): TransactionPurpose => {
  if (isTransactionPurpose(explicitPurpose)) return explicitPurpose;
  if (direction === 'income') return 'income';
  if (categoryIndex === INVESTMENT_CATEGORY_INDEX) return 'investment';
  if (categoryIndex === TAX_CATEGORY_INDEX) return 'tax';
  return 'expense';
};

export const isSpendingPurpose = (purpose: TransactionPurpose): boolean =>
  purpose === 'expense' || purpose === 'tax';
