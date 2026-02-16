/**
 * User Service — encapsulates all user-related API calls.
 *
 * This service should be used instead of calling axios directly from contexts
 * or components. It receives an API client instance (Dependency Injection),
 * making it easy to mock in tests.
 *
 * @module services/userService
 */

/**
 * Creates a user-service bound to the given HTTP client.
 *
 * @param {import('axios').AxiosInstance} apiClient
 * @returns {Object} The user service methods
 */
export const createUserService = (apiClient) => ({
  /**
   * Check if the current session is valid.
   * @returns {Promise<Object|null>} User info or null
   */
  async checkSession() {
    const res = await apiClient.post('/user/get', null);
    return res.data?.userId ? res.data : null;
  },

  /**
   * Get all available tags (categories, payment types, etc.)
   * @returns {Promise<Object>}
   */
  async getTags() {
    const res = await apiClient.post('/tags/get', null);
    return res.data || {};
  },

  /**
   * Get current user info.
   * @returns {Promise<Object>}
   */
  async getUserInfo() {
    const res = await apiClient.post('/user/get', null);
    return res.data || {};
  },

  /**
   * Update user profile.
   * @param {Object} data - Profile data to update
   * @returns {Promise<import('axios').AxiosResponse>} Full response (callers check status)
   */
  async updateProfile(data) {
    const res = await apiClient.post('/user/set', data);
    return res;
  },

  /**
   * Login with userId and password.
   * @param {string} userId
   * @param {string} password
   * @param {string} [turnstileToken] - Cloudflare Turnstile token
   * @returns {Promise<import('axios').AxiosResponse>} Full response (callers check status)
   */
  async login(userId, password, turnstileToken) {
    const res = await apiClient.post('/login', {
      user_id: userId,
      password,
      ...(turnstileToken && { turnstile_token: turnstileToken }),
    });
    return res;
  },

  /**
   * Register a new user.
   * @param {string} password
   * @param {string} repeatedPassword
   * @param {string} [turnstileToken]
   * @returns {Promise<import('axios').AxiosResponse>} Full response (callers check status)
   */
  async register(password, repeatedPassword, turnstileToken) {
    const res = await apiClient.post('/registration', {
      user_pwd: password,
      repeated_pwd: repeatedPassword,
      ...(turnstileToken && { turnstile_token: turnstileToken }),
    });
    return res;
  },

  /**
   * Logout the current user.
   * @returns {Promise<void>}
   */
  async logout() {
    await apiClient.post('/user/logout', null);
  },

  /**
   * Delete user account.
   * @returns {Promise<import('axios').AxiosResponse>} Full response (callers check status)
   */
  async deleteAccount() {
    const res = await apiClient.post('/user/delete', null);
    return res;
  },

  /**
   * Generate a new userId (server auto-generates it).
   * @param {string} password - Current password for confirmation
   * @returns {Promise<Object>} Contains `new_id`
   */
  async changeUserId(password) {
    const res = await apiClient.post('/user/set-id', { password });
    return res.data;
  },

  /**
   * Change password.
   * @param {string} oldPassword
   * @param {string} newPassword
   * @param {string} repeatedPassword
   * @returns {Promise<import('axios').AxiosResponse>} Full response (callers check status)
   */
  async changePassword(oldPassword, newPassword, repeatedPassword) {
    const res = await apiClient.post('/user/set-password', {
      old_pwd: oldPassword,
      new_pwd: newPassword,
      repeated_pwd: repeatedPassword,
    });
    return res;
  },

  /**
   * Reset username (generate new random one).
   * @returns {Promise<Object>}
   */
  async resetUsername() {
    const res = await apiClient.post('/user/set-username', null);
    return res.data;
  },

  /**
   * Save user goals settings.
   * @param {Object} goals
   * @returns {Promise<Object>}
   */
  async saveGoals(goals) {
    const res = await apiClient.post('/user/goals', goals);
    return res.data;
  },

  /**
   * Get all user data for export.
   * @returns {Promise<Object>} Complete user data
   */
  async getAllData() {
    const res = await apiClient.post('/user/alldata', null);
    return res.data;
  },
});

export default createUserService;
