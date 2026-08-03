/**
 * useAccountActions — shared hook for account operations.
 *
 * Encapsulates deleteAccount, changePassword, generateNewId, and
 * resetUsername so that both SettingsPage and Sidebar use the same
 * logic and only differ in UI feedback.
 *
 * @module hooks/useAccountActions
 */

import { useState, useCallback } from 'react';
import { useDemoServices } from './useDemoServices';

/**
 * @param {Object}   options
 * @param {Function} options.onSuccess    Called with a message key on success
 * @param {Function} options.onError      Called with a message key on error
 * @param {Function} [options.onLogout]   Called when the user must be logged out
 * @returns {Object}
 */
export const useAccountActions = ({ onSuccess, onError, onLogout } = {}) => {
  const { userService } = useDemoServices();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Delete the user account.
   */
  const deleteAccount = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await userService.deleteAccount();
      if (response.status === 200) {
        onLogout?.();
      } else {
        onError?.('deleteAccountFailed');
      }
    } catch {
      onError?.('deleteAccountError');
    } finally {
      setIsLoading(false);
    }
  }, [userService, onLogout, onError]);

  /**
   * Change the user's password.
   * @param {string} oldPassword
   * @param {string} newPassword
   * @param {string} confirmPassword
   * @returns {Promise<boolean>} true on success
   */
  const changePassword = useCallback(async (oldPassword, newPassword, confirmPassword) => {
    if (newPassword !== confirmPassword) {
      onError?.('passwordMismatch');
      return false;
    }
    setIsLoading(true);
    try {
      const response = await userService.changePassword(oldPassword, newPassword, confirmPassword);
      if (response.status === 200) {
        onSuccess?.('passwordChanged');
        return true;
      }
      onError?.('changePasswordFailed');
      return false;
    } catch {
      onError?.('changePasswordError');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userService, onSuccess, onError]);

  /**
   * Generate a new user ID.
   * @param {string} password  Current password for confirmation
   * @returns {Promise<string|null>} The new ID, or null on failure
   */
  const generateNewId = useCallback(async (password) => {
    setIsLoading(true);
    try {
      const response = await userService.changeUserId(password);
      const newId = response.new_id;
      onSuccess?.('idGenerated', newId);
      return newId;
    } catch {
      onError?.('generateIdError');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userService, onSuccess, onError]);

  /**
   * Generate (or regenerate) the account's recovery code. Password-gated
   * like generateNewId; regenerating invalidates any previous code.
   * @param {string} password  Current password for confirmation
   * @returns {Promise<{base32: string, words: string}|null>} The new code, or null on failure
   */
  const generateRecoveryCode = useCallback(async (password) => {
    setIsLoading(true);
    try {
      const response = await userService.generateRecoveryCode(password);
      const code = { base32: response.recovery_code_base32, words: response.recovery_code_words };
      onSuccess?.('recoveryCodeGenerated', code);
      return code;
    } catch {
      onError?.('generateRecoveryCodeError');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userService, onSuccess, onError]);

  /**
   * Reset (regenerate) the username.
   * @returns {Promise<string|null>} The new username, or null on failure
   */
  const resetUsername = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await userService.resetUsername();
      onSuccess?.('usernameReset', response);
      return response;
    } catch {
      onError?.('resetUsernameError');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userService, onSuccess, onError]);

  /**
   * Update user profile.
   * @param {Object} data  Profile fields to update
   * @returns {Promise<boolean>}
   */
  const updateProfile = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const response = await userService.updateProfile(data);
      if (response.status === 200) {
        onSuccess?.('profileUpdated');
        return true;
      }
      onError?.('updateProfileFailed');
      return false;
    } catch {
      onError?.('updateProfileError');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userService, onSuccess, onError]);

  return {
    deleteAccount,
    changePassword,
    generateNewId,
    generateRecoveryCode,
    resetUsername,
    updateProfile,
    isLoading,
  };
};

export default useAccountActions;
