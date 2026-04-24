/**
 * Utility functions to extract data from optimized UserContext structure.
 * These selectors maintain compatibility with existing components while using
 * the new optimized data structure.
 *
 * Note: `userData` is intentionally typed as `any` here because the UserContext
 * still holds a loose shape that gradually converges on the API types from
 * `src/types/api.ts`. Return types are narrowed where possible.
 */

import {
  DEFAULT_MONTHLY_SPENDING_LIMIT,
  DEFAULT_SAVINGS_GOAL_PERCENTAGE,
  DEFAULT_EMERGENCY_FUND_TARGET,
} from '../data/financeDefaults';

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
  gold?: number;
  totalValue?: number;
  [key: string]: number | undefined;
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
export const getCurrentBalance = (userData: any): BalanceSnapshotLike =>
  userData?.balances?.[0]?.balance || {};

export const getPreviousMonthBalance = (userData: any): BalanceSnapshotLike =>
  userData?.balances?.[1]?.balance || {};

export const getPreviousYearSameMonthBalance = (userData: any): BalanceSnapshotLike =>
  userData?.balances?.[12]?.balance || {};

/**
 * Return the balance snapshot entry `{ date, balance }` whose date matches the
 * provided year/month (month is 1-based: 1 = January … 12 = December).
 * Returns `null` if no snapshot exists for that month.
 */
export const getBalanceForMonth = (
  userData: any,
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

// Individual asset selectors for current month
export const getCashValue = (userData: any): number => getCurrentBalance(userData).cash || 0;
export const getBankValue = (userData: any): number => getCurrentBalance(userData).bank || 0;
export const getDigitalServicesValue = (userData: any): number => getCurrentBalance(userData).digitalServices || 0;
export const getEmergencyFund = (userData: any): number => getCurrentBalance(userData).emergencyFund || 0;
export const getStocksValue = (userData: any): number => getCurrentBalance(userData).stocks || 0;
export const getEtfValue = (userData: any): number => getCurrentBalance(userData).etf || 0;
export const getBitcoinValue = (userData: any): number => getCurrentBalance(userData).bitcoin || 0;
export const getCryptoValue = (userData: any): number => getCurrentBalance(userData).crypto || 0;
export const getBondsValue = (userData: any): number => getCurrentBalance(userData).bonds || 0;
export const getFundsValue = (userData: any): number => getCurrentBalance(userData).funds || 0;
export const getGoldValue = (userData: any): number => getCurrentBalance(userData).gold || 0;
export const getTotalValue = (userData: any): number => getCurrentBalance(userData).totalValue || 0;

// Previous month balance selectors
export const getCashValuePreMonth = (userData: any): number => getPreviousMonthBalance(userData).cash || 0;
export const getBankValuePreMonth = (userData: any): number => getPreviousMonthBalance(userData).bank || 0;
export const getDigitalServicesValuePreMonth = (userData: any): number => getPreviousMonthBalance(userData).digitalServices || 0;
export const getEmergencyFundPreMonth = (userData: any): number => getPreviousMonthBalance(userData).emergencyFund || 0;
export const getStocksValuePreMonth = (userData: any): number => getPreviousMonthBalance(userData).stocks || 0;
export const getEtfValuePreMonth = (userData: any): number => getPreviousMonthBalance(userData).etf || 0;
export const getBitcoinValuePreMonth = (userData: any): number => getPreviousMonthBalance(userData).bitcoin || 0;
export const getCryptoValuePreMonth = (userData: any): number => getPreviousMonthBalance(userData).crypto || 0;
export const getBondsValuePreMonth = (userData: any): number => getPreviousMonthBalance(userData).bonds || 0;
export const getFundsValuePreMonth = (userData: any): number => getPreviousMonthBalance(userData).funds || 0;
export const getGoldValuePreMonth = (userData: any): number => getPreviousMonthBalance(userData).gold || 0;
export const getTotalValuePreMonth = (userData: any): number => getPreviousMonthBalance(userData).totalValue || 0;

// Previous year same month balance selectors
export const getCashValuePreYearSameMonth = (userData: any): number => getPreviousYearSameMonthBalance(userData).cash || 0;
export const getBankValuePreYearSameMonth = (userData: any): number => getPreviousYearSameMonthBalance(userData).bank || 0;
export const getDigitalServicesValuePreYearSameMonth = (userData: any): number => getPreviousYearSameMonthBalance(userData).digitalServices || 0;
export const getEmergencyFundPreYearSameMonth = (userData: any): number => getPreviousYearSameMonthBalance(userData).emergencyFund || 0;
export const getStocksValuePreYearSameMonth = (userData: any): number => getPreviousYearSameMonthBalance(userData).stocks || 0;
export const getEtfValuePreYearSameMonth = (userData: any): number => getPreviousYearSameMonthBalance(userData).etf || 0;
export const getBitcoinValuePreYearSameMonth = (userData: any): number => getPreviousYearSameMonthBalance(userData).bitcoin || 0;
export const getCryptoValuePreYearSameMonth = (userData: any): number => getPreviousYearSameMonthBalance(userData).crypto || 0;
export const getBondsValuePreYearSameMonth = (userData: any): number => getPreviousYearSameMonthBalance(userData).bonds || 0;
export const getFundsValuePreYearSameMonth = (userData: any): number => getPreviousYearSameMonthBalance(userData).funds || 0;
export const getGoldValuePreYearSameMonth = (userData: any): number => getPreviousYearSameMonthBalance(userData).gold || 0;
export const getTotalValuePreYearSameMonth = (userData: any): number => getPreviousYearSameMonthBalance(userData).totalValue || 0;

// Legacy format creators for backward compatibility
export const createLegacyBalanceData = (userData: any) => {
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
    goldValue: currentBalance.gold || 0,
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
    goldValuePreMonth: preMonthBalance.gold || 0,
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
    goldValuePreYearSameMonth: preYearSameMonthBalance.gold || 0,
    totalValuePreYearSameMonth: preYearSameMonthBalance.totalValue || 0,

    // Formatted dates
    formattedPreMonthDate: userData?.dates?.preMonth || '',
    formattedPreYearSameMonthDate: userData?.dates?.preYearSameMonth || '',
  };
};

// User profile selectors
export const getUserNationality = (userData: any): ProfileFieldValue => userData?.profile?.nationality || { key: -1, value: 'Nazionalità non impostata' };
export const getUserWhereWorks = (userData: any): ProfileFieldValue => userData?.profile?.whereWorks || { key: -1, value: 'Dove lavora non impostato' };
export const getUserJob = (userData: any): ProfileFieldValue => userData?.profile?.job || { key: -1, value: 'Lavoro non impostato' };
export const getUserJobType = (userData: any): ProfileFieldValue => userData?.profile?.jobType || { key: -1, value: 'Tipo di lavoro non impostato' };
export const getUserWorkTime = (userData: any): ProfileFieldValue => userData?.profile?.workTime || { key: -1, value: 'Tipologia contratto non impostato' };
export const getUserRemoteType = (userData: any): ProfileFieldValue => userData?.profile?.remoteType || { key: -1, value: 'Tipologia lavoro non impostata' };
export const getUserAge = (userData: any): ProfileFieldValue => userData?.profile?.age || { key: -1, value: 'Età non impostata' };
export const getUserLivingSituation = (userData: any): ProfileFieldValue => userData?.profile?.livingSituation || { key: -1, value: 'Situazione abitativa non impostata' };
export const getUserHousingType = (userData: any): ProfileFieldValue => userData?.profile?.housingType || { key: -1, value: 'Tipologia abitativa non impostata' };
export const getUserChildren = (userData: any): ProfileFieldValue => userData?.profile?.children || { key: -1, value: 'Figli non impostati' };
export const getUserYearsOfExperience = (userData: any): ProfileFieldValue => userData?.profile?.yearsOfExperience || { key: -1, value: 'Anni di esperienza non impostati' };
export const getProfileCompletionPercentage = (userData: any): number => userData?.profileCompletionPercentage || userData?.profile?.completionPercentage || 0;

// New user detection (no balances, no transactions)
// Note: allOutflows/allIncomes are arrays of month-arrays (e.g. [[], [], ...]),
// so we must check for actual items inside, not just outer array length.
export const isNewUser = (userData: any): boolean => {
  if (!userData) return false;
  const hasBalance = getTotalValue(userData) > 0;
  const outflows = getAllOutflows(userData);
  const hasOutflows = outflows.some((month: any) => Array.isArray(month) ? month.length > 0 : false);
  const incomes = getAllIncomes(userData);
  const hasIncomes = incomes.some((month: any) => Array.isArray(month) ? month.length > 0 : false);
  return !hasBalance && !hasOutflows && !hasIncomes;
};

// Expense and income selectors
export const getAllOutflows = (userData: any): any[] => userData?.expenses?.allOutflows || userData?.allOutflows || [];
export const getOutflowsArray = (userData: any): number[] => userData?.expenses?.outflowsArray || userData?.outflowsArray || [];
export const getTotalOutflowsPerCategoryPerMonth = (userData: any): Record<string, any> => userData?.expenses?.totalOutflowsPerCategoryPerMonth || {};
export const getAllIncomes = (userData: any): any[] => userData?.incomes?.allIncomes || userData?.allIncomes || [];
export const getIncomesArray = (userData: any): number[] => userData?.incomes?.incomesArray || userData?.incomesArray || [];

// Totale spese/income/saved del mese corrente
export const getTotalOutflowsCurrentMonth = (userData: any): number => {
  if (typeof userData?.expenses?.totalOutflowsMonth === 'number') {
    return userData.expenses.totalOutflowsMonth;
  }
  if (Array.isArray(userData?.expenses?.outflowsArray)) {
    return userData.expenses.outflowsArray[0] || 0;
  }
  if (Array.isArray(userData?.outflowsArray)) {
    return userData.outflowsArray[0] || 0;
  }
  return 0;
};

export const getTotalIncomesCurrentMonth = (userData: any): number => {
  if (typeof userData?.incomes?.totalIncomesMonth === 'number') {
    return userData.incomes.totalIncomesMonth;
  }
  if (Array.isArray(userData?.incomes?.incomesArray)) {
    return userData.incomes.incomesArray[0] || 0;
  }
  if (Array.isArray(userData?.incomesArray)) {
    return userData.incomesArray[0] || 0;
  }
  return 0;
};

export const getTotalSavedCurrentMonth = (userData: any): number => {
  return getTotalIncomesCurrentMonth(userData) - getTotalOutflowsCurrentMonth(userData);
};

// Tags selectors
export const getOutflowsTags = (userData: any): any[] => userData?.tags?.outflowsTags || [];
export const getIncomesTags = (userData: any): any[] => userData?.tags?.incomesTags || [];
export const getPaymentTags = (userData: any): any[] => userData?.tags?.paymentTags || [];
export const getNationalityTags = (userData: any): any[] => userData?.tags?.nationalityTags || [];
export const getJobTags = (userData: any): any[] => userData?.tags?.jobTags || [];
export const getJobTypeTags = (userData: any): any[] => userData?.tags?.jobTypeTags || [];
export const getWorkTimeTags = (userData: any): any[] => userData?.tags?.workTimeTags || [];
export const getRemoteTypeTags = (userData: any): any[] => userData?.tags?.remoteTypeTags || [];
export const getAgeTags = (userData: any): any[] => userData?.tags?.ageTags || [];
export const getLivingSituationTags = (userData: any): any[] => userData?.tags?.livingSituationTags || [];
export const getHousingTypeTags = (userData: any): any[] => userData?.tags?.housingTypeTags || [];
export const getChildrenTags = (userData: any): any[] => userData?.tags?.childrenTags || [];
export const getYearsOfExperienceTags = (userData: any): any[] => userData?.tags?.yearsOfExperienceTags || [];
export const getCurrencyTags = (userData: any): any[] => userData?.tags?.currencyTags || [];

// Preferred currency selector (returns {key, value} like other profile fields)
export const getUserPreferredCurrency = (userData: any): ProfileFieldValue =>
  userData?.profile?.preferredCurrency || { key: -1, value: 'EUR' };

// Rankings selectors
export const getPercentageRankOnBalance = (userData: any): number => userData?.rankings?.balance || 0;
export const getPercentageRankOnIncomes = (userData: any): number => userData?.rankings?.incomes || 0;
export const getPercentageRankOnOutflows = (userData: any): number => userData?.rankings?.outflows || 0;
/** @deprecated Use getPercentageRankOnOutflows instead */
export const getPercentageRankOnExpenses = getPercentageRankOnOutflows;
export const getPercentageRankOnBalanceSimilar = (userData: any): number => userData?.rankings?.balanceSimilar || 0;
export const getPercentageRankOnIncomesSimilar = (userData: any): number => userData?.rankings?.incomesSimilar || 0;
export const getPercentageRankOnOutflowsSimilar = (userData: any): number => userData?.rankings?.outflowsSimilar || 0;
/** @deprecated Use getPercentageRankOnOutflowsSimilar instead */
export const getPercentageRankOnExpensesSimilar = getPercentageRankOnOutflowsSimilar;

// Dates selectors
export const getCurrentDate = (userData: any): string | undefined => userData?.dates?.current;
export const getPreMonthDate = (userData: any): string | undefined => userData?.dates?.preMonth;
export const getPreYearSameMonthDate = (userData: any): string | undefined => userData?.dates?.preYearSameMonth;
export const getFormattedPreMonthDate = (userData: any): string => {
  const legacyData = createLegacyBalanceData(userData);
  return legacyData.formattedPreMonthDate;
};

export const getFormattedPreYearSameMonthDate = (userData: any): string => {
  const legacyData = createLegacyBalanceData(userData);
  return legacyData.formattedPreYearSameMonthDate;
};

// Localized date formatters
export const getFormattedPreMonthDateLocalized = (userData: any, language: string = 'it'): string => {
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

export const getFormattedPreYearSameMonthDateLocalized = (userData: any, language: string = 'it'): string => {
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
export const getAverages = (userData: any) => userData?.averages || { all: {}, similar: {} };
export const getAveragesAll = (userData: any) => userData?.averages?.all || {};
export const getAveragesSimilar = (userData: any) => userData?.averages?.similar || {};

export const getAveragesAllBalances = (userData: any) => userData?.averages?.all?.balances ?? null;
export const getAveragesAllExpenses = (userData: any) => userData?.averages?.all?.expenses ?? null;
export const getAveragesAllIncomes = (userData: any) => userData?.averages?.all?.incomes ?? null;
export const getAveragesAllSavingsRates = (userData: any) => userData?.averages?.all?.savingsRates ?? null;
export const getAveragesAllExpensesByCategory = (userData: any) => userData?.averages?.all?.expensesByCategory ?? null;

export const getAveragesSimilarBalances = (userData: any) => userData?.averages?.similar?.balances ?? null;
export const getAveragesSimilarExpenses = (userData: any) => userData?.averages?.similar?.expenses ?? null;
export const getAveragesSimilarIncomes = (userData: any) => userData?.averages?.similar?.incomes ?? null;
export const getAveragesSimilarSavingsRates = (userData: any) => userData?.averages?.similar?.savingsRates ?? null;
export const getAveragesSimilarExpensesByCategory = (userData: any) => userData?.averages?.similar?.expensesByCategory ?? null;

// Goals and limits selectors (for backward compatibility)
export const getMonthlySpendingLimit = (userData: any): number => userData?.limits?.monthlySpendingLimit ?? DEFAULT_MONTHLY_SPENDING_LIMIT;
export const getSavingsGoalPercentage = (userData: any): number => userData?.limits?.savingsGoalPercentage ?? DEFAULT_SAVINGS_GOAL_PERCENTAGE;
export const getEmergencyFundTarget = (userData: any): number => userData?.limits?.emergencyFundTarget ?? DEFAULT_EMERGENCY_FUND_TARGET;

// Balance growth calculation
export const getBalanceGrowth12Months = (userData: any): number => {
  const currentBalance = getTotalValue(userData) || 0;

  const balances = userData?.balances || [];
  const balance12MonthsAgo = balances[11]?.balance?.totalValue || 0;

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
  gold: number;
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
  goldReal: number;
  emergencyFundReal: number;
  month: string;
}

// Chart data selectors
export const getBalanceChartData = (userData: any): BalanceChartDatum[] => {
  const balances: BalanceMonthEntry[] = userData?.balances || [];
  const currentDate = new Date();

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

  // Emit the last 12 months oldest → newest, filling missing months with zeros.
  const result: BalanceChartDatum[] = [];
  for (let i = 11; i >= 0; i--) {
    const target = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const key = `${target.getFullYear()}-${target.getMonth() + 1}`;
    const monthString = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}`;
    const balance = byMonth.get(key)?.balance || {};
    const total = (balance.cash || 0) + (balance.digitalServices || 0) + (balance.stocks || 0) +
                  (balance.bank || 0) + (balance.crypto || 0) + (balance.etf || 0) +
                  (balance.bitcoin || 0) + (balance.bonds || 0) + (balance.funds || 0) +
                  (balance.gold || 0) + (balance.emergencyFund || 0);

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
      gold: balance.gold || 0,
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
      goldReal: balance.gold || 0,
      emergencyFundReal: balance.emergencyFund || 0,
      month: monthString, // Legacy property for compatibility
    });
  }
  return result;
};
