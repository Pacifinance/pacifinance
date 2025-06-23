

import React, {useEffect, useContext, useState} from 'react';
import { UserContext } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { PrivacyContext } from '../contexts/PrivacyContext';
import styled from 'styled-components';
import Sidebar from '../sections/Sidebar';
import Comparison from '../sections/Comparison';

function ComparisonPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = useContext(UserContext);
  const { isHidden, toggleHidden } = useContext(PrivacyContext);
  const { mode } = theme;
  const [isMobileScreen, setIsMobileScreen] = useState(window.innerWidth <= 768);

  // Chiamata per caricare i dati dell'utente
  const loadUserData = () => {
    handleSetIsUpdated(false); // Forza il re-render di UserProvider
  };

  useEffect(() => {
    loadUserData(); // Chiamata iniziale per caricare i dati dell'utente al caricamento della pagina
    
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated} />
      <div style={{ 
        marginLeft: isMobileScreen ? '0' : '5.5rem', 
        paddingTop: isMobileScreen ? '70px' : '0',
        width: '100%' 
      }}>
        <Comparison theme={theme} userData={userData} handleSetIsUpdated={handleSetIsUpdated} isHidden={isHidden}/>
      </div>
    </div>
  );
}

export default ComparisonPage;

const Div = styled.div`
  position: relative;
`;

