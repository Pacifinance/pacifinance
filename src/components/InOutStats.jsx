import React, { useEffect, useState, useContext } from 'react'
import { GiReceiveMoney, GiPayMoney } from "react-icons/gi";
import { MdOutlineSavings } from "react-icons/md"; 
import { SectionAMonth } from '../styles/MyStyled';
import styled from 'styled-components';
import { calculatePercentageChange, calculateDifference, formatCurrencyDifference } from '../utils/calculations';
import languages from '../data/languages.json';
import { LanguageContext } from '../contexts/LanguageContext';

const ModernStatsCard = styled.div`
  background: transparent;
  border: none;
  border-radius: 16px;
  padding: 1rem;
  margin: 0;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding: 0.8rem;
    border-radius: 12px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8rem;
  
  @media (max-width: 768px) {
    gap: 0.6rem;
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0.8rem;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(255, 255, 255, 0.8)'
  };
  border-radius: 12px;
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.08)'
  };
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.08)' 
      : 'rgba(255, 255, 255, 0.95)'
    };
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem;
  }
`;

const IconContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  background: ${props => props.$bgColor || '#079164'};
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
  }
`;

const StatValue = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.3rem;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

const PercentageChange = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  color: ${props => props.$isPositive ? '#27ae60' : '#e74c3c'};
  background: ${props => props.$isPositive 
    ? 'rgba(39, 174, 96, 0.1)' 
    : 'rgba(231, 76, 60, 0.1)'
  };
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  border: 1px solid ${props => props.$isPositive 
    ? 'rgba(39, 174, 96, 0.2)' 
    : 'rgba(231, 76, 60, 0.2)'
  };
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  
  @media (max-width: 768px) {
    font-size: 0.65rem;
    padding: 0.2rem 0.4rem;
    border-radius: 8px;
  }
`;

const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
  cursor: pointer;
  
  &:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.theme.mode === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)'};
  color: ${props => props.theme.textColor};
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  font-size: 0.7rem;
  white-space: nowrap;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s, visibility 0.3s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  z-index: 1000;
  margin-bottom: 0.5rem;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: ${props => props.theme.mode === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)'};
  }
`;

export default function InOutStats({ period = "month", theme, userData, isHidden }) {
    const { language } = useContext(LanguageContext);
    
    const [incomesCurrent, setIncomesCurrent] = useState(0);
    const [outflowsCurrent, setOutflowsCurrent] = useState(0);
    const [savedCurrent, setSavedCurrent] = useState(0);
    
    const [incomesComparison, setIncomesComparison] = useState(0);
    const [outflowsComparison, setOutflowsComparison] = useState(0);
    const [savedComparison, setSavedComparison] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            if (userData) {
                try {
                    setOutflowsCurrent(userData?.outflowsArray[0] || 0);
                    setIncomesCurrent(userData?.incomesArray[0] || 0);
                    setSavedCurrent((userData?.incomesArray[0] || 0) - (userData?.outflowsArray[0] || 0));

                    if (period === "month") {
                        setIncomesComparison(userData?.incomesArray[1] || 0);
                        setOutflowsComparison(userData?.outflowsArray[1] || 0);
                        setSavedComparison((userData?.incomesArray[1] || 0) - (userData?.outflowsArray[1] || 0));
                    } else {
                        setIncomesComparison(userData?.incomesArray[12] || 0);
                        setOutflowsComparison(userData?.outflowsArray[12] || 0);
                        setSavedComparison((userData?.incomesArray[12] || 0) - (userData?.outflowsArray[12] || 0));
                    }
                } catch (error) {
                    console.error("Errore nel calcolo delle statistiche:", error);
                }
            }
        };

        fetchData();
    }, [userData, period]);

    const isPositiveChange = (current, comparison, type) => {
        if (current === comparison) return true;
        
        if (type === 'income' || type === 'saved') {
            return current > comparison;
        } else {
            return current < comparison;
        }
    };

    // Testi dinamici basati sul periodo con date formattate
    const getPeriodText = () => {
        const currentDate = new Date();
        
        if (period === "month") {
            // Mese precedente
            const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            const prevMonthFormatted = prevMonth.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', { 
                month: 'short', 
                year: 'numeric' 
            });
            
            return {
                vsText: `vs ${prevMonthFormatted}`,
                periodLabel: language === 'it' ? "Confronto Finanziario Mensile" : "Monthly Financial Overview",
                tooltipText: language === 'it' ? "Confronto vs mese precedente" : "Comparison vs previous month"
            };
        } else {
            // Anno precedente, stesso mese
            const prevYear = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
            const prevYearFormatted = prevYear.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', { 
                month: 'short', 
                year: 'numeric' 
            });
            
            return {
                vsText: `vs ${prevYearFormatted}`,
                periodLabel: language === 'it' ? "Confronto Finanziario Annuale" : "Annual Financial Overview",
                tooltipText: language === 'it' ? "Confronto vs stesso mese anno precedente" : "Comparison vs same month last year"
            };
        }
    };

    const periodText = getPeriodText();

    return (
        <SectionAMonth theme={theme}>
            <ModernStatsCard theme={theme}>
                <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                    <h3 style={{ 
                        color: 'white', 
                        fontSize: '1rem', 
                        fontWeight: '600',
                        margin: '0 0 0.3rem 0'
                    }}>
                        {periodText.periodLabel}
                    </h3>
                    <TooltipContainer>
                        <p style={{ 
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '0.8rem',
                            margin: 0,
                            fontWeight: '500'
                        }}>
                            {periodText.vsText}
                        </p>
                        <Tooltip className="tooltip" theme={theme}>
                            {periodText.tooltipText}
                        </Tooltip>
                    </TooltipContainer>
                </div>

                <StatsGrid>
                    <StatCard theme={theme}>
                        <IconContainer $bgColor="linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)">
                            <div className="logo" style={{ color: '#fff', fontSize: '1.2rem' }}>
                                <GiReceiveMoney />
                            </div>
                        </IconContainer>
                        
                        <StatValue>
                            {isHidden ? '****' : formatCurrencyDifference(calculateDifference(incomesCurrent, incomesComparison))}
                        </StatValue>
                        
                        <StatLabel>
                            {languages[language]?.general?.incomes || 'Entrate'}
                        </StatLabel>
                        
                        <PercentageChange 
                            $isPositive={isPositiveChange(incomesCurrent, incomesComparison, 'income')}
                        >
                            {isHidden ? '****' : calculatePercentageChange(incomesCurrent, incomesComparison, 'income')}
                        </PercentageChange>
                    </StatCard>

                    <StatCard theme={theme}>
                        <IconContainer $bgColor="linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)">
                            <div className="logo" style={{ color: '#fff', fontSize: '1.2rem' }}>
                                <GiPayMoney />
                            </div>
                        </IconContainer>
                        
                        <StatValue>
                            {isHidden ? '****' : formatCurrencyDifference(calculateDifference(outflowsCurrent, outflowsComparison))}
                        </StatValue>
                        
                        <StatLabel>
                            {languages[language]?.general?.outflows || 'Uscite'}
                        </StatLabel>
                        
                        <PercentageChange 
                            $isPositive={isPositiveChange(outflowsCurrent, outflowsComparison, 'expense')}
                        >
                            {isHidden ? '****' : calculatePercentageChange(outflowsCurrent, outflowsComparison, 'expense')}
                        </PercentageChange>
                    </StatCard>

                    <StatCard theme={theme}>
                        <IconContainer $bgColor="linear-gradient(135deg, #3498db 0%, #2980b9 100%)">
                            <div className="logo" style={{ color: '#fff', fontSize: '1.2rem' }}>
                                <MdOutlineSavings />
                            </div>
                        </IconContainer>
                        
                        <StatValue>
                            {isHidden ? '****' : formatCurrencyDifference(calculateDifference(savedCurrent, savedComparison))}
                        </StatValue>
                        
                        <StatLabel>
                            {languages[language]?.general?.saved || 'Risparmiato'}
                        </StatLabel>
                        
                        <PercentageChange 
                            $isPositive={isPositiveChange(savedCurrent, savedComparison, 'saved')}
                        >
                            {isHidden ? '****' : calculatePercentageChange(savedCurrent, savedComparison, 'saved')}
                        </PercentageChange>
                    </StatCard>
                </StatsGrid>
            </ModernStatsCard>
        </SectionAMonth>
    );
}
