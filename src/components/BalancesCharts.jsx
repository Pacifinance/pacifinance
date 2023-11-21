import React, {useState, useEffect, useContext} from "react";
import { CartesianGrid } from "recharts/lib/cartesian/CartesianGrid";
import { Tooltip } from "recharts/lib/component/Tooltip"; 
import { XAxis } from "recharts/lib/cartesian/XAxis";
import { YAxis } from "recharts/lib/cartesian/YAxis";
import { BarChart } from "recharts/lib/chart/BarChart";
import { Bar } from "recharts/lib/cartesian/Bar";
import { Legend } from "recharts/lib/component/Legend";
import { SectionBalancesCharts } from '../contexts/MyStyled';
import { Brush } from "recharts/lib/cartesian/Brush";
// import { }




export default function BalancesCharts({  theme, userData, isHidden, CustomTick }) {

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
      <BarChart
        width={600}
        height={400}
        data={data}
        margin={{
          top: 5,
          left: 35,
          bottom: 40
        }}
      >
        <CartesianGrid strokeDasharray="3 3" strokeWidth={0.3}/>
      
        <Tooltip
          contentStyle={{ backgroundColor: '#fff', color: '#079164', borderRadius: '4px', padding: '8px' }}
          labelStyle={{ color: 'black', fontWeight: 'bold', textTransform: 'capitalize' }}
          formatter={(value, name, entry, index) => {
            const formattedValue = new Intl.NumberFormat('it-IT', {
              style: 'currency',
              currency: 'EUR',
              maximumFractionDigits: 0,
            }).format(isHidden ? '****' : value);

            // Include the total sum in the legend
            if (name === 'Totale') {
              return [`${name}: ${formattedValue}`];
            }

            return [`${name}: ${formattedValue}`];
          }}
        />
        <Brush dataKey='name' height={10} stroke={theme.textColor} fill={theme.buttonBackgroundColor} />
        <Legend iconSize={12} wrapperStyle={{ fontSize: '10px', marginLeft: '5%', marginTop: '5%' }}/>

        <Bar dataKey={isHidden ? '****' : "Banca"} stackId="a" fill={isHidden ? theme.textColor : "#0D579B"} />
        <Bar dataKey={isHidden ? '****' : "SoldiFisici"} stackId="a" fill={isHidden ? theme.textColor : "#329239"} />
        <Bar dataKey={isHidden ? '****' : "ServiziDigitali"} stackId="a" fill={isHidden ? theme.textColor : "#74b9ff"} />
        <Bar dataKey={isHidden ? '****' : "Azioni"} stackId="a" fill={isHidden ? theme.textColor : "#FF6600"} />
        <Bar dataKey={isHidden ? '****' : "ETF"} stackId="a" fill={isHidden ? theme.textColor : "#a29bfe"} />
        <Bar dataKey={isHidden ? '****' : "Bitcoin"} stackId="a" fill={isHidden ? theme.textColor : "#F7B510"} />
        <Bar dataKey={isHidden ? '****' : "Crypto"} stackId="a" fill={isHidden ? theme.textColor : "#d63031"} />
        
        <XAxis dataKey="name" interval={1} tick={(props) => <CustomTick {...props} textAnchor="middle" fill={theme.textColor} angle={0} fontSize={9} />} />
        <YAxis tick={(props) => <CustomTick {...props} textAnchor="middle" fill={theme.textColor} fontSize={12} dx={-10}/>} />
        

      </BarChart>
    </SectionBalancesCharts>
  );
}


