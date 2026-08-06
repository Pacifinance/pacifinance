export const TRANSACTION_PURPOSES = [
  'income',
  'expense',
  'investment',
  'transfer',
  'debt',
  'tax',
  'refund',
  'other',
] as const;

export type TransactionPurpose = typeof TRANSACTION_PURPOSES[number];

export const isTransactionPurpose = (value: unknown): value is TransactionPurpose =>
  typeof value === 'string' && (TRANSACTION_PURPOSES as readonly string[]).includes(value);
