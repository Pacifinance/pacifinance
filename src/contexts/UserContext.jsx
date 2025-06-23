import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = React.createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isUpdated, setIsUpdated] = useState(false);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  // Development mode bypass
  // const isDevelopment = process.env.NODE_ENV === 'development' || 
  //                      window.location.hostname === 'localhost' || 
  //                      window.location.hostname.includes('replit.dev');

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
        //     expensesTags: ['Food', 'Transport', 'Entertainment'],
        //     incomesTags: ['Salary', 'Freelance', 'Investment'],
        //     paymentTags: ['Cash', 'Card', 'Transfer'],
        //     allExpenses: [],
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
            const expensesTags = allTags.data.expense;
            const incomesTags = allTags.data.income;
            const paymentTags = allTags.data.payment;
            const nationalityTags = allTags.data.country; //used also for the country where the user works
            const jobTags = allTags.data.job;
            const jobTypeTags = allTags.data.jobType;
            const workTimeTags = allTags.data.workTime;
            const remoteTypeTags = allTags.data.remoteType;

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
            const userNationality = {key: infoUser.data.country?.index ?? -1, value: infoUser.data.country?.translations?.it ?? 'Nazionalità non impostata'};
            const userWhereWorks = {key: infoUser.data.jobCountry?.index ?? -1 ,value: infoUser.data.jobCountry?.translations?.it ?? 'Dove lavora non impostato'};
            const userJob = {key: infoUser.data.job?.index ?? -1, value: infoUser.data.job?.translations?.it ?? 'Lavoro non impostato'};
            const userJobType = {key: infoUser.data.jobType?.index ?? -1, value: infoUser.data.jobType?.translations?.it ?? 'Tipo di lavoro non impostato'};
            const userWorkTime = {key: infoUser.data.workTime?.index ?? -1, value: infoUser.data.workTime?.translations?.it ?? 'Tipologia contratto non impostato'};
            const userRemoteType = {key: infoUser.data.remoteType?.index ?? -1, value: infoUser.data.remoteType?.translations?.it ?? 'Tipologia lavoro non impostata'};




            //************************************* BALANCES **********************************************/

            const balancesResponse = await axios.post('/balances/get', null, { withCredentials: true });
            // console.log('Array completo di risposta BALANCE: ', balancesResponse.data);

            //GET DATA FROM RESPONSES
            var balances = {};
            //add a control to check if the user has data in this month and previous month
            const currentMonthBalances = balancesResponse.data[0]?.balance;
            if (currentMonthBalances && Object.keys(currentMonthBalances).length > 0) {
              // Use the balances for the current month
              balances = currentMonthBalances;
            } else {
              // with a cycle check and use the balances of the first month that has data from the previous month (balancesResponse.data[1]?.balance) to the older month (balancesResponse.data[23]?.balance)
                for (let i = 1; i <= 23; i++) {
                  balances = balancesResponse.data[i]?.balance;
                  if (balances && Object.keys(balances).length > 0) {
                    break;
                  }
                }    
            } 

            const balancesPreMonth = (balancesResponse.data[1] || 0).balance || 0;  //Using ?? 0, if the value is undefined or empty, set it to 0
            const balancesPreYearSameMonth = (balancesResponse.data[12] || 0).balance || 0;      

            //************************************* CASH **********************************************/

            const cashReal = balances.cash || 0;
            const bankReal = balances.bank || 0;
            const digitalServicesReal = balances.digitalServices || 0;
            const stocksReal = (balances.stocks || 0).real || 0; //if stocks is undefined, set it to 0
            const etfReal = (balances.etf || 0).real || 0;
            const bitcoinReal = (balances.bitcoin || 0).real || 0;
            const cryptoReal = (balances.crypto || 0).real || 0;
            const totalReal = cashReal + bankReal + digitalServicesReal + stocksReal + etfReal + bitcoinReal + cryptoReal;

            const cashRealPreMonth = balancesPreMonth.cash || 0;
            const bankRealPreMonth = balancesPreMonth.bank || 0;
            const digitalServicesRealPreMonth = balancesPreMonth.digitalServices || 0;
            const stocksRealPreMonth = (balancesPreMonth.stocks || 0).real || 0; //if stocks is undefined, set it to 0
            const etfRealPreMonth = (balancesPreMonth.etf || 0).real || 0;
            const bitcoinRealPreMonth = (balancesPreMonth.bitcoin || 0).real || 0;
            const cryptoRealPreMonth = (balancesPreMonth.crypto || 0).real || 0;
            const totalRealPreMonth = cashRealPreMonth + bankRealPreMonth + digitalServicesRealPreMonth + stocksRealPreMonth + etfRealPreMonth + bitcoinRealPreMonth + cryptoRealPreMonth;

            const cashRealPreYearSameMonth = balancesPreYearSameMonth.cash || 0;
            const bankRealPreYearSameMonth = balancesPreYearSameMonth.bank || 0;
            const digitalServicesRealPreYearSameMonth = balancesPreYearSameMonth.digitalServices || 0;
            const stocksRealPreYearSameMonth = (balancesPreYearSameMonth.stocks || 0).real || 0; //if stocks is undefined, set it to 0
            const etfRealPreYearSameMonth = (balancesPreYearSameMonth.etf || 0).real || 0;
            const bitcoinRealPreYearSameMonth = (balancesPreYearSameMonth.bitcoin || 0).real || 0;
            const cryptoRealPreYearSameMonth = (balancesPreYearSameMonth.crypto || 0).real || 0;
            const totalRealPreYearSameMonth = cashRealPreYearSameMonth + bankRealPreYearSameMonth + digitalServicesRealPreYearSameMonth + stocksRealPreYearSameMonth + etfRealPreYearSameMonth + bitcoinRealPreYearSameMonth + cryptoRealPreYearSameMonth;
            //************************************* EXPENSES AND INCOMES **********************************************/

            const allExpensesIncomesResponse = await axios.post('/expenses/get', null, { withCredentials: true }); //get all expenses and incomes
            // console.log('Response completa  SPESE e GUADAGNI: ', allExpensesIncomesResponse);

            const allExpensesIncomesArray = allExpensesIncomesResponse.data;

            // console.log('Array completo SPESE e GUADAGNI: ', allExpensesIncomesArray[0]);

            // Assuming you have access to allExpensesIncomesArray as described in your code

            // Initialize an empty object to hold the total expenses per category for each month
            let totalExpensesPerCategoryPerMonth = {};

            // Iterate through each month in allExpensesIncomesArray
            allExpensesIncomesArray.forEach((month, index) => {
              // Initialize an empty object to hold the total expenses per category for the current month
              let totalExpensesPerCategory = {};

              // Iterate through each entry in the current month
              month.forEach((entry) => {
                // Check if the entry is an expense
                if (entry.isExpense) {
                  // If the category exists, add the current value
                  if (totalExpensesPerCategory[entry.categoryTag.translations.en]) {
                    totalExpensesPerCategory[entry.categoryTag.translations.en] += entry.amount;
                  } else {
                    // Otherwise, initialize the category with the current value
                    totalExpensesPerCategory[entry.categoryTag.translations.en] = entry.amount;
                  }
                }
              });

              // Save the total expenses per category for the current month
              totalExpensesPerCategoryPerMonth[index] = totalExpensesPerCategory;
            });

            // Now totalExpensesPerCategoryPerMonth contains the total expenses for each category for each month
            // console.log(totalExpensesPerCategoryPerMonth);


            // Crea un array di oggetti per le entrate e un array di oggetti per le spese, inizializzati con valori iniziali a 0
            const incomesArray = Array(13).fill(0);
            const expensesArray = Array(13).fill(0);

            // Itera su ciascun elemento dell'array allExpensesIncomesArray
            allExpensesIncomesArray.forEach((outerItem, index) => {
              // Cicla sugli elementi interni di outerItem
              outerItem.forEach((innerItem) => {
                // Aggiungi l'importo all'array corrispondente, a seconda se è un'entrata o una spesa
                if (innerItem.isExpense) {
                  expensesArray[index] += innerItem.amount;
                } else {
                  incomesArray[index] += innerItem.amount;
                }
              });
            });

            // console.log('Somma delle entrate per ciascun mese:', incomesArray);
            // console.log('Somma delle spese per ciascun mese:', expensesArray);

            // qua potrei aggiungere un controllo che se non ci sono spese ed entrate del mese corrente, allora prendo i dati del mese precedente
            // const lastExpenses = allExpensesIncomesArray[0].filter(data => data.isExpense);
            // const lastIncomes = allExpensesIncomesArray[0].filter(data => !data.isExpense);
            const allExpenses = allExpensesIncomesArray.map(monthData => monthData.filter(data => data.isExpense));
            const allIncomes = allExpensesIncomesArray.map(monthData => monthData.filter(data => !data.isExpense));

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


            //************************************* CHARTS **********************************************/
            //DATAS FOR THE CHARTS

            const last12MonthsData = [];

            // Loop per i 12 mesi precedenti
            for (let i = 0; i < 12; i++) {
              // Calcola il mese corrente (potrei prendere il mese dai dati dal db senza calcolarlo)
              const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
              const currentMonthAsString = currentMonth.toLocaleString('default', { month: 'long' });

              // Recupera il bilancio per il mese corrente (se disponibile, altrimenti imposta a 0)
              const currentMonthBalance = balancesResponse.data[i]?.balance ?? 0;

              const monthData = {
                month: currentMonthAsString,
                cashReal: currentMonthBalance.cash || 0,
                bankReal: currentMonthBalance.bank || 0,
                digitalServicesReal: currentMonthBalance.digitalServices || 0,
                stocksReal: (currentMonthBalance.stocks || 0).real || 0,
                etfReal: (currentMonthBalance.etf || 0).real || 0,
                bitcoinReal: (currentMonthBalance.bitcoin || 0).real || 0,
                cryptoReal: (currentMonthBalance.crypto || 0).real || 0
              };

              // Aggiungi l'oggetto all'array dei dati degli ultimi 12 mesi
              last12MonthsData.push(monthData);
            }

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

            // Aggiorna i dati dell'utente nel contesto con i risultati delle chiamate API
            setUserData({ balances, balancesPreMonth, balancesPreYearSameMonth, expensesTags, incomesTags, paymentTags, 
              cashReal, bankReal, digitalServicesReal, stocksReal, etfReal, bitcoinReal, cryptoReal, totalReal, cashRealPreMonth, 
              bankRealPreMonth, digitalServicesRealPreMonth, stocksRealPreMonth, etfRealPreMonth, bitcoinRealPreMonth, cryptoRealPreMonth, totalRealPreMonth, 
              cashRealPreYearSameMonth, bankRealPreYearSameMonth, digitalServicesRealPreYearSameMonth, stocksRealPreYearSameMonth, etfRealPreYearSameMonth, 
              bitcoinRealPreYearSameMonth, cryptoRealPreYearSameMonth, totalRealPreYearSameMonth, currentDate, preMonthDate, 
              preYearSameMonthDate, last12MonthsData, percentageRankOnBalance, expensesArray, incomesArray, allExpenses, allIncomes, percentageRankOnIncomes, percentageRankOnExpenses, 
              percentageRankOnBalanceSimilar, percentageRankOnIncomesSimilar, percentageRankOnExpensesSimilar, totalExpensesPerCategoryPerMonth,
              userId, userType, username, userNationality, userWhereWorks, userJob, userJobType, userWorkTime, userRemoteType, nationalityTags, jobTags, jobTypeTags, workTimeTags, remoteTypeTags
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

  return (
    <UserContext.Provider value={{ userData, setUserData, isAuthenticated, isUpdated, handleSetIsAuthenticated, handleSetIsUpdated, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export { UserContext };