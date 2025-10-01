// Strategia di preloading per componenti critici
// Precarica i componenti più utilizzati dopo il caricamento iniziale

import { useEffect } from 'react';

// Preloading functions per i componenti più critici
const preloadDashboard = () => import('../pages/DashboardPage');
const preloadCharts = () => import('../pages/StatsChartsPage');
const preloadInsert = () => import('../pages/InsertPage');

// Hook per il preloading intelligente
export const usePreloadCriticalComponents = (isAuthenticated) => {
  useEffect(() => {
    if (isAuthenticated) {
      // Precarica i componenti principali dell'app dopo l'autenticazione
      const preloadTimer = setTimeout(() => {
        // Dashboard è sempre il primo caricato dopo login
        preloadDashboard();
        
        // Precarica gli altri componenti con delay per non bloccare
        setTimeout(() => preloadInsert(), 1000);
        setTimeout(() => preloadCharts(), 2000);
      }, 500);

      return () => clearTimeout(preloadTimer);
    }
  }, [isAuthenticated]);
};

// Preloading condizionale basato su user behavior
export const useIntelligentPreloading = () => {
  useEffect(() => {
    // Precarica componenti pubblici comuni
    const timer = setTimeout(() => {
      import('../pages/AuthPage');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Precarica al hover sui link (user intent)
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