import React, {useState, useEffect, useContext} from "react";
import { 
  CartesianGrid, 
  Tooltip, 
  XAxis, 
  YAxis, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  ReferenceLine,
  ResponsiveContainer
} from 'recharts';
import { SectionInOut, PercentageOutflowsChartContainer } from '../styles/MyStyled';
import { Brush } from "recharts/lib/cartesian/Brush";
import { CSVLink } from 'react-csv';
import { BsFiletypeCsv } from "react-icons/bs";
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { UserContext } from '../contexts/UserContext';
import {
  getIncomesArray,
  getOutflowsArray,
  getTotalIncomesCategoryBreakdownPerMonth,
  getTotalOutflowsCategoryBreakdownPerMonth,
  getMonthlyTotalsAllTime,
} from '../utils/userDataSelectors';
import { downloadExcel } from '../utils/downloadData.jsx';
import { RiFileExcel2Line } from "react-icons/ri";

import { getCategoryColor } from '../data/categoryColors';
import { compactNumber } from '../utils/customGraphsInfo.jsx';
import { getLighterSolidColor, getGrayscaleColor, getRandomGrayscaleColor } from '../utils/colorUtils';
import { resolveTagKeyFromLocalized, translateTag } from '../data/tagTranslations';
function InOutChart({theme, userData, isHidden, type = "line"}) {
  const { language, translations } = useContext(LanguageContext);
  const { formatAmount, fromEUR, currencySymbol } = useContext(CurrencyContext);
  const { fetchAllTimeMonthlyTotals } = useContext(UserContext) || {};

  // Line chart state
  const [incomesArray, setIncomesArray] = useState([]);
  const [outflowsArray, setOutflowsArray] = useState([]);
  const [monthlyTotalsAllTime, setMonthlyTotalsAllTime] = useState([]);
  const [isLoadingFullHistory, setIsLoadingFullHistory] = useState(false);
  const [hasFullHistory, setHasFullHistory] = useState(false);

  // Pie chart state
  const [totalOutflowsCategoryBreakdownPerMonth, setTotalOutflowsCategoryBreakdownPerMonth] = useState([]);
  const [totalIncomesCategoryBreakdownPerMonth, setTotalIncomesCategoryBreakdownPerMonth] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedPieFlow, setSelectedPieFlow] = useState('outflows');
  
  // Common state
  const [containerWidth, setContainerWidth] = useState(800);
  const [selectedPeriod, setSelectedPeriod] = useState('6m');
  const [customStartMonth, setCustomStartMonth] = useState('');
  const [customEndMonth, setCustomEndMonth] = useState('');
  const isMobile = containerWidth < 500;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, selectedPeriod, incomesArray, outflowsArray]);

  //impostare i dati presi dell'utente per le spese e le entrate
  useEffect(() => {
    const fetchData = async () => {
      if (userData) {
        try {
          if (type === "line") {
            setIncomesArray(getIncomesArray(userData) ? [...getIncomesArray(userData)] : []);
            setOutflowsArray(getOutflowsArray(userData) ? [...getOutflowsArray(userData)] : []);
            setMonthlyTotalsAllTime(getMonthlyTotalsAllTime(userData));
          } else {
            setTotalOutflowsCategoryBreakdownPerMonth(getTotalOutflowsCategoryBreakdownPerMonth(userData) || []);
            setTotalIncomesCategoryBreakdownPerMonth(getTotalIncomesCategoryBreakdownPerMonth(userData) || []);
          }
        } catch (error) {
          console.error('Error during operations:', error);
        }
      }
    };

    fetchData();
  }, [userData, type]);

  const headers = [
    { label: translations?.graphs?.statsOutflows?.titleGraph || 'Month', key: 'name' },
    { label: translations?.general?.incomes || 'Inflows', key: 'incomes' },
    { label: translations?.general?.outflows || 'Outflows', key: 'outflows' },
  ];

  const today = new Date();

  // "2Y"/"ALL" richiedono i totali mensili aggregati oltre i 12 mesi già
  // disponibili di default: li richiediamo una sola volta, on-demand, per
  // non gravare sull'egress ad ogni caricamento pagina (nessun dettaglio di
  // singola transazione viene trasferito, solo somme mensili).
  const ensureFullHistory = async () => {
    if (!hasFullHistory && fetchAllTimeMonthlyTotals) {
      setIsLoadingFullHistory(true);
      await fetchAllTimeMonthlyTotals();
      setHasFullHistory(true);
      setIsLoadingFullHistory(false);
    }
  };

  const handlePeriodSelect = async (period) => {
    if (period === '2y' || period === 'all') {
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

  // Converte i totali mensili aggregati (monthlyTotalsAllTime) nello stesso
  // formato usato dal grafico, ordinati cronologicamente.
  const buildDataFromMonthlyTotals = (totals) => {
    return [...totals]
      .sort((a, b) => a.monthStart.localeCompare(b.monthStart))
      .map((t) => {
        const incomesValue = Math.abs(t.totalIncomes || 0);
        const outflowsValue = Math.abs(t.totalOutflows || 0);
        return {
          name: t.monthStart.slice(0, 7),
          [translations.general.outflows]: outflowsValue,
          [translations.general.incomes]: incomesValue,
          [translations.general.saved]: Math.max(incomesValue - outflowsValue, 0),
          amt: 0,
        };
      });
  };

  const buildLastTwelveMonthsData = () => {
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

    return lastTwelveMonths;
  };

  const getExtendedData = () => {
    const extended = buildDataFromMonthlyTotals(monthlyTotalsAllTime);
    return extended.length > 0 ? extended : buildLastTwelveMonthsData();
  };

  // Funzione per filtrare i dati in base al periodo selezionato
  const getFilteredData = () => {
    const lastTwelveMonths = buildLastTwelveMonthsData();

    // Filtra in base al periodo selezionato
    switch(selectedPeriod) {
      case '3m':
        return lastTwelveMonths.slice(-3); // Ultimi 3 mesi
      case '6m':
        return lastTwelveMonths.slice(-6); // Ultimi 6 mesi
      case '1y':
        return lastTwelveMonths; // Tutti i 12 mesi
      case '2y': {
        const extended = getExtendedData();
        return extended.length > 0 ? extended.slice(-24) : lastTwelveMonths;
      }
      case 'all': {
        const extended = getExtendedData();
        return extended.length > 0 ? extended : lastTwelveMonths;
      }
      case 'custom': {
        const extended = getExtendedData();
        const start = customStartMonth || extended[0]?.name;
        const end = customEndMonth || extended[extended.length - 1]?.name;
        if (!start || !end) return extended;
        const [from, to] = start <= end ? [start, end] : [end, start];
        return extended.filter((item) => item.name >= from && item.name <= to);
      }
      default:
        return lastTwelveMonths;
    }
  };

  const data = getFilteredData();
  const rangeData = getExtendedData();
  const minMonth = rangeData[0]?.name || '';
  const maxMonth = rangeData[rangeData.length - 1]?.name || '';
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

  // Pie Chart Functions
  const renderPieChart = () => {
    let pieData = [];
    const activeBreakdown = selectedPieFlow === 'incomes'
      ? totalIncomesCategoryBreakdownPerMonth
      : totalOutflowsCategoryBreakdownPerMonth;
    const categoryType = selectedPieFlow === 'incomes' ? 'income' : 'expense';
    
    if (activeBreakdown[selectedMonth]) {
      pieData = Object.entries(activeBreakdown[selectedMonth])
        .filter(([, data]) => data?.amount > 0)
        .map(([key, data], index) => {
          const tagLabel = resolveTagKeyFromLocalized(key, 'en', categoryType);
          const translatedName = tagLabel ? translateTag(tagLabel, language, categoryType) : key;
          const subcategories = Object.entries(data.subcategories || {})
            .filter(([, amount]) => amount > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([label, amount]) => ({ label, amount }));
          return {
          name: translatedName,
          parentKey: key,
          value: isHidden ? Math.floor(Math.random() * 1000) : data.amount,
          realValue: data.amount,
          subcategories,
          fill: isHidden 
            ? getGrayscaleColor(getCategoryColor(key, language), index)
            : getLighterSolidColor(getCategoryColor(key, language))
        };});
    }

    // Label interna: solo % dentro la fetta (come nella Dashboard)
    const RADIAN = Math.PI / 180;
    const renderInternalLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
      if (percent === 0) return null;
      if (isHidden) {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={isMobile ? 10 : 12}>****</text>;
      }
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
      const pct = (percent * 100).toFixed(0);
      // Nascondi label se fetta troppo piccola
      if (percent < 0.04) return null;
      return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={isMobile ? 10 : 12} fontWeight={600}>
          {pct}%
        </text>
      );
    };

    return (
      <div style={{ 
        width: '100%', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '0.5rem 0' : '1rem 0'
      }}>
        <div style={{ width: '100%', height: isMobile ? 300 : 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderInternalLabel}
                outerRadius="75%"
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
                  padding: '10px',
                  fontSize: '13px',
                  fontWeight: '500',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  color: '#333'
                }}
                formatter={(value, name) => {
                  if (isHidden) return ['****', name];
                  const formattedValue = formatAmount(value, { maximumFractionDigits: 0 });
                  const total = pieData.reduce((sum, item) => sum + item.value, 0);
                  const pct = ((value / total) * 100).toFixed(1);
                  return [`${formattedValue} (${pct}%)`, name];
                }}
                labelStyle={{
                  color: '#333',
                  fontWeight: 'bold',
                  marginBottom: '4px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legenda sotto il grafico a torta */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: isMobile ? '6px 12px' : '8px 16px',
          padding: isMobile ? '0.5rem 0.5rem 0' : '0.75rem 1rem 0',
          maxWidth: '100%'
        }}>
          {pieData.map((entry, index) => {
            const total = pieData.reduce((sum, item) => sum + item.value, 0);
            const pct = ((entry.value / total) * 100).toFixed(1);
            return (
              <div key={index} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                fontSize: isMobile ? '0.7rem' : '0.8rem',
                color: theme.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                maxWidth: isMobile ? '140px' : '190px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                  <div style={{
                    width: isMobile ? 8 : 10,
                    height: isMobile ? 8 : 10,
                    borderRadius: '50%',
                    backgroundColor: entry.fill,
                    flexShrink: 0
                  }} />
                  <span>{isHidden ? '****' : `${entry.name} ${pct}%`}</span>
                </div>
                {!isHidden && entry.subcategories.length > 0 && (
                  <div style={{
                    paddingLeft: isMobile ? 13 : 15,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    color: theme.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
                    fontSize: isMobile ? '0.64rem' : '0.72rem',
                    lineHeight: 1.25,
                  }}>
                    {entry.subcategories.slice(0, 3).map((sub) => (
                      <span key={sub.label} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        ↳ {sub.label} · {formatAmount(sub.amount, { maximumFractionDigits: 0 })}
                      </span>
                    ))}
                    {entry.subcategories.length > 3 && (
                      <span>+{entry.subcategories.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
    const monthOptions = [];
    let year = currentYear;

    const activeBreakdown = selectedPieFlow === 'incomes'
      ? totalIncomesCategoryBreakdownPerMonth
      : totalOutflowsCategoryBreakdownPerMonth;

    for (let i = 0; i < Object.keys(activeBreakdown).length; i++) {
      const month = ((currentMonth - i - 1 + 12) % 12) + 1;
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
          padding: isMobile ? '0.5rem' : '0.75rem', 
          textAlign: 'center', 
          borderBottom: theme.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
            {[
              { key: 'outflows', label: translations.general.outflows },
              { key: 'incomes', label: translations.general.incomes },
            ].map((option) => {
              const active = selectedPieFlow === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setSelectedPieFlow(option.key)}
                  style={{
                    border: `1px solid ${active ? theme.buttonBackgroundColor : (theme.mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)')}`,
                    borderRadius: 999,
                    padding: '0.35rem 0.75rem',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    background: active ? theme.buttonBackgroundColor : 'transparent',
                    color: active ? '#fff' : theme.textColor,
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
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
        {/* Toolbar: period selector + export buttons (row 1), custom date range (row 2, secondary) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          padding: isMobile ? '0' : '0 0.5rem',
          marginBottom: isMobile ? '0.5rem' : '0.85rem',
          gap: isMobile ? '0.35rem' : '0.4rem'
        }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: isMobile ? '0.35rem' : '0.75rem', flexWrap: 'wrap' }}>
          {/* Time Period Selector */}
          <div className="flex gap-1 z-10" style={{ flexWrap: 'wrap', gap: isMobile ? '0.2rem' : undefined, flex: '1 1 auto', minWidth: 0 }}>
            {['3m', '6m', '1y', '2y', 'all'].map((period) => {
              const isActive = selectedPeriod === period;
              const isBusy = (period === '2y' || period === 'all') && isLoadingFullHistory;

              return (
                <button
                  key={period}
                  onClick={() => handlePeriodSelect(period)}
                  disabled={isBusy}
                  className={`font-medium rounded-md transition-all duration-200 ${
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

          {/* Export buttons — small, top-right */}
          <div className="flex gap-1 z-10" style={{ flexShrink: 0, gap: isMobile ? '0.2rem' : '0.3rem' }}>
            <CSVLink
              data={data}
              headers={headers}
              filename={`incomeOutflows_${today.getMonth() + 1}-${today.getFullYear().toString().slice(-2)}.csv`}
              className="flex items-center justify-center rounded-lg border transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                borderColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                backdropFilter: 'blur(10px)',
              width: isMobile ? 24 : 28,
              height: isMobile ? 24 : 28
              }}
            >
              <BsFiletypeCsv className="text-paciGreen text-sm" />
            </CSVLink>

            <button
              onClick={async () => await downloadExcel(data, headers, `incomesOutflows_${today.getMonth() + 1}-${today.getFullYear().toString().slice(-2)}.xlsx`)}
              className="flex items-center justify-center rounded-lg border transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                borderColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                backdropFilter: 'blur(10px)',
              width: isMobile ? 24 : 28,
              height: isMobile ? 24 : 28
              }}
            >
              <RiFileExcel2Line className="text-paciGreen text-sm" />
            </button>
          </div>
        </div>

        {/* Custom date range — secondary filter, centered and de-emphasized */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobile ? 4 : 6, flexWrap: 'wrap', fontSize: isMobile ? '0.62rem' : '0.68rem', color: theme.textColor, opacity: 0.8 }}>
          <span style={{ opacity: 0.7 }}>{translations.general.from || 'Da'}</span>
          <input
            type="month"
            value={customStartMonth}
            min={minMonth}
            max={maxMonth}
            onChange={(e) => handleCustomRangeChange('start', e.target.value)}
            style={{
              border: `1px solid ${selectedPeriod === 'custom' ? theme.buttonBackgroundColor : (theme.mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)')}`,
              borderRadius: 6,
              padding: '0.2rem 0.3rem',
              fontSize: isMobile ? '0.64rem' : '0.68rem',
              minWidth: 0,
              maxWidth: '6.5rem',
              background: theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)',
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
              border: `1px solid ${selectedPeriod === 'custom' ? theme.buttonBackgroundColor : (theme.mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)')}`,
              borderRadius: 6,
              padding: '0.2rem 0.3rem',
              fontSize: isMobile ? '0.64rem' : '0.68rem',
              minWidth: 0,
              maxWidth: '6.5rem',
              background: theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)',
              color: theme.textColor,
              colorScheme: theme.mode === 'dark' ? 'dark' : 'light',
            }}
          />
        </div>
        </div>

        {/* Responsive chart container */}
        <div style={{ 
          width: '100%', 
          height: isMobile ? '320px' : '460px',
          padding: isMobile ? '0' : '0 0.5rem'
        }}>
          <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: isMobile ? 10 : 20,
              right: isMobile ? 5 : 30,
              left: isMobile ? -15 : 10,
              bottom: data.length > 18 ? 8 : (isMobile ? 5 : 20)
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
              interval={isMobile ? Math.max(1, xAxisInterval) : xAxisInterval}
              tickFormatter={formatXAxisTick}
              tick={{
                fontSize: containerWidth < 500 ? 8 : isLongRange ? 10 : containerWidth < 768 ? 10 : 12, 
                fill: theme.mode === 'dark' ? '#fff' : '#333',
                fontWeight: 500
              }} 
              angle={containerWidth < 500 || isLongRange ? -35 : 0}
              textAnchor={containerWidth < 500 || isLongRange ? 'end' : 'middle'}
              height={containerWidth < 500 || isLongRange ? 58 : 46}
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
                strokeWidth={isMobile ? 2 : 3}
                connectNulls={false}
                isAnimationActive={false}
                dot={{ 
                  r: isLongRange ? 0 : (isMobile ? 3 : 5),
                  fill: isHidden ? greyColor1 : "#079164", 
                  strokeWidth: isLongRange ? 0 : (isMobile ? 1 : 2)
                }}
                activeDot={{ 
                  r: isMobile ? 6 : 10, 
                  fill: isHidden ? greyColor1 : "#079164",
                  stroke: '#fff',
                  strokeWidth: isMobile ? 2 : 4,
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
                strokeWidth={isMobile ? 2 : 3}
                connectNulls={false}
                isAnimationActive={false}
                dot={{ 
                  r: isLongRange ? 0 : (isMobile ? 3 : 5),
                  fill: isHidden ? greyColor2 : "#ff3838", 
                  strokeWidth: isLongRange ? 0 : (isMobile ? 1 : 2)
                }}
                activeDot={{ 
                  r: isMobile ? 6 : 10, 
                  fill: isHidden ? greyColor2 : "#ff3838",
                  stroke: '#fff',
                  strokeWidth: isMobile ? 2 : 4,
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
                strokeWidth={isMobile ? 2 : 3}
                connectNulls={false}
                isAnimationActive={false}
                dot={{ 
                  r: isLongRange ? 0 : (isMobile ? 3 : 5),
                  fill: isHidden ? greyColor1 : "#06b6d4", 
                  strokeWidth: isLongRange ? 0 : (isMobile ? 1 : 2)
                }}
                activeDot={{ 
                  r: isMobile ? 6 : 10, 
                  fill: isHidden ? greyColor1 : "#06b6d4",
                  stroke: '#fff',
                  strokeWidth: isMobile ? 2 : 4,
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
                  value: data.length > 18
                    ? `${language === 'it' ? 'Limite' : 'Limit'} ${currencySymbol}${fromEUR(userData.limits.monthlySpendingLimit).toLocaleString()}`
                    : `${language === 'it' ? 'Limite spesa' : 'Spending limit'}: ${currencySymbol}${fromEUR(userData.limits.monthlySpendingLimit).toLocaleString()}`,
                  position: data.length > 18 ? "insideTopRight" : "top",
                  offset: isMobile ? 8 : 16,
                  fill: "#ff6b35",
                  fontSize: isMobile ? 8 : data.length > 18 ? 10 : 12,
                  fontWeight: 600,
                  textAnchor: data.length > 18 ? 'end' : 'middle'
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
                      value: data.length > 18
                        ? `${language === 'it' ? 'Obiettivo' : 'Goal'} ${currencySymbol}${fromEUR(savingsTarget).toFixed(0)}`
                        : `${language === 'it' ? 'Obiettivo risparmio' : 'Savings goal'}: ${currencySymbol}${fromEUR(savingsTarget).toFixed(0)} (${userData.limits.savingsGoalPercentage}%)`,
                      position: data.length > 18 ? "insideBottomRight" : "bottom",
                      offset: isMobile ? 8 : 16,
                      fill: "#10b981",
                      fontSize: isMobile ? 8 : data.length > 18 ? 10 : 12,
                      fontWeight: 600,
                      textAnchor: data.length > 18 ? 'end' : 'middle'
                    }}
                  />
                ) : null;
              })()
            )}
            {!isMobile && data.length > 18 && (
              <Brush
                dataKey="name"
                height={22}
                travellerWidth={8}
                stroke={theme.buttonBackgroundColor || '#079164'}
                fill={theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}
                tickFormatter={formatXAxisTick}
              />
            )}
          </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legenda personalizzata - posizionata sotto il grafico */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: isMobile ? '12px' : '20px', 
          paddingTop: isMobile ? '2px' : '8px',
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
                gap: isMobile ? '5px' : '8px',
                cursor: 'pointer',
                fontSize: isMobile ? '12px' : '15px',
                fontWeight: 500,
                opacity: lineVisibility[key] ? 1 : 0.5,
                textDecoration: lineVisibility[key] ? 'none' : 'line-through',
                color: theme.mode === 'dark' ? '#ffffff' : '#333333'
              }}
            >
              <div
                style={{
                  width: isMobile ? '12px' : '16px',
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

export default React.memo(InOutChart);
