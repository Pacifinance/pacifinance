/**
 * EditTransactionModal
 *
 * Confirmation modal shown when editing an outflow or income whose amount
 * and/or month changed. Asks the user to pick ONE balance source which will
 * be used to:
 *   • remove the old amount from the old month's balance
 *   • add the new amount to the new month's balance
 *
 * If the old and new dates are in the same month (just the amount changed),
 * only the delta is applied on that month.
 *
 * Visually consistent with DeleteTransactionModal / PastDateBalanceChoiceModal.
 *
 * Props:
 *   - isOpen: boolean
 *   - theme
 *   - isOutflow: boolean (true = editing an outflow, false = income)
 *   - originalDate, originalAmount: previous values (EUR for amount)
 *   - editedDate, editedAmount: new values (EUR for amount)
 *   - balanceOptions: { translatedLabel: [value, setter] }
 *   - selectedSource: string
 *   - onChangeSelectedSource: (v) => void
 *   - onConfirm: () => void
 *   - onCancel: () => void
 */

import React, { useContext, useMemo } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { computeEditDeltas, isSameMonth } from '../utils/balanceDeltaLogic';
import { faTimes, faPen, faArrowRight, faCalendarAlt, faCoins, faInfoCircle, faBalanceScale } from '@fortawesome/free-solid-svg-icons';
import { Select, MenuItem } from '@mui/material';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import {
  Overlay, ModalContainer, ModalHeader, ModalTitle, CloseButton,
  ModalBody, ModalFooter, getSelectSx,
} from '../components/multiInsert/SharedStyles';
import { getMuiSelectMenuProps } from '../components/ThemedSelect';
import { renderBalanceSourceMenuItems } from '../components/multiInsert/balanceSourceMenu';

const Subtitle = styled.p`
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)'};
`;

const DiffRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0.5rem;
  align-items: stretch;
  margin-bottom: 1rem;
`;

const DiffBox = styled.div`
  padding: 0.75rem 0.85rem;
  border-radius: 10px;
  background: ${p => p.$variant === 'new'
    ? (p.theme.mode === 'dark' ? 'rgba(7, 145, 100, 0.12)' : 'rgba(7, 145, 100, 0.08)')
    : (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)')};
  border: 1px solid ${p => p.$variant === 'new'
    ? (p.theme.mode === 'dark' ? 'rgba(7, 145, 100, 0.35)' : 'rgba(7, 145, 100, 0.3)')
    : (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')};
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DiffLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)'};
`;

const DiffLine = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: ${p => p.theme.textColor};

  svg { opacity: 0.55; font-size: 0.75rem; }
  strong { font-weight: 600; }
`;

const ArrowCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)'};
  font-size: 1.1rem;
`;

const InfoCallout = styled.div`
  display: flex;
  gap: 0.6rem;
  padding: 0.75rem 0.9rem;
  border-radius: 10px;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.07)'};
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.25)'};
  color: ${p => p.theme.textColor};
  font-size: 0.82rem;
  line-height: 1.5;
  margin-bottom: 0.85rem;

  svg {
    flex-shrink: 0;
    margin-top: 0.15rem;
    color: #3b82f6;
  }
`;

const DeltaList = styled.ul`
  margin: 0.35rem 0 0 0;
  padding-left: 1.1rem;
  font-size: 0.82rem;
  line-height: 1.55;
  color: ${p => p.theme.textColor};

  li { margin-bottom: 0.15rem; }
  code {
    font-family: inherit;
    font-weight: 600;
  }
  .neg { color: #e74c3c; }
  .pos { color: ${p => p.theme.secondaryColor}; }
`;

const FieldLabel = styled.label`
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: ${p => p.theme.textColor};
`;

const HintMuted = styled.p`
  margin: 0.4rem 0 0 0;
  font-size: 0.75rem;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)'};
  font-style: italic;
  line-height: 1.45;
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
  background: linear-gradient(135deg, #079164 0%, #0a7c5a 100%);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.88rem;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  transition: filter 0.15s;

  &:hover:not(:disabled) { filter: brightness(1.08); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

/* ─── Helpers ─── */
const formatDateHuman = (isoDate, language) => {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return String(isoDate);
  const locale = language === 'it' ? 'it-IT' : 'en-US';
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
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
export default function EditTransactionModal({
  isOpen,
  theme,
  isOutflow = true,
  originalDate,
  originalAmount,
  editedDate,
  editedAmount,
  balanceOptions,
  balanceSourceMeta = null,
  selectedSource,
  onChangeSelectedSource,
  onConfirm,
  onCancel,
}) {
  const { language, translations } = useContext(LanguageContext);
  const { formatAmount } = useContext(CurrencyContext);
  const t = translations?.insert?.editTransaction || {};

  const sameMonth = useMemo(
    () => isSameMonth(originalDate, editedDate),
    [originalDate, editedDate],
  );

  // Compute deltas via shared pure helper (tested in balanceDeltaLogic.test.js)
  const deltas = useMemo(
    () => computeEditDeltas({
      isOutflow,
      oldDate: originalDate,
      oldAmount: originalAmount,
      newDate: editedDate,
      newAmount: editedAmount,
    }),
    [originalAmount, editedAmount, originalDate, editedDate, isOutflow],
  );

  if (!isOpen) return null;

  const title = isOutflow ? t.titleOutflow : t.titleIncome;
  const selectSx = getSelectSx(theme);
  const menuProps = getMuiSelectMenuProps(theme);
  const SKIP_VALUE = '__skip__';
  const isSkip = selectedSource === SKIP_VALUE;
  // A selection is "made" when the user has picked either a source or the
  // explicit skip option. Before then, the placeholder is shown.
  const hasChoice = Boolean(selectedSource);

  return (
    <Overlay theme={theme} onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}>
      <ModalContainer theme={theme} $maxWidth="580px">
        <ModalHeader theme={theme}>
          <ModalTitle theme={theme}>
            <h2>
              <FontAwesomeIcon icon={faPen} style={{ marginRight: '0.5rem', opacity: 0.65 }} />
              {title}
            </h2>
          </ModalTitle>
          <CloseButton theme={theme} onClick={onCancel} aria-label="Close">
            <FontAwesomeIcon icon={faTimes} />
          </CloseButton>
        </ModalHeader>

        <ModalBody theme={theme}>
          <Subtitle theme={theme}>{t.subtitle}</Subtitle>

          <DiffRow>
            <DiffBox theme={theme} $variant="old">
              <DiffLabel theme={theme}>{t.before}</DiffLabel>
              <DiffLine theme={theme}>
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>{formatDateHuman(originalDate, language)}</span>
              </DiffLine>
              <DiffLine theme={theme}>
                <FontAwesomeIcon icon={faCoins} />
                <strong>{formatAmount(Number(originalAmount) || 0)}</strong>
              </DiffLine>
            </DiffBox>
            <ArrowCell theme={theme}>
              <FontAwesomeIcon icon={faArrowRight} />
            </ArrowCell>
            <DiffBox theme={theme} $variant="new">
              <DiffLabel theme={theme}>{t.after}</DiffLabel>
              <DiffLine theme={theme}>
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>{formatDateHuman(editedDate, language)}</span>
              </DiffLine>
              <DiffLine theme={theme}>
                <FontAwesomeIcon icon={faCoins} />
                <strong>{formatAmount(Number(editedAmount) || 0)}</strong>
              </DiffLine>
            </DiffBox>
          </DiffRow>

          <InfoCallout theme={theme}>
            <FontAwesomeIcon icon={faInfoCircle} />
            <div>
              <div>{sameMonth ? t.explanationSameMonth : t.explanationDifferentMonths}</div>
              <DeltaList theme={theme}>
                {deltas.map((d, i) => {
                  const sign = d.value >= 0 ? '+' : '−';
                  const cls = d.value >= 0 ? 'pos' : 'neg';
                  return (
                    <li key={i}>
                      <FontAwesomeIcon icon={faBalanceScale} style={{ marginRight: 4, opacity: 0.6 }} />
                      <strong>{formatMonthHuman(d.month, language)}</strong>
                      {': '}
                      <code className={cls}>{sign} {formatAmount(Math.abs(d.value))}</code>
                    </li>
                  );
                })}
              </DeltaList>
            </div>
          </InfoCallout>

          <FieldLabel theme={theme}>
            {t.balanceSourceLabel}
          </FieldLabel>
          <Select
            value={selectedSource || ''}
            onChange={(e) => onChangeSelectedSource?.(e.target.value)}
            displayEmpty
            fullWidth
            size="small"
            sx={{ ...selectSx, width: '100%' }}
            MenuProps={menuProps}
          >
            <MenuItem value="" disabled>
              <em>{t.balanceSourcePlaceholder}</em>
            </MenuItem>
            {renderBalanceSourceMenuItems(balanceOptions, balanceSourceMeta)}
            <MenuItem value={SKIP_VALUE}>
              <em>{t.balanceSourceNone}</em>
            </MenuItem>
          </Select>
          {!hasChoice && (
            <HintMuted theme={theme}>{t.balanceSourceRecommended}</HintMuted>
          )}
          {isSkip && (
            <HintMuted theme={theme}>{t.noBalanceChange}</HintMuted>
          )}
        </ModalBody>

        <ModalFooter theme={theme}>
          <FooterActions>
            <SecondaryBtn theme={theme} type="button" onClick={onCancel}>
              {t.cancel}
            </SecondaryBtn>
            <PrimaryBtn
              type="button"
              onClick={() => onConfirm?.(isSkip ? null : selectedSource)}
              disabled={!hasChoice}
            >
              <FontAwesomeIcon icon={faPen} />
              {t.confirm}
            </PrimaryBtn>
          </FooterActions>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
}
