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

    // Debug per verificare il cambio di stato della privacy
    console.log('DashboardPage - isHidden:', isHidden);
    console.log('DashboardPage - userData:', userData);
    console.log('DashboardPage - auth object:', auth);

    const {
        isNavigating,
        isLoading,
        loadingDirection,
        loadingProgress,
        pageHasScrollableContent,
        cancelLoading,
        isAutoScrolling
    } = useScrollNavigation([
        '/dashboard',
        '/charts-statistics',
        '/insert-values',
        '/comparison'
    ]);

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
                isLoading={isLoading}
                loadingDirection={loadingDirection}
                loadingProgress={loadingProgress}
                pageHasScrollableContent={pageHasScrollableContent}
                currentPageIndex={0}
                totalPages={4}
                cancelLoading={cancelLoading}
                isAutoScrolling={isAutoScrolling}
            />
        </>
    );
};

export default DashboardPage;
