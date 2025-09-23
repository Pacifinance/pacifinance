import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { PrivacyContext } from '../contexts/PrivacyContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { AuthContext } from '../contexts/AuthContext';
import SidebarDesktop from '../components/SidebarDesktop';
import SidebarMobile from '../components/SidebarMobile';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import useScrollNavigation from '../hooks/useScrollNavigation';
import ScrollNavigationIndicator from '../components/ScrollNavigationIndicator';
import NewDashboard from '../sections/NewDashboard';
import { CustomTick } from '../utils/chartsLegends';

const DashboardPage = () => {
    const { user } = useContext(AuthContext);
    const { userData } = useContext(UserContext);
    const { isPrivacyMode } = useContext(PrivacyContext);
    const { theme } = useContext(ThemeContext);
    const { isMobileScreen } = useContext(MediaQueryContext);

    const {
        isLoading: isScrollLoading,
        bottomLoadingActive,
        pageHasScrollableContent
    } = useScrollNavigation({ 
        pageRoutes: [
            '/dashboard',
            '/balances',
            '/insert-values',
            '/analytics',
            '/settings'
        ],
        currentPageIndex: 0,
        disabled: !user || !userData
    });

    if (!user || !userData) {
        return null;
    }

    return (
        <>
            {!isMobileScreen && <SidebarDesktop />}
            {isMobileScreen && <SidebarMobile />}
            
            <div style={{
                marginLeft: isMobileScreen ? '0' : '250px',
                marginTop: isMobileScreen ? '60px' : '0',
                transition: 'all 0.3s ease'
            }}>
                <NewDashboard 
                    theme={theme}
                    userData={userData}
                    isHidden={isPrivacyMode}
                    CustomTick={CustomTick}
                />
                
                <ScrollNavigationIndicator
                    isLoading={isScrollLoading}
                    theme={theme}
                    bottomLoadingActive={bottomLoadingActive}
                    pageHasScrollableContent={pageHasScrollableContent}
                />
            </div>
        </>
    );
};

export default DashboardPage;
