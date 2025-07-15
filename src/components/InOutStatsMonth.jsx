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
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
  };
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.08)'
  };
  border-radius: 16px;
  padding: 1.5rem;
  margin: 1rem auto;
  max-width: 1200px;
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
    : '0 4px 20px rgba(0, 0, 0, 0.08)'
  };
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 12px 40px rgba(0, 0, 0, 0.4)' 
      : '0 8px 30px rgba(0, 0, 0, 0.12)'
    };
  }

  @media (max-width: 768px) {
    padding: 1rem;
    margin: 0.75rem auto;
    border-radius: 12px;
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
    //     { name: "Cash", value: cashReal },
    //     { name: "Crypto", value: cryptoReal }
    // ];

    
      
    return (
        <div className="wrapper" style={{ width: '100%', padding: '0 0.5rem' }}>
        <ModernStatsCard theme={theme}>
          <SectionAMonth theme={theme}>
            <div className="analytic">
                <div className="design">
                    <div className="logo" style={{ color: '#079164' }}>
                        <GiReceiveMoney />
                    </div>
                </div>
                <div className="transfer">
                    <h6>{languages[language].graphs.statsOutflows.variation}</h6>
                    <h6>{languages[language].general.incomes}</h6>
                </div>
                <div className="money">
                    <h5>
                        {isHidden ? '****' : calculateDifference(incomesMonth, incomesPreMonth)}
                    </h5>
                    <h6 className="text-xs">
                        {isHidden ? '****' : calculatePercentageChange(incomesMonth, incomesPreMonth)}
                    </h6>
                </div>
            </div>

            <div className="analytic">
                <div className="design">
                    <div className="logo" style={{ color: '#ff3838' }}>
                        <GiExpense />
                    </div>
                </div>
                <div className="transfer">
                    <h6>{languages[language].graphs.statsOutflows.variation}</h6>
                    <h6>{languages[language].general.outflows}</h6>
                </div>
                <div className="money">
                    <h5>
                        {isHidden ? '****' : calculateDifference(outflowsMonth, outflowsPreMonth)}
                    </h5>
                    <h6 className="text-xs">
                        {isHidden ? '****' : calculatePercentageChange(outflowsMonth, outflowsPreMonth)}
                    </h6>
                </div>
            </div>

            <div className="analytic">
                <div className="design">
                    <div className="logo" style={{ color: '#33d9b2' }}>
                        <MdOutlineSavings />
                    </div>
                </div>
                <div className="transfer">
                    <h6>{languages[language].graphs.statsOutflows.variation}</h6>
                    <h6>{languages[language].general.saved}</h6>
                </div>
                <div className="money">
                    <h5>
                        {isHidden ? '****' : calculateDifference(savedMonth, savedPreMonth)}
                    </h5>
                    <h6 className="text-xs">
                        {isHidden ? '****' : calculatePercentageChange(savedMonth, savedPreMonth)}
                    </h6>
                </div>
            </div>
        </SectionAMonth>
        </ModernStatsCard>
    </div>
    )
}

