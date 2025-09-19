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

  const greyScale1 = Math.floor(Math.random() * 256);
  const greyColor1 = `rgb(${greyScale1}, ${greyScale1}, ${greyScale1})`;
  const greyScale2 = Math.floor(Math.random() * 256);
  const greyColor2 = `rgb(${greyScale2}, ${greyScale2}, ${greyScale2})`;

  //impostare i dati presi dell'utente per le spese e le entrate TODO
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
    <SectionInOut style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '800px' }}>
        <CSVLink data={data} headers={headers}
          filename={`incomesOutflows_${today.getMonth() + 1}-${today.getFullYear().toString().slice(-2)}.csv`} 
          className="absolute top-[-30px] right-0 px-1 py-1 border border-black shadow-md bg-white text-black no-underline rounded cursor-pointer hover:bg-gray-100 z-10"
        >
          <BsFiletypeCsv className="text-paciGreen text-xl" />
        </CSVLink>

        <button
            disabled
            onClick={async () => await downloadExcel(data, headers, `incomesOutflows_${today.getMonth() + 1}-${today.getFullYear().toString().slice(-2)}.xlsx`)}
            className="absolute top-[-30px] right-8 px-1 py-1 border border-black shadow-md bg-white text-black no-underline rounded cursor-pointer hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-200 z-10"
          >
            <RiFileExcel2Line className="text-paciGreen text-xl" />
        </button>

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <LineChart
            width={Math.max(600, window.innerWidth > 768 ? 700 : Math.min(window.innerWidth - 40, 600))}
            height={400}
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 40
            }}
          >
          <CartesianGrid strokeDasharray="3 3" stroke="transparent" vertical={false}/>
            <XAxis 
              tick={{fontSize: window.innerWidth > 768 ? 10 : 8, fill: theme.textColor}} 
              interval={window.innerWidth > 768 ? 0 : 1} 
              dataKey="name" 
              angle={window.innerWidth > 768 ? 0 : -45}
              textAnchor={window.innerWidth > 768 ? 'middle' : 'end'}
              height={window.innerWidth > 768 ? 60 : 80}
            />
            <YAxis tick={(props) => <CustomTick {...props} textAnchor="middle" fill={theme.textColor} fontSize={window.innerWidth > 768 ? 11 : 9} dx={-10}/>} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', color: '#079164', borderRadius: '4px', padding: '8px', fontSize: '12px' }}
              labelStyle={{ color: 'black', fontWeight: 'bold' }}
              formatter={(value, name, entry) => {
                return isHidden ? ['****'] : [`${name}: ${new Intl.NumberFormat('it-IT', {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 0,
                }).format(value)}`];
              }}
            />
            <Legend wrapperStyle={{ fontSize: window.innerWidth > 768 ? '14px' : '12px' }} />
            <Line type="monotone" dataKey={languages[language].general.incomes} stroke={isHidden ? greyColor1 : "#079164"} strokeWidth={3} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey={languages[language].general.outflows} stroke={isHidden ? greyColor2 : "#ff3838"} strokeWidth={2} />
          </LineChart>
        </div>
      </div>
    </SectionInOut>
  );
}