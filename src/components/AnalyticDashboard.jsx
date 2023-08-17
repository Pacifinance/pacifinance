import React, { useEffect, useState, useContext, PureComponent } from 'react';
import { PieChart, Pie, Sector, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
//import { BsCreditCard } from "react-icons/bs";
import { AiOutlineMore } from "react-icons/ai";
//import { BiTransfer } from "react-icons/bi";
import { BsBank } from "react-icons/bs";
//import { GiTakeMyMoney } from "react-icons/gi";
import { FaBitcoin } from "react-icons/fa";
import { BsCashCoin } from "react-icons/bs";
import { AiOutlineStock } from "react-icons/ai";
import { MdOutlineAutoGraph } from "react-icons/md";
import { SiMoneygram } from "react-icons/si";
import { BsCoin } from "react-icons/bs";
import { UserContext } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { colorsBalances, colorsIncExp } from '../contexts/Themes';
import {
        SectionADashboard,
        CapitalValue,
        UpperSection,
        LowerSection,
        GraphsSection,
  } from '../contexts/MyStyled';

function AnalyticDashboard() {
    const { theme } = useContext(ThemeContext);
    const { userData } = useContext(UserContext);
    const [isLoading, setIsLoading] = useState(true);
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
    // const {
    //     SectionADashboard,
    //     CapitalValue,
    //     UpperSection,
    //     LowerSection,
    //     GraphsSection,
    //   } = MyStyled()
    

    useEffect(() => {
        const fetchData = async () => {
          if (userData) {
            try {
                console.log(userData);
                console.log(userData.balances);
                console.log(userData.expensesIncomes);
                
                // Set the state with the data from the database
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

                
                
                setIsLoading(false); // Imposta isLoading su false quando le operazioni sono state completate
            } catch (error) {
              console.error('Errore durante le operazioni:', error);
            }
          }
        };
    
    fetchData();
    }, [userData]);

    // useEffect(() => {
    //     const calculateTotalReal = () => {
    //         const total = stocksReal + etfReal + bitcoinReal + cryptoReal + bankReal + cashReal + digitalServicesReal;
    //         setTotalReal(formatNumber(total));
    //       };
      
    //     calculateTotalReal();
    // }, [stocksReal, etfReal, bitcoinReal, cryptoReal, bankReal, cashReal, digitalServicesReal]);

    if (isLoading) {
        return <div>Loading...</div>; // Mostra un indicatore di caricamento durante il recupero dei dati
    }

    const capitalData = {
        Azioni: stocksReal >= 0 ? stocksReal : 0,
        ETF: etfReal >= 0 ? etfReal : 0,
        Banca: bankReal >= 0 ? bankReal : 0,
        Banconote: cashReal >= 0 ? cashReal : 0,
        Criptovalute: cryptoReal >= 0 ? cryptoReal : 0,
        Bitcoin: bitcoinReal >= 0 ? bitcoinReal : 0,
        ServiziDigitali: digitalServicesReal >= 0 ? digitalServicesReal : 0,
    }

    //Creare le variabili colori in MyStyled e importarle qui 
    

    const incExpData = {
        Entrate: incomesMonth >= 0 ? incomesMonth : 0,
        Spese: expensesMonth >= 0 ? expensesMonth : 0,
        Risparmiato: savedMonth >= 0 ? savedMonth : 0,
    }

    

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
    };
      
    return (
        
        <SectionADashboard theme={theme}>
            <CapitalValue theme={theme}>Il tuo patrimonio totale è: {totalReal}€</CapitalValue>
            <UpperSection theme={theme}>
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
                        <h6>Depositati</h6>
                        <h6>in Banca</h6>
                    </div>
                    <div className="money">
                        <h5>{bankReal}€</h5>
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
                        <h6>Contante</h6>
                        <h6>e monete</h6>
                    </div>
                    <div className="money">
                        <h5>{cashReal}€</h5>
                    </div>
                </div>

                <div className="analytic ">
                    <div className="design">
                        <div className="logo" style={{ color: '#74b9ff' }}>
                            <SiMoneygram />
                        </div>
                        <div className="action">
                            <AiOutlineMore />
                        </div>
                    </div>
                    <div className="transfer">
                        <h6>Servizi</h6>
                        <h6>Pagamenti digitali</h6>
                    </div>
                    <div className="money">
                        <h5>{digitalServicesReal}€</h5>
                    </div>
                </div>

            </UpperSection>
            <LowerSection theme={theme}>
                <div className="analytic ">
                    <div className="design">
                        <div className="logo" style={{ color: '#FF6600' }}>
                            <MdOutlineAutoGraph />
                        </div>
                        <div className="action">
                        <AiOutlineMore />
                        </div>
                    </div>
                    <div className="transfer">
                        <h6>Investiti</h6>
                        <h6>in Azioni</h6>
                    </div>
                    <div className="money">
                        <h5>{stocksReal}€</h5>
                    </div>
                </div>

                <div className="analytic ">
                    <div className="design">
                        <div className="logo" style={{ color: '#a29bfe' }}>
                            <AiOutlineStock />
                        </div>
                        <div className="action">
                        <AiOutlineMore />
                        </div>
                    </div>
                    <div className="transfer">
                        <h6>Investiti</h6>
                        <h6>in ETF</h6>
                    </div>
                    <div className="money">
                        <h5>{etfReal}€</h5>
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
                        <h6>Investiti</h6>
                        <h6>in Bitcoin</h6>
                    </div>
                    <div className="money">
                        <h5>{bitcoinReal}€</h5>
                    </div>
                </div>

                <div className="analytic ">
                    <div className="design">
                        <div className="logo" style={{ color: '#d63031' }}>
                            <BsCoin />
                        </div>
                        <div className="action">
                            <AiOutlineMore />
                        </div>
                    </div>
                    <div className="transfer">
                        <h6>Investiti</h6>
                        <h6>in Criptovalute</h6>
                    </div>
                    <div className="money">
                        <h5>{cryptoReal}€</h5>
                    </div>
                </div>
            </LowerSection> 
            <GraphsSection theme={theme}>
            
                <div className="bar-chart-section">
                    <h2>Distribuzione capitale</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="300">
                            <BarChart
                                width={500}
                                height={300}
                                data={capitalData}
                                margin={{
                                    top: 20,
                                    right: 15,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Azioni" fill = {colorsBalances.Azioni}  />
                            <Bar dataKey="ETF" fill = {colorsBalances.ETF} />
                            <Bar dataKey="Bitcoin" fill = {colorsBalances.Bitcoin} />
                            <Bar dataKey="Criptovalute" fill = {colorsBalances.Criptovalute} />
                            <Bar dataKey="Contante" fill = {colorsBalances.Contante} />
                            <Bar dataKey="Servizi Digitali" fill = {colorsBalances.ServiziDigitali} />
                            <Bar dataKey="Banca" fill = {colorsBalances.Banca} />
                            

                            
                            
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                </div>

                <div className="pie-chart-section">
                    <h2>% Distribuzione Capitale</h2>
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart width={500} height={500}>
                            <Pie
                                data={capitalData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomizedLabel}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                
                            <Cell datakey="Azioni" fill={colorsBalances.Azioni} />
                            <Cell datakey="ETF" fill={colorsBalances.ETF} />
                            <Cell datakey="Bitcoin" fill={colorsBalances.Bitcoin} />
                            <Cell datakey="Criptovalute" fill={colorsBalances.Criptovalute} />
                            <Cell datakey="Contante" fill={colorsBalances.Contante} />
                            <Cell datakey="Servizi Digitali" fill={colorsBalances.ServiziDigitali} />
                            <Cell datakey="Banca" fill={colorsBalances.Banca} />
                                
                            </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                </div>

                <div className="bar-chart-section">
                    <h2>Entrate | Spese</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                width={500}
                                height={300}
                                data={incExpData}
                                margin={{
                                    top: 20,
                                    right: 15,
                                    left: 5,
                                    bottom: 5,
                                }}
                            >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Entrate" fill = {colorsIncExp.Entrate}  />
                            <Bar dataKey="Uscite" fill = {colorsIncExp.Uscite}  />
                            <Bar dataKey="Risparmiato" fill = {colorsIncExp.Risparmiato}  />
                            </BarChart>
                        </ResponsiveContainer>    
                    </div>      
                </div>

            </GraphsSection>
        </SectionADashboard>

        
    )
}

export default AnalyticDashboard;
