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
import axios from 'axios';

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

import {
  parseFile,
  autoDetectColumns,
  detectDateFormat,
  DATE_FORMATS,
  processRows,
  toAPIFormat,
  summarizeImport,
  ACCEPTED_EXTENSIONS,
  saveMapping,
  loadSavedMappings,
  deleteSavedMapping,
} from '../utils/dataImport';
import { EXPENSE_CATEGORY_CODES } from '../data/expenseCategoryCodes';
import { getCategoryColor } from '../data/categoryColors';

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
  background-color: ${p => p.$active ? '#079164' : p.$done ? '#079164' : (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')};
  color: ${p => p.$active || p.$done ? 'white' : (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)')};
  opacity: ${p => p.$active ? 1 : p.$done ? 0.8 : 0.5};
`;

const StepConnector = styled.div`
  width: 40px;
  height: 2px;
  align-self: center;
  background-color: ${p => p.$done ? '#079164' : (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')};
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
  border: 2px dashed ${p => p.$dragging ? '#079164' : (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)')};
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${p => p.$dragging ? 'rgba(7, 145, 100, 0.08)' : 'transparent'};
  
  &:hover {
    border-color: #079164;
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
    background-color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)'};
    font-weight: 600;
    color: ${p => p.theme.textColor};
    position: sticky;
    top: 0;
    z-index: 1;
  }
  td {
    color: ${p => p.theme.textColor};
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

const CompactSelect = styled.select`
  padding: 0.3rem 0.5rem;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'};
  border-radius: 6px;
  background-color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#fff'};
  color: ${p => p.theme.mode === 'dark' ? '#fff' : '#000'};
  font-size: 0.78rem;
  max-width: 160px;

  option {
    background-color: ${p => p.theme.mode === 'dark' ? '#2d2d2d' : '#ffffff'};
    color: ${p => p.theme.mode === 'dark' ? '#ffffff' : '#000000'};
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

const ProgressBar = styled.div`
  height: 6px;
  border-radius: 3px;
  background-color: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
  overflow: hidden;
  margin: 1rem 0;
  
  div {
    height: 100%;
    background-color: #079164;
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
    border-color: #079164;
  }
`;

const InfoTooltip = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #079164;
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
  const { currencySymbol } = useContext(CurrencyContext);
  const mediaQuery = useContext(MediaQueryContext);
  const isMobile = mediaQuery?.isMobileScreen ?? false;
  const { handleSetIsUpdated, userData } = useAuth();

  // Payment tags from user data (filter out 'none')
  const paymentTags = (userData?.tags?.paymentTags || []).filter(t => t.label !== 'none');

  const t = translations?.dataImport || {};

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
  const [rowNotes, setRowNotes] = useState({}); // { rowIndex: notesString }
  const [showAllRows, setShowAllRows] = useState(false); // toggle to show all rows in preview

  // Import state
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState(null);

  const fileInputRef = useRef(null);

  // Initialize defaultPaymentType from paymentTags once available
  useEffect(() => {
    if (defaultPaymentType === -1 && paymentTags.length > 0) {
      setDefaultPaymentType(paymentTags[0].index);
    }
  }, [paymentTags, defaultPaymentType]);

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
  const incomesTags = userData?.tags?.incomesTags || [];

  // Live summary based on importable transactions (with category overrides)
  const liveSummary = useMemo(() => {
    if (importableTx.length === 0) return null;
    const txWithOverrides = importableTx.map(tx => {
      let modified = tx;
      if (rowCategories[tx.rowIndex] !== undefined) {
        const idx = rowCategories[tx.rowIndex];
        if (tx.isOutflow) {
          const cat = EXPENSE_CATEGORY_CODES.find(c => c.index === idx);
          modified = { ...modified, categoryIndex: idx, categoryLabel: cat?.translationKey || 'Other' };
        } else {
          const tag = incomesTags.find(t => t.index === idx);
          modified = { ...modified, categoryIndex: idx, categoryLabel: tag?.translations?.[language] || tag?.label || 'Other' };
        }
      }
      if (rowNotes[tx.rowIndex] !== undefined) {
        modified = { ...modified, notes: rowNotes[tx.rowIndex] };
      }
      return modified;
    });
    return summarizeImport(txWithOverrides);
  }, [importableTx, rowCategories, rowNotes, incomesTags, language]);

  // ─── Step 0: Upload ───

  const handleFileSelect = useCallback(async (selectedFile) => {
    setParseError(null);
    if (!selectedFile) return;

    try {
      const result = await parseFile(selectedFile);
      const rawRows = result.allRows || [result.headers, ...result.rows];
      setFile(selectedFile);
      setAllRawRows(rawRows);

      // Default: first row is the header
      const hIdx = 0;
      setHeaderRowIndex(hIdx);
      const h = rawRows[hIdx] || [];
      const r = rawRows.slice(hIdx + 1);
      setHeaders(h);
      setRows(r);

      // Auto-detect columns
      const detected = autoDetectColumns(h, r);
      if (detected.dateCol !== null) setDateCol(detected.dateCol);
      if (detected.amountCol !== null) setAmountCol(detected.amountCol);
      if (detected.categoryCol !== null) setCategoryCol(detected.categoryCol);
      if (detected.notesCol !== null) setNotesCol(detected.notesCol);

      // Auto-detect date format
      if (detected.dateCol !== null) {
        const samples = r.slice(0, 10).map(row => row[detected.dateCol]);
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
    const r = allRawRows.slice(idx + 1);
    setHeaders(h);
    setRows(r);

    // Re-run auto-detection
    const detected = autoDetectColumns(h, r);
    setDateCol(detected.dateCol !== null ? detected.dateCol : -1);
    setAmountCol(detected.amountCol !== null ? detected.amountCol : -1);
    setCategoryCol(detected.categoryCol !== null ? detected.categoryCol : -1);
    setNotesCol(detected.notesCol !== null ? detected.notesCol : -1);

    if (detected.dateCol !== null) {
      const samples = r.slice(0, 10).map(row => row[detected.dateCol]);
      const fmt = detectDateFormat(samples);
      setDateFormat(fmt || '');
    } else {
      setDateFormat('');
    }
  }, [allRawRows]);

  // ─── Step 1: Mapping ───

  const handleApplySavedMapping = (saved) => {
    const m = saved.mapping;
    setDateCol(m.dateCol ?? -1);
    setAmountCol(m.amountCol ?? -1);
    setDualAmountMode(m.dualAmountMode || false);
    setIncomeCol(m.incomeCol ?? -1);
    setOutflowCol(m.outflowCol ?? -1);
    setCategoryCol(m.categoryCol ?? -1);
    setNotesCol(m.notesCol ?? -1);
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
      dateFormat, transactionType, defaultCategoryIndex: defaultOutflowCategory,
    };
    const { valid: rawValid, errors } = processRows(rows, mapping);
    // Post-process: assign correct default category for incomes
    const valid = rawValid.map(tx => {
      if (!tx.isOutflow && tx.categoryIndex === defaultOutflowCategory) {
        // Row used the outflow default — replace with income default
        const tag = incomesTags.find(it => it.index === defaultIncomeCategory);
        return { ...tx, categoryIndex: defaultIncomeCategory, categoryLabel: tag?.translations?.[language] || tag?.label || 'Other' };
      }
      return tx;
    });
    setValidTx(valid);
    setErrorTx(errors);
    setSummary(summarizeImport(valid));
    // Initialize all valid rows as selected
    setSelectedRows(new Set(valid.map(tx => tx.rowIndex)));
    // Pre-populate date filter with min/max from parsed data
    const dates = valid.map(tx => tx.date).filter(Boolean).sort();
    setDateFrom(dates[0] || '');
    setDateTo(dates[dates.length - 1] || '');
    setRowCategories({});
    setRowNotes({});
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

  const handleRowCategoryChange = (rowIndex, newCategoryIndex) => {
    setRowCategories(prev => ({ ...prev, [rowIndex]: newCategoryIndex }));
  };

  const handleRowNoteChange = (rowIndex, newNote) => {
    setRowNotes(prev => ({ ...prev, [rowIndex]: newNote }));
  };

  const getEffectiveNote = (tx) => {
    return rowNotes[tx.rowIndex] !== undefined ? rowNotes[tx.rowIndex] : tx.notes;
  };

  const getEffectiveCategory = (tx) => {
    if (rowCategories[tx.rowIndex] !== undefined) {
      const idx = rowCategories[tx.rowIndex];
      if (tx.isOutflow) {
        const cat = EXPENSE_CATEGORY_CODES.find(c => c.index === idx);
        return { index: idx, label: cat?.translationKey || 'Other' };
      } else {
        const tag = incomesTags.find(t => t.index === idx);
        return { index: idx, label: tag?.translations?.[language] || tag?.label || 'Other' };
      }
    }
    if (!tx.isOutflow && incomesTags.length > 0) {
      const tag = incomesTags.find(t => t.index === tx.categoryIndex);
      if (tag) return { index: tx.categoryIndex, label: tag.translations?.[language] || tag.label };
    }
    return { index: tx.categoryIndex, label: tx.categoryLabel };
  };

  // ─── Step 3: Import ───

  const handleImport = async () => {
    setStep(3);
    setImporting(true);
    setImportProgress(0);

    // Build final list with category and note overrides
    const finalTx = importableTx.map(tx => {
      let modified = tx;
      if (rowCategories[tx.rowIndex] !== undefined) {
        const idx = rowCategories[tx.rowIndex];
        if (tx.isOutflow) {
          const cat = EXPENSE_CATEGORY_CODES.find(c => c.index === idx);
          modified = { ...modified, categoryIndex: idx, categoryLabel: cat?.translationKey || 'Other' };
        } else {
          const tag = incomesTags.find(t => t.index === idx);
          modified = { ...modified, categoryIndex: idx, categoryLabel: tag?.translations?.[language] || tag?.label || 'Other' };
        }
      }
      if (rowNotes[tx.rowIndex] !== undefined) {
        modified = { ...modified, notes: rowNotes[tx.rowIndex] };
      }
      return modified;
    });

    let success = 0;
    let failed = 0;
    const total = finalTx.length;
    const BATCH_SIZE = 5;

    for (let i = 0; i < total; i += BATCH_SIZE) {
      const batch = finalTx.slice(i, i + BATCH_SIZE);
      const promises = batch.map(tx =>
        axios.post('/expenses/add', toAPIFormat(tx, defaultPaymentType), { withCredentials: true })
          .then(() => { success++; })
          .catch(() => { failed++; })
      );
      await Promise.all(promises);
      setImportProgress(Math.min(((i + BATCH_SIZE) / total) * 100, 100));
    }

    setImporting(false);
    setImportResult({ success, failed, total });

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

            <DropZone
              theme={theme}
              $dragging={dragging}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <CloudUploadIcon style={{ fontSize: 48, color: '#079164', marginBottom: '1rem' }} />
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
                    <td style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#079164' }}>{headerRowIndex + 1}</td>
                    {headers.map((h, i) => (
                      <td key={i} style={{ fontWeight: 700, color: '#079164' }}>{h}</td>
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
                  {headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
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
                    {headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
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
                      {headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                    </SelectField>
                  </div>
                  <div>
                    <label style={{ color: theme.textColor, fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>
                      📈 {t.incomeColumn || 'Income column'} ({t.optional || 'optional'})
                    </label>
                    <SelectField theme={theme} value={incomeCol} onChange={e => setIncomeCol(parseInt(e.target.value))}>
                      <option value={-1}>— {t.noColumn || 'None'} —</option>
                      {headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
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
                  {headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
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
                    {EXPENSE_CATEGORY_CODES.map(c => (
                      <option key={c.index} value={c.index}>{c.translationKey}</option>
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
                        <option key={c.index} value={c.index}>{c.translations?.[language] || c.label}</option>
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
                        {pt.translations?.[language] || pt.label}
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
                  {headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
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

            {/* Summary Cards — based on live selection */}
            {liveSummary && (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '0.8rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', borderRadius: 10, backgroundColor: 'rgba(7,145,100,0.08)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#079164' }}>{liveSummary.totalTransactions}</div>
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
                    <th>{t.type || 'Type'}</th>
                    <th>{t.category || 'Category'}</th>
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
                        <td>{tx.date}</td>
                        <td style={{ color: tx.isOutflow ? '#dc3545' : '#27ae60', fontWeight: 600 }}>
                          {tx.isOutflow ? '-' : '+'}{currencySymbol}{tx.amount.toFixed(2)}
                        </td>
                        <td>
                          <Badge $variant={tx.isOutflow ? 'error' : 'success'}>
                            {tx.isOutflow ? (t.outflow || 'Outflow') : (t.income || 'Income')}
                          </Badge>
                        </td>
                        <td>
                          <CompactSelect
                            theme={theme}
                            value={effectiveCat.index}
                            onChange={e => handleRowCategoryChange(tx.rowIndex, parseInt(e.target.value))}
                          >
                            {tx.isOutflow ? (
                              EXPENSE_CATEGORY_CODES.map(c => (
                                <option key={c.index} value={c.index}>{c.translationKey}</option>
                              ))
                            ) : (
                              incomesTags.length > 0 ? (
                                incomesTags.map(c => (
                                  <option key={c.index} value={c.index}>{c.translations?.[language] || c.label}</option>
                                ))
                              ) : (
                                EXPENSE_CATEGORY_CODES.map(c => (
                                  <option key={c.index} value={c.index}>{c.translationKey}</option>
                                ))
                              )
                            )}
                          </CompactSelect>
                        </td>
                        <td>
                          <NoteInput
                            theme={theme}
                            value={getEffectiveNote(tx)}
                            onChange={e => handleRowNoteChange(tx.rowIndex, e.target.value)}
                            maxLength={64}
                            placeholder={t.addNote || '—'}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </PreviewTable>

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
            <PrimaryBtn onClick={handleImport} disabled={importableTx.length === 0}>
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
                  <CheckCircleIcon style={{ fontSize: 64, color: '#079164' }} />
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
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#079164' }}>{importResult.success}</div>
                  <div style={{ fontSize: '0.8rem', color: theme.textColor, opacity: 0.7 }}>{t.successful || 'Successful'}</div>
                </div>
                {importResult.failed > 0 && (
                  <div style={{ padding: '1rem', borderRadius: 10, backgroundColor: 'rgba(220,53,69,0.08)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc3545' }}>{importResult.failed}</div>
                    <div style={{ fontSize: '0.8rem', color: theme.textColor, opacity: 0.7 }}>{t.failed || 'Failed'}</div>
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'center' }}>
                <PrimaryBtn onClick={() => { onImportComplete?.(); onClose?.(); }}>
                  <CheckCircleIcon style={{ fontSize: 18 }} /> {t.done || 'Done'}
                </PrimaryBtn>
              </div>
            </>
          )}
        </Card>
      )}
    </WizardContainer>
  );
};

export default DataImportWizard;
