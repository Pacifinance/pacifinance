/**
 * Tests for userService — dependency-injected user API layer.
 *
 * Each test injects a mock apiClient to verify:
 *  - Correct endpoints are called
 *  - Request data is forwarded properly
 *  - Response data is extracted correctly
 *  - Null/undefined responses are handled gracefully
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUserService } from '../../services/userService';

// Create a mock axios-like client
const createMockClient = () => ({
  post: vi.fn(),
  get: vi.fn(),
});

describe('userService', () => {
  let mockClient;
  let service;

  beforeEach(() => {
    mockClient = createMockClient();
    service = createUserService(mockClient);
  });

  describe('checkSession', () => {
    it('should return user data when session is valid', async () => {
      mockClient.post.mockResolvedValue({ data: { userId: 'abc123', type: 0 } });

      const result = await service.checkSession();

      expect(mockClient.post).toHaveBeenCalledWith('/api/user/get', {});
      expect(result).toEqual({ userId: 'abc123', type: 0 });
    });

    it('should return null when userId is missing', async () => {
      mockClient.post.mockResolvedValue({ data: { something: 'else' } });

      const result = await service.checkSession();
      expect(result).toBeNull();
    });

    it('should return null when response data is empty', async () => {
      mockClient.post.mockResolvedValue({ data: null });

      const result = await service.checkSession();
      expect(result).toBeNull();
    });
  });

  describe('getTags', () => {
    it('should call /tags/get and return tags data', async () => {
      const mockTags = {
        expense: [{ index: 1, label: 'food' }],
        income: [{ index: 0, label: 'salary' }],
        payment: [{ index: 0, label: 'single' }],
      };
      mockClient.post.mockResolvedValue({ data: mockTags });

      const result = await service.getTags();

      expect(mockClient.post).toHaveBeenCalledWith('/api/tags/get', {});
      expect(result).toEqual(mockTags);
    });

    it('should return empty object when data is null', async () => {
      mockClient.post.mockResolvedValue({ data: null });

      const result = await service.getTags();
      expect(result).toEqual({});
    });
  });

  describe('getUserInfo', () => {
    it('should call /user/get and return user info', async () => {
      const mockInfo = { userId: 'user1', type: 1, nickname: 'Test' };
      mockClient.post.mockResolvedValue({ data: mockInfo });

      const result = await service.getUserInfo();

      expect(mockClient.post).toHaveBeenCalledWith('/api/user/get', {});
      expect(result).toEqual(mockInfo);
    });

    it('should return empty object when data is null', async () => {
      mockClient.post.mockResolvedValue({ data: null });
      const result = await service.getUserInfo();
      expect(result).toEqual({});
    });
  });

  describe('updateProfile', () => {
    it('should call /user/set with provided data', async () => {
      const profileData = { country: { index: 107 }, job: { index: 1 } };
      mockClient.post.mockResolvedValue({ status: 200, data: { success: true } });

      const result = await service.updateProfile(profileData);

      expect(mockClient.post).toHaveBeenCalledWith('/api/user/set', profileData);
      expect(result.status).toBe(200);
    });
  });

  describe('login', () => {
    it('should send user_id, password, and turnstile_token to /login', async () => {
      mockClient.post.mockResolvedValue({ status: 200, data: { userId: 'abc' } });

      const result = await service.login('abc', 'pass123', 'turnstile-token');

      expect(mockClient.post).toHaveBeenCalledWith('/api/login', {
        user_id: 'abc',
        password: 'pass123',
        turnstile_token: 'turnstile-token',
      });
      expect(result.status).toBe(200);
    });

    it('should omit turnstile_token when not provided', async () => {
      mockClient.post.mockResolvedValue({ status: 200, data: {} });

      await service.login('abc', 'pass123');

      expect(mockClient.post).toHaveBeenCalledWith('/api/login', {
        user_id: 'abc',
        password: 'pass123',
      });
    });
  });

  describe('register', () => {
    it('should send user_pwd, repeated_pwd, and turnstile_token to /registration', async () => {
      mockClient.post.mockResolvedValue({ status: 200, data: { user_id: 'new-user' } });

      const result = await service.register('newpass', 'newpass', 'turnstile-token');

      expect(mockClient.post).toHaveBeenCalledWith('/api/registration', {
        user_pwd: 'newpass',
        repeated_pwd: 'newpass',
        turnstile_token: 'turnstile-token',
      });
      expect(result.status).toBe(200);
    });
  });

  describe('logout', () => {
    it('should call /user/logout', async () => {
      mockClient.post.mockResolvedValue({});

      await service.logout();

      expect(mockClient.post).toHaveBeenCalledWith('/api/user/logout', {});
    });
  });

  describe('deleteAccount', () => {
    it('should call /user/delete without body', async () => {
      mockClient.post.mockResolvedValue({ status: 200, data: { deleted: true } });

      const result = await service.deleteAccount();

      expect(mockClient.post).toHaveBeenCalledWith('/api/user/delete', {});
      expect(result.status).toBe(200);
    });
  });

  describe('changeUserId', () => {
    it('should call /user/set-id with password only', async () => {
      mockClient.post.mockResolvedValue({ data: { new_id: 'generated-id' } });

      const result = await service.changeUserId('pass');

      expect(mockClient.post).toHaveBeenCalledWith('/api/user/set-id', {
        password: 'pass',
      });
      expect(result).toEqual({ new_id: 'generated-id' });
    });
  });

  describe('changePassword', () => {
    it('should call /user/set-password with old_pwd, new_pwd, repeated_pwd', async () => {
      mockClient.post.mockResolvedValue({ status: 200, data: { success: true } });

      const result = await service.changePassword('old', 'new', 'new');

      expect(mockClient.post).toHaveBeenCalledWith('/api/user/set-password', {
        old_pwd: 'old',
        new_pwd: 'new',
        repeated_pwd: 'new',
      });
      expect(result.status).toBe(200);
    });
  });

  describe('generateRecoveryCode', () => {
    it('should call /user/recovery-code/generate with password only', async () => {
      mockClient.post.mockResolvedValue({
        data: { recovery_code_base32: 'ABCD-EFGH-JKMN-PQRS', recovery_code_words: 'tiger-eagle-otter-panda-zebra-camel-koala-rhino-falcon-dolphin' },
      });

      const result = await service.generateRecoveryCode('pass');

      expect(mockClient.post).toHaveBeenCalledWith('/api/user/recovery-code/generate', {
        password: 'pass',
      });
      expect(result.recovery_code_base32).toBe('ABCD-EFGH-JKMN-PQRS');
    });
  });

  describe('getRecoveryCodeStatus', () => {
    it('should call /user/recovery-code/status', async () => {
      mockClient.post.mockResolvedValue({ data: { configured: true, generated_at: '2026-08-01T00:00:00.000Z' } });

      const result = await service.getRecoveryCodeStatus();

      expect(mockClient.post).toHaveBeenCalledWith('/api/user/recovery-code/status', {});
      expect(result).toEqual({ configured: true, generated_at: '2026-08-01T00:00:00.000Z' });
    });
  });

  describe('resetPasswordWithRecoveryCode', () => {
    it('should call /recovery/reset-password with user_id, recovery_code, new_pwd, repeated_pwd', async () => {
      mockClient.post.mockResolvedValue({ status: 200 });

      const result = await service.resetPasswordWithRecoveryCode('123456', 'ABCD-EFGH-JKMN-PQRS', 'newpass', 'newpass', 'token');

      expect(mockClient.post).toHaveBeenCalledWith('/api/recovery/reset-password', {
        user_id: '123456',
        recovery_code: 'ABCD-EFGH-JKMN-PQRS',
        new_pwd: 'newpass',
        repeated_pwd: 'newpass',
        turnstile_token: 'token',
      });
      expect(result.status).toBe(200);
    });

    it('should omit turnstile_token when not provided', async () => {
      mockClient.post.mockResolvedValue({ status: 200 });

      await service.resetPasswordWithRecoveryCode('123456', 'ABCD-EFGH-JKMN-PQRS', 'newpass', 'newpass');

      expect(mockClient.post).toHaveBeenCalledWith('/api/recovery/reset-password', {
        user_id: '123456',
        recovery_code: 'ABCD-EFGH-JKMN-PQRS',
        new_pwd: 'newpass',
        repeated_pwd: 'newpass',
      });
    });
  });

  describe('resetUsername', () => {
    it('should call /user/set-username', async () => {
      mockClient.post.mockResolvedValue({ data: { username: 'NewRandom' } });

      const result = await service.resetUsername();

      expect(mockClient.post).toHaveBeenCalledWith('/api/user/set-username', {});
      expect(result).toEqual({ username: 'NewRandom' });
    });
  });

  describe('saveGoals', () => {
    it('should call /user/goals with goals data', async () => {
      const goals = { expensesLimit: 2000, savingsPercent: 20 };
      mockClient.post.mockResolvedValue({ data: { saved: true } });

      await service.saveGoals(goals);

      expect(mockClient.post).toHaveBeenCalledWith('/api/user/goals', goals);
    });
  });

  describe('DI isolation', () => {
  describe('getAllData', () => {
    it('should call /user/alldata and return user data', async () => {
      const mockData = { balances: [1, 2], expenses: [3] };
      mockClient.post.mockResolvedValue({ data: mockData });

      const result = await service.getAllData();

      expect(mockClient.post).toHaveBeenCalledWith('/api/user/alldata', {});
      expect(result).toEqual(mockData);
    });

    it('should propagate errors from the API client', async () => {
      mockClient.post.mockRejectedValue(new Error('Network Error'));

      await expect(service.getAllData()).rejects.toThrow('Network Error');
    });
  });

    it('should be independent from other service instances', async () => {
      const client1 = createMockClient();
      const client2 = createMockClient();
      client1.post.mockResolvedValue({ data: null });
      client2.post.mockResolvedValue({ data: null });

      const service1 = createUserService(client1);
      createUserService(client2);

      await service1.checkSession();

      expect(client1.post).toHaveBeenCalled();
      expect(client2.post).not.toHaveBeenCalled();
    });
  });
});
