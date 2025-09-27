// Utility per caricare le traduzioni in modo lazy
let cachedLanguages = null;

export const loadLanguages = async () => {
  if (cachedLanguages) {
    return cachedLanguages;
  }
  
  try {
    // Carica il file languages.json in modo dinamico
    const module = await import('../data/languages.json');
    cachedLanguages = module.default;
    return cachedLanguages;
  } catch (error) {
    console.error('Error loading languages:', error);
    // Fallback a un oggetto vuoto con struttura base
    return {
      it: { general: { loading: 'Caricamento...' } },
      en: { general: { loading: 'Loading...' } }
    };
  }
};

// Funzione per ottenere una traduzione specifica
export const getTranslation = async (language, path) => {
  const languages = await loadLanguages();
  const keys = path.split('.');
  let result = languages[language];
  
  for (const key of keys) {
    if (result && typeof result === 'object' && result[key] !== undefined) {
      result = result[key];
    } else {
      return path; // Fallback al path originale
    }
  }
  
  return result || path;
};

// Hook per React components
import { useState, useEffect } from 'react';

export const useLanguages = () => {
  const [languages, setLanguages] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLanguages()
      .then(setLanguages)
      .finally(() => setLoading(false));
  }, []);

  return { languages, loading };
};