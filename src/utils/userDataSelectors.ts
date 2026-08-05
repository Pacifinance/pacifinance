/**
 * Utility functions to extract data from optimized UserContext structure.
 * These selectors maintain compatibility with existing components while using
 * the new optimized data structure.
 */

import type { UserData } from '../types/user';
import type { TagDto, TransactionDto } from '../types/api';
import {
  DEFAULT_MONTHLY_SPENDING_LIMIT,
  DEFAULT_SAVINGS_GOAL_PERCENTAGE,
  DEFAULT_EMERGENCY_FUND_TARGET,
} from '../data/financeDefaults';
import { translateTag as translateTagDirect } from '../data/tagTranslations';

/** Accepts the full userData, null (loading), or undefined (unauthenticated). */
type UserDataLike = UserData | null | undefined;

export interface BalanceSnapshotLike {
  cash?: number;
  bank?: number;
  emergencyFund?: number;
  digitalServices?: number;
  stocks?: number;
  etf?: number;
  bitcoin?: number;
  crypto?: number;
  bonds?: number;
  funds?: number;
  commodities?: number;
  totalValue?: number;
}

export interface BalanceMonthEntry {
  date: string | null;
  balance: BalanceSnapshotLike;
}

export interface ProfileFieldValue {
  key: number;
  value: string;
}

// Current balance selectors
export const getCurrentBalance = (userData: UserDataLike): BalanceSnapshotLike =>
  userData?.balances?.[0]?.balance || {};

export const getPreviousMonthBalance = (userData: UserDataLike): BalanceSnapshotLike =>
  userData?.balances?.[1]?.balance || {};

export const getPreviousYearSameMonthBalance = (userData: UserDataLike): BalanceSnapshotLike =>
  userData?.balances?.[12]?.balance || {};

/**
 * Return the balance snapshot entry `{ date, balance }` whose date matches the
 * provided year/month (month is 1-based: 1 = January … 12 = December).
 * Returns `null` if no snapshot exists for that month.
 */
export const getBalanceForMonth = (
  userData: UserDataLike,
  year: number | string,
  month: number | string,
): BalanceMonthEntry | null => {
  const balances = userData?.balances;
  if (!Array.isArray(balances) || balances.length === 0) return null;
  const yearNum = Number(year);
  const monthNum = Number(month);
  if (!Number.isFinite(yearNum) || !Number.isFinite(monthNum)) return null;
  for (const entry of balances) {
    if (!entry?.date) continue;
    const d = new Date(entry.date);
    if (Number.isNaN(d.getTime())) continue;
    if (d.getFullYear() === yearNum && d.getMonth() + 1 === monthNum) {
      return entry;
    }
  }
  return null;
};

// Badge IDs already notified server-side (see useAchievementNotifications)
export const getSeenBadges = (userData: UserDataLike): string[] => userData?.seenBadges || [];

// Elevated permission to moderate community-submitted historical prices (AdminRoute, AdminPriceReviewPage)
export const getIsAdmin = (userData: UserDataLike): boolean => userData?.isAdmin === true;

// Individual asset selectors for current month
export const getCashValue = (userData: UserDataLike): number => getCurrentBalance(userData).cash || 0;
export const getBankValue = (userData: UserDataLike): number => getCurrentBalance(userData).bank || 0;
export const getDigitalServicesValue = (userData: UserDataLike): number => getCurrentBalance(userData).digitalServices || 0;
export const getEmergencyFund = (userData: UserDataLike): number => getCurrentBalance(userData).emergencyFund || 0;
export const getStocksValue = (userData: UserDataLike): number => getCurrentBalance(userData).stocks || 0;
export const getEtfValue = (userData: UserDataLike): number => getCurrentBalance(userData).etf || 0;
export const getBitcoinValue = (userData: UserDataLike): number => getCurrentBalance(userData).bitcoin || 0;
export const getCryptoValue = (userData: UserDataLike): number => getCurrentBalance(userData).crypto || 0;
export const getBondsValue = (userData: UserDataLike): number => getCurrentBalance(userData).bonds || 0;
export const getFundsValue = (userData: UserDataLike): number => getCurrentBalance(userData).funds || 0;
export const getCommoditiesValue = (userData: UserDataLike): number => getCurrentBalance(userData).commodities || 0;
export const getTotalValue = (userData: UserDataLike): number => getCurrentBalance(userData).totalValue || 0;

// Previous month balance selectors
export const getCashValuePreMonth = (userData: UserDataLike): number => getPreviousMonthBalance(userData).cash || 0;
export const getBankValuePreMonth = (userData: UserDataLike): number => getPreviousMonthBalance(userData).bank || 0;
export const getDigitalServicesValuePreMonth = (userData: UserDataLike): number => getPreviousMonthBalance(userData).digitalServices || 0;
export const getEmergencyFundPreMonth = (userData: UserDataLike): number => getPreviousMonthBalance(userData).emergencyFund || 0;
export const getStocksValuePreMonth = (userData: UserDataLike): number => getPreviousMonthBalance(userData).stocks || 0;
export const getEtfValuePreMonth = (userData: UserDataLike): number => getPreviousMonthBalance(userData).etf || 0;
export const getBitcoinValuePreMonth = (userData: UserDataLike): number => getPreviousMonthBalance(userData).bitcoin || 0;
export const getCryptoValuePreMonth = (userData: UserDataLike): number => getPreviousMonthBalance(userData).crypto || 0;
export const getBondsValuePreMonth = (userData: UserDataLike): number => getPreviousMonthBalance(userData).bonds || 0;
export const getFundsValuePreMonth = (userData: UserDataLike): number => getPreviousMonthBalance(userData).funds || 0;
export const getCommoditiesValuePreMonth = (userData: UserDataLike): number => getPreviousMonthBalance(userData).commodities || 0;
export const getTotalValuePreMonth = (userData: UserDataLike): number => getPreviousMonthBalance(userData).totalValue || 0;

// Previous year same month balance selectors
export const getCashValuePreYearSameMonth = (userData: UserDataLike): number => getPreviousYearSameMonthBalance(userData).cash || 0;
export const getBankValuePreYearSameMonth = (userData: UserDataLike): number => getPreviousYearSameMonthBalance(userData).bank || 0;
export const getDigitalServicesValuePreYearSameMonth = (userData: UserDataLike): number => getPreviousYearSameMonthBalance(userData).digitalServices || 0;
export const getEmergencyFundPreYearSameMonth = (userData: UserDataLike): number => getPreviousYearSameMonthBalance(userData).emergencyFund || 0;
export const getStocksValuePreYearSameMonth = (userData: UserDataLike): number => getPreviousYearSameMonthBalance(userData).stocks || 0;
export const getEtfValuePreYearSameMonth = (userData: UserDataLike): number => getPreviousYearSameMonthBalance(userData).etf || 0;
export const getBitcoinValuePreYearSameMonth = (userData: UserDataLike): number => getPreviousYearSameMonthBalance(userData).bitcoin || 0;
export const getCryptoValuePreYearSameMonth = (userData: UserDataLike): number => getPreviousYearSameMonthBalance(userData).crypto || 0;
export const getBondsValuePreYearSameMonth = (userData: UserDataLike): number => getPreviousYearSameMonthBalance(userData).bonds || 0;
export const getFundsValuePreYearSameMonth = (userData: UserDataLike): number => getPreviousYearSameMonthBalance(userData).funds || 0;
export const getCommoditiesValuePreYearSameMonth = (userData: UserDataLike): number => getPreviousYearSameMonthBalance(userData).commodities || 0;
export const getTotalValuePreYearSameMonth = (userData: UserDataLike): number => getPreviousYearSameMonthBalance(userData).totalValue || 0;

// Legacy format creators for backward compatibility
export const createLegacyBalanceData = (userData: UserDataLike) => {
  const currentBalance = getCurrentBalance(userData);
  const preMonthBalance = getPreviousMonthBalance(userData);
  const preYearSameMonthBalance = getPreviousYearSameMonthBalance(userData);

  return {
    // Current month individual values
    cashValue: currentBalance.cash || 0,
    bankValue: currentBalance.bank || 0,
    digitalServicesValue: currentBalance.digitalServices || 0,
    emergencyFund: currentBalance.emergencyFund || 0,
    stocksValue: currentBalance.stocks || 0,
    etfValue: currentBalance.etf || 0,
    bitcoinValue: currentBalance.bitcoin || 0,
    cryptoValue: currentBalance.crypto || 0,
    bondsValue: currentBalance.bonds || 0,
    fundsValue: currentBalance.funds || 0,
    commoditiesValue: currentBalance.commodities || 0,
    totalValue: currentBalance.totalValue || 0,

    // Previous month individual values
    cashValuePreMonth: preMonthBalance.cash || 0,
    bankValuePreMonth: preMonthBalance.bank || 0,
    digitalServicesValuePreMonth: preMonthBalance.digitalServices || 0,
    emergencyFundPreMonth: preMonthBalance.emergencyFund || 0,
    stocksValuePreMonth: preMonthBalance.stocks || 0,
    etfValuePreMonth: preMonthBalance.etf || 0,
    bitcoinValuePreMonth: preMonthBalance.bitcoin || 0,
    cryptoValuePreMonth: preMonthBalance.crypto || 0,
    bondsValuePreMonth: preMonthBalance.bonds || 0,
    fundsValuePreMonth: preMonthBalance.funds || 0,
    commoditiesValuePreMonth: preMonthBalance.commodities || 0,
    totalValuePreMonth: preMonthBalance.totalValue || 0,

    // Previous year same month individual values
    cashValuePreYearSameMonth: preYearSameMonthBalance.cash || 0,
    bankValuePreYearSameMonth: preYearSameMonthBalance.bank || 0,
    digitalServicesValuePreYearSameMonth: preYearSameMonthBalance.digitalServices || 0,
    emergencyFundPreYearSameMonth: preYearSameMonthBalance.emergencyFund || 0,
    stocksValuePreYearSameMonth: preYearSameMonthBalance.stocks || 0,
    etfValuePreYearSameMonth: preYearSameMonthBalance.etf || 0,
    bitcoinValuePreYearSameMonth: preYearSameMonthBalance.bitcoin || 0,
    cryptoValuePreYearSameMonth: preYearSameMonthBalance.crypto || 0,
    bondsValuePreYearSameMonth: preYearSameMonthBalance.bonds || 0,
    fundsValuePreYearSameMonth: preYearSameMonthBalance.funds || 0,
    commoditiesValuePreYearSameMonth: preYearSameMonthBalance.commodities || 0,
    totalValuePreYearSameMonth: preYearSameMonthBalance.totalValue || 0,

    // Formatted dates
    formattedPreMonthDate: userData?.dates?.preMonth || '',
    formattedPreYearSameMonthDate: userData?.dates?.preYearSameMonth || '',
  };
};

// User profile selectors
export const getUserNationality = (userData: UserDataLike): ProfileFieldValue => userData?.profile?.nationality || { key: -1, value: 'Nazionalità non impostata' };
export const getUserWhereWorks = (userData: UserDataLike): ProfileFieldValue => userData?.profile?.whereWorks || { key: -1, value: 'Dove lavora non impostato' };
export const getUserJob = (userData: UserDataLike): ProfileFieldValue => userData?.profile?.job || { key: -1, value: 'Lavoro non impostato' };
export const getUserJobType = (userData: UserDataLike): ProfileFieldValue => userData?.profile?.jobType || { key: -1, value: 'Tipo di lavoro non impostato' };
export const getUserWorkTime = (userData: UserDataLike): ProfileFieldValue => userData?.profile?.workTime || { key: -1, value: 'Tipologia contratto non impostato' };
export const getUserRemoteType = (userData: UserDataLike): ProfileFieldValue => userData?.profile?.remoteType || { key: -1, value: 'Tipologia lavoro non impostata' };
export const getUserAge = (userData: UserDataLike): ProfileFieldValue => userData?.profile?.age || { key: -1, value: 'Età non impostata' };
export const getUserLivingSituation = (userData: UserDataLike): ProfileFieldValue => userData?.profile?.livingSituation || { key: -1, value: 'Situazione abitativa non impostata' };
export const getUserHousingType = (userData: UserDataLike): ProfileFieldValue => userData?.profile?.housingType || { key: -1, value: 'Tipologia abitativa non impostata' };
export const getUserChildren = (userData: UserDataLike): ProfileFieldValue => userData?.profile?.children || { key: -1, value: 'Figli non impostati' };
export const getUserYearsOfExperience = (userData: UserDataLike): ProfileFieldValue => userData?.profile?.yearsOfExperience || { key: -1, value: 'Anni di esperienza non impostati' };
export const getProfileCompletionPercentage = (userData: UserDataLike): number => userData?.profileCompletionPercentage || userData?.profile?.completionPercentage || 0;

// New user detection (no balances, no transactions)
// Note: allOutflows/allIncomes are arrays of month-arrays (e.g. [[], [], ...]),
// so we must check for actual items inside, not just outer array length.
export const isNewUser = (userData: UserDataLike): boolean => {
  if (!userData) return false;
  const hasBalance = getTotalValue(userData) > 0;
  const outflows = getAllOutflows(userData);
  const hasOutflows = outflows.some((month: TransactionDto[]) => Array.isArray(month) ? month.length > 0 : false);
  const incomes = getAllIncomes(userData);
  const hasIncomes = incomes.some((month: TransactionDto[]) => Array.isArray(month) ? month.length > 0 : false);
  return !hasBalance && !hasOutflows && !hasIncomes;
};

// Expense and income selectors
export const getAllOutflows = (userData: UserDataLike): TransactionDto[][] => userData?.expenses?.allOutflows || [];
export const getOutflowsArray = (userData: UserDataLike): number[] => userData?.expenses?.outflowsArray || [];
export const getTotalOutflowsPerCategoryPerMonth = (userData: UserDataLike): Record<string, Record<string, number>> => userData?.expenses?.totalOutflowsPerCategoryPerMonth || {};

export type CategoryBreakdown = Record<string, {
  amount: number;
  subcategories: Record<string, number>;
}>;

const splitCategoryPath = (category: string): { parent: string; child: string | null } => {
  const [parent, ...childParts] = String(category || '').split(' / ');
  const child = childParts.join(' / ').trim();
  return {
    parent: parent.trim() || 'Unknown',
    child: child || null,
  };
};

/**
 * Collapse custom sub-categories into their official parent category.
 *
 * Use this for comparisons/rankings against other users: custom categories are
 * user-specific, so cross-user metrics must only compare the shared parent tags.
 */
export const getTotalOutflowsParentCategoryPerMonth = (userData: UserDataLike): Record<string, Record<string, number>> => {
  const detailed = getTotalOutflowsPerCategoryPerMonth(userData);
  const collapsed: Record<string, Record<string, number>> = {};

  Object.entries(detailed).forEach(([monthIndex, monthData]) => {
    const perParent: Record<string, number> = {};
    Object.entries(monthData || {}).forEach(([category, value]) => {
      const { parent } = splitCategoryPath(category);
      perParent[parent] = (perParent[parent] || 0) + (Number(value) || 0);
    });
    collapsed[monthIndex] = perParent;
  });

  return collapsed;
};

/**
 * Build a personal category breakdown:
 * { Food: { amount: 120, subcategories: { Groceries: 80, Work lunch: 40 } } }
 *
 * Use this only in personal statistics where the user's own sub-categories are
 * useful. The parent amount always includes all children plus uncategorized rows.
 */
export const getTotalOutflowsCategoryBreakdownPerMonth = (userData: UserDataLike): Record<string, CategoryBreakdown> => {
  const detailed = getTotalOutflowsPerCategoryPerMonth(userData);
  const breakdown: Record<string, CategoryBreakdown> = {};

  Object.entries(detailed).forEach(([monthIndex, monthData]) => {
    const perParent: CategoryBreakdown = {};
    Object.entries(monthData || {}).forEach(([category, value]) => {
      const amount = Number(value) || 0;
      const { parent, child } = splitCategoryPath(category);
      if (!perParent[parent]) {
        perParent[parent] = { amount: 0, subcategories: {} };
      }
      perParent[parent].amount += amount;
      if (child) {
        perParent[parent].subcategories[child] = (perParent[parent].subcategories[child] || 0) + amount;
      }
    });
    breakdown[monthIndex] = perParent;
  });

  return breakdown;
};

export const getAllIncomes = (userData: UserDataLike): TransactionDto[][] => userData?.incomes?.allIncomes || [];

const aggregateTransactionsByCategory = (
  monthlyEntries: TransactionDto[][],
  type: 'expense' | 'income',
): Record<string, CategoryBreakdown> => {
  const breakdown: Record<string, CategoryBreakdown> = {};

  monthlyEntries.forEach((month, monthIndex) => {
    const perParent: CategoryBreakdown = {};
    if (!Array.isArray(month)) {
      breakdown[monthIndex] = perParent;
      return;
    }

    month.forEach((entry) => {
      const parent =
        translateTagDirect(entry?.categoryTag?.label, 'en', type) ||
        entry?.categoryTag?.label ||
        'Unknown';
      const child = entry?.userCategory?.label || null;
      const amount = Number(entry?.amount) || 0;
      if (amount <= 0) return;

      if (!perParent[parent]) {
        perParent[parent] = { amount: 0, subcategories: {} };
      }
      perParent[parent].amount += amount;
      if (child) {
        perParent[parent].subcategories[child] = (perParent[parent].subcategories[child] || 0) + amount;
      }
    });

    breakdown[monthIndex] = perParent;
  });

  return breakdown;
};

/** Personal income category breakdown, including custom sub-categories. */
export const getTotalIncomesCategoryBreakdownPerMonth = (userData: UserDataLike): Record<string, CategoryBreakdown> =>
  aggregateTransactionsByCategory(getAllIncomes(userData), 'income');

export const getIncomesArray = (userData: UserDataLike): number[] => userData?.incomes?.incomesArray || [];

/** Lazy-loaded full monthly outflow/income totals (see fetchAllTimeMonthlyTotals in UserContext),
 * aggregated server-side — empty until the "2Y"/"ALL" period selector triggers the fetch. */
export const getMonthlyTotalsAllTime = (userData: UserDataLike): Array<{ monthStart: string; totalOutflows: number; totalIncomes: number }> =>
  userData?.monthlyTotalsAllTime || [];

// ─── Arbitrary month lookup (on-demand history beyond the loaded window) ──
// See fetchMonthDetail in UserContext.tsx: a single calendar month's tagged
// transactions, fetched on demand and cached in userData.extraMonths keyed by
// 'YYYY-MM', for viewing/comparing history the initial 13-month load doesn't cover.

/** "Months back from now" for a calendar month key ('YYYY-MM'). 0 = current month, negative = future. */
export const monthKeyToIndex = (monthKey: string): number => {
  const [y, m] = monthKey.split('-').map(Number);
  const now = new Date();
  return (now.getFullYear() - y) * 12 + (now.getMonth() - (m - 1));
};

/** Calendar month key ('YYYY-MM') for a given "months back from now" index (may be negative to look forward). */
export const indexToMonthKey = (index: number): string => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - index);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Gets a month's raw transactions for one flow, by calendar key, from the
 * already-loaded recent window if present, else the on-demand `extraMonths`
 * cache. Returns null if neither has it — the caller should call
 * `fetchMonthDetail(year, month)` (from UserContext) and re-render once it resolves.
 */
export const getEntriesForMonthKey = (
  userData: UserDataLike, monthKey: string, flow: 'outflows' | 'incomes'
): TransactionDto[] | null => {
  const index = monthKeyToIndex(monthKey);
  const loaded = flow === 'outflows' ? getAllOutflows(userData) : getAllIncomes(userData);
  if (index >= 0 && index < loaded.length) return (loaded[index] || []) as TransactionDto[];

  const cached = userData?.extraMonths?.[monthKey];
  if (!cached) return null;
  return cached.filter((entry) => (flow === 'outflows' ? !!entry?.isExpense : !entry?.isExpense));
};

/** Category breakdown (same per-parent shape as getTotal*CategoryBreakdownPerMonth) for a flat transaction list. */
export const getCategoryBreakdownForEntries = (entries: TransactionDto[], type: 'expense' | 'income'): CategoryBreakdown =>
  aggregateTransactionsByCategory([entries], type)[0] || {};

// Total expenses/income/saved for the current month
export const getTotalOutflowsCurrentMonth = (userData: UserDataLike): number => {
  if (typeof userData?.expenses?.totalOutflowsMonth === 'number') {
    return userData.expenses.totalOutflowsMonth;
  }
  if (Array.isArray(userData?.expenses?.outflowsArray)) {
    return userData.expenses.outflowsArray[0] || 0;
  }
  return 0;
};

export const getTotalIncomesCurrentMonth = (userData: UserDataLike): number => {
  if (typeof userData?.incomes?.totalIncomesMonth === 'number') {
    return userData.incomes.totalIncomesMonth;
  }
  if (Array.isArray(userData?.incomes?.incomesArray)) {
    return userData.incomes.incomesArray[0] || 0;
  }
  return 0;
};

export const getTotalSavedCurrentMonth = (userData: UserDataLike): number => {
  return getTotalIncomesCurrentMonth(userData) - getTotalOutflowsCurrentMonth(userData);
};

// Tags selectors
export const getOutflowsTags = (userData: UserDataLike): TagDto[] => userData?.tags?.outflowsTags || [];
export const getIncomesTags = (userData: UserDataLike): TagDto[] => userData?.tags?.incomesTags || [];
export const getPaymentTags = (userData: UserDataLike): TagDto[] => userData?.tags?.paymentTags || [];
export const getNationalityTags = (userData: UserDataLike): TagDto[] => userData?.tags?.nationalityTags || [];
export const getJobTags = (userData: UserDataLike): TagDto[] => userData?.tags?.jobTags || [];
export const getJobTypeTags = (userData: UserDataLike): TagDto[] => userData?.tags?.jobTypeTags || [];
export const getWorkTimeTags = (userData: UserDataLike): TagDto[] => userData?.tags?.workTimeTags || [];
export const getRemoteTypeTags = (userData: UserDataLike): TagDto[] => userData?.tags?.remoteTypeTags || [];
export const getAgeTags = (userData: UserDataLike): TagDto[] => userData?.tags?.ageTags || [];
export const getLivingSituationTags = (userData: UserDataLike): TagDto[] => userData?.tags?.livingSituationTags || [];
export const getHousingTypeTags = (userData: UserDataLike): TagDto[] => userData?.tags?.housingTypeTags || [];
export const getChildrenTags = (userData: UserDataLike): TagDto[] => userData?.tags?.childrenTags || [];
export const getYearsOfExperienceTags = (userData: UserDataLike): TagDto[] => userData?.tags?.yearsOfExperienceTags || [];
export const getCurrencyTags = (userData: UserDataLike): TagDto[] => userData?.tags?.currencyTags || [];

/** User's custom sub-categories (children of an official expense/income tag). See UserContext.addCustomCategory/deleteCustomCategory. */
export const getCustomCategories = (userData: UserDataLike): Array<{ id: number; parentIndex: number; label: string }> =>
  userData?.customCategories || [];

// Preferred currency selector (returns {key, value} like other profile fields)
export const getUserPreferredCurrency = (userData: UserDataLike): ProfileFieldValue =>
  userData?.profile?.preferredCurrency || { key: -1, value: 'EUR' };

// Rankings selectors
export const getPercentageRankOnBalance = (userData: UserDataLike): number => userData?.rankings?.balance || 0;
export const getPercentageRankOnIncomes = (userData: UserDataLike): number => userData?.rankings?.incomes || 0;
export const getPercentageRankOnOutflows = (userData: UserDataLike): number => userData?.rankings?.outflows || 0;
/** @deprecated Use getPercentageRankOnOutflows instead */
export const getPercentageRankOnExpenses = getPercentageRankOnOutflows;
export const getPercentageRankOnBalanceSimilar = (userData: UserDataLike): number => userData?.rankings?.balanceSimilar || 0;
export const getPercentageRankOnIncomesSimilar = (userData: UserDataLike): number => userData?.rankings?.incomesSimilar || 0;
export const getPercentageRankOnOutflowsSimilar = (userData: UserDataLike): number => userData?.rankings?.outflowsSimilar || 0;
/** @deprecated Use getPercentageRankOnOutflowsSimilar instead */
export const getPercentageRankOnExpensesSimilar = getPercentageRankOnOutflowsSimilar;

// Dates selectors
export const getCurrentDate = (userData: UserDataLike): string | undefined => userData?.dates?.current;
export const getPreMonthDate = (userData: UserDataLike): string | undefined => userData?.dates?.preMonth;
export const getPreYearSameMonthDate = (userData: UserDataLike): string | undefined => userData?.dates?.preYearSameMonth;
export const getFormattedPreMonthDate = (userData: UserDataLike): string => {
  const legacyData = createLegacyBalanceData(userData);
  return legacyData.formattedPreMonthDate;
};

export const getFormattedPreYearSameMonthDate = (userData: UserDataLike): string => {
  const legacyData = createLegacyBalanceData(userData);
  return legacyData.formattedPreYearSameMonthDate;
};

// Localized date formatters
export const getFormattedPreMonthDateLocalized = (userData: UserDataLike, language: string = 'it'): string => {
  const preMonthDate = getPreMonthDate(userData);
  if (!preMonthDate) return '';

  const date = new Date(preMonthDate);
  const monthNames: Record<string, string[]> = {
    it: [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
    ],
    en: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
  };

  const month = monthNames[language] ? monthNames[language][date.getMonth()] : monthNames.it[date.getMonth()];
  const year = date.getFullYear();

  return `${month} ${year}`;
};

export const getFormattedPreYearSameMonthDateLocalized = (userData: UserDataLike, language: string = 'it'): string => {
  const preYearDate = getPreYearSameMonthDate(userData);
  if (!preYearDate) return '';

  const date = new Date(preYearDate);
  const monthNames: Record<string, string[]> = {
    it: [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
    ],
    en: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
  };

  const month = monthNames[language] ? monthNames[language][date.getMonth()] : monthNames.it[date.getMonth()];
  const year = date.getFullYear();

  return `${month} ${year}`;
};

// Averages selectors (from /stats/averages API)
export const getAverages = (userData: UserDataLike) => userData?.averages || { all: {}, similar: {} };
export const getAveragesAll = (userData: UserDataLike) => userData?.averages?.all || {};
export const getAveragesSimilar = (userData: UserDataLike) => userData?.averages?.similar || {};

export const getAveragesAllBalances = (userData: UserDataLike) => userData?.averages?.all?.balances ?? null;
export const getAveragesAllExpenses = (userData: UserDataLike) => userData?.averages?.all?.expenses ?? null;
export const getAveragesAllIncomes = (userData: UserDataLike) => userData?.averages?.all?.incomes ?? null;
export const getAveragesAllSavingsRates = (userData: UserDataLike): number | null => (userData?.averages?.all?.savingsRates as number | null) ?? null;
export const getAveragesAllExpensesByCategory = (userData: UserDataLike) => userData?.averages?.all?.expensesByCategory ?? null;

export const getAveragesSimilarBalances = (userData: UserDataLike) => userData?.averages?.similar?.balances ?? null;
export const getAveragesSimilarExpenses = (userData: UserDataLike) => userData?.averages?.similar?.expenses ?? null;
export const getAveragesSimilarIncomes = (userData: UserDataLike) => userData?.averages?.similar?.incomes ?? null;
export const getAveragesSimilarSavingsRates = (userData: UserDataLike): number | null => (userData?.averages?.similar?.savingsRates as number | null) ?? null;
export const getAveragesSimilarExpensesByCategory = (userData: UserDataLike) => userData?.averages?.similar?.expensesByCategory ?? null;

// Goals and limits selectors (for backward compatibility)
export const getMonthlySpendingLimit = (userData: UserDataLike): number => userData?.limits?.monthlySpendingLimit ?? DEFAULT_MONTHLY_SPENDING_LIMIT;
export const getSavingsGoalPercentage = (userData: UserDataLike): number => userData?.limits?.savingsGoalPercentage ?? DEFAULT_SAVINGS_GOAL_PERCENTAGE;
export const getEmergencyFundTarget = (userData: UserDataLike): number => userData?.limits?.emergencyFundTarget ?? DEFAULT_EMERGENCY_FUND_TARGET;

// Balance growth calculation
export const getBalanceGrowth12Months = (userData: UserDataLike): number => {
  const currentBalance = getTotalValue(userData) || 0;

  const balances = userData?.balances || [];
  const balance12MonthsAgo = (balances[11]?.balance as BalanceSnapshotLike)?.totalValue || 0;

  if (balance12MonthsAgo === 0 || currentBalance === 0) return 0;
  return ((currentBalance - balance12MonthsAgo) / balance12MonthsAgo) * 100;
};

export interface BalanceChartDatum {
  name: string;
  cash: number;
  digitalServices: number;
  stocks: number;
  bank: number;
  crypto: number;
  etf: number;
  bitcoin: number;
  bonds: number;
  funds: number;
  commodities: number;
  emergencyFund: number;
  total: number;
  amt: number;
  cashReal: number;
  digitalServicesReal: number;
  stocksReal: number;
  bankReal: number;
  cryptoReal: number;
  etfReal: number;
  bitcoinReal: number;
  bondsReal: number;
  fundsReal: number;
  commoditiesReal: number;
  emergencyFundReal: number;
  month: string;
}

// Chart data selectors
/**
 * Builds chart-ready balance data.
 * @param userData Full user data (must have `balances`, newest-first)
 * @param monthsBack How many months to emit (oldest → newest). Defaults to 12;
 *   pass an explicit wider value (e.g. `userData.balances.length` after
 *   `fetchAllTimeBalances`) to widen the "2Y"/"ALL" period selectors.
 */
export const getBalanceChartData = (userData: UserDataLike, monthsBack: number = 12): BalanceChartDatum[] => {
  const balances: BalanceMonthEntry[] = userData?.balances || [];
  const currentDate = new Date();
  const months = monthsBack;

  // Index balances by (year, month) using the snapshot's real date. This makes
  // the chart robust to gaps, duplicates, reordering, or extra historical
  // snapshots in the array (otherwise the old positional mapping could
  // misalign months when the balances list grows or shrinks).
  const byMonth = new Map<string, BalanceMonthEntry>();
  for (const entry of balances) {
    if (!entry?.date) continue;
    const d = new Date(entry.date);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    // Later entries for the same month overwrite earlier ones. The backend
    // already returns only one entry per month, but this guarantees
    // determinism even if that invariant breaks in the future.
    byMonth.set(key, entry);
  }

  // Emit the last `months` months oldest → newest, filling missing months with zeros.
  const result: BalanceChartDatum[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const target = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const key = `${target.getFullYear()}-${target.getMonth() + 1}`;
    const monthString = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}`;
    const balance = byMonth.get(key)?.balance || {};
    const total = (balance.cash || 0) + (balance.digitalServices || 0) + (balance.stocks || 0) +
                  (balance.bank || 0) + (balance.crypto || 0) + (balance.etf || 0) +
                  (balance.bitcoin || 0) + (balance.bonds || 0) + (balance.funds || 0) +
                  (balance.commodities || 0) + (balance.emergencyFund || 0);

    result.push({
      name: monthString,
      cash: balance.cash || 0,
      digitalServices: balance.digitalServices || 0,
      stocks: balance.stocks || 0,
      bank: balance.bank || 0,
      crypto: balance.crypto || 0,
      etf: balance.etf || 0,
      bitcoin: balance.bitcoin || 0,
      bonds: balance.bonds || 0,
      funds: balance.funds || 0,
      commodities: balance.commodities || 0,
      emergencyFund: balance.emergencyFund || 0,
      total,
      amt: 2400, // Legacy property for compatibility
      // Add all properties with "Real" suffix for backward compatibility
      cashReal: balance.cash || 0,
      digitalServicesReal: balance.digitalServices || 0,
      stocksReal: balance.stocks || 0,
      bankReal: balance.bank || 0,
      cryptoReal: balance.crypto || 0,
      etfReal: balance.etf || 0,
      bitcoinReal: balance.bitcoin || 0,
      bondsReal: balance.bonds || 0,
      fundsReal: balance.funds || 0,
      commoditiesReal: balance.commodities || 0,
      emergencyFundReal: balance.emergencyFund || 0,
      month: monthString, // Legacy property for compatibility
    });
  }
  return result;
};
