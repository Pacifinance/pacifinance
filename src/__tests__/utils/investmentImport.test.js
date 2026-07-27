import { describe, it, expect } from 'vitest';
import {
  parseImportNumber, parseImportDate, looksLikeIsin, detectDelimiter, splitCsvLine, extractCsvRows,
} from '../../utils/investmentImport/normalize';
import { parseInvestmentCsv } from '../../utils/investmentImport/parsers';
import { dedupeTransactions, aggregatePositions } from '../../utils/investmentImport/aggregate';

describe('parseImportNumber', () => {
  it('parses plain anglo numbers', () => {
    expect(parseImportNumber('49.96')).toBe(49.96);
    expect(parseImportNumber('-399.43')).toBe(-399.43);
  });
  it('parses European decimal-comma numbers (DEGIRO/pytr)', () => {
    expect(parseImportNumber('1.431,00')).toBe(1431);
    expect(parseImportNumber('12,5')).toBe(12.5);
  });
  it('parses anglo thousands separators inside quoted fields (eToro "4,581.91")', () => {
    expect(parseImportNumber('4,581.91')).toBe(4581.91);
    expect(parseImportNumber('89,162.28')).toBe(89162.28);
  });
  it('strips embedded currency symbols/codes (Coinbase, Revolut)', () => {
    expect(parseImportNumber('€3343.11229989')).toBeCloseTo(3343.11229989);
    expect(parseImportNumber('-$30.93')).toBe(-30.93);
    expect(parseImportNumber('50.00 SEK')).toBe(50);
  });
  it('returns null for empty/unparseable cells, never NaN', () => {
    expect(parseImportNumber('')).toBeNull();
    expect(parseImportNumber(null)).toBeNull();
    expect(parseImportNumber('-')).toBeNull();
    expect(parseImportNumber('n/a')).toBeNull();
  });
});

describe('parseImportDate', () => {
  it('parses ISO timestamps (Trading 212, Coinbase, Kraken)', () => {
    expect(parseImportDate('2023-12-18 14:30:03.613')).toBe('2023-12-18');
    expect(parseImportDate('2019-12-02T08:23:08.459586Z')).toBe('2019-12-02');
    expect(parseImportDate('2025-01-17 16:57:02 UTC')).toBe('2025-01-17');
  });
  it('parses European day-first formats (DEGIRO, Directa, XTB, eToro)', () => {
    expect(parseImportDate('27-12-2024')).toBe('2024-12-27');
    expect(parseImportDate('12.04.2024 13:01:45')).toBe('2024-04-12');
    expect(parseImportDate('02/01/2024 00:10:33')).toBe('2024-01-02');
  });
  it('parses IBKR compact YYYYMMDD', () => {
    expect(parseImportDate('20230522')).toBe('2023-05-22');
  });
  it('rejects impossible dates and empty values', () => {
    expect(parseImportDate('45-13-2024')).toBeNull();
    expect(parseImportDate('')).toBeNull();
    expect(parseImportDate(null)).toBeNull();
  });
});

describe('csv primitives', () => {
  it('detects semicolon-delimited exports (DEGIRO, XTB, Scalable)', () => {
    expect(detectDelimiter('ID;Type;Time;Symbol;Comment;Amount')).toBe(';');
    expect(detectDelimiter('Action,Time,ISIN,Ticker')).toBe(',');
  });
  it('honors quoted fields with embedded delimiters and escapes', () => {
    expect(splitCsvLine('a,"b,c",d', ',')).toEqual(['a', 'b,c', 'd']);
    expect(splitCsvLine('"say ""hi""",x', ',')).toEqual(['say "hi"', 'x']);
  });
  it('skips preamble rows before the real header (Directa)', () => {
    const raw = [
      'Conto : 12345',
      'Data estrazione : 01-01-2025',
      'Il file include i primi 3000 movimenti',
      'Data operazione,Data valuta,Tipo operazione,Ticker,Isin,Protocollo,Descrizione,Quantità,Importo euro,Importo Divisa,Divisa,Riferimento ordine',
      '27-12-2024,27-12-2024,Acquisto etf,IEMB,IE00B2NPKV68,YYY,ISHARES JPM,10,-209.50,0,EUR,ORD1',
    ].join('\n');
    const extracted = extractCsvRows(raw);
    expect(extracted.header[0]).toBe('Data operazione');
    expect(extracted.rows).toHaveLength(1);
  });
  it('validates ISIN shapes', () => {
    expect(looksLikeIsin('US0378331005')).toBe(true);
    expect(looksLikeIsin('IE00B2NPKV68')).toBe(true);
    expect(looksLikeIsin('AAPL')).toBe(false);
    expect(looksLikeIsin('')).toBe(false);
  });
});

const T212_HEADER = 'Action,Time,ISIN,Ticker,Name,No. of shares,Price / share,Currency (Price / share),Exchange rate,Result,Currency (Result),Total,Currency (Total),Withholding tax,Currency (Withholding tax),Notes,ID,Currency conversion fee,Currency (Currency conversion fee)';

describe('detectPlatform / parseInvestmentCsv', () => {
  it('detects and parses a Trading 212 export (verbatim research sample)', () => {
    const raw = [
      T212_HEADER,
      'Market buy,2023-12-18 14:30:03.613,US17275R1023,CSCO,"Cisco Systems",0.0290530000,49.96,USD,1.09303,,"EUR",1.33,"EUR",,,,EOF7504196256,,',
      'Deposit,2023-12-01 10:00:00.000,,,,,,,,,,"100.00","EUR",,,,DEP123,,',
    ].join('\n');
    const parsed = parseInvestmentCsv(raw);
    expect(parsed.platform).toBe('trading212');
    expect(parsed.transactions).toHaveLength(1);
    expect(parsed.skippedRows).toBe(1); // the Deposit
    const tx = parsed.transactions[0];
    expect(tx).toMatchObject({
      side: 'buy', isin: 'US17275R1023', ticker: 'CSCO', date: '2023-12-18',
      quantity: 0.029053, price: 49.96, total: 1.33, currency: 'USD', externalId: 'EOF7504196256',
    });
  });

  it('detects and parses a Directa export, computing unit price from totals', () => {
    const raw = [
      'Data operazione,Data valuta,Tipo operazione,Ticker,Isin,Protocollo,Descrizione,Quantità,Importo euro,Importo Divisa,Divisa,Riferimento ordine',
      '27-12-2024,27-12-2024,Acquisto etf,IEMB,IE00B2NPKV68,YYY,ISHARES JPM EM,10,-209.50,0,EUR,ORD1',
      '15-01-2025,15-01-2025,Provento etf,IEMB,IE00B2NPKV68,ZZZ,ISHARES JPM EM,0,20.95,0,EUR,',
    ].join('\n');
    const parsed = parseInvestmentCsv(raw);
    expect(parsed.platform).toBe('directa');
    expect(parsed.transactions).toHaveLength(1);
    expect(parsed.skippedRows).toBe(1); // the dividend ("Provento etf")
    expect(parsed.transactions[0]).toMatchObject({
      side: 'buy', isin: 'IE00B2NPKV68', ticker: 'IEMB', date: '2024-12-27', quantity: 10,
    });
    expect(parsed.transactions[0].price).toBeCloseTo(20.95);
  });

  it('detects and parses a DEGIRO Transactions.csv, inferring side from quantity sign', () => {
    const raw = [
      'Date,Time,Product,ISIN,Exchange,Quantity,Price,Local value,Value,Exchange rate,Transaction costs,Total,Order ID',
      '18-12-2023,14:30,APPLE INC,US0378331005,NDQ,"5","190,25","-951,25","-870,10","1,0933","-2,00","-872,10",abc-1',
      '20-12-2023,10:00,APPLE INC,US0378331005,NDQ,"-2","195,00","390,00","356,80","1,0933","-2,00","354,80",abc-2',
    ].join('\n');
    const parsed = parseInvestmentCsv(raw);
    expect(parsed.platform).toBe('degiro');
    expect(parsed.transactions).toHaveLength(2);
    expect(parsed.transactions[0]).toMatchObject({ side: 'buy', quantity: 5, price: 190.25, isin: 'US0378331005' });
    expect(parsed.transactions[1]).toMatchObject({ side: 'sell', quantity: 2 });
  });

  it('returns null for unrecognized files', () => {
    expect(parseInvestmentCsv('foo,bar\n1,2')).toBeNull();
    expect(parseInvestmentCsv('')).toBeNull();
  });

  it('nulls malformed ISINs instead of propagating garbage', () => {
    const raw = [
      T212_HEADER,
      'Market buy,2023-12-18 14:30:03.613,NOT_AN_ISIN,CSCO,"Cisco",1,49.96,USD,1,, "EUR",49.96,"EUR",,,,ID1,,',
    ].join('\n');
    const parsed = parseInvestmentCsv(raw);
    expect(parsed.transactions[0].isin).toBeNull();
    expect(parsed.transactions[0].ticker).toBe('CSCO');
  });
});

describe('dedupeTransactions', () => {
  it('drops rows sharing a platform id across merged files, keeps id-less rows', () => {
    const tx = (externalId, quantity = 1) => ({
      side: 'buy', isin: 'US0378331005', ticker: null, name: null, date: '2024-01-01',
      quantity, price: 10, total: 10, currency: 'EUR', externalId,
    });
    const result = dedupeTransactions([tx('A'), tx('A'), tx('B'), tx(null), tx(null)]);
    expect(result).toHaveLength(4); // A, B, and both null-id rows
  });
});

describe('aggregatePositions', () => {
  const tx = (over) => ({
    side: 'buy', isin: 'US0378331005', ticker: 'AAPL', name: 'Apple', date: '2024-01-01',
    quantity: 1, price: 100, total: 100, currency: 'EUR', externalId: null, ...over,
  });

  it('nets buys and sells into one position with weighted average buy price', () => {
    const positions = aggregatePositions([
      tx({ quantity: 10, price: 100, total: 1000, date: '2024-01-01' }),
      tx({ quantity: 10, price: 200, total: 2000, date: '2024-02-01' }),
      tx({ side: 'sell', quantity: 5, price: 250, total: 1250, date: '2024-03-01' }),
    ]);
    expect(positions).toHaveLength(1);
    expect(positions[0]).toMatchObject({
      isin: 'US0378331005', quantity: 15, averagePrice: 150, investedAmount: 1750, lastTransactionDate: '2024-03-01',
      transactionCount: 3,
    });
  });

  it('drops fully-closed positions', () => {
    const positions = aggregatePositions([
      tx({ quantity: 5 }),
      tx({ side: 'sell', quantity: 5 }),
    ]);
    expect(positions).toHaveLength(0);
  });

  it('groups by ticker when ISIN is missing, and trims fractional float noise', () => {
    const positions = aggregatePositions([
      tx({ isin: null, ticker: 'CSCO', quantity: 0.1 }),
      tx({ isin: null, ticker: 'CSCO', quantity: 0.2 }),
    ]);
    expect(positions).toHaveLength(1);
    expect(positions[0].quantity).toBe(0.3);
  });

  it('sorts largest positions first for the preview', () => {
    const positions = aggregatePositions([
      tx({ isin: 'IE00B2NPKV68', ticker: 'IEMB', total: 50 }),
      tx({ isin: 'US0378331005', ticker: 'AAPL', total: 5000 }),
    ]);
    expect(positions[0].ticker).toBe('AAPL');
  });
});
