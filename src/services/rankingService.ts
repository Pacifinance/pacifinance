/**
 * Ranking Service — encapsulates all ranking/comparison API calls.
 *
 * @module services/rankingService
 */
import type { AxiosInstance } from 'axios';
import type {
  RankBalancesRequest,
  RankExpensesRequest,
  RankResponse,
} from '../types/api';

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
      const asBalances = (body: RankBalancesRequest) =>
        apiClient.post<RankResponse>('/api/rank/balances', body);
      const asExpenses = (body: RankExpensesRequest) =>
        apiClient.post<RankResponse>('/api/rank/expenses', body);

      const [
        rankBalance,
        rankIncome,
        rankExpense,
        rankBalanceSimilar,
        rankIncomeSimilar,
        rankExpenseSimilar,
      ] = await Promise.all([
        asBalances({}),
        asExpenses({ expenses: false }),
        asExpenses({ expenses: true }),
        asBalances({ similar: true }),
        asExpenses({ expenses: false, similar: true }),
        asExpenses({ expenses: true, similar: true }),
      ]);

      return {
        balance: rankBalance?.data?.position ?? 0,
        incomes: rankIncome?.data?.position ?? 0,
        outflows: rankExpense?.data?.position ?? 0,
        balanceSimilar: rankBalanceSimilar?.data?.position ?? 0,
        incomesSimilar: rankIncomeSimilar?.data?.position ?? 0,
        outflowsSimilar: rankExpenseSimilar?.data?.position ?? 0,
      };
    } catch {
      console.warn('Ranking endpoints error, using defaults');
      return defaults;
    }
  },
});

export default createRankingService;
