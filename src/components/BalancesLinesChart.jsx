import React, {useState, useEffect, useContext} from "react";
import { CartesianGrid } from "recharts/lib/cartesian/CartesianGrid";
import { Tooltip } from "recharts/lib/component/Tooltip"; 
import { XAxis } from "recharts/lib/cartesian/XAxis";
import { YAxis } from "recharts/lib/cartesian/YAxis";
import { AreaChart } from "recharts/lib/chart/AreaChart";
import { Area } from "recharts/lib/cartesian/Area";
import { Legend } from "recharts/lib/component/Legend";
import { SectionBalancesCharts } from '../contexts/MyStyled';
import { Brush } from "recharts/lib/cartesian/Brush";




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
        <AreaChart
            width={600}
            height={400}
            data={data}
            margin={{
              top: 5,
              left: 35,
              bottom: 40
            }}
        >
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" strokeWidth={0.3} />
            <XAxis dataKey="name" interval={1} tick={(props) => <CustomTick {...props} textAnchor="middle" fill={theme.textColor} angle={0} fontSize={9}/>} />
            <YAxis tick={(props) => <CustomTick {...props} textAnchor="middle" fill={theme.textColor} fontSize={12} dx={-10}/>} />
            <Tooltip
                contentStyle={{ backgroundColor: '#fff', color: '#079164', borderRadius: '4px', padding: '8px' }}
                labelStyle={{ color: 'black', fontWeight: 'bold', textTransform: 'capitalize' }}
                formatter={(value, name) => {
                    if (value === 0) {
                        return null;
                    }
                    const formattedValue = new Intl.NumberFormat('it-IT', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0,
                    }).format(value);

                    // Include the total sum in the legend
                    return [`${name}: ${formattedValue}`];
                }}
            />
            <Brush dataKey='name' height={10} stroke={theme.textColor} fill={theme.buttonBackgroundColor} />
            <Legend iconSize={12} wrapperStyle={{ fontSize: '10px', marginLeft: '5%', marginTop: '5%'}}/>

            {data.every(item => item.Totale === 0) || <Area type="monotone" dataKey={isHidden ? '****' : "Totale"} stroke={isHidden ? theme.textColor : "#000000"} fillOpacity={0.3} fill={isHidden ? theme.textColor : "#000000"} />}
            {data.every(item => item.Banca === 0) || <Area type="monotone" dataKey={isHidden ? '****' : "Banca"} stroke={isHidden ? theme.textColor : "#0D579B"} fillOpacity={0.3} fill={isHidden ? theme.textColor : "#0D579B"} />}
            {data.every(item => item.SoldiFisici === 0) || <Area type="monotone" dataKey={isHidden ? '****' : "SoldiFisici"} stroke={isHidden ? theme.textColor : "#329239"} fillOpacity={0.3} fill={isHidden ? theme.textColor : "#329239"} />}
            {data.every(item => item.ServiziDigitali === 0) || <Area type="monotone" dataKey={isHidden ? '****' : "ServiziDigitali"} stroke={isHidden ? theme.textColor : "#74b9ff"} fillOpacity={0.3} fill={isHidden ? theme.textColor : "#74b9ff"} />}
            {data.every(item => item.Azioni === 0) || <Area type="monotone" dataKey={isHidden ? '****' : "Azioni"} stroke={isHidden ? theme.textColor : "#FF6600"} fillOpacity={0.3} fill={isHidden ? theme.textColor : "#FF6600"} />}
            {data.every(item => item.ETF === 0) || <Area type="monotone" dataKey={isHidden ? '****' : "ETF"} stroke={isHidden ? theme.textColor : "#a29bfe"} fillOpacity={0.3} fill={isHidden ? theme.textColor : "#a29bfe"} />}
            {data.every(item => item.Bitcoin === 0) || <Area type="monotone" dataKey={isHidden ? '****' : "Bitcoin"} stroke={isHidden ? theme.textColor : "#F7B510"} fillOpacity={0.3} fill={isHidden ? theme.textColor : "#F7B510"} />}
            {data.every(item => item.Crypto === 0) || <Area type="monotone" dataKey={isHidden ? '****' : "Crypto"} stroke={isHidden ? theme.textColor : "#d63031"} fillOpacity={0.3} fill={isHidden ? theme.textColor : "#d63031"} />}
            
            
            
        </AreaChart>
    </SectionBalancesCharts>
  );
}



// import React, { useState, useEffect } from "react";
// import ReactApexChart from "react-apexcharts";

// export default function BalancesLinesChart({ theme, userData, isHidden, CustomTick }) {
//   const [last12MonthsData, setLast12MonthsData] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       if (userData) {
//         try {
//           setLast12MonthsData(userData ? userData.last12MonthsData : []);
//         } catch (error) {
//           console.error('Errore durante le operazioni:', error);
//         }
//       }
//     };

//     fetchData();
//   }, [userData]);

//   const data = last12MonthsData.map((monthData) => {
//     const total = monthData.cashReal + monthData.digitalServicesReal + monthData.stocksReal + monthData.bankReal + monthData.cryptoReal + monthData.etfReal + monthData.bitcoinReal;
//     return {
//       name: monthData.month,
//       SoldiFisici: monthData.cashReal,
//       ServiziDigitali: monthData.digitalServicesReal,
//       Azioni: monthData.stocksReal,
//       Banca: monthData.bankReal,
//       Crypto: monthData.cryptoReal,
//       ETF: monthData.etfReal,
//       Bitcoin: monthData.bitcoinReal,
//       Totale: total,
//       amt: 2400, 
//       };
//   }).reverse();

//   const series = [
//     {
//       name: "Totale",
//       data: data.map(item => item.Totale)
//     },
//     {
//       name: "Banca",
//       data: data.map(item => item.Banca)
//     },
//     {
//       name: "SoldiFisici",
//       data: data.map(item => item.SoldiFisici)
//     },
//     {
//       name: "ServiziDigitali",
//       data: data.map(item => item.ServiziDigitali)
//     },
//     {
//       name: "Azioni",
//       data: data.map(item => item.Azioni)
//     },
//     {
//       name: "ETF",
//       data: data.map(item => item.ETF)
//     },
//     {
//       name: "Bitcoin",
//       data: data.map(item => item.Bitcoin)
//     },
//     {
//       name: "Crypto",
//       data: data.map(item => item.Crypto)
//     },
//   ];

//   const currentYear = new Date().getFullYear(); // or set a specific year if you know it
//   const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

//   const options = {
//     chart: {
//       type: 'area'
//     },
//     dataLabels: {
//       enabled: false
//     },
//     stroke: {
//       curve: 'smooth'
//     },
//     xaxis: {
      
//       categories: data.map(item => new Date(currentYear, monthNames.indexOf(item.name)))
//     },
//     tooltip: {
//       x: {
        
//       },
//     },
//   };

//   return (
//     <div id="chart">
//       <ReactApexChart options={options} series={series} type="area" height={350} />
//     </div>
//   );
// }



{/* <Area type="monotone" dataKey={isHidden ? '****' : "Banca"} stroke={isHidden ? theme.textColor : "#0D579B"} fillOpacity={0.3} fill={isHidden ? theme.textColor : "#0D579B"} />
            <Area type="monotone" dataKey={isHidden ? '****' : "SoldiFisici"} stroke={isHidden ? theme.textColor : "#329239"} fillOpacity={0.3} fill={isHidden ? theme.textColor : "#329239"} />
            <Area type="monotone" dataKey={isHidden ? '****' : "ServiziDigitali"} stroke={isHidden ? theme.textColor : "#74b9ff"} fillOpacity={0.3} fill={isHidden ? theme.textColor : "#74b9ff"} />
            <Area type="monotone" dataKey={isHidden ? '****' : "Azioni"} stroke={isHidden ? theme.textColor : "#FF6600"} fillOpacity={0.3} fill={isHidden ? theme.textColor : "#FF6600"} />
            <Area type="monotone" dataKey={isHidden ? '****' : "ETF"} stroke={isHidden ? theme.textColor : "#a29bfe"} fillOpacity={0.3} fill={isHidden ? theme.textColor : "#a29bfe"} />
            <Area type="monotone" dataKey={isHidden ? '****' : "Bitcoin"} stroke={isHidden ? theme.textColor : "#F7B510"} fillOpacity={0.3} fill={isHidden ? theme.textColor : "#F7B510"} />
            <Area type="monotone" dataKey={isHidden ? '****' : "Crypto"} stroke={isHidden ? theme.textColor : "#d63031"} fillOpacity={0.3} fill={isHidden ? theme.textColor : "#d63031"} />
            <Area type="monotone" dataKey={isHidden ? '****' : "Totale"} stroke={isHidden ? theme.textColor : "#000000"} fillOpacity={0.3} fill={isHidden ? theme.textColor : "#000000"} /> */}


