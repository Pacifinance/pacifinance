/**
 * Roadmap Votes Service — lets a logged-in user vote for roadmap items they
 * want prioritized. Vote counts are our own (not GitHub reactions): every
 * user gets one vote per item, toggled on/off.
 *
 * @module services/roadmapVotesService
 */
import type { AxiosInstance } from 'axios';

export type RoadmapVoteCounts = Record<string, number>;

export interface RoadmapVoteToggleResponse {
  itemId: string;
  voted: boolean;
}

export interface RoadmapVotesService {
  getVoteCounts(): Promise<RoadmapVoteCounts>;
  getMyVotes(): Promise<string[]>;
  toggleVote(itemId: string): Promise<RoadmapVoteToggleResponse>;
}

export const createRoadmapVotesService = (apiClient: AxiosInstance): RoadmapVotesService => ({
  async getVoteCounts() {
    const res = await apiClient.get<RoadmapVoteCounts>('/api/roadmap-votes');
    return res.data || {};
  },

  async getMyVotes() {
    const res = await apiClient.get<string[]>('/api/roadmap-votes/mine');
    return Array.isArray(res.data) ? res.data : [];
  },

  async toggleVote(itemId) {
    const res = await apiClient.post<RoadmapVoteToggleResponse>('/api/roadmap-votes/toggle', { itemId });
    return res.data;
  },
});

export default createRoadmapVotesService;
