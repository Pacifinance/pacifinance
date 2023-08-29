import React, { useEffect, useState, useContext } from "react";
import { UserContext, UserProvider } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { ButtonGroup, Select, MenuItem } from "@mui/material";
// import Carousel from "react-multi-carousel";
// import "react-multi-carousel/lib/styles.css";
import { Title } from "@material-ui/icons";
import axios from 'axios';
import {
  MyButton,
  MySectionButton,
  MySecondaryButton,
  StyledSection,
  StyledAddSection,
  StyledTable,
  StyledInputs,
  StyledCalendar,
  TitleLastAdds,
  TitleSection,
  ModifiedTitleDashboard,
} from '../contexts/MyStyled';

// const handleInputIncomeChange = (setTableDataIncomes, tableDataIncomes, index, e) => {
//   const { name, value } = e.target;
//   const data = [...tableDataIncomes];
//   data[index][name] = value;
//   setTableDataIncomes(data);
// };

// const handleInputExpenseChange = (setTableDataExpenses, tableDataExpenses, index, e) => {
//   const { name, value } = e.target;
//   const data = [...tableDataExpenses];
//   data[index][name] = value;
//   setTableDataExpenses(data);
// };

const handleChangeBalance = async (fetchData, handleSetIsUpdated, balanceDate, bankReal, cashReal, digitalServicesReal, stocksReal, etfReal, bitcoinReal, cryptoReal) => {
  const balancesJson = { 
    balance : {
      date : balanceDate,
      bank : bankReal,
      cash : cashReal,
      digital_services : digitalServicesReal,
      stocks : {
        real : stocksReal
      },
      etf : {
        real : etfReal
      },
      bitcoin : {
        real : bitcoinReal
      },
      crypto : {
        real : cryptoReal
      },

    }
  }

  const balancesChange = await axios.post('/balances/add', balancesJson);
  if (balancesChange.status === 200) {
    console.log("Bilancio aggiornato aggiorno lo user context");
    handleSetIsUpdated(false); // Forza il re-render di UserProvider
    alert("Bilancio aggiornato correttamente");
    fetchData();
  }
  else {
    alert("Errore nell'aggiornamento del bilancio");
  }
};

const handleAddIncome = async (fetchData, setLastIncomesAdds, setIncome, setIncomeDate, setCategoryIncome, lastIncomesAdds, handleSetIsUpdated, categoryIncome, income, incomeDate) => {
  console.log("IncomeDate: ", incomeDate);
  const newIncomeAdd = {
    categoryTag: categoryIncome,
    amount: income,
    date: incomeDate,
  };
  if (Array.isArray(lastIncomesAdds)) {
    setLastIncomesAdds([...lastIncomesAdds, newIncomeAdd]);
  } else {
    setLastIncomesAdds([newIncomeAdd]); // Se tableDataIncomes non è valido, crea un nuovo array con newIncomeAdd
  }  //.slice(0, 10));
  
  //To send data we have to use category_tag, payment_type, amount, date as name of the variables
  const incomeJson = { 
    expense : {
      date : incomeDate, 
      amount : income,
      is_expense : false,
      payment_type : 0,
      category_tag : categoryIncome,

    }
  }

  setIncome(0);
  setCategoryIncome("");
  setIncomeDate(new Date());

  const incomeAdd = await axios.post('/expenses/add', incomeJson);
  console.log("Risposta incomeAdd: ", incomeAdd);
  
  if (incomeAdd.status === 200) {
    console.log("Entrate aggiornate aggiorno lo user context");
    handleSetIsUpdated(false); // Forza il re-render di UserProvider
    console.log("Sono quaaaaa3");
    alert("Entrata inserita correttamente");
    fetchData();
    console.log("Sono quaaaaa4");
  }
  else {
    alert("Errore nell'inserimento dell'entrata");
  }

 
};

const handleAddExpenses = async (fetchData, setLastExpensesAdds, setExpense, setCategoryExpense, setTypoExpense, setExpenseDate, lastExpensesAdds, handleSetIsUpdated, typoExpense,  categoryExpense, expense, expenseDate) => {
  const newExpenseAdd = {
    categoryTag: categoryExpense,
    paymentType: typoExpense,
    amount: expense,
    date: expenseDate,
  };
  if (Array.isArray(lastExpensesAdds)) {
    setLastExpensesAdds([...lastExpensesAdds, newExpenseAdd]); //.slice(0, 20));
  } else {
    setLastExpensesAdds([newExpenseAdd]); // Se tableDataIncomes non è valido, crea un nuovo array con newIncomeAdd
  }
  
  //To send data we have to use category_tag, payment_type, amount, date as name of the variables 
  const expenseJson = { 
    expense : {
      date : expenseDate,
      amount : expense,
      is_expense : true,
      payment_type : Number(typoExpense),
      category_tag : categoryExpense,

    }
  }

  setExpense(0);
  setCategoryExpense("");
  setTypoExpense("");
  setExpenseDate(new Date());

  const expenseAdd = await axios.post('/expenses/add', expenseJson);
  if (expenseAdd.status === 200) {
    console.log("Spese aggiornate, aggiorno lo user context");
    handleSetIsUpdated(false); // Forza il re-render di UserProvider
    console.log("Sono quaaaaa");
    alert("Spesa inserita correttamente");
    fetchData();
    console.log("Sono quaaaaa2");
  }
  else {
    alert("Errore nell'inserimento della spesa");
  }
};

// this functions must be used and upgrated as the x button when we'll have the paath to database to delete an income and/or an expense
const handleIncomesDelete = (setLastIncomesAdds, lastIncomesAdds, index) => {
  const newIncomeAdds = [...lastIncomesAdds];
  newIncomeAdds.splice(index, 1);
  setLastIncomesAdds(newIncomeAdds);
};

const handleExpensesDelete = (setLastExpensesAdds, lastExpensesAdds, index) => {
  const newExpenseAdds = [...lastExpensesAdds];
  newExpenseAdds.splice(index, 1);
  setLastExpensesAdds(newExpenseAdds);
};




export default function InsertValue () {
  const { theme } = useContext(ThemeContext);
  const { userData, handleSetIsUpdated } = useContext(UserContext);
  const [visibleItems, setVisibleItems] = useState(3); // Numero di elementi visibili nel carousel
  const [showScrollbar, setShowScrollbar] = useState(false); // Mostra o nascondi la barra di scorrimento laterale
  const [isLoading, setIsLoading] = useState(true);
  const [stocksReal, setStocksReal] = useState(0);
  const [etfReal, setETFReal] = useState(0);
  const [bankReal, setBankReal] = useState(0);
  const [cashReal, setCashReal] = useState(0);
  const [cryptoReal, setCryptoReal] = useState(0);
  const [bitcoinReal, setBitcoinReal] = useState(0);
  const [digitalServicesReal, setDigitalServicesReal] = useState(0);
  const [totalReal, setTotalReal] = useState(0);
  const [incomesMonth, setIncomesMonth] = useState(0);
  const [expensesMonth, setExpensesMonth] = useState(0);
  const [savedMonth, setSavedMonth] = useState(0);
  const [categoryIncome, setCategoryIncome] = useState("");
  const [categoryExpense, setCategoryExpense] = useState("");
  const [typoExpense, setTypoExpense] = useState("");
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [lastIncomesAdds, setLastIncomesAdds] = useState([]);
  const [lastExpensesAdds, setLastExpensesAdds] = useState([]);
  const [tableDataIncomes, setTableDataIncomes] = useState([]);
  const [tableDataExpenses, setTableDataExpenses] = useState([]);
  const [dateTime, setDateTime] = useState(new Date());
  const [incomeDate, setIncomeDate] = useState(new Date());
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [balanceDate, setBalanceDate] = useState(new Date());
  const [activePage, setActivePage] = useState("bilancio");
  //TO set the calendar date format without the day of the week
  const formatShortWeekday = (locale, date) => "";
  
  
  const fetchData = async () => {
    
      if (userData) {
        try {
            console.log(userData);
            console.log(userData.balances);
            console.log(userData.expenses);
            
            // Set the state with the data from the database
            setStocksReal(userData ? userData.stocksReal : 0);
            setETFReal(userData ? userData.etfReal : 0);
            setBitcoinReal(userData ? userData.bitcoinReal : 0);
            setCryptoReal(userData ? userData.cryptoReal : 0);
            setBankReal(userData? userData.bankReal : 0);
            setCashReal(userData ? userData.cashReal : 0);
            setDigitalServicesReal(userData ? userData.digitalServicesReal : 0);
            setTotalReal(userData ? userData.totalReal : 0);
            setExpensesMonth(userData ? userData.expensesMonth : 0);
            setIncomesMonth(userData ? userData.incomesMonth : 0);
            setSavedMonth(userData ? userData.savedMonth : 0);

            setLastExpensesAdds(userData ? userData.lastExpenses : []); // da modificare
            setLastIncomesAdds(userData ? userData.lastIncomes : []); // da modificare

            //set datas
            const now = new Date();
            setDateTime(now);
            setIncomeDate(now);
            setExpenseDate(now);

            //print datas
            console.log("Data e ora: ", dateTime);
            console.log("Data entrata: ", incomeDate);
            console.log("Data spesa: ", expenseDate);
            
            setIsLoading(false); // Imposta isLoading su false quando le operazioni sono state completate
        } catch (error) {
          console.error('Errore durante le operazioni:', error);
        }
      }
  };

  useEffect(() => {
    fetchData();
  }, [userData]);

  function renderIncomeItems(lastIncomesAdds) {
    return lastIncomesAdds.map((add, index) => {
      const incomeDate = new Date(add.date);
      const formattedDate = `${incomeDate.getDate()}/${incomeDate.getMonth() + 1}/${incomeDate.getFullYear()}`;
  
      return (
        <tr key={index}>
          <td>{add.categoryTag}</td>
          <td>{add.amount}€</td>
          <td>{formattedDate}</td>
        </tr>
      );
    });
  }
  
  
  
  
  function renderExpenseItems(lastExpensesAdds) {
    return lastExpensesAdds.map((add, index) => {
      const expenseDate = new Date(add.date);
      const formattedDate = `${expenseDate.getDate()}/${expenseDate.getMonth() + 1}/${expenseDate.getFullYear()}`;
      return (
        <tr key={index}>
          <td>{add.categoryTag}</td>
          <td>{add.paymentType}</td>
          <td>{add.amount}€</td>
          <td>{formattedDate}</td>
        </tr>
      );
    });
  }

  


  const renderPage = () => {
    if (activePage === "bilancio") {
      return (
        
        <>
          <TitleSection theme={theme}>Bilancio</TitleSection>
          <StyledInputs theme={theme}>
            <label>
              Depositati in Banca
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="number"
                  value={bankReal}
                  onChange={(e) => setBankReal(e.target.value)}
                  onBlur={(e) => {
                    const cleanedValue = parseInt(e.target.value, 10); // Convert to integer to remove leading zeros
                    setBankReal(cleanedValue);
                  }}
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    color: "#333",
                    outline: "none",
                    width: "120px",
                  }}
                />
                <span
                  style={{
                    marginLeft: "4px",
                  }}
                >
                  €
                </span>
              </div>
  
            </label>
            <label>
              Contanti e monete
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="number"
                  value={cashReal}
                  onChange={(e) => setCashReal(e.target.value)}
                  onBlur={(e) => {
                    const cleanedValue = parseInt(e.target.value, 10); // Convert to integer to remove leading zeros
                    setCashReal(cleanedValue);
                  }}
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    color: "#333",
                    outline: "none",
                    width: "120px",
                  }}
                />
                <span
                  style={{
                    marginLeft: "4px",
                  }}
                >
                  €
                </span>
              </div>
            </label>
  
            <label>
              Su servizi di pagam. digitali
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="number"
                  value={digitalServicesReal}
                  onChange={(e) => setDigitalServicesReal(e.target.value)}
                  onBlur={(e) => {
                    const cleanedValue = parseInt(e.target.value, 10); // Convert to integer to remove leading zeros
                    setDigitalServicesReal(cleanedValue);
                  }}
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    color: "#333",
                    outline: "none",
                    width: "120px",
                  }}
                />
                <span
                  style={{
                    marginLeft: "4px",
                  }}
                >
                  €
                </span>
              </div>
            </label>
            
          </StyledInputs>
  
          <StyledInputs theme={theme}>
  
            <label>
              Azioni
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="number"
                  value={stocksReal}
                  onChange={(e) => setStocksReal(e.target.value)}
                  onBlur={(e) => {
                    const cleanedValue = parseInt(e.target.value, 10); // Convert to integer to remove leading zeros
                    setStocksReal(cleanedValue);
                  }}
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    color: "#333",
                    outline: "none",
                    width: "120px",
                  }}
                />
                <span
                  style={{
                    marginLeft: "4px",
                  }}
                >
                  €
                </span>
              </div>          
            </label>
  
            <label>
              ETF
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="number"
                  value={etfReal}
                  onChange={(e) => setETFReal(e.target.value)}
                  onBlur={(e) => {
                    const cleanedValue = parseInt(e.target.value, 10); // Convert to integer to remove leading zeros
                    setETFReal(cleanedValue);
                  }}
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    color: "#333",
                    outline: "none",
                    width: "120px",
                  }}
                />
                <span
                  style={{
                    marginLeft: "4px",
                  }}
                >
                  €
                </span>
              </div>
            </label>
  
            <label>
              Bitcoin
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="number"
                  value={bitcoinReal}
                  onChange={(e) => setBitcoinReal(e.target.value)}
                  onBlur={(e) => {
                    const cleanedValue = parseInt(e.target.value, 10); // Convert to integer to remove leading zeros
                    setBitcoinReal(cleanedValue);
                  }}
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    color: "#333",
                    outline: "none",
                    width: "120px",
                  }}
                />
                <span
                  style={{
                    marginLeft: "4px",
                  }}
                >
                  €
                </span>
              </div>
  
            </label>
            <label>
              Criptovalute
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="number"
                  value={cryptoReal}
                  onChange={(e) => setCryptoReal(e.target.value)}
                  onBlur={(e) => {
                    const cleanedValue = parseInt(e.target.value, 10); // Convert to integer to remove leading zeros
                    setCryptoReal(cleanedValue);
                  }}
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    color: "#333",
                    outline: "none",
                    width: "120px",
                  }}
                />
                <span
                  style={{
                    marginLeft: "4px",
                  }}
                >
                  €
                </span>
              </div>
            </label>
            
          </StyledInputs>
          <StyledInputs theme={theme}>
          <StyledCalendar
              theme={theme}
              value={balanceDate}
              onChange={(date) =>setBalanceDate(date)}
              calendarType="gregory"
              formatShortWeekday={formatShortWeekday}
            />
          </StyledInputs>
          <StyledInputs theme={theme}>
            <MySecondaryButton theme={theme} onClick={() =>handleChangeBalance(fetchData, handleSetIsUpdated, balanceDate, bankReal, cashReal, digitalServicesReal, stocksReal, etfReal, bitcoinReal, cryptoReal)} >Aggiorna il tuo patrimonio</MySecondaryButton>
          </StyledInputs>
        </>
      );
    } else if (activePage === "income") {
      return (
        <>
          <StyledAddSection theme={theme}>
            <label>
              Categoria
              <Select value={categoryIncome} onChange={(event) =>setCategoryIncome(event.target.value)} style={{ backgroundColor: 'white' }} displayEmpty
                  renderValue={(value) => {
                    if (value === "") {
                      return "Seleziona una categoria";
                    }
                    return value;
                  }}
              >
                <MenuItem id= "Stipendio" value="Stipendio">Stipendio</MenuItem>
                <MenuItem id= "Lavoro-indipendente" value="Lavoro indipendente">Entrata da lavoro indipendente</MenuItem>
                <MenuItem id= "Entrata-extra" value="Entrata extra">Entrata extra</MenuItem>
                <MenuItem id= "Regalo" value="Regalo">Regalo</MenuItem>
                <MenuItem id= "Pensione" value="Pensione">Pensione</MenuItem>
              </Select>
            </label>
            <label>
              Valore
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  onBlur={(e) => {
                    const cleanedValue = parseInt(e.target.value, 10); // Convert to integer to remove leading zeros
                    setIncome(cleanedValue);
                  }}
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    color: "#333",
                    outline: "none",
                    width: "120px",
                  }}
                />
                <span
                  style={{
                    marginLeft: "4px",
                  }}
                >
                  €
                </span>
              </div>
            </label>
            <div>
              {incomeDate && <h3>Entrata del {incomeDate.toLocaleDateString()}</h3>}
              <StyledCalendar
                theme={theme}
                onChange={(date) =>setIncomeDate(date)}
                value={incomeDate}
                calendarType="gregory"
                formatShortWeekday={formatShortWeekday}
              />
            </div>
          
          </StyledAddSection>
            
            
          <StyledAddSection theme={theme}> 
            <MySecondaryButton theme={theme} onClick={() =>handleAddIncome(fetchData, setLastIncomesAdds, setIncome, setIncomeDate, setCategoryIncome, lastIncomesAdds, handleSetIsUpdated, categoryIncome, income, incomeDate)}>Aggiungi entrata</MySecondaryButton>
          </StyledAddSection>
          <TitleLastAdds theme={theme}>Ultime 10 entrate del mese corrente</TitleLastAdds>
          <StyledTable theme={theme}>
          
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Valore</th>
                <th>Data Entrata</th>
              </tr>
            </thead>
            <tbody>
              {renderIncomeItems(lastIncomesAdds)}
            </tbody>
          </StyledTable>
        </>
      );
    } else if (activePage === "expenses") {
      return (
        <>
          <StyledAddSection theme={theme}>
            <label>
              Categoria
              <Select value={categoryExpense} onChange={(event) =>setCategoryExpense(event.target.value)} style={{ backgroundColor: 'white' }} displayEmpty
                      renderValue={(value) => {
                        if (value === "") {
                          return "Seleziona una categoria";
                        }
                        return value;
                      }}
                  >
                    <MenuItem id="Digital services" value="Servizio digitale">Servizio digitale</MenuItem>
                    <MenuItem id="Gift" value="Regalo">Regalo</MenuItem>
                    <MenuItem id="Shopping" value="Shopping">Shopping</MenuItem>
                    <MenuItem id="Food" value="Cibo">Cibo</MenuItem>
                    <MenuItem id="House" value="Casa">Casa</MenuItem>
                    <MenuItem id="Social" value="Divertimento">Divertimento</MenuItem>
                    <MenuItem id="Travelling" value="Viaggio">Viaggio</MenuItem>
                    <MenuItem id="Investments" value="Investimento">Investimento</MenuItem>
                    <MenuItem id="Health" value="Salute e benessere">Salute e benessere</MenuItem>
                    <MenuItem id="Taxes" value="Tassa">Tassa</MenuItem>
                    <MenuItem id="Vehicle" value="Veicolo">Veicolo</MenuItem>
                    <MenuItem id="Transports" value="Trasporto">Trasporto</MenuItem>
                    <MenuItem id="Other" value="Altro">Altro</MenuItem>
              </Select>
            </label>
            <label>
              Tipologia pagamento
              <Select value={typoExpense} onChange={(event) =>setTypoExpense(event.target.value)} style={{ backgroundColor: 'white' }} displayEmpty
                      renderValue={(value) => {
                        if (value === "") {
                          return "Seleziona una tipologia";
                        }
                        return value;
                      }}
                  >
                  <MenuItem id= "0" value="Pagamento univoco">Pagamento univoco</MenuItem>
                  <MenuItem id= "1" value="Abbonamento">Abbonamento</MenuItem>
                  <MenuItem id= "2" value="Rata">Rata</MenuItem>
              </Select>
              
            </label>
            <label>
              Spesa
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="number"
                  value={expense}
                  onChange={(e) => setExpense(e.target.value)}
                  onBlur={(e) => {
                    const cleanedValue = parseInt(e.target.value, 10); // Convert to integer to remove leading zeros
                    setExpense(cleanedValue);
                  }}
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    color: "#333",
                    outline: "none",
                    width: "120px",
                  }}
                />
                <span
                  style={{
                    marginLeft: "4px",
                  }}
                >
                  €
                </span>
              </div>
            </label>
            <div>
              <StyledCalendar
                theme={theme}
                onChange={(date) =>setExpenseDate(date)}
                value={expenseDate}
                calendarType="gregory"
                formatShortWeekday={formatShortWeekday}
              />
            </div>
          </StyledAddSection>
          <StyledAddSection theme={theme}>
            <MySecondaryButton theme={theme} onClick={() => handleAddExpenses(fetchData, setLastExpensesAdds, setExpense, setCategoryExpense, setTypoExpense, setExpenseDate, lastExpensesAdds, handleSetIsUpdated, typoExpense,  categoryExpense, expense, expenseDate)}>Aggiungi spesa</MySecondaryButton>
          </StyledAddSection>
          <TitleLastAdds theme={theme}>Ultime 20 spese del mese corrente</TitleLastAdds>
          <StyledTable theme={theme}>
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Tipologia</th>
                <th>Valore</th>
                <th>Data Spesa</th>
              </tr>
            </thead>
            <tbody>
              {renderExpenseItems(lastExpensesAdds)}
            </tbody>
          </StyledTable>
        </>
      );
    }
  };

  return (
    <StyledSection theme={theme}>
        <ModifiedTitleDashboard theme={theme}>Inserimento Dati</ModifiedTitleDashboard>
        <ButtonGroup aria-label="outlined primary button group">
          <MySectionButton theme={theme}
            onClick={() => setActivePage("bilancio")}
            style={{
              backgroundColor:
                activePage === "bilancio" ? "" : "#222831",
              marginLeft: "6vw",
            }}
          >
            Aggiorna Bilancio
          </MySectionButton>
          <MySectionButton theme={theme}
            onClick={() => setActivePage("income")}
            style={{
              backgroundColor:
                activePage === "income" ? "" : "#222831",
            }}
          >
            Aggiungi Entrate
          </MySectionButton>
          <MySectionButton theme={theme}
            onClick={() => setActivePage("expenses")}
            style={{
              backgroundColor:
                activePage === "expenses" ? "" : "#222831",
            }}
          >
            Aggiungi Spese
          </MySectionButton>
        </ButtonGroup>
        {renderPage()}
    </StyledSection>
  );
};