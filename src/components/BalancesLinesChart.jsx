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
import { assetColors, getAssetColor } from '../data/assetColors.js';
export default function BalancesLinesChart({theme, userData, isHidden, CustomTick}) {
  const { language } = useContext(LanguageContext);
  const [last12MonthsData, setLast12MonthsData] = useState([]);
  const [containerWidth, setContainerWidth] = useState(800);

  // Gestione responsive
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setContainerWidth(Math.min(width - 60, 400));
      } else if (width < 1024) {
        setContainerWidth(Math.min(width - 120, 600));
      } else {
        setContainerWidth(Math.min(width - 200, 800));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

        <div style={{ 
          width: '100%', 
          height: '450px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '2rem',
          overflow: 'hidden'
        }}>
        <AreaChart
            width={containerWidth}
            height={400}
            data={data}
            margin={{
              top: 5,
              left: 35,
              bottom: 40
            }}
        >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 
              vertical={false}
            /> 
            <XAxis 
              dataKey="name" 
              interval={containerWidth < 500 ? 1 : 0}
              tick={(props) => <CustomTick 
                {...props} 
                textAnchor="middle" 
                fill={theme.textColor} 
                angle={containerWidth < 500 ? -45 : 0} 
                fontSize={containerWidth < 500 ? 9 : 11}
                fontWeight={500}
              />}
              height={containerWidth < 500 ? 80 : 60}
              axisLine={{ 
                stroke: theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                strokeWidth: 1
              }}
              tickLine={{ 
                stroke: theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
              }}
            />
            <YAxis 
              tick={(props) => <CustomTick 
                {...props} 
                textAnchor="end" 
                fill={theme.textColor} 
                fontSize={containerWidth < 500 ? 10 : 12}
                fontWeight={500}
                dx={-5}
              />}
              axisLine={{ 
                stroke: theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                strokeWidth: 1
              }}
              tickLine={{ 
                stroke: theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
              }}
            />
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

            {data.every(item => item['total'] === 0) || <Area type="monotone" dataKey={isHidden ? '****' : 'total'} stroke={isHidden ? theme.textColor : assetColors.totalBalance} fillOpacity={0.3} fill={isHidden ? theme.textColor : assetColors.totalBalance} />}
            {data.every(item => item['bank'] === 0) || <Area type="monotone" dataKey={isHidden ? '****' : 'bank'} stroke={isHidden ? theme.textColor : getAssetColor('bank', theme.mode)} fillOpacity={0.3} fill={isHidden ? theme.textColor : getAssetColor('bank', theme.mode)} />}
            {data.every(item => item['cash'] === 0) || <Area type="monotone" dataKey={isHidden ? '****' : 'cash'} stroke={isHidden ? theme.textColor : getAssetColor('cash', theme.mode)} fillOpacity={0.3} fill={isHidden ? theme.textColor : getAssetColor('cash', theme.mode)} />}
            {data.every(item => item['digitalServices']=== 0) || <Area type="monotone" dataKey={isHidden ? '****' : 'digitalServices'} stroke={isHidden ? theme.textColor : getAssetColor('digitalServices', theme.mode)} fillOpacity={0.3} fill={isHidden ? theme.textColor : getAssetColor('digitalServices', theme.mode)} />}
            {data.every(item => item['stocks'] === 0) || <Area type="monotone" dataKey={isHidden ? '****' : 'stocks'} stroke={isHidden ? theme.textColor : getAssetColor('stocks', theme.mode)} fillOpacity={0.3} fill={isHidden ? theme.textColor : getAssetColor('stocks', theme.mode)} />}
            {data.every(item => item['etf'] === 0) || <Area type="monotone" dataKey={isHidden ? '****' : 'etf'} stroke={isHidden ? theme.textColor : getAssetColor('etf', theme.mode)} fillOpacity={0.3} fill={isHidden ? theme.textColor : getAssetColor('etf', theme.mode)} />}
            {data.every(item => item['bitcoin'] === 0) || <Area type="monotone" dataKey={isHidden ? '****' : 'bitcoin'} stroke={isHidden ? theme.textColor : getAssetColor('bitcoin', theme.mode)} fillOpacity={0.3} fill={isHidden ? theme.textColor : getAssetColor('bitcoin', theme.mode)} />}
            {data.every(item => item['crypto'] === 0) || <Area type="monotone" dataKey={isHidden ? '****' : 'crypto'} stroke={isHidden ? theme.textColor : getAssetColor('crypto', theme.mode)} fillOpacity={0.3} fill={isHidden ? theme.textColor : getAssetColor('crypto', theme.mode)} />}

        </AreaChart>
        </div>
    </SectionBalancesCharts>
  );
}