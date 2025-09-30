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
import { assetColors, getAssetColor } from '../data/assetColors.js';
// import { }




export default function BalancesCharts({ theme, userData, isHidden, CustomTick }) {
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
    <SectionBalancesCharts theme={theme} style={{ position: 'relative', padding: '1rem' }}>
      {/* Export buttons */}
      <div className="absolute top-0 right-0 flex gap-2 z-10">
        <CSVLink 
          data={data} 
          headers={headers}
          filename={`distributionAssets_${today.getMonth() + 1}-${today.getFullYear().toString().slice(-2)}.csv`} 
          className="flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
            borderColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <BsFiletypeCsv className="text-paciGreen text-lg" />
        </CSVLink>

        <button
          disabled
          onClick={async () => await downloadExcel(data, headers, `distributionAssets_${today.getMonth() + 1}-${today.getFullYear().toString().slice(-2)}.xlsx`)}
          className="flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
            borderColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <RiFileExcel2Line className="text-paciGreen text-lg" />
        </button>
      </div>

      {/* Responsive chart container */}
      <div style={{ 
        width: '100%', 
        height: '450px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '2rem',
        overflow: 'hidden'
      }}>
        <BarChart
          width={containerWidth}
          height={400}
          data={data}
          margin={{
            top: 20,
            left: 35,
            right: 20,
            bottom: 60
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 
            vertical={false}
          />

          <Tooltip
            contentStyle={{ 
              backgroundColor: theme.mode === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)', 
              color: theme.textColor,
              borderRadius: '12px', 
              padding: '12px',
              border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(10px)'
            }}
            labelStyle={{ 
              color: theme.textColor, 
              fontWeight: 'bold', 
              textTransform: 'capitalize',
              marginBottom: '4px'
            }}
            formatter={(value, name, entry, index) => {
              if (isHidden) return ['****'];
              
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
              return [formattedValue, translatedName];
            }}
          />
          
          <Legend 
            iconSize={12} 
            wrapperStyle={{ 
              fontSize: containerWidth < 500 ? '10px' : '12px',
              fontWeight: 500,
              paddingTop: '15px'
            }}
          />

          {/* Styled bars with centralized colors */}
          <Bar 
            dataKey="cash" 
            stackId="a" 
            fill={getAssetColor('cash', theme.mode)}
            radius={[0, 0, 0, 0]}
          />
          <Bar 
            dataKey="digitalServices" 
            stackId="a" 
            fill={getAssetColor('digitalServices', theme.mode)}
            radius={[0, 0, 0, 0]}
          />
          <Bar 
            dataKey="stocks" 
            stackId="a" 
            fill={getAssetColor('stocks', theme.mode)}
            radius={[0, 0, 0, 0]}
          />
          <Bar 
            dataKey="bank" 
            stackId="a" 
            fill={getAssetColor('bank', theme.mode)}
            radius={[0, 0, 0, 0]}
          />
          <Bar 
            dataKey="crypto" 
            stackId="a" 
            fill={getAssetColor('crypto', theme.mode)}
            radius={[0, 0, 0, 0]}
          />
          <Bar 
            dataKey="etf" 
            stackId="a" 
            fill={getAssetColor('etf', theme.mode)}
            radius={[0, 0, 0, 0]}
          />
          <Bar 
            dataKey="bitcoin" 
            stackId="a" 
            fill={getAssetColor('bitcoin', theme.mode)}
            radius={[2, 2, 0, 0]}
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
        </BarChart>
      </div>
    </SectionBalancesCharts>
  );
}