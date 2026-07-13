import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createGoalService } from '../../services/goalService';

const createMockClient = () => ({
  post: vi.fn(),
});

describe('goalService', () => {
  let mockClient;
  let service;

  beforeEach(() => {
    mockClient = createMockClient();
    service = createGoalService(mockClient);
  });

  it('loads goals', async () => {
    const goals = [{ id: 1, name: 'Fondo Emergenza', goalType: 'savings', targetValue: 15000, currentValue: 5000, linkedAssetKey: 'emergencyFund' }];
    mockClient.post.mockResolvedValue({ data: goals });

    const result = await service.getGoals();

    expect(mockClient.post).toHaveBeenCalledWith('/api/goals/get', {});
    expect(result).toEqual(goals);
  });

  it('returns an empty array when goals response is malformed', async () => {
    mockClient.post.mockResolvedValue({ data: null });

    const result = await service.getGoals();

    expect(result).toEqual([]);
  });

  it('saves a goal', async () => {
    const goal = { id: 2, name: 'Vacanze', goalType: 'savings', targetValue: 4000, currentValue: 2200, linkedAssetKey: null };
    const payload = { name: 'Vacanze', goal_type: 'savings', target_value: 4000, current_value: 2200 };
    mockClient.post.mockResolvedValue({ data: goal });

    const result = await service.saveGoal(payload);

    expect(mockClient.post).toHaveBeenCalledWith('/api/goals/save', payload);
    expect(result).toEqual(goal);
  });

  it('deletes a goal', async () => {
    mockClient.post.mockResolvedValue({ status: 200 });

    const result = await service.deleteGoal({ id: 3 });

    expect(mockClient.post).toHaveBeenCalledWith('/api/goals/delete', { id: 3 });
    expect(result.status).toBe(200);
  });
});
