/**
 * Tests for currencyConfig.js
 * Currency definitions, validation, and utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  CURRENCIES,
  FALLBACK_RATES,
  DEFAULT_CURRENCY,
  getCurrencyByCode,
  getCurrencyCodes,
  isValidCurrency,
} from '../../data/currencyConfig';

describe('currencyConfig', () => {
  describe('CURRENCIES', () => {
    it('should contain at least EUR, USD, GBP, CHF', () => {
      expect(CURRENCIES).toHaveProperty('EUR');
      expect(CURRENCIES).toHaveProperty('USD');
      expect(CURRENCIES).toHaveProperty('GBP');
      expect(CURRENCIES).toHaveProperty('CHF');
    });

    it('should have 19 supported currencies', () => {
      expect(Object.keys(CURRENCIES)).toHaveLength(19);
    });

    it('each currency should have required fields', () => {
      Object.entries(CURRENCIES).forEach(([code, config]) => {
        expect(config).toHaveProperty('code', code);
        expect(config).toHaveProperty('symbol');
        expect(config).toHaveProperty('name');
        expect(config).toHaveProperty('flag');
        expect(config).toHaveProperty('locale');
        expect(config).toHaveProperty('position');
        expect(typeof config.symbol).toBe('string');
        expect(typeof config.name).toBe('string');
        expect(['before', 'after']).toContain(config.position);
      });
    });

    it('EUR should have correct configuration', () => {
      expect(CURRENCIES.EUR).toEqual({
        code: 'EUR',
        symbol: '€',
        name: 'Euro',
        flag: '🇪🇺',
        locale: 'it-IT',
        position: 'after',
      });
    });

    it('USD should have correct configuration', () => {
      expect(CURRENCIES.USD).toEqual({
        code: 'USD',
        symbol: '$',
        name: 'US Dollar',
        flag: '🇺🇸',
        locale: 'en-US',
        position: 'before',
      });
    });
  });

  describe('FALLBACK_RATES', () => {
    it('should have a rate for every currency in CURRENCIES', () => {
      Object.keys(CURRENCIES).forEach((code) => {
        expect(FALLBACK_RATES).toHaveProperty(code);
        expect(typeof FALLBACK_RATES[code]).toBe('number');
        expect(FALLBACK_RATES[code]).toBeGreaterThan(0);
      });
    });

    it('EUR rate should be 1 (base currency)', () => {
      expect(FALLBACK_RATES.EUR).toBe(1);
    });

    it('rates should be realistic (sanity check)', () => {
      // USD is roughly 1.0-1.3 per EUR
      expect(FALLBACK_RATES.USD).toBeGreaterThan(0.8);
      expect(FALLBACK_RATES.USD).toBeLessThan(1.5);

      // JPY is roughly 130-180 per EUR
      expect(FALLBACK_RATES.JPY).toBeGreaterThan(100);
      expect(FALLBACK_RATES.JPY).toBeLessThan(250);

      // GBP is roughly 0.8-0.95 per EUR
      expect(FALLBACK_RATES.GBP).toBeGreaterThan(0.7);
      expect(FALLBACK_RATES.GBP).toBeLessThan(1.0);
    });
  });

  describe('DEFAULT_CURRENCY', () => {
    it('should be EUR', () => {
      expect(DEFAULT_CURRENCY).toBe('EUR');
    });

    it('should be a valid currency code', () => {
      expect(isValidCurrency(DEFAULT_CURRENCY)).toBe(true);
    });
  });

  describe('getCurrencyByCode', () => {
    it('should return correct config for valid codes', () => {
      expect(getCurrencyByCode('EUR').name).toBe('Euro');
      expect(getCurrencyByCode('USD').name).toBe('US Dollar');
      expect(getCurrencyByCode('GBP').name).toBe('British Pound');
      expect(getCurrencyByCode('JPY').name).toBe('Japanese Yen');
    });

    it('should return EUR config for invalid code', () => {
      expect(getCurrencyByCode('INVALID')).toEqual(CURRENCIES.EUR);
      expect(getCurrencyByCode('')).toEqual(CURRENCIES.EUR);
      expect(getCurrencyByCode(null)).toEqual(CURRENCIES.EUR);
      expect(getCurrencyByCode(undefined)).toEqual(CURRENCIES.EUR);
    });
  });

  describe('getCurrencyCodes', () => {
    it('should return array of all currency codes', () => {
      const codes = getCurrencyCodes();
      expect(Array.isArray(codes)).toBe(true);
      expect(codes).toContain('EUR');
      expect(codes).toContain('USD');
      expect(codes).toContain('GBP');
      expect(codes).toContain('CHF');
      expect(codes).toHaveLength(19);
    });
  });

  describe('isValidCurrency', () => {
    it('should return true for valid currency codes', () => {
      expect(isValidCurrency('EUR')).toBe(true);
      expect(isValidCurrency('USD')).toBe(true);
      expect(isValidCurrency('GBP')).toBe(true);
      expect(isValidCurrency('JPY')).toBe(true);
      expect(isValidCurrency('TRY')).toBe(true);
    });

    it('should return false for invalid currency codes', () => {
      expect(isValidCurrency('INVALID')).toBe(false);
      expect(isValidCurrency('XXX')).toBe(false);
      expect(isValidCurrency('')).toBe(false);
      expect(isValidCurrency('eur')).toBe(false); // case-sensitive
    });
  });
});
