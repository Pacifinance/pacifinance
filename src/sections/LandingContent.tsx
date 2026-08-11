import React, { lazy, Suspense, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import type { PacifinanceTheme } from '../types/theme';
import LandingHero from './LandingHero';

// Lazy: below-the-fold sections don't need to be in the initial bundle/paint.
const ConsentBanner = lazy(() => import('./ConsentBanner'));
const LandingPillars = lazy(() => import('./LandingPillars'));
const LandingFeatureList = lazy(() => import('./LandingFeatureList'));
const LandingOpenSource = lazy(() => import('./LandingOpenSource'));
const LandingCTA = lazy(() => import('./LandingCTA'));

interface LandingContentProps {
  theme: PacifinanceTheme;
}

export default function NewLandingContent({ theme }: LandingContentProps) {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    // The target section may still be behind the lazy Suspense boundary on
    // first paint (e.g. arriving here from /auth's header) — retry briefly
    // instead of racing it.
    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else if (attempts++ < 20) {
        setTimeout(tryScroll, 50);
      }
    };
    tryScroll();
  }, [location.hash]);

  return (
    <div
      className="relative left-0 w-full overflow-y-hidden"
      style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
    >
      <Suspense fallback={<div />}>
        <ConsentBanner />
      </Suspense>

      <LandingHero theme={theme} />

      <Suspense fallback={<div />}>
        <LandingPillars theme={theme} />
        <LandingFeatureList theme={theme} />
        <LandingOpenSource theme={theme} />
        <LandingCTA theme={theme} />
      </Suspense>
    </div>
  );
}
