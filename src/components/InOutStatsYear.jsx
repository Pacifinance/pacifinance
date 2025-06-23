import React, { useEffect, useState, useContext } from 'react'
import { GiReceiveMoney } from "react-icons/gi";
import { GiExpense } from "react-icons/gi";
import { MdOutlineSavings } from "react-icons/md"; 
import {SectionAMonth} from '../styles/MyStyled';
import { calculatePercentageChange, calculateDifference } from '../utils/calculations';
import languages from '../data/languages.json';
import { LanguageContext } from '../contexts/LanguageContext';


// const [activeIndex, setActiveIndex] = useState(null);

// const handleMouseEnter = (_, index) => {
//   setActiveIndex(index);
// };

// const handleMouseLeave = () => {
//   setActiveIndex(null);
// };


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

function InOutStatsYear({ theme, userData, isHidden}) {
    const { language } = useContext(LanguageContext);
    const [incomesMonth, setIncomesMonth] = useState(0);
    const [outflowsMonth, setOutflowsMonth] = useState(0);
    const [savedMonth, setSavedMonth] = useState(0);
    const [incomesPreYearSameMonth, setIncomesPreYearSameMonth] = useState(0);
    const [outflowsPreYearSameMonth, setOutflowsPreYearSameMonth] = useState(0);
    const [savedPreYearSameMonth, setSavedPreYearSameMonth] = useState(0);

    // const {
    //     SectionAMonth,
    //     WrapperAMonth,
    //   } = MyStyled()
    

    useEffect(() => {
        const fetchData = async () => {
          if (userData) {
            try {   
                // Set the state with the data from the database

                //CURRENT MONTH
                setOutflowsMonth(userData ? userData.expensesArray[0] : 0);
                setIncomesMonth(userData ? userData.incomesArray[0] : 0);
                setSavedMonth(userData ? (userData.incomesArray[0] - userData.expensesArray[0]) : 0);

                //PREVIOUS YEAR SAME MONTH
                setOutflowsPreYearSameMonth(userData ? userData.expensesArray[12]: 0);
                setIncomesPreYearSameMonth(userData ? userData.incomesArray[12] : 0);
                setSavedPreYearSameMonth(userData ? (userData.incomesArray[12] - userData.expensesArray[12]) : 0);

            } catch (error) {
              console.error('Errore durante le operazioni:', error);
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
                        {isHidden ? '****' : calculateDifference(incomesMonth, incomesPreYearSameMonth)}
                    </h5>
                    <h6 className="text-xs">
                        {isHidden ? '****' : calculatePercentageChange(incomesMonth, incomesPreYearSameMonth)}
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
                        {isHidden ? '****' : calculateDifference(outflowsMonth, outflowsPreYearSameMonth)}
                    </h5>
                    <h6 className="text-xs">
                        {isHidden ? '****' : calculatePercentageChange(outflowsMonth, outflowsPreYearSameMonth)}
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
                        {isHidden ? '****' : calculateDifference(savedMonth, savedPreYearSameMonth)}
                    </h5>
                    <h6 className="text-xs">
                        {isHidden ? '****' : calculatePercentageChange(savedMonth, savedPreYearSameMonth)}
                    </h6>
                </div>
            </div>
        </SectionAMonth>
    </div>
    )
}

export default InOutStatsYear;
