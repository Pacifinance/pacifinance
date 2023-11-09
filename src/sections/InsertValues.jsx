import React, { useEffect, useState } from "react";
import { ButtonGroup, Select, MenuItem } from "@mui/material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import {
  MySectionButton,
  MySecondaryButton,
  StyledDateInput,
  StyledSection,
  StyledCalendarInput,
  StyledAddSection,
  StyledTable,
  StyledInputs,
  inputStyle,
  LabelStyle,
  LabelContainer,
  Column,
  TitleLastAdds,
  TitleSection,
  ModifiedTitleDashboard,
  MuiCustomDialog,
  MuiCustomButton,
  MuiCustomDialogTitle,
  MuiCustomDialogContent,
  MuiCustomDialogContentText,
  MuiCustomDialogActions,
} from '../contexts/MyStyled';
// import { set } from "mongoose";

const currentDate = new Date().toISOString().split('T')[0];

// const handleBalanceDateChange = (setBalanceDate, event) => {
//   setBalanceDate(event.target.value);
// };

// const handleIncomeDateChange = (setIncomeDate, event) => {
//   setIncomeDate(event.target.value);
// };

// const handleExpenseDateChange = (setExpenseDate, event) => {
//   setExpenseDate(event.target.value);
// };


const handleChangeBalance = async (setIsConfirmBalanceOpen) => {
  setIsConfirmBalanceOpen(true);
};


const handleInputChange = (e, setterFunction) => {
  let cleanedValue = e.target.value
      .replace(/,/g, '.') // Substitute commas with dots
      .replace(/[^\d.]/g, '') // Remove all non-numeric characters except dots

  // Remove extra dots
  const dotIndex = cleanedValue.indexOf('.');
  if (dotIndex !== -1) {
      cleanedValue = cleanedValue.substring(0, dotIndex + 1) + cleanedValue.substring(dotIndex + 1).replace(/\./g, '');
  }

  // Add leading zero if starts with a dot
  if (cleanedValue.startsWith('.')) {
      cleanedValue = '0' + cleanedValue;
  }

  cleanedValue = cleanedValue.toLocaleString('it-IT', { minimumFractionDigits: 2 }); //doesn't work 

  setterFunction(cleanedValue);
};

const handleInputBlur = (e, setterFunction) => {
  const cleanedValue = e.target.value
    .replace(/,/g, '.') // Substitute commas with dots
    .replace(/[^\d.]/g, '') // Remove all non-numeric characters except dots
    .replace(/^0+(\d)/, '$1'); // Remove leading zeros
  const cleanedFinalValue = Number(cleanedValue).toLocaleString('it-IT', { minimumFractionDigits: 2 });
  if (!isNaN(cleanedFinalValue)) setterFunction(cleanedFinalValue);
};

const handleConfirmBalance = async (fetchData, setIsConfirmBalanceOpen, setBalanceDate, setUpdateBalanceSuccess, handleSetIsUpdated, balanceDate, bankReal, cashReal, digitalServicesReal, stocksReal, etfReal, bitcoinReal, cryptoReal) => {
  setIsConfirmBalanceOpen(false);
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

  const balancesChange = await axios.post('/balances/add', balancesJson, { withCredentials: true });
  if (balancesChange.status === 200) {
    // console.log("Bilancio aggiornato aggiorno lo user context");
    handleSetIsUpdated(false); // Forza il re-render di UserProvider
    setUpdateBalanceSuccess(true);
    fetchData();
    setBalanceDate(currentDate);
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


const handleConfirmIncome = async (fetchData, setIsConfirmIncomeOpen, setIncome, setIncomeDate, setCategoryIncome, setUpdateIncomesSuccess, handleSetIsUpdated, categoryIncome, income, incomeDate) => {
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
    setIncomeDate(currentDate);

    const incomeAdd = await axios.post('/expenses/add', incomeJson, { withCredentials: true });
    
    if (incomeAdd.status === 200) {
      // console.log("Entrate aggiornate aggiorno lo user context");
      handleSetIsUpdated(false); // Forza il re-render di UserProvider
      setUpdateIncomesSuccess(true);
      fetchData();
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

const handleConfirmExpense = async (fetchData, setIsConfirmExpenseOpen, setExpense, setExpenseDate, setCategoryExpense, setTypoExpense, setUpdateExpensesSuccess, handleSetIsUpdated, typoExpense,  categoryExpense, expense, expenseDate) => {
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
  setExpenseDate(currentDate);

  const expenseAdd = await axios.post('/expenses/add', expenseJson, { withCredentials: true });
  if (expenseAdd.status === 200) {
    // console.log("Spese aggiornate, aggiorno lo user context");
    handleSetIsUpdated(false); // Forza il re-render di UserProvider
    setUpdateExpensesSuccess(true);
    fetchData();
  }
  else {
    alert("Errore nell'inserimento dell'uscita");
  }

};

const handleExitConfirm = async (setModalState) => {
  setModalState(false);
};


// this functions must be used and upgrated as the x button when we'll have the paath to database to delete an income and/or an expense
const handleIncomesDelete = async (fetchData, setDeleteIncomesSuccess, handleSetIsUpdated, dateIncome, amountIncome) => { //data, 

  const data = {
    expense : {
      date : dateIncome, //must be an object date
      amount : amountIncome,
      is_expense : false,
    }
  }
  const incomesDelete = await axios.post('/expenses/delete', data, { withCredentials: true });

  if (incomesDelete.status === 200) {
    handleSetIsUpdated(false); // Forza il re-render di UserProvider
    setDeleteIncomesSuccess(true);
    fetchData();
  }
  else {
    alert("Errore nell'eliminazione dell'entrata");
  }

};

const handleExpensesDelete = async (fetchData, setDeleteExpensesSuccess, handleSetIsUpdated, dateExpense, amountExpense) => {
  const data = {
    expense : {
      date : dateExpense, //must be an object date
      amount : amountExpense,
      is_expense : true,
    }
  }
  const incomesDelete = await axios.post('/expenses/delete', data, { withCredentials: true });

  if (incomesDelete.status === 200) {
    handleSetIsUpdated(false); // Forza il re-render di UserProvider
    setDeleteExpensesSuccess(true);
    fetchData();
  }
  else {
    alert("Errore nell'eliminazione dell'uscita");
  }
};


export default function InsertValue ({ theme, userData, handleSetIsUpdated, isHidden}) {
  const [isConfirmBalanceOpen, setIsConfirmBalanceOpen] = useState(false);
  const [isConfirmIncomeOpen, setIsConfirmIncomeOpen] = useState(false);
  const [isConfirmExpenseOpen, setIsConfirmExpenseOpen] = useState(false);
  const [updateBalanceSuccess, setUpdateBalanceSuccess] = useState(false);
  const [updateIncomesSuccess, setUpdateIncomesSuccess] = useState(false);
  const [updateExpensesSuccess, setUpdateExpensesSuccess] = useState(false);
  const [deleteIncomesSuccess, setDeleteIncomesSuccess] = useState(false);
  const [deleteExpensesSuccess, setDeleteExpensesSuccess] = useState(false);
  const [showConfirmationDeleteIncome, setShowConfirmationDeleteIncome] = useState(false);
  const [showConfirmationDeleteExpense, setShowConfirmationDeleteExpense] = useState(false);
  const [deleteIncomeDate, setDeleteIncomeDate] = useState("");
  const [deleteIncomeAmount, setDeleteIncomeAmount] = useState("");
  const [deleteExpenseDate, setDeleteExpenseDate] = useState("");
  const [deleteExpenseAmount, setDeleteExpenseAmount] = useState("");
  // const [isLoading, setIsLoading] = useState(true);
  const [stocksReal, setStocksReal] = useState(0);
  const [etfReal, setETFReal] = useState(0);
  const [bankReal, setBankReal] = useState(0);
  const [cashReal, setCashReal] = useState(0);
  const [cryptoReal, setCryptoReal] = useState(0);
  const [bitcoinReal, setBitcoinReal] = useState(0);
  const [digitalServicesReal, setDigitalServicesReal] = useState(0);
  const [categoryIncome, setCategoryIncome] = useState({ key: "", value: "" });
  const [categoryExpense, setCategoryExpense] = useState({ key: "", value: "" });
  const [typoExpense, setTypoExpense] = useState({ key: "", value: "" });
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [lastIncomesAdds, setLastIncomesAdds] = useState([]);
  const [lastExpensesAdds, setLastExpensesAdds] = useState([]);
  const [incomeDate, setIncomeDate] = useState(currentDate);
  const [expenseDate, setExpenseDate] = useState(currentDate);
  const [balanceDate, setBalanceDate] = useState(currentDate);
  const [activePage, setActivePage] = useState("bilancio");
  const [expensesTags, setExpensesTags] = useState([]);
  const [incomesTags, setIncomesTags] = useState([]);
  const [paymentTags, setPaymentTags] = useState([]);
  
  
  const fetchData = async () => {
    
      if (userData) {
        try {
            
            // Set the state with the data from the database
            setStocksReal(userData ? userData.stocksReal : 0);
            setETFReal(userData ? userData.etfReal : 0);
            setBitcoinReal(userData ? userData.bitcoinReal : 0);
            setCryptoReal(userData ? userData.cryptoReal : 0);
            setBankReal(userData? userData.bankReal : 0);
            setCashReal(userData ? userData.cashReal : 0);
            setDigitalServicesReal(userData ? userData.digitalServicesReal : 0);
            setExpensesTags(userData ? userData.expensesTags : []);
            setIncomesTags(userData ? userData.incomesTags : []);
            setPaymentTags(userData ? userData.paymentTags : []);

            setLastExpensesAdds(userData ? userData.lastExpenses : []);
            setLastIncomesAdds(userData ? userData.lastIncomes : []); 
            
            // setIsLoading(false); // Imposta isLoading su false quando le operazioni sono state completate
        } catch (error) {
          console.error('Errore durante le operazioni:', error);
        }
      }
  };

  useEffect(() => {
    fetchData();
  }, [userData]);

  const validateDate = (date) => {
    const pattern = /^\d{4}-\d{2}-\d{2}$/; // Verifica il formato AAAA-MM-GG
    return pattern.test(date);
  };

  const handleBalanceDateChange = (event) => {
    const inputDate = event.target.value;
    const isValidDate = validateDate(inputDate);
  
    if (isValidDate) {
      setBalanceDate(inputDate);
    } else {
      alert("Attenzione! Selezionare la data tramite il calendario.");
    }
  };
  
  
  const handleIncomeDateChange = (event) => {
    const inputDate = event.target.value;
    const isValidDate = validateDate(inputDate);

    if (isValidDate) {
      setIncomeDate(inputDate);
    } else {
      alert("Attenzione! Selezionare la data tramite il calendario.");
    }
  };
  
  const handleExpenseDateChange = (event) => {
    const inputDate = event.target.value;
    const isValidDate = validateDate(inputDate);
  
    if (isValidDate) {
      setExpenseDate(inputDate);
    } else {
      alert("Attenzione! Selezionare la data tramite il calendario.");
    }
  };
  

  function renderIncomeItems(lastIncomesAdds) {
    return lastIncomesAdds.map((add, index) => {
      const incomeDate = new Date(add.date);
      const formattedDate = `${incomeDate.getDate()}/${incomeDate.getMonth() + 1}/${incomeDate.getFullYear()}`;

      const handleDelete = () => {
        setDeleteIncomeAmount(add.amount);
        setDeleteIncomeDate(add.date);
        setShowConfirmationDeleteIncome(true);
      };
  
      return (
        <tr key={index}>
          <td>{isHidden ? '****' : add.categoryTag.translations.it}</td>
          <td>{isHidden ? '****' : add.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €</td>
          <td>{isHidden ? '****' : formattedDate}</td>
          <td>
            <button onClick={handleDelete}>
                <FontAwesomeIcon icon={faTimes} />
            </button>
          </td>
        </tr>
      );
    });
  }
  
  
  
  
  function renderExpenseItems(lastExpensesAdds) {
    return lastExpensesAdds.map((add, index) => {
      const expenseDate = new Date(add.date);
      const formattedDate = `${expenseDate.getDate()}/${expenseDate.getMonth() + 1}/${expenseDate.getFullYear()}`;

      const handleDelete = () => {
        setDeleteExpenseDate(add.date);
        setDeleteExpenseAmount(add.amount);
        setShowConfirmationDeleteExpense(true);
      };

      return (
        <tr key={index}>
          <td>{isHidden ? '****' : add.categoryTag.translations.it}</td>
          <td>{isHidden ? '****' : add.paymentType.translations.it}</td>
          <td>{isHidden ? '****' : add.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €</td>
          <td>{isHidden ? '****' : formattedDate}</td>
          <td>
            <button onClick={handleDelete}>
                <FontAwesomeIcon icon={faTimes} />
            </button>
          </td>
        </tr>
      );
    });
  }

  


  const renderPage = () => {
    if (activePage === 'bilancio') {
      return (
        <>
          {/*TitleSection used to create a distance TO UPGRADE */}
          <TitleSection theme={theme}> Liquidità </TitleSection>
          <StyledInputs theme={theme}>
            <Column>
              <LabelContainer theme={theme}>
                <LabelStyle theme={theme}>
                  Depositati in Banca
                </LabelStyle>
              </LabelContainer>
              <LabelContainer theme={theme}>
                <LabelStyle theme={theme}>
                  Contanti e monete
                </LabelStyle>
              </LabelContainer>
              <LabelContainer theme={theme}>
                <LabelStyle theme={theme}>
                  Su servizi di pagam. digitali
                </LabelStyle>
              </LabelContainer>
              </Column>
            <Column>
              <div>
                <input type="text" value={isHidden ? '****' : bankReal.toLocaleString('it-IT', { minimumFractionDigits: 2 })} onChange={(e) => handleInputChange(e, setBankReal)} onBlur={(e) => handleInputBlur(e, setBankReal)} style={inputStyle} />
                <span style={{marginLeft:'0.2em'}}> €</span>
              </div>
              <div>
                <input type="text" value={isHidden ? '****' : cashReal.toLocaleString('it-IT', { minimumFractionDigits: 2 })} onChange={(e) => handleInputChange(e, setCashReal)} onBlur={(e) => handleInputBlur(e, setCashReal)} style={inputStyle} />
                <span style={{marginLeft:'0.2em'}}> €</span>
              </div>
              <div>
                <input type="text" value={isHidden ? '****' : digitalServicesReal.toLocaleString('it-IT', { minimumFractionDigits: 2 })} onChange={(e) => handleInputChange(e, setDigitalServicesReal)} onBlur={(e) => handleInputBlur(e, setDigitalServicesReal)} style={inputStyle} />
                <span style={{marginLeft:'0.2em'}}> €</span>
              </div>
            </Column>
          </StyledInputs>
          <TitleSection theme={theme}> Investimenti </TitleSection>
          <StyledInputs theme={theme}>
            <Column>
              <LabelContainer theme={theme}>
                <LabelStyle theme={theme}>
                  Azioni
                </LabelStyle>
              </LabelContainer>
              <LabelContainer theme={theme}>
                <LabelStyle theme={theme}>
                  ETF
                </LabelStyle>
              </LabelContainer>
              <LabelContainer theme={theme}>
                <LabelStyle theme={theme}>
                  Bitcoin
                </LabelStyle>
              </LabelContainer>
              <LabelContainer theme={theme}>
                <LabelStyle theme={theme}>
                  Criptovalute
                </LabelStyle>
              </LabelContainer>
            </Column>
            <Column>
              <div>
                <input type="text" value={isHidden ? '****' : stocksReal.toLocaleString('it-IT', { minimumFractionDigits: 2 })} onChange={(e) => handleInputChange(e, setStocksReal)} onBlur={(e) => handleInputBlur(e, setStocksReal)} style={inputStyle} />
                <span style={{marginLeft:'0.2em'}}>€</span>
              </div>
              <div>
                <input type="text" value={isHidden ? '****' : etfReal.toLocaleString('it-IT', { minimumFractionDigits: 2 })} onChange={(e) => handleInputChange(e, setETFReal)} onBlur={(e) => handleInputBlur(e, setETFReal)} style={inputStyle} />
                <span style={{marginLeft:'0.2em'}}>€</span>
              </div>
              <div>
                <input type="text" value={isHidden ? '****' : bitcoinReal.toLocaleString('it-IT', { minimumFractionDigits: 2 })} onChange={(e) => handleInputChange(e, setBitcoinReal)} onBlur={(e) => handleInputBlur(e, setBitcoinReal)} style={inputStyle} />
                <span style={{marginLeft:'0.2em'}}>€</span>
              </div>
              <div>
                <input type="text" value={isHidden ? '****' : cryptoReal.toLocaleString('it-IT', { minimumFractionDigits: 2 })} onChange= {(e) => handleInputChange(e, setCryptoReal)} onBlur={(e) => handleInputBlur(e, setCryptoReal)} style={inputStyle} />
                <span style={{marginLeft:'0.2em'}}>€</span>
              </div>
            </Column>
          </StyledInputs>

          <StyledCalendarInput theme={theme}>
            <StyledDateInput
              type="date"
              value={balanceDate}
              onChange={handleBalanceDateChange}
              max={currentDate}
            />
          </StyledCalendarInput>
          
          
          <StyledInputs theme={theme}>
            <MySecondaryButton theme={theme} onClick={() =>handleChangeBalance(setIsConfirmBalanceOpen)} >Aggiorna il tuo bilancio</MySecondaryButton>
          </StyledInputs>
        </>
          
        
      );
    } else if (activePage === "income") {
      return (
        <>
          <StyledAddSection theme={theme}>
            <label>
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
              <div style={{ display: "flex", alignItems: "center" }}>
              <input
                  type="text"
                  value={income}
                  onChange={(e) => handleInputChange(e, setIncome)} 
                  onBlur={(e) => handleInputBlur(e, setIncome)}
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
              <StyledDateInput
                type="date"
                value={incomeDate}
                onChange={handleIncomeDateChange}
                max={currentDate}
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
              <div style={{ display: "flex", alignItems: "center" }}>
              <input
                  type="text"
                  value={expense}
                  onChange={(e) => handleInputChange(e, setExpense)} 
                  onBlur={(e) => handleInputBlur(e, setExpense)}
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
              <StyledDateInput
                type="date"
                value={expenseDate}
                onChange={handleExpenseDateChange}
                max={currentDate}
              />
            </div>
          </StyledAddSection>
          <StyledAddSection theme={theme}>
            <MySecondaryButton theme={theme} onClick={() => handleAddExpenses(setIsConfirmExpenseOpen, typoExpense,  categoryExpense, expense)}>Aggiungi uscita</MySecondaryButton>
          </StyledAddSection>
          <TitleLastAdds theme={theme}>Ultime 20 uscite del mese corrente</TitleLastAdds>
          <StyledTable theme={theme}>
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Tipologia</th>
                <th>Valore</th>
                <th>Data Uscita</th>
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
              marginRight: "1vw",
            }}
          >
            Aggiorna Bilancio
          </MySectionButton>
          <MySectionButton theme={theme}
            onClick={() => setActivePage("income")}
            style={{
              backgroundColor:
                activePage === "income" ? "" : "#222831",
              marginRight: "1vw",
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
            Aggiungi Uscite
          </MySectionButton>
        </ButtonGroup>
        {renderPage()}
        {isConfirmBalanceOpen && (
          <MuiCustomDialog
            open={isConfirmBalanceOpen}
            onClose={() => handleExitConfirm(setIsConfirmBalanceOpen)}
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
              <MuiCustomDialogContentText>Data selezionata: {balanceDate}</MuiCustomDialogContentText>{/* TO FIX */}  
            </MuiCustomDialogContent>
            <MuiCustomDialogActions>
              <MuiCustomButton onClick={() => handleConfirmBalance(fetchData, setIsConfirmBalanceOpen, setBalanceDate, setUpdateBalanceSuccess, handleSetIsUpdated, balanceDate, bankReal, cashReal, digitalServicesReal, stocksReal, etfReal, bitcoinReal, cryptoReal)}>Conferma</MuiCustomButton>
              <MuiCustomButton onClick={() => handleExitConfirm(setIsConfirmBalanceOpen)}>Annulla</MuiCustomButton>
            </MuiCustomDialogActions>
          </MuiCustomDialog>
        )}
        {isConfirmIncomeOpen && ( 
          <MuiCustomDialog
            open={isConfirmIncomeOpen}
            onClose={() => handleExitConfirm(setIsConfirmIncomeOpen)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <MuiCustomDialogTitle>Conferma inserimento entrata</MuiCustomDialogTitle>
            <MuiCustomDialogContent>
              <MuiCustomDialogContentText>Categoria: {categoryIncome.value}</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>Valore: {income}€</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>Data selezionata: {incomeDate}</MuiCustomDialogContentText>{/* TO FIX */}  
            </MuiCustomDialogContent>
            <MuiCustomDialogActions>
              <MuiCustomButton onClick={() => handleConfirmIncome(fetchData, setIsConfirmIncomeOpen, setIncome, setIncomeDate, setCategoryIncome, setUpdateIncomesSuccess, handleSetIsUpdated, categoryIncome, income, incomeDate)}>Conferma</MuiCustomButton>
              <MuiCustomButton onClick={() => handleExitConfirm(setIsConfirmIncomeOpen)}>Annulla</MuiCustomButton>
            </MuiCustomDialogActions>
          </MuiCustomDialog>
        )}
        {isConfirmExpenseOpen && ( 
          <MuiCustomDialog
            open={isConfirmExpenseOpen}
            onClose={() => handleExitConfirm(setIsConfirmExpenseOpen)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <MuiCustomDialogTitle>Conferma inserimento uscita</MuiCustomDialogTitle>
            <MuiCustomDialogContent>
              <MuiCustomDialogContentText>Categoria: {categoryExpense.value}</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>Tipologia pagamento: {typoExpense.value}</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>Valore: {expense}€</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>Data selezionata: {expenseDate}</MuiCustomDialogContentText>{/* TO FIX */}  
            </MuiCustomDialogContent>
            <MuiCustomDialogActions>
              <MuiCustomButton onClick={() => handleConfirmExpense(fetchData, setIsConfirmExpenseOpen, setExpense, setExpenseDate, setCategoryExpense, setTypoExpense, setUpdateExpensesSuccess, handleSetIsUpdated, typoExpense,  categoryExpense, expense, expenseDate)}>Conferma</MuiCustomButton>
              <MuiCustomButton onClick={() => handleExitConfirm(setIsConfirmExpenseOpen)}>Annulla</MuiCustomButton>
            </MuiCustomDialogActions>
          </MuiCustomDialog>
        )}

        {updateBalanceSuccess && (
          <MuiCustomDialog
            open={updateBalanceSuccess}
            onClose={() => handleExitConfirm(setUpdateBalanceSuccess)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <MuiCustomDialogTitle>Aggiornamento bilancio avvenuto con successo</MuiCustomDialogTitle>
            <MuiCustomDialogActions>
              <MuiCustomButton onClick={() => handleExitConfirm(setUpdateBalanceSuccess)}>Ok</MuiCustomButton>
            </MuiCustomDialogActions>
          </MuiCustomDialog>
        )}

        {updateIncomesSuccess && (
          <MuiCustomDialog
            open={updateIncomesSuccess}
            onClose={() => handleExitConfirm(setUpdateIncomesSuccess)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <MuiCustomDialogTitle>Inserimento entrata avvenuto con successo</MuiCustomDialogTitle>
            <MuiCustomDialogActions>
              <MuiCustomButton onClick={() => handleExitConfirm(setUpdateIncomesSuccess)}>Ok</MuiCustomButton>
            </MuiCustomDialogActions>
          </MuiCustomDialog>
        )}

        {updateExpensesSuccess && (
          <MuiCustomDialog
            open={updateExpensesSuccess}
            onClose={() => handleExitConfirm(setUpdateExpensesSuccess)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <MuiCustomDialogTitle>Inserimento uscita avvenuto con successo</MuiCustomDialogTitle>
            <MuiCustomDialogActions>
              <MuiCustomButton onClick={() => handleExitConfirm(setUpdateExpensesSuccess)}>Ok</MuiCustomButton>
            </MuiCustomDialogActions>
          </MuiCustomDialog>
        )}
        {deleteIncomesSuccess && (
          <MuiCustomDialog
            open={deleteIncomesSuccess}
            onClose={() => handleExitConfirm(setDeleteIncomesSuccess)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <MuiCustomDialogTitle>Eliminazione entrata avvenuta con successo</MuiCustomDialogTitle>
            <MuiCustomDialogActions>
              <MuiCustomButton onClick={() => handleExitConfirm(setDeleteIncomesSuccess)}>Ok</MuiCustomButton>
            </MuiCustomDialogActions>
          </MuiCustomDialog>
        )}
        {deleteExpensesSuccess && (
          <MuiCustomDialog
            open={deleteExpensesSuccess}
            onClose={() => handleExitConfirm(setDeleteExpensesSuccess)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <MuiCustomDialogTitle>Eliminazione uscita avvenuta con successo</MuiCustomDialogTitle>
            <MuiCustomDialogActions>
              <MuiCustomButton onClick={() => handleExitConfirm(setDeleteExpensesSuccess)}>Ok</MuiCustomButton>
            </MuiCustomDialogActions>
          </MuiCustomDialog>
        )}
        {showConfirmationDeleteIncome && (
          <MuiCustomDialog
            open={showConfirmationDeleteIncome}
            onClose={() => setShowConfirmationDeleteIncome(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <MuiCustomDialogTitle>Sei sicuro di voler eliminare questa entrata?</MuiCustomDialogTitle>
            <MuiCustomDialogActions>
              <MuiCustomButton onClick={() => {
                handleIncomesDelete(fetchData, setDeleteIncomesSuccess, handleSetIsUpdated, deleteIncomeDate, deleteIncomeAmount);
                setShowConfirmationDeleteIncome(false);
              }}>Conferma</MuiCustomButton>
              <MuiCustomButton onClick={() => setShowConfirmationDeleteIncome(false)}>Annulla</MuiCustomButton>
            </MuiCustomDialogActions>
          </MuiCustomDialog>
        )}
        {showConfirmationDeleteExpense && (
          <MuiCustomDialog
            open={showConfirmationDeleteExpense}
            onClose={() => setShowConfirmationDeleteExpense(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <MuiCustomDialogTitle>Sei sicuro di voler eliminare questa uscita?</MuiCustomDialogTitle>
            <MuiCustomDialogActions>
              <MuiCustomButton onClick={() => {
                handleExpensesDelete(fetchData, setDeleteExpensesSuccess, handleSetIsUpdated, deleteExpenseDate, deleteExpenseAmount);
                setShowConfirmationDeleteExpense(false);
              }}>Conferma</MuiCustomButton>
              <MuiCustomButton onClick={() => setShowConfirmationDeleteExpense(false)}>Annulla</MuiCustomButton>
            </MuiCustomDialogActions>
          </MuiCustomDialog>
        )}
    </StyledSection>
    
  );
};