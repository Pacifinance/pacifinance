import React, { useEffect, useState } from "react";
import { ButtonGroup, Select, MenuItem } from "@mui/material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import axios from 'axios';
import languages from '../contexts/languages.json';
import { LanguageContext } from "../contexts/LanguageContext";
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

const handleAddIncome = async (setIsConfirmIncomeOpen, categoryIncome, income) => {

  // Check if the user has entered a non-empty value and selected a category
  if (categoryIncome.value === "") {
    alert("Select a category");
    return; // Exit the function without further execution
  } else if ((Number(income) === 0 || income === "" || income === undefined)) {
    alert("Insert a valid value greater than 0");
    return;
  }

  setIsConfirmIncomeOpen(true);
};

const handleExitConfirm = async (setModalState) => {
  setModalState(false);
};


export default function InsertValue ({ theme, userData, handleSetIsUpdated, isHidden}) {
  const { language } = React.useContext(LanguageContext);
  const [isConfirmBalanceOpen, setIsConfirmBalanceOpen] = useState(false);
  const [isConfirmIncomeOpen, setIsConfirmIncomeOpen] = useState(false);
  const [isConfirmExpenseOpen, setIsConfirmExpenseOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [updateBalanceSuccess, setUpdateBalanceSuccess] = useState(false);
  const [updateInExBalanceSuccess, setUpdateInExBalanceSuccess] = useState(false);
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
  const [noteIncomeAreaValue, setNoteIncomeAreaValue] = useState("");
  const [noteExpenseAreaValue, setNoteExpenseAreaValue] = useState("");
  // const [isLoading, setIsLoading] = useState(true);
  const [bankReal, setBankReal] = useState(0);
  const [cashReal, setCashReal] = useState(0);
  const [stocksReal, setStocksReal] = useState(0);
  const [etfReal, setETFReal] = useState(0);
  const [cryptoReal, setCryptoReal] = useState(0);
  const [bitcoinReal, setBitcoinReal] = useState(0);
  const [digitalServicesReal, setDigitalServicesReal] = useState(0);
  const [categoryIncome, setCategoryIncome] = useState({ key: "", value: "" });
  const [categoryExpense, setCategoryExpense] = useState({ key: "", value: "" });
  const [typoExpense, setTypoExpense] = useState({ key: "", value: "" });
  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState("");
  // const [lastIncomesAdds, setLastIncomesAdds] = useState([]);
  // const [lastExpensesAdds, setLastExpensesAdds] = useState([]);
  const [allIncomesAdds, setAllIncomesAdds] = useState([]);
  const [allExpensesAdds, setAllExpensesAdds] = useState([]);
  const [incomeDate, setIncomeDate] = useState(currentDate);
  const [expenseDate, setExpenseDate] = useState(currentDate);
  const [balanceDate, setBalanceDate] = useState(currentDate);
  const [activePage, setActivePage] = useState("bilancio");
  const [expensesTags, setExpensesTags] = useState([]);
  const [incomesTags, setIncomesTags] = useState([]);
  const [paymentTags, setPaymentTags] = useState([]);
  const [selectedIncomesMonth, setSelectedIncomesMonth] = useState(0); // Set default selected month as the first month
  const [selectedExpensesMonth, setSelectedExpensesMonth] = useState(0); 
  

  const options = {
    [languages[language].assets.bank]: [bankReal, setBankReal],
    [languages[language].assets.cash]: [cashReal, setCashReal],
    [languages[language].assets.digitalServices]: [digitalServicesReal, setDigitalServicesReal],
    [languages[language].assets.stocks]: [stocksReal, setStocksReal],
    [languages[language].assets.etf]: [etfReal, setETFReal],
    [languages[language].assets.bitcoin]: [bitcoinReal, setBitcoinReal],
    [languages[language].assets.crypto]: [cryptoReal, setCryptoReal],
  };
  
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

            // setLastExpensesAdds(userData ? userData.lastExpenses : []);
            // setLastIncomesAdds(userData ? userData.lastIncomes : []); 

            setAllExpensesAdds(userData ? userData.allExpenses : []);
            setAllIncomesAdds(userData ? userData.allIncomes : []); 
            
            // setIsLoading(false); // Imposta isLoading su false quando le operazioni sono state completate
        } catch (error) {
          console.error('Error: ', error);
        }
      }
  };

  useEffect(() => {
    fetchData();
  }, [userData]);

  const handleBalanceDateChange = (event) => {
    let inputDate = event.target.value;
    setBalanceDate(inputDate);
  };
  
  
  const handleIncomeDateChange = (event) => {
    let inputDate = event.target.value;
    setIncomeDate(inputDate);
  };
  
  const handleExpenseDateChange = (event) => {
    let inputDate = event.target.value;
    setExpenseDate(inputDate);
  };

  const handleIncomesMonthChange = (event) => {
    setSelectedIncomesMonth(event.target.value); // Update the selected month
  };

  const handleExpensesMonthChange = (event) => {
    setSelectedExpensesMonth(event.target.value); 
  };

  // Array of month names
  const monthNames = {
    1: [languages[language].months.january],
    2: [languages[language].months.february],
    3: [languages[language].months.march],
    4: [languages[language].months.april],
    5: [languages[language].months.may],
    6: [languages[language].months.june],
    7: [languages[language].months.july],
    8: [languages[language].months.august],
    9: [languages[language].months.september],
    10: [languages[language].months.october],
    11: [languages[language].months.november],
    12: [languages[language].months.december]
  };
  
  // Get the current month and year
  const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-based, so add 1
  const currentYear = new Date().getFullYear();

  // Initialize monthOptions as an empty array
  let monthOptions = [];
  let year = currentYear;
  
  // Iterate over allExpensesAdds (could be used also allIncomesAdds, they have the same length)
  for (let i = 0; i < Object.keys(allExpensesAdds).length; i++) {
    // Calculate the month and year for the current index
    let month = ((currentMonth - i - 1 + 12) % 12) + 1; // Subtract 1 before the modulo operation and add 1 after
    

    if (month === 12 && i !== 0) {
      year--;
    }
  
    // Add an object with value and label properties to monthOptions
    monthOptions.push({ value: i, label: `${monthNames[month]} ${year}` });
  }

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
      alert("Errore in the update of the balance");
    }
  };


  const createInExJson = (isExpense, date, amount, notes, payment_type, category_tag) => {
    return {
      expense: {
        date: date,
        amount: amount,
        is_expense: isExpense,
        payment_type: payment_type,
        category_tag: category_tag,
        notes: notes
      },
    };
  };


  const handleConfirmInEx = async (isExpense) => {
    let inExJson = {};
    if (isExpense) {
      setIsConfirmExpenseOpen(false);
      inExJson = createInExJson(true, expenseDate, expense, noteExpenseAreaValue, typoExpense.key, categoryExpense.key);
      setNoteExpenseAreaValue("");
      setCategoryExpense({ key: "", value: "" });
      setTypoExpense({ key: "", value: "" });
      setExpenseDate(currentDate);
    } else {
      setIsConfirmIncomeOpen(false);
      inExJson = createInExJson(false, incomeDate, income, noteIncomeAreaValue, 0, categoryIncome.key);
      setNoteIncomeAreaValue("");
      setCategoryIncome({ key: "", value: "" });
      setIncomeDate(currentDate);
    }
    try {

      const inExAdd = await axios.post('/expenses/add', inExJson, { withCredentials: true });
      const options = {
        [languages[language].assets.bank]: bankReal,
        [languages[language].assets.cash]: cashReal,
        [languages[language].assets.digitalServices]: digitalServicesReal,
        [languages[language].assets.stocks]: stocksReal,
        [languages[language].assets.etf]: etfReal,
        [languages[language].assets.bitcoin]: bitcoinReal,
        [languages[language].assets.crypto]: cryptoReal,
      };
      if (inExAdd.status === 200) {
        if (selectedOption !== "") {
          console.log(selectedOption);

          const valueBalanceSelected = parseFloat(options[selectedOption]);

          const expenseNumber = parseFloat(expense);
          const incomeNumber = parseFloat(income);

          let newValue = 0;
          if(isExpense) newValue = valueBalanceSelected - expenseNumber;
          else newValue = valueBalanceSelected + incomeNumber;
        

          const balancesJson = { 
            balance : {
              date : balanceDate,
              bank : selectedOption.includes(languages[language].assets.bank) ? newValue : bankReal,
              cash : selectedOption.includes(languages[language].assets.cash) ? newValue : cashReal,
              digital_services : selectedOption.includes(languages[language].assets.digitalServices) ? newValue : digitalServicesReal,
              stocks : {
                real : selectedOption.includes(languages[language].assets.stocks) ? newValue : stocksReal
              },
              etf : {
                real : selectedOption.includes(languages[language].assets.etf) ? newValue : etfReal
              },
              bitcoin : {
                real : selectedOption.includes(languages[language].assets.bitcoin) ? newValue : bitcoinReal
              },
              crypto : {
                real : selectedOption.includes(languages[language].assets.crypto) ? newValue : cryptoReal
              },
            }
          }

          console.log(balancesJson);
        
          const balancesChange = await axios.post('/balances/add', balancesJson, { withCredentials: true });

          if (balancesChange.status === 200) {
            handleSetIsUpdated(false); // Forza il re-render di UserProvider
            setBalanceDate(currentDate);
            setUpdateInExBalanceSuccess(true);
            fetchData();
          }
          else {
            alert("Error in the update of the balance");
          }

        } 
        else {
          handleSetIsUpdated(false); 
          if (isExpense) setUpdateExpensesSuccess(true);
          else setUpdateIncomesSuccess(true);
          fetchData();
        }
          
      } else{
        alert("Error in the update of the expense");
      }

    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  
  const handleAddExpenses = async () => {
  
    // Verifica se income è uguale a 0 e/o categoryIncome è vuoto
    if (categoryExpense.value === "") {
      alert("Select a category");
      return; 
    } else if (typoExpense.value === "") {
      alert("Select a payment type");
      return; 
    } else if ((Number(expense) === 0 || expense === "" || expense === undefined)) { 
      alert("Insert a valid value greater than 0");
      return;
    }
  
    setIsConfirmExpenseOpen(true);
  };

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
      alert("Error in the update of the income");
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
      alert("Error in the update of the expense");
    }
  };
  

  function renderIncomeItems(chosenExpensesToShow) {
    return chosenExpensesToShow.map((add, index) => {
      const incomeDate = new Date(add.date);
      const formattedDate = `${incomeDate.getDate()}/${incomeDate.getMonth() + 1}/${incomeDate.getFullYear()}`;

      const handleDelete = () => {
        setDeleteIncomeAmount(add.amount);
        setDeleteIncomeDate(add.date);
        setShowConfirmationDeleteIncome(true);
      };
  
      return (
        <tr key={index}>
          <td>{isHidden ? '****' : add.categoryTag.translations[language]}</td>
          <td>{isHidden ? '****' : add.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €</td>
          <td>{isHidden ? '****' : add.notes}</td>
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
  
  
  
  
  function renderExpenseItems(chosenExpensesToShow) {
    return chosenExpensesToShow.map((add, index) => {
      const expenseDate = new Date(add.date);
      const formattedDate = `${expenseDate.getDate()}/${expenseDate.getMonth() + 1}/${expenseDate.getFullYear()}`;

      const handleDelete = () => {
        setDeleteExpenseDate(add.date);
        setDeleteExpenseAmount(add.amount);
        setShowConfirmationDeleteExpense(true);
      };

      return (
        <tr key={index}>
          <td>{isHidden ? '****' : add.categoryTag.translations[language]}</td>
          <td>{isHidden ? '****' : add.paymentType.translations[language]}</td>
          <td>{isHidden ? '****' : add.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €</td>
          <td>{isHidden ? '****' : add.notes}</td>
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
          <TitleSection theme={theme}> {languages[language].insert.balanceSection.titleLiquidity} </TitleSection>
          <StyledInputs theme={theme}>
            <Column>
              <LabelContainer theme={theme}>
                <LabelStyle theme={theme}>
                  {languages[language].assets.bank}
                </LabelStyle>
              </LabelContainer>
              <LabelContainer theme={theme}>
                <LabelStyle theme={theme}>
                  {languages[language].assets.cash}
                </LabelStyle>
              </LabelContainer>
              <LabelContainer theme={theme}>
                <LabelStyle theme={theme}>
                  {languages[language].assets.digitalServices}
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
          <TitleSection theme={theme}> {languages[language].insert.balanceSection.titleInvestments} </TitleSection>
          <StyledInputs theme={theme}>
            <Column>
              <LabelContainer theme={theme}>
                <LabelStyle theme={theme}>
                  {languages[language].assets.stocks}
                </LabelStyle>
              </LabelContainer>
              <LabelContainer theme={theme}>
                <LabelStyle theme={theme}>
                  {languages[language].assets.etf}
                </LabelStyle>
              </LabelContainer>
              <LabelContainer theme={theme}>
                <LabelStyle theme={theme}>
                  {languages[language].assets.bitcoin}
                </LabelStyle>
              </LabelContainer>
              <LabelContainer theme={theme}>
                <LabelStyle theme={theme}>
                  {languages[language].assets.crypto}
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
            <MySecondaryButton theme={theme} onClick={() =>handleChangeBalance(setIsConfirmBalanceOpen)} >{languages[language].insert.balanceSection.updateButton}</MySecondaryButton>
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
                        const selectedValue = selectedItem.translations[language];
                        setCategoryIncome({ key: selectedKey, value: selectedValue });
                      }
                }} 
                
                style={{ backgroundColor: 'white' }} displayEmpty

                renderValue={(value) => {
                  if (value === "") {
                    return languages[language].insert.incomeSection.placeholderCategory;
                  }
                  return value;
                }}
              >
                <MenuItem value="">
                  <em>{languages[language].insert.incomeSection.placeholderCategory}</em>
                </MenuItem>
                {incomesTags.map((item) => (
                  <MenuItem key={item.index} value={item.index}>
                    {item.translations[language]} 
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
                  placeholder="0"
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
            <label>
              <textarea
                value={noteIncomeAreaValue}
                onChange={(e) => setNoteIncomeAreaValue(e.target.value)}
                maxLength={64}
                placeholder={languages[language].insert.incomeSection.placeholderNote}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  color: "#333",
                  outline: "none",
                }}
              />
            </label>
          </StyledAddSection>
            
          <StyledAddSection theme={theme}> 
            <MySecondaryButton theme={theme} onClick={() =>handleAddIncome(setIsConfirmIncomeOpen, categoryIncome, income)}>{languages[language].insert.incomeSection.updateButton}</MySecondaryButton>
          </StyledAddSection>
          <TitleLastAdds theme={theme}>{languages[language].insert.incomeSection.titleListing}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <select value={selectedIncomesMonth} onChange={handleIncomesMonthChange} style={{ padding: '1em' }}>
                {monthOptions && monthOptions.length > 0 && monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </TitleLastAdds>
          <StyledTable theme={theme}>
          
            <thead>
              <tr>
                <th>{languages[language].insert.incomeSection.tableColumns.category}</th>
                <th>{languages[language].insert.incomeSection.tableColumns.value}</th>
                <th>{languages[language].insert.incomeSection.tableColumns.note}</th>
                <th>{languages[language].insert.incomeSection.tableColumns.date}</th>
              </tr>
            </thead>
            <tbody>
              {allIncomesAdds && allIncomesAdds.length > 0 && renderIncomeItems(allIncomesAdds[selectedIncomesMonth])}
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
                        const selectedValue = selectedItem.translations[language];
                        setCategoryExpense({ key: selectedKey, value: selectedValue });
                      }
                    }}  
                  
                  style={{ backgroundColor: 'white' }} displayEmpty

                  renderValue={(value) => {
                    if (value === "") {
                      return languages[language].insert.expenseSection.placeholderCategory;
                    }
                    return value;
                  }}
                  >

                  <MenuItem value="">
                    <em>{languages[language].insert.expenseSection.placeholderCategory}</em>
                  </MenuItem>
                  {expensesTags.map((item) => (
                    <MenuItem key={item.index} value={item.index}>
                      {item.translations[language]} 
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
                        const selectedValue = selectedItem.translations[language];
                        setTypoExpense({ key: selectedKey, value: selectedValue });
                      }
                    }}  
                  
                  style={{ backgroundColor: 'white' }} displayEmpty

                  renderValue={(value) => {
                    if (value === "") {
                      return languages[language].insert.expenseSection.placeholderTypology;
                    }
                    return value;
                  }}
                  >
                  <MenuItem value="">
                    <em>{languages[language].insert.expenseSection.placeholderTypology}</em>
                  </MenuItem>
                  {paymentTags.map((item) => (
                    // check if the item is not none because we don't want to show it
                    item.label !== "none" && (
                      <MenuItem key={item.index} value={item.index}>
                        {item.translations[language]}
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
                  placeholder="0"
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
            <label>
              <textarea
                value={noteExpenseAreaValue}
                onChange={(e) => setNoteExpenseAreaValue(e.target.value)}
                maxLength={64}
                placeholder={languages[language].insert.expenseSection.placeholderNote}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  color: "#333",
                  outline: "none",
                }}
              />
            </label>
          </StyledAddSection>

          <StyledAddSection theme={theme}>
            <MySecondaryButton theme={theme} onClick={() => handleAddExpenses(setIsConfirmExpenseOpen, typoExpense,  categoryExpense, expense)}>{languages[language].insert.expenseSection.updateButton}</MySecondaryButton>
          </StyledAddSection>
          <TitleLastAdds theme={theme}>{languages[language].insert.expenseSection.titleListing}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <select value={selectedExpensesMonth} onChange={handleExpensesMonthChange} style={{ padding: '1em' }}>
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </TitleLastAdds>
          <StyledTable theme={theme}>
            <thead>
              <tr>
                <th>{languages[language].insert.expenseSection.tableColumns.category}</th>
                <th>{languages[language].insert.expenseSection.tableColumns.typology}</th>
                <th>{languages[language].insert.expenseSection.tableColumns.value}</th>
                <th>{languages[language].insert.expenseSection.tableColumns.note}</th>
                <th>{languages[language].insert.expenseSection.tableColumns.date}</th>
              </tr>
            </thead>
            <tbody>
              {allExpensesAdds && allExpensesAdds.length > 0 && renderExpenseItems(allExpensesAdds[selectedExpensesMonth])}
            </tbody>
          </StyledTable>
        </>
      );
    }
  };

  return (
    <StyledSection theme={theme}>
        <ModifiedTitleDashboard theme={theme}>{languages[language].insert.title}</ModifiedTitleDashboard>
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
            {languages[language].insert.buttonBalance}
          </MySectionButton>
          <MySectionButton theme={theme}
            onClick={() => setActivePage("income")}
            style={{
              backgroundColor:
                activePage === "income" ? "" : "#222831",
              marginRight: "1vw",
            }}
          >
            {languages[language].insert.buttonIncome}
          </MySectionButton>
          <MySectionButton theme={theme}
            onClick={() => setActivePage("expenses")}
            style={{
              backgroundColor:
                activePage === "expenses" ? "" : "#222831",
            }}
          >
            {languages[language].insert.buttonExpense}
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
            <MuiCustomDialogTitle>{languages[language].insert.balanceSection.confirmUpdate}</MuiCustomDialogTitle>
            <MuiCustomDialogContent>
              <MuiCustomDialogContentText>{languages[language].assets.bank}: {bankReal}€</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>{languages[language].assets.cash}: {cashReal}€</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>{languages[language].assets.digitalServices}: {digitalServicesReal}€</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>{languages[language].assets.stocks}: {stocksReal}€</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>{languages[language].assets.etf}: {etfReal}€</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>{languages[language].assets.bitcoin}: {bitcoinReal}€</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>{languages[language].assets.crypto}: {cryptoReal}€</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>{languages[language].general.selectedDate}: {balanceDate}</MuiCustomDialogContentText>{/* TO FIX */}  
            </MuiCustomDialogContent>
            <MuiCustomDialogActions>
              <MuiCustomButton onClick={() => handleConfirmBalance(fetchData, setIsConfirmBalanceOpen, setBalanceDate, setUpdateBalanceSuccess, handleSetIsUpdated, balanceDate, bankReal, cashReal, digitalServicesReal, stocksReal, etfReal, bitcoinReal, cryptoReal)}>{languages[language].general.confirm}</MuiCustomButton>
              <MuiCustomButton onClick={() => handleExitConfirm(setIsConfirmBalanceOpen)}>{languages[language].general.cancel}</MuiCustomButton>
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
            <MuiCustomDialogTitle>{languages[language].insert.incomeSection.confirmUpdate}</MuiCustomDialogTitle>
            <MuiCustomDialogContent>
              <MuiCustomDialogContentText>{languages[language].general.category}: {categoryIncome.value}</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>{languages[language].general.value}: {income}€</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>{languages[language].general.note}: {noteIncomeAreaValue}</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>{languages[language].general.selectedDate}: {incomeDate}</MuiCustomDialogContentText>{/* TO FIX */}  
              <Typography variant="body1" style={{ marginTop: '1em' }}>{languages[language].insert.incomeSection.increaseWhichBalance}: </Typography>
              <Select value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
                <MenuItem value="">{languages[language].general.selectAnOption}</MenuItem>
                {Object.keys(options).map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </MuiCustomDialogContent>
            <MuiCustomDialogActions>
              <MuiCustomButton onClick={() => handleConfirmInEx(false)}>{languages[language].general.confirm}</MuiCustomButton>
              <MuiCustomButton onClick={() => handleExitConfirm(setIsConfirmIncomeOpen)}>{languages[language].general.cancel}</MuiCustomButton>
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
            <MuiCustomDialogTitle>{languages[language].insert.expenseSection.confirmUpdate}</MuiCustomDialogTitle>
            <MuiCustomDialogContent>
              <MuiCustomDialogContentText>{languages[language].general.category}: {categoryExpense.value}</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>{languages[language].insert.expenseSection.paymentType}: {typoExpense.value}</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>{languages[language].general.value}: {expense}€</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>{languages[language].general.note}: {noteExpenseAreaValue}</MuiCustomDialogContentText>
              <MuiCustomDialogContentText>{languages[language].general.selectedDate}: {expenseDate}</MuiCustomDialogContentText>{/* TO FIX */}  
              <Typography variant="body2" style={{ marginTop: '1em' }}>{languages[language].insert.expenseSection.decreaseWhichBalance}: </Typography>
              <Select value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
                <MenuItem value="">{languages[language].general.selectAnOption}</MenuItem>
                {Object.keys(options).map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </MuiCustomDialogContent>
            <MuiCustomDialogActions>
              <MuiCustomButton onClick={() => handleConfirmInEx(true)}>{languages[language].general.confirm}</MuiCustomButton>
              <MuiCustomButton onClick={() => handleExitConfirm(setIsConfirmExpenseOpen)}>{languages[language].general.cancel}</MuiCustomButton>
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
            <MuiCustomDialogTitle>{languages[language].insert.balanceSection.successUpdate}</MuiCustomDialogTitle>
            <MuiCustomDialogActions>
              <MuiCustomButton onClick={() => handleExitConfirm(setUpdateBalanceSuccess)}>{languages[language].general.ok}</MuiCustomButton>
            </MuiCustomDialogActions>
          </MuiCustomDialog>
        )}

        {updateInExBalanceSuccess && (
          <MuiCustomDialog
            open={updateInExBalanceSuccess}
            onClose={() => handleExitConfirm(setUpdateInExBalanceSuccess)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <MuiCustomDialogTitle>{languages[language].insert.balanceSection.successFullUpdate}</MuiCustomDialogTitle>
            <MuiCustomDialogActions>
              <MuiCustomButton onClick={() => handleExitConfirm(setUpdateInExBalanceSuccess)}>{languages[language].general.ok}</MuiCustomButton>
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
            <MuiCustomDialogTitle>{languages[language].insert.incomeSection.successUpdate}</MuiCustomDialogTitle>
            <MuiCustomDialogActions>
              <MuiCustomButton onClick={() => handleExitConfirm(setUpdateIncomesSuccess)}>{languages[language].general.ok}</MuiCustomButton>
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
            <MuiCustomDialogTitle>{languages[language].insert.expenseSection.successUpdate}</MuiCustomDialogTitle>
            <MuiCustomDialogActions>
              <MuiCustomButton onClick={() => handleExitConfirm(setUpdateExpensesSuccess)}>{languages[language].general.ok}</MuiCustomButton>
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
            <MuiCustomDialogTitle>{languages[language].insert.incomeSection.successDelete}</MuiCustomDialogTitle>
            <MuiCustomDialogActions>
              <MuiCustomButton onClick={() => handleExitConfirm(setDeleteIncomesSuccess)}>{languages[language].general.ok}</MuiCustomButton>
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
            <MuiCustomDialogTitle>{languages[language].insert.expenseSection.successDelete}</MuiCustomDialogTitle>
            <MuiCustomDialogActions>
              <MuiCustomButton onClick={() => handleExitConfirm(setDeleteExpensesSuccess)}>{languages[language].general.ok}</MuiCustomButton>
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
            <MuiCustomDialogTitle>{languages[language].insert.incomeSection.confimrDelete}</MuiCustomDialogTitle>
            <MuiCustomDialogActions>
              <MuiCustomButton onClick={() => {
                handleIncomesDelete(fetchData, setDeleteIncomesSuccess, handleSetIsUpdated, deleteIncomeDate, deleteIncomeAmount);
                setShowConfirmationDeleteIncome(false);
              }}>{languages[language].general.confirm}</MuiCustomButton>
              <MuiCustomButton onClick={() => setShowConfirmationDeleteIncome(false)}>{languages[language].general.cancel}</MuiCustomButton>
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
            <MuiCustomDialogTitle>{languages[language].insert.expenseSection.confirmDelete}</MuiCustomDialogTitle>
            <MuiCustomDialogActions>
              <MuiCustomButton onClick={() => {
                handleExpensesDelete(fetchData, setDeleteExpensesSuccess, handleSetIsUpdated, deleteExpenseDate, deleteExpenseAmount);
                setShowConfirmationDeleteExpense(false);
              }}>{languages[language].general.confirm}</MuiCustomButton>
              <MuiCustomButton onClick={() => setShowConfirmationDeleteExpense(false)}>{languages[language].general.cancel}</MuiCustomButton>
            </MuiCustomDialogActions>
          </MuiCustomDialog>
        )}
    </StyledSection>
    
  );
};