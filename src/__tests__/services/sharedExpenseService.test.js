import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSharedExpenseService } from '../../services/sharedExpenseService';

const createMockClient = () => ({
  post: vi.fn(),
});

describe('sharedExpenseService', () => {
  let mockClient;
  let service;

  beforeEach(() => {
    mockClient = createMockClient();
    service = createSharedExpenseService(mockClient);
  });

  it('lists receivables and returns array data', async () => {
    const receivables = [{ id: 1, date: '2026-03-10', totalAmount: 40, ownShare: 10, receivableAmount: 30, settledAmount: 0, status: 'pending' }];
    mockClient.post.mockResolvedValue({ data: receivables });

    const result = await service.getReceivables();

    expect(mockClient.post).toHaveBeenCalledWith('/api/shared-expenses/get', {});
    expect(result).toEqual(receivables);
  });

  it('returns an empty array when the get response is malformed', async () => {
    mockClient.post.mockResolvedValue({ data: null });

    const result = await service.getReceivables();

    expect(result).toEqual([]);
  });

  it('adds a receivable', async () => {
    const created = { id: 2, date: '2026-03-10', notes: 'Uber vacation', totalAmount: 40, ownShare: 10, receivableAmount: 30, settledAmount: 0, status: 'pending' };
    mockClient.post.mockResolvedValue({ data: created });

    const payload = { date: '2026-03-10', notes: 'Uber vacation', total_amount: 40, own_share: 10 };
    const result = await service.addReceivable(payload);

    expect(mockClient.post).toHaveBeenCalledWith('/api/shared-expenses/add', payload);
    expect(result).toEqual(created);
  });

  it('settles a receivable', async () => {
    const settled = { id: 2, settledAmount: 15, status: 'partial' };
    mockClient.post.mockResolvedValue({ data: settled });

    const result = await service.settleReceivable({ id: 2, amount: 15 });

    expect(mockClient.post).toHaveBeenCalledWith('/api/shared-expenses/settle', { id: 2, amount: 15 });
    expect(result).toEqual(settled);
  });

  it('deletes a receivable', async () => {
    mockClient.post.mockResolvedValue({ status: 200 });

    const result = await service.deleteReceivable({ id: 2 });

    expect(mockClient.post).toHaveBeenCalledWith('/api/shared-expenses/delete', { id: 2 });
    expect(result.status).toBe(200);
  });

  it('links an existing outflow to a shared-expense receivable', async () => {
    const payload = { expense_id: 12, own_share: 15 };
    mockClient.post.mockResolvedValue({ data: { id: 4, expenseId: 12, ownShare: 15 } });
    await service.linkExistingExpense(payload);
    expect(mockClient.post).toHaveBeenCalledWith('/api/shared-expenses/link-expense', payload);
  });

  it('links an existing income as a reimbursement', async () => {
    const payload = { expense_id: 22, receivable_id: 4 };
    mockClient.post.mockResolvedValue({ data: [] });
    await service.linkExistingReimbursement(payload);
    expect(mockClient.post).toHaveBeenCalledWith('/api/shared-expenses/link-reimbursement', payload);
  });
});
