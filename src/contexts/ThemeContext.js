import React, { createContext, useState } from 'react';
import { themes } from './Themes';
export const ThemeContext = createContext();



export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(themes.dark);

  const toggleMode = () => {
    setTheme(prevTheme => ({
      ...themes[prevTheme.mode === 'dark' ? 'light' : 'dark'], // Copia l'intero oggetto tema corrispondente al nuovo modo
      mode: prevTheme.mode === 'dark' ? 'light' : 'dark'
    }));
  };
  

  return (
    <ThemeContext.Provider value={{ theme, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
