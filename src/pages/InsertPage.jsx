import React, {useEffect, useContext, useState} from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { useAuth } from '../hooks/useAuth';
import { ThemeContext } from '../contexts/ThemeContext';
import { PageWrapper } from '../styles/MyStyled';
import { PrivacyContext } from '../contexts/PrivacyContext';
import Sidebar from '../sections/Sidebar';
import InsertValues from '../sections/InsertValues';
import ScrollNavigationIndicator from '../components/ScrollNavigationIndicator';
import { useScrollNavigation } from '../hooks/useScrollNavigation';

function InsertPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { isHidden, toggleHidden } = useContext(PrivacyContext);
  const auth = useAuth();
  const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = auth;
  const [isMobileScreen, setIsMobileScreen] = useState(window.innerWidth <= 768);
  const { mode } = theme;
  const navigate = useLocalizedNavigate();
  const [searchParams] = useSearchParams();
  const [initialSection, setInitialSection] = useState(null);

  // Hook per la navigazione con scroll
  const { 
    isNavigating,
    showTriggerZone,
    triggerDirection,
    triggerProgress,
    pageHasScrollableContent,
    currentPageIndex, 
    totalPages, 
    nextPage, 
    prevPage,
    cancelTrigger,
    dismissTrigger,
    navigateManually,
    isAutoScrolling 
  } = useScrollNavigation(true);

  // Chiamata per caricare i dati dell'utente
  const loadUserData = () => {
    handleSetIsUpdated(false); // Forza il re-render di UserProvider
  };

  useEffect(() => {
    loadUserData(); // Chiamata iniziale per caricare i dati dell'utente al caricamento della pagina
    
    // Gestisce il parametro section dall'URL
    const section = searchParams.get('section');
    if (section) {
      setInitialSection(section);
    }
    
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [searchParams]);

  // Gestisce il click sui punti di navigazione
  const handlePageClick = (pageIndex) => {
    const pages = ['/dashboard', '/charts-statistics', '/insert-values', '/comparison'];
    navigate(pages[pageIndex]);
  };

  // Matomo Tag Manager
  // React.useEffect(() => {
  //   var _mtm = window._mtm = window._mtm || [];
  //   _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
  //   var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  //   g.async=true; g.src='https://cdn.matomo.cloud/pacifinance.matomo.cloud/container_geUS8Fsk.js'; s.parentNode.insertBefore(g,s);
  // }, [])

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated} />
      <div style={{ 
        marginLeft: isMobileScreen ? '0' : '5.5rem', 
        paddingTop: isMobileScreen ? '80px' : '0',
        width: '100%',
        minHeight: '150vh',
        paddingBottom: '60vh',
        backgroundColor: theme.backgroundColor
      }}>
        <InsertValues theme={theme} userData={userData} handleSetIsUpdated={handleSetIsUpdated} isHidden={isHidden}/>
      </div>
      
      <ScrollNavigationIndicator
        theme={theme}
        isNavigating={isNavigating}
        showTriggerZone={showTriggerZone}
        triggerDirection={triggerDirection}
        triggerProgress={triggerProgress}
        pageHasScrollableContent={pageHasScrollableContent}
        currentPageIndex={currentPageIndex}
        totalPages={totalPages}
        nextPage={nextPage}
        prevPage={prevPage}
        onPageClick={handlePageClick}
        cancelTrigger={cancelTrigger}
        dismissTrigger={dismissTrigger}
        navigateManually={navigateManually}
        isAutoScrolling={isAutoScrolling}
      />
    </div>
  );
}

export default InsertPage;
