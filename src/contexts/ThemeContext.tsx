import React, { createContext, useState, useEffect } from 'react';
import { themes } from '../styles/Themes';
export const ThemeContext = createContext();

const THEME_STORAGE_KEY = 'pacifinance-theme';

/**
 * Resolves the mode to boot with: an explicit past choice always wins;
 * otherwise fall back to the OS `prefers-color-scheme`, and only to light
 * when that's explicitly reported — an unknown/unsupported preference keeps
 * the app's traditional dark default rather than guessing.
 */
function getInitialMode() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // localStorage can be unavailable (private browsing, disabled storage)
  }
  try {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  } catch {
    // matchMedia can be unavailable in some environments
  }
  return 'dark';
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => themes[getInitialMode()]);

  // Sync body background with current theme to prevent color mismatch
  useEffect(() => {
    document.body.style.backgroundColor = theme.backgroundColor;
    // Update theme-color meta tag for mobile browser chrome
    const metaTags = document.querySelectorAll('meta[name="theme-color"]');
    const themeColor = theme.mode === 'dark' ? '#0d0f13' : '#079164';
    metaTags.forEach(tag => tag.setAttribute('content', themeColor));
  }, [theme.backgroundColor, theme.mode]);

  const toggleMode = () => {
    // Add transitioning class to enable CSS transitions
    document.body.classList.add('theme-transitioning');

    setTheme(prevTheme => {
      const nextMode = prevTheme.mode === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextMode);
      } catch {
        // localStorage can be unavailable (private browsing, disabled storage)
      }
      return { ...themes[nextMode], mode: nextMode };
    });

    // Remove class after transition completes to avoid interfering with other animations
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 400);
  };


  return (
    <ThemeContext.Provider value={{ theme, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
