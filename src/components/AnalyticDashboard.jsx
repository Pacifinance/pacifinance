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
import { PieChart, Pie, Cell } from "recharts";
import { ThemeContext } from '../contexts/ThemeContext';
import axios from 'axios';

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

function AnalyticDashboard() {
    const [stocksReal, setStocksReal] = useState(0);
    const [cryptoReal, setCryptoReal] = useState(0);
    const [bankReal, setBank] = useState(0);
    const [cashReal, setCash] = useState(0);
    const { theme } = useContext(ThemeContext);
    const { mode } = theme;

    const Section = styled.section `
        display: flex;
        grid-template-columns: repeat(4, 1fr);
        justify-content: space-between;
        margin: 0 60px;
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
        .search {
            background-color: ${theme.backgroundColor};
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem 8rem 1rem 1rem;
            border-radius: 1.5rem;
            svg{
                color: ${theme.textColor};
            }
            input{
                background-color: transparent;
                border: none;
                color: ${theme.textColor};
                &:focus{
                    outline: none;
                }
                &::placeholder {
                    color: ${theme.textColor};
                }
            }
        }
    `;

    const Wrapper = styled.div`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin: 0 60px;

        .pie-chart-section {
            margin-top: 50px;
            margin-right: 50px;
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
            const stocks = response.data[0].balance.stocks;
            console.log(stocks);
            const bank = response.data[0].balance.bank;
            const cash = response.data[0].balance.cash;
            const crypto = response.data[0].balance.crypto;
            console.log(bank);
            console.log(cash);

            if (bank !== undefined) {
                setBank(bank);
            }
            if (cash !== undefined) {
                setCash(cash);
            }
            if (stocks !== undefined) {
                setStocksReal(stocks.real);
            }
            if (crypto !== undefined) {
                setCryptoReal(crypto.real);
            }
            console.log(crypto);
            
            // console.log(stocksReal);
            // console.log(cryptoReal);

          } catch (error) {
            console.error('Errore durante la richiesta GET:', error);
          }
        };
    
        // call the function to fetch the balances
        fetchBalances();
    }, []);

    const data = [
        { name: "Stocks", value: stocksReal },
        { name: "Bank", value: bankReal },
        { name: "Cash", value: cashReal },
        { name: "Crypto", value: cryptoReal }
    ];
      
    return (
        
        <div className="wrapper">
        <Section>
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
                    <h6>Invested</h6>
                    <h6>in Stocks & ETF</h6>
                </div>
                <div className="money">
                    <h5>{stocksReal}€</h5>
                </div>
            </div>

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
                    <h6>Deposited</h6>
                    <h6>in Bank</h6>
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
                    <h6>Cash</h6>
                    <h6>money</h6>
                </div>
                <div className="money">
                    <h5>{cashReal}€</h5>
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
                    <h6>Invested</h6>
                    <h6>in Crypto</h6>
                </div>
                <div className="money">
                    <h5>{cryptoReal}€</h5>
                </div>
            </div>   
        </Section>

        <div className="pie-chart-section">
                <h5 style={{ marginBottom: "-80px", marginTop: "50px" }}>Actual Balance in %</h5>
                <PieChart width={400} height={400}>
                <Pie
                    data={data}
                    cx={200}
                    cy={200}
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    //onMouseEnter={() => handleMouseEnter(entry, index)}
                    //onMouseLeave={handleMouseLeave}
                    dataKey="value"
                >
                    {data.map((dataEntry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                </PieChart>
            </div>
    </div>
    )
}

export default AnalyticDashboard;
