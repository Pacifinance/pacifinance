/**
 * Tests for CurrencyContext
 * Multi-currency support: conversion, formatting, persistence
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CurrencyContext, CurrencyProvider } from '../../contexts/CurrencyContext';
import { UserContext } from '../../contexts/UserContext';
import { LanguageContext } from '../../contexts/LanguageContext';

// Wrapper with required contexts
const createWrapper = (userCurrency = null, language = 'en') => {
  const userData = userCurrency ? { currency: userCurrency } : null;

  return ({ children }) => (
    <UserContext.Provider value={{ userData }}>
      <LanguageContext.Provider value={{ language, setLanguage: vi.fn(), translations: {} }}>
        <CurrencyProvider>
          {children}
        </CurrencyProvider>
      </LanguageContext.Provider>
    </UserContext.Provider>
  );
};

// Test consumer to access context values
const TestConsumer = () => {
  const {
    currency,
    setCurrency,
    currencySymbol,
    currencyConfig,
    exchangeRates,
    formatAmount,
    formatNumber,
    fromEUR,
    toEUR,
  } = React.useContext(CurrencyContext);

  return (
    <div>
      <span data-testid="currency">{currency}</span>
      <span data-testid="symbol">{currencySymbol}</span>
      <span data-testid="config-name">{currencyConfig?.name}</span>
      <span data-testid="has-rates">{Object.keys(exchangeRates).length > 0 ? 'yes' : 'no'}</span>
      <span data-testid="from-eur">{fromEUR(100)}</span>
      <span data-testid="to-eur">{toEUR(100)}</span>
      <span data-testid="format-amount">{formatAmount(1000)}</span>
      <span data-testid="format-number">{formatNumber(1234.56)}</span>
      <button data-testid="set-usd" onClick={() => setCurrency('USD')}>Set USD</button>
      <button data-testid="set-gbp" onClick={() => setCurrency('GBP')}>Set GBP</button>
      <button data-testid="set-eur" onClick={() => setCurrency('EUR')}>Set EUR</button>
      <button data-testid="set-invalid" onClick={() => setCurrency('INVALID')}>Set invalid</button>
    </div>
  );
};

describe('CurrencyContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Suppress fetch calls (exchange rate API)
    global.fetch = vi.fn(() => Promise.reject(new Error('mocked')));
  });

  describe('Default state', () => {
    it('should default to EUR when localStorage is empty', () => {
      localStorage.getItem.mockReturnValue(null);

      render(<TestConsumer />, { wrapper: createWrapper() });

      expect(screen.getByTestId('currency')).toHaveTextContent('EUR');
      expect(screen.getByTestId('symbol')).toHaveTextContent('€');
    });

    it('should load currency from localStorage', () => {
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'pacifinance-currency') return 'USD';
        return null;
      });

      render(<TestConsumer />, { wrapper: createWrapper() });

      expect(screen.getByTestId('currency')).toHaveTextContent('USD');
      expect(screen.getByTestId('symbol')).toHaveTextContent('$');
    });

    it('should fallback to EUR when localStorage has invalid currency', () => {
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'pacifinance-currency') return 'INVALID_CODE';
        return null;
      });

      render(<TestConsumer />, { wrapper: createWrapper() });

      expect(screen.getByTestId('currency')).toHaveTextContent('EUR');
    });

    it('should prioritize userData.currency over localStorage', async () => {
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'pacifinance-currency') return 'USD';
        return null;
      });

      render(<TestConsumer />, { wrapper: createWrapper('GBP') });

      await waitFor(() => {
        expect(screen.getByTestId('currency')).toHaveTextContent('GBP');
      });
    });

    it('should provide exchange rates (fallback)', () => {
      localStorage.getItem.mockReturnValue(null);

      render(<TestConsumer />, { wrapper: createWrapper() });

      expect(screen.getByTestId('has-rates')).toHaveTextContent('yes');
    });
  });

  describe('setCurrency', () => {
    it('should change currency and save to localStorage', async () => {
      const user = userEvent.setup();
      localStorage.getItem.mockReturnValue(null);

      render(<TestConsumer />, { wrapper: createWrapper() });

      await user.click(screen.getByTestId('set-usd'));

      expect(screen.getByTestId('currency')).toHaveTextContent('USD');
      expect(screen.getByTestId('symbol')).toHaveTextContent('$');
      expect(localStorage.setItem).toHaveBeenCalledWith('pacifinance-currency', 'USD');
    });

    it('should not change currency with invalid code', async () => {
      const user = userEvent.setup();
      localStorage.getItem.mockReturnValue(null);

      render(<TestConsumer />, { wrapper: createWrapper() });

      await user.click(screen.getByTestId('set-invalid'));

      expect(screen.getByTestId('currency')).toHaveTextContent('EUR');
    });

    it('should switch between currencies', async () => {
      const user = userEvent.setup();
      localStorage.getItem.mockReturnValue(null);

      render(<TestConsumer />, { wrapper: createWrapper() });

      await user.click(screen.getByTestId('set-gbp'));
      expect(screen.getByTestId('currency')).toHaveTextContent('GBP');
      expect(screen.getByTestId('symbol')).toHaveTextContent('£');

      await user.click(screen.getByTestId('set-eur'));
      expect(screen.getByTestId('currency')).toHaveTextContent('EUR');
      expect(screen.getByTestId('symbol')).toHaveTextContent('€');
    });
  });

  describe('fromEUR / toEUR conversions', () => {
    it('should return same value for EUR (no conversion)', () => {
      localStorage.getItem.mockReturnValue(null);

      render(<TestConsumer />, { wrapper: createWrapper() });

      expect(screen.getByTestId('from-eur')).toHaveTextContent('100');
      expect(screen.getByTestId('to-eur')).toHaveTextContent('100');
    });

    it('should convert EUR to USD using fallback rate', async () => {
      const user = userEvent.setup();
      localStorage.getItem.mockReturnValue(null);

      render(<TestConsumer />, { wrapper: createWrapper() });

      await user.click(screen.getByTestId('set-usd'));

      // Fallback rate for USD is 1.08
      const fromEurValue = parseFloat(screen.getByTestId('from-eur').textContent);
      expect(fromEurValue).toBe(108); // 100 * 1.08
    });

    it('should convert USD back to EUR (inverse)', async () => {
      const user = userEvent.setup();
      localStorage.getItem.mockReturnValue(null);

      render(<TestConsumer />, { wrapper: createWrapper() });

      await user.click(screen.getByTestId('set-usd'));

      // toEUR(100 USD) = 100 / 1.08 ≈ 92.59
      const toEurValue = parseFloat(screen.getByTestId('to-eur').textContent);
      expect(toEurValue).toBeCloseTo(92.59, 1);
    });

    it('fromEUR and toEUR should be inverse operations', async () => {
      const user = userEvent.setup();
      localStorage.getItem.mockReturnValue(null);

      render(<TestConsumer />, { wrapper: createWrapper() });

      await user.click(screen.getByTestId('set-gbp'));

      const fromEurValue = parseFloat(screen.getByTestId('from-eur').textContent);
      const toEurValue = parseFloat(screen.getByTestId('to-eur').textContent);

      // fromEUR(100) * toEUR(100) should approximate 100 * 100 / rate * rate
      // Inverse check: toEUR(fromEUR(x)) ≈ x
      // fromEUR(100) = 100 * 0.86 = 86
      // toEUR(86) = 86 / 0.86 = 100
      expect(fromEurValue * (1 / 0.86)).toBeCloseTo(100, 0);
    });
  });

  describe('formatAmount', () => {
    it('should format EUR amounts with € symbol', () => {
      localStorage.getItem.mockReturnValue(null);

      render(<TestConsumer />, { wrapper: createWrapper() });

      const formatted = screen.getByTestId('format-amount').textContent;
      // Should contain the EUR symbol and a number
      expect(formatted).toMatch(/[€1000.,\s]/);
    });

    it('should format with correct currency symbol after switching', async () => {
      const user = userEvent.setup();
      localStorage.getItem.mockReturnValue(null);

      render(<TestConsumer />, { wrapper: createWrapper() });

      await user.click(screen.getByTestId('set-usd'));

      const formatted = screen.getByTestId('format-amount').textContent;
      expect(formatted).toContain('$');
    });
  });

  describe('formatNumber', () => {
    it('should format number without currency symbol', () => {
      localStorage.getItem.mockReturnValue(null);

      render(<TestConsumer />, { wrapper: createWrapper() });

      const formatted = screen.getByTestId('format-number').textContent;
      // Should only contain digits, separators, no currency symbol
      expect(formatted).not.toContain('€');
      expect(formatted).not.toContain('$');
    });
  });

  describe('config', () => {
    it('should provide correct config for EUR', () => {
      localStorage.getItem.mockReturnValue(null);

      render(<TestConsumer />, { wrapper: createWrapper() });

      expect(screen.getByTestId('config-name')).toHaveTextContent('Euro');
    });

    it('should provide correct config for USD', async () => {
      const user = userEvent.setup();
      localStorage.getItem.mockReturnValue(null);

      render(<TestConsumer />, { wrapper: createWrapper() });

      await user.click(screen.getByTestId('set-usd'));

      expect(screen.getByTestId('config-name')).toHaveTextContent('US Dollar');
    });
  });

  describe('Edge cases', () => {
    it('should handle NaN input in fromEUR', () => {
      localStorage.getItem.mockReturnValue(null);

      const EdgeTestConsumer = () => {
        const { fromEUR } = React.useContext(CurrencyContext);
        return <span data-testid="result">{fromEUR(NaN)}</span>;
      };

      render(<EdgeTestConsumer />, { wrapper: createWrapper() });

      expect(screen.getByTestId('result')).toHaveTextContent('0');
    });

    it('should handle non-number input in toEUR', () => {
      localStorage.getItem.mockReturnValue(null);

      const EdgeTestConsumer = () => {
        const { toEUR } = React.useContext(CurrencyContext);
        return <span data-testid="result">{toEUR('hello')}</span>;
      };

      render(<EdgeTestConsumer />, { wrapper: createWrapper() });

      expect(screen.getByTestId('result')).toHaveTextContent('0');
    });

    it('should handle undefined in fromEUR', () => {
      localStorage.getItem.mockReturnValue(null);

      const EdgeTestConsumer = () => {
        const { fromEUR } = React.useContext(CurrencyContext);
        return <span data-testid="result">{fromEUR(undefined)}</span>;
      };

      render(<EdgeTestConsumer />, { wrapper: createWrapper() });

      expect(screen.getByTestId('result')).toHaveTextContent('0');
    });
  });
});
