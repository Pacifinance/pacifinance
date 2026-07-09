import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { useDemoServices } from '../hooks/useDemoServices';
import {
  Overlay, ModalContainer, ModalHeader, ModalTitle, CloseButton, ModalBody, ModalFooter,
} from './multiInsert/SharedStyles';
import { ModernActionButton } from '../styles/MyStyled';
import type { LiquidityAssetKey, LiquidityAccountDto } from '../types/api';

interface LiquidityAccountsPanelProps {
  assetKey: LiquidityAssetKey;
  accounts: LiquidityAccountDto[];
  onClose: () => void;
  onChanged: () => Promise<void> | void;
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
  }

  input {
    padding: 0.5rem 0.6rem;
    border-radius: 8px;
    border: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0')};
    background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'white')};
    color: ${(p) => p.theme.textColor};
    font-size: 0.85rem;
    outline: none;

    &:focus { border-color: ${(p) => p.theme.buttonBackgroundColor}; }
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

export default function LiquidityAccountsPanel({ assetKey, accounts, onClose, onChanged }: LiquidityAccountsPanelProps) {
  const { theme } = useContext(ThemeContext);
  const { translations } = useContext(LanguageContext);
  const { toEUR, formatAmount } = useContext(CurrencyContext);
  const { liquidityAccountService } = useDemoServices();
  const t = translations.liquidityAccounts;

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const startEdit = (account: LiquidityAccountDto) => {
    setEditingId(account.id);
    setForm({ label: account.label, amount: String(account.currentValue) });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
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

          {accounts.map((account) => (
            <AccountRow key={account.id} theme={theme}>
              <AccountInfo theme={theme}>
                <strong>{account.label}</strong>
                <span>{formatAmount(account.currentValue)}</span>
              </AccountInfo>
              <AccountActions theme={theme}>
                <button type="button" onClick={() => startEdit(account)} aria-label={t.editTitle}>
                  <FontAwesomeIcon icon={faPen} />
                </button>
                <button type="button" onClick={() => handleDelete(account.id)} aria-label={t.deleteButton}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </AccountActions>
            </AccountRow>
          ))}

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
        </ModalBody>

        <ModalFooter theme={theme}>
          {editingId && <SecondaryButton theme={theme} onClick={resetForm}>{t.cancelEdit}</SecondaryButton>}
          <ModernActionButton theme={theme} onClick={handleSave} disabled={!form.label.trim() || form.amount === '' || saving}>
            {editingId ? t.saveButton : t.addButton}
          </ModernActionButton>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
}
