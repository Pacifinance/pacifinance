import React, {useEffect, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { PrivacyContext } from '../contexts/PrivacyContext';
import { LanguageContext } from '../contexts/LanguageContext';
import styled from 'styled-components';
import Sidebar from '../sections/Sidebar';
import Dashboard from '../sections/Dashboard';
import SEOHead from '../components/SEOHead';
import ScrollNavigationIndicator from '../components/ScrollNavigationIndicator';
import { useScrollNavigation } from '../hooks/useScrollNavigation';
import { CustomTick } from '../utils/customGraphsInfo';

function DashboardPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = useContext(UserContext);
  const { isHidden, toggleHidden } = useContext(PrivacyContext);
  const { language } = useContext(LanguageContext);
  const { mode } = theme;
  const navigate = useNavigate();

  // Hook per la navigazione con scroll
  const { 
    isNavigating, 
    currentPageIndex, 
    totalPages, 
    nextPage, 
    prevPage 
  } = useScrollNavigation(true);

  // Chiamata per caricare i dati dell'utente
  const loadUserData = () => {
    handleSetIsUpdated(false); // Forza il re-render di UserProvider
  };

  useEffect(() => {
    loadUserData(); // Chiamata iniziale per caricare i dati dell'utente al caricamento della pagina
  }, []);

  // Gestisce il click sui punti di navigazione
  const handlePageClick = (pageIndex) => {
    const pages = ['/dashboard', '/charts-statistics', '/insert-values', '/comparison'];
    navigate(pages[pageIndex]);
  };

  

  return (
    <Div>
      <SEOHead 
        title={language === 'it' ? 'Dashboard | PaciFinance' : 'Dashboard | PaciFinance'}
        description={language === 'it' ? 'La tua dashboard personale per gestire finanze, bilanci e statistiche su PaciFinance.' : 'Your personal dashboard to manage finances, budgets and statistics on PaciFinance.'}
        noindex={true}
      />
      <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated} />
      <Dashboard theme={theme} userData={userData} isHidden={isHidden} CustomTick={CustomTick}/>
      
      <ScrollNavigationIndicator
        theme={theme}
        isNavigating={isNavigating}
        currentPageIndex={currentPageIndex}
        totalPages={totalPages}
        nextPage={nextPage}
        prevPage={prevPage}
        onPageClick={handlePageClick}
      />
    </Div>
  );
}

export default DashboardPage;

const Div = styled.div `
  position: relative;
`;
