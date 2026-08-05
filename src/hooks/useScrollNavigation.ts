import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useLocalizedNavigate } from './useLocalizedNavigate';
import { removeLanguageFromPath } from '../utils/i18nRouting';

// Page order for scroll-based navigation
const PAGE_ORDER = [
  '/dashboard',
  '/charts-statistics',
  '/insert-values',
  '/comparison'
];

// Scroll threshold to show the trigger zone (98% of the page)
const SCROLL_THRESHOLD_TRIGGER_ZONE = 0.98;
// Scroll-up threshold for the trigger zone (5% from the top)
const SCROLL_THRESHOLD_UP_TRIGGER = 0.05;

// Page-specific thresholds to avoid interfering with forms
const PAGE_SPECIFIC_THRESHOLDS = {
  '/insert-values': { down: 0.99, up: 0.02 }, // Much more restrictive for forms with extra spacing
  '/charts-statistics': { down: 0.998, up: 0.02 }, // Very restrictive to avoid overlapping with charts
  '/comparison': { down: 0.98, up: 0.05 },
  default: { down: 0.98, up: 0.05 }
};

// How long to stay in the trigger zone before switching page (3 seconds, for safety)
const TRIGGER_ZONE_DURATION = 3000;

// Pause duration after dismissal (10 seconds)
const DISMISSAL_COOLDOWN = 10000;

// Debounce time for trigger-zone checks
const TRIGGER_CHECK_DEBOUNCE = 100;

// Minimum page height to enable scroll navigation
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
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(max-width: 839px)').matches
      : false
  );
  const navigationEnabled = enabled && !isMobileViewport;

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mediaQuery = window.matchMedia('(max-width: 839px)');
    const handleChange = (event) => setIsMobileViewport(event.matches);
    setIsMobileViewport(mediaQuery.matches);
    mediaQuery.addEventListener?.('change', handleChange);
    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, []);

// Grace period after the page loads (3 seconds)
const PAGE_LOAD_GRACE_PERIOD = 3000;

  const getCurrentPageIndex = useCallback(() => {
    const cleanPath = removeLanguageFromPath(location.pathname);
    return PAGE_ORDER.indexOf(cleanPath);
  }, [location.pathname]);

  const navigateToPage = useCallback((direction) => {
    if (!navigationEnabled || isNavigating) return;

    const currentIndex = getCurrentPageIndex();
    if (currentIndex === -1) return; // Page not part of the scroll cycle

    const nextIndex = direction === 'down'
      ? currentIndex + 1
      : currentIndex - 1;

    if (nextIndex >= 0 && nextIndex < PAGE_ORDER.length) {
      setIsNavigating(true);
      setIsAutoScrolling(true); // Flag to indicate an automatic scroll

      // Track page navigation with Umami
      if (window.umami) {
        window.umami.track('scroll-navigation', {
          from: location.pathname,
          to: PAGE_ORDER[nextIndex],
          direction: direction
        });
      }

      navigate(PAGE_ORDER[nextIndex]);

      // Scroll to top when navigating to a new page
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Clear the flag once the automatic scroll has finished
        setTimeout(() => {
          setIsAutoScrolling(false);
        }, 1000); // Time to let the smooth scroll finish
      }, 100); // Small delay to let the new page render

      // Reset state after a delay
      setTimeout(() => {
        setIsNavigating(false);
      }, 1500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationEnabled, isNavigating, getCurrentPageIndex, navigate]);

  // Navigate manually via button
  const navigateToPageManually = useCallback((direction) => {
    if (isNavigating || isAutoScrolling) return;

    // Hide the button immediately
    setShowTriggerZone(false);
    setTriggerDirection(null);

    // Navigate to the page
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

  // Manually dismiss the popup
  const dismissTriggerZone = useCallback(() => {
    setLastDismissalTime(Date.now());
    stopTriggerZone();
  }, [stopTriggerZone]);

  const handleScroll = useCallback(() => {
    // Ignore scroll events while an automatic scroll is in progress
    if (!navigationEnabled || isNavigating || !pageHasScrollableContent || isAutoScrolling) return;

    // Grace period after the page loads
    const currentTime = Date.now();
    if (currentTime - pageLoadTime < PAGE_LOAD_GRACE_PERIOD) {
      return;
    }

    const currentScrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // If the page has no scrollable content, don't show the buttons
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

    // Check whether we're in the cooldown after a dismissal
    const now = Date.now();
    if (lastDismissalTime && (now - lastDismissalTime) < DISMISSAL_COOLDOWN) {
      if (showTriggerZone) {
        stopTriggerZone();
      }
      return;
    }

    // Compute the scroll percentage
    const scrollPercentage = (currentScrollY + windowHeight) / documentHeight;
    const scrollFromTop = currentScrollY / Math.max(documentHeight - windowHeight, 1);

    const currentIndex = getCurrentPageIndex();

    // Get the thresholds specific to the current page
    const currentPath = removeLanguageFromPath(location.pathname);
    const thresholds = PAGE_SPECIFIC_THRESHOLDS[currentPath] || PAGE_SPECIFIC_THRESHOLDS.default;

    // Show the button to go to the next page when near the bottom
    const showDownButton = scrollPercentage >= thresholds.down && currentIndex < PAGE_ORDER.length - 1;
    // Show the button to go to the previous page when near the top
    const showUpButton = scrollFromTop <= thresholds.up && currentIndex > 0;

    if (showDownButton && (!showTriggerZone || triggerDirection !== 'down')) {
      setShowTriggerZone(true);
      setTriggerDirection('down');
    } else if (showUpButton && (!showTriggerZone || triggerDirection !== 'up')) {
      setShowTriggerZone(true);
      setTriggerDirection('up');
    } else if (!showDownButton && !showUpButton && showTriggerZone) {
      // The user left the zone, hide the buttons
      stopTriggerZone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationEnabled, isNavigating, pageHasScrollableContent, isAutoScrolling, showTriggerZone, triggerDirection, getCurrentPageIndex, stopTriggerZone, lastDismissalTime, location.pathname]);

  useEffect(() => {
    if (!navigationEnabled) {
      stopTriggerZone();
      return;
    }

    const throttledHandleScroll = () => {
      requestAnimationFrame(handleScroll);
    };

    // Wheel and keyboard navigation are disabled to be less aggressive;
    // only traditional scrolling is used for scrollable pages

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [navigationEnabled, handleScroll, stopTriggerZone]);

  // Reset when the page changes
  useEffect(() => {
    stopTriggerZone();
    setIsAutoScrolling(false); // Reset the auto-scroll flag
    setPageLoadTime(Date.now()); // Reset the page-load timestamp

    // Automatically scroll to the top of the page
    window.scrollTo({ top: 0, behavior: 'auto' });

    // Check whether the page has scrollable content after a short delay
    setTimeout(() => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      setPageHasScrollableContent(documentHeight > windowHeight + 100);
    }, 500);
  }, [location.pathname, stopTriggerZone]);

  // Periodically check whether the page becomes scrollable (for dynamic content)
  useEffect(() => {
    if (!navigationEnabled) return;

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
  }, [navigationEnabled, pageHasScrollableContent]);

  return {
    isNavigating,
    showTriggerZone,
    triggerDirection,
    triggerProgress,
    isScrollNavigationEnabled: navigationEnabled && getCurrentPageIndex() !== -1 && pageHasScrollableContent,
    pageHasScrollableContent,
    currentPageIndex: getCurrentPageIndex(),
    totalPages: PAGE_ORDER.length,
    isAutoScrolling,
    cancelTrigger: stopTriggerZone, // Function to hide the button
    dismissTrigger: dismissTriggerZone, // Function to dismiss with cooldown
    navigateManually: navigateToPageManually, // Function to navigate via the button
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
