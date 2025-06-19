import React, {useEffect, useContext} from 'react';
import { UserContext } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { PrivacyContext } from '../contexts/PrivacyContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import styled from 'styled-components';
import Sidebar from '../sections/Sidebar';
import Knowledge from '../sections/Knowledge';

function KnowledgePage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = useContext(UserContext);
  const { isHidden, toggleHidden } = useContext(PrivacyContext);
  const { isMobileScreen } = useContext(MediaQueryContext);

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
      {!isMobileScreen && <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated} />}
      <Knowledge />
      {isMobileScreen && <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated} />}
    </Div>
  );
}

export default KnowledgePage;
const Div = styled.div `
  display: flex;
  height: 100vh;
`;