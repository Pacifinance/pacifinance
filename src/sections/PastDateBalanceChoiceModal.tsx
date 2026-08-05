/**
 * PastDateBalanceChoiceModal
 *
 * Shared confirmation modal asking the user whether a past-dated outflow or
 * income should update the historical balance snapshot of the transaction's
 * month, or be recorded as a transaction only (no balance impact).
 *
 * Used by both single insert (OutflowSection/IncomeSection) and multi-insert
 * (MultiOutflowInsert/MultiIncomeInsert) flows in src/sections/InsertValues.jsx.
 *
 * Props:
 *   - isOpen: boolean
 *   - theme: styled-components theme object
 *   - isOutflow: boolean (affects copy for "subtract from" vs "add to")
 *   - rows: Array<{ date: string, amount: number, balanceSource?: string }>
 *          normalized list of past-dated rows; used for the summary.
 *   - onConfirm: (choice: 'none' | 'past-month', remember: boolean) => void
 *   - onCancel: () => void
 */

import React, { useContext, useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faHistory, faWallet, faCheck } from '@fortawesome/free-solid-svg-icons';
import { LanguageContext } from '../contexts/LanguageContext';
import {
  Overlay, ModalContainer, ModalHeader, ModalTitle, CloseButton,
  ModalBody, ModalFooter,
} from '../components/multiInsert/SharedStyles';
import { PAST_DATE_BALANCE_CHOICES } from '../hooks/usePastDateBalancePref';

/* ─── Styled ─── */
const Subtitle = styled.p`
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)'};
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
`;

const OptionCard = styled.button`
  text-align: left;
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid ${p => p.$selected
    ? (p.theme.buttonBackgroundColor || p.theme.secondaryColor)
    : (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')};
  background: ${p => p.$selected
    ? (p.theme.mode === 'dark' ? 'rgba(7, 145, 100, 0.12)' : 'rgba(7, 145, 100, 0.06)')
    : (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#ffffff')};
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  width: 100%;

  &:hover {
    border-color: ${p => p.theme.buttonBackgroundColor || p.theme.secondaryColor};
  }
`;

const OptionIcon = styled.div`
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
  color: ${p => p.theme.textColor};
  font-size: 0.95rem;
`;

const OptionContent = styled.div`
  flex: 1;
  min-width: 0;

  h3 {
    margin: 0 0 0.3rem 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: ${p => p.theme.textColor};
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  p {
    margin: 0;
    font-size: 0.8rem;
    line-height: 1.45;
    color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
  }
`;

const CheckMark = styled.span`
  color: ${p => p.theme.buttonBackgroundColor || p.theme.secondaryColor};
  font-size: 0.85rem;
`;

const RememberRow = styled.label`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.5rem 0;
  cursor: pointer;
  font-size: 0.82rem;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)'};

  input {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: ${p => p.theme.buttonBackgroundColor || p.theme.secondaryColor};
  }
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

const PrimaryBtn = styled.button`
  padding: 0.55rem 1.2rem;
  border-radius: 10px;
  border: none;
  background: ${p => p.theme.buttonBackgroundColor || p.theme.secondaryColor};
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.88rem;
  transition: filter 0.15s;

  &:hover { filter: brightness(1.08); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

/* ─── Helpers ─── */
const formatMonthList = (rows, language) => {
  const months = new Set();
  const locale = language === 'it' ? 'it-IT' : 'en-US';
  for (const r of rows) {
    const d = new Date(r.date);
    if (Number.isNaN(d.getTime())) continue;
    months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return Array.from(months)
    .sort()
    .map(key => {
      const [y, m] = key.split('-');
      const d = new Date(Number(y), Number(m) - 1, 1);
      const label = d.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
      return label.charAt(0).toUpperCase() + label.slice(1);
    })
    .join(', ');
};

/* ─── Component ─── */
export default function PastDateBalanceChoiceModal({
  isOpen,
  theme,
  isOutflow = true,
  rows = [],
  onConfirm,
  onCancel,
}) {
  const { language, translations } = useContext(LanguageContext);
  const t = translations?.insert?.pastDateBalance || {};

  const [choice, setChoice] = useState(PAST_DATE_BALANCE_CHOICES.NONE);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setChoice(PAST_DATE_BALANCE_CHOICES.NONE);
      setRemember(false);
    }
  }, [isOpen]);

  const monthsLabel = useMemo(() => formatMonthList(rows, language), [rows, language]);

  if (!isOpen) return null;

  const count = rows.length;
  const subtitle = count <= 1
    ? t.subtitleOne
    : (t.subtitleMany || '')
        .replace('{count}', count)
        .replace('{months}', monthsLabel);

  const pastMonthTitle = isOutflow ? t.optionPastMonthTitle : t.optionPastMonthTitle;
  const pastMonthDesc = t.optionPastMonthDesc;

  const handleConfirm = () => {
    onConfirm?.(choice, remember);
  };

  return (
    <Overlay theme={theme} onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}>
      <ModalContainer theme={theme} $maxWidth="560px">
        <ModalHeader theme={theme}>
          <ModalTitle theme={theme}>
            <h2>
              <FontAwesomeIcon icon={faHistory} style={{ marginRight: '0.5rem', opacity: 0.65 }} />
              {t.title}
            </h2>
          </ModalTitle>
          <CloseButton theme={theme} onClick={onCancel} aria-label="Close">
            <FontAwesomeIcon icon={faTimes} />
          </CloseButton>
        </ModalHeader>

        <ModalBody theme={theme}>
          <Subtitle theme={theme}>{subtitle}</Subtitle>

          <OptionsList>
            <OptionCard
              theme={theme}
              type="button"
              $selected={choice === PAST_DATE_BALANCE_CHOICES.NONE}
              onClick={() => setChoice(PAST_DATE_BALANCE_CHOICES.NONE)}
            >
              <OptionIcon theme={theme}>
                <FontAwesomeIcon icon={faHistory} />
              </OptionIcon>
              <OptionContent theme={theme}>
                <h3>
                  {t.optionNoneTitle}
                  {choice === PAST_DATE_BALANCE_CHOICES.NONE && (
                    <CheckMark theme={theme}><FontAwesomeIcon icon={faCheck} /></CheckMark>
                  )}
                </h3>
                <p>{t.optionNoneDesc}</p>
              </OptionContent>
            </OptionCard>

            <OptionCard
              theme={theme}
              type="button"
              $selected={choice === PAST_DATE_BALANCE_CHOICES.PAST_MONTH}
              onClick={() => setChoice(PAST_DATE_BALANCE_CHOICES.PAST_MONTH)}
            >
              <OptionIcon theme={theme}>
                <FontAwesomeIcon icon={faWallet} />
              </OptionIcon>
              <OptionContent theme={theme}>
                <h3>
                  {pastMonthTitle}
                  {choice === PAST_DATE_BALANCE_CHOICES.PAST_MONTH && (
                    <CheckMark theme={theme}><FontAwesomeIcon icon={faCheck} /></CheckMark>
                  )}
                </h3>
                <p>{pastMonthDesc}</p>
              </OptionContent>
            </OptionCard>
          </OptionsList>

          <RememberRow theme={theme}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            {t.remember}
          </RememberRow>
        </ModalBody>

        <ModalFooter theme={theme}>
          <FooterActions>
            <SecondaryBtn theme={theme} type="button" onClick={onCancel}>
              {t.cancel}
            </SecondaryBtn>
            <PrimaryBtn theme={theme} type="button" onClick={handleConfirm}>
              {t.confirm}
            </PrimaryBtn>
          </FooterActions>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
}
