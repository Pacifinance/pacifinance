import React, {useState, useEffect} from "react";
import { CartesianGrid } from "recharts/lib/cartesian/CartesianGrid";
import { Tooltip } from "recharts/lib/component/Tooltip";
import { XAxis } from "recharts/lib/cartesian/XAxis";
import { YAxis } from "recharts/lib/cartesian/YAxis";
import { LineChart } from "recharts/lib/chart/LineChart";
import { Line } from "recharts/lib/cartesian/Line";
import { Legend } from "recharts/lib/component/Legend";
import { SectionInOut } from '../contexts/MyStyled';




export default function InOutChart({theme, userData, isHidden, CustomTick}) {
  const [incomesArray, setIncomesArray] = useState([]);
  const [expensesArray, setExpensesArray] = useState([]);
  //impostare i dati presi dell'utente per le spese e le entrate TODO
  useEffect(() => {
    const fetchData = async () => {
      if (userData) {
        try {
            setIncomesArray(userData.incomesArray);
            setExpensesArray(userData.expensesArray);  
            
        } catch (error) {
          console.error('Errore durante le operazioni:', error);
        }
      }
    };

  fetchData();
  }, [userData]);

  const today = new Date();
  const lastTwelveMonths = [];

  for (let i = 0; i < 12; i++) {
    const month = today.getMonth() - i;
    const year = today.getFullYear();
    const date = new Date(year, month, 1);

    const monthName = date.toLocaleDateString('it-IT', { month: 'long' });

    lastTwelveMonths.push({
      name: monthName,
      Uscite: expensesArray[i] || 0, // Usa 0 se non ci sono dati
      Entrate: incomesArray[i] || 0, // Usa 0 se non ci sono dati
      amt: 0, // Aggiungi eventuali dati aggiuntivi
    });
  }

  const data = lastTwelveMonths.reverse(); // Inverti l'ordine

  return (
    <SectionInOut>
      <LineChart
        width={600}
        height={400}
        data={data}
        margin={{
          top: 5,
          left: 35,
          bottom: 40
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis tick={{fontSize: 9, fill: theme.textColor}} interval={1} dataKey="name" />
        <YAxis tick={(props) => <CustomTick {...props} textAnchor="middle" fill={theme.textColor} fontSize={11} dx={-10}/>} />
        <Tooltip
          contentStyle={{ backgroundColor: '#fff', color: '#079164', borderRadius: '4px', padding: '8px' }}
          labelStyle={{ color: 'black', fontWeight: 'bold' }}
          formatter={(value, name, entry) => {
            return isHidden ? ['****'] : [`${name}: ${new Intl.NumberFormat('it-IT', {
              style: 'currency',
              currency: 'EUR',
              maximumFractionDigits: 0,
            }).format(value)}`];
          }}
        />
        <Legend />
        <Line type="monotone" dataKey="Entrate" stroke="#079164" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="Uscite" stroke="#ff3838" />
        {/* <Line type="monotone" dataKey={isHidden ? '****' : "Entrate"} stroke={isHidden ? theme.textColor : "#079164"} activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey={isHidden ? '****' : "Uscite"} stroke={isHidden ? theme.textColor : "#ff3838"} /> */}
      </LineChart>
    </SectionInOut>
  );
}

