// Simple, safe preloading hook
import { useEffect } from 'react';

// Safe preloading functions with error handling
const safePreload = (importFn) => {
  try {
    return importFn().catch(err => {
      console.warn('Preload failed:', err);
      return null;
    });
  } catch (err) {
    console.warn('Preload error:', err);
    return Promise.resolve(null);
  }
};

// Hook for gradual preloading after authentication
export const useAuthenticatedPreloading = (isAuthenticated) => {
  useEffect(() => {
    if (isAuthenticated) {
      // Preload the app's main pages 2 seconds after authentication
      const timer = setTimeout(() => {
        // Preload the most used pages
        safePreload(() => import('../pages/StatsChartsPage'));

        // Preload less critical pages with a longer delay
        setTimeout(() => {
          safePreload(() => import('../pages/InsertPage'));
        }, 1000);
        
        setTimeout(() => {
          safePreload(() => import('../pages/ComparisonPage'));
        }, 2000);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);
};

// Hook for preloading public pages
export const usePublicPreloading = () => {
  useEffect(() => {
    // Preload pages that might be visited
    const timer = setTimeout(() => {
      safePreload(() => import('../pages/FAQPage'));
      safePreload(() => import('../pages/PricingPage'));
    }, 5000); // Wait 5 seconds so it doesn't interfere with the initial load
    
    return () => clearTimeout(timer);
  }, []);
};