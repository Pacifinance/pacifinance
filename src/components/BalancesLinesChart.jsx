import React, {useState, useEffect, useContext} from "react";
import { CartesianGrid } from "recharts/lib/cartesian/CartesianGrid";
import { Tooltip } from "recharts/lib/component/Tooltip"; 
import { XAxis } from "recharts/lib/cartesian/XAxis";
import { YAxis } from "recharts/lib/cartesian/YAxis";
import { BarChart } from "recharts/lib/chart/BarChart";
import { LineChart } from "recharts/lib/chart/LineChart";
import { Line } from "recharts/lib/cartesian/Line";
import { Bar } from "recharts/lib/cartesian/Bar";
import { Legend } from "recharts/lib/component/Legend";
import { SectionBalancesCharts } from '../contexts/MyStyled';
import { ThemeContext } from '../contexts/ThemeContext';




export default function BalancesLinesChart({theme, userData, isHidden, CustomTick}) {

  const [last12MonthsData, setLast12MonthsData] = useState([]);

  // const { SectionBalancesCharts } = MyStyled();

  useEffect(() => {
    const fetchData = async () => {
      if (userData) {
        try {

          setLast12MonthsData(userData ? userData.last12MonthsData : []);
            
    
        } catch (error) {
          console.error('Errore durante le operazioni:', error);
        }
      }
    };

  fetchData();
  }, [userData]);


  const data = last12MonthsData.map((monthData) => {
    const total = monthData.cashReal + monthData.digitalServicesReal + monthData.stocksReal + monthData.bankReal + monthData.cryptoReal + monthData.etfReal + monthData.bitcoinReal;
    return {
      name: monthData.month,
      SoldiFisici: monthData.cashReal,
      ServiziDigitali: monthData.digitalServicesReal,
      Azioni: monthData.stocksReal,
      Banca: monthData.bankReal,
      Crypto: monthData.cryptoReal,
      ETF: monthData.etfReal,
      Bitcoin: monthData.bitcoinReal,
      Totale: total,
      amt: 2400, 
      };
  }).reverse(); //reverse() to have the last month on the right

  return (
    <SectionBalancesCharts theme={theme}>
        <LineChart
            width={600}
            height={400}
            data={data}
            margin={{
            top: 5,
            left: 35,
            bottom: 40
            }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" interval={1} tick={(props) => <CustomTick {...props} textAnchor="middle" fill={theme.textColor} angle={0} fontSize={9}/>} />
            <YAxis tick={(props) => <CustomTick {...props} textAnchor="middle" fill={theme.textColor} fontSize={12} dx={-10}/>} />
            <Tooltip
                contentStyle={{ backgroundColor: '#fff', color: '#079164', borderRadius: '4px', padding: '8px' }}
                labelStyle={{ color: 'black', fontWeight: 'bold', textTransform: 'capitalize' }}
                formatter={(value, name) => {

                    const formattedValue = new Intl.NumberFormat('it-IT', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0,
                    }).format(value);

                    // Include the total sum in the legend
                    return [`${name}: ${formattedValue}`];
                }}
            />
            <Legend iconSize={12} wrapperStyle={{ fontSize: '10px', marginLeft: '8%' }}/>
            
            <Line type="monotone" dataKey={isHidden ? '****' : "Banca"} stroke={isHidden ? theme.textColor : "#0D579B"} />
            <Line type="monotone" dataKey={isHidden ? '****' : "SoldiFisici"} stroke={isHidden ? theme.textColor : "#329239"} />
            <Line type="monotone" dataKey={isHidden ? '****' : "ServiziDigitali"} stroke={isHidden ? theme.textColor : "#74b9ff"} />
            <Line type="monotone" dataKey={isHidden ? '****' : "Azioni"} stroke={isHidden ? theme.textColor : "#FF6600"} />
            <Line type="monotone" dataKey={isHidden ? '****' : "ETF"} stroke={isHidden ? theme.textColor : "#a29bfe"} />
            <Line type="monotone" dataKey={isHidden ? '****' : "Bitcoin"} stroke={isHidden ? theme.textColor : "#F7B510"} />
            <Line type="monotone" dataKey={isHidden ? '****' : "Crypto"} stroke={isHidden ? theme.textColor : "#d63031"} />
            <Line type="monotone" dataKey={isHidden ? '****' : "Totale"} stroke={isHidden ? theme.textColor : "#000000"} />
            
        </LineChart>
    </SectionBalancesCharts>
  );
}


