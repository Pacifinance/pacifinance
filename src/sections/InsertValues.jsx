import React, { useEffect, useState } from "react";
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

const currentDate = new Date().toISOString().split("T")[0];

export default function InsertValue({
  theme,
  userData,
  handleSetIsUpdated,
  isHidden,
}) {
  const { language } = React.useContext(LanguageContext);
  const { showSuccess } = useToast();

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
  const [activePage, setActivePage] = useState("bilancio");
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
        setStocksReal(userData ? userData.stocksReal : 0);
        setETFReal(userData ? userData.etfReal : 0);
        setBitcoinReal(userData ? userData.bitcoinReal : 0);
        setCryptoReal(userData ? userData.cryptoReal : 0);
        setBankReal(userData ? userData.bankReal : 0);
        setCashReal(userData ? userData.cashReal : 0);
        setDigitalServicesReal(userData ? userData.digitalServicesReal : 0);
        setOutflowsTags(userData ? userData.expensesTags : []);
        setIncomesTags(userData ? userData.incomesTags : []);
        setPaymentTags(userData ? userData.paymentTags : []);
        setAllOutflowsAdds(userData ? userData.allExpenses : []);
        setAllIncomesAdds(userData ? userData.allIncomes : []);
      } catch (error) {
        console.error("Error: ", error);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [userData]);

  // Auto-hide success notifications with toast
  useEffect(() => {
    if (updateBalanceSuccess) {
      showSuccess(languages[language].insert.balanceSection.successUpdate);
      const timer = setTimeout(() => {
        setUpdateBalanceSuccess(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [updateBalanceSuccess, language, showSuccess]);

  useEffect(() => {
    if (updateInExBalanceSuccess) {
      showSuccess(languages[language].insert.balanceSection.successFullUpdate);
      const timer = setTimeout(() => {
        setUpdateInExBalanceSuccess(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [updateInExBalanceSuccess, language, showSuccess]);

  useEffect(() => {
    if (updateIncomesSuccess) {
      showSuccess(languages[language].insert.incomeSection.successUpdate);
      const timer = setTimeout(() => {
        setUpdateIncomesSuccess(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [updateIncomesSuccess, language, showSuccess]);

  useEffect(() => {
    if (updateOutflowsSuccess) {
      showSuccess(languages[language].insert.outflowSection.successUpdate);
      const timer = setTimeout(() => {
        setUpdateOutflowsSuccess(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [updateOutflowsSuccess, language, showSuccess]);

  useEffect(() => {
    if (deleteIncomesSuccess) {
      showSuccess(languages[language].insert.incomeSection.successDelete);
      const timer = setTimeout(() => {
        setDeleteIncomesSuccess(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [deleteIncomesSuccess, language, showSuccess]);

  useEffect(() => {
    if (deleteOutflowsSuccess) {
      showSuccess(languages[language].insert.outflowSection.successDelete);
      const timer = setTimeout(() => {
        setDeleteOutflowsSuccess(false);
      }, 100);
      return () => clearTimeout(timer);
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

  // Build the last 12 months (including current)
  let monthsArray = [];
  for (let i = 0; i < 12; i++) {
    let d = new Date(currentYear, currentMonth - 1 - i, 1);
    monthsArray.push({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
    });
  }
  monthsArray.reverse(); // so oldest first, newest last

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
        setSelectedIncomesMonth(monthOptions.length - 1);
        setSelectedOutflowsMonth(monthOptions.length - 1);
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
      alert("Select a category");
      return;
    } else if (Number(income) === 0 || income === "" || income === undefined) {
      alert("Insert a valid value greater than 0");
      return;
    }
    setIsConfirmIncomeOpen(true);
  };

  const handleAddOutflow = () => {
    if (categoryOutflow.value === "") {
      alert("Select a category");
      return;
    } else if (typoOutflow.value === "") {
      alert("Select a payment type");
      return;
    } else if (Number(outflow) === 0 || outflow === "" || outflow === undefined) {
      alert("Insert a valid value greater than 0");
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
    const balancesJson = {
      balance: {
        date: balanceDate,
        bank: bankReal,
        cash: cashReal,
        digital_services: digitalServicesReal,
        stocks: {
          real: stocksReal,
        },
        etf: {
          real: etfReal,
        },
        bitcoin: {
          real: bitcoinReal,
        },
        crypto: {
          real: cryptoReal,
        },
      },
    };

    const balancesChange = await axios.post("/balances/add", balancesJson, {
      withCredentials: true,
    });
    if (balancesChange.status === 200) {
      handleSetIsUpdated(false);
      setUpdateBalanceSuccess(true);
      fetchData();
      setBalanceDate(currentDate);
    } else {
      alert("Errore in the update of the balance");
    }
  };

  const createInExJson = (isOutflow, date, amount, notes, payment_type, category_tag) => {
    return {
      expense: {
        date: date,
        amount: amount,
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
      };
      if (inExAdd.status === 200) {
        if (selectedOption !== "") {
          const valueBalanceSelected = parseFloat(balanceOptions[selectedOption]);
          const outflowNumber = parseFloat(outflow);
          const incomeNumber = parseFloat(income);
          let newValue = 0;
          if (isOutflow) newValue = valueBalanceSelected - outflowNumber;
          else newValue = valueBalanceSelected + incomeNumber;

          const balancesJson = {
            balance: {
              date: balanceDate,
              bank: selectedOption.includes(languages[language].assets.bank)
                ? newValue
                : bankReal,
              cash: selectedOption.includes(languages[language].assets.cash)
                ? newValue
                : cashReal,
              digital_services: selectedOption.includes(
                languages[language].assets.digitalServices,
              )
                ? newValue
                : digitalServicesReal,
              stocks: {
                real: selectedOption.includes(languages[language].assets.stocks)
                  ? newValue
                  : stocksReal,
              },
              etf: {
                real: selectedOption.includes(languages[language].assets.etf)
                  ? newValue
                  : etfReal,
              },
              bitcoin: {
                real: selectedOption.includes(
                  languages[language].assets.bitcoin,
                )
                  ? newValue
                  : bitcoinReal,
              },
              crypto: {
                real: selectedOption.includes(languages[language].assets.crypto)
                  ? newValue
                  : cryptoReal,
              },
            },
          };

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
            alert("Error in the update of the balance");
          }
        } else {
          handleSetIsUpdated(false);
          if (isOutflow) setUpdateOutflowsSuccess(true);
          else setUpdateIncomesSuccess(true);
          fetchData();
        }
      } else {
        alert("Error in the update of the outflow");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleIncomesDelete = async () => {
    const data = {
      expense: {
        date: deleteIncomeDate,
        amount: deleteIncomeAmount,
        is_expense: false,
      },
    };
    const incomesDelete = await axios.post("/expenses/delete", data, {
      withCredentials: true,
    });

    if (incomesDelete.status === 200) {
      handleSetIsUpdated(false);
      setDeleteIncomesSuccess(true);
      fetchData();
    } else {
      alert("Error in the update of the income");
    }
    setShowConfirmationDeleteIncome(false);
  };

  const handleOutflowsDelete = async () => {
    const data = {
      expense: {
        date: deleteOutflowDate,
        amount: deleteOutflowAmount,
        is_expense: true,
      },
    };
    const outflowsDelete = await axios.post("/expenses/delete", data, {
      withCredentials: true,
    });

    if (outflowsDelete.status === 200) {
      handleSetIsUpdated(false);
      setDeleteOutflowsSuccess(true);
      fetchData();
    } else {
      alert("Error in the update of the outflow");
    }
    setShowConfirmationDeleteOutflow(false);
  };

  const renderPage = () => {
    if (activePage === "bilancio") {
      return (
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
          balanceDate={balanceDate}
          setBalanceDate={setBalanceDate}
          onUpdateBalance={handleUpdateBalance}
        />
      );
    } else if (activePage === "income") {
      return (
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
      );
    } else if (activePage === "outflows") {
      return (
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
      );
    }
  };

  return (
    <StyledSection theme={theme}>
      <StandardPageTitle theme={theme}>
        {languages[language].insert.title}
      </StandardPageTitle>
      <div style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "2rem"
      }}>
        <ButtonGroup aria-label="outlined primary button group">
          <MySectionButton
            theme={theme}
            onClick={() => setActivePage("bilancio")}
            style={{
              backgroundColor: activePage === "bilancio" ? "" : "#222831",
              marginRight: "1vw",
            }}
          >
            {languages[language].insert.buttonBalance}
          </MySectionButton>
          <MySectionButton
            theme={theme}
            onClick={() => setActivePage("income")}
            style={{
              backgroundColor: activePage === "income" ? "" : "#222831",
              marginRight: "1vw",
            }}
          >
            {languages[language].insert.buttonIncome}
          </MySectionButton>
          <MySectionButton
            theme={theme}
            onClick={() => setActivePage("outflows")}
            style={{
              backgroundColor: activePage === "outflows" ? "" : "#222831",
              marginRight: "1vw",
            }}
          >
            {languages[language].insert.buttonOutflow}
          </MySectionButton>
        </ButtonGroup>
      </div>

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
    </StyledSection>
  );
}