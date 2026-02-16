
import React, { useEffect, useState, useRef, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { useServices } from "../contexts/ServiceContext";
import { LanguageContext } from "../contexts/LanguageContext";
import { CurrencyContext } from "../contexts/CurrencyContext";
import { useToast } from "../contexts/ToastContext";
import BalanceSection from "../components/BalanceSection";
import IncomeSection from "../components/IncomeSection";
import OutflowSection from "../components/OutflowSection";
import InsertModals from "../components/InsertModals";
import styled, { css, keyframes } from 'styled-components';
import {
  UploadFile as UploadFileIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";

const DataImportWizard = lazy(() => import("../components/DataImportWizard"));
import {
    getCashValue, getBankValue, getDigitalServicesValue, getEmergencyFund,
    getStocksValue, getEtfValue, getBitcoinValue, getCryptoValue, getBondsValue,
    getFundsValue, getGoldValue, getOutflowsTags, getIncomesTags, getPaymentTags,
    getAllOutflows, getAllIncomes, getOutflowsArray
} from '../utils/userDataSelectors';

const currentDate = new Date().toISOString().split("T")[0];

/* ─────────────── Styled Components ─────────────── */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled.div`
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  background: ${(props) => props.theme.backgroundColor};
  min-height: 100vh;
  padding: 1.5rem 1rem 0;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 3.5rem 0.75rem 0;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const PageTitle = styled.h1`
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: ${(props) => props.theme.textColor};
  margin: 0 0 0.25rem 0;
`;

const PageSubtitle = styled.p`
  font-size: 0.9rem;
  color: ${(props) => props.theme.textColor};
  opacity: 0.5;
  margin: 0;
  font-weight: 400;
`;

/* ── Segmented Control (Tab Bar) ── */
const TabBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
    gap: 0;
  }
`;

const TabGroup = styled.div`
  display: inline-flex;
  background: ${(props) => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.06)'
    : 'rgba(0, 0, 0, 0.04)'};
  border-radius: 14px;
  padding: 4px;
  gap: 2px;
  border: 1px solid ${(props) => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.06)'};
  
  @media (max-width: 768px) {
    width: 100%;
    border-radius: 12px;
  }
`;

const TabButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem 1.25rem;
  border-radius: 11px;
  border: none;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: ${(props) => props.$isActive ? '600' : '500'};
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  
  background: ${(props) => props.$isActive
    ? `linear-gradient(135deg, ${props.theme.buttonBackgroundColor}, ${props.theme.buttonBackgroundColor}dd)`
    : 'transparent'};
  color: ${(props) => props.$isActive 
    ? 'white' 
    : props.theme.textColor};
  opacity: ${(props) => props.$isActive ? 1 : 0.7};
  
  ${(props) => props.$isActive && css`
    box-shadow: 0 2px 8px ${props.theme.buttonBackgroundColor}40,
                0 1px 2px rgba(0, 0, 0, 0.1);
  `}
  
  &:hover {
    opacity: 1;
    background: ${(props) => props.$isActive
      ? `linear-gradient(135deg, ${props.theme.buttonBackgroundColor}, ${props.theme.buttonBackgroundColor}dd)`
      : props.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
  }
  
  & > svg {
    font-size: 1.1rem;
  }
  
  @media (max-width: 768px) {
    flex: 1;
    padding: 0.55rem 0.5rem;
    font-size: 0.8rem;
    gap: 0.3rem;
    border-radius: 10px;
    
    & > svg {
      font-size: 1rem;
    }
  }
  
  @media (max-width: 480px) {
    padding: 0.55rem 0.4rem;
    
    & > span {
      display: none;
    }
    
    & > svg {
      font-size: 1.2rem;
    }
  }
`;

/* ── Import CTA ── */
const ImportLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.mode === 'dark'
    ? 'rgba(255,255,255,0.12)'
    : 'rgba(0,0,0,0.1)'};
  background: transparent;
  color: ${(props) => props.theme.buttonBackgroundColor};
  font-family: inherit;
  font-weight: 500;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${(props) => props.theme.buttonBackgroundColor}12;
    border-color: ${(props) => props.theme.buttonBackgroundColor}50;
    transform: translateY(-1px);
  }
  
  & > svg {
    font-size: 0.95rem;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const ImportLinkMobile = styled.button`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    width: 100%;
    padding: 0.6rem;
    margin-bottom: 1rem;
    border-radius: 10px;
    border: 1px solid ${(props) => props.theme.mode === 'dark'
      ? 'rgba(255,255,255,0.1)'
      : 'rgba(0,0,0,0.08)'};
    background: ${(props) => props.theme.mode === 'dark'
      ? 'rgba(255,255,255,0.03)'
      : 'rgba(0,0,0,0.02)'};
    color: ${(props) => props.theme.buttonBackgroundColor};
    font-family: inherit;
    font-weight: 500;
    font-size: 0.82rem;
    cursor: pointer;
    transition: all 0.2s ease;
    
    & > svg {
      font-size: 1rem;
    }
    
    &:hover {
      background: ${(props) => props.theme.buttonBackgroundColor}10;
    }
  }
`;

/* ── Section Card ── */
const SectionCard = styled.div`
  background: ${(props) => props.theme.mode === 'dark' 
    ? `linear-gradient(180deg, ${props.theme.backgroundColor} 0%, ${props.theme.backgroundColor}f5 100%)`
    : 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)'};
  border: 1px solid ${(props) => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.07)'
    : '#e8ecf1'};
  border-radius: 20px;
  padding: 2rem;
  margin: 0 auto 1.5rem auto;
  box-shadow: ${(props) => props.theme.mode === 'dark' 
    ? '0 4px 24px rgba(0, 0, 0, 0.25)' 
    : '0 2px 16px rgba(0, 0, 0, 0.05)'};
  width: 100%;
  max-width: 1000px;
  animation: ${fadeIn} 0.3s ease-out;
  
  @media (max-width: 768px) {
    padding: 1.25rem 1rem;
    border-radius: 16px;
    margin-bottom: 1rem;
  }
`;

/* ── Import Modal ── */
const ImportOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: ${(props) => props.theme.mode === 'dark'
    ? 'rgba(0, 0, 0, 0.8)'
    : 'rgba(15, 23, 42, 0.4)'};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow-y: auto;
  backdrop-filter: blur(6px);
`;

const ImportModalContent = styled.div`
  background: ${(props) => props.theme.backgroundColor};
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3),
              0 0 0 1px ${(props) => props.theme.mode === 'dark'
                ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'};
  position: relative;

  @media (max-width: 768px) {
    padding: 1rem;
    padding-bottom: 5rem;
    border-radius: 14px;
    max-height: 95vh;
  }
`;

const ImportCloseButton = styled.button`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: ${(props) => props.theme.mode === 'dark' 
    ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
  border: none;
  cursor: pointer;
  color: ${(props) => props.theme.textColor};
  opacity: 0.6;
  font-size: 1.1rem;
  line-height: 1;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  z-index: 10;

  &:hover {
    opacity: 1;
    background: ${(props) => props.theme.mode === 'dark' 
      ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'};
  }
`;

const BottomSpacer = styled.div`
  height: 300px;
  
  @media (max-width: 768px) {
    height: 200px;
  }
`;



export default function InsertValue({
  theme,
  userData,
  handleSetIsUpdated,
  isHidden,
  initialSection: _initialSection,
}) {
  const { language, translations } = React.useContext(LanguageContext);
  const { currencySymbol } = React.useContext(CurrencyContext);
  const { showSuccess, showError } = useToast();
  const { financeService } = useServices();
  const location = useLocation();
  const initialSectionApplied = useRef(false);

  // Modal states
  const [isConfirmBalanceOpen, setIsConfirmBalanceOpen] = useState(false);
  const [isConfirmIncomeOpen, setIsConfirmIncomeOpen] = useState(false);
  const [isConfirmOutflowOpen, setIsConfirmOutflowOpen] = useState(false);
  const [showConfirmationDeleteIncome, setShowConfirmationDeleteIncome] = useState(false);
  const [showConfirmationDeleteOutflow, setShowConfirmationDeleteOutflow] = useState(false);
  const [showImportWizard, setShowImportWizard] = useState(false);
  


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
  const [bankValue, setBankValue] = useState(0);
  const [cashValue, setCashValue] = useState(0);
  const [stocksValue, setStocksValue] = useState(0);
  const [etfValue, setETFValue] = useState(0);
  const [cryptoValue, setCryptoValue] = useState(0);
  const [bitcoinValue, setBitcoinValue] = useState(0);
  const [digitalServicesValue, setDigitalServicesValue] = useState(0);
  const [emergencyFundValue, setEmergencyFundValue] = useState(0);
  const [bondsValue, setBondsValue] = useState(0);
  const [fundsValue, setFundsValue] = useState(0);
  const [goldValue, setGoldValue] = useState(0);
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
  const [balanceDate, setBalanceDate] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [activePage, setActivePage] = useState("outflows");
  const [OutflowsTags, setOutflowsTags] = useState([]);
  const [incomesTags, setIncomesTags] = useState([]);
  const [paymentTags, setPaymentTags] = useState([]);
  const [selectedIncomesMonth, setSelectedIncomesMonth] = useState(0);
  const [selectedOutflowsMonth, setSelectedOutflowsMonth] = useState(0);

  // Filtering states
  const [incomeCategoryFilter, setIncomeCategoryFilter] = useState("");
  const [incomeDateFilterStart, setIncomeDateFilterStart] = useState("");
  const [incomeDateFilterEnd, setIncomeDateFilterEnd] = useState("");
  const [incomeNoteFilter, setIncomeNoteFilter] = useState("");
  const [outflowCategoryFilter, setOutflowCategoryFilter] = useState("");
  const [outflowDateFilterStart, setOutflowDateFilterStart] = useState("");
  const [outflowDateFilterEnd, setOutflowDateFilterEnd] = useState("");
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
      if (selectedOption?.includes(translations.assets[assetKey])) {
        return Number(newValue) || 0;
      }
      return Number(currentValue) || 0;
    };
    
    return {
      balance: {
        date,
        bank: getValue('bank', bankValue),
        cash: getValue('cash', cashValue),
        digital_services: getValue('digitalServices', digitalServicesValue),
        emergency_fund: getValue('emergencyFund', emergencyFundValue),
        stocks: getValue('stocks', stocksValue),
        etf: getValue('etf', etfValue),
        bitcoin: getValue('bitcoin', bitcoinValue),
        crypto: getValue('crypto', cryptoValue),
        bonds: getValue('bonds', bondsValue),
        funds: getValue('funds', fundsValue),
        gold: getValue('gold', goldValue),
      }
    };
  };

  // Function to convert month/year selection to actual date for DB
  const getBalanceDateForDB = (monthYearObj) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    // If selected month/year is current month/year, use current date
    if (monthYearObj.month === currentMonth && monthYearObj.year === currentYear) {
      return currentDate.toISOString().split('T')[0];
    }
    
    // Otherwise, use the last day of the selected month
    // monthYearObj.month è 1-based (1=Gennaio, 11=Novembre, 12=Dicembre)
    // Per ottenere l'ultimo giorno: creiamo il primo giorno del mese successivo e sottraiamo 1 giorno
    //return date.toISOString().split('T')[0];
    const date = new Date(monthYearObj.year, monthYearObj.month, 0);
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  const options = {
    [translations.assets.bank]: [bankValue, setBankValue],
    [translations.assets.cash]: [cashValue, setCashValue],
    [translations.assets.digitalServices]: [digitalServicesValue, setDigitalServicesValue],
    [translations.assets.emergencyFund]: [emergencyFundValue, setEmergencyFundValue],
    [translations.assets.stocks]: [stocksValue, setStocksValue],
    [translations.assets.etf]: [etfValue, setETFValue],
    [translations.assets.bitcoin]: [bitcoinValue, setBitcoinValue],
    [translations.assets.crypto]: [cryptoValue, setCryptoValue],
    [translations.assets.bonds]: [bondsValue, setBondsValue],
    [translations.assets.funds]: [fundsValue, setFundsValue],
    [translations.assets.gold]: [goldValue, setGoldValue],
  };

  const fetchData = async () => {
    if (userData) {
      try {
        setStocksValue(userData ? getStocksValue(userData) : 0);
        setETFValue(userData ? getEtfValue(userData) : 0);
        setBitcoinValue(userData ? getBitcoinValue(userData) : 0);
        setCryptoValue(userData ? getCryptoValue(userData) : 0);
        setBankValue(userData ? getBankValue(userData) : 0);
        setCashValue(userData ? getCashValue(userData) : 0);
        setDigitalServicesValue(userData ? getDigitalServicesValue(userData) : 0);
        setEmergencyFundValue(userData ? getEmergencyFund(userData) : 0);
        setBondsValue(userData ? getBondsValue(userData) : 0);
        setFundsValue(userData ? getFundsValue(userData) : 0);
        setGoldValue(userData ? getGoldValue(userData) : 0);
        setOutflowsTags(userData ? getOutflowsTags(userData) : []);
        setIncomesTags(userData ? getIncomesTags(userData) : []);
        setPaymentTags(userData ? getPaymentTags(userData) : []);
        setAllOutflowsAdds(userData ? getAllOutflows(userData) : []);
        setAllIncomesAdds(userData ? getAllIncomes(userData) : []);
      } catch (error) {
        console.error("Error: ", error);
      }
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          case 'import':
            setShowImportWizard(true);
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
      showSuccess(translations.insert.balanceSection.successUpdate);
      // Reset immediatamente per evitare loop
      setUpdateBalanceSuccess(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateBalanceSuccess, language, showSuccess]);

  useEffect(() => {
    if (updateInExBalanceSuccess) {
      showSuccess(translations.insert.balanceSection.successFullUpdate);
      // Reset immediatamente per evitare loop
      setUpdateInExBalanceSuccess(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateInExBalanceSuccess, language, showSuccess]);

  useEffect(() => {
    if (updateIncomesSuccess) {
      showSuccess(translations.insert.incomeSection.successUpdate);
      setUpdateIncomesSuccess(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateIncomesSuccess, language, showSuccess]);

  useEffect(() => {
    if (updateOutflowsSuccess) {
      showSuccess(translations.insert.outflowSection.successUpdate);
      setUpdateOutflowsSuccess(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateOutflowsSuccess, language, showSuccess]);

  useEffect(() => {
    if (deleteIncomesSuccess) {
      showSuccess(translations.insert.incomeSection.successDelete);
      setDeleteIncomesSuccess(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteIncomesSuccess, language, showSuccess]);

  useEffect(() => {
    if (deleteOutflowsSuccess) {
      showSuccess(translations.insert.outflowSection.successDelete);
      setDeleteOutflowsSuccess(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteOutflowsSuccess, language, showSuccess]);

  // Array of month names
  const monthNames = {
    1: [translations.months.january],
    2: [translations.months.february],
    3: [translations.months.march],
    4: [translations.months.april],
    5: [translations.months.may],
    6: [translations.months.june],
    7: [translations.months.july],
    8: [translations.months.august],
    9: [translations.months.september],
    10: [translations.months.october],
    11: [translations.months.november],
    12: [translations.months.december],
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
      showError(translations.insert.errors.selectCategory);
      return;
    } else if (Number(income) === 0 || income === "" || income === undefined) {
      showError(translations.insert.errors.insertValidValue);
      return;
    }
    // Directly submit without confirmation modal
    handleConfirmInEx(false);
  };

  const handleAddOutflow = () => {
    if (categoryOutflow.value === "") {
      showError(translations.insert.errors.selectCategory);
      return;
    } else if (typoOutflow.value === "") {
      showError(translations.insert.errors.selectPaymentType);
      return;
    } else if (Number(outflow) === 0 || outflow === "" || outflow === undefined) {
      showError(translations.insert.errors.insertValidValue);
      return;
    }
    
    // Directly submit without confirmation modal
    handleConfirmInEx(true);
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
    const dbDate = getBalanceDateForDB(balanceDate);
    const balancesJson = createBalancesJson(dbDate);

    try {
      const balancesChange = await financeService.addBalance(balancesJson);
      if (balancesChange.status === 200) {
        handleSetIsUpdated(false);
        setUpdateBalanceSuccess(true);
        fetchData();
        // Reset to current month/year after successful update
        setBalanceDate({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
      } else {
        showError(translations.insert.errors.balanceUpdateFailed);
      }
    } catch (error) {
      console.error("Error updating balance:", error);
      if (error.response?.status === 404) {
        showError(translations.insert.errors.serverConnectionFailed);
      } else {
        showError(translations.insert.errors.balanceUpdateFailed);
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
    const originalOutflowAmount = outflow; // Store original value for limit check
    const originalIncomeAmount = income; // Store original value for balance update
    
    if (isOutflow) {
      inExJson = createInExJson(
        true,
        outflowDate,
        outflow,
        noteOutflowAreaValue,
        typoOutflow.key,
        categoryOutflow.key,
      );
      // Only reset note, value and date - keep category, typology and balance source for quick re-entry
      setNoteOutflowAreaValue("");
      setOutflow("");
      setOutflowDate(currentDate);
    } else {
      inExJson = createInExJson(
        false,
        incomeDate,
        income,
        noteIncomeAreaValue,
        0,
        categoryIncome.key,
      );
      // Only reset note, value and date - keep category and balance destination for quick re-entry
      setNoteIncomeAreaValue("");
      setIncome("");
      setIncomeDate(currentDate);
    }
    try {
      const inExAdd = await financeService.addExpenseOrIncome(inExJson);
      const balanceOptionsMap = {
        [translations.assets.bank]: bankValue,
        [translations.assets.cash]: cashValue,
        [translations.assets.digitalServices]: digitalServicesValue,
        [translations.assets.stocks]: stocksValue,
        [translations.assets.etf]: etfValue,
        [translations.assets.bitcoin]: bitcoinValue,
        [translations.assets.crypto]: cryptoValue,
        [translations.assets.bonds]: bondsValue,
        [translations.assets.funds]: fundsValue,
        [translations.assets.gold]: goldValue,
      };
      if (inExAdd.status === 200) {
        // Controllo limite di spesa mensile DOPO l'inserimento riuscito (solo per le spese)
        if (isOutflow && userData?.limits?.notificationsEnabled && userData?.limits?.monthlySpendingLimit) {
          // L'indice 0 corrisponde al mese corrente nell'array outflowsArray
          const currentOutflowsThisMonth = getOutflowsArray(userData)?.[0] || 0;
          const newTotal = currentOutflowsThisMonth + parseFloat(originalOutflowAmount.replace(',', '.'));
          
          if (newTotal > userData.limits.monthlySpendingLimit) {
            const exceeding = newTotal - userData.limits.monthlySpendingLimit;
            const warningMessage = language === 'it' 
              ? `⚠️ Limite mensile superato! Hai raggiunto ${currencySymbol}${newTotal.toFixed(2)}, superando il tuo limite di ${currencySymbol}${userData.limits.monthlySpendingLimit} di ${currencySymbol}${exceeding.toFixed(2)}.`
              : `⚠️ Monthly limit exceeded! You've reached ${currencySymbol}${newTotal.toFixed(2)}, exceeding your limit of ${currencySymbol}${userData.limits.monthlySpendingLimit} by ${currencySymbol}${exceeding.toFixed(2)}.`;
            
            // Delay per far scomparire prima la notifica di successo
            setTimeout(() => {
              showError(warningMessage, 7000); // Durata più lunga per avviso importante
            }, 2500); // Delay di 2.5 secondi per evitare sovrapposizione
          }
        }
        
        if (selectedOption !== "") {
          const valueBalanceSelected = parseFloat(balanceOptionsMap[selectedOption]);
          const outflowNumber = parseFloat(originalOutflowAmount);
          const incomeNumber = parseFloat(originalIncomeAmount);
          let newValue = 0;
          if (isOutflow) newValue = valueBalanceSelected - outflowNumber;
          else newValue = valueBalanceSelected + incomeNumber;

          const balancesJson = createBalancesJson(currentDate, selectedOption, newValue);

          const balancesChange = await financeService.addBalance(balancesJson);

          if (balancesChange.status === 200) {
            handleSetIsUpdated(false);
            setBalanceDate({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
            setUpdateInExBalanceSuccess(true);
            fetchData();
          } else {
            showError(translations.insert.errors.balanceUpdateFailed);
          }
        } else {
          handleSetIsUpdated(false);
          if (isOutflow) setUpdateOutflowsSuccess(true);
          else setUpdateIncomesSuccess(true);
          fetchData();
        }
      } else {
        if (isOutflow) {
          showError(translations.insert.errors.outflowAddFailed);
        } else {
          showError(translations.insert.errors.incomeAddFailed);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response?.status === 404) {
        showError(translations.insert.errors.serverConnectionFailed);
      } else if (isOutflow) {
        showError(translations.insert.errors.outflowAddFailed);
      } else {
        showError(translations.insert.errors.incomeAddFailed);
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
      const incomesDelete = await financeService.deleteExpenseOrIncome(data);

      // If user selected a balance to adjust, subtract the deleted income from that balance
      if (incomesDelete.status === 200) {
        if (selectedOption) {
          // Find the current value for the selected balance
          const balanceOptions = {
            [translations.assets.bank]: bankValue,
            [translations.assets.cash]: cashValue,
            [translations.assets.digitalServices]: digitalServicesValue,
            [translations.assets.stocks]: stocksValue,
            [translations.assets.etf]: etfValue,
            [translations.assets.bitcoin]: bitcoinValue,
            [translations.assets.crypto]: cryptoValue,
            [translations.assets.bonds]: bondsValue,
            [translations.assets.funds]: fundsValue,
            [translations.assets.gold]: goldValue,
          };
          const valueBalanceSelected = parseFloat(balanceOptions[selectedOption]);
          const incomeNumber = parseFloat(deleteIncomeAmount);
          const newValue = valueBalanceSelected - incomeNumber;
          // Build balancesJson for update
          const balancesJson = createBalancesJson(currentDate, selectedOption, newValue);
          await financeService.addBalance(balancesJson);
        }
        handleSetIsUpdated(false);
        setDeleteIncomesSuccess(true);
        fetchData();
      } else {
        showError(translations.insert.errors.incomeDeleteFailed);
      }
    } catch (error) {
      console.error("Error deleting income:", error);
      if (error.response?.status === 404) {
        showError(translations.insert.errors.serverConnectionFailed);
      } else {
        showError(translations.insert.errors.incomeDeleteFailed);
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
      const outflowsDelete = await financeService.deleteExpenseOrIncome(data);

      // If user selected a balance to adjust, add the deleted outflow back to that balance
      if (outflowsDelete.status === 200) {
        if (selectedOption) {
          const balanceOptions = {
            [translations.assets.bank]: bankValue,
            [translations.assets.cash]: cashValue,
            [translations.assets.digitalServices]: digitalServicesValue,
            [translations.assets.stocks]: stocksValue,
            [translations.assets.etf]: etfValue,
            [translations.assets.bitcoin]: bitcoinValue,
            [translations.assets.crypto]: cryptoValue,
            [translations.assets.bonds]: bondsValue,
            [translations.assets.funds]: fundsValue,
            [translations.assets.gold]: goldValue,
          };
          const valueBalanceSelected = parseFloat(balanceOptions[selectedOption]);
          const outflowNumber = parseFloat(deleteOutflowAmount);
          const newValue = valueBalanceSelected + outflowNumber;
          const balancesJson = createBalancesJson(currentDate, selectedOption, newValue);
          await financeService.addBalance(balancesJson);
        }
        handleSetIsUpdated(false);
        setDeleteOutflowsSuccess(true);
        fetchData();
      } else {
        showError(translations.insert.errors.outflowDeleteFailed);
      }
    } catch (error) {
      console.error("Error deleting outflow:", error);
      if (error.response?.status === 404) {
        showError(translations.insert.errors.serverConnectionFailed);
      } else {
        showError(translations.insert.errors.outflowDeleteFailed);
      }
    }
    setShowConfirmationDeleteOutflow(false);
  };

  const renderPage = () => {
    if (activePage === "bilancio") {
      return (
        <SectionCard theme={theme}>
          <BalanceSection
            theme={theme}
            isHidden={isHidden}
            bankValue={bankValue}
            setBankValue={setBankValue}
            cashValue={cashValue}
            setCashValue={setCashValue}
            digitalServicesValue={digitalServicesValue}
            setDigitalServicesValue={setDigitalServicesValue}
            emergencyFund={emergencyFundValue}
            setEmergencyFund={setEmergencyFundValue}
            stocksValue={stocksValue}
            setStocksValue={setStocksValue}
            etfValue={etfValue}
            setETFValue={setETFValue}
            bitcoinValue={bitcoinValue}
            setBitcoinValue={setBitcoinValue}
            cryptoValue={cryptoValue}
            setCryptoValue={setCryptoValue}
            bondsValue={bondsValue}
            setBondsValue={setBondsValue}
            fundsValue={fundsValue}
            setFundsValue={setFundsValue}
            goldValue={goldValue}
            setGoldValue={setGoldValue}
            balanceDate={balanceDate}
            setBalanceDate={setBalanceDate}
            onUpdateBalance={handleUpdateBalance}
            language={language}
            translations={translations}
          />
        </SectionCard>
      );
    } else if (activePage === "income") {
      return (
        <SectionCard theme={theme}>
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
            incomeDateFilterStart={incomeDateFilterStart}
            setIncomeDateFilterStart={setIncomeDateFilterStart}
            incomeDateFilterEnd={incomeDateFilterEnd}
            setIncomeDateFilterEnd={setIncomeDateFilterEnd}
            showIncomeNoteInput={showIncomeNoteInput}
            setShowIncomeNoteInput={setShowIncomeNoteInput}
            showIncomeDatePicker={showIncomeDatePicker}
            setShowIncomeDatePicker={setShowIncomeDatePicker}
            onAddIncome={handleAddIncome}
            onDeleteIncome={handleDeleteIncome}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            balanceOptions={options}
          />
        </SectionCard>
      );
    } else if (activePage === "outflows") {
      return (
        <SectionCard theme={theme}>
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
            outflowDateFilterStart={outflowDateFilterStart}
            setOutflowDateFilterStart={setOutflowDateFilterStart}
            outflowDateFilterEnd={outflowDateFilterEnd}
            setOutflowDateFilterEnd={setOutflowDateFilterEnd}
            showOutflowNoteInput={showOutflowNoteInput}
            setShowOutflowNoteInput={setShowOutflowNoteInput}
            showOutflowDatePicker={showOutflowDatePicker}
            setShowOutflowDatePicker={setShowOutflowDatePicker}
            onAddOutflow={handleAddOutflow}
            onDeleteOutflow={handleDeleteOutflow}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            balanceOptions={options}
          />
        </SectionCard>
      );
    }
  };

  return (
    <PageContainer theme={theme}>
      <ContentWrapper>
        <PageHeader>
          <PageTitle theme={theme}>
            {translations.insert.title}
          </PageTitle>
          <PageSubtitle theme={theme}>
            {translations.insert.subtitle}
          </PageSubtitle>
        </PageHeader>
        
        <TabBar>
          <TabGroup theme={theme}>
            <TabButton
              theme={theme}
              $isActive={activePage === "bilancio"}
              onClick={() => setActivePage("bilancio")}
            >
              <AccountBalanceIcon />
              <span>{translations.insert.buttonBalance}</span>
            </TabButton>
            <TabButton
              theme={theme}
              $isActive={activePage === "income"}
              onClick={() => setActivePage("income")}
            >
              <TrendingUpIcon />
              <span>{translations.insert.buttonIncome}</span>
            </TabButton>
            <TabButton
              theme={theme}
              $isActive={activePage === "outflows"}
              onClick={() => setActivePage("outflows")}
            >
              <TrendingDownIcon />
              <span>{translations.insert.buttonOutflow}</span>
            </TabButton>
          </TabGroup>
          
          {/* Import button — desktop: inline next to tabs */}
          {activePage !== "bilancio" && (
            <ImportLink
              theme={theme}
              onClick={() => setShowImportWizard(true)}
              data-umami-event="insert-import-csv-open"
            >
              <UploadFileIcon />
              {translations.insert.importFromFile || 'CSV / Excel'}
            </ImportLink>
          )}
        </TabBar>

        {/* Import button — mobile: full-width below tabs */}
        {activePage !== "bilancio" && (
          <ImportLinkMobile
            theme={theme}
            onClick={() => setShowImportWizard(true)}
            data-umami-event="insert-import-csv-open-mobile"
          >
            <UploadFileIcon />
            {translations.insert.importFromFile || (language === 'it' ? 'Importa da CSV / Excel' : 'Import from CSV / Excel')}
          </ImportLinkMobile>
        )}

        {renderPage()}

        {/* Import Wizard Modal */}
        {showImportWizard && (
          <ImportOverlay theme={theme} onClick={(e) => {
            if (e.target === e.currentTarget) setShowImportWizard(false);
          }}>
            <ImportModalContent theme={theme}>
              <ImportCloseButton theme={theme} onClick={() => setShowImportWizard(false)}>
                ✕
              </ImportCloseButton>
              <Suspense fallback={
                <div style={{ textAlign: 'center', padding: '2rem', color: theme.textColor }}>
                  {translations.dataImport?.loading || (language === 'it' ? 'Caricamento...' : 'Loading...')}
                </div>
              }>
                <DataImportWizard
                  onClose={() => setShowImportWizard(false)}
                  onImportComplete={() => {
                    setShowImportWizard(false);
                    handleSetIsUpdated(false);
                    showSuccess(translations.dataImport?.importSuccess || (language === 'it' ? 'Importazione completata!' : 'Import completed!'));
                  }}
                />
              </Suspense>
            </ImportModalContent>
          </ImportOverlay>
        )}

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
          bankValue={bankValue}
          cashValue={cashValue}
          digitalServicesValue={digitalServicesValue}
          emergencyFundValue={emergencyFundValue}
          stocksValue={stocksValue}
          etfValue={etfValue}
          bitcoinValue={bitcoinValue}
          cryptoValue={cryptoValue}
          bondsValue={bondsValue}
          fundsValue={fundsValue}
          goldValue={goldValue}
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

        <BottomSpacer />
      </ContentWrapper>
    </PageContainer>
  );
}
