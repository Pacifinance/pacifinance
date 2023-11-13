import React, { useState, useEffect } from 'react';
import { TitleDashboard, Section } from '../contexts/MyStyled';
import { StyledSelectContainer,StyledMonth, StyledLabel, StyledRankingsSection, StyledRankingPage, CenteredRankings, RankingsTitle } from '../contexts/MyStyled';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';

// Component for the rankings section
function RankingsSection({ title, rankings, isHidden }) {
    // Verify if there is a title for expenses
    const isExpenseTitle = title.toLowerCase().includes("uscite");
  
    // Verify if there are rankings > 50 (top 50%)
    const isRankingsAbove50 = rankings > 50;
    const isRankingBelow20 = rankings < 20;
  
    // Calculate the text to display
    let textToDisplay = "";
    if (!isNaN(parseFloat(rankings))) {
      //Se è tra gli ultimi 50% degli utenti (ovvero se è come rankings sopra a 50) (vuol dire che spende meno)
      if (isHidden) {
        textToDisplay = '****';
      } else {
        if (isExpenseTitle) {

          if (isRankingsAbove50) {
            textToDisplay = `Complimenti! Sei nella top ${Math.min(rankings, 99)}%. Sei tra gli utenti che spendono di meno!`;
          } else if (isRankingBelow20) {
            textToDisplay = `Sei nella top ${Math.min(rankings, 99)}%. Attenzione! Sei tra gli utenti che spendono di più!`;
          } else {
            textToDisplay = `Sei nella top ${Math.min(rankings, 99)}%. Sei nella media degli utenti!`;
          }

        } else {

          if (!isRankingsAbove50) {
            textToDisplay = `Complimenti! Sei nella top ${Math.min(rankings, 99)}% degli utenti!`;
          } else if (isRankingBelow20) {
            textToDisplay = ` Incredibile!! Sei nella top ${Math.min(rankings, 99)}%. Sei tra gli utenti che guadagnano di più!`;
          } else {
            textToDisplay = `Sei nella top ${Math.min(rankings, 99)}% degli utenti!`;
          }
          
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
          <p> Mancanza di dati </p>
        )}
      </StyledRankingsSection>
    );
  }

function Leaderboard({ theme, userData, handleSetIsUpdated, isHidden}) {
    const [selectedMonth, setSelectedMonth] = useState(1);
    const [selectedYear, setSelectedYear] = useState(2023);
    const [balanceRank, setBalanceRank] = useState([]);
    const [incomeRank, setIncomeRank] = useState([]);
    const [expenseRank, setExpenseRank] = useState([]);
    const [balanceSimilarUsersRank, setBalanceSimilarUsersRank] = useState([]);
    const [incomesSimilarUsersRank, setIncomeSimilarUsersRank] = useState([]);
    const [expensesSimilarUsersRank, setExpenseSimilarUsersRank] = useState([]);

    const fetchData = async () => {
        if (userData) {
          try {
              
              setBalanceRank(userData ? userData.percentageRankOnBalance : []);
              setIncomeRank(userData ? userData.percentageRankOnIncomes : []);
              setExpenseRank(userData ? userData.percentageRankOnExpenses : []);
              setBalanceSimilarUsersRank(userData ? userData.percentageRankOnBalanceSimilar : []);
              setIncomeSimilarUsersRank(userData ? userData.percentageRankOnIncomesSimilar : []);
              setExpenseSimilarUsersRank(userData ? userData.percentageRankOnExpensesSimilar : []);
  
          } catch (error) {
            console.error('Errore durante le operazioni:', error);
          }
        }
    };

    useEffect(() => {
        fetchData();
      }, [userData]);
    
      const formattedPreMonthDate = userData?.preMonthDate
          ? new Date(userData.preMonthDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' })
          : "";
    

    return (
        <Section theme={theme}>
            <div className="grid"> 
                    <TitleDashboard theme={theme}>Classifiche nel tempo</TitleDashboard>
                    {/* <RankingComponent /> */}
                    <StyledRankingPage>
                        {/* <MonthYearSelector
                            selectedMonth={selectedMonth}
                            selectedYear={selectedYear}
                            onMonthChange={handleMonthChange}
                            onYearChange={handleYearChange}
                        /> */}
                        <StyledLabel>Classifiche relative al mese: <StyledMonth>{formattedPreMonthDate}</StyledMonth></StyledLabel>
                        <RankingsTitle >Classifiche generali : </RankingsTitle>
                        <CenteredRankings>
                            <RankingsSection title="Classifica Patrimonio" rankings={balanceRank} isHidden={isHidden} />
                            <RankingsSection title="Classifica Entrate" rankings={incomeRank} isHidden={isHidden} />
                            <RankingsSection title="Classifica Uscite" rankings={expenseRank} isHidden={isHidden} />
                        </CenteredRankings>
                        <RankingsTitle  >Classifiche utenti simili : </RankingsTitle >
                        <CenteredRankings>
                            <RankingsSection title="Classifica Patrimonio" rankings={balanceSimilarUsersRank} isHidden={isHidden} />
                            <RankingsSection title="Classifica Entrate" rankings={incomesSimilarUsersRank} isHidden={isHidden} />
                            <RankingsSection title="Classifica Uscite" rankings={expensesSimilarUsersRank} isHidden={isHidden} />
                        </CenteredRankings>
                    </StyledRankingPage>
            </div>
        </Section>
    )
}
  
export default Leaderboard;



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




// const handleMonthChange = (month) => {
  //   setSelectedMonth(month);
  // };

  // const handleYearChange = (year) => {
  //   setSelectedYear(year);
  // };





  {/* <ol>
        {rankings.map((ranking, index) => (
          <li key={ranking.userId}>
            Posizione: {ranking.position} (Complimenti! Sei nella top {((ranking.position / rankings.length) * 100).toFixed(2)}% degli utenti!)
          </li>
        ))}
      </ol> */}

// Component for the rankings page