/**
 * Investment Service — verified instruments and detailed portfolio holdings.
 *
 * Holdings always link to an instrument, but that instrument doesn't have to
 * be a verified catalog match: createManualInstrument lets a user register a
 * private, unverified one when search finds nothing (see
 * server/src/db/models/investments.ts). Unverified instruments never join the
 * shared catalog and must never feed cross-user comparisons/analytics —
 * anything comparison-related must filter on `verified: true`.
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
  InvestmentInstrumentDto,
  InvestmentInstrumentManualCreateRequest,
  InvestmentInstrumentSearchByIsinsResponse,
  InvestmentInstrumentSearchRequest,
  InvestmentInstrumentSearchResponse,
} from '../types/api';

export interface InvestmentService {
  searchInstruments(params: InvestmentInstrumentSearchRequest): Promise<InvestmentInstrumentSearchResponse>;
  searchInstrumentsByIsins(isins: string[]): Promise<InvestmentInstrumentSearchByIsinsResponse>;
  createManualInstrument(data: InvestmentInstrumentManualCreateRequest): Promise<InvestmentInstrumentDto>;
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

  async searchInstrumentsByIsins(isins) {
    const res = await apiClient.post<InvestmentInstrumentSearchByIsinsResponse>('/api/investments/instruments/search-by-isins', { isins });
    return res.data && typeof res.data === 'object' ? res.data : {};
  },

  async createManualInstrument(data) {
    const res = await apiClient.post<InvestmentInstrumentDto>('/api/investments/instruments/manual', data);
    return res.data;
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
