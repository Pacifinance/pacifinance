import React, {useState, useEffect} from "react";
import { CartesianGrid } from "recharts/lib/cartesian/CartesianGrid";
import { Tooltip } from "recharts/lib/component/Tooltip";
import { XAxis } from "recharts/lib/cartesian/XAxis";
import { YAxis } from "recharts/lib/cartesian/YAxis";
import { LineChart } from "recharts/lib/chart/LineChart";
import { Line } from "recharts/lib/cartesian/Line";
import { Legend } from "recharts/lib/component/Legend";
import { SectionInOut } from '../styles/MyStyled';
import { Brush } from "recharts/lib/cartesian/Brush";
import { CSVLink } from 'react-csv';
import { BsFiletypeCsv } from "react-icons/bs";
import { LanguageContext } from '../contexts/LanguageContext';
import languages from '../data/languages.json';
import { downloadExcel } from '../utils/downloadData.jsx';
import { RiFileExcel2Line } from "react-icons/ri";





export default function InOutChart({theme, userData, isHidden, CustomTick}) {
  const { language } = React.useContext(LanguageContext);
  const [incomesArray, setIncomesArray] = useState([]);
  const [outflowsArray, setOutflowsArray] = useState([]);
  const [containerWidth, setContainerWidth] = useState(800);

  const greyScale1 = Math.floor(Math.random() * 256);
  const greyColor1 = `rgb(${greyScale1}, ${greyScale1}, ${greyScale1})`;
  const greyScale2 = Math.floor(Math.random() * 256);
  const greyColor2 = `rgb(${greyScale2}, ${greyScale2}, ${greyScale2})`;

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

  //impostare i dati presi dell'utente per le spese e le entrate
  useEffect(() => {
    const fetchData = async () => {
      if (userData) {
        try {
            setIncomesArray(userData.incomesArray || []);
            setOutflowsArray(userData.expensesArray || []);  

        } catch (error) {
          console.error('Error', error);
        }
      }
    };

  fetchData();
  }, [userData]);

  const headers = [
    { label: languages[language]?.graphs?.statsOutflows?.titleGraph || 'Month', key: 'name' },
    { label: languages[language]?.general?.incomes || 'Inflows', key: 'incomes' },
    { label: languages[language]?.general?.outflows || 'Outflows', key: 'outflows' },
  ];

  const today = new Date();
  const lastTwelveMonths = [];

  for (let i = 0; i < 12; i++) {
    const month = today.getMonth() - i;
    const year = today.getFullYear();
    const date = new Date(year, month, 1);

    const monthName = date.toLocaleDateString('it-IT', { month: 'long' });

    lastTwelveMonths.push({
      name: monthName,
      [languages[language].general.outflows]: Math.abs(outflowsArray[i] || 0), // Usa valore assoluto
      [languages[language].general.incomes]: Math.abs(incomesArray[i] || 0), // Usa valore assoluto
      amt: 0, // Aggiungi eventuali dati aggiuntivi
    });
  }

  const data = lastTwelveMonths.reverse(); // Inverti l'ordine

  return (
    <SectionInOut style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '100%' }}>
        {/* Export buttons */}
        <div className="absolute top-0 right-0 flex gap-2 z-10">
          <CSVLink 
            data={data} 
            headers={headers}
            filename={`incomesOutflows_${today.getMonth() + 1}-${today.getFullYear().toString().slice(-2)}.csv`} 
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
            onClick={async () => await downloadExcel(data, headers, `incomesOutflows_${today.getMonth() + 1}-${today.getFullYear().toString().slice(-2)}.xlsx`)}
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
          marginTop: '2rem'
        }}>
          <LineChart
            width={containerWidth}
            height={400}
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60
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
                fill: theme.textColor,
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
              contentStyle={{ 
                backgroundColor: theme.mode === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)', 
                color: theme.textColor,
                borderRadius: '12px', 
                padding: '12px',
                fontSize: '13px',
                border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                backdropFilter: 'blur(10px)'
              }}
              labelStyle={{ 
                color: theme.textColor, 
                fontWeight: 'bold',
                marginBottom: '4px'
              }}
              formatter={(value, name, entry) => {
                if (isHidden) return ['****'];
                
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
                fontSize: containerWidth < 500 ? '12px' : '14px',
                fontWeight: 500,
                paddingTop: '10px'
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