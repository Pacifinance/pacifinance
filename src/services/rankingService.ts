/**
 * Ranking Service — encapsulates all ranking/comparison API calls.
 *
 * @module services/rankingService
 */
import type { AxiosInstance } from 'axios';

export interface RankingSnapshot {
  balance: number;
  incomes: number;
  outflows: number;
  balanceSimilar: number;
  incomesSimilar: number;
  outflowsSimilar: number;
}

export type ComparisonFactorGroup = 'career' | 'location' | 'lifeStage' | 'household';

export interface CustomBenchmark {
  available: boolean;
  factors: ComparisonFactorGroup[];
  generatedAt: string;
  cohort: {
    size: number;
    populationSize: number;
    minimumSize: number;
    averageSimilarity: number | null;
  };
  averages: {
    balances: number | null;
    incomes: number | null;
    expenses: number | null;
  };
  rankings: {
    balance: number;
    incomes: number;
    outflows: number;
  };
}

export interface CustomBenchmarkPreview {
  factors: ComparisonFactorGroup[];
  available: boolean;
  cohort: CustomBenchmark['cohort'];
}

export interface RankingService {
  getAllRankings(): Promise<RankingSnapshot>;
  getCustomBenchmark(factors: ComparisonFactorGroup[]): Promise<CustomBenchmark>;
  previewCustomBenchmark(factors: ComparisonFactorGroup[]): Promise<CustomBenchmarkPreview>;
}

/** Creates a ranking-service bound to the given HTTP client. */
export const createRankingService = (apiClient: AxiosInstance): RankingService => ({
  async getAllRankings() {
    const defaults: RankingSnapshot = {
      balance: 0,
      incomes: 0,
      outflows: 0,
      balanceSimilar: 0,
      incomesSimilar: 0,
      outflowsSimilar: 0,
    };

    try {
      const res = await apiClient.post<Partial<RankingSnapshot>>('/api/rank/get', {});
      const data = res.data || {};

      return {
        balance: data.balance ?? 0,
        incomes: data.incomes ?? 0,
        outflows: data.outflows ?? 0,
        balanceSimilar: data.balanceSimilar ?? 0,
        incomesSimilar: data.incomesSimilar ?? 0,
        outflowsSimilar: data.outflowsSimilar ?? 0,
      };
    } catch {
      console.warn('Ranking endpoints error, using defaults');
      return defaults;
    }
  },

  async getCustomBenchmark(factors) {
    const res = await apiClient.post<CustomBenchmark>('/api/rank/custom', { factors });
    return res.data;
  },

  async previewCustomBenchmark(factors) {
    const res = await apiClient.post<CustomBenchmarkPreview>('/api/rank/custom-preview', { factors });
    return res.data;
  },
});

export default createRankingService;
