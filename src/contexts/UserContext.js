import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = React.createContext();

function UserProvider({ children }) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Esegui le tue chiamate API per ottenere tutti i dati utili dell'utente
        const balancesResponse = await axios.post('/balances/get');
        const expensesResponse = await axios.post('/expenses/get');

        const balances = balancesResponse.data;
        const expenses = expensesResponse.data;

        // Aggiorna i dati dell'utente nel contesto con i risultati delle chiamate API
        setUserData({ balances, expenses });
      } catch (error) {
        console.error('Errore durante le richieste API:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={userData}>
      {children}
    </UserContext.Provider>
  );
}

export { UserContext, UserProvider };
