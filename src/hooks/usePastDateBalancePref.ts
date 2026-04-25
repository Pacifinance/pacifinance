/**
 * Hook for managing the user preference for "past-date balance impact".
 *
 * When inserting an outflow or income with a date in a past month, the user
 * can choose whether that amount should update the historical balance snapshot
 * of that month.
 *
 * Values:
 *   - 'ask'        → show a confirmation modal every time (default for new users)
 *   - 'none'       → never touch the historical balance (transaction-only record)
 *   - 'past-month' → always adjust the balance snapshot of the transaction's month
 *
 * Persisted in localStorage under `pacifinance-past-date-balance-pref`.
 */

import { useCallback, useEffect, useState } from 'react';

export const PAST_DATE_BALANCE_PREF_KEY = 'pacifinance-past-date-balance-pref';
export const PAST_DATE_BALANCE_CHOICES = Object.freeze({
  ASK: 'ask',
  NONE: 'none',
  PAST_MONTH: 'past-month',
});

const VALID_VALUES = new Set(Object.values(PAST_DATE_BALANCE_CHOICES));

const readPref = () => {
  if (typeof window === 'undefined') return PAST_DATE_BALANCE_CHOICES.ASK;
  try {
    const raw = window.localStorage.getItem(PAST_DATE_BALANCE_PREF_KEY);
    if (raw && VALID_VALUES.has(raw)) return raw;
  } catch {
    // localStorage unavailable (private mode, SSR, etc.)
  }
  return PAST_DATE_BALANCE_CHOICES.ASK;
};

const writePref = (value) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PAST_DATE_BALANCE_PREF_KEY, value);
  } catch {
    // ignore write errors
  }
};

export const usePastDateBalancePref = () => {
  const [pref, setPrefState] = useState(readPref);

  // Keep multiple hook instances in sync via the storage event.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onStorage = (e) => {
      if (e.key === PAST_DATE_BALANCE_PREF_KEY) {
        setPrefState(readPref());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setPref = useCallback((value) => {
    if (!VALID_VALUES.has(value)) return;
    writePref(value);
    setPrefState(value);
  }, []);

  const resetPref = useCallback(() => {
    setPref(PAST_DATE_BALANCE_CHOICES.ASK);
  }, [setPref]);

  return { pref, setPref, resetPref };
};

export default usePastDateBalancePref;
