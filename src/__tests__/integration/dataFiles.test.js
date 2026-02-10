/**
 * Integration tests for Data Files
 * Validates asset colors and icons
 */

import { describe, it, expect } from 'vitest';
import { assetColors } from '../../data/assetColors';
import { assetIcons } from '../../data/assetIcons';
import { outflowCategoryColors, incomeCategoryColors, getCategoryColor } from '../../data/categoryColors';
import itTranslations from '../../i18n/locales/it.json';
import enTranslations from '../../i18n/locales/en.json';

describe('Asset Colors Integration', () => {
  describe('structure', () => {
    it('should have assetColors object', () => {
      expect(assetColors).toBeDefined();
      expect(typeof assetColors).toBe('object');
    });

    it('should have required assets', () => {
      const requiredAssets = ['bank', 'cash', 'stocks', 'etf', 'bitcoin'];
      
      requiredAssets.forEach(asset => {
        expect(assetColors[asset]).toBeDefined();
      });
    });

    it('bank should have primary color', () => {
      expect(assetColors.bank.primary).toBeDefined();
      expect(assetColors.bank.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('cash should have gradient', () => {
      expect(assetColors.cash.gradient).toBeDefined();
      expect(assetColors.cash.gradient).toContain('linear-gradient');
    });
  });
});

describe('Asset Icons Integration', () => {
  describe('structure', () => {
    it('should have assetIcons object', () => {
      expect(assetIcons).toBeDefined();
      expect(typeof assetIcons).toBe('object');
    });

    it('should have icons for core assets', () => {
      const coreAssets = ['bank', 'cash', 'stocks'];
      
      coreAssets.forEach(asset => {
        expect(assetIcons[asset]).toBeDefined();
      });
    });
  });
});

describe('Category Colors Integration', () => {
  describe('outflowCategoryColors', () => {
    it('should have outflow category colors', () => {
      expect(outflowCategoryColors).toBeDefined();
      expect(typeof outflowCategoryColors).toBe('object');
    });

    it('should have common expense categories', () => {
      expect(outflowCategoryColors['Food']).toBeDefined();
      expect(outflowCategoryColors['House']).toBeDefined();
    });

    it('should have rgba color values', () => {
      Object.values(outflowCategoryColors).forEach(color => {
        expect(color).toMatch(/^rgba\(/);
      });
    });
  });

  describe('incomeCategoryColors', () => {
    it('should have income category colors', () => {
      expect(incomeCategoryColors).toBeDefined();
      expect(typeof incomeCategoryColors).toBe('object');
    });

    it('should have salary category', () => {
      expect(incomeCategoryColors['Salary']).toBeDefined();
    });
  });

  describe('getCategoryColor helper', () => {
    it('should return color for known category', () => {
      const color = getCategoryColor('Food');
      expect(color).toBeDefined();
      expect(color).toMatch(/^rgba\(/);
    });

    it('should return fallback for unknown category', () => {
      const color = getCategoryColor('UnknownCategory123');
      expect(color).toBeDefined();
    });

    it('should return fallback for null', () => {
      const color = getCategoryColor(null);
      expect(color).toBe('#8884d8');
    });
  });
});

describe('Languages Integration', () => {
  // Uses new i18n locale files
  
  it('should have Italian translations', () => {
    expect(itTranslations).toBeDefined();
    expect(itTranslations.assets).toBeDefined();
  });

  it('should have English translations', () => {
    expect(enTranslations).toBeDefined();
    expect(enTranslations.assets).toBeDefined();
  });

  it('should have asset names in both languages', () => {
    expect(itTranslations.assets.bank).toBeDefined();
    expect(enTranslations.assets.bank).toBeDefined();
  });
});
