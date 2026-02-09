import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { createLegacyBalanceData } from '../utils/userDataSelectors';

const UserContext = React.createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isUpdated, setIsUpdated] = useState(false);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const isAuthenticatedRef = useRef(isAuthenticated);

  // Keep ref in sync with state for use in interceptor
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // Axios interceptor: detect 401 responses (expired session / logged in elsewhere)
  // and automatically deauthenticate the user
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
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
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // All'avvio, verifica se la sessione è valida tramite cookie HTTP-only
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.post('/user/get', null, { withCredentials: true });
        if (res.data && res.data.userId) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    // Quando cambia autenticazione o update, carica i dati utente se autenticato
    const fetchUserData = async () => {
      if (!isAuthenticated) {
        setUserData(null);
        return;
      }
      try {
        // Bypass authentication in development mode
        // if (isDevelopment) {
        //   const mockUserData = {
        //     _id: 'dev-user',
        //     username: 'dev-user',
        //     email: 'dev@example.com',
        //     bankReal: 1000,
        //     cashReal: 500,
        //     digitalServicesReal: 200,
        //     stocksReal: 1500,
        //     etfReal: 800,
        //     bitcoinReal: 600,
        //     cryptoReal: 400,
        //     outflowsTags: ['Food', 'Transport', 'Entertainment'],
        //     incomesTags: ['Salary', 'Freelance', 'Investment'],
        //     paymentTags: ['Cash', 'Card', 'Transfer'],
        //     allOutflows: [],
        //     allIncomes: [],
        //     preMonthDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        //     preYearSameMonthDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
        //   };
        //   setUserData(mockUserData);
        //   setIsAuthenticated(true);
        //   return;
        // }

        //check if user is authenticated
        if (isAuthenticated && !isUpdated) { // && !isUpdated
            // console.log('Sono loggato e ora faccio le chiamate API in UserContext.js')

            //***********************************GET DATES********************************************/
            const currentDate = new Date(Date.now()); //current date in UTC format

            //get the date of the previous month
            const preMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());

            //get the date of the current month of the previous year
            const preYearSameMonthDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());

            //CALL API TO GET DATA

            /***************************** TAGS ********************************/

            const allTags  = await axios.post('/tags/get', null, { withCredentials: true });
            const outflowsTags = allTags.data.expense;
            const incomesTags = allTags.data.income;
            const paymentTags = allTags.data.payment;
            const nationalityTags = allTags.data.country; //used also for the country where the user works
            const jobTags = allTags.data.job;
            const jobTypeTags = allTags.data.jobType;
            const workTimeTags = allTags.data.workTime;
            const remoteTypeTags = allTags.data.remoteType;
            const ageTags = allTags.data.age;
            const livingSituationTags = allTags.data.livingSituation;
            const housingTypeTags = allTags.data.housingType;
            const childrenTags = allTags.data.children;
            const yearsOfExperienceTags = allTags.data.yearsOfExperience;



            // Definizione dell'enum
            const userTypeDict = {
              0: 'regular',
              1: 'premium',
              2: 'test',
              3: 'demo'
            };

            const infoUser = await axios.post('/user/get', null, { withCredentials: true });
            const userId = infoUser.data.userId;
            const userType = userTypeDict[infoUser.data.type]; //infoUser.data.type: 0 = regular, 1 = premium, 2 = test, 3 = demo
            //Obtain the user type from the dictionary
            // userType = userTypeDict[userType];
            const username = infoUser.data.nickname ?? 'Username non impostato';
            // Helper to get translation fallback
            const getTranslation = (obj, language, fallback) => {
              if (!obj?.translations) return fallback;
              if (obj.translations[language]) return obj.translations[language];
              if (obj.translations.en) return obj.translations.en;
              if (obj.translations.it) return obj.translations.it;
              return fallback;
            };

            // Get current language from localStorage or default to 'en'
            const language = localStorage.getItem('language') || 'en';

            const userNationality = {key: infoUser.data.country?.index ?? -1, value: getTranslation(infoUser.data.country, language, 'Nazionalità non impostata')};
            const userWhereWorks = {key: infoUser.data.jobCountry?.index ?? -1 ,value: getTranslation(infoUser.data.jobCountry, language, 'Dove lavora non impostato')};
            const userJob = {key: infoUser.data.job?.index ?? -1, value: getTranslation(infoUser.data.job, language, 'Lavoro non impostato')};
            const userJobType = {key: infoUser.data.jobType?.index ?? -1, value: getTranslation(infoUser.data.jobType, language, 'Tipo di lavoro non impostato')};
            const userWorkTime = {key: infoUser.data.workTime?.index ?? -1, value: getTranslation(infoUser.data.workTime, language, 'Tipologia contratto non impostato')};
            const userRemoteType = {key: infoUser.data.remoteType?.index ?? -1, value: getTranslation(infoUser.data.remoteType, language, 'Tipologia lavoro non impostata')};
            const userAge = {key: infoUser.data.age?.index ?? -1, value: getTranslation(infoUser.data.age, language, 'Età non impostata')};
            const userLivingSituation = {key: infoUser.data.livingSituation?.index ?? -1, value: getTranslation(infoUser.data.livingSituation, language, 'Situazione abitativa non impostata')};
            const userHousingType = {key: infoUser.data.housingType?.index ?? -1, value: getTranslation(infoUser.data.housingType, language, 'Tipologia abitazione non impostata')};
            const userChildren = {key: infoUser.data.children?.index ?? -1, value: getTranslation(infoUser.data.children, language, 'Figli non impostato')};
            const userYearsOfExperience = {key: infoUser.data.yearsOfExperience?.index ?? -1, value: getTranslation(infoUser.data.yearsOfExperience, language, 'Anni di esperienza non impostati')};

            // Calcola la percentuale di completamento del profilo
            const profileFields = [
              userNationality,
              userWhereWorks,
              userJob,
              userJobType,
              userWorkTime,
              userRemoteType,
              userAge,
              userLivingSituation,
              userHousingType,
              userChildren,
              userYearsOfExperience
            ];
            const completedFields = profileFields.filter(field => field.key !== -1).length;
            const profileCompletionPercentage = Math.round((completedFields / profileFields.length) * 100);

            // Get goals and limits from user data
            const userGoals = infoUser.data.goals || {
              expensesLimit: -1,
              savingsPercent: -1,
              emergencyFundGoal: -1
            };

            // TODO: Quando il backend sarà pronto, qui andranno caricate le impostazioni goals e limits dal DB
            // const goalsAndLimitsData = await axios.post('/user/getGoalsAndLimits', null, { withCredentials: true });
            const goalsAndLimitsData = {
              goals: [],
              limits: {
                monthlySpendingLimit: userGoals.expensesLimit !== -1 ? userGoals.expensesLimit : 2000,
                savingsGoalPercentage: userGoals.savingsPercent !== -1 ? userGoals.savingsPercent : 20,
                emergencyFundTarget: userGoals.emergencyFundGoal !== -1 ? userGoals.emergencyFundGoal : 10000,
                notificationsEnabled: true
              }
            };
            const { goals, limits } = goalsAndLimitsData;


            //************************************* BALANCES **********************************************/

            const balancesResponse = await axios.post('/balances/get', null, { withCredentials: true });
            
            // Ensure we have valid balance data for at least current month
            const balancesData = balancesResponse.data.map(monthData => ({
                date: monthData.date,
                balance: monthData.balance || {}
            }));

            // Helper function to calculate total from balance object
            const calculateTotal = (balance) => {
                if (!balance) return 0;
                return (balance.cash || 0) + (balance.bank || 0) + (balance.emergencyFund || 0) + 
                       (balance.digitalServices || 0) + (balance.stocks || 0) + (balance.etf || 0) + 
                       (balance.bitcoin || 0) + (balance.crypto || 0) + (balance.bonds || 0) + 
                       (balance.funds || 0) + (balance.gold || 0);
            };

            // Add computed totals to balance data
            balancesData.forEach(monthData => {
                monthData.balance.totalValue = calculateTotal(monthData.balance);
            });
            //************************************* EXPENSES AND INCOMES **********************************************/

            const allOutflowsIncomesResponse = await axios.post('/expenses/get', null, { withCredentials: true }); //get all outflows and incomes
            // console.log('Response completa  SPESE e GUADAGNI: ', allOutflowsIncomesResponse);

            const allOutflowsIncomesArray = allOutflowsIncomesResponse.data;

            // console.log('Array completo SPESE e GUADAGNI: ', allOutflowsIncomesArray[0]);

            // Assuming you have access to allOutflowsIncomesArray as described in your code

            // Initialize an empty object to hold the total outflows per category for each month
            let totalOutflowsPerCategoryPerMonth = {};

            // Iterate through each month in allOutflowsIncomesArray
            allOutflowsIncomesArray.forEach((month, index) => {
              // Initialize an empty object to hold the total outflows per category for the current month
              let totalOutflowsPerCategory = {};

              // Iterate through each entry in the current month
              month.forEach((entry) => {
                // Check if the entry is an expense
                if (entry.isExpense) {
                  // Use English category name for consistency across the application
                  const categoryKey = entry.categoryTag.translations.en;
                  // If the category exists, add the current value
                  if (totalOutflowsPerCategory[categoryKey]) {
                    totalOutflowsPerCategory[categoryKey] += entry.amount;
                  } else {
                    // Otherwise, initialize the category with the current value
                    totalOutflowsPerCategory[categoryKey] = entry.amount;
                  }
                }
              });

              // Save the total outflows per category for the current month
              totalOutflowsPerCategoryPerMonth[index] = totalOutflowsPerCategory;
            });

            // Now totalOutflowsPerCategoryPerMonth contains the total outflows for each category for each month
            // console.log(totalOutflowsPerCategoryPerMonth);


            // Crea un array di oggetti per le entrate e un array di oggetti per le spese, inizializzati con valori iniziali a 0
            const incomesArray = Array(13).fill(0);
            const outflowsArray = Array(13).fill(0);

            // Itera su ciascun elemento dell'array allOutflowsIncomesArray
            allOutflowsIncomesArray.forEach((outerItem, index) => {
              // Cicla sugli elementi interni di outerItem
              outerItem.forEach((innerItem) => {
                // Aggiungi l'importo all'array corrispondente, a seconda se è un'entrata o una spesa
                if (innerItem.isExpense) {
                  outflowsArray[index] += innerItem.amount;
                } else {
                  incomesArray[index] += innerItem.amount;
                }
              });
            });

            // console.log('=== DEBUG UserContext ===');
            // console.log('allOutflowsIncomesArray length:', allOutflowsIncomesArray.length);
            // console.log('Mese corrente (0):', allOutflowsIncomesArray[0]?.length, 'transazioni');
            // console.log('Mese precedente (1):', allOutflowsIncomesArray[1]?.length, 'transazioni');
            // console.log('Somma delle entrate per ciascun mese:', incomesArray);
            // console.log('Somma delle spese per ciascun mese:', outflowsArray);
            // console.log('=========================');

            // qua potrei aggiungere un controllo che se non ci sono spese ed entrate del mese corrente, allora prendo i dati del mese precedente
            // const lastOutflows = allOutflowsIncomesArray[0].filter(data => data.isExpense);
            // const lastIncomes = allOutflowsIncomesArray[0].filter(data => !data.isExpense);
            const allOutflows = allOutflowsIncomesArray.map(monthData => monthData.filter(data => data.isExpense));
            const allIncomes = allOutflowsIncomesArray.map(monthData => monthData.filter(data => !data.isExpense));

            // let count = 1;
            // Print to test the amount of the expenses
            // lastExpenses.forEach(expense => {
            //   console.log("Spesa n-",count, expense.amount);
            //   count ++;
            // });

            // count = 1;
            // // Print to test the amount of the incomes
            // lastIncomes.forEach(income => {
            //   console.log("Entrata n-",count, income.amount, " Categoria: ", income.categoryTag);
            //   count ++;
            // });


            //************************************* PROCESSED DATA **********************************************/
            
            // Add formatted month strings to balance data for charts (last 12 months)
            const last12MonthsData = balancesData.slice(0, 12).reverse().map((monthData, i) => {
                const monthOffset = 11 - i;
                const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthOffset, 1);
                const monthString = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
                
                return {
                    ...monthData.balance,
                    month: monthString,
                    date: monthData.date
                };
            });

            //************************************* RANKING **********************************************/

            const rankOnBalance = await axios.post('/rank/balances', null, { withCredentials: true });
            const rankOnIncome = await axios.post('/rank/expenses', {expenses: false}, { withCredentials: true });
            const rankOnExpense = await axios.post('/rank/expenses', {expenses: true}, { withCredentials: true });

            const rankOnBalanceSimilar = await axios.post('/rank/balances', {similar: true}, { withCredentials: true } );
            const rankOnIncomeSimilar = await axios.post('/rank/expenses', {expenses: false, similar: true}, { withCredentials: true } );
            const rankOnExpenseSimilar = await axios.post('/rank/expenses', {expenses: true, similar: true}, { withCredentials: true });

            const percentageRankOnBalance = parseInt((rankOnBalance.data.position / rankOnBalance.data.total) * 100);
            const percentageRankOnIncomes = parseInt((rankOnIncome.data.position / rankOnIncome.data.total) * 100);
            const percentageRankOnExpenses = parseInt((rankOnExpense.data.position / rankOnExpense.data.total) * 100);

            const percentageRankOnBalanceSimilar = parseInt((rankOnBalanceSimilar.data.position / rankOnBalanceSimilar.data.total) * 100);
            const percentageRankOnIncomesSimilar = parseInt((rankOnIncomeSimilar.data.position / rankOnIncomeSimilar.data.total) * 100);
            const percentageRankOnExpensesSimilar = parseInt((rankOnExpenseSimilar.data.position / rankOnExpenseSimilar.data.total) * 100);


            // console.log('rankOnBalance:', rankOnBalance);
            // console.log('percentageRankOnBalance:', percentageRankOnBalance);
            // console.log('rankOnIncome:', rankOnIncome);
            // console.log('percentageRankOnIncome:', percentageRankOnIncomes);
            // console.log('rankOnExpense:', rankOnExpense);
            // console.log('percentageRankOnExpense:', percentageRankOnExpenses);

            //************************************* STATS AVERAGES **********************************************/
            
            // Try to fetch stats averages - endpoint may not be available in production yet
            let averages = {
              all: { balances: null, expenses: null, incomes: null, savingsRates: null, expensesByCategory: null },
              similar: { balances: null, expenses: null, incomes: null, savingsRates: null, expensesByCategory: null }
            };
            
            try {
              const statsAveragesResponse = await axios.post('/stats/averages', null, { withCredentials: true });
              const statsAveragesData = statsAveragesResponse.data;
              
              averages = {
                all: {
                  balances: statsAveragesData.all?.balances ?? statsAveragesData.general?.balances ?? null,
                  expenses: statsAveragesData.all?.expenses ?? statsAveragesData.general?.expenses ?? null,
                  incomes: statsAveragesData.all?.incomes ?? statsAveragesData.general?.incomes ?? null,
                  savingsRates: statsAveragesData.all?.savingsRates ?? null,
                  expensesByCategory: statsAveragesData.all?.expensesByCategory ?? null
                },
                similar: {
                  balances: statsAveragesData.similar?.balances ?? null,
                  expenses: statsAveragesData.similar?.expenses ?? null,
                  incomes: statsAveragesData.similar?.incomes ?? null,
                  savingsRates: statsAveragesData.similar?.savingsRates ?? null,
                  expensesByCategory: statsAveragesData.similar?.expensesByCategory ?? null
                }
              };
            } catch (statsError) {
              // Endpoint not available yet - silently use default null values
              console.debug('/stats/averages endpoint not available, using defaults');
            }

            // Create assets array for Financial Insights from current balance
            const currentBalance = balancesData[0]?.balance || {};
            const assets = [
              { typology: 'cash', value: currentBalance.cash || 0 },
              { typology: 'bank', value: currentBalance.bank || 0 },
              { typology: 'digitalServices', value: currentBalance.digitalServices || 0 },
              { typology: 'stocks', value: currentBalance.stocks || 0 },
              { typology: 'etf', value: currentBalance.etf || 0 },
              { typology: 'bitcoin', value: currentBalance.bitcoin || 0 },
              { typology: 'crypto', value: currentBalance.crypto || 0 },
              { typology: 'bonds', value: currentBalance.bonds || 0 },
              { typology: 'funds', value: currentBalance.funds || 0 },
              { typology: 'gold', value: currentBalance.gold || 0 }
            ].filter(asset => asset.value > 0);

            //************************************* USER DATA UPDATE **********************************************/
            
            // Simplified user data with organized structure
            setUserData({
              // Core user info
              userId, userType, username,
              
              // Profile completion percentage
              profileCompletionPercentage,
              
              // User profile data with structured objects
              profile: {
                nationality: userNationality,
                whereWorks: userWhereWorks,
                job: userJob,
                jobType: userJobType,
                workTime: userWorkTime,
                remoteType: userRemoteType,
                age: userAge,
                livingSituation: userLivingSituation,
                housingType: userHousingType,
                children: userChildren,
                yearsOfExperience: userYearsOfExperience,
                completionPercentage: profileCompletionPercentage
              },
              
              // All balance data in structured format
              balances: balancesData,
              
              // Chart data (derived from balances but formatted for UI)
              last12MonthsData,
              
              // Expense and income data
              expenses: {
                allOutflows,
                outflowsArray,
                totalOutflowsPerCategoryPerMonth
              },
              
              incomes: {
                allIncomes,
                incomesArray
              },
              
              // Tags for dropdowns/categories
              tags: {
                outflowsTags,
                incomesTags,
                paymentTags,
                nationalityTags,
                jobTags,
                jobTypeTags,
                workTimeTags,
                remoteTypeTags,
                ageTags,
                livingSituationTags,
                housingTypeTags,
                childrenTags,
                yearsOfExperienceTags
              },
              
              // Ranking data
              rankings: {
                balance: percentageRankOnBalance,
                incomes: percentageRankOnIncomes,
                expenses: percentageRankOnExpenses,
                balanceSimilar: percentageRankOnBalanceSimilar,
                incomesSimilar: percentageRankOnIncomesSimilar,
                expensesSimilar: percentageRankOnExpensesSimilar
              },
              
              // Date references
              dates: {
                current: currentDate,
                preMonth: preMonthDate,
                preYearSameMonth: preYearSameMonthDate
              },
              
              // Goals, limits and assets for Financial Insights
              goals,
              limits,
              assets,
              
              // Stats averages for comparison page
              averages
            });
            handleSetIsUpdated(true);
        }
      } catch (error) {
        console.error('Errore durante le richieste API:', error);
        // if (!isDevelopment) {
        //   setIsAuthenticated(false);
        //   setUserData(null);
        // }
      }
    };
    fetchUserData();
  }, [isAuthenticated, isUpdated]);

  const handleSetIsAuthenticated = (value) => {
    setIsAuthenticated(value);
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
      isLoading 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export { UserContext };