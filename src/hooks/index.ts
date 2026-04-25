/**
 * Hooks barrel. Import via `@hooks`.
 *
 * NOTE: Uses named re-exports to match the existing hook files (most
 * expose `export const useFoo`, not a default).
 *
 * @module hooks
 */

export { useAuth } from './useAuth';
export { useAccountActions } from './useAccountActions';
export { useAchievementNotifications } from './useAchievementNotifications';
export { useDashboardLayout, DEFAULT_SECTIONS } from './useDashboardLayout';
export { useDemoServices } from './useDemoServices';
export { useFormatCurrency } from './useFormatCurrency';
export {
  useGamification,
  BADGE_CATEGORIES,
  BADGE_CATEGORY_ORDER,
  BADGE_DEFINITIONS,
} from './useGamification';
export { useHTMLLang } from './useHTMLLang';
export { useLocalizedNavigate } from './useLocalizedNavigate';
export {
  usePastDateBalancePref,
  PAST_DATE_BALANCE_PREF_KEY,
  PAST_DATE_BALANCE_CHOICES,
} from './usePastDateBalancePref';
export {
  usePreloadCriticalComponents,
  useIntelligentPreloading,
} from './usePreloading';
export { useScrollNavigation } from './useScrollNavigation';
export { useAuthenticatedPreloading, usePublicPreloading } from './useSimplePreloading';
