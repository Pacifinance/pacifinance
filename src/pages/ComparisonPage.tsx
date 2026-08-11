
import React, {useEffect, useContext, useState} from 'react';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { useAuth } from '../hooks/useAuth';
import { ThemeContext } from '../contexts/ThemeContext';
import { PrivacyContext } from '../contexts/PrivacyContext';
import { LanguageContext } from '../contexts/LanguageContext';
import styled from 'styled-components';
import Sidebar from '../sections/Sidebar';
import Comparison from '../sections/Comparison';
import ScrollNavigationIndicator from '../components/ScrollNavigationIndicator';
import SEOHead from '../components/SEOHead';
import { useScrollNavigation } from '../hooks/useScrollNavigation';

function ComparisonPage() {
  const { theme } = useContext(ThemeContext);
  const { language, translations } = useContext(LanguageContext);
  const auth = useAuth();
  const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = auth;
  const { isHidden } = useContext(PrivacyContext);
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
  } = useScrollNavigation(true);  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handles clicking a navigation dot
  const handlePageClick = (pageIndex) => {
    const pages = ['/dashboard', '/charts-statistics', '/insert-values', '/comparison'];
    navigate(pages[pageIndex]);
  };

  return (
    <>
      <SEOHead 
        title={`${translations.comparison.title} - Pacifinance`}
        description={`${translations.comparison.subtitle} - Confronta le tue finanze con utenti simili in modo anonimo e sicuro`}
        keywords="confronto finanziario, benchmark finanze personali, comparazione stipendi, analisi finanziaria, confronto budget"
        canonical="/comparison"
        language={language}
      />
      <div style={{ display: 'flex', height: '100vh' }}>
        <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated} />
        <div style={{ 
          marginLeft: isMobileScreen ? '0' : '5.5rem', 
          paddingTop: isMobileScreen ? '70px' : '0',
          width: '100%',
          backgroundColor: theme.backgroundColor,
          minHeight: '100vh'
        }}>
          <Comparison theme={theme} userData={userData} handleSetIsUpdated={handleSetIsUpdated} isHidden={isHidden}/>
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
    </>
  );
}

export default ComparisonPage;

const Div = styled.div`
  position: relative;
`;

