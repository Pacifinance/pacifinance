/**
 * Tests for statsService — dependency-injected stats API layer.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStatsService } from '../../services/statsService';

const createMockClient = () => ({
  post: vi.fn(),
});

describe('statsService', () => {
  let mockClient;
  let service;

  beforeEach(() => {
    mockClient = createMockClient();
    service = createStatsService(mockClient);
  });

  describe('getAverages', () => {
    it('should call /stats/averages and extract data', async () => {
      const mockData = {
        all: {
          balances: 50000,
          expenses: 2000,
          incomes: 3000,
          savingsRates: 0.3,
          expensesByCategory: { Food: 500 },
        },
        similar: {
          balances: 45000,
          expenses: 1800,
          incomes: 2800,
          savingsRates: 0.35,
          expensesByCategory: { Food: 480 },
          benchmark: {
            generatedAt: '2026-07-01T00:00:00.000Z',
            populationSize: 120,
            minimumCohortSize: 20,
            cohortSizes: { balances: 24, incomes: 20, expenses: 22, savingsRates: 21 },
            averageSimilarity: { balances: 0.8, incomes: 0.7, expenses: 0.75, savingsRates: 0.72 },
          },
        },
      };
      mockClient.post.mockResolvedValue({ data: mockData });

      const result = await service.getAverages();

      expect(mockClient.post).toHaveBeenCalledWith('/api/stats/averages', {});
      expect(result.all.balances).toBe(50000);
      expect(result.similar.incomes).toBe(2800);
      expect(result.similar.benchmark.cohortSizes.expenses).toBe(22);
    });

    it('should handle legacy "general" field fallback', async () => {
      const mockData = {
        general: {
          balances: 40000,
          expenses: 1500,
          incomes: 2500,
        },
        similar: {},
      };
      mockClient.post.mockResolvedValue({ data: mockData });

      const result = await service.getAverages();

      expect(result.all.balances).toBe(40000);
      expect(result.all.expenses).toBe(1500);
      expect(result.all.incomes).toBe(2500);
    });

    it('should return defaults on API failure', async () => {
      mockClient.post.mockRejectedValue(new Error('API down'));

      const result = await service.getAverages();

      expect(result.all.balances).toBeNull();
      expect(result.all.expenses).toBeNull();
      expect(result.all.incomes).toBeNull();
      expect(result.similar.balances).toBeNull();
    });

    it('should default missing nested properties to null', async () => {
      mockClient.post.mockResolvedValue({
        data: {
          all: { balances: 100 },
          similar: {},
        },
      });

      const result = await service.getAverages();

      expect(result.all.balances).toBe(100);
      expect(result.all.savingsRates).toBeNull();
      expect(result.all.expensesByCategory).toBeNull();
      expect(result.similar.balances).toBeNull();
    });
  });
});
