// Barrel export for all components
// Only include components that are safe to re-export (avoid circular deps with lazy routes)

export { default as AdvancedInsightsSection } from './AdvancedInsightsSection';
export { default as BalanceSection } from './BalanceSection';
export { default as BalancesChart } from './BalancesChart';
export { default as DashboardCompactView } from './DashboardCompactView';
export { default as DetailedOutflowsAnalysis } from './DetailedOutflowsAnalysis';
export { default as FinancialInsights } from './FinancialInsights';
export { default as GoalTracker } from './GoalTracker';
export { default as GoalsAndLimits } from './GoalsAndLimits';
export { default as InOutChart } from './InOutChart';
export { default as InsertModals } from './InsertModals';
export { default as OnboardingWelcome } from './OnboardingWelcome';
export { default as PWAInstallGuide } from './PWAInstallGuide';
export { default as ScrollNavigationIndicator } from './ScrollNavigationIndicator';
export { default as TradingViewWidget } from './TradingViewWidget';
// ...add more as needed, but avoid re-exporting App entrypoints or lazy-only components
