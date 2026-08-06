/**
 * RecurringTransactionsPanel — manage subscription/rent/salary templates.
 * A daily server cron turns each due template into a real outflow/income
 * entry (see server/src/db/models/recurringTransactions.ts); this panel is
 * pure CRUD over the templates themselves, mirroring LiquidityAccountsPanel's
 * layout and interaction pattern.
 */
import React, { useContext, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Select, MenuItem } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faTimes, faPlus, faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { useDemoServices } from '../hooks/useDemoServices';
import { sortTagsByLanguage } from '../utils/sortingUtils';
import { translateTag } from '../data/tagTranslations';
import {
  Overlay, ModalContainer, ModalHeader, ModalTitle, CloseButton, ModalBody, getSelectSx,
} from '../components/multiInsert/SharedStyles';
import { getMuiSelectMenuProps } from '../components/ThemedSelect';
import CategoryPicker from '../components/CategoryPicker';
import { ModernActionButton } from '../styles/MyStyled';
import { inferTransactionPurpose } from '../utils/transactionPurpose';

const EmptyState = styled.p`
  margin: 0.5rem 0 1rem;
  font-size: 0.85rem;
  color: ${(p) => p.theme.textColor};
  opacity: 0.55;
  text-align: center;
`;

const ModeSwitch = styled.div`
  display: inline-flex;
  border-radius: 0.6rem;
  overflow: hidden;
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)')};
  margin-bottom: 0.75rem;
`;

const ModeButton = styled.button`
  border: none;
  padding: 0.4rem 1rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  background: ${(p) => (p.$active ? (p.$income ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)') : 'transparent')};
  color: ${(p) => (p.$active ? (p.$income ? '#22c55e' : p.theme.dangerColor) : p.theme.textColor)};
  opacity: ${(p) => (p.$active ? 1 : 0.6)};
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.7rem 0.8rem;
  margin-bottom: 0.5rem;
  border-radius: 10px;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)')};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')};
  opacity: ${(p) => (p.$paused ? 0.55 : 1)};
`;

const RowInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  color: ${(p) => p.theme.textColor};

  strong { font-size: 0.88rem; }
  span { font-size: 0.75rem; opacity: 0.6; }
`;

const RowAmount = styled.span`
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: ${(p) => (p.$isExpense ? '#ef4444' : '#22c55e')};
`;

const RowActions = styled.div`
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

const FooterRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.75rem;
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

const emptyForm = { isExpense: true, purpose: 'expense', categoryKey: '', userCategoryId: null, paymentTypeKey: '', amount: '', dayOfMonth: '1', notes: '' };

export default function RecurringTransactionsPanel({
  theme, items, outflowsTags, incomesTags, paymentTags, customCategories,
  onCreateCategory, onClose, onChanged,
}) {
  const { language, translations } = useContext(LanguageContext);
  const { toEUR, fromEUR, formatAmount, currencySymbol } = useContext(CurrencyContext);
  const { recurringTransactionService } = useDemoServices();
  const t = translations?.recurringTransactions || {};

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(items.length === 0);

  const selectSx = getSelectSx(theme);
  const menuProps = getMuiSelectMenuProps(theme);

  const defaultPaymentTypeKey = useMemo(() => {
    const subscription = paymentTags.find((tag) => tag.label === 'subscription' || tag.label === 'periodic payment');
    return subscription ? subscription.index : (paymentTags.find((tag) => tag.label !== 'none')?.index ?? '');
  }, [paymentTags]);

  const categoryTags = form.isExpense ? outflowsTags : incomesTags;

  const startAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, paymentTypeKey: defaultPaymentTypeKey });
    setShowForm(true);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      isExpense: item.direction === 'outflow',
      purpose: item.purpose,
      categoryKey: item.categoryTag?.index ?? '',
      userCategoryId: item.userCategory?.id ?? null,
      paymentTypeKey: item.paymentType?.index ?? defaultPaymentTypeKey,
      amount: String(fromEUR(item.amount)),
      dayOfMonth: String(item.dayOfMonth),
      notes: item.notes || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  };

  const canSave = form.categoryKey !== '' && form.amount !== '' && Number(form.amount) > 0
    && Number(form.dayOfMonth) >= 1 && Number(form.dayOfMonth) <= 28
    && (!form.isExpense || form.paymentTypeKey !== '');

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await recurringTransactionService.saveRecurring({
        id: editingId ?? undefined,
        direction: form.isExpense ? 'outflow' : 'income',
        purpose: inferTransactionPurpose(form.isExpense ? 'outflow' : 'income', Number(form.categoryKey), form.purpose),
        amount: toEUR(Number(form.amount)),
        notes: form.notes,
        payment_type: form.isExpense ? Number(form.paymentTypeKey) : 0,
        category_tag: Number(form.categoryKey),
        user_category_id: form.userCategoryId,
        day_of_month: Number(form.dayOfMonth),
      });
      resetForm();
      await onChanged();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await recurringTransactionService.deleteRecurring({ id });
    if (editingId === id) resetForm();
    await onChanged();
  };

  const handleToggleActive = async (item) => {
    await recurringTransactionService.setRecurringActive({ id: item.id, active: !item.active });
    await onChanged();
  };

  const formatDayOfMonth = (day) => (t.everyDay || 'Every day {day}').replace('{day}', day);
  const formatNextRun = (isoDate) => {
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return '';
    const locale = language === 'it' ? 'it-IT' : 'en-US';
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <Overlay theme={theme} onClick={onClose}>
      <ModalContainer theme={theme} onClick={(e) => e.stopPropagation()}>
        <ModalHeader theme={theme}>
          <ModalTitle theme={theme}>
            <h2>{t.title || 'Transazioni ricorrenti'}</h2>
            <p>{t.subtitle || 'Abbonamenti, affitto, stipendio — inserite automaticamente ogni mese'}</p>
          </ModalTitle>
          <CloseButton theme={theme} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </CloseButton>
        </ModalHeader>

        <ModalBody theme={theme}>
          {items.length === 0 && !showForm && <EmptyState theme={theme}>{t.emptyState || 'Nessuna transazione ricorrente ancora.'}</EmptyState>}

          {items.map((item) => (
            <Row key={item.id} theme={theme} $paused={!item.active}>
              <RowInfo theme={theme}>
                <strong>
                  {translateTag(item.categoryTag?.label, language, item.direction === 'outflow' ? 'expense' : 'income')}
                  {item.userCategory?.label ? ` · ${item.userCategory.label}` : ''}
                </strong>
                <span>
                  {formatDayOfMonth(item.dayOfMonth)}
                  {' · '}
                  {item.active
                    ? `${t.nextRun || 'Prossima'}: ${formatNextRun(item.nextRunDate)}`
                    : (t.paused || 'In pausa')}
                </span>
              </RowInfo>
              <RowAmount $isExpense={item.direction === 'outflow'}>
                {item.direction === 'outflow' ? '-' : '+'}{formatAmount(item.amount)}
              </RowAmount>
              <RowActions theme={theme}>
                <button type="button" onClick={() => handleToggleActive(item)} aria-label={item.active ? (t.pause || 'Pausa') : (t.resume || 'Riprendi')}>
                  <FontAwesomeIcon icon={item.active ? faPause : faPlay} />
                </button>
                <button type="button" onClick={() => startEdit(item)} aria-label={t.editTitle || 'Modifica'}>
                  <FontAwesomeIcon icon={faPen} />
                </button>
                <button type="button" onClick={() => handleDelete(item.id)} aria-label={t.deleteButton || 'Elimina'}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </RowActions>
            </Row>
          ))}

          {showForm ? (
            <FormSection theme={theme}>
              <ModeSwitch theme={theme}>
                <ModeButton
                  type="button"
                  theme={theme}
                  $active={form.isExpense}
                  onClick={() => setForm((f) => ({ ...f, isExpense: true, purpose: 'expense', categoryKey: '', userCategoryId: null }))}
                >
                  {translations?.general?.outflows || 'Uscita'}
                </ModeButton>
                <ModeButton
                  type="button"
                  theme={theme}
                  $active={!form.isExpense}
                  $income
                  onClick={() => setForm((f) => ({ ...f, isExpense: false, purpose: 'income', categoryKey: '', userCategoryId: null }))}
                >
                  {translations?.general?.incomes || 'Entrata'}
                </ModeButton>
              </ModeSwitch>

              <FieldsGrid theme={theme}>
                <label>
                  {translations?.general?.category || 'Categoria'}
                  <CategoryPicker
                    theme={theme}
                    officialTags={categoryTags}
                    customCategories={customCategories}
                    categoryType={form.isExpense ? 'expense' : 'income'}
                    categoryKey={form.categoryKey}
                    userCategoryId={form.userCategoryId}
                    onSelect={({ categoryKey, userCategoryId }) =>
                      setForm((f) => ({
                        ...f,
                        categoryKey,
                        userCategoryId,
                        purpose: inferTransactionPurpose(f.isExpense ? 'outflow' : 'income', Number(categoryKey)),
                      }))
                    }
                    onCreateCategory={(parentIndex, label) =>
                      onCreateCategory(parentIndex, label, form.isExpense)}
                    placeholder={translations?.general?.selectAnOption || '—'}
                  />
                </label>

                {form.isExpense && (
                  <label>
                    {translations.transactionPurpose.label}
                    <Select
                      value={form.purpose}
                      onChange={(event) => setForm((current) => ({...current, purpose: event.target.value}))}
                      size="small"
                      sx={selectSx}
                      MenuProps={menuProps}
                    >
                      {['expense', 'investment', 'transfer', 'debt', 'tax', 'other'].map((purpose) => (
                        <MenuItem key={purpose} value={purpose}>{translations.transactionPurpose[purpose]}</MenuItem>
                      ))}
                    </Select>
                  </label>
                )}

                {form.isExpense && (
                  <label>
                    {translations?.general?.typology || 'Tipo pagamento'}
                    <Select
                      value={form.paymentTypeKey}
                      onChange={(e) => setForm((f) => ({ ...f, paymentTypeKey: e.target.value }))}
                      displayEmpty
                      size="small"
                      sx={selectSx}
                      MenuProps={menuProps}
                    >
                      {sortTagsByLanguage(paymentTags, language, 'payment').map((tag) => (
                        tag.label !== 'none' && (
                          <MenuItem key={tag.index} value={tag.index}>
                            {translateTag(tag.label, language, 'payment')}
                          </MenuItem>
                        )
                      ))}
                    </Select>
                  </label>
                )}

                <label>
                  {`${translations?.general?.value || 'Importo'} (${currencySymbol})`}
                  <input
                    type="number"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  />
                </label>

                <label>
                  {t.dayOfMonth || 'Giorno del mese'}
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={form.dayOfMonth}
                    onChange={(e) => setForm((f) => ({ ...f, dayOfMonth: e.target.value }))}
                  />
                </label>
              </FieldsGrid>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.72rem', color: theme.textColor, opacity: 0.65 }}>
                {translations?.insert?.outflowSection?.tableColumns?.note || 'Note'}
                <input
                  type="text"
                  maxLength={64}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  style={{
                    padding: '0.5rem 0.6rem', borderRadius: 8,
                    border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                    background: theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'white',
                    color: theme.textColor, fontSize: '0.85rem', outline: 'none',
                  }}
                />
              </label>

              <FooterRow>
                {(editingId || items.length > 0) && <SecondaryButton theme={theme} onClick={resetForm}>{translations?.general?.cancel || 'Annulla'}</SecondaryButton>}
                <ModernActionButton theme={theme} onClick={handleSave} disabled={!canSave || saving}>
                  {editingId ? (t.saveButton || 'Salva') : (t.addButton || 'Aggiungi')}
                </ModernActionButton>
              </FooterRow>
            </FormSection>
          ) : (
            <AddTriggerButton type="button" theme={theme} onClick={startAdd}>
              <FontAwesomeIcon icon={faPlus} />
              {t.addTitle || 'Nuova transazione ricorrente'}
            </AddTriggerButton>
          )}
        </ModalBody>
      </ModalContainer>
    </Overlay>
  );
}
