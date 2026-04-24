/**
 * Pure data transformation functions extracted from UserContext.
 *
 * Each function takes raw API data and returns the shape consumed by the
 * rest of the application. Because they are pure functions (no React, no
 * side-effects) they are trivially unit-testable.
 *
 * @module utils/userDataTransformers
 */

import {
  DEFAULT_MONTHLY_SPENDING_LIMIT,
  DEFAULT_SAVINGS_GOAL_PERCENTAGE,
  DEFAULT_EMERGENCY_FUND_TARGET,
} from '../data/financeDefaults';

// ─── Helpers ─────────────────────────────────────────────────────────

import { translateTagObject, translateTag as translateTagDirect } from '../data/tagTranslations';

/**
 * Get a translated label from a tag object with fallback chain.
 * Prefers local translations (tagTranslations.js), then DB `.translations` field.
 * @param {Object|null} obj  Tag object with `.label` and optionally `.translations`
 * @param {string} language  Current language code
 * @param {string} fallback  Default string when no translation is found
 * @param {string} [type]    Optional tag type for scoped local lookup
 * @returns {string}
 */
export const getTranslation = (obj, language, fallback, type) => {
  return translateTagObject(obj, language, fallback, type);
};

// ─── Tags ────────────────────────────────────────────────────────────

/**
 * Extract categorised tag arrays from the raw `/tags/get` response.
 * @param {Object} tagsData
 * @returns {Object}
 */
export const transformTags = (tagsData) => ({
  outflowsTags: tagsData.expense || [],
  incomesTags: tagsData.income || [],
  paymentTags: tagsData.payment || [],
  nationalityTags: tagsData.country || [],
  jobTags: tagsData.job || [],
  jobTypeTags: tagsData.jobType || [],
  workTimeTags: tagsData.workTime || [],
  remoteTypeTags: tagsData.remoteType || [],
  ageTags: tagsData.age || [],
  livingSituationTags: tagsData.livingSituation || [],
  housingTypeTags: tagsData.housingType || [],
  childrenTags: tagsData.children || [],
  yearsOfExperienceTags: tagsData.yearsOfExperience || [],
  currencyTags: tagsData.currency || [],
});

// ─── User Profile ────────────────────────────────────────────────────

/** Enum mapping for user type index → string */
const USER_TYPE_DICT = {
  0: 'regular',
  1: 'premium',
  2: 'test',
  3: 'demo',
};

/**
 * Map raw `/user/get` response to a structured profile object.
 * @param {Object} infoData    Raw user info from API
 * @param {Array}  currencyTags  Available currencies
 * @param {string} language      Current language code
 * @returns {Object}
 */
export const transformUserProfile = (infoData, currencyTags, language) => {
  const userId = infoData.userId || '00000';
  const userType = USER_TYPE_DICT[infoData.type] || 'regular';
  const username = infoData.nickname ?? 'Username non impostato';

  // Resolve preferred currency
  const preferredCurrencyIndex = infoData.preferredCurrency;
  let preferredCurrencyCode = 'EUR';
  let preferredCurrencyKey = -1;
  const normalizedPreferredCurrencyIndex = Number(preferredCurrencyIndex);
  if (Number.isFinite(normalizedPreferredCurrencyIndex) && currencyTags.length > 0) {
    const matchedTag = currencyTags.find(tag => Number(tag.index) === normalizedPreferredCurrencyIndex);
    if (matchedTag?.label) {
      preferredCurrencyCode = matchedTag.label.toUpperCase();
      preferredCurrencyKey = Number(matchedTag.index);
    }
  }

  const fields = {
    nationality: { key: infoData.country?.index ?? -1, value: getTranslation(infoData.country, language, 'Nazionalità non impostata') },
    whereWorks: { key: infoData.jobCountry?.index ?? -1, value: getTranslation(infoData.jobCountry, language, 'Dove lavora non impostato') },
    job: { key: infoData.job?.index ?? -1, value: getTranslation(infoData.job, language, 'Lavoro non impostato') },
    jobType: { key: infoData.jobType?.index ?? -1, value: getTranslation(infoData.jobType, language, 'Tipo di lavoro non impostato') },
    workTime: { key: infoData.workTime?.index ?? -1, value: getTranslation(infoData.workTime, language, 'Tipologia contratto non impostato') },
    remoteType: { key: infoData.remoteType?.index ?? -1, value: getTranslation(infoData.remoteType, language, 'Tipologia lavoro non impostata') },
    age: { key: infoData.age?.index ?? -1, value: getTranslation(infoData.age, language, 'Età non impostata') },
    livingSituation: { key: infoData.livingSituation?.index ?? -1, value: getTranslation(infoData.livingSituation, language, 'Situazione abitativa non impostata') },
    housingType: { key: infoData.housingType?.index ?? -1, value: getTranslation(infoData.housingType, language, 'Tipologia abitazione non impostata') },
    children: { key: infoData.children?.index ?? -1, value: getTranslation(infoData.children, language, 'Figli non impostato') },
    yearsOfExperience: { key: infoData.yearsOfExperience?.index ?? -1, value: getTranslation(infoData.yearsOfExperience, language, 'Anni di esperienza non impostati') },
  };

  const completionPercentage = calculateProfileCompletion(Object.values(fields));

  return {
    userId,
    userType,
    username,
    preferredCurrencyCode,
    preferredCurrencyKey,
    profile: {
      ...fields,
      completionPercentage,
      preferredCurrency: { key: preferredCurrencyKey, value: preferredCurrencyCode },
    },
    profileCompletionPercentage: completionPercentage,
  };
};

// ─── Profile Completion ──────────────────────────────────────────────

/**
 * Calculate profile completion percentage.
 * @param {Array<{key: number}>} fields
 * @returns {number} 0-100
 */
export const calculateProfileCompletion = (fields) => {
  const completed = fields.filter(f => f.key !== -1).length;
  return Math.round((completed / fields.length) * 100);
};

// ─── Goals & Limits ──────────────────────────────────────────────────

/**
 * Build goals and limits structure with defaults.
 * @param {Object} userGoals  Raw goals from `/user/get`
 * @returns {Object}
 */
export const buildGoalsAndLimits = (userGoals) => {
  const g = userGoals || { expensesLimit: -1, savingsPercent: -1, emergencyFundGoal: -1 };
  return {
    goals: [],
    limits: {
      monthlySpendingLimit: g.expensesLimit !== -1 ? g.expensesLimit : DEFAULT_MONTHLY_SPENDING_LIMIT,
      savingsGoalPercentage: g.savingsPercent !== -1 ? g.savingsPercent : DEFAULT_SAVINGS_GOAL_PERCENTAGE,
      emergencyFundTarget: g.emergencyFundGoal !== -1 ? g.emergencyFundGoal : DEFAULT_EMERGENCY_FUND_TARGET,
      notificationsEnabled: true,
    },
  };
};

// ─── Balances ────────────────────────────────────────────────────────

/**
 * Sum all asset fields in a balance object.
 * @param {Object} balance
 * @returns {number}
 */
export const calculateTotal = (balance) => {
  if (!balance) return 0;
  return (
    (balance.cash || 0) +
    (balance.bank || 0) +
    (balance.emergencyFund || 0) +
    (balance.digitalServices || 0) +
    (balance.stocks || 0) +
    (balance.etf || 0) +
    (balance.bitcoin || 0) +
    (balance.crypto || 0) +
    (balance.bonds || 0) +
    (balance.funds || 0) +
    (balance.gold || 0)
  );
};

/**
 * Normalise raw balance data from the API.
 * @param {Array} rawData
 * @returns {Array}
 */
export const transformBalances = (rawData) => {
  const balancesData = rawData.map(monthData => ({
    date: monthData?.date || null,
    balance: monthData?.balance || {},
  }));
  balancesData.forEach(monthData => {
    monthData.balance.totalValue = calculateTotal(monthData.balance);
  });
  return balancesData;
};

// ─── Outflows Aggregation ────────────────────────────────────────────

/**
 * Aggregate outflows by category for each month.
 * @param {Array<Array>} allOutflowsIncomesArray
 * @returns {Object} { [monthIndex]: { [categoryEn]: totalAmount } }
 */
export const aggregateOutflowsByCategory = (allOutflowsIncomesArray) => {
  const result = {};
  allOutflowsIncomesArray.forEach((month, index) => {
    const perCategory = {};
    if (!Array.isArray(month)) { result[index] = perCategory; return; }
    month.forEach(entry => {
      if (entry?.isExpense) {
        const categoryKey =
          translateTagDirect(entry.categoryTag?.label, 'en', 'expense') ||
          entry.categoryTag?.translations?.en ||
          entry.categoryTag?.label ||
          'Unknown';
        const amount = Number(entry.amount) || 0;
        perCategory[categoryKey] = (perCategory[categoryKey] || 0) + amount;
      }
    });
    result[index] = perCategory;
  });
  return result;
};

// ─── Monthly Arrays ──────────────────────────────────────────────────

/**
 * Build monthly income / outflow sum arrays (13 months).
 * @param {Array<Array>} allOutflowsIncomesArray
 * @returns {{ incomesArray: number[], outflowsArray: number[] }}
 */
export const buildMonthlyArrays = (allOutflowsIncomesArray) => {
  const incomesArray = Array(13).fill(0);
  const outflowsArray = Array(13).fill(0);
  allOutflowsIncomesArray.forEach((outerItem, index) => {
    if (!Array.isArray(outerItem)) return;
    outerItem.forEach(innerItem => {
      if (!innerItem) return;
      const amount = Number(innerItem.amount) || 0;
      if (innerItem.isExpense) {
        outflowsArray[index] += amount;
      } else {
        incomesArray[index] += amount;
      }
    });
  });
  return { incomesArray, outflowsArray };
};

// ─── Chart Data ──────────────────────────────────────────────────────

/**
 * Format balance data for the last-12-months chart.
 * @param {Array} balancesData  Normalised balance array (newest first)
 * @param {Date}  currentDate
 * @returns {Array}
 */
export const buildChartData = (balancesData, currentDate) => {
  // Index snapshots by (year, month) using the snapshot's real date so the
  // last-12-months window aligns by date rather than by array position.
  const byMonth = new Map();
  for (const entry of balancesData || []) {
    if (!entry?.date) continue;
    const d = new Date(entry.date);
    if (Number.isNaN(d.getTime())) continue;
    byMonth.set(`${d.getFullYear()}-${d.getMonth() + 1}`, entry);
  }
  const out = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    const monthString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const entry = byMonth.get(key);
    out.push({
      ...(entry?.balance || {}),
      month: monthString,
      date: entry?.date || null,
    });
  }
  return out;
};

// ─── Assets ──────────────────────────────────────────────────────────

/**
 * Create an assets array from the current balance (non-zero entries only).
 * @param {Object} balance
 * @returns {Array<{typology: string, value: number}>}
 */
export const buildAssetsFromBalance = (balance) => {
  const b = balance || {};
  return [
    { typology: 'cash', value: b.cash || 0 },
    { typology: 'bank', value: b.bank || 0 },
    { typology: 'digitalServices', value: b.digitalServices || 0 },
    { typology: 'stocks', value: b.stocks || 0 },
    { typology: 'etf', value: b.etf || 0 },
    { typology: 'bitcoin', value: b.bitcoin || 0 },
    { typology: 'crypto', value: b.crypto || 0 },
    { typology: 'bonds', value: b.bonds || 0 },
    { typology: 'funds', value: b.funds || 0 },
    { typology: 'gold', value: b.gold || 0 },
  ].filter(asset => asset.value > 0);
};

// ─── Incomes / Outflows Split ────────────────────────────────────────

/**
 * Split the raw expenses-and-incomes matrix into two separate arrays.
 * @param {Array<Array>} allOutflowsIncomesArray
 * @returns {{ allOutflows: Array, allIncomes: Array }}
 */
export const splitIncomesOutflows = (allOutflowsIncomesArray) => ({
  allOutflows: allOutflowsIncomesArray.map(m => Array.isArray(m) ? m.filter(d => d?.isExpense) : []),
  allIncomes: allOutflowsIncomesArray.map(m => Array.isArray(m) ? m.filter(d => d && !d.isExpense) : []),
});
