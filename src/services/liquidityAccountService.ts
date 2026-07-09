/**
 * Liquidity Account Service — detailed sub-accounts for bank/cash/digitalServices/emergencyFund.
 *
 * @module services/liquidityAccountService
 */
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  LiquidityAccountDeleteRequest,
  LiquidityAccountDto,
  LiquidityAccountHistoryRequest,
  LiquidityAccountHistoryResponse,
  LiquidityAccountSaveRequest,
  LiquidityAccountsGetResponse,
} from '../types/api';

export interface LiquidityAccountService {
  getAccounts(): Promise<LiquidityAccountsGetResponse>;
  saveAccount(data: LiquidityAccountSaveRequest): Promise<LiquidityAccountDto>;
  deleteAccount(data: LiquidityAccountDeleteRequest): Promise<AxiosResponse>;
  getAccountHistory(params?: LiquidityAccountHistoryRequest): Promise<LiquidityAccountHistoryResponse>;
}

export const createLiquidityAccountService = (apiClient: AxiosInstance): LiquidityAccountService => ({
  async getAccounts() {
    const res = await apiClient.post<LiquidityAccountsGetResponse>('/api/liquidity-accounts/get', {});
    return Array.isArray(res.data) ? res.data : [];
  },

  async saveAccount(data) {
    const res = await apiClient.post<LiquidityAccountDto>('/api/liquidity-accounts/save', data);
    return res.data;
  },

  async deleteAccount(data) {
    const res = await apiClient.post('/api/liquidity-accounts/delete', data);
    return res;
  },

  async getAccountHistory(params = {}) {
    const res = await apiClient.post<LiquidityAccountHistoryResponse>('/api/liquidity-accounts/history', params);
    return Array.isArray(res.data) ? res.data : [];
  },
});

export default createLiquidityAccountService;
