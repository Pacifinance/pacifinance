import React, { useEffect, useState, useContext } from 'react';
import { BsBank } from "react-icons/bs";
import { FaBitcoin } from "react-icons/fa";
import { BsCashCoin } from "react-icons/bs";
import { SiHtml5, SiMoneygram } from "react-icons/si";
import { MdOutlineAutoGraph } from "react-icons/md";
import { BsCoin } from "react-icons/bs";
import { AiOutlineStock } from "react-icons/ai";
import {SecondaryTitle, SectionAMonth, TitleStatsCharts}from '../styles/MyStyled';
import { primaryColor, secondaryColor } from '../styles/Themes';
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

export default function BalancesStatsMonth({theme, userData, isHidden}) {
    const { language } = useContext(LanguageContext);
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

    const formattedPreMonthDate = userData?.preMonthDate
      ? new Date(userData.preMonthDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' })
      : "";
    

    useEffect(() => {
        const fetchData = async () => {
          if (userData) {
            try {
                
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
        // Il tuo patrimonio rispetto ad un anno fa è variato di:{" "}
        //     <span style={{ color: (((totalReal - totalRealPreYearSameMonth) / totalRealPreYearSameMonth) * 100) > 0 ? primaryColor : "inherit" }}>
        //         {isHidden ? '****' : calculateDifference(totalReal, totalRealPreYearSameMonth)} {(isHidden ? '****' : calculatePercentageChange(totalReal, totalRealPreYearSameMonth))}
        //     </span>
        //     {" - "}({formattedPreYearSameMonthDate})
        <div className="wrapper">
        <SecondaryTitle theme={theme}>
            {languages[language].graphs.statsBalance.titleDetailsMonth}{" "} 
            <span style={{ color: (((totalReal - totalRealPreMonth) / totalRealPreMonth) * 100) > 0 ? primaryColor : "inherit" }}>
                {isHidden ? '****' : calculateDifference(totalReal, totalRealPreMonth)} {isHidden ? '****' : calculatePercentageChange(totalReal, totalRealPreMonth)}
            </span>
            {" - "}({formattedPreMonthDate})
        </SecondaryTitle>
        <SectionAMonth theme={theme}>
            
            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#0D579B'}}>
                        <BsBank/>
                    </div>
                </div>
                <div className="transfer">
                    <h2>{languages[language].graphs.statsBalance.variation}</h2>
                    <h6>{languages[language].assets.bank}</h6>
                </div>
                <div className="money">
                    <h5 style={{ color: secondaryColor}}>
                        {isHidden ? '****' : calculateDifference(bankReal, bankRealPreMonth)}
                    </h5>
                    <h6 style={{ color: secondaryColor}} className="text-s">
                        {isHidden ? '****' : calculatePercentageChange(bankReal, bankRealPreMonth)}
                    </h6>
                </div>
            </div>

            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#329239' }}>
                        <BsCashCoin />
                    </div>
                </div>
                <div className="transfer">
                    <h6>{languages[language].graphs.statsBalance.variation}</h6>
                    <h6>{languages[language].assets.cash}</h6>
                </div>
                <div className="money">
                    <h5>
                        {isHidden ? '****' : calculateDifference(cashReal, cashRealPreMonth)}
                    </h5>
                    <h6 className="text-s">
                        {isHidden ? '****' : calculatePercentageChange(cashReal, cashRealPreMonth)}
                    </h6>
                </div>
            </div>

            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#74b9ff' }}>
                        <SiMoneygram />
                    </div>
                </div>
                <div className="transfer">
                    <h6 className="text-xs">{languages[language].graphs.statsBalance.variation}</h6>
                    <h6 className="text-xs">{languages[language].assets.digitalServices}</h6>
                </div>
                <div className="money">
                    <h5>
                        {isHidden ? '****' : calculateDifference(digitalServicesReal, digitalServicesRealPreMonth)}
                    </h5>
                    <h6 className="text-s">
                        {isHidden ? '****' : calculatePercentageChange(digitalServicesReal, digitalServicesRealPreMonth)}
                    </h6>
                </div>
            </div>

            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#FF6600' }}>
                        <MdOutlineAutoGraph />
                    </div>
                </div>
                <div className="transfer">
                    <h6>{languages[language].graphs.statsBalance.variation}</h6>
                    <h6>{languages[language].assets.stocks}</h6>
                </div>
                <div className="money">
                    <h5>
                        {isHidden ? '****' : calculateDifference(stocksReal, stocksRealPreMonth)}
                    </h5>
                    <h6 className="text-s">
                        {isHidden ? '****' : calculatePercentageChange(stocksReal, stocksRealPreMonth)}
                    </h6>

                </div>
            </div>

            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#a29bfe' }}>
                        <AiOutlineStock />
                    </div>
                </div>
                <div className="transfer">
                    <h6>{languages[language].graphs.statsBalance.variation}</h6>
                    <h6>{languages[language].assets.etf}</h6>
                </div>
                <div className="money">
                    <h5>
                        {isHidden ? '****' : calculateDifference(etfReal, etfRealPreMonth)}
                    </h5>
                    <h6 className="text-s">
                        {isHidden ? '****' : calculatePercentageChange(etfReal, etfRealPreMonth)}
                    </h6>
                </div>
            </div>

            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#F7B510' }}>
                        <FaBitcoin />
                    </div>
                </div>
                <div className="transfer">
                    <h6>{languages[language].graphs.statsBalance.variation}</h6>
                    <h6>{languages[language].assets.bitcoin}</h6>
                </div>
                <div className="money">
                    <h5>
                        {isHidden ? '****' : calculateDifference(bitcoinReal, bitcoinRealPreMonth)}
                    </h5>
                    <h6 className="text-s">
                        {isHidden ? '****' : calculatePercentageChange(bitcoinReal, bitcoinRealPreMonth)}
                    </h6>
                </div>
            </div>

            <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#d63031' }}>
                        <BsCoin />
                    </div>
                </div>
                <div className="transfer">
                    <h6>{languages[language].graphs.statsBalance.variation}</h6>
                    <h6>{languages[language].assets.crypto}</h6>
                </div>
                <div className="money">
                    <h5>
                        {isHidden ? '****' : calculateDifference(cryptoReal, cryptoRealPreMonth)}
                    </h5>
                    <h6 className="text-s">
                        {isHidden ? '****' : calculatePercentageChange(cryptoReal, cryptoRealPreMonth)}
                    </h6>
                </div>
            </div>
        </SectionAMonth>
    </div>
    )
}
