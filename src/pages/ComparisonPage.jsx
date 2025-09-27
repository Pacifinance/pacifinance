
import React, {useEffect, useContext, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ThemeContext } from '../contexts/ThemeContext';
import { PrivacyContext } from '../contexts/PrivacyContext';
import styled from 'styled-components';
import Sidebar from '../sections/Sidebar';
import Comparison from '../sections/Comparison';
import ScrollNavigationIndicator from '../components/ScrollNavigationIndicator';
import { useScrollNavigation } from '../hooks/useScrollNavigation';

function ComparisonPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const auth = useAuth();
  const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = auth;
  const { isHidden, toggleHidden } = useContext(PrivacyContext);
  const { mode } = theme;
  const [isMobileScreen, setIsMobileScreen] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  // Hook per la navigazione con scroll
  const { 
    isNavigating,
    isLoading,
    loadingDirection,
    loadingProgress,
    pageHasScrollableContent,
    currentPageIndex, 
    totalPages, 
    nextPage, 
    prevPage,
    cancelLoading,
    isAutoScrolling
  } = useScrollNavigation(true);

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

  // Gestisce il click sui punti di navigazione
  const handlePageClick = (pageIndex) => {
    const pages = ['/dashboard', '/charts-statistics', '/insert-values', '/comparison'];
    navigate(pages[pageIndex]);
  };

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
      
      <ScrollNavigationIndicator
        theme={theme}
        isNavigating={isNavigating}
        isLoading={isLoading}
        loadingDirection={loadingDirection}
        loadingProgress={loadingProgress}
        pageHasScrollableContent={pageHasScrollableContent}
        currentPageIndex={currentPageIndex}
        totalPages={totalPages}
        nextPage={nextPage}
        prevPage={prevPage}
        onPageClick={handlePageClick}
        cancelLoading={cancelLoading}
        isAutoScrolling={isAutoScrolling}
      />
    </div>
  );
}

export default ComparisonPage;

const Div = styled.div`
  position: relative;
`;

