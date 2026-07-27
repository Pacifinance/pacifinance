/**
 * Turns a normalized transaction list (possibly merged from multiple export
 * files) into per-instrument positions ready to be saved as holdings.
 * Pure functions — no I/O.
 */
import type { ImportedTransaction } from './parsers';

export interface AggregatedPosition {
  /** Grouping key: ISIN when available, else ticker, else name. */
  key: string;
  isin: string | null;
  ticker: string | null;
  name: string | null;
  /** Net quantity after buys - sells. */
  quantity: number;
  /** Net invested: buy totals - sell totals (account currency), when totals were present. */
  investedAmount: number | null;
  /** Weighted average buy price, when prices were present. */
  averagePrice: number | null;
  currency: string | null;
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
 * Aggregates buy/sell transactions into net positions per instrument.
 * Positions with zero (or negative, i.e. inconsistent) net quantity are
 * dropped — fully-closed positions aren't holdings.
 */
export function aggregatePositions(transactions: ImportedTransaction[]): AggregatedPosition[] {
  const byKey = new Map<string, AggregatedPosition & { buyQuantity: number; buyCost: number }>();

  for (const tx of transactions) {
    if (tx.quantity == null || tx.quantity <= 0) continue;
    const key = tx.isin ?? tx.ticker ?? tx.name;
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
    if (position.quantity <= 0) continue;
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

/** Trims float noise from summed fractional share quantities (T212 has 10-decimal shares). */
function roundQuantity(value: number): number {
  return Number(value.toFixed(10));
}
