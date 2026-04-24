/**
 * DeleteTransactionModal
 *
 * Modern confirmation modal for deleting an outflow or income entry.
 * Visually consistent with PastDateBalanceChoiceModal and the multi-insert
 * modals (shared styles from ./multiInsert/SharedStyles).
 *
 * Behavior:
 *   - Shows the transaction's date and amount.
 *   - Explains clearly how the optional balance selector will impact balances:
 *       • Current-month transaction → updates current-month balance snapshot
 *       • Past-month transaction    → updates that month's historical snapshot
 *   - If the user picks no balance, the transaction is deleted without
 *     touching any balance snapshot.
 *
 * Props:
 *   - isOpen: boolean
 *   - theme
 *   - isOutflow: boolean (true = deleting an outflow, false = income)
 *   - transactionDate: ISO date string (YYYY-MM-DD)
 *   - transactionAmount: number | string (EUR)
 *   - balanceOptions: object { translatedLabel: [value, setter] }  (same shape as InsertValues `options`)
 *   - selectedOption: string (currently selected balance source label, or '')
 *   - onChangeSelectedOption: (newValue) => void
 *   - onConfirm: () => void
 *   - onCancel: () => void
 */

import React, { useContext, useMemo } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faTrash, faCalendarAlt, faCoins, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { Select, MenuItem } from '@mui/material';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import {
  Overlay, ModalContainer, ModalHeader, ModalTitle, CloseButton,
  ModalBody, ModalFooter, getSelectSx,
} from './multiInsert/SharedStyles';
import { getMuiSelectMenuProps } from './ThemedSelect';

const Subtitle = styled.p`
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)'};
`;

const InfoRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1rem;
`;

const InfoPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.75rem;
  border-radius: 10px;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  color: ${p => p.theme.textColor};
  font-size: 0.82rem;

  strong {
    font-weight: 600;
  }

  svg {
    opacity: 0.65;
    font-size: 0.8rem;
  }
`;

const InfoCallout = styled.div`
  display: flex;
  gap: 0.6rem;
  padding: 0.75rem 0.9rem;
  border-radius: 10px;
  background: ${p => p.$accent === 'past'
    ? (p.theme.mode === 'dark' ? 'rgba(255, 170, 60, 0.10)' : 'rgba(255, 150, 30, 0.10)')
    : (p.theme.mode === 'dark' ? 'rgba(7, 145, 100, 0.12)' : 'rgba(7, 145, 100, 0.08)')};
  border: 1px solid ${p => p.$accent === 'past'
    ? (p.theme.mode === 'dark' ? 'rgba(255, 170, 60, 0.3)' : 'rgba(255, 150, 30, 0.3)')
    : (p.theme.mode === 'dark' ? 'rgba(7, 145, 100, 0.3)' : 'rgba(7, 145, 100, 0.25)')};
  color: ${p => p.theme.textColor};
  font-size: 0.82rem;
  line-height: 1.5;
  margin-bottom: 0.85rem;

  svg {
    flex-shrink: 0;
    margin-top: 0.15rem;
    color: ${p => p.$accent === 'past' ? '#ff9f2e' : '#079164'};
  }
`;

const HintNote = styled.p`
  margin: 0 0 1rem 0;
  font-size: 0.78rem;
  line-height: 1.45;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)'};
  font-style: italic;
`;

const FieldLabel = styled.label`
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: ${p => p.theme.textColor};
`;

const FooterActions = styled.div`
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
  width: 100%;
`;

const SecondaryBtn = styled.button`
  padding: 0.55rem 1rem;
  border-radius: 10px;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'};
  background: transparent;
  color: ${p => p.theme.textColor};
  font-weight: 500;
  cursor: pointer;
  font-size: 0.88rem;

  &:hover {
    background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'};
  }
`;

const DangerBtn = styled.button`
  padding: 0.55rem 1.2rem;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.88rem;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  transition: filter 0.15s;

  &:hover { filter: brightness(1.08); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

/* ─── Helpers ─── */
const isPastMonth = (isoDate) => {
  if (!isoDate) return false;
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  if (d.getFullYear() < now.getFullYear()) return true;
  if (d.getFullYear() > now.getFullYear()) return false;
  return d.getMonth() < now.getMonth();
};

const formatDateHuman = (isoDate, language) => {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return String(isoDate);
  const locale = language === 'it' ? 'it-IT' : 'en-US';
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatMonthHuman = (isoDate, language) => {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return '';
  const locale = language === 'it' ? 'it-IT' : 'en-US';
  const label = d.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

/* ─── Component ─── */
export default function DeleteTransactionModal({
  isOpen,
  theme,
  isOutflow = true,
  transactionDate,
  transactionAmount,
  balanceOptions,
  selectedOption,
  onChangeSelectedOption,
  onConfirm,
  onCancel,
}) {
  const { language, translations } = useContext(LanguageContext);
  const { formatAmount } = useContext(CurrencyContext);
  const t = translations?.insert?.deleteTransaction || {};

  const past = useMemo(() => isPastMonth(transactionDate), [transactionDate]);
  const monthLabel = useMemo(() => formatMonthHuman(transactionDate, language), [transactionDate, language]);
  const dateLabel = useMemo(() => formatDateHuman(transactionDate, language), [transactionDate, language]);

  if (!isOpen) return null;

  const title = isOutflow ? t.titleOutflow : t.titleIncome;
  let explanation;
  if (past) {
    explanation = (isOutflow ? t.explanationPastOutflow : t.explanationPastIncome)
      ?.replace('{month}', monthLabel);
  } else {
    explanation = isOutflow ? t.explanationCurrentOutflow : t.explanationCurrentIncome;
  }

  const amountNumber = Number(transactionAmount) || 0;
  const selectSx = getSelectSx(theme);
  const menuProps = getMuiSelectMenuProps(theme);

  return (
    <Overlay theme={theme} onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}>
      <ModalContainer theme={theme} $maxWidth="520px">
        <ModalHeader theme={theme}>
          <ModalTitle theme={theme}>
            <h2>
              <FontAwesomeIcon icon={faTrash} style={{ marginRight: '0.5rem', opacity: 0.65 }} />
              {title}
            </h2>
          </ModalTitle>
          <CloseButton theme={theme} onClick={onCancel} aria-label="Close">
            <FontAwesomeIcon icon={faTimes} />
          </CloseButton>
        </ModalHeader>

        <ModalBody theme={theme}>
          <InfoRow>
            <InfoPill theme={theme}>
              <FontAwesomeIcon icon={faCalendarAlt} />
              <span>
                <strong>{t.transactionDateLabel}:</strong> {dateLabel}
              </span>
            </InfoPill>
            <InfoPill theme={theme}>
              <FontAwesomeIcon icon={faCoins} />
              <span>
                <strong>{t.transactionAmountLabel}:</strong> {formatAmount(amountNumber)}
              </span>
            </InfoPill>
          </InfoRow>

          <InfoCallout theme={theme} $accent={past ? 'past' : 'current'}>
            <FontAwesomeIcon icon={faInfoCircle} />
            <div>
              <Subtitle theme={theme} style={{ margin: 0 }}>{explanation}</Subtitle>
            </div>
          </InfoCallout>

          <FieldLabel theme={theme}>{t.balanceSourceLabel}</FieldLabel>
          <Select
            value={selectedOption || ''}
            onChange={(e) => onChangeSelectedOption?.(e.target.value)}
            displayEmpty
            fullWidth
            size="small"
            sx={{ ...selectSx, width: '100%' }}
            MenuProps={menuProps}
          >
            <MenuItem value="">
              <em>{t.balanceSourceNone}</em>
            </MenuItem>
            {balanceOptions && Object.keys(balanceOptions).map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>

          <HintNote theme={theme}>{t.noBalanceChange}</HintNote>
        </ModalBody>

        <ModalFooter theme={theme}>
          <FooterActions>
            <SecondaryBtn theme={theme} type="button" onClick={onCancel}>
              {t.cancel}
            </SecondaryBtn>
            <DangerBtn type="button" onClick={onConfirm}>
              <FontAwesomeIcon icon={faTrash} />
              {t.confirm}
            </DangerBtn>
          </FooterActions>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
}
