import React, { useState } from 'react';

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
    <div>
      <label>Mese:</label>
      <select value={selectedMonth} onChange={handleMonthChange}>
        {months.map((month, index) => (
          <option key={index} value={index + 1}>{month}</option>
        ))}
      </select>

      <label>Anno:</label>
      <select value={selectedYear} onChange={handleYearChange}>
        {years.map((year) => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
    </div>
  );
}

// Componente per la sezione delle classifiche
function RankingsSection({ title, rankings }) {
  return (
    <div>
      <h2>{title}</h2>
      <ol>
        {rankings.map((ranking, index) => (
          <li key={ranking.userId}>
            {ranking.username}: {ranking.position}°
          </li>
        ))}
      </ol>
    </div>
  );
}

// Componente per la pagina delle classifiche
function RankingComponent() {
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedYear, setSelectedYear] = useState(2023); // Imposta l'anno corrente o un valore predefinito

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  // Simulazione dei dati delle classifiche
  const generalRankings = [
    { userId: 1, username: 'Utente1', position: 1 },
    { userId: 2, username: 'Utente2', position: 2 },
    { userId: 3, username: 'Utente3', position: 3 },
    // ...
  ];

  const similarUsersRankings = [
    { userId: 4, username: 'Utente4', position: 1 },
    { userId: 5, username: 'Utente5', position: 2 },
    { userId: 6, username: 'Utente6', position: 3 },
    // ...
  ];

  const incomeRankings = [
    { userId: 7, username: 'Utente7', position: 1 },
    { userId: 8, username: 'Utente8', position: 2 },
    { userId: 9, username: 'Utente9', position: 3 },
    // ...
  ];

  const expenseRankings = [
    { userId: 10, username: 'Utente10', position: 1 },
    { userId: 11, username: 'Utente11', position: 2 },
    { userId: 12, username: 'Utente12', position: 3 },
    // ...
  ];

  return (
    <div>
      <h1>Classifiche</h1>

      <MonthYearSelector
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={handleMonthChange}
        onYearChange={handleYearChange}
      />

      <RankingsSection title="Classifica Generale" rankings={generalRankings} />
      <RankingsSection title="Classifica Utenti Simili" rankings={similarUsersRankings} />
      <RankingsSection title="Classifica Guadagni" rankings={incomeRankings} />
      <RankingsSection title="Classifica Spese" rankings={expenseRankings} />
    </div>
  );
}

export default RankingComponent;
