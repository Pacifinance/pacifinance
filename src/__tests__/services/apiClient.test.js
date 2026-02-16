/**
 * Tests for apiClient — the centralized HTTP client.
 *
 * Validates:
 *  - Default configuration (withCredentials, headers)
 *  - 401 interceptor invokes onUnauthorized callback
 *  - Factory creates independent instances
 */

import { describe, it, expect, vi } from 'vitest';
import { createApiClient } from '../../services/apiClient';

describe('apiClient', () => {
  describe('createApiClient', () => {
    it('should create an axios instance with default config', () => {
      const client = createApiClient();
      expect(client).toBeDefined();
      expect(client.defaults.withCredentials).toBe(true);
      expect(client.defaults.headers['Content-Type']).toBe('application/json');
    });

    it('should accept a custom baseURL', () => {
      const client = createApiClient({ baseURL: 'https://api.test.com' });
      expect(client.defaults.baseURL).toBe('https://api.test.com');
    });

    it('should create independent client instances', () => {
      const client1 = createApiClient({ baseURL: '/api-1' });
      const client2 = createApiClient({ baseURL: '/api-2' });

      expect(client1.defaults.baseURL).toBe('/api-1');
      expect(client2.defaults.baseURL).toBe('/api-2');
      expect(client1).not.toBe(client2);
    });

    it('should call onUnauthorized on 401 responses', async () => {
      const onUnauthorized = vi.fn();
      const client = createApiClient({ onUnauthorized });

      // Simulate a 401 response via interceptor
      // We need to manually trigger the error interceptor
      const interceptors = client.interceptors.response;
      // Access the reject handler (second fn in use())
      // The interceptor is the last one added
      const handlers = interceptors.handlers;
      const lastHandler = handlers[handlers.length - 1];
      
      const mockError = { response: { status: 401 } };
      
      try {
        await lastHandler.rejected(mockError);
      } catch {
        // Expected to reject
      }

      expect(onUnauthorized).toHaveBeenCalledWith(mockError);
    });

    it('should NOT call onUnauthorized on non-401 errors', async () => {
      const onUnauthorized = vi.fn();
      const client = createApiClient({ onUnauthorized });

      const handlers = client.interceptors.response.handlers;
      const lastHandler = handlers[handlers.length - 1];

      const mockError = { response: { status: 500 } };

      try {
        await lastHandler.rejected(mockError);
      } catch {
        // Expected to reject
      }

      expect(onUnauthorized).not.toHaveBeenCalled();
    });

    it('should NOT throw when no onUnauthorized is provided on 401', async () => {
      const client = createApiClient(); // No onUnauthorized callback

      const handlers = client.interceptors.response.handlers;
      const lastHandler = handlers[handlers.length - 1];

      const mockError = { response: { status: 401 } };

      await expect(lastHandler.rejected(mockError)).rejects.toEqual(mockError);
    });
  });
});
