import React, { useEffect, useState, useContext } from 'react'
import { UserContext } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
//import { BsCreditCard } from "react-icons/bs";
import { AiOutlineMore } from "react-icons/ai";
//import { BiTransfer } from "react-icons/bi";
import { BsBank } from "react-icons/bs";
//import { GiTakeMyMoney } from "react-icons/gi";
import { FaBitcoin } from "react-icons/fa";
import { BsCashCoin } from "react-icons/bs";
import { SiMoneygram } from "react-icons/si";
import { MdOutlineAutoGraph } from "react-icons/md";
import { BsCoin } from "react-icons/bs";
import { AiOutlineStock } from "react-icons/ai";
import { PieChart, Pie, Cell } from "recharts";
import {SectionAMonth, TitleDashboard, WrapperAMonth}from '../contexts/MyStyled';
import { primaryColor } from '../contexts/Themes';
import axios from 'axios';





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

export default function BalancesStatsMonth() {
    const { theme } = useContext(ThemeContext);
    const { userData } = useContext(UserContext);
    const [stocksReal, setStocksReal] = useState(0);
    const [etfReal, setETFReal] = useState(0);
    const [bankReal, setBankReal] = useState(0);
    const [cashReal, setCashReal] = useState(0);
    const [cryptoReal, setCryptoReal] = useState(0);
    const [bitcoinReal, setBitcoinReal] = useState(0);
    const [digitalServicesReal, setDigitalServicesReal] = useState(0);
    const [totalReal, setTotalReal] = useState(0);
    const [stocksRealPreMonth, setStocksRealPreMonth] = useState(0);
    const [etfRealPreMonth, setEtfRealPreMonth] = useState(0);
    const [bankRealPreMonth, setBankRealPreMonth] = useState(0);
    const [cashRealPreMonth, setCashRealPreMonth] = useState(0);
    const [cryptoRealPreMonth, setCryptoRealPreMonth] = useState(0);
    const [bitcoinRealPreMonth, setBitcoinRealPreMonth] = useState(0);
    const [digitalServicesRealPreMonth, setDigitalServicesRealPreMonth] = useState(0);
    const [totalRealPreMonth, setTotalRealPreMonth] = useState(0);
    

    useEffect(() => {
        const fetchData = async () => {
          if (userData) {
            try {
                console.log(userData);
                console.log(userData.balances);
                console.log(userData.expenses);
                
                //CURRENT MONTH
                setStocksReal(userData ? userData.stocksReal : 0);
                setETFReal(userData ? userData.etfReal : 0);
                setBitcoinReal(userData ? userData.bitcoinReal : 0);
                setCryptoReal(userData ? userData.cryptoReal : 0);
                setBankReal(userData? userData.bankReal : 0);
                setCashReal(userData ? userData.cashReal : 0);
                setDigitalServicesReal(userData ? userData.digitalServicesReal : 0);
                setTotalReal(userData ? userData.totalReal : 0);

                //PREVIOUS MONTH
                setStocksRealPreMonth(userData ? userData.stocksRealPreMonth : 0);
                setEtfRealPreMonth(userData ? userData.etfRealPreMonth : 0);
                setBitcoinRealPreMonth(userData ? userData.bitcoinRealPreMonth : 0);
                setCryptoRealPreMonth(userData ? userData.cryptoRealPreMonth : 0);
                setBankRealPreMonth(userData? userData.bankRealPreMonth : 0);
                setCashRealPreMonth(userData ? userData.cashRealPreMonth : 0);
                setDigitalServicesRealPreMonth(userData ? userData.digitalServicesRealPreMonth : 0);
                setTotalRealPreMonth(userData ? userData.totalRealPreMonth : 0);
                
        
            } catch (error) {
              console.error('Errore durante le operazioni:', error);
            }
          }
        };
    
    fetchData();
    }, [userData]);

    const data = [
        { name: "Stocks", value: stocksReal },
        { name: "Bank", value: bankReal },
        { name: "Cash", value: cashReal },
        { name: "Crypto", value: cryptoReal }
    ];

    
      
    return (
        
        <div className="wrapper">
        <TitleDashboard theme={theme}>
            Il tuo patrimonio è variato del:{" "}
            <span style={{ color: (((totalReal - totalRealPreMonth) / totalRealPreMonth) * 100) > 0 ? primaryColor : "inherit" }}>
                {(((totalReal - totalRealPreMonth) / totalRealPreMonth) * 100).toFixed(2)} %
            </span>
        </TitleDashboard>
        <SectionAMonth theme={theme}>
            
            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#0D579B'}}>
                        <BsBank />
                    </div>
                </div>
                <div className="transfer">
                    <h6>Variazione</h6>
                    <h6>deposito in Banca in %</h6>
                </div>
                <div className="money">
                    <h5>
                        {bankRealPreMonth === 0
                        ? 'N.A.' 
                        :isNaN((((bankReal - bankRealPreMonth) / bankRealPreMonth) * 100).toFixed(2))
                            ? 'N.A.'
                            : `${(((bankReal - bankRealPreMonth) / bankRealPreMonth) * 100).toFixed(2)} %`}
                    </h5>
                </div>
            </div>

            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#329239' }}>
                        <BsCashCoin />
                    </div>
                </div>
                <div className="transfer">
                    <h6>Variazione</h6>
                    <h6>soldi fisici in %</h6>
                </div>
                <div className="money">
                    <h5>
                        {cashRealPreMonth === 0
                        ? 'N.A.' 
                        :isNaN((((cashReal - cashRealPreMonth) / cashRealPreMonth) * 100).toFixed(2))
                            ? 'N.A.'
                            : `${(((cashReal - cashRealPreMonth) / cashRealPreMonth) * 100).toFixed(2)} %`}
                    </h5>
                </div>
            </div>

            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#74b9ff' }}>
                        <SiMoneygram />
                    </div>
                </div>
                <div className="transfer">
                    <h6>Variazione</h6>
                    <h6>Servizi digitali in %</h6>
                </div>
                <div className="money">
                    <h5>
                        {digitalServicesRealPreMonth === 0
                        ? 'N.A.' 
                        :isNaN((((digitalServicesReal - digitalServicesRealPreMonth) / digitalServicesRealPreMonth) * 100).toFixed(2))
                            ? 'N.A.'
                            : `${(((digitalServicesReal - digitalServicesRealPreMonth) / digitalServicesRealPreMonth) * 100).toFixed(2)} %`}
                    </h5>
                </div>
            </div>

            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#FF6600' }}>
                        <MdOutlineAutoGraph />
                    </div>
                </div>
                <div className="transfer">
                    <h6>Variazione </h6>
                    <h6>Stocks in %</h6>
                </div>
                <div className="money">
                    <h5>
                        {stocksRealPreMonth === 0
                        ? 'N.A.' 
                        :isNaN((((stocksReal - stocksRealPreMonth) / stocksRealPreMonth) * 100).toFixed(2))
                            ? 'N.A.'
                            : `${(((stocksReal - stocksRealPreMonth) / stocksRealPreMonth) * 100).toFixed(2)} %`}
                    </h5>

                </div>
            </div>

            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#a29bfe' }}>
                        <AiOutlineStock />
                    </div>
                </div>
                <div className="transfer">
                    <h6>Variazione</h6>
                    <h6>ETF in %</h6>
                </div>
                <div className="money">
                    <h5>
                        {etfRealPreMonth === 0
                        ? 'N.A.' 
                        :isNaN((((etfReal - etfRealPreMonth) / etfRealPreMonth) * 100).toFixed(2))
                            ? 'N.A.'
                            : `${(((etfReal - etfRealPreMonth) / etfRealPreMonth) * 100).toFixed(2)} %`}
                    </h5>
                </div>
            </div>

            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#F7B510' }}>
                        <FaBitcoin />
                    </div>
                </div>
                <div className="transfer">
                    <h6>Variazione</h6>
                    <h6>Bitcoin in %</h6>
                </div>
                <div className="money">
                    <h5>
                        {bitcoinRealPreMonth === 0
                        ? 'N.A.' 
                        :isNaN((((bitcoinReal - bitcoinRealPreMonth) / bitcoinRealPreMonth) * 100).toFixed(2))
                            ? 'N.A.'
                            : `${(((bitcoinReal - bitcoinRealPreMonth) / bitcoinRealPreMonth) * 100).toFixed(2)} %`}
                    </h5>
                </div>
            </div>

            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#d63031' }}>
                        <BsCoin />
                    </div>
                </div>
                <div className="transfer">
                    <h6>Variazione</h6>
                    <h6>Crypto in %</h6>
                </div>
                <div className="money">
                    <h5>
                        {cryptoRealPreMonth === 0
                        ? 'N.A.' 
                        :isNaN((((cryptoReal - cryptoRealPreMonth) / cryptoRealPreMonth) * 100).toFixed(2))
                            ? 'N.A.'
                            : `${(((cryptoReal - cryptoRealPreMonth) / cryptoRealPreMonth) * 100).toFixed(2)} %`}
                    </h5>
                </div>
            </div>
        </SectionAMonth>
    </div>
    )
}
