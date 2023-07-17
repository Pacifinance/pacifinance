import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import { ThemeContext } from "../contexts/ThemeContext";
import { UserContext, UserProvider } from '../contexts/UserContext';
import ModalsCustomStyled from '../contexts/ModalsCustomStyled';
import { Button, ButtonGroup, Select, MenuItem } from "@mui/material";
import { Calendar } from 'react-calendar';
import { set } from "mongoose";
// import NumberFormatBase from 'react-number-format'; //crea errori di compilazione
import { Title } from "@material-ui/icons";
import axios from 'axios';

const InsertValue = () => {
  const { theme } = useContext(ThemeContext);
  const { userData, UserProvider } = useContext(UserContext);
  const { mode } = theme;
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
  const [incomeDate, setIncomeDate] = useState(null);
  const [expenseDate, setExpenseDate] = useState(null);
  const [balanceDate, setBalanceDate] = useState(null);

  const { TitleDashboard, MyButton } = ModalsCustomStyled();
  
  

  useEffect(() => {
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
  
  fetchData();
  }, [userData]);

  const ModifiedTitleDashboard = styled(TitleDashboard)`
    font-size: 2rem;
    font-weight: bold;
    text-align: left; 
    margin-top: 70px; 
    margin-left: 6vw;
  `;

  const MySecondaryButton = styled(MyButton)`
    font-size: 1.2rem;
  `;

  const TitleLastAdds = styled.h2`
    font-size: 1.5rem;
    font-weight: bold;
    color: ${theme.textColor};
    margin-top: 20px;
    margin-bottom: 20px;
    margin-left: 6vw;
  `;

  const TitleSection = styled.h2`
    font-size: 1.5rem;
    font-weight: bold;
    color: ${theme.textColor};
    margin-top: 40px;
    margin-bottom: 20px;
    margin-left: 6vw;
  `;

  const StyledSection = styled.div`
    font-family: Roboto, sans-serif; 
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    background-color: ${theme.backgroundColor};
    .grid{ 
      margin-top: 2rem;
      z-index: 2;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 1rem;
  
  }`;

  const StyledInputs = styled.div`
    display: flex;
    justify-content: space-evenly;
    width: 100%;
    height: 100%;
    margin-top: 40px;
    margin-bottom: 20px;
    margin-left: 6vw;
    color: ${theme.textColor};

    label {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-weight: bold;
      font-size: 1.2rem;
      margin-right: 20px;
      margin-left: 20px;
    }

    input {
      margin-top: 10px;
      font-size: 1.2rem;
      padding: 5px;
    }

    button {
      margin-top: 10px;
      font-size: 1.2rem;
      padding: 5px;
    }
  `;

  const StyledTable = styled.table`
    border-collapse: collapse;
    width: 50%;
    background-color: ${theme.backgroundColor};
    color: ${theme.textColor};
    margin-bottom: 20px;
    margin-left: 6vw;

    td, th {
      border: 1px solid black;
      padding: 5px;
      text-align: center;
      background-color: ${theme.backgroundColor};
    }

    th {
      background-color: ${theme.backgroundColor};
    }
  `;

  const StyledAddSection = styled.div`
    display: flex;
    justify-content: space-evenly;
    width: 100%;
    margin-bottom: 20px;
    margin-top: 40px;
    margin-left: 6vw;
    color: ${theme.textColor};

    label {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-weight: bold;
      font-size: 1.2rem;
      margin-right: 20px;
    }

    input {
      margin-top: 10px;
      font-size: 1.2rem;
      padding: 5px;
    }

    button {
      margin-top: 10px;
      font-size: 1.2rem;
      padding: 5px;
    }
  `;

  const StyledLastAdds = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    color: ${theme.textColor};
    margin-bottom: 20px;
    margin-left: 6vw;
    width: 100%;

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      width: 100%;
    }

    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      margin-bottom: 10px;
    }

    button {
      font-size: 1.2rem;
      padding: 5px;
      background-color: ${theme.backgroundColor};
    }
  `;

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
    setTypoExpense(event.target.value);
  };

  const handleChangeBalance = async () => {
    const balancesJson = { 
      balance : {
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
    if (balancesChange.data.success) {
      UserProvider();
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
        date : incomeDate, // variable date TO SET
        amount : income,
        is_expense : false,
        payment_type : 0,
        category_tag : categoryIncome,

      }
    }

    const incomeAdd = await axios.post('/expenses/add', incomeJson);
    if (incomeAdd.data.success) {
      UserProvider();
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
        date : expenseDate, // variable date TO SET
        amount : expense,
        is_expense : true,
        payment_type : Number(typoExpense),
        category_tag : categoryExpense,

      }
    }

    const expenseAdd = await axios.post('/expenses/add', expenseJson);
    if (expenseAdd.data.success) {
      UserProvider();
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
            <Calendar
              onSelectDate={(date) => {
                setBalanceDate({
                  year: date.getFullYear(),
                  month: date.getMonth(),
                });
              }}
              value={balanceDate}
              disableDaySelection
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
            <div>
            <Calendar
              onSelectDate={(date) => {
                setIncomeDate({
                  year: date.getFullYear(),
                  month: date.getMonth(),
                });
              }}
              value={incomeDate}
              disableDaySelection
            />
              <h1>Income for {incomeDate.toLocaleDateString()}</h1>
            </div>
            <label>
              Valore
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
              />
            </label>
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
              <Calendar
                onSelectDate={(date) => {
                  setExpenseDate({
                    year: date.getFullYear(),
                    month: date.getMonth(),
                  });
                }}
                value={expenseDate}
                disableDaySelection
              />
            </label>
            <label>
              Spesa
              <input
                type="number"
                value={expense}
                onChange={(e) => setExpense(e.target.value)}
              />
            </label>
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
          <MyButton
            onClick={() => handlePageChange("bilancio")}
            style={{
              backgroundColor:
                activePage === "bilancio" ? "" : "transparent",
              marginLeft: "6vw",
            }}
          >
            Aggiorna Bilancio
          </MyButton>
          <MyButton
            onClick={() => handlePageChange("income")}
            style={{
              backgroundColor:
                activePage === "income" ? "" : "transparent",
            }}
          >
            Aggiungi Entrate
          </MyButton>
          <MyButton
            onClick={() => handlePageChange("expenses")}
            style={{
              backgroundColor:
                activePage === "expenses" ? "" : "transparent",
            }}
          >
            Aggiungi Spese
          </MyButton>
        </ButtonGroup>
        {renderPage()}
    </StyledSection>
  );
};

export default InsertValue;
