
import React, { useContext, useEffect, useState, useRef, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { useDemoServices } from "../hooks/useDemoServices";
import { LanguageContext } from "../contexts/LanguageContext";
import { CurrencyContext } from "../contexts/CurrencyContext";
import { UserContext } from "../contexts/UserContext";
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
  Repeat as RepeatIcon,
} from "@mui/icons-material";

const DataImportWizard = lazy(() => import("../components/DataImportWizard"));
const MultiOutflowInsert = lazy(() => import("../components/MultiOutflowInsert"));
const MultiIncomeInsert = lazy(() => import("../components/MultiIncomeInsert"));
const MultiBalanceInsert = lazy(() => import("../components/MultiBalanceInsert"));
const RecurringTransactionsPanel = lazy(() => import("../components/RecurringTransactionsPanel"));
import { groupAmountsByBalanceSource, parseFormattedAmount } from "../components/multiInsert/helpers";
const groupIncomeAmountsBySource = groupAmountsByBalanceSource;
import { ASSET_KEYS } from "../components/MultiBalanceInsert";
import { buildAddBalancePayload, buildSnapshotWithDeltas, ASSET_TO_DB_KEY } from "../constants/balanceSchema";
import {
    getCashValue, getBankValue, getDigitalServicesValue, getEmergencyFund,
    getStocksValue, getEtfValue, getBitcoinValue, getCryptoValue, getBondsValue,
    getFundsValue, getCommoditiesValue, getOutflowsTags, getIncomesTags, getPaymentTags,
    getAllOutflows, getAllIncomes, getOutflowsArray, getBalanceForMonth, getCustomCategories,
    getEntriesForMonthKey,
} from '../utils/userDataSelectors';
import { isPastMonthDate as isPastMonthDateUtil, getBalanceUserDateForMonth } from '../utils/balanceDeltaLogic';
import { usePastDateBalancePref, PAST_DATE_BALANCE_CHOICES } from '../hooks/usePastDateBalancePref';
import { addCurrency, roundCurrency } from '../utils/money';
const PastDateBalanceChoiceModal = lazy(() => import('../components/PastDateBalanceChoiceModal'));
const EditTransactionModal = lazy(() => import('../components/EditTransactionModal'));

const currentDate = new Date().toISOString().split("T")[0];
const createEmptyBalanceInputs = () => Object.fromEntries(ASSET_KEYS.map((key) => [key, '']));

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
  overflow: hidden;
  animation: ${fadeIn} 0.3s ease-out;
  
  @media (max-width: 768px) {
    padding: 1.25rem 0.75rem;
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
  const { currencySymbol, toEUR } = React.useContext(CurrencyContext);
  const { addCustomCategory, fetchMonthDetail } = useContext(UserContext) || {};
  const { showSuccess, showError, showWarning } = useToast();
  const { financeService, investmentService, liquidityAccountService, recurringTransactionService } = useDemoServices();
  const location = useLocation();
  const initialSectionApplied = useRef(false);

  // Modal states
  const [isConfirmBalanceOpen, setIsConfirmBalanceOpen] = useState(false);
  const [showConfirmationDeleteIncome, setShowConfirmationDeleteIncome] = useState(false);
  const [showConfirmationDeleteOutflow, setShowConfirmationDeleteOutflow] = useState(false);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [showMultiInsert, setShowMultiInsert] = useState(false);
  const [showMultiIncomeInsert, setShowMultiIncomeInsert] = useState(false);
  const [showMultiBalanceInsert, setShowMultiBalanceInsert] = useState(false);
  const [showRecurringPanel, setShowRecurringPanel] = useState(false);
  const [recurringItems, setRecurringItems] = useState([]);
  const [makeOutflowRecurring, setMakeOutflowRecurring] = useState(false);

  const refreshRecurringItems = async () => {
    const items = await recurringTransactionService.getRecurring();
    setRecurringItems(Array.isArray(items) ? items : []);
  };

  // Past-date balance decision modal (for single & multi insert past-month flows)
  const { pref: pastDatePref, setPref: setPastDatePref } = usePastDateBalancePref();
  const [pastDateModal, setPastDateModal] = useState({
    isOpen: false,
    rows: [],
    isOutflow: true,
    onResolve: null, // (choice, remember) => void
  });

  // Edit-transaction confirmation modal (single-row edit that changes amount/month)
  const [editModal, setEditModal] = useState({
    isOpen: false,
    isOutflow: true,
    originalDate: '',
    originalAmount: 0,
    editedDate: '',
    editedAmount: 0,
    selectedSource: '',
    onResolve: null, // (source|null) => void
  });

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
  const [deleteIncomeId, setDeleteIncomeId] = useState(null);
  const [deleteOutflowDate, setDeleteOutflowDate] = useState("");
  const [deleteOutflowAmount, setDeleteOutflowAmount] = useState("");
  const [deleteOutflowId, setDeleteOutflowId] = useState(null);
  // True when the delete modal's source was auto-filled from the source stored
  // with the transaction at insert time (shows an explanatory note in the modal)
  const [deleteSourcePrefilled, setDeleteSourcePrefilled] = useState(false);

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
  const [commoditiesValue, setCommoditiesValue] = useState(0);
  const [investmentHoldings, setInvestmentHoldings] = useState([]);
  const [liquidityAccounts, setLiquidityAccounts] = useState([]);
  const [investmentHoldingHistory, setInvestmentHoldingHistory] = useState([]);
  const [liquidityAccountHistory, setLiquidityAccountHistory] = useState([]);
  const [balanceInputs, setBalanceInputs] = useState(createEmptyBalanceInputs);
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

  // Flattened views combining every loaded month's transactions with any
  // on-demand fetched "extra" months (see fetchMonthDetail below) — used by
  // the table's date-range filter so it isn't limited to the single selected
  // month once the user picks a range that spans (or falls outside) it.
  const flatOutflowsForRange = React.useMemo(() => {
    const loaded = Array.isArray(allOutflowsAdds) ? allOutflowsAdds.flat() : [];
    const extra = userData?.extraMonths
      ? Object.values(userData.extraMonths).flat().filter((entry) => entry?.isExpense)
      : [];
    return [...loaded, ...extra];
  }, [allOutflowsAdds, userData?.extraMonths]);

  const flatIncomesForRange = React.useMemo(() => {
    const loaded = Array.isArray(allIncomesAdds) ? allIncomesAdds.flat() : [];
    const extra = userData?.extraMonths
      ? Object.values(userData.extraMonths).flat().filter((entry) => !entry?.isExpense)
      : [];
    return [...loaded, ...extra];
  }, [allIncomesAdds, userData?.extraMonths]);

  // When either date-range filter reaches outside the already-loaded window,
  // fetch the missing calendar month(s) on demand (same mechanism the stats
  // page uses) instead of loading years of transactions up front.
  useEffect(() => {
    if (!fetchMonthDetail || !userData) return;
    const monthKeysInRange = (startStr, endStr) => {
      if (!startStr && !endStr) return [];
      const start = new Date(startStr || endStr);
      const end = new Date(endStr || startStr);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
      const keys = [];
      const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
      const last = new Date(end.getFullYear(), end.getMonth(), 1);
      while (cursor <= last) {
        keys.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`);
        cursor.setMonth(cursor.getMonth() + 1);
      }
      return keys;
    };
    const neededKeys = new Set([
      ...monthKeysInRange(outflowDateFilterStart, outflowDateFilterEnd),
      ...monthKeysInRange(incomeDateFilterStart, incomeDateFilterEnd),
    ]);
    neededKeys.forEach((key) => {
      if (getEntriesForMonthKey(userData, key, 'outflows') === null) {
        const [year, month] = key.split('-').map(Number);
        fetchMonthDetail(year, month);
      }
    });
  }, [outflowDateFilterStart, outflowDateFilterEnd, incomeDateFilterStart, incomeDateFilterEnd, userData, fetchMonthDetail]);

  const balanceBaseValues = {
    bank: bankValue,
    cash: cashValue,
    digitalServices: digitalServicesValue,
    emergencyFund: emergencyFundValue,
    stocks: stocksValue,
    etf: etfValue,
    bitcoin: bitcoinValue,
    crypto: cryptoValue,
    bonds: bondsValue,
    funds: fundsValue,
    commodities: commoditiesValue,
  };

  const setBalanceInputValue = (assetKey) => (value) => {
    setBalanceInputs((prev) => ({ ...prev, [assetKey]: value }));
  };

  // Maps an asset key that supports detailed sub-accounts (verifiable investments or
  // liquidity accounts) onto the setter that holds its EUR "base" value (the
  // persisted-from-DB value, as opposed to the display-currency draft in balanceInputs)
  // — used to reconcile the aggregate input with the sub-accounts' sum.
  const assetBaseSetters = {
    bank: setBankValue,
    cash: setCashValue,
    digitalServices: setDigitalServicesValue,
    emergencyFund: setEmergencyFundValue,
    stocks: setStocksValue,
    etf: setETFValue,
    bitcoin: setBitcoinValue,
    crypto: setCryptoValue,
    bonds: setBondsValue,
    funds: setFundsValue,
  };

  const handleAssetBaseValueOverride = (assetKey, eurValue) => {
    assetBaseSetters[assetKey]?.(eurValue);
    // Clear any stale draft so createBalancesJson picks the sub-accounts-derived base value.
    setBalanceInputValue(assetKey)('');
  };

  const refreshInvestmentHoldings = async () => {
    const holdings = await investmentService.getHoldings();
    setInvestmentHoldings(Array.isArray(holdings) ? holdings : []);
  };

  const refreshLiquidityAccounts = async () => {
    const accounts = await liquidityAccountService.getAccounts();
    setLiquidityAccounts(Array.isArray(accounts) ? accounts : []);
  };

  useEffect(() => {
    refreshInvestmentHoldings();
    refreshLiquidityAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Backfilled per-month holdings/accounts history for whichever month is
  // currently being viewed in "aggiorna bilancio" — empty for the current
  // month (nothing to backfill there, the live portfolio already drives it).
  const refreshInvestmentHoldingHistory = async () => {
    const now = new Date();
    const isCurrent = balanceDate.month === now.getMonth() + 1 && balanceDate.year === now.getFullYear();
    if (isCurrent) {
      setInvestmentHoldingHistory([]);
      return;
    }
    const user_date = `${balanceDate.year}-${String(balanceDate.month).padStart(2, '0')}-01`;
    const history = await investmentService.getHoldingHistory({ user_date });
    setInvestmentHoldingHistory(Array.isArray(history) ? history : []);
  };

  const refreshLiquidityAccountHistory = async () => {
    const now = new Date();
    const isCurrent = balanceDate.month === now.getMonth() + 1 && balanceDate.year === now.getFullYear();
    if (isCurrent) {
      setLiquidityAccountHistory([]);
      return;
    }
    const user_date = `${balanceDate.year}-${String(balanceDate.month).padStart(2, '0')}-01`;
    const history = await liquidityAccountService.getAccountHistory({ user_date });
    setLiquidityAccountHistory(Array.isArray(history) ? history : []);
  };

  useEffect(() => {
    refreshInvestmentHoldingHistory();
    refreshLiquidityAccountHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balanceDate.month, balanceDate.year]);

  const getBalanceFieldValue = (assetKey) => {
    const draftValue = balanceInputs[assetKey];
    return draftValue !== '' ? draftValue : balanceBaseValues[assetKey];
  };

  const getBaseBalanceSourceEntries = () => [
    { label: translations.assets.bank, assetKey: 'bank' },
    { label: translations.assets.cash, assetKey: 'cash' },
    { label: translations.assets.digitalServices, assetKey: 'digitalServices' },
    { label: translations.assets.emergencyFund, assetKey: 'emergencyFund' },
    { label: translations.assets.stocks, assetKey: 'stocks' },
    { label: translations.assets.etf, assetKey: 'etf' },
    { label: translations.assets.bitcoin, assetKey: 'bitcoin' },
    { label: translations.assets.crypto, assetKey: 'crypto' },
    { label: translations.assets.bonds, assetKey: 'bonds' },
    { label: translations.assets.funds, assetKey: 'funds' },
    { label: translations.assets.commodities, assetKey: 'commodities' },
  ];

  const getHoldingValue = (holding) => Number(holding?.currentValue ?? holding?.investedAmount ?? 0) || 0;
  const getHoldingLabel = (holding) => holding?.instrument?.symbol || holding?.instrument?.name || holding?.notes || ('Holding #' + holding?.id);
  const getDetailedSourceLabel = (assetKey, detailLabel) => (translations.assets[assetKey] ? (translations.assets[assetKey] + ' / ' + detailLabel) : detailLabel);

  const getBalanceSourceEntries = () => {
    const entries = [...getBaseBalanceSourceEntries()];
    const seen = new Set(entries.map((entry) => entry.label));
    const addEntry = (entry) => {
      if (!entry.label || seen.has(entry.label)) return;
      seen.add(entry.label);
      entries.push(entry);
    };

    liquidityAccounts.forEach((account) => {
      if (!account?.assetKey || !account?.label) return;
      addEntry({
        label: getDetailedSourceLabel(account.assetKey, account.label),
        assetKey: account.assetKey,
        detailType: 'liquidity',
        detailId: account.id,
      });
    });

    investmentHoldings.forEach((holding) => {
      if (!holding?.assetKey) return;
      addEntry({
        label: getDetailedSourceLabel(holding.assetKey, getHoldingLabel(holding)),
        assetKey: holding.assetKey,
        detailType: 'investment',
        detailId: holding.id,
      });
    });

    return entries;
  };

  const getBalanceSourceMeta = () => Object.fromEntries(getBalanceSourceEntries().map((entry) => [entry.label, entry]));

  const applyCurrentDetailSourceDelta = async (balanceSource, deltaEUR) => {
    const meta = getBalanceSourceMeta()[balanceSource];
    if (!meta?.detailType || !deltaEUR) return;

    if (meta.detailType === 'liquidity') {
      const account = liquidityAccounts.find((item) => item.id === meta.detailId);
      if (!account) return;
      const newValue = (Number(account.currentValue) || 0) + deltaEUR;
      await liquidityAccountService.saveAccount({
        id: account.id,
        asset_key: account.assetKey,
        label: account.label,
        current_value: newValue,
        currency: account.currency,
        notes: account.notes,
      });
      await refreshLiquidityAccounts();
      // Negative balances are allowed (real overdrafts happen), but it's more often
      // a sign the account wasn't kept up to date — nudge the user, don't block them.
      if (newValue < 0) {
        const warning = (translations.insert.warnings?.negativeAccountBalance || '')
          .replace('{account}', account.label);
        if (warning) showWarning(warning, 6000);
      }
      return;
    }

    if (meta.detailType === 'investment') {
      const holding = investmentHoldings.find((item) => item.id === meta.detailId);
      if (!holding?.instrument?.id) return;
      await investmentService.saveHolding({
        id: holding.id,
        instrument_id: holding.instrument.id,
        asset_key: holding.assetKey,
        position_type: holding.positionType,
        quantity: holding.quantity,
        average_price: holding.averagePrice,
        current_value: getHoldingValue(holding) + deltaEUR,
        invested_amount: holding.investedAmount,
        currency: holding.currency,
        notes: holding.notes,
      });
      await refreshInvestmentHoldings();
    }
  };


  const resetBalanceInputs = () => {
    setBalanceInputs(createEmptyBalanceInputs());
  };

  // Helper function to create balances JSON - simplified with component context access
  const createBalancesJson = (date, selectedOption = null, newValue = null) => {
    const getValue = (assetKey) => {
      const targetAssetKey = selectedOption ? getBalanceSourceMaps().translatedToAsset[selectedOption] : null;
      if (targetAssetKey === assetKey) {
        // newValue is already in EUR (pre-converted by caller)
        return Number(newValue) || 0;
      }
      // If value is still a number, it hasn't been user-edited — it's EUR from DB
      if (balanceInputs[assetKey] !== '') {
        return toEUR(parseFormattedAmount(balanceInputs[assetKey]));
      }
      // If value is a string, the user edited the field — it's in display currency
      return Number(balanceBaseValues[assetKey]) || 0;
    };

    return buildAddBalancePayload(date, {
      bank: getValue('bank'),
      cash: getValue('cash'),
      digitalServices: getValue('digitalServices'),
      emergencyFund: getValue('emergencyFund'),
      stocks: getValue('stocks'),
      etf: getValue('etf'),
      bitcoin: getValue('bitcoin'),
      crypto: getValue('crypto'),
      bonds: getValue('bonds'),
      funds: getValue('funds'),
      commodities: getValue('commodities'),
    });
  };

  // Like createBalancesJson but accepts multiple source→newValue overrides at once.
  // This avoids the stale-state bug when updating multiple sources in a loop.
  const createBalancesJsonMulti = (date, overrides) => {
    const { translatedToAsset } = getBalanceSourceMaps();
    const overridesByAsset = {};
    Object.entries(overrides || {}).forEach(([source, value]) => {
      const assetKey = translatedToAsset[source];
      if (assetKey) overridesByAsset[assetKey] = Number(value) || 0;
    });

    const values = {};
    for (const assetKey of ASSET_KEYS) {
      if (overridesByAsset[assetKey] !== undefined) {
        values[assetKey] = overridesByAsset[assetKey];
      } else if (balanceInputs[assetKey] !== '') {
        values[assetKey] = toEUR(parseFormattedAmount(balanceInputs[assetKey]));
      } else {
        values[assetKey] = Number(balanceBaseValues[assetKey]) || 0;
      }
    }
    return buildAddBalancePayload(date, values);
  };

  // Function to convert month/year selection to actual date for DB.
  // Delegates to `getBalanceUserDateForMonth` which guarantees:
  //   - current month  → live `now` timestamp
  //   - past months    → last day at UTC 23:59:59.999 (max possible userDate
  //                      inside that month, so the new snapshot always wins
  //                      the backend's `sort: {userDate: -1, date: -1}`).
  const getBalanceDateForDB = (monthYearObj) => getBalanceUserDateForMonth(monthYearObj);

  // Translated balance-source label → canonical asset key mapping.
  // The camelCase ↔ snake_case mapping lives in `constants/balanceSchema.ts`
  // (ASSET_TO_DB_KEY) — do NOT re-declare it inline anywhere.
  const getBalanceSourceMaps = () => {
    const translatedToAsset = Object.fromEntries(
      getBalanceSourceEntries().map((entry) => [entry.label, entry.assetKey])
    );
    return { translatedToAsset, assetToDbKey: ASSET_TO_DB_KEY };
  };

  /**
   * Check whether an ISO date string (YYYY-MM-DD) belongs to a month strictly
   * before the current month/year. Thin wrapper around the pure util
   * (see src/utils/balanceDeltaLogic.js) for convenience.
   */
  const isPastMonthDate = (isoDate) => isPastMonthDateUtil(isoDate);

  /**
   * Apply deltas to historical balance snapshots. Groups rows by (year, month)
   * and balanceSource, reads each month's snapshot, applies the signed delta,
   * and calls financeService.addBalance sequentially (one request per month).
   *
   * @param {Array<{date: string, amount: number, balanceSource: string}>} rows
   *   Rows whose dates are in past months (already filtered by caller).
   * @param {boolean} isOutflow - subtract (true) or add (false)
   * @returns {Promise<{updated: number, skipped: string[]}>}
   */
  const applyPastMonthBalanceAdjustments = async (rows, isOutflow) => {
    const { translatedToAsset } = getBalanceSourceMaps();
    const result = { updated: 0, skipped: [] };
    if (!rows || rows.length === 0) return result;

    // Group: monthKey → { year, month, perSource: { assetKey: deltaEUR } }
    const groups = new Map();
    for (const row of rows) {
      if (!row?.balanceSource) continue;
      const assetKey = translatedToAsset[row.balanceSource];
      if (!assetKey) continue;
      const d = new Date(row.date);
      if (Number.isNaN(d.getTime())) continue;
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const key = `${year}-${month}`;
      if (!groups.has(key)) groups.set(key, { year, month, perSource: {} });
      const bucket = groups.get(key);
      const amountEUR = toEUR(Number(row.amount) || 0);
      const delta = isOutflow ? -amountEUR : amountEUR;
      bucket.perSource[assetKey] = (bucket.perSource[assetKey] || 0) + delta;
    }

    for (const { year, month, perSource } of groups.values()) {
      const snapshot = getBalanceForMonth(userData, year, month);
      if (!snapshot) {
        const warning = (translations.insert.pastDateBalance?.missingSnapshotWarning || '')
          .replace('{month}', String(month).padStart(2, '0'))
          .replace('{year}', year);
        if (warning) showError(warning, 5000);
        result.skipped.push(`${year}-${month}`);
        continue;
      }
      // Build the POST payload via the centralized helper. This carries over
      // every asset from the snapshot (read by camelCase key, written as
      // snake_case for /balances/add) and applies only the asset deltas we
      // actually want to change, preventing the snake/camel mismatch bug.
      const balanceRequest = buildSnapshotWithDeltas(
        getBalanceDateForDB({ month, year }),
        snapshot.balance,
        perSource,
      );
      try {
        const res = await financeService.addBalance(balanceRequest);
        if (res?.status === 200) result.updated += 1;
        else result.skipped.push(`${year}-${month}`);
      } catch {
        result.skipped.push(`${year}-${month}`);
      }
    }

    return result;
  };

  /**
   * Resolve the past-date balance choice. If pref is 'ask', open the modal and
   * await the user's selection. Otherwise return the stored preference.
   * @returns {Promise<'none' | 'past-month' | null>} null means user cancelled.
   */
  const resolvePastDateChoice = (rows, isOutflow) => {
    if (pastDatePref === PAST_DATE_BALANCE_CHOICES.NONE
      || pastDatePref === PAST_DATE_BALANCE_CHOICES.PAST_MONTH) {
      return Promise.resolve(pastDatePref);
    }
    // 'ask' → open modal
    return new Promise((resolve) => {
      setPastDateModal({
        isOpen: true,
        rows,
        isOutflow,
        onResolve: (choice, remember) => {
          if (remember && choice) setPastDatePref(choice);
          setPastDateModal({ isOpen: false, rows: [], isOutflow: true, onResolve: null });
          resolve(choice);
        },
      });
    });
  };

  /**
   * Apply a signed balance delta (in EUR) on a single balance source for a given
   * date. If the date is in the current month, updates the current snapshot via
   * addBalance using current in-memory values. If the date is in a past month,
   * reads that month's snapshot and writes back the adjusted value.
   *
   * @param {string} isoDate       - ISO date of the transaction month
   * @param {number} deltaEUR      - signed delta to apply on the source (EUR)
   * @param {string} balanceSource - translated label of the source (matches `options` keys)
   * @returns {Promise<boolean>}   - true on success
   */
  const applyBalanceDeltaForDate = async (isoDate, deltaEUR, balanceSource) => {
    if (!balanceSource || !isoDate || !deltaEUR) return false;
    const { translatedToAsset } = getBalanceSourceMaps();
    const assetKey = translatedToAsset[balanceSource];
    if (!assetKey) return false;

    if (!isPastMonthDate(isoDate)) {
      // Current month path — use in-memory values + createBalancesJson.
      const currentVal = parseFloat(options[balanceSource]?.[0]) || 0;
      const newVal = currentVal + deltaEUR;
      const balancesJson = createBalancesJson(currentDate, balanceSource, newVal);
      try {
        const res = await financeService.addBalance(balancesJson);
        if (res?.status === 200) {
          await applyCurrentDetailSourceDelta(balanceSource, deltaEUR);
          return true;
        }
        return false;
      } catch { return false; }
    }

    // Past-month path — load snapshot, adjust, write back using the central
    // helper (handles the camelCase ↔ snake_case conversion correctly).
    const d = new Date(isoDate);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const snapshot = getBalanceForMonth(userData, year, month);
    if (!snapshot) {
      const warning = (translations.insert.pastDateBalance?.missingSnapshotWarning || '')
        .replace('{month}', String(month).padStart(2, '0'))
        .replace('{year}', year);
      if (warning) showError(warning, 5000);
      return false;
    }
    const balanceRequest = buildSnapshotWithDeltas(
      getBalanceDateForDB({ month, year }),
      snapshot.balance,
      { [assetKey]: deltaEUR },
    );
    try {
      const res = await financeService.addBalance(balanceRequest);
      return res?.status === 200;
    } catch { return false; }
  };

  /**
   * Open the edit-confirmation modal and await the user's decision.
   *
   * Resolves to one of:
   *   - { cancelled: true }                  → user dismissed the modal
   *   - { cancelled: false, source: null }   → user chose to save without
   *                                            touching any balance
   *   - { cancelled: false, source: '<label>' } → user picked a balance source
   */
  const openEditConfirmationModal = ({ isOutflow, originalDate, originalAmount, editedDate, editedAmount, initialSource = '' }) => {
    return new Promise((resolve) => {
      setEditModal({
        isOpen: true,
        isOutflow,
        originalDate,
        originalAmount,
        editedDate,
        editedAmount,
        selectedSource: initialSource || '',
        onResolve: (result) => {
          setEditModal((m) => ({ ...m, isOpen: false, onResolve: null }));
          resolve(result);
        },
      });
    });
  };

  const balanceSourceValueMap = {
    bank: [bankValue, setBankValue],
    cash: [cashValue, setCashValue],
    digitalServices: [digitalServicesValue, setDigitalServicesValue],
    emergencyFund: [emergencyFundValue, setEmergencyFundValue],
    stocks: [stocksValue, setStocksValue],
    etf: [etfValue, setETFValue],
    bitcoin: [bitcoinValue, setBitcoinValue],
    crypto: [cryptoValue, setCryptoValue],
    bonds: [bondsValue, setBondsValue],
    funds: [fundsValue, setFundsValue],
    commodities: [commoditiesValue, setCommoditiesValue],
  };

  const options = Object.fromEntries(
    getBalanceSourceEntries().map((entry) => [entry.label, balanceSourceValueMap[entry.assetKey]])
  );

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
        setCommoditiesValue(userData ? getCommoditiesValue(userData) : 0);
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

  /**
   * Sync balance form fields with the snapshot of the selected month.
   *
   * When the user picks a past month in the balance section picker, the form
   * must show that month's historical values (not the current ones), so that
   * a submit writes back a coherent snapshot with only the fields the user
   * actually edited changed. If the selected month is the current one, the
   * fields mirror the live current-month values from userData.
   */
  useEffect(() => {
    if (!userData) return;
    const now = new Date();
    const isCurrent =
      balanceDate.month === now.getMonth() + 1 &&
      balanceDate.year === now.getFullYear();

    if (isCurrent) {
      setBankValue(getBankValue(userData));
      setCashValue(getCashValue(userData));
      setDigitalServicesValue(getDigitalServicesValue(userData));
      setEmergencyFundValue(getEmergencyFund(userData));
      setStocksValue(getStocksValue(userData));
      setETFValue(getEtfValue(userData));
      setBitcoinValue(getBitcoinValue(userData));
      setCryptoValue(getCryptoValue(userData));
      setBondsValue(getBondsValue(userData));
      setFundsValue(getFundsValue(userData));
      setCommoditiesValue(getCommoditiesValue(userData));
      return;
    }

    const snapshot = getBalanceForMonth(userData, balanceDate.year, balanceDate.month);
    const b = snapshot?.balance || {};
    // Map DB keys → state setters. For missing keys we set 0 so the placeholder
    // is still clean (empty input means "keep this 0" on submit).
    setBankValue(Number(b.bank) || 0);
    setCashValue(Number(b.cash) || 0);
    setDigitalServicesValue(Number(b.digitalServices) || 0);
    setEmergencyFundValue(Number(b.emergencyFund) || 0);
    setStocksValue(Number(b.stocks) || 0);
    setETFValue(Number(b.etf) || 0);
    setBitcoinValue(Number(b.bitcoin) || 0);
    setCryptoValue(Number(b.crypto) || 0);
    setBondsValue(Number(b.bonds) || 0);
    setFundsValue(Number(b.funds) || 0);
    setCommoditiesValue(Number(b.commodities) || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balanceDate.month, balanceDate.year, userData]);

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
  const monthsArray = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(currentYear, currentMonth - 1 - i, 1);
    monthsArray.push({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
    });
  }
  // Non serve più reverse() - così il mese corrente sarà all'indice 0

  // Build monthOptions
  const monthOptions = monthsArray.map((obj, idx) => ({
    value: idx,
    label: `${monthNames[obj.month]} ${obj.year}`,
    month: obj.month,
    year: obj.year,
  }));

  const incomeMonthOptions = monthOptions;
  const outflowMonthOptions = monthOptions;

  const currentMonthIdx = monthsArray.findIndex(
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonthIdx]);

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

  const handleBatchOutflowSubmit = async (rows, onProgress) => {
    const BATCH_SIZE = 5;
    let success = 0;
    let failed = 0;
    const total = rows.length;

    for (let i = 0; i < total; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const promises = batch.map(row => {
        const inExJson = createInExJson(
          true,
          row.date,
          parseFormattedAmount(row.amount),
          row.note,
          row.typoKey,
          row.categoryKey,
          row.userCategoryId,
          row.balanceSource,
        );
        return financeService.addExpenseOrIncome(inExJson)
          .then(async (res) => {
            if (res.status !== 200) { failed++; return; }
            success++;
            // Same "make recurring" flag as the single-insert flow: create a
            // template so this row gets re-inserted automatically every month.
            if (row.makeRecurring) {
              const dayOfMonth = Math.min(28, Math.max(1, Number(row.date.split('-')[2]) || 1));
              try {
                await recurringTransactionService.saveRecurring({
                  is_expense: true,
                  amount: inExJson.expense.amount,
                  notes: inExJson.expense.notes,
                  payment_type: inExJson.expense.payment_type,
                  category_tag: inExJson.expense.category_tag,
                  user_category_id: inExJson.expense.user_category_id,
                  day_of_month: dayOfMonth,
                });
              } catch (recurringError) {
                console.error('Failed to create recurring template:', recurringError);
              }
            }
          })
          .catch(() => { failed++; });
      });
      await Promise.all(promises);
      onProgress(Math.min(((i + BATCH_SIZE) / total) * 100, 100));
    }

    // Update balances — group amounts by per-row balance source
    if (success > 0) {
      // Only adjust balance for rows in the current month
      const now = new Date();
      const currentMonthRows = rows.filter(r => {
        const d = new Date(r.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const pastMonthRows = rows.filter(r => {
        const d = new Date(r.date);
        return (d.getFullYear() < now.getFullYear())
          || (d.getFullYear() === now.getFullYear() && d.getMonth() < now.getMonth());
      });
      const amountsBySource = groupAmountsByBalanceSource(currentMonthRows);
      const sources = Object.entries(amountsBySource);

      if (sources.length > 0) {
        try {
          // Build a single balance update with all source changes applied
          const overrides = {};
          for (const [source, totalAmount] of sources) {
            const deltaEUR = -toEUR(totalAmount);
            const currentVal = parseFloat(options[source]?.[0]) || 0;
            overrides[source] = currentVal + deltaEUR;
          }
          const balancesJson = createBalancesJsonMulti(currentDate, overrides);
          const balanceRes = await financeService.addBalance(balancesJson);
          if (balanceRes?.status === 200) {
            for (const [source, totalAmount] of sources) {
              await applyCurrentDetailSourceDelta(source, -toEUR(totalAmount));
            }
          }
        } catch {
          // Balance update failed but outflows were inserted — don't block
        }
      }

      // Past-month rows: prompt user (or use saved preference) to decide
      // whether to also update historical balance snapshots.
      if (pastMonthRows.length > 0) {
        const choice = await resolvePastDateChoice(
          pastMonthRows.map(r => ({
            date: r.date,
            amount: parseFormattedAmount(r.amount),
            balanceSource: r.balanceSource,
          })),
          true,
        );
        if (choice === PAST_DATE_BALANCE_CHOICES.PAST_MONTH) {
          await applyPastMonthBalanceAdjustments(
            pastMonthRows.map(r => ({
              date: r.date,
              amount: parseFormattedAmount(r.amount),
              balanceSource: r.balanceSource,
            })),
            true,
          );
        }
      }
    }

    const t = translations.insert.outflowSection.multiInsert;
    if (failed === 0) {
      showSuccess(t.successAll);
    } else if (success > 0) {
      showError(t.partialSuccess.replace('{success}', success).replace('{total}', total).replace('{failed}', failed));
    } else {
      showError(t.allFailed);
    }

    if (success > 0) {
      handleSetIsUpdated(false);
      fetchData();
    }
    setShowMultiInsert(false);
  };

  const handleBatchIncomeSubmit = async (rows, onProgress) => {
    const BATCH_SIZE = 5;
    let success = 0;
    let failed = 0;
    const total = rows.length;

    for (let i = 0; i < total; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const promises = batch.map(row => {
        const inExJson = createInExJson(
          false,
          row.date,
          parseFormattedAmount(row.amount),
          row.note,
          0,
          row.categoryKey,
          row.userCategoryId,
          row.balanceSource,
        );
        return financeService.addExpenseOrIncome(inExJson)
          .then((res) => { if (res.status === 200) success++; else failed++; })
          .catch(() => { failed++; });
      });
      await Promise.all(promises);
      onProgress(Math.min(((i + BATCH_SIZE) / total) * 100, 100));
    }

    // Update balances — only for rows in the current month
    if (success > 0) {
      const now = new Date();
      const currentMonthRows = rows.filter(r => {
        const d = new Date(r.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const pastMonthRows = rows.filter(r => {
        const d = new Date(r.date);
        return (d.getFullYear() < now.getFullYear())
          || (d.getFullYear() === now.getFullYear() && d.getMonth() < now.getMonth());
      });
      const amountsBySource = groupIncomeAmountsBySource(currentMonthRows);
      const sources = Object.entries(amountsBySource);

      if (sources.length > 0) {
        try {
          const overrides = {};
          for (const [source, totalAmount] of sources) {
            const deltaEUR = toEUR(totalAmount);
            const currentVal = parseFloat(options[source]?.[0]) || 0;
            overrides[source] = currentVal + deltaEUR;
          }
          const balancesJson = createBalancesJsonMulti(currentDate, overrides);
          const balanceRes = await financeService.addBalance(balancesJson);
          if (balanceRes?.status === 200) {
            for (const [source, totalAmount] of sources) {
              await applyCurrentDetailSourceDelta(source, toEUR(totalAmount));
            }
          }
        } catch {
          // Balance update failed but incomes were inserted
        }
      }

      // Past-month income rows: offer to also update historical snapshots.
      if (pastMonthRows.length > 0) {
        const choice = await resolvePastDateChoice(
          pastMonthRows.map(r => ({
            date: r.date,
            amount: parseFormattedAmount(r.amount),
            balanceSource: r.balanceSource,
          })),
          false,
        );
        if (choice === PAST_DATE_BALANCE_CHOICES.PAST_MONTH) {
          await applyPastMonthBalanceAdjustments(
            pastMonthRows.map(r => ({
              date: r.date,
              amount: parseFormattedAmount(r.amount),
              balanceSource: r.balanceSource,
            })),
            false,
          );
        }
      }
    }

    const t = translations.insert.incomeSection.multiInsert;
    if (failed === 0) {
      showSuccess(t.successAll);
    } else if (success > 0) {
      showError(t.partialSuccess.replace('{success}', success).replace('{total}', total).replace('{failed}', failed));
    } else {
      showError(t.allFailed);
    }

    if (success > 0) {
      handleSetIsUpdated(false);
      fetchData();
    }
    setShowMultiIncomeInsert(false);
  };

  const handleBatchBalanceSubmit = async (rows, onProgress) => {
    let success = 0;
    let failed = 0;
    const total = rows.length;

    // DB key mapping
    const assetDbKeys = {
      bank: 'bank',
      cash: 'cash',
      digitalServices: 'digital_services',
      emergencyFund: 'emergency_fund',
      stocks: 'stocks',
      etf: 'etf',
      bitcoin: 'bitcoin',
      crypto: 'crypto',
      bonds: 'bonds',
      funds: 'funds',
      commodities: 'commodities',
    };

    for (let i = 0; i < total; i++) {
      const row = rows[i];
      const dbDate = getBalanceDateForDB({ month: row.month, year: row.year });
      const balance = { date: dbDate };
      for (const key of ASSET_KEYS) {
        const val = parseFormattedAmount(row[key]);
        balance[assetDbKeys[key]] = toEUR(val);
      }

      try {
        const res = await financeService.addBalance({ balance });
        if (res.status === 200) success++;
        else failed++;
      } catch {
        failed++;
      }
      onProgress(Math.min(((i + 1) / total) * 100, 100));
    }

    const t = translations.insert.balanceSection.multiInsert;
    if (failed === 0) {
      showSuccess(t.successAll);
    } else if (success > 0) {
      showError(t.partialSuccess.replace('{success}', success).replace('{total}', total).replace('{failed}', failed));
    } else {
      showError(t.allFailed);
    }

    if (success > 0) {
      handleSetIsUpdated(false);
      fetchData();
      setBalanceDate({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
    }
    setShowMultiBalanceInsert(false);
  };

  /**
   * Resolves the translated source label matching the balance source stored
   * with a transaction at insert time (balanceAssetKey / balanceDetailType /
   * balanceDetailId), so delete/edit can propose the exact field to restore.
   * Falls back from the specific sub-account (it may have been deleted since)
   * to the parent asset field; returns '' when nothing was stored.
   */
  const findSourceLabelForTransaction = (row) => {
    if (!row?.balanceAssetKey) return '';
    const entries = getBalanceSourceEntries();
    if (row.balanceDetailType && row.balanceDetailId != null) {
      const detail = entries.find((entry) =>
        entry.detailType === row.balanceDetailType &&
        entry.detailId === row.balanceDetailId &&
        entry.assetKey === row.balanceAssetKey);
      if (detail) return detail.label;
    }
    const base = entries.find((entry) => !entry.detailType && entry.assetKey === row.balanceAssetKey);
    return base?.label || '';
  };

  const handleDeleteIncome = (date, amount, row = null) => {
    setDeleteIncomeAmount(amount);
    setDeleteIncomeDate(date);
    setDeleteIncomeId(row?.id ?? null);
    const storedLabel = findSourceLabelForTransaction(row);
    setSelectedOption(storedLabel || '');
    setDeleteSourcePrefilled(Boolean(storedLabel));
    setShowConfirmationDeleteIncome(true);
  };

  const handleDeleteOutflow = (date, amount, row = null) => {
    setDeleteOutflowDate(date);
    setDeleteOutflowAmount(amount);
    setDeleteOutflowId(row?.id ?? null);
    const storedLabel = findSourceLabelForTransaction(row);
    setSelectedOption(storedLabel || '');
    setDeleteSourcePrefilled(Boolean(storedLabel));
    setShowConfirmationDeleteOutflow(true);
  };

  // Inline edit save handlers — delete original + insert new, then apply a
  // balance delta if the amount and/or month changed (one source, applied to
  // both old and new month as needed).
  const handleSaveEditOutflow = async (originalAdd, editedValues) => {
    return saveEditTransaction(originalAdd, editedValues, true);
  };

  const handleSaveEditIncome = async (originalAdd, editedValues) => {
    return saveEditTransaction(originalAdd, editedValues, false);
  };

  /**
   * Shared edit flow for both outflow and income. Detects whether the edit
   * changed the amount or the transaction's month and, if so, asks the user
   * to pick a balance source before performing delete+insert and applying the
   * corresponding deltas to the affected months.
   */
  const saveEditTransaction = async (originalAdd, editedValues, isOutflow) => {
    const oldDate = originalAdd.date ? new Date(originalAdd.date).toISOString().split('T')[0] : '';
    const newDate = editedValues.date;
    const oldAmountEUR = Number(originalAdd.amount) || 0;
    const newAmountEUR = toEUR(Number(editedValues.amount) || 0);
    const amountChanged = Math.abs(oldAmountEUR - newAmountEUR) > 0.005;
    const sameMonth = (() => {
      if (!oldDate || !newDate) return true;
      const a = new Date(oldDate), b = new Date(newDate);
      if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return true;
      return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
    })();
    const needsBalanceUpdate = amountChanged || !sameMonth;

    // 1. Ask for balance source if the edit impacts balances (recommended but optional).
    let balanceSource = null;
    if (needsBalanceUpdate) {
      const result = await openEditConfirmationModal({
        isOutflow,
        originalDate: oldDate,
        originalAmount: oldAmountEUR,
        editedDate: newDate,
        editedAmount: newAmountEUR,
        initialSource: findSourceLabelForTransaction(originalAdd),
      });
      if (!result || result.cancelled) return false; // user dismissed the modal
      balanceSource = result.source; // null means: save edit, don't touch balances
    }

    const sectionKey = isOutflow ? 'outflowSection' : 'incomeSection';
    try {
      // 2. Delete original.
      const deleteResult = await financeService.deleteExpenseOrIncome({
        expense: {
          id: originalAdd.id ?? undefined,
          date: originalAdd.date,
          amount: oldAmountEUR,
          is_expense: isOutflow,
        },
      });
      if (deleteResult.status !== 200) {
        showError(translations.insert[sectionKey].editFailed);
        return false;
      }

      // 3. Insert edited. Keep the source chosen in the edit modal, or carry
      // over the source stored with the original transaction when the edit
      // didn't ask for one (no balance impact).
      const inExJson = createInExJson(
        isOutflow,
        editedValues.date,
        editedValues.amount,
        editedValues.note,
        isOutflow ? editedValues.typologyKey : 0,
        editedValues.categoryKey,
        editedValues.userCategoryId ?? null,
        balanceSource,
      );
      if (!inExJson.expense.balance_source && originalAdd?.balanceAssetKey) {
        inExJson.expense.balance_source = {
          asset_key: originalAdd.balanceAssetKey,
          detail_type: originalAdd.balanceDetailType ?? null,
          detail_id: originalAdd.balanceDetailId ?? null,
        };
      }
      const insertResult = await financeService.addExpenseOrIncome(inExJson);
      if (insertResult.status !== 200) {
        showError(translations.insert[sectionKey].editFailed);
        return false;
      }

      // 4. Apply balance deltas if needed.
      if (needsBalanceUpdate && balanceSource) {
        // Reversing the old transaction on the OLD month:
        //   outflow → +oldAmount   income → -oldAmount
        // Applying the new transaction on the NEW month:
        //   outflow → -newAmount   income → +newAmount
        const oldSign = isOutflow ? +1 : -1;
        const newSign = isOutflow ? -1 : +1;
        if (sameMonth) {
          const net = oldSign * oldAmountEUR + newSign * newAmountEUR;
          if (Math.abs(net) > 0.005) {
            await applyBalanceDeltaForDate(newDate, net, balanceSource);
          }
        } else {
          await applyBalanceDeltaForDate(oldDate, oldSign * oldAmountEUR, balanceSource);
          await applyBalanceDeltaForDate(newDate, newSign * newAmountEUR, balanceSource);
        }
      }

      handleSetIsUpdated(false);
      showSuccess(translations.insert[sectionKey].successEdit);
      fetchData();
      return true;
    } catch (error) {
      console.error(`Error saving inline edit (${isOutflow ? 'outflow' : 'income'}):`, error);
      showError(translations.insert[sectionKey].editFailed);
      return false;
    }
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
        resetBalanceInputs();
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

  // Canonical balance-source payload for a translated source label (or null).
  // Persisted with the transaction so delete/edit can later propose the exact
  // balance field (and sub-account) to restore, in any UI language.
  const buildBalanceSourcePayload = (balanceSourceLabel) => {
    if (!balanceSourceLabel) return null;
    const meta = getBalanceSourceMeta()[balanceSourceLabel];
    if (!meta?.assetKey) return null;
    return {
      asset_key: meta.assetKey,
      detail_type: meta.detailType ?? null,
      detail_id: meta.detailId ?? null,
    };
  };

  const createInExJson = (isOutflow, date, amount, notes, payment_type, category_tag, user_category_id = null, balanceSourceLabel = null) => {
    const numericAmount = Number(amount) || 0;
    return {
      expense: {
        date: date,
        amount: toEUR(numericAmount),
        is_expense: isOutflow,
        payment_type: payment_type,
        category_tag: category_tag,
        user_category_id: user_category_id,
        notes: notes,
        balance_source: buildBalanceSourcePayload(balanceSourceLabel),
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
        categoryOutflow.userCategoryId ?? null,
        selectedOption,
      );
      // Only reset note and value - keep category, typology, date and balance source for quick re-entry
      setNoteOutflowAreaValue("");
      setOutflow("");
    } else {
      inExJson = createInExJson(
        false,
        incomeDate,
        income,
        noteIncomeAreaValue,
        0,
        categoryIncome.key,
        categoryIncome.userCategoryId ?? null,
        selectedOption,
      );
      // Only reset note and value - keep category, date and balance destination for quick re-entry
      setNoteIncomeAreaValue("");
      setIncome("");
    }
    try {
      const inExAdd = await financeService.addExpenseOrIncome(inExJson);
      if (inExAdd.status === 200) {
        // If the user checked "make recurring" (see OutflowSection's
        // subscription/periodic-payment auto-flag), also create a template so
        // this transaction gets re-inserted automatically every month. Day of
        // month is read from the "YYYY-MM-DD" string directly, NOT via
        // `new Date(...).getDate()` (UTC-midnight/local-timezone bug).
        if (isOutflow && makeOutflowRecurring) {
          const dayOfMonth = Math.min(28, Math.max(1, Number(outflowDate.split('-')[2]) || 1));
          try {
            await recurringTransactionService.saveRecurring({
              is_expense: true,
              amount: inExJson.expense.amount,
              notes: inExJson.expense.notes,
              payment_type: inExJson.expense.payment_type,
              category_tag: inExJson.expense.category_tag,
              user_category_id: inExJson.expense.user_category_id,
              day_of_month: dayOfMonth,
            });
          } catch (recurringError) {
            console.error('Failed to create recurring template:', recurringError);
          }
          setMakeOutflowRecurring(false);
        }

        // Controllo limite di spesa mensile DOPO l'inserimento riuscito (solo per le spese)
        if (isOutflow && userData?.limits?.notificationsEnabled && userData?.limits?.monthlySpendingLimit) {
          // L'indice 0 corrisponde al mese corrente nell'array outflowsArray
          const currentOutflowsThisMonth = getOutflowsArray(userData)?.[0] || 0;
          const newTotal = addCurrency(currentOutflowsThisMonth, parseFloat(originalOutflowAmount.replace(',', '.')));

          if (newTotal > userData.limits.monthlySpendingLimit) {
            const exceeding = roundCurrency(newTotal - userData.limits.monthlySpendingLimit);
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
          const valueBalanceSelected = parseFloat(options[selectedOption]?.[0]) || 0;
          const outflowNumber = toEUR(parseFloat(originalOutflowAmount) || 0);
          const incomeNumber = toEUR(parseFloat(originalIncomeAmount) || 0);
          const txDate = isOutflow ? outflowDate : incomeDate;
          const isPast = isPastMonthDate(txDate);

          if (isPast) {
            // Past-month insert: respect user preference (ask/none/past-month).
            const row = {
              date: txDate,
              amount: isOutflow ? (parseFloat(originalOutflowAmount) || 0) : (parseFloat(originalIncomeAmount) || 0),
              balanceSource: selectedOption,
            };
            const choice = await resolvePastDateChoice([row], isOutflow);
            if (choice === PAST_DATE_BALANCE_CHOICES.PAST_MONTH) {
              const adj = await applyPastMonthBalanceAdjustments([row], isOutflow);
              handleSetIsUpdated(false);
              if (adj.updated > 0) setUpdateInExBalanceSuccess(true);
              else if (isOutflow) setUpdateOutflowsSuccess(true);
              else setUpdateIncomesSuccess(true);
              fetchData();
            } else {
              // 'none' or cancelled → record transaction only, no balance change
              handleSetIsUpdated(false);
              if (isOutflow) setUpdateOutflowsSuccess(true);
              else setUpdateIncomesSuccess(true);
              fetchData();
            }
          } else {
            // Current month: existing behaviour (update current-month balance)
            let newValue = 0;
            if (isOutflow) newValue = valueBalanceSelected - outflowNumber;
            else newValue = valueBalanceSelected + incomeNumber;

            const balancesJson = createBalancesJson(currentDate, selectedOption, newValue);

            const balancesChange = await financeService.addBalance(balancesJson);

            if (balancesChange.status === 200) {
              await applyCurrentDetailSourceDelta(selectedOption, isOutflow ? -outflowNumber : incomeNumber);
              handleSetIsUpdated(false);
              setBalanceDate({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
              setUpdateInExBalanceSuccess(true);
              fetchData();
            } else {
              showError(translations.insert.errors.balanceUpdateFailed);
            }
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
        id: deleteIncomeId ?? undefined,
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
          if (isPastMonthDate(deleteIncomeDate)) {
            // Past-month transaction → adjust historical snapshot.
            // Deleting an income REMOVES money from the chosen balance → same
            // sign as inserting an outflow (isOutflow=true).
            await applyPastMonthBalanceAdjustments(
              [{
                date: deleteIncomeDate,
                amount: Number(deleteIncomeAmount) || 0,
                balanceSource: selectedOption,
              }],
              true,
            );
          } else {
            // Current-month path (unchanged)
            const valueBalanceSelected = parseFloat(options[selectedOption]?.[0]) || 0;
            const incomeNumber = toEUR(parseFloat(deleteIncomeAmount) || 0);
            const newValue = valueBalanceSelected - incomeNumber;
            const balancesJson = createBalancesJson(currentDate, selectedOption, newValue);
            const balanceRes = await financeService.addBalance(balancesJson);
            if (balanceRes?.status === 200) {
              await applyCurrentDetailSourceDelta(selectedOption, -incomeNumber);
            }
          }
        }
        handleSetIsUpdated(false);
        setDeleteIncomesSuccess(true);
        setSelectedOption("");
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
        id: deleteOutflowId ?? undefined,
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
          if (isPastMonthDate(deleteOutflowDate)) {
            // Past-month transaction → adjust historical snapshot.
            // Deleting an outflow RESTORES money to the chosen balance → same
            // sign as inserting an income (isOutflow=false).
            await applyPastMonthBalanceAdjustments(
              [{
                date: deleteOutflowDate,
                amount: Number(deleteOutflowAmount) || 0,
                balanceSource: selectedOption,
              }],
              false,
            );
          } else {
            // Current-month path (unchanged)
            const valueBalanceSelected = parseFloat(options[selectedOption]?.[0]) || 0;
            const outflowNumber = toEUR(parseFloat(deleteOutflowAmount) || 0);
            const newValue = valueBalanceSelected + outflowNumber;
            const balancesJson = createBalancesJson(currentDate, selectedOption, newValue);
            const balanceRes = await financeService.addBalance(balancesJson);
            if (balanceRes?.status === 200) {
              await applyCurrentDetailSourceDelta(selectedOption, outflowNumber);
            }
          }
        }
        handleSetIsUpdated(false);
        setDeleteOutflowsSuccess(true);
        setSelectedOption("");
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
            bankValue={balanceInputs.bank}
            setBankValue={setBalanceInputValue('bank')}
            cashValue={balanceInputs.cash}
            setCashValue={setBalanceInputValue('cash')}
            digitalServicesValue={balanceInputs.digitalServices}
            setDigitalServicesValue={setBalanceInputValue('digitalServices')}
            emergencyFund={balanceInputs.emergencyFund}
            setEmergencyFund={setBalanceInputValue('emergencyFund')}
            stocksValue={balanceInputs.stocks}
            setStocksValue={setBalanceInputValue('stocks')}
            etfValue={balanceInputs.etf}
            setETFValue={setBalanceInputValue('etf')}
            bitcoinValue={balanceInputs.bitcoin}
            setBitcoinValue={setBalanceInputValue('bitcoin')}
            cryptoValue={balanceInputs.crypto}
            setCryptoValue={setBalanceInputValue('crypto')}
            bondsValue={balanceInputs.bonds}
            setBondsValue={setBalanceInputValue('bonds')}
            fundsValue={balanceInputs.funds}
            setFundsValue={setBalanceInputValue('funds')}
            commoditiesValue={balanceInputs.commodities}
            setCommoditiesValue={setBalanceInputValue('commodities')}
            balanceDate={balanceDate}
            setBalanceDate={setBalanceDate}
            balancePlaceholders={balanceBaseValues}
            onUpdateBalance={handleUpdateBalance}
            onOpenMultiInsert={() => setShowMultiBalanceInsert(true)}
            language={language}
            translations={translations}
            investmentHoldings={investmentHoldings}
            onHoldingsChanged={async () => { await refreshInvestmentHoldings(); await refreshInvestmentHoldingHistory(); }}
            liquidityAccounts={liquidityAccounts}
            onLiquidityAccountsChanged={async () => { await refreshLiquidityAccounts(); await refreshLiquidityAccountHistory(); }}
            onAssetBaseValueChange={handleAssetBaseValueOverride}
            investmentHoldingHistory={investmentHoldingHistory}
            liquidityAccountHistory={liquidityAccountHistory}
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
            customCategories={getCustomCategories(userData)}
            onCreateCategory={(parentIndex, label) => addCustomCategory({ label, parent_index: parentIndex, is_expense: false })}
            selectedIncomesMonth={selectedIncomesMonth}
            setSelectedIncomesMonth={setSelectedIncomesMonth}
            incomeMonthOptions={incomeMonthOptions}
            allIncomesAdds={allIncomesAdds}
            flatIncomesForRange={flatIncomesForRange}
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
            onSaveEdit={handleSaveEditIncome}
            onOpenMultiInsert={() => setShowMultiIncomeInsert(true)}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            balanceOptions={options}
            balanceSourceMeta={getBalanceSourceMeta()}
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
            customCategories={getCustomCategories(userData)}
            onCreateCategory={(parentIndex, label) => addCustomCategory({ label, parent_index: parentIndex, is_expense: true })}
            selectedOutflowsMonth={selectedOutflowsMonth}
            setSelectedOutflowsMonth={setSelectedOutflowsMonth}
            outflowMonthOptions={outflowMonthOptions}
            allOutflowsAdds={allOutflowsAdds}
            flatOutflowsForRange={flatOutflowsForRange}
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
            onSaveEdit={handleSaveEditOutflow}
            onOpenMultiInsert={() => setShowMultiInsert(true)}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            balanceOptions={options}
            balanceSourceMeta={getBalanceSourceMeta()}
            makeRecurring={makeOutflowRecurring}
            setMakeRecurring={setMakeOutflowRecurring}
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
          
          {/* Import + recurring buttons — desktop: inline next to tabs */}
          {activePage !== "bilancio" && (
            <>
              <ImportLink
                theme={theme}
                onClick={() => setShowImportWizard(true)}
                data-umami-event="insert-import-csv-open"
              >
                <UploadFileIcon />
                {translations.insert.importFromFile || 'CSV / Excel'}
              </ImportLink>
              <ImportLink
                theme={theme}
                onClick={() => { setShowRecurringPanel(true); refreshRecurringItems(); }}
                data-umami-event="insert-recurring-open"
              >
                <RepeatIcon />
                {translations.recurringTransactions?.navLabel || 'Ricorrenti'}
              </ImportLink>
            </>
          )}
        </TabBar>

        {/* Import + recurring buttons — mobile: full-width below tabs */}
        {activePage !== "bilancio" && (
          <>
            <ImportLinkMobile
              theme={theme}
              onClick={() => setShowImportWizard(true)}
              data-umami-event="insert-import-csv-open-mobile"
            >
              <UploadFileIcon />
              {translations.insert.importFromFile || (language === 'it' ? 'Importa da CSV / Excel' : 'Import from CSV / Excel')}
            </ImportLinkMobile>
            <ImportLinkMobile
              theme={theme}
              onClick={() => { setShowRecurringPanel(true); refreshRecurringItems(); }}
              data-umami-event="insert-recurring-open-mobile"
            >
              <RepeatIcon />
              {translations.recurringTransactions?.navLabel || 'Ricorrenti'}
            </ImportLinkMobile>
          </>
        )}

        {renderPage()}

        {/* Multi-insert Outflow Modal */}
        {showMultiInsert && (
          <Suspense fallback={null}>
            <MultiOutflowInsert
              theme={theme}
              OutflowsTags={OutflowsTags}
              paymentTags={paymentTags}
              balanceOptions={options}
              balanceSourceMeta={getBalanceSourceMeta()}
              customCategories={getCustomCategories(userData)}
              onCreateCategory={(parentIndex, label) => addCustomCategory({ label, parent_index: parentIndex, is_expense: true })}
              onSubmitBatch={handleBatchOutflowSubmit}
              onClose={() => setShowMultiInsert(false)}
              initialRow={{
                categoryKey: categoryOutflow?.key || '',
                categoryValue: categoryOutflow?.parentValue || categoryOutflow?.value || '',
                userCategoryId: categoryOutflow?.userCategoryId ?? null,
                userCategoryLabel: categoryOutflow?.userCategoryLabel || null,
                typoKey: typoOutflow?.key || '',
                typoValue: typoOutflow?.value || '',
                amount: outflow || '',
                date: outflowDate || currentDate,
                note: noteOutflowAreaValue || '',
                balanceSource: selectedOption || '',
              }}
            />
          </Suspense>
        )}

        {/* Multi-insert Income Modal */}
        {showMultiIncomeInsert && (
          <Suspense fallback={null}>
            <MultiIncomeInsert
              theme={theme}
              incomesTags={incomesTags}
              balanceOptions={options}
              balanceSourceMeta={getBalanceSourceMeta()}
              customCategories={getCustomCategories(userData)}
              onCreateCategory={(parentIndex, label) => addCustomCategory({ label, parent_index: parentIndex, is_expense: false })}
              onSubmitBatch={handleBatchIncomeSubmit}
              onClose={() => setShowMultiIncomeInsert(false)}
              initialRow={{
                categoryKey: categoryIncome?.key || '',
                categoryValue: categoryIncome?.parentValue || categoryIncome?.value || '',
                userCategoryId: categoryIncome?.userCategoryId ?? null,
                userCategoryLabel: categoryIncome?.userCategoryLabel || null,
                amount: income || '',
                date: incomeDate || currentDate,
                note: noteIncomeAreaValue || '',
                balanceSource: selectedOption || '',
              }}
            />
          </Suspense>
        )}

        {/* Multi-insert Balance Modal */}
        {showMultiBalanceInsert && (
          <Suspense fallback={null}>
            <MultiBalanceInsert
              theme={theme}
              onSubmitBatch={handleBatchBalanceSubmit}
              onClose={() => setShowMultiBalanceInsert(false)}
            />
          </Suspense>
        )}

        {/* Recurring transactions panel */}
        {showRecurringPanel && (
          <Suspense fallback={null}>
            <RecurringTransactionsPanel
              theme={theme}
              items={recurringItems}
              outflowsTags={OutflowsTags}
              incomesTags={incomesTags}
              paymentTags={paymentTags}
              customCategories={getCustomCategories(userData)}
              onCreateCategory={(parentIndex, label, isExpense) => addCustomCategory({
                label,
                parent_index: parentIndex,
                is_expense: isExpense,
              })}
              onClose={() => setShowRecurringPanel(false)}
              onChanged={refreshRecurringItems}
            />
          </Suspense>
        )}

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
          showConfirmationDeleteIncome={showConfirmationDeleteIncome}
          setShowConfirmationDeleteIncome={setShowConfirmationDeleteIncome}
          showConfirmationDeleteOutflow={showConfirmationDeleteOutflow}
          setShowConfirmationDeleteOutflow={setShowConfirmationDeleteOutflow}
          balanceDate={balanceDate}
          bankValue={getBalanceFieldValue('bank')}
          cashValue={getBalanceFieldValue('cash')}
          digitalServicesValue={getBalanceFieldValue('digitalServices')}
          emergencyFundValue={getBalanceFieldValue('emergencyFund')}
          stocksValue={getBalanceFieldValue('stocks')}
          etfValue={getBalanceFieldValue('etf')}
          bitcoinValue={getBalanceFieldValue('bitcoin')}
          cryptoValue={getBalanceFieldValue('crypto')}
          bondsValue={getBalanceFieldValue('bonds')}
          fundsValue={getBalanceFieldValue('funds')}
          commoditiesValue={getBalanceFieldValue('commodities')}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          options={options}
          onConfirmBalance={handleConfirmBalance}
          onConfirmDeleteIncome={handleIncomesDelete}
          onConfirmDeleteOutflow={handleOutflowsDelete}
          deleteIncomeDate={deleteIncomeDate}
          deleteIncomeAmount={deleteIncomeAmount}
          deleteOutflowDate={deleteOutflowDate}
          deleteOutflowAmount={deleteOutflowAmount}
          balanceSourceMeta={getBalanceSourceMeta()}
          deleteSourcePrefilled={deleteSourcePrefilled}
          investmentHoldings={investmentHoldings}
          liquidityAccounts={liquidityAccounts}
        />

        {pastDateModal.isOpen && (
          <Suspense fallback={null}>
            <PastDateBalanceChoiceModal
              isOpen={pastDateModal.isOpen}
              theme={theme}
              isOutflow={pastDateModal.isOutflow}
              rows={pastDateModal.rows}
              onConfirm={(choice, remember) => {
                pastDateModal.onResolve?.(choice, remember);
              }}
              onCancel={() => {
                // Treat cancel as "none" so transactions remain inserted without balance change
                pastDateModal.onResolve?.(PAST_DATE_BALANCE_CHOICES.NONE, false);
              }}
            />
          </Suspense>
        )}

        {editModal.isOpen && (
          <Suspense fallback={null}>
            <EditTransactionModal
              isOpen={editModal.isOpen}
              theme={theme}
              isOutflow={editModal.isOutflow}
              originalDate={editModal.originalDate}
              originalAmount={editModal.originalAmount}
              editedDate={editModal.editedDate}
              editedAmount={editModal.editedAmount}
              balanceOptions={options}
              balanceSourceMeta={getBalanceSourceMeta()}
              selectedSource={editModal.selectedSource}
              onChangeSelectedSource={(src) =>
                setEditModal((m) => ({ ...m, selectedSource: src }))
              }
              onConfirm={(resolvedSource) =>
                editModal.onResolve?.({ cancelled: false, source: resolvedSource ?? null })
              }
              onCancel={() => editModal.onResolve?.({ cancelled: true })}
            />
          </Suspense>
        )}

        <BottomSpacer />
      </ContentWrapper>
    </PageContainer>
  );
}
