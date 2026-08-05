/**
 * Per-platform parsers for investment export CSVs.
 *
 * Platform signatures, verbatim headers and quirks are documented in
 * docs/INVESTMENT_IMPORT_RESEARCH.md. All parsers:
 *  - match columns BY HEADER NAME, never by index (column sets vary per user);
 *  - emit the same normalized transaction shape;
 *  - run entirely client-side (the file never leaves the browser — only the
 *    final, user-confirmed positions reach the API, like manual entry).
 */
import { parseImportNumber, parseImportDate, looksLikeIsin, extractCsvRows } from './normalize';

export type ImportPlatform = 'trading212' | 'degiro' | 'directa' | 'ledger' | 'binance' | 'cryptocom' | 'generic';

export interface ImportedTransaction {
  /** 'buy' | 'sell' — dividends/fees/cash ops are filtered out for holdings import. */
  side: 'buy' | 'sell';
  isin: string | null;
  ticker: string | null;
  name: string | null;
  /** "YYYY-MM-DD" */
  date: string | null;
  quantity: number | null;
  /** Price per unit in `currency` (null when the export only has totals). */
  price: number | null;
  /** Signed total, in `totalCurrency` when available. */
  total: number | null;
  /** Currency `price` is denominated in. */
  currency: string | null;
  /**
   * Currency `total` is denominated in — NOT always the same as `currency`:
   * Trading 212 quotes the per-share price in the instrument's own trading
   * currency (e.g. USD for a US stock) but converts Total to the account's
   * own currency (e.g. EUR) right in the export, with its own "Currency
   * (Total)" column and an explicit exchange rate. Converting `total` using
   * `currency` in that case double-converts an amount that's already in EUR.
   */
  totalCurrency: string | null;
  /** Platform transaction/order id — used for multi-file dedup. */
  externalId: string | null;
}

export interface ImportedDividend {
  isin: string | null;
  ticker: string | null;
  name: string | null;
  /** "YYYY-MM-DD" */
  date: string | null;
  /** Gross amount received, always positive, in `currency`. */
  amount: number;
  currency: string | null;
  /** Platform transaction id — used for dedup (see dedupeDividends). */
  externalId: string | null;
}

export interface ParsedImportFile {
  platform: ImportPlatform;
  transactions: ImportedTransaction[];
  dividends: ImportedDividend[];
  /** Rows recognized as non-trade, non-dividend operations (deposits, fees...) — counted for the summary. */
  skippedRows: number;
}

/** Case-insensitive header lookup returning the column index, or -1. */
const findColumn = (header: string[], ...names: string[]): number => {
  const lower = header.map((h) => h.toLowerCase());
  for (const name of names) {
    const idx = lower.indexOf(name.toLowerCase());
    if (idx !== -1) return idx;
  }
  return -1;
};

const cell = (row: string[], idx: number): string | null =>
  idx >= 0 && idx < row.length && row[idx] !== '' ? row[idx] : null;

/* ─── Platform detection by header signature ─── */

export function detectPlatform(header: string[]): ImportPlatform | null {
  const lower = header.map((h) => h.toLowerCase());
  const has = (...names: string[]) => names.every((n) => lower.includes(n.toLowerCase()));

  // Trading 212: "Action,Time (UTC),ISIN,Ticker,Name,No. of shares,Price / share,..."
  // (older/regional exports may use a plain "Time" column instead of "Time (UTC)")
  const hasTime = lower.includes('time') || lower.includes('time (utc)');
  if (has('action', 'isin') && hasTime && (has('no. of shares') || has('ticker'))) return 'trading212';
  // Directa: "Data operazione,...,Tipo operazione,Ticker,Isin,...,Quantità,Importo euro,...,Divisa,Riferimento ordine"
  if (has('data operazione', 'tipo operazione', 'isin')) return 'directa';
  // DEGIRO Transactions.csv (EN/IT variants share Product+ISIN+Exchange structure)
  if (has('isin') && (has('product') || has('prodotto')) && (has('exchange') || has('borsa'))) return 'degiro';
  // Ledger Wallet (formerly Ledger Live) operations export.
  if (has('operation date', 'status', 'currency ticker', 'operation type', 'operation amount', 'operation hash')) return 'ledger';
  // Binance Account Statement / Export Transaction Records balance ledger.
  if (has('user_id', 'utc_time', 'account', 'operation', 'coin', 'change')) return 'binance';
  // Crypto.com App transaction-history export (different from Crypto.com Exchange trade history).
  if (has('timestamp (utc)', 'transaction description', 'currency', 'amount', 'transaction kind')) return 'cryptocom';
  // Generic fallback (Portfolio Performance / Ghostfolio style): a Date + ISIN-or-Ticker + Type/Action + quantity-ish column
  if ((has('date') || has('data')) && (lower.includes('isin') || lower.includes('ticker') || lower.includes('symbol'))
      && (lower.includes('type') || lower.includes('action') || lower.includes('tipo'))) return 'generic';
  return null;
}

/* ─── Trading 212 ─── */

const T212_BUY_ACTIONS = ['market buy', 'limit buy', 'stop buy'];
const T212_SELL_ACTIONS = ['market sell', 'limit sell', 'stop sell'];

function parseTrading212(header: string[], rows: string[][]): ParsedImportFile {
  const col = {
    action: findColumn(header, 'Action'),
    time: findColumn(header, 'Time (UTC)', 'Time'),
    isin: findColumn(header, 'ISIN'),
    ticker: findColumn(header, 'Ticker'),
    name: findColumn(header, 'Name'),
    shares: findColumn(header, 'No. of shares'),
    price: findColumn(header, 'Price / share'),
    priceCurrency: findColumn(header, 'Currency (Price / share)'),
    total: findColumn(header, 'Total'),
    totalCurrency: findColumn(header, 'Currency (Total)'),
    id: findColumn(header, 'ID'),
  };
  const transactions: ImportedTransaction[] = [];
  const dividends: ImportedDividend[] = [];
  let skippedRows = 0;
  for (const row of rows) {
    const action = (cell(row, col.action) || '').toLowerCase();
    const side = T212_BUY_ACTIONS.includes(action) ? 'buy' : T212_SELL_ACTIONS.includes(action) ? 'sell' : null;
    if (side) {
      transactions.push({
        side,
        isin: cell(row, col.isin),
        ticker: cell(row, col.ticker),
        name: cell(row, col.name),
        date: parseImportDate(cell(row, col.time)),
        quantity: parseImportNumber(cell(row, col.shares)),
        price: parseImportNumber(cell(row, col.price)),
        total: parseImportNumber(cell(row, col.total)),
        currency: cell(row, col.priceCurrency),
        totalCurrency: cell(row, col.totalCurrency),
        externalId: cell(row, col.id),
      });
      continue;
    }
    // T212's Action for a dividend payment is e.g. "Dividend (Ordinary)",
    // "Dividend (Dividend)", "Dividend (Bonus)", "Dividend (Demerger)" —
    // matching on the "dividend" prefix covers all of these variants.
    if (action.includes('dividend')) {
      const amount = parseImportNumber(cell(row, col.total));
      if (amount != null) {
        dividends.push({
          isin: cell(row, col.isin),
          ticker: cell(row, col.ticker),
          name: cell(row, col.name),
          date: parseImportDate(cell(row, col.time)),
          amount: Math.abs(amount),
          currency: cell(row, col.totalCurrency),
          externalId: cell(row, col.id),
        });
        continue;
      }
    }
    skippedRows++;
  }
  return { platform: 'trading212', transactions, dividends, skippedRows };
}

/* ─── DEGIRO Transactions.csv ─── */

function parseDegiro(header: string[], rows: string[][]): ParsedImportFile {
  const col = {
    date: findColumn(header, 'Date', 'Data', 'Datum'),
    product: findColumn(header, 'Product', 'Prodotto'),
    isin: findColumn(header, 'ISIN'),
    quantity: findColumn(header, 'Quantity', 'Quantità', 'Aantal', 'Anzahl'),
    price: findColumn(header, 'Price', 'Prezzo', 'Koers', 'Kurs'),
    total: findColumn(header, 'Total', 'Totale', 'Totaal', 'Gesamt'),
    orderId: findColumn(header, 'Order ID', 'ID Ordine', 'Order Id'),
  };
  const transactions: ImportedTransaction[] = [];
  let skippedRows = 0;
  for (const row of rows) {
    const quantity = parseImportNumber(cell(row, col.quantity));
    const isin = cell(row, col.isin);
    // DEGIRO's Transactions.csv contains only trades: the sign of Quantity is the side
    if (quantity == null || quantity === 0 || !isin) { skippedRows++; continue; }
    transactions.push({
      side: quantity > 0 ? 'buy' : 'sell',
      isin,
      ticker: null,
      name: cell(row, col.product),
      date: parseImportDate(cell(row, col.date)),
      quantity: Math.abs(quantity),
      price: parseImportNumber(cell(row, col.price)),
      total: parseImportNumber(cell(row, col.total)),
      currency: null, // travels in unnamed companion columns — resolved at instrument level instead
      totalCurrency: null,
      externalId: cell(row, col.orderId),
    });
  }
  // DEGIRO's Transactions.csv contains only trades - dividends are cash
  // movements recorded in a separate export (Account.csv) this parser doesn't
  // read, so there's nothing to extract here (never guessed/half-supported).
  return { platform: 'degiro', transactions, dividends: [], skippedRows };
}

/* ─── Directa SIM ─── */

const DIRECTA_BUY_TYPES = ['acquisto', 'acquisto etf', 'acquisto azioni', 'sottoscrizione'];
const DIRECTA_SELL_TYPES = ['vendita', 'vendita etf', 'vendita azioni', 'rimborso'];
// "Provento" is Directa's umbrella term for any income distribution — ETF
// distributions, stock dividends, bond coupons ("Provento etf", "Provento
// azioni", ...) — matching the prefix covers all of them the same way the
// buy/sell prefix lists above do.
const DIRECTA_DIVIDEND_PREFIX = 'provento';

function parseDirecta(header: string[], rows: string[][]): ParsedImportFile {
  const col = {
    date: findColumn(header, 'Data operazione'),
    type: findColumn(header, 'Tipo operazione'),
    ticker: findColumn(header, 'Ticker'),
    isin: findColumn(header, 'Isin', 'ISIN'),
    name: findColumn(header, 'Descrizione'),
    quantity: findColumn(header, 'Quantità', 'Quantita'),
    totalEur: findColumn(header, 'Importo euro'),
    currency: findColumn(header, 'Divisa'),
    orderRef: findColumn(header, 'Riferimento ordine'),
  };
  const transactions: ImportedTransaction[] = [];
  const dividends: ImportedDividend[] = [];
  let skippedRows = 0;
  for (const row of rows) {
    const type = (cell(row, col.type) || '').toLowerCase();
    const side = DIRECTA_BUY_TYPES.some((t) => type.startsWith(t)) ? 'buy'
      : DIRECTA_SELL_TYPES.some((t) => type.startsWith(t)) ? 'sell' : null;
    if (side) {
      const quantity = parseImportNumber(cell(row, col.quantity));
      const total = parseImportNumber(cell(row, col.totalEur));
      const currency = cell(row, col.currency) || 'EUR';
      transactions.push({
        side,
        isin: cell(row, col.isin),
        ticker: cell(row, col.ticker),
        name: cell(row, col.name),
        date: parseImportDate(cell(row, col.date)),
        quantity: quantity != null ? Math.abs(quantity) : null,
        price: quantity && total ? Math.abs(total / quantity) : null,
        total,
        currency,
        totalCurrency: currency,
        externalId: cell(row, col.orderRef),
      });
      continue;
    }
    if (type.startsWith(DIRECTA_DIVIDEND_PREFIX)) {
      const amount = parseImportNumber(cell(row, col.totalEur));
      if (amount != null) {
        dividends.push({
          isin: cell(row, col.isin),
          ticker: cell(row, col.ticker),
          name: cell(row, col.name),
          date: parseImportDate(cell(row, col.date)),
          amount: Math.abs(amount),
          currency: cell(row, col.currency) || 'EUR',
          externalId: cell(row, col.orderRef),
        });
        continue;
      }
    }
    skippedRows++;
  }
  return { platform: 'directa', transactions, dividends, skippedRows };
}

/* ─── Crypto wallets / exchanges ─── */

const FIAT_TICKERS = new Set([
  'AED', 'ARS', 'AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CLP', 'CNY', 'COP', 'CZK', 'DKK', 'EUR', 'GBP',
  'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KRW', 'MXN', 'MYR', 'NGN', 'NOK', 'NZD', 'PEN', 'PHP',
  'PLN', 'RON', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'TWD', 'UAH', 'USD', 'VND', 'ZAR',
]);

const cryptoTicker = (value: string | null): string | null => {
  const ticker = value?.trim().toUpperCase() || null;
  return ticker && !FIAT_TICKERS.has(ticker) ? ticker : null;
};

function parseLedger(header: string[], rows: string[][]): ParsedImportFile {
  const col = {
    date: findColumn(header, 'Operation Date'), status: findColumn(header, 'Status'), ticker: findColumn(header, 'Currency Ticker'),
    type: findColumn(header, 'Operation Type'), amount: findColumn(header, 'Operation Amount'), hash: findColumn(header, 'Operation Hash'),
    accountName: findColumn(header, 'Account Name'), countervalueTicker: findColumn(header, 'Countervalue Ticker'),
    historicalCountervalue: findColumn(header, 'Countervalue at Operation Date'),
  };
  const transactions: ImportedTransaction[] = [];
  let skippedRows = 0;
  for (const row of rows) {
    const status = (cell(row, col.status) || '').toLowerCase();
    const type = (cell(row, col.type) || '').toUpperCase();
    const ticker = cryptoTicker(cell(row, col.ticker));
    const quantity = parseImportNumber(cell(row, col.amount));
    const date = parseImportDate(cell(row, col.date));
    if (status !== 'confirmed' || !ticker || !quantity || quantity <= 0 || !date || (type !== 'IN' && type !== 'OUT')) {
      skippedRows++;
      continue;
    }
    const total = parseImportNumber(cell(row, col.historicalCountervalue));
    const hash = cell(row, col.hash);
    transactions.push({
      side: type === 'IN' ? 'buy' : 'sell', isin: null, ticker, name: cell(row, col.accountName) || ticker,
      date, quantity, price: total != null ? Math.abs(total / quantity) : null, total: total != null ? Math.abs(total) : null,
      currency: ticker, totalCurrency: cell(row, col.countervalueTicker)?.toUpperCase() || null,
      externalId: hash ? `${hash}:${ticker}:${type}` : null,
    });
  }
  return {platform: 'ledger', transactions, dividends: [], skippedRows};
}

function parseBinance(header: string[], rows: string[][]): ParsedImportFile {
  const col = {
    date: findColumn(header, 'UTC_Time'), coin: findColumn(header, 'Coin'), change: findColumn(header, 'Change'),
  };
  const transactions: ImportedTransaction[] = [];
  let skippedRows = 0;
  for (const row of rows) {
    const ticker = cryptoTicker(cell(row, col.coin));
    const change = parseImportNumber(cell(row, col.change));
    const date = parseImportDate(cell(row, col.date));
    if (!ticker || change == null || change === 0 || !date) { skippedRows++; continue; }
    transactions.push({
      side: change > 0 ? 'buy' : 'sell', isin: null, ticker, name: ticker, date, quantity: Math.abs(change),
      price: null, total: null, currency: ticker, totalCurrency: null, externalId: null,
    });
  }
  return {platform: 'binance', transactions, dividends: [], skippedRows};
}

function parseCryptoCom(header: string[], rows: string[][]): ParsedImportFile {
  const col = {
    date: findColumn(header, 'Timestamp (UTC)'), currency: findColumn(header, 'Currency'), amount: findColumn(header, 'Amount'),
    toCurrency: findColumn(header, 'To Currency'), toAmount: findColumn(header, 'To Amount'),
    nativeCurrency: findColumn(header, 'Native Currency'), nativeAmount: findColumn(header, 'Native Amount'),
    description: findColumn(header, 'Transaction Description'), hash: findColumn(header, 'Transaction Hash'),
  };
  const transactions: ImportedTransaction[] = [];
  let skippedRows = 0;
  for (const row of rows) {
    const date = parseImportDate(cell(row, col.date));
    const nativeCurrency = cell(row, col.nativeCurrency)?.toUpperCase() || null;
    const nativeAmount = parseImportNumber(cell(row, col.nativeAmount));
    const hash = cell(row, col.hash);
    const legs = [
      {ticker: cryptoTicker(cell(row, col.currency)), amount: parseImportNumber(cell(row, col.amount))},
      {ticker: cryptoTicker(cell(row, col.toCurrency)), amount: parseImportNumber(cell(row, col.toAmount))},
    ].filter((leg): leg is {ticker: string; amount: number} => Boolean(leg.ticker) && leg.amount != null && leg.amount !== 0);
    if (!date || legs.length === 0) { skippedRows++; continue; }
    for (const leg of legs) {
      const total = nativeAmount != null ? Math.abs(nativeAmount) : null;
      transactions.push({
        side: leg.amount > 0 ? 'buy' : 'sell', isin: null, ticker: leg.ticker, name: cell(row, col.description) || leg.ticker,
        date, quantity: Math.abs(leg.amount), price: total != null ? total / Math.abs(leg.amount) : null, total,
        currency: leg.ticker, totalCurrency: nativeCurrency, externalId: hash ? `${hash}:${leg.ticker}` : null,
      });
    }
  }
  return {platform: 'cryptocom', transactions, dividends: [], skippedRows};
}

/* ─── Generic (Portfolio Performance / Ghostfolio style) ─── */

const GENERIC_BUY = ['buy', 'acquisto', 'kauf', 'purchase'];
const GENERIC_SELL = ['sell', 'vendita', 'verkauf'];
// Covers the common en/it/fr/de/es spellings of "dividend" as a transaction type.
const GENERIC_DIVIDEND = ['dividend', 'dividendo', 'dividende'];

function parseGeneric(header: string[], rows: string[][]): ParsedImportFile {
  const col = {
    date: findColumn(header, 'Date', 'Data', 'Datum'),
    type: findColumn(header, 'Type', 'Action', 'Tipo'),
    isin: findColumn(header, 'ISIN'),
    ticker: findColumn(header, 'Ticker', 'Symbol'),
    name: findColumn(header, 'Name', 'Security Name', 'Nome'),
    quantity: findColumn(header, 'Shares', 'Quantity', 'Quantità', 'Units'),
    price: findColumn(header, 'Quote', 'Price', 'Prezzo', 'Unit Price'),
    total: findColumn(header, 'Amount', 'Value', 'Total', 'Importo'),
    currency: findColumn(header, 'Currency', 'Transaction Currency', 'Valuta', 'Divisa'),
  };
  const transactions: ImportedTransaction[] = [];
  const dividends: ImportedDividend[] = [];
  let skippedRows = 0;
  for (const row of rows) {
    const type = (cell(row, col.type) || '').toLowerCase();
    const side = GENERIC_BUY.some((t) => type.includes(t)) ? 'buy'
      : GENERIC_SELL.some((t) => type.includes(t)) ? 'sell' : null;
    if (side) {
      const currency = cell(row, col.currency);
      // Some generic exports (e.g. TradeRepublic) sign the shares column
      // itself (negative on a sell) instead of always reporting a positive
      // magnitude - every other parser here (Trading212, DEGIRO, Directa)
      // always yields a positive quantity and lets `side` carry the
      // direction, which is what aggregatePositions/closedPositions assume
      // (a sell's quantity is subtracted via `side`, not via its own sign).
      // Without normalizing, a negative sell quantity fails aggregate.ts's
      // `tx.quantity <= 0` guard and gets silently dropped from position
      // math entirely - the sell is never subtracted, so a fully-sold
      // position keeps showing its original buy quantity forever.
      const rawQuantity = parseImportNumber(cell(row, col.quantity));
      transactions.push({
        side,
        isin: cell(row, col.isin),
        ticker: cell(row, col.ticker),
        name: cell(row, col.name),
        date: parseImportDate(cell(row, col.date)),
        quantity: rawQuantity != null ? Math.abs(rawQuantity) : null,
        price: parseImportNumber(cell(row, col.price)),
        total: parseImportNumber(cell(row, col.total)),
        currency,
        totalCurrency: currency,
        externalId: null,
      });
      continue;
    }
    if (GENERIC_DIVIDEND.some((t) => type.includes(t))) {
      const amount = parseImportNumber(cell(row, col.total));
      if (amount != null) {
        dividends.push({
          isin: cell(row, col.isin),
          ticker: cell(row, col.ticker),
          name: cell(row, col.name),
          date: parseImportDate(cell(row, col.date)),
          amount: Math.abs(amount),
          currency: cell(row, col.currency),
          externalId: null,
        });
        continue;
      }
    }
    skippedRows++;
  }
  return { platform: 'generic', transactions, dividends, skippedRows };
}

/* ─── Entry point ─── */

/**
 * Parses raw CSV text from an investment export. Returns null when no
 * supported platform signature is recognized in the header.
 */
export function parseInvestmentCsv(rawText: string): ParsedImportFile | null {
  const extracted = extractCsvRows(rawText);
  if (!extracted) return null;
  const platform = detectPlatform(extracted.header);
  if (!platform) return null;

  const parsed = (() => {
    switch (platform) {
      case 'trading212': return parseTrading212(extracted.header, extracted.rows);
      case 'degiro': return parseDegiro(extracted.header, extracted.rows);
      case 'directa': return parseDirecta(extracted.header, extracted.rows);
      case 'ledger': return parseLedger(extracted.header, extracted.rows);
      case 'binance': return parseBinance(extracted.header, extracted.rows);
      case 'cryptocom': return parseCryptoCom(extracted.header, extracted.rows);
      case 'generic': return parseGeneric(extracted.header, extracted.rows);
    }
  })();

  // Normalize ISINs and drop malformed ones so downstream resolution can trust the field
  parsed.transactions = parsed.transactions.map((tx) => ({
    ...tx,
    isin: tx.isin && looksLikeIsin(tx.isin) ? tx.isin.toUpperCase() : null,
  }));
  parsed.dividends = parsed.dividends.map((d) => ({
    ...d,
    isin: d.isin && looksLikeIsin(d.isin) ? d.isin.toUpperCase() : null,
  }));
  return parsed;
}
