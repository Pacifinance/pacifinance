import React from 'react';
import styled from 'styled-components';
import { Select, MenuItem } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCalendarAlt, faPen, faSortUp, faSortDown, faSort } from '@fortawesome/free-solid-svg-icons';
import { LanguageContext } from '../contexts/LanguageContext';
import { sortTagsByLanguage } from '../utils/sortingUtils';
import {
  ModernActionButton,
  StyledTable,
} from '../styles/MyStyled';
import { getCategoryColor } from '../data/categoryColors';
import { getLighterSolidColor, getGrayscaleColor } from '../utils/colorUtils';

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
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  font-size: 0.9rem;
  min-height: 42px;
  width: 100%;
  box-sizing: border-box;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'white'};
  color: ${p => p.theme.textColor};
  transition: border-color 0.2s, box-shadow 0.2s;
  &:focus {
    outline: none;
    border-color: ${p => p.theme.buttonBackgroundColor || '#3b82f6'};
    box-shadow: 0 0 0 3px ${p => (p.theme.buttonBackgroundColor || '#3b82f6') + '18'};
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

const MonthSelect = styled.select`
  border-radius: 8px;
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#e2e8f0'};
  padding: 6px 12px;
  font-size: 0.9rem;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'white'};
  color: ${p => p.theme.textColor};
  font-weight: 500;
  cursor: pointer;
`;

const TableScroll = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0.5rem 1rem 1rem;
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
    background: linear-gradient(135deg, #9ca3af, #6b7280);
    opacity: 0.6;
    cursor: not-allowed;
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
            <select
              value={outflowCategoryFilter}
              onChange={(e) => setOutflowCategoryFilter(e.target.value)}
              style={{
                background: '#fff', color: '#111', borderRadius: 6, textAlign: 'center',
                minWidth: 100, fontSize: '0.85em', border: '1px solid #bbb', padding: '2px 4px',
              }}
            >
              <option value="">{translations.general.all}</option>
              {OutflowsTags.map((item) => (
                <option key={item.index} value={item.translations[language]}>
                  {item.translations[language]}
                </option>
              ))}
            </select>
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
            <select
              value={outflowTypologyFilter}
              onChange={(e) => setOutflowTypologyFilter(e.target.value)}
              style={{
                background: '#fff', color: '#111', borderRadius: 6, textAlign: 'center',
                minWidth: 100, fontSize: '0.85em', border: '1px solid #bbb', padding: '2px 4px',
              }}
            >
              <option value="">{translations.general.all}</option>
              {paymentTags.map((item) =>
                item.label !== 'none' && (
                  <option key={item.index} value={item.translations[language]}>
                    {item.translations[language]}
                  </option>
                ),
              )}
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
              {translations.insert.outflowSection.tableColumns.note}
              {getSortIcon('note')}
            </span>
            <input
              type="text"
              placeholder={translations.general.clearFilter || 'Filtra...'}
              value={outflowNoteFilter}
              onChange={(e) => setOutflowNoteFilter(e.target.value)}
              style={{
                color: '#111', background: '#fff', textAlign: 'center', padding: '2px 4px',
                borderRadius: 6, border: '1px solid #bbb', fontSize: '0.8em', width: 100,
              }}
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
                style={{
                  color: '#111', background: '#fff', textAlign: 'center', padding: '2px 4px',
                  borderRadius: 6, border: '1px solid #bbb', fontSize: '0.8em', width: 110,
                }}
              />
              <span style={{ fontSize: '0.75em', opacity: 0.7 }}>-</span>
              <input
                type="date"
                value={outflowDateFilterEnd || ''}
                onChange={(e) => setOutflowDateFilterEnd(e.target.value)}
                min={min}
                max={max}
                style={{
                  color: '#111', background: '#fff', textAlign: 'center', padding: '2px 4px',
                  borderRadius: 6, border: '1px solid #bbb', fontSize: '0.8em', width: 110,
                }}
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
          add.categoryTag.translations[language] === outflowCategoryFilter) &&
        (!outflowTypologyFilter ||
          add.paymentType.translations[language] === outflowTypologyFilter) &&
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
            aVal = a.categoryTag?.translations?.[language] || '';
            bVal = b.categoryTag?.translations?.[language] || '';
            break;
          case 'typology':
            aVal = a.paymentType?.translations?.[language] || '';
            bVal = b.paymentType?.translations?.[language] || '';
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
        } else if (add.categoryTag && add.categoryTag.translations) {
          const keys = Object.keys(add.categoryTag.translations);
          if (keys.length > 0) colorKey = add.categoryTag.translations[keys[0]];
        }
        const rawColor = getCategoryColor(colorKey);
        const processedColor = isHidden
          ? getGrayscaleColor(rawColor, index)
          : getLighterSolidColor(rawColor);
        const rowGradient = getGradientForCategory(processedColor);
        return (
          <tr key={index} style={{ background: rowGradient }}>
            <td>{isHidden ? '****' : add.categoryTag.translations[language]}</td>
            <td>{isHidden ? '****' : add.paymentType.translations[language]}</td>
            <td>
              {isHidden
                ? '****'
                : add.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}{' '}€
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
              : totals.totalFiltered.toLocaleString('it-IT', { minimumFractionDigits: 2 })}{' '}€
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
            : totals.totalAll.toLocaleString('it-IT', { minimumFractionDigits: 2 })}{' '}€
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
            value={categoryOutflow.value}
            onChange={(event) => {
              const selectedKey = event.target.value;
              const selectedItem = OutflowsTags.find((item) => item.index === selectedKey);
              if (selectedItem) {
                setCategoryOutflow({
                  key: selectedKey,
                  value: selectedItem.translations[language],
                });
              }
            }}
            sx={selectSx}
            displayEmpty
            renderValue={(value) =>
              value === '' ? translations.insert.outflowSection.placeholderCategory : value
            }
          >
            <MenuItem value="">
              <em>{translations.insert.outflowSection.placeholderCategory}</em>
            </MenuItem>
            {sortTagsByLanguage(OutflowsTags, language).map((item) => (
              <MenuItem key={item.index} value={item.index}>
                {item.translations[language]}
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
                setTypoOutflow({ key: selectedKey, value: selectedItem.translations[language] });
              }
            }}
            sx={selectSx}
            displayEmpty
            renderValue={(value) =>
              value === '' ? translations.insert.outflowSection.placeholderTypology : value
            }
          >
            <MenuItem value="">
              <em>{translations.insert.outflowSection.placeholderTypology}</em>
            </MenuItem>
            {sortTagsByLanguage(paymentTags, language).map((item) =>
              item.label !== 'none' && (
                <MenuItem key={item.index} value={item.index}>
                  {item.translations[language]}
                </MenuItem>
              ),
            )}
          </Select>
        </FormField>

        {/* Amount */}
        <FormField>
          <FieldLabel theme={theme}>{translations.general.value}</FieldLabel>
          <CurrencyInputWrap>
            <CurrencySymbol theme={theme}>€</CurrencySymbol>
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
      </FormFooter>

      {/* ── Transaction Table ── */}
      <TableSection theme={theme}>
        <TableHeader theme={theme}>
          <TableTitle theme={theme}>
            {translations.insert.outflowSection.titleListing}
          </TableTitle>
          <MonthSelect
            theme={theme}
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
          </MonthSelect>
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