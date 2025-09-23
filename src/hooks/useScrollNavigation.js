import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Ordine delle pagine per la navigazione con scroll
const PAGE_ORDER = [
  '/dashboard',
  '/charts-statistics', 
  '/insert-values',
  '/comparison'
];

// Soglia di scroll per iniziare il "caricamento" (98% della pagina - più spazio per l'utente)
const SCROLL_THRESHOLD_START = 0.98;
// Soglia per scroll verso l'alto (3% dall'alto)
const SCROLL_THRESHOLD_UP = 0.03;

// Tempo di attesa prima del cambio pagina (ms) - più tempo per dare controllo all'utente
const LOADING_DURATION = 2000;

// Debounce time per evitare cambi pagina troppo frequenti
const DEBOUNCE_TIME = 500;

// Altezza minima per abilitare scroll navigation
const MIN_PAGE_HEIGHT = 600;

export const useScrollNavigation = (enabled = true) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDirection, setLoadingDirection] = useState(null); // 'up' | 'down'
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [lastScrollTime, setLastScrollTime] = useState(0);
  const [scrollStartTime, setScrollStartTime] = useState(null);
  const [canScroll, setCanScroll] = useState(true);
  const [pageHasScrollableContent, setPageHasScrollableContent] = useState(true);

  const getCurrentPageIndex = useCallback(() => {
    return PAGE_ORDER.indexOf(location.pathname);
  }, [location.pathname]);

  const navigateToPage = useCallback((direction) => {
    if (!enabled || isNavigating || isLoading) return;

    const currentIndex = getCurrentPageIndex();
    if (currentIndex === -1) return; // Pagina non nel ciclo di scroll

    const nextIndex = direction === 'down' 
      ? currentIndex + 1 
      : currentIndex - 1;

    if (nextIndex >= 0 && nextIndex < PAGE_ORDER.length) {
      setIsNavigating(true);
      navigate(PAGE_ORDER[nextIndex]);
      
      // Scroll verso l'alto quando navighiamo a una nuova pagina
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100); // Piccolo delay per permettere il render della nuova pagina
      
      // Reset dello stato dopo un delay
      setTimeout(() => {
        setIsNavigating(false);
      }, 1500);
    }
  }, [enabled, isNavigating, isLoading, getCurrentPageIndex, navigate]);

  const startLoading = useCallback((direction) => {
    if (isLoading || isNavigating) return;
    
    setIsLoading(true);
    setLoadingDirection(direction);
    setLoadingProgress(0);
    setScrollStartTime(Date.now());

    // Animazione progress bar
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + (100 / (LOADING_DURATION / 50));
        if (newProgress >= 100) {
          clearInterval(interval);
          navigateToPage(direction);
          setIsLoading(false);
          setLoadingDirection(null);
          setLoadingProgress(0);
          return 100;
        }
        return newProgress;
      });
    }, 50);
  }, [isLoading, isNavigating, navigateToPage]);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingDirection(null);
    setLoadingProgress(0);
    setScrollStartTime(null);
  }, []);

  const handleScroll = useCallback(() => {
    if (!enabled || isNavigating || !pageHasScrollableContent) return;

    const now = Date.now();
    const currentScrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Se la pagina non ha contenuto scrollabile, disabilita la navigazione
    if (documentHeight <= windowHeight + 50) {
      if (pageHasScrollableContent) {
        setPageHasScrollableContent(false);
      }
      return;
    } else if (!pageHasScrollableContent) {
      setPageHasScrollableContent(true);
    }
    
    // Calcola la percentuale di scroll
    const scrollPercentage = (currentScrollY + windowHeight) / documentHeight;
    const scrollFromTop = currentScrollY / Math.max(documentHeight - windowHeight, 1);
    
    // Debounce per evitare troppi trigger
    if (now - lastScrollTime < DEBOUNCE_TIME) return;

    const currentIndex = getCurrentPageIndex();

    // Scroll verso il basso - vai alla pagina successiva
    if (scrollPercentage >= SCROLL_THRESHOLD_START && currentIndex < PAGE_ORDER.length - 1) {
      if (!isLoading && loadingDirection !== 'down') {
        startLoading('down');
        setLastScrollTime(now);
      }
    } 
    // Scroll verso l'alto - vai alla pagina precedente  
    else if (scrollFromTop <= SCROLL_THRESHOLD_UP && currentIndex > 0) {
      if (!isLoading && loadingDirection !== 'up') {
        startLoading('up');
        setLastScrollTime(now);
      }
    }
    // Se non siamo nella zona di trigger, ferma il loading
    else if (isLoading) {
      stopLoading();
    }
  }, [enabled, isNavigating, isLoading, loadingDirection, lastScrollTime, pageHasScrollableContent, getCurrentPageIndex, startLoading, stopLoading]);

  useEffect(() => {
    if (!enabled) return;

    const throttledHandleScroll = () => {
      requestAnimationFrame(handleScroll);
    };

    // Gestione scroll wheel per pagine senza scroll verticale
    const handleWheel = (event) => {
      if (!enabled || isNavigating || pageHasScrollableContent) return;
      
      const now = Date.now();
      if (now - lastScrollTime < DEBOUNCE_TIME * 2) return; // Debounce più lungo per wheel
      
      const currentIndex = getCurrentPageIndex();
      
      if (event.deltaY > 50 && currentIndex < PAGE_ORDER.length - 1) {
        // Scroll verso il basso
        if (!isLoading && loadingDirection !== 'down') {
          startLoading('down');
          setLastScrollTime(now);
        }
      } else if (event.deltaY < -50 && currentIndex > 0) {
        // Scroll verso l'alto
        if (!isLoading && loadingDirection !== 'up') {
          startLoading('up');
          setLastScrollTime(now);
        }
      }
    };

    // Gestione key navigation per pagine senza scroll
    const handleKeyDown = (event) => {
      if (!enabled || isNavigating || pageHasScrollableContent) return;
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
      
      const now = Date.now();
      if (now - lastScrollTime < DEBOUNCE_TIME * 2) return;
      
      const currentIndex = getCurrentPageIndex();
      
      if ((event.key === 'ArrowDown' || event.key === 'PageDown') && currentIndex < PAGE_ORDER.length - 1) {
        event.preventDefault();
        if (!isLoading && loadingDirection !== 'down') {
          startLoading('down');
          setLastScrollTime(now);
        }
      } else if ((event.key === 'ArrowUp' || event.key === 'PageUp') && currentIndex > 0) {
        event.preventDefault();
        if (!isLoading && loadingDirection !== 'up') {
          startLoading('up');
          setLastScrollTime(now);
        }
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleScroll, pageHasScrollableContent, isNavigating, isLoading, loadingDirection, lastScrollTime, getCurrentPageIndex, startLoading]);

  // Reset quando cambia pagina
  useEffect(() => {
    setLastScrollTime(Date.now());
    stopLoading();
    
    // Verifica se la pagina ha contenuto scrollabile dopo un breve delay
    setTimeout(() => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      setPageHasScrollableContent(documentHeight > windowHeight + 50);
    }, 500);
  }, [location.pathname, stopLoading]);

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
    isLoading,
    loadingDirection,
    loadingProgress,
    isScrollNavigationEnabled: enabled && getCurrentPageIndex() !== -1 && pageHasScrollableContent,
    pageHasScrollableContent,
    currentPageIndex: getCurrentPageIndex(),
    totalPages: PAGE_ORDER.length,
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
