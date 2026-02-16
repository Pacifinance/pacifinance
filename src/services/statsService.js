/**
 * Stats Service — encapsulates statistic/average API calls.
 *
 * @module services/statsService
 */

/**
 * Creates a stats-service bound to the given HTTP client.
 *
 * @param {import('axios').AxiosInstance} apiClient
 * @returns {Object}
 */
export const createStatsService = (apiClient) => ({
  /**
   * Get average statistics (all users + similar users).
   * @returns {Promise<Object>} Averages data
   */
  async getAverages() {
    const defaults = {
      all: { balances: null, expenses: null, incomes: null, savingsRates: null, expensesByCategory: null },
      similar: { balances: null, expenses: null, incomes: null, savingsRates: null, expensesByCategory: null },
    };

    try {
      const res = await apiClient.post('/stats/averages', null);
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
      console.debug('/stats/averages endpoint not available, using defaults');
      return defaults;
    }
  },
});

export default createStatsService;
