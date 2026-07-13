/**
 * Tests for rankingService — dependency-injected ranking API layer.
 *
 * Validates that rankings are loaded through the aggregated endpoint and
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
    it('should make one aggregated call and return positions', async () => {
      mockClient.post.mockResolvedValue({ data: {
        balance: 75,
        incomes: 60,
        outflows: 40,
        balanceSimilar: 80,
        incomesSimilar: 55,
        outflowsSimilar: 35,
      } });

      const result = await service.getAllRankings();

      expect(mockClient.post).toHaveBeenCalledTimes(1);
      expect(mockClient.post).toHaveBeenCalledWith('/api/rank/get', {});
      expect(result).toEqual({
        balance: 75,
        incomes: 60,
        outflows: 40,
        balanceSimilar: 80,
        incomesSimilar: 55,
        outflowsSimilar: 35,
      });
    });

    it('should call the aggregated endpoint with an empty body', async () => {
      mockClient.post.mockResolvedValue({ data: { position: 50 } });

      await service.getAllRankings();

      expect(mockClient.post).toHaveBeenCalledWith('/api/rank/get', {});
    });

    it('should default to 0 when values are null', async () => {
      mockClient.post.mockResolvedValue({ data: { balance: null } });

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
      mockClient.post.mockResolvedValue({ data: {
        balance: 90,
        outflows: undefined,
        balanceSimilar: 70,
        outflowsSimilar: 30,
      } });

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

  it('requests a custom benchmark with only the selected factor groups', async () => {
    const benchmark = {
      available: true,
      factors: ['career', 'lifeStage'],
      cohort: { size: 24, populationSize: 140, minimumSize: 20, averageSimilarity: 0.72 },
      averages: { balances: 1500, incomes: 2200, expenses: 1300 },
      rankings: { balance: 42, incomes: 55, outflows: 31 },
    };
    mockClient.post.mockResolvedValue({ data: benchmark });

    await expect(service.getCustomBenchmark(['career', 'lifeStage'])).resolves.toEqual(benchmark);
    expect(mockClient.post).toHaveBeenCalledWith('/api/rank/custom', {
      factors: ['career', 'lifeStage'],
    });
  });
});
