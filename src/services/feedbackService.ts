/**
 * Feedback Service — submits in-app feedback, which the backend turns into a
 * GitHub issue on the user's behalf (posted by a bot account, no user
 * identity included).
 *
 * @module services/feedbackService
 */
import type { AxiosInstance } from 'axios';

export type FeedbackType = 'bug' | 'idea' | 'other';

export interface FeedbackSubmitRequest {
  type: FeedbackType;
  title: string;
  description: string;
  page?: string;
}

export interface FeedbackSubmitResponse {
  issueUrl: string;
  issueNumber: number;
}

export interface FeedbackService {
  submitFeedback(data: FeedbackSubmitRequest): Promise<FeedbackSubmitResponse>;
}

export const createFeedbackService = (apiClient: AxiosInstance): FeedbackService => ({
  async submitFeedback(data) {
    const res = await apiClient.post<FeedbackSubmitResponse>('/api/feedback', data);
    return res.data;
  },
});

export default createFeedbackService;
