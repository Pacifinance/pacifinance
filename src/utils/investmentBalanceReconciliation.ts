export interface ReconciliationHoldingValue {
  currentValue: number | null;
  investedAmount: number | null;
}

export type InvestmentBalanceReconciliationStatus = 'exact' | 'unallocated' | 'over-allocated';

export interface InvestmentBalanceReconciliation {
  declaredTotal: number;
  detailedTotal: number;
  unallocatedValue: number;
  coveragePercent: number | null;
  status: InvestmentBalanceReconciliationStatus;
  holdingShares: Array<number | null>;
}

const valueOf = (holding: ReconciliationHoldingValue): number =>
  Number(holding.currentValue ?? holding.investedAmount ?? 0) || 0;

export const reconcileInvestmentBalance = (
  declaredTotal: number,
  holdings: ReconciliationHoldingValue[],
): InvestmentBalanceReconciliation => {
  const safeDeclaredTotal = Number(declaredTotal) || 0;
  const values = holdings.map(valueOf);
  const detailedTotal = values.reduce((sum, value) => sum + value, 0);
  const rawDifference = safeDeclaredTotal - detailedTotal;
  const isExact = Math.abs(rawDifference) < 0.01;
  const unallocatedValue = isExact ? 0 : rawDifference;
  const coveragePercent = safeDeclaredTotal !== 0
    ? (detailedTotal / safeDeclaredTotal) * 100
    : detailedTotal === 0 ? 100 : null;

  return {
    declaredTotal: safeDeclaredTotal,
    detailedTotal,
    unallocatedValue,
    coveragePercent,
    status: isExact ? 'exact' : rawDifference > 0 ? 'unallocated' : 'over-allocated',
    holdingShares: values.map((value) => safeDeclaredTotal !== 0 ? (value / safeDeclaredTotal) * 100 : null),
  };
};
