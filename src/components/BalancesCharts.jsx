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




export default function BalancesCharts({ theme, userData, isHidden, CustomTick }) {
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
    { label: languages[language].assets.cash, key: 'cash' },
    { label: languages[language].assets.digitalServices, key: 'digitalServices' },
    { label: languages[language].assets.stocks, key: 'stocks' },
    { label: languages[language].assets.bank, key: 'bank' },
    { label: languages[language].assets.crypto, key: 'crypto' },
    { label: languages[language].assets.etf, key: 'etf' },
    { label: languages[language].assets.bitcoin, key: 'bitcoin' },
    { label: languages[language].assets.total, key: 'total' },

  ];

  const today = new Date();


  const data = last12MonthsData.map((monthData) => {
    const total = monthData.cashReal + monthData.digitalServicesReal + monthData.stocksReal + monthData.bankReal + monthData.cryptoReal + monthData.etfReal + monthData.bitcoinReal;
    return {
      name: monthData.month,
      cash: monthData.cashReal,
      digitalServices: monthData.digitalServicesReal,
      stocks: monthData.stocksReal,
      bank: monthData.bankReal,
      crypto: monthData.cryptoReal,
      etf: monthData.etfReal,
      bitcoin: monthData.bitcoinReal,
      total: total,
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
          onClick={async () => await downloadExcel(data, headers, `incomesExpenses_${today.getMonth() + 1}-${today.getFullYear().toString().slice(-2)}.xlsx`)}
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

            // Map the simple keys back to translated names
            const nameMap = {
              'cash': languages[language].assets.cash,
              'digitalServices': languages[language].assets.digitalServices,
              'stocks': languages[language].assets.stocks,
              'bank': languages[language].assets.bank,
              'crypto': languages[language].assets.crypto,
              'etf': languages[language].assets.etf,
              'bitcoin': languages[language].assets.bitcoin,
              'total': languages[language].assets.total
            };

            const translatedName = nameMap[name] || name;

            return [formattedValue, translatedName];
          }}
        />
        {/* <Brush dataKey='name' height={15} stroke={theme.textColor} fill={theme.buttonBackgroundColor} /> */}
        <Legend iconSize={12} wrapperStyle={{ fontSize: '10px', marginLeft: '5%', marginTop: '5%' }}/>

        <Bar dataKey="cash" stackId="a" fill={theme.mode === 'dark' ? '#059669' : '#047857'} />
        <Bar dataKey="digitalServices" stackId="a" fill={theme.mode === 'dark' ? '#0891b2' : '#0369a1'} />
        <Bar dataKey="stocks" stackId="a" fill={theme.mode === 'dark' ? '#7c3aed' : '#6b21a8'} />
        <Bar dataKey="bank" stackId="a" fill={theme.mode === 'dark' ? '#dc2626' : '#b91c1c'} />
        <Bar dataKey="crypto" stackId="a" fill={theme.mode === 'dark' ? '#ea580c' : '#c2410c'} />
        <Bar dataKey="etf" stackId="a" fill={theme.mode === 'dark' ? '#65a30d' : '#4d7c0f'} />
        <Bar dataKey="bitcoin" stackId="a" fill={theme.mode === 'dark' ? '#facc15' : '#eab308'} />

        <XAxis dataKey="name" interval={1} tick={(props) => <CustomTick {...props} textAnchor="middle" fill={theme.textColor} angle={0} fontSize={9} />} />
        <YAxis tick={(props) => <CustomTick {...props} textAnchor="middle" fill={theme.textColor} fontSize={12} dx={-10}/>} />


      </BarChart>
    </SectionBalancesCharts>
  );
}