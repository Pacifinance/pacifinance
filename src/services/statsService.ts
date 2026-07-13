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
  distributions: undefined,
  longitudinal: undefined,
});

const normalizeBucket = (bucket?: StatsAverageBucket): StatsAverageBucket => ({
  balances: bucket?.balances ?? null,
  expenses: bucket?.expenses ?? null,
  incomes: bucket?.incomes ?? null,
  savingsRates: bucket?.savingsRates ?? null,
  expensesByCategory: bucket?.expensesByCategory ?? null,
  distributions: bucket?.distributions,
  longitudinal: bucket?.longitudinal,
  benchmark: bucket?.benchmark,
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
        all: normalizeBucket(data.all ?? data.general),
        similar: normalizeBucket(data.similar),
      };
    } catch {
      console.warn('/api/stats/averages endpoint not available, using defaults');
      return defaults;
    }
  },
});

export default createStatsService;
