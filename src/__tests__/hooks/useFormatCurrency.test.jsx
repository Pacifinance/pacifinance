/**
 * useFormatCurrency Hook Tests
 *
 * Validates the convenience currency hook provides correct fallback
 * when no CurrencyProvider is present, and correctly proxies the context.
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderHook } from '@testing-library/react';
import { useFormatCurrency } from '../../hooks/useFormatCurrency';
import { CurrencyContext } from '../../contexts/CurrencyContext';

describe('useFormatCurrency', () => {
  describe('without CurrencyProvider (fallback)', () => {
    it('should return EUR as default currency', () => {
      const { result } = renderHook(() => useFormatCurrency());
      expect(result.current.currency).toBe('EUR');
    });

    it('should return € as currency symbol', () => {
      const { result } = renderHook(() => useFormatCurrency());
      expect(result.current.currencySymbol).toBe('€');
    });

    it('formatAmount should format a value with € prefix', () => {
      const { result } = renderHook(() => useFormatCurrency());
      const formatted = result.current.formatAmount(1000);
      expect(formatted).toContain('€');
      expect(formatted).toContain('1');
    });

    it('formatAmount should handle zero', () => {
      const { result } = renderHook(() => useFormatCurrency());
      const formatted = result.current.formatAmount(0);
      expect(formatted).toContain('0');
    });

    it('formatAmount should handle null/undefined', () => {
      const { result } = renderHook(() => useFormatCurrency());
      expect(() => result.current.formatAmount(null)).not.toThrow();
      expect(() => result.current.formatAmount(undefined)).not.toThrow();
    });

    it('formatNumber should return a formatted number string', () => {
      const { result } = renderHook(() => useFormatCurrency());
      const formatted = result.current.formatNumber(1000);
      expect(typeof formatted).toBe('string');
    });

    it('fromEUR should be identity (no conversion)', () => {
      const { result } = renderHook(() => useFormatCurrency());
      expect(result.current.fromEUR(100)).toBe(100);
    });

    it('toEUR should be identity (no conversion)', () => {
      const { result } = renderHook(() => useFormatCurrency());
      expect(result.current.toEUR(100)).toBe(100);
    });

    it('setCurrency should be a no-op', () => {
      const { result } = renderHook(() => useFormatCurrency());
      expect(() => result.current.setCurrency('USD')).not.toThrow();
    });
  });

  describe('with CurrencyProvider', () => {
    it('should return the provided context values', () => {
      const mockContext = {
        currency: 'USD',
        currencySymbol: '$',
        formatAmount: vi.fn((v) => `$${v}`),
        formatNumber: vi.fn((v) => String(v)),
        fromEUR: vi.fn((v) => v * 1.1),
        toEUR: vi.fn((v) => v / 1.1),
        setCurrency: vi.fn(),
      };

      const wrapper = ({ children }) => (
        <CurrencyContext.Provider value={mockContext}>
          {children}
        </CurrencyContext.Provider>
      );

      const { result } = renderHook(() => useFormatCurrency(), { wrapper });

      expect(result.current.currency).toBe('USD');
      expect(result.current.currencySymbol).toBe('$');
      expect(result.current.formatAmount(100)).toBe('$100');
      expect(result.current.fromEUR(100)).toBeCloseTo(110);
    });
  });
});
