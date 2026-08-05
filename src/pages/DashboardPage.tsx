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
    useContext(MediaQueryContext);
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
        const isDark = theme?.mode === 'dark';
        const bgColor = theme?.backgroundColor || (isDark ? '#222831' : '#f5f5f5');
        const textColor = theme?.textColor || (isDark ? '#e0e0e0' : '#333333');
        const subtextColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';
        const brandColor = theme?.secondaryColor || '#079164';

        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                width: '100%',
                gap: '1.5rem',
                backgroundColor: bgColor,
                color: textColor,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}>
                <style>{`
                    @keyframes dashSpin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(12px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 0.4; }
                        50% { opacity: 1; }
                    }
                `}</style>

                {error || loadingTimeout ? (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '0 1.5rem',
                        animation: 'fadeInUp 0.4s ease-out',
                        maxWidth: '400px',
                    }}>
                        <div style={{
                            width: '56px', height: '56px',
                            margin: '0 auto 1.25rem',
                            borderRadius: '50%',
                            backgroundColor: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                        }}>
                            ⚠️
                        </div>
                        <p style={{ 
                            fontSize: '1rem', 
                            lineHeight: '1.6',
                            color: textColor,
                            margin: '0 0 1.25rem',
                        }}>
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
                                padding: '0.65rem 2rem',
                                borderRadius: '10px',
                                border: 'none',
                                backgroundColor: brandColor,
                                color: 'white',
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                fontWeight: '600',
                                letterSpacing: '0.02em',
                                transition: 'transform 0.15s, box-shadow 0.15s',
                                boxShadow: `0 4px 14px rgba(7, 145, 100, 0.3)`,
                            }}
                            onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 6px 20px rgba(7, 145, 100, 0.4)'; }}
                            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 14px rgba(7, 145, 100, 0.3)'; }}
                        >
                            {translations?.dashboard?.retry || 'Retry'}
                        </button>
                    </div>
                ) : (
                    <div style={{ 
                        textAlign: 'center',
                        animation: 'fadeInUp 0.5s ease-out',
                    }}>
                        {/* Spinner */}
                        <div style={{
                            width: '44px', height: '44px',
                            margin: '0 auto 1.25rem',
                            border: `3px solid ${isDark ? 'rgba(7, 145, 100, 0.15)' : 'rgba(7, 145, 100, 0.2)'}`,
                            borderTopColor: brandColor,
                            borderRadius: '50%',
                            animation: 'dashSpin 0.8s linear infinite',
                        }} />
                        <p style={{ 
                            fontSize: '0.95rem', 
                            fontWeight: '500',
                            color: textColor,
                            margin: '0 0 0.35rem',
                        }}>
                            {translations?.dashboard?.loading || 'Loading dashboard data...'}
                        </p>
                        <p style={{
                            fontSize: '0.8rem',
                            color: subtextColor,
                            margin: 0,
                            animation: 'pulse 2s ease-in-out infinite',
                        }}>
                            Pacifinance
                        </p>
                    </div>
                )}
            </div>
        );
    }

    return (
            <>
                <SEOHead 
                    title={language === 'it' ? 'Dashboard | Pacifinance' : 'Dashboard | Pacifinance'}
                    description={language === 'it' ? 'Gestisci e monitora il tuo patrimonio finanziario con la dashboard di Pacifinance.' : 'Manage and monitor your financial portfolio with Pacifinance dashboard.'}
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
