import React, { useState, useEffect, useRef } from 'react';
import { useServices } from './ServiceContext';
import { createLegacyBalanceData } from '../utils/userDataSelectors';
import { generateDemoData } from '../data/demoData';
import {
  transformTags,
  transformUserProfile,
  buildGoalsAndLimits,
  transformBalances,
  aggregateOutflowsByCategory,
  buildMonthlyArrays,
  buildChartData,
  buildAssetsFromBalance,
  splitIncomesOutflows,
} from '../utils/userDataTransformers';

const UserContext = React.createContext();

/** Check if demo mode is active via sessionStorage */
const isDemoSession = () => sessionStorage.getItem('pacifinance-demo') === 'true';

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isUpdated, setIsUpdated] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCounter, setRetryCounter] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const isAuthenticatedRef = useRef(isAuthenticated);

  // Inject services from DI container
  const { apiClient, userService, financeService, rankingService, statsService } = useServices();

  // Keep ref in sync with state for use in interceptor
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // Interceptor: detect 401 responses (expired session / logged in elsewhere)
  // Skip logout in demo mode (no real session exists)
  useEffect(() => {
    const interceptor = apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401 && isAuthenticatedRef.current && !isDemoSession()) {
          // Session expired or invalidated (e.g. logged in from another device)
          setIsAuthenticated(false);
          setUserData(null);
        }
        return Promise.reject(error);
      }
    );
    return () => apiClient.interceptors.response.eject(interceptor);
  }, [apiClient]);

  // All'avvio, verifica se la sessione è valida tramite cookie HTTP-only
  // In demo mode, skip API session check entirely
  useEffect(() => {
    const checkSession = async () => {
      // Demo mode: activate immediately without API calls
      if (isDemoSession()) {
        setIsDemoMode(true);
        setIsAuthenticated(true);
        setUserData(generateDemoData());
        setIsUpdated(true);
        setIsLoading(false);
        return;
      }

      try {
        const sessionData = await userService.checkSession();
        setIsAuthenticated(!!sessionData);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, [userService]);

  useEffect(() => {
    // In demo mode, data is already loaded — skip API fetches
    // Check both state and sessionStorage as safety net against race conditions
    if (isDemoMode || isDemoSession()) return;

    // Quando cambia autenticazione o update, carica i dati utente se autenticato
    const fetchUserData = async () => {
      if (!isAuthenticated) {
        setUserData(null);
        setIsUpdated(false); // Reset so next login triggers data fetch
        return;
      }
      try {
        if (isAuthenticated && !isUpdated) {

            //***********************************GET DATES********************************************/
            const currentDate = new Date(Date.now());
            const preMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
            const preYearSameMonthDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());

            //************************************* TAGS ********************************/
            const tagsData = await userService.getTags();
            const tags = transformTags(tagsData);

            //************************************* CUSTOM CATEGORIES ********************************/
            const customCategories = await financeService.getCustomCategories();

            //************************************* USER INFO ********************************/
            const infoData = await userService.getUserInfo();
            const language = localStorage.getItem('language') || 'en';
            const userProfile = transformUserProfile(infoData, tags.currencyTags, language);

            //************************************* GOALS & LIMITS ********************************/
            const userGoals = infoData.goals;
            const { goals, limits } = buildGoalsAndLimits(userGoals);

            //************************************* BALANCES **********************************************/
            const balancesRawData = await financeService.getBalances();
            const balancesData = transformBalances(balancesRawData);

            //************************************* EXPENSES AND INCOMES **********************************************/
            const allOutflowsIncomesArray = await financeService.getExpensesAndIncomes();
            const totalOutflowsPerCategoryPerMonth = aggregateOutflowsByCategory(allOutflowsIncomesArray);
            const { incomesArray, outflowsArray } = buildMonthlyArrays(allOutflowsIncomesArray);
            const { allOutflows, allIncomes } = splitIncomesOutflows(allOutflowsIncomesArray);

            //************************************* PROCESSED DATA **********************************************/
            const last12MonthsData = buildChartData(balancesData, currentDate);

            //************************************* RANKING **********************************************/
            const rankings = await rankingService.getAllRankings();

            //************************************* STATS AVERAGES **********************************************/
            const averages = await statsService.getAverages();

            //************************************* ASSETS **********************************************/
            const currentBalance = balancesData[0]?.balance || {};
            const assets = buildAssetsFromBalance(currentBalance);

            //************************************* USER DATA UPDATE **********************************************/
            setUserData({
              // Core user info
              userId: userProfile.userId,
              userType: userProfile.userType,
              username: userProfile.username,
              profileCompletionPercentage: userProfile.profileCompletionPercentage,
              profile: userProfile.profile,
              balances: balancesData,
              last12MonthsData,
              expenses: { allOutflows, outflowsArray, totalOutflowsPerCategoryPerMonth },
              incomes: { allIncomes, incomesArray },
              tags,
              customCategories,
              rankings,
              dates: {
                current: currentDate,
                preMonth: preMonthDate,
                preYearSameMonth: preYearSameMonthDate,
              },
              goals, limits, assets, averages,
              currency: userProfile.preferredCurrencyCode,
            });
            handleSetIsUpdated(true);
        }
      } catch (error) {
        console.error('Errore durante le richieste API:', error);
        setError(error);
      }
    };
    fetchUserData();
  }, [isAuthenticated, isUpdated, retryCounter, isDemoMode, userService, financeService, rankingService, statsService]);

  // Retry function: reset error and trigger re-fetch
  const retryFetch = () => {
    if (isDemoMode) {
      // In demo mode, regenerate fresh data
      setUserData(generateDemoData());
      return;
    }
    setError(null);
    setIsUpdated(false);
    setRetryCounter(c => c + 1); // Force re-trigger even if isUpdated was already false
  };

  const handleSetIsAuthenticated = (value) => {
    if (value && isDemoSession()) {
      // Demo login: set demo state + data synchronously BEFORE isAuthenticated triggers effects
      setIsDemoMode(true);
      setUserData(generateDemoData());
      setIsUpdated(true);
      setError(null);
    }
    setIsAuthenticated(value);
    if (!value) {
      // Reset on deauthentication so next login triggers data fetch
      setIsUpdated(false);
      setError(null);
      // Clear demo mode on logout
      if (isDemoMode || isDemoSession()) {
        sessionStorage.removeItem('pacifinance-demo');
        setIsDemoMode(false);
      }
    }
  };

  const handleSetIsUpdated = (value) => {
    if (isDemoMode && !value) {
      // In demo mode, "refresh" means regenerate demo data
      setUserData(generateDemoData());
      return;
    }
    setIsUpdated(value);
  };

  // Lazy-loaded full balance history, fetched on demand (e.g. "ALL" period
  // selector in BalancesChart) instead of on every page load, to keep the
  // default egress low. Replaces `userData.balances`/`last12MonthsData` in
  // place — every selector reading them already tolerates a longer array.
  const fetchAllTimeBalances = async () => {
    if (isDemoMode || isDemoSession()) return; // demo data is already complete/synthetic
    try {
      const balancesRawData = await financeService.getBalances('all');
      const balancesData = transformBalances(balancesRawData);
      const currentDate = new Date();
      setUserData(prev => prev ? {
        ...prev,
        balances: balancesData,
        last12MonthsData: buildChartData(balancesData, currentDate),
      } : prev);
    } catch (error) {
      console.error('Errore durante il caricamento dello storico completo dei saldi:', error);
    }
  };

  // Lazy-loaded full monthly income/outflow totals (aggregated server-side,
  // no per-transaction detail), for the InOutChart "ALL" period selector.
  const fetchAllTimeMonthlyTotals = async () => {
    if (isDemoMode || isDemoSession()) return;
    try {
      const monthlyTotalsAllTime = await financeService.getMonthlyTotals('all');
      setUserData(prev => prev ? { ...prev, monthlyTotalsAllTime } : prev);
    } catch (error) {
      console.error('Errore durante il caricamento dei totali mensili storici:', error);
    }
  };

  // Creates a custom sub-category (child of an official tag) and appends it
  // to userData.customCategories on success.
  const addCustomCategory = async ({ label, parent_index, is_expense }) => {
    const created = await financeService.addCustomCategory({ label, parent_index, is_expense });
    setUserData(prev => prev ? {
      ...prev,
      customCategories: [...(prev.customCategories || []), created],
    } : prev);
    return created;
  };

  // Deletes a custom sub-category. Past expenses referencing it keep their
  // official category (server-side ON DELETE SET NULL), they just lose the
  // personalized label.
  const deleteCustomCategory = async (id) => {
    await financeService.deleteCustomCategory({ id });
    setUserData(prev => prev ? {
      ...prev,
      customCategories: (prev.customCategories || []).filter(c => c.id !== id),
    } : prev);
  };

  if (isLoading) return null; // oppure uno spinner

  // Create enhanced userData with both new structure and legacy compatibility
  const enhancedUserData = userData ? {
    ...userData,
    // Add legacy format for backward compatibility
    ...createLegacyBalanceData(userData)
  } : null;

  return (
    <UserContext.Provider value={{ 
      userData: enhancedUserData, 
      setUserData, 
      isAuthenticated, 
      isUpdated, 
      handleSetIsAuthenticated, 
      handleSetIsUpdated, 
      isLoading,
      isDemoMode,
      error,
      retryFetch,
      fetchAllTimeBalances,
      fetchAllTimeMonthlyTotals,
      addCustomCategory,
      deleteCustomCategory
    }}>
      {children}
    </UserContext.Provider>
  );
}

export { UserContext };