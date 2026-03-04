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

// Get translation by language
export const getTranslations = (language = DEFAULT_LANGUAGE) => {
  return languages[language] || languages[DEFAULT_LANGUAGE];
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
