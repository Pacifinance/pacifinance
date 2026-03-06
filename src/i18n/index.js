// i18n Configuration
// Centralized internationalization system

import it from './locales/it.json';
import en from './locales/en.json';
import es from './locales/es.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import ptBR from './locales/pt-BR.json';
import { 
  SUPPORTED_LANGUAGES, 
  DEFAULT_LANGUAGE,
  getLanguageCodes,
  getLanguageByCode,
  isValidLanguage,
  getLanguageName,
  getLanguageFlag
} from './languagesConfig';

// Available languages - mapped from config
const languages = {
  it,
  en,
  es,
  de,
  fr,
  'pt-BR': ptBR
};

/**
 * Deep merge two objects. Values from `source` override `target`.
 * Ensures every key present in `target` (the fallback) also exists in the result.
 */
const deepMerge = (target, source) => {
  if (!source) return target;
  if (!target) return source;

  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
};

// Get translation by language, with English fallback for any missing keys
export const getTranslations = (language = DEFAULT_LANGUAGE) => {
  const fallback = languages[DEFAULT_LANGUAGE];
  const selected = languages[language];
  if (!selected) return fallback;
  if (language === DEFAULT_LANGUAGE) return selected;
  // Deep merge: start from English fallback, override with selected language
  return deepMerge(fallback, selected);
};

// Get all available languages (codes only)
export const getAvailableLanguages = () => {
  return getLanguageCodes();
};

// Re-export everything from languagesConfig for convenience
export { 
  SUPPORTED_LANGUAGES, 
  DEFAULT_LANGUAGE,
  getLanguageCodes,
  getLanguageByCode,
  isValidLanguage,
  getLanguageName,
  getLanguageFlag
};

// Export languages object for backward compatibility
export default languages;
