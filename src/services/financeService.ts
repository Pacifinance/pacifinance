/**
 * Finance Service — encapsulates balance and transaction API calls.
 *
 * Injected with an API client for testability (Dependency Injection pattern).
 *
 * @module services/financeService
 */
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  BalanceAddRequest,
  BalancesGetResponse,
  TransactionAddRequest,
  TransactionUpdateRequest,
  TransactionBatchAddRequest,
  TransactionBatchAddResponse,
  TransactionDeleteRequest,
  TransactionsGetResponse,
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
  /** GET-style POST to /transactions/get. */
  getTransactions(): Promise<TransactionsGetResponse>;
  /** GET-style POST to /transactions/monthly-totals — aggregated sums only, for multi-year charts. */
  getMonthlyTotals(months?: number | 'all'): Promise<MonthlyTotalsResponse>;
  /** POST /transactions/month — one arbitrary month's tagged transactions, on demand. */
  getMonthDetail(year: number, month: number): Promise<MonthDetailResponse>;
  /** POST /transactions/add. */
  addTransaction(data: TransactionAddRequest): Promise<AxiosResponse>;
  /** POST /transactions/update — preserves the transaction id and updates an optional shared split atomically. */
  updateTransaction(data: TransactionUpdateRequest): Promise<AxiosResponse>;
  /** POST /transactions/batch-add — one HTTP request and one database insert for CSV imports. */
  addTransactionsBatch(data: TransactionBatchAddRequest): Promise<TransactionBatchAddResponse>;
  /** POST /transactions/delete. */
  deleteTransaction(data: TransactionDeleteRequest): Promise<AxiosResponse>;
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

  async getTransactions() {
    const res = await withRetry(() => apiClient.post<TransactionsGetResponse>('/api/transactions/get', {}));
    return Array.isArray(res.data) ? res.data : [];
  },

  async getMonthlyTotals(months) {
    const res = await apiClient.post<MonthlyTotalsResponse>('/api/transactions/monthly-totals', months !== undefined ? { months } : {});
    return Array.isArray(res.data) ? res.data : [];
  },

  async getMonthDetail(year, month) {
    const res = await apiClient.post<MonthDetailResponse>('/api/transactions/month', { year, month });
    return Array.isArray(res.data) ? res.data : [];
  },

  async addTransaction(data) {
    const res = await apiClient.post('/api/transactions/add', data);
    return res;
  },

  async updateTransaction(data) {
    return apiClient.post('/api/transactions/update', data);
  },

  async addTransactionsBatch(data) {
    const res = await apiClient.post<TransactionBatchAddResponse>('/api/transactions/batch-add', data);
    return res.data;
  },

  async deleteTransaction(data) {
    const res = await apiClient.post('/api/transactions/delete', data);
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
