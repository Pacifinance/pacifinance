import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { SectionInOut } from '../contexts/MyStyled';

export default function PercentageExpensesChart() {
  const { userData, handleSetIsUpdated } = useContext(UserContext);
  const [totalExpensesPerCategoryPerMonth, setTotalExpensesPerCategoryPerMonth] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(0); // Set default selected month as the first month

  useEffect(() => {
    const fetchData = async () => {
      if (userData) {
        try {
          setTotalExpensesPerCategoryPerMonth(userData.totalExpensesPerCategoryPerMonth);
        } catch (error) {
          console.error('Error during operations:', error);
        }
      }
    };

    fetchData();
  }, [userData]);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value); // Update the selected month
  };

  const renderPieChart = () => {
    const selectedData = totalExpensesPerCategoryPerMonth[selectedMonth];

    if (!selectedData) {
      return null;
    }

    const data = Object.keys(selectedData).map((category) => ({
      name: category,
      value: selectedData[category],
    }));

    const COLORS = [
        '#0088FE',
        '#00C49F',
        '#FFBB28',
        '#FF8042',
        '#AF19FF',
        '#FF6E6E',
        '#82ca9d',
        '#8884d8',
        '#FFA500',
        '#7FFFD4',
        '#FF1493',
        '#00CED1',
        '#DC143C',
        '#FFD700',
        '#9ACD32',
      ];

    return (
      <PieChart width={800} height={400}>
        <Pie
          data={data}
          cx={200}
          cy={200}
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    );
  };

  const today = new Date();
  const monthOptions = [];

  for (let i = 0; i < totalExpensesPerCategoryPerMonth.length; i++) {
    const month = today.getMonth() - i;
    const year = today.getFullYear();
    const date = new Date(year, month, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'long' });
    const yearValue = date.getFullYear();
    monthOptions.push({ value: i, label: `${monthName} ${yearValue}` });
  }

  return (
    <SectionInOut>
      <div>
        <select value={selectedMonth} onChange={handleMonthChange}>
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {renderPieChart()}
    </SectionInOut>
  );
}
