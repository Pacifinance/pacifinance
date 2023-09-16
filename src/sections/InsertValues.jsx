import React, { useEffect, useState, useContext } from "react";
import { UserContext, UserProvider } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { ButtonGroup, Select, MenuItem } from "@mui/material";
// import Carousel from "react-multi-carousel";
// import "react-multi-carousel/lib/styles.css";
import axios from 'axios';
import {
  ModalButton,
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
  MuiCustomDialog,
  MuiCustomButton,
  MuiCustomDialogTitle,
  MuiCustomDialogContent,
  MuiCustomDialogContentText,
} from '../contexts/MyStyled';
import { set } from "mongoose";


const handleChangeBalance = async (setIsConfirmBalanceOpen) => {
  setIsConfirmBalanceOpen(true);
};

const handleConfirmBalance = async (fetchData, handleSetIsUpdated, balanceDate, bankReal, cashReal, digitalServicesReal, stocksReal, etfReal, bitcoinReal, cryptoReal) => {
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

const handleAddIncome = async (setIsConfirmIncomeOpen, categoryIncome, income) => {

  // Check if the user has entered a non-empty value and selected a category
  if (categoryIncome.value === "") {
    alert("Seleziona una categoria.");
    return; // Exit the function without further execution
  } else if ((Number(income) === 0 || income === "" || income === undefined)) {
    alert("Inserisci un valore valido e maggiore di 0.");
    return;
  }

  setIsConfirmIncomeOpen(true);
};


const handleConfirmIncome = async (fetchData, setIsConfirmIncomeOpen, setIncome, setIncomeDate, setCategoryIncome, handleSetIsUpdated, categoryIncome, income, incomeDate) => {
  setIsConfirmIncomeOpen(false);
    //To send data we have to use category_tag, payment_type, amount, date as name of the variables
    const incomeJson = { 
      expense : {
        date : incomeDate, 
        amount : income,
        is_expense : false,
        payment_type : 0,
        category_tag : categoryIncome.key,  //incomesTags.index
      }
    }

    setIncome(0);
    setCategoryIncome({ key: "", value: "" });
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


const handleAddExpenses = async (setIsConfirmExpenseOpen, typoExpense,  categoryExpense, expense) => {

  // Verifica se income è uguale a 0 e/o categoryIncome è vuoto
  if (categoryExpense.value === "") {
    alert("Seleziona una categoria.");
    return; 
  } else if (typoExpense.value === "") {
    alert("Seleziona una tipologia di pagamento.");
    return; 
  } else if ((Number(expense) === 0 || expense === "" || expense === undefined)) { 
    alert("Inserisci un valore valido e maggiore di 0.");
    return;
  }

  setIsConfirmExpenseOpen(true);
};

const handleConfirmExpense = async (fetchData, setIsConfirmExpenseOpen, setExpense, setExpenseDate, setCategoryExpense, setTypoExpense, handleSetIsUpdated, typoExpense,  categoryExpense, expense, expenseDate) => {
  setIsConfirmExpenseOpen(false);

  //To send data we have to use category_tag, payment_type, amount, date as name of the variables 
  const expenseJson = { 
    expense : {
      date : expenseDate,
      amount : expense,
      is_expense : true,
      payment_type : typoExpense.key, //paymentTags.index
      category_tag : categoryExpense.key,  //now, after the rework i have to send the id of the category expensesTag.index

    }
  }

  setExpense(0);
  setCategoryExpense({key: "", value: ""});
  setTypoExpense({key: "", value: ""});
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

const handleExitConfirm = async (setModalState) => {
  setModalState(false);
  alert("Annullato correttamente inserimento dei dati")
};

// const handleExitIncome = async (setIsConfirmIncomeOpen) => {
//   setIsConfirmIncomeOpen(false);
//   alert("Annullato correttamente inserimento dei dati")
// };

// const handleExitExpense = async (setIsConfirmExpenseOpen) => {
//   setIsConfirmExpenseOpen(false);
//   alert("Annullato correttamente inserimento dei dati")
// };




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
  const [isConfirmBalanceOpen, setIsConfirmBalanceOpen] = useState(false);
  const [isConfirmIncomeOpen, setIsConfirmIncomeOpen] = useState(false);
  const [isConfirmExpenseOpen, setIsConfirmExpenseOpen] = useState(false);
  // const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
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
  const [categoryIncome, setCategoryIncome] = useState({ key: "", value: "" });
  const [categoryExpense, setCategoryExpense] = useState({ key: "", value: "" });
  const [typoExpense, setTypoExpense] = useState({ key: "", value: "" });
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
  const [expensesTags, setExpensesTags] = useState([]);
  const [incomesTags, setIncomesTags] = useState([]);
  const [paymentTags, setPaymentTags] = useState([]);
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

            setExpensesTags(userData ? userData.expensesTags : []);
            setIncomesTags(userData ? userData.incomesTags : []);
            setPaymentTags(userData ? userData.paymentTags : []);

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
          <td>{add.categoryTag.translations.it}</td>
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
          <td>{add.categoryTag.translations.it}</td>
          <td>{add.paymentType.translations.it}</td>
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
                  type="text"
                  value={bankReal}
                  onChange={(e) => {
                    const cleanedValue = e.target.value
                      .replace(/,/g, '.') // Substitute commas with dots
                      .replace(/[^\d.]/g, '') // Remove all non-numeric characters except dots
                      .replace(/^0+(\d)/, '$1'); // Remove leading zeros
                    setBankReal(cleanedValue);
                  }}
                  onBlur={(e) => {
                    const cleanedValue = e.target.value
                      .replace(/,/g, '.')
                      .replace(/[^\d.]/g, '')
                      .replace(/^0+(\d)/, '$1'); // Remove leading zeros
                    //i wanna cut the number to 2 decimal numbers with numeric function
                    const cleanedFinalValue = Number(cleanedValue).toFixed(2);
                    if (!isNaN(cleanedFinalValue)) setBankReal(cleanedFinalValue);
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
                  type="text"
                  value={cashReal}
                  onChange={(e) => {
                    const cleanedValue = e.target.value
                      .replace(/,/g, '.') // Substitute commas with dots
                      .replace(/[^\d.]/g, '') // Remove all non-numeric characters except dots
                      .replace(/^0+(\d)/, '$1'); // Remove leading zeros
                    setCashReal(cleanedValue);
                  }}
                  onBlur={(e) => {
                    const cleanedValue = e.target.value
                      .replace(/,/g, '.')
                      .replace(/[^\d.]/g, '')
                      .replace(/^0+(\d)/, '$1'); // Remove leading zeros
                    //i wanna cut the number to 2 decimal numbers with numeric function
                    const cleanedFinalValue = Number(cleanedValue).toFixed(2);
                    if (!isNaN(cleanedFinalValue)) setCashReal(cleanedFinalValue);
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
                  type="text"
                  value={digitalServicesReal}
                  onChange={(e) => {
                    const cleanedValue = e.target.value
                      .replace(/,/g, '.') // Substitute commas with dots
                      .replace(/[^\d.]/g, '') // Remove all non-numeric characters except dots
                      .replace(/^0+(\d)/, '$1'); // Remove leading zeros
                    setDigitalServicesReal(cleanedValue);
                  }}
                  onBlur={(e) => {
                    const cleanedValue = e.target.value
                      .replace(/,/g, '.')
                      .replace(/[^\d.]/g, '')
                      .replace(/^0+(\d)/, '$1'); // Remove leading zeros
                    //i wanna cut the number to 2 decimal numbers with numeric function
                    const cleanedFinalValue = Number(cleanedValue).toFixed(2);
                    if (!isNaN(cleanedFinalValue)) setDigitalServicesReal(cleanedFinalValue);
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
                  type="text"
                  value={stocksReal}
                  onChange={(e) => {
                    const cleanedValue = e.target.value
                      .replace(/,/g, '.') // Substitute commas with dots
                      .replace(/[^\d.]/g, '') // Remove all non-numeric characters except dots
                      .replace(/^0+(\d)/, '$1'); // Remove leading zeros
                    setStocksReal(cleanedValue);
                  }}
                  onBlur={(e) => {
                    const cleanedValue = e.target.value
                      .replace(/,/g, '.')
                      .replace(/[^\d.]/g, '')
                      .replace(/^0+(\d)/, '$1'); // Remove leading zeros
                    //i wanna cut the number to 2 decimal numbers with numeric function
                    const cleanedFinalValue = Number(cleanedValue).toFixed(2);
                    if (!isNaN(cleanedFinalValue)) setStocksReal(cleanedFinalValue);
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
                  type="text"
                  value={etfReal}
                  onChange={(e) => {
                    const cleanedValue = e.target.value
                      .replace(/,/g, '.') // Substitute commas with dots
                      .replace(/[^\d.]/g, '') // Remove all non-numeric characters except dots
                      .replace(/^0+(\d)/, '$1'); // Remove leading zeros
                    setETFReal(cleanedValue);
                  }}
                  onBlur={(e) => {
                    const cleanedValue = e.target.value
                      .replace(/,/g, '.')
                      .replace(/[^\d.]/g, '')
                      .replace(/^0+(\d)/, '$1'); // Remove leading zeros
                    //i wanna cut the number to 2 decimal numbers with numeric function
                    const cleanedFinalValue = Number(cleanedValue).toFixed(2);
                    if (!isNaN(cleanedFinalValue)) setETFReal(cleanedFinalValue);
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
                  type="text"
                  value={bitcoinReal}
                  onChange={(e) => {
                    const cleanedValue = e.target.value
                      .replace(/,/g, '.') // Substitute commas with dots
                      .replace(/[^\d.]/g, '') // Remove all non-numeric characters except dots
                      .replace(/^0+(\d)/, '$1'); // Remove leading zeros
                    setBitcoinReal(cleanedValue);
                  }}
                  onBlur={(e) => {
                    const cleanedValue = e.target.value
                      .replace(/,/g, '.')
                      .replace(/[^\d.]/g, '')
                      .replace(/^0+(\d)/, '$1'); // Remove leading zeros
                    //i wanna cut the number to 2 decimal numbers with numeric function
                    const cleanedFinalValue = Number(cleanedValue).toFixed(2);
                    if (!isNaN(cleanedFinalValue)) setBitcoinReal(cleanedFinalValue);
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
                  type="text"
                  value={cryptoReal}
                  onChange={(e) => {
                    const cleanedValue = e.target.value
                      .replace(/,/g, '.') // Substitute commas with dots
                      .replace(/[^\d.]/g, '') // Remove all non-numeric characters except dots
                      .replace(/^0+(\d)/, '$1'); // Remove leading zeros
                    setCryptoReal(cleanedValue);
                  }}
                  onBlur={(e) => {
                    const cleanedValue = e.target.value
                      .replace(/,/g, '.')
                      .replace(/[^\d.]/g, '')
                      .replace(/^0+(\d)/, '$1'); // Remove leading zeros
                    //i wanna cut the number to 2 decimal numbers with numeric function
                    const cleanedFinalValue = Number(cleanedValue).toFixed(2);
                    if (!isNaN(cleanedFinalValue)) setCryptoReal(cleanedFinalValue);
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
            <MySecondaryButton theme={theme} onClick={() =>handleChangeBalance(setIsConfirmBalanceOpen)} >Aggiorna il tuo patrimonio</MySecondaryButton>
          </StyledInputs>
        </>
      );
    } else if (activePage === "income") {
      console.log("Tag entrate pre .map: ", incomesTags);
      return (
        <>
          <StyledAddSection theme={theme}>
            <label>
              Categoria
              <Select value={categoryIncome.value} 
                onChange={(event) => {
                      const selectedKey = event.target.value;
                      const selectedItem = incomesTags.find((item) => item.index === selectedKey);

                      if (selectedItem) {
                        const selectedValue = selectedItem.translations.it;
                        setCategoryIncome({ key: selectedKey, value: selectedValue });
                      }
                    }} 
                style={{ backgroundColor: 'white' }} displayEmpty

                renderValue={(value) => {
                  if (value === "") {
                    return "Seleziona una categoria";
                  }
                  return value;
                }}
              >
                <MenuItem value="">
                  <em>Seleziona una categoria</em>
                </MenuItem>
                {incomesTags.map((item) => (
                  <MenuItem key={item.index} value={item.index}>
                    {item.translations.it} 
                  </MenuItem>
                ))}
              </Select>
            </label>
            <label>
              Valore
              <div style={{ display: "flex", alignItems: "center" }}>
              <input
                  type="text"
                  value={income}
                  onChange={(e) => {
                    const cleanedValue = e.target.value
                      .replace(/,/g, '.') // Substitute commas with dots
                      .replace(/[^\d.]/g, '') // Remove all non-numeric characters except dots
                      .replace(/^0+(\d)/, '$1'); // Remove leading zeros
                    setIncome(cleanedValue);
                  }}
                  onBlur={(e) => {
                    const cleanedValue = e.target.value
                      .replace(/,/g, '.')
                      .replace(/[^\d.]/g, '')
                      .replace(/^0+(\d)/, '$1'); // Remove leading zeros
                    //i wanna cut the number to 2 decimal numbers with numeric function
                    const cleanedFinalValue = Number(cleanedValue).toFixed(2);
                    if (!isNaN(cleanedFinalValue)) setIncome(cleanedFinalValue);
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
            <MySecondaryButton theme={theme} onClick={() =>handleAddIncome(setIsConfirmIncomeOpen, categoryIncome, income)}>Aggiungi entrata</MySecondaryButton>
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
              <Select value={categoryExpense.value} 
                  onChange={(event) => {
                      const selectedKey = event.target.value;
                      const selectedItem = expensesTags.find((item) => item.index === selectedKey);

                      if (selectedItem) {
                        const selectedValue = selectedItem.translations.it;
                        setCategoryExpense({ key: selectedKey, value: selectedValue });
                      }
                    }}  
                  
                  style={{ backgroundColor: 'white' }} displayEmpty

                  renderValue={(value) => {
                    if (value === "") {
                      return "Seleziona una categoria";
                    }
                    return value;
                  }}
                  >

                  <MenuItem value="">
                    <em>Seleziona una categoria</em>
                  </MenuItem>
                  {expensesTags.map((item) => (
                    <MenuItem key={item.index} value={item.index}>
                      {item.translations.it} 
                    </MenuItem>
                  ))}
              </Select>
            </label>
            <label>
              Tipologia pagamento
              <Select value={typoExpense.value} 
                  onChange={(event) => {
                      const selectedKey = event.target.value;
                      const selectedItem = paymentTags.find((item) => item.index === selectedKey);

                      if (selectedItem) {
                        const selectedValue = selectedItem.translations.it;
                        setTypoExpense({ key: selectedKey, value: selectedValue });
                      }
                    }}  
                  
                  style={{ backgroundColor: 'white' }} displayEmpty

                  renderValue={(value) => {
                    if (value === "") {
                      return "Seleziona una tipologia";
                    }
                    return value;
                  }}
                  >
                  <MenuItem value="">
                    <em>Seleziona una tipologia</em>
                  </MenuItem>
                  {paymentTags.map((item) => (
                    // check if the item is not none because we don't want to show it
                    item.label !== "none" && (
                      <MenuItem key={item.index} value={item.index}>
                        {item.translations.it}
                      </MenuItem>
                    )
                  ))}
              </Select>
              
            </label>
            <label>
              Spesa
              <div style={{ display: "flex", alignItems: "center" }}>
              <input
                  type="text"
                  value={expense}
                  onChange={(e) => {
                    const cleanedValue = e.target.value
                      .replace(/,/g, '.') // Substitute commas with dots
                      .replace(/[^\d.]/g, '') // Remove all non-numeric characters except dots
                      .replace(/^0+(\d)/, '$1'); // Remove leading zeros
                    setExpense(cleanedValue);
                  }}
                  onBlur={(e) => {
                    const cleanedValue = e.target.value
                      .replace(/,/g, '.')
                      .replace(/[^\d.]/g, '')
                      .replace(/^0+(\d)/, '$1'); // Remove leading zeros
                    //i wanna cut the number to 2 decimal numbers with numeric function
                    const cleanedFinalValue = Number(cleanedValue).toFixed(2);
                    if (!isNaN(cleanedFinalValue)) setExpense(cleanedFinalValue);
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
            <MySecondaryButton theme={theme} onClick={() => handleAddExpenses(setIsConfirmExpenseOpen, typoExpense,  categoryExpense, expense)}>Aggiungi spesa</MySecondaryButton>
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
        {isConfirmBalanceOpen && (
          <MuiCustomDialog
            open={isConfirmBalanceOpen}
            onClose={handleExitConfirm}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <MuiCustomDialogTitle>Conferma aggiornamento bilancio</MuiCustomDialogTitle>
            <MuiCustomDialogContent>
              <MuiCustomDialogContentText>Depositati in Banca: {bankReal}€</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>Contanti e monete: {cashReal}€</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>Su servizi di pagam. digitali: {digitalServicesReal}€</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>Azioni: {stocksReal}€</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>ETF: {etfReal}€</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>Bitcoin: {bitcoinReal}€</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>Criptovalute: {cryptoReal}€</MuiCustomDialogContentText>
              {/* <MuiCustomDialogContentText>Data: {balanceDate}</MuiCustomDialogContentText> */}{/* TO FIX */}  
            </MuiCustomDialogContent>
              <MuiCustomButton onClick={() => handleConfirmBalance(fetchData, handleSetIsUpdated, balanceDate, bankReal, cashReal, digitalServicesReal, stocksReal, etfReal, bitcoinReal, cryptoReal)}>Conferma</MuiCustomButton>
              <MuiCustomButton onClick={() => handleExitConfirm(setIsConfirmBalanceOpen)}>Annulla</MuiCustomButton>
          </MuiCustomDialog>
        )}
        {isConfirmIncomeOpen && ( 
          <MuiCustomDialog
            open={isConfirmIncomeOpen}
            onClose={handleExitConfirm}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <MuiCustomDialogTitle>Conferma inserimento entrata</MuiCustomDialogTitle>
            <MuiCustomDialogContent>
              <MuiCustomDialogContentText>Categoria: {categoryIncome.value}</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>Valore: {income}€</MuiCustomDialogContentText>
              {/* <MuiCustomDialogContentText>Data: {incomeDate}</MuiCustomDialogContentText> */}{/* TO FIX */}  
            </MuiCustomDialogContent>
            {/* <div style={{ display: "flex", justifyContent: "space-between" }}> */}
              <MuiCustomButton onClick={() => handleConfirmIncome(fetchData, setIsConfirmIncomeOpen, setIncome, setIncomeDate, setCategoryIncome, handleSetIsUpdated, categoryIncome, income, incomeDate)}>Conferma</MuiCustomButton>
            {/* </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}> */}
              <MuiCustomButton onClick={() => handleExitConfirm(setIsConfirmIncomeOpen)}>Annulla</MuiCustomButton>
            {/* </div> */}
          </MuiCustomDialog>
        )}
        {isConfirmExpenseOpen && ( 
          <MuiCustomDialog
            open={isConfirmExpenseOpen}
            onClose={handleExitConfirm}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <MuiCustomDialogTitle>Conferma inserimento spesa</MuiCustomDialogTitle>
            <MuiCustomDialogContent>
              <MuiCustomDialogContentText>Categoria: {categoryExpense.value}</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>Tipologia pagamento: {typoExpense.value}</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>Valore: {expense}€</MuiCustomDialogContentText>
              {/* <MuiCustomDialogContentText>Data: {expenseDate}</MuiCustomDialogContentText> */}{/* TO FIX */}  
            </MuiCustomDialogContent>
            {/* <div style={{ display: "flex", justifyContent: "space-between"}}> */}
              <MuiCustomButton onClick={() => handleConfirmExpense(fetchData, setIsConfirmExpenseOpen, setExpense, setExpenseDate, setCategoryExpense, setTypoExpense, handleSetIsUpdated, typoExpense,  categoryExpense, expense, expenseDate)}>Conferma</MuiCustomButton>
            {/* </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}> */}
              <MuiCustomButton onClick={() => handleExitConfirm(setIsConfirmExpenseOpen)}>Annulla</MuiCustomButton>
            {/* </div> */}
          </MuiCustomDialog>
        )}
    </StyledSection>
    
  );
};