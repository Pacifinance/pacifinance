/**
 * useGamification Hook
 * 
 * Calculates achievements, badges, and streaks entirely client-side
 * by analyzing userData (balances, expenses, incomes, goals).
 * No backend changes needed.
 */

import { useMemo, useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

// Badge definitions with thresholds
const BADGE_DEFINITIONS = {
  // Data consistency badges
  firstMonth: {
    id: 'firstMonth',
    icon: '🌱',
    check: (data) => data.balances?.length >= 1,
  },
  threeMonths: {
    id: 'threeMonths',
    icon: '📊',
    check: (data) => data.balances?.length >= 3,
  },
  sixMonths: {
    id: 'sixMonths',
    icon: '📈',
    check: (data) => data.balances?.length >= 6,
  },
  oneYear: {
    id: 'oneYear',
    icon: '🏆',
    check: (data) => data.balances?.length >= 12,
  },

  // Savings badges
  firstSave: {
    id: 'firstSave',
    icon: '💰',
    check: (data) => {
      const incomes = data.incomes?.incomesArray || [];
      const outflows = data.expenses?.outflowsArray || [];
      return incomes.some((inc, i) => inc > (outflows[i] || 0));
    },
  },
  savingsStreak3: {
    id: 'savingsStreak3',
    icon: '🔥',
    check: (data) => {
      const streak = calculateSavingsStreak(data);
      return streak >= 3;
    },
  },
  savingsStreak6: {
    id: 'savingsStreak6',
    icon: '⭐',
    check: (data) => {
      const streak = calculateSavingsStreak(data);
      return streak >= 6;
    },
  },

  // Net worth milestones
  netWorth1k: {
    id: 'netWorth1k',
    icon: '💵',
    check: (data) => getTotalFromBalance(data) >= 1000,
  },
  netWorth10k: {
    id: 'netWorth10k',
    icon: '💎',
    check: (data) => getTotalFromBalance(data) >= 10000,
  },
  netWorth50k: {
    id: 'netWorth50k',
    icon: '🚀',
    check: (data) => getTotalFromBalance(data) >= 50000,
  },
  netWorth100k: {
    id: 'netWorth100k',
    icon: '👑',
    check: (data) => getTotalFromBalance(data) >= 100000,
  },

  // Diversification badges
  firstInvestment: {
    id: 'firstInvestment',
    icon: '📉',
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
    check: (data) => countActiveAssetTypes(data) >= 3,
  },
  diversified5: {
    id: 'diversified5',
    icon: '🌟',
    check: (data) => countActiveAssetTypes(data) >= 5,
  },

  // Emergency fund badges
  emergencyFundStarted: {
    id: 'emergencyFundStarted',
    icon: '🛡️',
    check: (data) => (data.balances?.[0]?.balance?.emergencyFund || 0) > 0,
  },
  emergencyFundGoal: {
    id: 'emergencyFundGoal',
    icon: '🏅',
    check: (data) => {
      const fund = data.balances?.[0]?.balance?.emergencyFund || 0;
      const target = data.goals?.find(g => g.type === 'emergencyFund')?.target || 
                     data.limits?.emergencyFundTarget;
      return target && fund >= target;
    },
  },

  // Growth badges
  monthlyGrowth: {
    id: 'monthlyGrowth',
    icon: '📈',
    check: (data) => {
      if (data.balances?.length < 2) return false;
      const current = data.balances[0]?.balance?.totalValue || 0;
      const previous = data.balances[1]?.balance?.totalValue || 0;
      return current > previous;
    },
  },
  yearlyGrowth: {
    id: 'yearlyGrowth',
    icon: '🎆',
    check: (data) => {
      if (data.balances?.length < 12) return false;
      const current = data.balances[0]?.balance?.totalValue || 0;
      const yearAgo = data.balances[11]?.balance?.totalValue || 0;
      return yearAgo > 0 && current > yearAgo;
    },
  },
};

// Helper: get total balance value
function getTotalFromBalance(data) {
  return data.balances?.[0]?.balance?.totalValue || 0;
}

// Helper: count active asset types with value > 0
function countActiveAssetTypes(data) {
  const balance = data.balances?.[0]?.balance;
  if (!balance) return 0;
  const assetTypes = ['bank', 'cash', 'digitalServices', 'emergencyFund', 'stocks', 'etf', 'bitcoin', 'crypto', 'bonds', 'funds', 'gold'];
  return assetTypes.filter(type => (balance[type] || 0) > 0).length;
}

// Helper: calculate consecutive months with positive savings
function calculateSavingsStreak(data) {
  const incomes = data.incomes?.incomesArray || [];
  const outflows = data.expenses?.outflowsArray || [];
  let streak = 0;
  for (let i = 0; i < Math.min(incomes.length, outflows.length); i++) {
    if (incomes[i] > outflows[i]) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// Helper: calculate data entry streak (consecutive months with balance data)
function calculateDataStreak(data) {
  const balances = data.balances || [];
  if (balances.length === 0) return 0;

  let streak = 0;
  const now = new Date();
  
  for (let i = 0; i < balances.length; i++) {
    const balanceDate = new Date(balances[i].date);
    const expectedMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
    
    // Check if the balance month matches expected month (same year + month)
    if (balanceDate.getFullYear() === expectedMonth.getFullYear() &&
        balanceDate.getMonth() === expectedMonth.getMonth()) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Main gamification hook
 * @param {Object} userData - User data from UserContext
 * @returns {Object} Gamification data: badges, stats, level
 */
export const useGamification = (userData) => {
  const { translations } = useContext(LanguageContext);

  // Translation keys for badge names and descriptions
  const badgeTranslations = useMemo(() => ({
    firstMonth: {
      name: translations?.gamification?.badges?.firstMonth?.name || 'Primo Passo',
      description: translations?.gamification?.badges?.firstMonth?.description || 'Inserisci il tuo primo mese di dati',
    },
    threeMonths: {
      name: translations?.gamification?.badges?.threeMonths?.name || 'Costante',
      description: translations?.gamification?.badges?.threeMonths?.description || '3 mesi di dati inseriti',
    },
    sixMonths: {
      name: translations?.gamification?.badges?.sixMonths?.name || 'Affidabile',
      description: translations?.gamification?.badges?.sixMonths?.description || '6 mesi di dati inseriti',
    },
    oneYear: {
      name: translations?.gamification?.badges?.oneYear?.name || 'Veterano',
      description: translations?.gamification?.badges?.oneYear?.description || 'Un anno completo di dati',
    },
    firstSave: {
      name: translations?.gamification?.badges?.firstSave?.name || 'Risparmiatore',
      description: translations?.gamification?.badges?.firstSave?.description || 'Primo mese con risparmio positivo',
    },
    savingsStreak3: {
      name: translations?.gamification?.badges?.savingsStreak3?.name || 'In Serie',
      description: translations?.gamification?.badges?.savingsStreak3?.description || '3 mesi consecutivi di risparmio',
    },
    savingsStreak6: {
      name: translations?.gamification?.badges?.savingsStreak6?.name || 'Inarrestabile',
      description: translations?.gamification?.badges?.savingsStreak6?.description || '6 mesi consecutivi di risparmio',
    },
    netWorth1k: {
      name: translations?.gamification?.badges?.netWorth1k?.name || 'Primo Traguardo',
      description: translations?.gamification?.badges?.netWorth1k?.description || 'Patrimonio di €1.000',
    },
    netWorth10k: {
      name: translations?.gamification?.badges?.netWorth10k?.name || 'Cinque Cifre',
      description: translations?.gamification?.badges?.netWorth10k?.description || 'Patrimonio di €10.000',
    },
    netWorth50k: {
      name: translations?.gamification?.badges?.netWorth50k?.name || 'Decollo',
      description: translations?.gamification?.badges?.netWorth50k?.description || 'Patrimonio di €50.000',
    },
    netWorth100k: {
      name: translations?.gamification?.badges?.netWorth100k?.name || 'Club 100K',
      description: translations?.gamification?.badges?.netWorth100k?.description || 'Patrimonio di €100.000',
    },
    firstInvestment: {
      name: translations?.gamification?.badges?.firstInvestment?.name || 'Investitore',
      description: translations?.gamification?.badges?.firstInvestment?.description || 'Primo investimento effettuato',
    },
    diversified3: {
      name: translations?.gamification?.badges?.diversified3?.name || 'Diversificato',
      description: translations?.gamification?.badges?.diversified3?.description || '3+ tipi di asset',
    },
    diversified5: {
      name: translations?.gamification?.badges?.diversified5?.name || 'Portfolio Pro',
      description: translations?.gamification?.badges?.diversified5?.description || '5+ tipi di asset',
    },
    emergencyFundStarted: {
      name: translations?.gamification?.badges?.emergencyFundStarted?.name || 'Rete di Sicurezza',
      description: translations?.gamification?.badges?.emergencyFundStarted?.description || 'Fondo di emergenza avviato',
    },
    emergencyFundGoal: {
      name: translations?.gamification?.badges?.emergencyFundGoal?.name || 'Blindato',
      description: translations?.gamification?.badges?.emergencyFundGoal?.description || 'Obiettivo fondo emergenza raggiunto',
    },
    monthlyGrowth: {
      name: translations?.gamification?.badges?.monthlyGrowth?.name || 'In Crescita',
      description: translations?.gamification?.badges?.monthlyGrowth?.description || 'Patrimonio in aumento vs mese precedente',
    },
    yearlyGrowth: {
      name: translations?.gamification?.badges?.yearlyGrowth?.name || 'Anno d\'Oro',
      description: translations?.gamification?.badges?.yearlyGrowth?.description || 'Patrimonio in aumento vs anno precedente',
    },
  }), [translations]);

  const gamificationData = useMemo(() => {
    if (!userData) {
      return { badges: [], unlockedBadges: [], lockedBadges: [], stats: {}, level: 1, points: 0, nextLevelPoints: 100 };
    }

    // Calculate all badges
    const allBadges = Object.entries(BADGE_DEFINITIONS).map(([key, def]) => {
      const unlocked = def.check(userData);
      return {
        id: def.id,
        icon: def.icon,
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
    };
  }, [userData, badgeTranslations]);

  return gamificationData;
};
