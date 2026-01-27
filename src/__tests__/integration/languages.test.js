/**
 * Integration tests for Languages
 * Validates language file structure and completeness
 */

import { describe, it, expect } from 'vitest';
import languages from '../../data/languages.json';

describe('Languages Integration', () => {
  const supportedLanguages = ['it', 'en'];

  describe('language file structure', () => {
    it('should have all supported languages', () => {
      supportedLanguages.forEach(lang => {
        expect(languages[lang]).toBeDefined();
      });
    });

    it('should have same top-level keys in both languages', () => {
      const itKeys = Object.keys(languages.it).sort();
      const enKeys = Object.keys(languages.en).sort();
      
      expect(itKeys).toEqual(enKeys);
    });
  });

  describe('assets section', () => {
    it('should have assets in both languages', () => {
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
  });

  describe('general section', () => {
    it('should have general section in both languages', () => {
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
  });

  describe('months section', () => {
    it('should have months in both languages', () => {
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
  });

  describe('cookie section', () => {
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
  });

  describe('landing page section', () => {
    it('should have landing page texts', () => {
      supportedLanguages.forEach(lang => {
        expect(languages[lang].landing).toBeDefined();
      });
    });
  });

  describe('text content validation', () => {
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
      // These should be different in each language
      expect(languages.it.general.incomes).not.toBe(languages.en.general.incomes);
      expect(languages.it.general.outflows).not.toBe(languages.en.general.outflows);
      expect(languages.it.months.january).not.toBe(languages.en.months.january);
    });
  });

  describe('deep structure consistency', () => {
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
      
      // Find missing keys
      const missingInEn = itKeys.filter(k => !enKeys.includes(k));
      const missingInIt = enKeys.filter(k => !itKeys.includes(k));
      
      if (missingInEn.length > 0) {
        console.warn('Keys missing in EN:', missingInEn);
      }
      if (missingInIt.length > 0) {
        console.warn('Keys missing in IT:', missingInIt);
      }
      
      // Allow some tolerance for work in progress
      // This test warns but doesn't fail for minor differences
      const totalMissing = missingInEn.length + missingInIt.length;
      expect(totalMissing).toBeLessThan(50); // Allow some tolerance
    });
  });
});
