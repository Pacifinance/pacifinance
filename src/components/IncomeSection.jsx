import React from 'react';
import { Select, MenuItem } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSearch, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import languages from '../data/languages.json';
import { LanguageContext } from '../contexts/LanguageContext';
import { sortTagsByLanguage } from '../utils/sortingUtils';
import {
  MySecondaryButton,
  StyledDateInput,
  StyledAddSection,
  StyledTable,
  StyledTextArea,
  TitleLastAdds,
} from '../styles/MyStyled';
import { incomeCategoryColors } from '../data/categoryColors';

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
  incomeDateFilter,
  setIncomeDateFilter,
  showIncomeNoteInput,
  setShowIncomeNoteInput,
  showIncomeDatePicker,
  setShowIncomeDatePicker,
  onAddIncome,
  onDeleteIncome,
}) {
  const { language } = React.useContext(LanguageContext);

  const handleIncomeDateChange = (event) => {
    let inputDate = event.target.value;
    setIncomeDate(inputDate);
  };

  const handleIncomesMonthChange = (event) => {
    setSelectedIncomesMonth(event.target.value);
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
    const { min, max } = getDateRangeForMonth(incomeMonthOptions[selectedIncomesMonth]);
    return (
      <tr style={{ color: 'white', background: 'transparent' }}>
        <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>
          <select
            value={incomeCategoryFilter}
            onChange={(e) => setIncomeCategoryFilter(e.target.value)}
            style={dropdownStyle}
          >
            <option value="">{languages[language].insert.incomeSection.tableColumns.category}</option>
            {incomesTags.map((item) => (
              <option key={item.index} value={item.translations[language]}>
                {item.translations[language]}
              </option>
            ))}
          </select>
        </th>
        <th
          style={{
            textAlign: 'center',
            verticalAlign: 'middle',
            minWidth: 100,
          }}
        >
          {languages[language].general.value}
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
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {!showIncomeNoteInput ? (
              <span
                style={{ color: 'white', marginRight: 6, cursor: 'pointer' }}
                onClick={() => setShowIncomeNoteInput(true)}
              >
                {languages[language].insert.incomeSection.tableColumns.note} <FontAwesomeIcon icon={faSearch} />
              </span>
            ) : (
              <input
                type="text"
                placeholder={languages[language].insert.incomeSection.tableColumns.note}
                value={incomeNoteFilter}
                onChange={(e) => setIncomeNoteFilter(e.target.value)}
                className="w-full"
                style={{
                  color: 'white',
                  background: 'transparent',
                  textAlign: 'center',
                  marginTop: 2,
                }}
                onBlur={() => setShowIncomeNoteInput(false)}
                autoFocus
              />
            )}
          </div>
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
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {!showIncomeDatePicker ? (
              <span
                style={{ color: 'white', marginRight: 6, cursor: 'pointer' }}
                onClick={() => setShowIncomeDatePicker(true)}
              >
                <FontAwesomeIcon icon={faCalendarAlt} />{' '}
                {incomeDateFilter
                  ? incomeDateFilter.split('-').reverse().join('/')
                  : 'Data'}
              </span>
            ) : (
              <input
                type="date"
                value={incomeDateFilter}
                onChange={(e) => {
                  setIncomeDateFilter(e.target.value);
                  setShowIncomeDatePicker(false);
                }}
                className="w-full"
                style={{
                  color: 'white',
                  background: 'transparent',
                  textAlign: 'center',
                  marginTop: 2,
                }}
                min={min}
                max={max}
                onBlur={() => setShowIncomeDatePicker(false)}
                autoFocus
              />
            )}
          </div>
        </th>
        <th style={{ textAlign: 'center', verticalAlign: 'middle' }}></th>
      </tr>
    );
  }

  function renderIncomeItems(chosenIncomesToShow) {
    const filtered = chosenIncomesToShow.filter(
      (add) =>
        (!incomeCategoryFilter ||
          add.categoryTag.translations[language] === incomeCategoryFilter) &&
        (!incomeNoteFilter ||
          (add.notes &&
            add.notes
              .toLowerCase()
              .includes(incomeNoteFilter.toLowerCase()))) &&
        (!incomeDateFilter ||
          new Date(add.date).toISOString().slice(0, 10) === incomeDateFilter),
    );
    const totals = getTotals(filtered, chosenIncomesToShow);
    const filtersActive =
      incomeCategoryFilter || incomeNoteFilter || incomeDateFilter;
    const rows = [
      ...filtered.map((add, index) => {
        let colorKey = undefined;

        // First try to get the English translation as it matches the keys in categoryColors.js
        if (add.categoryTag && add.categoryTag.translations && add.categoryTag.translations['en']) {
          colorKey = add.categoryTag.translations['en'];
        } else if (add.categoryTag && add.categoryTag.label) {
          colorKey = add.categoryTag.label;
        } else if (add.categoryTag && add.categoryTag.translations) {
          const keys = Object.keys(add.categoryTag.translations);
          if (keys.length > 0) colorKey = add.categoryTag.translations[keys[0]];
        }

        const baseColor = incomeCategoryColors[colorKey] || 'rgba(181, 222, 209, 0.35)';
        const rowGradient = getGradientForCategory(baseColor);
        return (
          <tr key={index} style={{ background: rowGradient }}>
            <td>
              {isHidden ? '****' : add.categoryTag.translations[language]}
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
              <button
                data-umami-event="deleteIncome"
                onClick={() => onDeleteIncome(add.date, add.amount)}
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
            </td>
          </tr>
        );
      }),
    ];
    if (filtersActive) {
      rows.push(
        <tr
          key="total-filtered-income"
          style={{ background: '#1ec6a6', fontWeight: 700 }}
        >
          <td
            colSpan={1}
            style={{
              textAlign: 'center',
              fontSize: '1.08em',
              letterSpacing: 1,
              color: '#1a2b2b',
            }}
          >
            {languages[language].general.totalFiltered || 'Total Filtered'}
          </td>
          <td
            colSpan={1}
            style={{
              textAlign: 'center',
              fontSize: '1.08em',
              color: '#1a2b2b',
            }}
          >
            {isHidden
              ? '****'
              : totals.totalFiltered.toLocaleString('it-IT', {
                  minimumFractionDigits: 2,
                })}{' '}
            €
          </td>
          <td colSpan={3}></td>
        </tr>,
      );
    }
    rows.push(
      <tr key="total-income" style={{ background: '#0fa37f', fontWeight: 700 }}>
        <td
          colSpan={1}
          style={{
            textAlign: 'center',
            fontSize: '1.15em',
            letterSpacing: 1,
            color: '#fff',
          }}
        >
          {languages[language].general.total}
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
        gap: window.innerWidth > 768 ? '2rem' : '1rem',
        width: '100%',
        marginBottom: '2rem',
        padding: '0 1rem'
      }}>
        {/* Category Select */}
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 200, maxWidth: 280}}>
          <label style={{color: theme.textColor, marginBottom: '8px', fontWeight: 500, textAlign: 'center'}}>
            Categoria
          </label>
          <Select
            value={categoryIncome.value}
            onChange={(event) => {
              const selectedKey = event.target.value;
              const selectedItem = incomesTags.find(
                (item) => item.index === selectedKey,
              );

              if (selectedItem) {
                const selectedValue = selectedItem.translations[language];
                setCategoryIncome({
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
                return languages[language].insert.incomeSection
                  .placeholderCategory;
              }
              return value;
            }}
          >
            <MenuItem value="">
              <em>
                {
                  languages[language].insert.incomeSection
                    .placeholderCategory
                }
              </em>
            </MenuItem>
            {sortTagsByLanguage(incomesTags, language).map((item) => (
              <MenuItem key={item.index} value={item.index}>
                {item.translations[language]}
              </MenuItem>
            ))}
          </Select>
        </div>

        {/* Amount Input */}
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 200, maxWidth: 280}}>
          <label style={{color: theme.textColor, marginBottom: '8px', fontWeight: 500, textAlign: 'center'}}>
            Importo
          </label>
          <div style={inputCurrencyWrapper}>
            <span style={currencySymbolStyle}>€</span>
            <input
              type="text"
              value={income}
              onChange={(e) => handleInputChange(e, setIncome)}
              onBlur={(e) => handleInputBlur(e, setIncome)}
              placeholder="0"
              style={inputWithCurrency}
            />
          </div>
        </div>

        {/* Date Input */}
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 200, maxWidth: 280}}>
          <label style={{color: theme.textColor, marginBottom: '8px', fontWeight: 500, textAlign: 'center'}}>
            Data
          </label>
          <StyledDateInput
            type="date"
            value={incomeDate}
            onChange={handleIncomeDateChange}
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
      </div>

      {/* Note and Button Container */}
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%', maxWidth: '600px'}}>
        <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
          <StyledTextArea
            value={noteIncomeAreaValue}
            onChange={(e) => setNoteIncomeAreaValue(e.target.value)}
            maxLength={64}
            placeholder={
              languages[language].insert.incomeSection.placeholderNote
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
        <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
          <MySecondaryButton theme={theme} onClick={onAddIncome}>
            {languages[language].insert.incomeSection.updateButton}
          </MySecondaryButton>
        </div>
      </div>

      <TitleLastAdds theme={theme} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '100%' }}>
        <span style={{ marginRight: '0.5rem' }}>{languages[language].insert.incomeSection.titleListing}</span>
        <select
          className="text-black text-center font-normal text-base px-2 py-1 rounded-md"
          style={{ 
            borderRadius: '8px',
            border: '1px solid #ccc',
            padding: '6px 12px',
            fontSize: '0.9rem'
          }}
          value={selectedIncomesMonth}
          onChange={handleIncomesMonthChange}
        >
          {incomeMonthOptions &&
            incomeMonthOptions.length > 0 &&
            incomeMonthOptions.map((option) => (
              <option
                className="text-center"
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
        </select>
      </TitleLastAdds>

      {/* Wrapper responsive per tabella income */}
      <div
        style={{
          overflowX: 'auto',
          maxWidth: '100%',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          WebkitOverflowScrolling: 'touch',
          margin: '0',
          padding: '0'
        }}
      >
        <StyledTable theme={theme} style={{ minWidth: 600 }}>
          <thead>{renderTableHeader()}</thead>
          <tbody>
            {renderIncomeItems(
              getAddsForMonth(allIncomesAdds, selectedIncomeMonthKey),
            )}
          </tbody>
        </StyledTable>
        <style>{`
          @media (max-width: 600px) {
            table, .StyledTable, .StyledTable th, .StyledTable td {
              font-size: 0.7em !important;
              padding: 2px 1px !important;
              min-width: 40px !important;
            }
            .StyledTable th, .StyledTable td {
              line-height: 1.0 !important;
              word-break: break-word !important;
            }
            .StyledTable select, .StyledTable input {
              font-size: 0.7em !important;
              padding: 2px 4px !important;
              min-width: 80px !important;
            }
            .StyledTable button {
              font-size: 0.7em !important;
              padding: 2px 4px !important;
              min-width: 25px !important;
            }
            .StyledTable .MuiInputBase-root, .StyledTable .MuiSelect-root {
              font-size: 0.7em !important;
            }
          }
        `}</style>
       </div>
     </div>
   );
}