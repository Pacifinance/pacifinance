/**
 * User Service — encapsulates all user-related API calls.
 *
 * Injected with an API client for testability.
 *
 * @module services/userService
 */
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  LoginRequest,
  RegistrationRequest,
  RegistrationResponse,
  TagsGetResponse,
  UserGetResponse,
  UserGoalsRequest,
  UserSetIdResponse,
  UserSetPasswordRequest,
  UserSetRequest,
  BenchmarkConsentRequest,
  BenchmarkConsentResponse,
} from '../types/api';

export interface UserService {
  checkSession(): Promise<UserGetResponse | null>;
  getTags(): Promise<TagsGetResponse>;
  getUserInfo(): Promise<UserGetResponse | Record<string, never>>;
  updateProfile(data: UserSetRequest): Promise<AxiosResponse>;
  setBenchmarkConsent(contribute: boolean): Promise<BenchmarkConsentResponse>;
  login(userId: string, password: string, turnstileToken?: string): Promise<AxiosResponse>;
  register(password: string, repeatedPassword: string, turnstileToken?: string): Promise<AxiosResponse>;
  logout(): Promise<void>;
  deleteAccount(): Promise<AxiosResponse>;
  changeUserId(password: string): Promise<UserSetIdResponse>;
  changePassword(
    oldPassword: string,
    newPassword: string,
    repeatedPassword: string,
  ): Promise<AxiosResponse>;
  resetUsername(): Promise<{ username: string }>;
  saveGoals(goals: UserGoalsRequest): Promise<unknown>;
  getAllData(): Promise<unknown>;
}

/** Creates a user-service bound to the given HTTP client. */
export const createUserService = (apiClient: AxiosInstance): UserService => ({
  async checkSession() {
    const res = await apiClient.post<UserGetResponse>('/api/user/get', {});
    return res.data?.userId ? res.data : null;
  },

  async getTags() {
    const res = await apiClient.post<TagsGetResponse>('/api/tags/get', {});
    return res.data || {};
  },

  async getUserInfo() {
    const res = await apiClient.post<UserGetResponse>('/api/user/get', {});
    return res.data || {};
  },

  async updateProfile(data) {
    const res = await apiClient.post('/api/user/set', data);
    return res;
  },

  async setBenchmarkConsent(contribute) {
    const payload: BenchmarkConsentRequest = { contribute };
    const res = await apiClient.post<BenchmarkConsentResponse>('/api/user/benchmark-consent', payload);
    return res.data;
  },

  async login(userId, password, turnstileToken) {
    const payload: LoginRequest = {
      user_id: userId,
      password,
      ...(turnstileToken ? { turnstile_token: turnstileToken } : {}),
    };
    const res = await apiClient.post('/api/login', payload);
    return res;
  },

  async register(password, repeatedPassword, turnstileToken) {
    const payload: RegistrationRequest = {
      user_pwd: password,
      repeated_pwd: repeatedPassword,
      ...(turnstileToken ? { turnstile_token: turnstileToken } : {}),
    };
    const res = await apiClient.post<RegistrationResponse>('/api/registration', payload);
    return res;
  },

  async logout() {
    await apiClient.post('/api/user/logout', {});
  },

  async deleteAccount() {
    const res = await apiClient.post('/api/user/delete', {});
    return res;
  },

  async changeUserId(password) {
    const res = await apiClient.post<UserSetIdResponse>('/api/user/set-id', { password });
    return res.data;
  },

  async changePassword(oldPassword, newPassword, repeatedPassword) {
    const payload: UserSetPasswordRequest = {
      old_pwd: oldPassword,
      new_pwd: newPassword,
      repeated_pwd: repeatedPassword,
    };
    const res = await apiClient.post('/api/user/set-password', payload);
    return res;
  },

  async resetUsername() {
    const res = await apiClient.post<{ username: string }>('/api/user/set-username', {});
    return res.data;
  },

  async saveGoals(goals) {
    const res = await apiClient.post('/api/user/goals', goals);
    return res.data;
  },

  async getAllData() {
    const res = await apiClient.post('/api/user/alldata', {});
    return res.data;
  },
});

export default createUserService;
