
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { getAssetIcon } from '../data/assetIcons';
import { getAssetColor } from '../data/assetColors';
import { parseFormattedAmount } from './multiInsert/helpers';
import DeleteTransactionModal from './DeleteTransactionModal';

/* ─── Balance Confirm Modal Styled Components ─── */
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: ${(p) => p.theme.mode === 'dark'
    ? 'rgba(0, 0, 0, 0.7)'
    : 'rgba(15, 23, 42, 0.35)'};
  backdrop-filter: blur(8px);
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalCard = styled.div`
  background: ${(p) => p.theme.mode === 'dark'
    ? 'linear-gradient(180deg, #1a1f2e 0%, #151923 100%)'
    : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'};
  border: 1px solid ${(p) => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)'};
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: ${(p) => p.theme.mode === 'dark'
    ? '0 24px 64px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)'
    : '0 24px 64px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0,0,0,0.04)'};
  animation: ${slideUp} 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  @media (max-width: 480px) {
    max-width: 100%;
    border-radius: 16px;
    max-height: 90vh;
  }
`;

const ModalHeader = styled.div`
  padding: 1.5rem 1.5rem 1rem;
  text-align: center;
  border-bottom: 1px solid ${(p) => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.06)'
    : 'rgba(0, 0, 0, 0.05)'};
`;

const ModalTitle = styled.h2`
  font-family: 'Inter', sans-serif;
  font-size: 1.15rem;
  font-weight: 650;
  color: ${(p) => p.theme.textColor};
  margin: 0 0 0.25rem;
  letter-spacing: -0.02em;
`;

const ModalSubtitle = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  color: ${(p) => p.theme.textColor};
  opacity: 0.45;
  margin: 0;
`;

const ModalBody = styled.div`
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 480px) {
    padding: 0.75rem 1rem;
  }
`;

const AssetGroupLabel = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${(p) => p.theme.textColor};
  opacity: 0.4;
  padding-bottom: 0.25rem;
`;

const AssetList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const AssetRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  background: ${(p) => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(0, 0, 0, 0.02)'};
  transition: background 0.15s ease;
`;

const AssetIconBubble = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: ${(p) => p.$color}18;
  color: ${(p) => p.$color};
  font-size: 0.8rem;
  flex-shrink: 0;
`;

const AssetName = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  color: ${(p) => p.theme.textColor};
  flex: 1;
  min-width: 0;
`;

const AssetValue = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${(p) => p.theme.textColor};
  white-space: nowrap;
  letter-spacing: -0.01em;
`;

const ExpandButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: ${(p) => p.theme.textColor};
  opacity: 0.45;
  cursor: pointer;
  font-size: 0.7rem;
  transition: transform 0.15s ease, opacity 0.15s ease;
  transform: rotate(${(p) => (p.$expanded ? '180deg' : '0deg')});

  &:hover {
    opacity: 0.8;
  }
`;

const SubItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.1rem 0.75rem 0.4rem 2.4rem;
`;

const SubItemRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  color: ${(p) => p.theme.textColor};
  opacity: 0.65;

  span:last-child {
    white-space: nowrap;
    font-weight: 500;
  }
`;

const DateRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  background: ${(p) => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.04)'
    : 'rgba(0, 0, 0, 0.03)'};
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  color: ${(p) => p.theme.textColor};
  opacity: 0.7;
  margin-top: 0.25rem;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid ${(p) => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.06)'
    : 'rgba(0, 0, 0, 0.05)'};

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const ConfirmButton = styled.button`
  flex: 1;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.7rem 1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, ${(p) => p.theme.buttonBackgroundColor} 0%, ${(p) => p.theme.buttonBackgroundColor}dd 100%);
  color: white;
  box-shadow: 0 2px 8px ${(p) => p.theme.buttonBackgroundColor}40;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px ${(p) => p.theme.buttonBackgroundColor}50;
  }

  &:active {
    transform: translateY(0);
  }
`;

const CancelButton = styled.button`
  flex: 1;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.7rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(p) => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.06)'
    : 'rgba(0, 0, 0, 0.04)'};
  color: ${(p) => p.theme.textColor};
  border: 1px solid ${(p) => p.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.08)'};

  &:hover {
    background: ${(p) => p.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.06)'};
  }
`;

/* ─── Balance Confirm Asset Row Renderer ─── */
function BalanceAssetRow({ assetKey, label, value, currencySymbol, theme, items, formatAmount, translations, isInvestment }) {
  const IconComponent = getAssetIcon(assetKey);
  const colorData = getAssetColor(assetKey);
  const color = typeof colorData === 'object' ? colorData.primary : colorData;
  const formattedValue = parseFormattedAmount(value ?? 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const [expanded, setExpanded] = React.useState(false);
  const hasItems = Array.isArray(items) && items.length > 0;
  const t = translations.insert.balanceSection;

  return (
    <>
      <AssetRow theme={theme}>
        <AssetIconBubble $color={color}>
          <IconComponent />
        </AssetIconBubble>
        <AssetName theme={theme}>{label}</AssetName>
        <AssetValue theme={theme}>{formattedValue} {currencySymbol}</AssetValue>
        {hasItems && (
          <ExpandButton
            type="button"
            theme={theme}
            $expanded={expanded}
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? t.collapseDetails : t.expandDetails}
          >
            <FontAwesomeIcon icon={faChevronDown} />
          </ExpandButton>
        )}
      </AssetRow>
      {hasItems && expanded && (
        <SubItemList theme={theme}>
          {items.map((item) => (
            <SubItemRow key={item.id} theme={theme}>
              <span>{isInvestment ? (item.instrument?.symbol || item.instrument?.name || label) : item.label}</span>
              <span>{formatAmount(item.currentValue ?? item.investedAmount ?? 0)}</span>
            </SubItemRow>
          ))}
        </SubItemList>
      )}
    </>
  );
}

export default function InsertModals({
  isConfirmBalanceOpen,
  setIsConfirmBalanceOpen,
  showConfirmationDeleteIncome,
  setShowConfirmationDeleteIncome,
  showConfirmationDeleteOutflow,
  setShowConfirmationDeleteOutflow,
  balanceDate,
  bankValue,
  cashValue,
  digitalServicesValue,
  emergencyFundValue,
  stocksValue,
  etfValue,
  bitcoinValue,
  cryptoValue,
  bondsValue,
  fundsValue,
  goldValue,
  selectedOption,
  setSelectedOption,
  options,
  onConfirmBalance,
  onConfirmDeleteIncome,
  onConfirmDeleteOutflow,
  deleteIncomeDate,
  deleteIncomeAmount,
  deleteOutflowDate,
  deleteOutflowAmount,
  investmentHoldings = [],
  liquidityAccounts = [],
}) {
  const { language, translations } = React.useContext(LanguageContext);
  const { currencySymbol, formatAmount } = React.useContext(CurrencyContext);
  const { theme } = React.useContext(ThemeContext);

  const holdingsByAssetKey = React.useMemo(() => {
    const map = {};
    for (const holding of investmentHoldings) {
      (map[holding.assetKey] ||= []).push(holding);
    }
    return map;
  }, [investmentHoldings]);

  const liquidityAccountsByAssetKey = React.useMemo(() => {
    const map = {};
    for (const account of liquidityAccounts) {
      (map[account.assetKey] ||= []).push(account);
    }
    return map;
  }, [liquidityAccounts]);

  // Function to convert month/year selection to display date for popup
  const getDisplayDateForBalance = (monthYearObj) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    // If selected month/year is current month/year, show current date
    if (monthYearObj.month === currentMonth && monthYearObj.year === currentYear) {
      return currentDate.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US');
    }
    
    // Otherwise, show the last day of the selected month
    const date = new Date(monthYearObj.year, monthYearObj.month, 0);
    return date.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US');
  };

  const liquidityAssets = [
    { key: 'bank', label: translations.assets.bank, value: bankValue },
    { key: 'cash', label: translations.assets.cash, value: cashValue },
    { key: 'digitalServices', label: translations.assets.digitalServices, value: digitalServicesValue },
    { key: 'emergencyFund', label: translations.assets.emergencyFund, value: emergencyFundValue },
  ];

  const investmentAssets = [
    { key: 'stocks', label: translations.assets.stocks, value: stocksValue },
    { key: 'etf', label: translations.assets.etf, value: etfValue },
    { key: 'bitcoin', label: translations.assets.bitcoin, value: bitcoinValue },
    { key: 'crypto', label: translations.assets.crypto, value: cryptoValue },
    { key: 'bonds', label: translations.assets.bonds, value: bondsValue },
    { key: 'funds', label: translations.assets.funds, value: fundsValue },
    { key: 'gold', label: translations.assets.gold, value: goldValue },
  ];

  return (
    <>
      {/* ─── Balance Confirmation Modal ─── */}
      {isConfirmBalanceOpen && (
        <ModalOverlay theme={theme} onClick={() => setIsConfirmBalanceOpen(false)}>
          <ModalCard theme={theme} onClick={(e) => e.stopPropagation()}>
            <ModalHeader theme={theme}>
              <ModalTitle theme={theme}>
                {translations.insert.balanceSection.confirmUpdate}
              </ModalTitle>
              <ModalSubtitle theme={theme}>
                {getDisplayDateForBalance(balanceDate)}
              </ModalSubtitle>
            </ModalHeader>

            <ModalBody>
              {/* Liquidity group */}
              <div>
                <AssetGroupLabel theme={theme}>
                  {translations.insert.balanceSection.titleLiquidity}
                </AssetGroupLabel>
                <AssetList>
                  {liquidityAssets.map((asset) => (
                    <BalanceAssetRow
                      key={asset.key}
                      assetKey={asset.key}
                      label={asset.label}
                      value={asset.value}
                      currencySymbol={currencySymbol}
                      theme={theme}
                      items={liquidityAccountsByAssetKey[asset.key]}
                      formatAmount={formatAmount}
                      translations={translations}
                      isInvestment={false}
                    />
                  ))}
                </AssetList>
              </div>

              {/* Investments group */}
              <div>
                <AssetGroupLabel theme={theme}>
                  {translations.insert.balanceSection.titleInvestments}
                </AssetGroupLabel>
                <AssetList>
                  {investmentAssets.map((asset) => (
                    <BalanceAssetRow
                      key={asset.key}
                      assetKey={asset.key}
                      label={asset.label}
                      value={asset.value}
                      currencySymbol={currencySymbol}
                      theme={theme}
                      items={holdingsByAssetKey[asset.key]}
                      formatAmount={formatAmount}
                      translations={translations}
                      isInvestment={true}
                    />
                  ))}
                </AssetList>
              </div>
            </ModalBody>

            <ModalFooter theme={theme}>
              <CancelButton
                theme={theme}
                onClick={() => setIsConfirmBalanceOpen(false)}
              >
                {translations.general.cancel}
              </CancelButton>
              <ConfirmButton
                theme={theme}
                data-umami-event="balanceUpdate"
                onClick={onConfirmBalance}
              >
                {translations.general.confirm}
              </ConfirmButton>
            </ModalFooter>
          </ModalCard>
        </ModalOverlay>
      )}

      {showConfirmationDeleteIncome && (
        <DeleteTransactionModal
          isOpen={showConfirmationDeleteIncome}
          theme={theme}
          isOutflow={false}
          transactionDate={deleteIncomeDate}
          transactionAmount={deleteIncomeAmount}
          balanceOptions={options}
          selectedOption={selectedOption}
          onChangeSelectedOption={setSelectedOption}
          onConfirm={onConfirmDeleteIncome}
          onCancel={() => setShowConfirmationDeleteIncome(false)}
        />
      )}

      {showConfirmationDeleteOutflow && (
        <DeleteTransactionModal
          isOpen={showConfirmationDeleteOutflow}
          theme={theme}
          isOutflow={true}
          transactionDate={deleteOutflowDate}
          transactionAmount={deleteOutflowAmount}
          balanceOptions={options}
          selectedOption={selectedOption}
          onChangeSelectedOption={setSelectedOption}
          onConfirm={onConfirmDeleteOutflow}
          onCancel={() => setShowConfirmationDeleteOutflow(false)}
        />
      )}
    </>
  );
}
