import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Ordine delle pagine per la navigazione con scroll
const PAGE_ORDER = [
  '/dashboard',
  '/charts-statistics', 
  '/insert-values',
  '/comparison'
];

// Soglia di scroll per mostrare la zona trigger (96% della pagina)
const SCROLL_THRESHOLD_TRIGGER_ZONE = 0.96;
// Soglia per scroll verso l'alto per la zona trigger (5% dall'alto)
const SCROLL_THRESHOLD_UP_TRIGGER = 0.05;

// Tempo di permanenza nella zona trigger prima del cambio pagina (3 secondi per sicurezza)
const TRIGGER_ZONE_DURATION = 3000;

// Debounce time per check della zona trigger
const TRIGGER_CHECK_DEBOUNCE = 100;

// Altezza minima per abilitare scroll navigation
const MIN_PAGE_HEIGHT = 600;

export const useScrollNavigation = (enabled = true) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [showTriggerZone, setShowTriggerZone] = useState(false);
  const [triggerDirection, setTriggerDirection] = useState(null); // 'up' | 'down'
  const [triggerProgress, setTriggerProgress] = useState(0);
  const [triggerStartTime, setTriggerStartTime] = useState(null);
  const [pageHasScrollableContent, setPageHasScrollableContent] = useState(true);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [triggerIntervalId, setTriggerIntervalId] = useState(null);

  const getCurrentPageIndex = useCallback(() => {
    return PAGE_ORDER.indexOf(location.pathname);
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
    setTriggerStartTime(null);
  }, [triggerIntervalId]);

  const handleScroll = useCallback(() => {
    // Ignora gli eventi di scroll se è in corso uno scroll automatico
    if (!enabled || isNavigating || !pageHasScrollableContent || isAutoScrolling) return;

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
    
    // Calcola la percentuale di scroll
    const scrollPercentage = (currentScrollY + windowHeight) / documentHeight;
    const scrollFromTop = currentScrollY / Math.max(documentHeight - windowHeight, 1);
    
    const currentIndex = getCurrentPageIndex();
    
    // Mostra pulsante per andare alla pagina successiva quando si è vicini al fondo
    const showDownButton = scrollPercentage >= SCROLL_THRESHOLD_TRIGGER_ZONE && currentIndex < PAGE_ORDER.length - 1;
    // Mostra pulsante per andare alla pagina precedente quando si è vicini all'inizio
    const showUpButton = scrollFromTop <= SCROLL_THRESHOLD_UP_TRIGGER && currentIndex > 0;

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
  }, [enabled, isNavigating, pageHasScrollableContent, isAutoScrolling, showTriggerZone, triggerDirection, getCurrentPageIndex, stopTriggerZone]);

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
