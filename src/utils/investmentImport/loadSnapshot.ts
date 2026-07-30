/**
 * Fetches everything needed to reconcile the user's investment data against
 * what's already persisted server-side - every current holding, every
 * transaction ever recorded, and a per-instrument/per-month map of what's
 * already been backfilled as history. Shared by the CSV import wizard
 * (`InvestmentImportWizard.tsx`'s recomputeFromMerged) and the reconciliation
 * panel (`InvestmentReconciliationPanel.tsx`), which both need the exact same
 * three requests reduced the exact same way.
 */
import type { InvestmentService } from '../../services/investmentService';
import type { InvestmentHoldingDto, InvestmentTransactionSummaryDto } from '../../types/api';

export interface InvestmentSnapshot {
  holdings: InvestmentHoldingDto[];
  transactions: InvestmentTransactionSummaryDto[];
  /** Every "YYYY-MM" already recorded as history for each instrument (mapped to
   * its recorded invested_amount, in EUR) - lets a caller skip re-sending a
   * month whose number hasn't actually changed. */
  recordedHistoryByInstrumentId: Map<number, Map<string, number | null>>;
  /** Same idea as recordedHistoryByInstrumentId but for quantity. */
  recordedQuantityByInstrumentId: Map<number, Map<string, number | null>>;
}

export async function loadInvestmentSnapshot(investmentService: InvestmentService): Promise<InvestmentSnapshot> {
  const [holdings, history, transactions] = await Promise.all([
    investmentService.getHoldings(),
    investmentService.getHoldingHistory({}),
    investmentService.getTransactions(),
  ]);

  const recordedHistoryByInstrumentId = new Map<number, Map<string, number | null>>();
  const recordedQuantityByInstrumentId = new Map<number, Map<string, number | null>>();
  for (const entry of history) {
    const months = recordedHistoryByInstrumentId.get(entry.instrumentId) ?? new Map<string, number | null>();
    months.set(entry.userDate.slice(0, 7), entry.investedAmount);
    recordedHistoryByInstrumentId.set(entry.instrumentId, months);

    const quantityMonths = recordedQuantityByInstrumentId.get(entry.instrumentId) ?? new Map<string, number | null>();
    quantityMonths.set(entry.userDate.slice(0, 7), entry.quantity);
    recordedQuantityByInstrumentId.set(entry.instrumentId, quantityMonths);
  }

  return { holdings, transactions, recordedHistoryByInstrumentId, recordedQuantityByInstrumentId };
}
