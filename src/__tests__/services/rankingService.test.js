/**
 * Tests for rankingService — dependency-injected ranking API layer.
 *
 * Validates that all 6 ranking calls are made in parallel and results
 * are properly extracted and defaulted on failure.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRankingService } from '../../services/rankingService';

const createMockClient = () => ({
  post: vi.fn(),
});

describe('rankingService', () => {
  let mockClient;
  let service;

  beforeEach(() => {
    mockClient = createMockClient();
    service = createRankingService(mockClient);
  });

  describe('getAllRankings', () => {
    it('should make 6 parallel calls and return positions', async () => {
      mockClient.post
        .mockResolvedValueOnce({ data: { position: 75 } })   // balance
        .mockResolvedValueOnce({ data: { position: 60 } })   // incomes
        .mockResolvedValueOnce({ data: { position: 40 } })   // outflows
        .mockResolvedValueOnce({ data: { position: 80 } })   // balanceSimilar
        .mockResolvedValueOnce({ data: { position: 55 } })   // incomesSimilar
        .mockResolvedValueOnce({ data: { position: 35 } });  // outflowsSimilar

      const result = await service.getAllRankings();

      expect(mockClient.post).toHaveBeenCalledTimes(6);
      expect(result).toEqual({
        balance: 75,
        incomes: 60,
        outflows: 40,
        balanceSimilar: 80,
        incomesSimilar: 55,
        outflowsSimilar: 35,
      });
    });

    it('should call correct endpoints with correct params', async () => {
      mockClient.post.mockResolvedValue({ data: { position: 50 } });

      await service.getAllRankings();

      expect(mockClient.post).toHaveBeenCalledWith('/rank/balances', null);
      expect(mockClient.post).toHaveBeenCalledWith('/rank/expenses', { expenses: false });
      expect(mockClient.post).toHaveBeenCalledWith('/rank/expenses', { expenses: true });
      expect(mockClient.post).toHaveBeenCalledWith('/rank/balances', { similar: true });
      expect(mockClient.post).toHaveBeenCalledWith('/rank/expenses', { expenses: false, similar: true });
      expect(mockClient.post).toHaveBeenCalledWith('/rank/expenses', { expenses: true, similar: true });
    });

    it('should default to 0 when position is null', async () => {
      mockClient.post.mockResolvedValue({ data: { position: null } });

      const result = await service.getAllRankings();

      expect(result).toEqual({
        balance: 0,
        incomes: 0,
        outflows: 0,
        balanceSimilar: 0,
        incomesSimilar: 0,
        outflowsSimilar: 0,
      });
    });

    it('should return all zeros on API failure', async () => {
      mockClient.post.mockRejectedValue(new Error('Network error'));

      const result = await service.getAllRankings();

      expect(result).toEqual({
        balance: 0,
        incomes: 0,
        outflows: 0,
        balanceSimilar: 0,
        incomesSimilar: 0,
        outflowsSimilar: 0,
      });
    });

    it('should default partial failures to 0', async () => {
      mockClient.post
        .mockResolvedValueOnce({ data: { position: 90 } })
        .mockResolvedValueOnce({ data: {} })                  // no position key
        .mockResolvedValueOnce({ data: { position: undefined } })
        .mockResolvedValueOnce({ data: { position: 70 } })
        .mockResolvedValueOnce({ data: null })
        .mockResolvedValueOnce({ data: { position: 30 } });

      const result = await service.getAllRankings();

      expect(result.balance).toBe(90);
      expect(result.incomes).toBe(0);
      expect(result.outflows).toBe(0);
      expect(result.balanceSimilar).toBe(70);
      // data null causes ?.position to be undefined, falls back to 0
      expect(result.incomesSimilar).toBe(0);
      expect(result.outflowsSimilar).toBe(30);
    });
  });
});
