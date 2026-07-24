import React, {useEffect, useContext, useState} from 'react';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { useAuth } from '../hooks/useAuth';
import { ThemeContext } from '../contexts/ThemeContext';
import { PageWrapper } from '../styles/MyStyled';
import { PrivacyContext } from '../contexts/PrivacyContext';
import Sidebar from '../sections/Sidebar';
import InsertValues from '../sections/InsertValues.tsx';
import ScrollNavigationIndicator from '../components/ScrollNavigationIndicator';
import { useScrollNavigation } from '../hooks/useScrollNavigation';

function InsertPage() {
  const { theme } = useContext(ThemeContext);
  const { isHidden } = useContext(PrivacyContext);
  const auth = useAuth();
  const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = auth;
  const [isMobileScreen, setIsMobileScreen] = useState(window.innerWidth <= 768);
  const navigate = useLocalizedNavigate();

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

  useEffect(() => {
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
        width: isMobileScreen ? '100%' : 'calc(100% - 5.5rem)',
        maxWidth: '100vw',
        minHeight: '150vh',
        paddingBottom: '60vh',
        backgroundColor: theme.backgroundColor,
        overflowX: 'hidden',
        boxSizing: 'border-box'
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
