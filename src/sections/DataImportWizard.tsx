/**
 * DataImportWizard — Multi-step CSV/Excel import component
 * 
 * Steps:
 * 1. Upload: user selects a CSV/Excel file + privacy disclaimer
 * 2. Mapping: user maps columns, selects header row
 * 3. Review: preview parsed data, date range filter, per-row category, select/deselect
 * 4. Import: send data to API, show progress
 */

import React, { useState, useEffect, useContext, useCallback, useRef, useMemo } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import { useAuth } from '../hooks/useAuth';
import { useServices } from '../contexts/ServiceContext';
import { translateTag } from '../data/tagTranslations';

import UploadFileIcon from '@mui/icons-material/UploadFile';
import MapIcon from '@mui/icons-material/AccountTree';
import PreviewIcon from '@mui/icons-material/Preview';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import FilterListIcon from '@mui/icons-material/FilterList';

import UndoIcon from '@mui/icons-material/Undo';
import {
  parseFile,
  autoDetectColumns,
  detectDualAmountColumns,
  detectTableStructure,
  detectDateFormat,
  DATE_FORMATS,
  processRows,
  toAPIFormat,
  summarizeImport,
  ACCEPTED_EXTENSIONS,
  saveMapping,
  loadSavedMappings,
  deleteSavedMapping,
  saveLastImport,
  clearLastImport,
  formatImportWeekday,
} from '../utils/dataImport';
import { EXPENSE_CATEGORY_CODES } from '../data/expenseCategoryCodes';
import { getCategoryColor } from '../data/categoryColors';
import { detectBankFormat } from '../utils/dataImport/bankFormats';
import {
  learnFromTransaction, suggestCategory, findPastMatchesWithDifferentCategory,
} from '../utils/categoryPatterns';
import { getAllOutflows, getAllIncomes, getCustomCategories, getOutflowsTags } from '../utils/userDataSelectors';
import ImportPlatformGuide from '../components/ImportPlatformGuide';
import MonthTransactionsViewer from './MonthTransactionsViewer';
import CategoryPicker from '../components/CategoryPicker';
import { findLikelyDuplicates, findDuplicatesWithinBatch, findLikelyTransfers } from '../utils/duplicateDetection';

// ═══════════════════════════════════════════
// Styled Components
// ═══════════════════════════════════════════

const WizardContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const StepDot = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.3s ease;
  background-color: ${p => p.$active ? p.theme.secondaryColor : p.$done ? p.theme.secondaryColor : (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')};
  color: ${p => p.$active || p.$done ? 'white' : (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)')};
  opacity: ${p => p.$active ? 1 : p.$done ? 0.8 : 0.5};
`;

const StepConnector = styled.div`
  width: 40px;
  height: 2px;
  align-self: center;
  background-color: ${p => p.$done ? p.theme.secondaryColor : (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')};
  transition: all 0.3s ease;
`;

const Card = styled.div`
  padding: ${p => p.$compact ? '1rem' : '1.5rem'};
  border-radius: 12px;
  background-color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)'};
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  margin-bottom: 1rem;
`;

const DropZone = styled.div`
  border: 2px dashed ${p => p.$dragging ? p.theme.secondaryColor : (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)')};
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${p => p.$dragging ? 'rgba(7, 145, 100, 0.08)' : 'transparent'};

  &:hover {
    border-color: ${p => p.theme.secondaryColor};
    background-color: rgba(7, 145, 100, 0.05);
  }
`;

const PreviewTable = styled.div`
  overflow-x: auto;
  overflow-y: auto;
  max-height: ${p => p.$maxHeight || '400px'};
  border-radius: 8px;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
  -webkit-overflow-scrolling: touch;
  position: relative;

  /* Custom horizontal scrollbar */
  &::-webkit-scrollbar {
    height: 6px;
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'};
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'};
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)'};
  }
  scrollbar-width: thin;
  scrollbar-color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.2) rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.15) rgba(0,0,0,0.03)'};
  
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }
  th, td {
    padding: 8px 12px;
    text-align: left;
    border-bottom: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'};
    white-space: nowrap;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  th {
    /* Opaque base + the original tint layered on top as a solid "gradient" —
       a plain translucent background let scrolled row content (dropdowns,
       badges) show through the sticky header instead of being hidden by it. */
    background-color: ${p => p.theme.backgroundColor};
    background-image: linear-gradient(
      ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)'},
      ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)'}
    );
    font-weight: 600;
    color: ${p => p.theme.textColor};
    position: sticky;
    top: 0;
    z-index: 1;
  }
  td {
    color: ${p => p.theme.textColor};
  }
  td.transaction-details-cell {
    min-width: 230px;
    max-width: 280px;
    white-space: normal;
    overflow: visible;
    vertical-align: top;
  }
`;

const SelectField = styled.select`
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'};
  border-radius: 8px;
  background-color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#fff'};
  color: ${p => p.theme.mode === 'dark' ? '#fff' : '#000'};
  font-size: 0.9rem;

  option {
    background-color: ${p => p.theme.mode === 'dark' ? '#2d2d2d' : '#ffffff'};
    color: ${p => p.theme.mode === 'dark' ? '#ffffff' : '#000000'};
  }
`;

const CategoryPickerWrap = styled.div`
  min-width: 160px;
  max-width: 220px;

  .MuiInputBase-root {
    font-size: 0.78rem;
  }
`;

const DateInput = styled.input.attrs({ type: 'date' })`
  padding: 0.4rem 0.6rem;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'};
  border-radius: 8px;
  background-color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#fff'};
  color: ${p => p.theme.mode === 'dark' ? '#fff' : '#000'};
  font-size: 0.85rem;
  color-scheme: ${p => p.theme.mode === 'dark' ? 'dark' : 'light'};
`;

const Btn = styled.button`
  padding: 0.7rem 1.5rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PrimaryBtn = styled(Btn)`
  background-color: #079164;
  color: white;
  &:hover:not(:disabled) { background-color: #06774f; }
`;

const SecondaryBtn = styled(Btn)`
  background-color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'};
  color: ${p => p.theme.textColor};
  &:hover:not(:disabled) { background-color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}; }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 600;
  background-color: ${p => p.$variant === 'success' ? 'rgba(7,145,100,0.15)' : p.$variant === 'error' ? 'rgba(220,53,69,0.15)' : 'rgba(255,193,7,0.15)'};
  color: ${p => p.$variant === 'success' ? '#079164' : p.$variant === 'error' ? '#dc3545' : '#ffc107'};
`;

const InfoBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.65rem 0.9rem;
  margin-bottom: 0.75rem;
  border-radius: 10px;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.08)'};
  border: 1px solid rgba(59,130,246,0.25);
  color: ${p => p.theme.textColor};
  font-size: 0.82rem;

  > span {
    flex: 1 1 auto;
    min-width: 0;
  }

  button {
    flex-shrink: 0;
    border: none;
    background: transparent;
    color: inherit;
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
    opacity: 0.6;
    &:hover { opacity: 1; }
  }
`;

const BankDetectedBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.7rem 0.9rem;
  margin-bottom: 0.9rem;
  border-radius: 10px;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(7,145,100,0.12)' : 'rgba(7,145,100,0.08)'};
  border: 1px solid rgba(7,145,100,0.3);
  color: ${p => p.theme.textColor};
  font-size: 0.85rem;

  > span {
    flex: 1 1 auto;
    min-width: 0;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    font-size: 0.82rem;
    flex: 1 1 auto;
    min-width: 0;
  }
`;

const ProgressBar = styled.div`
  height: 6px;
  border-radius: 3px;
  background-color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
  overflow: hidden;
  margin: 1rem 0;
  
  div {
    height: 100%;
    background-color: ${p => p.theme.secondaryColor};
    border-radius: 3px;
    transition: width 0.3s ease;
  }
`;

const StyledCheckbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #079164;
  flex-shrink: 0;
`;

const NumberInput = styled.input.attrs({ type: 'number' })`
  width: 60px;
  padding: 0.4rem 0.6rem;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'};
  border-radius: 8px;
  background-color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#fff'};
  color: ${p => p.theme.mode === 'dark' ? '#fff' : '#000'};
  font-size: 0.9rem;
  text-align: center;
  -moz-appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const StepperBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'};
  background-color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#fff'};
  color: ${p => p.theme.textColor};
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  &:hover:not(:disabled) {
    background-color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)'};
  }
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const NoteInput = styled.input`
  padding: 0.25rem 0.5rem;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'};
  border-radius: 6px;
  background-color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#fff'};
  color: ${p => p.theme.mode === 'dark' ? '#fff' : '#000'};
  font-size: 0.8rem;
  width: 100%;
  min-width: 100px;
  max-width: 200px;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: ${p => p.theme.secondaryColor};
  }
`;

const TransactionDetails = styled.div`
  display: grid;
  gap: 0.55rem;
  min-width: 0;
`;

const ImportOptionPanel = styled.div`
  display: grid;
  gap: 0.55rem;
  padding: 0.65rem;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.1)'};
  border-radius: 9px;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.035)' : 'rgba(15,23,42,0.025)'};
  color: ${p => p.theme.textColor};
  font-size: 0.76rem;
  white-space: normal;
`;

const ImportOptionTitle = styled.label`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
  cursor: pointer;
  color: ${p => p.theme.textColor};
  font-weight: 650;
`;

const ShareAmountRow = styled.label`
  display: grid;
  grid-template-columns: minmax(76px, auto) minmax(0, 1fr);
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
`;

const AmountInputWrap = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.14)'};
  border-radius: 7px;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(0,0,0,0.16)' : '#fff'};
  color: ${p => p.theme.textColor};
  overflow: hidden;

  span { padding-left: 0.55rem; opacity: 0.68; }
  input {
    width: 100%; min-width: 0; padding: 0.45rem 0.55rem 0.45rem 0.25rem;
    border: 0; outline: 0; background: transparent; color: inherit; font: inherit;
  }
`;

const CompactSelect = styled(SelectField)`
  min-width: 0;
  padding: 0.5rem 2rem 0.5rem 0.65rem;
  font-size: 0.78rem;
  color-scheme: ${p => p.theme.mode === 'dark' ? 'dark' : 'light'};
`;

const ImportOptionHelp = styled.small`
  display: block;
  min-width: 0;
  color: ${p => p.theme.textColor};
  opacity: 0.68;
  line-height: 1.4;
  overflow-wrap: anywhere;
  white-space: normal;
`;

const PaymentSourceFields = styled.div`
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(260px, 1.15fr);
  gap: 0.75rem;
  align-items: end;

  @media (max-width: 680px) { grid-template-columns: 1fr; }
`;

const PaymentField = styled.label`
  display: grid;
  gap: 0.35rem;
  min-width: 0;
  color: ${p => p.theme.textColor};
  font-size: 0.75rem;
  font-weight: 650;
`;

const NewAccountFields = styled.div`
  display: grid;
  grid-template-columns: minmax(130px, 1fr) minmax(145px, 0.8fr);
  gap: 0.55rem;
  min-width: 0;

  @media (max-width: 520px) { grid-template-columns: 1fr; }
`;

const AccountNameInput = styled.input`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 0.55rem 0.7rem;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.14)'};
  border-radius: 8px;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.07)' : '#fff'};
  color: ${p => p.theme.textColor};
  font: inherit;

  &::placeholder { color: ${p => p.theme.textColor}; opacity: 0.48; }
  &:focus { outline: 2px solid ${p => p.theme.buttonBackgroundColor}55; border-color: ${p => p.theme.buttonBackgroundColor}; }
`;

const InfoTooltip = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: ${p => p.theme.secondaryColor};
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  cursor: help;
  margin-left: 4px;
  flex-shrink: 0;
  position: relative;

  &:hover::after {
    content: attr(data-tip);
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    background-color: ${p => p.theme.mode === 'dark' ? '#1a1a2e' : '#333'};
    color: #fff;
    padding: 0.6rem 0.8rem;
    border-radius: 8px;
    font-size: 0.78rem;
    font-weight: 400;
    line-height: 1.4;
    white-space: normal;
    width: max-content;
    max-width: 260px;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    pointer-events: none;
  }

  &:hover::before {
    content: '';
    position: absolute;
    bottom: calc(100% + 2px);
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: ${p => p.theme.mode === 'dark' ? '#1a1a2e' : '#333'};
    z-index: 100;
    pointer-events: none;
  }
`;

// ═══════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════

const DataImportWizard = ({ onClose, onImportComplete }) => {
  const { theme } = useContext(ThemeContext);
  const { language, translations } = useContext(LanguageContext);
  const { currencySymbol, toEUR } = useContext(CurrencyContext);
  const mediaQuery = useContext(MediaQueryContext);
  const isMobile = mediaQuery?.isMobileScreen ?? false;
  const { handleSetIsUpdated, userData, addCustomCategory } = useAuth();
  const { financeService, liquidityAccountService, sharedExpenseService } = useServices();

  // Payment tags from user data (filter out 'none')
  const paymentTags = (userData?.tags?.paymentTags || []).filter(t => t.label !== 'none');

  const t = useMemo(() => translations?.dataImport || {}, [translations]);

  // State
  const [step, setStep] = useState(0); // 0=upload, 1=mapping, 2=review, 3=importing
  const [file, setFile] = useState(null);
  const [allRawRows, setAllRawRows] = useState([]); // ALL rows from file including all raw data
  const [headerRowIndex, setHeaderRowIndex] = useState(0); // 0-based index in allRawRows of the header row
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [parseError, setParseError] = useState(null);

  // Mapping state
  const [dateCol, setDateCol] = useState(-1);
  const [amountCol, setAmountCol] = useState(-1);
  const [dualAmountMode, setDualAmountMode] = useState(false); // separate income/outflow columns
  const [incomeCol, setIncomeCol] = useState(-1);
  const [outflowCol, setOutflowCol] = useState(-1);
  const [categoryCol, setCategoryCol] = useState(-1);
  const [notesCol, setNotesCol] = useState(-1);
  const [mccCol, setMccCol] = useState(-1);
  const [timeCol, setTimeCol] = useState(-1);
  const [dateFormat, setDateFormat] = useState('');
  const [transactionType, setTransactionType] = useState('auto');
  const [defaultOutflowCategory, setDefaultOutflowCategory] = useState(9999);
  const [defaultIncomeCategory, setDefaultIncomeCategory] = useState(9999);
  const [defaultPaymentType, setDefaultPaymentType] = useState(-1); // -1 = not yet initialized
  const [savedMappings, setSavedMappings] = useState(() => loadSavedMappings());
  const [mappingName, setMappingName] = useState('');

  // Review state
  const [validTx, setValidTx] = useState([]);
  const [errorTx, setErrorTx] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set()); // Set of rowIndex values
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [rowCategories, setRowCategories] = useState({}); // { rowIndex: categoryIndex }
  const [rowUserCategoryIds, setRowUserCategoryIds] = useState({}); // { rowIndex: customCategoryId|null }
  const [rowNotes, setRowNotes] = useState({}); // { rowIndex: notesString }
  const [rowSharedExpenses, setRowSharedExpenses] = useState({}); // { rowIndex: own share in display currency }
  const [rowSharedPeople, setRowSharedPeople] = useState({}); // { rowIndex: total people used for automatic split }
  const [rowReimbursements, setRowReimbursements] = useState({}); // { rowIndex: receivable id }
  const [rowAccountIds, setRowAccountIds] = useState({}); // optional per-row receiving account override
  const [showAllRows, setShowAllRows] = useState(false); // toggle to show all rows in preview
  // rowIndex -> reason, for rows flagged as a likely duplicate or a likely
  // transfer between the user's own accounts (see utils/duplicateDetection.ts).
  // Both start deselected by default (safer default), but stay fully editable.
  const [flaggedRows, setFlaggedRows] = useState({});
  // Read-only "what have I already recorded this month" viewer — layered on
  // top of the wizard (not blocking it), opened on demand from the review
  // step so a duplicate badge can actually be checked instead of taken on faith.
  const [showMonthViewer, setShowMonthViewer] = useState(false);

  // Import state
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState(null);
  const [undoing, setUndoing] = useState(false);
  const [undoResult, setUndoResult] = useState(null);

  // Detected bank/institution export format (Revolut, N26 — see utils/dataImport/bankFormats.ts).
  // It is a payment source, never a transaction sub-category.
  const [detectedBank, setDetectedBank] = useState(null);
  const [liquidityAccounts, setLiquidityAccounts] = useState([]);
  const [receivables, setReceivables] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [newAccountLabel, setNewAccountLabel] = useState('');
  const [newAccountAssetKey, setNewAccountAssetKey] = useState('bank');
  const [updateAccountBalance, setUpdateAccountBalance] = useState(false);
  // Rows a bank preset excluded as not belonging in this wizard (e.g. Trade
  // Republic's investment trades — see bankFormats.ts filterRow) — reported
  // to the user rather than silently dropped.
  const [bankFilteredCount, setBankFilteredCount] = useState(0);
  // Informational nudge shown after the user manually recategorizes a row, when
  // past transactions with a similar note are filed under a different category.
  const [retroHint, setRetroHint] = useState(null);

  const fileInputRef = useRef(null);

  // Initialize defaultPaymentType from paymentTags once available
  useEffect(() => {
    if (defaultPaymentType === -1 && paymentTags.length > 0) {
      setDefaultPaymentType(paymentTags[0].index);
    }
  }, [paymentTags, defaultPaymentType]);

  // Note: the local category-suggestion engine (utils/categoryPatterns.ts) is
  // seeded from the user's transaction history once, globally, in
  // UserContext.tsx — not here — so it covers every user on first load, not
  // just those who happen to open this wizard.

  // ─── Derived data ───

  // Apply date range filter and selection to validTx
  const filteredTx = useMemo(() => {
    let txList = validTx;
    if (dateFrom) {
      txList = txList.filter(tx => tx.date >= dateFrom);
    }
    if (dateTo) {
      txList = txList.filter(tx => tx.date <= dateTo);
    }
    return txList;
  }, [validTx, dateFrom, dateTo]);

  // Transactions that will be imported (selected + filtered)
  const importableTx = useMemo(() => {
    return filteredTx.filter(tx => selectedRows.has(tx.rowIndex));
  }, [filteredTx, selectedRows]);

  // Income tags from user data
  const incomesTags = useMemo(() => userData?.tags?.incomesTags || [], [userData]);
  // Official outflow tags and the user's own custom sub-categories — same
  // catalog CategoryPicker uses everywhere else in the app (manual insert,
  // quick-add, edit), so the import review table matches it instead of
  // reinventing an untranslated, custom-category-blind dropdown of its own.
  const outflowsTags = useMemo(() => getOutflowsTags(userData), [userData]);
  const customCategories = useMemo(() => getCustomCategories(userData), [userData]);
  const columnOptions = useMemo(() => headers.map((header, index) => {
    const examples = [...new Set(rows
      .slice(0, 8)
      .map(row => String(row[index] ?? '').trim())
      .filter(Boolean))].slice(0, 2);
    return {
      index,
      label: examples.length > 0 ? `${header || `#${index + 1}`} — ${examples.join(' · ')}` : (header || `#${index + 1}`),
    };
  }), [headers, rows]);

  // Resolves a display label for an official category index, preferring the
  // custom sub-category's own label when one is set (matches what
  // CategoryPicker shows as selected).
  const resolveCategoryLabel = (idx, isOutflow, userCategoryId) => {
    if (userCategoryId != null) {
      const custom = customCategories.find(c => c.id === userCategoryId);
      if (custom) return custom.label;
    }
    const tag = (isOutflow ? outflowsTags : incomesTags).find(t => t.index === idx);
    return translateTag(tag?.label, language, isOutflow ? 'expense' : 'income') || 'Other';
  };

  const selectedAccount = liquidityAccounts.find((account) => String(account.id) === String(selectedAccountId));
  const accountDelta = useMemo(() => importableTx.reduce((total, tx) => (
    total + (tx.isOutflow ? -toEUR(tx.amount) : toEUR(tx.amount))
  ), 0), [importableTx, toEUR]);
  const hasInvalidImportDetails = importableTx.some((tx) => {
    if (rowSharedExpenses[tx.rowIndex] !== undefined) {
      const ownShare = Number(rowSharedExpenses[tx.rowIndex]);
      if (!Number.isFinite(ownShare) || ownShare < 0 || ownShare >= tx.amount) return true;
    }
    if (rowReimbursements[tx.rowIndex]) {
      const receivingAccountId = rowAccountIds[tx.rowIndex] || selectedAccountId;
      if (!receivingAccountId || (receivingAccountId === 'new' && !newAccountLabel.trim())) return true;
    }
    return false;
  });

  useEffect(() => {
    if (step !== 2) return;
    let active = true;
    Promise.all([liquidityAccountService.getAccounts(), sharedExpenseService.getReceivables()])
      .then(([accounts, items]) => {
        if (!active) return;
        setLiquidityAccounts(Array.isArray(accounts) ? accounts : []);
        setReceivables(Array.isArray(items) ? items : []);
        const providerLabel = detectedBank ? (t.bankNames?.[detectedBank] || detectedBank) : '';
        setNewAccountLabel(providerLabel);
        const match = accounts.find((account) => account.label.toLocaleLowerCase() === providerLabel.toLocaleLowerCase());
        if (match) setSelectedAccountId(String(match.id));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [step, detectedBank, liquidityAccountService, sharedExpenseService, t.bankNames]);

  // Maps a "YYYY-MM-DD" date to its index in the 13-month window
  // getAllOutflows/getAllIncomes are bucketed by (0 = current calendar month),
  // so the month viewer opens already on the month being imported.
  const monthIndexForDate = (dateStr) => {
    if (!dateStr) return 0;
    const now = new Date();
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 0;
    const diff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    return Math.min(Math.max(diff, 0), 12);
  };

  // Live summary based on importable transactions (with category overrides).
  // Category label is always re-resolved through resolveCategoryLabel — never
  // trust tx.categoryLabel as-is, since matchCategory/matchCategoryByMCC
  // (utils/dataImport.ts) are pure, language-agnostic utilities that always
  // return the English canonical label; only this UI layer knows the current
  // app language.
  const liveSummary = useMemo(() => {
    if (importableTx.length === 0) return null;
    const txWithOverrides = importableTx.map(tx => {
      const idx = rowCategories[tx.rowIndex] !== undefined ? rowCategories[tx.rowIndex] : tx.categoryIndex;
      const userCategoryId = rowUserCategoryIds[tx.rowIndex] ?? null;
      let modified = { ...tx, categoryIndex: idx, categoryLabel: resolveCategoryLabel(idx, tx.isOutflow, userCategoryId) };
      if (rowNotes[tx.rowIndex] !== undefined) {
        modified = { ...modified, notes: rowNotes[tx.rowIndex] };
      }
      return modified;
    });
    return summarizeImport(txWithOverrides);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importableTx, rowCategories, rowUserCategoryIds, rowNotes, outflowsTags, incomesTags, customCategories, language]);

  // ─── Step 0: Upload ───

  const handleFileSelect = useCallback(async (selectedFile) => {
    setParseError(null);
    if (!selectedFile) return;

    try {
      const result = await parseFile(selectedFile);
      const rawRows = result.allRows || [result.headers, ...result.rows];
      setFile(selectedFile);
      setAllRawRows(rawRows);

      // Statements often contain account metadata before the transaction
      // table. Locate it from both header names and the values underneath;
      // the user can still override this row manually in the next step.
      const structure = detectTableStructure(rawRows);
      const hIdx = structure.headerRowIndex;
      setHeaderRowIndex(hIdx);
      const h = rawRows[hIdx] || [];
      let r = rawRows.slice(hIdx + 1);
      setHeaders(h);

      // Known bank export? Use its verified column mapping directly instead of
      // guessing (see utils/dataImport/bankFormats.ts) — skips manual mapping entirely.
      const bankFormat = detectBankFormat(h);
      setDetectedBank(bankFormat?.bank ?? null);
      setDualAmountMode(false);
      setMccCol(-1);
      setTimeCol(-1);

      let dateColForFormat;
      if (bankFormat) {
        if (bankFormat.filterRow) {
          const before = r.length;
          r = r.filter(bankFormat.filterRow);
          setBankFilteredCount(before - r.length);
        } else {
          setBankFilteredCount(0);
        }
        setDateCol(bankFormat.mapping.dateCol);
        setAmountCol(bankFormat.mapping.amountCol);
        setCategoryCol(bankFormat.mapping.categoryCol ?? -1);
        setNotesCol(bankFormat.mapping.notesCol ?? -1);
        setMccCol(bankFormat.mapping.mccCol ?? -1);
        setTimeCol(bankFormat.mapping.timeCol ?? -1);
        dateColForFormat = bankFormat.mapping.dateCol;
      } else {
        setBankFilteredCount(0);
        // Auto-detect columns
        const detected = autoDetectColumns(h, r);
        if (detected.dateCol !== null) setDateCol(detected.dateCol);
        if (detected.amountCol !== null) setAmountCol(detected.amountCol);
        if (detected.categoryCol !== null) setCategoryCol(detected.categoryCol);
        if (detected.notesCol !== null) setNotesCol(detected.notesCol);
        if (detected.mccCol !== null) setMccCol(detected.mccCol);
        if (detected.timeCol !== null) setTimeCol(detected.timeCol);
        dateColForFormat = detected.dateCol;

        // Separate income/outflow columns instead of one signed amount column?
        const dual = detectDualAmountColumns(h, r);
        if (dual) {
          setDualAmountMode(true);
          setIncomeCol(dual.incomeCol);
          setOutflowCol(dual.outflowCol);
        }
      }
      setRows(r);

      // Auto-detect date format
      if (dateColForFormat !== null && dateColForFormat !== undefined) {
        const samples = r.slice(0, 10).map(row => row[dateColForFormat]);
        const fmt = detectDateFormat(samples);
        if (fmt) setDateFormat(fmt);
      }

      setStep(1);
    } catch (err) {
      if (err.message === 'FILE_TOO_SHORT') {
        setParseError(t.errorFileTooShort || 'File must have at least a header row and one data row');
      } else if (err.message === 'UNSUPPORTED_FORMAT') {
        setParseError(t.errorUnsupportedFormat || 'Unsupported file format. Use CSV or Excel (.xlsx)');
      } else {
        setParseError(t.errorParseFailed || 'Failed to read file. Check the format and try again.');
      }
    }
  }, [t]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  }, [handleFileSelect]);

  // ─── Header Row Change ───

  const handleHeaderRowChange = useCallback((newIdx) => {
    const idx = Math.max(0, Math.min(newIdx, allRawRows.length - 2));
    setHeaderRowIndex(idx);
    const h = allRawRows[idx] || [];
    let r = allRawRows.slice(idx + 1);
    setHeaders(h);

    // Re-run detection: known bank format first, generic heuristic otherwise
    const bankFormat = detectBankFormat(h);
    setDetectedBank(bankFormat?.bank ?? null);
    setDualAmountMode(false);
    setMccCol(-1);
    setTimeCol(-1);
    let dateColForFormat;
    if (bankFormat) {
      if (bankFormat.filterRow) {
        const before = r.length;
        r = r.filter(bankFormat.filterRow);
        setBankFilteredCount(before - r.length);
      } else {
        setBankFilteredCount(0);
      }
      setDateCol(bankFormat.mapping.dateCol);
      setAmountCol(bankFormat.mapping.amountCol);
      setCategoryCol(bankFormat.mapping.categoryCol ?? -1);
      setNotesCol(bankFormat.mapping.notesCol ?? -1);
      setMccCol(bankFormat.mapping.mccCol ?? -1);
      setTimeCol(bankFormat.mapping.timeCol ?? -1);
      dateColForFormat = bankFormat.mapping.dateCol;
    } else {
      setBankFilteredCount(0);
      const detected = autoDetectColumns(h, r);
      setDateCol(detected.dateCol !== null ? detected.dateCol : -1);
      setAmountCol(detected.amountCol !== null ? detected.amountCol : -1);
      setCategoryCol(detected.categoryCol !== null ? detected.categoryCol : -1);
      setNotesCol(detected.notesCol !== null ? detected.notesCol : -1);
      setMccCol(detected.mccCol !== null ? detected.mccCol : -1);
      setTimeCol(detected.timeCol !== null ? detected.timeCol : -1);
      dateColForFormat = detected.dateCol;

      const dual = detectDualAmountColumns(h, r);
      if (dual) {
        setDualAmountMode(true);
        setIncomeCol(dual.incomeCol);
        setOutflowCol(dual.outflowCol);
      }
    }
    setRows(r);

    if (dateColForFormat !== null && dateColForFormat !== undefined) {
      const samples = r.slice(0, 10).map(row => row[dateColForFormat]);
      const fmt = detectDateFormat(samples);
      setDateFormat(fmt || '');
    } else {
      setDateFormat('');
    }
  }, [allRawRows]);

  // ─── Step 1: Mapping ───

  const handleApplySavedMapping = (saved) => {
    const m = saved.mapping;
    const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const resolveColumn = (index, name) => {
      if (name) {
        const matched = headers.findIndex(header => normalize(header) === normalize(name));
        if (matched >= 0) return matched;
      }
      return Number.isInteger(index) && index >= 0 && index < headers.length ? index : -1;
    };
    const names = m.columnNames || {};
    setDateCol(resolveColumn(m.dateCol, names.date));
    setAmountCol(resolveColumn(m.amountCol, names.amount));
    setDualAmountMode(m.dualAmountMode || false);
    setIncomeCol(resolveColumn(m.incomeCol, names.income));
    setOutflowCol(resolveColumn(m.outflowCol, names.outflow));
    setCategoryCol(resolveColumn(m.categoryCol, names.category));
    setNotesCol(resolveColumn(m.notesCol, names.notes));
    setMccCol(resolveColumn(m.mccCol, names.mcc));
    setTimeCol(resolveColumn(m.timeCol, names.time));
    setDateFormat(m.dateFormat || '');
    setTransactionType(m.transactionType || 'auto');
    setDefaultOutflowCategory(m.defaultOutflowCategoryIndex ?? m.defaultCategoryIndex ?? 9999);
    setDefaultIncomeCategory(m.defaultIncomeCategoryIndex ?? 9999);
    if (m.defaultPaymentTypeIndex !== undefined) setDefaultPaymentType(m.defaultPaymentTypeIndex);
  };

  const handleSaveMapping = () => {
    if (!mappingName.trim()) return;
    const mapping = {
      dateCol, amountCol, dualAmountMode,
      incomeCol: dualAmountMode ? incomeCol : -1,
      outflowCol: dualAmountMode ? outflowCol : -1,
      categoryCol: categoryCol === -1 ? null : categoryCol,
      notesCol: notesCol === -1 ? null : notesCol,
      mccCol: mccCol === -1 ? null : mccCol,
      timeCol: timeCol === -1 ? null : timeCol,
      columnNames: {
        date: headers[dateCol] ?? null,
        amount: headers[amountCol] ?? null,
        income: headers[incomeCol] ?? null,
        outflow: headers[outflowCol] ?? null,
        category: headers[categoryCol] ?? null,
        notes: headers[notesCol] ?? null,
        mcc: headers[mccCol] ?? null,
        time: headers[timeCol] ?? null,
      },
      dateFormat, transactionType,
      defaultOutflowCategoryIndex: defaultOutflowCategory,
      defaultIncomeCategoryIndex: defaultIncomeCategory,
      defaultPaymentTypeIndex: defaultPaymentType,
    };
    saveMapping(mappingName.trim(), mapping);
    setSavedMappings(loadSavedMappings());
    setMappingName('');
  };

  const handleDeleteMapping = (name) => {
    deleteSavedMapping(name);
    setSavedMappings(loadSavedMappings());
  };

  const isMappingValid = dateCol >= 0 && dateFormat !== '' && (
    dualAmountMode ? (incomeCol >= 0 || outflowCol >= 0) : amountCol >= 0
  );

  const handleProcessRows = () => {
    const mapping = {
      dateCol, amountCol: dualAmountMode ? -1 : amountCol,
      dualAmountMode,
      incomeCol: dualAmountMode ? incomeCol : -1,
      outflowCol: dualAmountMode ? outflowCol : -1,
      categoryCol: categoryCol === -1 ? null : categoryCol,
      notesCol: notesCol === -1 ? null : notesCol,
      mccCol: mccCol === -1 ? null : mccCol,
      timeCol: timeCol === -1 ? null : timeCol,
      dateFormat, transactionType, defaultCategoryIndex: defaultOutflowCategory,
    };
    const { valid: rawValid, errors } = processRows(rows, mapping);
    // Post-process: assign correct default category for incomes
    const valid = rawValid.map(tx => {
      if (!tx.isOutflow && tx.categoryIndex === defaultOutflowCategory) {
        // Row used the outflow default — replace with income default
        const tag = incomesTags.find(it => it.index === defaultIncomeCategory);
        return { ...tx, categoryIndex: defaultIncomeCategory, categoryLabel: translateTag(tag?.label, language, 'income') || 'Other' };
      }
      return tx;
    });
    setValidTx(valid);
    setErrorTx(errors);
    setSummary(summarizeImport(valid));
    // Pre-populate date filter with min/max from parsed data
    const dates = valid.map(tx => tx.date).filter(Boolean).sort();
    setDateFrom(dates[0] || '');
    setDateTo(dates[dates.length - 1] || '');

    // Duplicate/transfer detection — flags rows that look like they repeat
    // something already in the file or already in the user's history, or that
    // look like a transfer between the user's own accounts (same amount,
    // close dates, opposite flow) rather than genuine income/spending.
    const validOutflows = valid.filter(tx => tx.isOutflow);
    const validIncomes = valid.filter(tx => !tx.isOutflow);
    const historyOutflows = getAllOutflows(userData).flat().filter(Boolean)
      .map(e => ({ date: e.date ? e.date.slice(0, 10) : null, amount: e.amount, notes: e.notes }));
    const historyIncomes = getAllIncomes(userData).flat().filter(Boolean)
      .map(e => ({ date: e.date ? e.date.slice(0, 10) : null, amount: e.amount, notes: e.notes }));

    // Each flag carries not just the kind but, when available, the specific
    // matched/existing transaction it collided with — so the user can see
    // WHICH entry it thinks this duplicates instead of taking it on faith.
    const flags = {};
    findDuplicatesWithinBatch(validOutflows).forEach(m => { flags[m.item.rowIndex] = { kind: 'duplicate', matchedAgainst: m.matchedAgainst }; });
    findDuplicatesWithinBatch(validIncomes).forEach(m => { flags[m.item.rowIndex] = { kind: 'duplicate', matchedAgainst: m.matchedAgainst }; });
    findLikelyDuplicates(validOutflows, historyOutflows).forEach(m => { flags[m.item.rowIndex] = { kind: 'duplicate', matchedAgainst: m.matchedAgainst }; });
    findLikelyDuplicates(validIncomes, historyIncomes).forEach(m => { flags[m.item.rowIndex] = { kind: 'duplicate', matchedAgainst: m.matchedAgainst }; });
    findLikelyTransfers(validOutflows, validIncomes).forEach(({ outflow, income }) => {
      flags[outflow.rowIndex] = { kind: 'transfer', matchedAgainst: income };
      flags[income.rowIndex] = { kind: 'transfer', matchedAgainst: outflow };
    });
    // Rows whose own source type/category column says "transfer" (e.g. Trade
    // Republic's TRANSFER_INSTANT_INBOUND) — flagged directly, without
    // needing a matching opposite-flow row in the same file (e.g. a
    // recurring top-up from another account of the user's, where the
    // outgoing leg isn't part of this import at all). No specific matched
    // transaction to point to here — the source file itself said so.
    valid.forEach(tx => {
      if (tx.isLikelyTransfer && !flags[tx.rowIndex]) flags[tx.rowIndex] = { kind: 'transfer', matchedAgainst: null };
    });
    setFlaggedRows(flags);

    // Flagged rows start deselected (safer default) — everything else selected
    setSelectedRows(new Set(valid.filter(tx => !flags[tx.rowIndex]).map(tx => tx.rowIndex)));

    // Rows that fell back to the plain default category (no in-file category
    // column match) get a smarter per-row suggestion from the user's own
    // learned patterns — including their own custom sub-categories, not just
    // official ones — when confident enough. Still fully editable below.
    const patternSuggestions = {};
    const patternSuggestionUserCategoryIds = {};
    valid.forEach(tx => {
      const defaultForFlow = tx.isOutflow ? defaultOutflowCategory : defaultIncomeCategory;
      if (tx.categoryIndex === defaultForFlow && tx.notes) {
        const suggestion = suggestCategory(tx.notes, tx.isOutflow, customCategories);
        if (suggestion) {
          patternSuggestions[tx.rowIndex] = suggestion.categoryIndex;
          patternSuggestionUserCategoryIds[tx.rowIndex] = suggestion.userCategoryId;
        }
      }
    });
    setRowCategories(patternSuggestions);
    setRowUserCategoryIds(patternSuggestionUserCategoryIds);
    setRowNotes({});
    setRetroHint(null);
    setShowAllRows(false);
    setStep(2);
  };

  // ─── Step 2: Review helpers ───

  const toggleRow = (rowIndex) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(rowIndex)) {
        next.delete(rowIndex);
      } else {
        next.add(rowIndex);
      }
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      filteredTx.forEach(tx => next.add(tx.rowIndex));
      return next;
    });
  };

  const deselectAllFiltered = () => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      filteredTx.forEach(tx => next.delete(tx.rowIndex));
      return next;
    });
  };

  const handleRowCategoryChange = (tx, { categoryKey, userCategoryId }) => {
    setRowCategories(prev => ({ ...prev, [tx.rowIndex]: categoryKey }));
    setRowUserCategoryIds(prev => ({ ...prev, [tx.rowIndex]: userCategoryId ?? null }));
    const note = getEffectiveNote(tx);
    if (!note) { setRetroHint(null); return; }
    // Teach the local suggestion engine from this correction, then check whether
    // it now disagrees with how similar past transactions were already filed —
    // purely informational (no bulk edit here; user can still fix those manually).
    learnFromTransaction(note, categoryKey, tx.isOutflow, userCategoryId ?? null);
    const history = (tx.isOutflow ? getAllOutflows(userData) : getAllIncomes(userData))
      .flat().filter(Boolean);
    const matches = findPastMatchesWithDifferentCategory(history, note, categoryKey, userCategoryId ?? null);
    setRetroHint(matches.length > 0 ? { rowIndex: tx.rowIndex, count: matches.length } : null);
  };

  const handleRowNoteChange = (rowIndex, newNote) => {
    setRowNotes(prev => ({ ...prev, [rowIndex]: newNote }));
  };

  const getEffectiveNote = (tx) => {
    return rowNotes[tx.rowIndex] !== undefined ? rowNotes[tx.rowIndex] : tx.notes;
  };

  const getEffectiveCategory = (tx) => {
    const userCategoryId = rowUserCategoryIds[tx.rowIndex] ?? null;
    const idx = rowCategories[tx.rowIndex] !== undefined ? rowCategories[tx.rowIndex] : tx.categoryIndex;
    return { index: idx, label: resolveCategoryLabel(idx, tx.isOutflow, userCategoryId), userCategoryId };
  };

  // ─── Step 3: Import ───

  const handleImport = async () => {
    setStep(3);
    setImporting(true);
    setImportProgress(0);

    // Build final list with category and note overrides
    const finalTx = importableTx.map(tx => {
      const idx = rowCategories[tx.rowIndex] !== undefined ? rowCategories[tx.rowIndex] : tx.categoryIndex;
      const userCategoryId = rowUserCategoryIds[tx.rowIndex] ?? null;
      let modified = { ...tx, categoryIndex: idx, categoryLabel: resolveCategoryLabel(idx, tx.isOutflow, userCategoryId), userCategoryId };
      if (rowNotes[tx.rowIndex] !== undefined) {
        modified = { ...modified, notes: rowNotes[tx.rowIndex] };
      }
      return modified;
    });

    let account = selectedAccount;
    if (selectedAccountId === 'new') {
      try {
        account = await liquidityAccountService.saveAccount({
          asset_key: newAccountAssetKey,
          label: newAccountLabel.trim(),
          current_value: 0,
          currency: 'EUR',
        });
        setLiquidityAccounts((current) => [...current, account]);
        setSelectedAccountId(String(account.id));
      } catch {
        account = null;
      }
    }

    let success = 0;
    let failed = 0;
    let linkFailures = 0;
    const total = finalTx.length;
    const API_BATCH_SIZE = 500;

    for (let i = 0; i < total; i += API_BATCH_SIZE) {
      const batch = finalTx.slice(i, i + API_BATCH_SIZE);
      try {
        const result = await financeService.addExpensesAndIncomesBatch({
          expenses: batch.map(tx => {
            const expense = toAPIFormat({ ...tx, amount: toEUR(tx.amount) }, defaultPaymentType).expense;
            const rowAccount = liquidityAccounts.find((item) => String(item.id) === String(rowAccountIds[tx.rowIndex])) || account;
            if (rowAccount) {
              expense.balance_source = {
                asset_key: rowAccount.assetKey,
                detail_type: 'liquidity',
                detail_id: rowAccount.id,
              };
            }
            const ownShare = Number(rowSharedExpenses[tx.rowIndex]);
            if (tx.isOutflow && Number.isFinite(ownShare)) {
              expense.cash_amount = expense.amount;
              expense.amount = toEUR(ownShare);
              expense.shared_expense = { own_share: expense.amount };
            }
            const reimbursementTarget = rowReimbursements[tx.rowIndex];
            const receivableId = Number(reimbursementTarget);
            if (!tx.isOutflow && typeof reimbursementTarget === 'string' && reimbursementTarget.startsWith('shared:')) {
              expense.reimbursement_shared_expense_ref = reimbursementTarget;
              expense.exclude_from_statistics = true;
            } else if (!tx.isOutflow && Number.isFinite(receivableId)) {
              expense.reimbursement_receivable_id = receivableId;
              expense.exclude_from_statistics = true;
            }
            if (expense.shared_expense) expense.shared_expense.client_ref = `shared:${tx.rowIndex}`;
            return expense;
          }),
        });
        success += result.inserted;
        linkFailures += result.link_failures || 0;
        failed += batch.length - result.inserted;
      } catch {
        failed += batch.length;
      }
      setImportProgress(Math.min(((i + batch.length) / total) * 100, 100));
    }

    if (success === total && account && updateAccountBalance) {
      const deltasByAccount = new Map();
      finalTx.forEach((tx) => {
        const target = liquidityAccounts.find((item) => String(item.id) === String(rowAccountIds[tx.rowIndex])) || account;
        if (!target) return;
        deltasByAccount.set(target.id, {
          account: target,
          delta: (deltasByAccount.get(target.id)?.delta || 0) + (tx.isOutflow ? -toEUR(tx.amount) : toEUR(tx.amount)),
        });
      });
      try {
        await Promise.all(Array.from(deltasByAccount.values()).map(async ({ account: target, delta }) => {
          const updated = await liquidityAccountService.saveAccount({
            id: target.id,
            asset_key: target.assetKey,
            label: target.label,
            current_value: target.currentValue + delta,
            currency: target.currency,
            notes: target.notes,
          });
          await liquidityAccountService.saveAccountHistory({
            account_id: updated.id,
            user_date: dateTo || new Date().toISOString().slice(0, 10),
            current_value: updated.currentValue,
          });
        }));
      } catch {
        // Transactions are already safely imported. Do not mark/retry them:
        // the persisted balance_source lets the user reconcile the account.
      }
    }

    setImporting(false);
    const savedTxForUndo = finalTx.map(tx => ({
      date: tx.date,
      amount: toEUR(tx.amount),
      is_expense: tx.isOutflow,
    }));
    setImportResult({ success, failed, linkFailures, total, _savedTx: savedTxForUndo });

    if (success > 0) {
      saveLastImport(savedTxForUndo);
      handleSetIsUpdated(false);
    }
  };

  // ─── Undo last import ───

  const handleUndo = async () => {
    setUndoing(true);
    setUndoResult(null);

    // Re-read the saved transactions from the import we just did
    const importedTx = importResult?._savedTx;
    if (!importedTx || importedTx.length === 0) {
      setUndoing(false);
      setUndoResult({ success: 0, failed: 0 });
      return;
    }

    let success = 0;
    let failed = 0;
    const BATCH_SIZE = 5;

    for (let i = 0; i < importedTx.length; i += BATCH_SIZE) {
      const batch = importedTx.slice(i, i + BATCH_SIZE);
      const promises = batch.map(tx =>
        financeService.deleteExpenseOrIncome({ expense: tx })
          .then(() => { success++; })
          .catch(() => { failed++; })
      );
      await Promise.all(promises);
    }

    setUndoing(false);
    setUndoResult({ success, failed });
    clearLastImport();

    if (success > 0) {
      handleSetIsUpdated(false);
    }
  };

  // ─── Render Helpers ───

  const steps = [
    { icon: <UploadFileIcon style={{ fontSize: 18 }} />, label: t.stepUpload || 'Upload' },
    { icon: <MapIcon style={{ fontSize: 18 }} />, label: t.stepMapping || 'Mapping' },
    { icon: <PreviewIcon style={{ fontSize: 18 }} />, label: t.stepReview || 'Review' },
    { icon: <CheckCircleIcon style={{ fontSize: 18 }} />, label: t.stepImport || 'Import' },
  ];

  const selectedFilteredCount = filteredTx.filter(tx => selectedRows.has(tx.rowIndex)).length;
  const PREVIEW_LIMIT = 50;

  return (
    <WizardContainer>
      {/* Step Indicator */}
      <StepIndicator>
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 && <StepConnector theme={theme} $done={step > i - 1} />}
            <StepDot theme={theme} $active={step === i} $done={step > i}>
              {step > i ? <CheckCircleIcon style={{ fontSize: 18 }} /> : i + 1}
            </StepDot>
          </React.Fragment>
        ))}
      </StepIndicator>

      {/* ════ STEP 0: Upload ════ */}
      {step === 0 && (
        <>
          {/* Privacy Disclaimer */}
          <Card theme={theme} style={{ borderLeft: '4px solid #ffc107' }}>
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
              <LockIcon style={{ color: '#ffc107', fontSize: 24, marginTop: 2, flexShrink: 0 }} />
              <div>
                <p style={{ color: theme.textColor, fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  {t.privacyTitle || '🔒 Your privacy matters'}
                </p>
                <p style={{ color: theme.textColor, opacity: 0.8, fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                  {t.privacyDescription || 'For your safety, we recommend removing any personal information (name, IBAN, address, account number, etc.) from your file before uploading.'}
                </p>
                <p style={{ color: theme.textColor, opacity: 0.8, fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {t.privacyReassurance || 'In any case, only the columns you explicitly select (date, amount, category, notes) will be imported — no other data from your file is sent to our servers.'}
                </p>
              </div>
            </div>
          </Card>

          <Card theme={theme}>
            <h3 style={{ color: theme.textColor, marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>
              {t.uploadTitle || '📂 Select your file'}
            </h3>
            <p style={{ color: theme.textColor, opacity: 0.7, marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {t.uploadDescription || 'Upload a CSV or Excel file with your financial data. We support any format — you\'ll map the columns in the next step.'}
            </p>

            <ImportPlatformGuide theme={theme} platformIds={['genericBank', 'genericDigital', 'paypal', 'wise', 'revolut', 'n26', 'traderepublic', 'fineco']} />

            <DropZone
              theme={theme}
              $dragging={dragging}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <CloudUploadIcon style={{ fontSize: 48, color: theme.secondaryColor, marginBottom: '1rem' }} />
              <p style={{ color: theme.textColor, fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                {t.dropzoneTitle || 'Drag & drop your file here'}
              </p>
              <p style={{ color: theme.textColor, opacity: 0.5, fontSize: '0.85rem' }}>
                {t.dropzoneSubtitle || 'or click to browse — CSV, Excel (.xlsx)'}
              </p>
            </DropZone>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />

            {parseError && (
              <div style={{ marginTop: '1rem', padding: '0.8rem', borderRadius: 8, backgroundColor: 'rgba(220,53,69,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ErrorIcon style={{ color: '#dc3545', fontSize: 20 }} />
                <span style={{ color: '#dc3545', fontSize: '0.9rem' }}>{parseError}</span>
              </div>
            )}
          </Card>

          <Card theme={theme} $compact>
            <p style={{ color: theme.textColor, opacity: 0.6, fontSize: '0.8rem', lineHeight: 1.5, textAlign: 'center' }}>
              {t.privacyFooter || 'If your file contains personal data in the first rows (name, IBAN, etc.), don\'t worry — in the next step you can select which row the actual data table starts from.'}
            </p>
          </Card>
        </>
      )}

      {/* ════ STEP 1: Column Mapping ════ */}
      {step === 1 && (
        <>
          <Card theme={theme}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ color: theme.textColor, fontSize: '1.2rem', fontWeight: 600 }}>
                {t.mappingTitle || '🗺️ Map your columns'}
              </h3>
              <Badge $variant="success">
                {file?.name} — {allRawRows.length} {t.rows || 'rows'}
              </Badge>
            </div>

            {detectedBank && (
              <BankDetectedBanner theme={theme}>
                <span>
                  ✅ {(t.bankDetected || 'Detected: {bank} — columns mapped automatically.')
                    .replace('{bank}', t.bankNames?.[detectedBank] || detectedBank)}
                </span>
              </BankDetectedBanner>
            )}

            {bankFilteredCount > 0 && (
              <InfoBanner theme={theme}>
                <span>
                  ℹ️ {(t.bankRowsSkipped || '{count} rows were investment trades and were skipped — import those from Import Investments instead.')
                    .replace('{count}', bankFilteredCount)}
                </span>
              </InfoBanner>
            )}

            {/* Header Row Selector */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem',
              padding: '0.8rem', borderRadius: 8,
              backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              flexWrap: 'wrap'
            }}>
              <span style={{ color: theme.textColor, fontSize: '0.9rem', fontWeight: 500 }}>
                📌 {t.headerRowLabel || 'Header row (column names):'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <StepperBtn
                  theme={theme}
                  onClick={() => handleHeaderRowChange(Math.max(0, headerRowIndex - 1))}
                  disabled={headerRowIndex <= 0}
                >−</StepperBtn>
                <NumberInput
                  theme={theme}
                  min={1}
                  max={allRawRows.length - 1}
                  value={headerRowIndex + 1}
                  onChange={e => handleHeaderRowChange(parseInt(e.target.value) - 1 || 0)}
                />
                <StepperBtn
                  theme={theme}
                  onClick={() => handleHeaderRowChange(Math.min(allRawRows.length - 2, headerRowIndex + 1))}
                  disabled={headerRowIndex >= allRawRows.length - 2}
                >+</StepperBtn>
              </div>
              <span style={{ color: theme.textColor, opacity: 0.6, fontSize: '0.8rem' }}>
                {t.headerRowHint || '(rows above will be skipped)'}
              </span>
            </div>

            {/* Preview of raw rows around header */}
            <p style={{ color: theme.textColor, opacity: 0.7, fontSize: '0.85rem', marginBottom: '0.8rem' }}>
              {t.mappingPreview || 'Preview of your data (first 5 rows):'}
            </p>
            <PreviewTable theme={theme}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 40, textAlign: 'center' }}>#</th>
                    {headers.map((h, i) => (
                      <th key={i}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Show a few rows before header if header > 0, marked as "skipped" */}
                  {headerRowIndex > 0 && allRawRows.slice(Math.max(0, headerRowIndex - 2), headerRowIndex).map((row, ri) => {
                    const actualRow = Math.max(0, headerRowIndex - 2) + ri;
                    return (
                      <tr key={`skip-${actualRow}`} style={{ opacity: 0.4, fontStyle: 'italic' }}>
                        <td style={{ textAlign: 'center', fontSize: '0.75rem' }}>{actualRow + 1}</td>
                        {row.slice(0, headers.length).map((cell, ci) => (
                          <td key={ci}>{cell}</td>
                        ))}
                      </tr>
                    );
                  })}
                  {/* Header row highlighted */}
                  <tr style={{ backgroundColor: theme.mode === 'dark' ? 'rgba(7,145,100,0.15)' : 'rgba(7,145,100,0.08)' }}>
                    <td style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: theme.secondaryColor }}>{headerRowIndex + 1}</td>
                    {headers.map((h, i) => (
                      <td key={i} style={{ fontWeight: 700, color: theme.secondaryColor }}>{h}</td>
                    ))}
                  </tr>
                  {/* Data rows */}
                  {rows.slice(0, 5).map((row, ri) => (
                    <tr key={ri}>
                      <td style={{ textAlign: 'center', fontSize: '0.75rem', opacity: 0.5 }}>{headerRowIndex + 2 + ri}</td>
                      {row.slice(0, headers.length).map((cell, ci) => (
                        <td key={ci}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </PreviewTable>
            {headers.length > 3 && (
              <p style={{ 
                color: theme.textColor, 
                opacity: 0.45, 
                fontSize: '0.75rem', 
                textAlign: 'right', 
                marginTop: '0.35rem',
                fontStyle: 'italic'
              }}>
                {t.scrollHint || 'Scroll horizontally to see all columns →'}
              </p>
            )}
          </Card>

          {/* Saved Mappings */}
          {savedMappings.length > 0 && (
            <Card theme={theme} $compact>
              <p style={{ color: theme.textColor, fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                {t.savedMappings || '💾 Saved Mappings'}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {savedMappings.map((sm, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <SecondaryBtn theme={theme} onClick={() => handleApplySavedMapping(sm)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      {sm.name}
                    </SecondaryBtn>
                    <button onClick={() => handleDeleteMapping(sm.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', padding: 2 }}>
                      <CloseIcon style={{ fontSize: 14 }} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Column Mapping Form */}
          <Card theme={theme}>
            <p style={{ color: theme.textColor, fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem' }}>
              {t.mappingInstructions || 'Tell us which column contains what:'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
              {/* Date Column */}
              <div>
                <label style={{ color: theme.textColor, fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>
                  📅 {t.dateColumn || 'Date'} *
                </label>
                <SelectField theme={theme} value={dateCol} onChange={e => setDateCol(parseInt(e.target.value))}>
                  <option value={-1}>— {t.selectColumn || 'Select column'} —</option>
                  {columnOptions.map(({ index, label }) => <option key={index} value={index}>{label}</option>)}
                </SelectField>
              </div>

              {/* Date Format */}
              <div>
                <label style={{ color: theme.textColor, fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>
                  📅 {t.dateFormat || 'Date format'} *
                </label>
                <SelectField theme={theme} value={dateFormat} onChange={e => setDateFormat(e.target.value)}>
                  <option value="">— {t.selectFormat || 'Select format'} —</option>
                  {DATE_FORMATS.map(f => <option key={f.label} value={f.label}>{f.label}</option>)}
                </SelectField>
              </div>

              {/* Amount Column — single or dual mode */}
              {!dualAmountMode ? (
                <div>
                  <label style={{ color: theme.textColor, fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>
                    💰 {t.amountColumn || 'Amount'} *
                  </label>
                  <SelectField theme={theme} value={amountCol} onChange={e => setAmountCol(parseInt(e.target.value))}>
                    <option value={-1}>— {t.selectColumn || 'Select column'} —</option>
                    {columnOptions.map(({ index, label }) => <option key={index} value={index}>{label}</option>)}
                  </SelectField>
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ color: theme.textColor, fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>
                      📉 {t.outflowColumn || 'Outflow column'} ({t.optional || 'optional'})
                    </label>
                    <SelectField theme={theme} value={outflowCol} onChange={e => setOutflowCol(parseInt(e.target.value))}>
                      <option value={-1}>— {t.noColumn || 'None'} —</option>
                      {columnOptions.map(({ index, label }) => <option key={index} value={index}>{label}</option>)}
                    </SelectField>
                  </div>
                  <div>
                    <label style={{ color: theme.textColor, fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>
                      📈 {t.incomeColumn || 'Income column'} ({t.optional || 'optional'})
                    </label>
                    <SelectField theme={theme} value={incomeCol} onChange={e => setIncomeCol(parseInt(e.target.value))}>
                      <option value={-1}>— {t.noColumn || 'None'} —</option>
                      {columnOptions.map(({ index, label }) => <option key={index} value={index}>{label}</option>)}
                    </SelectField>
                  </div>
                </>
              )}

              {/* Toggle dual amount mode */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <StyledCheckbox
                  checked={dualAmountMode}
                  onChange={e => {
                    setDualAmountMode(e.target.checked);
                    if (e.target.checked) {
                      setAmountCol(-1);
                      setTransactionType('auto');
                    } else {
                      setIncomeCol(-1);
                      setOutflowCol(-1);
                    }
                  }}
                />
                <span style={{ color: theme.textColor, fontSize: '0.83rem', opacity: 0.8 }}>
                  {t.dualAmountToggle || 'My file has separate columns for incomes and outflows'}
                </span>
              </div>

              {/* Transaction Type — only in single mode */}
              {!dualAmountMode && (
                <div>
                  <label style={{ color: theme.textColor, fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>
                    📊 {t.transactionType || 'Transaction type'}
                  </label>
                  <SelectField theme={theme} value={transactionType} onChange={e => setTransactionType(e.target.value)}>
                    <option value="auto">{t.typeAuto || 'Auto (- = outflow, + = income)'}</option>
                    <option value="outflow">{t.typeAllOutflows || 'All outflows'}</option>
                    <option value="income">{t.typeAllIncomes || 'All incomes'}</option>
                  </SelectField>
                </div>
              )}

              {/* Category Column */}
              <div>
                <label style={{ color: theme.textColor, fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>
                  📁 {t.categoryColumnFile || 'Category column in your file'} ({t.optional || 'optional'})
                </label>
                <SelectField theme={theme} value={categoryCol} onChange={e => setCategoryCol(parseInt(e.target.value))}>
                  <option value={-1}>— {t.noColumn || 'None'} —</option>
                  {columnOptions.map(({ index, label }) => <option key={index} value={index}>{label}</option>)}
                </SelectField>
              </div>

              {/* Default Category for Outflows */}
              {transactionType !== 'income' && (
                <div>
                  <label style={{ color: theme.textColor, fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    🏷️ {t.defaultOutflowCategory || 'Default outflow category'}
                    <InfoTooltip theme={theme} data-tip={t.defaultCategoryInfo || 'This category will be assigned to all imported transactions. You can change each one individually in the next step.'}>i</InfoTooltip>
                  </label>
                  <SelectField theme={theme} value={defaultOutflowCategory} onChange={e => setDefaultOutflowCategory(parseInt(e.target.value))}>
                    {(outflowsTags.length > 0 ? outflowsTags : EXPENSE_CATEGORY_CODES).map(c => (
                      <option key={c.index} value={c.index}>{translateTag(c.label, language, 'expense') || c.translationKey}</option>
                    ))}
                  </SelectField>
                </div>
              )}

              {/* Default Category for Incomes */}
              {transactionType !== 'outflow' && (
                <div>
                  <label style={{ color: theme.textColor, fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    🏷️ {t.defaultIncomeCategory || 'Default income category'}
                    <InfoTooltip theme={theme} data-tip={t.defaultIncomeCategoryInfo || 'This category will be assigned to all imported incomes. You can change each one individually in the next step.'}>i</InfoTooltip>
                  </label>
                  <SelectField theme={theme} value={defaultIncomeCategory} onChange={e => setDefaultIncomeCategory(parseInt(e.target.value))}>
                    {incomesTags.length > 0 ? (
                      incomesTags.map(c => (
                        <option key={c.index} value={c.index}>{translateTag(c.label, language, 'income') || c.label}</option>
                      ))
                    ) : (
                      <option value={9999}>Other</option>
                    )}
                  </SelectField>
                </div>
              )}

              {/* Default Payment Type */}
              {paymentTags.length > 0 && (
                <div>
                  <label style={{ color: theme.textColor, fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>
                    💳 {t.defaultPaymentType || 'Payment type'}
                  </label>
                  <SelectField theme={theme} value={defaultPaymentType} onChange={e => setDefaultPaymentType(parseInt(e.target.value))}>
                    {paymentTags.map(pt => (
                      <option key={pt.index} value={pt.index}>
                        {translateTag(pt.label, language, 'payment') || pt.label}
                      </option>
                    ))}
                  </SelectField>
                </div>
              )}

              {/* Notes Column */}
              <div>
                <label style={{ color: theme.textColor, fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>
                  📝 {t.notesColumn || 'Notes'} ({t.optional || 'optional'})
                </label>
                <SelectField theme={theme} value={notesCol} onChange={e => setNotesCol(parseInt(e.target.value))}>
                  <option value={-1}>— {t.noColumn || 'None'} —</option>
                  {columnOptions.map(({ index, label }) => <option key={index} value={index}>{label}</option>)}
                </SelectField>
              </div>
            </div>

            {/* Save Mapping */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder={t.mappingNamePlaceholder || 'Mapping name (e.g. "My Bank")'}
                value={mappingName}
                onChange={e => setMappingName(e.target.value)}
                style={{
                  flex: 1, minWidth: 180, padding: '0.5rem 0.8rem', borderRadius: 8,
                  border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                  backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#fff',
                  color: theme.mode === 'dark' ? '#fff' : '#000',
                  fontSize: '0.85rem',
                }}
              />
              <SecondaryBtn theme={theme} onClick={handleSaveMapping} disabled={!mappingName.trim() || !isMappingValid} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                <SaveIcon style={{ fontSize: 16 }} /> {t.saveMapping || 'Save'}
              </SecondaryBtn>
            </div>
          </Card>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <SecondaryBtn theme={theme} onClick={() => { setStep(0); setFile(null); }}>
              <ArrowBackIcon style={{ fontSize: 18 }} /> {t.back || 'Back'}
            </SecondaryBtn>
            <PrimaryBtn onClick={handleProcessRows} disabled={!isMappingValid}>
              {t.next || 'Next'} <ArrowForwardIcon style={{ fontSize: 18 }} />
            </PrimaryBtn>
          </div>
        </>
      )}

      {/* ════ STEP 2: Review ════ */}
      {step === 2 && summary && (
        <>
          <Card theme={theme}>
            <h3 style={{ color: theme.textColor, marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>
              {t.reviewTitle || '📋 Review before importing'}
            </h3>

            {Object.keys(flaggedRows).length > 0 && (
              <p style={{ color: theme.textColor, opacity: 0.75, fontSize: '0.85rem', marginBottom: '1rem' }}>
                ⚠️ {(t.flaggedRowsNote || '{count} rows look like possible duplicates or transfers between your own accounts, and were deselected by default — check the badges below and re-select any that are actually genuine.')
                  .replace('{count}', String(Object.keys(flaggedRows).length))}
              </p>
            )}

            {/* Summary Cards — based on live selection */}
            {liveSummary && (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '0.8rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', borderRadius: 10, backgroundColor: 'rgba(7,145,100,0.08)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.secondaryColor }}>{liveSummary.totalTransactions}</div>
                  <div style={{ fontSize: '0.8rem', color: theme.textColor, opacity: 0.7 }}>{t.totalTransactions || 'Total transactions'}</div>
                </div>
                <div style={{ padding: '1rem', borderRadius: 10, backgroundColor: 'rgba(220,53,69,0.08)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc3545' }}>
                    {liveSummary.outflowCount} ({currencySymbol}{liveSummary.outflowTotal.toLocaleString('it-IT', { maximumFractionDigits: 2 })})
                  </div>
                  <div style={{ fontSize: '0.8rem', color: theme.textColor, opacity: 0.7 }}>{t.outflows || 'Outflows'}</div>
                </div>
                <div style={{ padding: '1rem', borderRadius: 10, backgroundColor: 'rgba(39,174,96,0.08)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#27ae60' }}>
                    {liveSummary.incomeCount} ({currencySymbol}{liveSummary.incomeTotal.toLocaleString('it-IT', { maximumFractionDigits: 2 })})
                  </div>
                  <div style={{ fontSize: '0.8rem', color: theme.textColor, opacity: 0.7 }}>{t.incomes || 'Incomes'}</div>
                </div>
              </div>
            )}

            {/* Date range info */}
            {liveSummary?.dateRange?.from && (
              <p style={{ color: theme.textColor, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                📅 {t.dateRange || 'Date range'}: <strong>{liveSummary.dateRange.from}</strong> → <strong>{liveSummary.dateRange.to}</strong>
              </p>
            )}

            {/* Errors */}
            {errorTx.length > 0 && (
              <div style={{ marginTop: '1rem', padding: '0.8rem', borderRadius: 8, backgroundColor: 'rgba(255,193,7,0.1)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <WarningIcon style={{ color: '#ffc107', fontSize: 20 }} />
                <span style={{ color: '#ffc107', fontSize: '0.9rem', fontWeight: 500 }}>
                  {errorTx.length} {t.rowsWithErrors || 'rows with errors (will be skipped)'}
                </span>
                <SecondaryBtn theme={theme} onClick={() => setShowErrors(!showErrors)} style={{ padding: '0.3rem 0.8rem', fontSize: '0.78rem', marginLeft: 'auto' }}>
                  {showErrors ? (t.hideErrors || 'Hide') : (t.showErrors || 'Show details')}
                </SecondaryBtn>
              </div>
            )}

            {showErrors && errorTx.length > 0 && (
              <PreviewTable theme={theme} style={{ marginTop: '0.5rem' }}>
                <table>
                  <thead>
                    <tr><th>{t.row || 'Row'}</th><th>{t.error || 'Error'}</th></tr>
                  </thead>
                  <tbody>
                    {errorTx.slice(0, 20).map((e, i) => (
                      <tr key={i}><td>{e.rowIndex + headerRowIndex + 2}</td><td style={{ color: '#dc3545' }}>{e.error}</td></tr>
                    ))}
                    {errorTx.length > 20 && (
                      <tr><td colSpan={2} style={{ textAlign: 'center', fontStyle: 'italic' }}>
                        ...{t.andMore || 'and'} {errorTx.length - 20} {t.more || 'more'}
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </PreviewTable>
            )}
          </Card>

          {/* Date Range Filter */}
          <Card theme={theme} $compact>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
              <FilterListIcon style={{ color: theme.textColor, opacity: 0.6, fontSize: 20 }} />
              <span style={{ color: theme.textColor, fontWeight: 600, fontSize: '0.9rem' }}>
                {t.filterByDate || 'Filter by date'}:
              </span>
              <DateInput
                theme={theme}
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                placeholder={t.from || 'From'}
              />
              <span style={{ color: theme.textColor, opacity: 0.5 }}>→</span>
              <DateInput
                theme={theme}
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                placeholder={t.to || 'To'}
              />
              {(dateFrom || dateTo) && (
                <SecondaryBtn theme={theme} onClick={() => { setDateFrom(''); setDateTo(''); }} style={{ padding: '0.3rem 0.8rem', fontSize: '0.78rem' }}>
                  {t.clearFilter || 'Clear'}
                </SecondaryBtn>
              )}
            </div>
          </Card>

          <Card theme={theme} $compact>
            <p style={{ color: theme.textColor, fontWeight: 650, marginBottom: '0.4rem', fontSize: '0.9rem' }}>
              {t.paymentSourceTitle || 'Payment source and account balance'}
            </p>
            <p style={{ color: theme.textColor, opacity: 0.72, fontSize: '0.8rem', lineHeight: 1.45, marginBottom: '0.65rem' }}>
              {(t.paymentSourceHelp || 'The file provider is a bank or payment source, not a transaction category. Link it to an account to keep every movement traceable.')}
            </p>
            <PaymentSourceFields>
              <PaymentField theme={theme}>
                <span>{t.paymentAccount || t.paymentSourceTitle || 'Payment account'}</span>
                <CompactSelect theme={theme} value={selectedAccountId} onChange={(event) => setSelectedAccountId(event.target.value)}>
                  <option value="">{t.noLinkedAccount || 'Do not link an account'}</option>
                  {liquidityAccounts.map((accountItem) => (
                    <option key={accountItem.id} value={accountItem.id}>{accountItem.label}</option>
                  ))}
                  <option value="new">{t.createPaymentAccount || '+ Create a payment account'}</option>
                </CompactSelect>
              </PaymentField>
              {selectedAccountId === 'new' && (
                <NewAccountFields>
                  <PaymentField theme={theme}>
                    <span>{t.accountName || 'Account name'}</span>
                    <AccountNameInput theme={theme} value={newAccountLabel} onChange={(event) => setNewAccountLabel(event.target.value)} placeholder={t.accountName || 'Account name'} />
                  </PaymentField>
                  <PaymentField theme={theme}>
                    <span>{t.accountType || 'Account type'}</span>
                    <CompactSelect theme={theme} value={newAccountAssetKey} onChange={(event) => setNewAccountAssetKey(event.target.value)}>
                      <option value="bank">{t.bankAccount || 'Bank'}</option>
                      <option value="digitalServices">{t.digitalAccount || 'Payment platform'}</option>
                      <option value="cash">{t.cashAccount || 'Cash'}</option>
                    </CompactSelect>
                  </PaymentField>
                </NewAccountFields>
              )}
            </PaymentSourceFields>
            {selectedAccountId && (
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: theme.textColor, fontSize: '0.82rem', cursor: 'pointer', marginTop: '0.75rem' }}>
                <input type="checkbox" checked={updateAccountBalance} onChange={(event) => setUpdateAccountBalance(event.target.checked)} />
                <span>
                  {(t.applyBalanceDelta || 'Update this account with the net change from selected movements: {amount}')
                    .replace('{amount}', `${accountDelta >= 0 ? '+' : ''}${currencySymbol}${accountDelta.toFixed(2)}`)}
                  <small style={{ display: 'block', opacity: 0.65 }}>{t.applyBalanceDeltaWarning || 'Enable only if these movements have not already been applied to the current balance.'}</small>
                </span>
              </label>
            )}
          </Card>

          {/* Category Breakdown */}
          {liveSummary && (
            <Card theme={theme} $compact>
              <p style={{ color: theme.textColor, fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.9rem' }}>
                {t.categoryBreakdown || '📊 Category Breakdown'}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {Object.entries(liveSummary.categoryCounts)
                  .sort(([, a], [, b]) => b.count - a.count)
                  .map(([cat, data]) => (
                    <Badge key={cat} $variant="success" style={{ backgroundColor: getCategoryColor(cat) || 'rgba(7,145,100,0.15)' }}>
                      {cat}: {data.count}
                    </Badge>
                  ))
                }
              </div>
            </Card>
          )}

          {retroHint && (
            <InfoBanner theme={theme}>
              <span>
                {(t.retroHint || '{count} past transactions with a similar note are filed under a different category.')
                  .replace('{count}', retroHint.count)}
                {' '}{t.retroHintSuggestion || 'You can update them manually from the transaction history.'}
              </span>
              <button type="button" onClick={() => setRetroHint(null)} aria-label={t.dismiss || 'Dismiss'}>×</button>
            </InfoBanner>
          )}

          {/* Transactions Table with Selection & Category Editing */}
          <Card theme={theme} $compact>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <p style={{ color: theme.textColor, fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>
                {t.parsedPreview || '👁️ Parsed data preview'}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <SecondaryBtn theme={theme} onClick={selectAllFiltered} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                  {t.selectAll || 'Select all'}
                </SecondaryBtn>
                <SecondaryBtn theme={theme} onClick={deselectAllFiltered} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                  {t.deselectAll || 'Deselect all'}
                </SecondaryBtn>
                <SecondaryBtn theme={theme} onClick={() => setShowMonthViewer(true)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                  {t.viewMonthButton || '👁️ View already-recorded transactions'}
                </SecondaryBtn>
                <Badge $variant={selectedFilteredCount > 0 ? 'success' : 'warning'}>
                  {selectedFilteredCount}/{filteredTx.length} {t.selected || 'selected'}
                </Badge>
              </div>
            </div>

            <PreviewTable theme={theme}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 40, textAlign: 'center' }}>
                      <StyledCheckbox
                        checked={selectedFilteredCount === filteredTx.length && filteredTx.length > 0}
                        onChange={() => {
                          if (selectedFilteredCount === filteredTx.length) {
                            deselectAllFiltered();
                          } else {
                            selectAllFiltered();
                          }
                        }}
                      />
                    </th>
                    <th>{t.date || 'Date'}</th>
                    <th>{t.amount || 'Amount'}</th>
                    <th>{t.type || 'Type'} / {t.category || 'Category'}</th>
                    <th>{t.notes || 'Notes'}</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllRows ? filteredTx : filteredTx.slice(0, PREVIEW_LIMIT)).map((tx) => {
                    const isSelected = selectedRows.has(tx.rowIndex);
                    const effectiveCat = getEffectiveCategory(tx);
                    return (
                      <tr key={tx.rowIndex} style={{ opacity: isSelected ? 1 : 0.4 }}>
                        <td style={{ textAlign: 'center' }}>
                          <StyledCheckbox
                            checked={isSelected}
                            onChange={() => toggleRow(tx.rowIndex)}
                          />
                        </td>
                        <td>
                          <div>{tx.date}</div>
                          <div style={{ fontSize: '0.72rem', opacity: 0.72, textTransform: 'capitalize' }}>
                            {formatImportWeekday(tx.date, language)}
                          </div>
                          {tx.time && (
                            <div style={{ fontSize: '0.72rem', opacity: 0.6 }}>{tx.time}</div>
                          )}
                        </td>
                        <td style={{ color: tx.isOutflow ? '#dc3545' : '#27ae60', fontWeight: 600 }}>
                          {tx.isOutflow ? '-' : '+'}{currencySymbol}{tx.amount.toFixed(2)}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                            <Badge $variant={tx.isOutflow ? 'error' : 'success'}>
                              {tx.isOutflow ? (t.outflow || 'Outflow') : (t.income || 'Income')}
                            </Badge>
                            {flaggedRows[tx.rowIndex]?.kind === 'duplicate' && (
                              <Badge $variant="warning" title={t.duplicateHint || 'Looks like it might already be recorded — deselected by default.'}>
                                {t.duplicateBadge || 'Possible duplicate'}
                              </Badge>
                            )}
                            {flaggedRows[tx.rowIndex]?.kind === 'transfer' && (
                              <Badge $variant="warning" title={t.transferHint || 'Matches an opposite-flow entry with the same amount — might be a transfer between your own accounts, not real income/spending.'}>
                                {t.transferBadge || 'Possible transfer'}
                              </Badge>
                            )}
                          </div>
                          {flaggedRows[tx.rowIndex]?.matchedAgainst && (
                            <div style={{ fontSize: '0.72rem', opacity: 0.65, marginBottom: '0.3rem' }}>
                              {(t.matchedAgainstLabel || 'Similar to:')}{' '}
                              {flaggedRows[tx.rowIndex].matchedAgainst.date}
                              {' · '}{currencySymbol}{Number(flaggedRows[tx.rowIndex].matchedAgainst.amount).toFixed(2)}
                              {flaggedRows[tx.rowIndex].matchedAgainst.notes ? ` · ${flaggedRows[tx.rowIndex].matchedAgainst.notes}` : ''}
                            </div>
                          )}
                          <CategoryPickerWrap>
                            <CategoryPicker
                              theme={theme}
                              officialTags={tx.isOutflow ? outflowsTags : incomesTags}
                              customCategories={customCategories}
                              categoryType={tx.isOutflow ? 'expense' : 'income'}
                              categoryKey={effectiveCat.index}
                              userCategoryId={effectiveCat.userCategoryId}
                              onSelect={(selection) => handleRowCategoryChange(tx, selection)}
                              onCreateCategory={(parentIndex, label) => (
                                addCustomCategory
                                  ? addCustomCategory({ label, parent_index: parentIndex, is_expense: tx.isOutflow })
                                  : Promise.reject(new Error('addCustomCategory unavailable'))
                              )}
                              placeholder={t.category || 'Category'}
                            />
                          </CategoryPickerWrap>
                        </td>
                        <td className="transaction-details-cell">
                          <TransactionDetails>
                          <NoteInput
                            theme={theme}
                            value={getEffectiveNote(tx)}
                            onChange={e => handleRowNoteChange(tx.rowIndex, e.target.value)}
                            maxLength={64}
                            placeholder={t.addNote || '—'}
                          />
                          {tx.isOutflow ? (
                            <ImportOptionPanel theme={theme}>
                              <ImportOptionTitle theme={theme}>
                                <StyledCheckbox
                                  type="checkbox"
                                  checked={rowSharedExpenses[tx.rowIndex] !== undefined}
                                  onChange={(event) => setRowSharedExpenses((current) => {
                                    const next = { ...current };
                                    if (event.target.checked) {
                                      next[tx.rowIndex] = (tx.amount / 2).toFixed(2);
                                      setRowSharedPeople((people) => ({...people, [tx.rowIndex]: 2}));
                                    } else {
                                      delete next[tx.rowIndex];
                                      setRowSharedPeople((people) => { const updated = {...people}; delete updated[tx.rowIndex]; return updated; });
                                    }
                                    return next;
                                  })}
                                />
                                {t.sharedExpense || 'Shared expense'}
                              </ImportOptionTitle>
                              {rowSharedExpenses[tx.rowIndex] !== undefined && (
                                <>
                                  <ShareAmountRow theme={theme}>
                                    <span>{t.peopleCount || 'People'}</span>
                                    <AmountInputWrap theme={theme}>
                                      <input
                                        type="number"
                                        min="2"
                                        step="1"
                                        value={rowSharedPeople[tx.rowIndex] || 2}
                                        onChange={(event) => {
                                          const people = Math.max(2, Number(event.target.value) || 2);
                                          setRowSharedPeople((current) => ({...current, [tx.rowIndex]: people}));
                                          setRowSharedExpenses((current) => ({...current, [tx.rowIndex]: (tx.amount / people).toFixed(2)}));
                                        }}
                                      />
                                    </AmountInputWrap>
                                  </ShareAmountRow>
                                  <ShareAmountRow theme={theme}>
                                    <span>{t.myShare || 'My share'}</span>
                                    <AmountInputWrap theme={theme}>
                                      <span>{currencySymbol}</span>
                                      <input
                                        type="number"
                                        min="0"
                                        max={tx.amount}
                                        step="0.01"
                                        value={rowSharedExpenses[tx.rowIndex]}
                                        onChange={(event) => setRowSharedExpenses((current) => ({ ...current, [tx.rowIndex]: event.target.value }))}
                                      />
                                    </AmountInputWrap>
                                  </ShareAmountRow>
                                  <ImportOptionHelp theme={theme}>
                                    {(t.sharedExpenseCreditPreview || 'A receivable of {amount} will remain visible until reimbursed.')
                                      .replace('{amount}', `${currencySymbol}${Math.max(0, tx.amount - Number(rowSharedExpenses[tx.rowIndex] || 0)).toFixed(2)}`)}
                                  </ImportOptionHelp>
                                </>
                              )}
                            </ImportOptionPanel>
                          ) : (receivables.some((item) => item.status !== 'settled') || Object.keys(rowSharedExpenses).length > 0) && (
                            <ImportOptionPanel theme={theme}>
                              <ImportOptionTitle as="div" theme={theme}>{t.linkReimbursement || 'Link as reimbursement'}</ImportOptionTitle>
                              <CompactSelect
                                theme={theme}
                                aria-label={t.linkReimbursement || 'Link as reimbursement'}
                                value={rowReimbursements[tx.rowIndex] ?? ''}
                                onChange={(event) => setRowReimbursements((current) => {
                                  const next = { ...current };
                                  if (event.target.value) next[tx.rowIndex] = event.target.value;
                                  else delete next[tx.rowIndex];
                                  return next;
                                })}
                              >
                                <option value="">{t.notAReimbursement || 'Ordinary income'}</option>
                                {receivables.filter((item) => item.status !== 'settled').map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.notes || t.untitledSharedExpense || 'Shared expense'} · {currencySymbol}{Math.max(0, item.receivableAmount - item.settledAmount).toFixed(2)}
                                  </option>
                                ))}
                                {importableTx.filter((item) => item.isOutflow && rowSharedExpenses[item.rowIndex] !== undefined).map((item) => (
                                  <option key={`shared:${item.rowIndex}`} value={`shared:${item.rowIndex}`}>
                                    {(t.sharedExpenseInThisImport || 'This import: {note} · {amount}')
                                      .replace('{note}', getEffectiveNote(item) || t.untitledSharedExpense || 'Shared expense')
                                      .replace('{amount}', `${currencySymbol}${Math.max(0, item.amount - Number(rowSharedExpenses[item.rowIndex] || 0)).toFixed(2)}`)}
                                  </option>
                                ))}
                              </CompactSelect>
                              {rowReimbursements[tx.rowIndex] && (
                                <>
                                  <CompactSelect
                                    theme={theme}
                                    aria-label={t.selectReceivingAccount || 'Select receiving account'}
                                    value={rowAccountIds[tx.rowIndex] ?? selectedAccountId}
                                    onChange={(event) => setRowAccountIds((current) => ({ ...current, [tx.rowIndex]: event.target.value }))}
                                  >
                                    <option value="">{t.selectReceivingAccount || 'Select receiving account'}</option>
                                    {liquidityAccounts.map((accountItem) => (
                                      <option key={accountItem.id} value={accountItem.id}>{accountItem.label}</option>
                                    ))}
                                  </CompactSelect>
                                  <ImportOptionHelp theme={theme}>
                                    {t.reimbursementStatsHelp || 'It updates the receivable and account, but is excluded from income statistics.'}
                                  </ImportOptionHelp>
                                </>
                              )}
                            </ImportOptionPanel>
                          )}
                          </TransactionDetails>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </PreviewTable>
            {isMobile && filteredTx.length > 0 && (
              <p style={{
                color: theme.textColor,
                opacity: 0.45,
                fontSize: '0.75rem',
                textAlign: 'right',
                marginTop: '0.35rem',
                fontStyle: 'italic'
              }}>
                {t.scrollHint || 'Scroll horizontally to see all columns →'}
              </p>
            )}

            {/* Show more / less toggle */}
            {filteredTx.length > PREVIEW_LIMIT && (
              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <SecondaryBtn theme={theme} onClick={() => setShowAllRows(!showAllRows)} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                  {showAllRows
                    ? (t.showLess || 'Show less')
                    : `${t.showAll || 'Show all'} (${filteredTx.length})`
                  }
                </SecondaryBtn>
              </div>
            )}
          </Card>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <SecondaryBtn theme={theme} onClick={() => setStep(1)}>
              <ArrowBackIcon style={{ fontSize: 18 }} /> {t.back || 'Back'}
            </SecondaryBtn>
            <PrimaryBtn onClick={handleImport} disabled={importableTx.length === 0 || hasInvalidImportDetails}>
              <CloudUploadIcon style={{ fontSize: 18 }} />
              {t.importButton || 'Import'} {importableTx.length} {t.transactions || 'transactions'}
            </PrimaryBtn>
          </div>
        </>
      )}

      {/* ════ STEP 3: Importing ════ */}
      {step === 3 && (
        <Card theme={theme}>
          {importing ? (
            <>
              <h3 style={{ color: theme.textColor, marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 600, textAlign: 'center' }}>
                {t.importingTitle || '⏳ Importing data...'}
              </h3>
              <ProgressBar theme={theme}>
                <div style={{ width: `${importProgress}%` }} />
              </ProgressBar>
              <p style={{ color: theme.textColor, textAlign: 'center', fontSize: '0.9rem' }}>
                {Math.round(importProgress)}%
              </p>
            </>
          ) : importResult && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              {importResult.failed === 0 ? (
                  <CheckCircleIcon style={{ fontSize: 64, color: theme.secondaryColor }} />
                ) : (
                  <WarningIcon style={{ fontSize: 64, color: '#ffc107' }} />
                )}
              </div>
              <h3 style={{ color: theme.textColor, marginBottom: '1rem', fontSize: '1.3rem', fontWeight: 600, textAlign: 'center' }}>
                {importResult.failed === 0
                  ? (t.importSuccess || '✅ Import completed successfully!')
                  : (t.importPartial || '⚠️ Import completed with some errors')
                }
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>
                <div style={{ padding: '1rem', borderRadius: 10, backgroundColor: 'rgba(7,145,100,0.08)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.secondaryColor }}>{importResult.success}</div>
                  <div style={{ fontSize: '0.8rem', color: theme.textColor, opacity: 0.7 }}>{t.successful || 'Successful'}</div>
                </div>
                {importResult.failed > 0 && (
                  <div style={{ padding: '1rem', borderRadius: 10, backgroundColor: 'rgba(220,53,69,0.08)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc3545' }}>{importResult.failed}</div>
                    <div style={{ fontSize: '0.8rem', color: theme.textColor, opacity: 0.7 }}>{t.failed || 'Failed'}</div>
                  </div>
                )}
              </div>
              {/* Undo section */}
              {!undoResult && importResult.success > 0 && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '0.8rem 1rem',
                  borderRadius: 10,
                  backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                  textAlign: 'center',
                }}>
                  <p style={{ color: theme.textColor, opacity: 0.7, fontSize: '0.82rem', marginBottom: '0.6rem', lineHeight: 1.5 }}>
                    {t.undoHint || 'Made a mistake? You can undo this import and remove all imported transactions.'}
                  </p>
                  <SecondaryBtn
                    theme={theme}
                    onClick={handleUndo}
                    disabled={undoing}
                    style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem' }}
                    data-umami-event="import-undo"
                  >
                    <UndoIcon style={{ fontSize: 16 }} />
                    {undoing
                      ? (t.undoing || 'Undoing...')
                      : (t.undoButton || 'Undo import')
                    }
                  </SecondaryBtn>
                </div>
              )}
              {importResult.linkFailures > 0 && (
                <p style={{ color: '#ffc107', marginTop: '0.75rem' }}>
                  {(t.sharedLinksFailed || '{count} shared-expense links could not be saved. The transactions were imported and were not retried to avoid duplicates.')
                    .replace('{count}', String(importResult.linkFailures))}
                </p>
              )}

              {/* Undo result */}
              {undoResult && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '0.8rem 1rem',
                  borderRadius: 10,
                  backgroundColor: undoResult.failed === 0 ? 'rgba(7,145,100,0.08)' : 'rgba(220,53,69,0.08)',
                  textAlign: 'center',
                }}>
                  <p style={{ color: undoResult.failed === 0 ? theme.secondaryColor : '#dc3545', fontSize: '0.9rem', fontWeight: 600 }}>
                    {undoResult.failed === 0
                      ? (t.undoSuccess || `✅ Undo completed — ${undoResult.success} transactions removed`).replace('{count}', undoResult.success)
                      : (t.undoPartial || `⚠️ Undo partial — ${undoResult.success} removed, ${undoResult.failed} failed`).replace('{success}', undoResult.success).replace('{failed}', undoResult.failed)
                    }
                  </p>
                </div>
              )}

              <div style={{ textAlign: 'center' }}>
                <PrimaryBtn onClick={() => { onImportComplete?.(); onClose?.(); }}>
                  <CheckCircleIcon style={{ fontSize: 18 }} /> {t.done || 'Done'}
                </PrimaryBtn>
              </div>
            </>
          )}
        </Card>
      )}

      {showMonthViewer && (
        <MonthTransactionsViewer
          theme={theme}
          userData={userData}
          onClose={() => setShowMonthViewer(false)}
          initialMonthIndex={monthIndexForDate(dateTo || dateFrom)}
        />
      )}
    </WizardContainer>
  );
};

export default DataImportWizard;
