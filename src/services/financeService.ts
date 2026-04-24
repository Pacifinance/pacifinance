/**
 * Finance Service — encapsulates balance, expense, and income API calls.
 *
 * Injected with an API client for testability (Dependency Injection pattern).
 *
 * @module services/financeService
 */
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  BalanceAddRequest,
  BalancesGetResponse,
  ExpenseAddRequest,
  ExpenseDeleteRequest,
  ExpensesGetResponse,
} from '../types/api';

export interface FinanceService {
  /** GET-style POST to /balances/get. */
  getBalances(): Promise<BalancesGetResponse>;
  /** POST /balances/add. Returns the full axios response so callers can check status. */
  addBalance(balanceData: BalanceAddRequest): Promise<AxiosResponse>;
  /** GET-style POST to /expenses/get. */
  getExpensesAndIncomes(): Promise<ExpensesGetResponse>;
  /** POST /expenses/add. */
  addExpenseOrIncome(data: ExpenseAddRequest): Promise<AxiosResponse>;
  /** POST /expenses/delete. */
  deleteExpenseOrIncome(data: ExpenseDeleteRequest): Promise<AxiosResponse>;
}

/**
 * Creates a finance-service bound to the given HTTP client.
 */
export const createFinanceService = (apiClient: AxiosInstance): FinanceService => ({
  async getBalances() {
    const res = await apiClient.post<BalancesGetResponse>('/api/balances/get', {});
    return Array.isArray(res.data) ? res.data : [];
  },

  async addBalance(balanceData) {
    const res = await apiClient.post('/api/balances/add', balanceData);
    return res;
  },

  async getExpensesAndIncomes() {
    const res = await apiClient.post<ExpensesGetResponse>('/api/expenses/get', {});
    return Array.isArray(res.data) ? res.data : [];
  },

  async addExpenseOrIncome(data) {
    const res = await apiClient.post('/api/expenses/add', data);
    return res;
  },

  async deleteExpenseOrIncome(data) {
    const res = await apiClient.post('/api/expenses/delete', data);
    return res;
  },
});

export default createFinanceService;
