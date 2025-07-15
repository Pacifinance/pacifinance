import React, { useState, createContext, useEffect } from 'react';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Carica la lingua salvata dal localStorage, altrimenti usa 'en' come default
    const [language, setLanguage] = useState(() => {
        const savedLanguage = localStorage.getItem('pacifinance-language');
        return savedLanguage || 'en';
    });

    // Salva la lingua nel localStorage ogni volta che cambia
    useEffect(() => {
        localStorage.setItem('pacifinance-language', language);
    }, [language]);

    const toggleLanguage = () => {
        setLanguage(prevLanguage => prevLanguage === 'it' ? 'en' : 'it');
    };

    const setLanguageWithPersistence = (newLanguage) => {
        setLanguage(newLanguage);
        localStorage.setItem('pacifinance-language', newLanguage);
    };
  
    return (
      <LanguageContext.Provider value={{ 
        language, 
        setLanguage: setLanguageWithPersistence, 
        toggleLanguage 
      }}>
        {children}
      </LanguageContext.Provider>
    );
  };