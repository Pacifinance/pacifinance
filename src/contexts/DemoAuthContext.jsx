/**
 * DemoAuthContext — client-side-only auth provider for demo mode.
 *
 * When the user clicks "Try Demo", this provider replaces the real
 * UserContext data flow. All data comes from `demoData.js` and all
 * write operations (add balance, add expense, update profile, etc.)
 * are simulated in memory — no API calls are made to the backend.
 *
 * This makes the demo scalable to any number of concurrent users
 * without impacting the database or backend.
 *
 * @module contexts/DemoAuthContext
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { generateDemoData } from '../data/demoData';
import { createLegacyBalanceData } from '../utils/userDataSelectors';

export const DemoAuthContext = createContext(null);

export const useDemoAuth = () => useContext(DemoAuthContext);

/**
 * DemoAuthProvider — wraps children with demo-mode context.
 * Provides the same interface as UserContext so all components
 * work seamlessly.
 */
export const DemoAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isUpdated, setIsUpdated] = useState(true);
  const [userData, setUserData] = useState(() => generateDemoData());

  const handleSetIsAuthenticated = useCallback((value) => {
    setIsAuthenticated(value);
    if (!value) {
      // Exiting demo mode
      sessionStorage.removeItem('pacifinance-demo');
      setIsUpdated(false);
    }
  }, []);

  const handleSetIsUpdated = useCallback((value) => {
    setIsUpdated(value);
    // If data refresh is requested, regenerate fresh demo data
    if (!value) {
      setUserData(generateDemoData());
      setIsUpdated(true);
    }
  }, []);

  // Simulate loadUserData (no-op for demo, data is always in memory)
  const loadUserData = useCallback(() => {
    setUserData(generateDemoData());
    setIsUpdated(true);
  }, []);

  // Build enhanced data with legacy compatibility (same as UserContext)
  const enhancedUserData = useMemo(() => {
    if (!userData) return null;
    return {
      ...userData,
      ...createLegacyBalanceData(userData),
    };
  }, [userData]);

  const value = useMemo(() => ({
    userData: enhancedUserData,
    setUserData,
    isAuthenticated,
    isUpdated,
    handleSetIsAuthenticated,
    handleSetIsUpdated,
    isLoading: false,
    loadUserData,
    isDemoMode: true,
    error: null,
    retryFetch: loadUserData,
  }), [enhancedUserData, isAuthenticated, isUpdated, handleSetIsAuthenticated, handleSetIsUpdated, loadUserData]);

  return (
    <DemoAuthContext.Provider value={value}>
      {children}
    </DemoAuthContext.Provider>
  );
};

export default DemoAuthContext;
