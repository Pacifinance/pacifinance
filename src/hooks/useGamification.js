/**
 * useGamification Hook
 * 
 * Calculates achievements, badges, and streaks entirely client-side
 * by analyzing userData (balances, expenses, incomes, goals, rankings, profile).
 * No backend changes needed.
 * 
 * 44 badges across 10 categories:
 * - Data Consistency (7): tracking how long and consistently a user enters data
 * - Savings (6): saving money relative to income
 * - Net Worth (7): total patrimony milestones
 * - Diversification (7): asset type variety and specific investments
 * - Emergency & Growth (4): emergency fund and patrimony growth
 * - Outflow Management (4): controlling and reducing outflows
 * - Income (3): income tracking milestones
 * - Goals (3): setting and achieving financial goals
 * - Community (2): ranking among other users
 * - Profile (1): completing user profile
 */

import { useMemo, useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

// ═══════════════════════════════════════════
// Badge Categories
// ═══════════════════════════════════════════
import { DEFAULT_MONTHLY_SPENDING_LIMIT } from '../data/financeDefaults';

export const BADGE_CATEGORIES = {
  dataConsistency: 'dataConsistency',
  savings: 'savings',
  netWorth: 'netWorth',
  diversification: 'diversification',
  emergencyGrowth: 'emergencyGrowth',
  outflowManagement: 'outflowManagement',
  income: 'income',
  goals: 'goals',
  community: 'community',
  profile: 'profile',
};

// Category display order
export const BADGE_CATEGORY_ORDER = [
  'dataConsistency',
  'savings',
  'netWorth',
  'diversification',
  'emergencyGrowth',
  'outflowManagement',
  'income',
  'goals',
  'community',
  'profile',
];

// ═══════════════════════════════════════════
// Badge Definitions (44 total)
// Exported for testing
// ═══════════════════════════════════════════
export const BADGE_DEFINITIONS = {

  // ─────────────────────────────────────────
  // DATA CONSISTENCY (7 badges)
  // Check months with ACTUAL data (totalValue > 0), not just array length
  // ─────────────────────────────────────────
  firstMonth: {
    id: 'firstMonth',
    icon: '🌱',
    category: BADGE_CATEGORIES.dataConsistency,
    check: (data) => countMonthsWithData(data) >= 1,
  },
  threeMonths: {
    id: 'threeMonths',
    icon: '📊',
    category: BADGE_CATEGORIES.dataConsistency,
    check: (data) => countMonthsWithData(data) >= 3,
  },
  sixMonths: {
    id: 'sixMonths',
    icon: '📈',
    category: BADGE_CATEGORIES.dataConsistency,
    check: (data) => countMonthsWithData(data) >= 6,
  },
  oneYear: {
    id: 'oneYear',
    icon: '🏆',
    category: BADGE_CATEGORIES.dataConsistency,
    check: (data) => countMonthsWithData(data) >= 12,
  },
  twoYears: {
    id: 'twoYears',
    icon: '🗓️',
    category: BADGE_CATEGORIES.dataConsistency,
    check: (data) => countMonthsWithData(data) >= 24,
  },
  dataStreak6: {
    id: 'dataStreak6',
    icon: '📅',
    category: BADGE_CATEGORIES.dataConsistency,
    check: (data) => calculateDataStreak(data) >= 6,
  },
  dataStreak12: {
    id: 'dataStreak12',
    icon: '🔗',
    category: BADGE_CATEGORIES.dataConsistency,
    check: (data) => calculateDataStreak(data) >= 12,
  },

  // ─────────────────────────────────────────
  // SAVINGS (6 badges)
  // Require income > 0 AND income > outflows (can't "save" with zero income)
  // ─────────────────────────────────────────
  firstSave: {
    id: 'firstSave',
    icon: '💰',
    category: BADGE_CATEGORIES.savings,
    check: (data) => {
      const incomes = data.incomes?.incomesArray || [];
      const outflows = data.expenses?.outflowsArray || [];
      return incomes.some((inc, i) => inc > 0 && inc > (outflows[i] || 0));
    },
  },
  savingsStreak3: {
    id: 'savingsStreak3',
    icon: '🔥',
    category: BADGE_CATEGORIES.savings,
    check: (data) => calculateSavingsStreak(data) >= 3,
  },
  savingsStreak6: {
    id: 'savingsStreak6',
    icon: '⭐',
    category: BADGE_CATEGORIES.savings,
    check: (data) => calculateSavingsStreak(data) >= 6,
  },
  savingsStreak12: {
    id: 'savingsStreak12',
    icon: '💪',
    category: BADGE_CATEGORIES.savings,
    check: (data) => calculateSavingsStreak(data) >= 12,
  },
  bigSaver: {
    id: 'bigSaver',
    icon: '🤑',
    category: BADGE_CATEGORIES.savings,
    check: (data) => {
      const incomes = data.incomes?.incomesArray || [];
      const outflows = data.expenses?.outflowsArray || [];
      return incomes.some((inc, i) => {
        if (inc <= 0) return false;
        const spent = outflows[i] || 0;
        if (spent <= 0) return false; // Must have actual outflows too
        const saved = inc - spent;
        return saved / inc >= 0.3;
      });
    },
  },
  superSaver: {
    id: 'superSaver',
    icon: '🏦',
    category: BADGE_CATEGORIES.savings,
    check: (data) => {
      const incomes = data.incomes?.incomesArray || [];
      const outflows = data.expenses?.outflowsArray || [];
      return incomes.some((inc, i) => {
        if (inc <= 0) return false;
        const spent = outflows[i] || 0;
        if (spent <= 0) return false; // Must have actual outflows too
        const saved = inc - spent;
        return saved / inc >= 0.5;
      });
    },
  },

  // ─────────────────────────────────────────
  // NET WORTH MILESTONES (7 badges)
  // ─────────────────────────────────────────
  netWorth1k: {
    id: 'netWorth1k',
    icon: '💵',
    category: BADGE_CATEGORIES.netWorth,
    check: (data) => getTotalFromBalance(data) >= 1000,
  },
  netWorth10k: {
    id: 'netWorth10k',
    icon: '💎',
    category: BADGE_CATEGORIES.netWorth,
    check: (data) => getTotalFromBalance(data) >= 10000,
  },
  netWorth50k: {
    id: 'netWorth50k',
    icon: '🚀',
    category: BADGE_CATEGORIES.netWorth,
    check: (data) => getTotalFromBalance(data) >= 50000,
  },
  netWorth100k: {
    id: 'netWorth100k',
    icon: '👑',
    category: BADGE_CATEGORIES.netWorth,
    check: (data) => getTotalFromBalance(data) >= 100000,
  },
  netWorth250k: {
    id: 'netWorth250k',
    icon: '🏰',
    category: BADGE_CATEGORIES.netWorth,
    check: (data) => getTotalFromBalance(data) >= 250000,
  },
  netWorth500k: {
    id: 'netWorth500k',
    icon: '🌍',
    category: BADGE_CATEGORIES.netWorth,
    check: (data) => getTotalFromBalance(data) >= 500000,
  },
  netWorth1M: {
    id: 'netWorth1M',
    icon: '🏛️',
    category: BADGE_CATEGORIES.netWorth,
    check: (data) => getTotalFromBalance(data) >= 1000000,
  },

  // ─────────────────────────────────────────
  // DIVERSIFICATION (7 badges)
  // ─────────────────────────────────────────
  firstInvestment: {
    id: 'firstInvestment',
    icon: '📉',
    category: BADGE_CATEGORIES.diversification,
    check: (data) => {
      const balance = data.balances?.[0]?.balance;
      if (!balance) return false;
      const investmentTypes = ['stocks', 'etf', 'bitcoin', 'crypto', 'bonds', 'funds', 'gold'];
      return investmentTypes.some(type => (balance[type] || 0) > 0);
    },
  },
  diversified3: {
    id: 'diversified3',
    icon: '🎯',
    category: BADGE_CATEGORIES.diversification,
    check: (data) => countActiveAssetTypes(data) >= 3,
  },
  diversified5: {
    id: 'diversified5',
    icon: '🌟',
    category: BADGE_CATEGORIES.diversification,
    check: (data) => countActiveAssetTypes(data) >= 5,
  },
  diversified7: {
    id: 'diversified7',
    icon: '🎨',
    category: BADGE_CATEGORIES.diversification,
    check: (data) => countActiveAssetTypes(data) >= 7,
  },
  cryptoExplorer: {
    id: 'cryptoExplorer',
    icon: '₿',
    category: BADGE_CATEGORIES.diversification,
    check: (data) => {
      const balance = data.balances?.[0]?.balance;
      return (balance?.bitcoin || 0) > 0 || (balance?.crypto || 0) > 0;
    },
  },
  goldHolder: {
    id: 'goldHolder',
    icon: '🥇',
    category: BADGE_CATEGORIES.diversification,
    check: (data) => (data.balances?.[0]?.balance?.gold || 0) > 0,
  },
  bondInvestor: {
    id: 'bondInvestor',
    icon: '📜',
    category: BADGE_CATEGORIES.diversification,
    check: (data) => (data.balances?.[0]?.balance?.bonds || 0) > 0,
  },

  // ─────────────────────────────────────────
  // EMERGENCY FUND + GROWTH (4 badges)
  // ─────────────────────────────────────────
  emergencyFundStarted: {
    id: 'emergencyFundStarted',
    icon: '🛡️',
    category: BADGE_CATEGORIES.emergencyGrowth,
    check: (data) => (data.balances?.[0]?.balance?.emergencyFund || 0) > 0,
  },
  emergencyFundGoal: {
    id: 'emergencyFundGoal',
    icon: '🏅',
    category: BADGE_CATEGORIES.emergencyGrowth,
    check: (data) => {
      const fund = data.balances?.[0]?.balance?.emergencyFund || 0;
      const target = data.goals?.find(g => g.type === 'emergencyFund')?.target || 
                     data.limits?.emergencyFundTarget;
      return target && fund >= target;
    },
  },
  monthlyGrowth: {
    id: 'monthlyGrowth',
    icon: '⬆️',
    category: BADGE_CATEGORIES.emergencyGrowth,
    check: (data) => {
      if (data.balances?.length < 2) return false;
      const current = data.balances[0]?.balance?.totalValue || 0;
      const previous = data.balances[1]?.balance?.totalValue || 0;
      // Both months must have actual data (totalValue > 0)
      return current > 0 && previous > 0 && current > previous;
    },
  },
  yearlyGrowth: {
    id: 'yearlyGrowth',
    icon: '🎆',
    category: BADGE_CATEGORIES.emergencyGrowth,
    check: (data) => {
      if (data.balances?.length < 12) return false;
      const current = data.balances[0]?.balance?.totalValue || 0;
      const yearAgo = data.balances[11]?.balance?.totalValue || 0;
      // Both must have actual data
      return current > 0 && yearAgo > 0 && current > yearAgo;
    },
  },

  // ─────────────────────────────────────────
  // OUTFLOW MANAGEMENT (4 badges)
  // ─────────────────────────────────────────
  budgetMaster: {
    id: 'budgetMaster',
    icon: '💼',
    category: BADGE_CATEGORIES.outflowManagement,
    check: (data) => {
      const limit = data.limits?.monthlySpendingLimit;
      const outflows = data.expenses?.outflowsArray?.[0];
      // Require outflows > 0 (actual data) and a real user-set limit
      // Default fallback — check that limit was explicitly set via goalsAndLimits
      const hasUserSetLimit = data.limits?.monthlySpendingLimit && 
                               data.limits?.monthlySpendingLimit !== DEFAULT_MONTHLY_SPENDING_LIMIT;
      return hasUserSetLimit && limit > 0 && outflows > 0 && outflows <= limit;
    },
  },
  frugalMonth: {
    id: 'frugalMonth',
    icon: '✂️',
    category: BADGE_CATEGORIES.outflowManagement,
    check: (data) => {
      const outflows = data.expenses?.outflowsArray || [];
      // Both months must have actual outflow data
      return outflows.length >= 2 && outflows[0] > 0 && outflows[1] > 0 && outflows[0] < outflows[1];
    },
  },
  spendingDown: {
    id: 'spendingDown',
    icon: '📉',
    category: BADGE_CATEGORIES.outflowManagement,
    check: (data) => {
      const outflows = data.expenses?.outflowsArray || [];
      // All 3 months must have actual outflow data and be decreasing
      return outflows.length >= 3 && 
             outflows[0] > 0 && outflows[1] > 0 && outflows[2] > 0 &&
             outflows[0] < outflows[1] && outflows[1] < outflows[2];
    },
  },
  categoryTracker: {
    id: 'categoryTracker',
    icon: '📋',
    category: BADGE_CATEGORIES.outflowManagement,
    check: (data) => countActiveCategories(data) >= 5,
  },

  // ─────────────────────────────────────────
  // INCOME (3 badges)
  // ─────────────────────────────────────────
  firstIncome: {
    id: 'firstIncome',
    icon: '📥',
    category: BADGE_CATEGORIES.income,
    check: (data) => {
      const incomes = data.incomes?.incomesArray || [];
      return incomes.some(inc => inc > 0);
    },
  },
  incomeGrowth: {
    id: 'incomeGrowth',
    icon: '💹',
    category: BADGE_CATEGORIES.income,
    check: (data) => {
      const incomes = data.incomes?.incomesArray || [];
      // Both months must have actual income data and current > previous
      return incomes.length >= 2 && incomes[0] > 0 && incomes[1] > 0 && incomes[0] > incomes[1];
    },
  },
  steadyIncome: {
    id: 'steadyIncome',
    icon: '🔄',
    category: BADGE_CATEGORIES.income,
    check: (data) => {
      const incomes = data.incomes?.incomesArray || [];
      let count = 0;
      for (let i = 0; i < incomes.length; i++) {
        if (incomes[i] > 0) count++;
        else break;
      }
      return count >= 3;
    },
  },

  // ─────────────────────────────────────────
  // GOALS (3 badges)
  // ─────────────────────────────────────────
  goalSetter: {
    id: 'goalSetter',
    icon: '🏁',
    category: BADGE_CATEGORIES.goals,
    check: (data) => (data.goals?.length || 0) >= 1,
  },
  goalAchiever: {
    id: 'goalAchiever',
    icon: '🥅',
    category: BADGE_CATEGORIES.goals,
    check: (data) => data.goals?.some(g => g.current >= g.target) || false,
  },
  multiGoal: {
    id: 'multiGoal',
    icon: '📝',
    category: BADGE_CATEGORIES.goals,
    check: (data) => (data.goals?.length || 0) >= 3,
  },

  // ─────────────────────────────────────────
  // COMMUNITY / RANKINGS (2 badges)
  // ─────────────────────────────────────────
  topQuartile: {
    id: 'topQuartile',
    icon: '🏅',
    category: BADGE_CATEGORIES.community,
    check: (data) => {
      // Must have actual balance data to qualify for rankings
      if (getTotalFromBalance(data) <= 0) return false;
      const r = data.rankings || {};
      return Object.values(r).some(v => typeof v === 'number' && v >= 75);
    },
  },
  top10Percent: {
    id: 'top10Percent',
    icon: '🌟',
    category: BADGE_CATEGORIES.community,
    check: (data) => {
      // Must have actual balance data to qualify for rankings
      if (getTotalFromBalance(data) <= 0) return false;
      const r = data.rankings || {};
      return Object.values(r).some(v => typeof v === 'number' && v >= 90);
    },
  },

  // ─────────────────────────────────────────
  // PROFILE (1 badge)
  // ─────────────────────────────────────────
  profileComplete: {
    id: 'profileComplete',
    icon: '👤',
    category: BADGE_CATEGORIES.profile,
    check: (data) => {
      const profile = data.profile;
      if (!profile) return false;
      // Profile fields use key: -1 when not set, key >= 0 when set
      const requiredFields = ['nationality', 'job', 'jobType', 'age', 'livingSituation', 'housingType'];
      return requiredFields.every(field => {
        const fieldData = profile[field];
        return fieldData && fieldData.key !== undefined && fieldData.key !== -1;
      });
    },
  },
};

// ═══════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════

// Get total balance value
function getTotalFromBalance(data) {
  return data.balances?.[0]?.balance?.totalValue || 0;
}

// Count months that actually have balance data (totalValue > 0)
// This is the correct way to count data entries — balances array always has 13 slots
// filled by the backend, but empty months have totalValue = 0
function countMonthsWithData(data) {
  const balances = data.balances || [];
  return balances.filter(b => {
    const bal = b?.balance;
    if (!bal) return false;
    // A month has data if totalValue > 0, or if any individual balance field > 0
    if (bal.totalValue > 0) return true;
    // Fallback: check individual fields in case totalValue isn't computed
    const fields = ['bank', 'cash', 'digitalServices', 'emergencyFund', 'stocks', 'etf', 'bitcoin', 'crypto', 'bonds', 'funds', 'gold'];
    return fields.some(f => (bal[f] || 0) > 0);
  }).length;
}

// Count active asset types with value > 0
function countActiveAssetTypes(data) {
  const balance = data.balances?.[0]?.balance;
  if (!balance) return 0;
  const assetTypes = ['bank', 'cash', 'digitalServices', 'emergencyFund', 'stocks', 'etf', 'bitcoin', 'crypto', 'bonds', 'funds', 'gold'];
  return assetTypes.filter(type => (balance[type] || 0) > 0).length;
}

// Calculate consecutive months with positive savings (income > outflows)
// Requires BOTH income > 0 AND income > outflows (can't "save" with zero income)
function calculateSavingsStreak(data) {
  const incomes = data.incomes?.incomesArray || [];
  const outflows = data.expenses?.outflowsArray || [];
  let streak = 0;
  for (let i = 0; i < Math.min(incomes.length, outflows.length); i++) {
    // Must have actual income data to count as a savings month
    if (incomes[i] > 0 && incomes[i] > outflows[i]) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// Calculate data entry streak (consecutive months with ACTUAL balance data)
// The backend returns 13 months with dates regardless of whether user entered data,
// so we must check that each month actually has balance values > 0
function calculateDataStreak(data) {
  const balances = data.balances || [];
  if (balances.length === 0) return 0;

  let streak = 0;
  const now = new Date();
  
  for (let i = 0; i < balances.length; i++) {
    const entry = balances[i];
    const balanceDate = new Date(entry.date);
    const expectedMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
    
    // Check date alignment
    const dateMatches = balanceDate.getFullYear() === expectedMonth.getFullYear() &&
                        balanceDate.getMonth() === expectedMonth.getMonth();
    
    if (!dateMatches) break;
    
    // Check that this month has actual data (not just an empty placeholder)
    const bal = entry.balance;
    if (!bal) break;
    
    const hasData = bal.totalValue > 0 || 
      ['bank', 'cash', 'digitalServices', 'emergencyFund', 'stocks', 'etf', 'bitcoin', 'crypto', 'bonds', 'funds', 'gold']
        .some(f => (bal[f] || 0) > 0);
    
    if (hasData) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// Count unique outflow categories with spending > 0 in the current month
function countActiveCategories(data) {
  const categories = data.expenses?.totalOutflowsPerCategoryPerMonth;
  if (!categories) return 0;
  const currentMonth = categories[0] || {};
  return Object.keys(currentMonth).filter(key => currentMonth[key] > 0).length;
}

/**
 * Main gamification hook
 * @param {Object} userData - User data from UserContext
 * @returns {Object} Gamification data: badges, stats, level, categories
 */
export const useGamification = (userData) => {
  const { translations } = useContext(LanguageContext);

  // Dynamic badge translations - auto-maps all BADGE_DEFINITIONS keys
  const badgeTranslations = useMemo(() => {
    const result = {};
    for (const key of Object.keys(BADGE_DEFINITIONS)) {
      result[key] = {
        name: translations?.gamification?.badges?.[key]?.name || key,
        description: translations?.gamification?.badges?.[key]?.description || '',
      };
    }
    return result;
  }, [translations]);

  // Category name translations
  const categoryTranslations = useMemo(() => {
    const cats = translations?.gamification?.categories || {};
    return {
      dataConsistency: cats.dataConsistency || 'Costanza',
      savings: cats.savings || 'Risparmio',
      netWorth: cats.netWorth || 'Patrimonio',
      diversification: cats.diversification || 'Diversificazione',
      emergencyGrowth: cats.emergencyGrowth || 'Emergenza e Crescita',
      outflowManagement: cats.outflowManagement || 'Gestione Uscite',
      income: cats.income || 'Entrate',
      goals: cats.goals || 'Obiettivi',
      community: cats.community || 'Community',
      profile: cats.profile || 'Profilo',
    };
  }, [translations]);

  const gamificationData = useMemo(() => {
    if (!userData) {
      return {
        badges: [], unlockedBadges: [], lockedBadges: [],
        stats: {}, level: 1, points: 0, nextLevelPoints: 30,
        categories: BADGE_CATEGORY_ORDER,
        categoryTranslations: {},
      };
    }

    // Calculate all badges
    const allBadges = Object.entries(BADGE_DEFINITIONS).map(([key, def]) => {
      const unlocked = def.check(userData);
      return {
        id: def.id,
        icon: def.icon,
        category: def.category,
        name: badgeTranslations[key]?.name || key,
        description: badgeTranslations[key]?.description || '',
        unlocked,
      };
    });

    const unlockedBadges = allBadges.filter(b => b.unlocked);
    const lockedBadges = allBadges.filter(b => !b.unlocked);

    // Calculate points (10 per badge)
    const points = unlockedBadges.length * 10;

    // Calculate level (every 30 points = 1 level)
    const level = Math.floor(points / 30) + 1;
    const nextLevelPoints = level * 30;

    // Calculate stats
    const savingsStreak = calculateSavingsStreak(userData);
    const dataStreak = calculateDataStreak(userData);
    const activeAssets = countActiveAssetTypes(userData);
    const totalNetWorth = getTotalFromBalance(userData);

    const stats = {
      savingsStreak,
      dataStreak,
      activeAssets,
      totalNetWorth,
      totalBadges: allBadges.length,
      unlockedCount: unlockedBadges.length,
      completionPercentage: Math.round((unlockedBadges.length / allBadges.length) * 100),
    };

    return {
      badges: allBadges,
      unlockedBadges,
      lockedBadges,
      stats,
      level,
      points,
      nextLevelPoints,
      categories: BADGE_CATEGORY_ORDER,
      categoryTranslations,
    };
  }, [userData, badgeTranslations, categoryTranslations]);

  return gamificationData;
};
