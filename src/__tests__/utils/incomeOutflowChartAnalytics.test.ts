import {describe, expect, it} from 'vitest';
import {
  buildIncomeOutflowComparison,
  calculateIncomeOutflowKpis,
  normalizeIncomeOutflowRows,
  rankCategoryBreakdown,
} from '../../utils/incomeOutflowChartAnalytics';

describe('normalizeIncomeOutflowRows', () => {
  it('returns an empty array for null input', () => {
    expect(normalizeIncomeOutflowRows(null)).toEqual([]);
  });

  it('normalizes malformed values to zero', () => {
    expect(normalizeIncomeOutflowRows([{name: '2026-01', incomes: Number.NaN, outflows: -50}])).toEqual([
      {name: '2026-01', incomes: 0, outflows: 50, net: -50, savingsRate: null},
    ]);
  });

  it('preserves a negative net cash flow instead of clamping it to zero', () => {
    expect(normalizeIncomeOutflowRows([{name: '2026-02', incomes: 1000, outflows: 1250}])[0].net).toBe(-250);
  });

  it('calculates the savings rate for valid rows', () => {
    expect(normalizeIncomeOutflowRows([{name: '2026-03', incomes: 2000, outflows: 1500}])[0].savingsRate).toBe(25);
  });
});

describe('calculateIncomeOutflowKpis', () => {
  it('returns zero values for an empty period', () => {
    expect(calculateIncomeOutflowKpis([])).toEqual({
      totalIncomes: 0,
      totalOutflows: 0,
      net: 0,
      savingsRate: null,
      averageMonthlyNet: 0,
      deficitMonths: 0,
    });
  });

  it('aggregates the selected period and counts deficit months', () => {
    expect(calculateIncomeOutflowKpis(normalizeIncomeOutflowRows([
      {name: '2026-01', incomes: 1000, outflows: 800},
      {name: '2026-02', incomes: 1000, outflows: 1200},
    ]))).toEqual({
      totalIncomes: 2000,
      totalOutflows: 2000,
      net: 0,
      savingsRate: 0,
      averageMonthlyNet: 0,
      deficitMonths: 1,
    });
  });
});

describe('buildIncomeOutflowComparison', () => {
  it('uses null comparison values when the previous period is unavailable', () => {
    const rows = normalizeIncomeOutflowRows([{name: '2026-01', incomes: 100, outflows: 80}]);
    expect(buildIncomeOutflowComparison(rows, rows)[0].comparisonNet).toBeNull();
  });

  it('aligns the immediately preceding period', () => {
    const all = normalizeIncomeOutflowRows([
      {name: '2025-11', incomes: 100, outflows: 90},
      {name: '2025-12', incomes: 120, outflows: 80},
      {name: '2026-01', incomes: 200, outflows: 100},
      {name: '2026-02', incomes: 180, outflows: 120},
    ]);
    expect(buildIncomeOutflowComparison(all, all.slice(-2)).map((row) => row.comparisonNet)).toEqual([10, 40]);
  });
});

describe('rankCategoryBreakdown', () => {
  it('returns an empty array for missing breakdowns', () => {
    expect(rankCategoryBreakdown(null, 5)).toEqual([]);
  });

  it('orders categories and groups overflow into other', () => {
    expect(rankCategoryBreakdown({Food: 50, Travel: 30, Bills: 20}, 2)).toEqual([
      {key: 'Food', value: 50, percentage: 50},
      {key: 'Travel', value: 30, percentage: 30},
      {key: '__other__', value: 20, percentage: 20},
    ]);
  });
});
