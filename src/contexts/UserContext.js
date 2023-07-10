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

            const balances = balancesResponse.data[0];
            const expenses = expensesResponse.data;

            console.log('balances', balances);
            console.log('expenses', expenses);

            // Aggiorna i dati dell'utente nel contesto con i risultati delle chiamate API
            setUserData({ balances, expenses });
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
