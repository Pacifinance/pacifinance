import React, { createContext, useCallback, useState } from 'react';
import { usePrivacyDefaultPref, PRIVACY_DEFAULT_CHOICES } from '../hooks/usePrivacyDefaultPref';

export const PrivacyContext = createContext();

const LAST_STATE_KEY = 'pacifinance-privacy-last-hidden';

const readLastState = () => {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(LAST_STATE_KEY) !== 'false';
  } catch {
    return true;
  }
};

const writeLastState = (hidden) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LAST_STATE_KEY, String(hidden));
  } catch {
    // ignore write errors
  }
};

export const PrivacyProvider = ({ children }) => {
  const { pref: privacyDefaultPref } = usePrivacyDefaultPref();

  // Secure by default: every fresh mount (login, reload, new tab) starts hidden
  // unless the user has explicitly opted into "remember last state".
  const [isHidden, setIsHidden] = useState(() =>
    privacyDefaultPref === PRIVACY_DEFAULT_CHOICES.REMEMBER_LAST ? readLastState() : true
  );

  const toggleHidden = useCallback(() => {
    setIsHidden((prev) => {
      const next = !prev;
      writeLastState(next);
      return next;
    });
  }, []);

  return (
    <PrivacyContext.Provider value={{ isHidden, toggleHidden }}>
      {children}
    </PrivacyContext.Provider>
  );
};
