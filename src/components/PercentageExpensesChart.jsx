import React, { useState, useEffect, useContext } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { PercentageExpensesChartContainer } from '../styles/MyStyled';
import { renderCustomizedLabel } from '../utils/customGraphsInfo';
import { UserContext } from '../contexts/UserContext';
import languages from '../data/languages.json';
import { LanguageContext } from '../contexts/LanguageContext';

export default function PercentageExpensesChart({theme, userData, isHidden}) {
  const { language } = useContext(LanguageContext);
  //const { expensesTags } = useContext(UserContext);
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

    const expensePerCategoryData = Object.keys(selectedData).map((category) => ({
      name: category, // language == 'it' ? expensesTags[category].translation.it :  (to adjust)
      value: selectedData[category],
    }));

    const totalExpenseData = expensePerCategoryData.reduce((accumulator, currentValue) => accumulator + currentValue.value, 0); 

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
      <PieChart width={800} height={500}>
        <Pie
          data={expensePerCategoryData}
          cx={430}
          cy={250}
          label={renderCustomizedLabel}
          labelLine={false}
          outerRadius={200}
          dataKey="value"
        >
          {expensePerCategoryData.map((entry, index) => {
            if(entry.value === 0) {
              return <Cell key={entry.name} fill="transparent" />;
            }
            const greyScale = Math.floor(Math.random() * 256);
            const greyColor = `rgb(${greyScale}, ${greyScale}, ${greyScale})`;
            return <Cell key={`cell-${index}`} fill={isHidden ? greyColor : COLORS[index % COLORS.length]} />
          })}
        </Pie>
        <Tooltip
            content={({ payload, active }) => {
                if (active) {
                const data = payload[0].payload;
                const value = isHidden ? '****' : data.value;
                const percentage = isHidden ? '****' : ((value / totalExpenseData) * 100).toFixed(0);

                    // Format the value with thousands and euro symbol
                    const formattedValue = new Intl.NumberFormat('it-IT', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0,
                    }).format(value);

                    return (
                        <div className="custom-tooltip" style={{ backgroundColor: '#fff', color: '#079164', borderRadius: '4px', padding: '8px' }}>
                            <p>{isHidden ? '****' : data.name}</p>
                            <p style={{ color: 'black' }}>{formattedValue}({percentage}%)</p>
                        </div>
                    );
                }
                return null;
            }}
            contentStyle={{ backgroundColor: '#fff', color: '#079164', borderRadius: '4px', padding: '8px' }}
        />
        <Legend
          content={props => {
            const { payload } = props;
            if (isHidden) {
              return '****';
            }
            return (
              <ul>
                {payload.map((entry, index) => (
                  <li key={`item-${index}`} style={{ fontSize: '14px', color: theme.textColor }}>
                    <span style={{ color: entry.color }}>&#9679;</span>
                    {` ${entry.value}`}
                  </li>
                ))}
              </ul>
            );
          }}
        />
      </PieChart>
    );
  };

  // Array of month names in Italian
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
  
  // Get the current month and year
  const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-based, so add 1
  const currentYear = new Date().getFullYear();
  
  // Initialize monthOptions as an empty array
  let monthOptions = [];
  let year = currentYear;
  
  // Iterate over totalExpensesPerCategoryPerMonth
  for (let i = 0; i < Object.keys(totalExpensesPerCategoryPerMonth).length; i++) {
    // Calculate the month and year for the current index
    let month = ((currentMonth - i - 1 + 12) % 12) + 1; // Subtract 1 before the modulo operation and add 1 after
    

    if (month === 12 && i !== 0) {
      year--;
    }
  
    // Add an object with value and label properties to monthOptions
    monthOptions.push({ value: i, label: `${monthNames[month]} ${year}` });
  }

  // Now monthOptions contains the month names and years for the indices in totalExpensesPerCategoryPerMonth
  // console.log(monthOptions);

  return (
    <PercentageExpensesChartContainer>
      <div>
        <select value={selectedMonth} onChange={handleMonthChange} style={{ padding: '1em' }}>
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {renderPieChart()}
    </PercentageExpensesChartContainer>
  );
}
