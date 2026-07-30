/**
 * Turns aggregated position data into the request payloads the batch save
 * endpoints expect, and fires those batch calls — shared by the CSV import
 * wizard (`InvestmentImportWizard.tsx`) and the reconciliation panel
 * (`InvestmentReconciliationPanel.tsx`), so "how a position's monthly history
 * gets backfilled" and "how transactions get resent" only exist in one place.
 * Pure builders (no I/O) except `flushBatches`, which just fires the 3 batch
 * calls this module's builders produce.
 */
import type { InvestmentService } from '../../services/investmentService';
import type {
  InvestmentDividendSaveRequest, InvestmentHoldingHistorySaveRequest, InvestmentTransactionSaveRequest, InvestmentTransactionSummaryDto,
} from '../../types/api';
import { buildMonthlyPositionTimeline, lastRecordedValueBefore } from './aggregate';
import type { ImportedTransaction } from './parsers';

/** Converts a row already persisted to the server-side transaction ledger back
 * into the same shape the CSV parsers produce, so it can be merged with
 * freshly-parsed transactions and run through the exact same dedupe/aggregate/
 * closedPositions functions either source uses. `total` is already
 * EUR-converted at save time (see buildTransactionEntries below) while
 * `total_currency` stays the original currency label for reference only - so
 * this maps `totalCurrency` to 'EUR' (what `total` is actually denominated
 * in), not the original label, or feeding a round-tripped transaction back
 * through buildTransactionEntries would silently double-convert it. */
export const toImportedTransaction = (tx: InvestmentTransactionSummaryDto): ImportedTransaction => ({
  side: tx.side,
  isin: tx.isin,
  ticker: tx.symbol,
  name: tx.name,
  date: tx.tradeDate,
  quantity: tx.quantity,
  price: tx.price,
  total: tx.total,
  currency: tx.currency,
  totalCurrency: 'EUR',
  externalId: tx.externalId,
});

/**
 * Builds this position's monthly backfill rows - no I/O, just the request
 * payloads. A whole-portfolio import can mean thousands of these rows across
 * every position (40+ months × dozens of holdings is not unusual for a
 * multi-year history split across several broker exports) - one HTTP request
 * per row was a genuine cost/latency problem (thousands of Vercel invocations
 * / Supabase round trips for a single import), not just a slow UI, so every
 * caller collects these across ALL positions and sends them in a handful of
 * batch requests instead (see flushBatches).
 */
export function buildHistoryEntries(
  transactions: ImportedTransaction[],
  positionKey: string,
  holdingId: number,
  instrumentId: number,
  recordedHistoryByInstrumentId: Map<number, Map<string, number | null>>,
  recordedQuantityByInstrumentId: Map<number, Map<string, number | null>>,
  convertAmountToEUR: (amount: number, currency: string | null) => number,
): InvestmentHoldingHistorySaveRequest[] {
  const timeline = buildMonthlyPositionTimeline(transactions);
  const recorded = recordedHistoryByInstrumentId.get(instrumentId);
  const recordedQuantity = recordedQuantityByInstrumentId.get(instrumentId);
  const earliestMonth = timeline[0]?.monthKey;
  const baseline = earliestMonth ? lastRecordedValueBefore(recorded, earliestMonth) : 0;
  const quantityBaseline = earliestMonth ? lastRecordedValueBefore(recordedQuantity, earliestMonth) : 0;

  const entries: InvestmentHoldingHistorySaveRequest[] = [];
  for (const snapshot of timeline) {
    const snapshotPosition = snapshot.positions.find((p) => p.key === positionKey);
    if (!snapshotPosition || snapshotPosition.investedAmount == null) continue;
    const investedAmountEUR = baseline + convertAmountToEUR(snapshotPosition.investedAmount, snapshotPosition.investedAmountCurrency);
    // Quantity actually held that month — for the "quantity bought per month"
    // figure and, in the future, to price a historical current_value
    // correctly (price × quantity held then, not today's quantity).
    const quantityThatMonth = quantityBaseline + snapshotPosition.quantity;
    const alreadyRecorded = recorded?.get(snapshot.monthKey);
    if (alreadyRecorded != null && Math.abs(alreadyRecorded - investedAmountEUR) < 0.01) continue;
    entries.push({
      holding_id: holdingId,
      user_date: `${snapshot.monthKey}-01`,
      current_value: null,
      invested_amount: investedAmountEUR,
      quantity: quantityThatMonth,
    });
  }
  return entries;
}

/**
 * Builds this position's underlying buy/sell transaction rows for the
 * server-side ledger (user_investment_transactions) - pure, see
 * buildHistoryEntries above for why. This is what lets a later, separate
 * session see the complete transaction history (via getTransactions) even
 * when it only has one out-of-order file loaded, instead of only ever
 * reconciling against whatever happens to be in the current browser session.
 * Safe to re-send: the backend upserts on (instrument, external_id) when the
 * broker provided one (see upsertTransaction in the model), so an
 * already-recorded transaction is never double-counted, just re-confirmed.
 */
export function buildTransactionEntries(
  transactions: ImportedTransaction[],
  instrumentId: number,
  holdingId: number | null,
  source: string,
  convertAmountToEUR: (amount: number, currency: string | null) => number,
): InvestmentTransactionSaveRequest[] {
  const entries: InvestmentTransactionSaveRequest[] = [];
  for (const tx of transactions) {
    if (!tx.date || tx.quantity == null) continue;
    entries.push({
      instrument_id: instrumentId,
      holding_id: holdingId,
      side: tx.side,
      quantity: tx.quantity,
      price: tx.price,
      currency: tx.currency,
      total: tx.total != null ? convertAmountToEUR(Math.abs(tx.total), tx.totalCurrency) : null,
      total_currency: tx.totalCurrency,
      trade_date: tx.date,
      external_id: tx.externalId,
      source,
    });
  }
  return entries;
}

/**
 * Fires the batch calls (history/dividends/transactions) collected across
 * however many positions were just processed - always a small, fixed number
 * of requests regardless of portfolio size (see buildHistoryEntries above).
 * Best-effort per table: one table failing (e.g. a network error) shouldn't
 * roll back the holdings themselves or the other two tables - the user can
 * still fix any gap manually later.
 */
export async function flushBatches(
  investmentService: InvestmentService,
  historyEntries: InvestmentHoldingHistorySaveRequest[],
  dividendEntries: InvestmentDividendSaveRequest[],
  transactionEntries: InvestmentTransactionSaveRequest[],
): Promise<void> {
  await Promise.all([
    historyEntries.length > 0 ? investmentService.saveHoldingHistoryBatch({ entries: historyEntries }).catch(() => undefined) : Promise.resolve(),
    dividendEntries.length > 0 ? investmentService.saveDividendsBatch({ entries: dividendEntries }).catch(() => undefined) : Promise.resolve(),
    transactionEntries.length > 0 ? investmentService.saveTransactionsBatch({ entries: transactionEntries }).catch(() => undefined) : Promise.resolve(),
  ]);
}
