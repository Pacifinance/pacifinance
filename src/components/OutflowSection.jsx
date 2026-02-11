import React from 'react';
import { Select, MenuItem } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCalendarAlt, faPen, faSortUp, faSortDown, faSort } from '@fortawesome/free-solid-svg-icons';
import { LanguageContext } from '../contexts/LanguageContext';
import { sortTagsByLanguage } from '../utils/sortingUtils';
import {
  ModernActionButton,
  StyledDateInput,
  StyledAddSection,
  StyledTable,
  StyledTextArea,
  TitleLastAdds,
} from '../styles/MyStyled';
import { getCategoryColor } from '../data/categoryColors';
import { getLighterSolidColor, getGrayscaleColor } from '../utils/colorUtils';

// Note: Le funzioni per processare i colori sono ora importate da utils/colorUtils

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

  // Wrapper e stile per input con simbolo valuta - updated for modern design
  const inputCurrencyWrapper = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.5em',
    minWidth: 0,
    width: '100%',
    maxWidth: '280px', // Ridotto da 400px a 280px
  };
  const inputWithCurrency = {
    textAlign: 'center',
    padding: '12px 16px 12px 2.5em',
    border: `2px solid ${theme.mode === 'dark' ? `${theme.buttonBackgroundColor}30` : '#e2e8f0'}`,
    borderRadius: '12px',
    color: theme.textColor,
    outline: 'none',
    width: '100%',
    minHeight: '48px',
    fontSize: '1rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '500',
    background: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  };
  const currencySymbolStyle = {
    position: 'absolute',
    left: '1em',
    color: '#888',
    fontSize: '1rem',
    pointerEvents: 'none',
    top: '50%',
    transform: 'translateY(-50%)',
    lineHeight: 1,
    fontWeight: '500',
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

  const sortableHeaderStyle = {
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background-color 0.2s',
  };

  function renderTableHeader() {
    const dropdownStyle = {
      background: '#fff',
      color: '#111',
      borderRadius: '6px',
      textAlign: 'center',
      minWidth: 120,
      boxShadow: '0 2px 8px rgba(100,100,100,0.10)',
      border: '1px solid #bbb',
      fontWeight: 500,
    };
    const { min, max } = getDateRangeForMonth(outflowMonthOptions[selectedOutflowsMonth]);
    return (
      <tr style={{ color: 'white', background: 'transparent' }}>
        <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span 
              onClick={() => handleSort('category')} 
              style={{ ...sortableHeaderStyle, display: 'flex', alignItems: 'center', color: 'white' }}
            >
              {translations.insert.outflowSection.tableColumns.category}
              {getSortIcon('category')}
            </span>
            <select
              value={outflowCategoryFilter}
              onChange={(e) => setOutflowCategoryFilter(e.target.value)}
              style={{ ...dropdownStyle, minWidth: 100, fontSize: '0.85em' }}
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
        <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span 
              onClick={() => handleSort('typology')} 
              style={{ ...sortableHeaderStyle, display: 'flex', alignItems: 'center', color: 'white' }}
            >
              {translations.insert.outflowSection.tableColumns.typology}
              {getSortIcon('typology')}
            </span>
            <select
              value={outflowTypologyFilter}
              onChange={(e) => setOutflowTypologyFilter(e.target.value)}
              style={{ ...dropdownStyle, minWidth: 100, fontSize: '0.85em' }}
            >
              <option value="">{translations.general.all}</option>
              {paymentTags.map(
                (item) =>
                  item.label !== 'none' && (
                    <option
                      key={item.index}
                      value={item.translations[language]}
                    >
                      {item.translations[language]}
                    </option>
                  ),
              )}
            </select>
          </div>
        </th>
        <th
          style={{
            textAlign: 'center',
            verticalAlign: 'middle',
            minWidth: 100,
          }}
        >
          <span 
            onClick={() => handleSort('amount')} 
            style={{ ...sortableHeaderStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
          >
            {translations.general.value}
            {getSortIcon('amount')}
          </span>
        </th>
        <th
          style={{
            textAlign: 'center',
            verticalAlign: 'middle',
            minWidth: 120,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <span 
              onClick={() => handleSort('note')} 
              style={{ ...sortableHeaderStyle, display: 'flex', alignItems: 'center', color: 'white' }}
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
                color: '#111',
                background: 'white',
                textAlign: 'center',
                padding: '2px 4px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '0.8em',
                width: '100px',
              }}
            />
          </div>
        </th>
        <th
          style={{
            textAlign: 'center',
            verticalAlign: 'middle',
            minWidth: 180,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <span 
              onClick={() => handleSort('date')} 
              style={{ ...sortableHeaderStyle, display: 'flex', alignItems: 'center', color: 'white' }}
            >
              <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: 4 }} />
              {translations.general.date || 'Data'}
              {getSortIcon('date')}
            </span>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <input
                type="date"
                value={outflowDateFilterStart || ''}
                onChange={(e) => setOutflowDateFilterStart(e.target.value)}
                style={{
                  color: '#111',
                  background: 'white',
                  textAlign: 'center',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  fontSize: '0.8em',
                  width: '110px',
                }}
                min={min}
                max={max}
                placeholder="Da"
              />
              <span style={{ color: 'white', fontSize: '0.75em' }}>-</span>
              <input
                type="date"
                value={outflowDateFilterEnd || ''}
                onChange={(e) => setOutflowDateFilterEnd(e.target.value)}
                style={{
                  color: '#111',
                  background: 'white',
                  textAlign: 'center',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  fontSize: '0.8em',
                  width: '110px',
                }}
                min={min}
                max={max}
                placeholder="A"
              />
            </div>
            {(outflowDateFilterStart || outflowDateFilterEnd) && (
              <button
                onClick={() => {
                  setOutflowDateFilterStart('');
                  setOutflowDateFilterEnd('');
                }}
                style={{
                  color: 'white',
                  background: 'rgba(255,107,107,0.6)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.7em',
                  cursor: 'pointer',
                  marginTop: '2px'
                }}
              >
                {translations.general.clearFilter || 'Clear'}
              </button>
            )}
          </div>
        </th>
        <th style={{ textAlign: 'center', verticalAlign: 'middle' }}></th>
      </tr>
    );
  }

  function renderOutflowItems(chosenOutflowsToShow) {
    let filtered = chosenOutflowsToShow.filter((add) => {
      const addDate = new Date(add.date).toISOString().slice(0, 10);
      
      // Date range filter
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
            add.notes
              .toLowerCase()
              .includes(outflowNoteFilter.toLowerCase()))) &&
        dateMatch
      );
    });

    // Apply sorting
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
      outflowCategoryFilter ||
      outflowTypologyFilter ||
      outflowNoteFilter ||
      outflowDateFilterStart ||
      outflowDateFilterEnd;
    const rows = [
      ...filtered.map((add, index) => {
        let colorKey = undefined;

        // Use the key directly as it matches the keys in outflowCategoryColors
        if (add.categoryTag && add.categoryTag.key) {
          colorKey = add.categoryTag.key;
        } else if (add.categoryTag && add.categoryTag.label) {
          colorKey = add.categoryTag.label;
        } else if (add.categoryTag && add.categoryTag.translations) {
          const keys = Object.keys(add.categoryTag.translations);
          if (keys.length > 0) colorKey = add.categoryTag.translations[keys[0]];
        }

        // Use same color processing as pie chart
        const rawColor = getCategoryColor(colorKey);

        const processedColor = isHidden 
          ? getGrayscaleColor(rawColor, index)
          : getLighterSolidColor(rawColor);
        const rowGradient = getGradientForCategory(processedColor);
        return (
          <tr key={index} style={{ background: rowGradient }}>
            <td>
              {isHidden ? '****' : add.categoryTag.translations[language]}
            </td>
            <td>
              {isHidden ? '****' : add.paymentType.translations[language]}
            </td>
            <td>
              {isHidden
                ? '****'
                : add.amount.toLocaleString('it-IT', {
                    minimumFractionDigits: 2,
                  })}{' '}
              €
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
              <div style={{
                display: 'flex',
                gap: '6px',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Edit button - disabled for future functionality */}
                <button
                  disabled
                  title="Funzionalità in arrivo - Modifica uscita"
                  style={{
                    background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 6px',
                    fontSize: '0.8rem',
                    cursor: 'not-allowed',
                    opacity: 0.6,
                    boxShadow: '0 2px 4px rgba(156, 163, 175, 0.3)'
                  }}
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>
                {/* Delete button */}
                <button
                  data-umami-event="deleteOutflow"
                  onClick={() => onDeleteOutflow(add.date, add.amount)}
                  style={{
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 6px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(255, 107, 107, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 4px 8px rgba(255, 107, 107, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 2px 4px rgba(255, 107, 107, 0.3)';
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </td>
          </tr>
        );
      }),
    ];
    if (filtersActive) {
      rows.push(
        <tr
          key="total-filtered-outflow"
          style={{ background: '#ff6b6b', fontWeight: 700 }}
        >
          <td
            colSpan={2}
            style={{
              textAlign: 'center',
              fontSize: '1.08em',
              letterSpacing: 1,
              color: '#6b1a1a',
            }}
          >
            {translations.general.totalFiltered || 'Total Filtered'}
          </td>
          <td
            colSpan={1}
            style={{
              textAlign: 'center',
              fontSize: '1.08em',
              color: '#6b1a1a',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            <div>
              {isHidden
                ? '****'
                : totals.totalFiltered.toLocaleString('it-IT', {
                    minimumFractionDigits: 2,
                  })}{' '}
              €
            </div>
            {!isHidden && totals.totalAll > 0 && (
              <div style={{
                fontSize: '0.85em',
                opacity: 0.8,
                fontWeight: 500,
                background: 'rgba(255,255,255,0.2)',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                {((totals.totalFiltered / totals.totalAll) * 100).toFixed(1)}%
              </div>
            )}
          </td>
          <td colSpan={3}></td>
        </tr>,
      );
    }
    rows.push(
      <tr
        key="total-outflow"
        style={{ background: '#e23c3c', fontWeight: 700 }}
      >
        <td
          colSpan={2}
          style={{
            textAlign: 'center',
            fontSize: '1.15em',
            letterSpacing: 1,
            color: '#fff',
          }}
        >
          {translations.general.total}
        </td>
        <td
          colSpan={1}
          style={{ textAlign: 'center', fontSize: '1.15em', color: '#fff' }}
        >
          {isHidden
            ? '****'
            : totals.totalAll.toLocaleString('it-IT', {
                minimumFractionDigits: 2,
              })}{' '}
          €
        </td>
        <td colSpan={3}></td>
      </tr>,
    );
    return rows;
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
      {/* Form Fields Container - Desktop responsive */}
      <div style={{
        display: 'flex', 
        flexDirection: window.innerWidth > 768 ? 'row' : 'column',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: window.innerWidth > 768 ? '1.5rem' : '1rem',
        width: '100%',
        marginBottom: '2rem',
        padding: '0 1rem'
      }}>
        {/* Category Select */}
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 180, maxWidth: 250}}>
          <label style={{color: theme.textColor, marginBottom: '8px', fontWeight: 500, textAlign: 'center'}}>
            {translations.general.category}
          </label>
          <Select
            value={categoryOutflow.value}
            onChange={(event) => {
              const selectedKey = event.target.value;
              const selectedItem = OutflowsTags.find(
                (item) => item.index === selectedKey,
              );

              if (selectedItem) {
                const selectedValue = selectedItem.translations[language];
                setCategoryOutflow({
                  key: selectedKey,
                  value: selectedValue,
                });
              }
            }}
            style={{ 
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: `2px solid ${theme.mode === 'dark' ? `${theme.buttonBackgroundColor}30` : '#e2e8f0'}`,
              minHeight: '48px',
              width: '100%'
            }}
            displayEmpty
            renderValue={(value) => {
              if (value === '') {
                return translations.insert.outflowSection
                  .placeholderCategory;
              }
              return value;
            }}
          >
            <MenuItem value="">
              <em>
                {
                  translations.insert.outflowSection
                    .placeholderCategory
                }
              </em>
            </MenuItem>
            {sortTagsByLanguage(OutflowsTags, language).map((item) => (
              <MenuItem key={item.index} value={item.index}>
                {item.translations[language]}
              </MenuItem>
            ))}
          </Select>
        </div>

        {/* Payment Type Select */}
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 180, maxWidth: 250}}>
          <label style={{color: theme.textColor, marginBottom: '8px', fontWeight: 500, textAlign: 'center'}}>
            {translations.general.typology}
          </label>
          <Select
            value={typoOutflow.value}
            onChange={(event) => {
              const selectedKey = event.target.value;
              const selectedItem = paymentTags.find(
                (item) => item.index === selectedKey,
              );

              if (selectedItem) {
                const selectedValue = selectedItem.translations[language];
                setTypoOutflow({ key: selectedKey, value: selectedValue });
              }
            }}
            style={{ 
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: `2px solid ${theme.mode === 'dark' ? `${theme.buttonBackgroundColor}30` : '#e2e8f0'}`,
              minHeight: '48px',
              width: '100%'
            }}
            displayEmpty
            renderValue={(value) => {
              if (value === '') {
                return translations.insert.outflowSection
                  .placeholderTypology;
              }
              return value;
            }}
          >
            <MenuItem value="">
              <em>
                {
                  translations.insert.outflowSection
                    .placeholderTypology
                }
              </em>
            </MenuItem>
            {sortTagsByLanguage(paymentTags, language).map(
              (item) =>
                // check if the item is not none because we don't want to show it
                item.label !== 'none' && (
                  <MenuItem key={item.index} value={item.index}>
                    {item.translations[language]}
                  </MenuItem>
                ),
            )}
          </Select>
        </div>

        {/* Amount Input */}
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 180, maxWidth: 250}}>
          <label style={{color: theme.textColor, marginBottom: '8px', fontWeight: 500, textAlign: 'center'}}>
            {translations.general.value}
          </label>
          <div style={inputCurrencyWrapper}>
            <span style={currencySymbolStyle}>€</span>
            <input
              type="text"
              value={outflow}
              onChange={(e) => handleInputChange(e, setOutflow)}
              onBlur={(e) => handleInputBlur(e, setOutflow)}
              placeholder="0"
              style={inputWithCurrency}
            />
          </div>
        </div>

        {/* Date Input */}
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 180, maxWidth: 250}}>
          <label style={{color: theme.textColor, marginBottom: '8px', fontWeight: 500, textAlign: 'center'}}>
            {translations.general.date}
          </label>
          <StyledDateInput
            type="date"
            value={outflowDate}
            onChange={handleOutflowDateChange}
            max={currentDate}
            style={{
              border: `2px solid ${theme.mode === 'dark' ? `${theme.buttonBackgroundColor}30` : '#e2e8f0'}`,
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '1rem',
              background: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
              color: theme.textColor,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              minHeight: '48px',
              width: '100%'
            }}
          />
        </div>

        {/* Balance Source Select */}
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 180, maxWidth: 250}}>
          <label style={{color: theme.textColor, marginBottom: '8px', fontWeight: 500, textAlign: 'center'}}>
            {translations.insert.outflowSection.decreaseWhichBalance || 'Sottrai da'}
          </label>
          <Select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            style={{ 
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: `2px solid ${theme.mode === 'dark' ? `${theme.buttonBackgroundColor}30` : '#e2e8f0'}`,
              minHeight: '48px',
              width: '100%'
            }}
            displayEmpty
            renderValue={(value) => {
              if (value === '') {
                return translations.general.selectAnOption || 'Nessuno (opzionale)';
              }
              return value;
            }}
          >
            <MenuItem value="">
              <em>{translations.general.selectAnOption || 'Nessuno (opzionale)'}</em>
            </MenuItem>
            {balanceOptions && Object.keys(balanceOptions).map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>

      {/* Note and Button Container */}
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%', maxWidth: '600px'}}>
        <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
          <StyledTextArea
            value={noteOutflowAreaValue}
            onChange={(e) => setNoteOutflowAreaValue(e.target.value)}
            maxLength={64}
            placeholder={
              translations.insert.outflowSection.placeholderNote
            }
            style={{
              width: '100%',
              maxWidth: '400px',
              border: `2px solid ${theme.mode === 'dark' ? `${theme.buttonBackgroundColor}30` : '#e2e8f0'}`,
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '1rem',
              background: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
              color: theme.textColor,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              minHeight: '80px',
              resize: 'vertical'
            }}
          />
        </div>
        <div style={{display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '24px'}}>
          <ModernActionButton theme={theme} onClick={onAddOutflow}>
            {translations.insert.outflowSection.updateButton}
          </ModernActionButton>
        </div>
      </div>

      {/* Unified Table Container with Month Selection */}
      <div
        style={{
          width: '100%',
          maxWidth: '100%',
          background: theme.mode === 'dark' 
            ? `linear-gradient(135deg, ${theme.backgroundColor}f0 0%, ${theme.backgroundColor}f8 100%)`
            : `linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)`,
          border: `1px solid ${theme.mode === 'dark' 
            ? `${theme.buttonBackgroundColor}30`
            : '#e2e8f0'}`,
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          boxShadow: theme.mode === 'dark' 
            ? '0 4px 20px rgba(0, 0, 0, 0.2)' 
            : '0 2px 12px rgba(0, 0, 0, 0.06)'
        }}
      >
        {/* Header with Title and Month Selection */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem 1rem 1rem 1rem',
          borderBottom: `1px solid ${theme.mode === 'dark' 
            ? `${theme.buttonBackgroundColor}20`
            : '#e2e8f0'}`,
          gap: '1rem'
        }}>
          <h3 style={{
            color: theme.textColor,
            fontSize: '1.2rem',
            fontWeight: '600',
            textAlign: 'center',
            letterSpacing: '-0.01em',
            margin: 0
          }}>
            {translations.insert.outflowSection.titleListing}
          </h3>
          <select
            className="text-black text-center font-medium"
            style={{ 
              borderRadius: '12px',
              border: `2px solid ${theme.mode === 'dark' ? `${theme.buttonBackgroundColor}40` : '#e2e8f0'}`,
              padding: '12px 20px',
              fontSize: '1rem',
              background: 'white',
              color: '#374151',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              minWidth: '200px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            value={selectedOutflowsMonth}
            onChange={handleOutflowsMonthChange}
          >
            {outflowMonthOptions &&
              outflowMonthOptions.length > 0 &&
              outflowMonthOptions.map((option) => (
                <option
                  className="text-center"
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
          </select>
        </div>
        
        {/* Table Container */}
        <div style={{
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '1rem',
          display: 'flex',
          justifyContent: 'center',
          width: '100%'
        }}>
        <StyledTable theme={theme} className="outflow-table">
          <thead>{renderTableHeader()}</thead>
          <tbody>
            {renderOutflowItems(
              getAddsForMonth(allOutflowsAdds, selectedOutflowMonthKey),
            )}
          </tbody>
        </StyledTable>
        <style>{`
          @media (max-width: 768px) {
            table, .StyledTable, .StyledTable th, .StyledTable td {
              font-size: 0.85em !important;
              padding: 6px 4px !important;
              min-width: 55px !important;
            }
            .StyledTable th, .StyledTable td {
              line-height: 1.2 !important;
              word-break: break-word !important;
            }
            .StyledTable select, .StyledTable input {
              font-size: 0.85em !important;
              padding: 4px 6px !important;
              min-width: 85px !important;
              border-radius: 4px !important;
            }
            .StyledTable button {
              font-size: 0.8em !important;
              padding: 3px 5px !important;
              min-width: 28px !important;
              border-radius: 4px !important;
            }
            .StyledTable .MuiInputBase-root, .StyledTable .MuiSelect-root {
              font-size: 0.85em !important;
            }
          }
          @media (max-width: 480px) {
            table, .StyledTable, .StyledTable th, .StyledTable td {
              font-size: 0.75em !important;
              padding: 4px 2px !important;
            }
            .StyledTable select, .StyledTable input {
              font-size: 0.75em !important;
              padding: 2px 4px !important;
              min-width: 70px !important;
            }
            .StyledTable button {
              font-size: 0.75em !important;
              padding: 2px 3px !important;
              min-width: 24px !important;
            }
          }
        `}</style>
        </div>
      </div>
    </div>
  );
}