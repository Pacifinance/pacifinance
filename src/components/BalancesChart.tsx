import React, {useState, useEffect, useContext} from "react";
import { CartesianGrid } from "recharts/lib/cartesian/CartesianGrid";
import { Tooltip } from "recharts/lib/component/Tooltip";
import { XAxis } from "recharts/lib/cartesian/XAxis";
import { YAxis } from "recharts/lib/cartesian/YAxis";
import { BarChart } from "recharts/lib/chart/BarChart";
import { Bar } from "recharts/lib/cartesian/Bar";
import { AreaChart } from "recharts/lib/chart/AreaChart";
import { Area } from "recharts/lib/cartesian/Area";
import { ResponsiveContainer } from "recharts/lib/component/ResponsiveContainer";
import { SectionBalancesCharts } from '../styles/MyStyled';
import { Brush } from "recharts/lib/cartesian/Brush";
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { UserContext } from '../contexts/UserContext';
import { CSVLink } from 'react-csv';
import { BsFiletypeCsv } from "react-icons/bs";
import { RiFileExcel2Line } from "react-icons/ri";
import { downloadExcel } from '../utils/downloadData.jsx';
import { assetColors, getAssetColor } from '../data/assetColors.js';
import { getBalanceChartData } from '../utils/userDataSelectors.js';
import { compactNumber, CustomTick } from '../utils/customGraphsInfo.jsx';

/**
 * Componente unificato per grafici dei bilanci
 * @param {string} type - Tipo di grafico: "bar" o "area"
 * @param {Object} theme - Tema dell'applicazione
 * @param {Object} userData - Dati utente
 * @param {boolean} isHidden - Privacy mode
 * @param {Component} CustomTick - Componente custom per i tick degli assi
 */
function BalancesChart({ type = "bar", theme, userData, isHidden }) {
  const { translations } = useContext(LanguageContext);
  const { formatAmount, fromEUR } = useContext(CurrencyContext);
  const { fetchAllTimeBalances } = useContext(UserContext) || {};
  const [last12MonthsData, setLast12MonthsData] = useState([]);
  const [containerWidth, setContainerWidth] = useState(800);
  const [selectedPeriod, setSelectedPeriod] = useState('6m');
  const [customStartMonth, setCustomStartMonth] = useState('');
  const [customEndMonth, setCustomEndMonth] = useState('');
  const [isLoadingFullHistory, setIsLoadingFullHistory] = useState(false);
  const [hasFullHistory, setHasFullHistory] = useState(false);

  const buildAllData = () => last12MonthsData.map((monthData) => {
    const total = monthData.cashReal + monthData.digitalServicesReal + monthData.stocksReal + monthData.bankReal + monthData.cryptoReal + monthData.etfReal + monthData.bitcoinReal + (monthData.bondsReal || 0) + (monthData.fundsReal || 0) + (monthData.goldReal || 0) + (monthData.emergencyFundReal || 0);
    return {
      name: monthData.month,
      cash: monthData.cashReal,
      digitalServices: monthData.digitalServicesReal,
      stocks: monthData.stocksReal,
      bank: monthData.bankReal,
      crypto: monthData.cryptoReal,
      etf: monthData.etfReal,
      bitcoin: monthData.bitcoinReal,
      bonds: monthData.bondsReal || 0,
      funds: monthData.fundsReal || 0,
      gold: monthData.goldReal || 0,
      emergencyFund: monthData.emergencyFundReal || 0,
      total,
      amt: 2400,
    };
  });

  const ensureFullHistory = async () => {
    if (!hasFullHistory && fetchAllTimeBalances) {
      setIsLoadingFullHistory(true);
      await fetchAllTimeBalances();
      setHasFullHistory(true);
      setIsLoadingFullHistory(false);
    }
  };

  // "ALL" richiede lo storico completo (oltre i 24 mesi già disponibili di
  // default): lo richiediamo una sola volta, on-demand, per non gravare
  // sull'egress ad ogni caricamento pagina.
  const handlePeriodSelect = async (period) => {
    if (period === 'all') {
      await ensureFullHistory();
    }
    setSelectedPeriod(period);
  };

  const handleCustomRangeChange = async (field, value) => {
    if (field === 'start') setCustomStartMonth(value);
    if (field === 'end') setCustomEndMonth(value);
    setSelectedPeriod('custom');
    await ensureFullHistory();
  };

  // Funzione per filtrare i dati in base al periodo selezionato
  const getFilteredData = () => {
    const allData = buildAllData();

    // Filtra in base al periodo selezionato
    switch(selectedPeriod) {
      case '3m':
        return allData.slice(-3); // Ultimi 3 mesi
      case '6m':
        return allData.slice(-6); // Ultimi 6 mesi
      case '1y':
        return allData.slice(-12); // Ultimi 12 mesi
      case '2y':
        return allData.slice(-24); // Ultimi 24 mesi (già disponibili di default)
      case 'all':
        return allData; // Intero storico (richiesto on-demand, vedi handlePeriodSelect)
      case 'custom': {
        const start = customStartMonth || allData[0]?.name;
        const end = customEndMonth || allData[allData.length - 1]?.name;
        if (!start || !end) return allData;
        const [from, to] = start <= end ? [start, end] : [end, start];
        return allData.filter((item) => item.name >= from && item.name <= to);
      }
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
        baseWidth = Math.min(width - 20, 500); // Ridotto da 40 a 20
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, last12MonthsData]);

  useEffect(() => {
    const fetchData = async () => {
      if (userData) {
        try {
          // Emit as many months as we actually have (min 12, so a new user
          // still sees a full empty-bar chart) — grows automatically once
          // fetchAllTimeBalances widens userData.balances for "ALL".
          const monthsAvailable = Math.max((userData.balances || []).length, 12);
          const chartData = getBalanceChartData(userData, monthsAvailable);
          setLast12MonthsData(chartData);
        } catch (error) {
          console.error('Errore durante le operazioni:', error);
        }
      }
    };

    fetchData();
  }, [userData]);

  // Headers per export comuni
  const headers = [
    { label: translations.general.month, key: 'name' },
    { label: translations.assets.cash, key: 'cash' },
    { label: translations.assets.digitalServices, key: 'digitalServices' },
    { label: translations.assets.stocks, key: 'stocks' },
    { label: translations.assets.bank, key: 'bank' },
    { label: translations.assets.crypto, key: 'crypto' },
    { label: translations.assets.etf, key: 'etf' },
    { label: translations.assets.bitcoin, key: 'bitcoin' },
    { label: translations.assets.bonds, key: 'bonds' },
    { label: translations.assets.funds, key: 'funds' },
    { label: translations.assets.gold, key: 'gold' },
    { label: translations.assets.total, key: 'total' },
  ];

  const today = new Date();

  const data = getFilteredData();

  const isMobile = containerWidth < 500;
  const allData = buildAllData();
  const minMonth = allData[0]?.name || '';
  const maxMonth = allData[allData.length - 1]?.name || '';
  const isLongRange = data.length > 18;
  const xAxisInterval = data.length > 60 ? Math.ceil(data.length / 8) : data.length > 36 ? 5 : data.length > 24 ? 3 : data.length > 12 ? 1 : 0;
  const formatXAxisTick = (value, index) => {
    if (!value || isHidden) return isHidden ? '****' : value;
    const [year, month] = String(value).split('-');
    if (!year || !month) return value;
    if (data.length > 18) {
      return month === '01' || index === 0 || index === data.length - 1 ? `${month}/${year.slice(2)}` : month;
    }
    return `${month}/${year.slice(2)}`;
  };

  // Componente Tooltip condiviso
  const renderTooltip = () => (
    <Tooltip
      position={{ x: undefined, y: undefined }}
      allowEscapeViewBox={{ x: false, y: false }}
      contentStyle={{
        backgroundColor: 'rgba(255,255,255,0.95)',
        border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
        borderRadius: '10px',
        padding: isMobile ? '8px 10px' : '10px 12px',
        fontSize: isMobile ? '12px' : '13px',
        fontWeight: '500',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        color: '#333',
        maxHeight: isMobile ? 220 : 280,
        overflowY: 'auto'
      }}
      wrapperStyle={{ zIndex: 20 }}
      labelStyle={{
        color: '#333',
        fontWeight: 'bold',
        marginBottom: '4px'
      }}
      labelFormatter={(label) => {
        if (isHidden) return '****';
        
        // Converti formato YYYY-MM in nome mese tradotto + anno
        const [year, monthNum] = label.split('-');
        const monthIndex = parseInt(monthNum);
        
        const monthNames = {
          1: translations.months.january,
          2: translations.months.february,
          3: translations.months.march,
          4: translations.months.april,
          5: translations.months.may,
          6: translations.months.june,
          7: translations.months.july,
          8: translations.months.august,
          9: translations.months.september,
          10: translations.months.october,
          11: translations.months.november,
          12: translations.months.december,
        };
        
        const monthName = monthNames[monthIndex] || monthNum;
        return `${monthName} ${year}`;
      }}
      formatter={(value, name) => {
        if (isHidden) return ['****'];
        
        const formattedValue = formatAmount(value, { maximumFractionDigits: 0 });
        
        // Mappa i nomi inglesi a quelli localizzati
        const nameMap = {
          'cash': translations.assets.cash,
          'digitalServices': translations.assets.digitalServices,
          'stocks': translations.assets.stocks,
          'bank': translations.assets.bank,
          'crypto': translations.assets.crypto,
          'etf': translations.assets.etf,
          'bitcoin': translations.assets.bitcoin,
          'bonds': translations.assets.bonds,
          'funds': translations.assets.funds,
          'gold': translations.assets.gold,
          'total': translations.assets.total
        };

        const translatedName = nameMap[name] || name;
        return [formattedValue, translatedName];
      }}
    />
  );

  // Componente Legenda condivisa (currently unused, kept for future use)
  // const renderLegend = () => (
  //   <Legend 
  //     iconSize={16} 
  //     wrapperStyle={{ 
  //       fontSize: containerWidth < 500 ? '16px' : '18px',
  //       fontWeight: 500,
  //       paddingTop: type === 'bar' ? '10px' : '5px',
  //       textAlign: 'center'
  //     }}
  //   />
  // );

  // Rendering del grafico a barre
  const renderBarChart = () => (
    <BarChart
      data={data}
      margin={{
        top: isMobile ? 5 : 15,
        left: isMobile ? -15 : 10,
        right: isMobile ? 5 : 15,
        bottom: 5
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
        interval={isMobile ? Math.max(1, xAxisInterval) : xAxisInterval}
        tickFormatter={formatXAxisTick}
        tick={(props) => <CustomTick 
          {...props} 
          theme={theme} 
          fontSize={isMobile ? 9 : isLongRange ? 10 : containerWidth < 768 ? 11 : 12}
          fill={theme.textColor}
          dy={8}
          dx={isLongRange ? -5 : -3}
          angle={isMobile || isLongRange ? -35 : -15}
          textAnchor="end"
        />}
        height={isMobile || isLongRange ? 52 : 46}
        axisLine={{ stroke: theme.textColor, strokeWidth: 1 }}
        tickLine={{ stroke: theme.textColor, strokeWidth: 1 }}
      />
      
      <YAxis 
        tick={(props) => {
          const convertedProps = {
            ...props,
            payload: { ...props.payload, value: isHidden ? '****' : compactNumber(Math.round(fromEUR(props.payload.value))) }
          };
          return <CustomTick 
            {...convertedProps} 
            textAnchor="end" 
            fill={theme.textColor} 
            fontSize={containerWidth < 500 ? 10 : containerWidth < 768 ? 12 : 16}
            fontWeight={500}
            dx={-5}
          />;
        }}
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
      <Bar dataKey="bonds" stackId="a" fill={isHidden ? '#F0F0F0' : getAssetColor('bonds', theme.mode)} radius={[0, 0, 0, 0]} />
      <Bar dataKey="funds" stackId="a" fill={isHidden ? '#E8E8E8' : getAssetColor('funds', theme.mode)} radius={[0, 0, 0, 0]} />
      <Bar dataKey="gold" stackId="a" fill={isHidden ? '#F8F8F8' : getAssetColor('gold', theme.mode)} radius={[0, 0, 0, 0]} />
      <Bar dataKey="emergencyFund" stackId="a" fill={isHidden ? '#E5E5E5' : getAssetColor('emergencyFund', theme.mode)} radius={[4, 4, 0, 0]} />
      
      {/* Barra invisibile per il total - serve solo per mostrarlo nel tooltip */}
      <Bar dataKey="total" fill="transparent" strokeWidth={0} />
      
      {/* <Brush dataKey='name' height={containerWidth < 500 ? 80 : 60} stroke={theme.textColor} fill={theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} /> */}
      {data.length > 18 && (
        <Brush
          dataKey="name"
          height={22}
          travellerWidth={8}
          stroke={theme.buttonBackgroundColor || '#079164'}
          fill={theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}
          tickFormatter={formatXAxisTick}
        />
      )}
    </BarChart>
  );

  // Rendering del grafico ad area
  const renderAreaChart = () => (
    <AreaChart
      data={data}
      margin={{
        top: isMobile ? 5 : 15,
        left: isMobile ? -15 : 10,
        right: isMobile ? 5 : 15,
        bottom: isMobile ? 5 : 10
      }}
    >
      <CartesianGrid 
        strokeDasharray="3 3" 
        stroke={theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 
        vertical={false}
      /> 
      
      <XAxis 
        dataKey="name" 
        interval={isMobile ? Math.max(1, xAxisInterval) : xAxisInterval}
        tickFormatter={formatXAxisTick}
        tick={(props) => <CustomTick 
          {...props} 
          theme={theme} 
          fontSize={isMobile ? 9 : isLongRange ? 10 : containerWidth < 768 ? 11 : 12}
          fill={theme.textColor}
          dy={8}
          dx={isLongRange ? -5 : -3}
          angle={isMobile || isLongRange ? -35 : -15}
          textAnchor="end"
        />}
        height={isMobile || isLongRange ? 52 : 46}
        axisLine={{ stroke: theme.textColor, strokeWidth: 1 }}
        tickLine={{ stroke: theme.textColor, strokeWidth: 1 }}
      />
      
      <YAxis 
        tick={(props) => {
          const convertedProps = {
            ...props,
            payload: { ...props.payload, value: isHidden ? '****' : compactNumber(Math.round(fromEUR(props.payload.value))) }
          };
          return <CustomTick 
            {...convertedProps} 
            textAnchor="end" 
            fill={theme.textColor} 
            fontSize={containerWidth < 500 ? 10 : containerWidth < 768 ? 12 : 16}
            fontWeight={500}
            dx={-5}
          />;
        }}
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
      {data.every(item => item['bonds'] === 0) || <Area type="monotone" dataKey={'bonds'} stroke={isHidden ? '#E0E0E0' : getAssetColor('bonds', theme.mode)} fillOpacity={0.3} fill={isHidden ? '#E0E0E0' : getAssetColor('bonds', theme.mode)} />}
      {data.every(item => item['funds'] === 0) || <Area type="monotone" dataKey={'funds'} stroke={isHidden ? '#E8E8E8' : getAssetColor('funds', theme.mode)} fillOpacity={0.3} fill={isHidden ? '#E8E8E8' : getAssetColor('funds', theme.mode)} />}
      {data.every(item => item['gold'] === 0) || <Area type="monotone" dataKey={'gold'} stroke={isHidden ? '#F0F0F0' : getAssetColor('gold', theme.mode)} fillOpacity={0.3} fill={isHidden ? '#F0F0F0' : getAssetColor('gold', theme.mode)} />}
      {data.every(item => item['emergencyFund'] === 0) || <Area type="monotone" dataKey={'emergencyFund'} stroke={isHidden ? '#F8F8F8' : getAssetColor('emergencyFund', theme.mode)} fillOpacity={0.3} fill={isHidden ? '#F8F8F8' : getAssetColor('emergencyFund', theme.mode)} />}
      {data.length > 18 && (
        <Brush
          dataKey="name"
          height={22}
          travellerWidth={8}
          stroke={theme.buttonBackgroundColor || '#079164'}
          fill={theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}
          tickFormatter={formatXAxisTick}
        />
      )}
    </AreaChart>
  );

  return (
    <SectionBalancesCharts theme={theme} style={{position: 'relative', height: '100%'}}>
      {/* Toolbar: period selector + export buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.75rem',
        width: '100%',
        padding: isMobile ? '0 0.25rem' : '0 0.5rem',
        marginBottom: '0.75rem',
        flexWrap: 'wrap'
      }}>
      {/* Time Period Selector */}
      <div className="flex gap-1 z-10" style={{ flexWrap: 'wrap' }}>
        {['3m', '6m', '1y', '2y', 'all'].map((period) => {
          const isActive = selectedPeriod === period;
          const isBusy = period === 'all' && isLoadingFullHistory;

          return (
            <button
              key={period}
              onClick={() => handlePeriodSelect(period)}
              disabled={isBusy}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                isBusy ? 'cursor-wait opacity-70' : 'hover:scale-105'
              }`}
              style={{
                backgroundColor: isActive
                  ? (theme.mode === 'dark' ? 'rgba(7, 145, 100, 0.8)' : 'rgba(7, 145, 100, 0.9)')
                  : (theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)'),
                color: isActive
                  ? '#ffffff'
                  : (theme.mode === 'dark' ? '#ffffff' : '#333333'),
                border: `1px solid ${isActive
                  ? 'rgba(7, 145, 100, 0.8)'
                  : (theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)')}`,
                backdropFilter: 'blur(10px)'
              }}
            >
              {isBusy ? '…' : period.toUpperCase()}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: '0.75rem', color: theme.textColor }}>
        <span style={{ opacity: 0.7 }}>{translations.general.from || 'Da'}</span>
        <input
          type="month"
          value={customStartMonth}
          min={minMonth}
          max={maxMonth}
          onChange={(e) => handleCustomRangeChange('start', e.target.value)}
          style={{
            border: `1px solid ${selectedPeriod === 'custom' ? theme.buttonBackgroundColor : (theme.mode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)')}`,
            borderRadius: 8,
            padding: '0.34rem 0.45rem',
            background: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
            color: theme.textColor,
            colorScheme: theme.mode === 'dark' ? 'dark' : 'light',
          }}
        />
        <span style={{ opacity: 0.7 }}>{translations.general.to || 'A'}</span>
        <input
          type="month"
          value={customEndMonth}
          min={minMonth}
          max={maxMonth}
          onChange={(e) => handleCustomRangeChange('end', e.target.value)}
          style={{
            border: `1px solid ${selectedPeriod === 'custom' ? theme.buttonBackgroundColor : (theme.mode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)')}`,
            borderRadius: 8,
            padding: '0.34rem 0.45rem',
            background: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
            color: theme.textColor,
            colorScheme: theme.mode === 'dark' ? 'dark' : 'light',
          }}
        />
      </div>

      {/* Export buttons */}
      <div className="flex gap-1 z-10">
        <CSVLink
          data={data}
          headers={headers}
          filename={`distributionAssets_${type}_${today.getMonth() + 1}-${today.getFullYear().toString().slice(-2)}.csv`}
          className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg border transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
            borderColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <BsFiletypeCsv className="text-paciGreen text-lg md:text-lg max-md:text-sm" />
        </CSVLink>

        <button
          onClick={async () => await downloadExcel(data, headers, `distributionAssets_${type}_${today.getMonth() + 1}-${today.getFullYear().toString().slice(-2)}.xlsx`)}
          className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg border transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
            borderColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <RiFileExcel2Line className="text-paciGreen text-lg md:text-lg max-md:text-sm" />
        </button>
      </div>
      </div>

      <div style={{ 
        width: '100%', 
        height: isMobile ? '320px' : '460px',
        padding: isMobile ? '0' : '0 0.5rem',
      }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? renderBarChart() : renderAreaChart()}
        </ResponsiveContainer>
      </div>
    </SectionBalancesCharts>
  );
}

export default React.memo(BalancesChart);
