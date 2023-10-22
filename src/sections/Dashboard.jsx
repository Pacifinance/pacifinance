import React, { useEffect, useState, useContext, PureComponent } from 'react';
import { PieChart, Pie, Sector, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BsBank } from "react-icons/bs";
import { FaBitcoin } from "react-icons/fa";
import { BsCashCoin } from "react-icons/bs";
import { AiOutlineStock } from "react-icons/ai";
import { MdOutlineAutoGraph } from "react-icons/md";
import { SiMoneygram } from "react-icons/si";
import { BsCoin } from "react-icons/bs";
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { UserContext } from '../contexts/UserContext';
import { primaryColor } from '../contexts/Themes';
import { ThemeContext } from '../contexts/ThemeContext';
import { colorsBalances, colorsIncExp } from '../contexts/Themes';
import {
        TitleDashboard,
        SectionDashboard,
        SectionADashboard,
        CapitalValue,
        UpperSection,
        LowerSection,
        GraphsSection,
  } from '../contexts/MyStyled';

function Dashboard() {
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

    const totalCapitalData = capitalData.reduce((acc, entry) => acc + entry.value, 0);

    // const fakeCapitalData = [
    //     { name: 'Azioni', value: 1000 },
    //     { name: 'ETF', value: 1000 },
    //     { name: 'Banca', value: 0 },
    //     { name: 'Banconote', value: 1000 },
    //     { name: 'Criptovalute', value: 1000 },
    //     { name: 'Bitcoin', value:1000 },
    //     { name: 'ServiziDigitali', value: 1000 },
    // ];

    // const totalFakeCapitalData = fakeCapitalData.reduce((acc, entry) => acc + entry.value, 0);

    const incExpData = [
        { name: 'Entrate', value: incomesMonth >= 0 ? incomesMonth : 0 },
        { name: 'Spese', value: expensesMonth >= 0 ? expensesMonth : 0 },
        { name: 'Risparmiato', value: savedMonth >= 0 ? savedMonth : 0 },
    ];

    //used for render the label in the pie chart as a percentage inside the pie
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        const labelValue = `${(percent * 100).toFixed(0)}%`;
        
        //if is 0 don't render the label
        if (percent !== 0) {
            return (
                <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                    {labelValue}
                </text>
            );
        } else {
            return null; //don't render the label
        }
    };

    const isAllZero = capitalData.every(entry => entry.value === 0); //fakeCapitalData to test some change on the pie chart (main data is capitalData)

    
    return (
        <SectionDashboard theme={theme}>
            <TitleDashboard theme={theme}>Dashboard</TitleDashboard>
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
                                <XAxis dataKey="name" interval={0} angle={15} textAnchor="middle" tick={{ fill: 'white', fontSize: 12 }} />
                                <YAxis tick={{ fill: 'white' }} />
                                <Tooltip
                                    content={({ payload, label, active }) => {
                                        if (active) {
                                            const value = payload[0].payload.value; // Dati relativi all'elemento selezionato

                                            // Formatta il valore con migliaia e simbolo dell'euro
                                            const formattedValue = new Intl.NumberFormat('it-IT', {
                                                style: 'currency',
                                                currency: 'EUR',
                                                maximumFractionDigits: 0,
                                            }).format(value);

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
                    
                    <div style={{ width: 400, height: 400 }}>
                        <h2>% Distribuzione Capitale</h2>
                        <ResponsiveContainer width="100%" height="100%">
                        {isAllZero ? (
                            <div style={{
                                // display: 'flex',
                                justifyContent: 'center',
                                marginTop: '5em',
                                alignItems: 'center',
                                width: '80%',
                                height: '100%',
                                backgroundColor: 'transparent', // Imposta il colore di sfondo trasparente
                                fontSize: '18px', // Imposta la dimensione del carattere desiderata
                            }}>
                                <h1 style={{color: '#079164'}}>Assenza di dati:</h1> <p>Inserire i valori nella pagina <br></br>con la seguente icona: <HiOutlinePencilAlt style={{ fontSize: '30px' }} /></p>
                            </div>
                        ) : (
                                <PieChart width={500} height={500} margin={{
                                    top: 20,
                                    left: 60,
                                }}>
                                    <Pie
                                        data={capitalData}  //fakeCapitalData to test some change on the pie chart (main data is capitalData)
                                        cx="25%"
                                        cy="35%"
                                        label={renderCustomizedLabel}
                                        labelLine={false}
                                        outerRadius={130}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {capitalData.map(entry => {   //fakeCapitalData to test some change on the pie chart (main data is capitalData)
                                            if(entry.value === 0) {
                                                return <Cell key={entry.name} fill="transparent" />;
                                            }
                                            return <Cell key={entry.name} fill={colorsBalances[entry.name]} />
                                        })}
                                    </Pie>
                                    <Tooltip
                                        content={({ payload, active }) => {
                                            if (active) {
                                                const data = payload[0].payload;
                                                const value = data.value; // Datas relative to the selected element
                                                const percentage = (value / totalCapitalData) * 100;

                                                // Format the value with thousands and euro symbol
                                                const formattedValue = new Intl.NumberFormat('it-IT', {
                                                    style: 'currency',
                                                    currency: 'EUR',
                                                    maximumFractionDigits: 0,
                                                }).format(value);

                                                return (
                                                    <div className="custom-tooltip" style={{ backgroundColor: '#fff', color: '#079164', borderRadius: '4px', padding: '8px' }}>
                                                        <p>{data.name}</p>
                                                        <p style={{ color: 'black' }}>{formattedValue}({percentage.toFixed(0)}%)</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                        contentStyle={{ backgroundColor: '#fff', color: '#079164', borderRadius: '4px', padding: '8px' }}
                                    />
                                </PieChart>
                            )}
                            
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bar-chart-section">
                    <h2>Entrate | Spese</h2>
                    <div style={{ width: 350, height: 300 }}> 
                        <ResponsiveContainer width="100%" height="100%">
                                <BarChart width={500} height={300} data={incExpData} margin={{
                                            top: 20,
                                            right: 40,
                                        }}>
                                    <Bar dataKey="value">
                                        {incExpData.map(entry => (
                                            <Cell key={entry.name} fill={colorsIncExp[entry.name]} />
                                        ))}
                                    </Bar>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.3)" />
                                    <XAxis dataKey="name" interval={0} angle={0} textAnchor="middle" tick={{ fill: 'white', fontSize: 14 }} />
                                    <YAxis tick={{ fill: 'white' }} />

                                    <Tooltip
                                        content={({ payload, label, active }) => {
                                            if (active) {
                                                const value = payload[0].payload.value; // Dati relativi all'elemento selezionato

                                                // Formatta il valore con migliaia e simbolo dell'euro
                                                const formattedValue = new Intl.NumberFormat('it-IT', {
                                                    style: 'currency',
                                                    currency: 'EUR',
                                                    maximumFractionDigits: 0,
                                                }).format(value);

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
        </SectionDashboard>
    )
}
  
export default Dashboard;
