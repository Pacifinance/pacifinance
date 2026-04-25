import { useContext } from 'react';
import { CurrencyContext } from '../contexts/CurrencyContext';

/**
 * Convenience hook to access currency formatting utilities.
 * 
 * @returns {object} { currency, currencySymbol, formatAmount, formatNumber, fromEUR, toEUR, setCurrency }
 * 
 * @example
 * const { formatAmount, currencySymbol, toEUR } = useFormatCurrency();
 * 
 * // Display a value from DB (EUR) in user's currency
 * <span>{formatAmount(2800)}</span>  // "2.800,00 €" or "$3,024.00"
 * 
 * // Show currency symbol in input fields
 * <CurrencySymbol>{currencySymbol}</CurrencySymbol>
 * 
 * // Convert user input to EUR before sending to API
 * const eurValue = toEUR(parseFloat(inputValue));
 */
export const useFormatCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Fallback for components rendered outside CurrencyProvider
    return {
      currency: 'EUR',
      currencySymbol: '€',
      formatAmount: (v) => `€${(v || 0).toLocaleString()}`,
      formatNumber: (v) => (v || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 }),
      fromEUR: (v) => v,
      toEUR: (v) => v,
      setCurrency: () => {},
    };
  }
  return context;
};
