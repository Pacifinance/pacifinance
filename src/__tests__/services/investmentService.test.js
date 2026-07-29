import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createInvestmentService } from '../../services/investmentService';

const createMockClient = () => ({
  post: vi.fn(),
});

describe('investmentService', () => {
  let mockClient;
  let service;

  beforeEach(() => {
    mockClient = createMockClient();
    service = createInvestmentService(mockClient);
  });

  it('searches verified instruments and returns array data', async () => {
    const instruments = [{ id: 1, kind: 'stock', symbol: 'AAPL', name: 'Apple Inc.' }];
    mockClient.post.mockResolvedValue({ data: instruments });

    const result = await service.searchInstruments({ query: 'apple', kind: 'stock' });

    expect(mockClient.post).toHaveBeenCalledWith('/api/investments/instruments/search', {
      query: 'apple',
      kind: 'stock',
    });
    expect(result).toEqual(instruments);
  });

  it('returns an empty array when search response is malformed', async () => {
    mockClient.post.mockResolvedValue({ data: null });

    const result = await service.searchInstruments({ query: 'apple' });

    expect(result).toEqual([]);
  });

  it('batch-resolves multiple ISINs in one call', async () => {
    const matches = { US0378331005: { id: 1, kind: 'stock', symbol: 'AAPL' }, US5949181045: null };
    mockClient.post.mockResolvedValue({ data: matches });

    const result = await service.searchInstrumentsByIsins(['US0378331005', 'US5949181045']);

    expect(mockClient.post).toHaveBeenCalledWith('/api/investments/instruments/search-by-isins', {
      isins: ['US0378331005', 'US5949181045'],
    });
    expect(result).toEqual(matches);
  });

  it('returns an empty object when the batch ISIN response is malformed', async () => {
    mockClient.post.mockResolvedValue({ data: null });

    const result = await service.searchInstrumentsByIsins(['US0378331005']);

    expect(result).toEqual({});
  });

  it('creates a private, unverified instrument when search finds no match', async () => {
    const created = { id: -1, kind: 'stock', symbol: 'MYSTOCK', name: 'My Stock', provider: 'manual', verified: false };
    mockClient.post.mockResolvedValue({ data: created });

    const result = await service.createManualInstrument({ kind: 'stock', symbol: 'MYSTOCK', name: 'My Stock', currency: null });

    expect(mockClient.post).toHaveBeenCalledWith('/api/investments/instruments/manual', {
      kind: 'stock', symbol: 'MYSTOCK', name: 'My Stock', currency: null,
    });
    expect(result).toEqual(created);
  });

  it('loads detailed holdings', async () => {
    const holdings = [{ id: 7, assetKey: 'etf', instrument: { symbol: 'VWCE' } }];
    mockClient.post.mockResolvedValue({ data: holdings });

    const result = await service.getHoldings();

    expect(mockClient.post).toHaveBeenCalledWith('/api/investments/holdings/get', {});
    expect(result).toEqual(holdings);
  });

  it('refreshes holding prices', async () => {
    const holdings = [{ id: 16, currentValue: 1739.13 }];
    mockClient.post.mockResolvedValue({ data: holdings });

    const result = await service.refreshPrices();

    expect(mockClient.post).toHaveBeenCalledWith('/api/investments/holdings/refresh-prices', {});
    expect(result).toEqual(holdings);
  });

  it('backfills historical prices', async () => {
    const results = [{ holdingId: 16, monthsFilled: 12 }];
    mockClient.post.mockResolvedValue({ data: results });

    const result = await service.backfillHistoricalPrices();

    expect(mockClient.post).toHaveBeenCalledWith('/api/investments/holdings/backfill-historical-prices', {});
    expect(result).toEqual(results);
  });

  it('returns an empty array when the historical backfill response is malformed', async () => {
    mockClient.post.mockResolvedValue({ data: null });

    const result = await service.backfillHistoricalPrices();

    expect(result).toEqual([]);
  });

  it('saves a holding linked to a canonical instrument', async () => {
    const holding = { id: 9, assetKey: 'stocks', instrument: { id: 1, symbol: 'AAPL' } };
    const payload = { instrument_id: 1, asset_key: 'stocks', current_value: 420 };
    mockClient.post.mockResolvedValue({ data: holding });

    const result = await service.saveHolding(payload);

    expect(mockClient.post).toHaveBeenCalledWith('/api/investments/holdings/save', payload);
    expect(result).toEqual(holding);
  });

  it('deletes a holding', async () => {
    mockClient.post.mockResolvedValue({ status: 200 });

    const result = await service.deleteHolding({ id: 3 });

    expect(mockClient.post).toHaveBeenCalledWith('/api/investments/holdings/delete', { id: 3 });
    expect(result.status).toBe(200);
  });

  it('reads the monthly investment target setting', async () => {
    mockClient.post.mockResolvedValue({ data: { monthlyTarget: 300 } });

    const result = await service.getSettings();

    expect(mockClient.post).toHaveBeenCalledWith('/api/investments/settings/get', {});
    expect(result).toEqual({ monthlyTarget: 300 });
  });

  it('saves the monthly investment target setting', async () => {
    mockClient.post.mockResolvedValue({ data: { monthlyTarget: 250 } });

    const result = await service.saveSettings({ monthly_target: 250 });

    expect(mockClient.post).toHaveBeenCalledWith('/api/investments/settings/save', { monthly_target: 250 });
    expect(result).toEqual({ monthlyTarget: 250 });
  });

  it('saves a dividend payment', async () => {
    const dividend = { id: 5, instrumentId: 1, holdingId: 16, amount: 0.29, source: 'trading212' };
    const payload = { instrument_id: 1, holding_id: 16, amount: 0.29, paid_date: '2026-06-01', source: 'trading212' };
    mockClient.post.mockResolvedValue({ data: dividend });

    const result = await service.saveDividend(payload);

    expect(mockClient.post).toHaveBeenCalledWith('/api/investments/dividends/save', payload);
    expect(result).toEqual(dividend);
  });

  it('reads the per-instrument dividends summary', async () => {
    const summary = [{ instrumentId: 1, symbol: 'V', name: 'Visa', totalAmount: 0.6, paymentCount: 2, lastPaidDate: '2026-06-01' }];
    mockClient.post.mockResolvedValue({ data: summary });

    const result = await service.getDividendsSummary();

    expect(mockClient.post).toHaveBeenCalledWith('/api/investments/dividends/summary', {});
    expect(result).toEqual(summary);
  });

  it('returns an empty array when the dividends summary response is malformed', async () => {
    mockClient.post.mockResolvedValue({ data: null });

    const result = await service.getDividendsSummary();

    expect(result).toEqual([]);
  });
});
