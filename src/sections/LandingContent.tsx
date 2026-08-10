import React, { lazy, Suspense } from 'react';
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
