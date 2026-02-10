import React, { useContext, useState, useEffect } from 'react';
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
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';

const DashboardPage = () => {
    const auth = useAuth();
    const { userData, handleSetIsUpdated, handleSetIsAuthenticated, error, retryFetch } = auth;
    const { isHidden } = useContext(PrivacyContext);
    const { theme } = useContext(ThemeContext);
    const { language, translations } = useContext(LanguageContext);
    const { isMobileScreen } = useContext(MediaQueryContext);
    const navigate = useLocalizedNavigate();
    const [loadingTimeout, setLoadingTimeout] = useState(false);

    // Show retry after 15 seconds of loading without data
    useEffect(() => {
        if (!userData && !error) {
            const timer = setTimeout(() => setLoadingTimeout(true), 15000);
            return () => clearTimeout(timer);
        }
        setLoadingTimeout(false);
    }, [userData, error]);
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

    const handlePageClick = (pageIndex) => {
        const pages = ['/dashboard', '/charts-statistics', '/insert-values', '/comparison'];
        if (pageIndex >= 0 && pageIndex < pages.length) {
            navigate(pages[pageIndex]);
        }
    };

    if (!userData) {
        const themeTextColor = theme?.mode === 'dark' ? 'white' : 'black';
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                gap: '1rem',
                color: themeTextColor
            }}>
                {error || loadingTimeout ? (
                    <>
                        <p style={{ fontSize: '1.1rem', textAlign: 'center', padding: '0 1rem' }}>
                            {error 
                                ? (translations?.dashboard?.loadingError || 'Error loading data. Please try again.')
                                : (translations?.dashboard?.loadingTimeout || 'Loading is taking longer than expected...')
                            }
                        </p>
                        <button
                            onClick={() => {
                                setLoadingTimeout(false);
                                if (retryFetch) retryFetch();
                                else window.location.reload();
                            }}
                            style={{
                                padding: '0.7rem 1.5rem',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: '#079164',
                                color: 'white',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            {translations?.dashboard?.retry || 'Retry'}
                        </button>
                    </>
                ) : (
                    <>
                        <div style={{
                            width: '40px', height: '40px',
                            border: '3px solid rgba(7, 145, 100, 0.3)',
                            borderTopColor: '#079164',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite'
                        }} />
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        <p>{translations?.dashboard?.loading || 'Loading dashboard data...'}</p>
                    </>
                )}
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
