import type { AxiosInstance } from 'axios';
import type { RankingSnapshot } from './rankingService';
import type { AveragesSnapshot } from './statsService';

export interface CommunityBenchmarkSnapshot {
  rankings: RankingSnapshot | null;
  averages: AveragesSnapshot | null;
}

export interface CommunityBenchmarkService {
  getSnapshot(): Promise<CommunityBenchmarkSnapshot>;
}

export const createCommunityBenchmarkService = (apiClient: AxiosInstance): CommunityBenchmarkService => ({
  async getSnapshot() {
    const res = await apiClient.post<CommunityBenchmarkSnapshot>('/api/benchmarks/summary', {});
    return res.data;
  },
});

export default createCommunityBenchmarkService;
