import React, {useContext} from 'react';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { useAuth } from '../hooks/useAuth';
import { ThemeContext } from '../contexts/ThemeContext';
import { PrivacyContext } from '../contexts/PrivacyContext';
import { LanguageContext } from '../contexts/LanguageContext';
import styled from 'styled-components';
import Sidebar from '../sections/Sidebar';
import StatsCharts from '../sections/StatsCharts';
import SEOHead from '../components/SEOHead';
import ScrollNavigationIndicator from '../components/ScrollNavigationIndicator';
import { useScrollNavigation } from '../hooks/useScrollNavigation';
import { StandardPageTitle } from '../styles/MyStyled';

function StatsChartsPage() {
  const { theme } = useContext(ThemeContext);
  const auth = useAuth();
  const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = auth;
  useContext(PrivacyContext);
  const { language } = useContext(LanguageContext);
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

  // Gestisce il click sui punti di navigazione
  const handlePageClick = (pageIndex) => {
    const pages = ['/dashboard', '/charts-statistics', '/insert-values', '/comparison'];
    navigate(pages[pageIndex]);
  };

  return (
    <Div>
      <SEOHead 
        title={language === 'it' ? 'Grafici e Statistiche | Pacifinance' : 'Charts & Statistics | Pacifinance'}
        description={language === 'it' ? 'Visualizza grafici dettagliati e statistiche delle tue finanze personali su Pacifinance.' : 'View detailed charts and statistics of your personal finances on Pacifinance.'}
        noindex={true}
      />
      <Sidebar userData={userData} handleSetIsUpdated={handleSetIsUpdated} handleSetIsAuthenticated={handleSetIsAuthenticated} />
      <StatsCharts />
      
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
    </Div>
  );
}

export default StatsChartsPage;

const Div = styled.div `
  position: relative;
`;

const MobileOffset = styled.div`
  @media (max-width: 768px) {
    padding-top: 80px;
  }
`;

const ContentWrapper = styled.div `
  background-color: ${(props) => props.theme.backgroundColor};
  min-height: 100vh;
  margin-left: 0;
  margin-top: 80px;
  padding: 0;
  width: 100%;

  @media (min-width: 768px) {
    margin-left: 5.5rem;
    margin-top: 0;
    width: calc(100% - 5.5rem);
  }
`;
