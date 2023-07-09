import React, { useState, useContext } from "react";
import styled from "styled-components";
import { ThemeContext } from "../contexts/ThemeContext";
import ModalsCustomStyled from '../contexts/ModalsCustomStyled';
import { Button, ButtonGroup, Select, MenuItem } from "@mui/material";
import { set } from "mongoose";
// import NumberFormatBase from 'react-number-format'; //crea errori di compilazione
import { Title } from "@material-ui/icons";

const InsertValue = () => {
  const { theme } = useContext(ThemeContext);
  const { mode } = theme;
  const [bank, setBank] = useState(0);
  const [cash, setCash] = useState(0);
  const [digitalPayment, setDigitalPayment] = useState(0);
  const [stocks, setStocks] = useState(0);
  const [etf, setETF] = useState(0);
  const [crypto, setCrypto] = useState(0);
  const [bitcoin, setBitcoin] = useState(0);
  const [categoryIncome, setCategoryIncome] = useState(0);
  const [categoryExpense, setCategoryExpense] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [lastIncomesAdds, setLastIncomesAdds] = useState([]);
  const [lastExpensesAdds, setLastExpensesAdds] = useState([]);
  const [tableDataIncomes, setTableDataIncomes] = useState([]);
  const [tableDataExpenses, setTableDataExpenses] = useState([]);

  const { TitleDashboard, MyButton } = ModalsCustomStyled();

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

  const handleAddIncome = () => {
    const newIncomeAdd = {
      categoryIncome,
      value: income,
    };
    setLastIncomesAdds([...tableDataIncomes, newIncomeAdd]);  //.slice(0, 10));
    setIncome(0);
    setCategoryIncome(0);
   
  };

  const handleAddExpenses = () => {
    const newExpenseAdd = {
      categoryExpense,
      value: expense,
    };
    setLastExpensesAdds([...tableDataExpenses, newExpenseAdd]); //.slice(0, 20));
    setExpense(0);
    setCategoryExpense(0);
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
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                style={{
                  textAlign: "center",
                }}
              />

            </label>
            <label>
              Contanti e monete
              <input
                type="number"
                value={cash}
                onChange={(e) => setCash(e.target.value)}
                style={{
                  textAlign: "center",
                }}
              />
            </label>

            <label>
              Su servizi di pagam. digitali
              <input
                type="number"
                value={digitalPayment}
                onChange={(e) => setDigitalPayment(e.target.value)}
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
                value={stocks}
                onChange={(e) => setStocks(e.target.value)}
                style={{
                  textAlign: "center",
                }}
              />             
            </label>

            <label>
              ETF
              <input
                type="number"
                value={etf}
                onChange={(e) => setETF(e.target.value)}
                style={{
                  textAlign: "center",
                }}
              />
            </label>

            <label>
              Bitcoin
              <input
                type="number"
                value={bitcoin}
                onChange={(e) => setBitcoin(e.target.value)}
                style={{
                  textAlign: "center",
                }}
              />

            </label>
            <label>
              Criptovalute
              <input
                type="number"
                value={crypto}
                onChange={(e) => setCrypto(e.target.value)}
                style={{
                  textAlign: "center",
                }}
              />
            </label>
            <MySecondaryButton onClick={handleAddIncome}>Aggiorna il tuo patrimonio</MySecondaryButton>
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
                <MenuItem value="Stipendio">Stipendio</MenuItem>
                <MenuItem value="Lavoro-indipendente">Entrata da lavoro indipendente</MenuItem>
                <MenuItem value="Entrata-extra">Entrata extra</MenuItem>
                <MenuItem value="Regalo">Regalo</MenuItem>
                <MenuItem value="Pensione">Pensione</MenuItem>
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
              <Select value={categoryIncome} onChange={handleCategoryExpensesChange} style={{ backgroundColor: 'white' }} displayEmpty
                      renderValue={(value) => {
                        if (value === 0) {
                          return "Seleziona una categoria";
                        }
                        return value;
                      }}
                  >
                    <MenuItem value="Digital services">Servizio digitale</MenuItem>
                    <MenuItem value="Gift">Regalo</MenuItem>
                    <MenuItem value="Shopping">Shopping</MenuItem>
                    <MenuItem value="Food">Cibo</MenuItem>
                    <MenuItem value="House">Casa</MenuItem>
                    <MenuItem value="Social">Divertimento</MenuItem>
                    <MenuItem value="Travelling">Viaggio</MenuItem>
                    <MenuItem value="Investments">Investimento</MenuItem>
                    <MenuItem value="Health">Salute e benessere</MenuItem>
                    <MenuItem value="Taxes">Tassa</MenuItem>
                    <MenuItem value="Vehicle">Veicolo</MenuItem>
                    <MenuItem value="Transports">Trasporto</MenuItem>
                    <MenuItem value="Other">Altro</MenuItem>
              </Select>
              {/* <input
                type="number"
                value={expense}
                onChange={(e) => setExpense(e.target.value)}
              /> */}
            </label>
            <label>
              Tipologia pagamento
              <Select value={categoryIncome} onChange={handleCategoryExpensesChange} style={{ backgroundColor: 'white' }} displayEmpty
                      renderValue={(value) => {
                        if (value === 0) {
                          return "Seleziona una tipologia";
                        }
                        return value;
                      }}
                  >
                    <MenuItem value="Single payment">Pagamento univoco</MenuItem>
                    <MenuItem value="Subscription">Abbonamento</MenuItem>
                    <MenuItem value="Installments">Rata</MenuItem>
                    
                    
              </Select>
              {/* <input
                type="number"
                value={expense}
                onChange={(e) => setExpense(e.target.value)}
              /> */}
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
