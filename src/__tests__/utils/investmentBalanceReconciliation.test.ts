import { describe, expect, it } from 'vitest';
import { reconcileInvestmentBalance } from '../../utils/investmentBalanceReconciliation';

describe('reconcileInvestmentBalance', () => {
  it('returns an empty exact reconciliation when there are no holdings', () => {
    expect(reconcileInvestmentBalance(0, [])).toEqual({
      declaredTotal: 0,
      detailedTotal: 0,
      unallocatedValue: 0,
      coveragePercent: 100,
      status: 'exact',
      holdingShares: [],
    });
  });

  it('reports over-allocation when the declared total is zero but holdings have value', () => {
    const result = reconcileInvestmentBalance(0, [{ currentValue: 50, investedAmount: 40 }]);
    expect(result.status).toBe('over-allocated');
    expect(result.unallocatedValue).toBe(-50);
    expect(result.coveragePercent).toBeNull();
    expect(result.holdingShares).toEqual([null]);
  });

  it('reports a positive unallocated value for holdings missing from the detail', () => {
    const result = reconcileInvestmentBalance(900, [
      { currentValue: 500, investedAmount: 400 },
      { currentValue: 206, investedAmount: 180 },
    ]);
    expect(result.detailedTotal).toBe(706);
    expect(result.unallocatedValue).toBe(194);
    expect(result.coveragePercent).toBeCloseTo(78.4444, 4);
    expect(result.status).toBe('unallocated');
  });

  it('reports over-allocation when holdings exceed the declared total', () => {
    const result = reconcileInvestmentBalance(650, [{ currentValue: 706, investedAmount: 600 }]);
    expect(result.unallocatedValue).toBe(-56);
    expect(result.coveragePercent).toBeCloseTo(108.61538, 4);
    expect(result.status).toBe('over-allocated');
  });

  it('treats differences below one cent as exact', () => {
    const result = reconcileInvestmentBalance(100, [{ currentValue: 99.995, investedAmount: 90 }]);
    expect(result.status).toBe('exact');
    expect(result.unallocatedValue).toBe(0);
  });

  it('calculates each holding share against the declared category total', () => {
    const result = reconcileInvestmentBalance(1000, [
      { currentValue: 250, investedAmount: 200 },
      { currentValue: null, investedAmount: 150 },
    ]);
    expect(result.holdingShares).toEqual([25, 15]);
  });
});
