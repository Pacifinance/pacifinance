/**
 * Re-derives closed-position inconsistencies directly from already-persisted
 * data (no CSV needed) - the same detection the CSV import wizard already
 * does when a file reveals a position is closed (see
 * InvestmentImportWizard.tsx's recomputeFromMerged), just running against the
 * complete transaction ledger on its own. Used by the "Analyze your
 * transactions" reconciliation panel to catch a holding that was never
 * actually closed because the file that would have revealed it was never
 * (re-)uploaded (see InvestmentReconciliationPanel.tsx).
 */
import { closedPositions, groupTransactionsByPositionKey, positionKeyFor } from './aggregate';
import type { ImportedTransaction } from './parsers';
import type { InvestmentHoldingDto } from '../../types/api';

export interface StaleClosedHolding {
  holding: InvestmentHoldingDto;
  /** Last transaction date the ledger has for this instrument — the month a
   * closing snapshot should be backfilled to (see closeStaleHolding). */
  lastTransactionDate: string | null;
  transactions: ImportedTransaction[];
}

/** A sell with no matching buy anywhere in the ledger - net quantity is
 * strictly NEGATIVE, not just zero, which is only mathematically possible if
 * a buy transaction is still missing (e.g. sitting in a broker export file
 * not uploaded yet). Purely informational: there's no existing holding to
 * close and nothing to save, just a standing reminder that something is
 * likely still missing from the account's transaction history. */
export interface StandingOrphan {
  key: string;
  ticker: string | null;
  name: string | null;
  isin: string | null;
  /** Negative — units sold beyond what was ever bought, as far as the ledger shows. */
  quantity: number;
  transactions: ImportedTransaction[];
}

export interface ReconciliationIssues {
  staleClosedHoldings: StaleClosedHolding[];
  standingOrphans: StandingOrphan[];
}

export function findReconciliationIssues(
  transactions: ImportedTransaction[],
  holdings: InvestmentHoldingDto[],
): ReconciliationIssues {
  const transactionsByKey = groupTransactionsByPositionKey(transactions);
  const closed = closedPositions(transactions);

  // Every instrument currently held (regardless of asset key) - a standing
  // orphan must not match any of these, or it isn't actually orphaned, it's
  // just a normal already-tracked holding.
  const existingKeys = new Set<string>();
  for (const holding of holdings) {
    if (!holding.instrument) continue;
    const key = positionKeyFor({ isin: holding.instrument.isin, ticker: holding.instrument.symbol, name: holding.instrument.name });
    if (key) existingKeys.add(key);
  }

  // A currently-held, still-nonzero holding whose complete transaction ledger
  // shows it's since been fully sold - stale because nothing ever told the
  // live holding to zero out.
  const staleClosedHoldings: StaleClosedHolding[] = [];
  for (const holding of holdings) {
    if (!holding.instrument || (holding.quantity ?? 0) <= 0) continue;
    const key = positionKeyFor({ isin: holding.instrument.isin, ticker: holding.instrument.symbol, name: holding.instrument.name });
    const match = key ? closed.find((p) => p.key === key) : undefined;
    if (match) {
      staleClosedHoldings.push({
        holding,
        lastTransactionDate: match.lastTransactionDate,
        transactions: key ? (transactionsByKey.get(key) ?? []) : [],
      });
    }
  }

  const standingOrphans: StandingOrphan[] = closed
    .filter((p) => p.quantity < 0 && !existingKeys.has(p.key))
    .map((p) => ({
      key: p.key, ticker: p.ticker, name: p.name, isin: p.isin, quantity: p.quantity,
      transactions: transactionsByKey.get(p.key) ?? [],
    }));

  return { staleClosedHoldings, standingOrphans };
}
