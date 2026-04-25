import React, { createContext, useState, useEffect } from 'react';
import { themes } from '../styles/Themes';
export const ThemeContext = createContext();



export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(themes.dark);

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

    setTheme(prevTheme => ({
      ...themes[prevTheme.mode === 'dark' ? 'light' : 'dark'],
      mode: prevTheme.mode === 'dark' ? 'light' : 'dark'
    }));

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
