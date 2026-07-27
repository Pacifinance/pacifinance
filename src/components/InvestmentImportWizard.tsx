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
import type { InvestmentInstrumentDto, InvestmentKind } from '../types/api';

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
  status: 'pending' | 'resolving' | 'resolved' | 'not-found' | 'saved' | 'error';
  selected: boolean;
  /** How many distinct past months this row's history will backfill (0 = single month, nothing to backfill). */
  historyMonthCount: number;
  /** Asset kind picked for a not-found row before adding it as an unverified/manual instrument. */
  manualKind: InvestmentKind;
  creatingManual: boolean;
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

const StatusIcon = styled.span`
  flex-shrink: 0;
  font-size: 0.85rem;
  &.resolved, &.saved { color: #10b981; }
  &.not-found, &.error { color: #f59e0b; }
  &.resolving { color: ${(p) => p.theme.textColor}; opacity: 0.5; }
`;

const ManualAddRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.3rem;

  select {
    padding: 0.25rem 0.4rem;
    border-radius: 6px;
    border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : '#cbd5e1')};
    background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white')};
    color: ${(p) => p.theme.textColor};
    font-size: 0.72rem;
  }

  button {
    border: none;
    border-radius: 6px;
    padding: 0.25rem 0.5rem;
    background: rgba(217, 119, 6, 0.14);
    color: #d97706;
    font-size: 0.72rem;
    font-weight: 600;
    cursor: pointer;
    &:disabled { cursor: wait; opacity: 0.6; }
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

export default function InvestmentImportWizard({ onClose, onImported }: InvestmentImportWizardProps) {
  const { theme } = useContext(ThemeContext);
  const { translations } = useContext(LanguageContext);
  const { formatNumber, toEUR, currencySymbol } = useContext(CurrencyContext);
  const { investmentService } = useDemoServices();
  const t = translations.investments.importWizard;

  const [rows, setRows] = useState<ImportRowState[]>([]);
  const [platform, setPlatform] = useState<string | null>(null);
  const [skippedRows, setSkippedRows] = useState(0);
  const [parseError, setParseError] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);

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
      // Months present in this position's own history, beyond the current one —
      // that's how many past months will get an automatic backfilled snapshot.
      const historyMonthCount = Math.max(0, buildMonthlyPositionTimeline(transactions).length - 1);
      return {
        position, transactions, instrument: null, status: 'pending', selected: true, historyMonthCount,
        manualKind: 'stock', creatingManual: false,
      };
    });
    setRows(initialRows);
    void resolveInstruments(initialRows);
  };

  const resolveInstruments = async (toResolve: ImportRowState[]) => {
    for (let i = 0; i < toResolve.length; i++) {
      const { position } = toResolve[i];
      const query = position.isin ?? position.ticker ?? position.name;
      if (!query) {
        setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, status: 'not-found' } : r)));
        continue;
      }
      setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, status: 'resolving' } : r)));
      try {
        const findMatch = (results: InvestmentInstrumentDto[]) => (position.isin
          ? results.find((instr) => instr.isin?.toUpperCase() === position.isin)
          : results.find((instr) => instr.symbol?.toUpperCase() === position.ticker?.toUpperCase()) ?? results[0]);

        // The CSV alone doesn't say whether this is a security or a crypto
        // asset — try OpenFIGI (stocks/ETFs/bonds/funds) first, then fall
        // back to CoinGecko so crypto rows aren't wrongly marked not-found.
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

  const handleAddUnverified = async (index: number) => {
    const row = rows[index];
    if (row.creatingManual) return;
    const label = row.position.ticker ?? row.position.name ?? row.position.isin ?? '?';
    setRows((prev) => prev.map((r, idx) => (idx === index ? { ...r, creatingManual: true } : r)));
    try {
      const created = await investmentService.createManualInstrument({
        kind: row.manualKind, symbol: label.slice(0, 20).toUpperCase(), name: row.position.name ?? label, currency: row.position.currency,
      });
      setRows((prev) => prev.map((r, idx) => (idx === index
        ? { ...r, instrument: created, status: 'resolved', selected: true, creatingManual: false }
        : r)));
    } catch (error) {
      console.error('InvestmentImportWizard: manual instrument creation failed', error);
      setRows((prev) => prev.map((r, idx) => (idx === index ? { ...r, creatingManual: false } : r)));
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
          });
          // Backfill the monthly invested-amount history from the file's own
          // transaction dates — only invested_amount is known (no historical
          // market prices are available), current_value is left unset, same
          // as the existing manual historical-edit flow when nothing's been
          // entered yet for a month.
          const timeline = buildMonthlyPositionTimeline(row.transactions);
          for (const snapshot of timeline) {
            const snapshotPosition = snapshot.positions.find((p) => p.key === row.position.key);
            if (!snapshotPosition || snapshotPosition.investedAmount == null) continue;
            try {
              await investmentService.saveHoldingHistory({
                holding_id: saved.id,
                user_date: `${snapshot.monthKey}-01`,
                current_value: null,
                invested_amount: toEUR(snapshotPosition.investedAmount),
              });
            } catch {
              // Backfilling one month's history failing shouldn't roll back the
              // holding itself — the user can still fix it manually later.
            }
          }
          setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, status: 'saved' } : r)));
        } catch {
          setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, status: 'error' } : r)));
        }
      }
      setImportDone(true);
      await onImported();
    } finally {
      setImporting(false);
    }
  };

  const importableCount = rows.filter((r) => r.selected && r.status === 'resolved').length;
  const savedCount = rows.filter((r) => r.status === 'saved').length;

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

          {rows.some((r) => r.historyMonthCount > 0) && (
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
                {row.historyMonthCount > 0 && (
                  <span>{(t.historyMonths || '+{count} months of history').replace('{count}', String(row.historyMonthCount))}</span>
                )}
                {row.status === 'not-found' && (
                  <>
                    <span>{t.notFound}</span>
                    <ManualAddRow theme={theme}>
                      <select value={row.manualKind} onChange={(e) => setManualKind(index, e.target.value as InvestmentKind)}>
                        {MANUAL_KIND_OPTIONS.map((kind) => (
                          <option key={kind} value={kind}>{t.kinds?.[kind] || kind}</option>
                        ))}
                      </select>
                      <button type="button" disabled={row.creatingManual} onClick={() => handleAddUnverified(index)}>
                        {row.creatingManual
                          ? <FontAwesomeIcon icon={faSpinner} spin />
                          : (t.addUnverified || 'Add as unverified')}
                      </button>
                    </ManualAddRow>
                  </>
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
