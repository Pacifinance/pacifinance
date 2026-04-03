import React from 'react';
import styled from 'styled-components';
import { Select, MenuItem } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCalendarAlt, faPen, faCheck, faRotateLeft, faSortUp, faSortDown, faSort, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { sortTagsByLanguage } from '../utils/sortingUtils';
import { translateTag } from '../data/tagTranslations';
import {
  ModernActionButton,
  StyledTable,
} from '../styles/MyStyled';
import { getCategoryColor } from '../data/categoryColors';
import { getLighterSolidColor, getGrayscaleColor } from '../utils/colorUtils';
import ThemedSelect, { getMuiSelectMenuProps } from './ThemedSelect';

// Note: Le funzioni per processare i colori sono ora importate da utils/colorUtils

/* ─── Styled Components ─── */
const SectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 1.5rem;
`;

const FormCard = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  width: 100%;
  @media (max-width: 600px) {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
  @media (max-width: 380px) {
    grid-template-columns: 1fr;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
`;

const FieldLabel = styled.label`
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${p => p.theme.textColor};
  opacity: 0.7;
`;

const FieldInput = styled.input`
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 16px;
  min-height: 42px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'white'};
  color: ${p => p.theme.textColor};
  transition: border-color 0.2s, box-shadow 0.2s;
  &:focus {
    outline: none;
    border-color: ${p => p.theme.buttonBackgroundColor || '#3b82f6'};
    box-shadow: 0 0 0 3px ${p => (p.theme.buttonBackgroundColor || '#3b82f6') + '18'};
  }
  &[type='date'] {
    -webkit-appearance: none;
    appearance: none;
    padding: 8px 6px;
  }
  @media (max-width: 600px) {
    font-size: 16px;
    &[type='date'] {
      padding: 8px 4px;
      font-size: 14px;
    }
  }
`;

const CurrencyInputWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const CurrencySymbol = styled.span`
  position: absolute;
  left: 12px;
  color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.4)' : '#94a3b8'};
  font-size: 0.9rem;
  font-weight: 600;
  pointer-events: none;
  z-index: 1;
`;

const CurrencyInput = styled(FieldInput)`
  padding-left: 2em;
  text-align: right;
  font-size: 16px;
`;

const NoteArea = styled.textarea`
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 0.9rem;
  min-height: 42px;
  width: 100%;
  box-sizing: border-box;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'white'};
  color: ${p => p.theme.textColor};
  resize: none;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
  &:focus {
    outline: none;
    border-color: ${p => p.theme.buttonBackgroundColor || '#3b82f6'};
    box-shadow: 0 0 0 3px ${p => (p.theme.buttonBackgroundColor || '#3b82f6') + '18'};
  }
`;

const FormFooter = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  width: 100%;
`;

const TableSection = styled.div`
  width: 100%;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e2e8f0'};
  background: ${p => p.theme.mode === 'dark' ? p.theme.backgroundColor : '#fff'};
`;

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#f1f5f9'};
`;

const TableTitle = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: ${p => p.theme.textColor};
`;



const TableScroll = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
`;

const ActionBtn = styled.button`
  border: none;
  border-radius: 6px;
  padding: 4px 7px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  color: white;
  &:hover:not(:disabled) { transform: scale(1.08); }
  &.delete {
    background: linear-gradient(135deg, #ff6b6b, #ee5a52);
    box-shadow: 0 2px 4px rgba(255,107,107,0.3);
  }
  &.edit {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    box-shadow: 0 2px 4px rgba(59,130,246,0.3);
    &:hover:not(:disabled) { transform: scale(1.08); }
  }
  &.cancel {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    box-shadow: 0 2px 4px rgba(245,158,11,0.3);
    &:hover:not(:disabled) { transform: scale(1.08); }
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

const InlineSelect = styled.select`
  width: 100%;
  min-width: 80px;
  padding: 4px 6px;
  border: 1.5px solid ${p => p.theme.mode === 'dark' ? 'rgba(59,130,246,0.4)' : 'rgba(59,130,246,0.3)'};
  border-radius: 6px;
  font-size: 0.82rem;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#f8fafc'};
  color: ${p => p.theme.textColor};
  box-sizing: border-box;
  outline: none;
  cursor: pointer;
  font-family: inherit;

  option {
    background: ${p => p.theme.mode === 'dark' ? '#1e293b' : '#ffffff'};
    color: ${p => p.theme.mode === 'dark' ? '#e2e8f0' : '#1e293b'};
  }
`;

const TotalRow = styled.tr`
  font-weight: 700;
  td { text-align: center; }
  &.filtered {
    background: #ff6b6b;
    color: #6b1a1a;
    font-size: 1.02em;
  }
  &.grand {
    background: #e23c3c;
    color: #fff;
    font-size: 1.08em;
  }
`;

const PercentBadge = styled.span`
  display: inline-block;
  font-size: 0.82em;
  font-weight: 500;
  background: rgba(255,255,255,0.22);
  padding: 1px 8px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.3);
  margin-left: 4px;
`;

const currentDate = new Date().toISOString().split('T')[0];

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

export default function OutflowSection({
  theme,
  isHidden,
  categoryOutflow,
  setCategoryOutflow,
  typoOutflow,
  setTypoOutflow,
  outflow,
  setOutflow,
  outflowDate,
  setOutflowDate,
  noteOutflowAreaValue,
  setNoteOutflowAreaValue,
  OutflowsTags,
  paymentTags,
  selectedOutflowsMonth,
  setSelectedOutflowsMonth,
  outflowMonthOptions,
  allOutflowsAdds,
  selectedOutflowMonthKey,
  outflowCategoryFilter,
  setOutflowCategoryFilter,
  outflowTypologyFilter,
  setOutflowTypologyFilter,
  outflowNoteFilter,
  setOutflowNoteFilter,
  onAddOutflow,
  onDeleteOutflow,
  onSaveEdit,
  onOpenMultiInsert,
  // New props for balance selection
  selectedOption,
  setSelectedOption,
  balanceOptions,
  outflowDateFilterStart,
  setOutflowDateFilterStart,
  outflowDateFilterEnd,
  setOutflowDateFilterEnd,
}) {
  const { language, translations } = React.useContext(LanguageContext);
  const { currencySymbol, formatNumber, fromEUR } = React.useContext(CurrencyContext);
  
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
      add.paymentType?.index === editingAdd.paymentType?.index &&
      add.notes === editingAdd.notes
    );
  };

  const startEditing = (add) => {
    const displayAmount = fromEUR(add.amount ?? 0);
    setEditingAdd(add);
    setEditValues({
      categoryKey: add.categoryTag?.index ?? "",
      typologyKey: add.paymentType?.index ?? "",
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

  const handleOutflowDateChange = (event) => {
    let inputDate = event.target.value;
    setOutflowDate(inputDate);
  };

  const handleOutflowsMonthChange = (event) => {
    setSelectedOutflowsMonth(event.target.value);
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
    const { min, max } = getDateRangeForMonth(outflowMonthOptions[selectedOutflowsMonth]);
    return (
      <tr>
        <th>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span
              onClick={() => handleSort('category')}
              style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center' }}
            >
              {translations.insert.outflowSection.tableColumns.category}
              {getSortIcon('category')}
            </span>
            <ThemedSelect
              compact
              value={outflowCategoryFilter}
              onChange={(e) => setOutflowCategoryFilter(e.target.value)}
              style={{ minWidth: 100 }}
            >
              <option value="">{translations.general.all}</option>
              {OutflowsTags.map((item) => (
                <option key={item.index} value={translateTag(item.label, language, 'expense')}>
                  {translateTag(item.label, language, 'expense')}
                </option>
              ))}
            </ThemedSelect>
          </div>
        </th>
        <th>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span
              onClick={() => handleSort('typology')}
              style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center' }}
            >
              {translations.insert.outflowSection.tableColumns.typology}
              {getSortIcon('typology')}
            </span>
            <ThemedSelect
              compact
              value={outflowTypologyFilter}
              onChange={(e) => setOutflowTypologyFilter(e.target.value)}
              style={{ minWidth: 100 }}
            >
              <option value="">{translations.general.all}</option>
              {paymentTags.map((item) =>
                item.label !== 'none' && (
                  <option key={item.index} value={translateTag(item.label, language, 'payment')}>
                    {translateTag(item.label, language, 'payment')}
                  </option>
                ),
              )}
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
              {translations.insert.outflowSection.tableColumns.note}
              {getSortIcon('note')}
            </span>
            <input
              type="text"
              placeholder={translations.general.clearFilter || 'Filtra...'}
              value={outflowNoteFilter}
              onChange={(e) => setOutflowNoteFilter(e.target.value)}
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
                value={outflowDateFilterStart || ''}
                onChange={(e) => setOutflowDateFilterStart(e.target.value)}
                min={min}
                max={max}
                style={{ width: 110 }}
              />
              <span style={{ fontSize: '0.75em', opacity: 0.7 }}>-</span>
              <input
                type="date"
                value={outflowDateFilterEnd || ''}
                onChange={(e) => setOutflowDateFilterEnd(e.target.value)}
                min={min}
                max={max}
                style={{ width: 110 }}
              />
            </div>
            {(outflowDateFilterStart || outflowDateFilterEnd) && (
              <button
                onClick={() => { setOutflowDateFilterStart(''); setOutflowDateFilterEnd(''); }}
                style={{
                  color: '#fff', background: 'rgba(255,107,107,0.6)', border: 'none',
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

  function renderOutflowItems(chosenOutflowsToShow) {
    let filtered = chosenOutflowsToShow.filter((add) => {
      const addDate = new Date(add.date).toISOString().slice(0, 10);
      let dateMatch = true;
      if (outflowDateFilterStart && outflowDateFilterEnd) {
        dateMatch = addDate >= outflowDateFilterStart && addDate <= outflowDateFilterEnd;
      } else if (outflowDateFilterStart) {
        dateMatch = addDate >= outflowDateFilterStart;
      } else if (outflowDateFilterEnd) {
        dateMatch = addDate <= outflowDateFilterEnd;
      }
      return (
        (!outflowCategoryFilter ||
          translateTag(add.categoryTag?.label, language, 'expense') === outflowCategoryFilter) &&
        (!outflowTypologyFilter ||
          translateTag(add.paymentType?.label, language, 'payment') === outflowTypologyFilter) &&
        (!outflowNoteFilter ||
          (add.notes &&
            add.notes.toLowerCase().includes(outflowNoteFilter.toLowerCase()))) &&
        dateMatch
      );
    });

    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aVal, bVal;
        switch (sortColumn) {
          case 'category':
            aVal = translateTag(a.categoryTag?.label, language, 'expense');
            bVal = translateTag(b.categoryTag?.label, language, 'expense');
            break;
          case 'typology':
            aVal = translateTag(a.paymentType?.label, language, 'payment');
            bVal = translateTag(b.paymentType?.label, language, 'payment');
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

    const totals = getTotals(filtered, chosenOutflowsToShow);
    const filtersActive =
      outflowCategoryFilter || outflowTypologyFilter || outflowNoteFilter ||
      outflowDateFilterStart || outflowDateFilterEnd;
    const rows = [
      ...filtered.map((add, index) => {
        let colorKey = undefined;
        if (add.categoryTag && add.categoryTag.key) {
          colorKey = add.categoryTag.key;
        } else if (add.categoryTag && add.categoryTag.label) {
          colorKey = add.categoryTag.label;
        } else if (add.categoryTag && add.categoryTag.label) {
          colorKey = add.categoryTag.label;
        } else if (add.categoryTag && add.categoryTag.translations) {
          const keys = Object.keys(add.categoryTag.translations);
          if (keys.length > 0) colorKey = add.categoryTag.translations[keys[0]];
        }
        const rawColor = getCategoryColor(colorKey);
        const processedColor = isHidden
          ? getGrayscaleColor(rawColor, index)
          : getLighterSolidColor(rawColor);
        const rowGradient = getGradientForCategory(processedColor);

        // Inline editing mode for this row
        if (isEditingRow(add)) {
          return (
            <tr key={index} style={{ background: 'rgba(59, 130, 246, 0.08)', outline: '2px solid rgba(59, 130, 246, 0.25)' }}>
              <td>
                <InlineSelect
                  theme={theme}
                  value={editValues.categoryKey}
                  onChange={(e) => setEditValues(prev => ({ ...prev, categoryKey: Number(e.target.value) }))}
                >
                  {sortTagsByLanguage(OutflowsTags, language, 'expense').map((item) => (
                    <option key={item.index} value={item.index}>
                      {translateTag(item.label, language, 'expense')}
                    </option>
                  ))}
                </InlineSelect>
              </td>
              <td>
                <InlineSelect
                  theme={theme}
                  value={editValues.typologyKey}
                  onChange={(e) => setEditValues(prev => ({ ...prev, typologyKey: Number(e.target.value) }))}
                >
                  {sortTagsByLanguage(paymentTags, language, 'payment').filter(item => item.label !== 'none').map((item) => (
                    <option key={item.index} value={item.index}>
                      {translateTag(item.label, language, 'payment')}
                    </option>
                  ))}
                </InlineSelect>
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
                    title={translations.insert.outflowSection.editButton}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </ActionBtn>
                  <ActionBtn
                    className="cancel"
                    onClick={handleCancelInline}
                    disabled={isSaving}
                    title={translations.insert.outflowSection.cancelEdit}
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
            <td>{isHidden ? '****' : translateTag(add.categoryTag?.label, language, 'expense')}</td>
            <td>{isHidden ? '****' : translateTag(add.paymentType?.label, language, 'payment')}</td>
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
                  data-umami-event="editOutflow"
                  onClick={() => startEditing(add)}
                  title={translations.insert.outflowSection.editingLabel}
                >
                  <FontAwesomeIcon icon={faPen} />
                </ActionBtn>
                <ActionBtn
                  className="delete"
                  data-umami-event="deleteOutflow"
                  onClick={() => onDeleteOutflow(add.date, add.amount)}
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
        <TotalRow key="total-filtered-outflow" className="filtered">
          <td colSpan={2} style={{ textAlign: 'center' }}>
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
      <TotalRow key="total-outflow" className="grand">
        <td colSpan={2} style={{ textAlign: 'center' }}>{translations.general.total}</td>
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
          <Select
            value={categoryOutflow.value}
            onChange={(event) => {
              const selectedKey = event.target.value;
              const selectedItem = OutflowsTags.find((item) => item.index === selectedKey);
              if (selectedItem) {
                setCategoryOutflow({
                  key: selectedKey,
                  value: translateTag(selectedItem.label, language, 'expense'),
                });
              }
            }}
            sx={selectSx}
            displayEmpty
            MenuProps={getMuiSelectMenuProps(theme)}
            renderValue={(value) =>
              value === '' ? translations.insert.outflowSection.placeholderCategory : value
            }
          >
            <MenuItem value="">
              <em>{translations.insert.outflowSection.placeholderCategory}</em>
            </MenuItem>
            {sortTagsByLanguage(OutflowsTags, language, 'expense').map((item) => (
              <MenuItem key={item.index} value={item.index}>
                {translateTag(item.label, language, 'expense')}
              </MenuItem>
            ))}
          </Select>
        </FormField>

        {/* Payment Type */}
        <FormField>
          <FieldLabel theme={theme}>{translations.general.typology}</FieldLabel>
          <Select
            value={typoOutflow.value}
            onChange={(event) => {
              const selectedKey = event.target.value;
              const selectedItem = paymentTags.find((item) => item.index === selectedKey);
              if (selectedItem) {
                setTypoOutflow({ key: selectedKey, value: translateTag(selectedItem.label, language, 'payment') });
              }
            }}
            sx={selectSx}
            displayEmpty
            MenuProps={getMuiSelectMenuProps(theme)}
            renderValue={(value) =>
              value === '' ? translations.insert.outflowSection.placeholderTypology : value
            }
          >
            <MenuItem value="">
              <em>{translations.insert.outflowSection.placeholderTypology}</em>
            </MenuItem>
            {sortTagsByLanguage(paymentTags, language, 'payment').map((item) =>
              item.label !== 'none' && (
                <MenuItem key={item.index} value={item.index}>
                  {translateTag(item.label, language, 'payment')}
                </MenuItem>
              ),
            )}
          </Select>
        </FormField>

        {/* Amount */}
        <FormField>
          <FieldLabel theme={theme}>{translations.general.value}</FieldLabel>
          <CurrencyInputWrap>
            <CurrencySymbol theme={theme}>{currencySymbol}</CurrencySymbol>
            <CurrencyInput
              type="text"
              theme={theme}
              value={outflow}
              onChange={(e) => handleInputChange(e, setOutflow)}
              onBlur={(e) => handleInputBlur(e, setOutflow)}
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
            value={outflowDate}
            onChange={handleOutflowDateChange}
            max={currentDate}
          />
        </FormField>

        {/* Balance source */}
        <FormField>
          <FieldLabel theme={theme}>
            {translations.insert.outflowSection.decreaseWhichBalance || 'Sottrai da'}
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

        {/* Note — spans full width */}
        <FormField style={{ gridColumn: '1 / -1' }}>
          <FieldLabel theme={theme}>
            {translations.insert.outflowSection.tableColumns?.note || 'Note'}
          </FieldLabel>
          <NoteArea
            theme={theme}
            value={noteOutflowAreaValue}
            onChange={(e) => setNoteOutflowAreaValue(e.target.value)}
            maxLength={64}
            placeholder={translations.insert.outflowSection.placeholderNote}
            rows={1}
          />
        </FormField>
      </FormCard>

      <FormFooter>
        <ModernActionButton theme={theme} onClick={onAddOutflow}>
          {translations.insert.outflowSection.updateButton}
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
            data-umami-event="multi-insert-outflow-opened"
          >
            <FontAwesomeIcon icon={faLayerGroup} />
            {translations.insert.outflowSection.multiInsert?.toggle || 'Multi-insert'}
          </button>
        )}
      </FormFooter>

      {/* ── Transaction Table ── */}
      <TableSection theme={theme}>
        <TableHeader theme={theme}>
          <TableTitle theme={theme}>
            {translations.insert.outflowSection.titleListing}
          </TableTitle>
          <ThemedSelect
            value={selectedOutflowsMonth}
            onChange={handleOutflowsMonthChange}
          >
            {outflowMonthOptions &&
              outflowMonthOptions.length > 0 &&
              outflowMonthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </ThemedSelect>
        </TableHeader>
        <TableScroll>
          <StyledTable theme={theme} className="outflow-table">
            <thead>{renderTableHeader()}</thead>
            <tbody>
              {renderOutflowItems(
                getAddsForMonth(allOutflowsAdds, selectedOutflowMonthKey),
              )}
            </tbody>
          </StyledTable>
        </TableScroll>
      </TableSection>
    </SectionWrapper>
  );
}