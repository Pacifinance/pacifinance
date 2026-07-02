import React, { useState, useCallback } from 'react';
import { Select, MenuItem } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faCopy, faPaperPlane, faSpinner, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { getMuiSelectMenuProps } from './ThemedSelect';
import CategoryPicker from './CategoryPicker';
import {
  Overlay, ModalContainer, ModalHeader, ModalTitle, CloseButton,
  ModalBody, ModalFooter, RowCard, RowHeader, RowBadge, RemoveBtn,
  RowGrid, RowFieldFull, FieldLabel, FieldInput, CurrencyWrap,
  CurrencySymbolSpan, CurrencyFieldInput, NoteInput,
  ActionBar, AddButton, DuplicateButton,
  CountBadge, SubmitButton, ProgressBar, getSelectSx, InfoHint,
} from './multiInsert/SharedStyles';
import { handleAmountInput, formatAmountBlur, groupAmountsByBalanceSource } from './multiInsert/helpers';

// Re-export helpers so existing imports from this file keep working
export { handleAmountInput, formatAmountBlur, groupAmountsByBalanceSource };

/* ─── Helpers (exported for testing) ─── */
const currentDate = new Date().toISOString().split('T')[0];

export const createEmptyIncomeRow = (defaults = {}) => ({
  id: Date.now() + Math.random(),
  categoryKey: defaults.categoryKey ?? '',
  categoryValue: defaults.categoryValue ?? '',
  userCategoryId: defaults.userCategoryId ?? null,
  userCategoryLabel: defaults.userCategoryLabel ?? '',
  amount: defaults.amount ?? '',
  defaultAmount: defaults.defaultAmount ?? '',
  date: defaults.date ?? currentDate,
  note: defaults.note ?? '',
  balanceSource: defaults.balanceSource ?? '',
});

/* ─── Component ─── */
export default function MultiIncomeInsert({
  theme,
  incomesTags,
  balanceOptions,
  customCategories,
  onCreateCategory,
  onSubmitBatch,
  onClose,
  initialRow,
}) {
  const { translations } = React.useContext(LanguageContext);
  const { currencySymbol } = React.useContext(CurrencyContext);
  const t = translations.insert.incomeSection.multiInsert;

  const [rows, setRows] = useState(() => [createEmptyIncomeRow(initialRow || {})]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [defaultBalanceSource, setDefaultBalanceSource] = useState(
    initialRow?.balanceSource || ''
  );

  const hasBalanceOptions = balanceOptions && Object.keys(balanceOptions).length > 0;

  const selectSx = getSelectSx(theme);

  const updateRow = useCallback((id, field, value) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }, []);

  const updateRowFields = useCallback((id, fields) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...fields } : r));
  }, []);

  const addEmptyRow = () => {
    setRows(prev => [...prev, createEmptyIncomeRow({ balanceSource: defaultBalanceSource })]);
  };

  const duplicateLastRow = () => {
    const last = rows[rows.length - 1];
    const lastAmount = last.amount || last.defaultAmount;
    setRows(prev => [...prev, createEmptyIncomeRow({
      categoryKey: last.categoryKey,
      categoryValue: last.categoryValue,
      userCategoryId: last.userCategoryId,
      userCategoryLabel: last.userCategoryLabel,
      defaultAmount: lastAmount,
      date: last.date,
      note: last.note,
      balanceSource: last.balanceSource,
    })]);
  };

  const removeRow = (id) => {
    if (rows.length <= 1) return;
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const getValidRows = () => rows.filter(r => {
    const amt = r.amount || r.defaultAmount;
    return r.categoryKey !== '' && amt !== '' && Number(amt.replace(',', '.')) > 0;
  }).map(r => ({
    ...r,
    amount: r.amount || r.defaultAmount,
  }));

  const handleDefaultBalanceChange = (newDefault) => {
    const oldDefault = defaultBalanceSource;
    setDefaultBalanceSource(newDefault);
    setRows(prev => prev.map(r =>
      (r.balanceSource === oldDefault || r.balanceSource === '')
        ? { ...r, balanceSource: newDefault }
        : r
    ));
  };

  const handleSubmit = async () => {
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
                <RowBadge theme={theme}>{t.incomeNumber} #{idx + 1}</RowBadge>
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
                  <CategoryPicker
                    theme={theme}
                    officialTags={incomesTags}
                    customCategories={customCategories}
                    categoryType="income"
                    categoryKey={row.categoryKey}
                    userCategoryId={row.userCategoryId}
                    onSelect={({ categoryKey, categoryValue, userCategoryId, userCategoryLabel }) =>
                      updateRowFields(row.id, { categoryKey, categoryValue, userCategoryId, userCategoryLabel })
                    }
                    onCreateCategory={onCreateCategory}
                    disabled={isSubmitting}
                    placeholder={translations.insert.incomeSection.placeholderCategory}
                  />
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
                      onBlur={(e) => {
                        const val = e.target.value;
                        if (val !== '') updateRow(row.id, 'amount', formatAmountBlur(val));
                      }}
                      placeholder={row.defaultAmount || '0'}
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

                {/* Balance source per-row */}
                {hasBalanceOptions && (() => {
                  const rowDate = new Date(row.date);
                  const now = new Date();
                  const isPastMonth = rowDate.getMonth() !== now.getMonth() || rowDate.getFullYear() !== now.getFullYear();
                  return (
                    <div>
                      <FieldLabel theme={theme}>
                        {translations.insert.incomeSection.increaseWhichBalance || 'Add to'}
                      </FieldLabel>
                      {isPastMonth ? (
                        <InfoHint theme={theme}>
                          <FontAwesomeIcon icon={faInfoCircle} />
                          {t.pastMonthNoBalance}
                        </InfoHint>
                      ) : (
                        <Select
                          value={row.balanceSource}
                          onChange={(e) => updateRow(row.id, 'balanceSource', e.target.value)}
                          sx={selectSx}
                          displayEmpty
                          size="small"
                          MenuProps={getMuiSelectMenuProps(theme)}
                          disabled={isSubmitting}
                          renderValue={(v) =>
                            v === ''
                              ? (translations.general.selectAnOption)
                              : v
                          }
                        >
                          <MenuItem value="">
                            <em>{translations.general.selectAnOption}</em>
                          </MenuItem>
                          {Object.keys(balanceOptions).map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                          ))}
                        </Select>
                      )}
                    </div>
                  );
                })()}

                {/* Note - spans full width */}
                <RowFieldFull>
                  <FieldLabel theme={theme}>{translations.insert.incomeSection.tableColumns?.note || 'Note'}</FieldLabel>
                  <NoteInput
                    type="text"
                    theme={theme}
                    value={row.note}
                    onChange={(e) => updateRow(row.id, 'note', e.target.value)}
                    maxLength={64}
                    placeholder={translations.insert.incomeSection.placeholderNote}
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
          {hasBalanceOptions && (
            <Select
              value={defaultBalanceSource}
              onChange={(e) => handleDefaultBalanceChange(e.target.value)}
              sx={{
                ...selectSx,
                width: 'auto',
                minWidth: '160px',
                maxWidth: '220px',
              }}
              displayEmpty
              size="small"
              MenuProps={getMuiSelectMenuProps(theme)}
              disabled={isSubmitting}
              renderValue={(value) =>
                value === ''
                  ? (t.defaultAddTo || translations.insert.incomeSection.increaseWhichBalance || 'Add to')
                  : `${t.defaultAddTo || translations.insert.incomeSection.increaseWhichBalance}: ${value}`
              }
            >
              <MenuItem value="">
                <em>{translations.general.selectAnOption}</em>
              </MenuItem>
              {Object.keys(balanceOptions).map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          )}
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
