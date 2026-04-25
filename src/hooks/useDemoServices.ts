/**
 * useDemoServices — wraps useServices() for demo-mode safety.
 *
 * In normal mode, returns real services unchanged.
 * In demo mode, wraps write methods to return simulated success
 * responses without making any API calls.
 *
 * Usage: replace `useServices()` with `useDemoServices()` in components
 * that perform write operations (InsertValues, ProfilePage, etc.).
 *
 * @module hooks/useDemoServices
 */

import { useMemo } from 'react';
import { useServices } from '../contexts/ServiceContext';
import { useAuth } from './useAuth';

const FAKE_SUCCESS = { status: 200, data: { success: true } };

export const useDemoServices = () => {
  const services = useServices();
  const { isDemoMode } = useAuth();

  return useMemo(() => {
    if (!isDemoMode) return services;

    // In demo mode, wrap write methods to simulate success
    return {
      ...services,
      financeService: {
        ...services.financeService,
        addBalance: async () => FAKE_SUCCESS,
        addExpenseOrIncome: async () => FAKE_SUCCESS,
        deleteExpenseOrIncome: async () => FAKE_SUCCESS,
      },
      userService: {
        ...services.userService,
        updateProfile: async () => FAKE_SUCCESS,
        saveGoals: async () => ({ saved: true }),
        // Demo logout: no API call needed, just return success
        // The actual cleanup happens in UserContext via handleSetIsAuthenticated(false)
        logout: async () => FAKE_SUCCESS,
        // Block sensitive operations in demo mode
        deleteAccount: async () => { throw new Error('Not available in demo mode'); },
        changeUserId: async () => { throw new Error('Not available in demo mode'); },
        changePassword: async () => { throw new Error('Not available in demo mode'); },
      },
    };
  }, [isDemoMode, services]);
};

export default useDemoServices;
