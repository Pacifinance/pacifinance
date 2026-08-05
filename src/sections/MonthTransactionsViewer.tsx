/**
 * Read-only viewer for a given month's already-recorded outflows/incomes —
 * built for the CSV import review step, so a user checking a "possible
 * duplicate" badge can see everything they've already entered that month
 * (manually or via a previous import) without abandoning the import in
 * progress. Opens as a modal layered on top of whatever's open behind it
 * (same Overlay/ModalContainer convention as every other modal in this app —
 * there's no non-blocking side-panel precedent to match instead), so closing
 * it returns the user exactly where they were.
 *
 * Deliberately NOT a wrapper around OutflowSection/IncomeSection: those mix
 * the add-transaction form, filters, and list rendering into ~30 shared
 * props with no internal seam to reuse — a fresh, minimal, list-only
 * component is safer than trying to peel those apart.
 */
import React, { useContext, useMemo, useState } from 'react';
import styled from 'styled-components';
import CloseIcon from '@mui/icons-material/Close';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { getAllOutflows, getAllIncomes } from '../utils/userDataSelectors';
import { translateTag } from '../data/tagTranslations';
import { formatImportWeekday } from '../utils/dataImport';
import {
  Overlay, ModalContainer, ModalHeader, ModalTitle, CloseButton, ModalBody,
} from '../components/multiInsert/SharedStyles';

const MonthSelect = styled.select`
  width: 100%;
  padding: 0.55rem 0.7rem;
  border-radius: 8px;
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)')};
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff')};
  color: ${(p) => p.theme.textColor};
  font-size: 0.9rem;

  option {
    background-color: ${(p) => (p.theme.mode === 'dark' ? '#1e1e2e' : '#ffffff')};
    color: ${(p) => p.theme.textColor};
  }
`;

const SummaryRow = styled.div`
  display: flex;
  gap: 0.75rem;
  font-size: 0.82rem;
  opacity: 0.75;
  color: ${(p) => p.theme.textColor};
  flex-wrap: wrap;
`;

const EntryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.8rem;
  border-radius: 10px;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc')};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#e2e8f0')};
`;

const EntryMain = styled.div`
  min-width: 0;
  flex: 1;
  color: ${(p) => p.theme.textColor};

  .notes {
    font-weight: 600;
    font-size: 0.88rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .meta {
    font-size: 0.75rem;
    opacity: 0.65;
    margin-top: 2px;
  }
`;

const EntryAmount = styled.div`
  font-weight: 700;
  font-size: 0.9rem;
  white-space: nowrap;
  color: ${(p) => (p.$isOutflow ? '#dc3545' : '#27ae60')};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  opacity: 0.6;
  font-size: 0.9rem;
`;

interface MonthTransactionsViewerProps {
  theme: any;
  userData: any;
  onClose: () => void;
  /** Index into the 13-month window (0 = current calendar month), same convention as InsertValues.tsx. */
  initialMonthIndex?: number;
}

const MONTHS_WINDOW = 13;

export default function MonthTransactionsViewer({ theme, userData, onClose, initialMonthIndex = 0 }: MonthTransactionsViewerProps) {
  const { language, translations } = useContext(LanguageContext);
  const { formatAmount } = useContext(CurrencyContext);
  const t = translations?.dataImport || {};
  const [monthIndex, setMonthIndex] = useState(Math.min(Math.max(initialMonthIndex, 0), MONTHS_WINDOW - 1));

  const monthOptions = useMemo(() => {
    const now = new Date();
    const monthNames = translations?.months || {};
    const monthKeys = ['', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    return Array.from({ length: MONTHS_WINDOW }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthNum = d.getMonth() + 1;
      return { index: i, label: `${monthNames[monthKeys[monthNum]] || monthNum} ${d.getFullYear()}` };
    });
  }, [translations]);

  const entries = useMemo(() => {
    const outflows = (getAllOutflows(userData)[monthIndex] || []).filter(Boolean).map((e) => ({ ...e, isOutflow: true }));
    const incomes = (getAllIncomes(userData)[monthIndex] || []).filter(Boolean).map((e) => ({ ...e, isOutflow: false }));
    return [...outflows, ...incomes].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [userData, monthIndex]);

  const totalOutflows = entries.filter((e) => e.isOutflow).reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalIncomes = entries.filter((e) => !e.isOutflow).reduce((sum, e) => sum + (e.amount || 0), 0);

  const categoryLabelFor = (entry) => {
    if (entry.userCategory?.label) return entry.userCategory.label;
    if (entry.categoryTag?.label) return translateTag(entry.categoryTag.label, language, entry.isOutflow ? 'expense' : 'income');
    return t.monthViewer?.uncategorized || 'Other';
  };

  const dateContextFor = (entry) => {
    const rawDate = String(entry.date || '');
    const dateOnly = rawDate.slice(0, 10);
    const weekday = formatImportWeekday(dateOnly, language);
    const hasTime = rawDate.includes('T');
    const time = hasTime
      ? new Date(rawDate).toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })
      : '';
    return [dateOnly, weekday, time].filter(Boolean).join(' · ');
  };

  return (
    <Overlay theme={theme} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <ModalContainer theme={theme} $maxWidth="560px">
        <ModalHeader theme={theme}>
          <ModalTitle theme={theme}>
            <h2>{t.monthViewer?.title || 'Transactions already recorded'}</h2>
            <p>{t.monthViewer?.subtitle || 'Check before deciding — this stays open independently of your import.'}</p>
          </ModalTitle>
          <CloseButton theme={theme} onClick={onClose} aria-label={t.monthViewer?.close || 'Close'}>
            <CloseIcon fontSize="small" />
          </CloseButton>
        </ModalHeader>
        <ModalBody theme={theme}>
          <MonthSelect theme={theme} value={monthIndex} onChange={(e) => setMonthIndex(Number(e.target.value))}>
            {monthOptions.map((opt) => (
              <option key={opt.index} value={opt.index}>{opt.label}</option>
            ))}
          </MonthSelect>

          <SummaryRow theme={theme}>
            <span style={{ color: '#dc3545' }}>{t.outflow || 'Outflow'}: {formatAmount(totalOutflows)}</span>
            <span style={{ color: '#27ae60' }}>{t.income || 'Income'}: {formatAmount(totalIncomes)}</span>
            <span>{entries.length} {t.monthViewer?.entriesLabel || 'entries'}</span>
          </SummaryRow>

          {entries.length === 0 ? (
            <EmptyState theme={theme}>{t.monthViewer?.empty || 'Nothing recorded for this month yet.'}</EmptyState>
          ) : (
            entries.map((entry, i) => (
              <EntryRow theme={theme} key={entry.id ?? i}>
                <EntryMain>
                  <div className="notes">{entry.notes || t.monthViewer?.noNote || '—'}</div>
                  <div className="meta" style={{ textTransform: 'capitalize' }}>{dateContextFor(entry)} · {categoryLabelFor(entry)}</div>
                </EntryMain>
                <EntryAmount $isOutflow={entry.isOutflow}>
                  {entry.isOutflow ? '-' : '+'}{formatAmount(entry.amount || 0)}
                </EntryAmount>
              </EntryRow>
            ))
          )}
        </ModalBody>
      </ModalContainer>
    </Overlay>
  );
}
