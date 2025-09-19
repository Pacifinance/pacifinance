import React, {useState, useEffect, useContext} from "react";
import { CartesianGrid } from "recharts/lib/cartesian/CartesianGrid";
import { Tooltip } from "recharts/lib/component/Tooltip"; 
import { XAxis } from "recharts/lib/cartesian/XAxis";
import { YAxis } from "recharts/lib/cartesian/YAxis";
import { AreaChart } from "recharts/lib/chart/AreaChart";
import { Area } from "recharts/lib/cartesian/Area";
import { Legend } from "recharts/lib/component/Legend";
import { SectionBalancesCharts } from '../styles/MyStyled';
import { Brush } from "recharts/lib/cartesian/Brush";
import languages from '../data/languages.json';
import { LanguageContext } from '../contexts/LanguageContext';
import { CSVLink } from 'react-csv';
import { BsFiletypeCsv } from "react-icons/bs";
import { RiFileExcel2Line } from "react-icons/ri";
import { downloadExcel } from '../utils/downloadData.jsx';


export default function BalancesLinesChart({theme, userData, isHidden, CustomTick}) {
  const { language } = useContext(LanguageContext);
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


  //headers={headers}
  return (
    <SectionBalancesCharts theme={theme} style={{position: 'relative'}}>
        <CSVLink
          data={data}
          headers={headers}
          filename={`distributionAssets_${today.getMonth() + 1}-${today.getFullYear().toString().slice(-2)}.csv`}
          className="absolute top-[-30px] right-0 px-1 py-1 border border-black shadow-md bg-white text-black no-underline rounded cursor-pointer hover:bg-gray-100"
        >
          <BsFiletypeCsv className="text-paciGreen text-xl" />
        </CSVLink>

        <button
          disabled
          onClick={async () => await downloadExcel(data, headers, `distributionAssets_${today.getMonth() + 1}-${today.getFullYear().toString().slice(-2)}.xlsx`)}
          className="absolute top-[-30px] right-8 px-1 py-1 border border-black shadow-md bg-white text-black no-underline rounded cursor-pointer hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-200"
        >
          <RiFileExcel2Line className="text-paciGreen text-xl" />
        </button>

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
            <CartesianGrid strokeDasharray="3 3" stroke="transparent" vertical={false}/> 
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

                    return [`${translatedName}: ${formattedValue}`];
                }}
            />
            {/* <Brush dataKey='name' height={15} stroke={theme.textColor} fill={theme.buttonBackgroundColor} /> */}
            <Legend iconSize={12} wrapperStyle={{ fontSize: '10px', marginLeft: '5%', marginTop: '5%'}}/>

            {data.every(item => item['total'] === 0) || <Area type="monotone" dataKey={isHidden ? '****' : 'total'} stroke={isHidden ? theme.textColor : "#000000"} fillOpacity={0.3} fill={isHidden ? theme.textColor : "#000000"} />}
            {data.every(item => item['bank'] === 0) || <Area type="monotone" dataKey={isHidden ? '****' : 'bank'} stroke={isHidden ? theme.textColor : "#0D579B"} fillOpacity={0.3} fill={isHidden ? theme.textColor : "#0D579B"} />}
            {data.every(item => item['cash'] === 0) || <Area type="monotone" dataKey={isHidden ? '****' : 'cash'} stroke={isHidden ? theme.textColor : "#329239"} fillOpacity={0.3} fill={isHidden ? theme.textColor : "#329239"} />}
            {data.every(item => item['digitalServices']=== 0) || <Area type="monotone" dataKey={isHidden ? '****' : 'digitalServices'} stroke={isHidden ? theme.textColor : "#74b9ff"} fillOpacity={0.3} fill={isHidden ? theme.textColor : "#74b9ff"} />}
            {data.every(item => item['stocks'] === 0) || <Area type="monotone" dataKey={isHidden ? '****' : 'stocks'} stroke={isHidden ? theme.textColor : "#FF6600"} fillOpacity={0.3} fill={isHidden ? theme.textColor : "#FF6600"} />}
            {data.every(item => item['etf'] === 0) || <Area type="monotone" dataKey={isHidden ? '****' : 'etf'} stroke={isHidden ? theme.textColor : "#a29bfe"} fillOpacity={0.3} fill={isHidden ? theme.textColor : "#a29bfe"} />}
            {data.every(item => item['bitcoin'] === 0) || <Area type="monotone" dataKey={isHidden ? '****' : 'bitcoin'} stroke={isHidden ? theme.textColor : "#F7B510"} fillOpacity={0.3} fill={isHidden ? theme.textColor : "#F7B510"} />}
            {data.every(item => item['crypto'] === 0) || <Area type="monotone" dataKey={isHidden ? '****' : 'crypto'} stroke={isHidden ? theme.textColor : "#d63031"} fillOpacity={0.3} fill={isHidden ? theme.textColor : "#d63031"} />}



        </AreaChart>
    </SectionBalancesCharts>
  );
}