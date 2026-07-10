import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { useDemoServices } from '../hooks/useDemoServices';
import InstrumentSearchAutocomplete from './InstrumentSearchAutocomplete';
import {
  Overlay, ModalContainer, ModalHeader, ModalTitle, CloseButton, ModalBody, ModalFooter,
} from './multiInsert/SharedStyles';
import { ModernActionButton } from '../styles/MyStyled';
import type { InvestmentAssetKey, InvestmentHoldingDto, InvestmentInstrumentDto } from '../types/api';

interface InvestmentHoldingsPanelProps {
  assetKey: InvestmentAssetKey;
  holdings: InvestmentHoldingDto[];
  onClose: () => void;
  onChanged: () => Promise<void> | void;
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
  color: ${(p) => p.theme.textColor};

  strong { font-size: 0.88rem; }
  span { font-size: 0.75rem; opacity: 0.6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
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

export default function InvestmentHoldingsPanel({ assetKey, holdings, onClose, onChanged }: InvestmentHoldingsPanelProps) {
  const { theme } = useContext(ThemeContext);
  const { translations } = useContext(LanguageContext);
  const { fromEUR, toEUR, formatAmount } = useContext(CurrencyContext);
  const { investmentService } = useDemoServices();
  const t = translations.investments.holdings;

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const startEdit = (holding: InvestmentHoldingDto) => {
    setEditingId(holding.id);
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
    setForm(emptyForm);
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
          {holdings.length === 0 && <EmptyState theme={theme}>{t.emptyState}</EmptyState>}

          {holdings.map((holding) => (
            <HoldingRow key={holding.id} theme={theme}>
              <HoldingInfo theme={theme}>
                <strong>{holding.instrument?.symbol ?? '—'}</strong>
                <span>{holding.instrument?.name}</span>
                <span>{formatAmount(holding.currentValue ?? holding.investedAmount ?? 0)}</span>
              </HoldingInfo>
              <HoldingActions theme={theme}>
                <button type="button" onClick={() => startEdit(holding)} aria-label={t.editTitle}>
                  <FontAwesomeIcon icon={faPen} />
                </button>
                <button type="button" onClick={() => handleDelete(holding.id)} aria-label={t.deleteButton}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </HoldingActions>
            </HoldingRow>
          ))}

          <FormSection theme={theme}>
            <FormTitle theme={theme}>{editingId ? t.editTitle : t.addTitle}</FormTitle>

            {form.instrument ? (
              <SelectedInstrument theme={theme}>
                <span>{form.instrument.symbol} — {form.instrument.name}</span>
                <button type="button" onClick={() => setForm((f) => ({ ...f, instrument: null }))}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </SelectedInstrument>
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
          </FormSection>
        </ModalBody>

        <ModalFooter theme={theme}>
          {editingId && <SecondaryButton theme={theme} onClick={resetForm}>{t.cancelEdit}</SecondaryButton>}
          <ModernActionButton theme={theme} onClick={handleSave} disabled={!form.instrument || saving}>
            {editingId ? t.saveButton : t.addButton}
          </ModernActionButton>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
}
