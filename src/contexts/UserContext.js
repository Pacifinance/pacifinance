import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = React.createContext();

function UserProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        //check if user is authenticated
        if (isAuthenticated) {
            console.log('Sono loggato e ora faccio le chiamate API in UserContext.js')
            // If the user is authenticated, make two API calls to get the user's balances and expenses
            const currentDate = new Date(Date.now()); //current date in UTC format
            const balancesResponse = await axios.post('/balances/get');
            const expensesResponse = await axios.post('/expenses/get', {date: currentDate});

            const balances = balancesResponse.data[0].balance;
            const expenses = expensesResponse.data;

            console.log('balances', balances);
            console.log('expenses', expenses);

            const cashReal = balances.cash;
            const bankReal = balances.bank;
            const digitalServicesReal = balances.digitalServices;
            const stocksReal = balances.stocks.real;
            const etfReal = balances.etf.real;
            const bitcoinReal = balances.bitcoin.real;
            const cryptoReal = balances.crypto.real;
            const totalReal = cashReal + bankReal + digitalServicesReal + stocksReal + etfReal + bitcoinReal + cryptoReal;
            var expensesMonth = 0;
            var incomesMonth = 0;
            expenses.forEach((expense) => { //.data is an array of objects, so we can use forEach
                        if (expense.isExpense) {
                            expensesMonth += expense.amount;
                        } else {
                            incomesMonth += expense.amount;
                        }
            });
            const savedMonth = incomesMonth - expensesMonth;

            

            // Aggiorna i dati dell'utente nel contesto con i risultati delle chiamate API
            setUserData({ balances, expenses, cashReal, bankReal, digitalServicesReal, stocksReal, etfReal, bitcoinReal, cryptoReal, totalReal, expensesMonth, incomesMonth, savedMonth });
        }
      } catch (error) {
        console.error('Errore durante le richieste API:', error);
      }
    };

    fetchUserData();
  }, [isAuthenticated]);

  const handleSetIsAuthenticated = (value) => {
    setIsAuthenticated(value);
  };

  return (
    <UserContext.Provider value={{ userData, setUserData, isAuthenticated, handleSetIsAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
}

export { UserContext, UserProvider };
