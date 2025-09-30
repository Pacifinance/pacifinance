import React, { useState, useEffect, useContext } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { PercentageOutflowsChartContainer } from '../styles/MyStyled';
import { renderCustomizedLabel } from '../utils/customGraphsInfo';
import { UserContext } from '../contexts/UserContext';
import languages from '../data/languages.json';
import { LanguageContext } from '../contexts/LanguageContext';
import { outflowCategoryColors } from '../data/categoryColors';

export default function PercentageOutflowsChart({theme, userData, isHidden}) {
  const { language } = useContext(LanguageContext);
  const [totalOutflowsPerCategoryPerMonth, setTotalOutflowsPerCategoryPerMonth] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(800);

  // Gestione responsive
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setContainerWidth(Math.min(width - 60, 350));
      } else if (width < 1024) {
        setContainerWidth(Math.min(width - 120, 500));
      } else {
        setContainerWidth(Math.min(width - 200, 700));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (userData) {
        try {
          setTotalOutflowsPerCategoryPerMonth(userData.totalExpensesPerCategoryPerMonth);
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
    const selectedData = totalOutflowsPerCategoryPerMonth[selectedMonth];

    if (!selectedData) {
      return null;
    }

    const expensePerCategoryData = Object.keys(selectedData).map((category) => ({
      name: category, // language == 'it' ? OutflowsTags[category].translation.it :  (to adjust)
      value: selectedData[category],
    }));

    const totalExpenseData = expensePerCategoryData.reduce((accumulator, currentValue) => accumulator + currentValue.value, 0); 

    const chartHeight = containerWidth < 500 ? 350 : 400;
    const pieRadius = containerWidth < 500 ? 80 : 120;

    return (
      <div style={{ 
        width: '100%', 
        height: `${chartHeight + 100}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <PieChart width={containerWidth} height={chartHeight}>
          <Pie
            data={expensePerCategoryData}
            cx={containerWidth / 2}
            cy={chartHeight / 2}
            labelLine={false}
            label={isHidden ? null : renderCustomizedLabel}
            outerRadius={pieRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {expensePerCategoryData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={isHidden ? '#cccccc' : (outflowCategoryColors[entry.name] || '#8884d8')} 
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: theme.mode === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)', 
              color: theme.textColor,
              borderRadius: '12px', 
              padding: '12px',
              border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(10px)'
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
              fontWeight: 500
            }}
          />
        </PieChart>
      </div>
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

  // Iterate over totalOutflowsPerCategoryPerMonth
  for (let i = 0; i < Object.keys(totalOutflowsPerCategoryPerMonth).length; i++) {
    // Calculate the month and year for the current index
    let month = ((currentMonth - i - 1 + 12) % 12) + 1; // Subtract 1 before the modulo operation and add 1 after


    if (month === 12 && i !== 0) {
      year--;
    }

    // Add an object with value and label properties to monthOptions
    monthOptions.push({ value: i, label: `${monthNames[month]} ${year}` });
  }

  // Now monthOptions contains the month names and years for the indices in totalOutflowsPerCategoryPerMonth
  // console.log(monthOptions);
  
  return (
    <PercentageOutflowsChartContainer>
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
    </PercentageOutflowsChartContainer>
  );
}