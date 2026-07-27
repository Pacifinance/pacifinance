/**
 * SharedExpensesPanel — view and settle "credito verso terzi" receivables
 * created when the user paid for a group (e.g. Uber/dinner) and only their
 * own share was recorded as a real outflow (see OutflowSection's "Ho pagato
 * per il gruppo" toggle). Settling a receivable never creates an income
 * record — money coming back is a balance-only event, not real income.
 */
import React, { useContext, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { useDemoServices } from '../hooks/useDemoServices';
import {
  Overlay, ModalContainer, ModalHeader, ModalTitle, CloseButton, ModalBody,
} from './multiInsert/SharedStyles';
import {
  EmptyState, Row, RowInfo, RowAmount, RowActions, FormSection, FieldsGrid, FooterRow, SecondaryButton,
} from './SharedExpensesPanelStyles';
import { ModernActionButton } from '../styles/MyStyled';

export default function SharedExpensesPanel({ theme, items, onClose, onChanged }) {
  const { language, translations } = useContext(LanguageContext);
  const { formatAmount } = useContext(CurrencyContext);
  const { sharedExpenseService } = useDemoServices();
  const t = translations?.insert?.sharedExpensesPanel || {};

  const [settlingId, setSettlingId] = useState(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const formatDate = (isoDate) => {
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return '';
    const locale = language === 'it' ? 'it-IT' : 'en-US';
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const statusLabel = (status) => {
    if (status === 'settled') return t.statusSettled || 'Recuperato';
    if (status === 'partial') return t.statusPartial || 'Parzialmente recuperato';
    return t.statusPending || 'In attesa';
  };

  const startSettle = (item) => {
    setSettlingId(item.id);
    setSettleAmount(String((item.receivableAmount - item.settledAmount).toFixed(2)));
  };

  const cancelSettle = () => {
    setSettlingId(null);
    setSettleAmount('');
  };

  const handleConfirmSettle = async (item) => {
    const amount = Number(settleAmount);
    if (!Number.isFinite(amount) || amount <= 0 || saving) return;
    setSaving(true);
    try {
      await sharedExpenseService.settleReceivable({ id: item.id, amount });
      cancelSettle();
      await onChanged();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await sharedExpenseService.deleteReceivable({ id });
    if (settlingId === id) cancelSettle();
    await onChanged();
  };

  return (
    <Overlay theme={theme} onClick={onClose}>
      <ModalContainer theme={theme} onClick={(e) => e.stopPropagation()}>
        <ModalHeader theme={theme}>
          <ModalTitle theme={theme}>
            <h2>{t.title || 'Spese condivise'}</h2>
            <p>{t.subtitle || 'Crediti verso altri per spese anticipate di gruppo'}</p>
          </ModalTitle>
          <CloseButton theme={theme} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </CloseButton>
        </ModalHeader>

        <ModalBody theme={theme}>
          {items.length === 0 && (
            <EmptyState theme={theme}>
              {t.emptyState || 'Nessuna spesa condivisa ancora. Spuntando "Ho pagato per il gruppo" quando aggiungi una uscita, il credito comparirà qui.'}
            </EmptyState>
          )}

          {items.map((item) => {
            const outstanding = item.receivableAmount - item.settledAmount;
            return (
              <Row key={item.id} theme={theme} $paused={item.status === 'settled'}>
                <RowInfo theme={theme}>
                  <strong>{item.notes || (t.untitled || 'Spesa di gruppo')}</strong>
                  <span>
                    {formatDate(item.date)}
                    {' · '}
                    {statusLabel(item.status)}
                  </span>
                </RowInfo>
                <RowAmount theme={theme} $isExpense={item.status !== 'settled'}>
                  {formatAmount(outstanding)}
                </RowAmount>
                <RowActions theme={theme}>
                  {item.status !== 'settled' && settlingId !== item.id && (
                    <button type="button" onClick={() => startSettle(item)} aria-label={t.markReceived || 'Segna importo ricevuto'}>
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                  )}
                  <button type="button" onClick={() => handleDelete(item.id)} aria-label={t.deleteButton || 'Elimina'}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </RowActions>

                {settlingId === item.id && (
                  <FormSection theme={theme} style={{ gridColumn: '1 / -1' }}>
                    <FieldsGrid theme={theme}>
                      <label>
                        {t.amountReceivedLabel || 'Importo ricevuto'}
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={settleAmount}
                          onChange={(e) => setSettleAmount(e.target.value)}
                        />
                      </label>
                    </FieldsGrid>
                    <FooterRow>
                      <SecondaryButton theme={theme} onClick={cancelSettle}>
                        {translations?.general?.cancel || 'Annulla'}
                      </SecondaryButton>
                      <ModernActionButton theme={theme} onClick={() => handleConfirmSettle(item)} disabled={saving}>
                        {t.confirmSettle || 'Conferma'}
                      </ModernActionButton>
                    </FooterRow>
                  </FormSection>
                )}
              </Row>
            );
          })}
        </ModalBody>
      </ModalContainer>
    </Overlay>
  );
}
