import React, { useState, useEffect, useRef } from 'react';
import { useServices } from './ServiceContext';
import { createLegacyBalanceData } from '../utils/userDataSelectors';
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

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isUpdated, setIsUpdated] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticatedRef = useRef(isAuthenticated);

  // Inject services from DI container
  const { apiClient, userService, financeService, rankingService, statsService } = useServices();

  // Keep ref in sync with state for use in interceptor
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // Interceptor: detect 401 responses (expired session / logged in elsewhere)
  // and automatically deauthenticate the user
  useEffect(() => {
    const interceptor = apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401 && isAuthenticatedRef.current) {
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
  useEffect(() => {
    const checkSession = async () => {
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
  }, [isAuthenticated, isUpdated, userService, financeService, rankingService, statsService]);

  // Retry function: reset error and trigger re-fetch
  const retryFetch = () => {
    setError(null);
    setIsUpdated(false);
  };

  const handleSetIsAuthenticated = (value) => {
    setIsAuthenticated(value);
    if (!value) {
      // Reset on deauthentication so next login triggers data fetch
      setIsUpdated(false);
      setError(null);
    }
  };

  const handleSetIsUpdated = (value) => {
    setIsUpdated(value);
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
      error,
      retryFetch
    }}>
      {children}
    </UserContext.Provider>
  );
}

export { UserContext };