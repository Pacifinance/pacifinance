import { describe, expect, it } from 'vitest';
import { inferTransactionPurpose, isSpendingPurpose } from '../../utils/transactionPurpose';

describe('transactionPurpose', () => {
  it('does not infer a transfer from ambiguous outflow data', () => {
    expect(inferTransactionPurpose('outflow', 2)).toBe('expense');
  });

  it('classifies the established investment category as investment', () => {
    expect(inferTransactionPurpose('outflow', 8)).toBe('investment');
  });

  it('classifies the established tax category separately from consumption', () => {
    expect(inferTransactionPurpose('outflow', 10)).toBe('tax');
  });

  it('classifies incoming movements as income by default', () => {
    expect(inferTransactionPurpose('income', 8)).toBe('income');
  });

  it('preserves an explicit valid purpose', () => {
    expect(inferTransactionPurpose('outflow', 2, 'transfer')).toBe('transfer');
  });

  it('counts expenses and taxes as spending but excludes investments and transfers', () => {
    expect(isSpendingPurpose('expense')).toBe(true);
    expect(isSpendingPurpose('tax')).toBe(true);
    expect(isSpendingPurpose('investment')).toBe(false);
    expect(isSpendingPurpose('transfer')).toBe(false);
  });
});
