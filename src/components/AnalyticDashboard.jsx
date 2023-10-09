import React, { useEffect, useState, useContext, PureComponent } from 'react';
import { PieChart, Pie, Sector, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BsBank } from "react-icons/bs";
import { FaBitcoin } from "react-icons/fa";
import { BsCashCoin } from "react-icons/bs";
import { AiOutlineStock } from "react-icons/ai";
import { MdOutlineAutoGraph } from "react-icons/md";
import { SiMoneygram } from "react-icons/si";
import { BsCoin } from "react-icons/bs";
import { UserContext } from '../contexts/UserContext';
import { primaryColor } from '../contexts/Themes';
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
    

    useEffect(() => {
        const fetchData = async () => {
          if (userData) {
            try {
                console.log(userData);
                console.log(userData.balances);
                
                // Set the state with the data from the database
                setStocksReal(userData ? userData.stocksReal : 0);
                setETFReal(userData ? userData.etfReal : 0);
                setBitcoinReal(userData ? userData.bitcoinReal : 0);
                setCryptoReal(userData ? userData.cryptoReal : 0);
                setBankReal(userData? userData.bankReal : 0);
                setCashReal(userData ? userData.cashReal : 0);
                setDigitalServicesReal(userData ? userData.digitalServicesReal : 0);
                setTotalReal(userData ? userData.totalReal : 0);
                setExpensesMonth(userData ? userData.expensesArray[0] : 0);
                setIncomesMonth(userData ? userData.incomesArray[0] : 0);
                setSavedMonth(userData ? (userData.incomesArray[0] - userData.incomesArray[0]) : 0);

                
                
                setIsLoading(false); // Imposta isLoading su false quando le operazioni sono state completate
            } catch (error) {
              console.error('Errore durante le operazioni:', error);
            }
          }
        };
    
    fetchData();
    }, [userData]);

    //commented to work in local on the dashboard
    // if (isLoading) {
    //     return <div>Caricamento...</div>; // Mostra un indicatore di caricamento durante il recupero dei dati
    // }

    const capitalData = [
        { name: 'Azioni', value: stocksReal >= 0 ? stocksReal : 0 },
        { name: 'ETF', value: etfReal >= 0 ? etfReal : 0 },
        { name: 'Banca', value: bankReal >= 0 ? bankReal : 0 },
        { name: 'Banconote', value: cashReal >= 0 ? cashReal : 0 },
        { name: 'Criptovalute', value: cryptoReal >= 0 ? cryptoReal : 0 },
        { name: 'Bitcoin', value: bitcoinReal >= 0 ? bitcoinReal : 0 },
        { name: 'ServiziDigitali', value: digitalServicesReal >= 0 ? digitalServicesReal : 0 },
    ];

    const incExpData = [
        { name: 'Entrate', value: incomesMonth >= 0 ? incomesMonth : 0 },
        { name: 'Spese', value: expensesMonth >= 0 ? expensesMonth : 0 },
        { name: 'Risparmiato', value: savedMonth >= 0 ? savedMonth : 0 },
    ];

    console.log(capitalData);
    console.log(incExpData);

    //used for render the label in the pie chart as a percentage inside the pie
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        const labelValue = `${(percent * 100).toFixed(0)}%`;
    
        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                {labelValue}
            </text>
        );
    };
      
    return (
        
        <SectionADashboard theme={theme}>
            <CapitalValue theme={theme}>
                Il tuo patrimonio totale è:{" "}
                <span style={{ color: primaryColor }}>
                    {totalReal.toLocaleString('it-IT')}€
                </span>
            </CapitalValue>
            <UpperSection theme={theme}>
                <div className="analytic ">
                    <div className="design">
                        <div className="logo" style={{ color: '#0D579B'}}>
                            <BsBank />
                        </div>
                        {/* <div className="action">
                        <AiOutlineMore />
                        </div> */}
                    </div>
                    <div className="transfer">
                        <h6>Depositati</h6>
                        <h6>in Banca</h6>
                    </div>
                    <div className="money">
                        <h5>{bankReal.toLocaleString('it-IT')}€</h5>
                    </div>
                </div>

                <div className="analytic ">
                    <div className="design">
                        <div className="logo" style={{ color: '#329239' }}>
                            <BsCashCoin />
                        </div>
                        {/* <div className="action">
                            <AiOutlineMore />
                        </div> */}
                    </div>
                    <div className="transfer">
                        <h6>Contante</h6>
                        <h6>e monete</h6>
                    </div>
                    <div className="money">
                        <h5>{cashReal.toLocaleString('it-IT')}€</h5>
                    </div>
                </div>

                <div className="analytic ">
                    <div className="design">
                        <div className="logo" style={{ color: '#74b9ff' }}>
                            <SiMoneygram />
                        </div>
                        {/* <div className="action">
                            <AiOutlineMore />
                        </div> */}
                    </div>
                    <div className="transfer">
                        <h6>Servizi</h6>
                        <h6>Pagamenti digitali</h6>
                    </div>
                    <div className="money">
                        <h5>{digitalServicesReal.toLocaleString('it-IT')}€</h5>
                    </div>
                </div>

            </UpperSection>
            <LowerSection theme={theme}>
                <div className="analytic ">
                    <div className="design">
                        <div className="logo" style={{ color: '#FF6600' }}>
                            <MdOutlineAutoGraph />
                        </div>
                        {/* <div className="action">
                        <AiOutlineMore />
                        </div> */}
                    </div>
                    <div className="transfer">
                        <h6>Investiti</h6>
                        <h6>in Azioni</h6>
                    </div>
                    <div className="money">
                        <h5>{stocksReal.toLocaleString('it-IT')}€</h5>
                    </div>
                </div>

                <div className="analytic ">
                    <div className="design">
                        <div className="logo" style={{ color: '#a29bfe' }}>
                            <AiOutlineStock />
                        </div>
                        {/* <div className="action">
                        <AiOutlineMore />
                        </div> */}
                    </div>
                    <div className="transfer">
                        <h6>Investiti</h6>
                        <h6>in ETF</h6>
                    </div>
                    <div className="money">
                        <h5>{etfReal.toLocaleString('it-IT')}€</h5>
                    </div>
                </div>
                
                <div className="analytic ">
                    <div className="design">
                        <div className="logo" style={{ color: '#F7B510' }}>
                            <FaBitcoin />
                        </div>
                        {/* <div className="action">
                            <AiOutlineMore />
                        </div> */}
                    </div>
                    <div className="transfer">
                        <h6>Investiti</h6>
                        <h6>in Bitcoin</h6>
                    </div>
                    <div className="money">
                        <h5>{bitcoinReal.toLocaleString('it-IT')}€</h5>
                    </div>
                </div>
                {/* <div className="analytic ">
                <div className="design">
                    <div className="logo" style={{ color: '#F7B510' }}>
                        <FaBitcoin />
                    </div>
                </div>
                <div className="transfer">
                    <h6>Variazione</h6>
                    <h6>Bitcoin in %</h6>
                </div>             */}
                <div className="analytic ">
                    <div className="design">
                        <div className="logo" style={{ color: '#d63031' }}>
                            <BsCoin />
                        </div>
                        {/* <div className="action">
                            <AiOutlineMore />
                        </div> */}
                    </div>
                    <div className="transfer">
                        <h6>Investiti</h6>
                        <h6>in Criptovalute</h6>
                    </div>
                    <div className="money">
                        <h5>{cryptoReal.toLocaleString('it-IT')}€</h5>
                    </div>
                </div>
            </LowerSection> 
            <GraphsSection theme={theme}>
            
                <div className="bar-chart-section">
                    <h2>Distribuzione capitale</h2>
                    <div style={{ width: 400, height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart width={500} height={300} data={capitalData} margin={{
                                        top: 20,
                                        right: 15,
                                    }}>
                                <Bar dataKey="value">
                                    {capitalData.map(entry => (
                                        <Cell key={entry.name} fill={colorsBalances[entry.name]} />
                                    ))}
                                </Bar>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.3)" />
                                <XAxis dataKey="name" interval={0} angle={45} textAnchor="start" tick={{ fill: 'white' }} />
                                <YAxis tick={{ fill: 'white' }} />
                                <Tooltip
                                    content={({ payload, label, active }) => {
                                        if (active) {
                                            const data = payload[0].payload; // Dati relativi all'elemento selezionato

                                            // Formatta il valore con migliaia e simbolo dell'euro
                                            const formattedValue = new Intl.NumberFormat('it-IT', {
                                                style: 'currency',
                                                currency: 'EUR',
                                                maximumFractionDigits: 0,
                                            }).format(data.value);

                                            return (
                                                <div style={{ backgroundColor: '#fff', color: '#079164', borderRadius: '4px', padding: '8px' }}>
                                                    <p>{label}</p>
                                                    <p style={{ color: 'black' }}>{formattedValue}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                {/* <Tooltip contentStyle={{ backgroundColor: '#fff', color: '#079164', borderRadius: '4px', padding: '8px' }} /> */}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                </div>

                <div className="pie-chart-section">
                    <h2>% Distribuzione Capitale</h2>
                    <div style={{ width: 400, height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart width={500} height={500} margin={{
                                top: 20,
                                left: 60,
                            }}>
                                <Pie
                                    data={capitalData}
                                    cx="35%"
                                    cy="35%"
                                    label={renderCustomizedLabel}
                                    labelLine={false}
                                    outerRadius={130}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {capitalData.map(entry => (
                                        <Cell key={entry.name} fill={colorsBalances[entry.name]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', color: '#079164', borderRadius: '4px', padding: '8px' }}
                                    labelStyle={{ color: '#079164', fontWeight: 'bold' }}
                                    formatter={(value, name, entry) => {
                                        const total = capitalData.reduce((acc, entry) => acc + entry.value, 0);
                                        const percentage = (entry.value / total) * 100;

                                        // Formatta il valore con migliaia e simbolo dell'euro
                                        const formattedValue = new Intl.NumberFormat('it-IT', {
                                            style: 'currency',
                                            currency: 'EUR',
                                            maximumFractionDigits: 0,
                                        }).format(value);

                                        return [`${name}: ${formattedValue} (${percentage.toFixed(0)}%)`];
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bar-chart-section">
                    <h2>Entrate | Spese</h2>
                    <div style={{ width: 350, height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                                <BarChart width={500} height={300} data={incExpData} margin={{
                                            top: 20,
                                            right: 15,
                                        }}>
                                    <Bar dataKey="value">
                                        {incExpData.map(entry => (
                                            <Cell key={entry.name} fill={colorsIncExp[entry.name]} />
                                        ))}
                                    </Bar>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.3)" />
                                    <XAxis dataKey="name" interval={0} angle={45} textAnchor="start" tick={{ fill: 'white' }} />
                                    <YAxis tick={{ fill: 'white' }} />

                                    <Tooltip
                                        content={({ payload, label, active }) => {
                                            if (active) {
                                                const data = payload[0].payload; // Dati relativi all'elemento selezionato

                                                // Formatta il valore con migliaia e simbolo dell'euro
                                                const formattedValue = new Intl.NumberFormat('it-IT', {
                                                    style: 'currency',
                                                    currency: 'EUR',
                                                    maximumFractionDigits: 0,
                                                }).format(data.value);

                                                return (
                                                    <div className="custom-tooltip" style={{ backgroundColor: '#fff', color: '#079164', borderRadius: '4px', padding: '8px' }}>
                                                        <p>{label}</p>
                                                        <p style={{ color: 'black' }}>{formattedValue}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                        contentStyle={{ backgroundColor: '#fff', color: '#079164', borderRadius: '4px', padding: '8px' }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                    </div>      
                </div>

            </GraphsSection>
        </SectionADashboard>

        
    )
}

export default AnalyticDashboard;
