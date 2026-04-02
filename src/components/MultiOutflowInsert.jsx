import React, { useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Select, MenuItem } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faCopy, faPaperPlane, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { sortTagsByLanguage } from '../utils/sortingUtils';
import { translateTag } from '../data/tagTranslations';
import { getMuiSelectMenuProps } from './ThemedSelect';

/* ─── Animations ─── */
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ─── Styled Components ─── */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: ${slideIn} 0.2s ease-out;
`;

const ModalContainer = styled.div`
  background: ${p => p.theme.mode === 'dark' ? '#1a1a2e' : '#ffffff'};
  border-radius: 20px;
  width: 100%;
  max-width: 720px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  
  @media (max-width: 600px) {
    max-height: 95vh;
    border-radius: 16px;
  }
`;

const ModalHeader = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#f1f5f9'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  
  @media (max-width: 600px) {
    padding: 1rem 1.25rem;
  }
`;

const ModalTitle = styled.div`
  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: ${p => p.theme.textColor};
  }
  p {
    margin: 0.2rem 0 0;
    font-size: 0.82rem;
    color: ${p => p.theme.textColor};
    opacity: 0.5;
  }
`;

const CloseButton = styled.button`
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
  border: none;
  border-radius: 10px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${p => p.theme.textColor};
  font-size: 1.1rem;
  transition: background 0.2s;
  
  &:hover {
    background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'};
  }
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  @media (max-width: 600px) {
    padding: 0.75rem 1rem;
    gap: 0.5rem;
  }
`;

const RowCard = styled.div`
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc'};
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e2e8f0'};
  border-radius: 14px;
  padding: 1rem;
  animation: ${slideIn} 0.25s ease-out;
  transition: border-color 0.2s;
  position: relative;
  
  @media (max-width: 600px) {
    padding: 0.75rem;
  }
`;

const RowHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  
  @media (max-width: 600px) {
    margin-bottom: 0.5rem;
  }
`;

const RowBadge = styled.span`
  font-size: 0.78rem;
  font-weight: 600;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const RemoveBtn = styled.button`
  background: none;
  border: none;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,107,107,0.7)' : '#ef4444'};
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.78rem;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.2s, color 0.2s;
  
  &:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }
`;

const RowGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
`;

const RowFieldFull = styled.div`
  grid-column: 1 / -1;
`;

const FieldLabel = styled.label`
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${p => p.theme.textColor};
  opacity: 0.6;
  display: block;
  margin-bottom: 4px;
`;

const FieldInput = styled.input`
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 15px;
  min-height: 40px;
  width: 100%;
  box-sizing: border-box;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'white'};
  color: ${p => p.theme.textColor};
  transition: border-color 0.2s;
  &:focus {
    outline: none;
    border-color: ${p => p.theme.buttonBackgroundColor || '#3b82f6'};
  }
  &[type='date'] {
    -webkit-appearance: none;
    appearance: none;
    padding: 8px 6px;
  }
  @media (max-width: 600px) {
    font-size: 15px;
    &[type='date'] {
      font-size: 14px;
    }
  }
`;

const CurrencyWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const CurrencySymbolSpan = styled.span`
  position: absolute;
  left: 12px;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.4)' : '#94a3b8'};
  font-size: 0.9rem;
  font-weight: 600;
  pointer-events: none;
  z-index: 1;
`;

const CurrencyFieldInput = styled(FieldInput)`
  padding-left: 2em;
  text-align: right;
`;

const NoteInput = styled(FieldInput)`
  font-size: 0.88rem;
`;

const ActionBar = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  padding: 0.25rem 0;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 12px;
  border: 2px dashed ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : '#cbd5e1'};
  background: transparent;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : '#64748b'};
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${p => p.theme.buttonBackgroundColor || '#3b82f6'};
    color: ${p => p.theme.buttonBackgroundColor || '#3b82f6'};
    background: ${p => (p.theme.buttonBackgroundColor || '#3b82f6') + '08'};
  }
`;

const DuplicateButton = styled(AddButton)`
  border-style: dashed;
`;

const ModalFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#f1f5f9'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  gap: 0.75rem;
  
  @media (max-width: 600px) {
    padding: 0.75rem 1rem;
    flex-direction: column;
  }
`;

const CountBadge = styled.span`
  font-size: 0.85rem;
  color: ${p => p.theme.textColor};
  opacity: 0.6;
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, ${p => p.theme.buttonBackgroundColor || '#3b82f6'}, ${p => {
    const c = p.theme.buttonBackgroundColor || '#3b82f6';
    return c;
  }});
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 4px 14px ${p => (p.theme.buttonBackgroundColor || '#3b82f6') + '40'};
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px ${p => (p.theme.buttonBackgroundColor || '#3b82f6') + '60'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 600px) {
    width: 100%;
    justify-content: center;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e2e8f0'};
  border-radius: 2px;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${p => p.$progress}%;
    background: ${p => p.theme.buttonBackgroundColor || '#3b82f6'};
    border-radius: 2px;
    transition: width 0.3s ease;
  }
`;

/* ─── Helpers ─── */
const currentDate = new Date().toISOString().split('T')[0];

const createEmptyRow = (defaults = {}) => ({
  id: Date.now() + Math.random(),
  categoryKey: defaults.categoryKey ?? '',
  categoryValue: defaults.categoryValue ?? '',
  typoKey: defaults.typoKey ?? '',
  typoValue: defaults.typoValue ?? '',
  amount: defaults.amount ?? '',
  date: defaults.date ?? currentDate,
  note: defaults.note ?? '',
});

const handleAmountInput = (value) => {
  let cleaned = value
    .replace(/,/g, '.')
    .replace(/[^\d.]/g, '');
  const dotIdx = cleaned.indexOf('.');
  if (dotIdx !== -1) {
    cleaned = cleaned.substring(0, dotIdx + 1) + cleaned.substring(dotIdx + 1).replace(/\./g, '');
  }
  if (cleaned.startsWith('.')) cleaned = '0' + cleaned;
  return cleaned;
};

const formatAmountBlur = (value) => {
  const cleanedValue = value
    .replace(/,/g, '.')
    .replace(/[^\d.]/g, '')
    .replace(/^0+(\d)/, '$1');
  const num = Number(cleanedValue);
  if (!isNaN(num) && cleanedValue !== '') {
    return num.toLocaleString('it-IT', { minimumFractionDigits: 2 });
  }
  return value;
};

/* ─── Component ─── */
export default function MultiOutflowInsert({
  theme,
  OutflowsTags,
  paymentTags,
  onSubmitBatch,
  onClose,
}) {
  const { language, translations } = React.useContext(LanguageContext);
  const { currencySymbol } = React.useContext(CurrencyContext);
  const t = translations.insert.outflowSection.multiInsert;

  const [rows, setRows] = useState([createEmptyRow()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const selectSx = {
    borderRadius: '10px',
    border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
    fontSize: '0.88rem',
    background: theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'white',
    color: theme.textColor,
    minHeight: '40px',
    width: '100%',
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '& .MuiSelect-select': { padding: '7px 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    '& .MuiSvgIcon-root': { color: theme.textColor },
  };

  const updateRow = useCallback((id, field, value) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }, []);

  const addEmptyRow = () => {
    setRows(prev => [...prev, createEmptyRow()]);
  };

  const duplicateLastRow = () => {
    const last = rows[rows.length - 1];
    setRows(prev => [...prev, createEmptyRow({
      categoryKey: last.categoryKey,
      categoryValue: last.categoryValue,
      typoKey: last.typoKey,
      typoValue: last.typoValue,
      amount: '',
      date: last.date,
      note: '',
    })]);
  };

  const removeRow = (id) => {
    if (rows.length <= 1) return;
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const getValidRows = () => rows.filter(r =>
    r.categoryKey !== '' && r.typoKey !== '' && r.amount !== '' && Number(r.amount.replace(',', '.')) > 0
  );

  const handleSubmit = async () => {
    const validRows = getValidRows();
    if (validRows.length === 0) {
      return;
    }
    setIsSubmitting(true);
    setProgress(0);
    
    try {
      await onSubmitBatch(validRows, (p) => setProgress(p));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const validCount = getValidRows().length;

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalContainer theme={theme}>
        <ModalHeader theme={theme}>
          <ModalTitle theme={theme}>
            <h2>{t.title}</h2>
            <p>{t.subtitle}</p>
          </ModalTitle>
          {!isSubmitting && (
            <CloseButton theme={theme} onClick={onClose}>✕</CloseButton>
          )}
        </ModalHeader>

        {isSubmitting && <ProgressBar theme={theme} $progress={progress} />}

        <ModalBody>
          {rows.map((row, idx) => (
            <RowCard key={row.id} theme={theme}>
              <RowHeader>
                <RowBadge theme={theme}>{t.outflowNumber} #{idx + 1}</RowBadge>
                {rows.length > 1 && !isSubmitting && (
                  <RemoveBtn theme={theme} onClick={() => removeRow(row.id)}>
                    <FontAwesomeIcon icon={faTrash} size="xs" />
                    {t.removeRow}
                  </RemoveBtn>
                )}
              </RowHeader>

              <RowGrid>
                {/* Category */}
                <div>
                  <FieldLabel theme={theme}>{translations.general.category}</FieldLabel>
                  <Select
                    value={row.categoryKey}
                    onChange={(e) => {
                      const key = e.target.value;
                      const item = OutflowsTags.find(t => t.index === key);
                      if (item) {
                        updateRow(row.id, 'categoryKey', key);
                        updateRow(row.id, 'categoryValue', translateTag(item.label, language, 'expense'));
                      }
                    }}
                    sx={selectSx}
                    displayEmpty
                    size="small"
                    MenuProps={getMuiSelectMenuProps(theme)}
                    disabled={isSubmitting}
                    renderValue={(v) => v === '' ? translations.insert.outflowSection.placeholderCategory : (
                      OutflowsTags.find(t => t.index === v)
                        ? translateTag(OutflowsTags.find(t => t.index === v).label, language, 'expense')
                        : v
                    )}
                  >
                    {sortTagsByLanguage(OutflowsTags, language, 'expense').map((item) => (
                      <MenuItem key={item.index} value={item.index}>
                        {translateTag(item.label, language, 'expense')}
                      </MenuItem>
                    ))}
                  </Select>
                </div>

                {/* Payment Type */}
                <div>
                  <FieldLabel theme={theme}>{translations.general.typology}</FieldLabel>
                  <Select
                    value={row.typoKey}
                    onChange={(e) => {
                      const key = e.target.value;
                      const item = paymentTags.find(t => t.index === key);
                      if (item) {
                        updateRow(row.id, 'typoKey', key);
                        updateRow(row.id, 'typoValue', translateTag(item.label, language, 'payment'));
                      }
                    }}
                    sx={selectSx}
                    displayEmpty
                    size="small"
                    MenuProps={getMuiSelectMenuProps(theme)}
                    disabled={isSubmitting}
                    renderValue={(v) => v === '' ? translations.insert.outflowSection.placeholderTypology : (
                      paymentTags.find(t => t.index === v)
                        ? translateTag(paymentTags.find(t => t.index === v).label, language, 'payment')
                        : v
                    )}
                  >
                    {sortTagsByLanguage(paymentTags, language, 'payment').map((item) =>
                      item.label !== 'none' && (
                        <MenuItem key={item.index} value={item.index}>
                          {translateTag(item.label, language, 'payment')}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </div>

                {/* Amount */}
                <div>
                  <FieldLabel theme={theme}>{translations.general.value}</FieldLabel>
                  <CurrencyWrap>
                    <CurrencySymbolSpan theme={theme}>{currencySymbol}</CurrencySymbolSpan>
                    <CurrencyFieldInput
                      type="text"
                      theme={theme}
                      value={row.amount}
                      onChange={(e) => updateRow(row.id, 'amount', handleAmountInput(e.target.value))}
                      onBlur={(e) => updateRow(row.id, 'amount', formatAmountBlur(e.target.value))}
                      placeholder="0"
                      disabled={isSubmitting}
                    />
                  </CurrencyWrap>
                </div>

                {/* Date */}
                <div>
                  <FieldLabel theme={theme}>{translations.general.date}</FieldLabel>
                  <FieldInput
                    type="date"
                    theme={theme}
                    value={row.date}
                    onChange={(e) => updateRow(row.id, 'date', e.target.value)}
                    max={currentDate}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Note - spans two columns */}
                <RowFieldFull>
                  <FieldLabel theme={theme}>{translations.insert.outflowSection.tableColumns?.note || 'Note'}</FieldLabel>
                  <NoteInput
                    type="text"
                    theme={theme}
                    value={row.note}
                    onChange={(e) => updateRow(row.id, 'note', e.target.value)}
                    maxLength={64}
                    placeholder={translations.insert.outflowSection.placeholderNote}
                    disabled={isSubmitting}
                  />
                </RowFieldFull>
              </RowGrid>
            </RowCard>
          ))}

          {/* Add row buttons */}
          {!isSubmitting && (
            <ActionBar>
              <AddButton theme={theme} onClick={addEmptyRow}>
                <FontAwesomeIcon icon={faPlus} />
                {t.addAnother}
              </AddButton>
              {rows.length > 0 && (
                <DuplicateButton theme={theme} onClick={duplicateLastRow}>
                  <FontAwesomeIcon icon={faCopy} />
                  {t.duplicateLast}
                </DuplicateButton>
              )}
            </ActionBar>
          )}
        </ModalBody>

        <ModalFooter theme={theme}>
          <CountBadge theme={theme}>
            {validCount} / {rows.length} {translations.general.valid || 'valid'}
          </CountBadge>
          <SubmitButton
            theme={theme}
            onClick={handleSubmit}
            disabled={isSubmitting || validCount === 0}
          >
            {isSubmitting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                {t.submitting}
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faPaperPlane} />
                {t.submitAll} ({validCount})
              </>
            )}
          </SubmitButton>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
}
