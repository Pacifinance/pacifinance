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

export type ImportPlatform = 'trading212' | 'degiro' | 'directa' | 'generic';

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
  /** Signed total in the account currency when available. */
  total: number | null;
  currency: string | null;
  /** Platform transaction/order id — used for multi-file dedup. */
  externalId: string | null;
}

export interface ParsedImportFile {
  platform: ImportPlatform;
  transactions: ImportedTransaction[];
  /** Rows recognized as non-trade operations (dividends, deposits, fees...) — counted for the summary. */
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

  // Trading 212: "Action,Time,ISIN,Ticker,Name,No. of shares,Price / share,..."
  if (has('action', 'time', 'isin') && (has('no. of shares') || has('ticker'))) return 'trading212';
  // Directa: "Data operazione,...,Tipo operazione,Ticker,Isin,...,Quantità,Importo euro,...,Divisa,Riferimento ordine"
  if (has('data operazione', 'tipo operazione', 'isin')) return 'directa';
  // DEGIRO Transactions.csv (EN/IT variants share Product+ISIN+Exchange structure)
  if (has('isin') && (has('product') || has('prodotto')) && (has('exchange') || has('borsa'))) return 'degiro';
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
    time: findColumn(header, 'Time'),
    isin: findColumn(header, 'ISIN'),
    ticker: findColumn(header, 'Ticker'),
    name: findColumn(header, 'Name'),
    shares: findColumn(header, 'No. of shares'),
    price: findColumn(header, 'Price / share'),
    priceCurrency: findColumn(header, 'Currency (Price / share)'),
    total: findColumn(header, 'Total'),
    id: findColumn(header, 'ID'),
  };
  const transactions: ImportedTransaction[] = [];
  let skippedRows = 0;
  for (const row of rows) {
    const action = (cell(row, col.action) || '').toLowerCase();
    const side = T212_BUY_ACTIONS.includes(action) ? 'buy' : T212_SELL_ACTIONS.includes(action) ? 'sell' : null;
    if (!side) { skippedRows++; continue; }
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
      externalId: cell(row, col.id),
    });
  }
  return { platform: 'trading212', transactions, skippedRows };
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
      externalId: cell(row, col.orderId),
    });
  }
  return { platform: 'degiro', transactions, skippedRows };
}

/* ─── Directa SIM ─── */

const DIRECTA_BUY_TYPES = ['acquisto', 'acquisto etf', 'acquisto azioni', 'sottoscrizione'];
const DIRECTA_SELL_TYPES = ['vendita', 'vendita etf', 'vendita azioni', 'rimborso'];

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
  let skippedRows = 0;
  for (const row of rows) {
    const type = (cell(row, col.type) || '').toLowerCase();
    const side = DIRECTA_BUY_TYPES.some((t) => type.startsWith(t)) ? 'buy'
      : DIRECTA_SELL_TYPES.some((t) => type.startsWith(t)) ? 'sell' : null;
    if (!side) { skippedRows++; continue; }
    const quantity = parseImportNumber(cell(row, col.quantity));
    const total = parseImportNumber(cell(row, col.totalEur));
    transactions.push({
      side,
      isin: cell(row, col.isin),
      ticker: cell(row, col.ticker),
      name: cell(row, col.name),
      date: parseImportDate(cell(row, col.date)),
      quantity: quantity != null ? Math.abs(quantity) : null,
      price: quantity && total ? Math.abs(total / quantity) : null,
      total,
      currency: cell(row, col.currency) || 'EUR',
      externalId: cell(row, col.orderRef),
    });
  }
  return { platform: 'directa', transactions, skippedRows };
}

/* ─── Generic (Portfolio Performance / Ghostfolio style) ─── */

const GENERIC_BUY = ['buy', 'acquisto', 'kauf', 'purchase'];
const GENERIC_SELL = ['sell', 'vendita', 'verkauf'];

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
  let skippedRows = 0;
  for (const row of rows) {
    const type = (cell(row, col.type) || '').toLowerCase();
    const side = GENERIC_BUY.some((t) => type.includes(t)) ? 'buy'
      : GENERIC_SELL.some((t) => type.includes(t)) ? 'sell' : null;
    if (!side) { skippedRows++; continue; }
    transactions.push({
      side,
      isin: cell(row, col.isin),
      ticker: cell(row, col.ticker),
      name: cell(row, col.name),
      date: parseImportDate(cell(row, col.date)),
      quantity: parseImportNumber(cell(row, col.quantity)),
      price: parseImportNumber(cell(row, col.price)),
      total: parseImportNumber(cell(row, col.total)),
      currency: cell(row, col.currency),
      externalId: null,
    });
  }
  return { platform: 'generic', transactions, skippedRows };
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
      case 'generic': return parseGeneric(extracted.header, extracted.rows);
    }
  })();

  // Normalize ISINs and drop malformed ones so downstream resolution can trust the field
  parsed.transactions = parsed.transactions.map((tx) => ({
    ...tx,
    isin: tx.isin && looksLikeIsin(tx.isin) ? tx.isin.toUpperCase() : null,
  }));
  return parsed;
}
