/**
 * Shared Expense Service — receivables for money fronted for a group (e.g.
 * paying an Uber/dinner for everyone) that's owed back. Imported movements can
 * persistently link their real cash amount, personal share and reimbursements;
 * this service also supports the manual receivable workflow.
 *
 * @module services/sharedExpenseService
 */
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  SharedExpenseReceivableAddRequest,
  SharedExpenseReceivableDeleteRequest,
  SharedExpenseReceivableDto,
  SharedExpenseReceivableSettleRequest,
  SharedExpenseLinkExistingRequest,
  SharedExpenseLinkReimbursementRequest,
  SharedExpenseReceivablesGetResponse,
} from '../types/api';

export interface SharedExpenseService {
  getReceivables(): Promise<SharedExpenseReceivablesGetResponse>;
  addReceivable(data: SharedExpenseReceivableAddRequest): Promise<SharedExpenseReceivableDto>;
  settleReceivable(data: SharedExpenseReceivableSettleRequest): Promise<SharedExpenseReceivableDto>;
  deleteReceivable(data: SharedExpenseReceivableDeleteRequest): Promise<AxiosResponse>;
  linkExistingExpense(data: SharedExpenseLinkExistingRequest): Promise<SharedExpenseReceivableDto>;
  linkExistingReimbursement(data: SharedExpenseLinkReimbursementRequest): Promise<SharedExpenseReceivablesGetResponse>;
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
  async linkExistingExpense(data) {
    const res = await apiClient.post<SharedExpenseReceivableDto>('/api/shared-expenses/link-expense', data);
    return res.data;
  },
  async linkExistingReimbursement(data) {
    const res = await apiClient.post<SharedExpenseReceivablesGetResponse>('/api/shared-expenses/link-reimbursement', data);
    return Array.isArray(res.data) ? res.data : [];
  },
});

export default createSharedExpenseService;
