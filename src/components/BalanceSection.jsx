
import React from 'react';
import languages from '../data/languages.json';
import { LanguageContext } from '../contexts/LanguageContext';
import {
  TitleSection,
  StyledInputs,
  Column,
  StyledCalendarInput,
  StyledDateInput,
  MySecondaryButton,
} from '../styles/MyStyled';

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

export default function BalanceSection({
  theme,
  isHidden,
  bankReal,
  setBankReal,
  cashReal,
  setCashReal,
  digitalServicesReal,
  setDigitalServicesReal,
  stocksReal,
  setStocksReal,
  etfReal,
  setETFReal,
  bitcoinReal,
  setBitcoinReal,
  cryptoReal,
  setCryptoReal,
  balanceDate,
  setBalanceDate,
  onUpdateBalance,
}) {
  const { language } = React.useContext(LanguageContext);

  const handleBalanceDateChange = (event) => {
    let inputDate = event.target.value;
    setBalanceDate(inputDate);
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

  return (
    <>
      {/*TitleSection used to create a distance TO UPGRADE */}
      <TitleSection theme={theme}>
        {' '}
        {languages[language].insert.balanceSection.titleLiquidity}{' '}
      </TitleSection>
      <StyledInputs theme={theme}>
        <Column>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 16px',
            background: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
            border: `2px solid ${theme.mode === 'dark' ? `${theme.buttonBackgroundColor}30` : '#e2e8f0'}`,
            borderRadius: '12px',
            color: theme.textColor,
            fontFamily: "'Inter', sans-serif",
            fontSize: '1rem',
            fontWeight: '500',
            minHeight: '48px',
            width: '100%',
            maxWidth: '400px',
            marginBottom: '8px',
            transition: 'all 0.3s ease'
          }}>
            <label style={{color: theme.textColor, textAlign: 'center', width: '100%'}}>
              {languages[language].assets.bank}
            </label>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 16px',
            background: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
            border: `2px solid ${theme.mode === 'dark' ? `${theme.buttonBackgroundColor}30` : '#e2e8f0'}`,
            borderRadius: '12px',
            color: theme.textColor,
            fontFamily: "'Inter', sans-serif",
            fontSize: '1rem',
            fontWeight: '500',
            minHeight: '48px',
            width: '100%',
            maxWidth: '400px',
            marginBottom: '8px',
            transition: 'all 0.3s ease'
          }}>
            <label style={{color: theme.textColor, textAlign: 'center', width: '100%'}}>
              {languages[language].assets.cash}
            </label>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 16px',
            background: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
            border: `2px solid ${theme.mode === 'dark' ? `${theme.buttonBackgroundColor}30` : '#e2e8f0'}`,
            borderRadius: '12px',
            color: theme.textColor,
            fontFamily: "'Inter', sans-serif",
            fontSize: '1rem',
            fontWeight: '500',
            minHeight: '48px',
            width: '100%',
            maxWidth: '400px',
            marginBottom: '8px',
            transition: 'all 0.3s ease'
          }}>
            <label style={{color: theme.textColor, textAlign: 'center', width: '100%'}}>
              {languages[language].assets.digitalServices}
            </label>
          </div>
        </Column>
        <Column>
          <div style={inputCurrencyWrapper}>
            <span style={currencySymbolStyle}>€</span>
            <input
              type="text"
              onChange={(e) => handleInputChange(e, setBankReal)}
              onBlur={(e) => handleInputBlur(e, setBankReal)}
              placeholder={
                isHidden
                  ? '****'
                  : bankReal.toLocaleString('it-IT', {
                      minimumFractionDigits: 2,
                    })
              }
              style={inputWithCurrency}
            />
          </div>
          <div style={inputCurrencyWrapper}>
            <span style={currencySymbolStyle}>€</span>
            <input
              type="text"
              onChange={(e) => handleInputChange(e, setCashReal)}
              onBlur={(e) => handleInputBlur(e, setCashReal)}
              placeholder={
                isHidden
                  ? '****'
                  : cashReal.toLocaleString('it-IT', {
                      minimumFractionDigits: 2,
                    })
              }
              style={inputWithCurrency}
            />
          </div>
          <div style={inputCurrencyWrapper}>
            <span style={currencySymbolStyle}>€</span>
            <input
              type="text"
              onChange={(e) => handleInputChange(e, setDigitalServicesReal)}
              onBlur={(e) => handleInputBlur(e, setDigitalServicesReal)}
              placeholder={
                isHidden
                  ? '****'
                  : digitalServicesReal.toLocaleString('it-IT', {
                      minimumFractionDigits: 2,
                    })
              }
              style={inputWithCurrency}
            />
          </div>
        </Column>
      </StyledInputs>
      <TitleSection theme={theme}>
        {' '}
        {languages[language].insert.balanceSection.titleInvestments}{' '}
      </TitleSection>
      <StyledInputs theme={theme}>
        <Column>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 16px',
            background: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
            border: `2px solid ${theme.mode === 'dark' ? `${theme.buttonBackgroundColor}30` : '#e2e8f0'}`,
            borderRadius: '12px',
            color: theme.textColor,
            fontFamily: "'Inter', sans-serif",
            fontSize: '1rem',
            fontWeight: '500',
            minHeight: '48px',
            width: '100%',
            maxWidth: '400px',
            marginBottom: '8px',
            transition: 'all 0.3s ease'
          }}>
            <label style={{color: theme.textColor, textAlign: 'center', width: '100%'}}>
              {languages[language].assets.stocks}
            </label>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 16px',
            background: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
            border: `2px solid ${theme.mode === 'dark' ? `${theme.buttonBackgroundColor}30` : '#e2e8f0'}`,
            borderRadius: '12px',
            color: theme.textColor,
            fontFamily: "'Inter', sans-serif",
            fontSize: '1rem',
            fontWeight: '500',
            minHeight: '48px',
            width: '100%',
            maxWidth: '400px',
            marginBottom: '8px',
            transition: 'all 0.3s ease'
          }}>
            <label style={{color: theme.textColor, textAlign: 'center', width: '100%'}}>
              {languages[language].assets.etf}
            </label>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 16px',
            background: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
            border: `2px solid ${theme.mode === 'dark' ? `${theme.buttonBackgroundColor}30` : '#e2e8f0'}`,
            borderRadius: '12px',
            color: theme.textColor,
            fontFamily: "'Inter', sans-serif",
            fontSize: '1rem',
            fontWeight: '500',
            minHeight: '48px',
            width: '100%',
            maxWidth: '400px',
            marginBottom: '8px',
            transition: 'all 0.3s ease'
          }}>
            <label style={{color: theme.textColor, textAlign: 'center', width: '100%'}}>
              {languages[language].assets.bitcoin}
            </label>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 16px',
            background: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
            border: `2px solid ${theme.mode === 'dark' ? `${theme.buttonBackgroundColor}30` : '#e2e8f0'}`,
            borderRadius: '12px',
            color: theme.textColor,
            fontFamily: "'Inter', sans-serif",
            fontSize: '1rem',
            fontWeight: '500',
            minHeight: '48px',
            width: '100%',
            maxWidth: '400px',
            marginBottom: '8px',
            transition: 'all 0.3s ease'
          }}>
            <label style={{color: theme.textColor, textAlign: 'center', width: '100%'}}>
              {languages[language].assets.crypto}
            </label>
          </div>
        </Column>
        <Column>
          <div style={inputCurrencyWrapper}>
            <span style={currencySymbolStyle}>€</span>
            <input
              type="text"
              onChange={(e) => handleInputChange(e, setStocksReal)}
              onBlur={(e) => handleInputBlur(e, setStocksReal)}
              placeholder={
                isHidden
                  ? '****'
                  : stocksReal.toLocaleString('it-IT', {
                      minimumFractionDigits: 2,
                    })
              }
              style={inputWithCurrency}
            />
          </div>
          <div style={inputCurrencyWrapper}>
            <span style={currencySymbolStyle}>€</span>
            <input
              type="text"
              onChange={(e) => handleInputChange(e, setETFReal)}
              onBlur={(e) => handleInputBlur(e, setETFReal)}
              placeholder={
                isHidden
                  ? '****'
                  : etfReal.toLocaleString('it-IT', {
                      minimumFractionDigits: 2,
                    })
              }
              style={inputWithCurrency}
            />
          </div>
          <div style={inputCurrencyWrapper}>
            <span style={currencySymbolStyle}>€</span>
            <input
              type="text"
              onChange={(e) => handleInputChange(e, setBitcoinReal)}
              onBlur={(e) => handleInputBlur(e, setBitcoinReal)}
              placeholder={
                isHidden
                  ? '****'
                  : bitcoinReal.toLocaleString('it-IT', {
                      minimumFractionDigits: 2,
                    })
              }
              style={inputWithCurrency}
            />
          </div>
          <div style={inputCurrencyWrapper}>
            <span style={currencySymbolStyle}>€</span>
            <input
              type="text"
              onChange={(e) => handleInputChange(e, setCryptoReal)}
              onBlur={(e) => handleInputBlur(e, setCryptoReal)}
              placeholder={
                isHidden
                  ? '****'
                  : cryptoReal.toLocaleString('it-IT', {
                      minimumFractionDigits: 2,
                    })
              }
              style={inputWithCurrency}
            />
          </div>
          {/* Responsive: riduci larghezza e font su mobile */}
          <style>{`
            @media (max-width: 600px) {
              .labelContainer { min-width: 0 !important; width: 100% !important; }
              .labelStyle { font-size: 0.90em !important; }
              input[type='text'] { font-size: 0.98em !important; height: 34px !important; }
              .MuiInputBase-root, .MuiSelect-root { font-size: 0.98em !important; }
            }
          `}</style>
        </Column>
      </StyledInputs>

      <StyledCalendarInput>
        <StyledDateInput
          type="date"
          value={balanceDate}
          onChange={handleBalanceDateChange}
          max={currentDate}
        />
      </StyledCalendarInput>

      <StyledInputs theme={theme}>
        <MySecondaryButton theme={theme} onClick={onUpdateBalance}>
          {languages[language].insert.balanceSection.updateButton}
        </MySecondaryButton>
      </StyledInputs>
    </>
  );
}
