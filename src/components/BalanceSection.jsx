import React from 'react';
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
  bankValue,
  setBankValue,
  cashValue,
  setCashValue,
  digitalServicesValue,
  setDigitalServicesValue,
  emergencyFund,
  setEmergencyFund,
  stocksValue,
  setStocksValue,
  etfValue,
  setETFValue,
  bitcoinValue,
  setBitcoinValue,
  cryptoValue,
  setCryptoValue,
  bondsValue,
  setBondsValue,
  fundsValue,
  setFundsValue,
  goldValue,
  setGoldValue,
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
    1: translations.months.january,
    2: translations.months.february,
    3: translations.months.march,
    4: translations.months.april,
    5: translations.months.may,
    6: translations.months.june,
    7: translations.months.july,
    8: translations.months.august,
    9: translations.months.september,
    10: translations.months.october,
    11: translations.months.november,
    12: translations.months.december,
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
          {translations.insert.balanceSection.titleLiquidity}
        </h3>
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: '100%', gap: '1.5rem', marginBottom: '0'}}>
          {/* Bank */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, maxWidth: 200}}>
            <label style={{color: theme.textColor, textAlign: 'center', marginBottom: 8, fontWeight: 500}}>
              {translations.assets.bank}
            </label>
            <div style={inputCurrencyWrapper}>
              <span style={currencySymbolStyle}>€</span>
              <input
                type="text"
                onChange={(e) => handleInputChange(e, setBankValue)}
                onBlur={(e) => handleInputBlur(e, setBankValue)}
                placeholder={isHidden ? '****' : bankValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                style={inputWithCurrency}
              />
            </div>
          </div>
          {/* Cash */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, maxWidth: 200}}>
            <label style={{color: theme.textColor, textAlign: 'center', marginBottom: 8, fontWeight: 500}}>
              {translations.assets.cash}
            </label>
            <div style={inputCurrencyWrapper}>
              <span style={currencySymbolStyle}>€</span>
              <input
                type="text"
                onChange={(e) => handleInputChange(e, setCashValue)}
                onBlur={(e) => handleInputBlur(e, setCashValue)}
                placeholder={isHidden ? '****' : cashValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                style={inputWithCurrency}
              />
            </div>
          </div>
          {/* Digital Services */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, maxWidth: 200}}>
            <label style={{color: theme.textColor, textAlign: 'center', marginBottom: 8, fontWeight: 500}}>
              {translations.assets.digitalServices}
            </label>
            <div style={inputCurrencyWrapper}>
              <span style={currencySymbolStyle}>€</span>
              <input
                type="text"
                onChange={(e) => handleInputChange(e, setDigitalServicesValue)}
                onBlur={(e) => handleInputBlur(e, setDigitalServicesValue)}
                placeholder={isHidden ? '****' : digitalServicesValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                style={inputWithCurrency}
              />
            </div>
          </div>
          {/* Emergency Fund */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, maxWidth: 200}}>
            <label style={{color: theme.textColor, textAlign: 'center', marginBottom: 8, fontWeight: 500}}>
              {translations.assets.emergencyFund}
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
          {translations.insert.balanceSection.titleInvestments}
        </h3>
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: '100%', gap: '1.5rem', marginBottom: '0'}}>
          {/* Stocks */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, maxWidth: 200}}>
            <label style={{color: theme.textColor, textAlign: 'center', marginBottom: 8, fontWeight: 500}}>
              {translations.assets.stocks}
            </label>
            <div style={inputCurrencyWrapper}>
              <span style={currencySymbolStyle}>€</span>
              <input
                type="text"
                onChange={(e) => handleInputChange(e, setStocksValue)}
                onBlur={(e) => handleInputBlur(e, setStocksValue)}
                placeholder={isHidden ? '****' : stocksValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                style={inputWithCurrency}
              />
            </div>
          </div>
          {/* ETF */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, maxWidth: 200}}>
            <label style={{color: theme.textColor, textAlign: 'center', marginBottom: 8, fontWeight: 500}}>
              {translations.assets.etf}
            </label>
            <div style={inputCurrencyWrapper}>
              <span style={currencySymbolStyle}>€</span>
              <input
                type="text"
                onChange={(e) => handleInputChange(e, setETFValue)}
                onBlur={(e) => handleInputBlur(e, setETFValue)}
                placeholder={isHidden ? '****' : etfValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                style={inputWithCurrency}
              />
            </div>
          </div>
          {/* Bitcoin */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, maxWidth: 200}}>
            <label style={{color: theme.textColor, textAlign: 'center', marginBottom: 8, fontWeight: 500}}>
              {translations.assets.bitcoin}
            </label>
            <div style={inputCurrencyWrapper}>
              <span style={currencySymbolStyle}>€</span>
              <input
                type="text"
                onChange={(e) => handleInputChange(e, setBitcoinValue)}
                onBlur={(e) => handleInputBlur(e, setBitcoinValue)}
                placeholder={isHidden ? '****' : bitcoinValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                style={inputWithCurrency}
              />
            </div>
          </div>
          {/* Crypto */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, maxWidth: 200}}>
            <label style={{color: theme.textColor, textAlign: 'center', marginBottom: 8, fontWeight: 500}}>
              {translations.assets.crypto}
            </label>
            <div style={inputCurrencyWrapper}>
              <span style={currencySymbolStyle}>€</span>
              <input
                type="text"
                onChange={(e) => handleInputChange(e, setCryptoValue)}
                onBlur={(e) => handleInputBlur(e, setCryptoValue)}
                placeholder={isHidden ? '****' : cryptoValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                style={inputWithCurrency}
              />
            </div>
          </div>
          {/* Bonds */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, maxWidth: 200}}>
            <label style={{color: theme.textColor, textAlign: 'center', marginBottom: 8, fontWeight: 500}}>
              {translations.assets.bonds}
            </label>
            <div style={inputCurrencyWrapper}>
              <span style={currencySymbolStyle}>€</span>
              <input
                type="text"
                onChange={(e) => handleInputChange(e, setBondsValue)}
                onBlur={(e) => handleInputBlur(e, setBondsValue)}
                placeholder={isHidden ? '****' : bondsValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                style={inputWithCurrency}
              />
            </div>
          </div>
          {/* Funds */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, maxWidth: 200}}>
            <label style={{color: theme.textColor, textAlign: 'center', marginBottom: 8, fontWeight: 500}}>
              {translations.assets.funds}
            </label>
            <div style={inputCurrencyWrapper}>
              <span style={currencySymbolStyle}>€</span>
              <input
                type="text"
                onChange={(e) => handleInputChange(e, setFundsValue)}
                onBlur={(e) => handleInputBlur(e, setFundsValue)}
                placeholder={isHidden ? '****' : fundsValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                style={inputWithCurrency}
              />
            </div>
          </div>
          {/* Gold */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, maxWidth: 200}}>
            <label style={{color: theme.textColor, textAlign: 'center', marginBottom: 8, fontWeight: 500}}>
              {translations.assets.gold}
            </label>
            <div style={inputCurrencyWrapper}>
              <span style={currencySymbolStyle}>€</span>
              <input
                type="text"
                onChange={(e) => handleInputChange(e, setGoldValue)}
                onBlur={(e) => handleInputBlur(e, setGoldValue)}
                placeholder={isHidden ? '****' : goldValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
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
            {translations.insert.balanceSection.updateButton}
          </ModernActionButton>
        </div>
      </div>
    </div>
  );
}
