import React from "react";
import { CartesianGrid } from "recharts/lib/cartesian/CartesianGrid";
import { Tooltip } from "recharts/lib/component/Tooltip";
import { XAxis } from "recharts/lib/cartesian/XAxis";
import { YAxis } from "recharts/lib/cartesian/YAxis";
import { LineChart } from "recharts/lib/chart/LineChart";
import { Line } from "recharts/lib/cartesian/Line";
import { Legend } from "recharts/lib/component/Legend";
import MyStyled from '../contexts/MyStyled';


const data = [
  {
    name: "January",
    Uscite: 4000,
    Entrate: 2400,
    amt: 2400
  },
  {
    name: "February",
    Uscite: 3000,
    Entrate: 1398,
    amt: 2210
  },
  {
    name: "March",
    Uscite: 2000,
    Entrate: 9800,
    amt: 2290
  },
  {
    name: "April",
    Uscite: 2780,
    Entrate: 3908,
    amt: 2000
  },
  {
    name: "May",
    Uscite: 1890,
    Entrate: 4800,
    amt: 2181
  },
  {
    name: "June",
    Uscite: 2390,
    Entrate: 3800,
    amt: 2500
  },
  {
    name: "July",
    Uscite: 3490,
    Entrate: 4300,
    amt: 2100
  },
  {
    name: "August",
    Uscite: 3490,
    Entrate: 4300,
    amt: 2100
  },
  {
    name: "September",
    Uscite: 3490,
    Entrate: 4300,
    amt: 2100
  },
  {
    name: "October",
    Uscite: 3490,
    Entrate: 4300,
    amt: 2100
  },
  {
    name: "November",
    Uscite: 3490,
    Entrate: 4300,
    amt: 2100
  },
  {
    name: "December",
    Uscite: 3490,
    Entrate: 4300,
    amt: 2100
  },
];

export default function Incomes() {

  const { SectionInOut } = MyStyled();

  return (
    <SectionInOut>
      <h3>Entrate vs uscite</h3>
      <h5>Controllo delle entrate e uscite nei mesi</h5>
      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis tick={{fontSize: 9}} interval={1} dataKey="name" />
        <YAxis tick={{fontSize: 12}} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Entrate" stroke="#079164" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="Uscite" stroke="#ff3838" />
      </LineChart>
    </SectionInOut>
  );
}

