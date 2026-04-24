/**
 * Utility functions to extract data from optimized UserContext structure
 * These selectors maintain compatibility with existing components while using the new optimized data structure
 */

import {
  DEFAULT_MONTHLY_SPENDING_LIMIT,
  DEFAULT_SAVINGS_GOAL_PERCENTAGE,
  DEFAULT_EMERGENCY_FUND_TARGET,
} from '../data/financeDefaults';

// Current balance selectors
export const getCurrentBalance = (userData) => userData?.balances?.[0]?.balance || {};

export const getPreviousMonthBalance = (userData) => userData?.balances?.[1]?.balance || {};

export const getPreviousYearSameMonthBalance = (userData) => userData?.balances?.[12]?.balance || {};

/**
 * Return the balance snapshot entry `{ date, balance }` whose date matches the
 * provided year/month (month is 1-based: 1 = January … 12 = December).
 * Returns `null` if no snapshot exists for that month.
 */
export const getBalanceForMonth = (userData, year, month) => {
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
export const getCashValue = (userData) => getCurrentBalance(userData).cash || 0;
export const getBankValue = (userData) => getCurrentBalance(userData).bank || 0;
export const getDigitalServicesValue = (userData) => getCurrentBalance(userData).digitalServices || 0;
export const getEmergencyFund = (userData) => getCurrentBalance(userData).emergencyFund || 0;
export const getStocksValue = (userData) => getCurrentBalance(userData).stocks || 0;
export const getEtfValue = (userData) => getCurrentBalance(userData).etf || 0;
export const getBitcoinValue = (userData) => getCurrentBalance(userData).bitcoin || 0;
export const getCryptoValue = (userData) => getCurrentBalance(userData).crypto || 0;
export const getBondsValue = (userData) => getCurrentBalance(userData).bonds || 0;
export const getFundsValue = (userData) => getCurrentBalance(userData).funds || 0;
export const getGoldValue = (userData) => getCurrentBalance(userData).gold || 0;
export const getTotalValue = (userData) => getCurrentBalance(userData).totalValue || 0;

// Previous month balance selectors
export const getCashValuePreMonth = (userData) => getPreviousMonthBalance(userData).cash || 0;
export const getBankValuePreMonth = (userData) => getPreviousMonthBalance(userData).bank || 0;
export const getDigitalServicesValuePreMonth = (userData) => getPreviousMonthBalance(userData).digitalServices || 0;
export const getEmergencyFundPreMonth = (userData) => getPreviousMonthBalance(userData).emergencyFund || 0;
export const getStocksValuePreMonth = (userData) => getPreviousMonthBalance(userData).stocks || 0;
export const getEtfValuePreMonth = (userData) => getPreviousMonthBalance(userData).etf || 0;
export const getBitcoinValuePreMonth = (userData) => getPreviousMonthBalance(userData).bitcoin || 0;
export const getCryptoValuePreMonth = (userData) => getPreviousMonthBalance(userData).crypto || 0;
export const getBondsValuePreMonth = (userData) => getPreviousMonthBalance(userData).bonds || 0;
export const getFundsValuePreMonth = (userData) => getPreviousMonthBalance(userData).funds || 0;
export const getGoldValuePreMonth = (userData) => getPreviousMonthBalance(userData).gold || 0;
export const getTotalValuePreMonth = (userData) => getPreviousMonthBalance(userData).totalValue || 0;

// Previous year same month balance selectors
export const getCashValuePreYearSameMonth = (userData) => getPreviousYearSameMonthBalance(userData).cash || 0;
export const getBankValuePreYearSameMonth = (userData) => getPreviousYearSameMonthBalance(userData).bank || 0;
export const getDigitalServicesValuePreYearSameMonth = (userData) => getPreviousYearSameMonthBalance(userData).digitalServices || 0;
export const getEmergencyFundPreYearSameMonth = (userData) => getPreviousYearSameMonthBalance(userData).emergencyFund || 0;
export const getStocksValuePreYearSameMonth = (userData) => getPreviousYearSameMonthBalance(userData).stocks || 0;
export const getEtfValuePreYearSameMonth = (userData) => getPreviousYearSameMonthBalance(userData).etf || 0;
export const getBitcoinValuePreYearSameMonth = (userData) => getPreviousYearSameMonthBalance(userData).bitcoin || 0;
export const getCryptoValuePreYearSameMonth = (userData) => getPreviousYearSameMonthBalance(userData).crypto || 0;
export const getBondsValuePreYearSameMonth = (userData) => getPreviousYearSameMonthBalance(userData).bonds || 0;
export const getFundsValuePreYearSameMonth = (userData) => getPreviousYearSameMonthBalance(userData).funds || 0;
export const getGoldValuePreYearSameMonth = (userData) => getPreviousYearSameMonthBalance(userData).gold || 0;
export const getTotalValuePreYearSameMonth = (userData) => getPreviousYearSameMonthBalance(userData).totalValue || 0;

// Legacy format creators for backward compatibility
export const createLegacyBalanceData = (userData) => {
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
    formattedPreYearSameMonthDate: userData?.dates?.preYearSameMonth || ''
  };
};

// User profile selectors
export const getUserNationality = (userData) => userData?.profile?.nationality || { key: -1, value: 'Nazionalità non impostata' };
export const getUserWhereWorks = (userData) => userData?.profile?.whereWorks || { key: -1, value: 'Dove lavora non impostato' };
export const getUserJob = (userData) => userData?.profile?.job || { key: -1, value: 'Lavoro non impostato' };
export const getUserJobType = (userData) => userData?.profile?.jobType || { key: -1, value: 'Tipo di lavoro non impostato' };
export const getUserWorkTime = (userData) => userData?.profile?.workTime || { key: -1, value: 'Tipologia contratto non impostato' };
export const getUserRemoteType = (userData) => userData?.profile?.remoteType || { key: -1, value: 'Tipologia lavoro non impostata' };
export const getUserAge = (userData) => userData?.profile?.age || { key: -1, value: 'Età non impostata' };
export const getUserLivingSituation = (userData) => userData?.profile?.livingSituation || { key: -1, value: 'Situazione abitativa non impostata' };
export const getUserHousingType = (userData) => userData?.profile?.housingType || { key: -1, value: 'Tipologia abitativa non impostata' };
export const getUserChildren = (userData) => userData?.profile?.children || { key: -1, value: 'Figli non impostati' };
export const getUserYearsOfExperience = (userData) => userData?.profile?.yearsOfExperience || { key: -1, value: 'Anni di esperienza non impostati' };
export const getProfileCompletionPercentage = (userData) => userData?.profileCompletionPercentage || userData?.profile?.completionPercentage || 0;

// New user detection (no balances, no transactions)
// Note: allOutflows/allIncomes are arrays of month-arrays (e.g. [[], [], ...]),
// so we must check for actual items inside, not just outer array length.
export const isNewUser = (userData) => {
  if (!userData) return false;
  const hasBalance = getTotalValue(userData) > 0;
  const outflows = getAllOutflows(userData);
  const hasOutflows = outflows.some(month => Array.isArray(month) ? month.length > 0 : false);
  const incomes = getAllIncomes(userData);
  const hasIncomes = incomes.some(month => Array.isArray(month) ? month.length > 0 : false);
  return !hasBalance && !hasOutflows && !hasIncomes;
};

// Expense and income selectors
export const getAllOutflows = (userData) => userData?.expenses?.allOutflows || userData?.allOutflows || [];
export const getOutflowsArray = (userData) => userData?.expenses?.outflowsArray || userData?.outflowsArray || [];
export const getTotalOutflowsPerCategoryPerMonth = (userData) => userData?.expenses?.totalOutflowsPerCategoryPerMonth || {};
export const getAllIncomes = (userData) => userData?.incomes?.allIncomes || userData?.allIncomes || [];
export const getIncomesArray = (userData) => userData?.incomes?.incomesArray || userData?.incomesArray || [];

// Totale spese/income/saved del mese corrente
export const getTotalOutflowsCurrentMonth = (userData) => {
  // Se expenses ha una proprietà totalOutflowsMonth, usala, altrimenti somma l'array
  if (typeof userData?.expenses?.totalOutflowsMonth === 'number') {
    return userData.expenses.totalOutflowsMonth;
  }
  // Supporto struttura UserContext ottimizzata
  if (Array.isArray(userData?.expenses?.outflowsArray)) {
    // outflowsArray può essere un array di valori mensili, prendi il primo (corrente)
    return userData.expenses.outflowsArray[0] || 0;
  }
  // Supporto struttura legacy (mockUser)
  if (Array.isArray(userData?.outflowsArray)) {
    return userData.outflowsArray[0] || 0;
  }
  return 0;
};

export const getTotalIncomesCurrentMonth = (userData) => {
  if (typeof userData?.incomes?.totalIncomesMonth === 'number') {
    return userData.incomes.totalIncomesMonth;
  }
  // Supporto struttura UserContext ottimizzata
  if (Array.isArray(userData?.incomes?.incomesArray)) {
    return userData.incomes.incomesArray[0] || 0;
  }
  // Supporto struttura legacy (mockUser)
  if (Array.isArray(userData?.incomesArray)) {
    return userData.incomesArray[0] || 0;
  }
  return 0;
};

export const getTotalSavedCurrentMonth = (userData) => {
  return getTotalIncomesCurrentMonth(userData) - getTotalOutflowsCurrentMonth(userData);
};

// Tags selectors
export const getOutflowsTags = (userData) => userData?.tags?.outflowsTags || [];
export const getIncomesTags = (userData) => userData?.tags?.incomesTags || [];
export const getPaymentTags = (userData) => userData?.tags?.paymentTags || [];
export const getNationalityTags = (userData) => userData?.tags?.nationalityTags || [];
export const getJobTags = (userData) => userData?.tags?.jobTags || [];
export const getJobTypeTags = (userData) => userData?.tags?.jobTypeTags || [];
export const getWorkTimeTags = (userData) => userData?.tags?.workTimeTags || [];
export const getRemoteTypeTags = (userData) => userData?.tags?.remoteTypeTags || [];
export const getAgeTags = (userData) => userData?.tags?.ageTags || [];
export const getLivingSituationTags = (userData) => userData?.tags?.livingSituationTags || [];
export const getHousingTypeTags = (userData) => userData?.tags?.housingTypeTags || [];
export const getChildrenTags = (userData) => userData?.tags?.childrenTags || [];
export const getYearsOfExperienceTags = (userData) => userData?.tags?.yearsOfExperienceTags || [];
export const getCurrencyTags = (userData) => userData?.tags?.currencyTags || [];

// Preferred currency selector (returns {key, value} like other profile fields)
export const getUserPreferredCurrency = (userData) => userData?.profile?.preferredCurrency || { key: -1, value: 'EUR' };

// Rankings selectors
export const getPercentageRankOnBalance = (userData) => userData?.rankings?.balance || 0;
export const getPercentageRankOnIncomes = (userData) => userData?.rankings?.incomes || 0;
export const getPercentageRankOnOutflows = (userData) => userData?.rankings?.outflows || 0;
// @deprecated Use getPercentageRankOnOutflows instead
export const getPercentageRankOnExpenses = getPercentageRankOnOutflows;
export const getPercentageRankOnBalanceSimilar = (userData) => userData?.rankings?.balanceSimilar || 0;
export const getPercentageRankOnIncomesSimilar = (userData) => userData?.rankings?.incomesSimilar || 0;
export const getPercentageRankOnOutflowsSimilar = (userData) => userData?.rankings?.outflowsSimilar || 0;
// @deprecated Use getPercentageRankOnOutflowsSimilar instead
export const getPercentageRankOnExpensesSimilar = getPercentageRankOnOutflowsSimilar;

// Dates selectors
export const getCurrentDate = (userData) => userData?.dates?.current;
export const getPreMonthDate = (userData) => userData?.dates?.preMonth;
export const getPreYearSameMonthDate = (userData) => userData?.dates?.preYearSameMonth;
export const getFormattedPreMonthDate = (userData) => {
  const legacyData = createLegacyBalanceData(userData);
  return legacyData.formattedPreMonthDate;
};

export const getFormattedPreYearSameMonthDate = (userData) => {
  const legacyData = createLegacyBalanceData(userData);
  return legacyData.formattedPreYearSameMonthDate;
};

// Localized date formatters
export const getFormattedPreMonthDateLocalized = (userData, language = 'it') => {
  const preMonthDate = getPreMonthDate(userData);
  if (!preMonthDate) return '';
  
  const date = new Date(preMonthDate);
  const monthNames = {
    it: [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ],
    en: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
  };
  
  const month = monthNames[language] ? monthNames[language][date.getMonth()] : monthNames.it[date.getMonth()];
  const year = date.getFullYear();
  
  return `${month} ${year}`;
};

export const getFormattedPreYearSameMonthDateLocalized = (userData, language = 'it') => {
  const preYearDate = getPreYearSameMonthDate(userData);
  if (!preYearDate) return '';
  
  const date = new Date(preYearDate);
  const monthNames = {
    it: [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ],
    en: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
  };
  
  const month = monthNames[language] ? monthNames[language][date.getMonth()] : monthNames.it[date.getMonth()];
  const year = date.getFullYear();
  
  return `${month} ${year}`;
};


// Averages selectors (from /stats/averages API)
export const getAverages = (userData) => userData?.averages || { all: {}, similar: {} };
export const getAveragesAll = (userData) => userData?.averages?.all || {};
export const getAveragesSimilar = (userData) => userData?.averages?.similar || {};

export const getAveragesAllBalances = (userData) => userData?.averages?.all?.balances ?? null;
export const getAveragesAllExpenses = (userData) => userData?.averages?.all?.expenses ?? null;
export const getAveragesAllIncomes = (userData) => userData?.averages?.all?.incomes ?? null;
export const getAveragesAllSavingsRates = (userData) => userData?.averages?.all?.savingsRates ?? null;
export const getAveragesAllExpensesByCategory = (userData) => userData?.averages?.all?.expensesByCategory ?? null;

export const getAveragesSimilarBalances = (userData) => userData?.averages?.similar?.balances ?? null;
export const getAveragesSimilarExpenses = (userData) => userData?.averages?.similar?.expenses ?? null;
export const getAveragesSimilarIncomes = (userData) => userData?.averages?.similar?.incomes ?? null;
export const getAveragesSimilarSavingsRates = (userData) => userData?.averages?.similar?.savingsRates ?? null;
export const getAveragesSimilarExpensesByCategory = (userData) => userData?.averages?.similar?.expensesByCategory ?? null;

// Goals and limits selectors (for backward compatibility)
export const getMonthlySpendingLimit = (userData) => userData?.limits?.monthlySpendingLimit ?? DEFAULT_MONTHLY_SPENDING_LIMIT;
export const getSavingsGoalPercentage = (userData) => userData?.limits?.savingsGoalPercentage ?? DEFAULT_SAVINGS_GOAL_PERCENTAGE;
export const getEmergencyFundTarget = (userData) => userData?.limits?.emergencyFundTarget ?? DEFAULT_EMERGENCY_FUND_TARGET;

// Balance growth calculation
export const getBalanceGrowth12Months = (userData) => {
  const currentBalance = getTotalValue(userData) || 0;
  
  // Get balance from 12 months ago using the userData structure
  const balances = userData?.balances || [];
  const balance12MonthsAgo = balances[11]?.balance?.totalValue || 0; // 12th element (0-indexed)
  
  if (balance12MonthsAgo === 0 || currentBalance === 0) return 0;
  return ((currentBalance - balance12MonthsAgo) / balance12MonthsAgo) * 100;
};

// Chart data selectors
export const getBalanceChartData = (userData) => {
  const balances = userData?.balances || [];
  const currentDate = new Date();
  
  // Get last 12 months data in reverse order (oldest to newest for charts)
  return balances.slice(0, 12).reverse().map((monthData, i) => {
    const monthOffset = 11 - i;
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthOffset, 1);
    const monthString = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
    
    const balance = monthData?.balance || {};
    const total = (balance.cash || 0) + (balance.digitalServices || 0) + (balance.stocks || 0) + 
                  (balance.bank || 0) + (balance.crypto || 0) + (balance.etf || 0) + 
                  (balance.bitcoin || 0) + (balance.bonds || 0) + (balance.funds || 0) + 
                  (balance.gold || 0) + (balance.emergencyFund || 0);
    
    return {
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
      total: total,
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
      month: monthString // Legacy property for compatibility
    };
  });
};