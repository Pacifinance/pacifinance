import React, { createContext, useState } from 'react';

export const ThemeContext = createContext();

export const themes = {
  light: {
    mode: 'light',
    jollyColor: '#6fca3a',
    primaryColor: '#fff',
    textColor: 'black',//#222629
    backgroundColor: '#fff',
    buttonBackgroundColor: '#6fca3a',
    iconBackgroundColor: '#6fca3a',
  },
  dark: {
    mode: 'dark',
    jollyColor: 'white',
    primaryColor: '#0d0f13', //black
    textColor: '#fff',
    backgroundColor: '#222831', //#222831 0 #3d3d3d
    buttonBackgroundColor: '#6fca3a',   // #FF8000 arancione o #59A52C verde o #6fca3a verde chiaro
    iconBackgroundColor: '#6fca3a',
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
