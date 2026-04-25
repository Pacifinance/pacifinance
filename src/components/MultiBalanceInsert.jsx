import React, { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Select, MenuItem } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faCopy, faPaperPlane, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { getAssetIcon } from '../data/assetIcons';
import { getAssetColor } from '../data/assetColors';
import { getMuiSelectMenuProps } from './ThemedSelect';
import {
  slideIn, Overlay, ModalContainer, ModalHeader, ModalTitle, CloseButton,
  ModalBody, ModalFooter, RowHeader, RowBadge, RemoveBtn,
  FieldLabel, ActionBar, AddButton, DuplicateButton,
  CountBadge, SubmitButton, ProgressBar, getSelectSx,
} from './multiInsert/SharedStyles';
import { handleAmountInput, formatAmountBlur } from './multiInsert/helpers';

// Re-export helpers with Balance-specific names so existing imports keep working
export const handleAssetInput = handleAmountInput;
export const formatAssetBlur = formatAmountBlur;

/* ─── Balance-specific Styled Components ─── */
const RowCard = styled.div`
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc'};
  border: 1px solid ${p => p.$hasDuplicate
    ? '#ef4444'
    : p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e2e8f0'};
  border-radius: 14px;
  padding: 1rem;
  animation: ${slideIn} 0.25s ease-out;
  transition: border-color 0.2s, opacity 0.2s;
  position: relative;
  opacity: ${p => p.$hasDuplicate ? 0.7 : 1};
  
  @media (max-width: 600px) {
    padding: 0.75rem;
  }
`;

const MonthSelectRow = styled.div`
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  
  @media (max-width: 600px) {
    margin-bottom: 0.5rem;
  }
`;

const AssetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.5rem;
  width: 100%;

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.4rem;
  }
  
  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
`;

const AssetItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.5rem;
  border-radius: 10px;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)'};
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'};
  transition: all 0.2s ease;

  &:focus-within {
    border-color: ${p => p.$color || p.theme.buttonBackgroundColor}80;
    box-shadow: 0 0 0 2px ${p => p.$color || p.theme.buttonBackgroundColor}15;
  }
`;

const AssetLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: ${p => p.theme.textColor};
  opacity: 0.8;
`;

const AssetIconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 5px;
  background: ${p => p.$color}18;
  color: ${p => p.$color};
  font-size: 0.65rem;
  flex-shrink: 0;
`;

const CurrencyInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

const CurrencySymbolSpan = styled.span`
  position: absolute;
  left: 0.6rem;
  color: ${p => p.theme.textColor};
  opacity: 0.35;
  font-size: 0.8rem;
  font-weight: 500;
  pointer-events: none;
  z-index: 1;
`;

const CurrencyInput = styled.input`
  width: 100%;
  padding: 0.45rem 0.6rem 0.45rem 1.4rem;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};
  border-radius: 8px;
  color: ${p => p.theme.textColor};
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'white'};
  outline: none;
  transition: all 0.2s ease;
  text-align: right;
  box-sizing: border-box;

  &:focus {
    border-color: ${p => p.$color || p.theme.buttonBackgroundColor};
    box-shadow: 0 0 0 2px ${p => p.$color || p.theme.buttonBackgroundColor}15;
  }

  &::placeholder {
    color: ${p => p.theme.textColor};
    opacity: 0.3;
    font-weight: 400;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DuplicateWarning = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.9rem;
  border-radius: 10px;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)'};
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.2)'};
  color: #ef4444;
  font-size: 0.82rem;
  font-weight: 500;
  animation: ${slideIn} 0.2s ease-out;
`;

const GroupLabel = styled.div`
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${p => p.theme.textColor};
  opacity: 0.5;
  margin: 0.25rem 0;
`;

/* ─── Helpers (exported for testing) ─── */

// Asset keys are centrally defined in `src/constants/balanceSchema.ts`.
// We re-export them here to preserve the historical import path used by
// existing consumers and tests.
import {
  ASSET_KEYS as _ASSET_KEYS,
  LIQUIDITY_KEYS as _LIQUIDITY_KEYS,
  INVESTMENT_KEYS as _INVESTMENT_KEYS,
} from '../constants/balanceSchema';

export const ASSET_KEYS = _ASSET_KEYS;
export const LIQUIDITY_KEYS = _LIQUIDITY_KEYS;
export const INVESTMENT_KEYS = _INVESTMENT_KEYS;

export const createEmptyBalanceRow = (defaults = {}) => {
  const assets = {};
  for (const key of ASSET_KEYS) {
    assets[key] = defaults[key] ?? '';
  }
  return {
    id: Date.now() + Math.random(),
    month: defaults.month ?? (new Date().getMonth() + 1),
    year: defaults.year ?? new Date().getFullYear(),
    ...assets,
  };
};

/**
 * Find duplicate months in balance rows.
 * @param {Array} rows - Array of balance row objects with month and year
 * @returns {Set} Set of row IDs that are involved in duplicate months
 */
export const findDuplicateMonthRows = (rows) => {
  const monthMap = {};
  const duplicateIds = new Set();
  for (const row of rows) {
    const key = `${row.month}-${row.year}`;
    if (!monthMap[key]) {
      monthMap[key] = [row.id];
    } else {
      monthMap[key].push(row.id);
    }
  }
  for (const ids of Object.values(monthMap)) {
    if (ids.length > 1) {
      ids.forEach(id => duplicateIds.add(id));
    }
  }
  return duplicateIds;
};

/* ─── Component ─── */
export default function MultiBalanceInsert({
  theme,
  onSubmitBatch,
  onClose,
}) {
  const { translations } = React.useContext(LanguageContext);
  const { currencySymbol } = React.useContext(CurrencyContext);
  const t = translations.insert.balanceSection.multiInsert;

  const [rows, setRows] = useState([createEmptyBalanceRow()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const monthNames = useMemo(() => ({
    1: translations.months.january,
    2: translations.months.february,
    3: translations.months.march,
    4: translations.months.april,
    5: translations.months.may,
    6: translations.months.june,
    7: translations.months.july,
    8: translations.months.august,
    9: translations.months.september,
    10: translations.months.october,
    11: translations.months.november,
    12: translations.months.december,
  }), [translations]);

  const monthsArray = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      arr.push({
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        label: `${monthNames[d.getMonth() + 1]} ${d.getFullYear()}`,
        value: `${d.getMonth() + 1}-${d.getFullYear()}`
      });
    }
    return arr;
  }, [currentMonth, currentYear, monthNames]);

  const duplicateIds = useMemo(() => findDuplicateMonthRows(rows), [rows]);
  const hasDuplicates = duplicateIds.size > 0;

  const selectSx = getSelectSx(theme);

  const duplicateSelectSx = {
    ...selectSx,
    border: `2px solid #ef4444`,
    opacity: 0.6,
  };

  const updateRow = useCallback((id, field, value) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }, []);

  const addEmptyRow = () => {
    setRows(prev => [...prev, createEmptyBalanceRow()]);
  };

  const duplicateLastRow = () => {
    const last = rows[rows.length - 1];
    const assetDefaults = {};
    for (const key of ASSET_KEYS) {
      assetDefaults[key] = last[key];
    }
    setRows(prev => [...prev, createEmptyBalanceRow({
      month: last.month,
      year: last.year,
      ...assetDefaults,
    })]);
  };

  const removeRow = (id) => {
    if (rows.length <= 1) return;
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const getValidRows = () => rows.filter(r => {
    // At least one asset must have a value > 0
    return ASSET_KEYS.some(key => {
      const val = parseFloat(String(r[key]).replace(',', '.'));
      return !isNaN(val) && val > 0;
    });
  });

  const handleSubmit = async () => {
    if (hasDuplicates) return;
    const validRows = getValidRows();
    if (validRows.length === 0) return;
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

  const renderAssetInput = (row, assetKey) => {
    const IconComponent = getAssetIcon(assetKey);
    const colorData = getAssetColor(assetKey);
    const color = typeof colorData === 'object' ? colorData.primary : colorData;
    const isDuplicate = duplicateIds.has(row.id);

    return (
      <AssetItem key={assetKey} theme={theme} $color={color}>
        <AssetLabel theme={theme}>
          <AssetIconWrapper $color={color}>
            <IconComponent />
          </AssetIconWrapper>
          {translations.assets[assetKey]}
        </AssetLabel>
        <CurrencyInputWrapper>
          <CurrencySymbolSpan theme={theme}>{currencySymbol}</CurrencySymbolSpan>
          <CurrencyInput
            type="text"
            theme={theme}
            $color={color}
            value={row[assetKey]}
            onChange={(e) => updateRow(row.id, assetKey, handleAssetInput(e.target.value))}
            onBlur={(e) => updateRow(row.id, assetKey, formatAssetBlur(e.target.value))}
            placeholder="0"
            disabled={isSubmitting || isDuplicate}
          />
        </CurrencyInputWrapper>
      </AssetItem>
    );
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalContainer theme={theme} $maxWidth="900px">
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

        {hasDuplicates && (
          <DuplicateWarning theme={theme}>
            <FontAwesomeIcon icon={faExclamationTriangle} />
            {t.duplicateMonthWarning}
          </DuplicateWarning>
        )}

        <ModalBody>
          {rows.map((row, idx) => {
            const isDuplicate = duplicateIds.has(row.id);
            return (
              <RowCard key={row.id} theme={theme} $hasDuplicate={isDuplicate}>
                <RowHeader>
                  <RowBadge theme={theme}>{t.balanceNumber} #{idx + 1}</RowBadge>
                  {rows.length > 1 && !isSubmitting && (
                    <RemoveBtn theme={theme} onClick={() => removeRow(row.id)}>
                      <FontAwesomeIcon icon={faTrash} size="xs" />
                      {t.removeRow}
                    </RemoveBtn>
                  )}
                </RowHeader>

                {/* Month selector */}
                <MonthSelectRow>
                  <FieldLabel theme={theme} style={{ margin: 0 }}>{translations.general.date}</FieldLabel>
                  <Select
                    value={`${row.month}-${row.year}`}
                    onChange={(e) => {
                      const [month, year] = e.target.value.split('-').map(Number);
                      updateRow(row.id, 'month', month);
                      updateRow(row.id, 'year', year);
                    }}
                    sx={isDuplicate ? duplicateSelectSx : { ...selectSx, minWidth: '180px' }}
                    size="small"
                    MenuProps={getMuiSelectMenuProps(theme)}
                    disabled={isSubmitting}
                  >
                    {monthsArray.map((option) => (
                      <MenuItem
                        key={option.value}
                        value={option.value}
                        style={{ background: 'transparent', color: theme.textColor }}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </MonthSelectRow>

                {/* Liquidity assets */}
                <GroupLabel theme={theme}>{translations.insert.balanceSection.titleLiquidity}</GroupLabel>
                <AssetGrid>
                  {LIQUIDITY_KEYS.map(key => renderAssetInput(row, key))}
                </AssetGrid>

                {/* Investment assets */}
                <GroupLabel theme={theme} style={{ marginTop: '0.5rem' }}>{translations.insert.balanceSection.titleInvestments}</GroupLabel>
                <AssetGrid>
                  {INVESTMENT_KEYS.map(key => renderAssetInput(row, key))}
                </AssetGrid>
              </RowCard>
            );
          })}

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
            disabled={isSubmitting || validCount === 0 || hasDuplicates}
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
