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
  Cell 
} from 'recharts';
import { SectionInOut, PercentageOutflowsChartContainer } from '../styles/MyStyled';
import { Brush } from "recharts/lib/cartesian/Brush";
import { CSVLink } from 'react-csv';
import { BsFiletypeCsv } from "react-icons/bs";
import { LanguageContext } from '../contexts/LanguageContext';
import languages from '../data/languages.json';
import { downloadExcel } from '../utils/downloadData.jsx';
import { RiFileExcel2Line } from "react-icons/ri";
import { renderCustomizedLabel } from '../utils/customGraphsInfo';
import { getCategoryColor } from '../data/categoryColors';





export default function InOutChart({theme, userData, isHidden, CustomTick, type = "line"}) {
  const { language } = useContext(LanguageContext);
  
  // Line chart state
  const [incomesArray, setIncomesArray] = useState([]);
  const [outflowsArray, setOutflowsArray] = useState([]);
  
  // Pie chart state
  const [totalOutflowsPerCategoryPerMonth, setTotalOutflowsPerCategoryPerMonth] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(0);
  
  // Common state
  const [containerWidth, setContainerWidth] = useState(800);
  const [selectedPeriod, setSelectedPeriod] = useState('6m');

  const greyScale1 = Math.floor(Math.random() * 256);
  const greyColor1 = `rgb(${greyScale1}, ${greyScale1}, ${greyScale1})`;
  const greyScale2 = Math.floor(Math.random() * 256);
  const greyColor2 = `rgb(${greyScale2}, ${greyScale2}, ${greyScale2})`;

  // Gestione responsive
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (type === "line") {
        const dataLength = getFilteredData().length;
        
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
      } else {
        if (width < 768) {
          setContainerWidth(Math.min(width - 60, 350));
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
            setIncomesArray(userData.incomesArray ? [...userData.incomesArray].reverse() : []);
            setOutflowsArray(userData.outflowsArray ? [...userData.outflowsArray].reverse() : []);
          } else {
            setTotalOutflowsPerCategoryPerMonth(userData.totalOutflowsPerCategoryPerMonth || []);
          }
        } catch (error) {
          console.error('Error during operations:', error);
        }
      }
    };

    fetchData();
  }, [userData, type]);

  const headers = [
    { label: languages[language]?.graphs?.statsOutflows?.titleGraph || 'Month', key: 'name' },
    { label: languages[language]?.general?.incomes || 'Inflows', key: 'incomes' },
    { label: languages[language]?.general?.outflows || 'Outflows', key: 'outflows' },
  ];

  const today = new Date();
  
  // Funzione per filtrare i dati in base al periodo selezionato
  const getFilteredData = () => {
    const lastTwelveMonths = [];

    // Crea array da 11 mesi fa al mese corrente (ordine cronologico corretto)
    for (let i = 11; i >= 0; i--) {
      const month = today.getMonth() - i;
      const year = today.getFullYear();
      const date = new Date(year, month, 1);

      // Usa formato anno-mese per coerenza con BalancesChart
      const displayName = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      // L'indice per gli array dovrebbe essere 11-i perché gli array sono già stati invertiti
      const arrayIndex = 11 - i;

      lastTwelveMonths.push({
        name: displayName,
        [languages[language].general.outflows]: Math.abs(outflowsArray[arrayIndex] || 0), // Usa valore assoluto
        [languages[language].general.incomes]: Math.abs(incomesArray[arrayIndex] || 0), // Usa valore assoluto
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
        .filter(([key, value]) => value > 0)
        .map(([key, value]) => ({
          name: languages[language]?.categories?.[key] || key,
          value: isHidden ? Math.floor(Math.random() * 1000) : value,
          fill: getCategoryColor(key)
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
              const formattedValue = new Intl.NumberFormat('it-IT', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0,
              }).format(value);
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
      1: [languages[language].months.january],
      2: [languages[language].months.february],
      3: [languages[language].months.march],
      4: [languages[language].months.april],
      5: [languages[language].months.may],
      6: [languages[language].months.june],
      7: [languages[language].months.july],
      8: [languages[language].months.august],
      9: [languages[language].months.september],
      10: [languages[language].months.october],
      11: [languages[language].months.november],
      12: [languages[language].months.december]
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
            filename={`incomeOutflows_${today.getMonth() + 1}-${today.getFullYear().toString().slice(-2)}.csv`} 
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
            onClick={async () => await downloadExcel(data, headers, `incomesOutflows_${today.getMonth() + 1}-${today.getFullYear().toString().slice(-2)}.xlsx`)}
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

        {/* Responsive chart container */}
        <div style={{ 
          width: '100%', 
          height: '500px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '3.5rem',
          // padding: '0 1rem'
        }}>
          <LineChart
            width={containerWidth}
            height={550}
            data={data}
            margin={{
              top: 30,
              right: 40,
              left: 30,
              bottom: 70
            }}
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
              tick={{
                fontSize: containerWidth < 500 ? 10 : 12, 
                fill: theme.mode === 'dark' ? '#fff' : '#333',
                fontWeight: 500
              }} 
              interval={containerWidth < 500 ? 1 : 0} 
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
            />
            
                        <YAxis 
              tick={{
                fontSize: containerWidth < 500 ? 14 : 16,
                fill: theme.mode === 'dark' ? '#fff' : '#333'
              }}
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
              formatter={(value, name) => {
                if (isHidden) return ['****', name];
                
                const formattedValue = new Intl.NumberFormat('it-IT', {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 0,
                }).format(value);
                
                return [formattedValue, name];
              }}
            />
            
            <Legend 
              wrapperStyle={{ 
                fontSize: containerWidth < 500 ? '16px' : '18px',
                fontWeight: 500,
                paddingTop: '15px'
              }} 
            />
            
            <Line 
              type="monotone" 
              dataKey={languages[language].general.incomes} 
              stroke={isHidden ? greyColor1 : "#079164"} 
              strokeWidth={3} 
              dot={{ 
                fill: isHidden ? greyColor1 : "#079164", 
                strokeWidth: 2, 
                r: 4 
              }}
              activeDot={{ 
                r: 6, 
                fill: isHidden ? greyColor1 : "#079164",
                stroke: '#fff',
                strokeWidth: 2
              }} 
            />
            
            <Line 
              type="monotone" 
              dataKey={languages[language].general.outflows} 
              stroke={isHidden ? greyColor2 : "#ff3838"} 
              strokeWidth={3}
              dot={{ 
                fill: isHidden ? greyColor2 : "#ff3838", 
                strokeWidth: 2, 
                r: 4 
              }}
              activeDot={{ 
                r: 6, 
                fill: isHidden ? greyColor2 : "#ff3838",
                stroke: '#fff',
                strokeWidth: 2
              }}
            />
          </LineChart>
        </div>
      </div>
    </SectionInOut>
  );
}