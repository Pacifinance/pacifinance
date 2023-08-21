import React, { useState, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { StyledSelectContainer, StyledLabel, StyledSelect, StyledRankingsSection, StyledRankingPage, CenteredRankings, RankingsTitle } from '../contexts/MyStyled';

// Componente per il selettore di mese e anno
function MonthYearSelector({ selectedMonth, selectedYear, onMonthChange, onYearChange }) {
  const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  const years = [2022, 2023, 2024, 2025]; // Modifica gli anni disponibili se necessario

  const handleMonthChange = (event) => {
    const month = parseInt(event.target.value);
    onMonthChange(month);
  };

  const handleYearChange = (event) => {
    const year = parseInt(event.target.value);
    onYearChange(year);
  };

  return (
      <StyledSelectContainer>
        <StyledLabel>Mese:</StyledLabel>
        <StyledSelect value={selectedMonth} onChange={handleMonthChange}>
          {months.map((month, index) => (
            <option key={index} value={index + 1}>{month}</option>
          ))}
        </StyledSelect>
  
        <StyledLabel>Anno:</StyledLabel>
        <StyledSelect value={selectedYear} onChange={handleYearChange}>
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </StyledSelect>
      </StyledSelectContainer>
    );
  }

// Componente per la sezione delle classifiche
function RankingsSection({ title, rankings }) {
  return (
    <StyledRankingsSection>
      <h2>{title}</h2>
      <ol>
        {rankings.map((ranking, index) => (
          <li key={ranking.userId}>
            Posizione: {ranking.position} (Complimenti! Sei nella top {((ranking.position / rankings.length) * 100).toFixed(2)}% degli utenti!)
          </li>
        ))}
      </ol>
    </StyledRankingsSection>
  );
}

// Componente per la pagina delle classifiche
function RankingComponent() {
  const { userData, handleSetIsUpdated } = useContext(UserContext);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedYear, setSelectedYear] = useState(2023);
  const [generalRankings, setGeneralRankings] = useState([]);
  const [similarUsersRankings, setSimilarUsersRankings] = useState([]);
  const [incomeRankings, setIncomeRankings] = useState([]);
  const [expenseRankings, setExpenseRankings] = useState([]);
  const [incomeSimilarUsersRankings, setIncomeSimilarUsersRankings] = useState([]);
  const [expenseSimilarUsersRankings, setExpenseSimilarUsersRankings] = useState([]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  return (
    <StyledRankingPage>
      <MonthYearSelector
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={handleMonthChange}
        onYearChange={handleYearChange}
      />
      <RankingsTitle >Classifiche generali : </RankingsTitle>
      <CenteredRankings>
        <RankingsSection title="Classifica Patrimonio" rankings={generalRankings} />
        <RankingsSection title="Classifica Guadagni" rankings={incomeRankings} />
        <RankingsSection title="Classifica Spese" rankings={expenseRankings} />
      </CenteredRankings>
      <RankingsTitle  >Classifiche utenti simili : </RankingsTitle >
      <CenteredRankings>
        <RankingsSection title="Classifica Patrimonio" rankings={similarUsersRankings} />
        <RankingsSection title="Classifica Guadagni" rankings={incomeSimilarUsersRankings} />
        <RankingsSection title="Classifica Spese" rankings={expenseSimilarUsersRankings} />

      </CenteredRankings>
    </StyledRankingPage>
  );
}
export default RankingComponent;
