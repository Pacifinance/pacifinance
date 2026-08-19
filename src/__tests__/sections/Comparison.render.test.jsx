/**
 * Smoke-render test for the redesigned Comparison page. The hero gauge's
 * SVG arc previously interpolated a styled-components `keyframes` object
 * into a plain inline `style` object instead of a real styled-components
 * tagged template - that only throws at render time (styled-components
 * error #12), so no lint/type/unit check on pure functions ever caught it.
 * This test actually mounts <Comparison> with demo-realistic data so that
 * class of bug fails a test run instead of only showing up in production.
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import { LanguageContext } from '../../contexts/LanguageContext';
import { CurrencyContext } from '../../contexts/CurrencyContext';
import enLocale from '../../i18n/locales/en.json';
import { generateDemoData } from '../../data/demoData';

vi.mock('../../hooks/useLocalizedNavigate', () => ({
  useLocalizedNavigate: () => vi.fn(),
}));

vi.mock('../../hooks/useDemoServices', () => ({
  useDemoServices: () => ({
    rankingService: {
      previewCustomBenchmark: vi.fn().mockResolvedValue({
        requestedFactors: [], factors: [], relaxed: false, available: true,
        cohort: { size: 34, populationSize: 214, minimumSize: 20, averageSimilarity: 0.74 },
      }),
      getCustomBenchmark: vi.fn().mockResolvedValue({
        available: true, requestedFactors: [], factors: [], relaxed: false, generatedAt: new Date().toISOString(),
        cohort: { size: 34, populationSize: 214, minimumSize: 20, averageSimilarity: 0.74 },
        averages: { balances: 36859, incomes: 2506, expenses: 1358, assetAllocation: { liquid: 38, investments: 50, crypto: 12 } },
        rankings: { balance: 78, incomes: 68, outflows: 38 },
      }),
    },
    userService: {
      setBenchmarkConsent: vi.fn().mockResolvedValue({ benchmarkConsent: true }),
    },
    statsService: {
      getBehaviourBenchmark: vi.fn().mockResolvedValue({
        available: true, minimumCohortSize: 20, cohortSize: 214,
        personal: { savingConsistency: 78, investmentRegularity: 65, contributionFrequency: 3.2, goalProgress: 54 },
        rankings: { savingConsistency: 72, investmentRegularity: 68, contributionFrequency: 55, goalProgress: 61 },
      }),
    },
  }),
}));

vi.mock('../../contexts/DeploymentContext', () => ({
  useDeployment: () => ({ selfHosted: false }),
}));

import Comparison from '../../sections/Comparison';

const theme = { mode: 'light', textColor: '#000', buttonBackgroundColor: '#079164' };
const currencyCtx = {
  formatAmount: (v) => `€${Number(v).toFixed(0)}`,
};
const translations = {
  comparison: enLocale.comparison,
  general: { comingSoon: 'Coming soon' },
};

function renderComparison(userData) {
  return render(
    <ThemeContext.Provider value={{ theme }}>
      <LanguageContext.Provider value={{ language: 'en', translations }}>
        <CurrencyContext.Provider value={currencyCtx}>
          <Comparison theme={theme} userData={userData} isHidden={false} />
        </CurrencyContext.Provider>
      </LanguageContext.Provider>
    </ThemeContext.Provider>,
  );
}

describe('Comparison (render smoke test)', () => {
  it('renders the hero gauge and accordion without throwing, with demo data (benchmarkConsent true)', () => {
    const userData = generateDemoData();
    expect(userData.benchmarkConsent).toBe(true);
    expect(() => renderComparison(userData)).not.toThrow();
  });

  it('renders the opt-in gate without throwing when benchmark consent has not been given', () => {
    const userData = { ...generateDemoData(), benchmarkConsent: false };
    expect(() => renderComparison(userData)).not.toThrow();
  });
});
