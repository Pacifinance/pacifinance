/**
 * Goal Service — custom user goals (linked to a live asset value, or manual).
 *
 * @module services/goalService
 */
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  GoalDeleteRequest,
  GoalDto,
  GoalSaveRequest,
  GoalsGetResponse,
} from '../types/api';

export interface GoalService {
  getGoals(): Promise<GoalsGetResponse>;
  saveGoal(data: GoalSaveRequest): Promise<GoalDto>;
  deleteGoal(data: GoalDeleteRequest): Promise<AxiosResponse>;
}

export const createGoalService = (apiClient: AxiosInstance): GoalService => ({
  async getGoals() {
    const res = await apiClient.post<GoalsGetResponse>('/api/goals/get', {});
    return Array.isArray(res.data) ? res.data : [];
  },

  async saveGoal(data) {
    const res = await apiClient.post<GoalDto>('/api/goals/save', data);
    return res.data;
  },

  async deleteGoal(data) {
    const res = await apiClient.post('/api/goals/delete', data);
    return res;
  },
});

export default createGoalService;
