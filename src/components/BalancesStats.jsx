import React, { useContext, useEffect, useState } from 'react';
import styled from "styled-components";
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { assetIcons } from '../data/assetIcons';
import { assetColors } from '../data/assetColors';
import { calculatePercentageChange, calculateDifference, formatCurrencyDifference } from '../utils/calculations';
import { 
  getStocksValue, 
  getEtfValue, 
  getBankValue, 
  getCashValue, 
  getCryptoValue, 
  getBitcoinValue, 
  getDigitalServicesValue, 
  getBondsValue, 
  getFundsValue, 
  getGoldValue,
  getTotalValue,
  getEmergencyFund,
  getStocksValuePreMonth,
  getEtfValuePreMonth,
  getBankValuePreMonth,
  getCashValuePreMonth,
  getCryptoValuePreMonth,
  getBitcoinValuePreMonth,
  getDigitalServicesValuePreMonth,
  getBondsValuePreMonth,
  getFundsValuePreMonth,
  getGoldValuePreMonth,
  getTotalValuePreMonth,
  getEmergencyFundPreMonth,
  getStocksValuePreYearSameMonth,
  getEtfValuePreYearSameMonth,
  getBankValuePreYearSameMonth,
  getCashValuePreYearSameMonth,
  getCryptoValuePreYearSameMonth,
  getBitcoinValuePreYearSameMonth,
  getDigitalServicesValuePreYearSameMonth,
  getBondsValuePreYearSameMonth,
  getFundsValuePreYearSameMonth,
  getGoldValuePreYearSameMonth,
  getTotalValuePreYearSameMonth,
  getEmergencyFundPreYearSameMonth,
  getFormattedPreMonthDateLocalized,
  getFormattedPreYearSameMonthDateLocalized
} from '../utils/userDataSelectors';

const ComparisonHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem 1.5rem;
  border-radius: 16px;
  background: ${({ theme }) => theme === "light" 
    ? "linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(96, 165, 250, 0.08) 100%)" 
    : "linear-gradient(135deg, rgba(96, 165, 250, 0.12) 0%, rgba(79, 70, 229, 0.12) 100%)"};
  border: 1px solid ${({ theme }) => theme === "light" 
    ? "rgba(79, 70, 229, 0.15)" 
    : "rgba(96, 165, 250, 0.2)"};
  backdrop-filter: blur(10px);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
  }
`;

const ComparisonPeriod = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  
  .period-label {
    font-size: 0.85rem;
    font-weight: 500;
    color: ${({ theme }) => theme === "light" ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)"};
    margin-bottom: 0.25rem;
  }
  
  .period-date {
    font-size: 1rem;
    font-weight: 600;
    color: ${({ theme }) => theme === "light" ? "#333" : "#fff"};
  }
  
  @media (max-width: 768px) {
    align-items: center;
  }
`;

const ComparisonValue = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  
  .change-amount {
    font-size: 1.25rem;
    font-weight: 700;
    color: ${props => props.$isPositive ? "#27ae60" : "#e74c3c"};
    margin-bottom: 0.25rem;
  }
  
  .change-percentage {
    font-size: 0.9rem;
    font-weight: 500;
    color: ${props => props.$isPositive ? "#27ae60" : "#e74c3c"};
    background: ${props => props.$isPositive 
      ? "rgba(39, 174, 96, 0.1)" 
      : "rgba(231, 76, 60, 0.1)"};
    padding: 0.25rem 0.6rem;
    border-radius: 12px;
    border: 1px solid ${props => props.$isPositive 
      ? "rgba(39, 174, 96, 0.2)" 
      : "rgba(231, 76, 60, 0.2)"};
  }
  
  @media (max-width: 768px) {
    align-items: center;
  }
`;

const ColoredValue = styled.div`
  color: ${props => {
    if (props.$isPositive === null) return props.theme === "light" ? "#333" : "#fff";
    return props.$isPositive ? "#27ae60" : "#e74c3c";
  }};
  font-weight: ${props => props.$isPositive !== null ? "700" : "bold"};
`;

const Section = styled.section`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  margin-bottom: 1rem;

  .analytic {
    padding: 1rem;
    border-radius: 15px;
    border: 1px solid ${({ theme }) => theme === "light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"};
    background: ${({ theme }) => theme === "light" 
      ? "rgba(255, 255, 255, 0.8)" 
      : "rgba(255, 255, 255, 0.05)"};
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 1rem;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px ${({ theme }) => theme === "light" ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.3)"};
    }

    .design {
      .logo {
        height: 3rem;
        width: 3rem;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1.5rem;
      }
    }

    .transfer {
      flex: 1;
      
      h2, h6 {
        margin: 0;
        color: ${({ theme }) => theme === "light" ? "#333" : "#fff"};
      }
      
      h2 {
        font-size: 0.9rem;
        font-weight: 600;
      }
      
      h6 {
        font-size: 0.8rem;
        opacity: 0.8;
      }
    }

    .money {
      text-align: right;
      
      h5, h6 {
        margin: 0;
        color: ${({ theme }) => theme === "light" ? "#333" : "#fff"};
      }
      
      h5 {
        font-size: 1rem;
        font-weight: bold;
      }
      
      h6 {
        font-size: 0.8rem;
        opacity: 0.8;
      }
    }
  }
`;

function BalancesStats({ theme, userData, isHidden, period = "month" }) {
    const { language, translations } = useContext(LanguageContext);
    const { formatAmount } = useContext(CurrencyContext);
    const currencyFormatter = (val) => formatAmount(val, { maximumFractionDigits: 0 });
    
    // Current values
    const [stocksValue, setStocksValue] = useState(0);
    const [etfValue, setETFValue] = useState(0);
    const [bankValue, setBankValue] = useState(0);
    const [cashValue, setCashValue] = useState(0);
    const [cryptoValue, setCryptoValue] = useState(0);
    const [bitcoinValue, setBitcoinValue] = useState(0);
    const [digitalServicesValue, setDigitalServicesValue] = useState(0);
    const [emergencyFundValue, setEmergencyFundValue] = useState(0);
    const [bondsValue, setBondsValue] = useState(0);
    const [fundsValue, setFundsValue] = useState(0);
    const [goldValue, setGoldValue] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    
    // Previous period values
    const [stocksValuePrev, setStocksValuePrev] = useState(0);
    const [etfValuePrev, setEtfValuePrev] = useState(0);
    const [bankValuePrev, setBankValuePrev] = useState(0);
    const [cashValuePrev, setCashValuePrev] = useState(0);
    const [cryptoValuePrev, setCryptoValuePrev] = useState(0);
    const [bitcoinValuePrev, setBitcoinValuePrev] = useState(0);
    const [digitalServicesValuePrev, setDigitalServicesValuePrev] = useState(0);
    const [emergencyFundValuePrev, setEmergencyFundValuePrev] = useState(0);
    const [bondsValuePrev, setBondsValuePrev] = useState(0);
    const [fundsValuePrev, setFundsValuePrev] = useState(0);
    const [goldValuePrev, setGoldValuePrev] = useState(0);
    const [totalValuePrev, setTotalValuePrev] = useState(0);
    
    // Formatted date
    const [formattedPrevDate, setFormattedPrevDate] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (userData) {
                try {
                    // Current values
                    setStocksValue(getStocksValue(userData) || 0);
                    setETFValue(getEtfValue(userData) || 0);
                    setBankValue(getBankValue(userData) || 0);
                    setCashValue(getCashValue(userData) || 0);
                    setCryptoValue(getCryptoValue(userData) || 0);
                    setBitcoinValue(getBitcoinValue(userData) || 0);
                    setDigitalServicesValue(getDigitalServicesValue(userData) || 0);
                    setEmergencyFundValue(getEmergencyFund(userData) || 0);
                    setBondsValue(getBondsValue(userData) || 0);
                    setFundsValue(getFundsValue(userData) || 0);
                    setGoldValue(getGoldValue(userData) || 0);
                    setTotalValue(getTotalValue(userData) || 0);

                    // Previous period values based on period prop
                    if (period === "month") {
                        setStocksValuePrev(getStocksValuePreMonth(userData) || 0);
                        setEtfValuePrev(getEtfValuePreMonth(userData) || 0);
                        setBankValuePrev(getBankValuePreMonth(userData) || 0);
                        setCashValuePrev(getCashValuePreMonth(userData) || 0);
                        setCryptoValuePrev(getCryptoValuePreMonth(userData) || 0);
                        setBitcoinValuePrev(getBitcoinValuePreMonth(userData) || 0);
                        setDigitalServicesValuePrev(getDigitalServicesValuePreMonth(userData) || 0);
                        setEmergencyFundValuePrev(getEmergencyFundPreMonth(userData) || 0);
                        setBondsValuePrev(getBondsValuePreMonth(userData) || 0);
                        setFundsValuePrev(getFundsValuePreMonth(userData) || 0);
                        setGoldValuePrev(getGoldValuePreMonth(userData) || 0);
                        setTotalValuePrev(getTotalValuePreMonth(userData) || 0);
                        setFormattedPrevDate(getFormattedPreMonthDateLocalized(userData, language) || '');
                    } else {
                        setStocksValuePrev(getStocksValuePreYearSameMonth(userData) || 0);
                        setEtfValuePrev(getEtfValuePreYearSameMonth(userData) || 0);
                        setBankValuePrev(getBankValuePreYearSameMonth(userData) || 0);
                        setCashValuePrev(getCashValuePreYearSameMonth(userData) || 0);
                        setCryptoValuePrev(getCryptoValuePreYearSameMonth(userData) || 0);
                        setBitcoinValuePrev(getBitcoinValuePreYearSameMonth(userData) || 0);
                        setDigitalServicesValuePrev(getDigitalServicesValuePreYearSameMonth(userData) || 0);
                        setEmergencyFundValuePrev(getEmergencyFundPreYearSameMonth(userData) || 0);
                        setBondsValuePrev(getBondsValuePreYearSameMonth(userData) || 0);
                        setFundsValuePrev(getFundsValuePreYearSameMonth(userData) || 0);
                        setGoldValuePrev(getGoldValuePreYearSameMonth(userData) || 0);
                        setTotalValuePrev(getTotalValuePreYearSameMonth(userData) || 0);
                        setFormattedPrevDate(getFormattedPreYearSameMonthDateLocalized(userData, language) || '');
                    }

                } catch (error) {
                    console.error('Errore durante le operazioni:', error);
                }
            }
        };

        fetchData();
    }, [userData, period, language]);

    const totalChange = calculateDifference(totalValue, totalValuePrev);
    const totalPercentage = calculatePercentageChange(totalValue, totalValuePrev);
    const isPositiveChange = (((totalValue - totalValuePrev) / totalValuePrev) * 100) > 0;

    // Configurazione dinamica degli asset
    const assetsConfig = [
        {
            key: 'bank',
            current: bankValue,
            previous: bankValuePrev,
            icon: assetIcons.bank,
            color: assetColors.bank.primary,
            label: translations.assets.bank
        },
        {
            key: 'cash',
            current: cashValue,
            previous: cashValuePrev,
            icon: assetIcons.cash,
            color: assetColors.cash.primary,
            label: translations.assets.cash
        },
        {
            key: 'emergencyFund',
            current: emergencyFundValue,
            previous: emergencyFundValuePrev,
            icon: assetIcons.emergencyFund,
            color: assetColors.emergencyFund.primary,
            label: translations.assets.emergencyFund
        },
        {
            key: 'digitalServices',
            current: digitalServicesValue,
            previous: digitalServicesValuePrev,
            icon: assetIcons.digitalServices,
            color: assetColors.digitalServices.primary,
            label: translations.assets.digitalServices
        },
        {
            key: 'stocks',
            current: stocksValue,
            previous: stocksValuePrev,
            icon: assetIcons.stocks,
            color: assetColors.stocks.primary,
            label: translations.assets.stocks
        },
        {
            key: 'etf',
            current: etfValue,
            previous: etfValuePrev,
            icon: assetIcons.etf,
            color: assetColors.etf.primary,
            label: translations.assets.etf
        },
        {
            key: 'bitcoin',
            current: bitcoinValue,
            previous: bitcoinValuePrev,
            icon: assetIcons.bitcoin,
            color: assetColors.bitcoin.primary,
            label: translations.assets.bitcoin
        },
        {
            key: 'crypto',
            current: cryptoValue,
            previous: cryptoValuePrev,
            icon: assetIcons.crypto,
            color: assetColors.crypto.primary,
            label: translations.assets.crypto
        },
        {
            key: 'bonds',
            current: bondsValue,
            previous: bondsValuePrev,
            icon: assetIcons.bonds,
            color: assetColors.bonds.primary,
            label: translations.assets.bonds
        },
        {
            key: 'funds',
            current: fundsValue,
            previous: fundsValuePrev,
            icon: assetIcons.funds,
            color: assetColors.funds.primary,
            label: translations.assets.funds
        },
        {
            key: 'gold',
            current: goldValue,
            previous: goldValuePrev,
            icon: assetIcons.gold,
            color: assetColors.gold.primary,
            label: translations.assets.gold
        }
    ];

    // Filtra asset con valori non-zero (current o previous)
    const visibleAssets = assetsConfig.filter(asset => 
        asset.current !== 0 || asset.previous !== 0
    );

    return (
        <div className="wrapper">
            <ComparisonHeader theme={theme}>
                <ComparisonPeriod theme={theme}>
                    <div className="period-label">
                        {period === "month" 
                            ? (language === 'it' ? 'Confronto con' : 'Compared to')
                            : (language === 'it' ? 'Confronto con' : 'Compared to')
                        }
                    </div>
                    <div className="period-date">
                        {formattedPrevDate || (period === "month" 
                            ? (language === 'it' ? 'Mese precedente' : 'Previous month')
                            : (language === 'it' ? 'Anno precedente' : 'Previous year')
                        )}
                    </div>
                </ComparisonPeriod>
                
                <ComparisonValue theme={theme} $isPositive={isPositiveChange}>
                    <div className="change-amount">
                        {isHidden ? '****' : formatCurrencyDifference(totalChange, currencyFormatter)}
                    </div>
                    <div className="change-percentage">
                        {isHidden ? '****' : totalPercentage}
                    </div>
                </ComparisonValue>
            </ComparisonHeader>
            
            <Section theme={theme}>
                {visibleAssets.map((asset) => {
                    const IconComponent = asset.icon;
                    const isPositive = asset.current !== asset.previous 
                        ? (asset.current > asset.previous) 
                        : null;
                    
                    return (
                        <div key={asset.key} className="analytic">
                            <div className="design">
                                <div className="logo" style={{ color: asset.color }}>
                                    <IconComponent />
                                </div>
                            </div>
                            <div className="transfer">
                                <h2>{translations.graphs.statsBalance.variation}</h2>
                                <h6>{asset.label}</h6>
                            </div>
                            <div className="money">
                                <ColoredValue 
                                    as="h5" 
                                    theme={theme} 
                                    $isPositive={isPositive}
                                >
                                    {isHidden ? '****' : formatCurrencyDifference(calculateDifference(asset.current, asset.previous), currencyFormatter)}
                                </ColoredValue>
                                <ColoredValue 
                                    as="h6" 
                                    className="text-xs" 
                                    theme={theme} 
                                    $isPositive={isPositive}
                                >
                                    {isHidden ? '****' : calculatePercentageChange(asset.current, asset.previous)}
                                </ColoredValue>
                            </div>
                        </div>
                    );
                })}
            </Section>
        </div>
    );
}

export default React.memo(BalancesStats);