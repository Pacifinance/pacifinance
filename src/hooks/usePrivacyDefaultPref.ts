/**
 * Hook for managing the user preference for the privacy mode state at login.
 *
 * Values:
 *   - 'always-hidden' → every new session starts with amounts hidden, regardless
 *                        of what was chosen last time (default — secure by default,
 *                        no risk of a shoulder-surfer seeing real numbers while the
 *                        dashboard is still loading or because the user forgot to
 *                        re-enable privacy mode last time)
 *   - 'remember-last'  → the visibility chosen last time is restored on next login
 *                        (convenience, opt-in)
 *
 * Persisted in localStorage under `pacifinance-privacy-default-pref`.
 */

import { useCallback, useEffect, useState } from 'react';

export const PRIVACY_DEFAULT_PREF_KEY = 'pacifinance-privacy-default-pref';
export const PRIVACY_DEFAULT_CHOICES = Object.freeze({
  ALWAYS_HIDDEN: 'always-hidden',
  REMEMBER_LAST: 'remember-last',
});

const VALID_VALUES = new Set(Object.values(PRIVACY_DEFAULT_CHOICES));

const readPref = () => {
  if (typeof window === 'undefined') return PRIVACY_DEFAULT_CHOICES.ALWAYS_HIDDEN;
  try {
    const raw = window.localStorage.getItem(PRIVACY_DEFAULT_PREF_KEY);
    if (raw && VALID_VALUES.has(raw)) return raw;
  } catch {
    // localStorage unavailable (private mode, SSR, etc.)
  }
  return PRIVACY_DEFAULT_CHOICES.ALWAYS_HIDDEN;
};

const writePref = (value) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PRIVACY_DEFAULT_PREF_KEY, value);
  } catch {
    // ignore write errors
  }
};

export const usePrivacyDefaultPref = () => {
  const [pref, setPrefState] = useState(readPref);

  // Keep multiple hook instances in sync via the storage event.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onStorage = (e) => {
      if (e.key === PRIVACY_DEFAULT_PREF_KEY) {
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

  return { pref, setPref };
};

export default usePrivacyDefaultPref;
