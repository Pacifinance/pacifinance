import React, { useEffect, useState, useContext } from 'react'
import { GiReceiveMoney, GiExpense } from "react-icons/gi";
import { MdOutlineSavings } from "react-icons/md"; 
import { SectionAMonth } from '../styles/MyStyled';
import styled from 'styled-components';
import { calculatePercentageChange, calculateDifference, formatCurrencyDifference } from '../utils/calculations';
import languages from '../data/languages.json';
import { LanguageContext } from '../contexts/LanguageContext';

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const ModernStatsCard = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
  };
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.15)' 
    : 'rgba(0, 0, 0, 0.06)'
  };
  border-radius: 20px;
  padding: 2rem;
  margin: 0;
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? '0 10px 40px rgba(0, 0, 0, 0.4), 0 4px 15px rgba(0, 0, 0, 0.2)' 
    : '0 10px 40px rgba(0, 0, 0, 0.08), 0 4px 15px rgba(0, 0, 0, 0.04)'
  };
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: ${props => props.theme.mode === 'dark'
      ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
      : 'linear-gradient(90deg, transparent, rgba(7,145,100,0.3), transparent)'
    };
  }
  
  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 8px 25px rgba(0, 0, 0, 0.3)' 
      : '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 25px rgba(0, 0, 0, 0.08)'
    };
    border-color: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.2)' 
      : 'rgba(7, 145, 100, 0.2)'
    };
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 16px;
    
    &:hover {
      transform: translateY(-2px) scale(1.01);
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  height: 100%;
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 768px) {
    gap: 1.5rem;
  }
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(255, 255, 255, 0.7)'
  };
  border-radius: 16px;
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)'
  };
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.08)' 
      : 'rgba(255, 255, 255, 0.9)'
    };
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const IconContainer = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  background: ${props => props.$bgColor || '#079164'};
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.textColor};
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const StatLabel = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'};
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const PercentageChange = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${props => props.$isPositive ? '#27ae60' : '#e74c3c'};
  background: ${props => props.$isPositive 
    ? 'rgba(39, 174, 96, 0.1)' 
    : 'rgba(231, 76, 60, 0.1)'
  };
  padding: 0.4rem 0.8rem;
  border-radius: 16px;
  border: 1px solid ${props => props.$isPositive 
    ? 'rgba(39, 174, 96, 0.2)' 
    : 'rgba(231, 76, 60, 0.2)'
  };
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 0.3rem 0.6rem;
    border-radius: 12px;
  }
`;

/**
 * Componente unificato per statistiche Income/Outflow
 * @param {string} period - Periodo di confronto: "month" (vs mese precedente) o "year" (vs stesso mese anno precedente)
 * @param {Object} theme - Tema dell'applicazione
 * @param {Object} userData - Dati utente
 * @param {boolean} isHidden - Privacy mode
 */
export default function InOutStats({ period = "month", theme, userData, isHidden }) {
    const { language } = useContext(LanguageContext);
    
    // Dati correnti (sempre mese corrente)
    const [incomesCurrent, setIncomesCurrent] = useState(0);
    const [outflowsCurrent, setOutflowsCurrent] = useState(0);
    const [savedCurrent, setSavedCurrent] = useState(0);
    
    // Dati di confronto (dipendono dal period)
    const [incomesComparison, setIncomesComparison] = useState(0);
    const [outflowsComparison, setOutflowsComparison] = useState(0);
    const [savedComparison, setSavedComparison] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            if (userData) {
                try {
                    // DATI CORRENTI (sempre mese corrente - indice 0)
                    setOutflowsCurrent(userData?.outflowsArray[0] || 0);
                    setIncomesCurrent(userData?.incomesArray[0] || 0);
                    setSavedCurrent((userData?.incomesArray[0] || 0) - (userData?.outflowsArray[0] || 0));

                    // DATI DI CONFRONTO (dipendono dal periodo)
                    if (period === "month") {
                        // Confronto con mese precedente (indice 1)
                        setIncomesComparison(userData?.incomesArray[1] || 0);
                        setOutflowsComparison(userData?.outflowsArray[1] || 0);
                        setSavedComparison((userData?.incomesArray[1] || 0) - (userData?.outflowsArray[1] || 0));
                    } else if (period === "year") {
                        // Confronto con stesso mese anno precedente (indice 12)
                        setIncomesComparison(userData?.incomesArray[12] || 0);
                        setOutflowsComparison(userData?.outflowsArray[12] || 0);
                        setSavedComparison((userData?.incomesArray[12] || 0) - (userData?.outflowsArray[12] || 0));
                    }
                } catch (error) {
                    console.error('Error loading stats data:', error);
                }
            }
        };

        fetchData();
    }, [userData, period]);



    // Funzione per determinare se un cambiamento è positivo
    const isPositiveChange = (current, comparison, type = 'outflow') => {
        if (type === 'income' || type === 'saved') {
            return current > comparison; // Per income e saved, aumento è positivo
        } else {
            return current < comparison; // Per outflow, diminuzione è positivo
        }
    };

    // Testi dinamici basati sul periodo con date formattate
    const getPeriodText = () => {
        const currentDate = new Date();
        
        if (period === "month") {
            // Mese precedente
            const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            const prevMonthFormatted = prevMonth.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', { 
                month: 'long', 
                year: 'numeric' 
            });
            
            return {
                vsText: `${languages[language]?.graphs?.comparison?.vsLastMonth || "vs mese precedente"}`,
                periodLabel: languages[language]?.graphs?.comparison?.monthlyComparison || "Confronto mensile",
                comparisonDate: prevMonthFormatted
            };
        } else {
            // Anno precedente, stesso mese
            const prevYear = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
            const prevYearFormatted = prevYear.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', { 
                month: 'long', 
                year: 'numeric' 
            });
            
            return {
                vsText: `${languages[language]?.graphs?.comparison?.vsLastYear || "vs anno precedente"}`,
                periodLabel: languages[language]?.graphs?.comparison?.yearlyComparison || "Confronto annuale",
                comparisonDate: prevYearFormatted
            };
        }
    };

    const periodText = getPeriodText();

    return (
        <SectionAMonth theme={theme}>
            <ModernStatsCard theme={theme}>
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h3 style={{ 
                        color: theme.textColor, 
                        fontSize: '1.5rem', 
                        fontWeight: '600',
                        margin: '0 0 0.5rem 0'
                    }}>
                        {periodText.periodLabel}
                    </h3>
                    <p style={{ 
                        color: theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                        fontSize: '1rem',
                        margin: '0 0 0.25rem 0'
                    }}>
                        {periodText.vsText}
                    </p>
                    <p style={{ 
                        color: theme.mode === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        margin: 0
                    }}>
                        {periodText.comparisonDate}
                    </p>
                </div>

                <StatsGrid>
                    {/* INCOME CARD */}
                    <StatCard theme={theme}>
                        <IconContainer $bgColor="linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)">
                            <div className="logo" style={{ color: '#fff', fontSize: '2rem' }}>
                                <GiReceiveMoney />
                            </div>
                        </IconContainer>
                        
                        <StatValue theme={theme}>
                            {isHidden ? '****' : formatCurrencyDifference(calculateDifference(incomesCurrent, incomesComparison))}
                        </StatValue>
                        
                        <StatLabel theme={theme}>
                            {languages[language]?.general?.incomes || 'Entrate'}
                        </StatLabel>
                        
                        <PercentageChange 
                            $isPositive={isPositiveChange(incomesCurrent, incomesComparison, 'income')}
                        >
                            {isHidden ? '****' : calculatePercentageChange(incomesCurrent, incomesComparison, 'income')}
                        </PercentageChange>
                    </StatCard>

                    {/* EXPENSE CARD */}
                    <StatCard theme={theme}>
                        <IconContainer $bgColor="linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)">
                            <div className="logo" style={{ color: '#fff', fontSize: '2rem' }}>
                                <GiExpense />
                            </div>
                        </IconContainer>
                        
                        <StatValue theme={theme}>
                            {isHidden ? '****' : formatCurrencyDifference(calculateDifference(outflowsCurrent, outflowsComparison))}
                        </StatValue>
                        
                        <StatLabel theme={theme}>
                            {languages[language]?.general?.outflows || 'Uscite'}
                        </StatLabel>
                        
                        <PercentageChange 
                            $isPositive={isPositiveChange(outflowsCurrent, outflowsComparison, 'expense')}
                        >
                            {isHidden ? '****' : calculatePercentageChange(outflowsCurrent, outflowsComparison, 'expense')}
                        </PercentageChange>
                    </StatCard>

                    {/* SAVINGS CARD */}  
                    <StatCard theme={theme}>
                        <IconContainer $bgColor="linear-gradient(135deg, #3498db 0%, #2980b9 100%)">
                            <div className="logo" style={{ color: '#fff', fontSize: '2rem' }}>
                                <MdOutlineSavings />
                            </div>
                        </IconContainer>
                        
                        <StatValue theme={theme}>
                            {isHidden ? '****' : formatCurrencyDifference(calculateDifference(savedCurrent, savedComparison))}
                        </StatValue>
                        
                        <StatLabel theme={theme}>
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