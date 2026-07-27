/**
 * Centralized localStorage / sessionStorage keys.
 *
 * Single source of truth — prevents typos and makes it trivial to audit
 * what data the app persists client-side.
 *
 * @module constants/storageKeys
 */

export const STORAGE_KEYS = {
  LANGUAGE:              'pacifinance-language',
  THEME:                 'pacifinance-theme',
  CURRENCY:              'pacifinance-currency',
  CURRENCY_RATES:        'pacifinance-currency-rates',
  CURRENCY_RATES_TS:     'pacifinance-currency-rates-timestamp',
  DEV_MODE:              'pacifinance-dev-mode',
  DASHBOARD_LAYOUT:      'pacifinance-dashboard-layout',
  DASHBOARD_VIEW_MODE:   'pacifinance-dashboard-view-mode',
  OUTFLOW_LIST_VIEW_MODE: 'pacifinance-outflow-list-view-mode',
  INCOME_LIST_VIEW_MODE:  'pacifinance-income-list-view-mode',
  PAST_DATE_BAL_PREF:    'pacifinance-past-date-balance-pref',
  ACHIEVEMENTS_NOTIFIED: 'pacifinance-achievements-notified',
  ONBOARDING_SEEN:       'pacifinance-onboarding-seen',
  WHATS_NEW_SEEN:        'pacifinance-whats-new-seen',
  PRIVACY_HIDDEN:        'pacifinance-privacy-hidden',
  CONSENT:               'pacifinance-consent',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
