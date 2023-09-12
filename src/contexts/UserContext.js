import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = React.createContext();

function UserProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false); //this is used to force a re-render of the page when the user adds new data


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        //check if user is authenticated
        if (isAuthenticated && !isUpdated) { // && !isUpdated
            console.log('Sono loggato e ora faccio le chiamate API in UserContext.js')

            //GET DATES
            const currentDate = new Date(Date.now()); //current date in UTC format

            //get the date of the previous month
            const preMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());

            // const minusTwoMonthsDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, currentDate.getDate());

            // const minusThreeMonthsDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, currentDate.getDate());

            // const minusFourMonthsDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 4, currentDate.getDate());

            // const minusFiveMonthsDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, currentDate.getDate());

            // const minusSixMonthsDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, currentDate.getDate());

            // const minusSevenMonthsDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 7, currentDate.getDate());

            const minusEightMonthsDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 8, currentDate.getDate());

            const minusNineMonthsDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 9, currentDate.getDate());

            // const minusTenMonthsDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 10, currentDate.getDate());

            const minusElevenMonthsDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 11, currentDate.getDate());
            console.log('minusEightMonthsDate', minusEightMonthsDate);
            console.log('minusNineMonthsDate', minusNineMonthsDate);
            console.log('minusElevenMonthsDate', minusElevenMonthsDate);



            //get the date of the current month of the previous year
            const preYearSameMonthDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
            

            //CALL API TO GET DATA
            const balancesResponse = await axios.post('/balances/get');
            // const allExpensesIncomes = await axios.post('/expenses/get'); //maybe without a date parameter it returns all the data
            const expensesIncomesResponse = await axios.post('/expenses/get', {date: currentDate}); //this will be used also to display the expenses and incomes of the current month and i will add a button "load more per i mesi precedenti"
            const expensesIncomesPreMonthResponse = await axios.post('/expenses/get', {date: preMonthDate});

            const expensesIncomesPreYearSameMonthResponse = await axios.post('/expenses/get', {date: preYearSameMonthDate});
            const allTags  = await axios.post('/tags/get');
            const expensesTags = allTags.data.expense;
            const incomesTags = allTags.data.income;
            const paymentTags = allTags.data.payment;
            console.log('Array completo di risposta: ', balancesResponse.data);
            console.log('Tutte le tags disponibili: ', allTags);
            console.log('Tags spese: ', expensesTags);
            console.log('Tags entrate: ', incomesTags);
            console.log('Tags pagamenti: ', paymentTags);
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
            const expensesIncomes = expensesIncomesResponse.data || [];
            const expensesIncomesPreMonth = expensesIncomesPreMonthResponse.data || [];
            const expensesIncomesPreYearSameMonth = expensesIncomesPreYearSameMonthResponse.data || [];


            console.log('balances:', balances);
            console.log('balancesPreMonth:', balancesPreMonth);
            console.log('balancesPreYearSameMonth:', balancesPreYearSameMonth);
            console.log('expenses:', expensesIncomes);
            console.log('expensesPreMonth:', expensesIncomesPreMonth);
            console.log('expensesPreYearSameMonth:', expensesIncomesPreYearSameMonth);
            console.log('expensesIncomesResponse:', expensesIncomesResponse);
            console.log('expensesIncomes:', expensesIncomes);

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


            //Set the variable with all expense and one with all income to list them in the insert page (TODO)
            // var lastExpenses = [];
            // var lastIncomes = [];

            //The structure must be like this:
            // const newExpenseAdd = {
            //   categoryExpense,
            //   typoExpense,
            //   expense,
            //   expenseDate,
            // };


            // expensesIncomes.forEach((data) => { //.data is an array of objects, so we can use forEach
            //             if (data.isExpense) {
            //                 lastExpenses.push(data);
            //             }
            //             else {
            //                 lastIncomes.push(data);
            //             }
            // });

            const lastExpenses = expensesIncomes.filter(data => data.isExpense);
            const lastIncomes = expensesIncomes.filter(data => !data.isExpense);

            let count = 1;
            // Print to test the amount of the expenses
            lastExpenses.forEach(expense => {
              console.log("Spesa n-",count, expense.amount);
              count ++;
            });

            count = 1;
            // Print to test the amount of the incomes
            lastIncomes.forEach(income => {
              console.log("Entrata n-",count, income.amount, " Categoria: ", income.categoryTag);
              count ++;
            });

            //Set the variables for expenses and incomes of the current month, previous month and previous year same month
            var expensesMonth = 0;
            var incomesMonth = 0;
            var expensesPreMonth = 0;
            var incomesPreMonth = 0;
            var expensesPreYearSameMonth = 0;
            var incomesPreYearSameMonth = 0;

            //EXPENSES AND INCOMES OF THE CURRENT MONTH
            expensesIncomes.forEach((data) => { //.data is an array of objects, so we can use forEach
                        if (data.isExpense) {
                            expensesMonth += data.amount;
                        } else {
                            incomesMonth += data.amount;
                        }
            });
            const savedMonth = incomesMonth - expensesMonth;
            
            //EXPENSES AND INCOMES OF THE PREVIOUS MONTH
            expensesIncomesPreMonth.forEach((data) => { 
                        if (data.isExpense) {
                            expensesPreMonth += data.amount;
                        } else {
                            incomesPreMonth += data.amount;
                        }
            });
            const savedPreMonth = incomesPreMonth - expensesPreMonth;

            //EXPENSES AND INCOMES OF THE PREVIOUS YEAR SAME MONTH
            expensesIncomesPreYearSameMonth.forEach((data) => { 
                        if (data.isExpense) {
                            expensesPreYearSameMonth += data.amount;
                        } else {
                            incomesPreYearSameMonth += data.amount;
                        }
            });
            const savedPreYearSameMonth = incomesPreYearSameMonth - expensesPreYearSameMonth;


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

            // Aggiorna i dati dell'utente nel contesto con i risultati delle chiamate API
            setUserData({ balances, balancesPreMonth, balancesPreYearSameMonth, expensesIncomes, expensesTags, incomesTags, paymentTags, expensesIncomesPreMonth, expensesIncomesPreYearSameMonth, cashReal, bankReal, digitalServicesReal, stocksReal, etfReal, bitcoinReal, cryptoReal, totalReal, cashRealPreMonth, bankRealPreMonth, digitalServicesRealPreMonth, stocksRealPreMonth, etfRealPreMonth, bitcoinRealPreMonth, cryptoRealPreMonth, totalRealPreMonth, cashRealPreYearSameMonth, bankRealPreYearSameMonth, digitalServicesRealPreYearSameMonth, stocksRealPreYearSameMonth, etfRealPreYearSameMonth, bitcoinRealPreYearSameMonth, cryptoRealPreYearSameMonth, totalRealPreYearSameMonth, expensesMonth, incomesMonth, savedMonth,  expensesPreMonth, incomesPreMonth, savedPreMonth, expensesPreYearSameMonth, incomesPreYearSameMonth, savedPreYearSameMonth, currentDate, preMonthDate, preYearSameMonthDate, last12MonthsData, lastExpenses, lastIncomes});
            handleSetIsUpdated(true);
        }
      } catch (error) {
        console.error('Errore durante le richieste API:', error);
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

  return (
    <UserContext.Provider value={{ userData, setUserData, isAuthenticated, isUpdated, handleSetIsAuthenticated, handleSetIsUpdated }}>
      {children}
    </UserContext.Provider>
  );
}

export { UserContext, UserProvider };
