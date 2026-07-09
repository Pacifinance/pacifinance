import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLiquidityAccountService } from '../../services/liquidityAccountService';

const createMockClient = () => ({
  post: vi.fn(),
});

describe('liquidityAccountService', () => {
  let mockClient;
  let service;

  beforeEach(() => {
    mockClient = createMockClient();
    service = createLiquidityAccountService(mockClient);
  });

  it('loads detailed liquidity accounts', async () => {
    const accounts = [{ id: 1, assetKey: 'bank', label: 'Intesa', currentValue: 1000 }];
    mockClient.post.mockResolvedValue({ data: accounts });

    const result = await service.getAccounts();

    expect(mockClient.post).toHaveBeenCalledWith('/api/liquidity-accounts/get', {});
    expect(result).toEqual(accounts);
  });

  it('returns an empty array when accounts response is malformed', async () => {
    mockClient.post.mockResolvedValue({ data: null });

    const result = await service.getAccounts();

    expect(result).toEqual([]);
  });

  it('saves a liquidity account', async () => {
    const account = { id: 2, assetKey: 'digitalServices', label: 'Satispay', currentValue: 50 };
    const payload = { asset_key: 'digitalServices', label: 'Satispay', current_value: 50 };
    mockClient.post.mockResolvedValue({ data: account });

    const result = await service.saveAccount(payload);

    expect(mockClient.post).toHaveBeenCalledWith('/api/liquidity-accounts/save', payload);
    expect(result).toEqual(account);
  });

  it('deletes a liquidity account', async () => {
    mockClient.post.mockResolvedValue({ status: 200 });

    const result = await service.deleteAccount({ id: 4 });

    expect(mockClient.post).toHaveBeenCalledWith('/api/liquidity-accounts/delete', { id: 4 });
    expect(result.status).toBe(200);
  });
});
