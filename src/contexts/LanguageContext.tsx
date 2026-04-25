import React, { useState, createContext, useEffect } from 'react';
import { getTranslations, getAvailableLanguages } from '../i18n';
import { getInitialLanguage } from '../utils/i18nRouting';

export const LanguageContext = createContext();

/**
 * Detects browser language and matches with available languages
 * @returns {string} Detected language code (it, en, etc.) or 'en' as fallback
 */
const detectBrowserLanguage = () => {
    const availableLanguages = getAvailableLanguages();
    
    // Get browser language
    const browserLang = navigator.language || navigator.userLanguage;
    
    // Extract language code (e.g., 'it-IT' -> 'it')
    const langCode = browserLang.split('-')[0].toLowerCase();
    
    // Return if supported, otherwise fallback to English
    return availableLanguages.includes(langCode) ? langCode : 'en';
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        // Get initial language from URL, localStorage, or browser
        // Note: window.location.pathname might not be available on first render
        // so we'll also handle this in useEffect
        if (typeof window !== 'undefined') {
            return getInitialLanguage(window.location.pathname);
        }
        
        // Fallback for SSR or initial load
        const savedLanguage = localStorage.getItem('pacifinance-language');
        if (savedLanguage) {
            return savedLanguage;
        }
        
        return detectBrowserLanguage();
    });

    // Carica le traduzioni per la lingua corrente
    const translations = getTranslations(language);

    useEffect(() => {
        // Save language preference to localStorage when it changes
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
        translations, // Nuovo: fornisce le traduzioni direttamente
        setLanguage: setLanguageWithPersistence, 
        toggleLanguage 
      }}>
        {children}
      </LanguageContext.Provider>
    );
};