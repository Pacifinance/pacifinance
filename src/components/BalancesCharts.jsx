import React, {useState, useEffect, useContext} from "react";
import { UserContext } from '../contexts/UserContext';
import { CartesianGrid } from "recharts/lib/cartesian/CartesianGrid";
import { Tooltip } from "recharts/lib/component/Tooltip"; 
import { XAxis } from "recharts/lib/cartesian/XAxis";
import { YAxis } from "recharts/lib/cartesian/YAxis";
import { BarChart } from "recharts/lib/chart/BarChart";
import { Bar } from "recharts/lib/cartesian/Bar";
import { Legend } from "recharts/lib/component/Legend";
import { SectionBalancesCharts } from '../contexts/MyStyled';
import { ThemeContext } from '../contexts/ThemeContext';




export default function BalancesCharts() {

  const { userData } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);
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
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis tick={{fontSize: 9}} interval={1} dataKey="name" />
        <YAxis tick={{fontSize: 12}} />
        <Tooltip
            contentStyle={{ backgroundColor: '#fff', color: '#079164', borderRadius: '4px', padding: '8px' }}
            labelStyle={{ color: 'black', fontWeight: 'bold', textTransform: 'capitalize' }}
            formatter={(value, name, entry, index) => {
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
        
        
        <Bar dataKey="Banca" stackId="a" fill="#0D579B" />
        <Bar dataKey="SoldiFisici" stackId="a" fill="#329239" />
        <Bar dataKey="ServiziDigitali" stackId="a" fill="#74b9ff" />
        <Bar dataKey="Azioni" stackId="a" fill="#FF6600" />
        <Bar dataKey="ETF" stackId="a" fill="#a29bfe" />
        <Bar dataKey="Bitcoin" stackId="a" fill="#F7B510" />
        <Bar dataKey="Crypto" stackId="a" fill="#d63031" />
        
        
  
        

      </BarChart>
    </SectionBalancesCharts>
  );
}


