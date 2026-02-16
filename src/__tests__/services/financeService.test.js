/**
 * Tests for financeService — dependency-injected finance API layer.
 *
 * Validates balance, expense, and income operations are correctly routed
 * through the injected API client.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createFinanceService } from '../../services/financeService';

const createMockClient = () => ({
  post: vi.fn(),
  get: vi.fn(),
});

describe('financeService', () => {
  let mockClient;
  let service;

  beforeEach(() => {
    mockClient = createMockClient();
    service = createFinanceService(mockClient);
  });

  describe('getBalances', () => {
    it('should call /balances/get and return array data', async () => {
      const mockData = [
        { date: '2026-01', balance: { bank: 10000, cash: 500 } },
        { date: '2025-12', balance: { bank: 9500, cash: 450 } },
      ];
      mockClient.post.mockResolvedValue({ data: mockData });

      const result = await service.getBalances();

      expect(mockClient.post).toHaveBeenCalledWith('/balances/get', null);
      expect(result).toEqual(mockData);
    });

    it('should return empty array when data is not an array', async () => {
      mockClient.post.mockResolvedValue({ data: null });
      const result = await service.getBalances();
      expect(result).toEqual([]);
    });

    it('should return empty array when data is an object', async () => {
      mockClient.post.mockResolvedValue({ data: { error: 'not found' } });
      const result = await service.getBalances();
      expect(result).toEqual([]);
    });
  });

  describe('addBalance', () => {
    it('should call /balances/add with balance data and return full response', async () => {
      const balanceData = { date: '2026-02', balance: { bank: 12000 } };
      mockClient.post.mockResolvedValue({ status: 200, data: { success: true } });

      const result = await service.addBalance(balanceData);

      expect(mockClient.post).toHaveBeenCalledWith('/balances/add', balanceData);
      expect(result.status).toBe(200);
    });
  });

  describe('getExpensesAndIncomes', () => {
    it('should call /expenses/get and return array data', async () => {
      const mockData = [
        [{ amount: 100, isExpense: true }],
        [{ amount: 2800, isExpense: false }],
      ];
      mockClient.post.mockResolvedValue({ data: mockData });

      const result = await service.getExpensesAndIncomes();

      expect(mockClient.post).toHaveBeenCalledWith('/expenses/get', null);
      expect(result).toEqual(mockData);
    });

    it('should return empty array when data is not array', async () => {
      mockClient.post.mockResolvedValue({ data: undefined });
      const result = await service.getExpensesAndIncomes();
      expect(result).toEqual([]);
    });
  });

  describe('addExpenseOrIncome', () => {
    it('should call /expenses/add with transaction data and return full response', async () => {
      const txData = { amount: 50, categoryTag: { index: 4 }, isExpense: true };
      mockClient.post.mockResolvedValue({ status: 200, data: { id: 'tx1' } });

      const result = await service.addExpenseOrIncome(txData);

      expect(mockClient.post).toHaveBeenCalledWith('/expenses/add', txData);
      expect(result.status).toBe(200);
    });
  });

  describe('deleteExpenseOrIncome', () => {
    it('should call /expenses/delete with data and return full response', async () => {
      const deleteData = { id: 'tx1' };
      mockClient.post.mockResolvedValue({ status: 200, data: { deleted: true } });

      const result = await service.deleteExpenseOrIncome(deleteData);

      expect(mockClient.post).toHaveBeenCalledWith('/expenses/delete', deleteData);
      expect(result.status).toBe(200);
    });
  });

  describe('DI isolation', () => {
    it('services created with different clients are independent', async () => {
      const client1 = createMockClient();
      const client2 = createMockClient();
      client1.post.mockResolvedValue({ data: [] });
      client2.post.mockResolvedValue({ data: [] });

      const svc1 = createFinanceService(client1);
      createFinanceService(client2);

      await svc1.getBalances();
      expect(client1.post).toHaveBeenCalledTimes(1);
      expect(client2.post).not.toHaveBeenCalled();
    });
  });
});
