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
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type {
  InvestmentDividendDto,
  InvestmentDividendSaveRequest,
  InvestmentDividendSummaryResponse,
  InvestmentHoldingConflict,
  InvestmentHoldingDeleteRequest,
  InvestmentHoldingDto,
  InvestmentHoldingHistoryDto,
  InvestmentHoldingHistoryRequest,
  InvestmentHoldingHistoryResponse,
  InvestmentHoldingHistorySaveRequest,
  InvestmentHoldingSaveRequest,
  InvestmentHoldingsGetResponse,
  InvestmentHistoricalPriceBackfillResponse,
  InvestmentInstrumentDto,
  InvestmentInstrumentManualCreateRequest,
  InvestmentInstrumentSearchByIsinsResponse,
  InvestmentInstrumentSearchRequest,
  InvestmentInstrumentSearchResponse,
  InvestmentSettingsDto,
  InvestmentSettingsSaveRequest,
  InvestmentTransactionDto,
  InvestmentTransactionSaveRequest,
  InvestmentTransactionsGetResponse,
} from '../types/api';

/**
 * Thrown by saveHolding when the server responds 409 — a holding for this
 * instrument already exists from a different/unknown import source (see
 * server/src/db/models/investments.ts insertHolding). Callers catch this
 * specifically to ask the user whether to merge or replace, instead of
 * treating it like any other failed save.
 */
export class HoldingConflictError extends Error {
  existing: InvestmentHoldingDto;

  constructor(existing: InvestmentHoldingDto) {
    super('A holding for this instrument already exists from a different import source');
    this.name = 'HoldingConflictError';
    this.existing = existing;
  }
}

export interface InvestmentService {
  searchInstruments(params: InvestmentInstrumentSearchRequest): Promise<InvestmentInstrumentSearchResponse>;
  searchInstrumentsByIsins(isins: string[]): Promise<InvestmentInstrumentSearchByIsinsResponse>;
  createManualInstrument(data: InvestmentInstrumentManualCreateRequest): Promise<InvestmentInstrumentDto>;
  getHoldings(): Promise<InvestmentHoldingsGetResponse>;
  refreshPrices(): Promise<InvestmentHoldingsGetResponse>;
  backfillHistoricalPrices(): Promise<InvestmentHistoricalPriceBackfillResponse>;
  saveHolding(data: InvestmentHoldingSaveRequest): Promise<InvestmentHoldingDto>;
  deleteHolding(data: InvestmentHoldingDeleteRequest): Promise<AxiosResponse>;
  getHoldingHistory(params?: InvestmentHoldingHistoryRequest): Promise<InvestmentHoldingHistoryResponse>;
  saveHoldingHistory(data: InvestmentHoldingHistorySaveRequest): Promise<InvestmentHoldingHistoryDto>;
  getSettings(): Promise<InvestmentSettingsDto>;
  saveSettings(data: InvestmentSettingsSaveRequest): Promise<InvestmentSettingsDto>;
  saveDividend(data: InvestmentDividendSaveRequest): Promise<InvestmentDividendDto>;
  getDividendsSummary(): Promise<InvestmentDividendSummaryResponse>;
  saveTransaction(data: InvestmentTransactionSaveRequest): Promise<InvestmentTransactionDto>;
  getTransactions(): Promise<InvestmentTransactionsGetResponse>;
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

  async refreshPrices() {
    const res = await apiClient.post<InvestmentHoldingsGetResponse>('/api/investments/holdings/refresh-prices', {});
    return Array.isArray(res.data) ? res.data : [];
  },

  async backfillHistoricalPrices() {
    const res = await apiClient.post<InvestmentHistoricalPriceBackfillResponse>('/api/investments/holdings/backfill-historical-prices', {});
    return Array.isArray(res.data) ? res.data : [];
  },

  async saveHolding(data) {
    try {
      const res = await apiClient.post<InvestmentHoldingDto>('/api/investments/holdings/save', data);
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        throw new HoldingConflictError((error.response.data as InvestmentHoldingConflict).existing);
      }
      throw error;
    }
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

  async getSettings() {
    const res = await apiClient.post<InvestmentSettingsDto>('/api/investments/settings/get', {});
    return res.data;
  },

  async saveSettings(data) {
    const res = await apiClient.post<InvestmentSettingsDto>('/api/investments/settings/save', data);
    return res.data;
  },

  async saveDividend(data) {
    const res = await apiClient.post<InvestmentDividendDto>('/api/investments/dividends/save', data);
    return res.data;
  },

  async getDividendsSummary() {
    const res = await apiClient.post<InvestmentDividendSummaryResponse>('/api/investments/dividends/summary', {});
    return Array.isArray(res.data) ? res.data : [];
  },

  async saveTransaction(data) {
    const res = await apiClient.post<InvestmentTransactionDto>('/api/investments/transactions/save', data);
    return res.data;
  },

  async getTransactions() {
    const res = await apiClient.post<InvestmentTransactionsGetResponse>('/api/investments/transactions/get', {});
    return Array.isArray(res.data) ? res.data : [];
  },
});

export default createInvestmentService;
