import React, { useState, useEffect, useRef } from 'react';
import { useServices } from './ServiceContext';
import { createLegacyBalanceData } from '../utils/userDataSelectors';
import { generateDemoData } from '../data/demoData';
import { removeLanguageFromPath } from '../utils/i18nRouting';
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

/**
 * Purely static/legal pages that never read `isAuthenticated` (verified by
 * grepping their page components) — visiting them shouldn't cost a session
 * check against the backend. Landing, FAQ, Pricing and Roadmap are
 * deliberately NOT here: Roadmap renders a different sidebar when logged in,
 * and the others are the most likely path into /auth, where resolving
 * isAuthenticated upfront avoids a loading flash on the redirect.
 */
const NO_AUTH_CHECK_PATHS = [
  '/privacy-policy',
  '/terms-of-service',
  '/cookie-policy',
  '/disclaimer',
  '/contact',
  '/sitemap',
];

const defaultRankings = {
  balance: 0,
  incomes: 0,
  outflows: 0,
  balanceSimilar: 0,
  incomesSimilar: 0,
  outflowsSimilar: 0,
};

const emptyAverageBucket = {
  balances: null,
  expenses: null,
  incomes: null,
  savingsRates: null,
  expensesByCategory: null,
  assetAllocation: null,
};

const defaultAverages = {
  all: emptyAverageBucket,
  similar: emptyAverageBucket,
};

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [sessionUserInfo, setSessionUserInfo] = useState(null);
  const [isUpdated, setIsUpdated] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCounter, setRetryCounter] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const isAuthenticatedRef = useRef(isAuthenticated);

  // Inject services from DI container
  const { apiClient, userService, financeService, rankingService, statsService, communityBenchmarkService, investmentService } = useServices();

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

      // Static/legal pages never consult isAuthenticated — skip the session
      // check entirely rather than spend a request just to discard the result.
      const currentPath = removeLanguageFromPath(window.location.pathname);
      if (NO_AUTH_CHECK_PATHS.includes(currentPath)) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const sessionData = await userService.checkSession();
        setSessionUserInfo(sessionData || null);
        setIsAuthenticated(!!sessionData);
      } catch {
        setSessionUserInfo(null);
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

            const initialUserInfo = sessionUserInfo;

            //************************************* CRITICAL DATA ********************************/
            // Resolve one request first, before firing the rest in parallel. Supabase
            // refresh tokens are single-use: if the access token had expired, firing
            // all 5 requests at once would make each of them race to refresh with the
            // same refresh token — only the first would succeed, and the other 4 would
            // get a spurious 401 that forces a logout even though the session was just
            // renewed by their sibling request. Awaiting one call first lets the
            // session middleware refresh (and re-cookie) the session exactly once, so
            // the batch below always runs with an already-valid access token.
            const tagsData = await userService.getTags();
            const [
              customCategories,
              infoData,
              balancesRawData,
              allOutflowsIncomesArray,
            ] = await Promise.all([
              financeService.getCustomCategories(),
              initialUserInfo ? Promise.resolve(initialUserInfo) : userService.getUserInfo(),
              financeService.getBalances(),
              financeService.getExpensesAndIncomes(),
            ]);

            const tags = transformTags(tagsData);

            //************************************* USER INFO ********************************/
            const language = localStorage.getItem('language') || 'en';
            const userProfile = transformUserProfile(infoData, tags.currencyTags, language);

            //************************************* GOALS & LIMITS ********************************/
            const userGoals = infoData.goals;
            const { goals, limits } = buildGoalsAndLimits(userGoals);

            //************************************* BALANCES **********************************************/
            const balancesData = transformBalances(balancesRawData);

            //************************************* EXPENSES AND INCOMES **********************************************/
            const totalOutflowsPerCategoryPerMonth = aggregateOutflowsByCategory(allOutflowsIncomesArray);
            const { incomesArray, outflowsArray } = buildMonthlyArrays(allOutflowsIncomesArray);
            const { allOutflows, allIncomes } = splitIncomesOutflows(allOutflowsIncomesArray);

            //************************************* PROCESSED DATA **********************************************/
            const last12MonthsData = buildChartData(balancesData, currentDate);

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
              rankings: defaultRankings,
              dates: {
                current: currentDate,
                preMonth: preMonthDate,
                preYearSameMonth: preYearSameMonthDate,
              },
              goals, limits, assets, averages: defaultAverages,
              currency: userProfile.preferredCurrencyCode,
              benchmarkConsent: userProfile.benchmarkConsent,
              seenBadges: userProfile.seenBadges,
              isAdmin: userProfile.isAdmin,
              activity: {
                investmentTransactions: [],
                communityPriceSubmissions: [],
              },
            });
            setSessionUserInfo(null);
            setIsUpdated(true);

            const loadBenchmarkSnapshot = communityBenchmarkService?.getSnapshot
              ? communityBenchmarkService.getSnapshot()
              : Promise.allSettled([
                  rankingService.getAllRankings(),
                  statsService.getAverages(),
                ]).then(([rankingsResult, averagesResult]) => ({
                  rankings: rankingsResult.status === 'fulfilled' ? rankingsResult.value : null,
                  averages: averagesResult.status === 'fulfilled' ? averagesResult.value : null,
                }));

            loadBenchmarkSnapshot.then((snapshot) => {
              setUserData(prev => {
                if (!prev) return prev;
                return {
                  ...prev,
                  rankings: snapshot.rankings ?? prev.rankings,
                  averages: snapshot.averages ?? prev.averages,
                };
              });
            }).catch(() => {});

            Promise.allSettled([
              investmentService?.getTransactions ? investmentService.getTransactions() : Promise.resolve([]),
              investmentService?.getMyCommunityPriceSubmissions ? investmentService.getMyCommunityPriceSubmissions() : Promise.resolve([]),
            ]).then(([transactionsResult, submissionsResult]) => {
              setUserData(prev => {
                if (!prev) return prev;
                return {
                  ...prev,
                  activity: {
                    investmentTransactions: transactionsResult.status === 'fulfilled' ? transactionsResult.value : [],
                    communityPriceSubmissions: submissionsResult.status === 'fulfilled' ? submissionsResult.value : [],
                  },
                };
              });
            });
        }
      } catch (error) {
        console.error('Errore durante le richieste API:', error);
        setError(error);
      }
    };
    fetchUserData();
  }, [isAuthenticated, isUpdated, retryCounter, isDemoMode, sessionUserInfo, userService, financeService, rankingService, statsService, communityBenchmarkService]);

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
      setSessionUserInfo(null);
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
    if (!value) setSessionUserInfo(null);
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

  // Lazy-loaded single arbitrary month (tagged transactions, mixed incomes+
  // outflows), for viewing/comparing history beyond the already-loaded
  // 13-month window (pie chart month picker, Panoramica Finanziaria,
  // Analisi Dettagliata Uscite). Cached by calendar key so re-selecting an
  // already-fetched month doesn't refetch it.
  const fetchMonthDetail = async (year, month) => {
    if (isDemoMode || isDemoSession()) return;
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    try {
      const transactions = await financeService.getMonthDetail(year, month);
      setUserData(prev => prev ? {
        ...prev,
        extraMonths: { ...(prev.extraMonths || {}), [monthKey]: transactions },
      } : prev);
    } catch (error) {
      console.error('Errore durante il caricamento del mese richiesto:', error);
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

  // Renames a custom sub-category without changing its official parent tag.
  const renameCustomCategory = async ({ id, label }) => {
    const renamed = await financeService.renameCustomCategory({ id, label });
    setUserData(prev => prev ? {
      ...prev,
      customCategories: (prev.customCategories || []).map(c => c.id === renamed.id ? renamed : c),
    } : prev);
    return renamed;
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
      fetchMonthDetail,
      addCustomCategory,
      renameCustomCategory,
      deleteCustomCategory
    }}>
      {children}
    </UserContext.Provider>
  );
}

export { UserContext };
