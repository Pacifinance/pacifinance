import { useMemo, useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

// Cache per le traduzioni già caricate
const translationCache = new Map();

export const useLandingTranslations = () => {
  const { language } = useContext(LanguageContext);
  
  return useMemo(() => {
    // Controlla la cache prima
    const cacheKey = `landing-${language}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey);
    }

    // Lazy import delle sole traduzioni necessarie per la landing
    const loadTranslations = async () => {
      try {
        const translations = await import('../data/languages.json');
        const landingTranslations = {
          landing: translations.default[language].landing,
          header: translations.default[language].header
        };
        
        // Salva in cache
        translationCache.set(cacheKey, landingTranslations);
        return landingTranslations;
      } catch (error) {
        console.error('Error loading translations:', error);
        return null;
      }
    };

    return loadTranslations();
  }, [language]);
};