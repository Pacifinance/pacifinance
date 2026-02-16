/**
 * Ranking Service — encapsulates all ranking/comparison API calls.
 *
 * @module services/rankingService
 */

/**
 * Creates a ranking-service bound to the given HTTP client.
 *
 * @param {import('axios').AxiosInstance} apiClient
 * @returns {Object}
 */
export const createRankingService = (apiClient) => ({
  /**
   * Get all ranking positions (balance, income, outflows — global + similar).
   * Makes all 6 calls in parallel.
   * @returns {Promise<Object>} Ranking data
   */
  async getAllRankings() {
    const defaults = {
      balance: 0,
      incomes: 0,
      outflows: 0,
      balanceSimilar: 0,
      incomesSimilar: 0,
      outflowsSimilar: 0,
    };

    try {
      const [
        rankBalance,
        rankIncome,
        rankExpense,
        rankBalanceSimilar,
        rankIncomeSimilar,
        rankExpenseSimilar,
      ] = await Promise.all([
        apiClient.post('/rank/balances', null),
        apiClient.post('/rank/expenses', { expenses: false }),
        apiClient.post('/rank/expenses', { expenses: true }),
        apiClient.post('/rank/balances', { similar: true }),
        apiClient.post('/rank/expenses', { expenses: false, similar: true }),
        apiClient.post('/rank/expenses', { expenses: true, similar: true }),
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
