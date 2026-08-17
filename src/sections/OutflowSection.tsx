import React from 'react';
import { createPortal } from 'react-dom';
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
  faTableCells,
  faThLarge,
  faUsers,
  faFilter,
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
import { indexToMonthKey } from '../utils/userDataSelectors';
import ThemedSelect, { getMuiSelectMenuProps } from '../components/ThemedSelect';
import DateFilterPopover from '../components/DateFilterPopover';
import CategoryPicker from '../components/CategoryPicker';
import { renderBalanceSourceMenuItems, resolveBalanceSourceLabel } from '../components/multiInsert/balanceSourceMenu';
import { useListViewMode } from '../hooks/useListViewMode';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { inferTransactionPurpose } from '../utils/transactionPurpose';
import {
  ViewSwitch, ViewButton, TableScroll, CardViewWrap,
  FilterToggleRow, FilterBadge, FilterPanel, FilterRow, FilterLabel, FilterInlineRow, ClearFiltersBtn,
  CardList, TxCard, CardTopRow, CardCategory, CardAmount, CardMetaRow, CardNote, CardActionsRow, CardEditGrid,
  TotalCard, ActionBtn, InlineInput,
} from '../components/transactionList/TransactionListStyles';

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

const SharedExpenseIndicator = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin: 0.25rem 0 0 0.35rem;
  padding: 0;
  border-radius: 9px;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(16,185,129,.4)' : 'rgba(5,150,105,.3)'};
  background: ${p => p.theme.mode === 'dark' ? 'rgba(16,185,129,.13)' : 'rgba(5,150,105,.09)'};
  color: ${p => p.theme.buttonBackgroundColor};
  cursor: help;

  .verified {
    position: absolute;
    right: -4px;
    bottom: -4px;
    display: grid;
    place-items: center;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: ${p => p.theme.buttonBackgroundColor};
    color: #fff;
    font-size: 7px;
    border: 2px solid ${p => p.theme.backgroundColor};
  }

`;

const SharedExpenseTooltip = styled.span`
  position: fixed;
  z-index: 10000;
  left: ${p => p.$left}px;
  top: ${p => p.$top}px;
  width: max-content;
  max-width: min(280px, calc(100vw - 24px));
  transform: translateX(-50%);
  padding: 0.55rem 0.7rem;
  border-radius: 10px;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,.13)' : '#dbe3ee'};
  background: ${p => p.theme.mode === 'dark' ? '#17212f' : '#fff'};
  color: ${p => p.theme.textColor};
  box-shadow: 0 10px 26px rgba(0,0,0,.28);
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.55;
  text-align: left;
  white-space: normal;
  pointer-events: none;
`;

const SharedEditPanel = styled.div`
  display: grid;
  gap: 0.45rem;
  margin-top: 0.45rem;
  width: min(100%, 340px);
  max-width: 100%;
  box-sizing: border-box;
  min-width: 0;
  overflow: hidden;
  padding: 0.55rem;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(16,185,129,.28)' : 'rgba(5,150,105,.22)'};
  border-radius: 10px;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(16,185,129,.08)' : 'rgba(5,150,105,.06)'};
  .shared-toggle { display:flex; align-items:center; gap:.45rem; color:${p => p.theme.textColor}; font-size:.75rem; font-weight:700; cursor:pointer; min-width:0; }
  .shared-toggle span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .shared-fields { display:grid; grid-template-columns:minmax(0,1fr) minmax(52px,.45fr); gap:.4rem; min-width:0; }
  .shared-fields > * { min-width:0; width:100%; box-sizing:border-box; }
  small { color:${p => p.theme.textColor}; opacity:.65; line-height:1.35; overflow-wrap:anywhere; }
  @media (max-width:620px) { .shared-fields { grid-template-columns:1fr; } }
`;

const SharedExpenseButton = ({ theme, details, ariaLabel }) => {
  const [tooltipPosition, setTooltipPosition] = React.useState(null);

  const showTooltip = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const safeHalfWidth = Math.min(140, Math.max(80, window.innerWidth / 2 - 12));
    setTooltipPosition({
      left: Math.min(window.innerWidth - safeHalfWidth, Math.max(safeHalfWidth, rect.left + rect.width / 2)),
      top: rect.bottom + 8,
    });
  };

  return (
    <>
      <SharedExpenseIndicator
        theme={theme}
        onMouseEnter={showTooltip}
        onMouseLeave={() => setTooltipPosition(null)}
        onFocus={showTooltip}
        onBlur={() => setTooltipPosition(null)}
        aria-label={ariaLabel}
        role="img"
        tabIndex={0}
        aria-describedby={tooltipPosition ? 'shared-expense-details' : undefined}
      >
        <FontAwesomeIcon icon={faUsers} />
        <span className="verified"><FontAwesomeIcon icon={faCheck} /></span>
      </SharedExpenseIndicator>
      {tooltipPosition && typeof document !== 'undefined' && createPortal(
        <SharedExpenseTooltip
          id="shared-expense-details"
          role="tooltip"
          theme={theme}
          $left={tooltipPosition.left}
          $top={tooltipPosition.top}
        >
          {details}
        </SharedExpenseTooltip>,
        document.body,
      )}
    </>
  );
};

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

const SharedExpenseToggle = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  align-self: flex-start;
  padding: 0.4rem 0.75rem;
  border: 1px solid ${p => p.$active
    ? p.theme.buttonBackgroundColor
    : p.theme.mode === 'dark' ? 'rgba(255,255,255,0.14)' : '#e2e8f0'};
  border-radius: 20px;
  background: ${p => p.$active ? `${p.theme.buttonBackgroundColor}15` : 'transparent'};
  color: ${p => p.$active ? p.theme.buttonBackgroundColor : p.theme.textColor};
  opacity: ${p => p.$active ? 1 : 0.75};
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    border-color: ${p => p.theme.buttonBackgroundColor};
  }

  svg {
    font-size: 0.85em;
  }
`;

const SharedExpenseFields = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;

  label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.78rem;
    color: ${p => p.theme.textColor};
    opacity: 0.75;
  }

  input {
    width: 4rem;
    padding: 0.35rem 0.5rem;
    border-radius: 8px;
    border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};
    background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'white'};
    color: ${p => p.theme.textColor};
    font-size: 0.85rem;
  }
`;

const SharedExpensePreview = styled.span`
  font-size: 0.78rem;
  color: ${p => p.theme.textColor};
  opacity: 0.65;
  font-style: italic;
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
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e2e8f0'};
  background: ${p => p.theme.mode === 'dark' ? p.theme.backgroundColor : '#fff'};
  box-shadow: ${p => p.theme.mode === 'dark'
    ? '0 18px 45px rgba(0,0,0,0.18)'
    : '0 18px 45px rgba(15,23,42,0.07)'};
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
  background: ${p => p.$filtered ? 'rgba(239,68,68,0.13)' : 'rgba(239,68,68,0.2)'};
  color: ${p => p.theme.textColor};
  font-size: 1.02em;
  td { border-top: 1px solid rgba(239,68,68,0.28); }
  td:first-child, td:last-child { background: inherit !important; position: static; }
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
  suggestedNote = null,
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
  sharedReceivables = [],
  onOpenMultiInsert,
  // New props for balance selection
  selectedOption,
  setSelectedOption,
  balanceOptions,
  balanceSourceMeta = null,
  makeRecurring = false,
  setMakeRecurring,
  isSharedExpense = false,
  setIsSharedExpense,
  sharedPeopleCount = 2,
  setSharedPeopleCount,
  outflowDateFilterStart,
  setOutflowDateFilterStart,
  outflowDateFilterEnd,
  setOutflowDateFilterEnd,
  // Flattened view of every loaded month (+ any on-demand fetched extra
  // months) — used instead of the single selected month whenever the date
  // filter is active, so a date range can span across months.
  flatOutflowsForRange,
}) {
  const { language, translations } = React.useContext(LanguageContext);
  const { currencySymbol, formatNumber, fromEUR } = React.useContext(CurrencyContext);
  const pad = (n: number) => String(n).padStart(2, '0');
  const _now = new Date();
  const currentDate = `${_now.getFullYear()}-${pad(_now.getMonth() + 1)}-${pad(_now.getDate())}`;
  // Date-filter bounds: not clamped to the selected month, so a range can
  // span across months (or reach further back, on demand — see fetchMonthDetail).
  const dateFilterMin = `${indexToMonthKey(120)}-01`;
  const dateFilterMax = currentDate;

  const isRecurringEligibleTypology = RECURRING_PAYMENT_LABELS.includes(
    paymentTags.find((item) => item.index === typoOutflow.key)?.label
  );

  // Shared-expense preview: `outflow` already holds the FULL amount fronted
  // (typed in display currency) — only the per-person share ends up counted
  // as a real category outflow, the rest is tracked as a receivable.
  const sharedPeopleCountNum = Math.max(2, Number(sharedPeopleCount) || 2);
  const sharedTotalTyped = parseFloat(outflow) || 0;
  const sharedOwnShare = sharedTotalTyped / sharedPeopleCountNum;
  const sharedReceivable = sharedTotalTyped - sharedOwnShare;
  const formatPlain = (n: number) => `${currencySymbol}${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
  const getSharedReceivable = (expenseId: number) => sharedReceivables.find(
    (item) => Number(item.expenseId) === Number(expenseId),
  );
  const sharedDetails = (item) => {
    if (!item) return null;
    const ratio = item.ownShare > 0 ? item.totalAmount / item.ownShare : 0;
    const people = Number.isInteger(ratio) && ratio >= 2 ? ratio : null;
    const peopleText = people
      ? translations.insert.sharedTransactionLink.peopleCountShort.replace('{count}', String(people))
      : '—';
    return `${translations.insert.sharedTransactionLink.sharedStatus} · ${translations.general.total}: ${formatNumber(fromEUR(item.totalAmount))} ${currencySymbol} · ${peopleText} · ${translations.insert.sharedTransactionLink.ownShare}: ${formatNumber(fromEUR(item.ownShare))} ${currencySymbol}`;
  };

  const renderSharedIndicator = (add) => {
    const shared = getSharedReceivable(add.id);
    if (!shared || isHidden) return null;
    const details = sharedDetails(shared);
    return (
      <SharedExpenseButton
        theme={theme}
        details={details}
        ariaLabel={details}
      />
    );
  };

  const [sortColumn, setSortColumn] = React.useState(null);
  const [sortDirection, setSortDirection] = React.useState('asc');
  const [tableView, setTableView] = React.useState('list');
  // Cards vs. table layout for the transaction list — a persisted user choice
  // (see useListViewMode) rather than a screen-width breakpoint, so it can be
  // picked freely regardless of device.
  const [listLayout, setListLayout] = useListViewMode(STORAGE_KEYS.OUTFLOW_LIST_VIEW_MODE);
  const [selectedChartCategory, setSelectedChartCategory] = React.useState(null);
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);
  const [purposeFilter, setPurposeFilter] = React.useState('');

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
    const linkedShared = getSharedReceivable(add.id);
    const hasStoredSplit = Number(add.cashAmount) > Number(add.amount) + 0.005;
    const shared = linkedShared ?? (hasStoredSplit
      ? {totalAmount: Number(add.cashAmount), ownShare: Number(add.amount)}
      : null);
    const displayAmount = fromEUR(shared?.totalAmount ?? add.cashAmount ?? add.amount ?? 0);
    const ratio = shared?.ownShare > 0 ? shared.totalAmount / shared.ownShare : 0;
    const inferredPeople = Number.isInteger(ratio) && ratio >= 2 ? ratio : 2;
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
      date: add.date ? String(add.date).slice(0, 10) : "",
      purpose: inferTransactionPurpose('outflow', add.categoryTag?.index ?? 0, add.purpose),
      balanceSourceLabel: resolveBalanceSourceLabel(balanceSourceMeta, add),
      sharedEnabled: Boolean(shared),
      sharedMethod: shared && Number.isInteger(ratio) && ratio >= 2 ? 'people' : 'share',
      sharedPeopleCount: inferredPeople,
      sharedOwnShare: String(parseFloat(fromEUR(shared?.ownShare ?? (add.amount ?? 0) / 2).toFixed(2))),
    });
  };

  const handleSaveInline = async () => {
    if (!editValues.categoryKey && editValues.categoryKey !== 0) return;
    if (!editValues.amount || Number(editValues.amount) === 0) return;
    if (editValues.sharedEnabled) {
      const total = Number(editValues.amount);
      const people = Number(editValues.sharedPeopleCount);
      const ownShare = editValues.sharedMethod === 'people' ? total / people : Number(editValues.sharedOwnShare);
      if (!Number.isFinite(ownShare) || ownShare < 0 || ownShare >= total
        || (editValues.sharedMethod === 'people' && (!Number.isInteger(people) || people < 2))) return;
    }
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

  const renderSharedEditControls = () => (
    <SharedEditPanel theme={theme}>
      <label className="shared-toggle">
        <input type="checkbox" checked={Boolean(editValues.sharedEnabled)}
          onChange={(e) => setEditValues(prev => ({
            ...prev,
            sharedEnabled: e.target.checked,
            purpose: e.target.checked ? 'expense' : prev.purpose,
          }))} disabled={isSaving} />
        <FontAwesomeIcon icon={faUsers} />
        <span>{translations.insert.outflowSection.sharedExpense.activeLabel}</span>
      </label>
      {editValues.sharedEnabled && (
        <>
          <div className="shared-fields">
            <InlineSelect theme={theme} value={editValues.sharedMethod}
              onChange={(e) => setEditValues(prev => ({...prev, sharedMethod: e.target.value}))}>
              <option value="people">{translations.insert.sharedTransactionLink.splitByPeople}</option>
              <option value="share">{translations.insert.sharedTransactionLink.specifyShare}</option>
            </InlineSelect>
            {editValues.sharedMethod === 'people' ? (
              <InlineInput type="number" theme={theme} min="2" step="1" value={editValues.sharedPeopleCount}
                onChange={(e) => setEditValues(prev => ({...prev, sharedPeopleCount: e.target.value}))}
                aria-label={translations.insert.outflowSection.sharedExpense?.peopleLabel} />
            ) : (
              <InlineInput type="number" theme={theme} min="0" step="0.01" value={editValues.sharedOwnShare}
                onChange={(e) => setEditValues(prev => ({...prev, sharedOwnShare: e.target.value}))}
                aria-label={translations.insert.sharedTransactionLink.ownShare} />
            )}
          </div>
          <small>{translations.insert.outflowSection.sharedExpense?.editAmountHelp}</small>
        </>
      )}
    </SharedEditPanel>
  );

  const renderPurposeSelect = () => {
    const purposeTranslations = translations.transactionPurpose;
    return (
      <InlineSelect
        theme={theme}
        value={editValues.purpose || 'expense'}
        onChange={(event) => setEditValues(prev => ({...prev, purpose: event.target.value}))}
        disabled={isSaving || editValues.sharedEnabled}
        aria-label={purposeTranslations.label}
        title={purposeTranslations.label}
      >
        {['expense', 'investment', 'transfer', 'debt', 'tax', 'other'].map((purpose) => (
          <option key={purpose} value={purpose}>{purposeTranslations[purpose]}</option>
        ))}
      </InlineSelect>
    );
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
    return parent || translations.general.other || 'Other';
  }, [language, translations.general.other]);

  const getParentCategory = React.useCallback((add) => (
    translateTag(add.categoryTag?.label, language, 'expense') || translations.general.other || 'Other'
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
        (!purposeFilter || inferTransactionPurpose('outflow', add.categoryTag?.index ?? 0, add.purpose) === purposeFilter) &&
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
    purposeFilter,
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
        <th style={{ minWidth: 110 }}>
          {translations.insert.outflowSection.tableColumns.paymentMethod}
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
              placeholder={translations.general.clearFilter || 'Filter...'}
              value={outflowNoteFilter}
              onChange={(e) => setOutflowNoteFilter(e.target.value)}
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
              {translations.general.date || 'Date'}
              {getSortIcon('date')}
            </span>
            <DateFilterPopover
              theme={theme}
              startValue={outflowDateFilterStart}
              endValue={outflowDateFilterEnd}
              onStartChange={setOutflowDateFilterStart}
              onEndChange={setOutflowDateFilterEnd}
              onClear={() => { setOutflowDateFilterStart(''); setOutflowDateFilterEnd(''); }}
              min={min}
              max={max}
              accentColor="#ff6b6b"
              labels={{
                date: translations.general.date || 'Date',
                from: translations.general.from || 'From',
                to: translations.general.to || 'To',
                all: translations.general.allDates || 'All dates',
                clear: translations.general.clearFilter || 'Clear',
              }}
            />
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
      outflowCategoryFilter || outflowTypologyFilter || outflowNoteFilter || purposeFilter ||
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
                        purpose: inferTransactionPurpose('outflow', Number(categoryKey)),
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
                <Select
                  value={editValues.balanceSourceLabel || ''}
                  onChange={(e) => setEditValues(prev => ({ ...prev, balanceSourceLabel: e.target.value }))}
                  displayEmpty
                  fullWidth
                  size="small"
                  sx={selectSx}
                  MenuProps={getMuiSelectMenuProps(theme)}
                >
                  <MenuItem value="">
                    <em>{translations.general.selectAnOption || 'None (optional)'}</em>
                  </MenuItem>
                  {renderBalanceSourceMenuItems(balanceOptions, balanceSourceMeta)}
                </Select>
              </td>
              <td>
                <div style={{ position: 'relative', width: '100%', minWidth: 0 }}>
                  <InlineInput
                    type="text"
                    theme={theme}
                    value={editValues.amount}
                    onChange={handleEditAmountChange}
                    style={{ minWidth: 0, width: '100%', paddingRight: '1.8rem' }}
                  />
                  <span style={{ position: 'absolute', right: '0.55rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8em', opacity: 0.6, pointerEvents: 'none' }}>{currencySymbol}</span>
                </div>
              </td>
              <td style={{ minWidth: 360, width: '34%' }}>
                <InlineInput
                  type="text"
                  theme={theme}
                  value={editValues.note}
                  onChange={(e) => setEditValues(prev => ({ ...prev, note: e.target.value }))}
                  maxLength={64}
                />
                {renderSharedEditControls()}
                {renderPurposeSelect()}
              </td>
              <td>
                <InlineInput
                  type="date"
                  theme={theme}
                  value={editValues.date}
                  onChange={(e) => setEditValues(prev => ({ ...prev, date: e.target.value }))}
                  max={currentDate}
                  style={{ colorScheme: theme.mode === 'dark' ? 'dark' : 'light' }}
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
            <td>{isHidden ? '****' : (resolveBalanceSourceLabel(balanceSourceMeta, add) || '—')}</td>
            <td>
              {isHidden
                ? '****'
                : formatNumber(add.amount)}{' '}{currencySymbol}
            </td>
            <td>
              {isHidden ? '****' : add.notes}
              {renderSharedIndicator(add)}
            </td>
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
    rows.push(
        <TotalRow key="total-visible-outflow" theme={theme} $filtered={Boolean(filtersActive)}>
          <td colSpan={2} style={{ textAlign: 'center' }}>
            {filtersActive
              ? (translations.general.totalFiltered || 'Total Filtered')
              : (translations.general.totalPeriod || 'Total period')}
            {outflowDateRangeActive && (
              <div style={{ fontSize: '0.68em', opacity: 0.65, fontWeight: 400 }}>
                {translations.general.customRangeNote || 'custom range'}
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

  function renderOutflowCards(chosenOutflowsToShow) {
    const filtered = sortOutflowRows(applyTableFilters(chosenOutflowsToShow));
    const totals = getTotals(filtered, chosenOutflowsToShow);
    const filtersActive =
      outflowCategoryFilter || outflowTypologyFilter || outflowNoteFilter || purposeFilter ||
      outflowDateFilterStart || outflowDateFilterEnd;

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
          const rawColor = getCategoryColor(colorKey);
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
                        purpose: inferTransactionPurpose('outflow', Number(categoryKey)),
                      }))
                    }
                    onCreateCategory={onCreateCategory}
                    disabled={isSaving}
                    placeholder={translations.insert.outflowSection.placeholderCategory}
                  />
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
                  <Select
                    value={editValues.balanceSourceLabel || ''}
                    onChange={(e) => setEditValues(prev => ({ ...prev, balanceSourceLabel: e.target.value }))}
                    displayEmpty
                    fullWidth
                    size="small"
                    sx={selectSx}
                    MenuProps={getMuiSelectMenuProps(theme)}
                  >
                    <MenuItem value="">
                      <em>{translations.general.selectAnOption || 'None (optional)'}</em>
                    </MenuItem>
                    {renderBalanceSourceMenuItems(balanceOptions, balanceSourceMeta)}
                  </Select>
                  <div style={{ position: 'relative', width: '100%', minWidth: 0 }}>
                    <InlineInput
                      type="text"
                      theme={theme}
                      value={editValues.amount}
                      onChange={handleEditAmountChange}
                      style={{ width: '100%', minWidth: 0, paddingRight: '1.8rem' }}
                    />
                    <span style={{ position: 'absolute', right: '0.55rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8em', opacity: 0.6, pointerEvents: 'none' }}>{currencySymbol}</span>
                  </div>
                  <InlineInput
                    type="text"
                    theme={theme}
                    value={editValues.note}
                    onChange={(e) => setEditValues(prev => ({ ...prev, note: e.target.value }))}
                    maxLength={64}
                    placeholder={translations.insert.outflowSection.tableColumns?.note || 'Note'}
                  />
                  <InlineInput
                  type="date"
                    theme={theme}
                    value={editValues.date}
                    onChange={(e) => setEditValues(prev => ({ ...prev, date: e.target.value }))}
                    max={currentDate}
                  />
                  {renderSharedEditControls()}
                  {renderPurposeSelect()}
                </CardEditGrid>
                <CardActionsRow>
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
              <CardMetaRow theme={theme}>
                <span>{isHidden ? '****' : translateTag(add.paymentType?.label, language, 'payment')}</span>
                {!isHidden && resolveBalanceSourceLabel(balanceSourceMeta, add) && (
                  <span>{resolveBalanceSourceLabel(balanceSourceMeta, add)}</span>
                )}
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
              {renderSharedIndicator(add)}
              <CardActionsRow>
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
              </CardActionsRow>
            </TxCard>
          );
        })}
        <TotalCard theme={theme} $filtered={Boolean(filtersActive)}>
          <span>
            {filtersActive
              ? (translations.general.totalFiltered || 'Total Filtered')
              : (translations.general.totalPeriod || 'Total period')}
            {outflowDateRangeActive && (
              <div style={{ fontSize: '0.68em', opacity: 0.65, fontWeight: 400 }}>
                {translations.general.customRangeNote || 'custom range'}
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

  const chosenOutflowsToShow = React.useMemo(
    () => getAddsForMonth(allOutflowsAdds, selectedOutflowMonthKey),
    [allOutflowsAdds, selectedOutflowMonthKey],
  );
  // A date-range filter isn't clamped to the selected month (see dateFilterMin/Max
  // above) — once active, the list/cards view reads from every loaded month (+ any
  // on-demand fetched ones) instead of just the current month's bucket, so a range
  // like "all of June through July" actually shows June transactions too.
  const outflowDateRangeActive = Boolean(outflowDateFilterStart || outflowDateFilterEnd);
  const outflowsSourceForList = outflowDateRangeActive && flatOutflowsForRange
    ? flatOutflowsForRange
    : chosenOutflowsToShow;
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
    outflowCategoryFilter || outflowTypologyFilter || outflowNoteFilter || purposeFilter ||
    outflowDateFilterStart || outflowDateFilterEnd;
  const activeFilterCount = [
    outflowCategoryFilter,
    outflowTypologyFilter,
    outflowNoteFilter,
    purposeFilter,
    outflowDateFilterStart || outflowDateFilterEnd,
  ].filter(Boolean).length;
  const mobileDateRange = { min: dateFilterMin, max: dateFilterMax };

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
          {translations.insert.outflowSection.visualization?.empty || 'No outflows for the selected period'}
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
              {selectedCategory?.count || 0} {translations.insert.outflowSection.visualization?.transactions || 'expenses'} · {' '}
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
                purpose: inferTransactionPurpose('outflow', Number(categoryKey)),
              })
            }
            onCreateCategory={onCreateCategory}
            placeholder={translations.insert.outflowSection.placeholderCategory}
          />
        </FormField>

        <FormField>
          <FieldLabel theme={theme}>{translations.transactionPurpose.label}</FieldLabel>
          <Select
            value={categoryOutflow.purpose || inferTransactionPurpose('outflow', Number(categoryOutflow.key))}
            onChange={(event) => setCategoryOutflow((current) => ({...current, purpose: event.target.value}))}
            disabled={isSharedExpense}
            sx={selectSx}
            MenuProps={getMuiSelectMenuProps(theme)}
          >
            {['expense', 'investment', 'transfer', 'debt', 'tax', 'other'].map((purpose) => (
              <MenuItem key={purpose} value={purpose}>{translations.transactionPurpose[purpose]}</MenuItem>
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
              {translations.insert.outflowSection.makeRecurring || 'Make it recurring every month'}
            </RecurringCheckboxLabel>
          </FormField>
        )}

        {/* Shared expense — e.g. paying an Uber/dinner for the whole group.
            Collapsed by default (most outflows aren't shared) — a chip toggle
            instead of an always-visible checkbox keeps the common case clean. */}
        <FormField style={{ gridColumn: '1 / -1' }}>
          <SharedExpenseToggle
            type="button"
            theme={theme}
            $active={isSharedExpense}
            onClick={() => {
              const nextShared = !isSharedExpense;
              setIsSharedExpense?.(nextShared);
              if (nextShared) setCategoryOutflow((current) => ({...current, purpose: 'expense'}));
            }}
          >
            <FontAwesomeIcon icon={isSharedExpense ? faTimes : faUsers} />
            {isSharedExpense
              ? (translations.insert.outflowSection.sharedExpense?.activeLabel || 'Shared expense')
              : (translations.insert.outflowSection.sharedExpense?.toggleLabel || 'Split with the group')}
          </SharedExpenseToggle>
          {isSharedExpense && (
            <SharedExpenseFields theme={theme}>
              <label>
                {translations.insert.outflowSection.sharedExpense?.peopleLabel || 'Total people (including you)'}
                <input
                  type="number"
                  min="2"
                  value={sharedPeopleCount}
                  onChange={(e) => setSharedPeopleCount?.(e.target.value)}
                />
              </label>
              <SharedExpensePreview theme={theme}>
                {(translations.insert.outflowSection.sharedExpense?.previewShare || 'Your share')}: {formatPlain(sharedOwnShare)}
                {' · '}
                {(translations.insert.outflowSection.sharedExpense?.previewReceivable || 'Owed by others')}: {formatPlain(sharedReceivable)}
              </SharedExpensePreview>
            </SharedExpenseFields>
          )}
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
            {translations.insert.outflowSection.decreaseWhichBalance || 'Subtract from'}
          </FieldLabel>
          <Select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            sx={selectSx}
            displayEmpty
            MenuProps={getMuiSelectMenuProps(theme)}
            renderValue={(value) =>
              value === '' ? (translations.general.selectAnOption || 'None (optional)') : value
            }
          >
            <MenuItem value="">
              <em>{translations.general.selectAnOption || 'None (optional)'}</em>
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
          {suggestedNote && (
            <NoteSuggestionButton type="button" theme={theme} onClick={() => setNoteOutflowAreaValue(suggestedNote)}>
              {translations.insert.noteSuggestion.replace('{note}', suggestedNote)}
            </NoteSuggestionButton>
          )}
        </FormField>
      </FormCard>

      <FormFooter>
        <ModernActionButton theme={theme} onClick={onAddOutflow}>
          {translations.insert.outflowSection.updateButton}
        </ModernActionButton>
        {onOpenMultiInsert && (
          <SecondaryFormAction
            type="button"
            theme={theme}
            onClick={onOpenMultiInsert}
            data-umami-event="multi-insert-outflow-opened"
          >
            <FontAwesomeIcon icon={faLayerGroup} />
            {translations.insert.outflowSection.multiInsert?.toggle || 'Multi-insert'}
          </SecondaryFormAction>
        )}
      </FormFooter>

      {/* ── Transaction Table ── */}
      <TableSection theme={theme}>
        <TableHeader theme={theme}>
          <HeaderMain>
            <TableTitle theme={theme}>
              {translations.insert.outflowSection.titleListing}
            </TableTitle>
            <ViewSwitch theme={theme} aria-label={translations.insert.outflowSection.visualization?.viewLabel || 'Outflow view'}>
              <ViewButton
                type="button"
                theme={theme}
                $active={tableView === 'list'}
                onClick={() => setTableView('list')}
              >
                <FontAwesomeIcon icon={faList} />
                {translations.insert.outflowSection.visualization?.list || 'List'}
              </ViewButton>
              <ViewButton
                type="button"
                theme={theme}
                $active={tableView === 'chart'}
                onClick={() => setTableView('chart')}
              >
                <FontAwesomeIcon icon={faChartBar} />
                {translations.insert.outflowSection.visualization?.chart || 'Categories'}
              </ViewButton>
            </ViewSwitch>
            {tableView === 'list' && (
              <ViewSwitch theme={theme} aria-label={translations.insert.outflowSection.visualization?.layoutLabel || 'List layout'}>
                <ViewButton
                  type="button"
                  theme={theme}
                  style={{ colorScheme: theme.mode === 'dark' ? 'dark' : 'light' }}
                  $active={listLayout === 'cards'}
                  onClick={() => setListLayout('cards')}
                >
                  <FontAwesomeIcon icon={faThLarge} />
                  {translations.insert.outflowSection.visualization?.cards || 'Cards'}
                </ViewButton>
                <ViewButton
                  type="button"
                  theme={theme}
                  $active={listLayout === 'table'}
                  onClick={() => setListLayout('table')}
                >
                  <FontAwesomeIcon icon={faTableCells} />
                  {translations.insert.outflowSection.visualization?.table || 'Table'}
                </ViewButton>
              </ViewSwitch>
            )}
          </HeaderMain>
          <HeaderActions>
            <ThemedSelect
              value={purposeFilter}
              onChange={(event) => setPurposeFilter(event.target.value)}
              aria-label={translations.transactionPurpose.label}
            >
              <option value="">{translations.general.all}</option>
              {['expense', 'investment', 'transfer', 'debt', 'tax', 'other'].map((purpose) => (
                <option key={purpose} value={purpose}>{translations.transactionPurpose[purpose]}</option>
              ))}
            </ThemedSelect>
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
                ? (translations.insert.outflowSection.visualization?.filteredTotal || 'Filtered total')
                : (translations.insert.outflowSection.visualization?.monthlyTotal || 'Total spent this month')}
            </SummaryLabel>
            <SummaryValue theme={theme}>
              {isHidden ? '****' : `${formatNumber(filtersActive ? totals.totalFiltered : totals.totalAll)} ${currencySymbol}`}
            </SummaryValue>
            <SummarySubtext theme={theme}>
              {filteredOutflows.length} {translations.insert.outflowSection.visualization?.transactions || 'expenses'}
              {filtersActive && totals.totalAll > 0 && !isHidden
                ? ` · ${((totals.totalFiltered / totals.totalAll) * 100).toFixed(1)}% ${translations.insert.outflowSection.visualization?.ofMonth || 'of the month'}`
                : ''}
            </SummarySubtext>
          </SummaryHero>
          <SummaryTile theme={theme}>
            <SummaryLabel theme={theme}>
              {translations.insert.outflowSection.visualization?.topCategory || 'Top category'}
            </SummaryLabel>
            <SummaryTileValue theme={theme}>
              {isHidden ? '****' : topCategory?.label || '-'}
            </SummaryTileValue>
          </SummaryTile>
          <SummaryTile theme={theme}>
            <SummaryLabel theme={theme}>
              {translations.insert.outflowSection.visualization?.averageExpense || 'Average expense'}
            </SummaryLabel>
            <SummaryTileValue theme={theme}>
              {isHidden ? '****' : `${formatNumber(averageOutflow)} ${currencySymbol}`}
            </SummaryTileValue>
          </SummaryTile>
          <SummaryTile theme={theme}>
            <SummaryLabel theme={theme}>
              {translations.insert.outflowSection.visualization?.categories || 'Categories'}
            </SummaryLabel>
            <SummaryTileValue theme={theme}>
              {isHidden ? '****' : categoryBreakdown.length}
            </SummaryTileValue>
          </SummaryTile>
        </MonthlySummary>
        {tableView === 'chart' ? (
          renderCategoryChart()
        ) : listLayout === 'table' ? (
          <TableScroll>
            <StyledTable theme={theme} className="outflow-table">
              <thead>{renderTableHeader()}</thead>
              <tbody>
                {renderOutflowItems(outflowsSourceForList)}
              </tbody>
            </StyledTable>
          </TableScroll>
        ) : (
            <CardViewWrap>
              <FilterToggleRow theme={theme} type="button" onClick={() => setShowMobileFilters((v) => !v)}>
                <span className="filter-toggle-label">
                  <FontAwesomeIcon icon={faFilter} />
                  {translations.general.filterTransactions || translations.general.filters || 'Filters'}
                  {activeFilterCount > 0 && <FilterBadge theme={theme}>{activeFilterCount}</FilterBadge>}
                </span>
                <FontAwesomeIcon icon={showMobileFilters ? faSortUp : faSortDown} />
              </FilterToggleRow>
              <FilterPanel theme={theme} $open={showMobileFilters}>
                <FilterRow>
                  <FilterLabel theme={theme}>{translations.insert.outflowSection.tableColumns.category}</FilterLabel>
                  <ThemedSelect
                    value={outflowCategoryFilter}
                    onChange={(e) => setOutflowCategoryFilter(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="">{translations.general.all}</option>
                    {OutflowsTags.map((item) => (
                      <option key={item.index} value={translateTag(item.label, language, 'expense')}>
                        {translateTag(item.label, language, 'expense')}
                      </option>
                    ))}
                  </ThemedSelect>
                </FilterRow>
                <FilterRow>
                  <FilterLabel theme={theme}>{translations.insert.outflowSection.tableColumns.typology}</FilterLabel>
                  <ThemedSelect
                    value={outflowTypologyFilter}
                    onChange={(e) => setOutflowTypologyFilter(e.target.value)}
                    style={{ width: '100%' }}
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
                </FilterRow>
                <FilterRow>
                  <FilterLabel theme={theme}>{translations.insert.outflowSection.tableColumns.note}</FilterLabel>
                  <input
                    type="text"
                    placeholder={translations.general.filterByNote}
                    value={outflowNoteFilter}
                    onChange={(e) => setOutflowNoteFilter(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </FilterRow>
                <FilterRow>
                  <FilterLabel theme={theme}>{translations.general.date || 'Data'}</FilterLabel>
                  <FilterInlineRow>
                    <input
                      type="date"
                      value={outflowDateFilterStart || ''}
                      onChange={(e) => setOutflowDateFilterStart(e.target.value)}
                      min={mobileDateRange.min}
                      max={mobileDateRange.max}
                    />
                    <span style={{ fontSize: '0.75em', opacity: 0.7 }}>-</span>
                    <input
                      type="date"
                      value={outflowDateFilterEnd || ''}
                      onChange={(e) => setOutflowDateFilterEnd(e.target.value)}
                      min={mobileDateRange.min}
                      max={mobileDateRange.max}
                    />
                  </FilterInlineRow>
                </FilterRow>
                {activeFilterCount > 0 && (
                  <ClearFiltersBtn
                    type="button"
                    onClick={() => {
                      setOutflowCategoryFilter('');
                      setOutflowTypologyFilter('');
                      setOutflowNoteFilter('');
                      setPurposeFilter('');
                      setOutflowDateFilterStart('');
                      setOutflowDateFilterEnd('');
                    }}
                  >
                    {translations.general.clearAllFilters}
                  </ClearFiltersBtn>
                )}
              </FilterPanel>
              <CardList>
                {renderOutflowCards(outflowsSourceForList)}
              </CardList>
            </CardViewWrap>
        )}
      </TableSection>
    </SectionWrapper>
  );
}
