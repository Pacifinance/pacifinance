/**
 * Tests for i18n Routing Utilities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getLanguageFromPath,
  removeLanguageFromPath,
  addLanguageToPath,
  getLocalizedPath,
  getInitialLanguage,
  isValidLanguage,
  availableLanguages,
  defaultLanguage
} from '../../utils/i18nRouting';

describe('i18nRouting utilities', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = value.toString(); },
      removeItem: (key) => { delete store[key]; },
      clear: () => { store = {}; }
    };
  })();

  beforeEach(() => {
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
    localStorageMock.clear();
  });

  describe('getLanguageFromPath', () => {
    it('should extract language from URL path', () => {
      expect(getLanguageFromPath('/it/dashboard')).toBe('it');
      expect(getLanguageFromPath('/en/profile')).toBe('en');
    });

    it('should return null for paths without language', () => {
      expect(getLanguageFromPath('/dashboard')).toBeNull();
      expect(getLanguageFromPath('/')).toBeNull();
    });

    it('should return null for invalid language codes', () => {
      expect(getLanguageFromPath('/xx/dashboard')).toBeNull();
      expect(getLanguageFromPath('/zh/profile')).toBeNull();
    });
  });

  describe('removeLanguageFromPath', () => {
    it('should remove language prefix from path', () => {
      expect(removeLanguageFromPath('/it/dashboard')).toBe('/dashboard');
      expect(removeLanguageFromPath('/en/profile')).toBe('/profile');
    });

    it('should return path unchanged if no language prefix', () => {
      expect(removeLanguageFromPath('/dashboard')).toBe('/dashboard');
      expect(removeLanguageFromPath('/')).toBe('/');
    });

    it('should handle complex paths', () => {
      expect(removeLanguageFromPath('/it/insert-values?section=balance')).toBe('/insert-values?section=balance');
      expect(removeLanguageFromPath('/en/profile#settings')).toBe('/profile#settings');
    });

    it('should return root "/" when path is just the language prefix', () => {
      expect(removeLanguageFromPath('/it')).toBe('/');
      expect(removeLanguageFromPath('/en')).toBe('/');
    });

    it('should handle trailing slashes on language-only paths', () => {
      expect(removeLanguageFromPath('/it/')).toBe('/');
      expect(removeLanguageFromPath('/en/')).toBe('/');
    });

    it('should handle deeply nested paths', () => {
      expect(removeLanguageFromPath('/it/a/b/c/d')).toBe('/a/b/c/d');
      expect(removeLanguageFromPath('/en/charts-statistics')).toBe('/charts-statistics');
    });

    it('should not strip segments that look like language codes but are not in supported list', () => {
      expect(removeLanguageFromPath('/xx/dashboard')).toBe('/xx/dashboard');
      expect(removeLanguageFromPath('/zh/profile')).toBe('/zh/profile');
      expect(removeLanguageFromPath('/zz/test')).toBe('/zz/test');
    });

    it('should handle empty string', () => {
      expect(removeLanguageFromPath('')).toBe('');
    });

    it('should handle paths with query and hash combined', () => {
      expect(removeLanguageFromPath('/it/settings?lang=en#theme')).toBe('/settings?lang=en#theme');
    });

    it('should handle paths where a later segment matches a language code', () => {
      // e.g. /dashboard/it should NOT strip "it" since it is not first segment
      expect(removeLanguageFromPath('/dashboard/it')).toBe('/dashboard/it');
      expect(removeLanguageFromPath('/profile/en/settings')).toBe('/profile/en/settings');
    });

    it('should handle double slashes gracefully', () => {
      // filter(Boolean) removes empty segments from "//"
      const result = removeLanguageFromPath('/it//dashboard');
      expect(result).toBe('/dashboard');
    });
  });

  describe('addLanguageToPath', () => {
    it('should add language prefix to path', () => {
      expect(addLanguageToPath('/dashboard', 'it')).toBe('/it/dashboard');
      expect(addLanguageToPath('/profile', 'en')).toBe('/en/profile');
    });

    it('should handle root path', () => {
      expect(addLanguageToPath('/', 'it')).toBe('/it');
      expect(addLanguageToPath('', 'en')).toBe('/en');
    });

    it('should remove existing language prefix before adding new one', () => {
      expect(addLanguageToPath('/en/dashboard', 'it')).toBe('/it/dashboard');
      expect(addLanguageToPath('/it/profile', 'en')).toBe('/en/profile');
    });

    it('should preserve query strings and hashes', () => {
      expect(addLanguageToPath('/dashboard?tab=overview', 'it')).toBe('/it/dashboard?tab=overview');
      expect(addLanguageToPath('/profile#settings', 'en')).toBe('/en/profile#settings');
    });
  });

  describe('getLocalizedPath', () => {
    it('should return path with language prefix', () => {
      expect(getLocalizedPath('/dashboard', 'it')).toBe('/it/dashboard');
      expect(getLocalizedPath('/profile', 'en')).toBe('/en/profile');
    });

    it('should handle query strings', () => {
      expect(getLocalizedPath('/insert-values?section=balance', 'it')).toBe('/it/insert-values?section=balance');
    });

    it('should handle hashes', () => {
      expect(getLocalizedPath('/profile#settings', 'en')).toBe('/en/profile#settings');
    });

    it('should handle both query strings and hashes', () => {
      const path = '/dashboard?tab=overview#section';
      const localized = getLocalizedPath(path, 'it');
      expect(localized).toContain('/it/dashboard');
      expect(localized).toContain('tab=overview');
      expect(localized).toContain('#section');
    });
  });

  describe('isValidLanguage', () => {
    it('should return true for valid languages', () => {
      expect(isValidLanguage('it')).toBe(true);
      expect(isValidLanguage('en')).toBe(true);
    });

    it('should return false for invalid languages', () => {
      expect(isValidLanguage('xx')).toBe(false);
      expect(isValidLanguage('zh')).toBe(false);
      expect(isValidLanguage('invalid')).toBe(false);
    });
  });

  describe('availableLanguages', () => {
    it('should contain expected languages', () => {
      expect(availableLanguages).toContain('it');
      expect(availableLanguages).toContain('en');
      expect(availableLanguages).toContain('es');
      expect(availableLanguages).toContain('de');
      expect(availableLanguages).toContain('fr');
      expect(availableLanguages).toContain('pt-BR');
      expect(Array.isArray(availableLanguages)).toBe(true);
    });
  });

  describe('defaultLanguage', () => {
    it('should be a valid language', () => {
      expect(isValidLanguage(defaultLanguage)).toBe(true);
    });

    it('should be English', () => {
      expect(defaultLanguage).toBe('en');
    });
  });

  describe('getInitialLanguage', () => {
    it('should prioritize URL language', () => {
      const result = getInitialLanguage('/it/dashboard');
      expect(result).toBe('it');
    });

    it('should use localStorage if no URL language', () => {
      localStorageMock.setItem('pacifinance-language', 'it');
      
      const result = getInitialLanguage('/dashboard');
      expect(result).toBe('it');
    });

    it('should fallback to browser detection', () => {
      // This test would require mocking navigator.language
      // For now, we just ensure it returns a valid language
      const result = getInitialLanguage('/dashboard');
      expect(isValidLanguage(result)).toBe(true);
    });
  });
});
