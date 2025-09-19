import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Ordine delle pagine per la navigazione con scroll
const PAGE_ORDER = [
  '/dashboard',
  '/charts-statistics', 
  '/insert-values',
  '/comparison'
];

// Soglia di scroll (80% della pagina)
const SCROLL_THRESHOLD = 0.8;

// Velocità minima di scroll per attivare la navigazione (px/ms)
const MIN_SCROLL_SPEED = 0.5;

// Debounce time per evitare cambi pagina troppo frequenti
const DEBOUNCE_TIME = 1000;

export const useScrollNavigation = (enabled = true) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [lastScrollTime, setLastScrollTime] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);

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
      navigate(PAGE_ORDER[nextIndex]);
      
      // Reset dello stato dopo un delay
      setTimeout(() => {
        setIsNavigating(false);
      }, 1500);
    }
  }, [enabled, isNavigating, getCurrentPageIndex, navigate]);

  const handleScroll = useCallback(() => {
    if (!enabled || isNavigating) return;

    const now = Date.now();
    const currentScrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Calcola la percentuale di scroll
    const scrollPercentage = (currentScrollY + windowHeight) / documentHeight;
    
    // Calcola la velocità di scroll
    const timeDiff = now - lastScrollTime;
    const scrollDiff = currentScrollY - lastScrollY;
    const scrollSpeed = Math.abs(scrollDiff) / timeDiff;

    // Debounce per evitare troppi trigger
    if (timeDiff < DEBOUNCE_TIME) return;

    // Check se la velocità è sufficiente
    if (scrollSpeed < MIN_SCROLL_SPEED) return;

    // Scroll verso il basso - vai alla pagina successiva
    if (scrollDiff > 0 && scrollPercentage >= SCROLL_THRESHOLD) {
      setLastScrollTime(now);
      navigateToPage('down');
    }
    
    // Scroll verso l'alto - vai alla pagina precedente  
    if (scrollDiff < 0 && currentScrollY <= windowHeight * 0.2) {
      setLastScrollTime(now);
      navigateToPage('up');
    }

    setLastScrollY(currentScrollY);
  }, [enabled, isNavigating, lastScrollTime, lastScrollY, navigateToPage]);

  useEffect(() => {
    if (!enabled) return;

    const throttledHandleScroll = () => {
      requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [enabled, handleScroll]);

  // Reset quando cambia pagina
  useEffect(() => {
    setLastScrollY(0);
    setLastScrollTime(Date.now());
  }, [location.pathname]);

  return {
    isNavigating,
    isScrollNavigationEnabled: enabled && getCurrentPageIndex() !== -1,
    currentPageIndex: getCurrentPageIndex(),
    totalPages: PAGE_ORDER.length,
    nextPage: getCurrentPageIndex() < PAGE_ORDER.length - 1 ? PAGE_ORDER[getCurrentPageIndex() + 1] : null,
    prevPage: getCurrentPageIndex() > 0 ? PAGE_ORDER[getCurrentPageIndex() - 1] : null
  };
};
