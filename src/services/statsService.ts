/**
 * Stats Service — encapsulates statistic/average API calls.
 *
 * @module services/statsService
 */
import type { AxiosInstance } from 'axios';
import type { StatsAverageBucket, StatsAveragesResponse } from '../types/api';

export interface AveragesSnapshot {
  all: StatsAverageBucket;
  similar: StatsAverageBucket;
}

export interface StatsService {
  getAverages(): Promise<AveragesSnapshot>;
}

const emptyBucket = (): StatsAverageBucket => ({
  balances: null,
  expenses: null,
  incomes: null,
  savingsRates: null,
  expensesByCategory: null,
});

/** Creates a stats-service bound to the given HTTP client. */
export const createStatsService = (apiClient: AxiosInstance): StatsService => ({
  async getAverages() {
    const defaults: AveragesSnapshot = {
      all: emptyBucket(),
      similar: emptyBucket(),
    };

    try {
      const res = await apiClient.post<StatsAveragesResponse>('/api/stats/averages', {});
      const data = res.data;

      return {
        all: {
          balances: data.all?.balances ?? data.general?.balances ?? null,
          expenses: data.all?.expenses ?? data.general?.expenses ?? null,
          incomes: data.all?.incomes ?? data.general?.incomes ?? null,
          savingsRates: data.all?.savingsRates ?? null,
          expensesByCategory: data.all?.expensesByCategory ?? null,
        },
        similar: {
          balances: data.similar?.balances ?? null,
          expenses: data.similar?.expenses ?? null,
          incomes: data.similar?.incomes ?? null,
          savingsRates: data.similar?.savingsRates ?? null,
          expensesByCategory: data.similar?.expensesByCategory ?? null,
        },
      };
    } catch {
      console.warn('/api/stats/averages endpoint not available, using defaults');
      return defaults;
    }
  },
});

export default createStatsService;
