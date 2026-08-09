import React, { useContext, useEffect, useState, lazy, Suspense } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ShieldCheck, Users } from 'lucide-react';
import {
  faTrash, faPen, faTimes, faPlus, faCheck, faFileImport, faClockRotateLeft, faMagnifyingGlassChart,
} from '@fortawesome/free-solid-svg-icons';

const InvestmentImportWizard = lazy(() => import('./InvestmentImportWizard'));
const InvestmentReconciliationPanel = lazy(() => import('./InvestmentReconciliationPanel'));
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { useDemoServices } from '../hooks/useDemoServices';
import { CommunityPriceConflictError } from '../services/investmentService';
import InstrumentSearchAutocomplete from './InstrumentSearchAutocomplete';
import {
  Overlay, ModalContainer, ModalHeader, ModalTitle, CloseButton, ModalBody, ModalFooter,
} from '../components/multiInsert/SharedStyles';
import { ModernActionButton } from '../styles/MyStyled';
import { ASSET_KEY_TO_KIND, KIND_TO_SEARCH_SOURCE, DEFAULT_INSTRUMENT_HINTS } from '../constants/investmentSchema';
import { formatInstrumentDetails } from '../utils/instrumentDisplay';
import { getAssetColor } from '../data/assetColors';
import { getAssetIcon } from '../data/assetIcons';
import { reconcileInvestmentBalance } from '../utils/investmentBalanceReconciliation';
import type {
  CommunityPriceDto, InvestmentAssetKey, InvestmentDividendSummaryDto, InvestmentHoldingDto, InvestmentHoldingHistoryDto,
  InvestmentInstrumentDto, InvestmentTransactionSummaryDto,
} from '../types/api';
import type { PacifinanceTheme } from '../types/theme';
import type enTranslations from '../i18n/locales/en.json';

const COMMUNITY_PRICE_KINDS = new Set(['stock', 'etf', 'crypto']);

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
  /** Aggregate balance declared by the user for this category and viewed month, in EUR. */
  categoryTotal?: number;
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

const BalanceReconciliationSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem;
  margin-bottom: 0.85rem;
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid ${(p) => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'};
  background: ${(p) => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.02)'};
  color: ${(p) => p.theme.textColor};

  div { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
  span { font-size: 0.65rem; opacity: 0.58; }
  strong { font-size: 0.82rem; overflow-wrap: anywhere; }
  .difference { color: ${(p) => p.$status === 'over-allocated' ? '#f59e0b' : p.theme.buttonBackgroundColor}; }

  @media (max-width: 480px) { grid-template-columns: 1fr 1fr; }
`;

const HoldingShare = styled.span`
  font-size: 0.68rem;
  color: ${(p) => p.theme.textColor};
  opacity: 0.58;
`;

const TabBar = styled.div`
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.9rem;
  border-bottom: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')};
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 0.55rem 0.2rem;
  margin-bottom: -1px;
  border: none;
  border-bottom: 2px solid ${(p) => (p.$active ? p.theme.buttonBackgroundColor : 'transparent')};
  background: transparent;
  color: ${(p) => p.theme.textColor};
  opacity: ${(p) => (p.$active ? 1 : 0.55)};
  font-size: 0.82rem;
  font-weight: ${(p) => (p.$active ? 700 : 600)};
  cursor: pointer;

  &:hover { opacity: 1; }
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
 * below) - visually nested under its HoldingRow, one month per HistoryMonthCard. */
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

const HistoryYearFilter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.1rem;

  select {
    padding: 0.25rem 0.4rem;
    border-radius: 6px;
    border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : '#cbd5e1')};
    background: ${(p) => (p.theme.mode === 'dark' ? '#1a1f2e' : 'white')};
    color: ${(p) => p.theme.textColor};
    font-size: 0.72rem;

    option {
      background: ${(p) => (p.theme.mode === 'dark' ? '#1a1f2e' : 'white')};
      color: ${(p) => p.theme.textColor};
    }
  }
`;

/** One month's card in the history drawer - month + verification badge on
 * top, value + quantity/delta/source tags + edit button below. Replaces a
 * flatter single-line layout that buried the price under a wall of small
 * numbers with no visual hierarchy. */
/** $editing flattens the bottom corners and switches to the same green
 * accent border as CommunityPriceEditRow below it, so the two visually fuse
 * into one card instead of reading as two unrelated floating boxes - see the
 * form's own $connected styling. */
const HistoryMonthCard = styled.div<{ $editing?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.65rem 0.75rem;
  border-radius: ${(p) => (p.$editing ? '10px 10px 0 0' : '10px')};
  color: ${(p) => p.theme.textColor};
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.018)')};
  border: 1px solid ${(p) => (p.$editing
    ? (p.theme.mode === 'dark' ? 'rgba(16,185,129,0.35)' : 'rgba(5,150,105,0.3)')
    : (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'))};
  ${(p) => p.$editing && 'border-bottom: none;'}
  transition: background 0.15s ease;

  &:hover {
    background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)')};
  }
`;

const HistoryMonthTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;

  span.month-label {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: capitalize;
    opacity: 0.85;
  }
`;

/** Right side of HistoryMonthTopRow - the verification badge plus, when
 * relevant, the contribute trigger / submission status / celebrate action
 * right next to it, instead of a whole separate line under the card. */
const TopRowActions = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
`;

const StatusPill = styled.span<{ $tone: 'success' | 'warning' | 'danger' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 20px;
  white-space: nowrap;
  background: ${(p) => (p.$tone === 'success' ? 'rgba(16,185,129,0.14)' : p.$tone === 'warning' ? 'rgba(245,158,11,0.14)' : 'rgba(239,68,68,0.14)')};
  color: ${(p) => (p.$tone === 'success' ? p.theme.successColor : p.$tone === 'warning' ? '#d97706' : p.theme.dangerColor)};

  svg { width: 10px; height: 10px; }
`;

/** Compact "contribute the market price" trigger - icon + one short word,
 * sitting right next to the unverified badge instead of its own underlined
 * line below the card. */
const ContributeTrigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  flex-shrink: 0;
  border: none;
  background: none;
  padding: 0;
  font-size: 0.64rem;
  font-weight: 700;
  color: ${(p) => p.theme.buttonBackgroundColor};
  cursor: pointer;
  white-space: nowrap;

  svg { width: 11px; height: 11px; }
  &:hover:not(:disabled) { opacity: 0.8; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const DismissIconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: none;
  background: none;
  padding: 0;
  color: ${(p) => p.theme.textColor};
  opacity: 0.45;
  cursor: pointer;
  &:hover { opacity: 0.8; }
  svg { width: 10px; height: 10px; }
`;

const HistoryMonthMainRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.6rem;

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

const HistoryMonthValueBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;

  strong.value { font-size: 1rem; font-weight: 700; }

  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.3rem 0.5rem;
    font-size: 0.7rem;
    color: ${(p) => p.theme.textColor};
    opacity: 0.6;
  }
`;

const HistorySourceTag = styled.span`
  font-size: 0.62rem;
  font-weight: 600;
  padding: 0.05rem 0.4rem;
  border-radius: 6px;
  color: ${(p) => p.theme.textColor};
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.055)')};
  opacity: 0.85;
`;

/** Marks whether a month's quantity grew (bought, green) or shrank (sold,
 * red) vs. the previous recorded month - see the quantityDelta computed
 * alongside each HistoryMonthCard above. */
const HistoryQuantityDelta = styled.span<{ $positive: boolean }>`
  font-weight: 700;
  color: ${(p) => (p.$positive ? p.theme.successColor : p.theme.dangerColor)};
`;

const HistoryMonthEditRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
  align-items: end;
  gap: 0.35rem;
  padding: 0.65rem;
  border-radius: 9px;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.035)' : 'rgba(15,23,42,0.025)')};

  label { display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; font-size: 0.66rem; color: ${(p) => p.theme.textColor}; opacity: 0.78; }
  .actions { display: flex; gap: 0.3rem; }

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

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
    .actions { justify-content: flex-end; }
  }
`;

const CelebrateButton = styled.button`
  border: 1px solid rgba(16, 185, 129, 0.28);
  border-radius: 999px;
  padding: 0.3rem 0.65rem;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
`;

const CelebrationBurst = styled.span`
  position: absolute;
  right: 1.5rem;
  pointer-events: none;

  i {
    position: absolute;
    animation: community-celebrate 900ms ease-out forwards;
    transform: rotate(var(--rotation)) translateY(0);
  }

  @keyframes community-celebrate {
    to { transform: rotate(var(--rotation)) translateY(-42px); opacity: 0; }
  }
`;

const CommunityExplainer = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.6rem;
  margin: 0.1rem 0 0.45rem;
  padding: 0.65rem;
  border-radius: 9px;
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(16,185,129,0.2)' : 'rgba(5,150,105,0.18)')};
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(16,185,129,0.055)' : 'rgba(16,185,129,0.04)')};
  color: ${(p) => p.theme.textColor};

  strong { display: flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; margin-bottom: 0.15rem; }
  p { margin: 0; font-size: 0.68rem; line-height: 1.45; opacity: 0.72; }
`;

/** Renders directly under the HistoryMonthCard it edits, with no gap and no
 * top border/radius of its own (see that component's $editing prop) - the
 * two visually fuse into a single card so it's unambiguous which month this
 * form belongs to, instead of reading as a stray box wedged into the list. */
const CommunityPriceEditRow = styled.div`
  margin: -1px 0 0.45rem;
  padding: 0.55rem 0.65rem 0.65rem;
  border-radius: 0 0 10px 10px;
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(16,185,129,0.35)' : 'rgba(5,150,105,0.3)')};
  border-top: none;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(16,185,129,0.055)' : 'rgba(16,185,129,0.04)')};

  .form-title {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin: 0 0 0.55rem;
    font-size: 0.72rem;
    font-weight: 700;
    color: ${(p) => p.theme.textColor};
    text-transform: capitalize;

    svg { width: 11px; height: 11px; color: ${(p) => p.theme.buttonBackgroundColor}; flex-shrink: 0; }
  }

  .fields {
    display: grid;
    grid-template-columns: 1fr 4rem 8.5rem auto;
    align-items: end;
    gap: 0.35rem;
  }

  label { display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; font-size: 0.66rem; color: ${(p) => p.theme.textColor}; opacity: 0.75; }
  .actions { display: flex; gap: 0.3rem; }

  input {
    width: 100%;
    box-sizing: border-box;
    padding: 0.35rem 0.5rem;
    border-radius: 7px;
    border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0')};
    background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'white')};
    color: ${(p) => p.theme.textColor};
    font-size: 0.75rem;
    outline: none;
    &:focus { border-color: ${(p) => p.theme.buttonBackgroundColor}; }
  }
  input.currency { text-transform: uppercase; text-align: center; }

  button {
    width: 24px;
    height: 24px;
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

  @media (max-width: 560px) {
    .fields { grid-template-columns: 1fr 4rem; }
    label.date { grid-column: 1 / -1; }
    .actions { grid-column: 1 / -1; justify-content: flex-end; }
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

/** One choice in the delete-management modal - title + a short explanation
 * of its exact scope stacked underneath, instead of a single terse label
 * (AddTriggerButton's shape) that leaves what actually gets removed to
 * guesswork. */
const DeleteOptionButton = styled.button<{ $danger?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  width: 100%;
  margin-top: 0.6rem;
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  text-align: left;
  cursor: pointer;
  border: 1px dashed ${(p) => (p.$danger
    ? `${p.theme.dangerColor}88`
    : (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : '#cbd5e1'))};
  background: transparent;

  strong { display: block; font-size: 0.85rem; font-weight: 700; color: ${(p) => (p.$danger ? p.theme.dangerColor : p.theme.textColor)}; }
  span { display: block; margin-top: 0.15rem; font-size: 0.72rem; font-weight: 400; line-height: 1.4; color: ${(p) => p.theme.textColor}; opacity: 0.65; }

  &:hover:not(:disabled) { background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)')}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
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

/** Save/Cancel for the inline per-row edit form (see renderHoldingRow) -
 * unlike the "add new holding" form, there's no shared ModalFooter to put
 * these in, since the form itself lives next to whichever specific row is
 * being edited, not at a fixed position in the modal. */
const InlineEditActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

export default function InvestmentHoldingsPanel({
  assetKey, holdings, onClose, onChanged, isCurrentMonth = true, userDate, historyByEntityId = {}, categoryTotal = 0,
}: InvestmentHoldingsPanelProps) {
  const { theme } = useContext(ThemeContext) as { theme: PacifinanceTheme };
  const { translations, language } = useContext(LanguageContext) as {
    translations: typeof enTranslations;
    language: string;
  };
  const { fromEUR, toEUR, formatAmount } = useContext(CurrencyContext) as {
    fromEUR: (value: number) => number;
    toEUR: (value: number) => number;
    formatAmount: (value: number, options?: Intl.NumberFormatOptions) => string;
  };
  const { investmentService } = useDemoServices();
  const t = translations.investments.holdings;

  // A "closed" holding (fully sold) is never deleted, just set to quantity 0
  // (see closeStaleHolding.ts / InvestmentImportWizard's handleCloseHolding) -
  // split once here so "current holdings" never shows 0,00€ noise and "past
  // holdings" has something to show. Only meaningful in the live/current-month
  // view (see the tabs below); past-month mode doesn't use these.
  const activeHoldings = holdings.filter((h) => (h.quantity ?? 0) > 0);
  const pastHoldings = holdings.filter((h) => (h.quantity ?? 0) <= 0);
  const reconciliationRows = (isCurrentMonth ? activeHoldings : holdings)
    .map((holding) => ({ holding, value: isCurrentMonth ? holding : historyByEntityId[holding.id] }))
    .filter((row) => row.value != null);
  const balanceReconciliation = reconcileInvestmentBalance(
    categoryTotal,
    reconciliationRows.map((row) => row.value as InvestmentHoldingDto | InvestmentHoldingHistoryDto),
  );
  const holdingShareById = new Map(
    reconciliationRows.map((row, index) => [row.holding.id, balanceReconciliation.holdingShares[index]]),
  );

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDefaultPrefilled, setIsDefaultPrefilled] = useState(false);
  const [showForm, setShowForm] = useState(activeHoldings.length === 0);
  /** Which of the 3 top-level sections is shown - only relevant in the live/
   * current-month view (past-month mode keeps its own single-list layout,
   * it has no "add new" or "past holdings" concept at all). Defaults to the
   * "add" tab when there are no ACTIVE holdings yet, same intent as showForm's
   * own default above but scoped to this asset key's real, open positions -
   * a user whose only holding here is a closed one still has nothing to
   * manage in "current", so land them on "add" instead of an empty list. */
  const [activeTab, setActiveTab] = useState<'current' | 'add' | 'past'>(activeHoldings.length === 0 ? 'add' : 'current');
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
  /** Every recorded transaction across every instrument - fetched lazily
   * alongside allHistory, purely to look up which platform(s) contributed to
   * a given month (see renderHoldingRow's history drawer) - not needed for
   * anything else in this panel. */
  const [allTransactions, setAllTransactions] = useState<InvestmentTransactionSummaryDto[] | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [editingHistoryMonthKey, setEditingHistoryMonthKey] = useState<string | null>(null);
  const [historyMonthInputs, setHistoryMonthInputs] = useState({ currentValue: '', investedAmount: '', quantity: '' });
  const [savingHistoryMonth, setSavingHistoryMonth] = useState(false);
  /** Which calendar year the history drawer is filtered to, per holding id -
   * "all" (the default) shows every recorded month. */
  const [historyYearFilterByHoldingId, setHistoryYearFilterByHoldingId] = useState<Record<number, string>>({});
  /** The current user's own community-price submissions across every
   * instrument (all statuses) - fetched lazily alongside allHistory, purely
   * to show "your submission for {month} is pending/verified/rejected"
   * instead of the "contribute" prompt for months already submitted. */
  const [myCommunityPrices, setMyCommunityPrices] = useState<CommunityPriceDto[] | null>(null);
  /** `${holdingId}-${userDate}` of the month currently showing the
   * price+currency contribution form, if any - separate from
   * editingHistoryMonthKey since contributing a community price and editing
   * this user's own private monthly value are two different actions. */
  const [communityPriceEditingKey, setCommunityPriceEditingKey] = useState<string | null>(null);
  const [communityPriceInputs, setCommunityPriceInputs] = useState({ price: '', currency: 'EUR', date: '' });
  const [submittingCommunityPrice, setSubmittingCommunityPrice] = useState(false);
  const [backfillingProviderHistory, setBackfillingProviderHistory] = useState(false);
  const [providerHistoryMessage, setProviderHistoryMessage] = useState<string | null>(null);
  /** `${holdingId}-${userDate}` of the month whose "contribute" click is
   * currently driving a CoinGecko recovery attempt (see contributeForMonth
   * below) - only that one row shows the loading label, the rest stay put. */
  const [contributingMonthKey, setContributingMonthKey] = useState<string | null>(null);
  /** Set when a submission 409s because an active (pending or verified)
   * submission for that instrument+month already exists - possibly from
   * another user, so this is shown as a neutral notice, never folded into
   * myCommunityPrices' "your submission" status line. */
  const [communityPriceConflict, setCommunityPriceConflict] = useState<{ key: string; existing: CommunityPriceDto } | null>(null);
  const [celebratedCommunityPrices, setCelebratedCommunityPrices] = useState<Set<number>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('celebrated-community-prices') || '[]') as number[]); }
    catch { return new Set(); }
  });
  const [celebratingCommunityPriceId, setCelebratingCommunityPriceId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InvestmentHoldingDto | null>(null);
  const [deletingTransactions, setDeletingTransactions] = useState(false);
  const [transactionDeleteArmed, setTransactionDeleteArmed] = useState(false);
  const AssetIcon = getAssetIcon(assetKey);
  const assetAccent = getAssetColor(assetKey, theme.mode);
  const supportsCoinGecko = assetKey === 'bitcoin' || assetKey === 'crypto';
  /** Per-instrument dividend totals (see server/src/db/models/investments.ts
   * getDividendsSummaryByUserId) — fetched once per panel open, keyed by
   * instrument id so each holding row can show its own total and compare it
   * against invested_amount, without a per-row network call. */
  const [dividendsByInstrumentId, setDividendsByInstrumentId] = useState<Map<number, InvestmentDividendSummaryDto>>(new Map());

  const celebrateCommunityPrice = (id: number) => {
    const next = new Set(celebratedCommunityPrices).add(id);
    setCelebratedCommunityPrices(next);
    localStorage.setItem('celebrated-community-prices', JSON.stringify([...next]));
    setCelebratingCommunityPriceId(id);
    window.setTimeout(() => setCelebratingCommunityPriceId(null), 950);
  };

  // Triggered from a specific month's "contribute the market price" trigger
  // (see the TopRowActions render below) rather than from a standalone,
  // always-visible button - CoinGecko is tried first, for every gap across
  // this holding's whole history (not just the clicked month), and only the
  // months it can't cover fall back to the manual proposal form. Immediately
  // refetches history into state (instead of just nulling it out) so the
  // month list reflects the recovered prices right away, without requiring
  // the user to collapse and reopen the drawer.
  const contributeForMonth = async (holding: InvestmentHoldingDto, entry: InvestmentHoldingHistoryDto) => {
    if (!supportsCoinGecko) {
      startCommunityPriceEdit(holding, entry);
      return;
    }
    if (backfillingProviderHistory) return;
    const communityKey = `${holding.id}-${entry.userDate}`;
    setBackfillingProviderHistory(true);
    setContributingMonthKey(communityKey);
    setProviderHistoryMessage(null);
    try {
      // backfillHistoricalPrices() runs across EVERY holding the user has,
      // not just this one - its response ({holdingId, monthsFilled}[]) and
      // the verified/unverified flip we actually care about must both be
      // scoped down to THIS holding, or a month recovered for a different
      // asset would misleadingly read as progress here.
      const previousByDate = new Map(
        (allHistory ?? []).filter((e) => e.holdingId === holding.id).map((e) => [e.userDate, e.priceSource]),
      );
      await investmentService.backfillHistoricalPrices();
      await onChanged();
      const refreshedHistory = await investmentService.getHoldingHistory({});
      setAllHistory(refreshedHistory);
      const thisHoldingHistory = refreshedHistory.filter((e) => e.holdingId === holding.id);
      const isVerified = (source?: string | null) => source === 'provider' || source === 'community';
      const newlyVerifiedMonths = thisHoldingHistory
        .filter((e) => isVerified(e.priceSource) && !isVerified(previousByDate.get(e.userDate)))
        .map((e) => formatHistoryMonthLabel(e.userDate));
      const updatedEntry = thisHoldingHistory.find((e) => e.userDate === entry.userDate);
      const stillMissing = !isVerified(updatedEntry?.priceSource);
      setProviderHistoryMessage(newlyVerifiedMonths.length > 0
        ? (t.communityPrice?.providerHistoryResult || '{count} months recovered automatically ({months}).')
          .replace('{count}', String(newlyVerifiedMonths.length)).replace('{months}', newlyVerifiedMonths.join(', '))
        : (t.communityPrice?.providerHistoryNoData || 'CoinGecko has no data for this period. You can propose the price manually.'));
      if (stillMissing) startCommunityPriceEdit(holding, entry);
    } catch (error) {
      console.error('InvestmentHoldingsPanel: provider history recovery failed', error);
      setProviderHistoryMessage(t.communityPrice?.providerHistoryError || 'Automatic recovery is unavailable. You can propose the price manually below.');
      startCommunityPriceEdit(holding, entry);
    } finally {
      setBackfillingProviderHistory(false);
      setContributingMonthKey(null);
    }
  };

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
    if (!isCurrentMonth || activeHoldings.length > 0) return;
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

  // Opens the edit form INLINE, right under this specific row (see
  // renderHoldingRow) - not the "add new" form in the Aggiungi tab, which
  // has nothing to do with editing an already-existing holding.
  const startEdit = (holding: InvestmentHoldingDto) => {
    setEditingId(holding.id);
    setIsDefaultPrefilled(false);
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

  const deleteAssetTransactions = async () => {
    if (!deleteTarget?.instrument || deletingTransactions) return;
    const instrumentId = deleteTarget.instrument.id;
    setDeletingTransactions(true);
    try {
      await investmentService.deleteTransactionsForInstrument(instrumentId);
      setAllTransactions((prev) => prev ? prev.filter((tx) => tx.instrumentId !== instrumentId) : prev);
      setDeleteTarget(null);
      await onChanged();
    } finally {
      setDeletingTransactions(false);
    }
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
      const [history, transactions, myCommunitySubmissions] = await Promise.all([
        investmentService.getHoldingHistory({}),
        investmentService.getTransactions(),
        investmentService.getMyCommunityPriceSubmissions(),
      ]);
      setAllHistory(history);
      setAllTransactions(transactions);
      setMyCommunityPrices(myCommunitySubmissions);
    } catch (error) {
      console.error('InvestmentHoldingsPanel: failed to load holding history', error);
      setAllHistory([]);
      setAllTransactions([]);
      setMyCommunityPrices([]);
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

  const startCommunityPriceEdit = (holding: InvestmentHoldingDto, entry: InvestmentHoldingHistoryDto) => {
    setCommunityPriceEditingKey(`${holding.id}-${entry.userDate}`);
    const [year, month] = entry.userDate.slice(0, 7).split('-').map(Number);
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    setCommunityPriceInputs({
      price: '',
      currency: holding.instrument?.currency ?? 'EUR',
      date: `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
    });
    setCommunityPriceConflict(null);
  };

  const submitCommunityPriceForMonth = async (holding: InvestmentHoldingDto, entry: InvestmentHoldingHistoryDto) => {
    if (submittingCommunityPrice) return;
    const rawPrice = Number(communityPriceInputs.price);
    if (!Number.isFinite(rawPrice) || rawPrice <= 0) return;

    setSubmittingCommunityPrice(true);
    try {
      const submission = await investmentService.submitCommunityPrice({
        instrument_id: entry.instrumentId,
        month_key: (communityPriceInputs.date || entry.userDate).slice(0, 7),
        reference_date: communityPriceInputs.date,
        raw_price: rawPrice,
        raw_currency: communityPriceInputs.currency || 'EUR',
      });
      setMyCommunityPrices((prev) => [...(prev ?? []), submission]);
      setCommunityPriceEditingKey(null);
    } catch (error) {
      if (error instanceof CommunityPriceConflictError) {
        setCommunityPriceConflict({ key: `${holding.id}-${entry.userDate}`, existing: error.existing });
        setCommunityPriceEditingKey(null);
      } else {
        console.error('InvestmentHoldingsPanel: failed to submit community price', error);
      }
    } finally {
      setSubmittingCommunityPrice(false);
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

  // Instrument search/selected-instrument + quantity/price/value/invested
  // fields + notes - shared by the "add new holding" form (Aggiungi tab) and
  // the "edit this holding" form (inline, right under its row - see
  // renderHoldingRow below), since both edit the exact same fields, just for
  // a new vs. an already-existing holding.
  const renderFormFields = () => (
    <>
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
    </>
  );

  // One holding's row (+ its history drawer / historical-edit block / inline
  // edit form) - shared by every list that shows holdings (the current-
  // holdings tab, the past-holdings tab, and the single unified list
  // past-month mode still uses) so there's exactly one place that knows how
  // to render a holding, not three slightly-drifting copies.
  const renderHoldingRow = (holding: InvestmentHoldingDto) => {
    const historicalEntry = historyByEntityId[holding.id];
    const isEditingHistorical = historicalEditingId === holding.id;
    const isEditingCurrent = editingId === holding.id;
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
              <span className="no-value">{(t.noValueForMonth || 'No value set for {month}').replace('{month}', new Intl.DateTimeFormat(language === 'it' ? 'it-IT' : 'en-US', { month: 'long', year: 'numeric' }).format(new Date(`${(userDate || new Date().toISOString()).slice(0, 7)}-01T00:00:00Z`)))}</span>
            )}
            {holdingShareById.get(holding.id) != null && (
              <HoldingShare theme={theme}>
                {t.shareOfCategory.replace('{percentage}', (holdingShareById.get(holding.id) as number).toFixed(1))}
              </HoldingShare>
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
                <button type="button" onClick={() => toggleHistoryDrawer(holding.id)} aria-label={t.historyTitle || 'History'}>
                  <FontAwesomeIcon icon={faClockRotateLeft} />
                </button>
                <button type="button" onClick={() => startEdit(holding)} aria-label={t.editTitle}>
                  <FontAwesomeIcon icon={faPen} />
                </button>
                <button type="button" onClick={async () => { if (!allTransactions) setAllTransactions(await investmentService.getTransactions()); setDeleteTarget(holding); }} aria-label={t.deleteButton}>
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
        {isEditingCurrent && (
          <FormSection theme={theme}>
            {renderFormFields()}
            <InlineEditActions>
              <SecondaryButton theme={theme} onClick={resetForm}>{t.cancelEdit}</SecondaryButton>
              <ModernActionButton theme={theme} onClick={handleSave} disabled={!form.instrument || saving}>
                {t.saveButton}
              </ModernActionButton>
            </InlineEditActions>
          </FormSection>
        )}
        {isCurrentMonth && expandedHistoryHoldingId === holding.id && (
          <HistoryDrawer theme={theme}>
            {loadingHistory && <span style={{ fontSize: '0.78rem', opacity: 0.6 }}>{t.historyLoading || 'Loading history…'}</span>}
            {!loadingHistory && (() => {
              // Deltas (buy/sell coloring) always need chronological order to
              // compare a month against the one right before it - computed
              // here regardless of how the list is eventually displayed.
              const chronological = (allHistory ?? [])
                .filter((entry) => entry.holdingId === holding.id)
                .sort((a, b) => a.userDate.localeCompare(b.userDate));
              if (chronological.length === 0) {
                return <span style={{ fontSize: '0.78rem', opacity: 0.6 }}>{t.historyEmptyState || 'No history recorded for this instrument.'}</span>;
              }

              const years = Array.from(new Set(chronological.map((entry) => entry.userDate.slice(0, 4)))).sort().reverse();
              const yearFilter = historyYearFilterByHoldingId[holding.id] ?? 'all';

              const enriched = chronological.map((entry, idx) => {
                // Whether this month's quantity grew (bought that month) or
                // shrank (sold) vs. the previous recorded month - the numbers
                // alone don't make that obvious at a glance, so it's called
                // out with a colored +/- delta (green/red).
                const prevQuantity = idx > 0 ? (chronological[idx - 1].quantity ?? 0) : 0;
                const quantityDelta = entry.quantity != null ? entry.quantity - prevQuantity : null;
                // Every platform that recorded a transaction for this
                // instrument within this exact calendar month - a position
                // built up from more than one broker shows all of them.
                const monthKey = entry.userDate.slice(0, 7);
                const sources = Array.from(new Set(
                  (allTransactions ?? [])
                    .filter((tx) => tx.instrumentId === entry.instrumentId && tx.tradeDate.slice(0, 7) === monthKey)
                    .map((tx) => translations.investments.importWizard?.platforms?.[tx.source] || tx.source)
                ));
                return { entry, quantityDelta, sources };
              });

              // Newest first for display (the math above already used the
              // chronological order it needed), optionally narrowed to one year.
              const displayed = enriched
                .filter(({ entry }) => yearFilter === 'all' || entry.userDate.slice(0, 4) === yearFilter)
                .reverse();

              const locale = language === 'it' ? 'it-IT' : 'en-US';

              return (
                <>
                  <CommunityExplainer theme={theme}>
                    <Users size={18} color={theme.buttonBackgroundColor} />
                    <div>
                      <strong><ShieldCheck size={13} />{t.communityPrice.explainerTitle}</strong>
                      <p>{t.communityPrice.explainerDescription}</p>
                    </div>
                  </CommunityExplainer>
                  {providerHistoryMessage && <p style={{ margin: '0.45rem 0', fontSize: '0.78rem', opacity: 0.8 }}>{providerHistoryMessage}</p>}
                  {years.length > 1 && (
                    <HistoryYearFilter theme={theme}>
                      <select
                        value={yearFilter}
                        onChange={(e) => setHistoryYearFilterByHoldingId((prev) => ({ ...prev, [holding.id]: e.target.value }))}
                      >
                        <option value="all">{t.historyAllYears || 'All years'}</option>
                        {years.map((year) => <option key={year} value={year}>{year}</option>)}
                      </select>
                    </HistoryYearFilter>
                  )}
                  {displayed.map(({ entry, quantityDelta, sources }) => {
                    if (editingHistoryMonthKey === entry.userDate) {
                      return (
                        <HistoryMonthEditRow key={entry.userDate} theme={theme}>
                          <label>{t.currentValue}<input type="number" autoFocus value={historyMonthInputs.currentValue} onChange={(e) => setHistoryMonthInputs((f) => ({ ...f, currentValue: e.target.value }))} /></label>
                          <label>{t.investedAmount}<input type="number" value={historyMonthInputs.investedAmount} onChange={(e) => setHistoryMonthInputs((f) => ({ ...f, investedAmount: e.target.value }))} /></label>
                          <label>{t.quantity}<input type="number" value={historyMonthInputs.quantity} onChange={(e) => setHistoryMonthInputs((f) => ({ ...f, quantity: e.target.value }))} /></label>
                          <div className="actions">
                            <button type="button" onClick={() => setEditingHistoryMonthKey(null)} aria-label={translations.general.cancel}><FontAwesomeIcon icon={faTimes} /></button>
                            <button type="button" onClick={() => saveHistoryMonth(holding.id, entry.userDate)} disabled={savingHistoryMonth} aria-label={t.saveButton}><FontAwesomeIcon icon={faCheck} /></button>
                          </div>
                        </HistoryMonthEditRow>
                      );
                    }

                    const communityKey = `${holding.id}-${entry.userDate}`;
                    const monthKey = entry.userDate.slice(0, 7);
                    const [entryYear, entryMonth] = monthKey.split('-').map(Number);
                    const monthLastDate = `${monthKey}-${String(new Date(Date.UTC(entryYear, entryMonth, 0)).getUTCDate()).padStart(2, '0')}`;
                    const myCommunitySubmission = (myCommunityPrices ?? [])
                      .find((s) => s.instrumentId === entry.instrumentId && s.monthKey === monthKey);
                    const communityEligible = holding.instrument !== null && COMMUNITY_PRICE_KINDS.has(holding.instrument.kind);
                    const now = new Date();
                    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                    // Provider values (CoinGecko for crypto) are already
                    // authoritative: community input is only a fallback for a
                    // month the provider could not price.
                    const hasVerifiedPrice = entry.priceSource === 'provider' || entry.priceSource === 'community';
                    const communityContributionAvailable = monthKey < currentMonthKey && !hasVerifiedPrice;

                    // A single status pill drives the top-row badge, its tone/
                    // label escalating from the plain provider-verified state
                    // to whatever is more specific about THIS user's own
                    // community submission (conflict > submission > base).
                    const conflictActive = communityPriceConflict?.key === communityKey;
                    let pillTone: 'success' | 'warning' | 'danger' = hasVerifiedPrice ? 'success' : 'warning';
                    let pillLabel = hasVerifiedPrice ? (t.verifiedBadge || 'Verified') : (t.unverifiedBadge || 'Unverified');
                    let pillTitle: string | undefined;
                    if (conflictActive) {
                      pillTone = 'danger';
                      pillLabel = t.communityPrice?.conflictShort || 'Conflict';
                      pillTitle = communityPriceConflict!.existing.status === 'verified'
                        ? (t.communityPrice?.conflictVerified || 'This month already has a community-verified price.')
                        : (t.communityPrice?.conflictPending || 'This month already has a proposal awaiting verification.');
                    } else if (myCommunitySubmission?.status === 'pending') {
                      pillTone = 'warning';
                      pillLabel = t.communityPrice?.statusPendingShort || 'Pending review';
                      pillTitle = t.communityPrice?.statusPending || 'Your price is awaiting verification';
                    } else if (myCommunitySubmission?.status === 'verified') {
                      pillTone = 'success';
                      pillLabel = t.verifiedBadge || 'Verified';
                      pillTitle = t.communityPrice?.statusVerified || 'Your price has been verified';
                    } else if (myCommunitySubmission?.status === 'rejected') {
                      pillTone = 'danger';
                      pillLabel = t.communityPrice?.statusRejectedShort || 'Rejected';
                      pillTitle = `${t.communityPrice?.statusRejected || 'Your price was not accepted'}${myCommunitySubmission.rejectionNote ? `: ${myCommunitySubmission.rejectionNote}` : ''}`;
                    }
                    const showCelebrate = myCommunitySubmission?.status === 'verified' && !celebratedCommunityPrices.has(myCommunitySubmission.id);

                    const isEditingCommunityPrice = communityPriceEditingKey === communityKey;

                    return (
                      <React.Fragment key={entry.userDate}>
                        <HistoryMonthCard theme={theme} $editing={isEditingCommunityPrice}>
                          <HistoryMonthTopRow>
                            <span className="month-label">{formatHistoryMonthLabel(entry.userDate)}</span>
                            <TopRowActions theme={theme}>
                              <StatusPill theme={theme} $tone={pillTone} title={pillTitle}>
                                {pillTone === 'success' && <ShieldCheck size={10} />}
                                {pillLabel}
                              </StatusPill>
                              {conflictActive && (
                                <DismissIconButton theme={theme} type="button" onClick={() => setCommunityPriceConflict(null)} aria-label={translations.general.cancel}>
                                  <FontAwesomeIcon icon={faTimes} />
                                </DismissIconButton>
                              )}
                              {showCelebrate && (
                                <CelebrateButton type="button" title={t.communityPrice?.statusVerifiedThanks} onClick={() => celebrateCommunityPrice(myCommunitySubmission!.id)}>
                                  {t.communityPrice?.celebrateButton || 'Celebrate 🎉'}
                                </CelebrateButton>
                              )}
                              {celebratingCommunityPriceId === myCommunitySubmission?.id && (
                                <CelebrationBurst aria-hidden="true">
                                  {['🎉', '✨', '●', '◆', '🎊'].map((piece, index) => (
                                    <i key={index} style={{ '--rotation': `${index * 72}deg` } as React.CSSProperties}>{piece}</i>
                                  ))}
                                </CelebrationBurst>
                              )}
                              {communityEligible && !conflictActive && !myCommunitySubmission && communityContributionAvailable && communityPriceEditingKey !== communityKey && (
                                <ContributeTrigger theme={theme} type="button" onClick={() => contributeForMonth(holding, entry)} disabled={backfillingProviderHistory}>
                                  <Users size={11} />
                                  {contributingMonthKey === communityKey
                                    ? (t.communityPrice?.providerHistoryLoading || 'Checking CoinGecko…')
                                    : (t.communityPrice?.contributeShort || 'Contribute')}
                                </ContributeTrigger>
                              )}
                            </TopRowActions>
                          </HistoryMonthTopRow>
                          <HistoryMonthMainRow theme={theme}>
                            <HistoryMonthValueBlock theme={theme}>
                              <strong className="value">{formatAmount(entry.currentValue ?? entry.investedAmount ?? 0)}</strong>
                              <span className="meta">
                                {entry.quantity != null && (
                                  <span>{entry.quantity.toLocaleString(locale, { maximumFractionDigits: 6 })}</span>
                                )}
                                {quantityDelta != null && Math.abs(quantityDelta) > 0.0000001 && (
                                  <HistoryQuantityDelta theme={theme} $positive={quantityDelta > 0}>
                                    {quantityDelta > 0 ? '+' : ''}{quantityDelta.toLocaleString(locale, { maximumFractionDigits: 6 })}
                                  </HistoryQuantityDelta>
                                )}
                                {sources.map((source) => <HistorySourceTag key={source} theme={theme}>{source}</HistorySourceTag>)}
                              </span>
                            </HistoryMonthValueBlock>
                            <button type="button" onClick={() => startHistoryMonthEdit(entry)} aria-label={t.editTitle}>
                              <FontAwesomeIcon icon={faPen} />
                            </button>
                          </HistoryMonthMainRow>
                        </HistoryMonthCard>
                        {communityEligible && isEditingCommunityPrice && (
                          <CommunityPriceEditRow theme={theme}>
                            <div className="form-title">
                              <Users size={11} />
                              {(t.communityPrice?.editFormTitle || 'Market price for {month}').replace('{month}', formatHistoryMonthLabel(entry.userDate))}
                            </div>
                            <div className="fields">
                              <label>{t.communityPrice?.pricePlaceholder || 'Price'}<input type="number" autoFocus value={communityPriceInputs.price} onChange={(e) => setCommunityPriceInputs((f) => ({ ...f, price: e.target.value }))} /></label>
                              <label>{t.communityPrice?.currencyLabel || 'Currency'}<input type="text" className="currency" maxLength={3} value={communityPriceInputs.currency} onChange={(e) => setCommunityPriceInputs((f) => ({ ...f, currency: e.target.value.toUpperCase() }))} placeholder="EUR" /></label>
                              <label className="date">{t.communityPrice?.dateLabel || 'Reference date'}<input type="date" min={`${monthKey}-01`} max={monthLastDate} value={communityPriceInputs.date} onChange={(e) => setCommunityPriceInputs((f) => ({ ...f, date: e.target.value }))} /></label>
                              <div className="actions">
                                <button type="button" onClick={() => setCommunityPriceEditingKey(null)} aria-label={translations.general.cancel}><FontAwesomeIcon icon={faTimes} /></button>
                                <button type="button" onClick={() => submitCommunityPriceForMonth(holding, entry)} disabled={submittingCommunityPrice || !communityPriceInputs.date} aria-label={t.saveButton}><FontAwesomeIcon icon={faCheck} /></button>
                              </div>
                            </div>
                          </CommunityPriceEditRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </>
              );
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
  };

  return (
    <Overlay theme={theme} onClick={onClose}>
      <ModalContainer theme={theme} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <ModalHeader theme={theme}>
          <ModalTitle theme={theme}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: assetAccent }}>
              <span style={{ width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9, background: `${assetAccent}22` }}>
                <AssetIcon size={17} />
              </span>
              {translations.assets[assetKey]}
            </h2>
            <p>{t.title}</p>
          </ModalTitle>
          <CloseButton theme={theme} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </CloseButton>
        </ModalHeader>

        <ModalBody theme={theme}>
          {isCurrentMonth && (
            <TabBar theme={theme}>
              <TabButton type="button" theme={theme} $active={activeTab === 'current'} onClick={() => setActiveTab('current')}>
                {t.currentTabLabel || 'Current'}{activeHoldings.length > 0 && ` (${activeHoldings.length})`}
              </TabButton>
              <TabButton type="button" theme={theme} $active={activeTab === 'add'} onClick={() => setActiveTab('add')}>
                {t.addTabLabel || 'Add'}
              </TabButton>
              {pastHoldings.length > 0 && (
                <TabButton type="button" theme={theme} $active={activeTab === 'past'} onClick={() => setActiveTab('past')}>
                  {t.pastTabLabel || 'Past'} ({pastHoldings.length})
                </TabButton>
              )}
            </TabBar>
          )}

          <BalanceReconciliationSummary theme={theme} $status={balanceReconciliation.status}>
            <div><span>{t.declaredCategoryTotal}</span><strong>{formatAmount(balanceReconciliation.declaredTotal)}</strong></div>
            <div><span>{t.detailedCategoryTotal}</span><strong>{formatAmount(balanceReconciliation.detailedTotal)}</strong></div>
            <div><span>{t.coverageLabel}</span><strong>{balanceReconciliation.coveragePercent == null ? '—' : `${balanceReconciliation.coveragePercent.toFixed(1)}%`}</strong></div>
            <div className="difference">
              <span>{balanceReconciliation.status === 'over-allocated' ? t.excessDetailLabel : t.unallocatedLabel}</span>
              <strong>{formatAmount(Math.abs(balanceReconciliation.unallocatedValue))}</strong>
            </div>
          </BalanceReconciliationSummary>

          {isCurrentMonth && totalDividendsForAssetKey > 0 && (
            <DividendsSummary theme={theme}>
              {(t.dividendsReceivedTotal || 'Dividends received: {amount}').replace('{amount}', formatAmount(totalDividendsForAssetKey))}
            </DividendsSummary>
          )}

          {!isCurrentMonth && (
            <>
              <SectionLabel theme={theme}>{t.positionsListTitle}</SectionLabel>
              {holdings.length === 0 && <EmptyState theme={theme}>{t.emptyState}</EmptyState>}
              {holdings.map(renderHoldingRow)}
            </>
          )}

          {isCurrentMonth && activeTab === 'current' && (
            <>
              {activeHoldings.length === 0 && <EmptyState theme={theme}>{t.emptyState}</EmptyState>}
              {activeHoldings.map(renderHoldingRow)}
            </>
          )}

          {isCurrentMonth && activeTab === 'past' && pastHoldings.map(renderHoldingRow)}

          {(!isCurrentMonth || activeTab === 'add') && (
          <AddSection theme={theme}>
            <SectionLabel theme={theme}>{t.addSectionTitle}</SectionLabel>

            {isCurrentMonth && (showForm ? (
              <FormSection theme={theme} style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
                <FormTitle theme={theme}>{t.addTitle}</FormTitle>
                {renderFormFields()}
              </FormSection>
            ) : (
              <AddTriggerButton type="button" theme={theme} onClick={() => setShowForm(true)} style={{ marginTop: 0 }}>
                <FontAwesomeIcon icon={faPlus} />
                {t.addTitle}
              </AddTriggerButton>
            ))}

            <AddTriggerButton type="button" theme={theme} onClick={() => setShowImportWizard(true)} data-umami-event="investment-import-opened">
              <FontAwesomeIcon icon={faFileImport} />
              {translations.investments.importWizard?.button || 'Import from CSV'}
            </AddTriggerButton>
            {isCurrentMonth && (
              <AddTriggerButton type="button" theme={theme} onClick={() => setShowReconciliation(true)} data-umami-event="investment-reconciliation-opened">
                <FontAwesomeIcon icon={faMagnifyingGlassChart} />
                {t.reconciliationButton || 'Analyze your transactions'}
              </AddTriggerButton>
            )}
            {!isCurrentMonth && (
              <DefaultInstrumentHint theme={theme}>
                {translations.investments.importWizard?.pastMonthNote
                  || 'The import always updates today\'s position and backfills history from the file\'s own dates — it doesn\'t only affect the month shown here.'}
              </DefaultInstrumentHint>
            )}
          </AddSection>
          )}
        </ModalBody>

        {isCurrentMonth && activeTab === 'add' && showForm && (
          <ModalFooter theme={theme}>
            <ModernActionButton theme={theme} onClick={handleSave} disabled={!form.instrument || saving}>
              {t.addButton}
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
      {deleteTarget && (
        <Overlay theme={theme} onClick={() => setDeleteTarget(null)}>
          <ModalContainer theme={theme} onClick={(e: React.MouseEvent) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <ModalHeader theme={theme}>
              <ModalTitle theme={theme}>
                <h2>{t.deleteTitle || 'Gestisci eliminazione'}</h2>
                <p>{deleteTarget.instrument?.symbol || deleteTarget.instrument?.name}</p>
              </ModalTitle>
              <CloseButton theme={theme} onClick={() => setDeleteTarget(null)}><FontAwesomeIcon icon={faTimes} /></CloseButton>
            </ModalHeader>
            <ModalBody theme={theme} style={{ color: theme.textColor } as React.CSSProperties}>
              <p style={{ marginTop: 0, opacity: 0.78, color: theme.textColor }}>{t.deleteDescription || 'Scegli una delle tre opzioni qui sotto — sono indipendenti tra loro.'}</p>
              <DeleteOptionButton type="button" theme={theme} onClick={async () => { if (!deleteTarget.instrument) return; await investmentService.deleteHoldingHistoryForInstrument(deleteTarget.instrument.id); setDeleteTarget(null); setAllHistory(null); await onChanged(); }}>
                <strong>{t.deleteHistoryOnly || 'Cancella lo storico mensile'}</strong>
                <span>{t.deleteHistoryOnlyDescription || 'Rimuove OGNI mese registrato per questo asset, non solo {month} — utile per ricostruirlo da zero re-importando un file. La posizione attuale (quantità e valore) resta invariata.'
                  .replace('{month}', new Intl.DateTimeFormat(language === 'it' ? 'it-IT' : 'en-US', { month: 'long', year: 'numeric' }).format(new Date(`${(userDate || new Date().toISOString()).slice(0, 7)}-01T00:00:00Z`)))}</span>
              </DeleteOptionButton>
              <DeleteOptionButton type="button" theme={theme} onClick={async () => { await handleDelete(deleteTarget.id); setDeleteTarget(null); }}>
                <strong>{t.deleteHoldingAndHistory || 'Elimina la posizione e il suo storico'}</strong>
                <span>{t.deleteHoldingAndHistoryDescription || 'Rimuove completamente questo asset dal portafoglio: quantità, valore attuale e ogni mese di storico. Le transazioni importate restano salvate, quindi puoi sempre ricrearlo re-importando lo stesso file.'}</span>
              </DeleteOptionButton>
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: `1px solid ${theme.dangerColor}44` }}>
                <DeleteOptionButton type="button" theme={theme} $danger disabled={deletingTransactions} onClick={async () => {
                  if (!transactionDeleteArmed) { setTransactionDeleteArmed(true); return; }
                  await deleteAssetTransactions();
                  setTransactionDeleteArmed(false);
                }}>
                  <strong>{deletingTransactions ? (t.deleteTransactionsLoading || 'Eliminazione…') : transactionDeleteArmed ? (t.deleteTransactionsConfirmButton || 'Conferma cancellazione definitiva') : (t.deleteTransactionsButton || 'Elimina le transazioni importate')}</strong>
                  <span>{(t.deleteTransactionsDescription || 'Rimuove definitivamente le {count} transazioni di acquisto/vendita/dividendo registrate per questo asset. Usalo solo per correggere un’importazione sbagliata — a differenza delle due opzioni sopra, la posizione attuale e il suo storico NON vengono toccati.')
                    .replace('{count}', String(allTransactions?.filter((tx) => tx.instrumentId === deleteTarget.instrument?.id).length ?? 0))}</span>
                </DeleteOptionButton>
                {transactionDeleteArmed && <p style={{ color: theme.dangerColor, fontSize: '0.76rem', margin: '0.35rem 0 0' }}>{t.deleteTransactionsConfirm || 'Premi di nuovo per confermare. Questa azione non può essere annullata.'}</p>}
              </div>
            </ModalBody>
          </ModalContainer>
        </Overlay>
      )}
    </Overlay>
  );
}
