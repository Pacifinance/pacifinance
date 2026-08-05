// Preloading strategy for critical components
// Preloads the most used components after the initial load

import { useEffect } from 'react';

// Preloading functions for the most critical components
const preloadDashboard = () => import('../pages/DashboardPage');
const preloadCharts = () => import('../pages/StatsChartsPage');
const preloadInsert = () => import('../pages/InsertPage');

// Hook for intelligent preloading
export const usePreloadCriticalComponents = (isAuthenticated) => {
  useEffect(() => {
    if (isAuthenticated) {
      // Preload the app's main components after authentication
      const preloadTimer = setTimeout(() => {
        // Dashboard is always loaded first after login
        preloadDashboard();

        // Preload the other components with a delay so nothing blocks
        setTimeout(() => preloadInsert(), 1000);
        setTimeout(() => preloadCharts(), 2000);
      }, 500);

      return () => clearTimeout(preloadTimer);
    }
  }, [isAuthenticated]);
};

// Conditional preloading based on user behavior
export const useIntelligentPreloading = () => {
  useEffect(() => {
    // Preload common public components
    const timer = setTimeout(() => {
      import('../pages/AuthPage');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Preload on link hover (user intent)
  const handleLinkHover = (componentName) => {
    switch (componentName) {
      case 'dashboard':
        preloadDashboard();
        break;
      case 'charts':
        preloadCharts();
        break;
      case 'insert':
        preloadInsert();
        break;
    }
  };

  return { handleLinkHover };
};