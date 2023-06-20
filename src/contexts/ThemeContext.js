import React, { createContext, useState } from 'react';

export const ThemeContext = createContext();

export const themes = {
  light: {
    mode: 'light',
    primaryColor: '#fff',
    textColor: 'black',//#222629
    backgroundColor: '#fff',
    buttonBackgroundColor: '#FF8000',
    iconBackgroundColor: '#FF8000',
  },
  dark: {
    mode: 'dark',
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
      ...prevTheme,
      mode: prevTheme.mode === 'dark' ? 'light' : 'dark'
    }));
  };
  

  return (
    <ThemeContext.Provider value={{ theme, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
