/**
 * Default values for financial goals and limits.
 *
 * These defaults are used across the application when the user has not set
 * custom values. Having them in a single place avoids duplication and makes
 * them easy to adjust.
 *
 * @module data/financeDefaults
 */

/** Default monthly spending limit (EUR) */
export const DEFAULT_MONTHLY_SPENDING_LIMIT = 2000;

/** Default savings goal percentage */
export const DEFAULT_SAVINGS_GOAL_PERCENTAGE = 20;

/** Default emergency fund target (EUR) */
export const DEFAULT_EMERGENCY_FUND_TARGET = 10000;

/** Auto-dismiss delay for success/error messages (ms) */
export const MESSAGE_AUTO_DISMISS_MS = 5000;

/** Signup timeout (ms) */
export const SIGNUP_TIMEOUT_MS = 10000;

/** Scroll navigation cooldown (ms) */
export const SCROLL_COOLDOWN_MS = 2000;

/** Preloading delay (ms) */
export const PRELOAD_DELAY_MS = 2000;

/** Profile completion success display duration (ms) */
export const PROFILE_SUCCESS_DISPLAY_MS = 3000;
