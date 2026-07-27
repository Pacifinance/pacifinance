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
});
