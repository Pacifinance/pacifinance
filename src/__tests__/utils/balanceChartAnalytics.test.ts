import {describe, expect, it} from 'vitest';
import {
  buildBalanceChanges,
  buildPercentageComposition,
  buildPreviousPeriodComparison,
  calculateBalanceKpis,
  generateBalanceInsights,
} from '../../utils/balanceChartAnalytics';

const rows = [
  {name: '2026-01', total: 100, bank: 40, cash: 10, stocks: 30, etf: 20},
  {name: '2026-02', total: 120, bank: 45, cash: 5, stocks: 35, etf: 35},
  {name: '2026-03', total: 90, bank: 30, cash: 5, stocks: 25, etf: 30},
];

describe('balanceChartAnalytics', () => {
  it('returns safe KPI defaults for an empty period', () => {
    expect(calculateBalanceKpis([])).toMatchObject({currentTotal: 0, percentChange: null, peakMonth: null});
    expect(generateBalanceInsights([])).toEqual([]);
  });

  it('handles a zero starting balance without an infinite percentage', () => {
    const zeroStart = [{name: 'a', total: 0}, {name: 'b', total: 10}];
    const result = calculateBalanceKpis(zeroStart);
    expect(result.percentChange).toBeNull();
    expect(generateBalanceInsights(zeroStart)[0]).toMatchObject({key: 'periodGrowthAmount', value: 10});
  });

  it('calculates current value, period change, allocation and peak', () => {
    const result = calculateBalanceKpis(rows);
    expect(result.currentTotal).toBe(90);
    expect(result.absoluteChange).toBe(-10);
    expect(result.percentChange).toBe(-10);
    expect(result.liquidityValue).toBe(35);
    expect(result.peakMonth).toBe('2026-02');
  });

  it('builds month-on-month changes without inventing a first-month delta', () => {
    const result = buildBalanceChanges(rows);
    expect(result[0].total).toBe(0);
    expect(result[1]).toMatchObject({total: 20, bank: 5, cash: -5});
    expect(result[2].total).toBe(-30);
  });

  it('normalizes composition to 100 percent while retaining raw values', () => {
    const result = buildPercentageComposition(rows);
    expect(result[0].bank).toBe(40);
    expect(result[0].raw_bank).toBe(40);
    expect(result[1].total).toBe(100);
  });

  it('aligns the previous period with the visible period', () => {
    const allRows = [...rows, {name: '2026-04', total: 130}];
    const result = buildPreviousPeriodComparison(allRows, allRows.slice(2));
    expect(result.map((row) => row.comparisonTotal)).toEqual([100, 120]);
  });

  it('produces deterministic insights including the largest latest driver', () => {
    const result = generateBalanceInsights(rows);
    expect(result[0].key).toBe('periodDecline');
    expect(result.find((item) => item.key === 'largestDriver')).toMatchObject({assetKey: 'bank', value: -15});
  });
});
