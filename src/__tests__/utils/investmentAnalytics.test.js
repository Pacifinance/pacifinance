import { describe, it, expect } from 'vitest';
import {
  summarizeHoldings, estimateMonthlyContribution, estimateMonthlyGrowthRate, projectGoalETA,
  computeMonthlyContributionSeries,
} from '../../utils/investmentAnalytics';

const holding = (overrides) => ({
  id: 1, assetKey: 'stocks', positionType: 'single', quantity: 1, averagePrice: 100,
  currentValue: null, investedAmount: 100, currency: 'EUR', notes: '', updatedAt: '2026-01-01',
  instrument: { id: 1, kind: 'stock', symbol: 'AAPL', name: 'Apple Inc', exchange: null, currency: 'USD', isin: null, verified: true, provider: 'openfigi', metadata: {} },
  ...overrides,
});

const historyEntry = (overrides) => ({
  id: 1, holdingId: 1, instrumentId: 1, assetKey: 'stocks', symbol: 'AAPL', name: 'Apple Inc',
  quantity: 1, averagePrice: 100, currentValue: null, investedAmount: 100, currency: 'EUR',
  userDate: '2026-01-01', recordedAt: '2026-01-01',
  ...overrides,
});

describe('summarizeHoldings', () => {
  it('reports cost-basis totals and hasRealCurrentValue=false when no holding has a current value', () => {
    const result = summarizeHoldings([holding({ investedAmount: 1000 }), holding({ id: 2, investedAmount: 500 })], 'stocks');

    expect(result).toMatchObject({ count: 2, totalInvested: 1500, totalCurrent: 1500, hasRealCurrentValue: false, gain: null, gainPct: null, best: null, worst: null });
  });

  it('computes gain/loss and best/worst once real current values exist', () => {
    const holdings = [
      holding({ id: 1, investedAmount: 100, currentValue: 150 }), // +50%
      holding({ id: 2, investedAmount: 100, currentValue: 80 }), // -20%
    ];

    const result = summarizeHoldings(holdings, 'stocks');

    expect(result.hasRealCurrentValue).toBe(true);
    expect(result.gain).toBe(30); // 230 - 200
    expect(result.gainPct).toBeCloseTo(15);
    expect(result.best).toMatchObject({ symbol: 'AAPL', gainPct: 50 });
    expect(result.worst).toMatchObject({ symbol: 'AAPL', gainPct: -20 });
  });

  it('filters by asset key', () => {
    const holdings = [holding({ assetKey: 'stocks', investedAmount: 100 }), holding({ id: 2, assetKey: 'etf', investedAmount: 200 })];

    expect(summarizeHoldings(holdings, 'stocks').totalInvested).toBe(100);
    expect(summarizeHoldings(holdings, null).totalInvested).toBe(300);
  });
});

describe('estimateMonthlyContribution', () => {
  it('returns null with fewer than 2 distinct months', () => {
    const result = estimateMonthlyContribution([historyEntry({ userDate: '2026-01-01', investedAmount: 100 })], 'stocks');
    expect(result).toEqual({ monthlyAverage: null, monthsAvailable: 1 });
  });

  it('averages the month-over-month invested_amount delta', () => {
    const history = [
      historyEntry({ userDate: '2026-01-01', investedAmount: 100 }),
      historyEntry({ userDate: '2026-02-01', investedAmount: 150 }),
      historyEntry({ userDate: '2026-03-01', investedAmount: 250 }),
    ];
    const result = estimateMonthlyContribution(history, 'stocks');
    expect(result.monthsAvailable).toBe(3);
    expect(result.monthlyAverage).toBeCloseTo(75); // (50 + 100) / 2
  });

  it('sums across multiple holdings (distinct instruments) in the same month before diffing', () => {
    const history = [
      historyEntry({ holdingId: 1, instrumentId: 1, userDate: '2026-01-01', investedAmount: 100 }),
      historyEntry({ holdingId: 2, instrumentId: 2, userDate: '2026-01-01', investedAmount: 50 }),
      historyEntry({ holdingId: 1, instrumentId: 1, userDate: '2026-02-01', investedAmount: 100 }),
      historyEntry({ holdingId: 2, instrumentId: 2, userDate: '2026-02-01', investedAmount: 100 }),
    ];
    const result = estimateMonthlyContribution(history, 'stocks');
    expect(result.monthlyAverage).toBeCloseTo(50); // 200 - 150
  });

  it('forward-fills a holding with no snapshot in a given month instead of dropping it from the total', () => {
    // Instrument 1 only has CSV-backfilled snapshots for Jan/Mar (it wasn't
    // traded in Feb); instrument 2 was bought in Feb and has no Jan snapshot
    // at all. Without forward-fill, Feb's total would only see instrument 2
    // (100) - a fake ~-100 drop from Jan's 100, then a fake ~+150 jump in
    // March when instrument 1 reappears.
    const history = [
      historyEntry({ holdingId: 1, instrumentId: 1, userDate: '2026-01-01', investedAmount: 100 }),
      historyEntry({ holdingId: 2, instrumentId: 2, userDate: '2026-02-01', investedAmount: 100 }),
      historyEntry({ holdingId: 1, instrumentId: 1, userDate: '2026-03-01', investedAmount: 150 }),
    ];
    const result = estimateMonthlyContribution(history, 'stocks');
    // Totals once forward-filled: Jan=100, Feb=100(inst1 carried)+100(inst2)=200, Mar=150+100=250.
    // Delta average: ((200-100) + (250-200)) / 2 = (100 + 50) / 2 = 75.
    expect(result.monthsAvailable).toBe(3);
    expect(result.monthlyAverage).toBeCloseTo(75);
  });
});

describe('computeMonthlyContributionSeries', () => {
  it('returns an empty series with fewer than 2 distinct months', () => {
    expect(computeMonthlyContributionSeries([historyEntry({ userDate: '2026-01-01', investedAmount: 100 })], 'stocks')).toEqual([]);
  });

  it('returns one point per month after the first, forward-filling gaps', () => {
    const history = [
      historyEntry({ holdingId: 1, instrumentId: 1, userDate: '2026-01-01', investedAmount: 100 }),
      historyEntry({ holdingId: 2, instrumentId: 2, userDate: '2026-02-01', investedAmount: 100 }),
      historyEntry({ holdingId: 1, instrumentId: 1, userDate: '2026-03-01', investedAmount: 150 }),
    ];
    const result = computeMonthlyContributionSeries(history, 'stocks');
    expect(result).toEqual([
      { month: '2026-02', amount: 100 }, // 200 - 100
      { month: '2026-03', amount: 50 }, // 250 - 200
    ]);
  });
});

describe('estimateMonthlyGrowthRate', () => {
  it('returns null with fewer than 2 distinct months of real current_value', () => {
    const result = estimateMonthlyGrowthRate([historyEntry({ userDate: '2026-01-01', currentValue: 100 })], 'stocks');
    expect(result).toEqual({ monthlyRate: null, monthsAvailable: 1 });
  });

  it('ignores months where current_value was never recorded', () => {
    const history = [
      historyEntry({ userDate: '2026-01-01', currentValue: null, investedAmount: 100 }),
      historyEntry({ userDate: '2026-02-01', currentValue: null, investedAmount: 150 }),
    ];
    const result = estimateMonthlyGrowthRate(history, 'stocks');
    expect(result).toEqual({ monthlyRate: null, monthsAvailable: 0 });
  });

  it('computes a compound monthly rate from first-to-last recorded current_value', () => {
    const history = [
      historyEntry({ userDate: '2026-01-01', currentValue: 1000 }),
      historyEntry({ userDate: '2026-02-01', currentValue: 1050 }),
      historyEntry({ userDate: '2026-03-01', currentValue: 1102.5 }),
    ];
    const result = estimateMonthlyGrowthRate(history, 'stocks');
    expect(result.monthsAvailable).toBe(3);
    expect(result.monthlyRate).toBeCloseTo(0.05, 4); // 5%/month compounded twice: 1000 -> 1102.5
  });

  it('forward-fills a holding not re-priced every month instead of dropping it from the total', () => {
    // Instrument 2 only got a fresh quote in January and March (e.g. "Aggiorna
    // prezzi" wasn't clicked in February) - it must still count toward
    // February's total at its last known value, not vanish from the sum.
    const history = [
      historyEntry({ holdingId: 1, instrumentId: 1, userDate: '2026-01-01', currentValue: 500 }),
      historyEntry({ holdingId: 2, instrumentId: 2, userDate: '2026-01-01', currentValue: 500 }),
      historyEntry({ holdingId: 1, instrumentId: 1, userDate: '2026-02-01', currentValue: 550 }),
      historyEntry({ holdingId: 1, instrumentId: 1, userDate: '2026-03-01', currentValue: 605 }),
      historyEntry({ holdingId: 2, instrumentId: 2, userDate: '2026-03-01', currentValue: 500 }),
    ];
    const result = estimateMonthlyGrowthRate(history, 'stocks');
    // First month total: 500 + 500 = 1000. Last month total: 605 + 500 = 1105.
    expect(result.monthsAvailable).toBe(3);
    expect(result.monthlyRate).toBeCloseTo(Math.pow(1105 / 1000, 1 / 2) - 1, 6);
  });
});

describe('projectGoalETA', () => {
  it('reports already reached when current already meets or exceeds target', () => {
    const result = projectGoalETA({ currentValue: 1000, targetValue: 800, monthlyContribution: null, monthlyGrowthRate: null });
    expect(result).toEqual({ alreadyReached: true, reachable: true, months: 0, usedGrowthRate: false });
  });

  it('reports unreachable when there is no contribution and no growth', () => {
    const result = projectGoalETA({ currentValue: 100, targetValue: 1000, monthlyContribution: null, monthlyGrowthRate: null });
    expect(result).toEqual({ alreadyReached: false, reachable: false, months: null, usedGrowthRate: false });
  });

  it('projects months needed from a pure contribution rate (no growth) — a conservative estimate', () => {
    const result = projectGoalETA({ currentValue: 0, targetValue: 1000, monthlyContribution: 100, monthlyGrowthRate: null });
    expect(result).toEqual({ alreadyReached: false, reachable: true, months: 10, usedGrowthRate: false });
  });

  it('reaches the goal faster when a positive growth rate is also factored in', () => {
    const noGrowth = projectGoalETA({ currentValue: 500, targetValue: 5000, monthlyContribution: 200, monthlyGrowthRate: null });
    const withGrowth = projectGoalETA({ currentValue: 500, targetValue: 5000, monthlyContribution: 200, monthlyGrowthRate: 0.02 });

    expect(withGrowth.usedGrowthRate).toBe(true);
    expect(withGrowth.months).toBeLessThan(noGrowth.months);
  });

  it('gives up (unreachable) rather than looping forever when growth is negative and contribution cannot offset it', () => {
    const result = projectGoalETA({ currentValue: 1000, targetValue: 1_000_000, monthlyContribution: 0, monthlyGrowthRate: -0.01 });
    expect(result).toEqual({ alreadyReached: false, reachable: false, months: null, usedGrowthRate: true });
  });
});
