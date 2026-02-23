import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useLocalizedNavigate } from './useLocalizedNavigate';
import { removeLanguageFromPath } from '../utils/i18nRouting';

// Ordine delle pagine per la navigazione con scroll
const PAGE_ORDER = [
  '/dashboard',
  '/charts-statistics', 
  '/insert-values',
  '/comparison'
];

// Soglia di scroll per mostrare la zona trigger (98% della pagina)
const SCROLL_THRESHOLD_TRIGGER_ZONE = 0.98;
// Soglia per scroll verso l'alto per la zona trigger (5% dall'alto)
const SCROLL_THRESHOLD_UP_TRIGGER = 0.05;

// Soglie specifiche per pagina per evitare interferenze con i form
const PAGE_SPECIFIC_THRESHOLDS = {
  '/insert-values': { down: 0.99, up: 0.02 }, // Molto più restrittiva per i form con spazio extra
  '/charts-statistics': { down: 0.995, up: 0.03 }, // Più restrittiva per evitare sovrapposizione con statistiche
  '/comparison': { down: 0.98, up: 0.05 },
  default: { down: 0.98, up: 0.05 }
};

// Tempo di permanenza nella zona trigger prima del cambio pagina (3 secondi per sicurezza)
const TRIGGER_ZONE_DURATION = 3000;

// Tempo di pausa dopo la dismissione (10 secondi)
const DISMISSAL_COOLDOWN = 10000;

// Debounce time per check della zona trigger
const TRIGGER_CHECK_DEBOUNCE = 100;

// Altezza minima per abilitare scroll navigation
const MIN_PAGE_HEIGHT = 600;

export const useScrollNavigation = (enabled = true) => {
  const navigate = useLocalizedNavigate();
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [showTriggerZone, setShowTriggerZone] = useState(false);
  const [lastDismissalTime, setLastDismissalTime] = useState(null);
  const [triggerDirection, setTriggerDirection] = useState(null); // 'up' | 'down'
  const [triggerProgress, setTriggerProgress] = useState(0);
  const [pageHasScrollableContent, setPageHasScrollableContent] = useState(true);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [triggerIntervalId, setTriggerIntervalId] = useState(null);
  const [pageLoadTime, setPageLoadTime] = useState(Date.now());

// Periodo di grazia dopo il caricamento della pagina (3 secondi)
const PAGE_LOAD_GRACE_PERIOD = 3000;

  const getCurrentPageIndex = useCallback(() => {
    const cleanPath = removeLanguageFromPath(location.pathname);
    return PAGE_ORDER.indexOf(cleanPath);
  }, [location.pathname]);

  const navigateToPage = useCallback((direction) => {
    if (!enabled || isNavigating) return;

    const currentIndex = getCurrentPageIndex();
    if (currentIndex === -1) return; // Pagina non nel ciclo di scroll

    const nextIndex = direction === 'down' 
      ? currentIndex + 1 
      : currentIndex - 1;

    if (nextIndex >= 0 && nextIndex < PAGE_ORDER.length) {
      setIsNavigating(true);
      setIsAutoScrolling(true); // Flag per indicare scroll automatico
      
      // Track page navigation with Umami
      if (window.umami) {
        window.umami.track('scroll-navigation', {
          from: location.pathname,
          to: PAGE_ORDER[nextIndex],
          direction: direction
        });
      }
      
      navigate(PAGE_ORDER[nextIndex]);
      
      // Scroll verso l'alto quando navighiamo a una nuova pagina
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Disabilita il flag dopo che lo scroll automatico è completato
        setTimeout(() => {
          setIsAutoScrolling(false);
        }, 1000); // Tempo per completare lo scroll smooth
      }, 100); // Piccolo delay per permettere il render della nuova pagina
      
      // Reset dello stato dopo un delay
      setTimeout(() => {
        setIsNavigating(false);
      }, 1500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, isNavigating, getCurrentPageIndex, navigate]);

  // Funzione per navigare manualmente tramite pulsante
  const navigateToPageManually = useCallback((direction) => {
    if (isNavigating || isAutoScrolling) return;
    
    // Nascondi il pulsante immediatamente
    setShowTriggerZone(false);
    setTriggerDirection(null);
    
    // Naviga alla pagina
    navigateToPage(direction);
  }, [isNavigating, isAutoScrolling, navigateToPage]);

  const stopTriggerZone = useCallback(() => {
    if (triggerIntervalId) {
      clearInterval(triggerIntervalId);
      setTriggerIntervalId(null);
    }
    setShowTriggerZone(false);
    setTriggerDirection(null);
    setTriggerProgress(0);
  }, [triggerIntervalId]);

  // Funzione per dismissione manuale del popup
  const dismissTriggerZone = useCallback(() => {
    setLastDismissalTime(Date.now());
    stopTriggerZone();
  }, [stopTriggerZone]);

  const handleScroll = useCallback(() => {
    // Ignora gli eventi di scroll se è in corso uno scroll automatico
    if (!enabled || isNavigating || !pageHasScrollableContent || isAutoScrolling) return;

    // Periodo di grazia dopo il caricamento della pagina
    const currentTime = Date.now();
    if (currentTime - pageLoadTime < PAGE_LOAD_GRACE_PERIOD) {
      return;
    }

    const currentScrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Se la pagina non ha contenuto scrollabile, non mostrare pulsanti
    if (documentHeight <= windowHeight + 100) {
      if (pageHasScrollableContent) {
        setPageHasScrollableContent(false);
      }
      if (showTriggerZone) {
        stopTriggerZone();
      }
      return;
    } else if (!pageHasScrollableContent) {
      setPageHasScrollableContent(true);
    }
    
    // Verifica se siamo in cooldown dopo una dismissione
    const now = Date.now();
    if (lastDismissalTime && (now - lastDismissalTime) < DISMISSAL_COOLDOWN) {
      if (showTriggerZone) {
        stopTriggerZone();
      }
      return;
    }
    
    // Calcola la percentuale di scroll
    const scrollPercentage = (currentScrollY + windowHeight) / documentHeight;
    const scrollFromTop = currentScrollY / Math.max(documentHeight - windowHeight, 1);
    
    const currentIndex = getCurrentPageIndex();
    
    // Ottieni le soglie specifiche per la pagina corrente
    const currentPath = removeLanguageFromPath(location.pathname);
    const thresholds = PAGE_SPECIFIC_THRESHOLDS[currentPath] || PAGE_SPECIFIC_THRESHOLDS.default;
    
    // Mostra pulsante per andare alla pagina successiva quando si è vicini al fondo
    const showDownButton = scrollPercentage >= thresholds.down && currentIndex < PAGE_ORDER.length - 1;
    // Mostra pulsante per andare alla pagina precedente quando si è vicini all'inizio
    const showUpButton = scrollFromTop <= thresholds.up && currentIndex > 0;

    if (showDownButton && (!showTriggerZone || triggerDirection !== 'down')) {
      setShowTriggerZone(true);
      setTriggerDirection('down');
    } else if (showUpButton && (!showTriggerZone || triggerDirection !== 'up')) {
      setShowTriggerZone(true);
      setTriggerDirection('up');
    } else if (!showDownButton && !showUpButton && showTriggerZone) {
      // L'utente è uscito dalla zona, nascondi i pulsanti
      stopTriggerZone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, isNavigating, pageHasScrollableContent, isAutoScrolling, showTriggerZone, triggerDirection, getCurrentPageIndex, stopTriggerZone, lastDismissalTime, location.pathname]);

  useEffect(() => {
    if (!enabled) return;

    const throttledHandleScroll = () => {
      requestAnimationFrame(handleScroll);
    };

    // Disabilitiamo wheel e keyboard navigation per essere meno aggressivi
    // Solo scroll tradizionale per pagine scrollabili

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [enabled, handleScroll]);

  // Reset quando cambia pagina
  useEffect(() => {
    stopTriggerZone();
    setIsAutoScrolling(false); // Reset flag di auto-scroll
    setPageLoadTime(Date.now()); // Reset del tempo di caricamento pagina
    
    // Scroll automatico all'inizio della pagina
    window.scrollTo({ top: 0, behavior: 'auto' });
    
    // Verifica se la pagina ha contenuto scrollabile dopo un breve delay
    setTimeout(() => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      setPageHasScrollableContent(documentHeight > windowHeight + 100);
    }, 500);
  }, [location.pathname, stopTriggerZone]);

  // Controlla periodicamente se la pagina diventa scrollabile (per contenuto dinamico)
  useEffect(() => {
    if (!enabled) return;

    const checkScrollable = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const isScrollable = documentHeight > windowHeight + 50;
      
      if (isScrollable !== pageHasScrollableContent) {
        setPageHasScrollableContent(isScrollable);
      }
    };

    const interval = setInterval(checkScrollable, 2000);
    return () => clearInterval(interval);
  }, [enabled, pageHasScrollableContent]);

  return {
    isNavigating,
    showTriggerZone,
    triggerDirection,
    triggerProgress,
    isScrollNavigationEnabled: enabled && getCurrentPageIndex() !== -1 && pageHasScrollableContent,
    pageHasScrollableContent,
    currentPageIndex: getCurrentPageIndex(),
    totalPages: PAGE_ORDER.length,
    isAutoScrolling,
    cancelTrigger: stopTriggerZone, // Funzione per nascondere il pulsante
    dismissTrigger: dismissTriggerZone, // Funzione per dismissione con cooldown
    navigateManually: navigateToPageManually, // Funzione per navigare con il pulsante
    nextPage: () => {
      const currentIndex = getCurrentPageIndex();
      return currentIndex < PAGE_ORDER.length - 1 ? navigateToPage('down') : null;
    },
    prevPage: () => {
      const currentIndex = getCurrentPageIndex();
      return currentIndex > 0 ? navigateToPage('up') : null;
    }
  };
};
