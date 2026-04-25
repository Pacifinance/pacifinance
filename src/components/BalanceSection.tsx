import React from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { Select, MenuItem } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import {
  ModernActionButton,
} from '../styles/MyStyled';
import { getAssetIcon } from '../data/assetIcons';
import { getAssetColor } from '../data/assetColors';
import { getMuiSelectMenuProps } from './ThemedSelect';

/* ─── Helpers ─── */
const handleInputChange = (e, setterFunction) => {
  let cleanedValue = e.target.value
    .replace(/,/g, '.')
    .replace(/[^\d.]/g, '');
  const dotIndex = cleanedValue.indexOf('.');
  if (dotIndex !== -1) {
    cleanedValue =
      cleanedValue.substring(0, dotIndex + 1) +
      cleanedValue.substring(dotIndex + 1).replace(/\./g, '');
  }
  if (cleanedValue.startsWith('.')) {
    cleanedValue = '0' + cleanedValue;
  }
  setterFunction(cleanedValue);
};

const handleInputBlur = (e, setterFunction) => {
  const cleanedValue = e.target.value
    .replace(/,/g, '.')
    .replace(/[^\d.]/g, '')
    .replace(/^0+(\d)/, '$1');
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

const GroupCard = styled.div`
  width: 100%;
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${(p) => p.theme.mode === 'dark'
    ? 'rgba(255,255,255,0.08)'
    : 'rgba(0,0,0,0.06)'};
`;

const GroupTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${(p) => p.theme.textColor};
  margin: 0;
  letter-spacing: -0.01em;
`;

const GroupBadge = styled.span`
  font-size: 0.7rem;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 20px;
  background: ${(p) => p.theme.mode === 'dark'
    ? 'rgba(255,255,255,0.06)'
    : 'rgba(0,0,0,0.04)'};
  color: ${(p) => p.theme.textColor};
  opacity: 0.6;
`;

const AssetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
  width: 100%;

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
  
  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
`;

const AssetItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.75rem;
  border-radius: 12px;
  background: ${(p) => p.theme.mode === 'dark'
    ? 'rgba(255,255,255,0.03)'
    : 'rgba(0,0,0,0.015)'};
  border: 1px solid ${(p) => p.theme.mode === 'dark'
    ? 'rgba(255,255,255,0.05)'
    : 'rgba(0,0,0,0.04)'};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${(p) => p.$color || p.theme.buttonBackgroundColor}40;
    background: ${(p) => p.theme.mode === 'dark'
      ? 'rgba(255,255,255,0.05)'
      : 'rgba(0,0,0,0.02)'};
  }

  &:focus-within {
    border-color: ${(p) => p.$color || p.theme.buttonBackgroundColor}80;
    box-shadow: 0 0 0 3px ${(p) => p.$color || p.theme.buttonBackgroundColor}15;
  }
`;

const AssetLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  font-weight: 500;
  color: ${(p) => p.theme.textColor};
  opacity: 0.8;
`;

const AssetIconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: ${(p) => p.$color}18;
  color: ${(p) => p.$color};
  font-size: 0.75rem;
  flex-shrink: 0;
`;

const CurrencyInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

const CurrencySymbol = styled.span`
  position: absolute;
  left: 0.7rem;
  color: ${(p) => p.theme.textColor};
  opacity: 0.35;
  font-size: 0.85rem;
  font-weight: 500;
  pointer-events: none;
  z-index: 1;
`;

const CurrencyInput = styled.input`
  width: 100%;
  padding: 0.55rem 0.7rem 0.55rem 1.6rem;
  border: 1px solid ${(p) => p.theme.mode === 'dark'
    ? 'rgba(255,255,255,0.1)'
    : '#e2e8f0'};
  border-radius: 8px;
  color: ${(p) => p.theme.textColor};
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  background: ${(p) => p.theme.mode === 'dark'
    ? 'rgba(255,255,255,0.04)'
    : 'white'};
  outline: none;
  transition: all 0.2s ease;
  text-align: right;
  box-sizing: border-box;

  &:focus {
    border-color: ${(p) => p.$color || p.theme.buttonBackgroundColor};
    box-shadow: 0 0 0 3px ${(p) => p.$color || p.theme.buttonBackgroundColor}15;
  }

  &::placeholder {
    color: ${(p) => p.theme.textColor};
    opacity: 0.3;
    font-weight: 400;
  }
`;

const FooterBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding-top: 0.5rem;
  flex-wrap: wrap;
  width: 100%;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const PastMonthBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 0.9rem;
  border-radius: 10px;
  background: ${p => p.theme.mode === 'dark' ? 'rgba(251, 191, 36, 0.12)' : 'rgba(251, 191, 36, 0.15)'};
  border: 1px solid ${p => p.theme.mode === 'dark' ? 'rgba(251, 191, 36, 0.35)' : 'rgba(217, 119, 6, 0.35)'};
  color: ${p => p.theme.textColor};
  font-size: 0.85rem;
  line-height: 1.5;
  margin-bottom: 0.5rem;

  svg {
    flex-shrink: 0;
    margin-top: 0.15rem;
    color: ${p => p.theme.mode === 'dark' ? '#fbbf24' : '#d97706'};
  }

  strong {
    font-weight: 600;
  }
`;

/* ─── Component ─── */
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
  onOpenMultiInsert,
  translations,
}) {
  const { currencySymbol, fromEUR } = React.useContext(CurrencyContext);

  const handleBalanceDateChange = (event) => {
    const [month, year] = event.target.value.split('-').map(Number);
    setBalanceDate({ month, year });
  };

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

  const monthsArray = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(currentYear, currentMonth - 1 - i, 1);
    monthsArray.push({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      label: `${monthNames[d.getMonth() + 1]} ${d.getFullYear()}`,
      value: `${d.getMonth() + 1}-${d.getFullYear()}`
    });
  }

  /** True when the picker is on the current month — the normal, live state. */
  const isCurrentMonth =
    balanceDate.month === currentMonth && balanceDate.year === currentYear;
  /** Human-readable label of the currently selected month (e.g. "Marzo 2026"). */
  const selectedMonthLabel = `${monthNames[balanceDate.month] || ''} ${balanceDate.year}`;

  /* Asset definitions with icons and colors */
  const liquidityAssets = [
    { key: 'bank', label: translations.assets.bank, value: bankValue, setter: setBankValue },
    { key: 'cash', label: translations.assets.cash, value: cashValue, setter: setCashValue },
    { key: 'digitalServices', label: translations.assets.digitalServices, value: digitalServicesValue, setter: setDigitalServicesValue },
    { key: 'emergencyFund', label: translations.assets.emergencyFund, value: emergencyFund, setter: setEmergencyFund },
  ];

  const investmentAssets = [
    { key: 'stocks', label: translations.assets.stocks, value: stocksValue, setter: setStocksValue },
    { key: 'etf', label: translations.assets.etf, value: etfValue, setter: setETFValue },
    { key: 'bitcoin', label: translations.assets.bitcoin, value: bitcoinValue, setter: setBitcoinValue },
    { key: 'crypto', label: translations.assets.crypto, value: cryptoValue, setter: setCryptoValue },
    { key: 'bonds', label: translations.assets.bonds, value: bondsValue, setter: setBondsValue },
    { key: 'funds', label: translations.assets.funds, value: fundsValue, setter: setFundsValue },
    { key: 'gold', label: translations.assets.gold, value: goldValue, setter: setGoldValue },
  ];

  const renderAssetInput = (asset) => {
    const IconComponent = getAssetIcon(asset.key);
    const colorData = getAssetColor(asset.key);
    const color = typeof colorData === 'object' ? colorData.primary : colorData;

    return (
      <AssetItem key={asset.key} theme={theme} $color={color}>
        <AssetLabel theme={theme}>
          <AssetIconWrapper $color={color}>
            <IconComponent />
          </AssetIconWrapper>
          {asset.label}
        </AssetLabel>
        <CurrencyInputWrapper>
          <CurrencySymbol theme={theme}>{currencySymbol}</CurrencySymbol>
          <CurrencyInput
            type="text"
            theme={theme}
            $color={color}
            onChange={(e) => handleInputChange(e, asset.setter)}
            onBlur={(e) => handleInputBlur(e, asset.setter)}
            placeholder={isHidden ? '****' : fromEUR(asset.value).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          />
        </CurrencyInputWrapper>
      </AssetItem>
    );
  };

  return (
    <SectionWrapper>
      {/* Past-month banner */}
      {!isCurrentMonth && (
        <PastMonthBanner theme={theme}>
          <FontAwesomeIcon icon={faCircleInfo} />
          <div>
            <strong>{translations.insert.balanceSection.pastMonthBannerTitle}</strong>
            {': '}
            <span>
              {(translations.insert.balanceSection.pastMonthBannerBody || '')
                .replace('{month}', selectedMonthLabel)}
            </span>
          </div>
        </PastMonthBanner>
      )}

      {/* Liquidità Group */}
      <GroupCard>
        <GroupHeader theme={theme}>
          <GroupTitle theme={theme}>{translations.insert.balanceSection.titleLiquidity}</GroupTitle>
          <GroupBadge theme={theme}>{liquidityAssets.length}</GroupBadge>
        </GroupHeader>
        <AssetGrid>
          {liquidityAssets.map(renderAssetInput)}
        </AssetGrid>
      </GroupCard>

      {/* Investimenti Group */}
      <GroupCard>
        <GroupHeader theme={theme}>
          <GroupTitle theme={theme}>{translations.insert.balanceSection.titleInvestments}</GroupTitle>
          <GroupBadge theme={theme}>{investmentAssets.length}</GroupBadge>
        </GroupHeader>
        <AssetGrid>
          {investmentAssets.map(renderAssetInput)}
        </AssetGrid>
      </GroupCard>

      {/* Month selector + Update button */}
      <FooterBar>
        <Select
          value={`${balanceDate.month}-${balanceDate.year}`}
          onChange={handleBalanceDateChange}
          sx={{
            borderRadius: '10px',
            border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
            fontSize: '0.9rem',
            background: theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'white',
            color: theme.textColor,
            minHeight: '44px',
            minWidth: '180px',
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            '& .MuiSelect-select': { padding: '10px 14px' },
            '& .MuiSvgIcon-root': { color: theme.textColor },
          }}
          MenuProps={getMuiSelectMenuProps(theme)}
        >
          {monthsArray.map((option) => (
            <MenuItem 
              key={option.value} 
              value={option.value}
              style={{ background: 'transparent', color: theme.textColor }}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
        <ModernActionButton theme={theme} onClick={onUpdateBalance}>
          {translations.insert.balanceSection.updateButton}
        </ModernActionButton>
        {onOpenMultiInsert && (
          <button
            onClick={onOpenMultiInsert}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '12px',
              border: `1.5px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}`,
              background: 'transparent',
              color: theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.88rem',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            data-umami-event="multi-insert-balance-opened"
          >
            <FontAwesomeIcon icon={faLayerGroup} />
            {translations.insert.balanceSection.multiInsert?.toggle || 'Multi-insert'}
          </button>
        )}
      </FooterBar>
    </SectionWrapper>
  );
}
