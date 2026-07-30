import React, { useContext, useEffect, useState, lazy, Suspense } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash, faPen, faTimes, faPlus, faCheck, faFileImport, faClockRotateLeft, faMagnifyingGlassChart,
} from '@fortawesome/free-solid-svg-icons';

const InvestmentImportWizard = lazy(() => import('./InvestmentImportWizard'));
const InvestmentReconciliationPanel = lazy(() => import('./InvestmentReconciliationPanel'));
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { useDemoServices } from '../hooks/useDemoServices';
import InstrumentSearchAutocomplete from './InstrumentSearchAutocomplete';
import {
  Overlay, ModalContainer, ModalHeader, ModalTitle, CloseButton, ModalBody, ModalFooter,
} from './multiInsert/SharedStyles';
import { ModernActionButton } from '../styles/MyStyled';
import { ASSET_KEY_TO_KIND, KIND_TO_SEARCH_SOURCE, DEFAULT_INSTRUMENT_HINTS } from '../constants/investmentSchema';
import { formatInstrumentDetails } from '../utils/instrumentDisplay';
import type { InvestmentAssetKey, InvestmentDividendSummaryDto, InvestmentHoldingDto, InvestmentHoldingHistoryDto, InvestmentInstrumentDto } from '../types/api';

interface InvestmentHoldingsPanelProps {
  assetKey: InvestmentAssetKey;
  holdings: InvestmentHoldingDto[];
  onClose: () => void;
  onChanged: () => Promise<void> | void;
  /** Whether the balance picker is on the current month (default true — the live-editing behavior). */
  isCurrentMonth?: boolean;
  /** The viewed month as "YYYY-MM-01", required when isCurrentMonth is false. */
  userDate?: string;
  /** Backfilled history rows for the viewed month, keyed by holding id. */
  historyByEntityId?: Record<number, InvestmentHoldingHistoryDto | undefined>;
}

interface FormState {
  instrument: InvestmentInstrumentDto | null;
  quantity: string;
  averagePrice: string;
  currentValue: string;
  investedAmount: string;
  notes: string;
}

const emptyForm: FormState = {
  instrument: null, quantity: '', averagePrice: '', currentValue: '', investedAmount: '', notes: '',
};

const EmptyState = styled.p`
  margin: 0.5rem 0 1rem;
  font-size: 0.85rem;
  color: ${(p) => p.theme.textColor};
  opacity: 0.55;
  text-align: center;
`;

const SectionLabel = styled.h3`
  margin: 0 0 0.6rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${(p) => p.theme.textColor};
  opacity: 0.5;
`;

const DividendsSummary = styled.p`
  margin: 0 0 0.7rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${(p) => p.theme.textColor};
  opacity: 0.75;
`;

/** Visually groups every "add" control (manual form/trigger + CSV import) into
 * one distinct block, set apart from the holdings list above it — the two
 * used to blend into a single flat list of buttons and rows. */
const AddSection = styled.div`
  margin-top: 1.1rem;
  padding: 0.9rem 0.9rem 0.2rem;
  border-radius: 12px;
  border: 1px dashed ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)')};
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)')};
`;

const HoldingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.7rem 0.8rem;
  border-radius: 10px;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)')};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')};
`;

const HoldingInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
  color: ${(p) => p.theme.textColor};

  strong { font-size: 0.88rem; display: flex; align-items: center; gap: 0.4rem; }
  span { font-size: 0.75rem; opacity: 0.6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  span.no-value { font-style: italic; }
`;

/** Right-aligned value block — total first (the number that matters most,
 * given its own visual weight), gain/loss as a secondary line underneath. */
const HoldingValue = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  gap: 0.1rem;
  color: ${(p) => p.theme.textColor};

  strong { font-size: 0.95rem; font-weight: 700; white-space: nowrap; }
  span.no-value { font-size: 0.75rem; opacity: 0.6; font-style: italic; white-space: nowrap; }
`;

const GainLoss = styled.span<{ $positive: boolean }>`
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  color: ${(p) => (p.$positive ? '#10b981' : '#ef4444')};
`;

const UnverifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  font-size: 0.62rem;
  font-weight: 600;
  padding: 0.1rem 0.4rem;
  border-radius: 20px;
  background: rgba(245, 158, 11, 0.14);
  color: #d97706;
`;

const HoldingActions = styled.div`
  display: flex;
  gap: 0.4rem;
  flex-shrink: 0;

  button {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')};
    color: ${(p) => p.theme.textColor};

    &:hover { opacity: 0.8; }
  }
`;

const HistoricalEditRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0 0.1rem;

  input {
    flex: 1;
    min-width: 0;
    padding: 0.45rem 0.6rem;
    border-radius: 8px;
    border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0')};
    background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'white')};
    color: ${(p) => p.theme.textColor};
    font-size: 0.85rem;
    outline: none;
    &:focus { border-color: ${(p) => p.theme.buttonBackgroundColor}; }
  }

  button {
    width: 30px;
    height: 30px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')};
    color: ${(p) => p.theme.textColor};

    &:disabled { opacity: 0.4; cursor: not-allowed; }
    &:hover:not(:disabled) { opacity: 0.8; }
  }
`;

/** Wraps a single holding's full monthly history (see expandedHistoryHoldingId
 * below) - visually nested under its HoldingRow, one month per HistoryMonthRow. */
const HistoryDrawer = styled.div`
  margin: -0.3rem 0 0.3rem;
  padding: 0.5rem 0.7rem 0.2rem;
  border-radius: 0 0 10px 10px;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)')};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')};
  border-top: none;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const HistoryMonthRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.3rem 0.1rem;
  font-size: 0.78rem;
  color: ${(p) => p.theme.textColor};

  span.month { flex-shrink: 0; opacity: 0.65; min-width: 4.5rem; }
  span.values { flex: 1; text-align: right; }

  button {
    width: 26px;
    height: 26px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 7px;
    cursor: pointer;
    background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')};
    color: ${(p) => p.theme.textColor};
    &:hover { opacity: 0.8; }
  }
`;

const HistoryMonthEditRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.1rem;

  input {
    flex: 1;
    min-width: 0;
    padding: 0.4rem 0.5rem;
    border-radius: 7px;
    border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0')};
    background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'white')};
    color: ${(p) => p.theme.textColor};
    font-size: 0.78rem;
    outline: none;
    &:focus { border-color: ${(p) => p.theme.buttonBackgroundColor}; }
  }

  button {
    width: 26px;
    height: 26px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 7px;
    cursor: pointer;
    background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')};
    color: ${(p) => p.theme.textColor};
    &:disabled { opacity: 0.4; cursor: not-allowed; }
    &:hover:not(:disabled) { opacity: 0.8; }
  }
`;

const AddTriggerButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  margin-top: 0.75rem;
  padding: 0.65rem;
  border-radius: 10px;
  border: 1px dashed ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : '#cbd5e1')};
  background: transparent;
  color: ${(p) => p.theme.textColor};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  opacity: 0.8;

  &:hover { opacity: 1; background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)')}; }
`;

const FormSection = styled.div`
  margin-top: 0.75rem;
  padding-top: 0.9rem;
  border-top: 1px dashed ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')};
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const FormTitle = styled.h3`
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${(p) => p.theme.textColor};
  opacity: 0.75;
`;

const SelectedInstrument = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0.7rem;
  border-radius: 8px;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)')};
  color: ${(p) => p.theme.textColor};
  font-size: 0.85rem;
  font-weight: 600;

  button {
    border: none;
    background: transparent;
    color: inherit;
    opacity: 0.5;
    cursor: pointer;
    &:hover { opacity: 1; }
  }
`;

const DefaultInstrumentHint = styled.p`
  margin: 0.4rem 0 0;
  font-size: 0.72rem;
  color: ${(p) => p.theme.textColor};
  opacity: 0.6;
`;

const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;

  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.72rem;
    color: ${(p) => p.theme.textColor};
    opacity: 0.65;
    min-width: 0;
  }

  input {
    width: 100%;
    box-sizing: border-box;
    padding: 0.5rem 0.6rem;
    border-radius: 8px;
    border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0')};
    background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'white')};
    color: ${(p) => p.theme.textColor};
    font-size: 0.85rem;
    outline: none;

    &:focus { border-color: ${(p) => p.theme.buttonBackgroundColor}; }
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const NotesInput = styled.textarea`
  padding: 0.5rem 0.6rem;
  border-radius: 8px;
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0')};
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'white')};
  color: ${(p) => p.theme.textColor};
  font-size: 0.82rem;
  font-family: inherit;
  resize: vertical;
  min-height: 44px;
  outline: none;

  &:focus { border-color: ${(p) => p.theme.buttonBackgroundColor}; }
`;

const SecondaryButton = styled.button`
  padding: 0.6rem 1.1rem;
  border-radius: 10px;
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : '#cbd5e1')};
  background: transparent;
  color: ${(p) => p.theme.textColor};
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
`;

export default function InvestmentHoldingsPanel({
  assetKey, holdings, onClose, onChanged, isCurrentMonth = true, userDate, historyByEntityId = {},
}: InvestmentHoldingsPanelProps) {
  const { theme } = useContext(ThemeContext);
  const { translations, language } = useContext(LanguageContext);
  const { fromEUR, toEUR, formatAmount } = useContext(CurrencyContext);
  const { investmentService } = useDemoServices();
  const t = translations.investments.holdings;

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDefaultPrefilled, setIsDefaultPrefilled] = useState(false);
  const [showForm, setShowForm] = useState(holdings.length === 0);
  const [historicalEditingId, setHistoricalEditingId] = useState<number | null>(null);
  const [historicalValueInput, setHistoricalValueInput] = useState('');
  const [savingHistorical, setSavingHistorical] = useState(false);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [showReconciliation, setShowReconciliation] = useState(false);
  /** Which holding's full monthly history drawer is expanded, if any - only
   * one open at a time (see HoldingActions below, current-month view only;
   * the past-month-scoped historicalEditingId flow above is untouched). */
  const [expandedHistoryHoldingId, setExpandedHistoryHoldingId] = useState<number | null>(null);
  /** Every recorded history row across every holding - fetched lazily on the
   * first history drawer expansion (not eagerly on panel mount, so a user who
   * never opens a drawer never pays for this request), then filtered
   * client-side per holding. */
  const [allHistory, setAllHistory] = useState<InvestmentHoldingHistoryDto[] | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [editingHistoryMonthKey, setEditingHistoryMonthKey] = useState<string | null>(null);
  const [historyMonthInputs, setHistoryMonthInputs] = useState({ currentValue: '', investedAmount: '', quantity: '' });
  const [savingHistoryMonth, setSavingHistoryMonth] = useState(false);
  /** Per-instrument dividend totals (see server/src/db/models/investments.ts
   * getDividendsSummaryByUserId) — fetched once per panel open, keyed by
   * instrument id so each holding row can show its own total and compare it
   * against invested_amount, without a per-row network call. */
  const [dividendsByInstrumentId, setDividendsByInstrumentId] = useState<Map<number, InvestmentDividendSummaryDto>>(new Map());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const summary = await investmentService.getDividendsSummary();
        if (cancelled) return;
        setDividendsByInstrumentId(new Map(summary.map((entry) => [entry.instrumentId, entry])));
      } catch (error) {
        console.error('InvestmentHoldingsPanel: failed to load dividends summary', error);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-fill the obvious instrument (e.g. BTC for `bitcoin`) on a user's very
  // first holding for this asset key, so they aren't forced to search for it -
  // see DEFAULT_INSTRUMENT_HINTS. Still fully overridable (the existing "clear
  // selection" button below re-opens the search box), and silently does
  // nothing if the search fails or finds no exact match. Only relevant for the
  // live-portfolio add flow, which past-month mode doesn't offer.
  useEffect(() => {
    if (!isCurrentMonth || holdings.length > 0) return;
    const hint = DEFAULT_INSTRUMENT_HINTS[assetKey];
    const kind = ASSET_KEY_TO_KIND[assetKey];
    const source = kind ? KIND_TO_SEARCH_SOURCE[kind] : null;
    if (!hint || !kind || !source) return;

    let cancelled = false;
    (async () => {
      try {
        const results = await investmentService.searchInstruments({ query: hint.query, kind, source, limit: 5 });
        const match = results.find((i) => i.symbol?.toUpperCase() === hint.symbol.toUpperCase());
        if (!cancelled && match) {
          setForm((f) => (f.instrument ? f : { ...f, instrument: match }));
          setIsDefaultPrefilled(true);
        }
      } catch (error) {
        console.error('InvestmentHoldingsPanel: default instrument prefill failed', error);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (holding: InvestmentHoldingDto) => {
    setEditingId(holding.id);
    setIsDefaultPrefilled(false);
    setShowForm(true);
    setForm({
      instrument: holding.instrument,
      quantity: holding.quantity != null ? String(holding.quantity) : '',
      averagePrice: holding.averagePrice != null ? String(fromEUR(holding.averagePrice)) : '',
      currentValue: holding.currentValue != null ? String(fromEUR(holding.currentValue)) : '',
      investedAmount: holding.investedAmount != null ? String(fromEUR(holding.investedAmount)) : '',
      notes: holding.notes || '',
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setIsDefaultPrefilled(false);
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.instrument || saving) return;
    setSaving(true);
    try {
      await investmentService.saveHolding({
        id: editingId ?? undefined,
        instrument_id: form.instrument.id,
        asset_key: assetKey,
        quantity: form.quantity !== '' ? Number(form.quantity) : null,
        average_price: form.averagePrice !== '' ? toEUR(Number(form.averagePrice)) : null,
        current_value: form.currentValue !== '' ? toEUR(Number(form.currentValue)) : null,
        invested_amount: form.investedAmount !== '' ? toEUR(Number(form.investedAmount)) : null,
        notes: form.notes,
      });
      resetForm();
      await onChanged();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (holdingId: number) => {
    await investmentService.deleteHolding({ id: holdingId });
    if (editingId === holdingId) resetForm();
    await onChanged();
  };

  const startHistoricalEdit = (holding: InvestmentHoldingDto) => {
    const entry = historyByEntityId[holding.id];
    setHistoricalEditingId(holding.id);
    setHistoricalValueInput(entry?.currentValue != null ? String(fromEUR(entry.currentValue)) : '');
  };

  const saveHistoricalValue = async (holdingId: number) => {
    if (historicalValueInput === '' || savingHistorical || !userDate) return;
    setSavingHistorical(true);
    try {
      await investmentService.saveHoldingHistory({
        holding_id: holdingId,
        user_date: userDate,
        current_value: toEUR(Number(historicalValueInput)),
        invested_amount: null,
      });
      setHistoricalEditingId(null);
      await onChanged();
    } finally {
      setSavingHistorical(false);
    }
  };

  // Toggles a holding's full monthly history drawer (current-month view
  // only - see expandedHistoryHoldingId above). Fetches every recorded
  // history row once, lazily, on the first expansion of ANY holding's
  // drawer - getHoldingHistory({}) already returns every holding's rows in
  // one call, so there's nothing instrument-specific to ask the server for.
  const toggleHistoryDrawer = async (holdingId: number) => {
    if (expandedHistoryHoldingId === holdingId) {
      setExpandedHistoryHoldingId(null);
      setEditingHistoryMonthKey(null);
      return;
    }
    setExpandedHistoryHoldingId(holdingId);
    setEditingHistoryMonthKey(null);
    if (allHistory !== null) return;
    setLoadingHistory(true);
    try {
      const history = await investmentService.getHoldingHistory({});
      setAllHistory(history);
    } catch (error) {
      console.error('InvestmentHoldingsPanel: failed to load holding history', error);
      setAllHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const startHistoryMonthEdit = (entry: InvestmentHoldingHistoryDto) => {
    setEditingHistoryMonthKey(entry.userDate);
    setHistoryMonthInputs({
      currentValue: entry.currentValue != null ? String(fromEUR(entry.currentValue)) : '',
      investedAmount: entry.investedAmount != null ? String(fromEUR(entry.investedAmount)) : '',
      quantity: entry.quantity != null ? String(entry.quantity) : '',
    });
  };

  const saveHistoryMonth = async (holdingId: number, userDateForMonth: string) => {
    if (savingHistoryMonth) return;
    setSavingHistoryMonth(true);
    try {
      const saved = await investmentService.saveHoldingHistory({
        holding_id: holdingId,
        user_date: userDateForMonth,
        current_value: historyMonthInputs.currentValue !== '' ? toEUR(Number(historyMonthInputs.currentValue)) : null,
        invested_amount: historyMonthInputs.investedAmount !== '' ? toEUR(Number(historyMonthInputs.investedAmount)) : null,
        quantity: historyMonthInputs.quantity !== '' ? Number(historyMonthInputs.quantity) : null,
      });
      setAllHistory((prev) => (prev ? prev.map((e) => (e.holdingId === holdingId && e.userDate === userDateForMonth ? saved : e)) : prev));
      setEditingHistoryMonthKey(null);
      await onChanged();
    } finally {
      setSavingHistoryMonth(false);
    }
  };

  const formatHistoryMonthLabel = (dateStr: string) => {
    const [year, month] = dateStr.split('-').map(Number);
    const locale = language === 'it' ? 'it-IT' : 'en-US';
    return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(locale, { month: 'short', year: 'numeric', timeZone: 'UTC' });
  };

  // Total dividends received across the instruments actually shown in this
  // panel (this asset key's holdings) - not every dividend the user has ever
  // received across every asset key, which would be a different, larger number.
  const totalDividendsForAssetKey = holdings.reduce((sum, holding) => {
    if (!holding.instrument) return sum;
    const entry = dividendsByInstrumentId.get(holding.instrument.id);
    return sum + (entry?.totalAmount ?? 0);
  }, 0);

  return (
    <Overlay theme={theme} onClick={onClose}>
      <ModalContainer theme={theme} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <ModalHeader theme={theme}>
          <ModalTitle theme={theme}>
            <h2>{t.title}</h2>
            <p>{translations.assets[assetKey]}</p>
          </ModalTitle>
          <CloseButton theme={theme} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </CloseButton>
        </ModalHeader>

        <ModalBody theme={theme}>
          <SectionLabel theme={theme}>{t.positionsListTitle}</SectionLabel>
          {isCurrentMonth && totalDividendsForAssetKey > 0 && (
            <DividendsSummary theme={theme}>
              {(t.dividendsReceivedTotal || 'Dividends received: {amount}').replace('{amount}', formatAmount(totalDividendsForAssetKey))}
            </DividendsSummary>
          )}
          {holdings.length === 0 && <EmptyState theme={theme}>{t.emptyState}</EmptyState>}

          {holdings.map((holding) => {
            const historicalEntry = historyByEntityId[holding.id];
            const isEditingHistorical = historicalEditingId === holding.id;
            return (
              <React.Fragment key={holding.id}>
                <HoldingRow theme={theme}>
                  <HoldingInfo theme={theme}>
                    <strong>
                      {holding.instrument?.symbol ?? '—'}
                      {holding.instrument?.provider === 'manual' && (
                        <UnverifiedBadge title={t.unverifiedHint || "Not verified — won't count toward comparisons with other users."}>
                          {t.unverifiedBadge || 'Unverified'}
                        </UnverifiedBadge>
                      )}
                    </strong>
                    <span>{holding.instrument?.name}</span>
                    {formatInstrumentDetails(holding.instrument) !== '' && (
                      <span>{formatInstrumentDetails(holding.instrument)}</span>
                    )}
                    {(() => {
                      const source = isCurrentMonth ? holding : historicalEntry;
                      if (!source || source.quantity == null || source.averagePrice == null) return null;
                      const locale = language === 'it' ? 'it-IT' : 'en-US';
                      return (
                        <span>
                          {source.quantity.toLocaleString(locale, { maximumFractionDigits: 6 })}
                          {' × '}
                          {formatAmount(source.averagePrice)}
                        </span>
                      );
                    })()}
                    {isCurrentMonth && holding.instrument && dividendsByInstrumentId.has(holding.instrument.id) && (() => {
                      const entry = dividendsByInstrumentId.get(holding.instrument.id)!;
                      const ratio = holding.investedAmount ? (entry.totalAmount / holding.investedAmount) * 100 : null;
                      const label = (t.dividendsReceived || 'Dividends: {amount}{ratio}')
                        .replace('{amount}', formatAmount(entry.totalAmount))
                        .replace('{ratio}', ratio != null ? ` (${ratio.toFixed(1)}% ${t.dividendsOfInvested || 'of invested'})` : '');
                      return <span>{label}</span>;
                    })()}
                  </HoldingInfo>
                  <HoldingValue theme={theme}>
                    {isCurrentMonth ? (
                      <strong>{formatAmount(holding.currentValue ?? holding.investedAmount ?? 0)}</strong>
                    ) : historicalEntry ? (
                      <strong>{formatAmount(historicalEntry.currentValue ?? historicalEntry.investedAmount ?? 0)}</strong>
                    ) : (
                      <span className="no-value">{t.noValueForMonth}</span>
                    )}
                    {(() => {
                      const source = isCurrentMonth ? holding : historicalEntry;
                      if (!source || source.currentValue == null || source.investedAmount == null || source.investedAmount === 0) return null;
                      const gain = source.currentValue - source.investedAmount;
                      const gainPct = (gain / source.investedAmount) * 100;
                      return (
                        <GainLoss $positive={gain >= 0}>
                          {gain >= 0 ? '+' : ''}{formatAmount(gain)} ({gain >= 0 ? '+' : ''}{gainPct.toFixed(1)}%)
                        </GainLoss>
                      );
                    })()}
                  </HoldingValue>
                  <HoldingActions theme={theme}>
                    {isCurrentMonth ? (
                      <>
                        <button type="button" onClick={() => toggleHistoryDrawer(holding.id)} aria-label={t.historyTitle || 'Storico'}>
                          <FontAwesomeIcon icon={faClockRotateLeft} />
                        </button>
                        <button type="button" onClick={() => startEdit(holding)} aria-label={t.editTitle}>
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                        <button type="button" onClick={() => handleDelete(holding.id)} aria-label={t.deleteButton}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={() => startHistoricalEdit(holding)} aria-label={t.editTitle}>
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                    )}
                  </HoldingActions>
                </HoldingRow>
                {isCurrentMonth && expandedHistoryHoldingId === holding.id && (
                  <HistoryDrawer theme={theme}>
                    {loadingHistory && <span style={{ fontSize: '0.78rem', opacity: 0.6 }}>{t.historyLoading || 'Caricamento storico…'}</span>}
                    {!loadingHistory && (() => {
                      const monthsForHolding = (allHistory ?? [])
                        .filter((entry) => entry.holdingId === holding.id)
                        .sort((a, b) => a.userDate.localeCompare(b.userDate));
                      if (monthsForHolding.length === 0) {
                        return <span style={{ fontSize: '0.78rem', opacity: 0.6 }}>{t.historyEmptyState || 'Nessuno storico registrato per questo titolo.'}</span>;
                      }
                      return monthsForHolding.map((entry) => (
                        editingHistoryMonthKey === entry.userDate ? (
                          <HistoryMonthEditRow key={entry.userDate} theme={theme}>
                            <input
                              type="number"
                              autoFocus
                              value={historyMonthInputs.currentValue}
                              onChange={(e) => setHistoryMonthInputs((f) => ({ ...f, currentValue: e.target.value }))}
                              placeholder={t.currentValue}
                            />
                            <input
                              type="number"
                              value={historyMonthInputs.investedAmount}
                              onChange={(e) => setHistoryMonthInputs((f) => ({ ...f, investedAmount: e.target.value }))}
                              placeholder={t.investedAmount}
                            />
                            <input
                              type="number"
                              value={historyMonthInputs.quantity}
                              onChange={(e) => setHistoryMonthInputs((f) => ({ ...f, quantity: e.target.value }))}
                              placeholder={t.quantity}
                            />
                            <button type="button" onClick={() => setEditingHistoryMonthKey(null)} aria-label={translations.general.cancel}>
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                            <button
                              type="button"
                              onClick={() => saveHistoryMonth(holding.id, entry.userDate)}
                              disabled={savingHistoryMonth}
                              aria-label={t.saveButton}
                            >
                              <FontAwesomeIcon icon={faCheck} />
                            </button>
                          </HistoryMonthEditRow>
                        ) : (
                          <HistoryMonthRow key={entry.userDate} theme={theme}>
                            <span className="month">{formatHistoryMonthLabel(entry.userDate)}</span>
                            <span className="values">
                              {formatAmount(entry.currentValue ?? entry.investedAmount ?? 0)}
                              {entry.quantity != null && ` · ${entry.quantity.toLocaleString(language === 'it' ? 'it-IT' : 'en-US', { maximumFractionDigits: 6 })}`}
                            </span>
                            <button type="button" onClick={() => startHistoryMonthEdit(entry)} aria-label={t.editTitle}>
                              <FontAwesomeIcon icon={faPen} />
                            </button>
                          </HistoryMonthRow>
                        )
                      ));
                    })()}
                  </HistoryDrawer>
                )}
                {isEditingHistorical && (
                  <HistoricalEditRow theme={theme}>
                    <input
                      type="number"
                      autoFocus
                      value={historicalValueInput}
                      onChange={(e) => setHistoricalValueInput(e.target.value)}
                      placeholder={t.currentValue}
                    />
                    <button type="button" onClick={() => setHistoricalEditingId(null)} aria-label={translations.general.cancel}>
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                    <button
                      type="button"
                      onClick={() => saveHistoricalValue(holding.id)}
                      disabled={historicalValueInput === '' || savingHistorical}
                      aria-label={t.saveButton}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                  </HistoricalEditRow>
                )}
              </React.Fragment>
            );
          })}

          <AddSection theme={theme}>
            <SectionLabel theme={theme}>{t.addSectionTitle}</SectionLabel>

            {isCurrentMonth && (showForm ? (
              <FormSection theme={theme} style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
                <FormTitle theme={theme}>{editingId ? t.editTitle : t.addTitle}</FormTitle>

                {form.instrument ? (
                  <>
                    <SelectedInstrument theme={theme}>
                      <span>
                        {form.instrument.symbol} — {form.instrument.name}
                        {formatInstrumentDetails(form.instrument) !== '' && (
                          <em style={{ display: 'block', fontSize: '0.72rem', fontWeight: 400, opacity: 0.6, fontStyle: 'normal' }}>
                            {formatInstrumentDetails(form.instrument)}
                          </em>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setForm((f) => ({ ...f, instrument: null }));
                          setIsDefaultPrefilled(false);
                        }}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </SelectedInstrument>
                    {isDefaultPrefilled && (
                      <DefaultInstrumentHint theme={theme}>{t.defaultInstrumentHint}</DefaultInstrumentHint>
                    )}
                  </>
                ) : (
                  <InstrumentSearchAutocomplete
                    assetKey={assetKey}
                    onSelect={(instrument) => setForm((f) => ({ ...f, instrument }))}
                  />
                )}

                <FieldsGrid theme={theme}>
                  <label>
                    {t.quantity}
                    <input type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
                  </label>
                  <label>
                    {t.averagePrice}
                    <input type="number" value={form.averagePrice} onChange={(e) => setForm((f) => ({ ...f, averagePrice: e.target.value }))} />
                  </label>
                  <label>
                    {t.currentValue}
                    <input type="number" value={form.currentValue} onChange={(e) => setForm((f) => ({ ...f, currentValue: e.target.value }))} />
                  </label>
                  <label>
                    {t.investedAmount}
                    <input type="number" value={form.investedAmount} onChange={(e) => setForm((f) => ({ ...f, investedAmount: e.target.value }))} />
                  </label>
                </FieldsGrid>

                <NotesInput
                  theme={theme}
                  placeholder={t.notesPlaceholder}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </FormSection>
            ) : (
              <AddTriggerButton type="button" theme={theme} onClick={() => setShowForm(true)} style={{ marginTop: 0 }}>
                <FontAwesomeIcon icon={faPlus} />
                {t.addTitle}
              </AddTriggerButton>
            ))}

            <AddTriggerButton type="button" theme={theme} onClick={() => setShowImportWizard(true)} data-umami-event="investment-import-opened">
              <FontAwesomeIcon icon={faFileImport} />
              {translations.investments.importWizard?.button || 'Importa da CSV'}
            </AddTriggerButton>
            {isCurrentMonth && (
              <AddTriggerButton type="button" theme={theme} onClick={() => setShowReconciliation(true)} data-umami-event="investment-reconciliation-opened">
                <FontAwesomeIcon icon={faMagnifyingGlassChart} />
                {t.reconciliationButton || 'Analizza le tue transazioni'}
              </AddTriggerButton>
            )}
            {!isCurrentMonth && (
              <DefaultInstrumentHint theme={theme}>
                {translations.investments.importWizard?.pastMonthNote
                  || 'The import always updates today\'s position and backfills history from the file\'s own dates — it doesn\'t only affect the month shown here.'}
              </DefaultInstrumentHint>
            )}
          </AddSection>
        </ModalBody>

        {isCurrentMonth && showForm && (
          <ModalFooter theme={theme}>
            {editingId && <SecondaryButton theme={theme} onClick={resetForm}>{t.cancelEdit}</SecondaryButton>}
            <ModernActionButton theme={theme} onClick={handleSave} disabled={!form.instrument || saving}>
              {editingId ? t.saveButton : t.addButton}
            </ModernActionButton>
          </ModalFooter>
        )}

        {showImportWizard && (
          <Suspense fallback={null}>
            <InvestmentImportWizard
              onClose={() => setShowImportWizard(false)}
              onImported={async () => { await onChanged(); }}
            />
          </Suspense>
        )}

        {showReconciliation && (
          <Suspense fallback={null}>
            <InvestmentReconciliationPanel
              onClose={() => setShowReconciliation(false)}
              onChanged={async () => { await onChanged(); }}
            />
          </Suspense>
        )}
      </ModalContainer>
    </Overlay>
  );
}
