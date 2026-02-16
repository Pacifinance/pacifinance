/**
 * Tests for userDataSelectors utility functions
 * These selectors extract data from the userData structure
 */

import { describe, it, expect } from 'vitest';
import {
  // Balance selectors
  getCurrentBalance,
  getPreviousMonthBalance,
  getPreviousYearSameMonthBalance,
  getCashValue,
  getBankValue,
  getDigitalServicesValue,
  getEmergencyFund,
  getStocksValue,
  getEtfValue,
  getBitcoinValue,
  getCryptoValue,
  getBondsValue,
  getFundsValue,
  getGoldValue,
  getTotalValue,
  
  // Previous month selectors
  getCashValuePreMonth,
  getBankValuePreMonth,
  getTotalValuePreMonth,
  
  // Previous year same month selectors
  getCashValuePreYearSameMonth,
  getBankValuePreYearSameMonth,
  getTotalValuePreYearSameMonth,
  
  // Profile selectors
  getUserNationality,
  getUserJob,
  getUserAge,
  getProfileCompletionPercentage,
  
  // Expense and income selectors
  getAllOutflows,
  getOutflowsArray,
  getTotalOutflowsPerCategoryPerMonth,
  getAllIncomes,
  getIncomesArray,
  getTotalOutflowsCurrentMonth,
  getTotalIncomesCurrentMonth,
  getTotalSavedCurrentMonth,
  
  // Tags selectors
  getOutflowsTags,
  getIncomesTags,
  getPaymentTags,
  
  // Rankings selectors
  getPercentageRankOnBalance,
  getPercentageRankOnIncomes,
  getPercentageRankOnOutflows,
  getPercentageRankOnBalanceSimilar,
  
  // Date selectors
  getCurrentDate,
  getPreMonthDate,
  getFormattedPreMonthDateLocalized,
  
  // Goals and limits selectors
  getMonthlySpendingLimit,
  getSavingsGoalPercentage,
  getEmergencyFundTarget,
  
  // Growth calculation
  getBalanceGrowth12Months,
  
  // New user detection
  isNewUser,
  
  // Legacy helper
  createLegacyBalanceData,
} from '../../utils/userDataSelectors';

// Complete mock userData based on MockAuthContext structure
const mockUserData = {
  userId: 'test-user-123',
  userType: 'premium',
  username: 'Test User',
  profileCompletionPercentage: 85,
  
  profile: {
    nationality: { key: 107, value: 'Italia' },
    whereWorks: { key: 107, value: 'Italia' },
    job: { key: 1, value: 'Informatica' },
    jobType: { key: 0, value: 'Lavoro dipendente' },
    workTime: { key: 1, value: 'Full time' },
    remoteType: { key: 1, value: 'Ibrido' },
    age: { key: 3, value: '30-35' },
    completionPercentage: 85
  },
  
  balances: [
    // Current month [0]
    {
      date: '2026-01-27T00:00:00.000Z',
      balance: {
        cash: 500,
        bank: 20000,
        digitalServices: 150,
        emergencyFund: 5000,
        stocks: 8000,
        etf: 25000,
        bitcoin: 1500,
        crypto: 500,
        bonds: 15000,
        funds: 12500,
        gold: 8000,
        totalValue: 96150
      }
    },
    // Previous month [1]
    {
      date: '2025-12-27T00:00:00.000Z',
      balance: {
        cash: 450,
        bank: 18500,
        digitalServices: 100,
        emergencyFund: 4500,
        stocks: 7500,
        etf: 24000,
        bitcoin: 1200,
        crypto: 400,
        bonds: 14000,
        funds: 11800,
        gold: 7500,
        totalValue: 89950
      }
    },
    // Fill months 2-11 with sample data
    ...Array(10).fill(null).map((_, i) => ({
      date: new Date(2025, 10 - i, 27).toISOString(),
      balance: {
        cash: 400,
        bank: 17000,
        digitalServices: 50,
        emergencyFund: 4000,
        stocks: 7000,
        etf: 22000,
        bitcoin: 1000,
        crypto: 300,
        bonds: 13000,
        funds: 10000,
        gold: 6500,
        totalValue: 81250
      }
    })),
    // Previous year same month [12]
    {
      date: '2025-01-27T00:00:00.000Z',
      balance: {
        cash: 300,
        bank: 15000,
        digitalServices: 0,
        emergencyFund: 3000,
        stocks: 5000,
        etf: 18000,
        bitcoin: 800,
        crypto: 200,
        bonds: 10000,
        funds: 8000,
        gold: 5000,
        totalValue: 65300
      }
    }
  ],
  
  expenses: {
    allOutflows: [
      [
        { amount: 50, categoryTag: { translations: { en: 'Food' } }, isExpense: true },
        { amount: 800, categoryTag: { translations: { en: 'House' } }, isExpense: true },
        { amount: 150, categoryTag: { translations: { en: 'Transport' } }, isExpense: true }
      ]
    ],
    outflowsArray: [2100, 1950, 2200, 1800, 2300, 1750, 2150, 1900, 2050, 1850, 2250, 1700, 2000],
    totalOutflowsPerCategoryPerMonth: {
      0: { 'House': 800, 'Food': 600, 'Transport': 400, 'Entertainment': 300 }
    }
  },
  
  incomes: {
    allIncomes: [
      [
        { amount: 2800, categoryTag: { translations: { en: 'Salary' } }, isExpense: false }
      ]
    ],
    incomesArray: [2800, 2750, 2900, 2650, 2850, 2700, 2800, 2750, 2900, 2650, 2850, 2700, 2600]
  },
  
  tags: {
    outflowsTags: ['Food', 'Transport', 'House'],
    incomesTags: ['Salary', 'Freelance'],
    paymentTags: ['Cash', 'Card', 'Transfer']
  },
  
  rankings: {
    balance: 75,
    incomes: 65,
    outflows: 45,
    balanceSimilar: 80,
    incomesSimilar: 70,
    outflowsSimilar: 50
  },
  
  dates: {
    current: '2026-01-27T00:00:00.000Z',
    preMonth: '2025-12-27T00:00:00.000Z',
    preYearSameMonth: '2025-01-27T00:00:00.000Z'
  },
  
  limits: {
    monthlySpendingLimit: 2500,
    savingsGoalPercentage: 25,
    emergencyFundTarget: 15000
  }
};

describe('userDataSelectors', () => {
  describe('Balance Selectors', () => {
    describe('getCurrentBalance', () => {
      it('should return current balance object', () => {
        const result = getCurrentBalance(mockUserData);
        expect(result).toEqual(mockUserData.balances[0].balance);
        expect(result.bank).toBe(20000);
      });

      it('should return empty object when userData is null', () => {
        const result = getCurrentBalance(null);
        expect(result).toEqual({});
      });

      it('should return empty object when balances array is empty', () => {
        const result = getCurrentBalance({ balances: [] });
        expect(result).toEqual({});
      });
    });

    describe('getPreviousMonthBalance', () => {
      it('should return previous month balance', () => {
        const result = getPreviousMonthBalance(mockUserData);
        expect(result.bank).toBe(18500);
      });

      it('should return empty object when userData is null', () => {
        const result = getPreviousMonthBalance(null);
        expect(result).toEqual({});
      });
    });

    describe('getPreviousYearSameMonthBalance', () => {
      it('should return balance from same month last year', () => {
        const result = getPreviousYearSameMonthBalance(mockUserData);
        expect(result.bank).toBe(15000);
      });
    });

    describe('Individual Asset Selectors', () => {
      it('getCashValue should return current cash', () => {
        expect(getCashValue(mockUserData)).toBe(500);
      });

      it('getBankValue should return current bank balance', () => {
        expect(getBankValue(mockUserData)).toBe(20000);
      });

      it('getDigitalServicesValue should return current digital services', () => {
        expect(getDigitalServicesValue(mockUserData)).toBe(150);
      });

      it('getEmergencyFund should return current emergency fund', () => {
        expect(getEmergencyFund(mockUserData)).toBe(5000);
      });

      it('getStocksValue should return current stocks', () => {
        expect(getStocksValue(mockUserData)).toBe(8000);
      });

      it('getEtfValue should return current ETF', () => {
        expect(getEtfValue(mockUserData)).toBe(25000);
      });

      it('getBitcoinValue should return current Bitcoin', () => {
        expect(getBitcoinValue(mockUserData)).toBe(1500);
      });

      it('getCryptoValue should return current crypto', () => {
        expect(getCryptoValue(mockUserData)).toBe(500);
      });

      it('getBondsValue should return current bonds', () => {
        expect(getBondsValue(mockUserData)).toBe(15000);
      });

      it('getFundsValue should return current funds', () => {
        expect(getFundsValue(mockUserData)).toBe(12500);
      });

      it('getGoldValue should return current gold', () => {
        expect(getGoldValue(mockUserData)).toBe(8000);
      });

      it('getTotalValue should return total value', () => {
        expect(getTotalValue(mockUserData)).toBe(96150);
      });
    });

    describe('Previous Month Asset Selectors', () => {
      it('getCashValuePreMonth should return previous month cash', () => {
        expect(getCashValuePreMonth(mockUserData)).toBe(450);
      });

      it('getBankValuePreMonth should return previous month bank', () => {
        expect(getBankValuePreMonth(mockUserData)).toBe(18500);
      });

      it('getTotalValuePreMonth should return previous month total', () => {
        expect(getTotalValuePreMonth(mockUserData)).toBe(89950);
      });
    });

    describe('Previous Year Same Month Asset Selectors', () => {
      it('getCashValuePreYearSameMonth should return last year same month cash', () => {
        expect(getCashValuePreYearSameMonth(mockUserData)).toBe(300);
      });

      it('getBankValuePreYearSameMonth should return last year same month bank', () => {
        expect(getBankValuePreYearSameMonth(mockUserData)).toBe(15000);
      });

      it('getTotalValuePreYearSameMonth should return last year same month total', () => {
        expect(getTotalValuePreYearSameMonth(mockUserData)).toBe(65300);
      });
    });

    describe('Null/undefined handling', () => {
      it('should return 0 for all individual selectors when userData is null', () => {
        expect(getCashValue(null)).toBe(0);
        expect(getBankValue(null)).toBe(0);
        expect(getDigitalServicesValue(null)).toBe(0);
        expect(getEmergencyFund(null)).toBe(0);
        expect(getStocksValue(null)).toBe(0);
        expect(getEtfValue(null)).toBe(0);
        expect(getBitcoinValue(null)).toBe(0);
        expect(getCryptoValue(null)).toBe(0);
        expect(getBondsValue(null)).toBe(0);
        expect(getFundsValue(null)).toBe(0);
        expect(getGoldValue(null)).toBe(0);
        expect(getTotalValue(null)).toBe(0);
      });

      it('should return 0 when balance property is missing', () => {
        const incompleteData = { balances: [{ date: '2026-01-27' }] };
        expect(getCashValue(incompleteData)).toBe(0);
        expect(getBankValue(incompleteData)).toBe(0);
      });
    });
  });

  describe('Profile Selectors', () => {
    it('getUserNationality should return nationality object', () => {
      const result = getUserNationality(mockUserData);
      expect(result.key).toBe(107);
      expect(result.value).toBe('Italia');
    });

    it('getUserNationality should return default when missing', () => {
      const result = getUserNationality(null);
      expect(result.key).toBe(-1);
    });

    it('getUserJob should return job object', () => {
      const result = getUserJob(mockUserData);
      expect(result.key).toBe(1);
      expect(result.value).toBe('Informatica');
    });

    it('getUserAge should return age object', () => {
      const result = getUserAge(mockUserData);
      expect(result.key).toBe(3);
    });

    it('getProfileCompletionPercentage should return completion percentage', () => {
      expect(getProfileCompletionPercentage(mockUserData)).toBe(85);
    });

    it('getProfileCompletionPercentage should return 0 when missing', () => {
      expect(getProfileCompletionPercentage(null)).toBe(0);
    });
  });

  describe('Expense and Income Selectors', () => {
    it('getAllOutflows should return outflows array', () => {
      const result = getAllOutflows(mockUserData);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(3);
    });

    it('getOutflowsArray should return monthly totals', () => {
      const result = getOutflowsArray(mockUserData);
      expect(result[0]).toBe(2100);
      expect(result).toHaveLength(13);
    });

    it('getTotalOutflowsPerCategoryPerMonth should return category totals', () => {
      const result = getTotalOutflowsPerCategoryPerMonth(mockUserData);
      expect(result[0]).toBeDefined();
      expect(result[0].House).toBe(800);
    });

    it('getAllIncomes should return incomes array', () => {
      const result = getAllIncomes(mockUserData);
      expect(result).toHaveLength(1);
    });

    it('getIncomesArray should return monthly income totals', () => {
      const result = getIncomesArray(mockUserData);
      expect(result[0]).toBe(2800);
    });

    it('getTotalOutflowsCurrentMonth should return current month outflows', () => {
      expect(getTotalOutflowsCurrentMonth(mockUserData)).toBe(2100);
    });

    it('getTotalIncomesCurrentMonth should return current month incomes', () => {
      expect(getTotalIncomesCurrentMonth(mockUserData)).toBe(2800);
    });

    it('getTotalSavedCurrentMonth should return incomes minus outflows', () => {
      const expected = 2800 - 2100;
      expect(getTotalSavedCurrentMonth(mockUserData)).toBe(expected);
    });

    it('should return empty arrays when userData is null', () => {
      expect(getAllOutflows(null)).toEqual([]);
      expect(getOutflowsArray(null)).toEqual([]);
      expect(getAllIncomes(null)).toEqual([]);
      expect(getIncomesArray(null)).toEqual([]);
    });
  });

  describe('Tags Selectors', () => {
    it('getOutflowsTags should return expense tags', () => {
      const result = getOutflowsTags(mockUserData);
      expect(result).toContain('Food');
      expect(result).toContain('Transport');
    });

    it('getIncomesTags should return income tags', () => {
      const result = getIncomesTags(mockUserData);
      expect(result).toContain('Salary');
    });

    it('getPaymentTags should return payment tags', () => {
      const result = getPaymentTags(mockUserData);
      expect(result).toContain('Cash');
    });

    it('should return empty arrays when userData is null', () => {
      expect(getOutflowsTags(null)).toEqual([]);
      expect(getIncomesTags(null)).toEqual([]);
      expect(getPaymentTags(null)).toEqual([]);
    });
  });

  describe('Rankings Selectors', () => {
    it('getPercentageRankOnBalance should return balance ranking', () => {
      expect(getPercentageRankOnBalance(mockUserData)).toBe(75);
    });

    it('getPercentageRankOnIncomes should return income ranking', () => {
      expect(getPercentageRankOnIncomes(mockUserData)).toBe(65);
    });

    it('getPercentageRankOnOutflows should return outflow ranking', () => {
      expect(getPercentageRankOnOutflows(mockUserData)).toBe(45);
    });

    it('getPercentageRankOnBalanceSimilar should return similar users balance ranking', () => {
      expect(getPercentageRankOnBalanceSimilar(mockUserData)).toBe(80);
    });

    it('should return 0 when rankings are missing', () => {
      expect(getPercentageRankOnBalance(null)).toBe(0);
      expect(getPercentageRankOnIncomes(null)).toBe(0);
      expect(getPercentageRankOnOutflows(null)).toBe(0);
    });
  });

  describe('Date Selectors', () => {
    it('getCurrentDate should return current date', () => {
      const result = getCurrentDate(mockUserData);
      expect(result).toBe('2026-01-27T00:00:00.000Z');
    });

    it('getPreMonthDate should return previous month date', () => {
      const result = getPreMonthDate(mockUserData);
      expect(result).toBe('2025-12-27T00:00:00.000Z');
    });

    it('getFormattedPreMonthDateLocalized should return Italian month name', () => {
      const result = getFormattedPreMonthDateLocalized(mockUserData, 'it');
      expect(result).toContain('Dicembre');
      expect(result).toContain('2025');
    });

    it('getFormattedPreMonthDateLocalized should return English month name', () => {
      const result = getFormattedPreMonthDateLocalized(mockUserData, 'en');
      expect(result).toContain('December');
      expect(result).toContain('2025');
    });

    it('should return empty string when date is missing', () => {
      expect(getFormattedPreMonthDateLocalized(null, 'it')).toBe('');
    });
  });

  describe('Goals and Limits Selectors', () => {
    it('getMonthlySpendingLimit should return spending limit', () => {
      expect(getMonthlySpendingLimit(mockUserData)).toBe(2500);
    });

    it('getSavingsGoalPercentage should return savings goal', () => {
      expect(getSavingsGoalPercentage(mockUserData)).toBe(25);
    });

    it('getEmergencyFundTarget should return emergency fund target', () => {
      expect(getEmergencyFundTarget(mockUserData)).toBe(15000);
    });

    it('should return defaults when userData is null', () => {
      expect(getMonthlySpendingLimit(null)).toBe(2000);
      expect(getSavingsGoalPercentage(null)).toBe(20);
      expect(getEmergencyFundTarget(null)).toBe(10000);
    });
  });

  describe('Balance Growth Calculation', () => {
    it('getBalanceGrowth12Months should calculate growth percentage', () => {
      const result = getBalanceGrowth12Months(mockUserData);
      // Current: 96150, 11 months ago (index 11): 81250 (filled data)
      // Growth: ((96150 - 81250) / 81250) * 100 ≈ 18.34%
      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe('number');
    });

    it('should return 0 when previous balance is 0', () => {
      const dataWithZeroBalance = {
        ...mockUserData,
        balances: [
          mockUserData.balances[0],
          ...Array(11).fill({ date: '', balance: { totalValue: 0 } }),
          { date: '', balance: { totalValue: 0 } }
        ]
      };
      expect(getBalanceGrowth12Months(dataWithZeroBalance)).toBe(0);
    });
  });

  describe('Legacy Balance Data', () => {
    it('createLegacyBalanceData should return backward compatible structure', () => {
      const result = createLegacyBalanceData(mockUserData);
      
      // Current month values
      expect(result.cashValue).toBe(500);
      expect(result.bankValue).toBe(20000);
      expect(result.totalValue).toBe(96150);
      
      // Previous month values
      expect(result.cashValuePreMonth).toBe(450);
      expect(result.bankValuePreMonth).toBe(18500);
      
      // Previous year same month values
      expect(result.cashValuePreYearSameMonth).toBe(300);
      expect(result.bankValuePreYearSameMonth).toBe(15000);
    });

    it('should return all zeros when userData is null', () => {
      const result = createLegacyBalanceData(null);
      expect(result.cashValue).toBe(0);
      expect(result.bankValue).toBe(0);
      expect(result.totalValue).toBe(0);
    });
  });

  describe('isNewUser', () => {
    it('should return false for null userData', () => {
      expect(isNewUser(null)).toBe(false);
    });

    it('should return false for undefined userData', () => {
      expect(isNewUser(undefined)).toBe(false);
    });

    it('should return true for a user with no balances, no outflows, no incomes', () => {
      const emptyUser = {
        balances: [{ date: '2026-01-01', balance: { totalValue: 0, bank: 0, cash: 0 } }],
        expenses: { allOutflows: [], outflowsArray: [] },
        incomes: { allIncomes: [], incomesArray: [] },
      };
      expect(isNewUser(emptyUser)).toBe(true);
    });

    it('should return true for a user with empty balances array', () => {
      const emptyUser = {
        balances: [],
        expenses: { allOutflows: [] },
        incomes: { allIncomes: [] },
      };
      expect(isNewUser(emptyUser)).toBe(true);
    });

    it('should return false when user has balance > 0', () => {
      const userWithBalance = {
        balances: [{ date: '2026-01-01', balance: { totalValue: 5000, bank: 5000 } }],
        expenses: { allOutflows: [] },
        incomes: { allIncomes: [] },
      };
      expect(isNewUser(userWithBalance)).toBe(false);
    });

    it('should return false when user has outflows', () => {
      const userWithOutflows = {
        balances: [{ date: '2026-01-01', balance: { totalValue: 0 } }],
        expenses: { allOutflows: [{ amount: 100 }] },
        incomes: { allIncomes: [] },
      };
      expect(isNewUser(userWithOutflows)).toBe(false);
    });

    it('should return false when user has incomes', () => {
      const userWithIncomes = {
        balances: [{ date: '2026-01-01', balance: { totalValue: 0 } }],
        expenses: { allOutflows: [] },
        incomes: { allIncomes: [{ amount: 2000 }] },
      };
      expect(isNewUser(userWithIncomes)).toBe(false);
    });

    it('should return false for fully populated user (mockUserData)', () => {
      expect(isNewUser(mockUserData)).toBe(false);
    });

    it('should return true for user with zero totalValue and no transactions', () => {
      const zeroUser = {
        balances: [{
          date: '2026-01-01',
          balance: {
            cash: 0, bank: 0, digitalServices: 0, emergencyFund: 0,
            stocks: 0, etf: 0, bitcoin: 0, crypto: 0,
            bonds: 0, funds: 0, gold: 0, totalValue: 0
          }
        }],
        expenses: { allOutflows: [], outflowsArray: [0, 0, 0] },
        incomes: { allIncomes: [], incomesArray: [0, 0, 0] },
      };
      expect(isNewUser(zeroUser)).toBe(true);
    });

    it('should return true for user with missing expense/income fields', () => {
      const sparseUser = {
        balances: [{ date: '2026-01-01', balance: {} }],
      };
      expect(isNewUser(sparseUser)).toBe(true);
    });
  });
});
