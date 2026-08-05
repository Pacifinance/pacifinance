import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faTimes, faPlus, faCheck } from '@fortawesome/free-solid-svg-icons';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { useDemoServices } from '../hooks/useDemoServices';
import {
  Overlay, ModalContainer, ModalHeader, ModalTitle, CloseButton, ModalBody, ModalFooter,
} from '../components/multiInsert/SharedStyles';
import { ModernActionButton } from '../styles/MyStyled';
import type { LiquidityAssetKey, LiquidityAccountDto, LiquidityAccountHistoryDto } from '../types/api';

interface LiquidityAccountsPanelProps {
  assetKey: LiquidityAssetKey;
  accounts: LiquidityAccountDto[];
  onClose: () => void;
  onChanged: () => Promise<void> | void;
  /** Whether the balance picker is on the current month (default true — the live-editing behavior). */
  isCurrentMonth?: boolean;
  /** The viewed month as "YYYY-MM-01", required when isCurrentMonth is false. */
  userDate?: string;
  /** Backfilled history rows for the viewed month, keyed by account id. */
  historyByEntityId?: Record<number, LiquidityAccountHistoryDto | undefined>;
}

interface FormState {
  label: string;
  amount: string;
}

const emptyForm: FormState = { label: '', amount: '' };

const EmptyState = styled.p`
  margin: 0.5rem 0 1rem;
  font-size: 0.85rem;
  color: ${(p) => p.theme.textColor};
  opacity: 0.55;
  text-align: center;
`;

const AccountRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.7rem 0.8rem;
  border-radius: 10px;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)')};
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')};
`;

const AccountInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  color: ${(p) => p.theme.textColor};

  strong { font-size: 0.88rem; }
  span { font-size: 0.75rem; opacity: 0.6; }
  span.no-value { font-style: italic; }
`;

const AccountActions = styled.div`
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

export default function LiquidityAccountsPanel({
  assetKey, accounts, onClose, onChanged, isCurrentMonth = true, userDate, historyByEntityId = {},
}: LiquidityAccountsPanelProps) {
  const { theme } = useContext(ThemeContext);
  const { translations } = useContext(LanguageContext);
  const { toEUR, fromEUR, formatAmount } = useContext(CurrencyContext);
  const { liquidityAccountService } = useDemoServices();
  const t = translations.liquidityAccounts;

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(accounts.length === 0);
  const [historicalEditingId, setHistoricalEditingId] = useState<number | null>(null);
  const [historicalValueInput, setHistoricalValueInput] = useState('');
  const [savingHistorical, setSavingHistorical] = useState(false);

  const startEdit = (account: LiquidityAccountDto) => {
    setEditingId(account.id);
    setShowForm(true);
    setForm({ label: account.label, amount: String(account.currentValue) });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.label.trim() || form.amount === '' || saving) return;
    setSaving(true);
    try {
      await liquidityAccountService.saveAccount({
        id: editingId ?? undefined,
        asset_key: assetKey,
        label: form.label.trim(),
        current_value: toEUR(Number(form.amount)),
      });
      resetForm();
      await onChanged();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (accountId: number) => {
    await liquidityAccountService.deleteAccount({ id: accountId });
    if (editingId === accountId) resetForm();
    await onChanged();
  };

  const startHistoricalEdit = (account: LiquidityAccountDto) => {
    const entry = historyByEntityId[account.id];
    setHistoricalEditingId(account.id);
    setHistoricalValueInput(entry?.currentValue != null ? String(fromEUR(entry.currentValue)) : '');
  };

  const saveHistoricalValue = async (accountId: number) => {
    if (historicalValueInput === '' || savingHistorical || !userDate) return;
    setSavingHistorical(true);
    try {
      await liquidityAccountService.saveAccountHistory({
        account_id: accountId,
        user_date: userDate,
        current_value: toEUR(Number(historicalValueInput)),
      });
      setHistoricalEditingId(null);
      await onChanged();
    } finally {
      setSavingHistorical(false);
    }
  };

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
          {accounts.length === 0 && <EmptyState theme={theme}>{t.emptyState}</EmptyState>}

          {accounts.map((account) => {
            const historicalEntry = historyByEntityId[account.id];
            const isEditingHistorical = historicalEditingId === account.id;
            return (
              <React.Fragment key={account.id}>
                <AccountRow theme={theme}>
                  <AccountInfo theme={theme}>
                    <strong>{account.label}</strong>
                    {isCurrentMonth ? (
                      <span>{formatAmount(account.currentValue)}</span>
                    ) : historicalEntry ? (
                      <span>{formatAmount(historicalEntry.currentValue)}</span>
                    ) : (
                      <span className="no-value">{t.noValueForMonth}</span>
                    )}
                  </AccountInfo>
                  <AccountActions theme={theme}>
                    {isCurrentMonth ? (
                      <>
                        <button type="button" onClick={() => startEdit(account)} aria-label={t.editTitle}>
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                        <button type="button" onClick={() => handleDelete(account.id)} aria-label={t.deleteButton}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={() => startHistoricalEdit(account)} aria-label={t.editTitle}>
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                    )}
                  </AccountActions>
                </AccountRow>
                {isEditingHistorical && (
                  <HistoricalEditRow theme={theme}>
                    <input
                      type="number"
                      autoFocus
                      value={historicalValueInput}
                      onChange={(e) => setHistoricalValueInput(e.target.value)}
                      placeholder={t.amount}
                    />
                    <button type="button" onClick={() => setHistoricalEditingId(null)} aria-label={translations.general.cancel}>
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                    <button
                      type="button"
                      onClick={() => saveHistoricalValue(account.id)}
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

          {isCurrentMonth && (showForm ? (
            <FormSection theme={theme}>
              <FormTitle theme={theme}>{editingId ? t.editTitle : t.addTitle}</FormTitle>

              <FieldsGrid theme={theme}>
                <label>
                  {t.label}
                  <input type="text" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
                </label>
                <label>
                  {t.amount}
                  <input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
                </label>
              </FieldsGrid>
            </FormSection>
          ) : (
            <AddTriggerButton type="button" theme={theme} onClick={() => setShowForm(true)}>
              <FontAwesomeIcon icon={faPlus} />
              {t.addTitle}
            </AddTriggerButton>
          ))}
        </ModalBody>

        {isCurrentMonth && showForm && (
          <ModalFooter theme={theme}>
            {editingId && <SecondaryButton theme={theme} onClick={resetForm}>{t.cancelEdit}</SecondaryButton>}
            <ModernActionButton theme={theme} onClick={handleSave} disabled={!form.label.trim() || form.amount === '' || saving}>
              {editingId ? t.saveButton : t.addButton}
            </ModernActionButton>
          </ModalFooter>
        )}
      </ModalContainer>
    </Overlay>
  );
}
