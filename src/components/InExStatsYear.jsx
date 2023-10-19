import React, { useEffect, useState, useContext } from 'react'
import { UserContext } from '../contexts/UserContext';
import { AiOutlineMore } from "react-icons/ai";
import { GiReceiveMoney } from "react-icons/gi";
import { GiExpense } from "react-icons/gi";
import { MdOutlineSavings } from "react-icons/md"; 
import {SectionAMonth} from '../contexts/MyStyled';
import { calculatePercentageChange } from '../utilities/calculations';
import { ThemeContext } from '../contexts/ThemeContext';

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

function InExStatsYear() {
    const { userData } = useContext(UserContext);
    const { theme } = useContext(ThemeContext);
    const [incomesMonth, setIncomesMonth] = useState(0);
    const [expensesMonth, setExpensesMonth] = useState(0);
    const [savedMonth, setSavedMonth] = useState(0);
    const [incomesPreYearSameMonth, setIncomesPreYearSameMonth] = useState(0);
    const [expensesPreYearSameMonth, setExpensesPreYearSameMonth] = useState(0);
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
                setExpensesMonth(userData ? userData.expensesArray[0] : 0);
                setIncomesMonth(userData ? userData.incomesArray[0] : 0);
                setSavedMonth(userData ? (userData.incomesArray[0] - userData.expensesArray[0]) : 0);

                //PREVIOUS YEAR SAME MONTH
                setExpensesPreYearSameMonth(userData ? userData.expensesArray[12]: 0);
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
        
        <div className="wrapper">
        {/* <h1>Il tuo patrimonio è cresciuto di: {((totalReal - totalRealPreYearSameMonth) / totalRealPreYearSameMonth) * 100} % </h1> */}
        <SectionAMonth theme={theme}>
            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#079164' }}>
                        <GiReceiveMoney />
                    </div>
                    {/* <div className="action">
                        <AiOutlineMore />
                    </div> */}
                </div>
                <div className="transfer">
                    <h6>Variazione entrate</h6>
                    <h6>in percentuale</h6>
                </div>
                <div className="money">
                    <h5>
                        {calculatePercentageChange(incomesMonth, incomesPreYearSameMonth)}
                    </h5>
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
                    <h6>Variazione Uscite</h6>
                    <h6>in percentuale</h6>
                </div>
                <div className="money">
                    <h5>
                        {calculatePercentageChange(expensesMonth, expensesPreYearSameMonth)}
                    </h5>
                </div>
            </div>
            
            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#33d9b2' }}>
                        < MdOutlineSavings />
                    </div>
                    {/* <div className="action">
                        <AiOutlineMore />
                    </div> */}
                </div>
                <div className="transfer">
                    <h6>Variazione Rismarmi</h6>
                    <h6>in percentuale</h6>
                </div>
                <div className="money">
                    <h5>
                        {calculatePercentageChange(savedMonth, savedPreYearSameMonth)}
                    </h5>
                </div>
            </div>
        </SectionAMonth>
    </div>
    )
}

export default InExStatsYear;
