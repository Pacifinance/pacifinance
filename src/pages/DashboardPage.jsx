import React, {useEffect, useContext} from 'react';
import { UserContext } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { PrivacyContext } from '../contexts/PrivacyContext';
import styled from 'styled-components';
import Sidebar from '../sections/Sidebar';
import Dashboard from '../sections/Dashboard';
import { CustomTick } from '../utils/customGraphsInfo';

function DashboardPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = useContext(UserContext);
  const { isHidden, toggleHidden } = useContext(PrivacyContext);
  const { mode } = theme;

  // Chiamata per caricare i dati dell'utente
  const loadUserData = () => {
    handleSetIsUpdated(false); // Forza il re-render di UserProvider
  };

  useEffect(() => {
    loadUserData(); // Chiamata iniziale per caricare i dati dell'utente al caricamento della pagina
  }, []);

  

  return (
    <Div>
      <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated} />
      <Dashboard theme={theme} userData={userData} isHidden={isHidden} CustomTick={CustomTick}/>
    </Div>
  );
}

export default DashboardPage;

const Div = styled.div `
  position: relative;
`;
