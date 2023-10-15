import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { StyledSelectContainer, StyledLabel, StyledRankingsSection, StyledRankingPage, CenteredRankings, RankingsTitle } from '../contexts/MyStyled';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';

// Componente per il selettore di mese e anno
// function MonthYearSelector({ selectedMonth, selectedYear, onMonthChange, onYearChange }) {
//   const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
//   const years = [2022, 2023, 2024, 2025]; // Modifica gli anni disponibili se necessario

//   const handleMonthChange = (event) => {
//     const month = parseInt(event.target.value);
//     onMonthChange(month);
//   };

//   const handleYearChange = (event) => {
//     const year = parseInt(event.target.value);
//     onYearChange(year);
//   };

//   return (
//       <StyledSelectContainer>
//         <StyledLabel>Mese:</StyledLabel>
//         <StyledSelect value={selectedMonth} onChange={handleMonthChange}>
//           {months.map((month, index) => (
//             <option key={index} value={index + 1}>{month}</option>
//           ))}
//         </StyledSelect>
  
//         <StyledLabel>Anno:</StyledLabel>
//         <StyledSelect value={selectedYear} onChange={handleYearChange}>
//           {years.map((year) => (
//             <option key={year} value={year}>{year}</option>
//           ))}
//         </StyledSelect>
//       </StyledSelectContainer>
//     );
//   }


// Component for the rankings section
function RankingsSection({ title, rankings }) {
  // Verify if there is a title for expenses
  const isExpenseTitle = title.toLowerCase().includes("spese");

  // Verify if there are rankings > 50 (top 50%)
  const isRankingsAbove50 = rankings > 50;

  // Calculate the text to display
  let textToDisplay = "";
  if (!isNaN(parseFloat(rankings))) {
    if (isExpenseTitle) {
        if (isRankingsAbove50) {
            textToDisplay = `Sei nella top ${Math.min(rankings, 99)}% degli utenti che spendono di più!`;
        } else {
            textToDisplay = `Complimenti! Sei nella top ${Math.min(rankings, 99)}%. Sei tra gli utenti che spendono di meno!`;
        }
    } else {
        if (isRankingsAbove50) {
            textToDisplay = `Complimenti! Sei nella top ${Math.min(rankings, 99)}% degli utenti!`;
        } else {
            textToDisplay = `Sei nella top ${Math.min(rankings, 99)}% degli utenti!`;
        }
    }
  } else {
      // Set the text to display if rankings is not a number
      textToDisplay = "Rankings non disponibili";
  }

  const areNotEmpty = rankings.length > 0 || rankings > 0;

  return (
    <StyledRankingsSection>
      <h2>
        {title}
        {isExpenseTitle && (
          <Tooltip title="Questo rank mostra nelle posizioni alte chi spende di più." arrow>
            <InfoIcon style={{ color: 'white' }} />
          </Tooltip>
        )}
      </h2>
      {areNotEmpty ? (
        <p>{textToDisplay}</p>
      ) : (
        <p>Coming Soon</p>
      )}
    </StyledRankingsSection>
  );
}




function RankingComponent() {
  const { userData, handleSetIsUpdated } = useContext(UserContext);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedYear, setSelectedYear] = useState(2023);
  const [balanceRank, setBalanceRank] = useState([]);
  const [incomeRank, setIncomeRank] = useState([]);
  const [expenseRank, setExpenseRank] = useState([]);
  const [balanceSimilarUsersRank, setSimilarUsersRank] = useState([]);
  const [incomesSimilarUsersRank, setIncomeSimilarUsersRank] = useState([]);
  const [expensesSimilarUsersRank, setExpenseSimilarUsersRank] = useState([]);


  const fetchData = async () => {
      if (userData) {
        try {
            
            setBalanceRank(userData ? userData.percentageRankOnBalance : []);
            setIncomeRank(userData ? userData.percentageRankOnIncomes : []);
            setExpenseRank(userData ? userData.percentageRankOnExpenses : []);

            // console.log("balanceRank", balanceRank);

        } catch (error) {
          console.error('Errore durante le operazioni:', error);
        }
      }
  };

  useEffect(() => {
    fetchData();
    console.log("balanceRank", balanceRank);
  }, [userData]);

  const formattedPreMonthDate = userData?.preMonthDate
      ? new Date(userData.preMonthDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' })
      : "";


  // const handleMonthChange = (month) => {
  //   setSelectedMonth(month);
  // };

  // const handleYearChange = (year) => {
  //   setSelectedYear(year);
  // };

  return (
    <StyledRankingPage>
      {/* <MonthYearSelector
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={handleMonthChange}
        onYearChange={handleYearChange}
      /> */}
      <StyledLabel>Classifiche relative al mese {formattedPreMonthDate}</StyledLabel>
      <RankingsTitle >Classifiche generali : </RankingsTitle>
      <CenteredRankings>
        <RankingsSection title="Classifica Patrimonio" rankings={balanceRank} />
        <RankingsSection title="Classifica Guadagni" rankings={incomeRank} />
        <RankingsSection title="Classifica Spese" rankings={expenseRank} />
      </CenteredRankings>
      <RankingsTitle  >Classifiche utenti simili : </RankingsTitle >
      <CenteredRankings>
        <RankingsSection title="Classifica Patrimonio" rankings={balanceSimilarUsersRank} />
        <RankingsSection title="Classifica Guadagni" rankings={incomesSimilarUsersRank} />
        <RankingsSection title="Classifica Spese" rankings={expensesSimilarUsersRank} />

      </CenteredRankings>
    </StyledRankingPage>
  );
}
export default RankingComponent;


{/* <ol>
        {rankings.map((ranking, index) => (
          <li key={ranking.userId}>
            Posizione: {ranking.position} (Complimenti! Sei nella top {((ranking.position / rankings.length) * 100).toFixed(2)}% degli utenti!)
          </li>
        ))}
      </ol> */}

// Component for the rankings page
