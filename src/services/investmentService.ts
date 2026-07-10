/**
 * Investment Service — verified instruments and detailed portfolio holdings.
 *
 * The backend intentionally accepts holdings only when linked to a canonical
 * investment instrument, keeping cross-user analytics comparable and clean.
 *
 * @module services/investmentService
 */
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  InvestmentHoldingDeleteRequest,
  InvestmentHoldingDto,
  InvestmentHoldingHistoryDto,
  InvestmentHoldingHistoryRequest,
  InvestmentHoldingHistoryResponse,
  InvestmentHoldingHistorySaveRequest,
  InvestmentHoldingSaveRequest,
  InvestmentHoldingsGetResponse,
  InvestmentInstrumentSearchRequest,
  InvestmentInstrumentSearchResponse,
} from '../types/api';

export interface InvestmentService {
  searchInstruments(params: InvestmentInstrumentSearchRequest): Promise<InvestmentInstrumentSearchResponse>;
  getHoldings(): Promise<InvestmentHoldingsGetResponse>;
  saveHolding(data: InvestmentHoldingSaveRequest): Promise<InvestmentHoldingDto>;
  deleteHolding(data: InvestmentHoldingDeleteRequest): Promise<AxiosResponse>;
  getHoldingHistory(params?: InvestmentHoldingHistoryRequest): Promise<InvestmentHoldingHistoryResponse>;
  saveHoldingHistory(data: InvestmentHoldingHistorySaveRequest): Promise<InvestmentHoldingHistoryDto>;
}

export const createInvestmentService = (apiClient: AxiosInstance): InvestmentService => ({
  async searchInstruments(params) {
    const res = await apiClient.post<InvestmentInstrumentSearchResponse>('/api/investments/instruments/search', params);
    return Array.isArray(res.data) ? res.data : [];
  },

  async getHoldings() {
    const res = await apiClient.post<InvestmentHoldingsGetResponse>('/api/investments/holdings/get', {});
    return Array.isArray(res.data) ? res.data : [];
  },

  async saveHolding(data) {
    const res = await apiClient.post<InvestmentHoldingDto>('/api/investments/holdings/save', data);
    return res.data;
  },

  async deleteHolding(data) {
    const res = await apiClient.post('/api/investments/holdings/delete', data);
    return res;
  },

  async getHoldingHistory(params = {}) {
    const res = await apiClient.post<InvestmentHoldingHistoryResponse>('/api/investments/holdings/history', params);
    return Array.isArray(res.data) ? res.data : [];
  },

  async saveHoldingHistory(data) {
    const res = await apiClient.post<InvestmentHoldingHistoryDto>('/api/investments/holdings/history/save', data);
    return res.data;
  },
});

export default createInvestmentService;
