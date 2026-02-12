import React, {useState, useEffect, useContext} from "react";
import { 
  CartesianGrid, 
  Tooltip, 
  XAxis, 
  YAxis, 
  LineChart, 
  Line, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  ReferenceLine
} from 'recharts';
import { SectionInOut, PercentageOutflowsChartContainer } from '../styles/MyStyled';
import { Brush } from "recharts/lib/cartesian/Brush";
import { CSVLink } from 'react-csv';
import { BsFiletypeCsv } from "react-icons/bs";
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { getIncomesArray, getOutflowsArray, getTotalOutflowsPerCategoryPerMonth } from '../utils/userDataSelectors';
import { downloadExcel } from '../utils/downloadData.jsx';
import { RiFileExcel2Line } from "react-icons/ri";

import { getCategoryColor } from '../data/categoryColors';
import { compactNumber } from '../utils/customGraphsInfo.jsx';
import { getLighterSolidColor, getGrayscaleColor, getRandomGrayscaleColor } from '../utils/colorUtils';

export default function InOutChart({theme, userData, isHidden, type = "line"}) {
  const { language, translations } = useContext(LanguageContext);
  const { formatAmount, fromEUR, currencySymbol } = useContext(CurrencyContext);
  
  // Line chart state
  const [incomesArray, setIncomesArray] = useState([]);
  const [outflowsArray, setOutflowsArray] = useState([]);
  
  // Pie chart state
  const [totalOutflowsPerCategoryPerMonth, setTotalOutflowsPerCategoryPerMonth] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(0);
  
  // Common state
  const [containerWidth, setContainerWidth] = useState(800);
  const [selectedPeriod, setSelectedPeriod] = useState('6m');

  // Line visibility state for legend toggle
  const [lineVisibility, setLineVisibility] = useState({
    incomes: true,
    outflows: true,
    saved: true
  });

  const greyColor1 = getRandomGrayscaleColor(1);
  const greyColor2 = getRandomGrayscaleColor(2);

  // Funzione per gestire il toggle delle linee tramite click sulla legenda
  const handleLegendClick = (data) => {
    const key = data.dataKey;
    let lineKey;
    
    // Mappa le dataKeys alle keys di visibilità
    if (key === translations.general.incomes) {
      lineKey = 'incomes';
    } else if (key === translations.general.outflows) {
      lineKey = 'outflows';
    } else if (key === translations.general.saved) {
      lineKey = 'saved';
    }
    
    if (lineKey) {
      setLineVisibility(prev => ({
        ...prev,
        [lineKey]: !prev[lineKey]
      }));
    }
  };

  // Gestione responsive
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (type === "line") {
        const dataLength = getFilteredData().length;
        
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
      } else {
        if (width < 768) {
          setContainerWidth(Math.min(width - 30, 350)); // Ridotto da 60 a 30
        } else if (width < 1024) {
          setContainerWidth(Math.min(width - 120, 500));
        } else {
          setContainerWidth(Math.min(width - 200, 700));
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [type, selectedPeriod, incomesArray, outflowsArray]);

  //impostare i dati presi dell'utente per le spese e le entrate
  useEffect(() => {
    const fetchData = async () => {
      if (userData) {
        try {
          if (type === "line") {
            setIncomesArray(getIncomesArray(userData) ? [...getIncomesArray(userData)] : []);
            setOutflowsArray(getOutflowsArray(userData) ? [...getOutflowsArray(userData)] : []);
          } else {
            setTotalOutflowsPerCategoryPerMonth(getTotalOutflowsPerCategoryPerMonth(userData) || []);
          }
        } catch (error) {
          console.error('Error during operations:', error);
        }
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, type]);

  const headers = [
    { label: translations?.graphs?.statsOutflows?.titleGraph || 'Month', key: 'name' },
    { label: translations?.general?.incomes || 'Inflows', key: 'incomes' },
    { label: translations?.general?.outflows || 'Outflows', key: 'outflows' },
  ];

  const today = new Date();
  
  // Funzione per filtrare i dati in base al periodo selezionato
  const getFilteredData = () => {
    const lastTwelveMonths = [];

    // Crea array da 11 mesi fa al mese corrente (ordine cronologico corretto)
    for (let i = 11; i >= 0; i--) {
      // Usa Date constructor per gestire correttamente i mesi negativi
      const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();

      // Usa formato anno-mese per coerenza con BalancesChart
      const displayName = `${year}-${String(month + 1).padStart(2, '0')}`;
      
      // UserContext: incomesArray[0] = mese corrente, incomesArray[11] = 11 mesi fa
      // Loop: i=11 (11 mesi fa) → i=0 (mese corrente) 
      // Mappatura: i=11 → arrayIndex=11 (11 mesi fa), i=0 → arrayIndex=0 (mese corrente)
      // Risultato grafico: da sinistra (11 mesi fa) a destra (mese corrente) ✅
      const arrayIndex = i;
      
      // Usa dati solo se l'indice è valido nell'array
      const incomesValue = arrayIndex < incomesArray.length ? Math.abs(incomesArray[arrayIndex] || 0) : 0;
      const outflowsValue = arrayIndex < outflowsArray.length ? Math.abs(outflowsArray[arrayIndex] || 0) : 0;

      lastTwelveMonths.push({
        name: displayName,
        [translations.general.outflows]: outflowsValue,
        [translations.general.incomes]: incomesValue,
        [translations.general.saved]: Math.max(incomesValue - outflowsValue, 0),
        amt: 0, // Aggiungi eventuali dati aggiuntivi
      });
    }

    // Filtra in base al periodo selezionato
    switch(selectedPeriod) {
      case '3m':
        return lastTwelveMonths.slice(-3); // Ultimi 3 mesi
      case '6m':
        return lastTwelveMonths.slice(-6); // Ultimi 6 mesi
      case '1y':
        return lastTwelveMonths; // Tutti i 12 mesi
      case '2y':
      case 'all':
        return lastTwelveMonths; // Per ora stesso dei 12 mesi
      default:
        return lastTwelveMonths;
    }
  };

  const data = getFilteredData();

  // Pie Chart Functions
  const renderPieChart = () => {
    let pieData = [];
    
    if (totalOutflowsPerCategoryPerMonth[selectedMonth]) {
      pieData = Object.entries(totalOutflowsPerCategoryPerMonth[selectedMonth])
        .filter(([, value]) => value > 0)
        .map(([key, value], index) => ({
          name: translations?.categories?.[key] || key,
          value: isHidden ? Math.floor(Math.random() * 1000) : value,
          fill: isHidden 
            ? getGrayscaleColor(getCategoryColor(key), index)
            : getLighterSolidColor(getCategoryColor(key))
        }));
    }

    return (
      <div style={{ 
        width: '100%', 
        height: '100%',
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem 0'
      }}>
        <PieChart width={containerWidth} height={Math.min(550, containerWidth + 50)}>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => {
              if (isHidden) return '***';
              // Calcola il totale di tutti i valori nel dataset
              const total = pieData.reduce((sum, item) => sum + item.value, 0);
              const percentage = ((entry.value / total) * 100).toFixed(1);
              return `${entry.name}: ${percentage}%`;
            }}
            outerRadius={containerWidth < 500 ? 120 : 160}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor:'rgba(255,255,255,0.95)',
              border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              color: theme.mode === 'dark' ? '#fff' : '#333'
            }}
            formatter={(value, name) => {
              if (isHidden) return ['****', name];
              const formattedValue = formatAmount(value, { maximumFractionDigits: 0 });
              return [formattedValue, name];
            }}
            labelStyle={{
              color: '#333',
              fontWeight: 'bold',
              marginBottom: '4px'
            }}
          />
        </PieChart>
      </div>
    );
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const renderMonthSelector = () => {
    const monthNames = {
      1: [translations.months.january],
      2: [translations.months.february],
      3: [translations.months.march],
      4: [translations.months.april],
      5: [translations.months.may],
      6: [translations.months.june],
      7: [translations.months.july],
      8: [translations.months.august],
      9: [translations.months.september],
      10: [translations.months.october],
      11: [translations.months.november],
      12: [translations.months.december],
    };

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    let monthOptions = [];
    let year = currentYear;

    for (let i = 0; i < Object.keys(totalOutflowsPerCategoryPerMonth).length; i++) {
      let month = ((currentMonth - i - 1 + 12) % 12) + 1;
      if (month === 12 && i !== 0) {
        year--;
      }
      monthOptions.push({ value: i, label: `${monthNames[month]} ${year}` });
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ 
          color: theme.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
          fontWeight: '500',
          fontSize: '0.9rem'
        }}>
          {language === 'it' ? 'Mese:' : 'Month:'}
        </span>
        <select 
          value={selectedMonth} 
          onChange={handleMonthChange} 
          style={{ 
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
            background: 'rgba(255,255,255,0.95)',
            color: '#333',
            fontSize: '0.9rem',
            fontWeight: '500',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  // Conditional rendering based on type
  if (type === "pie") {
    return (
      <PercentageOutflowsChartContainer style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          padding: '1rem', 
          textAlign: 'center', 
          borderBottom: theme.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
        }}>
          {renderMonthSelector()}
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          {renderPieChart()}
        </div>
      </PercentageOutflowsChartContainer>
    );
  }

  // Default LineChart rendering
  return (
    <SectionInOut style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', height: '100%' }}>
      <div style={{ width: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Time Period Selector */}
        <div className="absolute top-0 left-0 flex gap-1 z-10 p-2 md:top-0 md:left-0 
                        max-md:top-12 max-md:left-0 max-md:right-0 max-md:justify-center">
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
        <div className="absolute flex gap-2 z-10 p-2 md:top-0 md:right-0 
                        max-md:-top-1 max-md:left-0 max-md:right-0 max-md:justify-end max-md:pr-1 max-md:gap-1"
             style={{ top: 0, right: 0 }}>
          <CSVLink 
            data={data}
            headers={headers}
            filename={`incomeOutflows_${today.getMonth() + 1}-${today.getFullYear().toString().slice(-2)}.csv`} 
            className="flex items-center justify-center w-10 h-10 md:w-10 md:h-10 max-md:w-8 max-md:h-8 rounded-lg border transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
              borderColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <BsFiletypeCsv className="text-paciGreen text-lg md:text-lg max-md:text-sm" />
          </CSVLink>

          <button
            onClick={async () => await downloadExcel(data, headers, `incomesOutflows_${today.getMonth() + 1}-${today.getFullYear().toString().slice(-2)}.xlsx`)}
            className="flex items-center justify-center w-10 h-10 md:w-10 md:h-10 max-md:w-8 max-md:h-8 rounded-lg border transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
              borderColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <RiFileExcel2Line className="text-paciGreen text-lg md:text-lg max-md:text-sm" />
          </button>
        </div>

        {/* Responsive chart container */}
        <div className="pt-10 md:pt-4" style={{ 
          width: '100%', 
          height: '500px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '3.5rem',
          padding: containerWidth < 768 ? '0 0.25rem' : '0 1rem'
        }}>
          <LineChart
            width={containerWidth}
            height={550}
            data={data}
            margin={{
              top: containerWidth < 768 ? 20 : 30,
              right: containerWidth < 768 ? 5 : 40,
              left: containerWidth < 768 ? 5 : 30,
              bottom: containerWidth < 768 ? 50 : 70
            }}
            syncId="incomeOutflowChart"
          >
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#079164" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#079164" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="outflowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff3838" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ff3838" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 
              vertical={false}
            />
            
            <XAxis 
              dataKey="name"
              type="category"
              tick={{
                fontSize: containerWidth < 500 ? 8 : containerWidth < 768 ? 10 : 12, 
                fill: theme.mode === 'dark' ? '#fff' : '#333',
                fontWeight: 500
              }} 
              interval={(() => {
                const dataLength = data.length;
                if (containerWidth < 500) return 'preserveStartEnd';
                if (dataLength <= 3) return 0;
                if (dataLength <= 6) return 0;
                if (dataLength === 12) return containerWidth < 800 ? 1 : 0;
                return 0;
              })()} 
              angle={containerWidth < 500 ? -45 : 0}
              textAnchor={containerWidth < 500 ? 'end' : 'middle'}
              height={containerWidth < 500 ? 80 : 60}
              axisLine={{ 
                stroke: theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                strokeWidth: 1
              }}
              tickLine={{ 
                stroke: theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
              }}
              allowDuplicatedCategory={false}
            />
            
                        <YAxis 
              tick={{
                fontSize: containerWidth < 500 ? 10 : containerWidth < 768 ? 12 : 16,
                fill: theme.mode === 'dark' ? '#fff' : '#333'
              }}
              tickFormatter={(value) => isHidden ? '****' : compactNumber(Math.round(fromEUR(value)))}
              axisLine={{ 
                stroke: theme.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', 
                strokeWidth: 1 
              }}
              tickLine={{ 
                stroke: theme.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', 
                strokeWidth: 1 
              }}
            />
            
                        <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                color: '#333'
              }}
              labelStyle={{
                color: '#333',
                fontWeight: 'bold',
                marginBottom: '4px'
              }}
              formatter={(value, name) => {
                if (isHidden) return ['****', name];
                
                const formattedValue = formatAmount(value, { maximumFractionDigits: 0 });
                
                return [formattedValue, name];
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
                  12: translations.months.december
                };
                
                const monthName = monthNames[monthIndex] || monthNum;
                return `${monthName} ${year}`;
              }}
            />
            

            
            {lineVisibility.incomes && (
              <Line 
                type="monotone" 
                dataKey={translations.general.incomes} 
                stroke={isHidden ? greyColor1 : "#079164"} 
                strokeWidth={3}
                connectNulls={false}
                isAnimationActive={false}
                dot={{ 
                  fill: isHidden ? greyColor1 : "#079164", 
                  strokeWidth: 2, 
                  r: 5 
                }}
                activeDot={{ 
                  r: 10, 
                  fill: isHidden ? greyColor1 : "#079164",
                  stroke: '#fff',
                  strokeWidth: 4,
                  style: { 
                    cursor: 'pointer',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }
                }} 
              />
            )}
            
            {lineVisibility.outflows && (
              <Line 
                type="monotone" 
                dataKey={translations.general.outflows} 
                stroke={isHidden ? greyColor2 : "#ff3838"} 
                strokeWidth={3}
                connectNulls={false}
                isAnimationActive={false}
                dot={{ 
                  fill: isHidden ? greyColor2 : "#ff3838", 
                  strokeWidth: 2, 
                  r: 5 
                }}
                activeDot={{ 
                  r: 10, 
                  fill: isHidden ? greyColor2 : "#ff3838",
                  stroke: '#fff',
                  strokeWidth: 4,
                  style: { 
                    cursor: 'pointer',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }
                }}
              />
            )}

            {lineVisibility.saved && (
              <Line 
                type="monotone" 
                dataKey={translations.general.saved} 
                stroke={isHidden ? greyColor1 : "#06b6d4"} 
                strokeWidth={3}
                connectNulls={false}
                isAnimationActive={false}
                dot={{ 
                  fill: isHidden ? greyColor1 : "#06b6d4", 
                  strokeWidth: 2, 
                  r: 5 
                }}
                activeDot={{ 
                  r: 10, 
                  fill: isHidden ? greyColor1 : "#06b6d4",
                  stroke: '#fff',
                  strokeWidth: 4,
                  style: { 
                    cursor: 'pointer',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }
                }}
              />
            )}
            
            {/* Limite di spesa mensile - solo se abilitato dall'utente */}
            {userData?.limits?.notificationsEnabled && userData?.limits?.monthlySpendingLimit && !isHidden && (
              <ReferenceLine 
                y={userData.limits.monthlySpendingLimit} 
                stroke="#ff6b35"
                strokeDasharray="8 4"
                strokeWidth={2}
                label={{ 
                  value: `${language === 'it' ? 'Limite spesa' : 'Spending limit'}: ${currencySymbol}${fromEUR(userData.limits.monthlySpendingLimit).toLocaleString()}`,
                  position: "top",
                  offset: 25,
                  fill: "#ff6b35",
                  fontSize: containerWidth < 500 ? 10 : 12,
                  fontWeight: 600,
                  textAnchor: 'middle'
                }}
              />
            )}
            
            {/* Obiettivo di risparmio mensile - calcolato dalle entrate */}
            {userData?.limits?.notificationsEnabled && userData?.limits?.savingsGoalPercentage && !isHidden && (
              (() => {
                // Calcola la media delle entrate per determinare l'obiettivo di risparmio
                const avgIncome = data.length > 0 ? 
                  data.reduce((sum, item) => sum + (item[translations.general.incomes] || 0), 0) / data.length : 0;
                const savingsTarget = (avgIncome * userData.limits.savingsGoalPercentage) / 100;
                
                return savingsTarget > 0 ? (
                  <ReferenceLine 
                    y={savingsTarget} 
                    stroke="#10b981"
                    strokeDasharray="6 6"
                    strokeWidth={2}
                    label={{ 
                      value: `${language === 'it' ? 'Obiettivo risparmio' : 'Savings goal'}: ${currencySymbol}${fromEUR(savingsTarget).toFixed(0)} (${userData.limits.savingsGoalPercentage}%)`,
                      position: "bottom",
                      offset: 25,
                      fill: "#10b981",
                      fontSize: containerWidth < 500 ? 10 : 12,
                      fontWeight: 600,
                      textAnchor: 'middle'
                    }}
                  />
                ) : null;
              })()
            )}
          </LineChart>
          
        </div>
        
        {/* Legenda personalizzata - posizionata sotto il grafico */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '20px', 
          paddingTop: '15px',
          flexWrap: 'wrap',
          width: '100%'
        }}>
          {[
            { key: 'incomes', label: translations.general.incomes, color: "#079164" },
            { key: 'outflows', label: translations.general.outflows, color: "#ff3838" },
            { key: 'saved', label: translations.general.saved, color: "#06b6d4" }
          ].map(({ key, label, color }) => (
            <div
              key={key}
              onClick={() => handleLegendClick({ dataKey: label })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: containerWidth < 500 ? '16px' : '18px',
                fontWeight: 500,
                opacity: lineVisibility[key] ? 1 : 0.5,
                textDecoration: lineVisibility[key] ? 'none' : 'line-through',
                color: '#ffffff'
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '3px',
                  backgroundColor: (isHidden ? (key === 'incomes' ? greyColor1 : key === 'outflows' ? greyColor2 : greyColor1) : color),
                  opacity: lineVisibility[key] ? 1 : 0.3
                }}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </SectionInOut>
  );
}