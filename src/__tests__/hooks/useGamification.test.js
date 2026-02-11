/**
 * Tests for useGamification — Badge Check Functions
 * 
 * Tests every single badge (44) with:
 * - Positive case: data that should unlock the badge
 * - Negative case: data that should NOT unlock (especially empty/zero data)
 * - Edge cases: boundary values, fallback defaults
 * 
 * Also tests helper functions and the "empty user" scenario.
 */

import { describe, it, expect } from 'vitest';
import { BADGE_DEFINITIONS, BADGE_CATEGORIES, BADGE_CATEGORY_ORDER } from '../../hooks/useGamification';

// ═══════════════════════════════════════════
// Test Data Builders
// ═══════════════════════════════════════════

/** Empty user — just signed up, backend returns 13 months of empty data */
const emptyUser = () => ({
  balances: Array.from({ length: 13 }, (_, i) => ({
    date: new Date(2026, 1 - i, 1).toISOString(),
    balance: { cash: 0, bank: 0, digitalServices: 0, emergencyFund: 0, stocks: 0, etf: 0, bitcoin: 0, crypto: 0, bonds: 0, funds: 0, gold: 0, totalValue: 0 },
  })),
  incomes: { incomesArray: Array(13).fill(0), allIncomes: [] },
  expenses: { outflowsArray: Array(13).fill(0), allOutflows: [], totalOutflowsPerCategoryPerMonth: {} },
  goals: [],
  limits: { monthlySpendingLimit: 2000, savingsGoalPercentage: 20, emergencyFundTarget: 10000 },
  rankings: { balance: 50, incomes: 50, outflows: 50 },
  profile: {
    nationality: { key: -1, value: '' },
    job: { key: -1, value: '' },
    jobType: { key: -1, value: '' },
    age: { key: -1, value: '' },
    livingSituation: { key: -1, value: '' },
    housingType: { key: -1, value: '' },
  },
});

/** Active user with N months of real data */
const activeUser = (months = 6) => {
  const now = new Date(2026, 1, 1); // Feb 2026
  const balances = Array.from({ length: 13 }, (_, i) => ({
    date: new Date(now.getFullYear(), now.getMonth() - i, 1).toISOString(),
    balance: i < months
      ? { cash: 500, bank: 20000, digitalServices: 0, emergencyFund: 5000, stocks: 8000, etf: 25000, bitcoin: 0, crypto: 0, bonds: 15000, funds: 12500, gold: 8000, totalValue: 94000 }
      : { cash: 0, bank: 0, digitalServices: 0, emergencyFund: 0, stocks: 0, etf: 0, bitcoin: 0, crypto: 0, bonds: 0, funds: 0, gold: 0, totalValue: 0 },
  }));
  
  const incomesArray = Array.from({ length: 13 }, (_, i) => i < months ? 2800 : 0);
  const outflowsArray = Array.from({ length: 13 }, (_, i) => i < months ? 2100 : 0);
  
  return {
    balances,
    incomes: { incomesArray, allIncomes: [] },
    expenses: {
      outflowsArray,
      allOutflows: [],
      totalOutflowsPerCategoryPerMonth: {
        0: { House: 800, Food: 600, Transport: 400, Entertainment: 200, Health: 100 },
      },
    },
    goals: [],
    limits: { monthlySpendingLimit: 2000, savingsGoalPercentage: 20, emergencyFundTarget: 10000 },
    rankings: { balance: 80, incomes: 70, outflows: 60 },
    profile: {
      nationality: { key: -1, value: '' },
      job: { key: -1, value: '' },
      jobType: { key: -1, value: '' },
      age: { key: -1, value: '' },
      livingSituation: { key: -1, value: '' },
      housingType: { key: -1, value: '' },
    },
  };
};

// ═══════════════════════════════════════════
// Structural tests
// ═══════════════════════════════════════════

describe('useGamification — Structure', () => {
  it('should have exactly 44 badge definitions', () => {
    expect(Object.keys(BADGE_DEFINITIONS)).toHaveLength(44);
  });

  it('every badge should have id, icon, category, and check function', () => {
    Object.entries(BADGE_DEFINITIONS).forEach(([key, def]) => {
      expect(def.id).toBe(key);
      expect(typeof def.icon).toBe('string');
      expect(typeof def.category).toBe('string');
      expect(Object.values(BADGE_CATEGORIES)).toContain(def.category);
      expect(typeof def.check).toBe('function');
    });
  });

  it('BADGE_CATEGORY_ORDER should contain all categories', () => {
    const allCategories = new Set(Object.values(BADGE_DEFINITIONS).map(d => d.category));
    allCategories.forEach(cat => {
      expect(BADGE_CATEGORY_ORDER).toContain(cat);
    });
  });
});

// ═══════════════════════════════════════════
// CRITICAL: Empty user should unlock ZERO badges
// ═══════════════════════════════════════════

describe('useGamification — Empty User (no real data)', () => {
  it('should NOT unlock ANY badge for a freshly registered user', () => {
    const data = emptyUser();
    const unlockedBadges = Object.entries(BADGE_DEFINITIONS)
      .filter(([, def]) => def.check(data))
      .map(([key]) => key);
    
    expect(unlockedBadges).toEqual([]);
  });

  it('should not be tricked by 13-element balances array with zero data', () => {
    const data = emptyUser();
    expect(data.balances).toHaveLength(13);
    expect(BADGE_DEFINITIONS.firstMonth.check(data)).toBe(false);
    expect(BADGE_DEFINITIONS.threeMonths.check(data)).toBe(false);
    expect(BADGE_DEFINITIONS.oneYear.check(data)).toBe(false);
  });

  it('should not be tricked by rankings on empty user', () => {
    const data = emptyUser();
    data.rankings = { balance: 100, incomes: 100, outflows: 100 };
    expect(BADGE_DEFINITIONS.topQuartile.check(data)).toBe(false);
    expect(BADGE_DEFINITIONS.top10Percent.check(data)).toBe(false);
  });

  it('should not be tricked by default limit fallbacks', () => {
    const data = emptyUser();
    // Default limit is 2000 — should NOT trigger budgetMaster
    expect(BADGE_DEFINITIONS.budgetMaster.check(data)).toBe(false);
  });

  it('should not trigger savings badges with all-zero arrays', () => {
    const data = emptyUser();
    // income=0, outflows=0 → income > outflows is false (0 > 0 = false)
    expect(BADGE_DEFINITIONS.firstSave.check(data)).toBe(false);
    expect(BADGE_DEFINITIONS.savingsStreak3.check(data)).toBe(false);
    expect(BADGE_DEFINITIONS.bigSaver.check(data)).toBe(false);
    expect(BADGE_DEFINITIONS.superSaver.check(data)).toBe(false);
  });
});

// ═══════════════════════════════════════════
// DATA CONSISTENCY BADGES (7)
// ═══════════════════════════════════════════

describe('Data Consistency Badges', () => {
  it('firstMonth — unlocks with 1 month of real data', () => {
    const data = activeUser(1);
    expect(BADGE_DEFINITIONS.firstMonth.check(data)).toBe(true);
  });

  it('firstMonth — locked with 0 months of real data', () => {
    const data = emptyUser();
    expect(BADGE_DEFINITIONS.firstMonth.check(data)).toBe(false);
  });

  it('threeMonths — unlocks with 3 months', () => {
    expect(BADGE_DEFINITIONS.threeMonths.check(activeUser(3))).toBe(true);
  });

  it('threeMonths — locked with 2 months', () => {
    expect(BADGE_DEFINITIONS.threeMonths.check(activeUser(2))).toBe(false);
  });

  it('sixMonths — unlocks with 6 months', () => {
    expect(BADGE_DEFINITIONS.sixMonths.check(activeUser(6))).toBe(true);
  });

  it('sixMonths — locked with 5 months', () => {
    expect(BADGE_DEFINITIONS.sixMonths.check(activeUser(5))).toBe(false);
  });

  it('oneYear — unlocks with 12 months', () => {
    expect(BADGE_DEFINITIONS.oneYear.check(activeUser(12))).toBe(true);
  });

  it('oneYear — locked with 11 months', () => {
    expect(BADGE_DEFINITIONS.oneYear.check(activeUser(11))).toBe(false);
  });

  it('twoYears — locked (max 13 months in data)', () => {
    expect(BADGE_DEFINITIONS.twoYears.check(activeUser(13))).toBe(false);
  });

  it('dataStreak6 — unlocks with 6 consecutive months of real data', () => {
    const data = activeUser(6);
    expect(BADGE_DEFINITIONS.dataStreak6.check(data)).toBe(true);
  });

  it('dataStreak6 — locked when middle month is empty', () => {
    const data = activeUser(6);
    data.balances[2].balance = { cash: 0, bank: 0, digitalServices: 0, emergencyFund: 0, stocks: 0, etf: 0, bitcoin: 0, crypto: 0, bonds: 0, funds: 0, gold: 0, totalValue: 0 };
    // Streak broken at month 2 → only 2 consecutive months
    expect(BADGE_DEFINITIONS.dataStreak6.check(data)).toBe(false);
  });

  it('dataStreak12 — needs 12 consecutive months', () => {
    expect(BADGE_DEFINITIONS.dataStreak12.check(activeUser(12))).toBe(true);
    expect(BADGE_DEFINITIONS.dataStreak12.check(activeUser(11))).toBe(false);
  });
});

// ═══════════════════════════════════════════
// SAVINGS BADGES (6)
// ═══════════════════════════════════════════

describe('Savings Badges', () => {
  it('firstSave — unlocks when income > outflows for any month', () => {
    const data = activeUser(1);
    // income=2800, outflows=2100 → saved
    expect(BADGE_DEFINITIONS.firstSave.check(data)).toBe(true);
  });

  it('firstSave — locked when income = 0 (even if outflows = 0)', () => {
    const data = emptyUser();
    expect(BADGE_DEFINITIONS.firstSave.check(data)).toBe(false);
  });

  it('firstSave — locked when outflows > income', () => {
    const data = activeUser(1);
    data.incomes.incomesArray[0] = 1000;
    data.expenses.outflowsArray[0] = 2000;
    expect(BADGE_DEFINITIONS.firstSave.check(data)).toBe(false);
  });

  it('savingsStreak3 — unlocks with 3 consecutive saving months', () => {
    const data = activeUser(3);
    expect(BADGE_DEFINITIONS.savingsStreak3.check(data)).toBe(true);
  });

  it('savingsStreak3 — locked when 2nd month has no income', () => {
    const data = activeUser(3);
    data.incomes.incomesArray[1] = 0;
    data.expenses.outflowsArray[1] = 0;
    expect(BADGE_DEFINITIONS.savingsStreak3.check(data)).toBe(false);
  });

  it('savingsStreak6 — requires 6 consecutive months', () => {
    expect(BADGE_DEFINITIONS.savingsStreak6.check(activeUser(6))).toBe(true);
    expect(BADGE_DEFINITIONS.savingsStreak6.check(activeUser(5))).toBe(false);
  });

  it('savingsStreak12 — requires 12 consecutive months', () => {
    expect(BADGE_DEFINITIONS.savingsStreak12.check(activeUser(12))).toBe(true);
    expect(BADGE_DEFINITIONS.savingsStreak12.check(activeUser(11))).toBe(false);
  });

  it('bigSaver — unlocks when savings >= 30% of income in any month', () => {
    const data = activeUser(1);
    data.incomes.incomesArray[0] = 3000;
    data.expenses.outflowsArray[0] = 2000; // saved 1000/3000 = 33%
    expect(BADGE_DEFINITIONS.bigSaver.check(data)).toBe(true);
  });

  it('bigSaver — locked when savings < 30%', () => {
    const data = activeUser(1);
    data.incomes.incomesArray[0] = 3000;
    data.expenses.outflowsArray[0] = 2200; // saved 800/3000 = 26.7%
    expect(BADGE_DEFINITIONS.bigSaver.check(data)).toBe(false);
  });

  it('bigSaver — locked when outflows = 0 (no real spending data)', () => {
    const data = activeUser(1);
    data.incomes.incomesArray[0] = 3000;
    data.expenses.outflowsArray[0] = 0;
    expect(BADGE_DEFINITIONS.bigSaver.check(data)).toBe(false);
  });

  it('superSaver — unlocks when savings >= 50%', () => {
    const data = activeUser(1);
    data.incomes.incomesArray[0] = 4000;
    data.expenses.outflowsArray[0] = 1800; // saved 2200/4000 = 55%
    expect(BADGE_DEFINITIONS.superSaver.check(data)).toBe(true);
  });

  it('superSaver — locked when savings < 50%', () => {
    const data = activeUser(1);
    data.incomes.incomesArray[0] = 4000;
    data.expenses.outflowsArray[0] = 2100; // saved 1900/4000 = 47.5%
    expect(BADGE_DEFINITIONS.superSaver.check(data)).toBe(false);
  });

  it('superSaver — locked when outflows = 0', () => {
    const data = activeUser(1);
    data.incomes.incomesArray[0] = 4000;
    data.expenses.outflowsArray[0] = 0;
    expect(BADGE_DEFINITIONS.superSaver.check(data)).toBe(false);
  });
});

// ═══════════════════════════════════════════
// NET WORTH BADGES (7)
// ═══════════════════════════════════════════

describe('Net Worth Badges', () => {
  const testNetWorth = (badgeId, threshold) => {
    it(`${badgeId} — unlocks at ${threshold}`, () => {
      const data = activeUser(1);
      data.balances[0].balance.totalValue = threshold;
      expect(BADGE_DEFINITIONS[badgeId].check(data)).toBe(true);
    });

    it(`${badgeId} — locked below ${threshold}`, () => {
      const data = activeUser(1);
      data.balances[0].balance.totalValue = threshold - 1;
      expect(BADGE_DEFINITIONS[badgeId].check(data)).toBe(false);
    });

    it(`${badgeId} — locked with totalValue = 0`, () => {
      const data = emptyUser();
      expect(BADGE_DEFINITIONS[badgeId].check(data)).toBe(false);
    });
  };

  testNetWorth('netWorth1k', 1000);
  testNetWorth('netWorth10k', 10000);
  testNetWorth('netWorth50k', 50000);
  testNetWorth('netWorth100k', 100000);
  testNetWorth('netWorth250k', 250000);
  testNetWorth('netWorth500k', 500000);
  testNetWorth('netWorth1M', 1000000);
});

// ═══════════════════════════════════════════
// DIVERSIFICATION BADGES (7)
// ═══════════════════════════════════════════

describe('Diversification Badges', () => {
  it('firstInvestment — unlocks with any investment type > 0', () => {
    const data = emptyUser();
    data.balances[0].balance.stocks = 100;
    expect(BADGE_DEFINITIONS.firstInvestment.check(data)).toBe(true);
  });

  it('firstInvestment — locked with only bank/cash', () => {
    const data = emptyUser();
    data.balances[0].balance.bank = 10000;
    data.balances[0].balance.cash = 500;
    expect(BADGE_DEFINITIONS.firstInvestment.check(data)).toBe(false);
  });

  it('diversified3 — unlocks with 3+ asset types', () => {
    const data = emptyUser();
    data.balances[0].balance = { ...data.balances[0].balance, bank: 1000, cash: 500, stocks: 200 };
    expect(BADGE_DEFINITIONS.diversified3.check(data)).toBe(true);
  });

  it('diversified3 — locked with 2 types', () => {
    const data = emptyUser();
    data.balances[0].balance = { ...data.balances[0].balance, bank: 1000, cash: 500 };
    expect(BADGE_DEFINITIONS.diversified3.check(data)).toBe(false);
  });

  it('diversified5 — needs 5+ types', () => {
    const data = emptyUser();
    data.balances[0].balance = { ...data.balances[0].balance, bank: 1, cash: 1, stocks: 1, etf: 1, bonds: 1 };
    expect(BADGE_DEFINITIONS.diversified5.check(data)).toBe(true);
  });

  it('diversified7 — needs 7+ types', () => {
    const data = emptyUser();
    data.balances[0].balance = { ...data.balances[0].balance, bank: 1, cash: 1, stocks: 1, etf: 1, bonds: 1, funds: 1, gold: 1 };
    expect(BADGE_DEFINITIONS.diversified7.check(data)).toBe(true);
  });

  it('diversified7 — locked with 6 types', () => {
    const data = emptyUser();
    data.balances[0].balance = { ...data.balances[0].balance, bank: 1, cash: 1, stocks: 1, etf: 1, bonds: 1, funds: 1 };
    expect(BADGE_DEFINITIONS.diversified7.check(data)).toBe(false);
  });

  it('cryptoExplorer — unlocks with bitcoin > 0', () => {
    const data = emptyUser();
    data.balances[0].balance.bitcoin = 500;
    expect(BADGE_DEFINITIONS.cryptoExplorer.check(data)).toBe(true);
  });

  it('cryptoExplorer — unlocks with crypto > 0', () => {
    const data = emptyUser();
    data.balances[0].balance.crypto = 200;
    expect(BADGE_DEFINITIONS.cryptoExplorer.check(data)).toBe(true);
  });

  it('cryptoExplorer — locked with zero crypto', () => {
    const data = emptyUser();
    expect(BADGE_DEFINITIONS.cryptoExplorer.check(data)).toBe(false);
  });

  it('goldHolder — unlocks with gold > 0', () => {
    const data = emptyUser();
    data.balances[0].balance.gold = 1000;
    expect(BADGE_DEFINITIONS.goldHolder.check(data)).toBe(true);
  });

  it('goldHolder — locked with gold = 0', () => {
    expect(BADGE_DEFINITIONS.goldHolder.check(emptyUser())).toBe(false);
  });

  it('bondInvestor — unlocks with bonds > 0', () => {
    const data = emptyUser();
    data.balances[0].balance.bonds = 5000;
    expect(BADGE_DEFINITIONS.bondInvestor.check(data)).toBe(true);
  });

  it('bondInvestor — locked with bonds = 0', () => {
    expect(BADGE_DEFINITIONS.bondInvestor.check(emptyUser())).toBe(false);
  });
});

// ═══════════════════════════════════════════
// EMERGENCY FUND + GROWTH BADGES (4)
// ═══════════════════════════════════════════

describe('Emergency Fund & Growth Badges', () => {
  it('emergencyFundStarted — unlocks with emergencyFund > 0', () => {
    const data = emptyUser();
    data.balances[0].balance.emergencyFund = 100;
    expect(BADGE_DEFINITIONS.emergencyFundStarted.check(data)).toBe(true);
  });

  it('emergencyFundStarted — locked with emergencyFund = 0', () => {
    expect(BADGE_DEFINITIONS.emergencyFundStarted.check(emptyUser())).toBe(false);
  });

  it('emergencyFundGoal — unlocks when fund >= target (from goals)', () => {
    const data = emptyUser();
    data.balances[0].balance.emergencyFund = 15000;
    data.goals = [{ type: 'emergencyFund', target: 15000 }];
    expect(BADGE_DEFINITIONS.emergencyFundGoal.check(data)).toBe(true);
  });

  it('emergencyFundGoal — unlocks when fund >= target (from limits)', () => {
    const data = emptyUser();
    data.balances[0].balance.emergencyFund = 10000;
    data.limits.emergencyFundTarget = 10000;
    expect(BADGE_DEFINITIONS.emergencyFundGoal.check(data)).toBe(true);
  });

  it('emergencyFundGoal — locked when fund < target', () => {
    const data = emptyUser();
    data.balances[0].balance.emergencyFund = 5000;
    data.limits.emergencyFundTarget = 10000;
    expect(BADGE_DEFINITIONS.emergencyFundGoal.check(data)).toBe(false);
  });

  it('monthlyGrowth — unlocks when current > previous and both > 0', () => {
    const data = activeUser(2);
    data.balances[0].balance.totalValue = 100000;
    data.balances[1].balance.totalValue = 90000;
    expect(BADGE_DEFINITIONS.monthlyGrowth.check(data)).toBe(true);
  });

  it('monthlyGrowth — locked when previous month has 0 data', () => {
    const data = activeUser(1);
    data.balances[0].balance.totalValue = 100000;
    data.balances[1].balance.totalValue = 0;
    expect(BADGE_DEFINITIONS.monthlyGrowth.check(data)).toBe(false);
  });

  it('monthlyGrowth — locked when current <= previous', () => {
    const data = activeUser(2);
    data.balances[0].balance.totalValue = 90000;
    data.balances[1].balance.totalValue = 100000;
    expect(BADGE_DEFINITIONS.monthlyGrowth.check(data)).toBe(false);
  });

  it('yearlyGrowth — unlocks when current > 12-months-ago and both > 0', () => {
    const data = activeUser(12);
    data.balances[0].balance.totalValue = 110000;
    data.balances[11].balance.totalValue = 80000;
    expect(BADGE_DEFINITIONS.yearlyGrowth.check(data)).toBe(true);
  });

  it('yearlyGrowth — locked with < 12 months data', () => {
    const data = activeUser(11);
    expect(BADGE_DEFINITIONS.yearlyGrowth.check(data)).toBe(false);
  });

  it('yearlyGrowth — locked when yearAgo has no data', () => {
    const data = activeUser(12);
    data.balances[11].balance.totalValue = 0;
    expect(BADGE_DEFINITIONS.yearlyGrowth.check(data)).toBe(false);
  });
});

// ═══════════════════════════════════════════
// OUTFLOW MANAGEMENT BADGES (4)
// ═══════════════════════════════════════════

describe('Outflow Management Badges', () => {
  it('budgetMaster — unlocks with user-set limit and outflows within it', () => {
    const data = activeUser(1);
    data.limits.monthlySpendingLimit = 2500; // custom limit, not default 2000
    data.expenses.outflowsArray[0] = 2200;
    expect(BADGE_DEFINITIONS.budgetMaster.check(data)).toBe(true);
  });

  it('budgetMaster — locked with default limit 2000 (fallback)', () => {
    const data = activeUser(1);
    data.limits.monthlySpendingLimit = 2000; // default fallback
    data.expenses.outflowsArray[0] = 1500;
    expect(BADGE_DEFINITIONS.budgetMaster.check(data)).toBe(false);
  });

  it('budgetMaster — locked when outflows exceed limit', () => {
    const data = activeUser(1);
    data.limits.monthlySpendingLimit = 1500;
    data.expenses.outflowsArray[0] = 2000;
    expect(BADGE_DEFINITIONS.budgetMaster.check(data)).toBe(false);
  });

  it('budgetMaster — locked with zero outflows', () => {
    const data = emptyUser();
    data.limits.monthlySpendingLimit = 2500;
    expect(BADGE_DEFINITIONS.budgetMaster.check(data)).toBe(false);
  });

  it('frugalMonth — unlocks when current month outflows < previous (both > 0)', () => {
    const data = activeUser(2);
    data.expenses.outflowsArray[0] = 1500;
    data.expenses.outflowsArray[1] = 2000;
    expect(BADGE_DEFINITIONS.frugalMonth.check(data)).toBe(true);
  });

  it('frugalMonth — locked when previous month has no outflows', () => {
    const data = activeUser(1);
    data.expenses.outflowsArray[0] = 1500;
    data.expenses.outflowsArray[1] = 0;
    expect(BADGE_DEFINITIONS.frugalMonth.check(data)).toBe(false);
  });

  it('frugalMonth — locked when current >= previous', () => {
    const data = activeUser(2);
    data.expenses.outflowsArray[0] = 2200;
    data.expenses.outflowsArray[1] = 2000;
    expect(BADGE_DEFINITIONS.frugalMonth.check(data)).toBe(false);
  });

  it('spendingDown — unlocks with 3 decreasing months (all > 0)', () => {
    const data = activeUser(3);
    data.expenses.outflowsArray[0] = 1500;
    data.expenses.outflowsArray[1] = 1800;
    data.expenses.outflowsArray[2] = 2100;
    expect(BADGE_DEFINITIONS.spendingDown.check(data)).toBe(true);
  });

  it('spendingDown — locked when any month has 0 outflows', () => {
    const data = activeUser(3);
    data.expenses.outflowsArray[0] = 1500;
    data.expenses.outflowsArray[1] = 0;
    data.expenses.outflowsArray[2] = 2100;
    expect(BADGE_DEFINITIONS.spendingDown.check(data)).toBe(false);
  });

  it('spendingDown — locked when not strictly decreasing', () => {
    const data = activeUser(3);
    data.expenses.outflowsArray[0] = 1500;
    data.expenses.outflowsArray[1] = 1800;
    data.expenses.outflowsArray[2] = 1700; // not decreasing: 1800 > 1700 but we need [2] > [1]
    expect(BADGE_DEFINITIONS.spendingDown.check(data)).toBe(false);
  });

  it('categoryTracker — unlocks with 5+ categories', () => {
    const data = activeUser(1);
    data.expenses.totalOutflowsPerCategoryPerMonth = {
      0: { House: 800, Food: 600, Transport: 400, Entertainment: 200, Health: 100 },
    };
    expect(BADGE_DEFINITIONS.categoryTracker.check(data)).toBe(true);
  });

  it('categoryTracker — locked with < 5 categories', () => {
    const data = activeUser(1);
    data.expenses.totalOutflowsPerCategoryPerMonth = {
      0: { House: 800, Food: 600, Transport: 400 },
    };
    expect(BADGE_DEFINITIONS.categoryTracker.check(data)).toBe(false);
  });

  it('categoryTracker — locked with empty categories', () => {
    const data = emptyUser();
    expect(BADGE_DEFINITIONS.categoryTracker.check(data)).toBe(false);
  });
});

// ═══════════════════════════════════════════
// INCOME BADGES (3)
// ═══════════════════════════════════════════

describe('Income Badges', () => {
  it('firstIncome — unlocks with any income > 0', () => {
    const data = emptyUser();
    data.incomes.incomesArray[3] = 1500;
    expect(BADGE_DEFINITIONS.firstIncome.check(data)).toBe(true);
  });

  it('firstIncome — locked with all zeros', () => {
    expect(BADGE_DEFINITIONS.firstIncome.check(emptyUser())).toBe(false);
  });

  it('incomeGrowth — unlocks when current income > previous (both > 0)', () => {
    const data = activeUser(2);
    data.incomes.incomesArray[0] = 3000;
    data.incomes.incomesArray[1] = 2500;
    expect(BADGE_DEFINITIONS.incomeGrowth.check(data)).toBe(true);
  });

  it('incomeGrowth — locked when previous month income = 0', () => {
    const data = activeUser(1);
    data.incomes.incomesArray[0] = 3000;
    data.incomes.incomesArray[1] = 0;
    expect(BADGE_DEFINITIONS.incomeGrowth.check(data)).toBe(false);
  });

  it('incomeGrowth — locked when current <= previous', () => {
    const data = activeUser(2);
    data.incomes.incomesArray[0] = 2500;
    data.incomes.incomesArray[1] = 3000;
    expect(BADGE_DEFINITIONS.incomeGrowth.check(data)).toBe(false);
  });

  it('steadyIncome — unlocks with 3 consecutive months of income > 0', () => {
    const data = activeUser(3);
    expect(BADGE_DEFINITIONS.steadyIncome.check(data)).toBe(true);
  });

  it('steadyIncome — locked when 2nd month has no income', () => {
    const data = activeUser(3);
    data.incomes.incomesArray[1] = 0;
    expect(BADGE_DEFINITIONS.steadyIncome.check(data)).toBe(false);
  });

  it('steadyIncome — locked with all zeros', () => {
    expect(BADGE_DEFINITIONS.steadyIncome.check(emptyUser())).toBe(false);
  });
});

// ═══════════════════════════════════════════
// GOALS BADGES (3)
// ═══════════════════════════════════════════

describe('Goals Badges', () => {
  it('goalSetter — unlocks with at least 1 goal', () => {
    const data = emptyUser();
    data.goals = [{ id: 1, name: 'Test', target: 5000, current: 0 }];
    expect(BADGE_DEFINITIONS.goalSetter.check(data)).toBe(true);
  });

  it('goalSetter — locked with empty goals', () => {
    expect(BADGE_DEFINITIONS.goalSetter.check(emptyUser())).toBe(false);
  });

  it('goalAchiever — unlocks when current >= target', () => {
    const data = emptyUser();
    data.goals = [{ id: 1, target: 5000, current: 5000 }];
    expect(BADGE_DEFINITIONS.goalAchiever.check(data)).toBe(true);
  });

  it('goalAchiever — locked when current < target', () => {
    const data = emptyUser();
    data.goals = [{ id: 1, target: 5000, current: 4999 }];
    expect(BADGE_DEFINITIONS.goalAchiever.check(data)).toBe(false);
  });

  it('multiGoal — unlocks with 3+ goals', () => {
    const data = emptyUser();
    data.goals = [{ id: 1 }, { id: 2 }, { id: 3 }];
    expect(BADGE_DEFINITIONS.multiGoal.check(data)).toBe(true);
  });

  it('multiGoal — locked with 2 goals', () => {
    const data = emptyUser();
    data.goals = [{ id: 1 }, { id: 2 }];
    expect(BADGE_DEFINITIONS.multiGoal.check(data)).toBe(false);
  });
});

// ═══════════════════════════════════════════
// COMMUNITY / RANKINGS BADGES (2)
// ═══════════════════════════════════════════

describe('Community Badges', () => {
  it('topQuartile — unlocks with ranking >= 75 AND totalValue > 0', () => {
    const data = activeUser(1);
    data.rankings = { balance: 80 };
    expect(BADGE_DEFINITIONS.topQuartile.check(data)).toBe(true);
  });

  it('topQuartile — locked when totalValue = 0 even with high ranking', () => {
    const data = emptyUser();
    data.rankings = { balance: 100, incomes: 100 };
    expect(BADGE_DEFINITIONS.topQuartile.check(data)).toBe(false);
  });

  it('topQuartile — locked when ranking < 75', () => {
    const data = activeUser(1);
    data.rankings = { balance: 70, incomes: 60 };
    expect(BADGE_DEFINITIONS.topQuartile.check(data)).toBe(false);
  });

  it('top10Percent — unlocks with ranking >= 90 AND totalValue > 0', () => {
    const data = activeUser(1);
    data.rankings = { balance: 92 };
    expect(BADGE_DEFINITIONS.top10Percent.check(data)).toBe(true);
  });

  it('top10Percent — locked with ranking < 90', () => {
    const data = activeUser(1);
    data.rankings = { balance: 85 };
    expect(BADGE_DEFINITIONS.top10Percent.check(data)).toBe(false);
  });

  it('top10Percent — locked when totalValue = 0', () => {
    const data = emptyUser();
    data.rankings = { balance: 95 };
    expect(BADGE_DEFINITIONS.top10Percent.check(data)).toBe(false);
  });
});

// ═══════════════════════════════════════════
// PROFILE BADGE (1)
// ═══════════════════════════════════════════

describe('Profile Badge', () => {
  it('profileComplete — unlocks when all required fields have key >= 0', () => {
    const data = emptyUser();
    data.profile = {
      nationality: { key: 107, value: 'Italia' },
      job: { key: 5, value: 'Sviluppatore' },
      jobType: { key: 2, value: 'Full-time' },
      age: { key: 3, value: '25-34' },
      livingSituation: { key: 1, value: 'Single' },
      housingType: { key: 0, value: 'Affitto' },
    };
    expect(BADGE_DEFINITIONS.profileComplete.check(data)).toBe(true);
  });

  it('profileComplete — locked when any field has key: -1', () => {
    const data = emptyUser();
    data.profile = {
      nationality: { key: 107, value: 'Italia' },
      job: { key: 5, value: 'Sviluppatore' },
      jobType: { key: -1, value: '' }, // not set
      age: { key: 3, value: '25-34' },
      livingSituation: { key: 1, value: 'Single' },
      housingType: { key: 0, value: 'Affitto' },
    };
    expect(BADGE_DEFINITIONS.profileComplete.check(data)).toBe(false);
  });

  it('profileComplete — locked with default empty profile', () => {
    expect(BADGE_DEFINITIONS.profileComplete.check(emptyUser())).toBe(false);
  });

  it('profileComplete — locked with no profile at all', () => {
    const data = emptyUser();
    delete data.profile;
    expect(BADGE_DEFINITIONS.profileComplete.check(data)).toBe(false);
  });
});

// ═══════════════════════════════════════════
// EDGE CASES
// ═══════════════════════════════════════════

describe('Edge Cases', () => {
  it('handles minimal but structurally valid userData without throwing', () => {
    // The app always provides a full userData structure, but badges should
    // not crash even with the minimal required shape (empty arrays/objects)
    const minimal = {
      balances: [{ balance: { totalValue: 0 } }],
      incomes: { incomesArray: [0] },
      expenses: { outflowsArray: [0], totalOutflowsPerCategoryPerMonth: {} },
      goals: [],
      limits: {},
      rankings: {},
      profile: {},
    };
    Object.entries(BADGE_DEFINITIONS).forEach(([_key, def]) => {
      expect(() => def.check(minimal)).not.toThrow();
    });
  });

  it('handles missing subfields gracefully', () => {
    const minimalData = { balances: [], incomes: {}, expenses: {}, goals: [], limits: {}, rankings: {}, profile: {} };
    Object.entries(BADGE_DEFINITIONS).forEach(([_key, def]) => {
      expect(() => def.check(minimalData)).not.toThrow();
    });
  });

  it('profileComplete key=0 should count as set (not just key > 0)', () => {
    const data = emptyUser();
    data.profile = {
      nationality: { key: 0, value: 'First option' },
      job: { key: 0, value: 'First job' },
      jobType: { key: 0, value: 'First type' },
      age: { key: 0, value: 'First age range' },
      livingSituation: { key: 0, value: 'First situation' },
      housingType: { key: 0, value: 'First housing' },
    };
    // key=0 is valid (first option in dropdown), only key=-1 means unset
    expect(BADGE_DEFINITIONS.profileComplete.check(data)).toBe(true);
  });
});
