/**
 * Shared Expense Service — receivables for money fronted for a group (e.g.
 * paying an Uber/dinner for everyone) that's owed back. The outflow itself is
 * added normally through financeService with amount = the user's own share
 * only; this service only manages the "credito verso terzi" side.
 *
 * @module services/sharedExpenseService
 */
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  SharedExpenseReceivableAddRequest,
  SharedExpenseReceivableDeleteRequest,
  SharedExpenseReceivableDto,
  SharedExpenseReceivableSettleRequest,
  SharedExpenseReceivablesGetResponse,
} from '../types/api';

export interface SharedExpenseService {
  getReceivables(): Promise<SharedExpenseReceivablesGetResponse>;
  addReceivable(data: SharedExpenseReceivableAddRequest): Promise<SharedExpenseReceivableDto>;
  settleReceivable(data: SharedExpenseReceivableSettleRequest): Promise<SharedExpenseReceivableDto>;
  deleteReceivable(data: SharedExpenseReceivableDeleteRequest): Promise<AxiosResponse>;
}

export const createSharedExpenseService = (apiClient: AxiosInstance): SharedExpenseService => ({
  async getReceivables() {
    const res = await apiClient.post<SharedExpenseReceivablesGetResponse>('/api/shared-expenses/get', {});
    return Array.isArray(res.data) ? res.data : [];
  },

  async addReceivable(data) {
    const res = await apiClient.post<SharedExpenseReceivableDto>('/api/shared-expenses/add', data);
    return res.data;
  },

  async settleReceivable(data) {
    const res = await apiClient.post<SharedExpenseReceivableDto>('/api/shared-expenses/settle', data);
    return res.data;
  },

  async deleteReceivable(data) {
    const res = await apiClient.post('/api/shared-expenses/delete', data);
    return res;
  },
});

export default createSharedExpenseService;
