import React from 'react';
import { Select, MenuItem } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCalendarAlt, faPen, faCheck, faRotateLeft, faSortUp, faSortDown, faSort, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { translateTag } from '../data/tagTranslations';
import styled from 'styled-components';
import {
  ModernActionButton,
  StyledTable,
} from '../styles/MyStyled';
import { incomeCategoryColors } from '../data/categoryColors';
import { getLighterSolidColor, getGrayscaleColor } from '../utils/colorUtils';
import ThemedSelect, { getMuiSelectMenuProps } from './ThemedSelect';
import CategoryPicker from './CategoryPicker';

const handleInputChange = (e, setterFunction) => {
  let cleanedValue = e.target.value
    .replace(/,/g, '.') // Substitute commas with dots
    .replace(/[^\d.]/g, ''); // Remove all non-numeric characters except dots

  // Remove extra dots
  const dotIndex = cleanedValue.indexOf('.');
  if (dotIndex !== -1) {
    cleanedValue =
      cleanedValue.substring(0, dotIndex + 1) +
      cleanedValue.substring(dotIndex + 1).replace(/\./g, '');
  }

  // Add leading zero if starts with a dot
  if (cleanedValue.startsWith('.')) {
    cleanedValue = '0' + cleanedValue;
  }

  setterFunction(cleanedValue);
};

const handleInputBlur = (e, setterFunction) => {
  const cleanedValue = e.target.value
    .replace(/,/g, '.') // Substitute commas with dots
    .replace(/[^\d.]/g, '') // Remove all non-numeric characters except dots
    .replace(/^0+(\d)/, '$1'); // Remove leading zeros
  const cleanedFinalValue = Number(cleanedValue).toLocaleString('it-IT', {
    minimumFractionDigits: 2,
  });
  if (!isNaN(cleanedFinalValue)) setterFunction(cleanedFinalValue);
};

/* ─── Styled Components ─── */
const SectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1.5rem;
`;

const FormCard = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  width: 100%;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
  }
  @media (max-width: 380px) {
    grid-template-columns: 1fr;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
  overflow: hidden;
`;

const FieldLabel = styled.label`
  font-size: 0.78rem;
  font-weight: 500;
  color: ${(p) => p.theme.textColor};
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const FieldInput = styled.input`
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid ${(p) => p.theme.mode === 'dark'
    ? 'rgba(255,255,255,0.1)'
    : '#e2e8f0'};
  border-radius: 10px;
  color: ${(p) => p.theme.textColor};
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 500;
  background: ${(p) => p.theme.mode === 'dark'
    ? 'rgba(255,255,255,0.04)'
    : 'white'};
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
  min-height: 42px;
  min-width: 0;

  &:focus {
    border-color: ${(p) => p.theme.buttonBackgroundColor};
    box-shadow: 0 0 0 3px ${(p) => p.theme.buttonBackgroundColor}15;
  }

  &::placeholder {
    color: ${(p) => p.theme.textColor};
    opacity: 0.3;
  }

  &[type='date'] {
    -webkit-appearance: none;
    appearance: none;
    padding: 0.6rem 0.4rem;
  }

  @media (max-width: 600px) {
    font-size: 16px;
    &[type='date'] {
      padding: 0.6rem 0.3rem;
      font-size: 14px;
    }
  }
`;

const CurrencyInputWrap = styled.div`
  position: relative;
  width: 100%;
`;

const CurrencySymbol = styled.span`
  position: absolute;
  left: 0.7rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${(p) => p.theme.textColor};
  opacity: 0.35;
  font-size: 0.85rem;
  font-weight: 500;
  pointer-events: none;
  z-index: 1;
`;

const CurrencyInput = styled(FieldInput)`
  padding-left: 1.6rem;
  text-align: right;
  font-size: 16px;
`;

const NoteArea = styled.textarea`
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid ${(p) => p.theme.mode === 'dark'
    ? 'rgba(255,255,255,0.1)'
    : '#e2e8f0'};
  border-radius: 10px;
  color: ${(p) => p.theme.textColor};
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  background: ${(p) => p.theme.mode === 'dark'
    ? 'rgba(255,255,255,0.04)'
    : 'white'};
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
  resize: none;
  min-height: 42px;
  max-height: 80px;

  &:focus {
    border-color: ${(p) => p.theme.buttonBackgroundColor};
    box-shadow: 0 0 0 3px ${(p) => p.theme.buttonBackgroundColor}15;
  }

  &::placeholder {
    color: ${(p) => p.theme.textColor};
    opacity: 0.3;
  }
`;

const FormFooter = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  width: 100%;
  padding-top: 0.25rem;
`;

const TableSection = styled.div`
  width: 100%;
  border: 1px solid ${(p) => p.theme.mode === 'dark'
    ? 'rgba(255,255,255,0.07)'
    : '#e8ecf1'};
  border-radius: 14px;
  overflow: hidden;
  background: ${(p) => p.theme.mode === 'dark'
    ? p.theme.backgroundColor
    : '#fff'};
`;

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid ${(p) => p.theme.mode === 'dark'
    ? 'rgba(255,255,255,0.06)'
    : '#e8ecf1'};
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const TableTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${(p) => p.theme.textColor};
  margin: 0;
`;



const TableScroll = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
`;

const ActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  cursor: ${(p) => p.disabled ? 'not-allowed' : 'pointer'};
  font-size: 0.75rem;
  transition: all 0.15s ease;
  opacity: ${(p) => p.disabled ? 0.4 : 1};

  &.delete {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    &:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.2);
    }
  }
  &.edit {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
    &:hover:not(:disabled) {
      background: rgba(59, 130, 246, 0.2);
    }
  }
  &.cancel {
    background: rgba(245, 158, 11, 0.1);
    color: #d97706;
    &:hover:not(:disabled) {
      background: rgba(245, 158, 11, 0.2);
    }
  }
`;

const InlineInput = styled.input`
  width: 100%;
  min-width: 50px;
  padding: 4px 6px;
  border: 1.5px solid ${p => p.theme.mode === 'dark' ? 'rgba(59,130,246,0.4)' : 'rgba(59,130,246,0.3)'};
  border-radius: 6px;
  font-size: 0.82rem;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#f8fafc'};
  color: ${p => p.theme.textColor};
  box-sizing: border-box;
  outline: none;
  font-family: inherit;
  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59,130,246,0.15);
  }
`;

const TotalRow = styled.tr`
  font-weight: 600;
  
  &.filtered {
    background: rgba(16, 185, 129, 0.12) !important;
    td { color: #059669; }
  }
  &.grand {
    background: rgba(16, 185, 129, 0.2) !important;
    td { color: #047857; font-weight: 700; }
  }
`;

const PercentBadge = styled.span`
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 1px 6px;
  border-radius: 10px;
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
`;

export default function IncomeSection({
  theme,
  isHidden,
  categoryIncome,
  setCategoryIncome,
  income,
  setIncome,
  incomeDate,
  setIncomeDate,
  noteIncomeAreaValue,
  setNoteIncomeAreaValue,
  incomesTags,
  customCategories = [],
  onCreateCategory,
  selectedIncomesMonth,
  setSelectedIncomesMonth,
  incomeMonthOptions,
  allIncomesAdds,
  selectedIncomeMonthKey,
  incomeCategoryFilter,
  setIncomeCategoryFilter,
  incomeNoteFilter,
  setIncomeNoteFilter,
  onAddIncome,
  onDeleteIncome,
  onSaveEdit,
  // New props for balance selection
  selectedOption,
  setSelectedOption,
  balanceOptions,
  incomeDateFilterStart,
  setIncomeDateFilterStart,
  incomeDateFilterEnd,
  setIncomeDateFilterEnd,
  onOpenMultiInsert,
}) {
  const { language, translations } = React.useContext(LanguageContext);
  const { currencySymbol, formatNumber, fromEUR } = React.useContext(CurrencyContext);
  const _pad = (n: number) => String(n).padStart(2, '0');
  const _now = new Date();
  const currentDate = `${_now.getFullYear()}-${_pad(_now.getMonth() + 1)}-${_pad(_now.getDate())}`;

  // Sorting state
  const [sortColumn, setSortColumn] = React.useState(null);
  const [sortDirection, setSortDirection] = React.useState('asc');

  // Inline editing state
  const [editingAdd, setEditingAdd] = React.useState(null);
  const [editValues, setEditValues] = React.useState({});
  const [isSaving, setIsSaving] = React.useState(false);

  const isEditingRow = (add) => {
    if (!editingAdd) return false;
    return add === editingAdd || (
      add.date === editingAdd.date &&
      add.amount === editingAdd.amount &&
      add.categoryTag?.index === editingAdd.categoryTag?.index &&
      (add.userCategory?.id ?? null) === (editingAdd.userCategory?.id ?? null) &&
      add.notes === editingAdd.notes
    );
  };

  const startEditing = (add) => {
    const displayAmount = fromEUR(add.amount ?? 0);
    setEditingAdd(add);
    setEditValues({
      categoryKey: add.categoryTag?.index ?? "",
      categoryValue: translateTag(add.categoryTag?.label, language, 'income'),
      parentValue: translateTag(add.categoryTag?.label, language, 'income'),
      userCategoryId: add.userCategory?.id ?? null,
      userCategoryLabel: add.userCategory?.label ?? null,
      amount: String(parseFloat(displayAmount.toFixed(2))),
      note: add.notes || "",
      date: add.date ? new Date(add.date).toISOString().split('T')[0] : "",
    });
  };

  const handleSaveInline = async () => {
    if (!editValues.categoryKey && editValues.categoryKey !== 0) return;
    if (!editValues.amount || Number(editValues.amount) === 0) return;
    setIsSaving(true);
    try {
      const success = await onSaveEdit(editingAdd, editValues);
      if (success) {
        setEditingAdd(null);
        setEditValues({});
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelInline = () => {
    setEditingAdd(null);
    setEditValues({});
  };

  const handleEditAmountChange = (e) => {
    let cleaned = e.target.value.replace(/,/g, '.').replace(/[^\d.]/g, '');
    const dotIdx = cleaned.indexOf('.');
    if (dotIdx !== -1) {
      cleaned = cleaned.substring(0, dotIdx + 1) + cleaned.substring(dotIdx + 1).replace(/\./g, '');
    }
    if (cleaned.startsWith('.')) cleaned = '0' + cleaned;
    setEditValues(prev => ({ ...prev, amount: cleaned }));
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleIncomeDateChange = (event) => {
    const inputDate = event.target.value;
    setIncomeDate(inputDate);
  };

  const handleIncomesMonthChange = (event) => {
    setSelectedIncomesMonth(event.target.value);
  };

  function getGradientForCategory(baseColor) {
    if (!baseColor)
      return 'linear-gradient(90deg, rgba(220,220,220,0.10) 0%, rgba(240,240,240,0.18) 100%)';
    const match = baseColor.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
    );
    if (match) {
      const r = match[1],
        g = match[2],
        b = match[3];
      return `linear-gradient(90deg, rgba(${r},${g},${b},0.15) 0%, rgba(${r},${g},${b},0.25) 100%)`;
    }
    return baseColor;
  }

  function getAddsForMonth(allAdds, selectedMonthKey) {
    if (!Array.isArray(allAdds)) return [];
    for (let i = 0; i < allAdds.length; i++) {
      const arr = allAdds[i];
      if (Array.isArray(arr) && arr.length > 0) {
        const d = new Date(arr[0].date);
        const key = `${d.getMonth() + 1}-${d.getFullYear()}`;
        if (key === selectedMonthKey) return arr;
      }
    }
    return [];
  }

  function getTotals(filteredAdds, allAdds) {
    const totalFiltered = filteredAdds.reduce(
      (sum, add) => sum + (add.amount || 0),
      0,
    );
    const totalAll = (Array.isArray(allAdds) ? allAdds : []).reduce(
      (sum, add) => sum + (add.amount || 0),
      0,
    );
    return {
      totalFiltered,
      totalAll,
    };
  }

  function getDateRangeForMonth(monthOption) {
    if (!monthOption) return { min: '', max: '' };
    const year = monthOption.year;
    const month = monthOption.month;
    const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDayNum = new Date(year, month, 0).getDate();
    const lastDay = `${year}-${String(month).padStart(2, '0')}-${String(lastDayNum).padStart(2, '0')}`;
    return { min: firstDay, max: lastDay };
  }

  const getSortIcon = (column) => {
    if (sortColumn !== column) return <FontAwesomeIcon icon={faSort} style={{ marginLeft: 4, opacity: 0.5, fontSize: '0.8em' }} />;
    return sortDirection === 'asc' 
      ? <FontAwesomeIcon icon={faSortUp} style={{ marginLeft: 4, fontSize: '0.9em' }} />
      : <FontAwesomeIcon icon={faSortDown} style={{ marginLeft: 4, fontSize: '0.9em' }} />;
  };

  function renderTableHeader() {
    const { min, max } = getDateRangeForMonth(incomeMonthOptions[selectedIncomesMonth]);
    return (
      <tr>
        <th>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span
              onClick={() => handleSort('category')}
              style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center' }}
            >
              {translations.insert.incomeSection.tableColumns.category}
              {getSortIcon('category')}
            </span>
            <ThemedSelect
              compact
              value={incomeCategoryFilter}
              onChange={(e) => setIncomeCategoryFilter(e.target.value)}
              style={{ minWidth: 100 }}
            >
              <option value="">{translations.general.all}</option>
              {incomesTags.map((item) => (
                <option key={item.index} value={translateTag(item.label, language, 'income')}>
                  {translateTag(item.label, language, 'income')}
                </option>
              ))}
            </ThemedSelect>
          </div>
        </th>
        <th style={{ minWidth: 100 }}>
          <span
            onClick={() => handleSort('amount')}
            style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {translations.general.value}
            {getSortIcon('amount')}
          </span>
        </th>
        <th style={{ minWidth: 120 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span
              onClick={() => handleSort('note')}
              style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center' }}
            >
              {translations.insert.incomeSection.tableColumns.note}
              {getSortIcon('note')}
            </span>
            <input
              type="text"
              placeholder={translations.general.clearFilter || 'Filtra...'}
              value={incomeNoteFilter}
              onChange={(e) => setIncomeNoteFilter(e.target.value)}
              style={{ width: 100 }}
            />
          </div>
        </th>
        <th style={{ minWidth: 180 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span
              onClick={() => handleSort('date')}
              style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center' }}
            >
              <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: 4 }} />
              {translations.general.date || 'Data'}
              {getSortIcon('date')}
            </span>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <input
                type="date"
                value={incomeDateFilterStart || ''}
                onChange={(e) => setIncomeDateFilterStart(e.target.value)}
                min={min}
                max={max}
                style={{ width: 110 }}
              />
              <span style={{ fontSize: '0.75em', opacity: 0.7 }}>-</span>
              <input
                type="date"
                value={incomeDateFilterEnd || ''}
                onChange={(e) => setIncomeDateFilterEnd(e.target.value)}
                min={min}
                max={max}
                style={{ width: 110 }}
              />
            </div>
            {(incomeDateFilterStart || incomeDateFilterEnd) && (
              <button
                onClick={() => { setIncomeDateFilterStart(''); setIncomeDateFilterEnd(''); }}
                style={{
                  color: '#fff', background: 'rgba(46,204,113,0.6)', border: 'none',
                  borderRadius: 4, padding: '2px 8px', fontSize: '0.7em', cursor: 'pointer',
                }}
              >
                {translations.general.clearFilter || 'Clear'}
              </button>
            )}
          </div>
        </th>
        <th></th>
      </tr>
    );
  }

  function renderIncomeItems(chosenIncomesToShow) {
    let filtered = chosenIncomesToShow.filter((add) => {
      const addDate = new Date(add.date).toISOString().slice(0, 10);
      let dateMatch = true;
      if (incomeDateFilterStart && incomeDateFilterEnd) {
        dateMatch = addDate >= incomeDateFilterStart && addDate <= incomeDateFilterEnd;
      } else if (incomeDateFilterStart) {
        dateMatch = addDate >= incomeDateFilterStart;
      } else if (incomeDateFilterEnd) {
        dateMatch = addDate <= incomeDateFilterEnd;
      }
      return (
        (!incomeCategoryFilter ||
          translateTag(add.categoryTag?.label, language, 'income') === incomeCategoryFilter) &&
        (!incomeNoteFilter ||
          (add.notes &&
            add.notes.toLowerCase().includes(incomeNoteFilter.toLowerCase()))) &&
        dateMatch
      );
    });

    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aVal, bVal;
        switch (sortColumn) {
          case 'category':
            aVal = translateTag(a.categoryTag?.label, language, 'income');
            bVal = translateTag(b.categoryTag?.label, language, 'income');
            break;
          case 'amount':
            aVal = a.amount || 0;
            bVal = b.amount || 0;
            break;
          case 'note':
            aVal = a.notes || '';
            bVal = b.notes || '';
            break;
          case 'date':
            aVal = new Date(a.date).getTime();
            bVal = new Date(b.date).getTime();
            break;
          default:
            return 0;
        }
        if (typeof aVal === 'string') {
          const cmp = aVal.localeCompare(bVal);
          return sortDirection === 'asc' ? cmp : -cmp;
        }
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }

    const totals = getTotals(filtered, chosenIncomesToShow);
    const filtersActive =
      incomeCategoryFilter || incomeNoteFilter || incomeDateFilterStart || incomeDateFilterEnd;
    const rows = [
      ...filtered.map((add, index) => {
        let colorKey = undefined;
        if (add.categoryTag && add.categoryTag.key) {
          colorKey = add.categoryTag.key;
        } else if (add.categoryTag && add.categoryTag.label) {
          colorKey = add.categoryTag.label;
        } else if (add.categoryTag && add.categoryTag.translations) {
          const keys = Object.keys(add.categoryTag.translations);
          if (keys.length > 0) colorKey = add.categoryTag.translations[keys[0]];
        }
        const rawColor = incomeCategoryColors[colorKey] || 'rgba(181, 222, 209, 0.35)';
        const processedColor = isHidden 
          ? getGrayscaleColor(rawColor, index)
          : getLighterSolidColor(rawColor);
        const rowGradient = getGradientForCategory(processedColor);

        // Inline editing mode for this row
        if (isEditingRow(add)) {
          return (
            <tr key={index} style={{ background: 'rgba(59, 130, 246, 0.08)', outline: '2px solid rgba(59, 130, 246, 0.25)' }}>
              <td>
                <div style={{ minWidth: 180 }}>
                  <CategoryPicker
                    theme={theme}
                    officialTags={incomesTags}
                    customCategories={customCategories}
                    categoryType="income"
                    categoryKey={editValues.categoryKey}
                    userCategoryId={editValues.userCategoryId ?? null}
                    onSelect={({ categoryKey, categoryValue, userCategoryId, userCategoryLabel }) =>
                      setEditValues(prev => ({
                        ...prev,
                        categoryKey,
                        categoryValue: userCategoryLabel || categoryValue,
                        parentValue: categoryValue,
                        userCategoryId,
                        userCategoryLabel,
                      }))
                    }
                    onCreateCategory={onCreateCategory}
                    disabled={isSaving}
                    placeholder={translations.insert.incomeSection.placeholderCategory}
                  />
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <InlineInput
                    type="text"
                    theme={theme}
                    value={editValues.amount}
                    onChange={handleEditAmountChange}
                    style={{ minWidth: 60 }}
                  />
                  <span style={{ fontSize: '0.8em', opacity: 0.6 }}>{currencySymbol}</span>
                </div>
              </td>
              <td>
                <InlineInput
                  type="text"
                  theme={theme}
                  value={editValues.note}
                  onChange={(e) => setEditValues(prev => ({ ...prev, note: e.target.value }))}
                  maxLength={64}
                />
              </td>
              <td>
                <InlineInput
                  type="date"
                  theme={theme}
                  value={editValues.date}
                  onChange={(e) => setEditValues(prev => ({ ...prev, date: e.target.value }))}
                  max={currentDate}
                />
              </td>
              <td>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'center' }}>
                  <ActionBtn
                    className="edit"
                    onClick={handleSaveInline}
                    disabled={isSaving}
                    title={translations.insert.incomeSection.editButton}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </ActionBtn>
                  <ActionBtn
                    className="cancel"
                    onClick={handleCancelInline}
                    disabled={isSaving}
                    title={translations.insert.incomeSection.cancelEdit}
                  >
                    <FontAwesomeIcon icon={faRotateLeft} />
                  </ActionBtn>
                </div>
              </td>
            </tr>
          );
        }

        return (
          <tr key={index} style={{ background: rowGradient }}>
            <td>
              {isHidden
                ? '****'
                : add.userCategory?.label
                  ? `${translateTag(add.categoryTag?.label, language, 'income')} / ${add.userCategory.label}`
                  : translateTag(add.categoryTag?.label, language, 'income')}
            </td>
            <td>
              {isHidden
                ? '****'
                : formatNumber(add.amount)}{' '}{currencySymbol}
            </td>
            <td>{isHidden ? '****' : add.notes}</td>
            <td>
              {isHidden
                ? '****'
                : (() => {
                    const d = new Date(add.date);
                    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
                  })()}
            </td>
            <td>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'center' }}>
                <ActionBtn
                  className="edit"
                  data-umami-event="editIncome"
                  onClick={() => startEditing(add)}
                  title={translations.insert.incomeSection.editingLabel}
                >
                  <FontAwesomeIcon icon={faPen} />
                </ActionBtn>
                <ActionBtn
                  className="delete"
                  data-umami-event="deleteIncome"
                  onClick={() => onDeleteIncome(add.date, add.amount)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </ActionBtn>
              </div>
            </td>
          </tr>
        );
      }),
    ];
    if (filtersActive) {
      rows.push(
        <TotalRow key="total-filtered-income" className="filtered">
          <td style={{ textAlign: 'center' }}>
            {translations.general.totalFiltered || 'Total Filtered'}
          </td>
          <td style={{ textAlign: 'center' }}>
            {isHidden
              ? '****'
              : formatNumber(totals.totalFiltered)}{' '}{currencySymbol}
            {!isHidden && totals.totalAll > 0 && (
              <>
                {' '}<PercentBadge>{((totals.totalFiltered / totals.totalAll) * 100).toFixed(1)}%</PercentBadge>
              </>
            )}
          </td>
          <td colSpan={3}></td>
        </TotalRow>,
      );
    }
    rows.push(
      <TotalRow key="total-income" className="grand">
        <td style={{ textAlign: 'center' }}>{translations.general.total}</td>
        <td style={{ textAlign: 'center' }}>
          {isHidden
            ? '****'
            : formatNumber(totals.totalAll)}{' '}{currencySymbol}
        </td>
        <td colSpan={3}></td>
      </TotalRow>,
    );
    return rows;
  }

  /* ─── MUI Select shared sx ─── */
  const selectSx = {
    borderRadius: '10px',
    border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
    fontSize: '0.9rem',
    background: theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'white',
    color: theme.textColor,
    minHeight: '42px',
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '& .MuiSelect-select': { padding: '8px 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    '& .MuiSvgIcon-root': { color: theme.textColor },
  };

  return (
    <SectionWrapper>
      {/* ── Quick-add Form ── */}
      <FormCard>
        {/* Category */}
        <FormField>
          <FieldLabel theme={theme}>{translations.general.category}</FieldLabel>
          <CategoryPicker
            theme={theme}
            officialTags={incomesTags}
            customCategories={customCategories}
            categoryType="income"
            categoryKey={categoryIncome.key}
            userCategoryId={categoryIncome.userCategoryId ?? null}
            onSelect={({ categoryKey, categoryValue, userCategoryId, userCategoryLabel }) =>
              setCategoryIncome({
                key: categoryKey,
                value: userCategoryLabel || categoryValue,
                parentValue: categoryValue,
                userCategoryId,
                userCategoryLabel,
              })
            }
            onCreateCategory={onCreateCategory}
            placeholder={translations.insert.incomeSection.placeholderCategory}
          />
        </FormField>

        {/* Amount */}
        <FormField>
          <FieldLabel theme={theme}>{translations.general.value}</FieldLabel>
          <CurrencyInputWrap>
            <CurrencySymbol theme={theme}>{currencySymbol}</CurrencySymbol>
            <CurrencyInput
              type="text"
              theme={theme}
              value={income}
              onChange={(e) => handleInputChange(e, setIncome)}
              onBlur={(e) => handleInputBlur(e, setIncome)}
              placeholder="0"
            />
          </CurrencyInputWrap>
        </FormField>

        {/* Date */}
        <FormField>
          <FieldLabel theme={theme}>{translations.general.date}</FieldLabel>
          <FieldInput
            type="date"
            theme={theme}
            value={incomeDate}
            onChange={handleIncomeDateChange}
            max={currentDate}
          />
        </FormField>

        {/* Balance destination */}
        <FormField>
          <FieldLabel theme={theme}>
            {translations.insert.incomeSection.increaseWhichBalance || 'Aggiungi a'}
          </FieldLabel>
          <Select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            sx={selectSx}
            displayEmpty
            MenuProps={getMuiSelectMenuProps(theme)}
            renderValue={(value) =>
              value === '' ? (translations.general.selectAnOption || 'Nessuno (opzionale)') : value
            }
          >
            <MenuItem value="">
              <em>{translations.general.selectAnOption || 'Nessuno (opzionale)'}</em>
            </MenuItem>
            {balanceOptions && Object.keys(balanceOptions).map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormField>

        {/* Note — spans full width on wider screens */}
        <FormField style={{ gridColumn: '1 / -1' }}>
          <FieldLabel theme={theme}>
            {translations.insert.incomeSection.tableColumns?.note || 'Note'}
          </FieldLabel>
          <NoteArea
            theme={theme}
            value={noteIncomeAreaValue}
            onChange={(e) => setNoteIncomeAreaValue(e.target.value)}
            maxLength={64}
            placeholder={translations.insert.incomeSection.placeholderNote}
            rows={1}
          />
        </FormField>
      </FormCard>

      <FormFooter>
        <ModernActionButton theme={theme} onClick={onAddIncome}>
          {translations.insert.incomeSection.updateButton}
        </ModernActionButton>
        {onOpenMultiInsert && (
          <button
            onClick={onOpenMultiInsert}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '12px',
              border: `1.5px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}`,
              background: 'transparent',
              color: theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.88rem',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            data-umami-event="multi-insert-income-opened"
          >
            <FontAwesomeIcon icon={faLayerGroup} />
            {translations.insert.incomeSection.multiInsert?.toggle || 'Multi-insert'}
          </button>
        )}
      </FormFooter>

      {/* ── Transaction Table ── */}
      <TableSection theme={theme}>
        <TableHeader theme={theme}>
          <TableTitle theme={theme}>
            {translations.insert.incomeSection.titleListing}
          </TableTitle>
          <ThemedSelect
            value={selectedIncomesMonth}
            onChange={handleIncomesMonthChange}
          >
            {incomeMonthOptions &&
              incomeMonthOptions.length > 0 &&
              incomeMonthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </ThemedSelect>
        </TableHeader>
        <TableScroll>
          <StyledTable theme={theme} className="income-table">
            <thead>{renderTableHeader()}</thead>
            <tbody>
              {renderIncomeItems(
                getAddsForMonth(allIncomesAdds, selectedIncomeMonthKey),
              )}
            </tbody>
          </StyledTable>
        </TableScroll>
      </TableSection>
    </SectionWrapper>
  );
}
