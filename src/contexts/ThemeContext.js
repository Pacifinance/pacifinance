import React, { createContext, useState } from 'react';

const themes = {
  light: {
    primaryColor: '#3d3d3d',
    textColor: '#222629',
    backgroundColor: '#fff',
    buttonBackground: 'orange',
  },
  dark: {
    primaryColor: '#fff',
    textColor: '#fff',
    backgroundColor: '#222629',
    buttonBackground: 'orange',
  },
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(themes.light);

  const toggleMode = () => {
    setTheme(theme === themes.light ? themes.dark : themes.light);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
