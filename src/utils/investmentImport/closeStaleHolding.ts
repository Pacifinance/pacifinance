/**
 * Closes a stale holding whose recorded transactions show it's since been
 * fully sold: quantity and current value go to zero (nothing left to count
 * in the current breakdown), but invested_amount/notes/average_price are kept
 * exactly as they were - the position still needs to be findable among
 * all-time best/worst, it's just no longer active. Shared by the CSV import
 * wizard's handleCloseHolding (a file just revealed the position is closed)
 * and the reconciliation panel (the position was already closed in the
 * ledger, nothing new to learn - just never actually zeroed out).
 */
import type { InvestmentService } from '../../services/investmentService';
import type { InvestmentHoldingDto, InvestmentTransactionSaveRequest } from '../../types/api';
import { buildHistoryEntries, flushBatches } from './entryBuilders';
import { positionKeyFor } from './aggregate';
import type { ImportedTransaction } from './parsers';

export interface CloseStaleHoldingParams {
  investmentService: InvestmentService;
  holding: InvestmentHoldingDto;
  /** Every buy/sell behind this position (this session's own + whatever was
   * already persisted server-side) - used only to backfill pre-closure
   * history months, never resent as transactions by this function itself. */
  transactions: ImportedTransaction[];
  /** Last transaction date known for this position - the month the explicit
   * "closed" zero-value snapshot gets backfilled to. */
  lastTransactionDate: string | null;
  recordedHistoryByInstrumentId: Map<number, Map<string, number | null>>;
  recordedQuantityByInstrumentId: Map<number, Map<string, number | null>>;
  convertAmountToEUR: (amount: number, currency: string | null) => number;
  /**
   * Pre-built by the caller, not derived here: the CSV wizard passes freshly
   * built entries for the transactions its file just revealed (unchanged
   * behavior); the reconciliation panel passes an empty array, since every
   * transaction it operates on already exists server-side verbatim - nothing
   * to resend, and resending would incorrectly re-stamp `source` on
   * historical rows that didn't actually change.
   */
  transactionEntries: InvestmentTransactionSaveRequest[];
}

export async function closeStaleHolding({
  investmentService, holding, transactions, lastTransactionDate,
  recordedHistoryByInstrumentId, recordedQuantityByInstrumentId, convertAmountToEUR, transactionEntries,
}: CloseStaleHoldingParams): Promise<void> {
  const instrument = holding.instrument;
  if (!instrument) return;

  await investmentService.saveHolding({
    id: holding.id,
    instrument_id: instrument.id,
    asset_key: holding.assetKey,
    quantity: 0,
    average_price: holding.averagePrice,
    current_value: 0,
    invested_amount: holding.investedAmount,
    notes: holding.notes,
  });

  // Backfills every pre-closure month's cost-basis buildup (same as an open
  // position - see buildHistoryEntries), not just a single zero point at
  // closing: a position that grew for years before being fully sold still has
  // a real "value over time" trajectory worth keeping. This never touches the
  // closing month itself - buildMonthlyPositionTimeline excludes a month
  // whose net quantity is already zero-or-less, so the explicit zero-value
  // entry below is what covers that one.
  const key = positionKeyFor({ isin: instrument.isin ?? null, ticker: instrument.symbol ?? null, name: instrument.name ?? null });
  const historyEntries = key
    ? buildHistoryEntries(transactions, key, holding.id, instrument.id, recordedHistoryByInstrumentId, recordedQuantityByInstrumentId, convertAmountToEUR)
    : [];
  if (lastTransactionDate) {
    historyEntries.push({
      holding_id: holding.id,
      user_date: `${lastTransactionDate.slice(0, 7)}-01`,
      current_value: 0,
      invested_amount: holding.investedAmount,
    });
  }

  await flushBatches(investmentService, historyEntries, [], transactionEntries);
}
