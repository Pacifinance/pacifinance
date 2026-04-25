/**
 * Centralized REST endpoint paths.
 *
 * Keep in sync with the server routes. Using these constants instead of
 * inline strings means that renaming an endpoint is a single-file change.
 *
 * @module constants/api
 */

export const ENDPOINTS = {
  // Auth
  LOGIN:              '/auth/login',
  LOGOUT:             '/auth/logout',
  REGISTER:           '/auth/register',
  CHECK_SESSION:      '/auth/check',

  // User
  USER_GET:           '/user/get',
  USER_SET:           '/user/set',
  USER_SET_ID:        '/user/setId',
  USER_SET_PASSWORD:  '/user/setPassword',
  USER_DELETE:        '/user/delete',
  USER_RESET_NAME:    '/user/resetUsername',
  USER_GOALS:         '/user/goals',

  // Tags
  TAGS_GET:           '/tags/get',

  // Balances
  BALANCES_GET:       '/balances/get',
  BALANCES_ADD:       '/balances/add',

  // Expenses / Incomes
  EXPENSES_GET:       '/expenses/get',
  EXPENSES_ADD:       '/expenses/add',
  EXPENSES_DELETE:    '/expenses/delete',
  EXPENSES_EDIT:      '/expenses/edit',

  // Rankings
  RANK_BALANCES:      '/rank/balances',
  RANK_EXPENSES:      '/rank/expenses',
  RANK_INCOMES:       '/rank/incomes',

  // Stats
  STATS_AVERAGES:     '/api/stats/averages',

  // Prices
  PRICES_CRYPTO:      '/api/prices/crypto',
  PRICES_ETF:         '/api/prices/etf',
  PRICES_STOCKS:      '/api/prices/stocks',
  PRICES_COMMODITIES: '/api/prices/commodities',
  PRICES_BONDS:       '/api/prices/bonds',
} as const;

export type Endpoint = typeof ENDPOINTS[keyof typeof ENDPOINTS];
