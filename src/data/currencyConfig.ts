/**
 * Currency configuration for PaciFinance multi-currency support.
 * 
 * All values in the database are stored in EUR.
 * Conversion happens at display-time (fromEUR) and input-time (toEUR).
 */

export const CURRENCIES = {
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', locale: 'it-IT', position: 'after' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', locale: 'en-US', position: 'before' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', locale: 'en-GB', position: 'before' },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', locale: 'de-CH', position: 'before' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', locale: 'ja-JP', position: 'before' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦', locale: 'en-CA', position: 'before' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', locale: 'en-AU', position: 'before' },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', flag: '🇸🇪', locale: 'sv-SE', position: 'after' },
  NOK: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', flag: '🇳🇴', locale: 'nb-NO', position: 'after' },
  DKK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone', flag: '🇩🇰', locale: 'da-DK', position: 'after' },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', flag: '🇵🇱', locale: 'pl-PL', position: 'after' },
  CZK: { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', flag: '🇨🇿', locale: 'cs-CZ', position: 'after' },
  HUF: { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', flag: '🇭🇺', locale: 'hu-HU', position: 'after' },
  RON: { code: 'RON', symbol: 'lei', name: 'Romanian Leu', flag: '🇷🇴', locale: 'ro-RO', position: 'after' },
  BGN: { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev', flag: '🇧🇬', locale: 'bg-BG', position: 'after' },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷', locale: 'pt-BR', position: 'before' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', locale: 'en-IN', position: 'before' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳', locale: 'zh-CN', position: 'before' },
  TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', flag: '🇹🇷', locale: 'tr-TR', position: 'before' },
};

// Approximate fallback exchange rates (EUR → other)
// These are used when the exchange rate API is unavailable.
// Updated periodically — not suitable for financial-grade accuracy.
export const FALLBACK_RATES = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.86,
  CHF: 0.95,
  JPY: 163.5,
  CAD: 1.47,
  AUD: 1.65,
  SEK: 11.2,
  NOK: 11.5,
  DKK: 7.46,
  PLN: 4.32,
  CZK: 25.2,
  HUF: 395,
  RON: 4.97,
  BGN: 1.96,
  BRL: 5.35,
  INR: 91.5,
  CNY: 7.85,
  TRY: 34.5,
};

export const DEFAULT_CURRENCY = 'EUR';

/**
 * Get currency config by code.
 * @param {string} code - ISO 4217 currency code
 * @returns {object} Currency config object
 */
export const getCurrencyByCode = (code) => CURRENCIES[code] || CURRENCIES.EUR;

/**
 * Get all currency codes as an array.
 * @returns {string[]}
 */
export const getCurrencyCodes = () => Object.keys(CURRENCIES);

/**
 * Check if a currency code is valid/supported.
 * @param {string} code
 * @returns {boolean}
 */
export const isValidCurrency = (code) => code in CURRENCIES;
