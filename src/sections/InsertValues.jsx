import React, { useEffect, useState, useContext } from "react";
import { UserContext, UserProvider } from '../contexts/UserContext';
import { Button, ButtonGroup, Select, MenuItem } from "@mui/material";
import { Calendar } from 'react-calendar';
import { set } from "mongoose";
// import NumberFormatBase from 'react-number-format'; //crea errori di compilazione
import { Title } from "@material-ui/icons";
import axios from 'axios';
// import {
//   MyButton,
//   MySecondaryButton,
//   StyledSection,
//   StyledAddSection,
//   StyledTable,
//   StyledLastAdds,
//   StyledInputs,
//   TitleLastAdds,
//   TitleSection,
//   ModifiedTitleDashboard,
// } from '../contexts/MyStyled';
import MyStyled from '../contexts/MyStyled';

const InsertValue = () => {
  const { userData, handleSetIsUpdated } = useContext(UserContext);
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
  const [categoryIncome, setCategoryIncome] = useState(0);
  const [categoryExpense, setCategoryExpense] = useState(0);
  const [typoExpense, setTypoExpense] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [lastIncomesAdds, setLastIncomesAdds] = useState([]);
  const [lastExpensesAdds, setLastExpensesAdds] = useState([]);
  const [tableDataIncomes, setTableDataIncomes] = useState([]);
  const [tableDataExpenses, setTableDataExpenses] = useState([]);
  const [dateTime, setDateTime] = useState(null);
  const [incomeDate, setIncomeDate] = useState(new Date());
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [balanceDate, setBalanceDate] = useState(new Date());
  //TO set the calendar date format without the day of the week
  const formatShortWeekday = (locale, date) => "";

  const {
    MyButton,
    MySectionButton,
    MySecondaryButton,
    StyledSection,
    StyledAddSection,
    StyledTable,
    StyledLastAdds,
    StyledInputs,
    StyledCalendar,
    TitleLastAdds,
    TitleSection,
    ModifiedTitleDashboard,
  } = MyStyled();
  
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

            //set datas
            const now = new Date();
            setDateTime(now);
            setIncomeDate(now);
            setExpenseDate(now);
            
            setIsLoading(false); // Imposta isLoading su false quando le operazioni sono state completate
        } catch (error) {
          console.error('Errore durante le operazioni:', error);
        }
      }
  };

  useEffect(() => {
    fetchData();
  }, [userData]);

  const handleInputIncomeChange = (index, e) => {
    const { name, value } = e.target;
    const data = [...tableDataIncomes];
    data[index][name] = value;
    setTableDataIncomes(data);
  };

  const handleInputExpenseChange = (index, e) => {
    const { name, value } = e.target;
    const data = [...tableDataExpenses];
    data[index][name] = value;
    setTableDataExpenses(data);
  };

  const handleCategoryIncomeChange = (event) => {
    setCategoryIncome(event.target.value);
  };

  const handleCategoryExpensesChange = (event) => {
    setCategoryExpense(event.target.value);
  };

  const handleTypoExpensesChange = (event) => {
    setTypoExpense(event.target.id);
  };

  const handleChangeBalance = async () => {
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

  const handleAddIncome = async () => {
    const newIncomeAdd = {
      categoryIncome,
      value: income,
    };
    setLastIncomesAdds([...tableDataIncomes, newIncomeAdd]);  //.slice(0, 10));
    setIncome(0);
    setCategoryIncome(0);

    const incomeJson = { 
      expense : {
        date : incomeDate, 
        amount : income,
        is_expense : false,
        payment_type : 0,
        category_tag : categoryIncome,

      }
    }

    const incomeAdd = await axios.post('/expenses/add', incomeJson);
    
    if (incomeAdd.data.success) {
      console.log("Entrate aggiornate aggiorno lo user context");
      handleSetIsUpdated(false); // Forza il re-render di UserProvider
      alert("Bilancio aggiornato correttamente");
      fetchData();
    }
    else {
      alert("Errore nell'aggiornamento del bilancio");
    }

   
  };

  const handleAddExpenses = async () => {
    const newExpenseAdd = {
      categoryExpense,
      value: expense,
    };
    setLastExpensesAdds([...tableDataExpenses, newExpenseAdd]); //.slice(0, 20));
    setExpense(0);
    setCategoryExpense(0);

    const expenseJson = { 
      expense : {
        date : expenseDate,
        amount : expense,
        is_expense : true,
        payment_type : Number(typoExpense),
        category_tag : categoryExpense,

      }
    }

    const expenseAdd = await axios.post('/expenses/add', expenseJson);
    if (expenseAdd.data.success) {
      console.log("Spese aggiornate, aggiorno lo user context");
      handleSetIsUpdated(false); // Forza il re-render di UserProvider
      alert("Bilancio aggiornato correttamente");
      fetchData();
    }
    else {
      alert("Errore nell'aggiornamento del bilancio");
    }
  };
  
  const handleIncomesDelete = (index) => {
    const newIncomeAdds = [...lastIncomesAdds];
    newIncomeAdds.splice(index, 1);
    setLastIncomesAdds(newIncomeAdds);
  };

  const handleExpensesDelete = (index) => {
    const newExpenseAdds = [...lastExpensesAdds];
    newExpenseAdds.splice(index, 1);
    setLastExpensesAdds(newExpenseAdds);
  };

  const [activePage, setActivePage] = useState("bilancio");

  const handlePageChange = (page) => {
    setActivePage(page);
  };

  const handleBalanceDate = (date) => {
    setBalanceDate(date);
    // const selectedYear = date.getFullYear();
    // const selectedMonth = date.getMonth();
    // const selectedDay = date.getDate();
  };

  const handleIncomeDate = (date) => {
    setIncomeDate(date);
    // const selectedYear = date.getFullYear();
    // const selectedMonth = date.getMonth();
    // const selectedDay = date.getDate();
  };

  const handleExpenseDate = (date) => {
    setExpenseDate(date);
    // const selectedYear = date.getFullYear();
    // const selectedMonth = date.getMonth();
    // const selectedDay = date.getDate();
  };



  const renderPage = () => {
    if (activePage === "bilancio") {
      return (
        
        <>
          <TitleSection>Bilancio</TitleSection>
          <StyledInputs>
            <label>
              Depositati in Banca
              <input
                type="number"
                value={bankReal}
                onChange={(e) => setBankReal(e.target.value)}
                style={{
                  textAlign: "center",
                }}
              />

            </label>
            <label>
              Contanti e monete
              <input
                type="number"
                value={cashReal}
                onChange={(e) => setCashReal(e.target.value)}
                style={{
                  textAlign: "center",
                }}
              />
            </label>

            <label>
              Su servizi di pagam. digitali
              <input
                type="number"
                value={digitalServicesReal}
                onChange={(e) => setDigitalServicesReal(e.target.value)}
                style={{
                  textAlign: "center",
                }}
              />
            </label>
            
          </StyledInputs>

          <StyledInputs>

            <label>
              Azioni
              <input
                type="number"
                value={stocksReal}
                onChange={(e) => setStocksReal(e.target.value)}
                style={{
                  textAlign: "center",
                }}
              />             
            </label>

            <label>
              ETF
              <input
                type="number"
                value={etfReal}
                onChange={(e) => setETFReal(e.target.value)}
                style={{
                  textAlign: "center",
                }}
              />
            </label>

            <label>
              Bitcoin
              <input
                type="number"
                value={bitcoinReal}
                onChange={(e) => setBitcoinReal(e.target.value)}
                style={{
                  textAlign: "center",
                }}
              />

            </label>
            <label>
              Criptovalute
              <input
                type="number"
                value={cryptoReal}
                onChange={(e) => setCryptoReal(e.target.value)}
                style={{
                  textAlign: "center",
                }}
              />
            </label>
            
          </StyledInputs>
          <StyledInputs>
          <StyledCalendar
              onChange={handleBalanceDate}
              value={balanceDate}
              calendarType="US"
              formatShortWeekday={formatShortWeekday}
            />
          </StyledInputs>
          <StyledInputs>
            <MySecondaryButton onClick={handleChangeBalance}>Aggiorna il tuo patrimonio</MySecondaryButton>
          </StyledInputs>
        </>
      );
    } else if (activePage === "income") {
      return (
        <>
          <StyledAddSection>
            <label>
              Categoria
              <Select value={categoryIncome} onChange={handleCategoryIncomeChange} style={{ backgroundColor: 'white' }} displayEmpty
                  renderValue={(value) => {
                    if (value === 0) {
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
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
              />
            </label>
            <div>
              <h3>Entrata del {incomeDate.toLocaleDateString()}</h3>
              <StyledCalendar
                onChange={handleIncomeDate}
                value={incomeDate}
                calendarType="US"
                formatShortWeekday={formatShortWeekday}
              />
            </div>
          
          </StyledAddSection>
            
            
          <StyledAddSection> 
            <MySecondaryButton onClick={handleAddIncome}>Aggiungi entrata</MySecondaryButton>
          </StyledAddSection>
          <TitleLastAdds>Ultime 10 entrate del mese</TitleLastAdds>
          <StyledTable>
          
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Valore</th>
              </tr>
            </thead>
            <tbody>
              {tableDataIncomes.map((data, index) => (
                <tr key={index}>
                  <td>{data.categoryIncome}</td>
                  <td>
                    <input
                      type="number"
                      name="value"
                      value={data.value}
                      onChange={(e) => handleInputIncomeChange(index, e)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
          <StyledLastAdds>
            <ul>
              {lastIncomesAdds.map((add, index) => (
                <li key={index}>
                  <div>
                    {add.categoryIncome} - {add.income}€
                  </div>
                  <button onClick={() => handleIncomesDelete(index)}>X</button>
                </li>
              ))}
            </ul>
          </StyledLastAdds>
        </>
      );
    } else if (activePage === "expenses") {
      return (
        <>
          <StyledAddSection>
            <label>
              Categoria
              <Select value={categoryExpense} onChange={handleCategoryExpensesChange} style={{ backgroundColor: 'white' }} displayEmpty
                      renderValue={(value) => {
                        if (value === 0) {
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
              {/* <input
                type="number"
                value={expense}
                onChange={(e) => setExpense(e.target.value)}
              /> */}
            </label>
            <label>
              Tipologia pagamento
              <Select value={typoExpense} onChange={handleTypoExpensesChange} style={{ backgroundColor: 'white' }} displayEmpty
                      renderValue={(value) => {
                        if (value === 0) {
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
              <input
                type="number"
                value={expense}
                onChange={(e) => setExpense(e.target.value)}
              />
            </label>
            <div>
              <StyledCalendar
                onChange={handleIncomeDate}
                value={expenseDate}
                calendarType="US"
                formatShortWeekday={formatShortWeekday}
              />
            </div>
          </StyledAddSection>
          <StyledAddSection>
            <MyButton onClick={handleAddExpenses}>Aggiungi spesa</MyButton>
          </StyledAddSection>
          <TitleLastAdds>Ultime 20 spese del mese</TitleLastAdds>
          <StyledTable>
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Valore</th>
              </tr>
            </thead>
            <tbody>
              {tableDataExpenses.map((data, index) => (
                <tr key={index}>
                  <td>{data.categoryExpense}</td>
                  <td>
                    <input
                      type="number"
                      name="value"
                      value={data.value}
                      onChange={(e) => handleInputExpenseChange(index, e)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
          <StyledLastAdds>
            <ul>
              {lastExpensesAdds.map((add, index) => (
                <li key={index}>
                  <div>
                    {add.categoryExpense} - {add.expense}€
                  </div>
                  <button onClick={() => handleExpensesDelete(index)}>X</button>
                </li>
              ))}
            </ul>
          </StyledLastAdds>
        </>
      );
    }
  };

  return (
    <StyledSection>
        <ModifiedTitleDashboard>Inserimento Dati</ModifiedTitleDashboard>
        <ButtonGroup variant="contained" aria-label="outlined primary button group">
          <MySectionButton
            onClick={() => handlePageChange("bilancio")}
            style={{
              backgroundColor:
                activePage === "bilancio" ? "" : "#222831",
              marginLeft: "6vw",
            }}
          >
            Aggiorna Bilancio
          </MySectionButton>
          <MySectionButton
            onClick={() => handlePageChange("income")}
            style={{
              backgroundColor:
                activePage === "income" ? "" : "#222831",
            }}
          >
            Aggiungi Entrate
          </MySectionButton>
          <MySectionButton
            onClick={() => handlePageChange("expenses")}
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

export default InsertValue;
