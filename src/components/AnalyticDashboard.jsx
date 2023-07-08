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
import { ThemeContext } from '../contexts/ThemeContext';
import { MdOutlineAutoGraph } from "react-icons/md";
import { SiMoneygram } from "react-icons/si";
import { BsCoin } from "react-icons/bs";
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, ArcElement, LinearScale} from 'chart.js';

Chart.register(CategoryScale, ArcElement, LinearScale, BarElement);

function AnalyticDashboard() {
    const [stocksReal, setStocksReal] = useState(0);
    const [ETFReal, setETFReal] = useState(0);
    const [bitcoinReal, setBitcoinReal] = useState(0);
    const [cryptoReal, setCryptoReal] = useState(0);
    const [bankReal, setBank] = useState(0);
    const [cashReal, setCash] = useState(0);
    const [digitalServicesReal, setDigitalServices] = useState(0);
    const [totalReal, setTotalReal] = useState(0);
    const [incomesMonth, setIncomesMonth] = useState(0);
    const [expensesMonth, setExpensesMonth] = useState(0);
    const [SavedMonth, setSavedMonth] = useState(0);
    const { theme } = useContext(ThemeContext);
    const { mode } = theme;


    const Section = styled.section `
        font-family: Roboto, sans-serif;
        background-color: ${theme.backgroundColor};
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
    `;

    useEffect(() => {
        // function to fetch the balances from the API
        const fetchBalances = async () => {
          try {
            const response = await axios.get('/balances/get'); //only the first element of the array is needed (the last one)
            console.log(response);
            console.log(response.data);
            //respose.data is not empty
            if(response.data.length === 0 || response.data[0].balance === {}) {
                console.log("No data found");
                return;
            }
            //SISTEMARE
            const stocksObject = response.data[0].balance.stocks;
            console.log(stocksObject);
            const bankObject = response.data[0].balance.bank;
            const cashObject = response.data[0].balance.cash;
            const cryptoObject = response.data[0].balance.crypto;
            const etfObject = response.data[0].balance.etf;
            const digitalServicesObject = response.data[0].balance.digitalServices;
            const bitcoinObject = response.data[0].balance.bitcoin;
            const totalCapital = 0;

            console.log(bankObject);
            console.log(cashObject);

            if (bankObject !== undefined) {
                setBank(bankObject);
            }
            if (cashObject !== undefined) {
                setCash(cashObject);
            }
            if (digitalServicesObject !== undefined) {
                setDigitalServices(digitalServicesObject);
            }
            if (stocksObject !== undefined) {
                setStocksReal(stocksObject.real);
            }
            if (etfObject !== undefined) {
                setETFReal(etfObject.real);
            }
            if (bitcoinObject !== undefined) {
                setBitcoinReal(bitcoinObject.real);
            }
            if (cryptoObject !== undefined) {
                setCryptoReal(cryptoObject.real);
            }
            totalCapital = stocksReal + ETFReal + bankReal + cashReal + cryptoReal + bitcoinReal + digitalServicesReal;
            setTotalReal(totalCapital);
            
            console.log(cryptoObject);
            
            // console.log(stocksReal);
            // console.log(cryptoReal);

          } catch (error) {
            console.error('Errore durante la richiesta GET:', error);
          }
        };

        const fetchIncomeExpenses = async () => {
            try {
                const currentDate = new Date(Date.now()); //current date in UTC format
                const expensesArray = await axios.post('/expenses/get', {date: currentDate}); //post to crypt datas
                
                console.log(expensesArray);
                //respose.data is not empty
                if(expensesArray.length === 0) {
                    console.log("No data found");
                    setSavedMonth(0);
                    return;
                }

                let totalExpenses = 0;
                let totalIncome = 0;

                expensesArray.forEach((expense) => {
                    if (expense.isExpense) {
                        totalExpenses += expense.amount;
                    } else {
                        totalIncome += expense.amount;
                    }
                });

                console.log('Totale spese:', totalExpenses);
                console.log('Totale income:', totalIncome);
                
                setIncomesMonth(totalIncome);
                setExpensesMonth(totalExpenses);

                const Saved = totalIncome - totalExpenses;
                console.log(Saved);
                setSavedMonth(Saved);

            } catch (error) {
                console.error('Errore durante la richiesta GET:', error);
            }
        }
        // call the function to fetch the balances
        fetchBalances();
        fetchIncomeExpenses();
    }, []);

    const barChartCapitalData = {
        labels: ['Azioni', 'ETF', 'Banca', 'Banconote', 'Criptovalute', 'Bitcoin', 'Digital Services'],
        datasets: [
          {
            label: '# of Votes',
            data: [stocksReal, ETFReal, bankReal, cashReal, cryptoReal, bitcoinReal, digitalServicesReal],
            backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
            borderWidth: 1,
          },
        ],
      };
      
      const pieChartCapitalData = {
        labels: ['Azioni', 'ETF', 'Banca', 'Banconote', 'Criptovalute', 'Bitcoin', 'Digital Services'],
        datasets: [
          {
            label: '# of Votes',
            data: [stocksReal, ETFReal, bankReal, cashReal, cryptoReal, bitcoinReal, digitalServicesReal],
            backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
            borderWidth: 1,
          },
        ],
      };

      const barChartIncExpData = {
        labels: ['Entrate', 'Spese'],
        datasets: [
          {
            label: '# of Votes',
            data: [stocksReal, ETFReal],
            backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
            borderWidth: 1,
          },
        ],
      };
      
    return (
        
        <Section>
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
                        <div className="logo" style={{ color: '#329239' }}>
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
                        <div className="logo" style={{ color: '#FF6600' }}>
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
                        <h5>{ETFReal}€</h5>
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
                        <div className="logo" style={{ color: '#F7B510' }}>
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
                    <Bar data={barChartCapitalData} />
                </div>

                <div className="pie-chart-section">
                    <h2>% Distribuzione Capitale</h2>
                    <Pie data={pieChartCapitalData} />
                </div>

                <div className="bar-chart-section">
                    <h2>Entrate | Spese</h2>
                    <Bar data={barChartIncExpData} />
                </div>

            </GraphsSection>
        </Section>

        
    )
}

export default AnalyticDashboard;
