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
      expect(getLanguageFromPath('/fr/dashboard')).toBeNull();
      expect(getLanguageFromPath('/de/profile')).toBeNull();
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
      expect(isValidLanguage('fr')).toBe(false);
      expect(isValidLanguage('de')).toBe(false);
      expect(isValidLanguage('invalid')).toBe(false);
    });
  });

  describe('availableLanguages', () => {
    it('should contain expected languages', () => {
      expect(availableLanguages).toContain('it');
      expect(availableLanguages).toContain('en');
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
