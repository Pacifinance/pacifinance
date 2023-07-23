import React, {useState, useEffect, useContext} from "react";
import { UserContext } from '../contexts/UserContext';
import { CartesianGrid } from "recharts/lib/cartesian/CartesianGrid";
import { Tooltip } from "recharts/lib/component/Tooltip"; 
import { XAxis } from "recharts/lib/cartesian/XAxis";
import { YAxis } from "recharts/lib/cartesian/YAxis";
import { BarChart } from "recharts/lib/chart/BarChart";
import { Bar } from "recharts/lib/cartesian/Bar";
import { Legend } from "recharts/lib/component/Legend";
import styled from 'styled-components'
import { ThemeContext } from '../contexts/ThemeContext';




export default function BalancesCharts() {
    const { theme } = useContext(ThemeContext);
    const { mode } = theme;
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

              //HERE I HAVE TO SET THE DATA FOR ALL THE YEAR FOR BALANCE TODO
              
      
          } catch (error) {
            console.error('Errore durante le operazioni:', error);
          }
        }
      };

    fetchData();
    }, [userData]);

    //HERE I HAVE TO SET DATA TAKEN FROM THE DATABASE FOR ALL THE YEAR FROM NOW (Last 12 months) or from the beginning of the year (IDK) TODO
    const data = [
      {
        name: 'January',
        SoldiFisici: cashReal,
        ServiziDigitali: digitalServicesReal,
        Azioni: stocksReal,
        Banca: bankReal,
        Crypto: cryptoReal,
        ETF: etfReal,
        Bitcoin: bitcoinReal,
        amt: 2400,
      },
      {
        name: 'February',
        SoldiFisici: cashReal,
        ServiziDigitali: digitalServicesReal,
        Azioni: stocksReal,
        Banca: bankReal,
        Crypto: cryptoReal,
        ETF: etfReal,
        Bitcoin: bitcoinReal,
        amt: 2210,
      },
      {
        name: 'March',
        SoldiFisici: cashReal,
        ServiziDigitali: digitalServicesReal,
        Azioni: stocksReal,
        Banca: bankReal,
        Crypto: cryptoReal,
        ETF: etfReal,
        Bitcoin: bitcoinReal,
        amt: 2290,
      },
      {
        name: 'April',
        SoldiFisici: cashReal,
        ServiziDigitali: digitalServicesReal,
        Azioni: stocksReal,
        Banca: bankReal,
        Crypto: cryptoReal,
        ETF: etfReal,
        Bitcoin: bitcoinReal,
        amt: 2000,
      },
      {
        name: 'May',
        SoldiFisici: cashReal,
        ServiziDigitali: digitalServicesReal,
        Azioni: stocksReal,
        Banca: bankReal,
        Crypto: cryptoReal,
        ETF: etfReal,
        Bitcoin: bitcoinReal,
        amt: 2181,
      },
      {
        name: 'June',
        SoldiFisici: cashReal,
        ServiziDigitali: digitalServicesReal,
        Azioni: stocksReal,
        Banca: bankReal,
        Crypto: cryptoReal,
        ETF: etfReal,
        Bitcoin: bitcoinReal,
        amt: 2500,
      },
      {
        name: 'July',
        SoldiFisici: cashReal,
        ServiziDigitali: digitalServicesReal,
        Azioni: stocksReal,
        Banca: bankReal,
        Crypto: cryptoReal,
        ETF: etfReal,
        Bitcoin: bitcoinReal,
        amt: 2100,
      },
      {
        name: 'August',
        SoldiFisici: cashReal,
        ServiziDigitali: digitalServicesReal,
        Azioni: stocksReal,
        Banca: bankReal,
        Crypto: cryptoReal,
        ETF: etfReal,
        Bitcoin: bitcoinReal,
        amt: 2000,
      },
      {
        name: 'September',
        SoldiFisici: cashReal,
        ServiziDigitali: digitalServicesReal,
        Azioni: stocksReal,
        Banca: bankReal,
        Crypto: cryptoReal,
        ETF: etfReal,
        Bitcoin: bitcoinReal,
        amt: 2181,
      },
      {
        name: 'October',
        SoldiFisici: cashReal,
        ServiziDigitali: digitalServicesReal,
        Azioni: stocksReal,
        Banca: bankReal,
        Crypto: cryptoReal,
        ETF: etfReal,
        Bitcoin: bitcoinReal,
        amt: 2500,
      },
      {
        name: 'November',
        SoldiFisici: cashReal,
        ServiziDigitali: digitalServicesReal,
        Azioni: stocksReal,
        Banca: bankReal,
        Crypto: cryptoReal,
        ETF: etfReal,
        Bitcoin: bitcoinReal,
        amt: 2100,
      },
      {
        name: 'December',
        SoldiFisici: cashReal,
        ServiziDigitali: digitalServicesReal,
        Azioni: stocksReal,
        Banca: bankReal,
        Crypto: cryptoReal,
        ETF: etfReal,
        Bitcoin: bitcoinReal,
        amt: 2100,
      },
    ]; //TODO


  const Section = styled.section`
    h3 {
      text-align: center;
    }
    h5{
      text-align: center;
      color: grey;
      margin-bottom: 2rem;
    }
    .portfolio {
      color: black;
      width: 100%;
      .portfolio__details {
        display: flex;
        justify-content: space-between;
        margin: 1rem 0;
        div {
          display: flex;
          gap: 1rem;
          h5 {
            color: gray;
          }
        }
      }
      .portfolio__graph {
        height: 10rem;
        width: 100%;
        .recharts-default-tooltip {
          background-color: ${theme.backgroundColor} !important;
          border-color: black !important;
          color: white !important;
        }
      }
    }
  `;

  return (
    <Section>
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis tick={{fontSize: 9}} interval={1} dataKey="name" />
        <YAxis tick={{fontSize: 12}} />
        <Tooltip />
        <Legend />
        
        
        <Bar dataKey="Banca" stackId="a" fill="#8884d8" />
        <Bar dataKey="SoldiFisici" stackId="a" fill="#82ca9d" />
        <Bar dataKey="ServiziDigitali" stackId="a" fill="#82ca9d" />
        <Bar dataKey="Azioni" stackId="a" fill="#0072c6" />
        <Bar dataKey="ETF" stackId="a" fill="#82ca9d" />
        <Bar dataKey="Bitcoin" stackId="a" fill="#f5cb42" />
        <Bar dataKey="Crypto" stackId="a" fill="#f5cb42" />
        
        
  
        

      </BarChart>

      {/* <h3>Incomes vs Outcomes</h3>
      <h5>Check Incomes and outcomes</h5>
      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis tick={{fontSize: 9}} interval={1} dataKey="name" />
        <YAxis tick={{fontSize: 12}} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="Incomes"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
        <Line type="monotone" dataKey="Expenses" stroke="#82ca9d" />
      </LineChart> */}
    </Section>
  );
}


