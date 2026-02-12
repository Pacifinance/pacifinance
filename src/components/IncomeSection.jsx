import React from 'react';
import { Select, MenuItem } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCalendarAlt, faPen, faSortUp, faSortDown, faSort } from '@fortawesome/free-solid-svg-icons';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { sortTagsByLanguage } from '../utils/sortingUtils';
import styled from 'styled-components';
import {
  ModernActionButton,
  StyledTable,
} from '../styles/MyStyled';
import { incomeCategoryColors } from '../data/categoryColors';
import { getLighterSolidColor, getGrayscaleColor } from '../utils/colorUtils';

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
  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
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
  font-size: 0.9rem;
  font-weight: 500;
  background: ${(p) => p.theme.mode === 'dark'
    ? 'rgba(255,255,255,0.04)'
    : 'white'};
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
  min-height: 42px;

  &:focus {
    border-color: ${(p) => p.theme.buttonBackgroundColor};
    box-shadow: 0 0 0 3px ${(p) => p.theme.buttonBackgroundColor}15;
  }

  &::placeholder {
    color: ${(p) => p.theme.textColor};
    opacity: 0.3;
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

const MonthSelect = styled.select`
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  border: 1px solid ${(p) => p.theme.mode === 'dark'
    ? 'rgba(255,255,255,0.12)'
    : '#e2e8f0'};
  background: ${(p) => p.theme.mode === 'dark'
    ? 'rgba(255,255,255,0.06)'
    : 'white'};
  color: ${(p) => p.theme.textColor};
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  font-family: inherit;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${(p) => p.theme.buttonBackgroundColor};
  }
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
    background: rgba(156, 163, 175, 0.1);
    color: #9ca3af;
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
  // New props for balance selection
  selectedOption,
  setSelectedOption,
  balanceOptions,
  incomeDateFilterStart,
  setIncomeDateFilterStart,
  incomeDateFilterEnd,
  setIncomeDateFilterEnd,
}) {
  const { language, translations } = React.useContext(LanguageContext);
  const { currencySymbol, formatNumber } = React.useContext(CurrencyContext);
  
  // Sorting state
  const [sortColumn, setSortColumn] = React.useState(null);
  const [sortDirection, setSortDirection] = React.useState('asc');

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleIncomeDateChange = (event) => {
    let inputDate = event.target.value;
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
            <select
              value={incomeCategoryFilter}
              onChange={(e) => setIncomeCategoryFilter(e.target.value)}
              style={{ minWidth: 100 }}
            >
              <option value="">{translations.general.all}</option>
              {incomesTags.map((item) => (
                <option key={item.index} value={item.translations[language]}>
                  {item.translations[language]}
                </option>
              ))}
            </select>
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
          add.categoryTag.translations[language] === incomeCategoryFilter) &&
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
            aVal = a.categoryTag?.translations?.[language] || '';
            bVal = b.categoryTag?.translations?.[language] || '';
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
        return (
          <tr key={index} style={{ background: rowGradient }}>
            <td>{isHidden ? '****' : add.categoryTag.translations[language]}</td>
            <td>
              {isHidden
                ? '****'
                : add.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}{' '}{currencySymbol}
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
                <ActionBtn className="edit" disabled title="Funzionalità in arrivo">
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
              : totals.totalFiltered.toLocaleString('it-IT', { minimumFractionDigits: 2 })}{' '}{currencySymbol}
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
            : totals.totalAll.toLocaleString('it-IT', { minimumFractionDigits: 2 })}{' '}{currencySymbol}
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
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '& .MuiSelect-select': { padding: '8px 12px' },
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
            value={categoryIncome.value}
            onChange={(event) => {
              const selectedKey = event.target.value;
              const selectedItem = incomesTags.find((item) => item.index === selectedKey);
              if (selectedItem) {
                setCategoryIncome({
                  key: selectedKey,
                  value: selectedItem.translations[language],
                });
              }
            }}
            sx={selectSx}
            displayEmpty
            renderValue={(value) =>
              value === '' ? translations.insert.incomeSection.placeholderCategory : value
            }
          >
            <MenuItem value="">
              <em>{translations.insert.incomeSection.placeholderCategory}</em>
            </MenuItem>
            {sortTagsByLanguage(incomesTags, language).map((item) => (
              <MenuItem key={item.index} value={item.index}>
                {item.translations[language]}
              </MenuItem>
            ))}
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
      </FormFooter>

      {/* ── Transaction Table ── */}
      <TableSection theme={theme}>
        <TableHeader theme={theme}>
          <TableTitle theme={theme}>
            {translations.insert.incomeSection.titleListing}
          </TableTitle>
          <MonthSelect
            theme={theme}
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
          </MonthSelect>
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