/**
 * i18n Routing Utilities
 * Manages URL-based internationalization for SEO and UX
 */

import { 
  getLanguageCodes, 
  DEFAULT_LANGUAGE, 
  isValidLanguage as checkValidLanguage,
  SUPPORTED_LANGUAGES
} from '../i18n';

/**
 * Get available languages (dynamically from config)
 * @returns {Array<string>} Array of language codes
 */
export const availableLanguages = getLanguageCodes();

/**
 * Default language fallback (from central config)
 */
export const defaultLanguage = DEFAULT_LANGUAGE;

/**
 * Get full language configuration
 * Useful for displaying language info in UI
 */
export const supportedLanguages = SUPPORTED_LANGUAGES;

/**
 * Extract language code from URL pathname
 * @param {string} pathname - Current URL pathname
 * @returns {string|null} Language code if found, null otherwise
 */
export const getLanguageFromPath = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (firstSegment && availableLanguages.includes(firstSegment)) {
    return firstSegment;
  }
  
  return null;
};

/**
 * Remove language prefix from pathname
 * @param {string} pathname - Current URL pathname
 * @returns {string} Pathname without language prefix
 */
export const removeLanguageFromPath = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (firstSegment && availableLanguages.includes(firstSegment)) {
    return '/' + segments.slice(1).join('/');
  }
  
  return pathname;
};

/**
 * Add language prefix to pathname
 * @param {string} pathname - Target pathname
 * @param {string} language - Language code to add
 * @returns {string} Pathname with language prefix
 */
export const addLanguageToPath = (pathname, language) => {
  // Remove any existing language prefix first
  const cleanPath = removeLanguageFromPath(pathname);
  
  // Don't add language prefix if it's the root path and language is default
  if (cleanPath === '/' || cleanPath === '') {
    return `/${language}`;
  }
  
  return `/${language}${cleanPath}`;
};

/**
 * Get pathname with language prefix
 * @param {string} to - Target path
 * @param {string} language - Current language
 * @returns {string} Complete path with language prefix
 */
export const getLocalizedPath = (to, language) => {
  // Separa pathname da query string e hash
  const queryIndex = to.indexOf('?');
  const hashIndex = to.indexOf('#');
  
  let pathname = to;
  let query = '';
  let hash = '';
  
  if (queryIndex !== -1) {
    pathname = to.substring(0, queryIndex);
    if (hashIndex !== -1 && hashIndex > queryIndex) {
      query = to.substring(queryIndex, hashIndex);
      hash = to.substring(hashIndex);
    } else {
      query = to.substring(queryIndex);
    }
  } else if (hashIndex !== -1) {
    pathname = to.substring(0, hashIndex);
    hash = to.substring(hashIndex);
  }
  
  const localizedPathname = addLanguageToPath(pathname, language);
  return `${localizedPathname}${query}${hash}`;
};

/**
 * Detect language from browser
 * @returns {string} Detected language code or default
 */
export const detectBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split('-')[0].toLowerCase();
  
  return availableLanguages.includes(langCode) ? langCode : defaultLanguage;
};

/**
 * Get language with priority system:
 * 1. URL parameter
 * 2. localStorage (user preference)
 * 3. Browser detection
 * @param {string} pathname - Current pathname
 * @returns {string} Language code
 */
export const getInitialLanguage = (pathname) => {
  // Priority 1: URL
  const urlLang = getLanguageFromPath(pathname);
  if (urlLang) {
    return urlLang;
  }
  
  // Priority 2: localStorage (user preference)
  const savedLang = localStorage.getItem('pacifinance-language');
  if (savedLang && availableLanguages.includes(savedLang)) {
    return savedLang;
  }
  
  // Priority 3: Browser detection
  return detectBrowserLanguage();
};

/**
 * Validate if language code is supported
 * @param {string} lang - Language code to validate
 * @returns {boolean} True if supported
 */
export const isValidLanguage = (lang) => {
  return availableLanguages.includes(lang);
};
