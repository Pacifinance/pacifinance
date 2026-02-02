// i18n Configuration
// Centralized internationalization system

import it from './locales/it.json';
import en from './locales/en.json';

// Available languages
const languages = {
  it,
  en
};

// Get translation by language
export const getTranslations = (language = 'en') => {
  return languages[language] || languages.en;
};

// Get all available languages
export const getAvailableLanguages = () => {
  return Object.keys(languages);
};

// Export languages object for backward compatibility
export default languages;
