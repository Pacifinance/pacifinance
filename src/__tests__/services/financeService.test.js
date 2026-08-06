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

      expect(mockClient.post).toHaveBeenCalledWith('/api/balances/get', {});
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

      expect(mockClient.post).toHaveBeenCalledWith('/api/balances/add', balanceData);
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

      expect(mockClient.post).toHaveBeenCalledWith('/api/expenses/get', {});
      expect(result).toEqual(mockData);
    });

    it('should return empty array when data is not array', async () => {
      mockClient.post.mockResolvedValue({ data: undefined });
      const result = await service.getExpensesAndIncomes();
      expect(result).toEqual([]);
    });

    it('retries once on a transient 500 (e.g. a serverless cold start) and returns the data', async () => {
      const mockData = [[{ amount: 100, isExpense: true }]];
      mockClient.post
        .mockRejectedValueOnce({ response: { status: 500 } })
        .mockResolvedValueOnce({ data: mockData });

      const result = await service.getExpensesAndIncomes();

      expect(mockClient.post).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockData);
    });

    it('does not retry a 401 — an expired/invalid session will not fix itself', async () => {
      mockClient.post.mockRejectedValue({ response: { status: 401 } });

      await expect(service.getExpensesAndIncomes()).rejects.toEqual({ response: { status: 401 } });
      expect(mockClient.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('addExpenseOrIncome', () => {
    it('should call /expenses/add with transaction data and return full response', async () => {
      const txData = { amount: 50, categoryTag: { index: 4 }, isExpense: true };
      mockClient.post.mockResolvedValue({ status: 200, data: { id: 'tx1' } });

      const result = await service.addExpenseOrIncome(txData);

      expect(mockClient.post).toHaveBeenCalledWith('/api/expenses/add', txData);
      expect(result.status).toBe(200);
    });
  });

  describe('updateExpenseOrIncome', () => {
    it('updates the transaction and optional split in one request', async () => {
      const txData = { expense: { id: 42, amount: 12, shared_expense: { enabled: false } } };
      mockClient.post.mockResolvedValue({ status: 200, data: { id: 42 } });

      const result = await service.updateExpenseOrIncome(txData);

      expect(mockClient.post).toHaveBeenCalledWith('/api/expenses/update', txData);
      expect(result.status).toBe(200);
    });
  });

  describe('addExpensesAndIncomesBatch', () => {
    it('sends all imported transactions in one request', async () => {
      const payload = { expenses: [{ amount: 10 }, { amount: 20 }] };
      mockClient.post.mockResolvedValue({ data: { inserted: 2 } });

      const result = await service.addExpensesAndIncomesBatch(payload);

      expect(mockClient.post).toHaveBeenCalledOnce();
      expect(mockClient.post).toHaveBeenCalledWith('/api/expenses/batch-add', payload);
      expect(result).toEqual({ inserted: 2 });
    });
  });

  describe('deleteExpenseOrIncome', () => {
    it('should call /expenses/delete with data and return full response', async () => {
      const deleteData = { id: 'tx1' };
      mockClient.post.mockResolvedValue({ status: 200, data: { deleted: true } });

      const result = await service.deleteExpenseOrIncome(deleteData);

      expect(mockClient.post).toHaveBeenCalledWith('/api/expenses/delete', deleteData);
      expect(result.status).toBe(200);
    });
  });

  describe('custom categories', () => {
    it('should call /categories/rename and return the renamed category', async () => {
      const renamed = { id: 7, parentIndex: 2, parentType: 0, label: 'Lunch' };
      mockClient.post.mockResolvedValue({ data: renamed });

      const result = await service.renameCustomCategory({ id: 7, label: 'Lunch' });

      expect(mockClient.post).toHaveBeenCalledWith('/api/categories/rename', { id: 7, label: 'Lunch' });
      expect(result).toEqual(renamed);
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
