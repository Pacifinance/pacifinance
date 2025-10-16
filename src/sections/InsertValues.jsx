
import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ButtonGroup } from "@mui/material";
import axios from "axios";
import languages from "../data/languages.json";
import { LanguageContext } from "../contexts/LanguageContext";
import { useToast } from "../contexts/ToastContext";
import {
  MySectionButton,
  StyledSection,
  StandardPageTitle,
} from "../styles/MyStyled";
import BalanceSection from "../components/BalanceSection";
import IncomeSection from "../components/IncomeSection";
import OutflowSection from "../components/OutflowSection";
import InsertModals from "../components/InsertModals";
import styled from 'styled-components';

const currentDate = new Date().toISOString().split("T")[0];

// Modern styled components for the redesigned page
const ModernContainer = styled.div`
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  background: ${(props) => props.theme.backgroundColor};
  min-height: 100vh;
  padding: 2rem 1rem;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 4rem 0.5rem 1rem 0.5rem; /* Aumentato padding-top per mobile */
  }
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const ModernTitle = styled.h1`
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  background: linear-gradient(135deg, white 0%, white 70%, #079164 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: clamp(1.8rem, 3.5vw, 2.5rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-align: center;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const ModernButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
  gap: 0.5rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    margin-bottom: 2rem;
    gap: 0.25rem;
  }
`;

const ModernSectionButton = styled.button`
  background: ${(props) => props.$isActive 
    ? `linear-gradient(135deg, ${props.theme.buttonBackgroundColor} 0%, ${props.theme.buttonBackgroundColor}dd 100%)`
    : 'transparent'};
  color: ${(props) => props.$isActive ? 'white' : props.theme.textColor};
  border: 2px solid ${(props) => props.theme.buttonBackgroundColor};
  padding: ${(props) => props.$isActive ? '1rem 2rem' : '0.875rem 1.5rem'};
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: ${(props) => props.$isActive ? '1.1rem' : '1rem'};
  font-weight: ${(props) => props.$isActive ? '700' : '600'};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  position: relative;
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${(props) => props.$isActive && `
    box-shadow: 0 0 0 4px ${props.theme.buttonBackgroundColor}30, 
                0 8px 32px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.3);
    transform: scale(1.05) translateY(-3px);
    z-index: 10;
    border-width: 3px;
    
    &:before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(135deg, ${props.theme.buttonBackgroundColor}80, ${props.theme.buttonBackgroundColor}40);
      border-radius: 14px;
      z-index: -1;
      opacity: 0.6;
      filter: blur(4px);
    }
  `}
  
  &:hover {
    background: ${(props) => props.$isActive 
      ? `linear-gradient(135deg, ${props.theme.buttonBackgroundColor}dd 0%, ${props.theme.buttonBackgroundColor}bb 100%)`
      : `${props.theme.buttonBackgroundColor}20`};
    transform: ${(props) => props.$isActive 
      ? 'scale(1.05) translateY(-4px)' 
      : 'scale(1.02) translateY(-2px)'};
    box-shadow: ${(props) => props.$isActive 
      ? `0 0 0 4px ${props.theme.buttonBackgroundColor}40, 0 12px 40px rgba(0, 0, 0, 0.25)`
      : '0 6px 20px rgba(0, 0, 0, 0.15)'};
    border-color: ${(props) => props.theme.buttonBackgroundColor};
  }
  
  /* Indicatore visivo per il pulsante attivo */
  ${(props) => props.$isActive && `
    &:after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 3px;
      background: ${props.theme.buttonBackgroundColor};
      border-radius: 2px;
      box-shadow: 0 2px 8px ${props.theme.buttonBackgroundColor}60;
    }
  `}
  
  @media (max-width: 768px) {
    padding: ${(props) => props.$isActive ? '0.875rem 1.25rem' : '0.75rem 1rem'};
    font-size: ${(props) => props.$isActive ? '1rem' : '0.9rem'};
    flex: 1;
    min-width: 100px;
    min-height: 48px;
    
    ${(props) => props.$isActive && `
      &:after {
        bottom: -6px;
        width: 30px;
        height: 2px;
      }
    `}
  }
`;

const SectionContainer = styled.div`
  background: ${(props) => props.theme.mode === 'dark' 
    ? `linear-gradient(135deg, ${props.theme.backgroundColor}f0 0%, ${props.theme.backgroundColor}f8 100%)`
    : `linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)`};
  border: 1px solid ${(props) => props.theme.mode === 'dark' 
    ? `${props.theme.buttonBackgroundColor}30`
    : '#e2e8f0'};
  border-radius: 20px;
  padding: 2rem;
  margin: 0 auto 2rem auto;
  backdrop-filter: blur(10px);
  box-shadow: ${(props) => props.theme.mode === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
    : '0 4px 20px rgba(0, 0, 0, 0.08)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 1000px;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${(props) => props.theme.mode === 'dark' 
      ? '0 12px 40px rgba(0, 0, 0, 0.4)' 
      : '0 8px 30px rgba(0, 0, 0, 0.12)'};
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 16px;
    margin-bottom: 1.5rem;
    max-width: 95%;
  }

  /* Ensure all direct children are properly centered */
  & > * {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  /* Center form elements and override any conflicting styles */
  form {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    width: 100% !important;
  }

  /* Style for all form sections to center content */
  & [class*="StyledAddSection"],
  & [class*="StyledInputs"],
  & [class*="TitleSection"],
  & [class*="TitleLastAdds"],
  & [class*="StyledCalendarInput"] {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
    width: 100% !important;
  }

  /* Ensure table titles are centered */
  & h3, & h4 {
    text-align: center !important;
    width: 100% !important;
    margin: 1rem 0 !important;
  }

  /* Center table wrapper */
  & > div[style*="overflowX"] {
    display: flex !important;
    justify-content: center !important;
    width: 100% !important;
  }
`;

export default function InsertValue({
  theme,
  userData,
  handleSetIsUpdated,
  isHidden,
  initialSection,
}) {
  const { language } = React.useContext(LanguageContext);
  const { showSuccess, showError } = useToast();
  const location = useLocation();
  const initialSectionApplied = useRef(false);

  // Modal states
  const [isConfirmBalanceOpen, setIsConfirmBalanceOpen] = useState(false);
  const [isConfirmIncomeOpen, setIsConfirmIncomeOpen] = useState(false);
  const [isConfirmOutflowOpen, setIsConfirmOutflowOpen] = useState(false);
  const [showConfirmationDeleteIncome, setShowConfirmationDeleteIncome] = useState(false);
  const [showConfirmationDeleteOutflow, setShowConfirmationDeleteOutflow] = useState(false);

  // Success states
  const [updateBalanceSuccess, setUpdateBalanceSuccess] = useState(false);
  const [updateInExBalanceSuccess, setUpdateInExBalanceSuccess] = useState(false);
  const [updateIncomesSuccess, setUpdateIncomesSuccess] = useState(false);
  const [updateOutflowsSuccess, setUpdateOutflowsSuccess] = useState(false);
  const [deleteIncomesSuccess, setDeleteIncomesSuccess] = useState(false);
  const [deleteOutflowsSuccess, setDeleteOutflowsSuccess] = useState(false);

  // Delete states
  const [deleteIncomeDate, setDeleteIncomeDate] = useState("");
  const [deleteIncomeAmount, setDeleteIncomeAmount] = useState("");
  const [deleteOutflowDate, setDeleteOutflowDate] = useState("");
  const [deleteOutflowAmount, setDeleteOutflowAmount] = useState("");

  // Form states
  const [selectedOption, setSelectedOption] = useState("");
  const [bankReal, setBankReal] = useState(0);
  const [cashReal, setCashReal] = useState(0);
  const [stocksReal, setStocksReal] = useState(0);
  const [etfReal, setETFReal] = useState(0);
  const [cryptoReal, setCryptoReal] = useState(0);
  const [bitcoinReal, setBitcoinReal] = useState(0);
  const [digitalServicesReal, setDigitalServicesReal] = useState(0);
  const [bondsReal, setBondsReal] = useState(0);
  const [fundsReal, setFundsReal] = useState(0);
  const [goldReal, setGoldReal] = useState(0);
  const [categoryIncome, setCategoryIncome] = useState({ key: "", value: "" });
  const [categoryOutflow, setCategoryOutflow] = useState({ key: "", value: "" });
  const [typoOutflow, setTypoOutflow] = useState({ key: "", value: "" });
  const [income, setIncome] = useState("");
  const [outflow, setOutflow] = useState("");
  const [noteIncomeAreaValue, setNoteIncomeAreaValue] = useState("");
  const [noteOutflowAreaValue, setNoteOutflowAreaValue] = useState("");
  const [allIncomesAdds, setAllIncomesAdds] = useState([]);
  const [allOutflowsAdds, setAllOutflowsAdds] = useState([]);
  const [incomeDate, setIncomeDate] = useState(currentDate);
  const [outflowDate, setOutflowDate] = useState(currentDate);
  const [balanceDate, setBalanceDate] = useState(currentDate);
  const [activePage, setActivePage] = useState("outflows");
  const [OutflowsTags, setOutflowsTags] = useState([]);
  const [incomesTags, setIncomesTags] = useState([]);
  const [paymentTags, setPaymentTags] = useState([]);
  const [selectedIncomesMonth, setSelectedIncomesMonth] = useState(0);
  const [selectedOutflowsMonth, setSelectedOutflowsMonth] = useState(0);

  // Filtering states
  const [incomeCategoryFilter, setIncomeCategoryFilter] = useState("");
  const [incomeDateFilter, setIncomeDateFilter] = useState("");
  const [incomeNoteFilter, setIncomeNoteFilter] = useState("");
  const [outflowCategoryFilter, setOutflowCategoryFilter] = useState("");
  const [outflowDateFilter, setOutflowDateFilter] = useState("");
  const [outflowNoteFilter, setOutflowNoteFilter] = useState("");
  const [outflowTypologyFilter, setOutflowTypologyFilter] = useState("");

  // UI/UX state for table header filters
  const [showIncomeNoteInput, setShowIncomeNoteInput] = useState(false);
  const [showIncomeDatePicker, setShowIncomeDatePicker] = useState(false);
  const [showOutflowNoteInput, setShowOutflowNoteInput] = useState(false);
  const [showOutflowDatePicker, setShowOutflowDatePicker] = useState(false);

  // Helper function to create balances JSON - simplified with component context access
  const createBalancesJson = (date, selectedOption = null, newValue = null) => {
    const getValue = (assetKey, currentValue) => {
      if (selectedOption?.includes(languages[language].assets[assetKey])) {
        return Number(newValue) || 0;
      }
      return Number(currentValue) || 0;
    };
    
    return {
      balance: {
        date,
        bank: getValue('bank', bankReal),
        cash: getValue('cash', cashReal),
        digital_services: getValue('digitalServices', digitalServicesReal),
        stocks: getValue('stocks', stocksReal),
        etf: getValue('etf', etfReal),
        bitcoin: getValue('bitcoin', bitcoinReal),
        crypto: getValue('crypto', cryptoReal),
        bonds: getValue('bonds', bondsReal),
        funds: getValue('funds', fundsReal),
        gold: getValue('gold', goldReal),
      }
    };
  };

  const options = {
    [languages[language].assets.bank]: [bankReal, setBankReal],
    [languages[language].assets.cash]: [cashReal, setCashReal],
    [languages[language].assets.digitalServices]: [digitalServicesReal, setDigitalServicesReal],
    [languages[language].assets.stocks]: [stocksReal, setStocksReal],
    [languages[language].assets.etf]: [etfReal, setETFReal],
    [languages[language].assets.bitcoin]: [bitcoinReal, setBitcoinReal],
    [languages[language].assets.crypto]: [cryptoReal, setCryptoReal],
    [languages[language].assets.bonds]: [bondsReal, setBondsReal],
    [languages[language].assets.funds]: [fundsReal, setFundsReal],
    [languages[language].assets.gold]: [goldReal, setGoldReal],
  };

  const fetchData = async () => {
    if (userData) {
      try {
        setStocksReal(userData ? userData.stocksReal : 0);
        setETFReal(userData ? userData.etfReal : 0);
        setBitcoinReal(userData ? userData.bitcoinReal : 0);
        setCryptoReal(userData ? userData.cryptoReal : 0);
        setBankReal(userData ? userData.bankReal : 0);
        setCashReal(userData ? userData.cashReal : 0);
        setDigitalServicesReal(userData ? userData.digitalServicesReal : 0);
        setBondsReal(userData ? userData.bondsReal : 0);
        setFundsReal(userData ? userData.fundsReal : 0);
        setGoldReal(userData ? userData.goldReal : 0);
        setOutflowsTags(userData ? userData.outflowsTags : []);
        setIncomesTags(userData ? userData.incomesTags : []);
        setPaymentTags(userData ? userData.paymentTags : []);
        setAllOutflowsAdds(userData ? userData.allOutflows : []);
        setAllIncomesAdds(userData ? userData.allIncomes : []);
      } catch (error) {
        console.error("Error: ", error);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [userData]);

    // Imposta la sezione iniziale basata sul parametro URL - solo al primo caricamento
  useEffect(() => {
    if (initialSectionApplied.current) return; // Evita di eseguire più volte
    
    const urlParams = new URLSearchParams(location.search);
    const sectionParam = urlParams.get('section');
    
    if (sectionParam) {
      // Piccolo delay per assicurarsi che il componente sia montato
      setTimeout(() => {
        switch (sectionParam) {
          case 'balance':
            setActivePage('bilancio');
            break;
          case 'income':
            setActivePage('income');
            break;
          case 'outflow':
            setActivePage('outflows');
            break;
          default:
            setActivePage('outflows');
        }
        initialSectionApplied.current = true; // Marca come applicato
      }, 100);
    } else {
      // Se non c'è parametro URL, imposta default e marca come applicato
      initialSectionApplied.current = true;
    }
  }, [location.search]); // Rimosso activePage dalle dipendenze per evitare loop

  // Auto-hide success notifications with toast
  useEffect(() => {
    if (updateBalanceSuccess) {
      showSuccess(languages[language].insert.balanceSection.successUpdate);
      // Reset immediatamente per evitare loop
      setUpdateBalanceSuccess(false);
    }
  }, [updateBalanceSuccess, language, showSuccess]);

  useEffect(() => {
    if (updateInExBalanceSuccess) {
      showSuccess(languages[language].insert.balanceSection.successFullUpdate);
      // Reset immediatamente per evitare loop
      setUpdateInExBalanceSuccess(false);
    }
  }, [updateInExBalanceSuccess, language, showSuccess]);

  useEffect(() => {
    if (updateIncomesSuccess) {
      showSuccess(languages[language].insert.incomeSection.successUpdate);
      setUpdateIncomesSuccess(false);
    }
  }, [updateIncomesSuccess, language, showSuccess]);

  useEffect(() => {
    if (updateOutflowsSuccess) {
      showSuccess(languages[language].insert.outflowSection.successUpdate);
      setUpdateOutflowsSuccess(false);
    }
  }, [updateOutflowsSuccess, language, showSuccess]);

  useEffect(() => {
    if (deleteIncomesSuccess) {
      showSuccess(languages[language].insert.incomeSection.successDelete);
      setDeleteIncomesSuccess(false);
    }
  }, [deleteIncomesSuccess, language, showSuccess]);

  useEffect(() => {
    if (deleteOutflowsSuccess) {
      showSuccess(languages[language].insert.outflowSection.successDelete);
      setDeleteOutflowsSuccess(false);
    }
  }, [deleteOutflowsSuccess, language, showSuccess]);

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
    12: [languages[language].months.december],
  };

  // Get the current month and year
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Build the last 12 months (including current) - newest first, oldest last
  let monthsArray = [];
  for (let i = 0; i < 12; i++) {
    let d = new Date(currentYear, currentMonth - 1 - i, 1);
    monthsArray.push({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
    });
  }
  // Non serve più reverse() - così il mese corrente sarà all'indice 0

  // Build monthOptions
  let monthOptions = monthsArray.map((obj, idx) => ({
    value: idx,
    label: `${monthNames[obj.month]} ${obj.year}`,
    month: obj.month,
    year: obj.year,
  }));

  const incomeMonthOptions = monthOptions;
  const outflowMonthOptions = monthOptions;

  let currentMonthIdx = monthsArray.findIndex(
    (obj) => obj.month === currentMonth && obj.year === currentYear,
  );

  useEffect(() => {
    if (monthOptions.length > 0) {
      if (currentMonthIdx !== -1) {
        setSelectedIncomesMonth(currentMonthIdx);
        setSelectedOutflowsMonth(currentMonthIdx);
      } else {
        setSelectedIncomesMonth(0); // Default al primo mese (corrente)
        setSelectedOutflowsMonth(0);
      }
    }
  }, [userData, currentMonthIdx, monthOptions.length]);

  const selectedIncomeMonthKey = monthOptions[selectedIncomesMonth]
    ? `${monthOptions[selectedIncomesMonth].month}-${monthOptions[selectedIncomesMonth].year}`
    : "";
  const selectedOutflowMonthKey = monthOptions[selectedOutflowsMonth]
    ? `${monthOptions[selectedOutflowsMonth].month}-${monthOptions[selectedOutflowsMonth].year}`
    : "";

  // Handler functions
  const handleUpdateBalance = () => {
    setIsConfirmBalanceOpen(true);
  };

  const handleAddIncome = () => {
    if (categoryIncome.value === "") {
      alert(languages[language].insert.errors.selectCategory);
      return;
    } else if (Number(income) === 0 || income === "" || income === undefined) {
      alert(languages[language].insert.errors.insertValidValue);
      return;
    }
    setIsConfirmIncomeOpen(true);
  };

  const handleAddOutflow = () => {
    if (categoryOutflow.value === "") {
      alert(languages[language].insert.errors.selectCategory);
      return;
    } else if (typoOutflow.value === "") {
      alert(languages[language].insert.errors.selectPaymentType);
      return;
    } else if (Number(outflow) === 0 || outflow === "" || outflow === undefined) {
      alert(languages[language].insert.errors.insertValidValue);
      return;
    }
    setIsConfirmOutflowOpen(true);
  };

  const handleDeleteIncome = (date, amount) => {
    setDeleteIncomeAmount(amount);
    setDeleteIncomeDate(date);
    setShowConfirmationDeleteIncome(true);
  };

  const handleDeleteOutflow = (date, amount) => {
    setDeleteOutflowDate(date);
    setDeleteOutflowAmount(amount);
    setShowConfirmationDeleteOutflow(true);
  };

  const handleConfirmBalance = async () => {
    setIsConfirmBalanceOpen(false);
    const balancesJson = createBalancesJson(balanceDate);

    try {
      const balancesChange = await axios.post("/balances/add", balancesJson, {
        withCredentials: true,
      });
      if (balancesChange.status === 200) {
        handleSetIsUpdated(false);
        setUpdateBalanceSuccess(true);
        fetchData();
        setBalanceDate(currentDate);
      } else {
        showError(languages[language].insert.errors.balanceUpdateFailed);
      }
    } catch (error) {
      console.error("Error updating balance:", error);
      if (error.response?.status === 404) {
        showError(languages[language].insert.errors.serverConnectionFailed);
      } else {
        showError(languages[language].insert.errors.balanceUpdateFailed);
      }
    }
  };

  const createInExJson = (isOutflow, date, amount, notes, payment_type, category_tag) => {
    return {
      expense: {
        date: date,
        amount: Number(amount) || 0,
        is_expense: isOutflow,
        payment_type: payment_type,
        category_tag: category_tag,
        notes: notes,
      },
    };
  };

  const handleConfirmInEx = async (isOutflow) => {
    let inExJson = {};
    if (isOutflow) {
      setIsConfirmOutflowOpen(false);
      inExJson = createInExJson(
        true,
        outflowDate,
        outflow,
        noteOutflowAreaValue,
        typoOutflow.key,
        categoryOutflow.key,
      );
      setNoteOutflowAreaValue("");
      setCategoryOutflow({ key: "", value: "" });
      setTypoOutflow({ key: "", value: "" });
      setOutflowDate(currentDate);
    } else {
      setIsConfirmIncomeOpen(false);
      inExJson = createInExJson(
        false,
        incomeDate,
        income,
        noteIncomeAreaValue,
        0,
        categoryIncome.key,
      );
      setNoteIncomeAreaValue("");
      setCategoryIncome({ key: "", value: "" });
      setIncomeDate(currentDate);
    }
    try {
      const inExAdd = await axios.post("/expenses/add", inExJson, {
        withCredentials: true,
      });
      const balanceOptions = {
        [languages[language].assets.bank]: bankReal,
        [languages[language].assets.cash]: cashReal,
        [languages[language].assets.digitalServices]: digitalServicesReal,
        [languages[language].assets.stocks]: stocksReal,
        [languages[language].assets.etf]: etfReal,
        [languages[language].assets.bitcoin]: bitcoinReal,
        [languages[language].assets.crypto]: cryptoReal,
        [languages[language].assets.bonds]: bondsReal,
        [languages[language].assets.funds]: fundsReal,
        [languages[language].assets.gold]: goldReal,
      };
      if (inExAdd.status === 200) {
        if (selectedOption !== "") {
          const valueBalanceSelected = parseFloat(balanceOptions[selectedOption]);
          const outflowNumber = parseFloat(outflow);
          const incomeNumber = parseFloat(income);
          let newValue = 0;
          if (isOutflow) newValue = valueBalanceSelected - outflowNumber;
          else newValue = valueBalanceSelected + incomeNumber;

          const balancesJson = createBalancesJson(balanceDate, selectedOption, newValue);

          const balancesChange = await axios.post(
            "/balances/add",
            balancesJson,
            { withCredentials: true },
          );

          if (balancesChange.status === 200) {
            handleSetIsUpdated(false);
            setBalanceDate(currentDate);
            setUpdateInExBalanceSuccess(true);
            fetchData();
          } else {
            showError(languages[language].insert.errors.balanceUpdateFailed);
          }
        } else {
          handleSetIsUpdated(false);
          if (isOutflow) setUpdateOutflowsSuccess(true);
          else setUpdateIncomesSuccess(true);
          fetchData();
        }
      } else {
        if (isOutflow) {
          showError(languages[language].insert.errors.outflowAddFailed);
        } else {
          showError(languages[language].insert.errors.incomeAddFailed);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response?.status === 404) {
        showError(languages[language].insert.errors.serverConnectionFailed);
      } else if (isOutflow) {
        showError(languages[language].insert.errors.outflowAddFailed);
      } else {
        showError(languages[language].insert.errors.incomeAddFailed);
      }
    }
  };


  const handleIncomesDelete = async () => {
    const data = {
      expense: {
        date: deleteIncomeDate,
        amount: Number(deleteIncomeAmount) || 0,
        is_expense: false,
      },
    };
    
    try {
      const incomesDelete = await axios.post("/expenses/delete", data, {
        withCredentials: true,
      });

      // If user selected a balance to adjust, subtract the deleted income from that balance
      if (incomesDelete.status === 200) {
        if (selectedOption) {
          // Find the current value for the selected balance
          const balanceOptions = {
            [languages[language].assets.bank]: bankReal,
            [languages[language].assets.cash]: cashReal,
            [languages[language].assets.digitalServices]: digitalServicesReal,
            [languages[language].assets.stocks]: stocksReal,
            [languages[language].assets.etf]: etfReal,
            [languages[language].assets.bitcoin]: bitcoinReal,
            [languages[language].assets.crypto]: cryptoReal,
            [languages[language].assets.bonds]: bondsReal,
            [languages[language].assets.funds]: fundsReal,
            [languages[language].assets.gold]: goldReal,
          };
          const valueBalanceSelected = parseFloat(balanceOptions[selectedOption]);
          const incomeNumber = parseFloat(deleteIncomeAmount);
          const newValue = valueBalanceSelected - incomeNumber;
          // Build balancesJson for update
          const balancesJson = createBalancesJson(currentDate, selectedOption, newValue);
          await axios.post("/balances/add", balancesJson, { withCredentials: true });
        }
        handleSetIsUpdated(false);
        setDeleteIncomesSuccess(true);
        fetchData();
      } else {
        showError(languages[language].insert.errors.incomeDeleteFailed);
      }
    } catch (error) {
      console.error("Error deleting income:", error);
      if (error.response?.status === 404) {
        showError(languages[language].insert.errors.serverConnectionFailed);
      } else {
        showError(languages[language].insert.errors.incomeDeleteFailed);
      }
    }
    setShowConfirmationDeleteIncome(false);
  };

  const handleOutflowsDelete = async () => {
    const data = {
      expense: {
        date: deleteOutflowDate,
        amount: Number(deleteOutflowAmount) || 0,
        is_expense: true,
      },
    };
    
    try {
      const outflowsDelete = await axios.post("/expenses/delete", data, {
        withCredentials: true,
      });

      // If user selected a balance to adjust, add the deleted outflow back to that balance
      if (outflowsDelete.status === 200) {
        if (selectedOption) {
          const balanceOptions = {
            [languages[language].assets.bank]: bankReal,
            [languages[language].assets.cash]: cashReal,
            [languages[language].assets.digitalServices]: digitalServicesReal,
            [languages[language].assets.stocks]: stocksReal,
            [languages[language].assets.etf]: etfReal,
            [languages[language].assets.bitcoin]: bitcoinReal,
            [languages[language].assets.crypto]: cryptoReal,
            [languages[language].assets.bonds]: bondsReal,
            [languages[language].assets.funds]: fundsReal,
            [languages[language].assets.gold]: goldReal,
          };
          const valueBalanceSelected = parseFloat(balanceOptions[selectedOption]);
          const outflowNumber = parseFloat(deleteOutflowAmount);
          const newValue = valueBalanceSelected + outflowNumber;
          const balancesJson = createBalancesJson(currentDate, selectedOption, newValue);
          await axios.post("/balances/add", balancesJson, { withCredentials: true });
        }
        handleSetIsUpdated(false);
        setDeleteOutflowsSuccess(true);
        fetchData();
      } else {
        showError(languages[language].insert.errors.outflowDeleteFailed);
      }
    } catch (error) {
      console.error("Error deleting outflow:", error);
      if (error.response?.status === 404) {
        showError(languages[language].insert.errors.serverConnectionFailed);
      } else {
        showError(languages[language].insert.errors.outflowDeleteFailed);
      }
    }
    setShowConfirmationDeleteOutflow(false);
  };

  const renderPage = () => {
    if (activePage === "bilancio") {
      return (
        <SectionContainer theme={theme}>
          <BalanceSection
            theme={theme}
            isHidden={isHidden}
            bankReal={bankReal}
            setBankReal={setBankReal}
            cashReal={cashReal}
            setCashReal={setCashReal}
            digitalServicesReal={digitalServicesReal}
            setDigitalServicesReal={setDigitalServicesReal}
            stocksReal={stocksReal}
            setStocksReal={setStocksReal}
            etfReal={etfReal}
            setETFReal={setETFReal}
            bitcoinReal={bitcoinReal}
            setBitcoinReal={setBitcoinReal}
            cryptoReal={cryptoReal}
            setCryptoReal={setCryptoReal}
            bondsReal={bondsReal}
            setBondsReal={setBondsReal}
            fundsReal={fundsReal}
            setFundsReal={setFundsReal}
            goldReal={goldReal}
            setGoldReal={setGoldReal}
            balanceDate={balanceDate}
            setBalanceDate={setBalanceDate}
            onUpdateBalance={handleUpdateBalance}
          />
        </SectionContainer>
      );
    } else if (activePage === "income") {
      return (
        <SectionContainer theme={theme}>
          <IncomeSection
            theme={theme}
            isHidden={isHidden}
            categoryIncome={categoryIncome}
            setCategoryIncome={setCategoryIncome}
            income={income}
            setIncome={setIncome}
            incomeDate={incomeDate}
            setIncomeDate={setIncomeDate}
            noteIncomeAreaValue={noteIncomeAreaValue}
            setNoteIncomeAreaValue={setNoteIncomeAreaValue}
            incomesTags={incomesTags}
            selectedIncomesMonth={selectedIncomesMonth}
            setSelectedIncomesMonth={setSelectedIncomesMonth}
            incomeMonthOptions={incomeMonthOptions}
            allIncomesAdds={allIncomesAdds}
            selectedIncomeMonthKey={selectedIncomeMonthKey}
            incomeCategoryFilter={incomeCategoryFilter}
            setIncomeCategoryFilter={setIncomeCategoryFilter}
            incomeNoteFilter={incomeNoteFilter}
            setIncomeNoteFilter={setIncomeNoteFilter}
            incomeDateFilter={incomeDateFilter}
            setIncomeDateFilter={setIncomeDateFilter}
            showIncomeNoteInput={showIncomeNoteInput}
            setShowIncomeNoteInput={setShowIncomeNoteInput}
            showIncomeDatePicker={showIncomeDatePicker}
            setShowIncomeDatePicker={setShowIncomeDatePicker}
            onAddIncome={handleAddIncome}
            onDeleteIncome={handleDeleteIncome}
          />
        </SectionContainer>
      );
    } else if (activePage === "outflows") {
      return (
        <SectionContainer theme={theme}>
          <OutflowSection
            theme={theme}
            isHidden={isHidden}
            categoryOutflow={categoryOutflow}
            setCategoryOutflow={setCategoryOutflow}
            typoOutflow={typoOutflow}
            setTypoOutflow={setTypoOutflow}
            outflow={outflow}
            setOutflow={setOutflow}
            outflowDate={outflowDate}
            setOutflowDate={setOutflowDate}
            noteOutflowAreaValue={noteOutflowAreaValue}
            setNoteOutflowAreaValue={setNoteOutflowAreaValue}
            OutflowsTags={OutflowsTags}
            paymentTags={paymentTags}
            selectedOutflowsMonth={selectedOutflowsMonth}
            setSelectedOutflowsMonth={setSelectedOutflowsMonth}
            outflowMonthOptions={outflowMonthOptions}
            allOutflowsAdds={allOutflowsAdds}
            selectedOutflowMonthKey={selectedOutflowMonthKey}
            outflowCategoryFilter={outflowCategoryFilter}
            setOutflowCategoryFilter={setOutflowCategoryFilter}
            outflowTypologyFilter={outflowTypologyFilter}
            setOutflowTypologyFilter={setOutflowTypologyFilter}
            outflowNoteFilter={outflowNoteFilter}
            setOutflowNoteFilter={setOutflowNoteFilter}
            outflowDateFilter={outflowDateFilter}
            setOutflowDateFilter={setOutflowDateFilter}
            showOutflowNoteInput={showOutflowNoteInput}
            setShowOutflowNoteInput={setShowOutflowNoteInput}
            showOutflowDatePicker={showOutflowDatePicker}
            setShowOutflowDatePicker={setShowOutflowDatePicker}
            onAddOutflow={handleAddOutflow}
            onDeleteOutflow={handleDeleteOutflow}
          />
        </SectionContainer>
      );
    }
  };

  return (
    <ModernContainer theme={theme}>
      <ContentWrapper>
        <ModernTitle theme={theme}>
          {languages[language].insert.title}
        </ModernTitle>
        
        <ModernButtonGroup>
          <ModernSectionButton
            theme={theme}
            $isActive={activePage === "bilancio"}
            onClick={() => setActivePage("bilancio")}
          >
            {languages[language].insert.buttonBalance}
          </ModernSectionButton>
          <ModernSectionButton
            theme={theme}
            $isActive={activePage === "income"}
            onClick={() => setActivePage("income")}
          >
            {languages[language].insert.buttonIncome}
          </ModernSectionButton>
          <ModernSectionButton
            theme={theme}
            $isActive={activePage === "outflows"}
            onClick={() => setActivePage("outflows")}
          >
            {languages[language].insert.buttonOutflow}
          </ModernSectionButton>
        </ModernButtonGroup>

        {renderPage()}

        <InsertModals
          isConfirmBalanceOpen={isConfirmBalanceOpen}
          setIsConfirmBalanceOpen={setIsConfirmBalanceOpen}
          isConfirmIncomeOpen={isConfirmIncomeOpen}
          setIsConfirmIncomeOpen={setIsConfirmIncomeOpen}
          isConfirmOutflowOpen={isConfirmOutflowOpen}
          setIsConfirmOutflowOpen={setIsConfirmOutflowOpen}
          showConfirmationDeleteIncome={showConfirmationDeleteIncome}
          setShowConfirmationDeleteIncome={setShowConfirmationDeleteIncome}
          showConfirmationDeleteOutflow={showConfirmationDeleteOutflow}
          setShowConfirmationDeleteOutflow={setShowConfirmationDeleteOutflow}
          balanceDate={balanceDate}
          bankReal={bankReal}
          cashReal={cashReal}
          digitalServicesReal={digitalServicesReal}
          stocksReal={stocksReal}
          etfReal={etfReal}
          bitcoinReal={bitcoinReal}
          cryptoReal={cryptoReal}
          bondsReal={bondsReal}
          fundsReal={fundsReal}
          goldReal={goldReal}
          categoryIncome={categoryIncome}
          income={income}
          noteIncomeAreaValue={noteIncomeAreaValue}
          incomeDate={incomeDate}
          categoryOutflow={categoryOutflow}
          typoOutflow={typoOutflow}
          outflow={outflow}
          noteOutflowAreaValue={noteOutflowAreaValue}
          outflowDate={outflowDate}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          options={options}
          onConfirmBalance={handleConfirmBalance}
          onConfirmIncome={() => handleConfirmInEx(false)}
          onConfirmOutflow={() => handleConfirmInEx(true)}
          onConfirmDeleteIncome={handleIncomesDelete}
          onConfirmDeleteOutflow={handleOutflowsDelete}
        />
        
        {/* Spacer per evitare che il popup di navigazione appaia troppo presto su mobile */}
        <div style={{ height: '400px' }}></div>
      </ContentWrapper>
    </ModernContainer>
  );
}
