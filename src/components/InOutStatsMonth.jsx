import React, { useEffect, useState, useContext } from 'react'
import { GiReceiveMoney } from "react-icons/gi";
import { GiExpense } from "react-icons/gi";
import { MdOutlineSavings } from "react-icons/md"; 
import {SectionAMonth} from '../styles/MyStyled';
import styled from 'styled-components';
import { calculatePercentageChange, calculateDifference } from '../utils/calculations';
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
    transform: translateY(-6px) scale(1.01);
    box-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 8px 25px rgba(0, 0, 0, 0.3)' 
      : '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 25px rgba(0, 0, 0, 0.08)'
    };
    border-color: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.25)' 
      : 'rgba(7, 145, 100, 0.2)'
    };
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 16px;
    
    &:hover {
      transform: translateY(-4px) scale(1.005);
    }
  }
`;

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  dataEntry
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    {/* {` (${dataEntry.name}: ${dataEntry.value})`} // aggiunto qui */}
    </text>
  );
};

export default function InOutStatsMonth({ theme, userData, isHidden}) {
    const { language } = useContext(LanguageContext);
    const [incomesMonth, setIncomesMonth] = useState(0);
    const [outflowsMonth, setOutflowsMonth] = useState(0);
    const [savedMonth, setSavedMonth] = useState(0);
    const [incomesPreMonth, setIncomesPreMonth] = useState(0);
    const [outflowsPreMonth, setOutflowsPreMonth] = useState(0);
    const [savedPreMonth, setSavedPreMonth] = useState(0);

    // const {
    //     SectionAMonth,
    //     WrapperAMonth,
    //   } = MyStyled()


    useEffect(() => {
        const fetchData = async () => {
          if (userData) {
            try {

                //CURRENT MONTH
                setOutflowsMonth(userData ? userData.expensesArray[0] : 0);
                setIncomesMonth(userData ? userData.incomesArray[0] : 0);
                setSavedMonth(userData ? (userData.incomesArray[0] - userData.expensesArray[0]) : 0);

                //PREVIOUS MONTH
                setIncomesPreMonth(userData ? userData.incomesArray[0] : 0);
                setSavedPreMonth(userData ? (userData.incomesArray[1] - userData.expensesArray[1]) : 0);
                setOutflowsPreMonth(userData ? userData.expensesArray[1] : 0);


            } catch (error) {
              console.error('Error:', error);
            }
          }
        };

    fetchData();
    }, [userData]);

    // const data = [
    //     { name: "Stocks", value: stocksReal },
    //     { name: "Bank", value: bankReal },
    //     { name: "Cash", value: cryptoReal },
    //     { name: "Crypto", value: cryptoReal }
    // ];



    return (
        <ModernStatsCard theme={theme}>
          <SectionAMonth theme={theme}>
            <div className="analytic">
                <div className="design">
                    <div className="logo" style={{ color: '#079164', fontSize: '2rem' }}>
                        <GiReceiveMoney />
                    </div>
                </div>
                <div className="transfer">
                    <h6 style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '500', 
                        opacity: 0.8,
                        marginBottom: '0.25rem'
                    }}>
                        {languages[language].graphs.statsOutflows.variation}
                    </h6>
                    <h6 style={{ 
                        fontSize: '1rem', 
                        fontWeight: '600',
                        color: theme.textColor
                    }}>
                        {languages[language].general.incomes}
                    </h6>
                </div>
                <div className="money">
                    <h5 style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: '700',
                        marginBottom: '0.25rem',
                        color: theme.textColor
                    }}>
                        {isHidden ? '****' : calculateDifference(incomesMonth, incomesPreMonth)}
                    </h5>
                    <h6 style={{ 
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        opacity: 0.7
                    }}>
                        {isHidden ? '****' : calculatePercentageChange(incomesMonth, incomesPreMonth)}
                    </h6>
                </div>
            </div>

            <div className="analytic">
                <div className="design">
                    <div className="logo" style={{ color: '#ff3838', fontSize: '2rem' }}>
                        <GiExpense />
                    </div>
                </div>
                <div className="transfer">
                    <h6 style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '500', 
                        opacity: 0.8,
                        marginBottom: '0.25rem'
                    }}>
                        {languages[language].graphs.statsOutflows.variation}
                    </h6>
                    <h6 style={{ 
                        fontSize: '1rem', 
                        fontWeight: '600',
                        color: theme.textColor
                    }}>
                        {languages[language].general.outflows}
                    </h6>
                </div>
                <div className="money">
                    <h5 style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: '700',
                        marginBottom: '0.25rem',
                        color: theme.textColor
                    }}>
                        {isHidden ? '****' : calculateDifference(outflowsMonth, outflowsPreMonth)}
                    </h5>
                    <h6 style={{ 
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        opacity: 0.7
                    }}>
                        {isHidden ? '****' : calculatePercentageChange(outflowsMonth, outflowsPreMonth)}
                    </h6>
                </div>
            </div>

            <div className="analytic">
                <div className="design">
                    <div className="logo" style={{ color: '#33d9b2', fontSize: '2rem' }}>
                        <MdOutlineSavings />
                    </div>
                </div>
                <div className="transfer">
                    <h6 style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '500', 
                        opacity: 0.8,
                        marginBottom: '0.25rem'
                    }}>
                        {languages[language].graphs.statsOutflows.variation}
                    </h6>
                    <h6 style={{ 
                        fontSize: '1rem', 
                        fontWeight: '600',
                        color: theme.textColor
                    }}>
                        {languages[language].general.saved}
                    </h6>
                </div>
                <div className="money">
                    <h5 style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: '700',
                        marginBottom: '0.25rem',
                        color: theme.textColor
                    }}>
                        {isHidden ? '****' : calculateDifference(savedMonth, savedPreMonth)}
                    </h5>
                    <h6 style={{ 
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        opacity: 0.7
                    }}>
                        {isHidden ? '****' : calculatePercentageChange(savedMonth, savedPreMonth)}
                    </h6>
                </div>
            </div>
        </SectionAMonth>
    </ModernStatsCard>
    )
}