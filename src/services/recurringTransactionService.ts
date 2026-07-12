/**
 * Recurring Transaction Service — subscription/rent/salary templates that a
 * daily server cron turns into real outflow/income entries when due.
 *
 * @module services/recurringTransactionService
 */
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  RecurringTransactionDeleteRequest,
  RecurringTransactionDto,
  RecurringTransactionSaveRequest,
  RecurringTransactionSetActiveRequest,
  RecurringTransactionsGetResponse,
} from '../types/api';

export interface RecurringTransactionService {
  getRecurring(): Promise<RecurringTransactionsGetResponse>;
  saveRecurring(data: RecurringTransactionSaveRequest): Promise<RecurringTransactionDto>;
  setRecurringActive(data: RecurringTransactionSetActiveRequest): Promise<RecurringTransactionDto>;
  deleteRecurring(data: RecurringTransactionDeleteRequest): Promise<AxiosResponse>;
}

export const createRecurringTransactionService = (apiClient: AxiosInstance): RecurringTransactionService => ({
  async getRecurring() {
    const res = await apiClient.post<RecurringTransactionsGetResponse>('/api/recurring-transactions/get', {});
    return Array.isArray(res.data) ? res.data : [];
  },

  async saveRecurring(data) {
    const res = await apiClient.post<RecurringTransactionDto>('/api/recurring-transactions/save', data);
    return res.data;
  },

  async setRecurringActive(data) {
    const res = await apiClient.post<RecurringTransactionDto>('/api/recurring-transactions/set-active', data);
    return res.data;
  },

  async deleteRecurring(data) {
    const res = await apiClient.post('/api/recurring-transactions/delete', data);
    return res;
  },
});

export default createRecurringTransactionService;
