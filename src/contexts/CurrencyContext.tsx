import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CURRENCIES, FALLBACK_RATES, DEFAULT_CURRENCY, isValidCurrency } from '../data/currencyConfig';
import { UserContext } from './UserContext';
import { LanguageContext } from './LanguageContext';
import { useServices } from './ServiceContext';

const CurrencyContext = createContext();

const STORAGE_KEY = 'pacifinance-currency';
const RATES_STORAGE_KEY = 'pacifinance-exchange-rates';
const RATES_TIMESTAMP_KEY = 'pacifinance-exchange-rates-ts';
const RATES_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

export const CurrencyProvider = ({ children }) => {
  const { userData, isAuthenticated } = useContext(UserContext);
  const { language } = useContext(LanguageContext);
  const { financeService } = useServices();

  // Priority: DB (userData.currency) > localStorage > default EUR
  const [currency, setCurrencyState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && isValidCurrency(stored) ? stored : DEFAULT_CURRENCY;
  });

  const [exchangeRates, setExchangeRates] = useState(() => {
    try {
      const stored = localStorage.getItem(RATES_STORAGE_KEY);
      const timestamp = localStorage.getItem(RATES_TIMESTAMP_KEY);
      if (stored && timestamp && (Date.now() - parseInt(timestamp)) < RATES_MAX_AGE) {
        return JSON.parse(stored);
      }
    } catch { /* ignore */ }
    return FALLBACK_RATES;
  });

  // Sync with DB when userData loads — DB preferredCurrency has priority over localStorage
  useEffect(() => {
    if (userData?.currency && isValidCurrency(userData.currency)) {
      setCurrencyState(userData.currency);
      // Cache the DB-preferred currency in localStorage for quick reload
      localStorage.setItem(STORAGE_KEY, userData.currency);
    }
  }, [userData?.currency]);

  // Fetch exchange rates (once per day, cached in localStorage). Deferred until
  // the user is authenticated — the landing/marketing pages show no converted
  // amounts, so there's no reason to fire this (and its console noise) for
  // anonymous visitors.
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchRates = async () => {
      try {
        const timestamp = localStorage.getItem(RATES_TIMESTAMP_KEY);
        if (timestamp && (Date.now() - parseInt(timestamp)) < RATES_MAX_AGE) {
          return; // Cache still valid
        }
        const rates = await financeService.getExchangeRates();
        if (rates) {
          setExchangeRates(rates);
          localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(rates));
          localStorage.setItem(RATES_TIMESTAMP_KEY, String(Date.now()));
        }
      } catch {
        // Silently fall back to cached/fallback rates
      }
    };
    fetchRates();
  }, [isAuthenticated, financeService]);

  // setCurrency: display-only, session-only (does NOT persist to localStorage or DB)
  // Used by Settings page for quick currency conversion
  const setCurrency = useCallback((code) => {
    if (isValidCurrency(code)) {
      setCurrencyState(code);
    }
  }, []);

  const config = CURRENCIES[currency] || CURRENCIES[DEFAULT_CURRENCY];

  // Get the formatting locale — use currency's locale for consistent number formatting
  const getLocale = useCallback(() => {
    return config.locale || (language === 'it' ? 'it-IT' : 'en-US');
  }, [config.locale, language]);

  // Convert EUR value (from DB) to display currency
  const fromEUR = useCallback((eurValue) => {
    if (typeof eurValue !== 'number' || isNaN(eurValue)) return 0;
    if (currency === 'EUR') return eurValue;
    const rate = exchangeRates[currency] || FALLBACK_RATES[currency] || 1;
    return eurValue * rate;
  }, [currency, exchangeRates]);

  // Convert user input (display currency) to EUR for DB storage
  const toEUR = useCallback((localValue) => {
    if (typeof localValue !== 'number' || isNaN(localValue)) return 0;
    if (currency === 'EUR') return localValue;
    const rate = exchangeRates[currency] || FALLBACK_RATES[currency] || 1;
    return localValue / rate;
  }, [currency, exchangeRates]);

  /**
   * Format a value from DB (EUR) to display string with currency symbol.
   * @param {number} eurValue - Value in EUR from the database
   * @param {object} opts - Intl.NumberFormat options override
   * @returns {string} Formatted string like "€2,800" or "2.800,00 €"
   */
  const formatAmount = useCallback((eurValue, opts = {}) => {
    const displayValue = fromEUR(eurValue);
    return new Intl.NumberFormat(getLocale(), {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: opts.maximumFractionDigits ?? 2,
      minimumFractionDigits: opts.minimumFractionDigits ?? 0,
      ...opts,
    }).format(displayValue);
  }, [currency, fromEUR, getLocale]);

  /**
   * Format a value from DB (EUR) to display as plain number (no symbol).
   * @param {number} eurValue - Value in EUR from the database
   * @param {object} opts - toLocaleString options
   * @returns {string} Formatted number string like "2.800,00"
   */
  const formatNumber = useCallback((eurValue, opts = {}) => {
    const displayValue = fromEUR(eurValue);
    return displayValue.toLocaleString(getLocale(), {
      minimumFractionDigits: opts.minimumFractionDigits ?? 2,
      maximumFractionDigits: opts.maximumFractionDigits ?? 2,
      ...opts,
    });
  }, [fromEUR, getLocale]);

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      currencySymbol: config.symbol,
      currencyConfig: config,
      exchangeRates,
      formatAmount,
      formatNumber,
      fromEUR,
      toEUR,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export { CurrencyContext };
