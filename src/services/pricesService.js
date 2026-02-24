/**
 * Prices Service — encapsulates market data API calls.
 *
 * Currently supports crypto prices from the cache.
 * Designed to expand to ETFs, stocks, gold, silver, bonds, etc.
 *
 * @module services/pricesService
 */

/**
 * Creates a prices-service bound to the given HTTP client.
 *
 * @param {import('axios').AxiosInstance} apiClient
 * @returns {Object} The prices service methods
 */
export const createPricesService = (apiClient) => ({
  /**
   * Fetch cached crypto prices from the server.
   * Response format: { [coinId]: { name, image, current, sparkline: number[] } }
   */
  getCryptoPrices:    () => apiClient.get('/api/prices/crypto').then(r => r.data),

  // Future endpoints (enable when server-side routes are ready):
  getEtfPrices:        () => apiClient.get('/api/prices/etf').then(r => r.data),
  getStockPrices:      () => apiClient.get('/api/prices/stocks').then(r => r.data),
  getCommodityPrices:  () => apiClient.get('/api/prices/commodities').then(r => r.data),
  getBondPrices:       () => apiClient.get('/api/prices/bonds').then(r => r.data),
});

export default createPricesService;
