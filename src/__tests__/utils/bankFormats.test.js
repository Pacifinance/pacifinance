import { describe, it, expect } from 'vitest';
import { detectBankFormat } from '../../utils/dataImport/bankFormats';

describe('detectBankFormat', () => {
  it('detects a Revolut current-account export and maps its columns', () => {
    const header = ['Type', 'Product', 'Started Date', 'Completed Date', 'Description', 'Amount', 'Fee', 'Currency', 'State', 'Balance'];
    const result = detectBankFormat(header);
    expect(result).toEqual({
      bank: 'revolut',
      mapping: { dateCol: 3, amountCol: 5, notesCol: 4, categoryCol: 0, timeCol: 3 },
    });
  });

  it('detects the localized Italian Revolut transaction export', () => {
    const header = ['Tipo', 'Prodotto', 'Data di inizio', 'Data di completamento', 'Descrizione', 'Importo', 'Costo', 'Valuta', 'State', 'Saldo'];
    expect(detectBankFormat(header)).toEqual({
      bank: 'revolut',
      mapping: { dateCol: 3, amountCol: 5, notesCol: 4, categoryCol: 0, timeCol: 3 },
    });
  });

  it('recognizes Revolut columns by shared semantic aliases rather than a language branch', () => {
    const germanHeader = ['Typ', 'Produkt', 'Startdatum', 'Abschlussdatum', 'Beschreibung', 'Betrag', 'Gebühr', 'Währung', 'Status', 'Saldo'];
    expect(detectBankFormat(germanHeader)).toMatchObject({
      bank: 'revolut',
      mapping: {dateCol: 3, amountCol: 5, notesCol: 4, categoryCol: 0},
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

  describe('PayPal', () => {
    const header = ['Data', 'Ora', 'Fuso orario', 'Descrizione', 'Valuta', 'Lordo ', 'Tariffa ', 'Netto', 'Saldo', 'Codice transazione', 'Indirizzo email mittente', 'Nome', 'Nome banca', 'Conto bancario', 'IVA'];

    it('maps only transaction fields and leaves sensitive columns unmapped', () => {
      const result = detectBankFormat(header);
      expect(result.bank).toBe('paypal');
      expect(result.mapping).toEqual({ dateCol: 0, amountCol: 7, notesCol: 11, categoryCol: 3, timeCol: 1 });
      expect(Object.values(result.mapping)).not.toContain(9);
      expect(Object.values(result.mapping)).not.toContain(10);
      expect(Object.values(result.mapping)).not.toContain(13);
    });

    it('filters PayPal funding, conversion and authorization bookkeeping rows', () => {
      const { filterRow } = detectBankFormat(header);
      const row = (description) => header.map((_, index) => index === 3 ? description : '');
      expect(filterRow(row('Pagamento Express Checkout'))).toBe(true);
      expect(filterRow(row('Versamento generico con carta'))).toBe(false);
      expect(filterRow(row('Conversione di valuta generica'))).toBe(false);
      expect(filterRow(row('Blocco conto per autorizzazione aperta'))).toBe(false);
    });

    it('redacts sensitive preview fields and does not persist personal names as notes', () => {
      const { sanitizeRow } = detectBankFormat(header);
      const personal = header.map(() => '');
      personal[3] = 'Pagamento da cellulare';
      personal[9] = 'ABC123';
      personal[10] = 'person@example.com';
      personal[11] = 'Mario Rossi';
      personal[13] = 'IT00 TEST';
      const sanitizedPersonal = sanitizeRow(personal);
      expect(sanitizedPersonal[9]).toBe('');
      expect(sanitizedPersonal[10]).toBe('');
      expect(sanitizedPersonal[13]).toBe('');
      expect(sanitizedPersonal[11]).toBe('Pagamento da cellulare');

      const business = [...personal];
      business[11] = 'Example Services Srl';
      expect(sanitizeRow(business)[11]).toBe('Example Services Srl');
    });
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
