
import axios from 'axios';

class MarketDataService {
  constructor() {
    this.baseURL = process.env.REACT_APP_MARKET_API_URL || 'https://api.placeholder.com';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Get cached data if available and not expired
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  // Set cache data
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Get exchange rates (EUR/USD, etc.)
  async getExchangeRates() {
    const cacheKey = 'exchange_rates';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Placeholder data - replace with real API call
      const mockData = {
        EUR: { USD: 1.08, GBP: 0.86 },
        USD: { EUR: 0.93, GBP: 0.80 },
        GBP: { EUR: 1.16, USD: 1.25 }
      };

      this.setCachedData(cacheKey, mockData);
      return mockData;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      return null;
    }
  }

  // Get stock data
  async getStockData(symbols = []) {
    const cacheKey = `stocks_${symbols.join(',')}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Placeholder data - replace with real API call
      const mockStocks = [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 175.23, change: 2.45, changePercent: 1.42, volume: 45678900 },
        { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, change: -1.23, changePercent: -0.32, volume: 23456789 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 138.45, change: 3.67, changePercent: 2.72, volume: 34567890 },
        { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.56, change: -5.23, changePercent: -2.06, volume: 56789012 },
        { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 485.67, change: 8.91, changePercent: 1.87, volume: 45678901 }
      ];

      this.setCachedData(cacheKey, mockStocks);
      return mockStocks;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      return [];
    }
  }

  // Get ETF data
  async getETFData(symbols = []) {
    const cacheKey = `etfs_${symbols.join(',')}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Placeholder data - replace with real API call
      const mockETFs = [
        { symbol: 'SPY', name: 'SPDR S&P 500 ETF', price: 445.67, change: 2.34, changePercent: 0.53, volume: 78901234 },
        { symbol: 'QQQ', name: 'Invesco QQQ Trust', price: 378.23, change: -1.45, changePercent: -0.38, volume: 56789012 },
        { symbol: 'VTI', name: 'Vanguard Total Stock Market', price: 234.56, change: 1.78, changePercent: 0.76, volume: 34567890 },
        { symbol: 'IWM', name: 'iShares Russell 2000', price: 198.34, change: -2.12, changePercent: -1.06, volume: 23456789 }
      ];

      this.setCachedData(cacheKey, mockETFs);
      return mockETFs;
    } catch (error) {
      console.error('Error fetching ETF data:', error);
      return [];
    }
  }

  // Get cryptocurrency data
  async getCryptoData(symbols = []) {
    const cacheKey = `crypto_${symbols.join(',')}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Placeholder data - replace with real API call
      const mockCrypto = [
        { symbol: 'BTC', name: 'Bitcoin', price: 43567.89, change: 1234.56, changePercent: 2.91, volume: 23456789000 },
        { symbol: 'ETH', name: 'Ethereum', price: 2678.45, change: -45.67, changePercent: -1.68, volume: 12345678000 },
        { symbol: 'ADA', name: 'Cardano', price: 0.456, change: 0.023, changePercent: 5.31, volume: 987654321000 },
        { symbol: 'SOL', name: 'Solana', price: 98.76, change: 3.45, changePercent: 3.62, volume: 456789012000 },
        { symbol: 'DOT', name: 'Polkadot', price: 7.89, change: -0.23, changePercent: -2.83, volume: 234567890000 }
      ];

      this.setCachedData(cacheKey, mockCrypto);
      return mockCrypto;
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      return [];
    }
  }

  // Get market indices
  async getMarketIndices() {
    const cacheKey = 'market_indices';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Placeholder data - replace with real API call
      const mockIndices = [
        { symbol: 'SPX', name: 'S&P 500', price: 4567.89, change: 23.45, changePercent: 0.52 },
        { symbol: 'DJI', name: 'Dow Jones', price: 35678.90, change: -123.45, changePercent: -0.34 },
        { symbol: 'IXIC', name: 'NASDAQ', price: 14567.89, change: 67.89, changePercent: 0.47 },
        { symbol: 'FTSE', name: 'FTSE 100', price: 7456.78, change: 12.34, changePercent: 0.17 }
      ];

      this.setCachedData(cacheKey, mockIndices);
      return mockIndices;
    } catch (error) {
      console.error('Error fetching market indices:', error);
      return [];
    }
  }

  // Get historical data for charts
  async getHistoricalData(symbol, period = '1M') {
    const cacheKey = `historical_${symbol}_${period}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Placeholder data - replace with real API call
      const mockHistorical = this.generateMockHistoricalData(symbol, period);
      this.setCachedData(cacheKey, mockHistorical);
      return mockHistorical;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return [];
    }
  }

  // Generate mock historical data
  generateMockHistoricalData(symbol, period) {
    const data = [];
    const days = period === '1D' ? 1 : period === '1W' ? 7 : period === '1M' ? 30 : 365;
    const basePrice = Math.random() * 1000 + 100;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const price = basePrice + (Math.random() - 0.5) * basePrice * 0.1;
      data.push({
        date: date.toISOString().split('T')[0],
        price: parseFloat(price.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000)
      });
    }
    
    return data;
  }
}

export default new MarketDataService();
