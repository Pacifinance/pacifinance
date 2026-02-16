/**
 * Finance Service — encapsulates balance, expense, and income API calls.
 *
 * Injected with an API client for testability (Dependency Injection pattern).
 *
 * @module services/financeService
 */

/**
 * Creates a finance-service bound to the given HTTP client.
 *
 * @param {import('axios').AxiosInstance} apiClient
 * @returns {Object} The finance service methods
 */
export const createFinanceService = (apiClient) => ({
  /**
   * Get all balance data.
   * @returns {Promise<Array>}
   */
  async getBalances() {
    const res = await apiClient.post('/balances/get', null);
    return Array.isArray(res.data) ? res.data : [];
  },

  /**
   * Add/update balance data.
   * @param {Object} balanceData
   * @returns {Promise<import('axios').AxiosResponse>} Full response (callers check status)
   */
  async addBalance(balanceData) {
    const res = await apiClient.post('/balances/add', balanceData);
    return res;
  },

  /**
   * Get all expenses and incomes.
   * @returns {Promise<Array>}
   */
  async getExpensesAndIncomes() {
    const res = await apiClient.post('/expenses/get', null);
    return Array.isArray(res.data) ? res.data : [];
  },

  /**
   * Add an expense or income entry.
   * @param {Object} data
   * @returns {Promise<import('axios').AxiosResponse>} Full response (callers check status)
   */
  async addExpenseOrIncome(data) {
    const res = await apiClient.post('/expenses/add', data);
    return res;
  },

  /**
   * Delete an expense or income entry.
   * @param {Object} data
   * @returns {Promise<import('axios').AxiosResponse>} Full response (callers check status)
   */
  async deleteExpenseOrIncome(data) {
    const res = await apiClient.post('/expenses/delete', data);
    return res;
  },
});

export default createFinanceService;
