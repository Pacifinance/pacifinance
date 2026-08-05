import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faFileCsv, faSpinner, faCircleCheck, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { useDemoServices } from '../hooks/useDemoServices';
import {
  Overlay, ModalContainer, ModalHeader, ModalTitle, CloseButton, ModalBody, ModalFooter,
} from '../components/multiInsert/SharedStyles';
import { ModernActionButton } from '../styles/MyStyled';
import { parseInvestmentCsv, ImportedTransaction, ImportedDividend } from '../utils/investmentImport/parsers';
import {
  buildMonthlyPositionTimeline, positionKeyFor, AggregatedPosition,
  dedupeDividends, groupDividendsByPositionKey, aggregateDividends, reconcileImportPositions,
} from '../utils/investmentImport/aggregate';
import { toImportedTransaction, buildHistoryEntries, buildTransactionEntries, flushBatches } from '../utils/investmentImport/entryBuilders';
import { loadInvestmentSnapshot } from '../utils/investmentImport/loadSnapshot';
import { closeStaleHolding } from '../utils/investmentImport/closeStaleHolding';
import { ClosedSection, ClosedRow, OrphanSection, OrphanRow, CloseHoldingButton } from '../components/investmentImport/ReconciliationStyles';
import { formatInstrumentDetails } from '../utils/instrumentDisplay';
import { KIND_TO_ASSET_KEY } from '../constants/investmentSchema';
import ImportPlatformGuide from '../components/ImportPlatformGuide';
import InstrumentSearchAutocomplete from './InstrumentSearchAutocomplete';
import type {
  InvestmentInstrumentDto, InvestmentKind, InvestmentHoldingDto, InvestmentTransactionSummaryDto,
  InvestmentHoldingHistorySaveRequest, InvestmentDividendSaveRequest, InvestmentTransactionSaveRequest,
} from '../types/api';

const INVESTMENT_IMPORT_PLATFORMS = ['trading212', 'degiro', 'directa'];
const MANUAL_KIND_OPTIONS: InvestmentKind[] = ['stock', 'etf', 'crypto', 'bond', 'fund'];

/**
 * CSV import wizard for investment holdings (Trading 212, DEGIRO, Directa,
 * generic Portfolio Performance/Ghostfolio format — see
 * docs/INVESTMENT_IMPORT_RESEARCH.md). The file is parsed entirely in the
 * browser: only the resolved, user-confirmed positions reach the API, exactly
 * like manual entry.
 *
 * A holding's identity (instrument/quantity/avg price) always reflects today —
 * there's no "import into a past month" the way there is for balances, since
 * the app only lets historical *values* be attached to an already-existing
 * current holding (see InvestmentHoldingsPanel's historical-edit flow). So
 * every import creates/updates the current holding from the full file, then
 * automatically backfills its monthly invested-amount history from the real
 * transaction dates in the file — that's what makes "value over time" appear
 * immediately, without needing the user to pick a target month by hand.
 */

interface ImportRowState {
  position: AggregatedPosition;
  transactions: ImportedTransaction[];
  /** This position's own dividend payments found in the file (deduped) — saved
   * alongside the holding once it's resolved (see importSelected). */
  dividends: ImportedDividend[];
  instrument: InvestmentInstrumentDto | null;
  /** Purely instrument-resolution state — whether this row's merge with an
   * existing holding would conflict (and needs a mergeStrategy choice) is a
   * separate, orthogonal concern, always derived live via wouldConflict/
   * isRowReady rather than folded into this enum (see those below). */
  status: 'pending' | 'resolving' | 'resolved' | 'not-found' | 'saved' | 'error';
  selected: boolean;
  /** Every "YYYY-MM" this position's history will backfill, chronological — includes the current month. */
  historyMonths: string[];
  /** Asset kind picked for a not-found row — determines which catalog (OpenFIGI/CoinGecko)
   * the manual re-search below uses, and what kind gets created if added as unverified. */
  manualKind: InvestmentKind;
  /** Chosen during review when wouldConflict(row, existing) is true — fills the
   * gap resolveMergeStrategy deliberately leaves undefined for a genuine
   * cross-platform conflict, decided before commit instead of reactively after
   * a failed save (see isRowReady). Reset to null if the row's instrument changes. */
  mergeStrategy: 'add' | 'replace' | null;
  /** Manual per-row corrections made during review, applied on top of the parsed
   * defaults at commit time (see getEffectiveAveragePrice/getEffectiveCurrentValue/
   * getEffectiveNotes). Deliberately excludes quantity/investedAmount: both are
   * independently re-derived by buildHistoryEntries straight from `transactions`,
   * so an override that only patched the saveHolding payload would leave the
   * live holding and its own most-recent history point silently disagreeing —
   * a real follow-up, not something to bolt on here. */
  overrides: { averagePrice?: number; currentValue?: number; notes?: string };
}

interface ClosedHoldingCandidate {
  holding: InvestmentHoldingDto;
  /** Last transaction date the file has for this instrument — the month a closing snapshot gets backfilled to. */
  lastTransactionDate: string | null;
  status: 'pending' | 'closing' | 'closed' | 'error';
  /** The underlying buy/sell transactions (this session's own + whatever was
   * already persisted server-side, see recomputeFromMerged) that determined
   * this holding is closed — persisted to the transaction ledger once the
   * user confirms via handleCloseHolding, so the closing sell itself is never
   * missing from the ledger just because it didn't go through importSelected. */
  transactions: ImportedTransaction[];
}

/** A sell with no matching buy anywhere known (this import + everything
 * already persisted server-side) — net quantity is strictly NEGATIVE, not
 * just zero, which is only mathematically possible if a buy transaction is
 * still missing (e.g. sitting in a broker export file not uploaded yet).
 * Purely informational: there's no existing holding to close and nothing to
 * save, just a heads-up that something is likely missing from the account's
 * transaction history. */
interface OrphanSellWarning {
  key: string;
  ticker: string | null;
  name: string | null;
  isin: string | null;
  /** Negative — units sold beyond what was ever bought, as far as we know. */
  quantity: number;
  /** The underlying sell (and any other) transactions behind this position -
   * saved to the ledger on import even though there's no holding to attach
   * them to, so a LATER file with the missing buy can reconcile against them
   * instead of the sell being lost the moment this session ends. */
  transactions: ImportedTransaction[];
  /** Resolved the same way an open row's instrument is (ISIN batch lookup) -
   * null when it couldn't be resolved, in which case the transactions are
   * simply not saved (nothing to link them to yet). */
  instrument: InvestmentInstrumentDto | null;
  /** True when every transaction behind this orphan was already in the
   * server-side ledger BEFORE this recompute (i.e. saved by a past import
   * session, see saveTransactions/importSelected) - this is a standing,
   * still-unresolved gap in the account, not something this file just
   * revealed. Lets the warning say "you still have an unresolved sell"
   * instead of misleadingly framing it as "this file shows a sell", which
   * would be wrong (and confusing) the moment the user re-imports any file
   * touching the same instrument while the real missing buy still hasn't
   * been uploaded. */
  alreadyPersisted: boolean;
}

interface InvestmentImportWizardProps {
  onClose: () => void;
  onImported: () => Promise<void> | void;
}

const DropZone = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.6rem 1rem;
  border: 2px dashed ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.18)' : '#cbd5e1')};
  border-radius: 12px;
  cursor: pointer;
  color: ${(p) => p.theme.textColor};
  font-size: 0.85rem;
  text-align: center;
  opacity: 0.85;

  &:hover { border-color: ${(p) => p.theme.buttonBackgroundColor}; opacity: 1; }
  input { display: none; }
  svg { font-size: 1.5rem; opacity: 0.6; }
`;

const SummaryLine = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${(p) => p.theme.textColor};
  opacity: 0.7;
`;

const SourceEditor = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(16,185,129,0.28)' : 'rgba(5,150,105,0.25)')};
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(16,185,129,0.07)' : 'rgba(16,185,129,0.05)')};
  color: ${(p) => p.theme.textColor};
  font-size: 0.76rem;
  font-weight: 600;

  span { opacity: 0.7; font-weight: 400; line-height: 1.35; }
  input {
    padding: 0.5rem 0.6rem;
    border-radius: 8px;
    border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.16)' : '#cbd5e1')};
    background: ${(p) => (p.theme.mode === 'dark' ? '#1a1f2e' : 'white')};
    color: ${(p) => p.theme.textColor};
    font-size: 0.82rem;
  }
`;

const ImportProgressBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const ProgressBarTrack = styled.div`
  width: 100%;
  height: 6px;
  border-radius: 4px;
  overflow: hidden;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')};
`;

const ProgressBarFill = styled.div`
  height: 100%;
  border-radius: 4px;
  background: ${(p) => p.theme.buttonBackgroundColor};
  transition: width 0.2s ease;
`;

const ErrorLine = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const PositionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.6rem;
  border-radius: 10px;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)')};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')};

  input[type='checkbox'] {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    accent-color: ${(p) => p.theme.buttonBackgroundColor};
    cursor: pointer;
  }
`;

const PositionInfo = styled.div`
  flex: 1;
  min-width: 0;
  color: ${(p) => p.theme.textColor};

  strong { font-size: 0.84rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  span { font-size: 0.72rem; opacity: 0.6; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`;

/** Unlike PositionInfo's other one-line spans, the merge-impact description can
 * run long ("already held: X units, Y€ — this file covers different months...")
 * — truncating it with an ellipsis was hiding the actual outcome, exactly the
 * information the user needs to trust what importing will do. */
const ImpactNote = styled.span`
  font-size: 0.72rem;
  opacity: 0.6;
  display: block;
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: unset !important;
  line-height: 1.4;
`;

const StatusIcon = styled.span`
  flex-shrink: 0;
  font-size: 0.85rem;
  &.resolved, &.saved { color: ${(p) => p.theme.successColor}; }
  &.not-found, &.error { color: ${(p) => p.theme.warningColor}; }
  &.resolving { color: ${(p) => p.theme.textColor}; opacity: 0.5; }
`;

const ManualResolveBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.35rem;
`;

const ConflictPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.5rem;
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(59,130,246,0.3)' : 'rgba(37,99,235,0.22)')};
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.05)')};
  color: ${(p) => p.theme.textColor};

  strong { font-size: 0.78rem; }
  > span { font-size: 0.72rem; line-height: 1.45; opacity: 0.82; white-space: normal; }
`;

const SourceComparison = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.4rem;

  span {
    padding: 0.45rem;
    border-radius: 7px;
    background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.75)')};
    font-size: 0.68rem;
    line-height: 1.35;
    white-space: normal;
  }
`;

const ManualAddRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;

  select {
    padding: 0.25rem 0.4rem;
    border-radius: 6px;
    border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : '#cbd5e1')};
    background: ${(p) => (p.theme.mode === 'dark' ? '#1a1f2e' : 'white')};
    color: ${(p) => p.theme.textColor};
    font-size: 0.72rem;

    /* The closed control's background/color don't reliably cascade into the
       native options popup — set them explicitly so dark mode isn't left
       with white-on-white/unreadable options. */
    option {
      background: ${(p) => (p.theme.mode === 'dark' ? '#1a1f2e' : 'white')};
      color: ${(p) => p.theme.textColor};
    }
  }
`;

const UnverifiedTag = styled.span`
  display: inline-flex;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.05rem 0.35rem;
  margin-left: 0.35rem;
  border-radius: 20px;
  background: rgba(245, 158, 11, 0.14);
  color: #d97706;
  vertical-align: middle;
`;

const ConflictActions = styled.div`
  display: flex;
  gap: 0.4rem;
`;

const ConflictButton = styled.button`
  flex: 1;
  padding: 0.4rem 0.5rem;
  border-radius: 8px;
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.18)' : '#cbd5e1')};
  background: transparent;
  color: ${(p) => p.theme.textColor};
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  text-align: left;

  strong, span { display: block; white-space: normal; }
  strong { font-size: 0.74rem; }
  span { margin-top: 0.2rem; font-size: 0.65rem; font-weight: 400; line-height: 1.35; opacity: 0.72; }

  &[data-recommended='true'] {
    border-color: ${(p) => p.theme.buttonBackgroundColor};
    background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.07)')};
  }

  &:hover { opacity: 0.85; }
`;

const MergeChoiceLine = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  color: ${(p) => p.theme.textColor};
  opacity: 0.75;

  button {
    border: none;
    background: transparent;
    color: ${(p) => p.theme.buttonBackgroundColor};
    font-size: 0.72rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
  }
`;

const OverrideToggle = styled.button`
  align-self: flex-start;
  margin-top: 0.3rem;
  border: none;
  background: transparent;
  color: ${(p) => p.theme.buttonBackgroundColor};
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
`;

/** Local-only layout for an OrphanRow's content when it needs an opt-out
 * checkbox — OrphanRow itself (investmentImport/ReconciliationStyles.tsx) is
 * shared with InvestmentReconciliationPanel.tsx, which never shows one, so
 * the flex layout lives here rather than on the shared component. */
const OrphanRowContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;

  input[type='checkbox'] {
    flex-shrink: 0;
    margin-top: 0.15rem;
    accent-color: ${(p) => p.theme.buttonBackgroundColor};
    cursor: pointer;
  }
`;

const OverrideFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.35rem;
  padding: 0.5rem;
  border-radius: 8px;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)')};

  > strong {
    color: ${(p) => p.theme.textColor};
    font-size: 0.76rem;
  }

  > span {
    color: ${(p) => p.theme.textColor};
    font-size: 0.68rem;
    line-height: 1.4;
    opacity: 0.68;
    white-space: normal;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    font-size: 0.68rem;
    color: ${(p) => p.theme.textColor};
    opacity: 0.7;
  }

  label > span {
    font-size: 0.64rem;
    line-height: 1.35;
    opacity: 0.78;
    white-space: normal;
  }

  input {
    padding: 0.3rem 0.4rem;
    border-radius: 6px;
    border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : '#cbd5e1')};
    background: ${(p) => (p.theme.mode === 'dark' ? '#1a1f2e' : 'white')};
    color: ${(p) => p.theme.textColor};
    font-size: 0.78rem;
  }
`;

export default function InvestmentImportWizard({ onClose, onImported }: InvestmentImportWizardProps) {
  const { theme } = useContext(ThemeContext);
  const { translations, language } = useContext(LanguageContext);
  const { formatNumber, convertAmountToEUR, currencySymbol } = useContext(CurrencyContext);
  const { investmentService } = useDemoServices();
  const t = translations.investments.importWizard;

  const [rows, setRows] = useState<ImportRowState[]>([]);
  /** Every transaction/dividend successfully parsed so far this session, across
   * however many files have been dropped in (see handleFiles/recomputeFromMerged) -
   * never cleared between files, so a multi-file upload (or several one-at-a-time
   * drops) always gets reconciled as one complete history, not file-by-file. */
  const [allTransactions, setAllTransactions] = useState<ImportedTransaction[]>([]);
  const [allDividends, setAllDividends] = useState<ImportedDividend[]>([]);
  const [platform, setPlatform] = useState<string | null>(null);
  const [manualSource, setManualSource] = useState('');
  const effectiveImportSource = platform === 'generic'
    ? (manualSource.trim() || 'generic')
    : (platform ?? 'generic');
  const [skippedRows, setSkippedRows] = useState(0);
  const [parseError, setParseError] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);
  /** The user's current holdings, keyed by instrument id — fetched once per file so
   * every row can preview its effect on an already-held instrument's position
   * *before* the user commits to importing (not just reactively after a save conflict). */
  const [existingByInstrumentId, setExistingByInstrumentId] = useState<Map<number, InvestmentHoldingDto>>(new Map());
  /** Every "YYYY-MM" already recorded as history for each instrument (mapped to its
   * recorded invested_amount, in EUR), regardless of which holding/import produced
   * it — lets a row tell "this file re-covers months I already have data for" (safe
   * to replace, re-exported same period) apart from "this file is for months I've
   * never recorded" (must be added, never replace: see resolveMergeStrategy below).
   * The value itself lets buildHistoryEntries skip re-sending a month whose number
   * hasn't actually changed — re-importing an identical file otherwise re-sends
   * every single month again for no reason. */
  const [recordedHistoryByInstrumentId, setRecordedHistoryByInstrumentId] = useState<Map<number, Map<string, number | null>>>(new Map());
  /** Same idea as recordedHistoryByInstrumentId but for quantity - a separately
   * uploaded earlier file's own cumulative quantity-per-month also needs
   * carrying forward (see lastRecordedValueBefore), or a later file's months
   * would show only what *it* bought, not the true running total held. */
  const [recordedQuantityByInstrumentId, setRecordedQuantityByInstrumentId] = useState<Map<number, Map<string, number | null>>>(new Map());
  /** Already-held instruments the file shows have since been fully sold
   * (net quantity zero) — aggregatePositions itself drops these positions
   * entirely, so without this the wizard would silently never reconcile a
   * closed position against the stale holding still sitting in the DB. Never
   * closed automatically: the user confirms each one explicitly below. */
  const [closedCandidates, setClosedCandidates] = useState<ClosedHoldingCandidate[]>([]);
  const [orphanSells, setOrphanSells] = useState<OrphanSellWarning[]>([]);
  /** Orphan sells default to included (matches the previous unconditional-
   * import behavior) — only tracks the ones a user has explicitly excluded. */
  const [excludedOrphanKeys, setExcludedOrphanKeys] = useState<Set<string>>(new Set());
  /** Which row's manual-override fields (average price/current value/notes)
   * are expanded — at most one at a time, matches the history drawer's own
   * single-open convention in InvestmentHoldingsPanel.tsx. Keyed by position.key. */
  const [editingOverridesFor, setEditingOverridesFor] = useState<string | null>(null);

  const [loadingSavedTransactions, setLoadingSavedTransactions] = useState(false);
  /** Surfaces import progress to the user — a multi-year, multi-instrument
   * import can take minutes (one saveHolding per position, then a handful of
   * batch calls for history/dividends/transactions - see buildHistoryEntries
   * and importSelected). Without this it just looks frozen: the only way to
   * tell it's still working would be opening devtools' network tab. `phase`
   * distinguishes "saving position N of M" (one request each, so genuinely
   * incremental) from "finalizing" (a few large batch requests with no useful
   * sub-progress to report). */
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [importPhase, setImportPhase] = useState<'holdings' | 'finalizing' | null>(null);

  /**
   * Recomputes everything (which rows to show, their quantity/invested
   * amount, monthly history, closed-position detection) from the COMPLETE
   * transaction history - this session's files merged with every transaction
   * ever persisted server-side (see buildTransactionEntries), not just from
   * whatever's been dropped in this session. Brokers cap a single export
   * (Trading 212: 365 days), so a multi-year portfolio is necessarily spread
   * across several files, uploaded in however many separate sessions, in
   * whatever order the user happens to have them in. Computing anything -
   * which rows are open, their true quantity, whether a position is now
   * closed - from only session-scoped transactions made every one of those
   * things depend on upload order: a buy living in one file and its matching
   * sell in another would silently net to whichever partial view happened to
   * be computed first. Fetching and merging the full ledger before computing
   * ANYTHING removes that dependency entirely - the true net position (and
   * its complete monthly timeline) is always correct, regardless of which
   * files were uploaded when, in which sessions, in which order.
   *
   * Rows shown are still scoped to instruments THIS session's files actually
   * mention (`sessionKeys`) - a file only about AAPL shouldn't surface a row
   * for some unrelated stock just because it exists in server history - but
   * each shown row's quantity/transactions/history come from the complete
   * merged set, so the numbers themselves are always the true total.
   */
  const recomputeFromMerged = async (transactions: ImportedTransaction[], dividends: ImportedDividend[]) => {
    const dividendsByKey = groupDividendsByPositionKey(dedupeDividends(dividends));

    setLoadingSavedTransactions(true);
    let savedTransactions: InvestmentTransactionSummaryDto[] = [];
    const holdingMap = new Map<number, InvestmentHoldingDto>();
    try {
      const snapshot = await loadInvestmentSnapshot(investmentService);
      savedTransactions = snapshot.transactions;
      for (const holding of snapshot.holdings) if (holding.instrument) holdingMap.set(holding.instrument.id, holding);
      setExistingByInstrumentId(holdingMap);
      setRecordedHistoryByInstrumentId(snapshot.recordedHistoryByInstrumentId);
      setRecordedQuantityByInstrumentId(snapshot.recordedQuantityByInstrumentId);
    } catch {
      setExistingByInstrumentId(new Map());
      setRecordedHistoryByInstrumentId(new Map());
      setRecordedQuantityByInstrumentId(new Map());
    } finally {
      setLoadingSavedTransactions(false);
    }

    // Every transaction already persisted server-side, from ANY session, in
    // ANY order, merged with this session's own before anything gets computed
    // - see reconcileImportPositions for why (avoids the entire computation
    // depending on which files were uploaded when, in which order).
    const { positions, transactionsByKey, closed } = reconcileImportPositions(
      transactions, savedTransactions.map(toImportedTransaction),
    );
    const initialRows: ImportRowState[] = positions.map((position) => {
      const positionTransactions = transactionsByKey.get(position.key) ?? [];
      // Every distinct month present in this position's COMPLETE history
      // (every session merged) - what will get an automatic backfilled
      // snapshot (shown to the user up front below).
      const historyMonths = buildMonthlyPositionTimeline(positionTransactions).map((s) => s.monthKey);
      const positionDividends = dividendsByKey.get(position.key) ?? [];
      return {
        position, transactions: positionTransactions, dividends: positionDividends, instrument: null,
        status: 'pending', selected: true, historyMonths, manualKind: 'stock',
        mergeStrategy: null, overrides: {},
      };
    });
    setRows(initialRows);

    // Cross-reference against already-held instruments: a position the
    // complete merged history shows fully sold that matches an existing,
    // still-nonzero holding means that holding is stale and needs the user's
    // explicit confirmation to close.
    const existingKeys = new Set<string>();
    for (const holding of holdingMap.values()) {
      if (!holding.instrument) continue;
      const key = positionKeyFor({isin: holding.instrument.isin, ticker: holding.instrument.symbol, name: holding.instrument.name});
      if (key) existingKeys.add(key);
    }
    const candidates: ClosedHoldingCandidate[] = [];
    for (const holding of holdingMap.values()) {
      if (!holding.instrument || (holding.quantity ?? 0) <= 0) continue;
      const key = positionKeyFor({isin: holding.instrument.isin, ticker: holding.instrument.symbol, name: holding.instrument.name});
      const match = key ? closed.find((p) => p.key === key) : undefined;
      if (match) candidates.push({holding, lastTransactionDate: match.lastTransactionDate, status: 'pending', transactions: key ? (transactionsByKey.get(key) ?? []) : []});
    }
    setClosedCandidates(candidates);

    // A NEGATIVE net quantity (not just zero) is only mathematically possible
    // when a buy transaction is still missing from what we know about — more
    // units were sold than were ever bought, as far as this import + the
    // complete server-side ledger can tell. Matters most for the exact
    // scattered/reverse-order upload scenario being stress-tested here: a
    // lone sell for an instrument that's never been held at all (no matching
    // buy uploaded yet, in this file or any other) would otherwise be
    // silently dropped with no trace, instead of flagging that something is
    // likely still missing from the account's transaction history.
    const orphanPositions = closed.filter((p) => p.quantity < 0 && !existingKeys.has(p.key));
    // Resolved the same way open rows are (ISIN batch lookup) - needed so the
    // sell can actually be saved to the ledger below (saveTransaction requires
    // a real instrument_id), even though there's no holding to attach it to.
    // Without this, importing now would leave the sell exactly as unrecorded
    // as it already is, and a later file with the missing buy would have
    // nothing to reconcile against - the warning above would have said
    // something without actually fixing it.
    const orphanIsins = Array.from(new Set(orphanPositions.map((p) => p.isin).filter((v): v is string => Boolean(v))));
    let orphanIsinMatches: Record<string, InvestmentInstrumentDto | null> = {};
    if (orphanIsins.length > 0) {
      try {
        orphanIsinMatches = await investmentService.searchInstrumentsByIsins(orphanIsins);
      } catch {
        orphanIsinMatches = {};
      }
    }
    // What the server already had BEFORE this recompute - lets an orphan tell
    // "still unresolved from a past import" apart from "just discovered in
    // this file" (see alreadyPersisted above), instead of re-framing an
    // already-known gap as if this file had just revealed it.
    const persistedExternalIds = new Set(
      savedTransactions.map((tx) => tx.externalId).filter((id): id is string => Boolean(id)),
    );
    setOrphanSells(orphanPositions.map((p) => {
      const positionTransactions = transactionsByKey.get(p.key) ?? [];
      const alreadyPersisted = positionTransactions.length > 0
        && positionTransactions.every((tx) => Boolean(tx.externalId) && persistedExternalIds.has(tx.externalId as string));
      return {
        key: p.key, ticker: p.ticker, name: p.name, isin: p.isin, quantity: p.quantity,
        transactions: positionTransactions,
        instrument: p.isin ? (orphanIsinMatches[p.isin.toUpperCase()] ?? null) : null,
        alreadyPersisted,
      };
    }));
    setExcludedOrphanKeys(new Set());

    void resolveInstruments(initialRows);
  };

  // Accepts one or several files at once (the file picker allows a multi-select,
  // and the dropzone stays usable after the first file to add more later) -
  // every file's transactions/dividends are added to what's already loaded
  // this session, then everything is recomputed from that complete merged set
  // (see recomputeFromMerged). A file that fails to parse is skipped rather
  // than wiping out anything already loaded; the "unrecognized format" error
  // only shows when NOTHING has ever loaded successfully yet.
  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setParseError(false);
    setImportDone(false);

    let newTransactions: ImportedTransaction[] = [];
    let newDividends: ImportedDividend[] = [];
    let newSkipped = 0;
    let lastPlatform: string | null = null;

    for (const file of Array.from(fileList)) {
      const text = await file.text();
      const parsed = parseInvestmentCsv(text);
      if (!parsed || parsed.transactions.length === 0) continue;
      newTransactions = newTransactions.concat(parsed.transactions);
      newDividends = newDividends.concat(parsed.dividends);
      newSkipped += parsed.skippedRows;
      lastPlatform = parsed.platform;
    }

    if (!lastPlatform) {
      if (allTransactions.length === 0) setParseError(true);
      return;
    }

    const mergedTransactions = allTransactions.concat(newTransactions);
    const mergedDividends = allDividends.concat(newDividends);
    setAllTransactions(mergedTransactions);
    setAllDividends(mergedDividends);
    setSkippedRows((prev) => prev + newSkipped);
    setPlatform(lastPlatform);
    setManualSource((previous) => lastPlatform === 'generic'
      ? (platform === 'generic' ? previous : '')
      : lastPlatform);

    await recomputeFromMerged(mergedTransactions, mergedDividends);
  };

  // Decides how this row's save should treat an already-held instrument:
  //  - no existing holding at all -> plain insert, no strategy needed.
  //  - this file's months don't overlap anything already recorded for the
  //    instrument -> unambiguous, always add (e.g. an older/newer statement
  //    for the same broker covering a period never imported before) -
  //    resolved automatically, the user is never asked.
  //  - months overlap -> ambiguous only in the sense of "supersede or merge?",
  //    left to insertHolding's same-source-replace / different-source-conflict
  //    logic (undefined here so the backend decides, or the user resolves a
  //    genuine cross-platform conflict).
  const resolveMergeStrategy = (row: ImportRowState): 'add' | undefined => {
    if (!row.instrument) return undefined;
    const existing = existingByInstrumentId.get(row.instrument.id);
    if (!existing) return undefined;
    const recordedMonths = recordedHistoryByInstrumentId.get(row.instrument.id);
    const overlaps = Boolean(recordedMonths) && row.historyMonths.some((m) => recordedMonths!.has(m));
    return overlaps ? undefined : 'add';
  };

  // Single source of truth for "what will happen to the already-held
  // instrument this row matches" — mirrors insertHolding's own overlap-then-
  // source decision (server/src/db/models/investments.ts) so the outcome
  // shown/acted on here never diverges from what the backend would actually
  // do. Both the review-time impact text (describeExistingImpact) and the
  // proactive conflict check (wouldConflict) switch on this single result
  // instead of each re-deriving the same booleans by hand.
  const resolveMergeOutcome = (row: ImportRowState, existing: InvestmentHoldingDto): 'add' | 'up-to-date' | 'auto-replace' | 'conflict' => {
    if (resolveMergeStrategy(row) === 'add') return 'add';

    // Every month this row covers was already recorded, AND the resulting
    // quantity/invested amount match what's already saved — a re-import of a
    // file already imported before, with nothing new in it.
    const recordedMonths = row.instrument ? recordedHistoryByInstrumentId.get(row.instrument.id) : undefined;
    const allMonthsAlreadyRecorded = Boolean(recordedMonths) && row.historyMonths.every((m) => recordedMonths!.has(m));
    const rowInvestedEUR = row.position.investedAmount != null
      ? convertAmountToEUR(row.position.investedAmount, row.position.investedAmountCurrency)
      : 0;
    const quantityUnchanged = Math.abs((existing.quantity ?? 0) - (row.position.quantity ?? 0)) < 0.0001;
    const amountUnchanged = Math.abs((existing.investedAmount ?? 0) - rowInvestedEUR) < 0.01;
    if (allMonthsAlreadyRecorded && quantityUnchanged && amountUnchanged) return 'up-to-date';

    const willAutoReplace = existing.importSource === effectiveImportSource || existing.importSource == null;
    return willAutoReplace ? 'auto-replace' : 'conflict';
  };

  const wouldConflict = (row: ImportRowState, existing: InvestmentHoldingDto): boolean =>
    resolveMergeOutcome(row, existing) === 'conflict';

  // A row is ready to actually reach saveHolding at commit time once its
  // instrument is resolved AND — if merging with an already-held instrument
  // would conflict — the user has picked how (see the proactive Add/Replace
  // UI below). Used consistently everywhere a row's "can this be imported
  // right now" needs checking (the checkbox, the selected-count, the commit
  // loop's own skip condition) so none of them can silently drift apart.
  const isRowReady = (row: ImportRowState): boolean => {
    if (row.status !== 'resolved' || !row.instrument) return false;
    const existing = existingByInstrumentId.get(row.instrument.id);
    if (existing && wouldConflict(row, existing) && !row.mergeStrategy) return false;
    return true;
  };

  const resolveInstruments = async (toResolve: ImportRowState[]) => {
    setRows((prev) => prev.map((r, idx) => (idx < toResolve.length ? { ...r, status: 'resolving' } : r)));

    // Resolve every ISIN in ONE batched request first — looking each position
    // up one at a time (as this used to do) fires one OpenFIGI call per row
    // and exhausts its shared per-minute rate limit well before a real
    // portfolio (10+ holdings) finishes, silently marking well-known stocks
    // as "not found" even though every one of them resolves fine on its own.
    const isins = Array.from(new Set(
      toResolve.map((r) => r.position.isin).filter((v): v is string => Boolean(v)),
    ));
    let isinMatches: Record<string, InvestmentInstrumentDto | null> = {};
    if (isins.length > 0) {
      try {
        isinMatches = await investmentService.searchInstrumentsByIsins(isins);
      } catch {
        isinMatches = {};
      }
    }

    for (let i = 0; i < toResolve.length; i++) {
      const { position } = toResolve[i];

      if (position.isin) {
        // Already attempted by the batch lookup above — that single request
        // IS the authoritative attempt for every ISIN in the file. Retrying
        // per-row here would hit the very same (separate, but still limited)
        // mapping bucket again for nothing: it can only make a later import
        // attempt more likely to get rate-limited too, for no chance of a
        // different result this time.
        const batchMatch = isinMatches[position.isin.toUpperCase()];
        setRows((prev) => prev.map((r, idx) => (idx === i
          ? { ...r, instrument: batchMatch ?? null, status: batchMatch ? 'resolved' : 'not-found', selected: r.selected && Boolean(batchMatch) }
          : r)));
        continue;
      }

      // No ISIN in the file at all (typically crypto rows) — only these fall
      // back to a per-row, ticker/name-based search: OpenFIGI's free-text
      // endpoint first, then CoinGecko.
      const query = position.ticker ?? position.name;
      if (!query) {
        setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, status: 'not-found' } : r)));
        continue;
      }
      try {
        const findMatch = (results: InvestmentInstrumentDto[]) =>
          results.find((instr) => instr.symbol?.toUpperCase() === position.ticker?.toUpperCase()) ?? results[0];

        const figiResults = await investmentService.searchInstruments({ query, source: 'figi', limit: 5 });
        let match = findMatch(figiResults);
        if (!match) {
          const coingeckoResults = await investmentService.searchInstruments({ query, source: 'coingecko', limit: 5 });
          match = findMatch(coingeckoResults);
        }
        setRows((prev) => prev.map((r, idx) => (idx === i
          ? { ...r, instrument: match ?? null, status: match ? 'resolved' : 'not-found', selected: r.selected && Boolean(match) }
          : r)));
      } catch {
        setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, status: 'error' } : r)));
      }
    }
  };

  const setManualKind = (index: number, kind: InvestmentKind) => {
    setRows((prev) => prev.map((r, idx) => (idx === index ? { ...r, manualKind: kind } : r)));
  };

  // Called once the user finds/picks a match via the manual re-search below
  // (InstrumentSearchAutocomplete already handles both "select a verified
  // catalog hit" and "create it as unverified" — either way we just get the
  // resulting instrument here) — lets a "not-found" row (ISIN lookup failed,
  // or there was no ISIN at all) be resolved by hand using ISIN, symbol, or
  // name, instead of only ever landing on "unverified".
  const handleManualResolve = (index: number, instrument: InvestmentInstrumentDto) => {
    setRows((prev) => prev.map((r, idx) => (idx === index
      ? { ...r, instrument, status: 'resolved', selected: true }
      : r)));
  };

  // Backfills the monthly invested-amount history from the file's own
  // transaction dates — only invested_amount is known (no historical market
  // prices are available), current_value is left unset, same as the existing
  // manual historical-edit flow when nothing's been entered yet for a month.
  // Skips months whose recorded value already matches (re-importing a file
  // that was already imported before would otherwise re-send every single
  // month again for nothing — see recordedHistoryByInstrumentId above).
  //
  // Brokers cap how much history a single export covers (Trading212: 365
  // days), so a portfolio with several years of history was necessarily built
  // from multiple separate file uploads. Each file's own transactions only
  // reconstruct a cumulative total *within that file's own date range* -
  // buildMonthlyPositionTimeline has no way to know a "starting balance" was
  // already built up by an earlier, separately-uploaded file. Without
  // carrying that forward, every month after the first file's range would
  // understate the true total (just this file's own contribution, not
  // everything invested before it), only catching up once the live holding
  // itself gets corrected by insertHolding's own add/replace merge - meaning
  // the recorded history for those months stays permanently wrong even
  // though the current, most-recent total looks right.
  // Takes the raw ingredients (not a full ImportRowState) so the exact same
  // backfill logic covers both an open row (importSelected) and a position
  // about to be closed (handleCloseHolding) - a closed
  // position's pre-closure months are just as real a part of "value over
  // time" as an open one's, they just happen to end at zero instead of
  // continuing to grow.
  // Builds this position's dividend payment rows — pure, see buildHistoryEntries
  // above for why. Safe to re-send on a re-imported file: the backend upserts
  // on (instrument, external_id) when the broker provided one (see
  // upsertDividend in the model), so an already-recorded payment is never
  // double-counted, just re-confirmed.
  const buildDividendEntries = (row: ImportRowState, holdingId: number): InvestmentDividendSaveRequest[] => {
    if (!row.instrument) return [];
    const entries: InvestmentDividendSaveRequest[] = [];
    for (const dividend of row.dividends) {
      if (!dividend.date) continue;
      entries.push({
        instrument_id: row.instrument.id,
        holding_id: holdingId,
        amount: convertAmountToEUR(dividend.amount, dividend.currency),
        currency: dividend.currency,
        gross_amount: dividend.amount,
        paid_date: dividend.date,
        external_id: dividend.externalId,
        source: effectiveImportSource,
      });
    }
    return entries;
  };

  // At this point every selected row has already been through review: its
  // instrument is resolved, any merge conflict with an already-held
  // instrument has an explicit mergeStrategy choice (see isRowReady), and any
  // manual overrides are already sitting in row.overrides — nothing here
  // should discover something new to ask the user about. The try/catch below
  // is a defensive fallback only, for the narrow race window where another
  // tab/session changed this same instrument's holding between review and
  // commit (existingByInstrumentId is a snapshot fetched once, up front) —
  // there's no conflict-resolution UI left to route that into mid-commit, so
  // it's just marked as an error; re-dropping the same file(s) is cheap and
  // idempotent (handleFiles merges cumulatively) if that happens.
  const importSelected = async () => {
    if (importing) return;
    setImporting(true);
    const total = rows.filter((r) => r.selected && isRowReady(r)).length;
    setImportPhase('holdings');
    setImportProgress({ current: 0, total });
    try {
      const historyEntries: InvestmentHoldingHistorySaveRequest[] = [];
      const dividendEntries: InvestmentDividendSaveRequest[] = [];
      const transactionEntries: InvestmentTransactionSaveRequest[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row.selected || !isRowReady(row) || !row.instrument) continue;
        const assetKey = KIND_TO_ASSET_KEY[row.instrument.kind];
        if (!assetKey) continue;
        try {
          const saved = await investmentService.saveHolding({
            instrument_id: row.instrument.id,
            asset_key: assetKey,
            quantity: row.position.quantity,
            average_price: getEffectiveAveragePrice(row) != null
              ? convertAmountToEUR(getEffectiveAveragePrice(row)!, row.position.currency)
              : null,
            current_value: row.overrides.currentValue != null ? convertAmountToEUR(row.overrides.currentValue, row.position.investedAmountCurrency) : null,
            invested_amount: row.position.investedAmount != null ? convertAmountToEUR(row.position.investedAmount, row.position.investedAmountCurrency) : null,
            notes: row.overrides.notes ?? '',
            import_source: effectiveImportSource,
            merge_strategy: resolveMergeStrategy(row) ?? row.mergeStrategy ?? undefined,
          });
          historyEntries.push(...buildHistoryEntries(
            row.transactions, row.position.key, saved.id, row.instrument.id,
            recordedHistoryByInstrumentId, recordedQuantityByInstrumentId, convertAmountToEUR,
          ));
          dividendEntries.push(...buildDividendEntries(row, saved.id));
          transactionEntries.push(...buildTransactionEntries(row.transactions, row.instrument.id, saved.id, effectiveImportSource, convertAmountToEUR));
          setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, status: 'saved' } : r)));
        } catch {
          // See the function-level comment above — this should be rare.
          setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, status: 'error' } : r)));
        }
        setImportProgress((prev) => (prev ? { ...prev, current: prev.current + 1 } : prev));
      }
      // Orphan sells (see orphanSells above) never become a "row" - there's no
      // holding to save/replace, just the transactions themselves, so a later
      // file with the missing buy can reconcile against them instead of the
      // sell being lost the moment this session ends. holding_id is null:
      // nothing to attach it to yet. Excluded ones (user opted out during
      // review) are skipped entirely.
      for (const orphan of orphanSells) {
        if (!orphan.instrument || excludedOrphanKeys.has(orphan.key)) continue;
        transactionEntries.push(...buildTransactionEntries(orphan.transactions, orphan.instrument.id, null, effectiveImportSource, convertAmountToEUR));
      }

      setImportPhase('finalizing');
      await flushBatches(investmentService, historyEntries, dividendEntries, transactionEntries);

      setImportDone(true);
      await onImported();
    } finally {
      setImporting(false);
      setImportPhase(null);
      setImportProgress(null);
    }
  };

  // Closes a stale holding the file shows has since been fully sold: quantity
  // and current value go to zero (nothing left to count in the current
  // breakdown), but invested_amount/notes/average_price are kept exactly as
  // they were - the position still needs to be findable among all-time
  // best/worst, it's just no longer active. Never automatic - the user
  // confirms each one individually (see closedCandidates above).
  const handleCloseHolding = async (index: number) => {
    const candidate = closedCandidates[index];
    if (!candidate || candidate.status === 'closing' || !candidate.holding.instrument) return;
    const instrument = candidate.holding.instrument;
    setClosedCandidates((prev) => prev.map((c, i) => (i === index ? { ...c, status: 'closing' } : c)));
    try {
      await closeStaleHolding({
        investmentService,
        holding: candidate.holding,
        transactions: candidate.transactions,
        lastTransactionDate: candidate.lastTransactionDate,
        recordedHistoryByInstrumentId,
        recordedQuantityByInstrumentId,
        convertAmountToEUR,
        // This file just revealed these transactions - re-confirm them (safe,
        // idempotent upsert), unlike the reconciliation panel's equivalent
        // action where every transaction already exists server-side verbatim.
        transactionEntries: buildTransactionEntries(candidate.transactions, instrument.id, candidate.holding.id, effectiveImportSource, convertAmountToEUR),
      });
      setClosedCandidates((prev) => prev.map((c, i) => (i === index ? { ...c, status: 'closed' } : c)));
      await onImported();
    } catch {
      setClosedCandidates((prev) => prev.map((c, i) => (i === index ? { ...c, status: 'error' } : c)));
    }
  };

  const importableCount = rows.filter((r) => r.selected && isRowReady(r)).length;
  const savedCount = rows.filter((r) => r.status === 'saved').length;

  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(language, { month: 'short', year: 'numeric', timeZone: 'UTC' });
  };

  // Previews what this row will do to an instrument already held before the user
  // commits to importing — mirrors resolveMergeStrategy/insertHolding's own
  // overlap-then-source decision (see server/src/db/models/investments.ts) so the
  // preview never promises an outcome (replace vs. add vs. ask) that won't
  // actually happen.
  const describeExistingImpact = (row: ImportRowState, existing: InvestmentHoldingDto) => {
    const existingQuantity = formatNumber(existing.quantity ?? 0);
    const existingAmount = `${formatNumber(existing.investedAmount ?? 0)} ${currencySymbol}`;
    const rowInvestedEUR = row.position.investedAmount != null
      ? convertAmountToEUR(row.position.investedAmount, row.position.investedAmountCurrency)
      : 0;

    switch (resolveMergeOutcome(row, existing)) {
      case 'add':
        // Non-overlapping months (e.g. an older or newer statement covering a
        // period never imported before): unambiguous, always summed, never asked.
        return (t.existingWillAdd || "Already held: {quantity} units, {amount} — this file covers different months you don't have yet, so it will be ADDED on top, bringing it to {newQuantity} units, {newAmount}")
          .replace('{quantity}', existingQuantity)
          .replace('{amount}', existingAmount)
          .replace('{newQuantity}', formatNumber((existing.quantity ?? 0) + (row.position.quantity ?? 0)))
          .replace('{newAmount}', `${formatNumber((existing.investedAmount ?? 0) + rowInvestedEUR)} ${currencySymbol}`);
      case 'up-to-date':
        // Distinguished from the "will be updated" case below (partial overlap,
        // or the numbers actually differ - e.g. a corrected re-export) so
        // re-importing an unchanged file doesn't claim to be "adding
        // transactions you didn't have yet" when it's genuinely adding nothing.
        return (t.existingAlreadyUpToDate || 'Already held: {quantity} units, {amount} — these transactions are already recorded, importing will not change anything')
          .replace('{quantity}', existingQuantity)
          .replace('{amount}', existingAmount);
      case 'auto-replace':
        return (t.existingWillUpdate || 'Already held: {quantity} units, {amount} — will be REPLACED (not added to) with {newQuantity} units, {newAmount} from this file')
          .replace('{quantity}', existingQuantity)
          .replace('{amount}', existingAmount)
          .replace('{newQuantity}', formatNumber(row.position.quantity ?? 0))
          .replace('{newAmount}', `${formatNumber(rowInvestedEUR)} ${currencySymbol}`);
      case 'conflict':
      default:
        return (t.existingDifferentSource || "Already held: {quantity} units, {amount} — tracked from a different source, you'll be asked whether to add to it or replace it")
          .replace('{quantity}', existingQuantity)
          .replace('{amount}', existingAmount);
    }
  };

  // The manual average-price override (if any) falls back to the parsed
  // value, in the instrument's own currency — same shape as every other
  // getEffective* helper in DataImportWizard.tsx's review step.
  const getEffectiveAveragePrice = (row: ImportRowState): number | null =>
    row.overrides.averagePrice ?? row.position.averagePrice ?? null;

  // Previews the dividends found for this row — aggregateDividends returns at
  // most one entry here since row.dividends is already scoped to a single
  // instrument (see groupDividendsByPositionKey in recomputeFromMerged).
  const describeDividends = (row: ImportRowState) => {
    const [summary] = aggregateDividends(row.dividends);
    if (!summary) return null;
    const amountEUR = convertAmountToEUR(summary.totalAmount, summary.currency);
    return (t.dividendsFound || '{count} dividends found, totaling {amount}')
      .replace('{count}', String(summary.paymentCount))
      .replace('{amount}', `${formatNumber(amountEUR)} ${currencySymbol}`);
  };

  const statusIcon = (status: ImportRowState['status']) => {
    switch (status) {
      case 'resolving': return <FontAwesomeIcon icon={faSpinner} spin />;
      case 'resolved': case 'saved': return <FontAwesomeIcon icon={faCircleCheck} />;
      case 'not-found': case 'error': return <FontAwesomeIcon icon={faTriangleExclamation} />;
      default: return null;
    }
  };

  return (
    <Overlay theme={theme} onClick={onClose}>
      <ModalContainer theme={theme} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <ModalHeader theme={theme}>
          <ModalTitle theme={theme}>
            <h2>{t.title}</h2>
            <p>{t.subtitle}</p>
          </ModalTitle>
          <CloseButton theme={theme} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </CloseButton>
        </ModalHeader>

        <ModalBody theme={theme}>
          <ImportPlatformGuide theme={theme} platformIds={INVESTMENT_IMPORT_PLATFORMS} />
          <DropZone theme={theme}>
            <FontAwesomeIcon icon={faFileCsv} />
            {t.dropHint}
            <input
              type="file"
              accept=".csv,text/csv"
              multiple
              onChange={(e) => { void handleFiles(e.target.files); e.target.value = ''; }}
            />
          </DropZone>

          {parseError && (
            <ErrorLine>
              <FontAwesomeIcon icon={faTriangleExclamation} />
              {t.unrecognized}
            </ErrorLine>
          )}

          {loadingSavedTransactions && rows.length === 0 && (
            <SummaryLine theme={theme}>
              <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 6 }} />
              {t.loadingHistory || 'Checking your complete transaction history…'}
            </SummaryLine>
          )}

          {platform && (
            <SummaryLine theme={theme}>
              {t.detected.replace('{platform}', platform === 'generic' && manualSource.trim() ? manualSource.trim() : (t.platforms[platform] || platform))}
              {' — '}{rows.length} {t.positions}
              {skippedRows > 0 && ` (${skippedRows} ${t.skippedNote})`}
            </SummaryLine>
          )}

          {platform === 'generic' && (
            <SourceEditor theme={theme}>
              {t.sourceLabel || 'Source / broker'}
              <span>{t.sourceHint || "The file format doesn't identify the provider. Specify the broker before importing, e.g. TradeRepublic."}</span>
              <input
                type="text"
                value={manualSource}
                maxLength={80}
                onChange={(e) => setManualSource(e.target.value)}
                placeholder={t.sourcePlaceholder || 'E.g. TradeRepublic'}
              />
            </SourceEditor>
          )}

          {rows.some((r) => r.historyMonths.length > 1) && (
            <SummaryLine theme={theme}>{t.historyBackfillNote || 'Past months found in the file will be backfilled automatically as portfolio history.'}</SummaryLine>
          )}

          {closedCandidates.some((c) => c.status !== 'closed') && (
            <ClosedSection>
              <h4>{t.closedPositionsTitle || 'Closed positions detected'}</h4>
              {closedCandidates.filter((c) => c.status !== 'closed').map((candidate) => (
                <ClosedRow key={candidate.holding.id} theme={theme}>
                  <span>
                    <strong>{candidate.holding.instrument?.symbol}</strong> — {candidate.holding.instrument?.name}
                    <span className="note">
                      {t.closedPositionsNote || 'Already in your holdings, but this file shows it was fully sold.'}
                    </span>
                  </span>
                  <CloseHoldingButton
                    type="button"
                    onClick={() => handleCloseHolding(closedCandidates.indexOf(candidate))}
                    disabled={candidate.status === 'closing'}
                  >
                    {candidate.status === 'error'
                      ? (t.closedPositionsRetry || 'Retry')
                      : (t.closedPositionsAction || 'Mark as sold')}
                  </CloseHoldingButton>
                </ClosedRow>
              ))}
            </ClosedSection>
          )}

          {orphanSells.length > 0 && (
            <OrphanSection theme={theme}>
              <h4>{t.orphanSellsTitle || 'Sell with no matching buy found'}</h4>
              {orphanSells.map((orphan) => {
                // Only a NEW orphan (not already persisted from a past import)
                // with a resolved instrument actually gets saved on commit -
                // that's the only case where opting out changes anything
                // (an already-persisted one is already in the ledger; an
                // unresolved one already won't be saved regardless).
                const isOptOutable = !orphan.alreadyPersisted && Boolean(orphan.instrument);
                return (
                  <OrphanRow key={orphan.key} theme={theme}>
                    <OrphanRowContent theme={theme}>
                      {isOptOutable && (
                        <input
                          type="checkbox"
                          checked={!excludedOrphanKeys.has(orphan.key)}
                          onChange={(e) => setExcludedOrphanKeys((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) next.delete(orphan.key); else next.add(orphan.key);
                            return next;
                          })}
                        />
                      )}
                      <span>
                        {orphan.alreadyPersisted
                          ? (t.orphanSellsStillPending || "{ticker} — you still have an unresolved sell for this with no matching buy found — the purchase is probably in a file you haven't uploaded yet. Upload it to reconcile this automatically.")
                            .replace('{ticker}', orphan.ticker || orphan.name || orphan.isin || '?')
                          : (
                            <>
                              {(t.orphanSellsNote || "{ticker} — this file shows a sell, but no buy for it was found (in this import or in your account) — the matching purchase is probably in another file you haven't uploaded yet.")
                                .replace('{ticker}', orphan.ticker || orphan.name || orphan.isin || '?')}
                              {' '}
                              {orphan.instrument
                                ? (t.orphanSellsWillSave || "It will be recorded when you import, so uploading the missing file later will reconcile it automatically.")
                                : (t.orphanSellsUnresolved || "Couldn't identify this instrument, so it won't be recorded this time.")}
                            </>
                          )}
                      </span>
                    </OrphanRowContent>
                  </OrphanRow>
                );
              })}
            </OrphanSection>
          )}

          {rows.map((row, index) => (
            <PositionRow key={row.position.key} theme={theme}>
              <input
                type="checkbox"
                checked={row.selected}
                disabled={!isRowReady(row) || importing || importDone}
                onChange={(e) => setRows((prev) => prev.map((r, idx) => (idx === index ? { ...r, selected: e.target.checked } : r)))}
              />
              <PositionInfo theme={theme}>
                <strong>
                  {row.instrument ? `${row.instrument.symbol} — ${row.instrument.name}` : (row.position.ticker || row.position.name || row.position.isin)}
                  {row.instrument?.provider === 'manual' && (
                    <UnverifiedTag theme={theme}>{t.unverifiedTag || 'Unverified'}</UnverifiedTag>
                  )}
                </strong>
                <span>
                  {formatNumber(row.position.quantity)} × {getEffectiveAveragePrice(row) != null ? `${formatNumber(convertAmountToEUR(getEffectiveAveragePrice(row)!, row.position.currency))} ${currencySymbol}` : '—'}
                  {row.position.investedAmount != null && ` · ${formatNumber(convertAmountToEUR(row.position.investedAmount, row.position.investedAmountCurrency))} ${currencySymbol}`}
                </span>
                {row.instrument && formatInstrumentDetails(row.instrument) !== '' && (
                  <span>{formatInstrumentDetails(row.instrument)}</span>
                )}
                {row.instrument && row.status === 'resolved' && existingByInstrumentId.has(row.instrument.id) && (
                  <ImpactNote theme={theme}>{describeExistingImpact(row, existingByInstrumentId.get(row.instrument.id)!)}</ImpactNote>
                )}
                {row.historyMonths.length > 1 && (
                  <span>
                    {(t.historyMonths || '+{count} months of history').replace('{count}', String(row.historyMonths.length - 1))}
                    {' '}({formatMonthLabel(row.historyMonths[0])} – {formatMonthLabel(row.historyMonths[row.historyMonths.length - 1])})
                  </span>
                )}
                {row.dividends.length > 0 && (
                  <span>{describeDividends(row)}</span>
                )}
                {row.status === 'not-found' && (
                  <ManualResolveBlock theme={theme}>
                    <span>{t.notFound}</span>
                    <ManualAddRow theme={theme}>
                      <select value={row.manualKind} onChange={(e) => setManualKind(index, e.target.value as InvestmentKind)}>
                        {MANUAL_KIND_OPTIONS.map((kind) => (
                          <option key={kind} value={kind}>{t.kinds?.[kind] || kind}</option>
                        ))}
                      </select>
                    </ManualAddRow>
                    <InstrumentSearchAutocomplete
                      assetKey={KIND_TO_ASSET_KEY[row.manualKind]}
                      onSelect={(instrument) => handleManualResolve(index, instrument)}
                    />
                  </ManualResolveBlock>
                )}
                {row.status === 'resolved' && row.instrument && existingByInstrumentId.has(row.instrument.id)
                  && wouldConflict(row, existingByInstrumentId.get(row.instrument.id)!) && (
                  row.mergeStrategy ? (
                    <MergeChoiceLine theme={theme}>
                      {(t.mergeStrategyChosen || 'Merge choice: {strategy}').replace(
                        '{strategy}', row.mergeStrategy === 'add' ? (t.conflictAdd || 'Add to existing') : (t.conflictReplace || 'Replace'),
                      )}
                      <button type="button" onClick={() => setRows((prev) => prev.map((r, idx) => (idx === index ? { ...r, mergeStrategy: null } : r)))}>
                        {t.mergeStrategyChange || 'Change'}
                      </button>
                    </MergeChoiceLine>
                  ) : (
                    <ConflictPanel theme={theme}>
                      <strong>{t.conflictTitle || 'This instrument is already in your portfolio'}</strong>
                      <span>
                        {(t.conflictMessage || "The current (today's, not a specific month's) position for this instrument already has {quantity} units totaling {amount}, tracked from a different source. Sum both totals, or replace the existing one with this file?")
                          .replace('{quantity}', formatNumber(existingByInstrumentId.get(row.instrument.id)!.quantity ?? 0))
                          .replace('{amount}', `${formatNumber(existingByInstrumentId.get(row.instrument.id)!.investedAmount ?? 0)} ${currencySymbol}`)}
                      </span>
                      <SourceComparison theme={theme}>
                        <span>{(t.conflictExistingSource || 'Already saved: {source}').replace('{source}', existingByInstrumentId.get(row.instrument.id)!.importSource || (t.unknownSource || 'source not specified'))}</span>
                        <span>{(t.conflictNewSource || 'This file: {source}').replace('{source}', effectiveImportSource)}</span>
                      </SourceComparison>
                      <ConflictActions>
                        <ConflictButton theme={theme} data-recommended="true" type="button" onClick={() => setRows((prev) => prev.map((r, idx) => (idx === index ? { ...r, mergeStrategy: 'add' } : r)))}>
                          <strong>{t.conflictAdd || 'Add to existing'}</strong>
                          <span>{t.conflictAddHelp || 'Recommended for two brokers: creates one combined position while transactions retain their source.'}</span>
                        </ConflictButton>
                        <ConflictButton theme={theme} type="button" onClick={() => setRows((prev) => prev.map((r, idx) => (idx === index ? { ...r, mergeStrategy: 'replace' } : r)))}>
                          <strong>{t.conflictReplace || 'Replace'}</strong>
                          <span>{t.conflictReplaceHelp || 'Use only when this file must become the new current total.'}</span>
                        </ConflictButton>
                      </ConflictActions>
                    </ConflictPanel>
                  )
                )}
                {row.status === 'error' && (
                  <span>{t.rowError || "Couldn't be processed — try re-dropping the same file(s) again."}</span>
                )}
                {row.status === 'resolved' && (
                  editingOverridesFor === row.position.key ? (
                    <OverrideFields theme={theme}>
                      <strong>{t.overrideTitle || 'Correct the imported data'}</strong>
                      <span>{t.overrideIntro || 'Only fill in values you want to change. Empty fields keep the data calculated from the CSV.'}</span>
                      <label>
                        {t.overrideAveragePrice || 'Average price'}
                        <span>{t.overrideAveragePriceHelp || 'Price paid per unit, in the currency shown in the file.'}</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="any"
                          value={row.overrides.averagePrice ?? ''}
                          placeholder={getEffectiveAveragePrice(row) != null ? formatNumber(getEffectiveAveragePrice(row)!) : (t.overrideOptional || 'Optional')}
                          onChange={(e) => setRows((prev) => prev.map((r, idx) => (idx === index
                            ? { ...r, overrides: { ...r.overrides, averagePrice: e.target.value === '' ? undefined : Number(e.target.value) } }
                            : r)))}
                        />
                      </label>
                      <label>
                        {t.overrideCurrentValue || 'Current value'}
                        <span>{t.overrideCurrentValueHelp || 'Total market value of the entire position today, not the unit price.'}</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="any"
                          value={row.overrides.currentValue ?? ''}
                          placeholder={t.overrideOptional || 'Optional'}
                          onChange={(e) => setRows((prev) => prev.map((r, idx) => (idx === index
                            ? { ...r, overrides: { ...r.overrides, currentValue: e.target.value === '' ? undefined : Number(e.target.value) } }
                            : r)))}
                        />
                      </label>
                      <label>
                        {t.overrideNotes || 'Notes'}
                        <span>{t.overrideNotesHelp || 'Optional details useful for recognizing this position or import.'}</span>
                        <input
                          type="text"
                          value={row.overrides.notes ?? ''}
                          placeholder={t.overrideNotesPlaceholder || 'E.g. account name or import details'}
                          onChange={(e) => setRows((prev) => prev.map((r, idx) => (idx === index
                            ? { ...r, overrides: { ...r.overrides, notes: e.target.value } }
                            : r)))}
                        />
                      </label>
                      <OverrideToggle type="button" onClick={() => setEditingOverridesFor(null)}>
                        {t.overrideDone || 'Done'}
                      </OverrideToggle>
                    </OverrideFields>
                  ) : (
                    <OverrideToggle type="button" onClick={() => setEditingOverridesFor(row.position.key)}>
                      {t.overrideToggle || 'Modify'}
                    </OverrideToggle>
                  )
                )}
              </PositionInfo>
              <StatusIcon theme={theme} className={row.status}>{statusIcon(row.status)}</StatusIcon>
            </PositionRow>
          ))}

          {importing && importPhase === 'holdings' && importProgress && (
            <ImportProgressBlock theme={theme}>
              <SummaryLine theme={theme}>
                <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 6 }} />
                {(t.importingProgress || 'Saving position {current} of {total}…')
                  .replace('{current}', String(importProgress.current + 1 > importProgress.total ? importProgress.total : importProgress.current + 1))
                  .replace('{total}', String(importProgress.total))}
              </SummaryLine>
              <ProgressBarTrack theme={theme}>
                <ProgressBarFill theme={theme} style={{ width: `${importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0}%` }} />
              </ProgressBarTrack>
            </ImportProgressBlock>
          )}

          {importing && importPhase === 'finalizing' && (
            <SummaryLine theme={theme}>
              <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 6 }} />
              {t.importingFinalizing || 'Saving history, transactions and dividends…'}
            </SummaryLine>
          )}

          {importDone && (
            <SummaryLine theme={theme}>{t.done.replace('{count}', String(savedCount))}</SummaryLine>
          )}
        </ModalBody>

        {rows.length > 0 && !importDone && (
          <ModalFooter theme={theme}>
            <ModernActionButton theme={theme} onClick={importSelected} disabled={importableCount === 0 || importing}>
              {importing
                ? <><FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 6 }} />{t.importing}</>
                : t.importSelected.replace('{count}', String(importableCount))}
            </ModernActionButton>
          </ModalFooter>
        )}
      </ModalContainer>
    </Overlay>
  );
}
