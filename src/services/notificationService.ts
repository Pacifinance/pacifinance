import type {AxiosInstance} from 'axios';

export interface NotificationPreferences {
  enabled: boolean;
  monthlySummary: boolean;
  dataUpdateReminder: boolean;
  recurringDue: boolean;
  sharedExpenseUpdates: boolean;
  communityPriceUpdates: boolean;
  reminderDay: number;
  reminderHour: number;
  timezone: string;
  language: string;
}

export interface BrowserPushSubscription {
  endpoint: string;
  keys: {p256dh: string; auth: string};
}

export interface NotificationService {
  getPreferences(): Promise<NotificationPreferences>;
  savePreferences(preferences: NotificationPreferences): Promise<NotificationPreferences>;
  saveSubscription(subscription: BrowserPushSubscription): Promise<void>;
  deleteSubscription(endpoint: string): Promise<void>;
}

export const createNotificationService = (apiClient: AxiosInstance): NotificationService => ({
  async getPreferences() {
    const response = await apiClient.get<NotificationPreferences>('/api/notifications/preferences');
    return response.data;
  },
  async savePreferences(preferences) {
    const response = await apiClient.put<NotificationPreferences>('/api/notifications/preferences', preferences);
    return response.data;
  },
  async saveSubscription(subscription) {
    await apiClient.post('/api/notifications/subscriptions', subscription);
  },
  async deleteSubscription(endpoint) {
    await apiClient.delete('/api/notifications/subscriptions', {data: {endpoint}});
  },
});
