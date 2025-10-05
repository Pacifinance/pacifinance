import React, {useState, useEffect, useContext} from "react";
import { CartesianGrid } from "recharts/lib/cartesian/CartesianGrid";
import { Tooltip } from "recharts/lib/component/Tooltip";
import { XAxis } from "recharts/lib/cartesian/XAxis";
import { YAxis } from "recharts/lib/cartesian/YAxis";
import { BarChart } from "recharts/lib/chart/BarChart";
import { Bar } from "recharts/lib/cartesian/Bar";
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

/**
 * Componente unificato per grafici dei bilanci
 * @param {string} type - Tipo di grafico: "bar" o "area"
 * @param {Object} theme - Tema dell'applicazione
 * @param {Object} userData - Dati utente
 * @param {boolean} isHidden - Privacy mode
 * @param {Component} CustomTick - Componente custom per i tick degli assi
 */
export default function BalancesChart({ type = "bar", theme, userData, isHidden, CustomTick }) {
  const { language } = useContext(LanguageContext);
  const [last12MonthsData, setLast12MonthsData] = useState([]);
  const [containerWidth, setContainerWidth] = useState(800);
  const [selectedPeriod, setSelectedPeriod] = useState('6m');

  // Funzione per filtrare i dati in base al periodo selezionato
  const getFilteredData = () => {
    const allData = last12MonthsData.map((monthData) => {
      const total = monthData.cashReal + monthData.digitalServicesReal + monthData.stocksReal + monthData.bankReal + monthData.cryptoReal + monthData.etfReal + monthData.bitcoinReal + (monthData.bondReal || 0) + (monthData.fundsReal || 0) + (monthData.goldReal || 0);
      return {
        name: monthData.month,
        cash: monthData.cashReal,
        digitalServices: monthData.digitalServicesReal,
        stocks: monthData.stocksReal,
        bank: monthData.bankReal,
        crypto: monthData.cryptoReal,
        etf: monthData.etfReal,
        bitcoin: monthData.bitcoinReal,
        bond: monthData.bondReal || 0,
        funds: monthData.fundsReal || 0,
        gold: monthData.goldReal || 0,
        total: total,
        amt: 2400, 
      };
    });

    // Filtra in base al periodo selezionato
    switch(selectedPeriod) {
      case '3m':
        return allData.slice(-3); // Ultimi 3 mesi
      case '6m':
        return allData.slice(-6); // Ultimi 6 mesi
      case '1y':
        return allData; // Tutti i 12 mesi
      case '2y':
      case 'all':
        return allData; // Per ora stesso dei 12 mesi
      default:
        return allData;
    }
  };

  // Gestione responsive
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const dataLength = getFilteredData().length;
      
      // Adatta la larghezza in base al numero di punti dati
      let baseWidth;
      if (width < 768) {
        baseWidth = Math.min(width - 40, 500);
      } else if (width < 1024) {
        baseWidth = Math.min(width - 80, 750);
      } else {
        baseWidth = Math.min(width - 120, 1000);
      }
      
      // Riduci la larghezza per periodi più corti per una migliore visualizzazione
      if (dataLength <= 3) {
        setContainerWidth(Math.min(baseWidth * 0.7, 500));
      } else if (dataLength <= 6) {
        setContainerWidth(Math.min(baseWidth * 0.85, 650));
      } else {
        setContainerWidth(baseWidth);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedPeriod, last12MonthsData]);

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

  // Headers per export comuni
  const headers = [
    { label: languages[language].general.month, key: 'name' },
    { label: languages[language].assets.cash, key: 'cash' },
    { label: languages[language].assets.digitalServices, key: 'digitalServices' },
    { label: languages[language].assets.stocks, key: 'stocks' },
    { label: languages[language].assets.bank, key: 'bank' },
    { label: languages[language].assets.crypto, key: 'crypto' },
    { label: languages[language].assets.etf, key: 'etf' },
    { label: languages[language].assets.bitcoin, key: 'bitcoin' },
    { label: languages[language].assets.bond, key: 'bond' },
    { label: languages[language].assets.funds, key: 'funds' },
    { label: languages[language].assets.gold, key: 'gold' },
    { label: languages[language].assets.total, key: 'total' },
  ];

  const today = new Date();

  const data = getFilteredData();

  // Componente Tooltip condiviso
  const renderTooltip = () => (
    <Tooltip
      position={{ x: undefined, y: undefined }}
      allowEscapeViewBox={{ x: false, y: false }}
      contentStyle={{ 
        backgroundColor: theme.mode === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)', 
        color: theme.textColor,
        borderRadius: '12px', 
        padding: '12px',
        border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        backdropFilter: 'blur(10px)',
        fontSize: '14px'
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
        
        // Mappa i nomi inglesi a quelli localizzati
        const nameMap = {
          'cash': languages[language].assets.cash,
          'digitalServices': languages[language].assets.digitalServices,
          'stocks': languages[language].assets.stocks,
          'bank': languages[language].assets.bank,
          'crypto': languages[language].assets.crypto,
          'etf': languages[language].assets.etf,
          'bitcoin': languages[language].assets.bitcoin,
          'bond': languages[language].assets.bond,
          'funds': languages[language].assets.funds,
          'gold': languages[language].assets.gold,
          'total': languages[language].assets.total
        };

        const translatedName = nameMap[name] || name;
        return [formattedValue, translatedName];
      }}
    />
  );

  // Componente Legenda condivisa
  const renderLegend = () => (
    <Legend 
      iconSize={16} 
      wrapperStyle={{ 
        fontSize: containerWidth < 500 ? '16px' : '18px',
        fontWeight: 500,
        paddingTop: type === 'bar' ? '10px' : '5px',
        textAlign: 'center'
      }}
    />
  );

  // Rendering del grafico a barre
  const renderBarChart = () => (
    <BarChart
      width={containerWidth}
      height={550}
      data={data}
      margin={{
        top: 60,
        left: containerWidth < 768 ? 20 : 40,
        right: containerWidth < 768 ? 20 : 30,
        bottom: containerWidth < 768 ? 5 : 10
      }}
    >
      <CartesianGrid 
        strokeDasharray="3 3" 
        stroke={theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 
        vertical={false}
      />

      {renderTooltip()}

      <XAxis 
        dataKey="name" 
        interval={containerWidth < 500 ? 1 : 0}
        tick={(props) => <CustomTick 
          {...props} 
          theme={theme} 
          fontSize={containerWidth < 500 ? 14 : 16}
          maxWidth={containerWidth < 768 ? 60 : 80}
          fill="#ffffff"
          dy={15}
          dx={-5}
          angle={-15}
          textAnchor="end"
        />}
        height={containerWidth < 500 ? 100 : 80}
        axisLine={{ stroke: theme.textColor, strokeWidth: 1 }}
        tickLine={{ stroke: theme.textColor, strokeWidth: 1 }}
      />
      
      <YAxis 
        tick={(props) => <CustomTick 
          {...props} 
          textAnchor="end" 
          fill={theme.textColor} 
          fontSize={containerWidth < 500 ? 14 : 16}
          fontWeight={500}
          dx={-5}
        />}
        tickFormatter={(value) => isHidden ? '****' : value}
        axisLine={{ 
          stroke: theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
          strokeWidth: 1
        }}
        tickLine={{ 
          stroke: theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
        }}
      />

      {/* {renderLegend()} */}

      {/* Styled bars with centralized colors */}
      <Bar dataKey="cash" stackId="a" fill={isHidden ? '#808080' : getAssetColor('cash', theme.mode)} radius={[0, 0, 0, 0]} />
      <Bar dataKey="digitalServices" stackId="a" fill={isHidden ? '#909090' : getAssetColor('digitalServices', theme.mode)} radius={[0, 0, 0, 0]} />
      <Bar dataKey="stocks" stackId="a" fill={isHidden ? '#A0A0A0' : getAssetColor('stocks', theme.mode)} radius={[0, 0, 0, 0]} />
      <Bar dataKey="bank" stackId="a" fill={isHidden ? '#B0B0B0' : getAssetColor('bank', theme.mode)} radius={[0, 0, 0, 0]} />
      <Bar dataKey="crypto" stackId="a" fill={isHidden ? '#C0C0C0' : getAssetColor('crypto', theme.mode)} radius={[0, 0, 0, 0]} />
      <Bar dataKey="etf" stackId="a" fill={isHidden ? '#D0D0D0' : getAssetColor('etf', theme.mode)} radius={[0, 0, 0, 0]} />
      <Bar dataKey="bitcoin" stackId="a" fill={isHidden ? '#E0E0E0' : getAssetColor('bitcoin', theme.mode)} radius={[0, 0, 0, 0]} />
      <Bar dataKey="bond" stackId="a" fill={isHidden ? '#F0F0F0' : getAssetColor('bond', theme.mode)} radius={[0, 0, 0, 0]} />
      <Bar dataKey="funds" stackId="a" fill={isHidden ? '#E8E8E8' : getAssetColor('funds', theme.mode)} radius={[0, 0, 0, 0]} />
      <Bar dataKey="gold" stackId="a" fill={isHidden ? '#F8F8F8' : getAssetColor('gold', theme.mode)} radius={[4, 4, 0, 0]} />
      
      {/* <Brush dataKey='name' height={containerWidth < 500 ? 80 : 60} stroke={theme.textColor} fill={theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} /> */}
    </BarChart>
  );

  // Rendering del grafico ad area
  const renderAreaChart = () => (
    <AreaChart
      width={containerWidth}
      height={550}
      data={data}
      margin={{
        top: 50,
        left: containerWidth < 768 ? 20 : 40,
        right: containerWidth < 768 ? 20 : 30,
        bottom: containerWidth < 768 ? 15 : 20
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
          theme={theme} 
          fontSize={containerWidth < 500 ? 14 : 16}
          maxWidth={containerWidth < 768 ? 60 : 80}
          fill="#ffffff"
          dy={15}
          dx={-5}
          angle={-15}
          textAnchor="end"
        />}
        height={containerWidth < 500 ? 100 : 80}
        axisLine={{ stroke: theme.textColor, strokeWidth: 1 }}
        tickLine={{ stroke: theme.textColor, strokeWidth: 1 }}
      />
      
      <YAxis 
        tick={(props) => <CustomTick 
          {...props} 
          textAnchor="end" 
          fill={theme.textColor} 
          fontSize={containerWidth < 500 ? 14 : 16}
          fontWeight={500}
          dx={-5}
        />}
        tickFormatter={(value) => isHidden ? '****' : value}
        axisLine={{ 
          stroke: theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
          strokeWidth: 1
        }}
        tickLine={{ 
          stroke: theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
        }}
      />
      
      {renderTooltip()} 

      {/* {renderLegend()} */}

      {/* Areas with centralized colors */}
      {data.every(item => item['total'] === 0) || <Area type="monotone" dataKey={'total'} stroke={isHidden ? '#606060' : assetColors.totalBalance} fillOpacity={0.3} fill={isHidden ? '#606060' : assetColors.totalBalance} />}
      {data.every(item => item['bank'] === 0) || <Area type="monotone" dataKey={'bank'} stroke={isHidden ? '#707070' : getAssetColor('bank', theme.mode)} fillOpacity={0.3} fill={isHidden ? '#707070' : getAssetColor('bank', theme.mode)} />}
      {data.every(item => item['cash'] === 0) || <Area type="monotone" dataKey={'cash'} stroke={isHidden ? '#808080' : getAssetColor('cash', theme.mode)} fillOpacity={0.3} fill={isHidden ? '#808080' : getAssetColor('cash', theme.mode)} />}
      {data.every(item => item['digitalServices']=== 0) || <Area type="monotone" dataKey={'digitalServices'} stroke={isHidden ? '#909090' : getAssetColor('digitalServices', theme.mode)} fillOpacity={0.3} fill={isHidden ? '#909090' : getAssetColor('digitalServices', theme.mode)} />}
      {data.every(item => item['stocks'] === 0) || <Area type="monotone" dataKey={'stocks'} stroke={isHidden ? '#A0A0A0' : getAssetColor('stocks', theme.mode)} fillOpacity={0.3} fill={isHidden ? '#A0A0A0' : getAssetColor('stocks', theme.mode)} />}
      {data.every(item => item['crypto'] === 0) || <Area type="monotone" dataKey={'crypto'} stroke={isHidden ? '#B0B0B0' : getAssetColor('crypto', theme.mode)} fillOpacity={0.3} fill={isHidden ? '#B0B0B0' : getAssetColor('crypto', theme.mode)} />}
      {data.every(item => item['etf'] === 0) || <Area type="monotone" dataKey={'etf'} stroke={isHidden ? '#C0C0C0' : getAssetColor('etf', theme.mode)} fillOpacity={0.3} fill={isHidden ? '#C0C0C0' : getAssetColor('etf', theme.mode)} />}
      {data.every(item => item['bitcoin'] === 0) || <Area type="monotone" dataKey={'bitcoin'} stroke={isHidden ? '#D0D0D0' : getAssetColor('bitcoin', theme.mode)} fillOpacity={0.3} fill={isHidden ? '#D0D0D0' : getAssetColor('bitcoin', theme.mode)} />}
      {data.every(item => item['bond'] === 0) || <Area type="monotone" dataKey={'bond'} stroke={isHidden ? '#E0E0E0' : getAssetColor('bond', theme.mode)} fillOpacity={0.3} fill={isHidden ? '#E0E0E0' : getAssetColor('bond', theme.mode)} />}
      {data.every(item => item['funds'] === 0) || <Area type="monotone" dataKey={'funds'} stroke={isHidden ? '#E8E8E8' : getAssetColor('funds', theme.mode)} fillOpacity={0.3} fill={isHidden ? '#E8E8E8' : getAssetColor('funds', theme.mode)} />}
      {data.every(item => item['gold'] === 0) || <Area type="monotone" dataKey={'gold'} stroke={isHidden ? '#F0F0F0' : getAssetColor('gold', theme.mode)} fillOpacity={0.3} fill={isHidden ? '#F0F0F0' : getAssetColor('gold', theme.mode)} />}
    </AreaChart>
  );

  return (
    <SectionBalancesCharts theme={theme} style={{position: 'relative', height: '100%'}}>
      {/* Time Period Selector */}
      <div className="absolute top-0 left-0 flex gap-1 z-10 p-2">
        {['3m', '6m', '1y', '2y', 'all'].map((period) => {
          const isDisabled = period === '2y' || period === 'all';
          const isActive = selectedPeriod === period;
          
          return (
            <button
              key={period}
              onClick={() => !isDisabled && setSelectedPeriod(period)}
              disabled={isDisabled}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                isDisabled 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'hover:scale-105'
              }`}
              style={{
                backgroundColor: isActive 
                  ? (theme.mode === 'dark' ? 'rgba(7, 145, 100, 0.8)' : 'rgba(7, 145, 100, 0.9)')
                  : (theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)'),
                color: isActive 
                  ? '#ffffff' 
                  : (isDisabled 
                    ? (theme.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')
                    : (theme.mode === 'dark' ? '#ffffff' : '#333333')),
                border: `1px solid ${isActive 
                  ? 'rgba(7, 145, 100, 0.8)' 
                  : (theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)')}`,
                backdropFilter: 'blur(10px)'
              }}
            >
              {period.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Export buttons */}
      <div className="absolute top-0 right-0 flex gap-2 z-10 p-2">
        <CSVLink
          data={data}
          headers={headers}
          filename={`distributionAssets_${type}_${today.getMonth() + 1}-${today.getFullYear().toString().slice(-2)}.csv`}
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
          onClick={async () => await downloadExcel(data, headers, `distributionAssets_${type}_${today.getMonth() + 1}-${today.getFullYear().toString().slice(-2)}.xlsx`)}
          className="flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
            borderColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <RiFileExcel2Line className="text-paciGreen text-lg" />
        </button>
      </div>

      <div style={{ 
        width: '100%', 
        height: '550px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '0.5rem',
        padding: '0 1rem',
        overflow: 'hidden'
      }}>
        {type === 'bar' ? renderBarChart() : renderAreaChart()}
      </div>
    </SectionBalancesCharts>
  );
}