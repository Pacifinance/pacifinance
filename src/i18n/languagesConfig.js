/**
 * Centralized Language Configuration
 * 
 * This file is the SINGLE SOURCE OF TRUTH for all supported languages.
 * When adding a new language, update ONLY this file and create the translation file.
 * All other components will automatically pick up the new language.
 */

/**
 * Supported languages configuration
 * Each language has:
 * - code: ISO 639-1 language code (used in URLs)
 * - name: Native name of the language
 * - englishName: English name (for reference)
 * - flag: Emoji flag for visual representation
 * - isRTL: Right-to-left text direction (for Arabic, Hebrew, etc.)
 */
export const SUPPORTED_LANGUAGES = [
  {
    code: 'it',
    name: 'Italiano',
    englishName: 'Italian',
    flag: '🇮🇹',
    isRTL: false
  },
  {
    code: 'en',
    name: 'English',
    englishName: 'English',
    flag: '🇬🇧',
    isRTL: false
  }
];

/**
 * Default language fallback
 */
export const DEFAULT_LANGUAGE = 'en';

/**
 * Get array of language codes only
 * @returns {string[]} Array of language codes
 */
export const getLanguageCodes = () => SUPPORTED_LANGUAGES.map(lang => lang.code);

/**
 * Get language configuration by code
 * @param {string} code - Language code (e.g., 'it', 'en')
 * @returns {Object|undefined} Language configuration object
 */
export const getLanguageByCode = (code) => 
  SUPPORTED_LANGUAGES.find(lang => lang.code === code);

/**
 * Check if a language code is valid/supported
 * @param {string} code - Language code to validate
 * @returns {boolean} True if language is supported
 */
export const isValidLanguage = (code) => 
  SUPPORTED_LANGUAGES.some(lang => lang.code === code);

/**
 * Get language name in its native form
 * @param {string} code - Language code
 * @returns {string} Native language name or code if not found
 */
export const getLanguageName = (code) => {
  const lang = getLanguageByCode(code);
  return lang ? lang.name : code;
};

/**
 * Get language flag emoji
 * @param {string} code - Language code
 * @returns {string} Flag emoji or empty string
 */
export const getLanguageFlag = (code) => {
  const lang = getLanguageByCode(code);
  return lang ? lang.flag : '';
};

export default SUPPORTED_LANGUAGES;
