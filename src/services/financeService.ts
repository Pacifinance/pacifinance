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
  ExpenseBatchAddRequest,
  ExpenseBatchAddResponse,
  ExpenseDeleteRequest,
  ExpensesGetResponse,
  MonthlyTotalsResponse,
  MonthDetailResponse,
  CategoriesGetResponse,
  CategoryAddRequest,
  CategoryDeleteRequest,
  CategoryRenameRequest,
  UserCategoryDto,
  ExchangeRatesResponse,
} from '../types/api';
import { withRetry } from '../utils/retryRequest';

export interface FinanceService {
  /** GET-style POST to /balances/get. `months` omitted -> default 24-month window; pass a number or 'all' for more. */
  getBalances(months?: number | 'all'): Promise<BalancesGetResponse>;
  /** POST /balances/add. Returns the full axios response so callers can check status. */
  addBalance(balanceData: BalanceAddRequest): Promise<AxiosResponse>;
  /** GET-style POST to /expenses/get. */
  getExpensesAndIncomes(): Promise<ExpensesGetResponse>;
  /** GET-style POST to /expenses/monthly-totals — aggregated sums only, for multi-year charts. */
  getMonthlyTotals(months?: number | 'all'): Promise<MonthlyTotalsResponse>;
  /** POST /expenses/month — one arbitrary month's tagged transactions, on demand. */
  getMonthDetail(year: number, month: number): Promise<MonthDetailResponse>;
  /** POST /expenses/add. */
  addExpenseOrIncome(data: ExpenseAddRequest): Promise<AxiosResponse>;
  /** POST /expenses/batch-add — one HTTP request and one database insert for CSV imports. */
  addExpensesAndIncomesBatch(data: ExpenseBatchAddRequest): Promise<ExpenseBatchAddResponse>;
  /** POST /expenses/delete. */
  deleteExpenseOrIncome(data: ExpenseDeleteRequest): Promise<AxiosResponse>;
  /** GET-style POST to /categories/get — the user's custom sub-categories. */
  getCustomCategories(): Promise<CategoriesGetResponse>;
  /** POST /categories/add. */
  addCustomCategory(data: CategoryAddRequest): Promise<UserCategoryDto>;
  /** POST /categories/rename. */
  renameCustomCategory(data: CategoryRenameRequest): Promise<UserCategoryDto>;
  /** POST /categories/delete. */
  deleteCustomCategory(data: CategoryDeleteRequest): Promise<AxiosResponse>;
  /** GET /exchange-rates — EUR-based rates, cached server-side (refreshed daily). */
  getExchangeRates(): Promise<ExchangeRatesResponse | null>;
}

/**
 * Creates a finance-service bound to the given HTTP client.
 */
export const createFinanceService = (apiClient: AxiosInstance): FinanceService => ({
  async getBalances(months) {
    const res = await withRetry(() =>
      apiClient.post<BalancesGetResponse>('/api/balances/get', months !== undefined ? { months } : {}),
    );
    return Array.isArray(res.data) ? res.data : [];
  },

  async addBalance(balanceData) {
    const res = await apiClient.post('/api/balances/add', balanceData);
    return res;
  },

  async getExpensesAndIncomes() {
    const res = await withRetry(() => apiClient.post<ExpensesGetResponse>('/api/expenses/get', {}));
    return Array.isArray(res.data) ? res.data : [];
  },

  async getMonthlyTotals(months) {
    const res = await apiClient.post<MonthlyTotalsResponse>('/api/expenses/monthly-totals', months !== undefined ? { months } : {});
    return Array.isArray(res.data) ? res.data : [];
  },

  async getMonthDetail(year, month) {
    const res = await apiClient.post<MonthDetailResponse>('/api/expenses/month', { year, month });
    return Array.isArray(res.data) ? res.data : [];
  },

  async addExpenseOrIncome(data) {
    const res = await apiClient.post('/api/expenses/add', data);
    return res;
  },

  async addExpensesAndIncomesBatch(data) {
    const res = await apiClient.post<ExpenseBatchAddResponse>('/api/expenses/batch-add', data);
    return res.data;
  },

  async deleteExpenseOrIncome(data) {
    const res = await apiClient.post('/api/expenses/delete', data);
    return res;
  },

  async getCustomCategories() {
    const res = await withRetry(() => apiClient.post<CategoriesGetResponse>('/api/categories/get', {}));
    return Array.isArray(res.data) ? res.data : [];
  },

  async addCustomCategory(data) {
    const res = await apiClient.post<UserCategoryDto>('/api/categories/add', data);
    return res.data;
  },

  async renameCustomCategory(data) {
    const res = await apiClient.post<UserCategoryDto>('/api/categories/rename', data);
    return res.data;
  },

  async deleteCustomCategory(data) {
    const res = await apiClient.post('/api/categories/delete', data);
    return res;
  },

  async getExchangeRates() {
    const res = await withRetry(() => apiClient.get<ExchangeRatesResponse>('/api/exchange-rates'));
    return res.data ?? null;
  },
});

export default createFinanceService;
