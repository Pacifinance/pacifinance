import React, { useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { PrivacyContext } from '../contexts/PrivacyContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import { useScrollNavigation } from '../hooks/useScrollNavigation';
import ScrollNavigationIndicator from '../components/ScrollNavigationIndicator';
import SEOHead from '../components/SEOHead';
import Sidebar from '../sections/Sidebar';
import Dashboard from '../sections/Dashboard';
import { CustomTick } from '../utils/chartsLegends';

const DashboardPage = () => {
    const auth = useAuth();
    const { userData, handleSetIsUpdated, handleSetIsAuthenticated } = auth;
    const { isHidden } = useContext(PrivacyContext);
    const { theme } = useContext(ThemeContext);
    const { language } = useContext(LanguageContext);
    const { isMobileScreen } = useContext(MediaQueryContext);
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
    } = useScrollNavigation(true);    const handlePageClick = (pageIndex) => {
        const pages = ['/dashboard', '/charts-statistics', '/insert-values', '/comparison'];
        if (pageIndex >= 0 && pageIndex < pages.length) {
            window.location.href = pages[pageIndex];
        }
    };

    if (!userData) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                color: theme === 'dark' ? 'white' : 'black'
            }}>
                Loading dashboard data...
            </div>
        );
    }

    return (
            <>
                <SEOHead 
                    title={language === 'it' ? 'Dashboard | PaciFinance' : 'Dashboard | PaciFinance'}
                    description={language === 'it' ? 'Gestisci e monitora il tuo patrimonio finanziario con la dashboard di PaciFinance.' : 'Manage and monitor your financial portfolio with PaciFinance dashboard.'}
                    noindex={true}
                />
                <Sidebar 
                userData={userData} 
                handleSetIsUpdated={handleSetIsUpdated} 
                handleSetIsAuthenticated={handleSetIsAuthenticated} 
            />
            
            <Dashboard 
                theme={theme}
                userData={userData}
                isHidden={isHidden}
                CustomTick={CustomTick}
            />
            
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
                navigateManually={navigateManually}
                isAutoScrolling={isAutoScrolling}
            />
        </>
    );
};

export default DashboardPage;
