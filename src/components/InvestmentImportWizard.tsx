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
} from './multiInsert/SharedStyles';
import { ModernActionButton } from '../styles/MyStyled';
import { parseInvestmentCsv, ImportedTransaction } from '../utils/investmentImport/parsers';
import {
  dedupeTransactions, aggregatePositions, buildMonthlyPositionTimeline, groupTransactionsByPositionKey, AggregatedPosition,
} from '../utils/investmentImport/aggregate';
import { formatInstrumentDetails } from '../utils/instrumentDisplay';
import { KIND_TO_ASSET_KEY } from '../constants/investmentSchema';
import ImportPlatformGuide from './ImportPlatformGuide';
import InstrumentSearchAutocomplete from './InstrumentSearchAutocomplete';
import { HoldingConflictError } from '../services/investmentService';
import type { InvestmentInstrumentDto, InvestmentKind, InvestmentHoldingDto } from '../types/api';

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
  instrument: InvestmentInstrumentDto | null;
  status: 'pending' | 'resolving' | 'resolved' | 'not-found' | 'conflict' | 'saved' | 'error';
  selected: boolean;
  /** Every "YYYY-MM" this position's history will backfill, chronological — includes the current month. */
  historyMonths: string[];
  /** Asset kind picked for a not-found row — determines which catalog (OpenFIGI/CoinGecko)
   * the manual re-search below uses, and what kind gets created if added as unverified. */
  manualKind: InvestmentKind;
  /** Set when status is 'conflict': the already-held holding this row's instrument collided with (see HoldingConflictError). */
  conflictExisting: InvestmentHoldingDto | null;
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
  &.resolved, &.saved { color: #10b981; }
  &.not-found, &.error { color: #f59e0b; }
  &.resolving { color: ${(p) => p.theme.textColor}; opacity: 0.5; }
`;

const ManualResolveBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.35rem;
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

  &:hover { opacity: 0.85; }
`;

export default function InvestmentImportWizard({ onClose, onImported }: InvestmentImportWizardProps) {
  const { theme } = useContext(ThemeContext);
  const { translations, language } = useContext(LanguageContext);
  const { formatNumber, toEUR, currencySymbol } = useContext(CurrencyContext);
  const { investmentService } = useDemoServices();
  const t = translations.investments.importWizard;

  const [rows, setRows] = useState<ImportRowState[]>([]);
  const [platform, setPlatform] = useState<string | null>(null);
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
   * The value itself lets backfillHistory skip re-sending a month whose number
   * hasn't actually changed — re-importing an identical file otherwise re-sends
   * every single month again for no reason. */
  const [recordedHistoryByInstrumentId, setRecordedHistoryByInstrumentId] = useState<Map<number, Map<string, number | null>>>(new Map());

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setParseError(false);
    setImportDone(false);
    const text = await file.text();
    const parsed = parseInvestmentCsv(text);
    if (!parsed || parsed.transactions.length === 0) {
      setParseError(true);
      setRows([]);
      setPlatform(null);
      return;
    }
    // Merge with transactions from already-loaded files (multi-file upload for capped exports)
    const deduped = dedupeTransactions(parsed.transactions);
    const positions = aggregatePositions(deduped);
    const transactionsByKey = groupTransactionsByPositionKey(deduped);
    setPlatform(parsed.platform);
    setSkippedRows(parsed.skippedRows);
    const initialRows: ImportRowState[] = positions.map((position) => {
      const transactions = transactionsByKey.get(position.key) ?? [];
      // Every distinct month present in this position's own history - what will
      // get an automatic backfilled snapshot (shown to the user up front below).
      const historyMonths = buildMonthlyPositionTimeline(transactions).map((s) => s.monthKey);
      return {
        position, transactions, instrument: null, status: 'pending', selected: true, historyMonths,
        manualKind: 'stock', conflictExisting: null,
      };
    });
    setRows(initialRows);
    // Fetched (and awaited) *before* instrument resolution starts marking rows
    // 'resolved' - resolveMergeStrategy/describeExistingImpact must never see a
    // row go 'resolved' (importable) while these maps are still empty, or a
    // genuine month-overlap could be missed and wrongly treated as "add".
    try {
      const [holdings, history] = await Promise.all([
        investmentService.getHoldings(),
        investmentService.getHoldingHistory({}),
      ]);
      const holdingMap = new Map<number, InvestmentHoldingDto>();
      for (const holding of holdings) if (holding.instrument) holdingMap.set(holding.instrument.id, holding);
      setExistingByInstrumentId(holdingMap);

      const historyMap = new Map<number, Map<string, number | null>>();
      for (const entry of history) {
        const months = historyMap.get(entry.instrumentId) ?? new Map<string, number | null>();
        months.set(entry.userDate.slice(0, 7), entry.investedAmount);
        historyMap.set(entry.instrumentId, months);
      }
      setRecordedHistoryByInstrumentId(historyMap);
    } catch {
      setExistingByInstrumentId(new Map());
      setRecordedHistoryByInstrumentId(new Map());
    }
    void resolveInstruments(initialRows);
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
  const backfillHistory = async (row: ImportRowState, holdingId: number, instrumentId: number) => {
    const timeline = buildMonthlyPositionTimeline(row.transactions);
    const recorded = recordedHistoryByInstrumentId.get(instrumentId);
    for (const snapshot of timeline) {
      const snapshotPosition = snapshot.positions.find((p) => p.key === row.position.key);
      if (!snapshotPosition || snapshotPosition.investedAmount == null) continue;
      const investedAmountEUR = toEUR(snapshotPosition.investedAmount);
      const alreadyRecorded = recorded?.get(snapshot.monthKey);
      if (alreadyRecorded != null && Math.abs(alreadyRecorded - investedAmountEUR) < 0.01) continue;
      try {
        await investmentService.saveHoldingHistory({
          holding_id: holdingId,
          user_date: `${snapshot.monthKey}-01`,
          current_value: null,
          invested_amount: investedAmountEUR,
        });
      } catch {
        // Backfilling one month's history failing shouldn't roll back the
        // holding itself — the user can still fix it manually later.
      }
    }
  };

  const importSelected = async () => {
    if (importing) return;
    setImporting(true);
    try {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row.selected || row.status !== 'resolved' || !row.instrument) continue;
        const assetKey = KIND_TO_ASSET_KEY[row.instrument.kind];
        if (!assetKey) continue;
        try {
          const saved = await investmentService.saveHolding({
            instrument_id: row.instrument.id,
            asset_key: assetKey,
            quantity: row.position.quantity,
            average_price: row.position.averagePrice != null ? toEUR(row.position.averagePrice) : null,
            current_value: null,
            invested_amount: row.position.investedAmount != null ? toEUR(row.position.investedAmount) : null,
            notes: '',
            import_source: platform,
            merge_strategy: resolveMergeStrategy(row),
          });
          await backfillHistory(row, saved.id, row.instrument.id);
          setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, status: 'saved' } : r)));
        } catch (error) {
          if (error instanceof HoldingConflictError) {
            setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, status: 'conflict', conflictExisting: error.existing } : r)));
          } else {
            setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, status: 'error' } : r)));
          }
        }
      }
      setImportDone(true);
      await onImported();
    } finally {
      setImporting(false);
    }
  };

  // Resolves a 'conflict' row once the user picks how to handle the
  // already-held instrument: "add" sums both positions (e.g. the same stock
  // held on a different platform too), "replace" overwrites it (e.g. the
  // existing holding was a rough manual entry the user wants superseded by
  // this file's exact numbers).
  const resolveConflict = async (index: number, strategy: 'add' | 'replace') => {
    const row = rows[index];
    if (!row.instrument) return;
    const assetKey = KIND_TO_ASSET_KEY[row.instrument.kind];
    if (!assetKey) return;
    setRows((prev) => prev.map((r, idx) => (idx === index ? { ...r, status: 'resolving' } : r)));
    try {
      const saved = await investmentService.saveHolding({
        instrument_id: row.instrument.id,
        asset_key: assetKey,
        quantity: row.position.quantity,
        average_price: row.position.averagePrice != null ? toEUR(row.position.averagePrice) : null,
        current_value: null,
        invested_amount: row.position.investedAmount != null ? toEUR(row.position.investedAmount) : null,
        notes: '',
        import_source: platform,
        merge_strategy: strategy,
      });
      await backfillHistory(row, saved.id, row.instrument.id);
      setRows((prev) => prev.map((r, idx) => (idx === index ? { ...r, status: 'saved' } : r)));
    } catch {
      setRows((prev) => prev.map((r, idx) => (idx === index ? { ...r, status: 'error' } : r)));
    }
  };

  const importableCount = rows.filter((r) => r.selected && r.status === 'resolved').length;
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

    if (resolveMergeStrategy(row) === 'add') {
      // Non-overlapping months (e.g. an older or newer statement covering a
      // period never imported before): unambiguous, always summed, never asked.
      return (t.existingWillAdd || "Already held: {quantity} units, {amount} — this file covers different months you don't have yet, so it will be ADDED on top, bringing it to {newQuantity} units, {newAmount}")
        .replace('{quantity}', existingQuantity)
        .replace('{amount}', existingAmount)
        .replace('{newQuantity}', formatNumber((existing.quantity ?? 0) + (row.position.quantity ?? 0)))
        .replace('{newAmount}', `${formatNumber((existing.investedAmount ?? 0) + (row.position.investedAmount ?? 0))} ${currencySymbol}`);
    }

    const willAutoReplace = existing.importSource === platform || existing.importSource == null;
    if (willAutoReplace) {
      return (t.existingWillUpdate || 'Already held: {quantity} units, {amount} — will be REPLACED (not added to) with {newQuantity} units, {newAmount} from this file')
        .replace('{quantity}', existingQuantity)
        .replace('{amount}', existingAmount)
        .replace('{newQuantity}', formatNumber(row.position.quantity ?? 0))
        .replace('{newAmount}', `${formatNumber(row.position.investedAmount ?? 0)} ${currencySymbol}`);
    }
    return (t.existingDifferentSource || "Already held: {quantity} units, {amount} — tracked from a different source, you'll be asked whether to add to it or replace it")
      .replace('{quantity}', existingQuantity)
      .replace('{amount}', existingAmount);
  };

  const statusIcon = (status: ImportRowState['status']) => {
    switch (status) {
      case 'resolving': return <FontAwesomeIcon icon={faSpinner} spin />;
      case 'resolved': case 'saved': return <FontAwesomeIcon icon={faCircleCheck} />;
      case 'not-found': case 'conflict': case 'error': return <FontAwesomeIcon icon={faTriangleExclamation} />;
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
            <input type="file" accept=".csv,text/csv" onChange={(e) => handleFile(e.target.files?.[0])} />
          </DropZone>

          {parseError && (
            <ErrorLine>
              <FontAwesomeIcon icon={faTriangleExclamation} />
              {t.unrecognized}
            </ErrorLine>
          )}

          {platform && (
            <SummaryLine theme={theme}>
              {t.detected.replace('{platform}', t.platforms[platform] || platform)}
              {' — '}{rows.length} {t.positions}
              {skippedRows > 0 && ` (${skippedRows} ${t.skippedNote})`}
            </SummaryLine>
          )}

          {rows.some((r) => r.historyMonths.length > 1) && (
            <SummaryLine theme={theme}>{t.historyBackfillNote || 'Past months found in the file will be backfilled automatically as portfolio history.'}</SummaryLine>
          )}

          {rows.map((row, index) => (
            <PositionRow key={row.position.key} theme={theme}>
              <input
                type="checkbox"
                checked={row.selected}
                disabled={row.status !== 'resolved' || importing || importDone}
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
                  {formatNumber(row.position.quantity)} × {row.position.averagePrice != null ? `${formatNumber(row.position.averagePrice)} ${currencySymbol}` : '—'}
                  {row.position.investedAmount != null && ` · ${formatNumber(row.position.investedAmount)} ${currencySymbol}`}
                </span>
                {row.instrument && formatInstrumentDetails(row.instrument) !== '' && (
                  <span>{formatInstrumentDetails(row.instrument)}</span>
                )}
                {row.instrument && (row.status === 'resolved' || row.status === 'conflict') && existingByInstrumentId.has(row.instrument.id) && (
                  <ImpactNote theme={theme}>{describeExistingImpact(row, existingByInstrumentId.get(row.instrument.id)!)}</ImpactNote>
                )}
                {row.historyMonths.length > 1 && (
                  <span>
                    {(t.historyMonths || '+{count} months of history').replace('{count}', String(row.historyMonths.length - 1))}
                    {' '}({formatMonthLabel(row.historyMonths[0])} – {formatMonthLabel(row.historyMonths[row.historyMonths.length - 1])})
                  </span>
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
                {row.status === 'conflict' && row.conflictExisting && (
                  <ManualResolveBlock theme={theme}>
                    <span>
                      {(t.conflictMessage || "The current (today's, not a specific month's) position for this instrument already has {quantity} units totaling {amount}, tracked from a different source. Sum both totals, or replace the existing one with this file?")
                        .replace('{quantity}', formatNumber(row.conflictExisting.quantity ?? 0))
                        .replace('{amount}', `${formatNumber(row.conflictExisting.investedAmount ?? 0)} ${currencySymbol}`)}
                    </span>
                    <ConflictActions>
                      <ConflictButton theme={theme} type="button" onClick={() => resolveConflict(index, 'add')}>
                        {t.conflictAdd || 'Add to existing'}
                      </ConflictButton>
                      <ConflictButton theme={theme} type="button" onClick={() => resolveConflict(index, 'replace')}>
                        {t.conflictReplace || 'Replace'}
                      </ConflictButton>
                    </ConflictActions>
                  </ManualResolveBlock>
                )}
              </PositionInfo>
              <StatusIcon theme={theme} className={row.status}>{statusIcon(row.status)}</StatusIcon>
            </PositionRow>
          ))}

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
