/**
 * Turns a normalized transaction list (possibly merged from multiple export
 * files) into per-instrument positions ready to be saved as holdings.
 * Pure functions — no I/O.
 */
import type { ImportedDividend, ImportedTransaction } from './parsers';

export interface AggregatedPosition {
  /** Grouping key: ISIN when available, else ticker, else name. */
  key: string;
  isin: string | null;
  ticker: string | null;
  name: string | null;
  /** Net quantity after buys - sells. */
  quantity: number;
  /** Net invested: buy totals - sell totals, in `investedAmountCurrency`, when totals were present. */
  investedAmount: number | null;
  /** Weighted average buy price, in `currency`, when prices were present. */
  averagePrice: number | null;
  /** Currency `averagePrice` is denominated in. */
  currency: string | null;
  /**
   * Currency `investedAmount` is denominated in — see ImportedTransaction.totalCurrency
   * for why this isn't always the same as `currency` (e.g. a USD-priced stock
   * bought from a EUR Trading 212 account: price is quoted in USD, but Total —
   * and therefore investedAmount — is already converted to EUR in the file).
   */
  investedAmountCurrency: string | null;
  /** Date of the most recent transaction contributing to the position. */
  lastTransactionDate: string | null;
  transactionCount: number;
}

/**
 * Removes duplicate transactions across merged files. Platforms cap exports
 * (365 days, 3000 rows...) so users legitimately upload overlapping files —
 * the platform transaction id is the dedup key when present; rows without an
 * id are kept as-is (same-day identical trades are legal, e.g. two equal PAC
 * buys, so guessing would silently drop real data).
 */
export function dedupeTransactions(transactions: ImportedTransaction[]): ImportedTransaction[] {
  const seen = new Set<string>();
  return transactions.filter((tx) => {
    if (!tx.externalId) return true;
    if (seen.has(tx.externalId)) return false;
    seen.add(tx.externalId);
    return true;
  });
}

/**
 * Same idea as dedupeTransactions, for dividend rows: the platform transaction
 * id is the dedup key when present (rows without one are kept as-is, since a
 * same-day duplicate can be legitimate - e.g. two positions in the same
 * instrument both paying a dividend the same day would look identical here).
 */
export function dedupeDividends(dividends: ImportedDividend[]): ImportedDividend[] {
  const seen = new Set<string>();
  return dividends.filter((d) => {
    if (!d.externalId) return true;
    if (seen.has(d.externalId)) return false;
    seen.add(d.externalId);
    return true;
  });
}

/** The same grouping key used throughout this module: ISIN, else ticker, else name. */
export function positionKeyFor(tx: Pick<ImportedTransaction, 'isin' | 'ticker' | 'name'>): string | null {
  return tx.isin ?? tx.ticker ?? tx.name ?? null;
}

/**
 * Groups transactions by the same key aggregatePositions uses, so callers can
 * look up "all the raw transactions behind this one aggregated position" —
 * e.g. to build its monthly history timeline after the user picks which
 * positions to import.
 */
export function groupTransactionsByPositionKey(transactions: ImportedTransaction[]): Map<string, ImportedTransaction[]> {
  const byKey = new Map<string, ImportedTransaction[]>();
  for (const tx of transactions) {
    const key = positionKeyFor(tx);
    if (!key) continue;
    const group = byKey.get(key);
    if (group) group.push(tx);
    else byKey.set(key, [tx]);
  }
  return byKey;
}

/** Same idea as groupTransactionsByPositionKey, for dividend rows. */
export function groupDividendsByPositionKey(dividends: ImportedDividend[]): Map<string, ImportedDividend[]> {
  const byKey = new Map<string, ImportedDividend[]>();
  for (const d of dividends) {
    const key = positionKeyFor(d);
    if (!key) continue;
    const group = byKey.get(key);
    if (group) group.push(d);
    else byKey.set(key, [d]);
  }
  return byKey;
}

/**
 * Same aggregation aggregatePositions does, but keeps fully-closed (net
 * quantity zero or negative) positions instead of dropping them — needed to
 * detect "the file shows this position was fully sold" for an instrument the
 * user already holds (see closedPositionKeys below), which aggregatePositions'
 * own filtering would otherwise silently hide from the import wizard entirely.
 */
function aggregateAllPositions(transactions: ImportedTransaction[]): AggregatedPosition[] {
  const byKey = new Map<string, AggregatedPosition & { buyQuantity: number; buyCost: number }>();

  for (const tx of transactions) {
    if (tx.quantity == null || tx.quantity <= 0) continue;
    const key = positionKeyFor(tx);
    if (!key) continue;

    let position = byKey.get(key);
    if (!position) {
      position = {
        key,
        isin: tx.isin,
        ticker: tx.ticker,
        name: tx.name,
        quantity: 0,
        investedAmount: null,
        averagePrice: null,
        currency: tx.currency,
        investedAmountCurrency: tx.totalCurrency,
        lastTransactionDate: null,
        transactionCount: 0,
        buyQuantity: 0,
        buyCost: 0,
      };
      byKey.set(key, position);
    }

    // Fill identity fields from later rows if earlier ones were missing them
    position.isin = position.isin ?? tx.isin;
    position.ticker = position.ticker ?? tx.ticker;
    position.name = position.name ?? tx.name;
    position.currency = position.currency ?? tx.currency;
    position.investedAmountCurrency = position.investedAmountCurrency ?? tx.totalCurrency;

    const signedQuantity = tx.side === 'buy' ? tx.quantity : -tx.quantity;
    position.quantity += signedQuantity;
    position.transactionCount += 1;
    if (tx.date && (!position.lastTransactionDate || tx.date > position.lastTransactionDate)) {
      position.lastTransactionDate = tx.date;
    }
    if (tx.total != null) {
      const magnitude = Math.abs(tx.total);
      position.investedAmount = (position.investedAmount ?? 0) + (tx.side === 'buy' ? magnitude : -magnitude);
    }
    if (tx.side === 'buy' && tx.price != null) {
      position.buyQuantity += tx.quantity;
      position.buyCost += tx.quantity * tx.price;
    }
  }

  const positions: AggregatedPosition[] = [];
  for (const position of byKey.values()) {
    const { buyQuantity, buyCost, ...rest } = position;
    positions.push({
      ...rest,
      quantity: roundQuantity(position.quantity),
      averagePrice: buyQuantity > 0 ? buyCost / buyQuantity : null,
      investedAmount: position.investedAmount != null ? Math.max(position.investedAmount, 0) : null,
    });
  }
  // Largest positions first — the preview list stays scannable
  return positions.sort((a, b) => (b.investedAmount ?? 0) - (a.investedAmount ?? 0));
}

/**
 * Aggregates buy/sell transactions into net positions per instrument.
 * Positions with zero (or negative, i.e. inconsistent) net quantity are
 * dropped — fully-closed positions aren't holdings to import as new ones
 * (see closedPositionKeys for detecting a full sell of an already-held one).
 */
export function aggregatePositions(transactions: ImportedTransaction[]): AggregatedPosition[] {
  return aggregateAllPositions(transactions).filter((p) => p.quantity > 0);
}

/**
 * Positions the file shows as fully closed (net quantity zero or negative) —
 * aggregatePositions excludes these entirely, but the import wizard still
 * needs to know they exist (including their last transaction date, to
 * backfill a final "sold" snapshot) so it can offer to close any already-held
 * instrument the file shows has since been fully sold, instead of silently
 * leaving a stale holding untouched forever.
 */
export function closedPositions(transactions: ImportedTransaction[]): AggregatedPosition[] {
  return aggregateAllPositions(transactions).filter((p) => p.quantity <= 0);
}

/** Trims float noise from summed fractional share quantities (T212 has 10-decimal shares). */
function roundQuantity(value: number): number {
  return Number(value.toFixed(10));
}

export interface AggregatedDividend {
  /** Grouping key: ISIN when available, else ticker, else name — same as AggregatedPosition. */
  key: string;
  isin: string | null;
  ticker: string | null;
  name: string | null;
  /** Sum of every payment's amount, in `currency` when all payments share one — see note below. */
  totalAmount: number;
  /**
   * Only set when every payment for this instrument shares the same currency —
   * left null when they don't (e.g. a US stock that used to pay in USD before
   * a broker migration started converting to EUR) rather than silently
   * summing mismatched currencies into one misleading number. The wizard
   * still saves each individual payment with its own real currency either
   * way; this only affects the preview total shown before importing.
   */
  currency: string | null;
  paymentCount: number;
  lastPaidDate: string | null;
}

/**
 * Groups dividend payments by the same instrument key aggregatePositions uses,
 * for the CSV import wizard's pre-import preview (see InvestmentImportWizard).
 * The actual saved records are always the individual payments (one row per
 * real payment in user_investment_dividends) — this is only a display total.
 */
export function aggregateDividends(dividends: ImportedDividend[]): AggregatedDividend[] {
  const byKey = new Map<string, AggregatedDividend>();
  for (const d of dividends) {
    const key = positionKeyFor(d);
    if (!key) continue;

    let agg = byKey.get(key);
    if (!agg) {
      agg = {
        key, isin: d.isin, ticker: d.ticker, name: d.name,
        totalAmount: 0, currency: d.currency, paymentCount: 0, lastPaidDate: null,
      };
      byKey.set(key, agg);
    }

    agg.isin = agg.isin ?? d.isin;
    agg.ticker = agg.ticker ?? d.ticker;
    agg.name = agg.name ?? d.name;
    if (agg.currency !== d.currency) agg.currency = null;
    agg.totalAmount += d.amount;
    agg.paymentCount += 1;
    if (d.date && (!agg.lastPaidDate || d.date > agg.lastPaidDate)) agg.lastPaidDate = d.date;
  }
  return Array.from(byKey.values()).sort((a, b) => b.totalAmount - a.totalAmount);
}

/**
 * Aggregates only the transactions dated on or before `asOfDate` (inclusive,
 * "YYYY-MM-DD") — the net position as it stood at that point in time, not
 * today. Rows with no parseable date are excluded (their place in the
 * timeline is unknown), matching how they're already dropped elsewhere.
 */
export function aggregatePositionsAsOf(transactions: ImportedTransaction[], asOfDate: string): AggregatedPosition[] {
  return aggregatePositions(transactions.filter((tx) => tx.date != null && tx.date <= asOfDate));
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Last calendar day of "YYYY-MM" as "YYYY-MM-DD" (pure calendar math, no timezone involved). */
export function lastDayOfMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const day = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${monthKey}-${pad2(day)}`;
}

/**
 * Finds the most recently recorded value for a month strictly before
 * `beforeMonth` ("YYYY-MM"), or 0 if there is none - the "starting balance" a
 * newly-imported file's own cumulative timeline (invested amount OR quantity -
 * both need this the same way) needs to be added on top of. Brokers cap how
 * much history a single export covers (e.g. Trading212: 365 days), so a
 * multi-year portfolio is necessarily built from several separately-uploaded
 * files; each file's own transactions only reconstruct a cumulative total
 * *within its own date range*, with no way to know what was already invested/
 * held before it started - without this baseline, every month covered by a
 * later file would understate the true total.
 */
export function lastRecordedValueBefore(recorded: Map<string, number | null> | undefined, beforeMonth: string): number {
  if (!recorded) return 0;
  const priorMonths = Array.from(recorded.keys()).filter((m) => m < beforeMonth).sort();
  const lastPriorMonth = priorMonths[priorMonths.length - 1];
  const lastPriorValue = lastPriorMonth ? recorded.get(lastPriorMonth) : null;
  return lastPriorValue ?? 0;
}

export interface MonthlyPositionSnapshot {
  /** "YYYY-MM" */
  monthKey: string;
  /** Net positions as they stood at the end of this month. */
  positions: AggregatedPosition[];
}

/**
 * Reconstructs the portfolio's monthly timeline from transaction dates alone:
 * one cumulative snapshot per distinct calendar month present in the file, in
 * chronological order. This is what lets a single CSV import backfill an
 * instant "value over time" history instead of just today's net position —
 * every month gets exactly the transactions dated on or before its end,
 * regardless of where else in the file later or earlier rows appear.
 */
export function buildMonthlyPositionTimeline(transactions: ImportedTransaction[]): MonthlyPositionSnapshot[] {
  const monthKeys = Array.from(new Set(
    transactions.map((tx) => tx.date?.slice(0, 7)).filter((key): key is string => Boolean(key)),
  )).sort();
  return monthKeys.map((monthKey) => ({
    monthKey,
    positions: aggregatePositionsAsOf(transactions, lastDayOfMonth(monthKey)),
  }));
}
