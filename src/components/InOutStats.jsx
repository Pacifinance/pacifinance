import React, { useEffect, useState, useContext } from 'react'
import { GiReceiveMoney, GiPayMoney } from "react-icons/gi";
import { MdOutlineSavings } from "react-icons/md"; 
import styled from 'styled-components';
import { calculatePercentageChange, calculateDifference, formatCurrencyDifference } from '../utils/calculations';
import { getTotalOutflowsCurrentMonth, getTotalIncomesCurrentMonth, getTotalSavedCurrentMonth } from '../utils/userDataSelectors';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';

const ModernStatsCard = styled.div`
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(255, 255, 255, 0.9)'
  };
  border: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.06)'
  };
  border-radius: 16px;
  padding: 1.25rem;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.mode === 'dark'
      ? '0 8px 24px rgba(0, 0, 0, 0.3)'
      : '0 8px 24px rgba(0, 0, 0, 0.08)'
    };
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 12px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0.75rem 0.5rem;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.04)' 
    : 'rgba(0, 0, 0, 0.02)'
  };
  border-radius: 12px;
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.06)' 
    : 'rgba(0, 0, 0, 0.04)'
  };
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.07)' 
      : 'rgba(0, 0, 0, 0.03)'
    };
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 0.4rem;
  }
`;

const IconContainer = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.4rem;
  background: ${props => props.$bgColor || '#079164'};
  
  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }
`;

const StatValue = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${props => props.theme.textColor};
  margin-bottom: 0.15rem;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'};
  margin-bottom: 0.4rem;
  
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
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  
  @media (max-width: 768px) {
    font-size: 0.65rem;
    padding: 0.15rem 0.4rem;
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

function InOutStats({ period = "month", theme, userData, isHidden }) {
    const { language, translations } = useContext(LanguageContext);
    const { formatAmount } = useContext(CurrencyContext);
    const currencyFormatter = (val) => formatAmount(val, { maximumFractionDigits: 0 });
    
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
                    setOutflowsCurrent(getTotalOutflowsCurrentMonth(userData));
                    setIncomesCurrent(getTotalIncomesCurrentMonth(userData));
                    setSavedCurrent(getTotalSavedCurrentMonth(userData));

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
        <ModernStatsCard theme={theme}>
            <div style={{ marginBottom: '0.75rem', textAlign: 'center' }}>
                <h3 style={{ 
                    color: theme.textColor, 
                    fontSize: '0.95rem', 
                    fontWeight: '600',
                    margin: '0 0 0.2rem 0'
                }}>
                    {periodText.periodLabel}
                </h3>
                <TooltipContainer>
                    <p style={{ 
                        color: theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
                        fontSize: '0.78rem',
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
                        <div style={{ color: '#fff', fontSize: '1.1rem', display: 'flex' }}>
                            <GiReceiveMoney />
                        </div>
                    </IconContainer>
                    
                    <StatValue theme={theme}>
                        {isHidden ? '****' : formatCurrencyDifference(calculateDifference(incomesCurrent, incomesComparison), currencyFormatter)}
                    </StatValue>
                    
                    <StatLabel theme={theme}>
                        {translations?.general?.incomes || 'Entrate'}
                    </StatLabel>
                    
                    <PercentageChange 
                        $isPositive={isPositiveChange(incomesCurrent, incomesComparison, 'income')}
                    >
                        {isHidden ? '****' : calculatePercentageChange(incomesCurrent, incomesComparison, 'income')}
                    </PercentageChange>
                </StatCard>

                <StatCard theme={theme}>
                    <IconContainer $bgColor="linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)">
                        <div style={{ color: '#fff', fontSize: '1.1rem', display: 'flex' }}>
                            <GiPayMoney />
                        </div>
                    </IconContainer>
                    
                    <StatValue theme={theme}>
                        {isHidden ? '****' : formatCurrencyDifference(calculateDifference(outflowsCurrent, outflowsComparison), currencyFormatter)}
                    </StatValue>
                    
                    <StatLabel theme={theme}>
                        {translations?.general?.outflows || 'Uscite'}
                    </StatLabel>
                    
                    <PercentageChange 
                        $isPositive={isPositiveChange(outflowsCurrent, outflowsComparison, 'expense')}
                    >
                        {isHidden ? '****' : calculatePercentageChange(outflowsCurrent, outflowsComparison, 'expense')}
                    </PercentageChange>
                </StatCard>

                <StatCard theme={theme}>
                    <IconContainer $bgColor="linear-gradient(135deg, #3498db 0%, #2980b9 100%)">
                        <div style={{ color: '#fff', fontSize: '1.1rem', display: 'flex' }}>
                            <MdOutlineSavings />
                        </div>
                    </IconContainer>
                    
                    <StatValue theme={theme}>
                        {isHidden ? '****' : formatCurrencyDifference(calculateDifference(savedCurrent, savedComparison), currencyFormatter)}
                    </StatValue>
                    
                    <StatLabel theme={theme}>
                        {translations?.general?.saved || 'Risparmiato'}
                    </StatLabel>
                    
                    <PercentageChange 
                        $isPositive={isPositiveChange(savedCurrent, savedComparison, 'saved')}
                    >
                        {isHidden ? '****' : calculatePercentageChange(savedCurrent, savedComparison, 'saved')}
                    </PercentageChange>
                </StatCard>
            </StatsGrid>
        </ModernStatsCard>
    );
}

export default React.memo(InOutStats);
