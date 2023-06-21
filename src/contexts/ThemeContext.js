import React, { createContext, useState } from 'react';

export const ThemeContext = createContext();

export const themes = {
  light: {
    mode: 'light',
    jollyColor: '#FF8000',
    primaryColor: '#fff',
    textColor: 'black',//#222629
    backgroundColor: '#fff',
    buttonBackgroundColor: '#FF8000',
    iconBackgroundColor: '#FF8000',
  },
  dark: {
    mode: 'dark',
    jollyColor: 'white',
    primaryColor: '#000000',
    textColor: '#fff',
    backgroundColor: '#3d3d3d',
    buttonBackgroundColor: '#FF8000',
    iconBackgroundColor: '#FF8000',
  },
};



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
