/**
 * DuplicateWarningModal
 *
 * Shown before a manually-entered outflow/income is submitted, when it looks
 * like it already exists in the user's history (same amount, date within a
 * day or two) — the same heuristic (`findLikelyDuplicates`) used to flag
 * rows during CSV import, applied here to the single-entry flow so manual
 * entry and file import share one consistent duplicate check regardless of
 * which method recorded the original transaction.
 *
 * Purely a confirmation: the user can still save the new entry (e.g. it's a
 * genuine second, unrelated transaction) or cancel and avoid the duplicate.
 *
 * Props:
 *   - isOpen: boolean
 *   - theme
 *   - isOutflow: boolean
 *   - existingDate, existingAmount (EUR), existingNote: the matched history entry
 *   - newDate, newAmount (EUR), newNote: the entry about to be submitted
 *   - onConfirm: () => void  (save anyway)
 *   - onCancel: () => void   (go back without saving)
 */

import React, { useContext } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExclamationTriangle, faCalendarAlt, faCoins, faStickyNote } from '@fortawesome/free-solid-svg-icons';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import {
  Overlay, ModalContainer, ModalHeader, ModalTitle, CloseButton,
  ModalBody, ModalFooter,
} from '../components/multiInsert/SharedStyles';

const Subtitle = styled.p`
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)'};
`;

const DiffRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 0.5rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const DiffBox = styled.div`
  padding: 0.75rem 0.85rem;
  border-radius: 10px;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'};
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
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

const WarningBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #d97706;
  margin-bottom: 0.75rem;
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
`;

const formatDateHuman = (isoDate, language) => {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return String(isoDate);
  const locale = language === 'it' ? 'it-IT' : 'en-US';
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function DuplicateWarningModal({
  isOpen,
  theme,
  isOutflow = true,
  existingDate,
  existingAmount,
  existingNote,
  newDate,
  newAmount,
  newNote,
  onConfirm,
  onCancel,
}) {
  const { language, translations } = useContext(LanguageContext);
  const { formatAmount } = useContext(CurrencyContext);
  const t = translations?.insert?.duplicateWarning || {};

  if (!isOpen) return null;

  const title = isOutflow ? t.titleOutflow : t.titleIncome;

  return (
    <Overlay theme={theme} onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}>
      <ModalContainer theme={theme} $maxWidth="540px">
        <ModalHeader theme={theme}>
          <ModalTitle theme={theme}>
            <h2>
              <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: '0.5rem', opacity: 0.75, color: '#d97706' }} />
              {title}
            </h2>
          </ModalTitle>
          <CloseButton theme={theme} onClick={onCancel} aria-label="Close">
            <FontAwesomeIcon icon={faTimes} />
          </CloseButton>
        </ModalHeader>

        <ModalBody theme={theme}>
          <WarningBadge>
            <FontAwesomeIcon icon={faExclamationTriangle} />
            {t.badge}
          </WarningBadge>
          <Subtitle theme={theme}>{t.subtitle}</Subtitle>

          <DiffRow>
            <DiffBox theme={theme}>
              <DiffLabel theme={theme}>{t.existingLabel}</DiffLabel>
              <DiffLine theme={theme}>
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>{formatDateHuman(existingDate, language)}</span>
              </DiffLine>
              <DiffLine theme={theme}>
                <FontAwesomeIcon icon={faCoins} />
                <strong>{formatAmount(Number(existingAmount) || 0)}</strong>
              </DiffLine>
              {existingNote && (
                <DiffLine theme={theme}>
                  <FontAwesomeIcon icon={faStickyNote} />
                  <span>{existingNote}</span>
                </DiffLine>
              )}
            </DiffBox>
            <DiffBox theme={theme}>
              <DiffLabel theme={theme}>{t.newLabel}</DiffLabel>
              <DiffLine theme={theme}>
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>{formatDateHuman(newDate, language)}</span>
              </DiffLine>
              <DiffLine theme={theme}>
                <FontAwesomeIcon icon={faCoins} />
                <strong>{formatAmount(Number(newAmount) || 0)}</strong>
              </DiffLine>
              {newNote && (
                <DiffLine theme={theme}>
                  <FontAwesomeIcon icon={faStickyNote} />
                  <span>{newNote}</span>
                </DiffLine>
              )}
            </DiffBox>
          </DiffRow>
        </ModalBody>

        <ModalFooter theme={theme}>
          <FooterActions>
            <SecondaryBtn theme={theme} type="button" onClick={onCancel}>
              {t.cancel}
            </SecondaryBtn>
            <PrimaryBtn theme={theme} type="button" onClick={onConfirm}>
              {t.confirm}
            </PrimaryBtn>
          </FooterActions>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
}
