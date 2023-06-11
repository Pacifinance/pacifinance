import React from "react";
import { CartesianGrid } from "recharts/lib/cartesian/CartesianGrid";
import { Tooltip } from "recharts/lib/component/Tooltip";
import { XAxis } from "recharts/lib/cartesian/XAxis";
import { YAxis } from "recharts/lib/cartesian/YAxis";
import { LineChart } from "recharts/lib/chart/LineChart";
import { Line } from "recharts/lib/cartesian/Line";
import { Legend } from "recharts/lib/component/Legend";
import styled from 'styled-components'


const data = [
  {
    name: "January",
    Expenses: 4000,
    Incomes: 2400,
    amt: 2400
  },
  {
    name: "February",
    Expenses: 3000,
    Incomes: 1398,
    amt: 2210
  },
  {
    name: "March",
    Expenses: 2000,
    Incomes: 9800,
    amt: 2290
  },
  {
    name: "April",
    Expenses: 2780,
    Incomes: 3908,
    amt: 2000
  },
  {
    name: "May",
    Expenses: 1890,
    Incomes: 4800,
    amt: 2181
  },
  {
    name: "June",
    Expenses: 2390,
    Incomes: 3800,
    amt: 2500
  },
  {
    name: "July",
    Expenses: 3490,
    Incomes: 4300,
    amt: 2100
  },
  {
    name: "August",
    Expenses: 3490,
    Incomes: 4300,
    amt: 2100
  },
  {
    name: "September",
    Expenses: 3490,
    Incomes: 4300,
    amt: 2100
  },
  {
    name: "October",
    Expenses: 3490,
    Incomes: 4300,
    amt: 2100
  },
  {
    name: "November",
    Expenses: 3490,
    Incomes: 4300,
    amt: 2100
  },
  {
    name: "December",
    Expenses: 3490,
    Incomes: 4300,
    amt: 2100
  },
];

export default function Incomes() {
  return (
    <Section>
      <h3>Incomes vs Outcomes</h3>
      <h5>Check Incomes and outcomes</h5>
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
        <Line
          type="monotone"
          dataKey="Incomes"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
        <Line type="monotone" dataKey="Expenses" stroke="#82ca9d" />
      </LineChart>
    </Section>
  );
}

const Section = styled.section`
h5{
  color: grey;
  
}
h3{
  color: black;
  border-top: 1px solid grey;
  margin top: 10px;
}

.incomes {
    margin-top: 4rem;
    color: black;
    width: 100%;
    .incomes__details {
        display: flex;
        justify-content: space-between;
        margin: 1rem 1rem ;
        div {
            display: flex;
            gap: 1rem;
           color: grey;
        }
    }
    .incomes__graph {
        display: flex;
        justify-content: space-between;
        margin: 1rem 0;
        color: grey;
        table {
            border-collapse: collapse;
            width: 100%;
             td {
                text-align: center;
                padding: 5px;
                justify-content: space-evenly;
               
                img{
                height: 2.5rem;
                width: 2.5rem;
                border-radius: 3rem;
            }
                
            }
            
        }
    }
}
`;