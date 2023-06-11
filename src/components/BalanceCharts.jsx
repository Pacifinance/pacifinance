import React from "react";
import { CartesianGrid } from "recharts/lib/cartesian/CartesianGrid";
import { Tooltip } from "recharts/lib/component/Tooltip"; 
import { XAxis } from "recharts/lib/cartesian/XAxis";
import { YAxis } from "recharts/lib/cartesian/YAxis";
import { BarChart } from "recharts/lib/chart/BarChart";
import { Bar } from "recharts/lib/cartesian/Bar";
import { Legend } from "recharts/lib/component/Legend";
import styled from 'styled-components'

const data = [
  {
    name: 'January',
    InCash: 500,
    InStocks: 800,
    InBank: 2400,
    InCrypto: 4000,
    amt: 2400,
  },
  {
    name: 'February',
    InCash: 350,
    InStocks: 900,
    InBank: 1398,
    InCrypto: 3000,
    amt: 2210,
  },
  {
    name: 'March',
    InCash: 200,
    InStocks: 1000,
    InBank: 9800,
    InCrypto: 2000,
    amt: 2290,
  },
  {
    name: 'April',
    InCash: 220,
    InStocks: 1100,
    InBank: 3908,
    InCrypto: 2780,
    amt: 2000,
  },
  {
    name: 'May',
    InCash: 450,
    InStocks: 1200,
    InBank: 4800,
    InCrypto: 1890,
    amt: 2181,
  },
  {
    name: 'June',
    InCash: 1000,
    InStocks: 1300,
    InBank: 3800,
    InCrypto: 2390,
    amt: 2500,
  },
  {
    name: 'July',
    InCash: 600,
    InStocks: 1400,
    InBank: 4300,
    InCrypto: 3490,
    amt: 2100,
  },
  {
    name: 'August',
    InCash: 200,
    InStocks: 1500,
    InBank: 3908,
    InCrypto: 2780,
    amt: 2000,
  },
  {
    name: 'September',
    InCash: 100,
    InStocks: 1600,
    InBank: 4800,
    InCrypto: 1890,
    amt: 2181,
  },
  {
    name: 'October',
    InCash: 500,
    InStocks: 1700,
    InBank: 3800,
    InCrypto: 2390,
    amt: 2500,
  },
  {
    name: 'November',
    InCash: 900,
    InStocks: 1800,
    InBank: 4300,
    InCrypto: 3490,
    amt: 2100,
  },
  {
    name: 'December',
    InCash: 700,
    InStocks: 1900,
    InBank: 4300,
    InCrypto: 3490,
    amt: 2100,
  },
];


export default function Balance() {
  return (
    <Section>
      <h3>Balance</h3>
      <h5>Portfolio check in the months</h5>
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 20,
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
        
        <Bar dataKey="InCrypto" stackId="a" fill="#f5cb42" />
        <Bar dataKey="InBank" stackId="a" fill="#8884d8" />
        <Bar dataKey="InStocks" stackId="a" fill="#0072c6" />
        <Bar dataKey="InCash" stackId="a" fill="#82ca9d" />
        
        

      </BarChart>
    </Section>
  );
}

const Section = styled.section`
  h3 {
    text-align: center;
  }
  h5{
    text-align: center;
    color: grey;
    margin-bottom: 2rem;
  }
  .portfolio {
    color: black;
    width: 100%;
    .portfolio__details {
      display: flex;
      justify-content: space-between;
      margin: 1rem 0;
      div {
        display: flex;
        gap: 1rem;
        h5 {
          color: gray;
        }
      }
    }
    .portfolio__graph {
      height: 10rem;
      width: 100%;
      .recharts-default-tooltip {
        background-color: black !important;
        border-color: black !important;
        color: white !important;
      }
    }
  }
`;
