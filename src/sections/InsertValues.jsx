import React, { useEffect, useState } from "react";
import { ButtonGroup, Select, MenuItem } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faSearch,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
// import Checkbox from '@material-ui/core/Checkbox';
import Typography from "@mui/material/Typography";
import axios from "axios";
import languages from "../data/languages.json";
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
  StyledTextArea,
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
} from "../styles/MyStyled";
import {
  incomeCategoryColors,
  outflowCategoryColors,
} from "../data/categoryColors";
// import { set } from "mongoose";

const currentDate = new Date().toISOString().split("T")[0];

// const handleBalanceDateChange = (setBalanceDate, event) => {
//   setBalanceDate(event.target.value);
// };

// const handleIncomeDateChange = (setIncomeDate, event) => {
//   setIncomeDate(event.target.value);
// };

// const handleOutflowDateChange = (setOutflowDate, event) => {
//   setOutflowDate(event.target.value);
// };

const handleChangeBalance = async (setIsConfirmBalanceOpen) => {
  setIsConfirmBalanceOpen(true);
};

const handleInputChange = (e, setterFunction) => {
  let cleanedValue = e.target.value
    .replace(/,/g, ".") // Substitute commas with dots
    .replace(/[^\d.]/g, ""); // Remove all non-numeric characters except dots

  // Remove extra dots
  const dotIndex = cleanedValue.indexOf(".");
  if (dotIndex !== -1) {
    cleanedValue =
      cleanedValue.substring(0, dotIndex + 1) +
      cleanedValue.substring(dotIndex + 1).replace(/\./g, "");
  }

  // Add leading zero if starts with a dot
  if (cleanedValue.startsWith(".")) {
    cleanedValue = "0" + cleanedValue;
  }

  cleanedValue = cleanedValue.toLocaleString("it-IT", {
    minimumFractionDigits: 2,
  }); //doesn't work

  setterFunction(cleanedValue);
};

const handleInputBlur = (e, setterFunction) => {
  const cleanedValue = e.target.value
    .replace(/,/g, ".") // Substitute commas with dots
    .replace(/[^\d.]/g, "") // Remove all non-numeric characters except dots
    .replace(/^0+(\d)/, "$1"); // Remove leading zeros
  const cleanedFinalValue = Number(cleanedValue).toLocaleString("it-IT", {
    minimumFractionDigits: 2,
  });
  if (!isNaN(cleanedFinalValue)) setterFunction(cleanedFinalValue);
};

const handleAddIncome = async (
  setIsConfirmIncomeOpen,
  categoryIncome,
  income,
) => {
  // Check if the user has entered a non-empty value and selected a category
  if (categoryIncome.value === "") {
    alert("Select a category");
    return; // Exit the function without further execution
  } else if (Number(income) === 0 || income === "" || income === undefined) {
    alert("Insert a valid value greater than 0");
    return;
  }

  setIsConfirmIncomeOpen(true);
};

const handleExitConfirm = async (setModalState) => {
  setModalState(false);
};

export default function InsertValue({
  theme,
  userData,
  handleSetIsUpdated,
  isHidden,
}) {
  const { language } = React.useContext(LanguageContext);
  const [isConfirmBalanceOpen, setIsConfirmBalanceOpen] = useState(false);
  const [isConfirmIncomeOpen, setIsConfirmIncomeOpen] = useState(false);
  const [isConfirmOutflowOpen, setIsConfirmOutflowOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [updateBalanceSuccess, setUpdateBalanceSuccess] = useState(false);
  const [updateInExBalanceSuccess, setUpdateInExBalanceSuccess] =
    useState(false);
  const [updateIncomesSuccess, setUpdateIncomesSuccess] = useState(false);
  const [updateOutflowsSuccess, setUpdateOutflowsSuccess] = useState(false);
  const [deleteIncomesSuccess, setDeleteIncomesSuccess] = useState(false);
  const [deleteOutflowsSuccess, setDeleteOutflowsSuccess] = useState(false);
  const [deleteInvestmentSuccess, setDeleteInvestmentSuccess] = useState(false);
  const [deleteInvestmentDate, setDeleteInvestmentDate] = useState("");
  const [deleteInvestmentAmount, setDeleteInvestmentAmount] = useState("");
  const [
    showConfirmationDeleteInvestment,
    setShowConfirmationDeleteInvestment,
  ] = useState(false);
  const [showConfirmationDeleteIncome, setShowConfirmationDeleteIncome] =
    useState(false);
  const [showConfirmationDeleteOutflow, setShowConfirmationDeleteOutflow] =
    useState(false);
  const [deleteIncomeDate, setDeleteIncomeDate] = useState("");
  const [deleteIncomeAmount, setDeleteIncomeAmount] = useState("");
  const [deleteOutflowDate, setDeleteOutflowDate] = useState("");
  const [deleteOutflowAmount, setDeleteOutflowAmount] = useState("");
  const [noteIncomeAreaValue, setNoteIncomeAreaValue] = useState("");
  const [noteOutflowAreaValue, setNoteOutflowAreaValue] = useState("");
  // const [isLoading, setIsLoading] = useState(true);
  const [bankReal, setBankReal] = useState(0);
  const [cashReal, setCashReal] = useState(0);
  const [stocksReal, setStocksReal] = useState(0);
  const [etfReal, setETFReal] = useState(0);
  const [cryptoReal, setCryptoReal] = useState(0);
  const [bitcoinReal, setBitcoinReal] = useState(0);
  const [digitalServicesReal, setDigitalServicesReal] = useState(0);
  const [categoryIncome, setCategoryIncome] = useState({ key: "", value: "" });
  const [categoryOutflow, setCategoryOutflow] = useState({
    key: "",
    value: "",
  });
  const [typoOutflow, setTypoOutflow] = useState({ key: "", value: "" });
  //const [typoInvestment, setTypoInvestment] = useState({ key: "", value: "" });
  const [income, setIncome] = useState("");
  const [outflow, setOutflow] = useState("");
  // const [lastIncomesAdds, setLastIncomesAdds] = useState([]);
  // const [lastOutflowsAdds, setLastOutflowsAdds] = useState([]);
  const [allIncomesAdds, setAllIncomesAdds] = useState([]);
  const [allOutflowsAdds, setAllOutflowsAdds] = useState([]);
  const [incomeDate, setIncomeDate] = useState(currentDate);
  const [outflowDate, setOutflowDate] = useState(currentDate);
  const [balanceDate, setBalanceDate] = useState(currentDate);
  const [activePage, setActivePage] = useState("bilancio");
  const [OutflowsTags, setOutflowsTags] = useState([]);
  const [incomesTags, setIncomesTags] = useState([]);
  const [paymentTags, setPaymentTags] = useState([]);
  const [selectedIncomesMonth, setSelectedIncomesMonth] = useState(0); // Set default selected month as the first month
  const [selectedOutflowsMonth, setSelectedOutflowsMonth] = useState(0);

  //filtering
  const [incomeCategoryFilter, setIncomeCategoryFilter] = useState("");
  const [incomeDateFilter, setIncomeDateFilter] = useState("");
  const [incomeNoteFilter, setIncomeNoteFilter] = useState("");
  const [outflowCategoryFilter, setOutflowCategoryFilter] = useState("");
  const [outflowDateFilter, setOutflowDateFilter] = useState("");
  const [outflowNoteFilter, setOutflowNoteFilter] = useState("");

  // UI/UX state for table header filters
  const [showIncomeNoteInput, setShowIncomeNoteInput] = useState(false);
  const [showIncomeDatePicker, setShowIncomeDatePicker] = useState(false);
  const [showOutflowNoteInput, setShowOutflowNoteInput] = useState(false);
  const [showOutflowDatePicker, setShowOutflowDatePicker] = useState(false);
  const [outflowTypologyFilter, setOutflowTypologyFilter] = useState("");

  const options = {
    [languages[language].assets.bank]: [bankReal, setBankReal],
    [languages[language].assets.cash]: [cashReal, setCashReal],
    [languages[language].assets.digitalServices]: [
      digitalServicesReal,
      setDigitalServicesReal,
    ],
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
        setBankReal(userData ? userData.bankReal : 0);
        setCashReal(userData ? userData.cashReal : 0);
        setDigitalServicesReal(userData ? userData.digitalServicesReal : 0);
        setOutflowsTags(userData ? userData.expensesTags : []);
        setIncomesTags(userData ? userData.incomesTags : []);
        setPaymentTags(userData ? userData.paymentTags : []);
        //setTypoInvestment({ key: userData ? userData.typoInvestment.key : "", value: userData ? userData.typoInvestment.value : "" });

        // setLastOutflowsAdds(userData ? userData.lastExpenses : []);
        // setLastIncomesAdds(userData ? userData.lastIncomes : []);

        //console.log("userDataExpense:", userData.allExpenses);

        setAllOutflowsAdds(userData ? userData.allExpenses : []);
        setAllIncomesAdds(userData ? userData.allIncomes : []);

        // setIsLoading(false); // Imposta isLoading su false quando le operazioni sono state completate
      } catch (error) {
        console.error("Error: ", error);
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

  const handleOutflowDateChange = (event) => {
    let inputDate = event.target.value;
    setOutflowDate(inputDate);
  };

  const handleIncomesMonthChange = (event) => {
    setSelectedIncomesMonth(event.target.value); // Update the selected month
  };

  const handleOutflowsMonthChange = (event) => {
    setSelectedOutflowsMonth(event.target.value);
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
  }, [userData]);

  const selectedIncomeMonthKey = monthOptions[selectedIncomesMonth]
    ? `${monthOptions[selectedIncomesMonth].month}-${monthOptions[selectedIncomesMonth].year}`
    : "";
  const selectedOutflowMonthKey = monthOptions[selectedOutflowsMonth]
    ? `${monthOptions[selectedOutflowsMonth].month}-${monthOptions[selectedOutflowsMonth].year}`
    : "";

  // Sostituisci monthOptions con incomeMonthOptions/outflowMonthOptions dove necessario
  // E filtra i dati per il mese selezionato
  // Funzione aggiornata per trovare i dati del mese selezionato
  function getAddsForMonth(allAdds, selectedMonthKey) {
    if (!Array.isArray(allAdds)) return [];
    for (let i = 0; i < allAdds.length; i++) {
      const arr = allAdds[i];
      if (Array.isArray(arr) && arr.length > 0) {
        // Prendi la data del primo elemento
        const d = new Date(arr[0].date);
        // Costruisci la chiave mese-anno
        const key = `${d.getMonth() + 1}-${d.getFullYear()}`;
        if (key === selectedMonthKey) return arr;
      }
    }
    // Se non trova nulla, restituisci array vuoto
    return [];
  }

  const handleConfirmBalance = async (
    fetchData,
    setIsConfirmBalanceOpen,
    setBalanceDate,
    setUpdateBalanceSuccess,
    handleSetIsUpdated,
    balanceDate,
    bankReal,
    cashReal,
    digitalServicesReal,
    stocksReal,
    etfReal,
    bitcoinReal,
    cryptoReal,
  ) => {
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
      //window.umami.trackEvent('balanceUpdate', 'Balance');
      // console.log("Bilancio aggiornato aggiorno lo user context");
      handleSetIsUpdated(false); // Forza il re-render di UserProvider
      setUpdateBalanceSuccess(true);
      fetchData();
      setBalanceDate(currentDate);
    } else {
      alert("Errore in the update of the balance");
    }
  };

  const createInExJson = (
    isOutflow,
    date,
    amount,
    notes,
    payment_type,
    category_tag,
  ) => {
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

          console.log(balancesJson);

          const balancesChange = await axios.post(
            "/balances/add",
            balancesJson,
            { withCredentials: true },
          );

          if (balancesChange.status === 200) {
            handleSetIsUpdated(false); // Forza il re-render di UserProvider
            setBalanceDate(currentDate);
            setUpdateInExBalanceSuccess(true);
            fetchData();
            //window.umami.trackEvent('balanceFromInExUpdate', 'Balance');
          } else {
            alert("Error in the update of the balance");
          }
        } else {
          handleSetIsUpdated(false);
          if (isOutflow) setUpdateOutflowsSuccess(true);
          else setUpdateIncomesSuccess(true);
          fetchData();
        }
        //window.umami.trackEvent('InExUpdate', 'IncomeOutflow');
      } else {
        alert("Error in the update of the outflow");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleAddOutflows = async () => {
    // Verifica se income è uguale a 0 e/o categoryIncome è vuoto
    if (categoryOutflow.value === "") {
      alert("Select a category");
      return;
    } else if (typoOutflow.value === "") {
      alert("Select a payment type");
      return;
    } else if (
      Number(outflow) === 0 ||
      outflow === "" ||
      outflow === undefined
    ) {
      alert("Insert a valid value greater than 0");
      return;
    }

    setIsConfirmOutflowOpen(true);
  };

  const handleIncomesDelete = async (
    fetchData,
    setDeleteIncomesSuccess,
    handleSetIsUpdated,
    dateIncome,
    amountIncome,
  ) => {
    //data,

    const data = {
      expense: {
        date: dateIncome, //must be an object date
        amount: amountIncome,
        is_expense: false,
      },
    };
    const incomesDelete = await axios.post("/expenses/delete", data, {
      withCredentials: true,
    });

    if (incomesDelete.status === 200) {
      handleSetIsUpdated(false); // Forza il re-render di UserProvider
      setDeleteIncomesSuccess(true);
      fetchData();
      //window.umami.trackEvent('incomeDelete', 'IncomeOutflow');
    } else {
      alert("Error in the update of the income");
    }
  };

  const handleOutflowsDelete = async (
    fetchData,
    setDeleteOutflowsSuccess,
    handleSetIsUpdated,
    dateOutflow,
    amountOutflow,
  ) => {
    const data = {
      expense: {
        date: dateOutflow, //must be an object date
        amount: amountOutflow,
        is_expense: true,
      },
    };
    const incomesDelete = await axios.post("/expenses/delete", data, {
      withCredentials: true,
    });

    if (incomesDelete.status === 200) {
      handleSetIsUpdated(false); // Forza il re-render di UserProvider
      setDeleteOutflowsSuccess(true);
      fetchData();
      //window.umami.trackEvent('outflowDelete', 'IncomeOutflow');
    } else {
      alert("Error in the update of the outflow");
    }
  };

  function getGradientForCategory(baseColor) {
    // Se il colore è in formato rgba, crea una versione più trasparente per il gradient
    // Es: rgba(100,200,100,0.7) -> da 0.18 a 0.38
    if (!baseColor)
      return "linear-gradient(90deg, rgba(220,220,220,0.10) 0%, rgba(240,240,240,0.18) 100%)";
    const match = baseColor.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
    );
    if (match) {
      const r = match[1],
        g = match[2],
        b = match[3];
      // Usa alpha basso a sinistra, più alto a destra
      return `linear-gradient(90deg, rgba(${r},${g},${b},0.18) 0%, rgba(${r},${g},${b},0.38) 100%)`;
    }
    // fallback: colore solido
    return baseColor;
  }

  // Funzione per calcolare il totale visibile e il totale generale
  function getTotals(filteredAdds, allAdds, isIncome) {
    // filteredAdds: array di oggetti visibili (dopo filtri)
    // allAdds: array di tutti gli oggetti del mese selezionato
    const totalFiltered = filteredAdds.reduce(
      (sum, add) => sum + (add.amount || 0),
      0,
    );
    const totalAll = (Array.isArray(allAdds) ? allAdds : []).reduce(
      (sum, add) => sum + (add.amount || 0),
      0,
    );
    return {
      totalFiltered,
      totalAll,
    };
  }

  function renderIncomeItems(chosenIncomesToShow) {
    const filtered = chosenIncomesToShow.filter(
      (add) =>
        (!incomeCategoryFilter ||
          add.categoryTag.translations[language] === incomeCategoryFilter) &&
        (!incomeNoteFilter ||
          (add.notes &&
            add.notes
              .toLowerCase()
              .includes(incomeNoteFilter.toLowerCase()))) &&
        (!incomeDateFilter ||
          new Date(add.date).toISOString().slice(0, 10) === incomeDateFilter),
    );
    const totals = getTotals(filtered, chosenIncomesToShow, true);
    const filtersActive =
      incomeCategoryFilter || incomeNoteFilter || incomeDateFilter;
    const rows = [
      ...filtered.map((add, index) => {
        // Colore categoria robusto
        let colorKey = undefined;
        if (add.categoryTag && add.categoryTag.label) {
          colorKey = add.categoryTag.label;
        } else if (
          add.categoryTag &&
          add.categoryTag.translations &&
          add.categoryTag.translations["en"]
        ) {
          colorKey = add.categoryTag.translations["en"];
        } else if (add.categoryTag && add.categoryTag.translations) {
          // fallback su prima traduzione
          const keys = Object.keys(add.categoryTag.translations);
          if (keys.length > 0) colorKey = add.categoryTag.translations[keys[0]];
        }
        const baseColor = incomeCategoryColors[colorKey] || "#b5ded1";
        const rowGradient = getGradientForCategory(baseColor);
        return (
          <tr key={index} style={{ background: rowGradient }}>
            <td>
              {isHidden ? "****" : add.categoryTag.translations[language]}
            </td>
            <td>
              {isHidden
                ? "****"
                : add.amount.toLocaleString("it-IT", {
                    minimumFractionDigits: 2,
                  })}{" "}
              €
            </td>
            <td>{isHidden ? "****" : add.notes}</td>
            <td>
              {isHidden
                ? "****"
                : (() => {
                    const d = new Date(add.date);
                    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
                  })()}
            </td>
            <td>
              <button
                data-umami-event="deleteIncome"
                onClick={() => {
                  setDeleteIncomeAmount(add.amount);
                  setDeleteIncomeDate(add.date);
                  setShowConfirmationDeleteIncome(true);
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </td>
          </tr>
        );
      }),
    ];
    if (filtersActive) {
      rows.push(
        <tr
          key="total-filtered-income"
          style={{ background: "#1ec6a6", fontWeight: 700 }}
        >
          <td
            colSpan={1}
            style={{
              textAlign: "center",
              fontSize: "1.08em",
              letterSpacing: 1,
              color: "#1a2b2b",
            }}
          >
            {languages[language].general.totalFiltered || "Total Filtered"}
          </td>
          <td
            colSpan={1}
            style={{
              textAlign: "center",
              fontSize: "1.08em",
              color: "#1a2b2b",
            }}
          >
            {isHidden
              ? "****"
              : totals.totalFiltered.toLocaleString("it-IT", {
                  minimumFractionDigits: 2,
                })}{" "}
            €
          </td>
          <td colSpan={3}></td>
        </tr>,
      );
    }
    rows.push(
      <tr key="total-income" style={{ background: "#0fa37f", fontWeight: 700 }}>
        <td
          colSpan={1}
          style={{
            textAlign: "center",
            fontSize: "1.15em",
            letterSpacing: 1,
            color: "#fff",
          }}
        >
          {languages[language].general.total}
        </td>
        <td
          colSpan={1}
          style={{ textAlign: "center", fontSize: "1.15em", color: "#fff" }}
        >
          {isHidden
            ? "****"
            : totals.totalAll.toLocaleString("it-IT", {
                minimumFractionDigits: 2,
              })}{" "}
          €
        </td>
        <td colSpan={3}></td>
      </tr>,
    );
    return rows;
  }

  function renderOutflowItems(chosenOutflowsToShow) {
    const filtered = chosenOutflowsToShow.filter(
      (add) =>
        (!outflowCategoryFilter ||
          add.categoryTag.translations[language] === outflowCategoryFilter) &&
        (!outflowTypologyFilter ||
          add.paymentType.translations[language] === outflowTypologyFilter) &&
        (!outflowNoteFilter ||
          (add.notes &&
            add.notes
              .toLowerCase()
              .includes(outflowNoteFilter.toLowerCase()))) &&
        (!outflowDateFilter ||
          new Date(add.date).toISOString().slice(0, 10) === outflowDateFilter),
    );
    const totals = getTotals(filtered, chosenOutflowsToShow, false);
    const filtersActive =
      outflowCategoryFilter ||
      outflowTypologyFilter ||
      outflowNoteFilter ||
      outflowDateFilter;
    const rows = [
      ...filtered.map((add, index) => {
        // Colore categoria robusto
        let colorKey = undefined;
        if (add.categoryTag && add.categoryTag.label) {
          colorKey = add.categoryTag.label;
        } else if (
          add.categoryTag &&
          add.categoryTag.translations &&
          add.categoryTag.translations["en"]
        ) {
          colorKey = add.categoryTag.translations["en"];
        } else if (add.categoryTag && add.categoryTag.translations) {
          const keys = Object.keys(add.categoryTag.translations);
          if (keys.length > 0) colorKey = add.categoryTag.translations[keys[0]];
        }
        const baseColor = outflowCategoryColors[colorKey] || "#ffcfcf";
        const rowGradient = getGradientForCategory(baseColor);
        return (
          <tr key={index} style={{ background: rowGradient }}>
            <td>
              {isHidden ? "****" : add.categoryTag.translations[language]}
            </td>
            <td>
              {isHidden ? "****" : add.paymentType.translations[language]}
            </td>
            <td>
              {isHidden
                ? "****"
                : add.amount.toLocaleString("it-IT", {
                    minimumFractionDigits: 2,
                  })}{" "}
              €
            </td>
            <td>{isHidden ? "****" : add.notes}</td>
            <td>
              {isHidden
                ? "****"
                : (() => {
                    const d = new Date(add.date);
                    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
                  })()}
            </td>
            <td>
              <button
                data-umami-event="deleteOutflow"
                onClick={() => {
                  setDeleteOutflowDate(add.date);
                  setDeleteOutflowAmount(add.amount);
                  setShowConfirmationDeleteOutflow(true);
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </td>
          </tr>
        );
      }),
    ];
    if (filtersActive) {
      rows.push(
        <tr
          key="total-filtered-outflow"
          style={{ background: "#ff6b6b", fontWeight: 700 }}
        >
          <td
            colSpan={2}
            style={{
              textAlign: "center",
              fontSize: "1.08em",
              letterSpacing: 1,
              color: "#6b1a1a",
            }}
          >
            {languages[language].general.totalFiltered || "Total Filtered"}
          </td>
          <td
            colSpan={1}
            style={{
              textAlign: "center",
              fontSize: "1.08em",
              color: "#6b1a1a",
            }}
          >
            {isHidden
              ? "****"
              : totals.totalFiltered.toLocaleString("it-IT", {
                  minimumFractionDigits: 2,
                })}{" "}
            €
          </td>
          <td colSpan={3}></td>
        </tr>,
      );
    }
    rows.push(
      <tr
        key="total-outflow"
        style={{ background: "#e23c3c", fontWeight: 700 }}
      >
        <td
          colSpan={2}
          style={{
            textAlign: "center",
            fontSize: "1.15em",
            letterSpacing: 1,
            color: "#fff",
          }}
        >
          {languages[language].general.total}
        </td>
        <td
          colSpan={1}
          style={{ textAlign: "center", fontSize: "1.15em", color: "#fff" }}
        >
          {isHidden
            ? "****"
            : totals.totalAll.toLocaleString("it-IT", {
                minimumFractionDigits: 2,
              })}{" "}
          €
        </td>
        <td colSpan={3}></td>
      </tr>,
    );
    return rows;
  }

  // Ref per focus input note
  const incomeNoteInputRef = React.useRef(null);
  const outflowNoteInputRef = React.useRef(null);

  // Funzione per ottenere il range di giorni del mese selezionato
  function getDateRangeForMonth(monthOption) {
    if (!monthOption) return { min: "", max: "" };
    const year = monthOption.year;
    const month = monthOption.month;
    const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDayNum = new Date(year, month, 0).getDate();
    const lastDay = `${year}-${String(month).padStart(2, "0")}-${String(lastDayNum).padStart(2, "0")}`;
    return { min: firstDay, max: lastDay };
  }

  // Header tabella condiviso
  function renderTableHeader({
    categoryFilter,
    setCategoryFilter,
    categoryOptions,
    categoryLabel,
    noteFilter,
    setNoteFilter,
    noteInputRef,
    noteLabel,
    dateFilter,
    setDateFilter,
    dateLabel,
    monthOption,
    theme,
    showNoteInput,
    setShowNoteInput,
    showDatePicker,
    setShowDatePicker,
    typologyFilter,
    setTypologyFilter,
    typologyOptions,
    typologyLabel,
    isOutflow,
  }) {
    // Per overlay grigio chiaro
    const dropdownStyle = {
      background: "#fff",
      color: "#111",
      borderRadius: "6px",
      textAlign: "center",
      minWidth: 120,
      boxShadow: "0 2px 8px rgba(100,100,100,0.10)",
      border: "1px solid #bbb",
      fontWeight: 500,
    };
    const { min, max } = getDateRangeForMonth(monthOption);
    return (
      <tr style={{ color: "white", background: "transparent" }}>
        <th style={{ textAlign: "center", verticalAlign: "middle" }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={dropdownStyle}
          >
            <option value="">{categoryLabel}</option>
            {categoryOptions.map((item) => (
              <option key={item.index} value={item.translations[language]}>
                {item.translations[language]}
              </option>
            ))}
          </select>
        </th>
        {isOutflow && (
          <th style={{ textAlign: "center", verticalAlign: "middle" }}>
            <select
              value={typologyFilter}
              onChange={(e) => setTypologyFilter(e.target.value)}
              style={dropdownStyle}
            >
              <option value="">{typologyLabel}</option>
              {typologyOptions.map(
                (item) =>
                  item.label !== "none" && (
                    <option
                      key={item.index}
                      value={item.translations[language]}
                    >
                      {item.translations[language]}
                    </option>
                  ),
              )}
            </select>
          </th>
        )}
        {/* Value column always after category (income) or after typology (outflow) */}
        <th
          style={{
            textAlign: "center",
            verticalAlign: "middle",
            minWidth: 100,
          }}
        >
          {languages[language].general.value}
        </th>
        <th
          style={{
            textAlign: "center",
            verticalAlign: "middle",
            minWidth: 120,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {!showNoteInput ? (
              <span
                style={{ color: "white", marginRight: 6, cursor: "pointer" }}
                onClick={() => setShowNoteInput(true)}
              >
                {noteLabel} <FontAwesomeIcon icon={faSearch} />
              </span>
            ) : (
              <input
                ref={noteInputRef}
                type="text"
                placeholder={noteLabel}
                value={noteFilter}
                onChange={(e) => setNoteFilter(e.target.value)}
                className="w-full"
                style={{
                  color: "white",
                  background: "transparent",
                  textAlign: "center",
                  marginTop: 2,
                }}
                onBlur={() => setShowNoteInput(false)}
                autoFocus
              />
            )}
          </div>
        </th>
        <th
          style={{
            textAlign: "center",
            verticalAlign: "middle",
            minWidth: 120,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {!showDatePicker ? (
              <span
                style={{ color: "white", marginRight: 6, cursor: "pointer" }}
                onClick={() => setShowDatePicker(true)}
              >
                <FontAwesomeIcon icon={faCalendarAlt} />{" "}
                {dateFilter
                  ? dateFilter.split("-").reverse().join("/")
                  : dateLabel}
              </span>
            ) : (
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setShowDatePicker(false);
                }}
                className="w-full"
                style={{
                  color: "white",
                  background: "transparent",
                  textAlign: "center",
                  marginTop: 2,
                }}
                min={min}
                max={max}
                onBlur={() => setShowDatePicker(false)}
                autoFocus
              />
            )}
          </div>
        </th>
        <th style={{ textAlign: "center", verticalAlign: "middle" }}></th>
      </tr>
    );
  }

  // Wrapper e stile per input con simbolo valuta
  const inputCurrencyWrapper = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    marginBottom: "0.5em",
    minWidth: 0,
  };
  const inputWithCurrency = {
    textAlign: "center",
    padding: "8px 8px 8px 2em", // spazio a sinistra per il simbolo
    border: "1px solid #ccc",
    borderRadius: "4px",
    color: "#333",
    outline: "none",
    width: "140px", // larghezza uniforme
    height: "40px", // altezza uniforme
    fontSize: "1.05em",
    background: "white",
    boxSizing: "border-box",
  };
  const currencySymbolStyle = {
    position: "absolute",
    left: "0.7em",
    color: "#888",
    fontSize: "0.95em", // più piccolo
    pointerEvents: "none",
    top: "50%",
    transform: "translateY(-52%)", // leggermente più su per centratura visiva
    lineHeight: 1,
  };

  const renderPage = () => {
    if (activePage === "bilancio") {
      return (
        <>
          {/*TitleSection used to create a distance TO UPGRADE */}
          <TitleSection theme={theme}>
            {" "}
            {languages[language].insert.balanceSection.titleLiquidity}{" "}
          </TitleSection>
          <StyledInputs theme={theme}>
            <Column>
              <div className="labelContainer text-center p-1 bg-white border-2 border-paciGreen rounded-md outline-none w-32 md:w-60 mb-2 md:mb-4">
                <label className="labelStyle flex items-center justify-center text-black h-full text-xs md:text-base">
                  {languages[language].assets.bank}
                </label>
              </div>
              <div className="labelContainer text-center p-1 bg-white border-2 border-paciGreen rounded-md outline-none w-32 md:w-60 mb-2 md:mb-4">
                <label className="labelStyle flex items-center justify-center text-black h-full text-xs md:text-base">
                  {languages[language].assets.cash}
                </label>
              </div>
              <div className="labelContainer text-center p-1 bg-white border-2 border-paciGreen rounded-md outline-none w-32 md:w-60 mb-2 md:mb-4">
                <label className="labelStyle flex items-center justify-center text-black h-full text-xs md:text-base">
                  {languages[language].assets.digitalServices}
                </label>
              </div>
            </Column>
            <Column>
              <div style={inputCurrencyWrapper}>
                <span style={currencySymbolStyle}>€</span>
                <input
                  type="text"
                  onChange={(e) => handleInputChange(e, setBankReal)}
                  onBlur={(e) => handleInputBlur(e, setBankReal)}
                  placeholder={
                    isHidden
                      ? "****"
                      : bankReal.toLocaleString("it-IT", {
                          minimumFractionDigits: 2,
                        })
                  }
                  style={inputWithCurrency}
                />
              </div>
              <div style={inputCurrencyWrapper}>
                <span style={currencySymbolStyle}>€</span>
                <input
                  type="text"
                  onChange={(e) => handleInputChange(e, setCashReal)}
                  onBlur={(e) => handleInputBlur(e, setCashReal)}
                  placeholder={
                    isHidden
                      ? "****"
                      : cashReal.toLocaleString("it-IT", {
                          minimumFractionDigits: 2,
                        })
                  }
                  style={inputWithCurrency}
                />
              </div>
              <div style={inputCurrencyWrapper}>
                <span style={currencySymbolStyle}>€</span>
                <input
                  type="text"
                  onChange={(e) => handleInputChange(e, setDigitalServicesReal)}
                  onBlur={(e) => handleInputBlur(e, setDigitalServicesReal)}
                  placeholder={
                    isHidden
                      ? "****"
                      : digitalServicesReal.toLocaleString("it-IT", {
                          minimumFractionDigits: 2,
                        })
                  }
                  style={inputWithCurrency}
                />
              </div>
            </Column>
          </StyledInputs>
          <TitleSection theme={theme}>
            {" "}
            {languages[language].insert.balanceSection.titleInvestments}{" "}
          </TitleSection>
          <StyledInputs theme={theme}>
            <Column>
              <div className="labelContainer text-center p-1 bg-white border-2 border-paciGreen rounded-md outline-none w-32 md:w-60 mb-2 md:mb-4">
                <label className="labelStyle flex items-center justify-center text-black h-full text-xs md:text-base">
                  {languages[language].assets.stocks}
                </label>
              </div>
              <div className="labelContainer text-center p-1 bg-white border-2 border-paciGreen rounded-md outline-none w-32 md:w-60 mb-2 md:mb-4">
                <label className="labelStyle flex items-center justify-center text-black h-full text-xs md:text-base">
                  {languages[language].assets.etf}
                </label>
              </div>
              <div className="labelContainer text-center p-1 bg-white border-2 border-paciGreen rounded-md outline-none w-32 md:w-60 mb-2 md:mb-4">
                <label className="labelStyle flex items-center justify-center text-black h-full text-xs md:text-base">
                  {languages[language].assets.bitcoin}
                </label>
              </div>
              <div className="labelContainer text-center p-1 bg-white border-2 border-paciGreen rounded-md outline-none w-32 md:w-60 mb-2 md:mb-4">
                <label className="labelStyle flex items-center justify-center text-black h-full text-xs md:text-base">
                  {languages[language].assets.crypto}
                </label>
              </div>
            </Column>
            <Column>
              <div style={inputCurrencyWrapper}>
                <span style={currencySymbolStyle}>€</span>
                <input
                  type="text"
                  onChange={(e) => handleInputChange(e, setStocksReal)}
                  onBlur={(e) => handleInputBlur(e, setStocksReal)}
                  placeholder={
                    isHidden
                      ? "****"
                      : stocksReal.toLocaleString("it-IT", {
                          minimumFractionDigits: 2,
                        })
                  }
                  style={inputWithCurrency}
                />
              </div>
              <div style={inputCurrencyWrapper}>
                <span style={currencySymbolStyle}>€</span>
                <input
                  type="text"
                  onChange={(e) => handleInputChange(e, setETFReal)}
                  onBlur={(e) => handleInputBlur(e, setETFReal)}
                  placeholder={
                    isHidden
                      ? "****"
                      : etfReal.toLocaleString("it-IT", {
                          minimumFractionDigits: 2,
                        })
                  }
                  style={inputWithCurrency}
                />
              </div>
              <div style={inputCurrencyWrapper}>
                <span style={currencySymbolStyle}>€</span>
                <input
                  type="text"
                  onChange={(e) => handleInputChange(e, setBitcoinReal)}
                  onBlur={(e) => handleInputBlur(e, setBitcoinReal)}
                  placeholder={
                    isHidden
                      ? "****"
                      : bitcoinReal.toLocaleString("it-IT", {
                          minimumFractionDigits: 2,
                        })
                  }
                  style={inputWithCurrency}
                />
              </div>
              <div style={inputCurrencyWrapper}>
                <span style={currencySymbolStyle}>€</span>
                <input
                  type="text"
                  onChange={(e) => handleInputChange(e, setCryptoReal)}
                  onBlur={(e) => handleInputBlur(e, setCryptoReal)}
                  placeholder={
                    isHidden
                      ? "****"
                      : cryptoReal.toLocaleString("it-IT", {
                          minimumFractionDigits: 2,
                        })
                  }
                  style={inputWithCurrency}
                />
              </div>
              {/* Responsive: riduci larghezza e font su mobile */}
              <style>{`
                @media (max-width: 600px) {
                  .labelContainer { min-width: 0 !important; width: 100% !important; }
                  .labelStyle { font-size: 0.90em !important; }
                  input[type='text'] { font-size: 0.98em !important; height: 34px !important; }
                  .MuiInputBase-root, .MuiSelect-root { font-size: 0.98em !important; }
                }
              `}</style>
            </Column>
          </StyledInputs>

          <StyledCalendarInput>
            <StyledDateInput
              type="date"
              value={balanceDate}
              onChange={handleBalanceDateChange}
              max={currentDate}
            />
          </StyledCalendarInput>

          <StyledInputs theme={theme}>
            <MySecondaryButton
              theme={theme}
              onClick={() => handleChangeBalance(setIsConfirmBalanceOpen)}
            >
              {languages[language].insert.balanceSection.updateButton}
            </MySecondaryButton>
          </StyledInputs>
        </>
      );
    } else if (activePage === "income") {
      return (
        <>
          {/* <div className="flex flex-col items-center justify-center"> */}
          <StyledAddSection theme={theme}>
            <label>
              <Select
                value={categoryIncome.value}
                onChange={(event) => {
                  const selectedKey = event.target.value;
                  const selectedItem = incomesTags.find(
                    (item) => item.index === selectedKey,
                  );

                  if (selectedItem) {
                    const selectedValue = selectedItem.translations[language];
                    setCategoryIncome({
                      key: selectedKey,
                      value: selectedValue,
                    });
                  }
                }}
                style={{ backgroundColor: "white" }}
                displayEmpty
                renderValue={(value) => {
                  if (value === "") {
                    return languages[language].insert.incomeSection
                      .placeholderCategory;
                  }
                  return value;
                }}
              >
                <MenuItem value="">
                  <em>
                    {
                      languages[language].insert.incomeSection
                        .placeholderCategory
                    }
                  </em>
                </MenuItem>
                {incomesTags.map((item) => (
                  <MenuItem key={item.index} value={item.index}>
                    {item.translations[language]}
                  </MenuItem>
                ))}
              </Select>
            </label>

            <div style={inputCurrencyWrapper}>
              <span style={currencySymbolStyle}>€</span>
              <input
                type="text"
                value={income}
                onChange={(e) => handleInputChange(e, setIncome)}
                onBlur={(e) => handleInputBlur(e, setIncome)}
                placeholder="0"
                style={inputWithCurrency}
              />
            </div>

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
              <StyledTextArea
                value={noteIncomeAreaValue}
                onChange={(e) => setNoteIncomeAreaValue(e.target.value)}
                maxLength={64}
                placeholder={
                  languages[language].insert.incomeSection.placeholderNote
                }
              />
            </label>
          </StyledAddSection>

          <StyledAddSection theme={theme}>
            <MySecondaryButton
              theme={theme}
              onClick={() =>
                handleAddIncome(setIsConfirmIncomeOpen, categoryIncome, income)
              }
            >
              {languages[language].insert.incomeSection.updateButton}
            </MySecondaryButton>
          </StyledAddSection>

          <TitleLastAdds theme={theme}>
            {languages[language].insert.incomeSection.titleListing}
            <select
              className="text-black text-center font-normal mx-2 text-base px-2 py-1 rounded-md"
              value={selectedIncomesMonth}
              onChange={handleIncomesMonthChange}
            >
              {incomeMonthOptions &&
                incomeMonthOptions.length > 0 &&
                incomeMonthOptions.map((option) => (
                  <option
                    className="text-center"
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
            </select>
          </TitleLastAdds>

          {/* Wrapper responsive per tabella income */}
          <div
            style={{
              overflowX: "auto",
              maxWidth: "100vw",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <StyledTable theme={theme} style={{ minWidth: 600 }}>
              <thead>
                {renderTableHeader({
                  categoryFilter: incomeCategoryFilter,
                  setCategoryFilter: setIncomeCategoryFilter,
                  categoryOptions: incomesTags,
                  categoryLabel:
                    languages[language].insert.incomeSection.tableColumns
                      .category,
                  noteFilter: incomeNoteFilter,
                  setNoteFilter: setIncomeNoteFilter,
                  noteInputRef: incomeNoteInputRef,
                  noteLabel:
                    languages[language].insert.incomeSection.tableColumns.note,
                  dateFilter: incomeDateFilter,
                  setDateFilter: setIncomeDateFilter,
                  dateLabel: "Data",
                  monthOption: incomeMonthOptions[selectedIncomesMonth],
                  theme,
                  showNoteInput: showIncomeNoteInput,
                  setShowNoteInput: setShowIncomeNoteInput,
                  showDatePicker: showIncomeDatePicker,
                  setShowDatePicker: setShowIncomeDatePicker,
                  isOutflow: false,
                })}
              </thead>
              <tbody>
                {renderIncomeItems(
                  getAddsForMonth(allIncomesAdds, selectedIncomeMonthKey),
                )}
              </tbody>
            </StyledTable>
            <style>{`
              @media (max-width: 600px) {
                table, .StyledTable, .StyledTable th, .StyledTable td {
                  font-size: 0.92em !important;
                  padding: 4px 2px !important;
                  min-width: 60px !important;
                }
                .StyledTable th, .StyledTable td {
                  line-height: 1.1 !important;
                }
                .StyledTable select, .StyledTable input, .StyledTable button {
                  font-size: 0.95em !important;
                  padding: 4px 2px !important;
                }
                .StyledTable .MuiInputBase-root, .StyledTable .MuiSelect-root {
                  font-size: 0.95em !important;
                }
              }
            `}</style>
          </div>
        </>
      );
    } else if (activePage === "outflows") {
      return (
        <>
          <StyledAddSection theme={theme}>
            <label>
              <Select
                value={categoryOutflow.value}
                onChange={(event) => {
                  const selectedKey = event.target.value;
                  const selectedItem = OutflowsTags.find(
                    (item) => item.index === selectedKey,
                  );

                  if (selectedItem) {
                    const selectedValue = selectedItem.translations[language];
                    setCategoryOutflow({
                      key: selectedKey,
                      value: selectedValue,
                    });
                  }
                }}
                style={{ backgroundColor: "white" }}
                displayEmpty
                renderValue={(value) => {
                  if (value === "") {
                    return languages[language].insert.outflowSection
                      .placeholderCategory;
                  }
                  return value;
                }}
              >
                <MenuItem value="">
                  <em>
                    {
                      languages[language].insert.outflowSection
                        .placeholderCategory
                    }
                  </em>
                </MenuItem>
                {OutflowsTags.map((item) => (
                  <MenuItem key={item.index} value={item.index}>
                    {item.translations[language]}
                  </MenuItem>
                ))}
              </Select>
            </label>
            <label>
              <Select
                value={typoOutflow.value}
                onChange={(event) => {
                  const selectedKey = event.target.value;
                  const selectedItem = paymentTags.find(
                    (item) => item.index === selectedKey,
                  );

                  if (selectedItem) {
                    const selectedValue = selectedItem.translations[language];
                    setTypoOutflow({ key: selectedKey, value: selectedValue });
                  }
                }}
                style={{ backgroundColor: "white" }}
                displayEmpty
                renderValue={(value) => {
                  if (value === "") {
                    return languages[language].insert.outflowSection
                      .placeholderTypology;
                  }
                  return value;
                }}
              >
                <MenuItem value="">
                  <em>
                    {
                      languages[language].insert.outflowSection
                        .placeholderTypology
                    }
                  </em>
                </MenuItem>
                {paymentTags.map(
                  (item) =>
                    // check if the item is not none because we don't want to show it
                    item.label !== "none" && (
                      <MenuItem key={item.index} value={item.index}>
                        {item.translations[language]}
                      </MenuItem>
                    ),
                )}
              </Select>
            </label>

            <div style={inputCurrencyWrapper}>
              <span style={currencySymbolStyle}>€</span>
              <input
                type="text"
                value={outflow}
                onChange={(e) => handleInputChange(e, setOutflow)}
                onBlur={(e) => handleInputBlur(e, setOutflow)}
                placeholder="0"
                style={inputWithCurrency}
              />
            </div>

            <div>
              <StyledDateInput
                type="date"
                value={outflowDate}
                onChange={handleOutflowDateChange}
                max={currentDate}
              />
            </div>
          </StyledAddSection>

          <StyledAddSection theme={theme}>
            <label>
              <StyledTextArea
                value={noteOutflowAreaValue}
                onChange={(e) => setNoteOutflowAreaValue(e.target.value)}
                maxLength={64}
                placeholder={
                  languages[language].insert.outflowSection.placeholderNote
                }
              />
            </label>
          </StyledAddSection>

          <StyledAddSection theme={theme}>
            <MySecondaryButton
              theme={theme}
              onClick={() =>
                handleAddOutflows(
                  setIsConfirmOutflowOpen,
                  typoOutflow,
                  categoryOutflow,
                  outflow,
                )
              }
            >
              {languages[language].insert.outflowSection.updateButton}
            </MySecondaryButton>
          </StyledAddSection>
          <TitleLastAdds theme={theme}>
            {languages[language].insert.outflowSection.titleListing}
            <select
              className="text-black text-center font-normal text-base mx-2 px-1 py-1 rounded-md"
              value={selectedOutflowsMonth}
              onChange={handleOutflowsMonthChange}
            >
              {outflowMonthOptions &&
                outflowMonthOptions.length > 0 &&
                outflowMonthOptions.map((option) => (
                  <option
                    className="text-center"
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
            </select>
          </TitleLastAdds>

          {/* Wrapper responsive per tabella outflow */}
          <div
            style={{
              overflowX: "auto",
              maxWidth: "100vw",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <StyledTable theme={theme} style={{ minWidth: 700 }}>
              <thead>
                {renderTableHeader({
                  categoryFilter: outflowCategoryFilter,
                  setCategoryFilter: setOutflowCategoryFilter,
                  categoryOptions: OutflowsTags,
                  categoryLabel:
                    languages[language].insert.outflowSection.tableColumns
                      .category,
                  noteFilter: outflowNoteFilter,
                  setNoteFilter: setOutflowNoteFilter,
                  noteInputRef: outflowNoteInputRef,
                  noteLabel:
                    languages[language].insert.outflowSection.tableColumns.note,
                  dateFilter: outflowDateFilter,
                  setDateFilter: setOutflowDateFilter,
                  dateLabel: "Data",
                  monthOption: outflowMonthOptions[selectedOutflowsMonth],
                  theme,
                  showNoteInput: showOutflowNoteInput,
                  setShowNoteInput: setShowOutflowNoteInput,
                  showDatePicker: showOutflowDatePicker,
                  setShowDatePicker: setShowOutflowDatePicker,
                  typologyFilter: outflowTypologyFilter,
                  setTypologyFilter: setOutflowTypologyFilter,
                  typologyOptions: paymentTags,
                  typologyLabel:
                    languages[language].insert.outflowSection.tableColumns
                      .typology,
                  isOutflow: true,
                })}
              </thead>
              <tbody>
                {renderOutflowItems(
                  getAddsForMonth(allOutflowsAdds, selectedOutflowMonthKey),
                )}
              </tbody>
            </StyledTable>
            <style>{`
              @media (max-width: 600px) {
                table, .StyledTable, .StyledTable th, .StyledTable td {
                  font-size: 0.92em !important;
                  padding: 4px 2px !important;
                  min-width: 60px !important;
                }
                .StyledTable th, .StyledTable td {
                  line-height: 1.1 !important;
                }
                .StyledTable select, .StyledTable input, .StyledTable button {
                  font-size: 0.95em !important;
                  padding: 4px 2px !important;
                }
                .StyledTable .MuiInputBase-root, .StyledTable .MuiSelect-root {
                  font-size: 0.95em !important;
                }
              }
            `}</style>
          </div>
        </>
      );
    }
  };

  return (
    <StyledSection theme={theme}>
      <ModifiedTitleDashboard theme={theme}>
        {languages[language].insert.title}
      </ModifiedTitleDashboard>
      <ButtonGroup aria-label="outlined primary button group">
        <MySectionButton
          theme={theme}
          onClick={() => setActivePage("bilancio")}
          style={{
            backgroundColor: activePage === "bilancio" ? "" : "#222831",
            marginLeft: "6vw",
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
      {renderPage()}
      {isConfirmBalanceOpen && (
        <MuiCustomDialog
          open={isConfirmBalanceOpen}
          onClose={() => handleExitConfirm(setIsConfirmBalanceOpen)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <MuiCustomDialogTitle>
            {languages[language].insert.balanceSection.confirmUpdate}
          </MuiCustomDialogTitle>
          <MuiCustomDialogContent>
            <MuiCustomDialogContentText>
              {languages[language].assets.bank}: {bankReal}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].assets.cash}: {cashReal}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].assets.digitalServices}:{" "}
              {digitalServicesReal}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].assets.stocks}: {stocksReal}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].assets.etf}: {etfReal}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].assets.bitcoin}: {bitcoinReal}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].assets.crypto}: {cryptoReal}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].general.selectedDate}: {balanceDate}
            </MuiCustomDialogContentText>
            {/* TO FIX */}
          </MuiCustomDialogContent>
          <MuiCustomDialogActions>
            <MuiCustomButton
              data-umami-event="balanceUpdate"
              onClick={() =>
                handleConfirmBalance(
                  fetchData,
                  setIsConfirmBalanceOpen,
                  setBalanceDate,
                  setUpdateBalanceSuccess,
                  handleSetIsUpdated,
                  balanceDate,
                  bankReal,
                  cashReal,
                  digitalServicesReal,
                  stocksReal,
                  etfReal,
                  bitcoinReal,
                  cryptoReal,
                )
              }
            >
              {languages[language].general.confirm}
            </MuiCustomButton>
            <MuiCustomButton
              onClick={() => handleExitConfirm(setIsConfirmBalanceOpen)}
            >
              {languages[language].general.cancel}
            </MuiCustomButton>
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
          <MuiCustomDialogTitle>
            {languages[language].insert.incomeSection.confirmUpdate}
          </MuiCustomDialogTitle>
          <MuiCustomDialogContent>
            <MuiCustomDialogContentText>
              {languages[language].general.category}: {categoryIncome.value}
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].general.value}: {income}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].general.note}: {noteIncomeAreaValue}
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].general.selectedDate}: {incomeDate}
            </MuiCustomDialogContentText>
            {/* TO FIX */}
            <Typography variant="body1" style={{ marginTop: "1em" }}>
              {languages[language].insert.incomeSection.increaseWhichBalance}:{" "}
            </Typography>
            <Select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
            >
              <MenuItem value="">
                {languages[language].general.selectAnOption}
              </MenuItem>
              {Object.keys(options).map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </MuiCustomDialogContent>
          <MuiCustomDialogActions>
            <MuiCustomButton
              data-umami-event="incomeUpdate"
              onClick={() => handleConfirmInEx(false)}
            >
              {languages[language].general.confirm}
            </MuiCustomButton>
            <MuiCustomButton
              onClick={() => handleExitConfirm(setIsConfirmIncomeOpen)}
            >
              {languages[language].general.cancel}
            </MuiCustomButton>
          </MuiCustomDialogActions>
        </MuiCustomDialog>
      )}
      {isConfirmOutflowOpen && (
        <MuiCustomDialog
          open={isConfirmOutflowOpen}
          onClose={() => handleExitConfirm(setIsConfirmOutflowOpen)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <MuiCustomDialogTitle>
            {languages[language].insert.outflowSection.confirmUpdate}
          </MuiCustomDialogTitle>
          <MuiCustomDialogContent>
            <MuiCustomDialogContentText>
              {languages[language].general.category}: {categoryOutflow.value}
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].insert.outflowSection.paymentType}:{" "}
              {typoOutflow.value}
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].general.value}: {outflow}€
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].general.note}: {noteOutflowAreaValue}
            </MuiCustomDialogContentText>
            <MuiCustomDialogContentText>
              {languages[language].general.selectedDate}: {outflowDate}
            </MuiCustomDialogContentText>
            {/* TO FIX */}
            <Typography variant="body2" style={{ marginTop: "1em" }}>
              {languages[language].insert.outflowSection.decreaseWhichBalance}:{" "}
            </Typography>
            <Select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
            >
              <MenuItem value="">
                {languages[language].general.selectAnOption}
              </MenuItem>
              {Object.keys(options).map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </MuiCustomDialogContent>
          <MuiCustomDialogActions>
            <MuiCustomButton
              data-umami-event="outflowUpdate"
              onClick={() => handleConfirmInEx(true)}
            >
              {languages[language].general.confirm}
            </MuiCustomButton>
            <MuiCustomButton
              onClick={() => handleExitConfirm(setIsConfirmOutflowOpen)}
            >
              {languages[language].general.cancel}
            </MuiCustomButton>
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
          <MuiCustomDialogTitle>
            {languages[language].insert.balanceSection.successUpdate}
          </MuiCustomDialogTitle>
          <MuiCustomDialogActions>
            <MuiCustomButton
              onClick={() => handleExitConfirm(setUpdateBalanceSuccess)}
            >
              {languages[language].general.ok}
            </MuiCustomButton>
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
          <MuiCustomDialogTitle>
            {languages[language].insert.balanceSection.successFullUpdate}
          </MuiCustomDialogTitle>
          <MuiCustomDialogActions>
            <MuiCustomButton
              onClick={() => handleExitConfirm(setUpdateInExBalanceSuccess)}
            >
              {languages[language].general.ok}
            </MuiCustomButton>
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
          <MuiCustomDialogTitle>
            {languages[language].insert.incomeSection.successUpdate}
          </MuiCustomDialogTitle>
          <MuiCustomDialogActions>
            <MuiCustomButton
              onClick={() => handleExitConfirm(setUpdateIncomesSuccess)}
            >
              {languages[language].general.ok}
            </MuiCustomButton>
          </MuiCustomDialogActions>
        </MuiCustomDialog>
      )}

      {updateOutflowsSuccess && (
        <MuiCustomDialog
          open={updateOutflowsSuccess}
          onClose={() => handleExitConfirm(setUpdateOutflowsSuccess)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <MuiCustomDialogTitle>
            {languages[language].insert.outflowSection.successUpdate}
          </MuiCustomDialogTitle>
          <MuiCustomDialogActions>
            <MuiCustomButton
              onClick={() => handleExitConfirm(setUpdateOutflowsSuccess)}
            >
              {languages[language].general.ok}
            </MuiCustomButton>
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
          <MuiCustomDialogTitle>
            {languages[language].insert.incomeSection.successDelete}
          </MuiCustomDialogTitle>
          <MuiCustomDialogActions>
            <MuiCustomButton
              onClick={() => handleExitConfirm(setDeleteIncomesSuccess)}
            >
              {languages[language].general.ok}
            </MuiCustomButton>
          </MuiCustomDialogActions>
        </MuiCustomDialog>
      )}
      {deleteOutflowsSuccess && (
        <MuiCustomDialog
          open={deleteOutflowsSuccess}
          onClose={() => handleExitConfirm(setDeleteOutflowsSuccess)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <MuiCustomDialogTitle>
            {languages[language].insert.outflowSection.successDelete}
          </MuiCustomDialogTitle>
          <MuiCustomDialogActions>
            <MuiCustomButton
              onClick={() => handleExitConfirm(setDeleteOutflowsSuccess)}
            >
              {languages[language].general.ok}
            </MuiCustomButton>
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
          <MuiCustomDialogTitle>
            {languages[language].insert.incomeSection.confirmDelete}
          </MuiCustomDialogTitle>
          <MuiCustomDialogActions>
            <MuiCustomButton
              onClick={() => {
                handleIncomesDelete(
                  fetchData,
                  setDeleteIncomesSuccess,
                  handleSetIsUpdated,
                  deleteIncomeDate,
                  deleteIncomeAmount,
                );
                setShowConfirmationDeleteIncome(false);
              }}
            >
              {languages[language].general.confirm}
            </MuiCustomButton>
            <MuiCustomButton
              onClick={() => setShowConfirmationDeleteIncome(false)}
            >
              {languages[language].general.cancel}
            </MuiCustomButton>
          </MuiCustomDialogActions>
        </MuiCustomDialog>
      )}
      {showConfirmationDeleteOutflow && (
        <MuiCustomDialog
          open={showConfirmationDeleteOutflow}
          onClose={() => setShowConfirmationDeleteOutflow(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <MuiCustomDialogTitle>
            {languages[language].insert.outflowSection.confirmDelete}
          </MuiCustomDialogTitle>
          <MuiCustomDialogActions>
            <MuiCustomButton
              onClick={() => {
                handleOutflowsDelete(
                  fetchData,
                  setDeleteOutflowsSuccess,
                  handleSetIsUpdated,
                  deleteOutflowDate,
                  deleteOutflowAmount,
                );
                setShowConfirmationDeleteOutflow(false);
              }}
            >
              {languages[language].general.confirm}
            </MuiCustomButton>
            <MuiCustomButton
              onClick={() => setShowConfirmationDeleteOutflow(false)}
            >
              {languages[language].general.cancel}
            </MuiCustomButton>
          </MuiCustomDialogActions>
        </MuiCustomDialog>
      )}
    </StyledSection>
  );
}
