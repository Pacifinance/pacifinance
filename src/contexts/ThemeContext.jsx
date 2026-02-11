import React, { createContext, useState } from 'react';
import { themes } from '../styles/Themes';
export const ThemeContext = createContext();



export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(themes.dark);

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
