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

export interface RankingService {
  getAllRankings(): Promise<RankingSnapshot>;
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
});

export default createRankingService;
