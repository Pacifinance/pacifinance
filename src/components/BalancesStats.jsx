import React, { useContext, useEffect, useState } from 'react';
import styled from "styled-components";
import { LanguageContext } from '../contexts/LanguageContext';
import languages from '../data/languages.json';
import { assetIcons } from '../data/assetIcons';
import { assetColors } from '../data/assetColors';
import { calculatePercentageChange, calculateDifference, formatCurrencyDifference } from '../utils/calculations';
import { 
  getStocksReal, 
  getETFReal, 
  getBankReal, 
  getCashReal, 
  getCryptoReal, 
  getBitcoinReal, 
  getDigitalServicesReal, 
  getBondsReal, 
  getFundsReal, 
  getGoldReal,
  getTotalReal,
  getEmergencyFund,
  getStocksRealPreMonth,
  getEtfRealPreMonth,
  getBankRealPreMonth,
  getCashRealPreMonth,
  getCryptoRealPreMonth,
  getBitcoinRealPreMonth,
  getDigitalServicesRealPreMonth,
  getBondsRealPreMonth,
  getFundsRealPreMonth,
  getGoldRealPreMonth,
  getTotalRealPreMonth,
  getEmergencyFundPreMonth,
  getStocksRealPreYearSameMonth,
  getEtfRealPreYearSameMonth,
  getBankRealPreYearSameMonth,
  getCashRealPreYearSameMonth,
  getCryptoRealPreYearSameMonth,
  getBitcoinRealPreYearSameMonth,
  getDigitalServicesRealPreYearSameMonth,
  getBondsRealPreYearSameMonth,
  getFundsRealPreYearSameMonth,
  getGoldRealPreYearSameMonth,
  getTotalRealPreYearSameMonth,
  getEmergencyFundPreYearSameMonth,
  getFormattedPreMonthDate,
  getFormattedPreYearSameMonthDate
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

export default function BalancesStats({ theme, userData, isHidden, period = "month" }) {
    const { language } = useContext(LanguageContext);
    
    // Current values
    const [stocksReal, setStocksReal] = useState(0);
    const [etfReal, setETFReal] = useState(0);
    const [bankReal, setBankReal] = useState(0);
    const [cashReal, setCashReal] = useState(0);
    const [cryptoReal, setCryptoReal] = useState(0);
    const [bitcoinReal, setBitcoinReal] = useState(0);
    const [digitalServicesReal, setDigitalServicesReal] = useState(0);
    const [emergencyFundReal, setEmergencyFundReal] = useState(0);
    const [bondsReal, setBondsReal] = useState(0);
    const [fundsReal, setFundsReal] = useState(0);
    const [goldReal, setGoldReal] = useState(0);
    const [totalReal, setTotalReal] = useState(0);
    
    // Previous period values
    const [stocksRealPrev, setStocksRealPrev] = useState(0);
    const [etfRealPrev, setEtfRealPrev] = useState(0);
    const [bankRealPrev, setBankRealPrev] = useState(0);
    const [cashRealPrev, setCashRealPrev] = useState(0);
    const [cryptoRealPrev, setCryptoRealPrev] = useState(0);
    const [bitcoinRealPrev, setBitcoinRealPrev] = useState(0);
    const [digitalServicesRealPrev, setDigitalServicesRealPrev] = useState(0);
    const [emergencyFundRealPrev, setEmergencyFundRealPrev] = useState(0);
    const [bondsRealPrev, setBondsRealPrev] = useState(0);
    const [fundsRealPrev, setFundsRealPrev] = useState(0);
    const [goldRealPrev, setGoldRealPrev] = useState(0);
    const [totalRealPrev, setTotalRealPrev] = useState(0);
    
    // Formatted date
    const [formattedPrevDate, setFormattedPrevDate] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (userData) {
                try {
                    // Current values
                    setStocksReal(getStocksReal(userData) || 0);
                    setETFReal(getETFReal(userData) || 0);
                    setBankReal(getBankReal(userData) || 0);
                    setCashReal(getCashReal(userData) || 0);
                    setCryptoReal(getCryptoReal(userData) || 0);
                    setBitcoinReal(getBitcoinReal(userData) || 0);
                    setDigitalServicesReal(getDigitalServicesReal(userData) || 0);
                    setEmergencyFundReal(getEmergencyFund(userData) || 0);
                    setBondsReal(getBondsReal(userData) || 0);
                    setFundsReal(getFundsReal(userData) || 0);
                    setGoldReal(getGoldReal(userData) || 0);
                    setTotalReal(getTotalReal(userData) || 0);

                    // Previous period values based on period prop
                    if (period === "month") {
                        setStocksRealPrev(getStocksRealPreMonth(userData) || 0);
                        setEtfRealPrev(getEtfRealPreMonth(userData) || 0);
                        setBankRealPrev(getBankRealPreMonth(userData) || 0);
                        setCashRealPrev(getCashRealPreMonth(userData) || 0);
                        setCryptoRealPrev(getCryptoRealPreMonth(userData) || 0);
                        setBitcoinRealPrev(getBitcoinRealPreMonth(userData) || 0);
                        setDigitalServicesRealPrev(getDigitalServicesRealPreMonth(userData) || 0);
                        setEmergencyFundRealPrev(getEmergencyFundPreMonth(userData) || 0);
                        setBondsRealPrev(getBondsRealPreMonth(userData) || 0);
                        setFundsRealPrev(getFundsRealPreMonth(userData) || 0);
                        setGoldRealPrev(getGoldRealPreMonth(userData) || 0);
                        setTotalRealPrev(getTotalRealPreMonth(userData) || 0);
                        setFormattedPrevDate(getFormattedPreMonthDate(userData) || '');
                    } else {
                        setStocksRealPrev(getStocksRealPreYearSameMonth(userData) || 0);
                        setEtfRealPrev(getEtfRealPreYearSameMonth(userData) || 0);
                        setBankRealPrev(getBankRealPreYearSameMonth(userData) || 0);
                        setCashRealPrev(getCashRealPreYearSameMonth(userData) || 0);
                        setCryptoRealPrev(getCryptoRealPreYearSameMonth(userData) || 0);
                        setBitcoinRealPrev(getBitcoinRealPreYearSameMonth(userData) || 0);
                        setDigitalServicesRealPrev(getDigitalServicesRealPreYearSameMonth(userData) || 0);
                        setEmergencyFundRealPrev(getEmergencyFundPreYearSameMonth(userData) || 0);
                        setBondsRealPrev(getBondsRealPreYearSameMonth(userData) || 0);
                        setFundsRealPrev(getFundsRealPreYearSameMonth(userData) || 0);
                        setGoldRealPrev(getGoldRealPreYearSameMonth(userData) || 0);
                        setTotalRealPrev(getTotalRealPreYearSameMonth(userData) || 0);
                        setFormattedPrevDate(getFormattedPreYearSameMonthDate(userData) || '');
                    }

                } catch (error) {
                    console.error('Errore durante le operazioni:', error);
                }
            }
        };

        fetchData();
    }, [userData, period]);

    const primaryColor = theme === "light" ? "#4F46E5" : "#60A5FA";

    const titleKey = period === "month" ? "titleDetailsMonth" : "titleDetailsYear";
    const totalChange = calculateDifference(totalReal, totalRealPrev);
    const totalPercentage = calculatePercentageChange(totalReal, totalRealPrev);
    const isPositiveChange = (((totalReal - totalRealPrev) / totalRealPrev) * 100) > 0;

    // Configurazione dinamica degli asset
    const assetsConfig = [
        {
            key: 'bank',
            current: bankReal,
            previous: bankRealPrev,
            icon: assetIcons.bank,
            color: assetColors.bank.primary,
            label: languages[language].assets.bank
        },
        {
            key: 'cash',
            current: cashReal,
            previous: cashRealPrev,
            icon: assetIcons.cash,
            color: assetColors.cash.primary,
            label: languages[language].assets.cash
        },
        {
            key: 'emergencyFund',
            current: emergencyFundReal,
            previous: emergencyFundRealPrev,
            icon: assetIcons.emergencyFund,
            color: assetColors.emergencyFund.primary,
            label: languages[language].assets.emergencyFund
        },
        {
            key: 'digitalServices',
            current: digitalServicesReal,
            previous: digitalServicesRealPrev,
            icon: assetIcons.digitalServices,
            color: assetColors.digitalServices.primary,
            label: languages[language].assets.digitalServices
        },
        {
            key: 'stocks',
            current: stocksReal,
            previous: stocksRealPrev,
            icon: assetIcons.stocks,
            color: assetColors.stocks.primary,
            label: languages[language].assets.stocks
        },
        {
            key: 'etf',
            current: etfReal,
            previous: etfRealPrev,
            icon: assetIcons.etf,
            color: assetColors.etf.primary,
            label: languages[language].assets.etf
        },
        {
            key: 'bitcoin',
            current: bitcoinReal,
            previous: bitcoinRealPrev,
            icon: assetIcons.bitcoin,
            color: assetColors.bitcoin.primary,
            label: languages[language].assets.bitcoin
        },
        {
            key: 'crypto',
            current: cryptoReal,
            previous: cryptoRealPrev,
            icon: assetIcons.crypto,
            color: assetColors.crypto.primary,
            label: languages[language].assets.crypto
        },
        {
            key: 'bonds',
            current: bondsReal,
            previous: bondsRealPrev,
            icon: assetIcons.bonds,
            color: assetColors.bonds.primary,
            label: languages[language].assets.bonds
        },
        {
            key: 'funds',
            current: fundsReal,
            previous: fundsRealPrev,
            icon: assetIcons.funds,
            color: assetColors.funds.primary,
            label: languages[language].assets.funds
        },
        {
            key: 'gold',
            current: goldReal,
            previous: goldRealPrev,
            icon: assetIcons.gold,
            color: assetColors.gold.primary,
            label: languages[language].assets.gold
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
                        {isHidden ? '****' : formatCurrencyDifference(totalChange)}
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
                                <h2>{languages[language].graphs.statsBalance.variation}</h2>
                                <h6>{asset.label}</h6>
                            </div>
                            <div className="money">
                                <ColoredValue 
                                    as="h5" 
                                    theme={theme} 
                                    $isPositive={isPositive}
                                >
                                    {isHidden ? '****' : formatCurrencyDifference(calculateDifference(asset.current, asset.previous))}
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