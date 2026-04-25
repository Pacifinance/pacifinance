// Hook di preloading semplice e sicuro
import { useEffect } from 'react';

// Preloading functions sicure con gestione errori
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

// Hook per preloading graduale dopo l'autenticazione
export const useAuthenticatedPreloading = (isAuthenticated) => {
  useEffect(() => {
    if (isAuthenticated) {
      // Preload delle pagine principali dell'app dopo 2 secondi dall'autenticazione
      const timer = setTimeout(() => {
        // Preload delle pagine più utilizzate
        safePreload(() => import('../pages/StatsChartsPage'));
        
        // Preload con delay maggiore per le pagine meno critiche
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

// Hook per preloading delle pagine pubbliche
export const usePublicPreloading = () => {
  useEffect(() => {
    // Preload di pagine che potrebbero essere visitate
    const timer = setTimeout(() => {
      safePreload(() => import('../pages/FAQPage'));
      safePreload(() => import('../pages/PricingPage'));
    }, 5000); // Aspetta 5 secondi per non interferire con il caricamento iniziale
    
    return () => clearTimeout(timer);
  }, []);
};