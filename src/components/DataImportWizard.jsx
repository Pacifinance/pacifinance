/**
 * DataImportWizard — Multi-step CSV/Excel import component
 * 
 * Steps:
 * 1. Upload: user selects a CSV/Excel file
 * 2. Mapping: user maps columns to PaciFinance fields (date, amount, category, notes)
 * 3. Review: preview parsed data, see errors, confirm
 * 4. Import: send data to API, show progress
 */

import React, { useState, useContext, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
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
  border-radius: 8px;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
  
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

const DangerBtn = styled(Btn)`
  background-color: #dc3545;
  color: white;
  &:hover:not(:disabled) { background-color: #c82333; }
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

// ═══════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════

const DataImportWizard = ({ onClose, onImportComplete }) => {
  const { theme } = useContext(ThemeContext);
  const { translations } = useContext(LanguageContext);
  const mediaQuery = useContext(MediaQueryContext);
  const isMobile = mediaQuery?.isMobileScreen ?? false;
  const { handleSetIsUpdated } = useAuth();

  const t = translations?.dataImport || {};

  // State
  const [step, setStep] = useState(0); // 0=upload, 1=mapping, 2=review, 3=importing
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [parseError, setParseError] = useState(null);

  // Mapping state
  const [dateCol, setDateCol] = useState(-1);
  const [amountCol, setAmountCol] = useState(-1);
  const [categoryCol, setCategoryCol] = useState(-1);
  const [notesCol, setNotesCol] = useState(-1);
  const [dateFormat, setDateFormat] = useState('');
  const [transactionType, setTransactionType] = useState('auto');
  const [defaultCategory, setDefaultCategory] = useState(9999);
  const [savedMappings, setSavedMappings] = useState(() => loadSavedMappings());
  const [mappingName, setMappingName] = useState('');

  // Review state
  const [validTx, setValidTx] = useState([]);
  const [errorTx, setErrorTx] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showErrors, setShowErrors] = useState(false);

  // Import state
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState(null);

  const fileInputRef = useRef(null);

  // ─── Step 0: Upload ───

  const handleFileSelect = useCallback(async (selectedFile) => {
    setParseError(null);
    if (!selectedFile) return;

    try {
      const { headers: h, rows: r } = await parseFile(selectedFile);
      setFile(selectedFile);
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

  // ─── Step 1: Mapping ───

  const handleApplySavedMapping = (saved) => {
    const m = saved.mapping;
    setDateCol(m.dateCol ?? -1);
    setAmountCol(m.amountCol ?? -1);
    setCategoryCol(m.categoryCol ?? -1);
    setNotesCol(m.notesCol ?? -1);
    setDateFormat(m.dateFormat || '');
    setTransactionType(m.transactionType || 'auto');
    setDefaultCategory(m.defaultCategoryIndex || 9999);
  };

  const handleSaveMapping = () => {
    if (!mappingName.trim()) return;
    const mapping = {
      dateCol, amountCol, categoryCol: categoryCol === -1 ? null : categoryCol,
      notesCol: notesCol === -1 ? null : notesCol,
      dateFormat, transactionType, defaultCategoryIndex: defaultCategory,
    };
    saveMapping(mappingName.trim(), mapping);
    setSavedMappings(loadSavedMappings());
    setMappingName('');
  };

  const handleDeleteMapping = (name) => {
    deleteSavedMapping(name);
    setSavedMappings(loadSavedMappings());
  };

  const isMappingValid = dateCol >= 0 && amountCol >= 0 && dateFormat !== '';

  const handleProcessRows = () => {
    const mapping = {
      dateCol, amountCol,
      categoryCol: categoryCol === -1 ? null : categoryCol,
      notesCol: notesCol === -1 ? null : notesCol,
      dateFormat, transactionType, defaultCategoryIndex: defaultCategory,
    };
    const { valid, errors } = processRows(rows, mapping);
    setValidTx(valid);
    setErrorTx(errors);
    setSummary(summarizeImport(valid));
    setStep(2);
  };

  // ─── Step 3: Import ───

  const handleImport = async () => {
    setStep(3);
    setImporting(true);
    setImportProgress(0);

    let success = 0;
    let failed = 0;
    const total = validTx.length;
    const BATCH_SIZE = 5; // Send N at a time to avoid overwhelming server

    for (let i = 0; i < total; i += BATCH_SIZE) {
      const batch = validTx.slice(i, i + BATCH_SIZE);
      const promises = batch.map(tx =>
        axios.post('/expenses/add', toAPIFormat(tx), { withCredentials: true })
          .then(() => { success++; })
          .catch(() => { failed++; })
      );
      await Promise.all(promises);
      setImportProgress(Math.min(((i + BATCH_SIZE) / total) * 100, 100));
    }

    setImporting(false);
    setImportResult({ success, failed, total });

    // Force data refresh
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
                {file?.name} — {rows.length} {t.rows || 'rows'}
              </Badge>
            </div>

            {/* Preview of first 5 rows */}
            <p style={{ color: theme.textColor, opacity: 0.7, fontSize: '0.85rem', marginBottom: '0.8rem' }}>
              {t.mappingPreview || 'Preview of your data (first 5 rows):'}
            </p>
            <PreviewTable theme={theme}>
              <table>
                <thead>
                  <tr>
                    {headers.map((h, i) => (
                      <th key={i}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </PreviewTable>
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

              {/* Amount Column */}
              <div>
                <label style={{ color: theme.textColor, fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>
                  💰 {t.amountColumn || 'Amount'} *
                </label>
                <SelectField theme={theme} value={amountCol} onChange={e => setAmountCol(parseInt(e.target.value))}>
                  <option value={-1}>— {t.selectColumn || 'Select column'} —</option>
                  {headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                </SelectField>
              </div>

              {/* Transaction Type */}
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

              {/* Category Column */}
              <div>
                <label style={{ color: theme.textColor, fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>
                  📁 {t.categoryColumn || 'Category'} ({t.optional || 'optional'})
                </label>
                <SelectField theme={theme} value={categoryCol} onChange={e => setCategoryCol(parseInt(e.target.value))}>
                  <option value={-1}>— {t.noColumn || 'None'} —</option>
                  {headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                </SelectField>
              </div>

              {/* Default Category */}
              <div>
                <label style={{ color: theme.textColor, fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>
                  🏷️ {t.defaultCategory || 'Default category'}
                </label>
                <SelectField theme={theme} value={defaultCategory} onChange={e => setDefaultCategory(parseInt(e.target.value))}>
                  {EXPENSE_CATEGORY_CODES.map(c => (
                    <option key={c.index} value={c.index}>{c.translationKey}</option>
                  ))}
                </SelectField>
              </div>

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

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '0.8rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', borderRadius: 10, backgroundColor: 'rgba(7,145,100,0.08)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#079164' }}>{summary.totalTransactions}</div>
                <div style={{ fontSize: '0.8rem', color: theme.textColor, opacity: 0.7 }}>{t.totalTransactions || 'Total transactions'}</div>
              </div>
              <div style={{ padding: '1rem', borderRadius: 10, backgroundColor: 'rgba(220,53,69,0.08)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc3545' }}>
                  {summary.outflowCount} (€{summary.outflowTotal.toLocaleString('it-IT', { maximumFractionDigits: 2 })})
                </div>
                <div style={{ fontSize: '0.8rem', color: theme.textColor, opacity: 0.7 }}>{t.outflows || 'Outflows'}</div>
              </div>
              <div style={{ padding: '1rem', borderRadius: 10, backgroundColor: 'rgba(39,174,96,0.08)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#27ae60' }}>
                  {summary.incomeCount} (€{summary.incomeTotal.toLocaleString('it-IT', { maximumFractionDigits: 2 })})
                </div>
                <div style={{ fontSize: '0.8rem', color: theme.textColor, opacity: 0.7 }}>{t.incomes || 'Incomes'}</div>
              </div>
            </div>

            {/* Date range */}
            {summary.dateRange.from && (
              <p style={{ color: theme.textColor, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                📅 {t.dateRange || 'Date range'}: <strong>{summary.dateRange.from}</strong> → <strong>{summary.dateRange.to}</strong>
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
                      <tr key={i}><td>{e.rowIndex + 2}</td><td style={{ color: '#dc3545' }}>{e.error}</td></tr>
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

          {/* Category Breakdown */}
          <Card theme={theme} $compact>
            <p style={{ color: theme.textColor, fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.9rem' }}>
              {t.categoryBreakdown || '📊 Category Breakdown'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {Object.entries(summary.categoryCounts)
                .sort(([, a], [, b]) => b.count - a.count)
                .map(([cat, data]) => (
                  <Badge key={cat} $variant="success" style={{ backgroundColor: getCategoryColor(cat) || 'rgba(7,145,100,0.15)' }}>
                    {cat}: {data.count}
                  </Badge>
                ))
              }
            </div>
          </Card>

          {/* Preview of parsed data */}
          <Card theme={theme} $compact>
            <p style={{ color: theme.textColor, fontWeight: 600, marginBottom: '0.8rem', fontSize: '0.9rem' }}>
              {t.parsedPreview || '👁️ Parsed data preview (first 10 rows)'}
            </p>
            <PreviewTable theme={theme}>
              <table>
                <thead>
                  <tr>
                    <th>{t.date || 'Date'}</th>
                    <th>{t.amount || 'Amount'}</th>
                    <th>{t.type || 'Type'}</th>
                    <th>{t.category || 'Category'}</th>
                    <th>{t.notes || 'Notes'}</th>
                  </tr>
                </thead>
                <tbody>
                  {validTx.slice(0, 10).map((tx, i) => (
                    <tr key={i}>
                      <td>{tx.date}</td>
                      <td style={{ color: tx.isOutflow ? '#dc3545' : '#27ae60', fontWeight: 600 }}>
                        {tx.isOutflow ? '-' : '+'}€{tx.amount.toFixed(2)}
                      </td>
                      <td>
                        <Badge $variant={tx.isOutflow ? 'error' : 'success'}>
                          {tx.isOutflow ? (t.outflow || 'Outflow') : (t.income || 'Income')}
                        </Badge>
                      </td>
                      <td>{tx.categoryLabel}</td>
                      <td>{tx.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </PreviewTable>
          </Card>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <SecondaryBtn theme={theme} onClick={() => setStep(1)}>
              <ArrowBackIcon style={{ fontSize: 18 }} /> {t.back || 'Back'}
            </SecondaryBtn>
            <PrimaryBtn onClick={handleImport} disabled={validTx.length === 0}>
              <CloudUploadIcon style={{ fontSize: 18 }} />
              {t.importButton || 'Import'} {validTx.length} {t.transactions || 'transactions'}
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
