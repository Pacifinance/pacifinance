import React, { useEffect, useState, useContext } from 'react'
import { UserContext } from '../contexts/UserContext';
//import { BsCreditCard } from "react-icons/bs";
import { AiOutlineMore } from "react-icons/ai";
//import { BiTransfer } from "react-icons/bi";
import { BsBank } from "react-icons/bs";
//import { GiTakeMyMoney } from "react-icons/gi";
import { FaBitcoin } from "react-icons/fa";
import { BsCashCoin } from "react-icons/bs";
import { AiOutlineStock } from "react-icons/ai";
import MyStyled from '../contexts/MyStyled';
import { PieChart, Pie, Cell } from "recharts";

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

function BalancesStatsYear() {
    const { userData } = useContext(UserContext);
    const [stocksReal, setStocksReal] = useState(0);
    const [etfReal, setETFReal] = useState(0);
    const [bankReal, setBankReal] = useState(0);
    const [cashReal, setCashReal] = useState(0);
    const [cryptoReal, setCryptoReal] = useState(0);
    const [bitcoinReal, setBitcoinReal] = useState(0);
    const [digitalServicesReal, setDigitalServicesReal] = useState(0);
    const [totalReal, setTotalReal] = useState(0);
    const [incomesMonth, setIncomesMonth] = useState(0);
    const [expensesMonth, setExpensesMonth] = useState(0);
    const [savedMonth, setSavedMonth] = useState(0);
    const [stocksRealPreYearSameMonth, setStocksRealPreYearSameMonth] = useState(0);
    const [etfRealPreYearSameMonth, setETFRealPreYearSameMonth] = useState(0);
    const [bankRealPreYearSameMonth, setBankRealPreYearSameMonth] = useState(0);
    const [cashRealPreYearSameMonth, setCashRealPreYearSameMonth] = useState(0);
    const [cryptoRealPreYearSameMonth, setCryptoRealPreYearSameMonth] = useState(0);
    const [bitcoinRealPreYearSameMonth, setBitcoinRealPreYearSameMonth] = useState(0);
    const [digitalServicesRealPreYearSameMonth, setDigitalServicesRealPreYearSameMonth] = useState(0);
    const [totalRealPreYearSameMonth, setTotalRealPreYearSameMonth] = useState(0);
    const [incomesPreYearSameMonth, setIncomesPreYearSameMonth] = useState(0);
    const [expensesPreYearSameMonth, setExpensesPreYearSameMonth] = useState(0);
    const [savedPreYearSameMonth, setSavedPreYearSameMonth] = useState(0);

    const {
        SectionAMonth,
        WrapperAMonth,
      } = MyStyled()
    

    useEffect(() => {
        const fetchData = async () => {
          if (userData) {
            try {
                console.log(userData);
                console.log(userData.balances);
                console.log(userData.expenses);
                
                // Set the state with the data from the database

                //CURRENT MONTH
                setStocksReal(userData ? userData.stocksReal : 0);
                setETFReal(userData ? userData.etfReal : 0);
                setBitcoinReal(userData ? userData.bitcoinReal : 0);
                setCryptoReal(userData ? userData.cryptoReal : 0);
                setBankReal(userData? userData.bankReal : 0);
                setCashReal(userData ? userData.cashReal : 0);
                setDigitalServicesReal(userData ? userData.digitalServicesReal : 0);
                setTotalReal(userData ? userData.totalReal : 0);
                setExpensesMonth(userData ? userData.expensesMonth : 0);
                setIncomesMonth(userData ? userData.incomesMonth : 0);
                setSavedMonth(userData ? userData.savedMonth : 0);

                //PREVIOUS YEAR SAME MONTH
                setStocksRealPreYearSameMonth(userData ? userData.stocksRealPreYearSameMonth : 0);
                setETFRealPreYearSameMonth(userData ? userData.etfRealPreYearSameMonth : 0);
                setBitcoinRealPreYearSameMonth(userData ? userData.bitcoinRealPreYearSameMonth : 0);
                setCryptoRealPreYearSameMonth(userData ? userData.cryptoRealPreYearSameMonth : 0);
                setBankRealPreYearSameMonth(userData ? userData.bankRealPreYearSameMonth : 0);
                setCashRealPreYearSameMonth(userData ? userData.cashRealPreYearSameMonth : 0);
                setDigitalServicesRealPreYearSameMonth(userData ? userData.digitalServicesRealPreYearSameMonth : 0);
                setTotalRealPreYearSameMonth(userData ? userData.totalRealPreYearSameMonth : 0);
                setExpensesPreYearSameMonth(userData ? userData.expensesPreYearSameMonth : 0);
                setIncomesPreYearSameMonth(userData ? userData.incomesPreYearSameMonth : 0);
                setSavedPreYearSameMonth(userData ? userData.savedPreYearSameMonth : 0);

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
        <h1>Il tuo patrimonio è cresciuto di: {((totalReal - totalRealPreYearSameMonth) / totalRealPreYearSameMonth) * 100} % </h1>
        <SectionAMonth>
            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#0D579B'}}>
                        <BsBank />
                    </div>
                    <div className="action">
                    <AiOutlineMore />
                    </div>
                </div>
                <div className="transfer">
                    <h6>Variazione</h6>
                    <h6>deposito in Banca in %</h6>
                </div>
                <div className="money">
                    <h5>{((bankReal - bankRealPreYearSameMonth) / bankRealPreYearSameMonth) * 100} %</h5>
                </div>
            </div>

            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#329239' }}>
                        <BsCashCoin />
                    </div>
                    <div className="action">
                        <AiOutlineMore />
                    </div>
                </div>
                <div className="transfer">
                    <h6>Variazione</h6>
                    <h6>soldi fisici in %</h6>
                </div>
                <div className="money">
                    <h5>{((cashReal - cashRealPreYearSameMonth) / cashRealPreYearSameMonth) * 100} %</h5>
                </div>
            </div>

            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#329239' }}>
                        <BsCashCoin />
                    </div>
                    <div className="action">
                        <AiOutlineMore />
                    </div>
                </div>
                <div className="transfer">
                    <h6>Variazione</h6>
                    <h6>Servizi digitali in %</h6>
                </div>
                <div className="money">
                    <h5>{((digitalServicesReal - digitalServicesRealPreYearSameMonth) / digitalServicesRealPreYearSameMonth) * 100} %</h5>
                </div>
            </div>

            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#FF6600' }}>
                        <AiOutlineStock />
                    </div>
                    <div className="action">
                    <AiOutlineMore />
                    </div>
                </div>
                <div className="transfer">
                    <h6>Variazione </h6>
                    <h6>Stocks in %</h6>
                </div>
                <div className="money">
                    <h5>{((stocksReal - stocksRealPreYearSameMonth)/stocksRealPreYearSameMonth)*100} %</h5>
                </div>
            </div>

            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#FF6600' }}>
                        <AiOutlineStock />
                    </div>
                    <div className="action">
                    <AiOutlineMore />
                    </div>
                </div>
                <div className="transfer">
                    <h6>Variazione</h6>
                    <h6>ETF in %</h6>
                </div>
                <div className="money">
                    <h5>{((etfReal - etfRealPreYearSameMonth)/etfRealPreYearSameMonth)*100} %</h5>
                </div>
            </div>

            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#F7B510' }}>
                        <FaBitcoin />
                    </div>
                    <div className="action">
                        <AiOutlineMore />
                    </div>
                </div>
                <div className="transfer">
                    <h6>Variazione</h6>
                    <h6>Bitcoin in %</h6>
                </div>
                <div className="money">
                    <h5>{((bitcoinReal - bitcoinRealPreYearSameMonth) / bitcoinRealPreYearSameMonth) * 100 } %</h5>
                </div>
            </div>

            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#F7B510' }}>
                        <FaBitcoin />
                    </div>
                    <div className="action">
                        <AiOutlineMore />
                    </div>
                </div>
                <div className="transfer">
                    <h6>Variazione</h6>
                    <h6>Crypto in %</h6>
                </div>
                <div className="money">
                    <h5>{((cryptoReal - cryptoRealPreYearSameMonth) / cryptoRealPreYearSameMonth) * 100 } %</h5>
                </div>
            </div>
        </SectionAMonth>
    </div>
    )
}

export default BalancesStatsYear;
