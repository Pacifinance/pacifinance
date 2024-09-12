import React, { useEffect, useState, useContext } from 'react'
import { GiReceiveMoney } from "react-icons/gi";
import { GiExpense } from "react-icons/gi";
import { MdOutlineSavings } from "react-icons/md"; 
import {SectionAMonth} from '../styles/MyStyled';
import { calculatePercentageChange, calculateDifference } from '../utils/calculations';
import languages from '../data/languages.json';
import { LanguageContext } from '../contexts/LanguageContext'; 





const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

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

export default function InExStatsMonth({ theme, userData, isHidden}) {
    const { language } = useContext(LanguageContext);
    const [incomesMonth, setIncomesMonth] = useState(0);
    const [expensesMonth, setExpensesMonth] = useState(0);
    const [savedMonth, setSavedMonth] = useState(0);
    const [incomesPreMonth, setIncomesPreMonth] = useState(0);
    const [expensesPreMonth, setExpensesPreMonth] = useState(0);
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
                setExpensesMonth(userData ? userData.expensesArray[0] : 0);
                setIncomesMonth(userData ? userData.incomesArray[0] : 0);
                setSavedMonth(userData ? (userData.incomesArray[0] - userData.expensesArray[0]) : 0);

                //PREVIOUS MONTH
                setIncomesPreMonth(userData ? userData.incomesArray[0] : 0);
                setSavedPreMonth(userData ? (userData.incomesArray[1] - userData.expensesArray[1]) : 0);
                setExpensesPreMonth(userData ? userData.expensesArray[1] : 0);
                
        
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
        
        <div className="wrapper">
        <SectionAMonth theme={theme}>
            {/* <h1>Le tue entrate sono variate del: {((incomesMonth - incomesPreMonth) / incomesPreMonth) * 100} percentuale </h1>
            <h1>Le tue uscite sono variate del: {((expensesMonth - expensesPreMonth) / expensesPreMonth) * 100} percentuale </h1> */}
            
            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#079164 ' }}>
                        <GiReceiveMoney />
                    </div>
                    {/* <div className="action">
                    <AiOutlineMore />
                    </div> */}
                </div>
                <div className="transfer">
                    <h6>{languages[language].graphs.statsExpenses.variation}</h6>
                    <h6>{languages[language].general.incomes}</h6>
                </div>
                <div className="money">
                    <h5>
                        {isHidden ? '****' : calculateDifference(incomesMonth, incomesPreMonth)}
                    </h5>
                    <h6 className="text-s">
                        {isHidden ? '****' : calculatePercentageChange(incomesMonth, incomesPreMonth)}
                    </h6>
                </div>
            </div>

            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#ff3838' }}>
                        <GiExpense />
                    </div>
                    {/* <div className="action">
                    <AiOutlineMore />
                    </div> */}
                </div>
                <div className="transfer">
                    <h6>{languages[language].graphs.statsExpenses.variation}</h6>
                    <h6>{languages[language].general.expenses}</h6>
                </div>
                <div className="money">
                    <h5>
                        {isHidden ? '****' : calculateDifference(expensesMonth, expensesPreMonth)}
                    </h5>
                    <h6 className="text-s">
                        {isHidden ? '****' : calculatePercentageChange(expensesMonth, expensesPreMonth)}
                    </h6>
                </div>
            </div>

            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#33d9b2' }}>
                        <MdOutlineSavings />
                    </div>
                    {/* <div className="action">
                    <AiOutlineMore />
                    </div> */}
                </div>
                <div className="transfer">
                    <h6>{languages[language].graphs.statsExpenses.variation}</h6>
                    <h6>{languages[language].general.saved}</h6>
                </div>
                <div className="money">
                    <h5>
                        {isHidden ? '****' : calculateDifference(savedMonth, savedPreMonth)}
                    </h5>
                    <h6 className="text-s">
                        {isHidden ? '****' : calculatePercentageChange(savedMonth, savedPreMonth)}
                    </h6>
                </div>
            </div>
        </SectionAMonth>
    </div>
    )
}

