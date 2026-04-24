/**
 * Prices Service — encapsulates market data API calls.
 *
 * Currently supports crypto prices from the cache.
 * Designed to expand to ETFs, stocks, gold, silver, bonds, etc.
 *
 * @module services/pricesService
 */
import type { AxiosInstance } from 'axios';
import type { PricesResponse } from '../types/api';

export interface PricesService {
  getCryptoPrices(): Promise<PricesResponse>;
  getEtfPrices(): Promise<PricesResponse>;
  getStockPrices(): Promise<PricesResponse>;
  getCommodityPrices(): Promise<PricesResponse>;
  getBondPrices(): Promise<PricesResponse>;
}

/** Creates a prices-service bound to the given HTTP client. */
export const createPricesService = (apiClient: AxiosInstance): PricesService => ({
  getCryptoPrices:    () => apiClient.get<PricesResponse>('/api/prices/crypto').then(r => r.data),
  // Future endpoints (enable when server-side routes are ready):
  getEtfPrices:       () => apiClient.get<PricesResponse>('/api/prices/etf').then(r => r.data),
  getStockPrices:     () => apiClient.get<PricesResponse>('/api/prices/stocks').then(r => r.data),
  getCommodityPrices: () => apiClient.get<PricesResponse>('/api/prices/commodities').then(r => r.data),
  getBondPrices:      () => apiClient.get<PricesResponse>('/api/prices/bonds').then(r => r.data),
});

export default createPricesService;
