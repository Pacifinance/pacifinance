import { useCallback, useEffect, useState } from 'react';

export type CryptoGroupingMode = 'separate' | 'combined';

export const CRYPTO_GROUPING_PREF_KEY = 'pacifinance-crypto-grouping';
const CRYPTO_GROUPING_EVENT = 'pacifinance:crypto-grouping-changed';

const readPreference = (): CryptoGroupingMode => {
  if (typeof window === 'undefined') return 'separate';
  try {
    return window.localStorage.getItem(CRYPTO_GROUPING_PREF_KEY) === 'combined' ? 'combined' : 'separate';
  } catch {
    return 'separate';
  }
};

export const useCryptoGroupingPref = () => {
  const [mode, setModeState] = useState<CryptoGroupingMode>(readPreference);

  useEffect(() => {
    const sync = () => setModeState(readPreference());
    window.addEventListener('storage', sync);
    window.addEventListener(CRYPTO_GROUPING_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(CRYPTO_GROUPING_EVENT, sync);
    };
  }, []);

  const setMode = useCallback((nextMode: CryptoGroupingMode) => {
    try {
      window.localStorage.setItem(CRYPTO_GROUPING_PREF_KEY, nextMode);
    } catch {
      // The preference still works for this mounted view if storage is unavailable.
    }
    setModeState(nextMode);
    window.dispatchEvent(new Event(CRYPTO_GROUPING_EVENT));
  }, []);

  return { mode, setMode, isCombined: mode === 'combined' };
};
