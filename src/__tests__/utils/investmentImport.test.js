import { describe, it, expect } from 'vitest';
import {
  parseImportNumber, parseImportDate, looksLikeIsin, detectDelimiter, splitCsvLine, extractCsvRows,
} from '../../utils/investmentImport/normalize';
import { parseInvestmentCsv } from '../../utils/investmentImport/parsers';
import {
  dedupeTransactions, aggregatePositions, aggregatePositionsAsOf, buildMonthlyPositionTimeline, lastDayOfMonth,
  groupTransactionsByPositionKey, lastRecordedValueBefore, closedPositions,
  dedupeDividends, groupDividendsByPositionKey, aggregateDividends,
} from '../../utils/investmentImport/aggregate';

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
    // The share price is quoted in USD, but Total is already converted to EUR
    // right in the file (see Currency (Total)) — using the price's currency to
    // convert Total/investedAmount later would double-convert an already-EUR value.
    expect(tx.totalCurrency).toBe('EUR');
  });

  it('detects and parses a real Trading 212 export using "Time (UTC)" instead of "Time"', () => {
    // Actual current Trading 212 "account statement" export names this column
    // "Time (UTC)" — the exact-match header check used to require a literal
    // "Time" cell and silently rejected every real export as unrecognized.
    const header = 'Action,Time (UTC),ISIN,Ticker,Name,Notes,ID,No. of shares,Price / share,Currency (Price / share),Exchange rate,Total,Currency (Total),Withholding tax,Currency (Withholding tax),Currency conversion fee,Currency (Currency conversion fee)';
    const raw = [
      header,
      'Dividend (Dividend),2026-06-01 16:07:28+00:00,US92826C8394,V,"Visa",,,0.5911783800,0.569500,USD,0.85818500,0.29,"EUR",0.06,USD,,',
      'Deposit,2026-06-25 09:15:08+00:00,,,,"Bank Transfer",019efe0f-cae1-7c4c-a65c-46772f7ef3c0,,,,,100.00,"EUR",,,,',
      'Market buy,2026-06-29 13:30:26+00:00,US5949181045,MSFT,"Microsoft",,EOF53409493596,0.0644277800,377.6000000000,USD,1.14054991,21.36,"EUR",,,0.03,"EUR"',
    ].join('\n');
    const parsed = parseInvestmentCsv(raw);
    expect(parsed.platform).toBe('trading212');
    expect(parsed.transactions).toHaveLength(1);
    expect(parsed.skippedRows).toBe(1); // just the deposit — the dividend is now captured, not skipped
    expect(parsed.transactions[0]).toMatchObject({
      side: 'buy', isin: 'US5949181045', ticker: 'MSFT', date: '2026-06-29',
      quantity: 0.06442778, price: 377.6, total: 21.36, currency: 'USD', externalId: 'EOF53409493596',
    });
    expect(parsed.dividends).toHaveLength(1);
    expect(parsed.dividends[0]).toMatchObject({
      isin: 'US92826C8394', ticker: 'V', date: '2026-06-01', amount: 0.29, currency: 'EUR', externalId: null,
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
    expect(parsed.skippedRows).toBe(0); // "Provento etf" is now captured as a dividend, not skipped
    expect(parsed.transactions[0]).toMatchObject({
      side: 'buy', isin: 'IE00B2NPKV68', ticker: 'IEMB', date: '2024-12-27', quantity: 10,
    });
    expect(parsed.transactions[0].price).toBeCloseTo(20.95);
    expect(parsed.dividends).toHaveLength(1);
    expect(parsed.dividends[0]).toMatchObject({
      isin: 'IE00B2NPKV68', ticker: 'IEMB', date: '2025-01-15', amount: 20.95, currency: 'EUR', externalId: null,
    });
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
    // DEGIRO's Transactions.csv contains only trades - dividends are cash
    // movements recorded in a separate export this parser doesn't read.
    expect(parsed.dividends).toEqual([]);
  });

  it('detects and parses a generic (Portfolio Performance / Ghostfolio style) export with a dividend row', () => {
    const raw = [
      'Date,Type,ISIN,Ticker,Name,Shares,Price,Total,Currency',
      '2024-05-10,Buy,US0378331005,AAPL,Apple Inc,2,180,360,EUR',
      '2024-08-01,Dividend,US0378331005,AAPL,Apple Inc,,,0.48,EUR',
    ].join('\n');
    const parsed = parseInvestmentCsv(raw);
    expect(parsed.platform).toBe('generic');
    expect(parsed.transactions).toHaveLength(1);
    expect(parsed.skippedRows).toBe(0);
    expect(parsed.dividends).toHaveLength(1);
    expect(parsed.dividends[0]).toMatchObject({
      isin: 'US0378331005', ticker: 'AAPL', date: '2024-08-01', amount: 0.48, currency: 'EUR',
    });
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

  it('tracks investedAmountCurrency separately from currency (Total\'s currency vs Price\'s — see Trading 212)', () => {
    const positions = aggregatePositions([
      tx({ currency: 'USD', totalCurrency: 'EUR', quantity: 1, price: 100, total: 90 }),
    ]);
    expect(positions[0].currency).toBe('USD');
    expect(positions[0].investedAmountCurrency).toBe('EUR');
  });
});

describe('closedPositions', () => {
  const tx = (over) => ({
    side: 'buy', isin: 'US0378331005', ticker: 'AAPL', name: 'Apple', date: '2024-01-01',
    quantity: 1, price: 100, total: 100, currency: 'EUR', externalId: null, ...over,
  });

  it('reports a fully-sold position that aggregatePositions itself drops', () => {
    const transactions = [tx({ quantity: 5, date: '2024-01-01' }), tx({ side: 'sell', quantity: 5, date: '2024-06-15' })];
    expect(aggregatePositions(transactions)).toHaveLength(0);
    const closed = closedPositions(transactions);
    expect(closed).toHaveLength(1);
    expect(closed[0]).toMatchObject({ key: 'US0378331005', quantity: 0, lastTransactionDate: '2024-06-15' });
  });

  it('does not report a position that is still open', () => {
    const transactions = [tx({ quantity: 10 }), tx({ side: 'sell', quantity: 4 })];
    expect(closedPositions(transactions)).toEqual([]);
  });

  it('reports multiple distinct closed positions', () => {
    const transactions = [
      tx({ quantity: 5 }), tx({ side: 'sell', quantity: 5 }),
      tx({ isin: 'US5949181045', ticker: 'MSFT', quantity: 3 }),
      tx({ isin: 'US5949181045', ticker: 'MSFT', side: 'sell', quantity: 3 }),
    ];
    expect(closedPositions(transactions).map((p) => p.key).sort()).toEqual(['US0378331005', 'US5949181045']);
  });

  // Regression test for a real bug: a broker export capped to one period
  // (Trading 212: 365 days) means a multi-year portfolio is split across
  // several files. A position bought and sold within ONE file's own date
  // range nets to zero there - but if it was rebought in a DIFFERENT
  // (chronologically later) file, it's still genuinely held. Evaluating
  // closedPositions per-file in isolation (the bug) reports a false
  // "sold" against the full, merged history it never sees. The fix is
  // simply to always call closedPositions/aggregatePositions on the
  // complete merged transaction set (see recomputeFromMerged in
  // InvestmentImportWizard.tsx), never on a single file's transactions
  // alone - this test proves that merged evaluation gives the correct
  // answer that isolated per-file evaluation cannot.
  it('does not report a position as closed when it was rebought in a later file, even though it nets to zero within one file alone', () => {
    const olderFileTransactions = [
      tx({ quantity: 1, date: '2021-01-11' }),
      tx({ side: 'sell', quantity: 1, date: '2021-01-14' }),
    ];
    const newerFileTransactions = [
      tx({ quantity: 3, date: '2022-01-13' }),
    ];

    // The bug: checking the older file in isolation flags it as closed.
    expect(closedPositions(olderFileTransactions)).toHaveLength(1);

    // The fix: evaluating the complete merged history (both files combined,
    // regardless of which order they were uploaded in) shows it's still held.
    const merged = [...olderFileTransactions, ...newerFileTransactions];
    expect(closedPositions(merged)).toEqual([]);
    expect(aggregatePositions(merged)).toMatchObject([{ key: 'US0378331005', quantity: 3 }]);
  });

  // Same underlying bug, but across SEPARATE wizard sessions rather than
  // separate files in one session: the older file was imported (and its
  // transactions persisted to user_investment_transactions) in an earlier
  // session that has since ended, and the browser now only holds the newer
  // file's transactions in memory. Without merging in what the server
  // already has (see getTransactions/toImportedTransaction/recomputeFromMerged
  // in InvestmentImportWizard.tsx), this session would evaluate the newer
  // file alone and correctly see it as open — so this specific regression
  // instead needs the reverse split: this session sees ONLY the closing sell,
  // with the earlier buy already sitting server-side from a prior session.
  it('does not report a position as closed when the offsetting buy was recorded in an earlier, separate session (not just an earlier file this session)', () => {
    const alreadyPersistedFromEarlierSession = [
      tx({ quantity: 3, date: '2022-01-13', externalId: 'EARLIER-SESSION-BUY' }),
    ];
    const thisSessionsOwnFile = [
      tx({ side: 'sell', quantity: 1, date: '2024-06-15', externalId: 'THIS-SESSION-SELL' }),
    ];

    // The bug: evaluating only what this session's own file loaded flags it
    // as closed, with no way to know about the earlier session's buy.
    expect(closedPositions(thisSessionsOwnFile)).toHaveLength(1);

    // The fix: merging in the persisted server-side ledger (regardless of
    // which session originally saved it) shows the position is still held.
    const merged = dedupeTransactions([...thisSessionsOwnFile, ...alreadyPersistedFromEarlierSession]);
    expect(closedPositions(merged)).toEqual([]);
    expect(aggregatePositions(merged)).toMatchObject([{ key: 'US0378331005', quantity: 2 }]);
  });
});

describe('groupTransactionsByPositionKey', () => {
  it('groups by ISIN, falling back to ticker then name, matching aggregatePositions', () => {
    const withIsin = { isin: 'US0378331005', ticker: 'AAPL', name: 'Apple' };
    const tickerOnly = { isin: null, ticker: 'CSCO', name: 'Cisco' };
    const nameOnly = { isin: null, ticker: null, name: 'Some Fund' };
    const grouped = groupTransactionsByPositionKey([withIsin, withIsin, tickerOnly, nameOnly]);
    expect(grouped.get('US0378331005')).toHaveLength(2);
    expect(grouped.get('CSCO')).toHaveLength(1);
    expect(grouped.get('Some Fund')).toHaveLength(1);
  });

  it('drops transactions with no usable identifier', () => {
    const grouped = groupTransactionsByPositionKey([{ isin: null, ticker: null, name: null }]);
    expect(grouped.size).toBe(0);
  });
});

describe('lastDayOfMonth', () => {
  it('handles 30/31-day months and February, including leap years', () => {
    expect(lastDayOfMonth('2024-01')).toBe('2024-01-31');
    expect(lastDayOfMonth('2024-04')).toBe('2024-04-30');
    expect(lastDayOfMonth('2024-02')).toBe('2024-02-29'); // leap year
    expect(lastDayOfMonth('2023-02')).toBe('2023-02-28'); // non-leap year
  });
});

describe('aggregatePositionsAsOf', () => {
  const tx = (over) => ({
    side: 'buy', isin: 'US0378331005', ticker: 'AAPL', name: 'Apple', date: '2024-01-01',
    quantity: 1, price: 100, total: 100, currency: 'EUR', externalId: null, ...over,
  });

  it('only counts transactions dated on or before the cutoff — answers "what if the file has dates before/after the target date"', () => {
    const transactions = [
      tx({ date: '2024-01-15', quantity: 10, total: 1000 }),
      tx({ date: '2024-02-15', quantity: 10, total: 1200 }), // after the March cutoff below? no — before
      tx({ date: '2024-06-15', quantity: 10, total: 1500 }), // clearly after the cutoff
    ];
    const asOfFebruary = aggregatePositionsAsOf(transactions, '2024-02-29');
    expect(asOfFebruary).toHaveLength(1);
    expect(asOfFebruary[0].quantity).toBe(20); // only the Jan + Feb buys
    expect(asOfFebruary[0].investedAmount).toBe(2200);
  });

  it('excludes rows with no parseable date — their place in the timeline is unknown', () => {
    const transactions = [tx({ date: null })];
    expect(aggregatePositionsAsOf(transactions, '2024-12-31')).toHaveLength(0);
  });
});

describe('buildMonthlyPositionTimeline', () => {
  const tx = (over) => ({
    side: 'buy', isin: 'US0378331005', ticker: 'AAPL', name: 'Apple', date: '2024-01-01',
    quantity: 1, price: 100, total: 100, currency: 'EUR', externalId: null, ...over,
  });

  it('produces one cumulative snapshot per distinct month, in chronological order', () => {
    const transactions = [
      tx({ date: '2024-03-10', quantity: 5, total: 500 }),
      tx({ date: '2024-01-10', quantity: 10, total: 1000 }),
      tx({ date: '2024-01-20', quantity: 2, total: 200 }),
    ];
    const timeline = buildMonthlyPositionTimeline(transactions);
    expect(timeline.map((m) => m.monthKey)).toEqual(['2024-01', '2024-03']); // sorted, February has no rows so it's absent
    expect(timeline[0].positions[0].quantity).toBe(12); // both January buys
    expect(timeline[1].positions[0].quantity).toBe(17); // January + March buys, cumulative
  });

  it('reflects a sell that happens between two snapshot months', () => {
    const transactions = [
      tx({ date: '2024-01-10', quantity: 10, total: 1000 }),
      tx({ side: 'sell', date: '2024-02-10', quantity: 4, total: 500 }),
    ];
    const timeline = buildMonthlyPositionTimeline(transactions);
    expect(timeline[0].positions[0].quantity).toBe(10);
    expect(timeline[1].positions[0].quantity).toBe(6);
  });

  it('returns an empty timeline when no transaction has a date', () => {
    expect(buildMonthlyPositionTimeline([tx({ date: null })])).toEqual([]);
  });
});

describe('lastRecordedValueBefore', () => {
  it('returns 0 when nothing is recorded yet (first-ever import)', () => {
    expect(lastRecordedValueBefore(undefined, '2024-01')).toBe(0);
    expect(lastRecordedValueBefore(new Map(), '2024-01')).toBe(0);
  });

  it('returns 0 when every recorded month is on or after the cutoff', () => {
    const recorded = new Map([['2024-01', 500], ['2024-02', 600]]);
    expect(lastRecordedValueBefore(recorded, '2024-01')).toBe(0);
  });

  it('carries forward the last recorded value strictly before the cutoff month — the multi-file export scenario', () => {
    // A broker export capped at 365 days means a 2021-2026 portfolio is built from
    // several separate file uploads. Re-importing the 2024 file must pick up where
    // the earlier (2021-2023) file's own backfill left off, not start from zero.
    const recorded = new Map([['2023-11', 1800], ['2023-12', 2000]]);
    expect(lastRecordedValueBefore(recorded, '2024-01')).toBe(2000);
  });

  it('ignores a null recorded value for the closest prior month and returns 0', () => {
    const recorded = new Map([['2023-12', null]]);
    expect(lastRecordedValueBefore(recorded, '2024-01')).toBe(0);
  });
});

describe('dedupeDividends', () => {
  const div = (externalId, over = {}) => ({
    isin: 'US0378331005', ticker: 'AAPL', name: 'Apple', date: '2024-01-01', amount: 1, currency: 'EUR', externalId, ...over,
  });

  it('drops rows sharing a platform id across merged files, keeps id-less rows', () => {
    const result = dedupeDividends([div('A'), div('A'), div('B'), div(null), div(null)]);
    expect(result).toHaveLength(4); // A, B, and both null-id rows
  });
});

describe('groupDividendsByPositionKey', () => {
  it('groups by ISIN, falling back to ticker then name, matching aggregateDividends', () => {
    const withIsin = { isin: 'US0378331005', ticker: 'AAPL', name: 'Apple' };
    const tickerOnly = { isin: null, ticker: 'CSCO', name: 'Cisco' };
    const grouped = groupDividendsByPositionKey([withIsin, withIsin, tickerOnly]);
    expect(grouped.get('US0378331005')).toHaveLength(2);
    expect(grouped.get('CSCO')).toHaveLength(1);
  });

  it('drops dividends with no usable identifier', () => {
    const grouped = groupDividendsByPositionKey([{ isin: null, ticker: null, name: null }]);
    expect(grouped.size).toBe(0);
  });
});

describe('aggregateDividends', () => {
  const div = (over) => ({
    isin: 'US0378331005', ticker: 'AAPL', name: 'Apple', date: '2024-01-01', amount: 1, currency: 'EUR', externalId: null, ...over,
  });

  it('sums payments for the same instrument and tracks the most recent date', () => {
    const [summary] = aggregateDividends([
      div({ amount: 0.5, date: '2024-03-01' }),
      div({ amount: 0.6, date: '2024-06-01' }),
    ]);
    expect(summary).toMatchObject({
      key: 'US0378331005', totalAmount: 1.1, paymentCount: 2, lastPaidDate: '2024-06-01', currency: 'EUR',
    });
  });

  it('sorts largest totals first', () => {
    const summaries = aggregateDividends([
      div({ isin: 'IE00B2NPKV68', ticker: 'IEMB', amount: 5 }),
      div({ isin: 'US0378331005', ticker: 'AAPL', amount: 50 }),
    ]);
    expect(summaries[0].ticker).toBe('AAPL');
  });

  it('nulls out currency when payments for the same instrument used different currencies, instead of silently summing mismatched amounts', () => {
    const [summary] = aggregateDividends([
      div({ currency: 'USD', amount: 1 }),
      div({ currency: 'EUR', amount: 1 }),
    ]);
    expect(summary.currency).toBeNull();
    expect(summary.totalAmount).toBe(2); // still summed - the wizard saves each payment with its own real currency regardless
  });

  it('drops dividends with no usable identifier', () => {
    expect(aggregateDividends([{ isin: null, ticker: null, name: null, amount: 1, currency: 'EUR', date: null, externalId: null }])).toEqual([]);
  });
});
