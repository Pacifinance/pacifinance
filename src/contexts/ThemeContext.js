import React, { createContext, useState } from 'react';

export const ThemeContext = createContext();

export const themes = {
  light: {
    mode: 'light',
    jollyColor: '#6fca3a',
    primaryColor: '#fff',
    textColor: 'black',//#222629
    backgroundColor: '#fff',
    buttonBackgroundColor: '#079164',
    iconBackgroundColor: '#079164',
  },
  dark: {
    mode: 'dark',
    jollyColor: 'white',
    primaryColor: '#0d0f13', //black
    textColor: '#fff',
    backgroundColor: '#222831', //#222831 o #3d3d3d 
    buttonBackgroundColor: '#079164 ',   // #FF8000 arancione o #59A52C verde o #6fca3a verde chiaro o #079164 (verde smeraldo)
    iconBackgroundColor: '#079164 ',
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
