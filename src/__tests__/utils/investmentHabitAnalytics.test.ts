import { describe, expect, it } from 'vitest';
import { calculateInvestmentHabitMetrics } from '../../utils/investmentHabitAnalytics';

describe('calculateInvestmentHabitMetrics', () => {
  it('returns safe zero metrics without history', () => {
    expect(calculateInvestmentHabitMetrics(null)).toEqual({
      observedMonths: 0,
      activeMonths: 0,
      consistencyPercent: 0,
      transactionCount: 0,
      averageMonthlyContribution: 0,
      averageTransactionsPerActiveMonth: 0,
      contributionVariabilityPercent: null,
    });
  });

  it('measures monthly consistency and frequency independently from amount', () => {
    const history = [[{amount: 100}, {amount: 50}], [], [{amount: 300}], []];
    const metrics = calculateInvestmentHabitMetrics(history as never, 4);
    expect(metrics.activeMonths).toBe(2);
    expect(metrics.consistencyPercent).toBe(50);
    expect(metrics.transactionCount).toBe(3);
    expect(metrics.averageMonthlyContribution).toBe(112.5);
    expect(metrics.averageTransactionsPerActiveMonth).toBe(1.5);
    expect(metrics.contributionVariabilityPercent).toBeCloseTo(33.3333, 3);
  });

  it('limits the observation window and handles malformed month buckets', () => {
    const metrics = calculateInvestmentHabitMetrics([[{amount: 10}], null, [{amount: 30}]] as never, 2);
    expect(metrics.observedMonths).toBe(2);
    expect(metrics.activeMonths).toBe(1);
    expect(metrics.averageMonthlyContribution).toBe(5);
  });
});
