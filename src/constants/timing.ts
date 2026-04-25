/**
 * Centralized timing constants (milliseconds unless stated otherwise).
 *
 * @module constants/timing
 */

/** Exchange rate cache lifetime — 24h. */
export const CURRENCY_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Default toast auto-dismiss. */
export const TOAST_DISMISS_MS = 4_000;

/** Generic input debounce for amount/search fields. */
export const DEBOUNCE_INPUT_MS = 250;

/** How long a "just saved" success indicator stays visible. */
export const SAVED_FEEDBACK_MS = 2_000;

/** Rough 1-minute tick used by chart legends / clocks. */
export const ONE_MINUTE_MS = 60_000;

/** 30s polling cadence for lightweight endpoints. */
export const POLL_SHORT_MS = 30_000;
