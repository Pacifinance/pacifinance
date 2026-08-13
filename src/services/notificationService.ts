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
  getPushPublicKey(): Promise<string | null>;
  getPreferences(): Promise<NotificationPreferences>;
  savePreferences(preferences: NotificationPreferences): Promise<NotificationPreferences>;
  saveSubscription(subscription: BrowserPushSubscription): Promise<void>;
  deleteSubscription(endpoint: string): Promise<void>;
  sendTestNotification(language: string): Promise<number>;
}

export const createNotificationService = (apiClient: AxiosInstance): NotificationService => ({
  async getPushPublicKey() {
    const response = await apiClient.get<{publicKey: string | null}>('/api/notifications/public-key');
    return response.data.publicKey;
  },
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
  async sendTestNotification(language) {
    const response = await apiClient.post<{sent: number}>('/api/notifications/test', {language});
    return response.data.sent;
  },
});
