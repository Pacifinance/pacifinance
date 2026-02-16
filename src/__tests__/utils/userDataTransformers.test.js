/**
 * Tests for userDataTransformers — pure data transformation functions.
 *
 * Each function is tested for:
 * - Happy path with realistic data
 * - Edge cases (null/undefined/empty inputs)
 * - Boundary conditions
 */

import { describe, it, expect } from 'vitest';
import {
  getTranslation,
  transformTags,
  transformUserProfile,
  calculateProfileCompletion,
  buildGoalsAndLimits,
  calculateTotal,
  transformBalances,
  aggregateOutflowsByCategory,
  buildMonthlyArrays,
  buildChartData,
  buildAssetsFromBalance,
  splitIncomesOutflows,
} from '../../utils/userDataTransformers';

import {
  DEFAULT_MONTHLY_SPENDING_LIMIT,
  DEFAULT_SAVINGS_GOAL_PERCENTAGE,
  DEFAULT_EMERGENCY_FUND_TARGET,
} from '../../data/financeDefaults';

// ═══════════════════════════════════════════
// getTranslation
// ═══════════════════════════════════════════

describe('getTranslation', () => {
  it('returns the translation for the requested language', () => {
    const obj = { translations: { it: 'Casa', en: 'House' } };
    expect(getTranslation(obj, 'it', 'fallback')).toBe('Casa');
    expect(getTranslation(obj, 'en', 'fallback')).toBe('House');
  });

  it('falls back to en when requested language is missing', () => {
    const obj = { translations: { en: 'House' } };
    expect(getTranslation(obj, 'fr', 'fallback')).toBe('House');
  });

  it('falls back to it when en is also missing', () => {
    const obj = { translations: { it: 'Casa' } };
    expect(getTranslation(obj, 'fr', 'fallback')).toBe('Casa');
  });

  it('returns fallback when translations object is empty', () => {
    const obj = { translations: {} };
    expect(getTranslation(obj, 'en', 'fallback')).toBe('fallback');
  });

  it('returns fallback when obj is null or has no translations', () => {
    expect(getTranslation(null, 'en', 'fallback')).toBe('fallback');
    expect(getTranslation({}, 'en', 'fallback')).toBe('fallback');
    expect(getTranslation(undefined, 'en', 'fallback')).toBe('fallback');
  });
});

// ═══════════════════════════════════════════
// transformTags
// ═══════════════════════════════════════════

describe('transformTags', () => {
  it('maps raw tag categories to named arrays', () => {
    const raw = {
      expense: [{ label: 'Food' }],
      income: [{ label: 'Salary' }],
      payment: [{ label: 'Card' }],
      country: [{ label: 'Italy' }],
      job: [],
      jobType: [],
      workTime: [],
      remoteType: [],
      age: [],
      livingSituation: [],
      housingType: [],
      children: [],
      yearsOfExperience: [],
      currency: [{ label: 'EUR' }],
    };
    const result = transformTags(raw);
    expect(result.outflowsTags).toEqual([{ label: 'Food' }]);
    expect(result.incomesTags).toEqual([{ label: 'Salary' }]);
    expect(result.paymentTags).toEqual([{ label: 'Card' }]);
    expect(result.nationalityTags).toEqual([{ label: 'Italy' }]);
    expect(result.currencyTags).toEqual([{ label: 'EUR' }]);
  });

  it('defaults missing categories to empty arrays', () => {
    const result = transformTags({});
    expect(result.outflowsTags).toEqual([]);
    expect(result.incomesTags).toEqual([]);
    expect(result.currencyTags).toEqual([]);
    expect(result.jobTags).toEqual([]);
  });
});

// ═══════════════════════════════════════════
// calculateProfileCompletion
// ═══════════════════════════════════════════

describe('calculateProfileCompletion', () => {
  it('returns 0 when no fields are set', () => {
    const fields = [{ key: -1 }, { key: -1 }, { key: -1 }];
    expect(calculateProfileCompletion(fields)).toBe(0);
  });

  it('returns 100 when all fields are set', () => {
    const fields = [{ key: 1 }, { key: 2 }, { key: 3 }];
    expect(calculateProfileCompletion(fields)).toBe(100);
  });

  it('returns correct percentage for partial completion', () => {
    const fields = [{ key: 1 }, { key: -1 }, { key: 3 }, { key: -1 }];
    expect(calculateProfileCompletion(fields)).toBe(50);
  });

  it('rounds to nearest integer', () => {
    const fields = [{ key: 1 }, { key: -1 }, { key: -1 }];
    expect(calculateProfileCompletion(fields)).toBe(33); // 1/3 = 33.33 → 33
  });
});

// ═══════════════════════════════════════════
// transformUserProfile
// ═══════════════════════════════════════════

describe('transformUserProfile', () => {
  const currencyTags = [
    { index: 0, label: 'eur' },
    { index: 1, label: 'usd' },
  ];

  const mockInfoData = {
    userId: 'abc123',
    type: 1,
    nickname: 'TestUser',
    preferredCurrency: 1,
    country: { index: 5, translations: { en: 'Italy', it: 'Italia' } },
    job: { index: 2, translations: { en: 'Engineer', it: 'Ingegnere' } },
    jobCountry: null,
    jobType: null,
    workTime: null,
    remoteType: null,
    age: { index: 3, translations: { en: '25-34' } },
    livingSituation: null,
    housingType: null,
    children: null,
    yearsOfExperience: null,
  };

  it('maps all fields correctly', () => {
    const result = transformUserProfile(mockInfoData, currencyTags, 'en');
    expect(result.userId).toBe('abc123');
    expect(result.userType).toBe('premium');
    expect(result.username).toBe('TestUser');
    expect(result.preferredCurrencyCode).toBe('USD');
    expect(result.preferredCurrencyKey).toBe(1);
  });

  it('resolves translated profile fields', () => {
    const result = transformUserProfile(mockInfoData, currencyTags, 'it');
    expect(result.profile.nationality.value).toBe('Italia');
    expect(result.profile.job.value).toBe('Ingegnere');
  });

  it('defaults userId to 00000 when missing', () => {
    const result = transformUserProfile({}, currencyTags, 'en');
    expect(result.userId).toBe('00000');
  });

  it('defaults userType to regular for unknown type', () => {
    const result = transformUserProfile({ type: 99 }, currencyTags, 'en');
    expect(result.userType).toBe('regular');
  });

  it('defaults currency to EUR when no matching tag', () => {
    const result = transformUserProfile({ preferredCurrency: 999 }, currencyTags, 'en');
    expect(result.preferredCurrencyCode).toBe('EUR');
    expect(result.preferredCurrencyKey).toBe(-1);
  });

  it('calculates profile completion percentage', () => {
    const result = transformUserProfile(mockInfoData, currencyTags, 'en');
    // country, job, age are set (3/11 fields)
    expect(result.profileCompletionPercentage).toBe(27);
    expect(result.profile.completionPercentage).toBe(27);
  });
});

// ═══════════════════════════════════════════
// buildGoalsAndLimits
// ═══════════════════════════════════════════

describe('buildGoalsAndLimits', () => {
  it('returns user values when set', () => {
    const goals = { expensesLimit: 3000, savingsPercent: 30, emergencyFundGoal: 15000 };
    const result = buildGoalsAndLimits(goals);
    expect(result.limits.monthlySpendingLimit).toBe(3000);
    expect(result.limits.savingsGoalPercentage).toBe(30);
    expect(result.limits.emergencyFundTarget).toBe(15000);
  });

  it('uses defaults when values are -1', () => {
    const goals = { expensesLimit: -1, savingsPercent: -1, emergencyFundGoal: -1 };
    const result = buildGoalsAndLimits(goals);
    expect(result.limits.monthlySpendingLimit).toBe(DEFAULT_MONTHLY_SPENDING_LIMIT);
    expect(result.limits.savingsGoalPercentage).toBe(DEFAULT_SAVINGS_GOAL_PERCENTAGE);
    expect(result.limits.emergencyFundTarget).toBe(DEFAULT_EMERGENCY_FUND_TARGET);
  });

  it('uses defaults when input is null/undefined', () => {
    expect(buildGoalsAndLimits(null).limits.monthlySpendingLimit).toBe(DEFAULT_MONTHLY_SPENDING_LIMIT);
    expect(buildGoalsAndLimits(undefined).limits.monthlySpendingLimit).toBe(DEFAULT_MONTHLY_SPENDING_LIMIT);
  });

  it('always returns notifications enabled', () => {
    expect(buildGoalsAndLimits({}).limits.notificationsEnabled).toBe(true);
  });

  it('always returns an empty goals array', () => {
    expect(buildGoalsAndLimits({ expensesLimit: 5000 }).goals).toEqual([]);
  });
});

// ═══════════════════════════════════════════
// calculateTotal
// ═══════════════════════════════════════════

describe('calculateTotal', () => {
  it('sums all asset fields', () => {
    const balance = {
      cash: 100, bank: 200, emergencyFund: 300, digitalServices: 50,
      stocks: 400, etf: 500, bitcoin: 600, crypto: 700,
      bonds: 800, funds: 900, gold: 1000,
    };
    expect(calculateTotal(balance)).toBe(5550);
  });

  it('treats missing fields as 0', () => {
    expect(calculateTotal({ bank: 500 })).toBe(500);
    expect(calculateTotal({})).toBe(0);
  });

  it('returns 0 for null/undefined', () => {
    expect(calculateTotal(null)).toBe(0);
    expect(calculateTotal(undefined)).toBe(0);
  });
});

// ═══════════════════════════════════════════
// transformBalances
// ═══════════════════════════════════════════

describe('transformBalances', () => {
  it('normalises raw balance data and adds totalValue', () => {
    const raw = [
      { date: '2025-01', balance: { bank: 1000, cash: 200 } },
      { date: '2025-02', balance: { bank: 1500 } },
    ];
    const result = transformBalances(raw);
    expect(result).toHaveLength(2);
    expect(result[0].date).toBe('2025-01');
    expect(result[0].balance.totalValue).toBe(1200);
    expect(result[1].balance.totalValue).toBe(1500);
  });

  it('handles missing date and balance', () => {
    const raw = [{}];
    const result = transformBalances(raw);
    expect(result[0].date).toBeNull();
    expect(result[0].balance.totalValue).toBe(0);
  });

  it('handles empty array', () => {
    expect(transformBalances([])).toEqual([]);
  });
});

// ═══════════════════════════════════════════
// aggregateOutflowsByCategory
// ═══════════════════════════════════════════

describe('aggregateOutflowsByCategory', () => {
  it('aggregates outflows by category per month', () => {
    const data = [
      [
        { isExpense: true, amount: 100, categoryTag: { translations: { en: 'Food' } } },
        { isExpense: true, amount: 200, categoryTag: { translations: { en: 'Food' } } },
        { isExpense: true, amount: 50, categoryTag: { translations: { en: 'Transport' } } },
        { isExpense: false, amount: 3000 }, // income, should be ignored
      ],
    ];
    const result = aggregateOutflowsByCategory(data);
    expect(result[0].Food).toBe(300);
    expect(result[0].Transport).toBe(50);
  });

  it('uses label as fallback when translations.en is missing', () => {
    const data = [[
      { isExpense: true, amount: 10, categoryTag: { label: 'Health' } },
    ]];
    const result = aggregateOutflowsByCategory(data);
    expect(result[0].Health).toBe(10);
  });

  it('uses Unknown when no category info available', () => {
    const data = [[
      { isExpense: true, amount: 10, categoryTag: {} },
    ]];
    const result = aggregateOutflowsByCategory(data);
    expect(result[0].Unknown).toBe(10);
  });

  it('handles non-array months gracefully', () => {
    const data = [null, undefined, 'bad'];
    const result = aggregateOutflowsByCategory(data);
    expect(result[0]).toEqual({});
    expect(result[1]).toEqual({});
    expect(result[2]).toEqual({});
  });

  it('handles empty input', () => {
    expect(aggregateOutflowsByCategory([])).toEqual({});
  });
});

// ═══════════════════════════════════════════
// buildMonthlyArrays
// ═══════════════════════════════════════════

describe('buildMonthlyArrays', () => {
  it('splits items into incomes and outflows arrays of sums', () => {
    const data = Array(13).fill(null).map(() => []);
    data[0] = [
      { isExpense: true, amount: 100 },
      { isExpense: true, amount: 200 },
      { isExpense: false, amount: 3000 },
    ];
    data[1] = [
      { isExpense: false, amount: 500 },
    ];
    const result = buildMonthlyArrays(data);
    expect(result.outflowsArray[0]).toBe(300);
    expect(result.incomesArray[0]).toBe(3000);
    expect(result.incomesArray[1]).toBe(500);
    expect(result.outflowsArray[1]).toBe(0);
  });

  it('returns 13-element arrays filled with zero for empty input', () => {
    const data = Array(13).fill([]);
    const result = buildMonthlyArrays(data);
    expect(result.incomesArray).toHaveLength(13);
    expect(result.outflowsArray).toHaveLength(13);
    expect(result.incomesArray.every(v => v === 0)).toBe(true);
    expect(result.outflowsArray.every(v => v === 0)).toBe(true);
  });

  it('handles non-array items gracefully', () => {
    const data = [null, undefined, 'bad'];
    const result = buildMonthlyArrays(data);
    expect(result.incomesArray.slice(0, 3)).toEqual([0, 0, 0]);
  });

  it('coerces string amounts to numbers', () => {
    const data = [[{ isExpense: true, amount: '150' }]];
    const result = buildMonthlyArrays(data);
    expect(result.outflowsArray[0]).toBe(150);
  });
});

// ═══════════════════════════════════════════
// buildChartData
// ═══════════════════════════════════════════

describe('buildChartData', () => {
  const currentDate = new Date(2025, 5, 1); // June 2025

  it('returns 12 entries with month labels', () => {
    const balances = Array(13).fill(null).map((_, i) => ({
      date: `2025-${String(6 - i).padStart(2, '0')}`,
      balance: { bank: 1000 * (i + 1), totalValue: 1000 * (i + 1) },
    }));
    const result = buildChartData(balances, currentDate);
    expect(result).toHaveLength(12);
    // First entry should be oldest (11 months ago)
    expect(result[0].month).toBe('2024-07');
    // Last entry should be current month
    expect(result[11].month).toBe('2025-06');
  });

  it('preserves balance properties in output', () => {
    const balances = Array(12).fill(null).map(() => ({
      date: '2025-01',
      balance: { bank: 999, totalValue: 999 },
    }));
    const result = buildChartData(balances, currentDate);
    expect(result[0].bank).toBe(999);
    expect(result[0].totalValue).toBe(999);
  });

  it('handles balances with fewer than 12 entries', () => {
    const balances = [
      { date: '2025-06', balance: { bank: 500 } },
      { date: '2025-05', balance: { bank: 400 } },
    ];
    const result = buildChartData(balances, currentDate);
    expect(result).toHaveLength(2);
  });
});

// ═══════════════════════════════════════════
// buildAssetsFromBalance
// ═══════════════════════════════════════════

describe('buildAssetsFromBalance', () => {
  it('returns only assets with value > 0', () => {
    const balance = { cash: 100, bank: 0, stocks: 500, etf: 0, bitcoin: 200 };
    const result = buildAssetsFromBalance(balance);
    expect(result).toHaveLength(3);
    expect(result.map(a => a.typology)).toEqual(['cash', 'stocks', 'bitcoin']);
    expect(result.find(a => a.typology === 'cash').value).toBe(100);
  });

  it('returns empty array when all values are 0', () => {
    const balance = { cash: 0, bank: 0 };
    expect(buildAssetsFromBalance(balance)).toEqual([]);
  });

  it('handles null/undefined input', () => {
    expect(buildAssetsFromBalance(null)).toEqual([]);
    expect(buildAssetsFromBalance(undefined)).toEqual([]);
  });

  it('includes all 10 asset types when all are non-zero', () => {
    const balance = {
      cash: 1, bank: 2, digitalServices: 3, stocks: 4,
      etf: 5, bitcoin: 6, crypto: 7, bonds: 8, funds: 9, gold: 10,
    };
    expect(buildAssetsFromBalance(balance)).toHaveLength(10);
  });
});

// ═══════════════════════════════════════════
// splitIncomesOutflows
// ═══════════════════════════════════════════

describe('splitIncomesOutflows', () => {
  it('separates expenses from incomes', () => {
    const data = [
      [
        { isExpense: true, amount: 100, category: 'Food' },
        { isExpense: false, amount: 3000, category: 'Salary' },
        { isExpense: true, amount: 50, category: 'Transport' },
      ],
      [],
    ];
    const result = splitIncomesOutflows(data);
    expect(result.allOutflows[0]).toHaveLength(2);
    expect(result.allIncomes[0]).toHaveLength(1);
    expect(result.allOutflows[1]).toEqual([]);
    expect(result.allIncomes[1]).toEqual([]);
  });

  it('handles non-array months', () => {
    const data = [null, undefined];
    const result = splitIncomesOutflows(data);
    expect(result.allOutflows).toEqual([[], []]);
    expect(result.allIncomes).toEqual([[], []]);
  });

  it('handles empty input', () => {
    const result = splitIncomesOutflows([]);
    expect(result.allOutflows).toEqual([]);
    expect(result.allIncomes).toEqual([]);
  });

  it('filters out null entries within month arrays', () => {
    const data = [[null, { isExpense: true, amount: 10 }, null]];
    const result = splitIncomesOutflows(data);
    expect(result.allOutflows[0]).toHaveLength(1);
    expect(result.allIncomes[0]).toEqual([]);
  });
});
