import React, { useState, createContext } from 'react';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en'); // default language

    const toggleLanguage = () => {
        setLanguage(prevLanguage => prevLanguage === 'it' ? 'en' : 'it'); // Cambia la lingua
      };
  
    return (
      <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
        {children}
      </LanguageContext.Provider>
    );
  };