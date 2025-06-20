
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

  // Wrapper e stile per input con simbolo valuta
  const inputCurrencyWrapper = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.5em',
    minWidth: 0,
  };
  const inputWithCurrency = {
    textAlign: 'center',
    padding: '8px 8px 8px 2em', // spazio a sinistra per il simbolo
    border: '1px solid #ccc',
    borderRadius: '4px',
    color: '#333',
    outline: 'none',
    width: '140px', // larghezza uniforme
    height: '40px', // altezza uniforme
    fontSize: '1.05em',
    background: 'white',
    boxSizing: 'border-box',
  };
  const currencySymbolStyle = {
    position: 'absolute',
    left: '0.7em',
    color: '#888',
    fontSize: '0.95em', // più piccolo
    pointerEvents: 'none',
    top: '50%',
    transform: 'translateY(-52%)', // leggermente più su per centratura visiva
    lineHeight: 1,
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
          <div className="labelContainer text-center p-1 bg-white border-2 border-paciGreen rounded-md outline-none w-32 md:w-60 mb-2 md:mb-4">
            <label className="labelStyle flex items-center justify-center text-black h-full text-xs md:text-base">
              {languages[language].assets.bank}
            </label>
          </div>
          <div className="labelContainer text-center p-1 bg-white border-2 border-paciGreen rounded-md outline-none w-32 md:w-60 mb-2 md:mb-4">
            <label className="labelStyle flex items-center justify-center text-black h-full text-xs md:text-base">
              {languages[language].assets.cash}
            </label>
          </div>
          <div className="labelContainer text-center p-1 bg-white border-2 border-paciGreen rounded-md outline-none w-32 md:w-60 mb-2 md:mb-4">
            <label className="labelStyle flex items-center justify-center text-black h-full text-xs md:text-base">
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
          <div className="labelContainer text-center p-1 bg-white border-2 border-paciGreen rounded-md outline-none w-32 md:w-60 mb-2 md:mb-4">
            <label className="labelStyle flex items-center justify-center text-black h-full text-xs md:text-base">
              {languages[language].assets.stocks}
            </label>
          </div>
          <div className="labelContainer text-center p-1 bg-white border-2 border-paciGreen rounded-md outline-none w-32 md:w-60 mb-2 md:mb-4">
            <label className="labelStyle flex items-center justify-center text-black h-full text-xs md:text-base">
              {languages[language].assets.etf}
            </label>
          </div>
          <div className="labelContainer text-center p-1 bg-white border-2 border-paciGreen rounded-md outline-none w-32 md:w-60 mb-2 md:mb-4">
            <label className="labelStyle flex items-center justify-center text-black h-full text-xs md:text-base">
              {languages[language].assets.bitcoin}
            </label>
          </div>
          <div className="labelContainer text-center p-1 bg-white border-2 border-paciGreen rounded-md outline-none w-32 md:w-60 mb-2 md:mb-4">
            <label className="labelStyle flex items-center justify-center text-black h-full text-xs md:text-base">
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
