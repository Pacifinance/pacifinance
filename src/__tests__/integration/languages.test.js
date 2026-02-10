/**
 * Integration tests for Languages
 * Validates language file structure and completeness
 * Tests the i18n structure (src/i18n/locales/)
 */

import { describe, it, expect } from 'vitest';
import { getTranslations, getAvailableLanguages } from '../../i18n';
import itTranslations from '../../i18n/locales/it.json';
import enTranslations from '../../i18n/locales/en.json';

describe('Languages Integration', () => {
  const supportedLanguages = ['it', 'en'];

  describe('New i18n Structure', () => {
    it('should export getTranslations function', () => {
      expect(getTranslations).toBeDefined();
      expect(typeof getTranslations).toBe('function');
    });

    it('should export getAvailableLanguages function', () => {
      expect(getAvailableLanguages).toBeDefined();
      expect(typeof getAvailableLanguages).toBe('function');
    });

    it('should return correct available languages', () => {
      const availableLanguages = getAvailableLanguages();
      expect(availableLanguages).toEqual(expect.arrayContaining(['it', 'en']));
    });

    it('should return translations for Italian', () => {
      const translations = getTranslations('it');
      expect(translations).toBeDefined();
      expect(translations).toEqual(itTranslations);
    });

    it('should return translations for English', () => {
      const translations = getTranslations('en');
      expect(translations).toBeDefined();
      expect(translations).toEqual(enTranslations);
    });

    it('should fallback to English for unsupported language', () => {
      const translations = getTranslations('unsupported');
      expect(translations).toEqual(enTranslations);
    });

    it('should have it.json and en.json with same top-level keys', () => {
      const itKeys = Object.keys(itTranslations).sort();
      const enKeys = Object.keys(enTranslations).sort();
      expect(itKeys).toEqual(enKeys);
    });

    it('should have assets in new structure', () => {
      expect(itTranslations.assets).toBeDefined();
      expect(enTranslations.assets).toBeDefined();
    });

    it('should have same asset keys in new structure', () => {
      const itKeys = Object.keys(itTranslations.assets).sort();
      const enKeys = Object.keys(enTranslations.assets).sort();
      expect(itKeys).toEqual(enKeys);
    });

    it('should have required asset types in new structure', () => {
      const requiredAssets = ['bank', 'cash', 'stocks', 'etf', 'bitcoin', 'crypto'];
      
      requiredAssets.forEach(asset => {
        expect(itTranslations.assets[asset]).toBeDefined();
        expect(itTranslations.assets[asset].length).toBeGreaterThan(0);
        expect(enTranslations.assets[asset]).toBeDefined();
        expect(enTranslations.assets[asset].length).toBeGreaterThan(0);
      });
    });

    it('should have general section in new structure', () => {
      expect(itTranslations.general).toBeDefined();
      expect(enTranslations.general).toBeDefined();
    });

    it('should have months section in new structure', () => {
      expect(itTranslations.months).toBeDefined();
      expect(enTranslations.months).toBeDefined();
    });

    it('should have all 12 months in new structure', () => {
      const monthKeys = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
      ];
      
      monthKeys.forEach(month => {
        expect(itTranslations.months[month]).toBeDefined();
        expect(enTranslations.months[month]).toBeDefined();
      });
    });
  });

  describe('Comprehensive i18n Validation', () => {
    it('should have same asset keys in both languages', () => {
      const itKeys = Object.keys(itTranslations.assets).sort();
      const enKeys = Object.keys(enTranslations.assets).sort();
      expect(itKeys).toEqual(enKeys);
    });

    it('should have required asset types', () => {
      const requiredAssets = ['bank', 'cash', 'stocks', 'etf', 'bitcoin', 'crypto'];
      
      requiredAssets.forEach(asset => {
        expect(itTranslations.assets[asset]).toBeDefined();
        expect(itTranslations.assets[asset].length).toBeGreaterThan(0);
        expect(enTranslations.assets[asset]).toBeDefined();
        expect(enTranslations.assets[asset].length).toBeGreaterThan(0);
      });
    });

    it('should have same general keys in both languages', () => {
      const itKeys = Object.keys(itTranslations.general).sort();
      const enKeys = Object.keys(enTranslations.general).sort();
      expect(itKeys).toEqual(enKeys);
    });

    it('should have required general terms', () => {
      const requiredTerms = ['month', 'year', 'incomes', 'outflows', 'balance', 'total', 'confirm', 'cancel'];
      
      requiredTerms.forEach(term => {
        expect(itTranslations.general[term]).toBeDefined();
        expect(enTranslations.general[term]).toBeDefined();
      });
    });

    it('should have comingSoon text', () => {
      expect(itTranslations.general.comingSoon).toBeDefined();
      expect(itTranslations.general.weAreWorking).toBeDefined();
      expect(enTranslations.general.comingSoon).toBeDefined();
      expect(enTranslations.general.weAreWorking).toBeDefined();
    });

    it('should have all 12 months', () => {
      const monthKeys = [
        'january', 'february', 'march', 'april',
        'may', 'june', 'july', 'august',
        'september', 'october', 'november', 'december'
      ];
      
      monthKeys.forEach(month => {
        expect(itTranslations.months[month]).toBeDefined();
        expect(itTranslations.months[month].length).toBeGreaterThan(0);
        expect(enTranslations.months[month]).toBeDefined();
        expect(enTranslations.months[month].length).toBeGreaterThan(0);
      });
    });

    it('should have cookie consent texts', () => {
      expect(itTranslations.cookie).toBeDefined();
      expect(itTranslations.cookie.title).toBeDefined();
      expect(itTranslations.cookie.acceptButton).toBeDefined();
      expect(enTranslations.cookie).toBeDefined();
      expect(enTranslations.cookie.title).toBeDefined();
      expect(enTranslations.cookie.acceptButton).toBeDefined();
    });

    it('should have same cookie keys in both languages', () => {
      const itKeys = Object.keys(itTranslations.cookie).sort();
      const enKeys = Object.keys(enTranslations.cookie).sort();
      expect(itKeys).toEqual(enKeys);
    });

    it('should have landing page texts', () => {
      expect(itTranslations.landing).toBeDefined();
      expect(enTranslations.landing).toBeDefined();
    });

    it('should not have empty strings', () => {
      const checkEmpty = (obj, path = '') => {
        Object.keys(obj).forEach(key => {
          const value = obj[key];
          const currentPath = path ? `${path}.${key}` : key;
          
          if (typeof value === 'string') {
            expect(value.trim().length, `Empty string at: ${currentPath}`).toBeGreaterThan(0);
          } else if (typeof value === 'object' && value !== null) {
            checkEmpty(value, currentPath);
          }
        });
      };
      
      checkEmpty(itTranslations, 'it');
      checkEmpty(enTranslations, 'en');
    });

    it('should have different content in IT vs EN for key terms', () => {
      expect(itTranslations.general.incomes).not.toBe(enTranslations.general.incomes);
      expect(itTranslations.general.outflows).not.toBe(enTranslations.general.outflows);
      expect(itTranslations.months.january).not.toBe(enTranslations.months.january);
    });
  });

  describe('Deep Structure Consistency', () => {
    const getNestedKeys = (obj, prefix = '') => {
      const keys = [];
      Object.keys(obj).forEach(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          keys.push(...getNestedKeys(obj[key], fullKey));
        } else {
          keys.push(fullKey);
        }
      });
      return keys.sort();
    };

    it('should have identical nested structure in IT and EN', () => {
      const itKeys = getNestedKeys(itTranslations);
      const enKeys = getNestedKeys(enTranslations);
      
      const missingInEn = itKeys.filter(k => !enKeys.includes(k));
      const missingInIt = enKeys.filter(k => !itKeys.includes(k));
      
      if (missingInEn.length > 0) {
        console.warn('Keys missing in EN:', missingInEn);
      }
      if (missingInIt.length > 0) {
        console.warn('Keys missing in IT:', missingInIt);
      }
      
      expect(itKeys).toEqual(enKeys);
    });
  });
});
