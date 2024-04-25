import React, { useEffect, useState, useContext, PureComponent } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Sector, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BsBank } from "react-icons/bs";
import { FaBitcoin } from "react-icons/fa";
import { BsCashCoin } from "react-icons/bs";
import { AiOutlineStock, AiOutlinePlusCircle } from "react-icons/ai";
import { MdOutlineAutoGraph } from "react-icons/md";
import { SiMoneygram } from "react-icons/si";
import { BsCoin } from "react-icons/bs";
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { primaryColor, secondaryColor } from '../styles/Themes';
import { getColorsBalances, getColorsIncExp } from '../styles/Themes';
import { renderCustomizedLabel } from '../utilities/customGraphsInfo';
import { LanguageContext } from '../contexts/LanguageContext';
import languages from '../data/languages.json';

import {
        TitleDashboard,
        SectionDashboard,
        SectionADashboard,
        CapitalValue,
        UpperSection,
        LowerSection,
        GraphsSection,
  } from '../styles/MyStyled';


function Dashboard({ theme, userData, isHidden, CustomTick}) {
    const [isLoading, setIsLoading] = useState(true);
    const { language } = useContext(LanguageContext);
    const colorsBalances = getColorsBalances(language);
    const colorsIncExp = getColorsIncExp(language);
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
                setSavedMonth(userData ? (userData.incomesArray[0] - userData.expensesArray[0]) : 0);

                
                
                setIsLoading(false); // Imposta isLoading su false quando le operazioni sono state completate
            } catch (error) {
              console.error('Error set balances:', error);
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
        { name: languages[language].assets.stocks, value: stocksReal >= 0 ? stocksReal : 0 },
        { name: languages[language].assets.etf, value: etfReal >= 0 ? etfReal : 0 },
        { name: languages[language].assets.bank, value: bankReal >= 0 ? bankReal : 0 },
        { name: languages[language].assets.cash, value: cashReal >= 0 ? cashReal : 0 },
        { name: languages[language].assets.crypto, value: cryptoReal >= 0 ? cryptoReal : 0 },
        { name: languages[language].assets.bitcoin, value: bitcoinReal >= 0 ? bitcoinReal : 0 },
        { name: languages[language].assets.digitalServices, value: digitalServicesReal >= 0 ? digitalServicesReal : 0 },
    ];

    const capitalShuffleData = [...capitalData].sort(() => Math.random() - 0.5);
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
        { name: languages[language].general.incomes, value: incomesMonth >= 0 ? incomesMonth : 0 },
        { name: languages[language].general.expenses, value: expensesMonth >= 0 ? expensesMonth : 0 },
        { name: languages[language].general.saved, value: savedMonth > 0 ? savedMonth : 0 },
    ];

    const incExpShuffleData = [...incExpData].sort(() => Math.random() - 0.5);


    
    // { fill: theme.textColor, formatter: (value) => isHidden ? '****' : value }

    const isAllZero = capitalData.every(entry => entry.value === 0); //fakeCapitalData to test some change on the pie chart (main data is capitalData)

    
    return (
        <SectionDashboard theme={theme}>
            <TitleDashboard theme={theme}>{languages[language].dashboard.title}</TitleDashboard>
            <CapitalValue theme={theme}>
                {languages[language].dashboard.totalBalance}{" "}
                <span style={{ color: primaryColor }}>
                    {isHidden ? '****' : totalReal.toLocaleString('it-IT')} €
                </span>
            </CapitalValue>
            <UpperSection theme={theme}>
                <div className="analytic" style={{ position: 'relative' }}>
                    <div className="design">
                        <div className="logo" style={{ color: '#0D579B'}}>
                            <BsBank />
                        </div>
                        <div className="action" style={{ position: 'absolute', top: 10, right: 10 }}>
                            <Link to="/insert-values" title={languages[language].dashboard.updateValue}>
                                <AiOutlinePlusCircle style={{ color: secondaryColor }}/>
                            </Link>
                        </div>
                    </div>
                    <div className="transfer">
                        <h6>{languages[language].general.deposited}</h6>
                        <h6>{languages[language].general.in} {languages[language].assets.bank}</h6>
                    </div>
                    <div className="money">
                        <h5>{isHidden ? '****' : bankReal.toLocaleString('it-IT')} €</h5>
                    </div>
                </div>

                <div className="analytic" style={{ position: 'relative' }}>
                    <div className="design">
                        <div className="logo" style={{ color: '#329239' }}>
                            <BsCashCoin />
                        </div>
                        <div className="action" style={{ position: 'absolute', top: 10, right: 10 }}>
                            <Link to="/insert-values" title={languages[language].dashboard.updateValue}>
                                <AiOutlinePlusCircle style={{ color: secondaryColor }}/>
                            </Link>
                        </div>
                    </div>
                    <div className="transfer">
                        <h6>{languages[language].assets.cash}</h6>
                        {/* <h6>e monete</h6> */}
                    </div>
                    <div className="money">
                        <h5>{isHidden ? '****' : cashReal.toLocaleString('it-IT')} €</h5>
                    </div>
                </div>

                <div className="analytic" style={{ position: 'relative' }}>
                    <div className="design">
                        <div className="logo" style={{ color: '#74b9ff' }}>
                            <SiMoneygram />
                        </div>
                        <div className="action" style={{ position: 'absolute', top: 10, right: 10 }}>
                            <Link to="/insert-values" title={languages[language].dashboard.updateValue}>
                                <AiOutlinePlusCircle style={{ color: secondaryColor }}/>
                            </Link>
                        </div>
                    </div>
                    <div className="transfer">
                        <h6 dangerouslySetInnerHTML={{ __html: languages[language].assets.digitalServices }}></h6>
                        {/* <h6>Pagamenti digitali</h6> */}
                    </div>
                    <div className="money">
                        <h5>{isHidden ? '****' : digitalServicesReal.toLocaleString('it-IT')} €</h5>
                    </div>
                </div>

            </UpperSection>
            <LowerSection theme={theme}>
                {stocksReal !== 0 && (
                    <div className="analytic" style={{ position: 'relative' }}>
                        <div className="design">
                            <div className="logo" style={{ color: '#FF6600' }}>
                                <MdOutlineAutoGraph />
                            </div>
                            <div className="action" style={{ position: 'absolute', top: 10, right: 10 }}>
                                <Link to="/insert-values" title={languages[language].dashboard.updateValue}>
                                    <AiOutlinePlusCircle style={{ color: secondaryColor }}/>
                                </Link>
                            </div>
                        </div>
                        <div className="transfer">
                            <h6>{languages[language].assets.stocks}</h6>
                        </div>
                        <div className="money">
                            <h5>{isHidden ? '****' : stocksReal.toLocaleString('it-IT')} €</h5>
                        </div>
                    </div>
                )}
                {etfReal !== 0 && (
                    <div className="analytic" style={{ position: 'relative' }}>
                        <div className="design">
                            <div className="logo" style={{ color: '#a29bfe' }}>
                                <AiOutlineStock />
                            </div>
                            <div className="action"style={{ position: 'absolute', top: 10, right: 10 }}>
                                <Link to="/insert-values" title={languages[language].dashboard.updateValue}>
                                    <AiOutlinePlusCircle style={{ color: secondaryColor }}/>
                                </Link>
                            </div>
                        </div>
                        <div className="transfer">
                            <h6>{languages[language].assets.etf}</h6>
                        </div>
                        <div className="money">
                            <h5>{isHidden ? '****' : etfReal.toLocaleString('it-IT')} €</h5>
                        </div>
                    </div>
                )}

                {bitcoinReal !== 0 && (
                    <div className="analytic" style={{ position: 'relative' }}>
                        <div className="design">
                            <div className="logo" style={{ color: '#F7B510' }}>
                                <FaBitcoin />
                            </div>
                            <div className="action" style={{ position: 'absolute', top: 10, right: 10 }}>
                                <Link to="/insert-values" title={languages[language].dashboard.updateValue}>
                                    <AiOutlinePlusCircle style={{ color: secondaryColor }}/>
                                </Link>
                            </div>
                        </div>
                        <div className="transfer">
                            <h6>{languages[language].assets.bitcoin}</h6>
                        </div>
                        <div className="money">
                            <h5>{isHidden ? '****' : bitcoinReal.toLocaleString('it-IT')} €</h5>
                        </div>
                    </div>
                )}
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
                {cryptoReal !== 0 && (
                    <div className="analytic" style={{ position: 'relative' }}>
                        <div className="design">
                            <div className="logo" style={{ color: '#d63031' }}>
                                <BsCoin />
                            </div>
                            <div className="action" style={{ position: 'absolute', top: 10, right: 10 }}>
                                <Link to="/insert-values" title={languages[language].dashboard.updateValue}>
                                    <AiOutlinePlusCircle style={{ color: secondaryColor }}/>
                                </Link>
                            </div>
                        </div>
                        <div className="transfer">
                            <h6>{languages[language].assets.crypto}</h6>
                        </div>
                        <div className="money">
                            <h5>{isHidden ? '****' : cryptoReal.toLocaleString('it-IT')} €</h5>
                        </div>
                    </div>
                )}
            </LowerSection> 
            <GraphsSection theme={theme}>
                <div className="bar-chart-section">
                    <h2>{languages[language].dashboard.titleGraph}</h2>
                    <div style={{ width: 400, height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart width={500} height={300} data={isHidden ? capitalShuffleData: capitalData} margin={{
                                        top: 20,
                                        right: 15,
                                    }}>
                                <Bar dataKey="value">
                                    {capitalData.map(entry => {
                                        const greyScale = Math.floor(Math.random() * 256);
                                        const greyColor = `rgb(${greyScale}, ${greyScale}, ${greyScale})`;
                                        return <Cell key={entry.name} fill={isHidden ? greyColor : colorsBalances[entry.name]} />
                                    })}
                                </Bar>
                                <CartesianGrid strokeDasharray="3 3" stroke="transparent" vertical={false}/> {/*stroke="rgba(255, 255, 255, 0.3)"*/}
                                {/* <XAxis dataKey="name" interval={0} angle={15} textAnchor="middle" tick={{ fill: theme.textColor, fontSize: 12 }} />
                                <YAxis tick={{ fill: theme.textColor }} /> */}
                                <Tooltip
                                    content={({ payload, label, active }) => {
                                        if (active) {
                                        const value = isHidden ? '****' : payload[0].payload.value;

                                        const formattedValue = new Intl.NumberFormat('it-IT', {
                                            style: 'currency',
                                            currency: 'EUR',
                                            maximumFractionDigits: 0,
                                        }).format(value);

                                        return (
                                            <div style={{ backgroundColor: '#fff', color: '#079164', borderRadius: '4px', padding: '8px' }}>
                                            <p>{isHidden ? '****' : label}</p>
                                            <p style={{ color: 'black' }}>{isHidden ? '****' : formattedValue}</p>
                                            </div>
                                        );
                                        }
                                        return null;
                                    }}
                                    />
                                <XAxis dataKey="name" interval={0} tick={(props) => <CustomTick {...props} textAnchor="middle" fill={theme.textColor}  angle={15} fontSize='12' dy='10'/>} />
                                <YAxis tick={(props) => <CustomTick {...props} textAnchor="middle" fill= {theme.textColor} dx='-10'/>} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                </div>

                <div className="pie-chart-section">
                    
                    <div style={{ width: 400, height: 400 }}>
                        <h2>{languages[language].dashboard.titleGraph2}</h2>
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
                                <h1 style={{color: '#079164'}}>{languages[language].dashboard.noData}</h1> <p dangerouslySetInnerHTML={{ __html: languages[language].dashboard.noData2}}></p> <p><HiOutlinePencilAlt style={{ fontSize: '30px' }} /></p>
                            </div>
                        ) : (
                                <PieChart width={500} height={500} margin={{
                                    top: 20,
                                    left: 60,
                                }}>
                                    <Pie
                                        data={isHidden ? capitalShuffleData : capitalData}  //fakeCapitalData to test some change on the pie chart (main data is capitalData)
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
                                            const greyScale = Math.floor(Math.random() * 256);
                                            const greyColor = `rgb(${greyScale}, ${greyScale}, ${greyScale})`;
                                            return <Cell key={entry.name} fill={isHidden ? greyColor : colorsBalances[entry.name]} />
                                        })}
                                    </Pie>
                                    <Tooltip
                                        content={({ payload, active }) => {
                                            if (active) {
                                            const data = payload[0].payload;
                                            const value = isHidden ? '****' : data.value;
                                            const percentage = isHidden ? '****' : ((value / totalCapitalData) * 100).toFixed(0);

                                                // Format the value with thousands and euro symbol
                                                const formattedValue = new Intl.NumberFormat('it-IT', {
                                                    style: 'currency',
                                                    currency: 'EUR',
                                                    maximumFractionDigits: 0,
                                                }).format(value);

                                                return (
                                                    <div className="custom-tooltip" style={{ backgroundColor: '#fff', color: '#079164', borderRadius: '4px', padding: '8px' }}>
                                                        <p>{isHidden ? '****' : data.name}</p>
                                                        <p style={{ color: 'black' }}>{formattedValue}({percentage}%)</p>
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
                    <h2>{languages[language].dashboard.titleGraph3}</h2>
                    <div style={{ width: 350, height: 300 }}> 
                        <ResponsiveContainer width="100%" height="100%">
                                <BarChart width={500} height={300} data={isHidden ? incExpShuffleData : incExpData} margin={{
                                            top: 20,
                                            right: 40,
                                        }}>
                                    <Bar dataKey="value">             
                                        {incExpData.map(entry => {
                                            const greyScale = Math.floor(Math.random() * 256);
                                            const greyColor = `rgb(${greyScale}, ${greyScale}, ${greyScale})`;
                                            return <Cell key={entry.name} fill={isHidden ? greyColor : colorsIncExp[entry.name]} />
                                        })}
                                    </Bar>
                                    <CartesianGrid strokeDasharray="3 3" stroke="transparent" vertical={false}/> 
                                    {/* <XAxis dataKey="name" interval={0} angle={0} textAnchor="middle" tick={{ fill: theme.textColor, fontSize: 14 }} />
                                    <YAxis tick={{ fill: theme.textColor }} /> */}
                                    <XAxis dataKey="name" interval={0} tick={(props) => <CustomTick {...props} textAnchor="middle" fill={theme.textColor} dy='16' />} />
                                    <YAxis tick={(props) => <CustomTick {...props} fill={theme.textColor} />} />

                                    <Tooltip
                                        content={({ payload, label, active }) => {
                                            if (active) {
                                                const value = isHidden ? '****' : payload[0].payload.value;

                                                const formattedValue = new Intl.NumberFormat('it-IT', {
                                                    style: 'currency',
                                                    currency: 'EUR',
                                                    maximumFractionDigits: 0,
                                                }).format(value);

                                                return (
                                                    <div className="custom-tooltip" style={{ backgroundColor: '#fff', color: '#079164', borderRadius: '4px', padding: '8px' }}>
                                                        <p>{isHidden ? '****' : label}</p>
                                                        <p style={{ color: 'black' }}>{isHidden ? '****' : formattedValue}</p>
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
