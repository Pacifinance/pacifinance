import React from 'react';
import languages from '../data/languages.json';
import { LanguageContext } from '../contexts/LanguageContext';
import { Select, MenuItem } from '@mui/material';
import {
  StyledDateInput,
  ModernActionButton,
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
  emergencyFund,
  setEmergencyFund,
  stocksReal,
  setStocksReal,
  etfReal,
  setETFReal,
  bitcoinReal,
  setBitcoinReal,
  cryptoReal,
  setCryptoReal,
  bondsReal,
  setBondsReal,
  fundsReal,
  setFundsReal,
  goldReal,
  setGoldReal,
  balanceDate,
  setBalanceDate,
  onUpdateBalance,
  language,
}) {

  const handleBalanceDateChange = (event) => {
    const [month, year] = event.target.value.split('-').map(Number);
    setBalanceDate({ month, year });
  };

  // Create month/year options for the last 12 months
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  const monthNames = {
    1: languages[language].months.january,
    2: languages[language].months.february,
    3: languages[language].months.march,
    4: languages[language].months.april,
    5: languages[language].months.may,
    6: languages[language].months.june,
    7: languages[language].months.july,
    8: languages[language].months.august,
    9: languages[language].months.september,
    10: languages[language].months.october,
    11: languages[language].months.november,
    12: languages[language].months.december,
  };

  // Build the last 12 months (including current) - newest first
  let monthsArray = [];
  for (let i = 0; i < 12; i++) {
    let d = new Date(currentYear, currentMonth - 1 - i, 1);
    monthsArray.push({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      label: `${monthNames[d.getMonth() + 1]} ${d.getFullYear()}`,
      value: `${d.getMonth() + 1}-${d.getFullYear()}`
    });
  }

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

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
      <div style={{textAlign: 'center', width: '100%', marginBottom: '2rem'}}>
        <h3 style={{color: theme.textColor, fontSize: '1.5rem', fontWeight: '600', margin: '0 0 1.5rem 0'}}>
          {languages[language].insert.balanceSection.titleLiquidity}
        </h3>
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: '100%', gap: '1.5rem', marginBottom: '0'}}>
          {/* Bank */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, maxWidth: 200}}>
            <label style={{color: theme.textColor, textAlign: 'center', marginBottom: 8, fontWeight: 500}}>
              {languages[language].assets.bank}
            </label>
            <div style={inputCurrencyWrapper}>
              <span style={currencySymbolStyle}>€</span>
              <input
                type="text"
                onChange={(e) => handleInputChange(e, setBankReal)}
                onBlur={(e) => handleInputBlur(e, setBankReal)}
                placeholder={isHidden ? '****' : bankReal.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                style={inputWithCurrency}
              />
            </div>
          </div>
          {/* Cash */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, maxWidth: 200}}>
            <label style={{color: theme.textColor, textAlign: 'center', marginBottom: 8, fontWeight: 500}}>
              {languages[language].assets.cash}
            </label>
            <div style={inputCurrencyWrapper}>
              <span style={currencySymbolStyle}>€</span>
              <input
                type="text"
                onChange={(e) => handleInputChange(e, setCashReal)}
                onBlur={(e) => handleInputBlur(e, setCashReal)}
                placeholder={isHidden ? '****' : cashReal.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                style={inputWithCurrency}
              />
            </div>
          </div>
          {/* Digital Services */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, maxWidth: 200}}>
            <label style={{color: theme.textColor, textAlign: 'center', marginBottom: 8, fontWeight: 500}}>
              {languages[language].assets.digitalServices}
            </label>
            <div style={inputCurrencyWrapper}>
              <span style={currencySymbolStyle}>€</span>
              <input
                type="text"
                onChange={(e) => handleInputChange(e, setDigitalServicesReal)}
                onBlur={(e) => handleInputBlur(e, setDigitalServicesReal)}
                placeholder={isHidden ? '****' : digitalServicesReal.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                style={inputWithCurrency}
              />
            </div>
          </div>
          {/* Emergency Fund */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, maxWidth: 200}}>
            <label style={{color: theme.textColor, textAlign: 'center', marginBottom: 8, fontWeight: 500}}>
              {languages[language].assets.emergencyFund}
            </label>
            <div style={inputCurrencyWrapper}>
              <span style={currencySymbolStyle}>€</span>
              <input
                type="text"
                onChange={(e) => handleInputChange(e, setEmergencyFund)}
                onBlur={(e) => handleInputBlur(e, setEmergencyFund)}
                placeholder={isHidden ? '****' : emergencyFund.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                style={inputWithCurrency}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{textAlign: 'center', width: '100%', marginBottom: '2rem'}}>
        <h3 style={{color: theme.textColor, fontSize: '1.5rem', fontWeight: '600', margin: '0 0 1.5rem 0'}}>
          {languages[language].insert.balanceSection.titleInvestments}
        </h3>
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: '100%', gap: '1.5rem', marginBottom: '0'}}>
          {/* Stocks */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, maxWidth: 200}}>
            <label style={{color: theme.textColor, textAlign: 'center', marginBottom: 8, fontWeight: 500}}>
              {languages[language].assets.stocks}
            </label>
            <div style={inputCurrencyWrapper}>
              <span style={currencySymbolStyle}>€</span>
              <input
                type="text"
                onChange={(e) => handleInputChange(e, setStocksReal)}
                onBlur={(e) => handleInputBlur(e, setStocksReal)}
                placeholder={isHidden ? '****' : stocksReal.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                style={inputWithCurrency}
              />
            </div>
          </div>
          {/* ETF */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, maxWidth: 200}}>
            <label style={{color: theme.textColor, textAlign: 'center', marginBottom: 8, fontWeight: 500}}>
              {languages[language].assets.etf}
            </label>
            <div style={inputCurrencyWrapper}>
              <span style={currencySymbolStyle}>€</span>
              <input
                type="text"
                onChange={(e) => handleInputChange(e, setETFReal)}
                onBlur={(e) => handleInputBlur(e, setETFReal)}
                placeholder={isHidden ? '****' : etfReal.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                style={inputWithCurrency}
              />
            </div>
          </div>
          {/* Bitcoin */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, maxWidth: 200}}>
            <label style={{color: theme.textColor, textAlign: 'center', marginBottom: 8, fontWeight: 500}}>
              {languages[language].assets.bitcoin}
            </label>
            <div style={inputCurrencyWrapper}>
              <span style={currencySymbolStyle}>€</span>
              <input
                type="text"
                onChange={(e) => handleInputChange(e, setBitcoinReal)}
                onBlur={(e) => handleInputBlur(e, setBitcoinReal)}
                placeholder={isHidden ? '****' : bitcoinReal.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                style={inputWithCurrency}
              />
            </div>
          </div>
          {/* Crypto */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, maxWidth: 200}}>
            <label style={{color: theme.textColor, textAlign: 'center', marginBottom: 8, fontWeight: 500}}>
              {languages[language].assets.crypto}
            </label>
            <div style={inputCurrencyWrapper}>
              <span style={currencySymbolStyle}>€</span>
              <input
                type="text"
                onChange={(e) => handleInputChange(e, setCryptoReal)}
                onBlur={(e) => handleInputBlur(e, setCryptoReal)}
                placeholder={isHidden ? '****' : cryptoReal.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                style={inputWithCurrency}
              />
            </div>
          </div>
          {/* Bonds */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, maxWidth: 200}}>
            <label style={{color: theme.textColor, textAlign: 'center', marginBottom: 8, fontWeight: 500}}>
              {languages[language].assets.bonds}
            </label>
            <div style={inputCurrencyWrapper}>
              <span style={currencySymbolStyle}>€</span>
              <input
                type="text"
                onChange={(e) => handleInputChange(e, setBondsReal)}
                onBlur={(e) => handleInputBlur(e, setBondsReal)}
                placeholder={isHidden ? '****' : bondsReal.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                style={inputWithCurrency}
              />
            </div>
          </div>
          {/* Funds */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, maxWidth: 200}}>
            <label style={{color: theme.textColor, textAlign: 'center', marginBottom: 8, fontWeight: 500}}>
              {languages[language].assets.funds}
            </label>
            <div style={inputCurrencyWrapper}>
              <span style={currencySymbolStyle}>€</span>
              <input
                type="text"
                onChange={(e) => handleInputChange(e, setFundsReal)}
                onBlur={(e) => handleInputBlur(e, setFundsReal)}
                placeholder={isHidden ? '****' : fundsReal.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                style={inputWithCurrency}
              />
            </div>
          </div>
          {/* Gold */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, maxWidth: 200}}>
            <label style={{color: theme.textColor, textAlign: 'center', marginBottom: 8, fontWeight: 500}}>
              {languages[language].assets.gold}
            </label>
            <div style={inputCurrencyWrapper}>
              <span style={currencySymbolStyle}>€</span>
              <input
                type="text"
                onChange={(e) => handleInputChange(e, setGoldReal)}
                onBlur={(e) => handleInputBlur(e, setGoldReal)}
                placeholder={isHidden ? '****' : goldReal.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                style={inputWithCurrency}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%'}}>
        <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
          <Select
            value={`${balanceDate.month}-${balanceDate.year}`}
            onChange={handleBalanceDateChange}
            style={{
              border: `2px solid ${theme.mode === 'dark' ? `${theme.buttonBackgroundColor}30` : '#e2e8f0'}`,
              borderRadius: '12px',
              padding: '4px 6px',
              fontSize: '0.9rem',
              background: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
              color: theme.textColor,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              minHeight: '40px',
              minWidth: '160px'
            }}
            MenuProps={{
              PaperProps: {
                style: {
                  background: theme.mode === 'dark' ? 'rgba(31, 41, 55, 0.95)' : 'white',
                  color: theme.textColor,
                }
              }
            }}
          >
            {monthsArray.map((option) => (
              <MenuItem 
                key={option.value} 
                value={option.value}
                style={{
                  background: 'transparent',
                  color: theme.textColor
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </div>
        <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
          <ModernActionButton theme={theme} onClick={onUpdateBalance}>
            {languages[language].insert.balanceSection.updateButton}
          </ModernActionButton>
        </div>
      </div>
    </div>
  );
}
