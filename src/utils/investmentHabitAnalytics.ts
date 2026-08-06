import type { TransactionDto } from '../types/api';

export interface InvestmentHabitMetrics {
  observedMonths: number;
  activeMonths: number;
  consistencyPercent: number;
  transactionCount: number;
  averageMonthlyContribution: number;
  averageTransactionsPerActiveMonth: number;
  contributionVariabilityPercent: number | null;
}

export const calculateInvestmentHabitMetrics = (
  monthlyInvestments: TransactionDto[][] | null | undefined,
  observedMonths = 12,
): InvestmentHabitMetrics => {
  const months = Array.isArray(monthlyInvestments)
    ? monthlyInvestments.slice(0, Math.max(0, observedMonths))
    : [];
  const denominator = Math.max(0, Math.min(observedMonths, months.length));
  const monthlyTotals = months.map((entries) => (Array.isArray(entries) ? entries : [])
    .reduce((sum, entry) => sum + (Number(entry?.amount) || 0), 0));
  const activeTotals = monthlyTotals.filter((total) => total > 0);
  const transactionCount = months.reduce(
    (sum, entries) => sum + (Array.isArray(entries) ? entries.length : 0),
    0,
  );
  const total = activeTotals.reduce((sum, value) => sum + value, 0);
  const average = denominator > 0 ? total / denominator : 0;
  let variability: number | null = null;
  if (activeTotals.length >= 2) {
    const activeAverage = total / activeTotals.length;
    const variance = activeTotals.reduce((sum, value) => sum + (value - activeAverage) ** 2, 0) / activeTotals.length;
    variability = activeAverage > 0 ? (Math.sqrt(variance) / activeAverage) * 100 : null;
  }

  return {
    observedMonths: denominator,
    activeMonths: activeTotals.length,
    consistencyPercent: denominator > 0 ? (activeTotals.length / denominator) * 100 : 0,
    transactionCount,
    averageMonthlyContribution: average,
    averageTransactionsPerActiveMonth: activeTotals.length > 0 ? transactionCount / activeTotals.length : 0,
    contributionVariabilityPercent: variability,
  };
};
