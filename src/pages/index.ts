/**
 * Barrel export for all pages.
 *
 * Usage:
 *   import { DashboardPage } from '@pages';
 *
 * ⚠️  IMPORTANT — lazy loading:
 * AppRouter uses React.lazy() with direct file paths for code-splitting.
 * Do NOT replace those direct imports with this barrel — doing so would
 * cause all pages to land in a single chunk, defeating code-splitting.
 *
 * Use this barrel only for:
 *   - Type-only imports (`import type { ... }`)
 *   - Non-lazy static imports (e.g. in tests or utilities that don't load all pages)
 */

export { default as AuthPage } from './AuthPage';
export { default as ComparisonPage } from './ComparisonPage';
export { default as ContactPage } from './ContactPage';
export { default as CookiePolicyPage } from './CookiePolicyPage';
export { default as DashboardPage } from './DashboardPage';
export { default as DisclaimerPage } from './DisclaimerPage';
export { default as FAQPage } from './FAQPage';
export { default as GoalsAndLimitsPage } from './GoalsAndLimitsPage';
export { default as InfoPage } from './InfoPage';
export { default as InsertPage } from './InsertPage';
export { default as KnowledgePage } from './KnowledgePage';
export { default as LandingPage } from './LandingPage';
export { default as MarketPricesPage } from './MarketPricesPage';
export { default as PricingPage } from './PricingPage';
export { default as PrivacyPolicyPage } from './PrivacyPolicyPage';
export { default as ProfilePage } from './ProfilePage';
export { default as RoadmapPage } from './RoadmapPage';
export { default as SettingsPage } from './SettingsPage';
export { default as SitemapPage } from './SitemapPage';
export { default as StatsChartsPage } from './StatsChartsPage';
export { default as TermsOfServicePage } from './TermsOfServicePage';
