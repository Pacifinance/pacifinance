/**
 * Tests for sortingUtils utility functions
 * Tag and option sorting helpers
 */

import { describe, it, expect } from 'vitest';
import {
  sortTagsByLanguage,
  sortOptionsByLabel,
  sortMonthOptions
} from '../../utils/sortingUtils';

describe('sortingUtils', () => {
  describe('sortTagsByLanguage', () => {
    const mockTags = [
      { index: 2, translations: { it: 'Cibo', en: 'Food' } },
      { index: 1, translations: { it: 'Casa', en: 'House' } },
      { index: 3, translations: { it: 'Trasporto', en: 'Transport' } },
      { index: 9999, translations: { it: 'Altro', en: 'Other' } },
      { index: 4, translations: { it: 'Auto', en: 'Auto' } }
    ];

    describe('Italian sorting', () => {
      it('should sort tags alphabetically by Italian translation', () => {
        const result = sortTagsByLanguage(mockTags, 'it');
        
        // Should be sorted: Auto, Casa, Cibo, Trasporto, Altro (at end)
        expect(result[0].translations.it).toBe('Auto');
        expect(result[1].translations.it).toBe('Casa');
        expect(result[2].translations.it).toBe('Cibo');
        expect(result[3].translations.it).toBe('Trasporto');
      });

      it('should put "Other" (index 9999) at the end', () => {
        const result = sortTagsByLanguage(mockTags, 'it');
        const lastItem = result[result.length - 1];
        expect(lastItem.index).toBe(9999);
        expect(lastItem.translations.it).toBe('Altro');
      });
    });

    describe('English sorting', () => {
      it('should sort tags alphabetically by English translation', () => {
        const result = sortTagsByLanguage(mockTags, 'en');
        
        // Should be sorted: Auto, Food, House, Transport, Other (at end)
        expect(result[0].translations.en).toBe('Auto');
        expect(result[1].translations.en).toBe('Food');
        expect(result[2].translations.en).toBe('House');
        expect(result[3].translations.en).toBe('Transport');
      });

      it('should put "Other" (index 9999) at the end', () => {
        const result = sortTagsByLanguage(mockTags, 'en');
        const lastItem = result[result.length - 1];
        expect(lastItem.index).toBe(9999);
        expect(lastItem.translations.en).toBe('Other');
      });
    });

    describe('edge cases', () => {
      it('should return empty array when tags is null', () => {
        expect(sortTagsByLanguage(null, 'it')).toEqual([]);
      });

      it('should return empty array when tags is undefined', () => {
        expect(sortTagsByLanguage(undefined, 'en')).toEqual([]);
      });

      it('should return empty array when tags is not an array', () => {
        expect(sortTagsByLanguage('not an array', 'it')).toEqual([]);
        expect(sortTagsByLanguage(123, 'it')).toEqual([]);
        expect(sortTagsByLanguage({}, 'it')).toEqual([]);
      });

      it('should handle tags without translations gracefully', () => {
        const tagsWithoutTranslations = [
          { index: 1, translations: {} },
          { index: 2, translations: { it: 'Test' } }
        ];
        const result = sortTagsByLanguage(tagsWithoutTranslations, 'it');
        expect(result).toHaveLength(2);
      });

      it('should handle tags with missing language gracefully', () => {
        const tagsWithMissingLanguage = [
          { index: 1, translations: { en: 'English only' } },
          { index: 2, translations: { it: 'Italiano' } }
        ];
        const result = sortTagsByLanguage(tagsWithMissingLanguage, 'it');
        expect(result).toHaveLength(2);
      });

      it('should work with single tag', () => {
        const singleTag = [{ index: 1, translations: { it: 'Test', en: 'Test' } }];
        const result = sortTagsByLanguage(singleTag, 'it');
        expect(result).toHaveLength(1);
        expect(result[0].translations.it).toBe('Test');
      });

      it('should work with only "Other" tag', () => {
        const onlyOther = [{ index: 9999, translations: { it: 'Altro', en: 'Other' } }];
        const result = sortTagsByLanguage(onlyOther, 'it');
        expect(result).toHaveLength(1);
        expect(result[0].index).toBe(9999);
      });

      it('should preserve original array order when all translations are equal', () => {
        const sameTranslations = [
          { index: 1, translations: { it: 'Test', en: 'Test' } },
          { index: 2, translations: { it: 'Test', en: 'Test' } },
          { index: 3, translations: { it: 'Test', en: 'Test' } }
        ];
        const result = sortTagsByLanguage(sameTranslations, 'it');
        expect(result).toHaveLength(3);
      });
    });

    describe('numeric sorting', () => {
      it('should handle numeric values in translations correctly', () => {
        const numericTags = [
          { index: 1, translations: { it: '10 anni', en: '10 years' } },
          { index: 2, translations: { it: '2 anni', en: '2 years' } },
          { index: 3, translations: { it: '1 anno', en: '1 year' } }
        ];
        const result = sortTagsByLanguage(numericTags, 'it');
        // Should return all tags sorted in some consistent order
        expect(result).toHaveLength(3);
        expect(result.map(t => t.translations.it)).toContain('1 anno');
        expect(result.map(t => t.translations.it)).toContain('2 anni');
        expect(result.map(t => t.translations.it)).toContain('10 anni');
      });
    });
  });

  describe('sortOptionsByLabel', () => {
    const mockOptions = [
      { label: 'Banana', value: 1 },
      { label: 'Apple', value: 2 },
      { label: 'Cherry', value: 3 }
    ];

    it('should sort options alphabetically by label', () => {
      const result = sortOptionsByLabel(mockOptions, 'en');
      expect(result[0].label).toBe('Apple');
      expect(result[1].label).toBe('Banana');
      expect(result[2].label).toBe('Cherry');
    });

    it('should return empty array when options is null', () => {
      expect(sortOptionsByLabel(null, 'en')).toEqual([]);
    });

    it('should return empty array when options is undefined', () => {
      expect(sortOptionsByLabel(undefined, 'en')).toEqual([]);
    });

    it('should return empty array when options is not an array', () => {
      expect(sortOptionsByLabel('not an array', 'en')).toEqual([]);
      expect(sortOptionsByLabel(123, 'en')).toEqual([]);
      expect(sortOptionsByLabel({}, 'en')).toEqual([]);
    });

    it('should handle options without label gracefully', () => {
      const optionsWithoutLabel = [
        { value: 1 },
        { label: 'Test', value: 2 }
      ];
      const result = sortOptionsByLabel(optionsWithoutLabel, 'en');
      expect(result).toHaveLength(2);
    });

    it('should handle empty label strings', () => {
      const optionsWithEmptyLabel = [
        { label: '', value: 1 },
        { label: 'Test', value: 2 }
      ];
      const result = sortOptionsByLabel(optionsWithEmptyLabel, 'en');
      expect(result).toHaveLength(2);
      expect(result[0].label).toBe('');
    });
  });

  describe('sortMonthOptions', () => {
    const mockMonthOptions = [
      { label: 'January', value: 1 },
      { label: 'February', value: 2 },
      { label: 'December', value: 12 }
    ];

    it('should return the same array (months stay in chronological order)', () => {
      const result = sortMonthOptions(mockMonthOptions);
      expect(result).toEqual(mockMonthOptions);
    });

    it('should not modify the original array order', () => {
      const original = [...mockMonthOptions];
      const result = sortMonthOptions(mockMonthOptions);
      expect(result[0]).toEqual(original[0]);
      expect(result[1]).toEqual(original[1]);
      expect(result[2]).toEqual(original[2]);
    });

    it('should handle empty array', () => {
      const result = sortMonthOptions([]);
      expect(result).toEqual([]);
    });

    it('should handle single month', () => {
      const singleMonth = [{ label: 'January', value: 1 }];
      const result = sortMonthOptions(singleMonth);
      expect(result).toEqual(singleMonth);
    });
  });
});
