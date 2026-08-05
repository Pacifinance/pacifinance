import React from 'react';
import { Select, MenuItem } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCalendarAlt, faPen, faCheck, faRotateLeft, faSortUp, faSortDown, faSort, faLayerGroup, faTableCells, faThLarge, faFilter, faHandHoldingDollar } from '@fortawesome/free-solid-svg-icons';
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
import { indexToMonthKey } from '../utils/userDataSelectors';
import ThemedSelect, { getMuiSelectMenuProps } from '../components/ThemedSelect';
import DateFilterPopover from '../components/DateFilterPopover';
import CategoryPicker from '../components/CategoryPicker';
import { renderBalanceSourceMenuItems } from '../components/multiInsert/balanceSourceMenu';
import { useListViewMode } from '../hooks/useListViewMode';
import { STORAGE_KEYS } from '../constants/storageKeys';
import {
  ViewSwitch, ViewButton, TableScroll, CardViewWrap,
  FilterToggleRow, FilterBadge, FilterPanel, FilterRow, FilterLabel, FilterInlineRow, ClearFiltersBtn,
  CardList, TxCard, CardTopRow, CardCategory, CardAmount, CardMetaRow, CardNote, CardActionsRow, CardEditGrid,
  TotalCard, ActionBtn, InlineInput,
} from '../components/transactionList/TransactionListStyles';

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

const NoteSuggestionButton = styled.button`
  margin-top: 0.4rem;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(16,185,129,0.4)' : 'rgba(5,150,105,0.35)'};
  border-radius: 8px;
  padding: 0.4rem 0.6rem;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(16,185,129,0.12)' : 'rgba(5,150,105,0.08)'};
  color: ${p => p.theme.textColor};
  text-align: left;
  overflow-wrap: anywhere;
  cursor: pointer;
`;

const FormFooter = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  width: 100%;
  padding-top: 0.25rem;
`;

const SecondaryFormAction = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.65rem;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: ${(p) => p.theme.textColor};
  opacity: 0.58;
  cursor: pointer;
  font: inherit;
  font-size: 0.74rem;
  font-weight: 600;
  transition: opacity 0.2s, background 0.2s;

  &:hover {
    opacity: 0.9;
    background: ${(p) => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'};
  }
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
  box-shadow: ${(p) => p.theme.mode === 'dark'
    ? '0 18px 45px rgba(0,0,0,0.18)'
    : '0 18px 45px rgba(15,23,42,0.07)'};
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



const MobileTableHint = styled.div`
  display: none;
  padding: 0.55rem 0.9rem;
  color: ${(p) => p.theme.textColor};
  background: ${(p) => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.025)' : '#f8fafc'};
  border-bottom: 1px solid ${(p) => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#eef2f7'};
  font-size: 0.72rem;
  font-weight: 650;
  opacity: 0.72;

  @media (max-width: 768px) { display: flex; justify-content: space-between; }
`;

const TotalRow = styled.tr`
  font-weight: 700;
  background: ${(p) => p.$filtered ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.2)'} !important;
  td { color: ${(p) => p.theme.mode === 'dark' ? '#6ee7b7' : '#047857'}; border-top: 1px solid rgba(16,185,129,0.25); }
  td:first-child, td:last-child { background: inherit !important; position: static; }
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
  suggestedNote = null,
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
  onLinkReimbursement,
  // New props for balance selection
  selectedOption,
  setSelectedOption,
  balanceOptions,
  balanceSourceMeta = null,
  incomeDateFilterStart,
  setIncomeDateFilterStart,
  incomeDateFilterEnd,
  setIncomeDateFilterEnd,
  onOpenMultiInsert,
  // Flattened view of every loaded month (+ any on-demand fetched extra
  // months) — used instead of the single selected month whenever the date
  // filter is active, so a date range can span across months.
  flatIncomesForRange,
}) {
  const { language, translations } = React.useContext(LanguageContext);
  const { currencySymbol, formatNumber, fromEUR } = React.useContext(CurrencyContext);
  const _pad = (n: number) => String(n).padStart(2, '0');
  const _now = new Date();
  const currentDate = `${_now.getFullYear()}-${_pad(_now.getMonth() + 1)}-${_pad(_now.getDate())}`;
  // Date-filter bounds: not clamped to the selected month, so a range can
  // span across months (or reach further back, on demand — see fetchMonthDetail).
  const dateFilterMin = `${indexToMonthKey(120)}-01`;
  const dateFilterMax = currentDate;
  // Once a date-range filter is active, the table reads from every loaded
  // month (+ any on-demand fetched ones) instead of just the current
  // month's bucket — see getAddsForMonth vs. flatIncomesForRange below.
  const incomeDateRangeActive = Boolean(incomeDateFilterStart || incomeDateFilterEnd);
  const incomesSourceForList = incomeDateRangeActive && flatIncomesForRange
    ? flatIncomesForRange
    : getAddsForMonth(allIncomesAdds, selectedIncomeMonthKey);

  // Sorting state
  const [sortColumn, setSortColumn] = React.useState(null);
  const [sortDirection, setSortDirection] = React.useState('asc');

  // Cards vs. table layout for the transaction list — a persisted user choice
  // (see useListViewMode), mirroring OutflowSection, so it can be picked
  // freely regardless of device.
  const [listLayout, setListLayout] = useListViewMode(STORAGE_KEYS.INCOME_LIST_VIEW_MODE);
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);

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

  const getSortIcon = (column) => {
    if (sortColumn !== column) return <FontAwesomeIcon icon={faSort} style={{ marginLeft: 4, opacity: 0.5, fontSize: '0.8em' }} />;
    return sortDirection === 'asc' 
      ? <FontAwesomeIcon icon={faSortUp} style={{ marginLeft: 4, fontSize: '0.9em' }} />
      : <FontAwesomeIcon icon={faSortDown} style={{ marginLeft: 4, fontSize: '0.9em' }} />;
  };

  function renderTableHeader() {
    const min = dateFilterMin;
    const max = dateFilterMax;
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
        <th style={{ minWidth: 120 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span
              onClick={() => handleSort('date')}
              style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center' }}
            >
              <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: 4 }} />
              {translations.general.date || 'Data'}
              {getSortIcon('date')}
            </span>
            <DateFilterPopover
              theme={theme}
              startValue={incomeDateFilterStart}
              endValue={incomeDateFilterEnd}
              onStartChange={setIncomeDateFilterStart}
              onEndChange={setIncomeDateFilterEnd}
              onClear={() => { setIncomeDateFilterStart(''); setIncomeDateFilterEnd(''); }}
              min={min}
              max={max}
              accentColor="#2ecc71"
              labels={{
                date: translations.general.date || 'Data',
                from: translations.general.from || 'Da',
                to: translations.general.to || 'A',
                all: translations.general.allDates || 'Tutte le date',
                clear: translations.general.clearFilter || 'Clear',
              }}
            />
          </div>
        </th>
        <th></th>
      </tr>
    );
  }

  const getDisplayCategory = (add) => (
    add.userCategory?.label
      ? `${translateTag(add.categoryTag?.label, language, 'income')} / ${add.userCategory.label}`
      : translateTag(add.categoryTag?.label, language, 'income')
  );

  // Shared by both the table and card views so filtering/sorting never drifts
  // between them.
  function getFilteredSortedIncomes(chosenIncomesToShow) {
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

    return filtered;
  }

  const incomeFiltersActive = Boolean(
    incomeCategoryFilter || incomeNoteFilter || incomeDateFilterStart || incomeDateFilterEnd
  );
  const incomeActiveFilterCount = [
    incomeCategoryFilter,
    incomeNoteFilter,
    incomeDateFilterStart || incomeDateFilterEnd,
  ].filter(Boolean).length;

  function renderIncomeItems(chosenIncomesToShow) {
    const filtered = getFilteredSortedIncomes(chosenIncomesToShow);
    const totals = getTotals(filtered, chosenIncomesToShow);
    const filtersActive = incomeFiltersActive;
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
              {isHidden ? '****' : getDisplayCategory(add)}
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
                  className="edit"
                  onClick={() => onLinkReimbursement?.(add)}
                  title={translations.insert.sharedTransactionLink?.incomeAction || 'Link reimbursement'}
                >
                  <FontAwesomeIcon icon={faHandHoldingDollar} />
                </ActionBtn>
                <ActionBtn
                  className="delete"
                  data-umami-event="deleteIncome"
                  onClick={() => onDeleteIncome(add.date, add.amount, add)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </ActionBtn>
              </div>
            </td>
          </tr>
        );
      }),
    ];
    rows.push(
        <TotalRow key="total-visible-income" theme={theme} $filtered={Boolean(filtersActive)}>
          <td style={{ textAlign: 'center' }}>
            {filtersActive
              ? (translations.general.totalFiltered || 'Totale filtrato')
              : (translations.general.totalPeriod || 'Totale periodo')}
            {incomeDateRangeActive && (
              <div style={{ fontSize: '0.68em', opacity: 0.65, fontWeight: 400 }}>
                {translations.general.customRangeNote || 'intervallo personalizzato'}
              </div>
            )}
          </td>
          <td style={{ textAlign: 'center' }}>
            {isHidden
              ? '****'
              : formatNumber(filtersActive ? totals.totalFiltered : totals.totalAll)}{' '}{currencySymbol}
            {filtersActive && !isHidden && totals.totalAll > 0 && (
              <>
                {' '}<PercentBadge>{((totals.totalFiltered / totals.totalAll) * 100).toFixed(1)}%</PercentBadge>
              </>
            )}
          </td>
          <td colSpan={3}></td>
        </TotalRow>,
    );
    return rows;
  }

  function renderIncomeCards(chosenIncomesToShow) {
    const filtered = getFilteredSortedIncomes(chosenIncomesToShow);
    const totals = getTotals(filtered, chosenIncomesToShow);
    const filtersActive = incomeFiltersActive;

    return (
      <>
        {filtered.map((add, index) => {
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

          if (isEditingRow(add)) {
            return (
              <TxCard key={index} theme={theme} $gradient="rgba(59, 130, 246, 0.08)" style={{ outline: '2px solid rgba(59, 130, 246, 0.25)' }}>
                <CardEditGrid>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <InlineInput
                      type="text"
                      theme={theme}
                      value={editValues.amount}
                      onChange={handleEditAmountChange}
                    />
                    <span style={{ fontSize: '0.8em', opacity: 0.6 }}>{currencySymbol}</span>
                  </div>
                  <InlineInput
                    type="text"
                    theme={theme}
                    value={editValues.note}
                    onChange={(e) => setEditValues(prev => ({ ...prev, note: e.target.value }))}
                    maxLength={64}
                    placeholder={translations.insert.incomeSection.tableColumns?.note || 'Note'}
                  />
                  <InlineInput
                    type="date"
                    theme={theme}
                    value={editValues.date}
                    onChange={(e) => setEditValues(prev => ({ ...prev, date: e.target.value }))}
                    max={currentDate}
                  />
                </CardEditGrid>
                <CardActionsRow>
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
                </CardActionsRow>
              </TxCard>
            );
          }

          return (
            <TxCard key={index} theme={theme} $gradient={rowGradient}>
              <CardTopRow>
                <CardCategory theme={theme}>
                  {isHidden ? '****' : getDisplayCategory(add)}
                </CardCategory>
                <CardAmount theme={theme}>
                  {isHidden ? '****' : formatNumber(add.amount)} {currencySymbol}
                </CardAmount>
              </CardTopRow>
              <CardMetaRow theme={theme} style={{ justifyContent: 'flex-end' }}>
                <span>
                  {isHidden
                    ? '****'
                    : (() => {
                        const d = new Date(add.date);
                        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
                      })()}
                </span>
              </CardMetaRow>
              {!isHidden && add.notes && (
                <CardNote theme={theme}>{add.notes}</CardNote>
              )}
              <CardActionsRow>
                <ActionBtn
                  className="edit"
                  data-umami-event="editIncome"
                  onClick={() => startEditing(add)}
                  title={translations.insert.incomeSection.editingLabel}
                >
                  <FontAwesomeIcon icon={faPen} />
                </ActionBtn>
                <ActionBtn
                  className="edit"
                  onClick={() => onLinkReimbursement?.(add)}
                  title={translations.insert.sharedTransactionLink?.incomeAction || 'Link reimbursement'}
                >
                  <FontAwesomeIcon icon={faHandHoldingDollar} />
                </ActionBtn>
                <ActionBtn
                  className="delete"
                  data-umami-event="deleteIncome"
                  onClick={() => onDeleteIncome(add.date, add.amount, add)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </ActionBtn>
              </CardActionsRow>
            </TxCard>
          );
        })}
        <TotalCard theme={theme} $filtered={Boolean(filtersActive)}>
          <span>
            {filtersActive
              ? (translations.general.totalFiltered || 'Totale filtrato')
              : (translations.general.totalPeriod || 'Totale periodo')}
            {incomeDateRangeActive && (
              <div style={{ fontSize: '0.68em', opacity: 0.65, fontWeight: 400 }}>
                {translations.general.customRangeNote || 'intervallo personalizzato'}
              </div>
            )}
          </span>
          <span>
            {isHidden
              ? '****'
              : formatNumber(filtersActive ? totals.totalFiltered : totals.totalAll)}{' '}{currencySymbol}
            {filtersActive && !isHidden && totals.totalAll > 0 && (
              <>
                {' '}<PercentBadge>{((totals.totalFiltered / totals.totalAll) * 100).toFixed(1)}%</PercentBadge>
              </>
            )}
          </span>
        </TotalCard>
      </>
    );
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
            {renderBalanceSourceMenuItems(balanceOptions, balanceSourceMeta)}
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
          {suggestedNote && (
            <NoteSuggestionButton type="button" theme={theme} onClick={() => setNoteIncomeAreaValue(suggestedNote)}>
              {translations.insert.noteSuggestion.replace('{note}', suggestedNote)}
            </NoteSuggestionButton>
          )}
        </FormField>
      </FormCard>

      <FormFooter>
        <ModernActionButton theme={theme} onClick={onAddIncome}>
          {translations.insert.incomeSection.updateButton}
        </ModernActionButton>
        {onOpenMultiInsert && (
          <SecondaryFormAction
            type="button"
            theme={theme}
            onClick={onOpenMultiInsert}
            data-umami-event="multi-insert-income-opened"
          >
            <FontAwesomeIcon icon={faLayerGroup} />
            {translations.insert.incomeSection.multiInsert?.toggle || 'Multi-insert'}
          </SecondaryFormAction>
        )}
      </FormFooter>

      {/* ── Transaction Table ── */}
      <TableSection theme={theme}>
        <TableHeader theme={theme}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <TableTitle theme={theme}>
              {translations.insert.incomeSection.titleListing}
            </TableTitle>
            <ViewSwitch theme={theme} aria-label={translations.insert.incomeSection.visualization?.viewLabel || 'Visualizzazione'}>
              <ViewButton
                type="button"
                theme={theme}
                $active={listLayout === 'cards'}
                onClick={() => setListLayout('cards')}
              >
                <FontAwesomeIcon icon={faThLarge} />
                {translations.insert.incomeSection.visualization?.cards || 'Schede'}
              </ViewButton>
              <ViewButton
                type="button"
                theme={theme}
                $active={listLayout === 'table'}
                onClick={() => setListLayout('table')}
              >
                <FontAwesomeIcon icon={faTableCells} />
                {translations.insert.incomeSection.visualization?.table || 'Tabella'}
              </ViewButton>
            </ViewSwitch>
          </div>
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
        {listLayout === 'table' ? (
          <>
            <MobileTableHint theme={theme}>
              <span>{language === 'it' ? 'Scorri per vedere tutte le colonne' : 'Scroll to see all columns'}</span>
              <span aria-hidden="true">← →</span>
            </MobileTableHint>
            <TableScroll>
              <StyledTable theme={theme} className="income-table">
                <thead>{renderTableHeader()}</thead>
                <tbody>
                  {renderIncomeItems(incomesSourceForList)}
                </tbody>
              </StyledTable>
            </TableScroll>
          </>
        ) : (
          <CardViewWrap>
            <FilterToggleRow theme={theme} type="button" onClick={() => setShowMobileFilters((v) => !v)}>
              <span className="filter-toggle-label">
                <FontAwesomeIcon icon={faFilter} />
                {translations.general.filterTransactions || translations.general.filters || 'Filters'}
                {incomeActiveFilterCount > 0 && <FilterBadge theme={theme}>{incomeActiveFilterCount}</FilterBadge>}
              </span>
              <FontAwesomeIcon icon={showMobileFilters ? faSortUp : faSortDown} />
            </FilterToggleRow>
            <FilterPanel theme={theme} $open={showMobileFilters}>
              <FilterRow>
                <FilterLabel theme={theme}>{translations.insert.incomeSection.tableColumns.category}</FilterLabel>
                <ThemedSelect
                  value={incomeCategoryFilter}
                  onChange={(e) => setIncomeCategoryFilter(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">{translations.general.all}</option>
                  {incomesTags.map((item) => (
                    <option key={item.index} value={translateTag(item.label, language, 'income')}>
                      {translateTag(item.label, language, 'income')}
                    </option>
                  ))}
                </ThemedSelect>
              </FilterRow>
              <FilterRow>
                <FilterLabel theme={theme}>{translations.insert.incomeSection.tableColumns.note}</FilterLabel>
                <input
                  type="text"
                  placeholder={translations.general.filterByNote}
                  value={incomeNoteFilter}
                  onChange={(e) => setIncomeNoteFilter(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </FilterRow>
              <FilterRow>
                <FilterLabel theme={theme}>{translations.general.date || 'Data'}</FilterLabel>
                <FilterInlineRow>
                  <input
                    type="date"
                    value={incomeDateFilterStart || ''}
                    onChange={(e) => setIncomeDateFilterStart(e.target.value)}
                    min={dateFilterMin}
                    max={dateFilterMax}
                  />
                  <span style={{ fontSize: '0.75em', opacity: 0.7 }}>-</span>
                  <input
                    type="date"
                    value={incomeDateFilterEnd || ''}
                    onChange={(e) => setIncomeDateFilterEnd(e.target.value)}
                    min={dateFilterMin}
                    max={dateFilterMax}
                  />
                </FilterInlineRow>
              </FilterRow>
              {incomeActiveFilterCount > 0 && (
                <ClearFiltersBtn
                  type="button"
                  onClick={() => {
                    setIncomeCategoryFilter('');
                    setIncomeNoteFilter('');
                    setIncomeDateFilterStart('');
                    setIncomeDateFilterEnd('');
                  }}
                >
                  {translations.general.clearAllFilters}
                </ClearFiltersBtn>
              )}
            </FilterPanel>
            <CardList>
              {renderIncomeCards(incomesSourceForList)}
            </CardList>
          </CardViewWrap>
        )}
      </TableSection>
    </SectionWrapper>
  );
}
