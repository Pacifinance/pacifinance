/**
 * Integration tests for Languages
 * Validates language file structure and completeness
 * Tests both new i18n structure and backward compatibility
 */

import { describe, it, expect } from 'vitest';
import { getTranslations, getAvailableLanguages } from '../../i18n';
import itTranslations from '../../i18n/locales/it.json';
import enTranslations from '../../i18n/locales/en.json';
import languages from '../../data/languages.json'; // Backward compatibility test

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

  describe('Backward Compatibility', () => {
    it('old languages.json should still exist', () => {
      expect(languages).toBeDefined();
    });

    it('should have all supported languages in old format', () => {
      supportedLanguages.forEach(lang => {
        expect(languages[lang]).toBeDefined();
      });
    });

    it('should have same top-level keys in both languages', () => {
      const itKeys = Object.keys(languages.it).sort();
      const enKeys = Object.keys(languages.en).sort();
      expect(itKeys).toEqual(enKeys);
    });

    it('should have assets section', () => {
      supportedLanguages.forEach(lang => {
        expect(languages[lang].assets).toBeDefined();
      });
    });

    it('should have same asset keys in both languages', () => {
      const itKeys = Object.keys(languages.it.assets).sort();
      const enKeys = Object.keys(languages.en.assets).sort();
      expect(itKeys).toEqual(enKeys);
    });

    it('should have required asset types', () => {
      const requiredAssets = ['bank', 'cash', 'stocks', 'etf', 'bitcoin', 'crypto'];
      
      supportedLanguages.forEach(lang => {
        requiredAssets.forEach(asset => {
          expect(languages[lang].assets[asset]).toBeDefined();
          expect(languages[lang].assets[asset].length).toBeGreaterThan(0);
        });
      });
    });

    it('should have general section', () => {
      supportedLanguages.forEach(lang => {
        expect(languages[lang].general).toBeDefined();
      });
    });

    it('should have same general keys in both languages', () => {
      const itKeys = Object.keys(languages.it.general).sort();
      const enKeys = Object.keys(languages.en.general).sort();
      expect(itKeys).toEqual(enKeys);
    });

    it('should have required general terms', () => {
      const requiredTerms = ['month', 'year', 'incomes', 'outflows', 'balance', 'total', 'confirm', 'cancel'];
      
      supportedLanguages.forEach(lang => {
        requiredTerms.forEach(term => {
          expect(languages[lang].general[term]).toBeDefined();
        });
      });
    });

    it('should have comingSoon text', () => {
      supportedLanguages.forEach(lang => {
        expect(languages[lang].general.comingSoon).toBeDefined();
        expect(languages[lang].general.weAreWorking).toBeDefined();
      });
    });

    it('should have months section', () => {
      supportedLanguages.forEach(lang => {
        expect(languages[lang].months).toBeDefined();
      });
    });

    it('should have all 12 months', () => {
      const monthKeys = [
        'january', 'february', 'march', 'april',
        'may', 'june', 'july', 'august',
        'september', 'october', 'november', 'december'
      ];
      
      supportedLanguages.forEach(lang => {
        monthKeys.forEach(month => {
          expect(languages[lang].months[month]).toBeDefined();
          expect(languages[lang].months[month].length).toBeGreaterThan(0);
        });
      });
    });

    it('should have cookie consent texts', () => {
      supportedLanguages.forEach(lang => {
        expect(languages[lang].cookie).toBeDefined();
        expect(languages[lang].cookie.title).toBeDefined();
        expect(languages[lang].cookie.acceptButton).toBeDefined();
      });
    });

    it('should have same cookie keys in both languages', () => {
      const itKeys = Object.keys(languages.it.cookie).sort();
      const enKeys = Object.keys(languages.en.cookie).sort();
      expect(itKeys).toEqual(enKeys);
    });

    it('should have landing page texts', () => {
      supportedLanguages.forEach(lang => {
        expect(languages[lang].landing).toBeDefined();
      });
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
      
      supportedLanguages.forEach(lang => {
        checkEmpty(languages[lang], lang);
      });
    });

    it('should have different content in IT vs EN for key terms', () => {
      expect(languages.it.general.incomes).not.toBe(languages.en.general.incomes);
      expect(languages.it.general.outflows).not.toBe(languages.en.general.outflows);
      expect(languages.it.months.january).not.toBe(languages.en.months.january);
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

    it('should have mostly identical nested structure in both languages', () => {
      const itKeys = getNestedKeys(languages.it);
      const enKeys = getNestedKeys(languages.en);
      
      const missingInEn = itKeys.filter(k => !enKeys.includes(k));
      const missingInIt = enKeys.filter(k => !itKeys.includes(k));
      
      if (missingInEn.length > 0) {
        console.warn('Keys missing in EN:', missingInEn);
      }
      if (missingInIt.length > 0) {
        console.warn('Keys missing in IT:', missingInIt);
      }
      
      const totalMissing = missingInEn.length + missingInIt.length;
      expect(totalMissing).toBeLessThan(50);
    });

    it('new i18n structure should match old structure', () => {
      const oldItKeys = getNestedKeys(languages.it);
      const newItKeys = getNestedKeys(itTranslations);
      
      expect(oldItKeys).toEqual(newItKeys);
    });
  });
});
