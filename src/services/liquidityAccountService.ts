/**
 * Liquidity Account Service — detailed sub-accounts for bank/cash/digitalServices/emergencyFund.
 *
 * @module services/liquidityAccountService
 */
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  LiquidityAccountDeleteRequest,
  LiquidityAccountDto,
  LiquidityAccountSaveRequest,
  LiquidityAccountsGetResponse,
} from '../types/api';

export interface LiquidityAccountService {
  getAccounts(): Promise<LiquidityAccountsGetResponse>;
  saveAccount(data: LiquidityAccountSaveRequest): Promise<LiquidityAccountDto>;
  deleteAccount(data: LiquidityAccountDeleteRequest): Promise<AxiosResponse>;
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
});

export default createLiquidityAccountService;
