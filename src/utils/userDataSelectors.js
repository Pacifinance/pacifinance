/**
 * Utility functions to extract data from optimized UserContext structure
 * These selectors maintain compatibility with existing components while using the new optimized data structure
 */

// Current balance selectors
export const getCurrentBalance = (userData) => userData?.balances?.[0]?.balance || {};

export const getPreviousMonthBalance = (userData) => userData?.balances?.[1]?.balance || {};

export const getPreviousYearSameMonthBalance = (userData) => userData?.balances?.[12]?.balance || {};

// Individual asset selectors for current month
export const getCashReal = (userData) => getCurrentBalance(userData).cash || 0;
export const getBankReal = (userData) => getCurrentBalance(userData).bank || 0;
export const getDigitalServicesReal = (userData) => getCurrentBalance(userData).digitalServices || 0;
export const getEmergencyFund = (userData) => getCurrentBalance(userData).emergencyFund || 0;
export const getStocksReal = (userData) => getCurrentBalance(userData).stocks || 0;
export const getEtfReal = (userData) => getCurrentBalance(userData).etf || 0;
export const getBitcoinReal = (userData) => getCurrentBalance(userData).bitcoin || 0;
export const getCryptoReal = (userData) => getCurrentBalance(userData).crypto || 0;
export const getBondsReal = (userData) => getCurrentBalance(userData).bonds || 0;
export const getFundsReal = (userData) => getCurrentBalance(userData).funds || 0;
export const getGoldReal = (userData) => getCurrentBalance(userData).gold || 0;
export const getTotalReal = (userData) => getCurrentBalance(userData).totalReal || 0;

// Previous month balance selectors
export const getCashRealPreMonth = (userData) => getPreviousMonthBalance(userData).cash || 0;
export const getBankRealPreMonth = (userData) => getPreviousMonthBalance(userData).bank || 0;
export const getDigitalServicesRealPreMonth = (userData) => getPreviousMonthBalance(userData).digitalServices || 0;
export const getEmergencyFundPreMonth = (userData) => getPreviousMonthBalance(userData).emergencyFund || 0;
export const getStocksRealPreMonth = (userData) => getPreviousMonthBalance(userData).stocks || 0;
export const getEtfRealPreMonth = (userData) => getPreviousMonthBalance(userData).etf || 0;
export const getBitcoinRealPreMonth = (userData) => getPreviousMonthBalance(userData).bitcoin || 0;
export const getCryptoRealPreMonth = (userData) => getPreviousMonthBalance(userData).crypto || 0;
export const getBondsRealPreMonth = (userData) => getPreviousMonthBalance(userData).bonds || 0;
export const getFundsRealPreMonth = (userData) => getPreviousMonthBalance(userData).funds || 0;
export const getGoldRealPreMonth = (userData) => getPreviousMonthBalance(userData).gold || 0;
export const getTotalRealPreMonth = (userData) => getPreviousMonthBalance(userData).totalReal || 0;

// Previous year same month balance selectors
export const getCashRealPreYearSameMonth = (userData) => getPreviousYearSameMonthBalance(userData).cash || 0;
export const getBankRealPreYearSameMonth = (userData) => getPreviousYearSameMonthBalance(userData).bank || 0;
export const getDigitalServicesRealPreYearSameMonth = (userData) => getPreviousYearSameMonthBalance(userData).digitalServices || 0;
export const getEmergencyFundPreYearSameMonth = (userData) => getPreviousYearSameMonthBalance(userData).emergencyFund || 0;
export const getStocksRealPreYearSameMonth = (userData) => getPreviousYearSameMonthBalance(userData).stocks || 0;
export const getEtfRealPreYearSameMonth = (userData) => getPreviousYearSameMonthBalance(userData).etf || 0;
export const getBitcoinRealPreYearSameMonth = (userData) => getPreviousYearSameMonthBalance(userData).bitcoin || 0;
export const getCryptoRealPreYearSameMonth = (userData) => getPreviousYearSameMonthBalance(userData).crypto || 0;
export const getBondsRealPreYearSameMonth = (userData) => getPreviousYearSameMonthBalance(userData).bonds || 0;
export const getFundsRealPreYearSameMonth = (userData) => getPreviousYearSameMonthBalance(userData).funds || 0;
export const getGoldRealPreYearSameMonth = (userData) => getPreviousYearSameMonthBalance(userData).gold || 0;
export const getTotalRealPreYearSameMonth = (userData) => getPreviousYearSameMonthBalance(userData).totalReal || 0;

// Legacy format creators for backward compatibility
export const createLegacyBalanceData = (userData) => {
  const currentBalance = getCurrentBalance(userData);
  const preMonthBalance = getPreviousMonthBalance(userData);
  const preYearSameMonthBalance = getPreviousYearSameMonthBalance(userData);
  
  return {
    // Current month individual values
    cashReal: currentBalance.cash || 0,
    bankReal: currentBalance.bank || 0,
    digitalServicesReal: currentBalance.digitalServices || 0,
    emergencyFund: currentBalance.emergencyFund || 0,
    stocksReal: currentBalance.stocks || 0,
    etfReal: currentBalance.etf || 0,
    bitcoinReal: currentBalance.bitcoin || 0,
    cryptoReal: currentBalance.crypto || 0,
    bondsReal: currentBalance.bonds || 0,
    fundsReal: currentBalance.funds || 0,
    goldReal: currentBalance.gold || 0,
    totalReal: currentBalance.totalReal || 0,
    
    // Previous month individual values
    cashRealPreMonth: preMonthBalance.cash || 0,
    bankRealPreMonth: preMonthBalance.bank || 0,
    digitalServicesRealPreMonth: preMonthBalance.digitalServices || 0,
    emergencyFundPreMonth: preMonthBalance.emergencyFund || 0,
    stocksRealPreMonth: preMonthBalance.stocks || 0,
    etfRealPreMonth: preMonthBalance.etf || 0,
    bitcoinRealPreMonth: preMonthBalance.bitcoin || 0,
    cryptoRealPreMonth: preMonthBalance.crypto || 0,
    bondsRealPreMonth: preMonthBalance.bonds || 0,
    fundsRealPreMonth: preMonthBalance.funds || 0,
    goldRealPreMonth: preMonthBalance.gold || 0,
    totalRealPreMonth: preMonthBalance.totalReal || 0,
    
    // Previous year same month individual values
    cashRealPreYearSameMonth: preYearSameMonthBalance.cash || 0,
    bankRealPreYearSameMonth: preYearSameMonthBalance.bank || 0,
    digitalServicesRealPreYearSameMonth: preYearSameMonthBalance.digitalServices || 0,
    emergencyFundPreYearSameMonth: preYearSameMonthBalance.emergencyFund || 0,
    stocksRealPreYearSameMonth: preYearSameMonthBalance.stocks || 0,
    etfRealPreYearSameMonth: preYearSameMonthBalance.etf || 0,
    bitcoinRealPreYearSameMonth: preYearSameMonthBalance.bitcoin || 0,
    cryptoRealPreYearSameMonth: preYearSameMonthBalance.crypto || 0,
    bondsRealPreYearSameMonth: preYearSameMonthBalance.bonds || 0,
    fundsRealPreYearSameMonth: preYearSameMonthBalance.funds || 0,
    goldRealPreYearSameMonth: preYearSameMonthBalance.gold || 0,
    totalRealPreYearSameMonth: preYearSameMonthBalance.totalReal || 0,
    
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

// Expense and income selectors
export const getAllOutflows = (userData) => userData?.expenses?.allOutflows || [];
export const getOutflowsArray = (userData) => userData?.expenses?.outflowsArray || [];
export const getTotalOutflowsPerCategoryPerMonth = (userData) => userData?.expenses?.totalOutflowsPerCategoryPerMonth || {};
export const getAllIncomes = (userData) => userData?.expenses?.allIncomes || [];
export const getIncomesArray = (userData) => userData?.incomes?.incomesArray || [];

// Tags selectors
export const getOutflowsTags = (userData) => userData?.tags?.outflowsTags || [];
export const getIncomesTags = (userData) => userData?.tags?.incomesTags || [];
export const getPaymentTags = (userData) => userData?.tags?.paymentTags || [];
export const getNationalityTags = (userData) => userData?.tags?.nationalityTags || [];
export const getJobTags = (userData) => userData?.tags?.jobTags || [];
export const getJobTypeTags = (userData) => userData?.tags?.jobTypeTags || [];
export const getWorkTimeTags = (userData) => userData?.tags?.workTimeTags || [];
export const getRemoteTypeTags = (userData) => userData?.tags?.remoteTypeTags || [];

// Rankings selectors
export const getPercentageRankOnBalance = (userData) => userData?.rankings?.balance || 0;
export const getPercentageRankOnIncomes = (userData) => userData?.rankings?.incomes || 0;
export const getPercentageRankOnExpenses = (userData) => userData?.rankings?.expenses || 0;
export const getPercentageRankOnBalanceSimilar = (userData) => userData?.rankings?.balanceSimilar || 0;
export const getPercentageRankOnIncomesSimilar = (userData) => userData?.rankings?.incomesSimilar || 0;
export const getPercentageRankOnExpensesSimilar = (userData) => userData?.rankings?.expensesSimilar || 0;

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

// Financial insights data
export const getGoals = (userData) => userData?.goals || [];
export const getLimits = (userData) => userData?.limits || {};
export const getAssets = (userData) => userData?.assets || [];