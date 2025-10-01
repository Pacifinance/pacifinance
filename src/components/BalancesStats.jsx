import React, { useContext, useEffect, useState } from 'react';
import styled from "styled-components";
import { LanguageContext } from '../contexts/LanguageContext';
import languages from '../data/languages.json';
import { assetIcons } from '../data/assetIcons';
import { calculatePercentageChange, calculateDifference } from '../utils/calculations';

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
    const [totalReal, setTotalReal] = useState(0);
    
    // Previous period values
    const [stocksRealPrev, setStocksRealPrev] = useState(0);
    const [etfRealPrev, setEtfRealPrev] = useState(0);
    const [bankRealPrev, setBankRealPrev] = useState(0);
    const [cashRealPrev, setCashRealPrev] = useState(0);
    const [cryptoRealPrev, setCryptoRealPrev] = useState(0);
    const [bitcoinRealPrev, setBitcoinRealPrev] = useState(0);
    const [digitalServicesRealPrev, setDigitalServicesRealPrev] = useState(0);
    const [totalRealPrev, setTotalRealPrev] = useState(0);
    
    // Formatted date
    const [formattedPrevDate, setFormattedPrevDate] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (userData) {
                try {
                    // Current values
                    setStocksReal(userData.stocksReal || 0);
                    setETFReal(userData.etfReal || 0);
                    setBankReal(userData.bankReal || 0);
                    setCashReal(userData.cashReal || 0);
                    setCryptoReal(userData.cryptoReal || 0);
                    setBitcoinReal(userData.bitcoinReal || 0);
                    setDigitalServicesReal(userData.digitalServicesReal || 0);
                    setTotalReal(userData.totalReal || 0);

                    // Previous period values based on period prop
                    if (period === "month") {
                        setStocksRealPrev(userData.stocksRealPreMonth || 0);
                        setEtfRealPrev(userData.etfRealPreMonth || 0);
                        setBankRealPrev(userData.bankRealPreMonth || 0);
                        setCashRealPrev(userData.cashRealPreMonth || 0);
                        setCryptoRealPrev(userData.cryptoRealPreMonth || 0);
                        setBitcoinRealPrev(userData.bitcoinRealPreMonth || 0);
                        setDigitalServicesRealPrev(userData.digitalServicesRealPreMonth || 0);
                        setTotalRealPrev(userData.totalRealPreMonth || 0);
                        setFormattedPrevDate(userData.formattedPreMonthDate || '');
                    } else {
                        setStocksRealPrev(userData.stocksRealPreYearSameMonth || 0);
                        setEtfRealPrev(userData.etfRealPreYearSameMonth || 0);
                        setBankRealPrev(userData.bankRealPreYearSameMonth || 0);
                        setCashRealPrev(userData.cashRealPreYearSameMonth || 0);
                        setCryptoRealPrev(userData.cryptoRealPreYearSameMonth || 0);
                        setBitcoinRealPrev(userData.bitcoinRealPreYearSameMonth || 0);
                        setDigitalServicesRealPrev(userData.digitalServicesRealPreYearSameMonth || 0);
                        setTotalRealPrev(userData.totalRealPreYearSameMonth || 0);
                        setFormattedPrevDate(userData.formattedPreYearSameMonthDate || '');
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
                        {isHidden ? '****' : totalChange}
                    </div>
                    <div className="change-percentage">
                        {isHidden ? '****' : totalPercentage}
                    </div>
                </ComparisonValue>
            </ComparisonHeader>
            
            <Section theme={theme}>
                <div className="analytic">
                    <div className="design">
                        <div className="logo" style={{ color: '#0D579B'}}>
                            <assetIcons.bank/>
                        </div>
                    </div>
                    <div className="transfer">
                        <h2>{languages[language].graphs.statsBalance.variation}</h2>
                        <h6>{languages[language].assets.bank}</h6>
                    </div>
                    <div className="money">
                        <h5>
                            {isHidden ? '****' : calculateDifference(bankReal, bankRealPrev)}
                        </h5>
                        <h6 className="text-xs">
                            {isHidden ? '****' : calculatePercentageChange(bankReal, bankRealPrev)}
                        </h6>
                    </div>
                </div>

                <div className="analytic">
                    <div className="design">
                        <div className="logo" style={{ color: '#329239' }}>
                            <assetIcons.cash />
                        </div>
                    </div>
                    <div className="transfer">
                        <h2>{languages[language].graphs.statsBalance.variation}</h2>
                        <h6>{languages[language].assets.cash}</h6>
                    </div>
                    <div className="money">
                        <h5>
                            {isHidden ? '****' : calculateDifference(cashReal, cashRealPrev)}
                        </h5>
                        <h6 className="text-xs">
                            {isHidden ? '****' : calculatePercentageChange(cashReal, cashRealPrev)}
                        </h6>
                    </div>
                </div>

                <div className="analytic">
                    <div className="design">
                        <div className="logo" style={{ color: '#F7B510' }}>
                            <assetIcons.bitcoin />
                        </div>
                    </div>
                    <div className="transfer">
                        <h2>{languages[language].graphs.statsBalance.variation}</h2>
                        <h6>{languages[language].assets.bitcoin}</h6>
                    </div>
                    <div className="money">
                        <h5>
                            {isHidden ? '****' : calculateDifference(bitcoinReal, bitcoinRealPrev)}
                        </h5>
                        <h6 className="text-xs">
                            {isHidden ? '****' : calculatePercentageChange(bitcoinReal, bitcoinRealPrev)}
                        </h6>
                    </div>
                </div>

                <div className="analytic">
                    <div className="design">
                        <div className="logo" style={{ color: '#d63031' }}>
                            <assetIcons.crypto />
                        </div>
                    </div>
                    <div className="transfer">
                        <h2>{languages[language].graphs.statsBalance.variation}</h2>
                        <h6>{languages[language].assets.crypto}</h6>
                    </div>
                    <div className="money">
                        <h5>
                            {isHidden ? '****' : calculateDifference(cryptoReal, cryptoRealPrev)}
                        </h5>
                        <h6 className="text-xs">
                            {isHidden ? '****' : calculatePercentageChange(cryptoReal, cryptoRealPrev)}
                        </h6>
                    </div>
                </div>

                <div className="analytic">
                    <div className="design">
                        <div className="logo" style={{ color: '#74b9ff' }}>
                            <assetIcons.digitalServices />
                        </div>
                    </div>
                    <div className="transfer">
                        <h2>{languages[language].graphs.statsBalance.variation}</h2>
                        <h6>{languages[language].assets.digitalServices}</h6>
                    </div>
                    <div className="money">
                        <h5>
                            {isHidden ? '****' : calculateDifference(digitalServicesReal, digitalServicesRealPrev)}
                        </h5>
                        <h6 className="text-xs">
                            {isHidden ? '****' : calculatePercentageChange(digitalServicesReal, digitalServicesRealPrev)}
                        </h6>
                    </div>
                </div>

                <div className="analytic">
                    <div className="design">
                        <div className="logo" style={{ color: '#FF6600' }}>
                            <assetIcons.stocks />
                        </div>
                    </div>
                    <div className="transfer">
                        <h2>{languages[language].graphs.statsBalance.variation}</h2>
                        <h6>{languages[language].assets.stocks}</h6>
                    </div>
                    <div className="money">
                        <h5>
                            {isHidden ? '****' : calculateDifference(stocksReal, stocksRealPrev)}
                        </h5>
                        <h6 className="text-xs">
                            {isHidden ? '****' : calculatePercentageChange(stocksReal, stocksRealPrev)}
                        </h6>
                    </div>
                </div>

                <div className="analytic">
                    <div className="design">
                        <div className="logo" style={{ color: '#a29bfe' }}>
                            <assetIcons.etf />
                        </div>
                    </div>
                    <div className="transfer">
                        <h2>{languages[language].graphs.statsBalance.variation}</h2>
                        <h6>{languages[language].assets.etf}</h6>
                    </div>
                    <div className="money">
                        <h5>
                            {isHidden ? '****' : calculateDifference(etfReal, etfRealPrev)}
                        </h5>
                        <h6 className="text-xs">
                            {isHidden ? '****' : calculatePercentageChange(etfReal, etfRealPrev)}
                        </h6>
                    </div>
                </div>
            </Section>
        </div>
    );
}