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

  describe('Trade Republic', () => {
    const header = [
      'datetime', 'date', 'account_type', 'category', 'type', 'asset_class', 'name', 'symbol',
      'shares', 'price', 'amount', 'fee', 'tax', 'currency', 'original_amount', 'original_currency',
      'fx_rate', 'description', 'transaction_id', 'counterparty_name', 'counterparty_iban',
      'payment_reference', 'mcc_code',
    ];

    it('detects it and prefers the plain "date" column over "datetime"', () => {
      const result = detectBankFormat(header);
      expect(result.bank).toBe('traderepublic');
      expect(result.mapping.dateCol).toBe(1); // "date", not "datetime" (index 0)
      expect(result.mapping.amountCol).toBe(10);
      expect(result.mapping.categoryCol).toBe(4); // "type"
      expect(result.mapping.notesCol).toBe(6); // "name"
      expect(result.mapping.timeCol).toBe(0); // "datetime" — carries the time "date" itself lacks
      expect(result.mapping.mccCol).toBe(22); // "mcc_code"
    });

    it('filters out investment-trade rows (account_type TRADING / type BUY or SELL), keeps cash rows', () => {
      const { filterRow } = detectBankFormat(header);
      const cashRow = header.map(() => '');
      cashRow[2] = 'DEFAULT'; cashRow[4] = 'CARD_TRANSACTION';
      const tradeRow = header.map(() => '');
      tradeRow[2] = 'TRADING'; tradeRow[4] = 'BUY';
      expect(filterRow(cashRow)).toBe(true);
      expect(filterRow(tradeRow)).toBe(false);
    });
  });
});
