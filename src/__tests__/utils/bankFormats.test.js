import { describe, it, expect } from 'vitest';
import { detectBankFormat } from '../../utils/dataImport/bankFormats';

describe('detectBankFormat', () => {
  it('detects a Revolut current-account export and maps its columns', () => {
    const header = ['Type', 'Product', 'Started Date', 'Completed Date', 'Description', 'Amount', 'Fee', 'Currency', 'State', 'Balance'];
    const result = detectBankFormat(header);
    expect(result).toEqual({
      bank: 'revolut',
      mapping: { dateCol: 3, amountCol: 5, notesCol: 4, categoryCol: 0 },
    });
  });

  it('detects an N26 export and maps its columns', () => {
    const header = ['Date', 'Payee', 'Account number', 'Transaction type', 'Payment reference', 'Category', 'Amount (EUR)', 'Amount (Foreign Currency)', 'Type Foreign Currency', 'Exchange Rate'];
    const result = detectBankFormat(header);
    expect(result).toEqual({
      bank: 'n26',
      mapping: { dateCol: 0, amountCol: 6, notesCol: 1, categoryCol: 5 },
    });
  });

  it('returns null for an unrecognized / generic CSV', () => {
    expect(detectBankFormat(['Date', 'Description', 'Amount'])).toBeNull();
    expect(detectBankFormat(['Data operazione', 'Tipo operazione', 'Isin'])).toBeNull(); // Directa (investment, different domain)
  });

  it('is not thrown off by header case or surrounding whitespace', () => {
    const header = [' type ', 'product', 'started date', 'COMPLETED DATE', 'description', 'AMOUNT', 'fee', 'currency', 'state', 'balance'];
    expect(detectBankFormat(header)?.bank).toBe('revolut');
  });
});
