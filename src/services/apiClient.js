/**
 * API Client - Centralized HTTP client configuration.
 *
 * This module provides a pre-configured axios instance that ALL API calls
 * should use. It encapsulates common settings (base URL, credentials,
 * interceptors) so that consumers don't have to repeat them.
 *
 * @module services/apiClient
 */
import axios from 'axios';

/**
 * Create and configure the default API client.
 *
 * @param {Object} [options]
 * @param {string} [options.baseURL] - Override the base URL (useful for tests)
 * @param {Function} [options.onUnauthorized] - Callback fired on 401 responses
 * @returns {import('axios').AxiosInstance}
 */
export const createApiClient = ({ baseURL = '', onUnauthorized } = {}) => {
  const client = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Response interceptor — handle 401 globally
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized(error);
      }
      return Promise.reject(error);
    }
  );

  return client;
};

/**
 * Singleton default client.
 * Components that need a quick reference can import this, but prefer
 * injecting via the ServiceContext for better testability.
 */
const apiClient = createApiClient();

export default apiClient;
