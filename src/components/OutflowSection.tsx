import React from 'react';
import styled from 'styled-components';
import { Select, MenuItem } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faCalendarAlt,
  faPen,
  faCheck,
  faRotateLeft,
  faSortUp,
  faSortDown,
  faSort,
  faLayerGroup,
  faList,
  faChartBar,
} from '@fortawesome/free-solid-svg-icons';
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
import CategoryPicker from './CategoryPicker';
import { renderBalanceSourceMenuItems } from './multiInsert/balanceSourceMenu';

// Note: Le funzioni per processare i colori sono ora importate da utils/colorUtils

// Raw (untranslated) payment-tag labels that suggest a recurring template
const RECURRING_PAYMENT_LABELS = ['subscription', 'periodic payment'];

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

const RecurringCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: ${p => p.theme.textColor};
  cursor: pointer;

  input {
    width: 1.05rem;
    height: 1.05rem;
    cursor: pointer;
    accent-color: ${p => p.theme.buttonBackgroundColor};
  }
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

const HeaderMain = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const TableTitle = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: ${p => p.theme.textColor};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const ViewSwitch = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border-radius: 10px;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc'};
`;

const ViewButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 0;
  border-radius: 8px;
  padding: 0.45rem 0.65rem;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  color: ${p => p.$active ? '#fff' : p.theme.textColor};
  background: ${p => p.$active ? p.theme.buttonBackgroundColor : 'transparent'};
  opacity: ${p => p.$active ? 1 : 0.7};
  transition: opacity 0.2s ease, background 0.2s ease, transform 0.2s ease;

  &:hover {
    opacity: 1;
    transform: translateY(-1px);
  }

  svg {
    font-size: 0.85rem;
  }
`;

const MonthlySummary = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) repeat(3, minmax(120px, 0.55fr));
  gap: 0.8rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#eef2f7'};
  background:
    linear-gradient(135deg, ${p => p.theme.buttonBackgroundColor}18, transparent 38%),
    ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.025)' : '#fbfdff'};

  @media (max-width: 820px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
    padding: 0.9rem;
  }
`;

const SummaryHero = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.35rem;
  min-width: 0;
`;

const SummaryLabel = styled.span`
  color: ${p => p.theme.textColor};
  opacity: 0.62;
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const SummaryValue = styled.strong`
  color: ${p => p.theme.textColor};
  font-size: clamp(1.6rem, 4vw, 2.35rem);
  line-height: 1;
  font-weight: 800;
`;

const SummarySubtext = styled.span`
  color: ${p => p.theme.textColor};
  opacity: 0.58;
  font-size: 0.82rem;
`;

const SummaryTile = styled.div`
  border-radius: 12px;
  padding: 0.8rem;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.78)'};
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.075)' : '#e8edf5'};
  min-width: 0;
`;

const SummaryTileValue = styled.div`
  color: ${p => p.theme.textColor};
  font-size: 1rem;
  font-weight: 800;
  margin-top: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ChartPanel = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.85fr);
  gap: 1rem;
  padding: 1rem 1.25rem 1.25rem;

  @media (max-width: 840px) {
    grid-template-columns: 1fr;
    padding: 0.9rem;
  }
`;

const BarsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

const CategoryBarButton = styled.button`
  border: 1px solid ${p => p.$active
    ? p.theme.buttonBackgroundColor
    : p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e5eaf2'};
  border-radius: 12px;
  background: ${p => p.$active
    ? `${p.theme.buttonBackgroundColor}12`
    : p.theme.mode === 'dark' ? 'rgba(255,255,255,0.035)' : '#fff'};
  padding: 0.75rem;
  color: ${p => p.theme.textColor};
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: ${p => p.theme.buttonBackgroundColor};
    transform: translateY(-1px);
  }
`;

const BarTopLine = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.55rem;
`;

const BarLabel = styled.div`
  min-width: 0;
  font-size: 0.92rem;
  font-weight: 750;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BarMeta = styled.div`
  flex: 0 0 auto;
  font-size: 0.82rem;
  font-weight: 750;
  opacity: 0.82;
`;

const BarTrack = styled.div`
  height: 12px;
  border-radius: 999px;
  overflow: hidden;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#edf2f7'};
`;

const BarFill = styled.div`
  width: ${p => p.$width}%;
  height: 100%;
  min-width: ${p => p.$width > 0 ? '6px' : '0'};
  border-radius: inherit;
  background: ${p => p.$color};
`;

const DetailPanel = styled.div`
  border-radius: 12px;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e5eaf2'};
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.035)' : '#fff'};
  min-height: 260px;
  overflow: hidden;
`;

const DetailHeader = styled.div`
  padding: 0.9rem 1rem;
  border-bottom: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.07)' : '#edf2f7'};
`;

const DetailTitle = styled.h4`
  margin: 0 0 0.25rem;
  color: ${p => p.theme.textColor};
  font-size: 0.98rem;
`;

const DetailSub = styled.div`
  color: ${p => p.theme.textColor};
  opacity: 0.58;
  font-size: 0.8rem;
`;

const DetailList = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 360px;
  overflow-y: auto;
`;

const DetailRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.055)' : '#f1f5f9'};
`;

const DetailRowTitle = styled.div`
  color: ${p => p.theme.textColor};
  font-size: 0.88rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DetailRowMeta = styled.div`
  color: ${p => p.theme.textColor};
  opacity: 0.56;
  font-size: 0.75rem;
  margin-top: 0.18rem;
`;

const EmptyChart = styled.div`
  padding: 2.25rem 1rem;
  text-align: center;
  color: ${p => p.theme.textColor};
  opacity: 0.62;
  font-weight: 650;
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
  customCategories = [],
  onCreateCategory,
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
  balanceSourceMeta = null,
  makeRecurring = false,
  setMakeRecurring,
  outflowDateFilterStart,
  setOutflowDateFilterStart,
  outflowDateFilterEnd,
  setOutflowDateFilterEnd,
}) {
  const { language, translations } = React.useContext(LanguageContext);
  const { currencySymbol, formatNumber, fromEUR } = React.useContext(CurrencyContext);
  const pad = (n: number) => String(n).padStart(2, '0');
  const _now = new Date();
  const currentDate = `${_now.getFullYear()}-${pad(_now.getMonth() + 1)}-${pad(_now.getDate())}`;

  const isRecurringEligibleTypology = RECURRING_PAYMENT_LABELS.includes(
    paymentTags.find((item) => item.index === typoOutflow.key)?.label
  );

  const [sortColumn, setSortColumn] = React.useState(null);
  const [sortDirection, setSortDirection] = React.useState('asc');
  const [tableView, setTableView] = React.useState('list');
  const [selectedChartCategory, setSelectedChartCategory] = React.useState(null);

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
      (add.userCategory?.id ?? null) === (editingAdd.userCategory?.id ?? null) &&
      add.notes === editingAdd.notes
    );
  };

  const startEditing = (add) => {
    const displayAmount = fromEUR(add.amount ?? 0);
    setEditingAdd(add);
    setEditValues({
      categoryKey: add.categoryTag?.index ?? "",
      categoryValue: translateTag(add.categoryTag?.label, language, 'expense'),
      parentValue: translateTag(add.categoryTag?.label, language, 'expense'),
      userCategoryId: add.userCategory?.id ?? null,
      userCategoryLabel: add.userCategory?.label ?? null,
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
    const inputDate = event.target.value;
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

  const getDisplayCategory = React.useCallback((add) => {
    const parent = translateTag(add.categoryTag?.label, language, 'expense');
    if (add.userCategory?.label) {
      return `${parent} / ${add.userCategory.label}`;
    }
    return parent || translations.general.other || 'Altro';
  }, [language, translations.general.other]);

  const getParentCategory = React.useCallback((add) => (
    translateTag(add.categoryTag?.label, language, 'expense') || translations.general.other || 'Altro'
  ), [language, translations.general.other]);

  const getCategoryKey = React.useCallback((add) => {
    const parentIndex = add.categoryTag?.index ?? add.categoryTag?.label ?? 'unknown';
    return add.userCategory?.id ? `${parentIndex}:custom:${add.userCategory.id}` : `${parentIndex}:parent`;
  }, []);

  const applyTableFilters = React.useCallback((rows) => {
    return rows.filter((add) => {
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
  }, [
    language,
    outflowCategoryFilter,
    outflowDateFilterEnd,
    outflowDateFilterStart,
    outflowNoteFilter,
    outflowTypologyFilter,
  ]);

  const sortOutflowRows = React.useCallback((rows) => {
    if (!sortColumn) return rows;
    return [...rows].sort((a, b) => {
      let aVal, bVal;
      switch (sortColumn) {
        case 'category':
          aVal = getDisplayCategory(a);
          bVal = getDisplayCategory(b);
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
  }, [getDisplayCategory, language, sortColumn, sortDirection]);

  const buildCategoryBreakdown = React.useCallback((rows) => {
    const groups = new Map();
    rows.forEach((add) => {
      const key = getCategoryKey(add);
      const existing = groups.get(key) || {
        key,
        label: getDisplayCategory(add),
        parentLabel: getParentCategory(add),
        total: 0,
        count: 0,
        items: [],
        colorKey: add.categoryTag?.key || add.categoryTag?.label || getParentCategory(add),
      };
      existing.total += add.amount || 0;
      existing.count += 1;
      existing.items.push(add);
      groups.set(key, existing);
    });
    return [...groups.values()].sort((a, b) => b.total - a.total);
  }, [getCategoryKey, getDisplayCategory, getParentCategory]);

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
    const filtered = sortOutflowRows(applyTableFilters(chosenOutflowsToShow));

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
                <div style={{ minWidth: 180 }}>
                  <CategoryPicker
                    theme={theme}
                    officialTags={OutflowsTags}
                    customCategories={customCategories}
                    categoryType="expense"
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
                    placeholder={translations.insert.outflowSection.placeholderCategory}
                  />
                </div>
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
            <td>
              {isHidden
                ? '****'
                : getDisplayCategory(add)}
            </td>
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
                  onClick={() => onDeleteOutflow(add.date, add.amount, add)}
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

  const chosenOutflowsToShow = React.useMemo(
    () => getAddsForMonth(allOutflowsAdds, selectedOutflowMonthKey),
    [allOutflowsAdds, selectedOutflowMonthKey],
  );
  const filteredOutflows = React.useMemo(
    () => sortOutflowRows(applyTableFilters(chosenOutflowsToShow)),
    [applyTableFilters, chosenOutflowsToShow, sortOutflowRows],
  );
  const totals = React.useMemo(
    () => getTotals(filteredOutflows, chosenOutflowsToShow),
    [chosenOutflowsToShow, filteredOutflows],
  );
  const categoryBreakdown = React.useMemo(
    () => buildCategoryBreakdown(filteredOutflows),
    [buildCategoryBreakdown, filteredOutflows],
  );
  const maxCategoryTotal = categoryBreakdown[0]?.total || 0;
  const selectedCategory = categoryBreakdown.find((item) => item.key === selectedChartCategory) || categoryBreakdown[0] || null;
  const topCategory = categoryBreakdown[0] || null;
  const averageOutflow = filteredOutflows.length > 0 ? totals.totalFiltered / filteredOutflows.length : 0;
  const filtersActive =
    outflowCategoryFilter || outflowTypologyFilter || outflowNoteFilter ||
    outflowDateFilterStart || outflowDateFilterEnd;

  React.useEffect(() => {
    if (!categoryBreakdown.length) {
      setSelectedChartCategory(null);
      return;
    }
    if (!selectedChartCategory || !categoryBreakdown.some((item) => item.key === selectedChartCategory)) {
      setSelectedChartCategory(categoryBreakdown[0].key);
    }
  }, [categoryBreakdown, selectedChartCategory]);

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const renderCategoryChart = () => {
    if (isHidden) {
      return (
        <EmptyChart theme={theme}>
          ****
        </EmptyChart>
      );
    }

    if (!categoryBreakdown.length) {
      return (
        <EmptyChart theme={theme}>
          {translations.insert.outflowSection.visualization?.empty || 'Nessuna uscita per il periodo selezionato'}
        </EmptyChart>
      );
    }

    return (
      <ChartPanel theme={theme}>
        <BarsList>
          {categoryBreakdown.map((category) => {
            const rawColor = getCategoryColor(category.colorKey);
            const color = getLighterSolidColor(rawColor);
            const width = maxCategoryTotal > 0 ? Math.max(4, (category.total / maxCategoryTotal) * 100) : 0;
            const percentage = totals.totalFiltered > 0 ? (category.total / totals.totalFiltered) * 100 : 0;
            return (
              <CategoryBarButton
                key={category.key}
                type="button"
                theme={theme}
                $active={selectedCategory?.key === category.key}
                onClick={() => setSelectedChartCategory(category.key)}
              >
                <BarTopLine>
                  <BarLabel>{category.label}</BarLabel>
                  <BarMeta>
                    {formatNumber(category.total)} {currencySymbol} · {percentage.toFixed(1)}%
                  </BarMeta>
                </BarTopLine>
                <BarTrack theme={theme}>
                  <BarFill $width={width} $color={color} />
                </BarTrack>
              </CategoryBarButton>
            );
          })}
        </BarsList>

        <DetailPanel theme={theme}>
          <DetailHeader theme={theme}>
            <DetailTitle theme={theme}>
              {selectedCategory?.label}
            </DetailTitle>
            <DetailSub theme={theme}>
              {selectedCategory?.count || 0} {translations.insert.outflowSection.visualization?.transactions || 'spese'} · {' '}
              {formatNumber(selectedCategory?.total || 0)} {currencySymbol}
            </DetailSub>
          </DetailHeader>
          <DetailList>
            {(selectedCategory?.items || []).map((add, index) => (
              <DetailRow key={`${add.date}-${add.amount}-${index}`} theme={theme}>
                <div>
                  <DetailRowTitle theme={theme}>
                    {add.notes || translateTag(add.paymentType?.label, language, 'payment')}
                  </DetailRowTitle>
                  <DetailRowMeta theme={theme}>
                    {formatDate(add.date)} · {translateTag(add.paymentType?.label, language, 'payment')}
                  </DetailRowMeta>
                </div>
                <DetailRowTitle theme={theme}>
                  {formatNumber(add.amount)} {currencySymbol}
                </DetailRowTitle>
              </DetailRow>
            ))}
          </DetailList>
        </DetailPanel>
      </ChartPanel>
    );
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
            officialTags={OutflowsTags}
            customCategories={customCategories}
            categoryType="expense"
            categoryKey={categoryOutflow.key}
            userCategoryId={categoryOutflow.userCategoryId ?? null}
            onSelect={({ categoryKey, categoryValue, userCategoryId, userCategoryLabel }) =>
              setCategoryOutflow({
                key: categoryKey,
                value: userCategoryLabel || categoryValue,
                parentValue: categoryValue,
                userCategoryId,
                userCategoryLabel,
              })
            }
            onCreateCategory={onCreateCategory}
            placeholder={translations.insert.outflowSection.placeholderCategory}
          />
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
                // Subscriptions/periodic payments default to "make it recurring" —
                // any other typology switches it back off. The user can still
                // uncheck it manually before submitting.
                setMakeRecurring?.(RECURRING_PAYMENT_LABELS.includes(selectedItem.label));
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

        {isRecurringEligibleTypology && (
          <FormField style={{ gridColumn: '1 / -1' }}>
            <RecurringCheckboxLabel theme={theme}>
              <input
                type="checkbox"
                checked={makeRecurring}
                onChange={(e) => setMakeRecurring?.(e.target.checked)}
              />
              {translations.insert.outflowSection.makeRecurring || 'Rendi ricorrente ogni mese'}
            </RecurringCheckboxLabel>
          </FormField>
        )}

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
            {renderBalanceSourceMenuItems(balanceOptions, balanceSourceMeta)}
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
          <HeaderMain>
            <TableTitle theme={theme}>
              {translations.insert.outflowSection.titleListing}
            </TableTitle>
            <ViewSwitch theme={theme} aria-label={translations.insert.outflowSection.visualization?.viewLabel || 'Visualizzazione'}>
              <ViewButton
                type="button"
                theme={theme}
                $active={tableView === 'list'}
                onClick={() => setTableView('list')}
              >
                <FontAwesomeIcon icon={faList} />
                {translations.insert.outflowSection.visualization?.list || 'Lista'}
              </ViewButton>
              <ViewButton
                type="button"
                theme={theme}
                $active={tableView === 'chart'}
                onClick={() => setTableView('chart')}
              >
                <FontAwesomeIcon icon={faChartBar} />
                {translations.insert.outflowSection.visualization?.chart || 'Categorie'}
              </ViewButton>
            </ViewSwitch>
          </HeaderMain>
          <HeaderActions>
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
          </HeaderActions>
        </TableHeader>
        <MonthlySummary theme={theme}>
          <SummaryHero>
            <SummaryLabel theme={theme}>
              {filtersActive
                ? (translations.insert.outflowSection.visualization?.filteredTotal || 'Totale filtrato')
                : (translations.insert.outflowSection.visualization?.monthlyTotal || 'Totale speso nel mese')}
            </SummaryLabel>
            <SummaryValue theme={theme}>
              {isHidden ? '****' : `${formatNumber(filtersActive ? totals.totalFiltered : totals.totalAll)} ${currencySymbol}`}
            </SummaryValue>
            <SummarySubtext theme={theme}>
              {filteredOutflows.length} {translations.insert.outflowSection.visualization?.transactions || 'spese'}
              {filtersActive && totals.totalAll > 0 && !isHidden
                ? ` · ${((totals.totalFiltered / totals.totalAll) * 100).toFixed(1)}% ${translations.insert.outflowSection.visualization?.ofMonth || 'del mese'}`
                : ''}
            </SummarySubtext>
          </SummaryHero>
          <SummaryTile theme={theme}>
            <SummaryLabel theme={theme}>
              {translations.insert.outflowSection.visualization?.topCategory || 'Categoria principale'}
            </SummaryLabel>
            <SummaryTileValue theme={theme}>
              {isHidden ? '****' : topCategory?.label || '-'}
            </SummaryTileValue>
          </SummaryTile>
          <SummaryTile theme={theme}>
            <SummaryLabel theme={theme}>
              {translations.insert.outflowSection.visualization?.averageExpense || 'Spesa media'}
            </SummaryLabel>
            <SummaryTileValue theme={theme}>
              {isHidden ? '****' : `${formatNumber(averageOutflow)} ${currencySymbol}`}
            </SummaryTileValue>
          </SummaryTile>
          <SummaryTile theme={theme}>
            <SummaryLabel theme={theme}>
              {translations.insert.outflowSection.visualization?.categories || 'Categorie'}
            </SummaryLabel>
            <SummaryTileValue theme={theme}>
              {isHidden ? '****' : categoryBreakdown.length}
            </SummaryTileValue>
          </SummaryTile>
        </MonthlySummary>
        {tableView === 'chart' ? (
          renderCategoryChart()
        ) : (
          <TableScroll>
            <StyledTable theme={theme} className="outflow-table">
              <thead>{renderTableHeader()}</thead>
              <tbody>
                {renderOutflowItems(chosenOutflowsToShow)}
              </tbody>
            </StyledTable>
          </TableScroll>
        )}
      </TableSection>
    </SectionWrapper>
  );
}
