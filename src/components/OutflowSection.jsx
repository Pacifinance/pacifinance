
import React from 'react';
import { Select, MenuItem } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSearch, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import languages from '../data/languages.json';
import { LanguageContext } from '../contexts/LanguageContext';
import {
  MySecondaryButton,
  StyledDateInput,
  StyledAddSection,
  StyledTable,
  StyledTextArea,
  TitleLastAdds,
} from '../styles/MyStyled';
import { outflowCategoryColors } from '../data/categoryColors';

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
  outflowDateFilter,
  setOutflowDateFilter,
  showOutflowNoteInput,
  setShowOutflowNoteInput,
  showOutflowDatePicker,
  setShowOutflowDatePicker,
  onAddOutflow,
  onDeleteOutflow,
}) {
  const { language } = React.useContext(LanguageContext);

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
    maxWidth: '400px',
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
    const { min, max } = getDateRangeForMonth(outflowMonthOptions[selectedOutflowsMonth]);
    return (
      <tr style={{ color: 'white', background: 'transparent' }}>
        <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>
          <select
            value={outflowCategoryFilter}
            onChange={(e) => setOutflowCategoryFilter(e.target.value)}
            style={dropdownStyle}
          >
            <option value="">{languages[language].insert.outflowSection.tableColumns.category}</option>
            {OutflowsTags.map((item) => (
              <option key={item.index} value={item.translations[language]}>
                {item.translations[language]}
              </option>
            ))}
          </select>
        </th>
        <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>
          <select
            value={outflowTypologyFilter}
            onChange={(e) => setOutflowTypologyFilter(e.target.value)}
            style={dropdownStyle}
          >
            <option value="">{languages[language].insert.outflowSection.tableColumns.typology}</option>
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
            {!showOutflowNoteInput ? (
              <span
                style={{ color: 'white', marginRight: 6, cursor: 'pointer' }}
                onClick={() => setShowOutflowNoteInput(true)}
              >
                {languages[language].insert.outflowSection.tableColumns.note} <FontAwesomeIcon icon={faSearch} />
              </span>
            ) : (
              <input
                type="text"
                placeholder={languages[language].insert.outflowSection.tableColumns.note}
                value={outflowNoteFilter}
                onChange={(e) => setOutflowNoteFilter(e.target.value)}
                className="w-full"
                style={{
                  color: 'white',
                  background: 'transparent',
                  textAlign: 'center',
                  marginTop: 2,
                }}
                onBlur={() => setShowOutflowNoteInput(false)}
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
            {!showOutflowDatePicker ? (
              <span
                style={{ color: 'white', marginRight: 6, cursor: 'pointer' }}
                onClick={() => setShowOutflowDatePicker(true)}
              >
                <FontAwesomeIcon icon={faCalendarAlt} />{' '}
                {outflowDateFilter
                  ? outflowDateFilter.split('-').reverse().join('/')
                  : 'Data'}
              </span>
            ) : (
              <input
                type="date"
                value={outflowDateFilter}
                onChange={(e) => {
                  setOutflowDateFilter(e.target.value);
                  setShowOutflowDatePicker(false);
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
                onBlur={() => setShowOutflowDatePicker(false)}
                autoFocus
              />
            )}
          </div>
        </th>
        <th style={{ textAlign: 'center', verticalAlign: 'middle' }}></th>
      </tr>
    );
  }

  function renderOutflowItems(chosenOutflowsToShow) {
    const filtered = chosenOutflowsToShow.filter(
      (add) =>
        (!outflowCategoryFilter ||
          add.categoryTag.translations[language] === outflowCategoryFilter) &&
        (!outflowTypologyFilter ||
          add.paymentType.translations[language] === outflowTypologyFilter) &&
        (!outflowNoteFilter ||
          (add.notes &&
            add.notes
              .toLowerCase()
              .includes(outflowNoteFilter.toLowerCase()))) &&
        (!outflowDateFilter ||
          new Date(add.date).toISOString().slice(0, 10) === outflowDateFilter),
    );
    const totals = getTotals(filtered, chosenOutflowsToShow);
    const filtersActive =
      outflowCategoryFilter ||
      outflowTypologyFilter ||
      outflowNoteFilter ||
      outflowDateFilter;
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
        
        const baseColor = outflowCategoryColors[colorKey] || 'rgba(255, 207, 207, 0.32)';
        const rowGradient = getGradientForCategory(baseColor);
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
              <button
                data-umami-event="deleteOutflow"
                onClick={() => onDeleteOutflow(add.date, add.amount)}
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
            {languages[language].general.totalFiltered || 'Total Filtered'}
          </td>
          <td
            colSpan={1}
            style={{
              textAlign: 'center',
              fontSize: '1.08em',
              color: '#6b1a1a',
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
    <>
      <StyledAddSection theme={theme}>
        <label>
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
            style={{ backgroundColor: 'white' }}
            displayEmpty
            renderValue={(value) => {
              if (value === '') {
                return languages[language].insert.outflowSection
                  .placeholderCategory;
              }
              return value;
            }}
          >
            <MenuItem value="">
              <em>
                {
                  languages[language].insert.outflowSection
                    .placeholderCategory
                }
              </em>
            </MenuItem>
            {OutflowsTags.map((item) => (
              <MenuItem key={item.index} value={item.index}>
                {item.translations[language]}
              </MenuItem>
            ))}
          </Select>
        </label>
        <label>
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
            style={{ backgroundColor: 'white' }}
            displayEmpty
            renderValue={(value) => {
              if (value === '') {
                return languages[language].insert.outflowSection
                  .placeholderTypology;
              }
              return value;
            }}
          >
            <MenuItem value="">
              <em>
                {
                  languages[language].insert.outflowSection
                    .placeholderTypology
                }
              </em>
            </MenuItem>
            {paymentTags.map(
              (item) =>
                // check if the item is not none because we don't want to show it
                item.label !== 'none' && (
                  <MenuItem key={item.index} value={item.index}>
                    {item.translations[language]}
                  </MenuItem>
                ),
            )}
          </Select>
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

        <div>
          <StyledDateInput
            type="date"
            value={outflowDate}
            onChange={handleOutflowDateChange}
            max={currentDate}
          />
        </div>
      </StyledAddSection>

      <StyledAddSection theme={theme}>
        <label>
          <StyledTextArea
            value={noteOutflowAreaValue}
            onChange={(e) => setNoteOutflowAreaValue(e.target.value)}
            maxLength={64}
            placeholder={
              languages[language].insert.outflowSection.placeholderNote
            }
          />
        </label>
      </StyledAddSection>

      <StyledAddSection theme={theme}>
        <MySecondaryButton theme={theme} onClick={onAddOutflow}>
          {languages[language].insert.outflowSection.updateButton}
        </MySecondaryButton>
      </StyledAddSection>
      <TitleLastAdds theme={theme}>
        {languages[language].insert.outflowSection.titleListing}
        <select
          className="text-black text-center font-normal text-base mx-2 px-1 py-1 rounded-md"
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
      </TitleLastAdds>

      {/* Wrapper responsive per tabella outflow */}
      <div
        style={{
          overflowX: 'auto',
          maxWidth: '100vw',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <StyledTable theme={theme} style={{ minWidth: 700 }}>
          <thead>{renderTableHeader()}</thead>
          <tbody>
            {renderOutflowItems(
              getAddsForMonth(allOutflowsAdds, selectedOutflowMonthKey),
            )}
          </tbody>
        </StyledTable>
        <style>{`
          @media (max-width: 600px) {
            table, .StyledTable, .StyledTable th, .StyledTable td {
              font-size: 0.92em !important;
              padding: 4px 2px !important;
              min-width: 60px !important;
            }
            .StyledTable th, .StyledTable td {
              line-height: 1.1 !important;
            }
            .StyledTable select, .StyledTable input, .StyledTable button {
              font-size: 0.95em !important;
              padding: 4px 2px !important;
            }
            .StyledTable .MuiInputBase-root, .StyledTable .MuiSelect-root {
              font-size: 0.95em !important;
            }
          }
        `}</style>
      </div>
    </>
  );
}
