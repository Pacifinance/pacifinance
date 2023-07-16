import React, { useEffect, useState, useContext } from 'react'
import styled from 'styled-components'
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
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, ArcElement, LinearScale} from 'chart.js';
import { ThemeContext } from '../contexts/ThemeContext';
import { UserContext } from '../contexts/UserContext';
import axios from 'axios';
import { set } from 'mongoose';

Chart.register(CategoryScale, ArcElement, LinearScale, BarElement);

function AnalyticDashboard() {

    const { theme } = useContext(ThemeContext);
    const { userData } = useContext(UserContext);
    const [isLoading, setIsLoading] = useState(true);
    const { mode } = theme;
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
                console.log(userData.expenses);
                
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

    const options = {
        plugins: {
          tooltip: {
            enabled: false,
            external: (context) => {
              // Get the tooltip element
              let tooltipEl = document.getElementById('custom-tooltip');
    
              // Create the tooltip element if it doesn't exist
              if (!tooltipEl) {
                tooltipEl = document.createElement('div');
                tooltipEl.id = 'custom-tooltip';
                tooltipEl.classList.add('custom-tooltip');
                document.body.appendChild(tooltipEl);
              }
    
              // Hide the tooltip if there is no active element
              if (context.tooltip.dataPoints.length === 0) {
                tooltipEl.style.display = 'none';
                return;
              }
    
              // Get the first data point
              const dataPoint = context.tooltip.dataPoints[0];
    
              // Update the tooltip content
              tooltipEl.innerHTML = `Value: ${dataPoint.formattedValue}`;
    
              // Position the tooltip
              const position = context.chart.canvas.getBoundingClientRect();
              tooltipEl.style.display = 'block';
              tooltipEl.style.left = position.left + window.scrollX + dataPoint.tooltipPosition.x + 'px';
              tooltipEl.style.top = position.top + window.scrollY + dataPoint.tooltipPosition.y + 'px';
            }
          }
        }
    };


    const Section = styled.section `
        font-family: Roboto, sans-serif;
        background-color: ${theme.backgroundColor};
        
    `;
    const CapitalValue = styled.h1 `
        font-size: 2.5rem;
        color: ${theme.textColor};
        margin-top: 1rem;
        margin-bottom: 1rem;
    `;

    const UpperSection = styled.section `
        display: flex;
        grid-template-columns: repeat(3, 1fr);
        justify-content: space-between;
        margin: 0 18%;
        .analytic {
            justify-content: space-between;
            padding: 1rem 2rem 1rem 2rem;
            border-radius: 1rem;
            color: black;
            background-color: white;
            justify-content: space-evenly;
            align-items: center;
            transition: 0.5s ease-in-out;
            width: 170px;
            border: 3px solid ${theme.buttonBackgroundColor};
        
            .design{
                display: flex;
                align-items: center;
                
                .logo {
                    background-color: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                
                    svg {
                        font-size: 2rem;
                    }
                }
                .action {
                    margin-left: 80px;
                svg{
                    font-size: 1.5rem;
                }
                }

            }
            .transfer {
                margin-top: 20px;
                color: grey
            }
            .money {
                margin-top: 20px;  
            }
        }

        .title{
            h5{
                color: ${theme.textColor};
            }
        }
    `;

    const LowerSection = styled.div`
        display : flex;
        grid-template-columns: repeat(4, 1fr);
        justify-content: space-between;
        margin: 5% 6%;
        .analytic {
            justify-content: space-between;
            padding: 1rem 2rem 1rem 2rem;
            border-radius: 1rem;
            color: black;
            background-color: white;
            justify-content: space-evenly;
            align-items: center;
            transition: 0.5s ease-in-out;
            width: 170px;
            border: 3px solid ${theme.buttonBackgroundColor};
        
            .design{
                display: flex;
                align-items: center;
                
                .logo {
                    background-color: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                
                    svg {
                        font-size: 2rem;
                    }
                }
                .action {
                    margin-left: 80px;
                svg{
                    font-size: 1.5rem;
                }
                }

            }
            .transfer {
                margin-top: 20px;
                color: grey
            }
            .money {
                margin-top: 20px;  
            }
        }

        .title{
            h5{
                color: ${theme.textColor};
            }
        }
    `;

    const GraphsSection = styled.div`
        display: flex;
        grid-template-columns: repeat(4, 1fr);
        justify-content: space-between;
        margin: 0 60px;
        
        .bar-chart-section {
            margin-top: 50px;
            margin-left: 50px;
            h2{
                color: ${theme.textColor};
            }
        }
        
        .pie-chart-section {
            margin-top: 50px;
            margin-right: 50px;
            h2{
                color: ${theme.textColor};
            }
        }

        .custom-tooltip {
            position: absolute;
            z-index: 9999;
            background-color: rgba(0, 0, 0, 0.7);
            color: #fff;
            padding: 0.5rem;
            font-size: 14px;
            border-radius: 4px;
          }
    `;

    const barChartCapitalData = {
        labels: ['Azioni', 'ETF', 'Banca', 'Banconote', 'Criptovalute', 'Bitcoin', 'Digital Services'],
        datasets: [
          {
            label: 'Valore allocato',
            data: [stocksReal, etfReal, bankReal, cashReal, cryptoReal, bitcoinReal, digitalServicesReal],
            backgroundColor: ['rgba(255, 102, 0, 1)', 'rgba(162, 155, 254,1.0)', 'rgba(13, 87, 155, 1)', 'rgba(50, 146, 57, 1)', 'rgba(214, 48, 49,1.0)', 'rgba(247, 181, 16, 1.0)', 'rgba(129, 236, 236,1.0)'],
            borderColor: ['rgba(255, 102, 0, 1)', 'rgba(162, 155, 254,1.0)', 'rgba(13, 87, 155, 1)', 'rgba(50, 146, 57, 1)', 'rgba(214, 48, 49,1.0)', 'rgba(247, 181, 16, 1.0)', 'rgba(129, 236, 236,1.0)'],
            borderWidth: 1,
          },
        ],
        options: {
            scales: {
              y: {
                beginAtZero: true,
                max: 500, // Make sure y axis doesn't go beyond 500
                ticks: {
                    stepSize: 100, // Imposta l'intervallo tra i valori sull'asse y
                },
              },
            },
        },
      };
      
      const pieChartCapitalData = {
        labels: ['Azioni', 'ETF', 'Banca', 'Banconote', 'Criptovalute', 'Bitcoin', 'Digital Services'],
        datasets: [
          {
            label: '% allocata',
            data: [stocksReal, etfReal, bankReal, cashReal, cryptoReal, bitcoinReal, digitalServicesReal],
            backgroundColor: ['rgba(255, 102, 0, 1)', 'rgba(162, 155, 254,1.0)', 'rgba(13, 87, 155, 1)', 'rgba(50, 146, 57, 1)', 'rgba(214, 48, 49,1.0)', 'rgba(129, 236, 236,1.0)'],
            borderColor: ['rgba(255, 102, 0, 1)', 'rgba(162, 155, 254,1.0)', 'rgba(13, 87, 155, 1)', 'rgba(50, 146, 57, 1)', 'rgba(214, 48, 49,1.0)', 'rgba(129, 236, 236,1.0)'],
            borderWidth: 1,
          },
        ],
      };

      const barChartIncExpData = {
        labels: ['Entrate', 'Spese', 'Risparmio'],
        datasets: [
          {
            label: 'Valore mensile',
            data: [incomesMonth, expensesMonth, savedMonth],
            backgroundColor: ['rgba(7, 145, 100, 1)', 'rgba(255, 0, 0, 1)', 'rgba(144, 238, 144, 1)'],
            borderColor: ['rgba(7, 145, 100, 1)', 'rgba(255, 99, 132, 1)', 'rgba(144, 238, 144, 1)'],
            borderWidth: 1,
          },
        ],
        options: {
            scales: {
              y: {
                beginAtZero: true,
                max: 500, // Imposta il valore massimo sull'asse y in base alle tue esigenze
                ticks: {
                    stepSize: 100, // Imposta l'intervallo tra i valori sull'asse y
                },
              },
            },
        },
      };
      
    return (
        
        <Section>
            <CapitalValue>Il tuo patrimonio totale è: {totalReal}€</CapitalValue>
            <UpperSection>
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
            <LowerSection>
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
            <GraphsSection>
            
                <div className="bar-chart-section">
                    <h2>Distribuzione capitale</h2>
                    <Bar data={barChartCapitalData} options={options}/>

                </div>

                <div className="pie-chart-section">
                    <h2>% Distribuzione Capitale</h2>
                    <Pie data={pieChartCapitalData} options={options}/>

                </div>

                <div className="bar-chart-section">
                    <h2>Entrate | Spese</h2>
                    <Bar data={barChartIncExpData} options={options}/>            
                </div>

            </GraphsSection>
        </Section>

        
    )
}

export default AnalyticDashboard;
