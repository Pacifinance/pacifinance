import React, {useState, useEffect, useContext} from "react";
import { CartesianGrid } from "recharts/lib/cartesian/CartesianGrid";
import { Tooltip } from "recharts/lib/component/Tooltip"; 
import { XAxis } from "recharts/lib/cartesian/XAxis";
import { YAxis } from "recharts/lib/cartesian/YAxis";
import { BarChart } from "recharts/lib/chart/BarChart";
import { Bar } from "recharts/lib/cartesian/Bar";
import { Legend } from "recharts/lib/component/Legend";
import { SectionBalancesCharts } from '../styles/MyStyled';
import { Brush } from "recharts/lib/cartesian/Brush";
import languages from '../data/languages.json';
import { LanguageContext } from '../contexts/LanguageContext';
import { CSVLink } from 'react-csv';
import { BsFiletypeCsv } from "react-icons/bs";
import { RiFileExcel2Line } from "react-icons/ri";
import { downloadExcel } from '../utils/downloadData.jsx';
// import { }




export default function BalancesCharts({  theme, userData, isHidden, CustomTick }) {
  const { language } = useContext(LanguageContext);
  const [last12MonthsData, setLast12MonthsData] = useState([]);

  // const { SectionBalancesCharts } = MyStyled();

  useEffect(() => {
    const fetchData = async () => {
      if (userData) {
        try {

          setLast12MonthsData(userData ? userData.last12MonthsData : []);
            
    
        } catch (error) {
          console.error('Error:', error);
        }
      }
    };

  fetchData();
  }, [userData]);

  const headers = [
    { label: languages[language].general.month, key: 'name' },
    { label: languages[language].assets.cash, key: languages[language].assets.cash },
    { label: languages[language].assets.digitalServices, key: languages[language].assets.digitalServices },
    { label: languages[language].assets.stocks, key: languages[language].assets.stocks },
    { label: languages[language].assets.bank, key: languages[language].assets.bank },
    { label: languages[language].assets.crypto, key: languages[language].assets.crypto },
    { label: languages[language].assets.etf, key: languages[language].assets.etf },
    { label: languages[language].assets.bitcoin, key: languages[language].assets.bitcoin },
    { label: languages[language].assets.total, key: languages[language].assets.total },
    
  ];

  const today = new Date();


  const data = last12MonthsData.map((monthData) => {
    const total = monthData.cashReal + monthData.digitalServicesReal + monthData.stocksReal + monthData.bankReal + monthData.cryptoReal + monthData.etfReal + monthData.bitcoinReal;

    return {
      name: monthData.month,
      [languages[language].assets.cash]: monthData.cashReal,
      [languages[language].assets.digitalServices]: monthData.digitalServicesReal,
      [languages[language].assets.stocks]: monthData.stocksReal,
      [languages[language].assets.bank]: monthData.bankReal,
      [languages[language].assets.crypto]: monthData.cryptoReal,
      [languages[language].assets.etf]: monthData.etfReal,
      [languages[language].assets.bitcoin]: monthData.bitcoinReal,
      [languages[language].assets.total]: total,
      amt: 2400, 
    };
  }).reverse(); //reverse() to have the last month on the right

  return (
    <SectionBalancesCharts theme={theme} style={{ position: 'relative' }}>
      <CSVLink data={data} headers={headers}
        filename={`incomesExpenses_${today.getMonth() + 1}-${today.getFullYear().toString().slice(-2)}.csv`} 
        className="absolute top-[-30px] right-0 px-1 py-1 border border-black shadow-md bg-white text-black no-underline rounded cursor-pointer hover:bg-gray-100"
      >
        <BsFiletypeCsv className="text-paciGreen text-xl" />
      </CSVLink>

      <button
          disabled
          onClick={() => downloadExcel(data, headers, `incomesExpenses_${today.getMonth() + 1}-${today.getFullYear().toString().slice(-2)}.xlsx`)}
          className="absolute top-[-30px] right-8 px-1 py-1 border border-black shadow-md bg-white text-black no-underline rounded cursor-pointer hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-200"
        >
          <RiFileExcel2Line className="text-paciGreen text-xl" />
      </button>

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
        <CartesianGrid strokeDasharray="3 3" stroke="transparent" vertical={false}/>
      
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
        <Brush dataKey='name' height={15} stroke={theme.textColor} fill={theme.buttonBackgroundColor} />
        <Legend iconSize={12} wrapperStyle={{ fontSize: '10px', marginLeft: '5%', marginTop: '5%' }}/>

        <Bar dataKey={isHidden ? '****' : languages[language].assets.bank} stackId="a" fill={isHidden ? theme.textColor : "#0D579B"} />
        <Bar dataKey={isHidden ? '****' : languages[language].assets.cash} stackId="a" fill={isHidden ? theme.textColor : "#329239"} />
        <Bar dataKey={isHidden ? '****' : languages[language].assets.digitalServices} stackId="a" fill={isHidden ? theme.textColor : "#74b9ff"} />
        <Bar dataKey={isHidden ? '****' : languages[language].assets.stocks} stackId="a" fill={isHidden ? theme.textColor : "#FF6600"} />
        <Bar dataKey={isHidden ? '****' : languages[language].assets.etf} stackId="a" fill={isHidden ? theme.textColor : "#a29bfe"} />
        <Bar dataKey={isHidden ? '****' : languages[language].assets.bitcoin} stackId="a" fill={isHidden ? theme.textColor : "#F7B510"} />
        <Bar dataKey={isHidden ? '****' : languages[language].assets.crypto} stackId="a" fill={isHidden ? theme.textColor : "#d63031"} />
        
        <XAxis dataKey="name" interval={1} tick={(props) => <CustomTick {...props} textAnchor="middle" fill={theme.textColor} angle={0} fontSize={9} />} />
        <YAxis tick={(props) => <CustomTick {...props} textAnchor="middle" fill={theme.textColor} fontSize={12} dx={-10}/>} />
        

      </BarChart>
    </SectionBalancesCharts>
  );
}


