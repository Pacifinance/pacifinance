/**
 * API Client — centralized HTTP client configuration.
 *
 * All API calls should go through an instance created here. It encapsulates
 * common settings (base URL, credentials, interceptors) so that consumers
 * don't have to repeat them.
 *
 * @module services/apiClient
 */
import axios, { AxiosError, AxiosInstance } from 'axios';

export interface CreateApiClientOptions {
  /** Override the base URL (useful for tests). */
  baseURL?: string;
  /** Callback fired on 401 responses. */
  onUnauthorized?: (error: AxiosError) => void;
}

/** Create and configure the default API client. */
export const createApiClient = (
  { baseURL = '', onUnauthorized }: CreateApiClientOptions = {},
): AxiosInstance => {
  const client = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 20000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Response interceptor — handle 401 globally
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized(error);
      }
      return Promise.reject(error);
    },
  );

  return client;
};

/**
 * Singleton default client.
 * Components that need a quick reference can import this, but prefer
 * injecting via the ServiceContext for better testability.
 */
const apiClient: AxiosInstance = createApiClient();

export default apiClient;
