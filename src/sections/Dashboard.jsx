import React, { useEffect, useState, useContext, PureComponent } from "react";
import { Link } from "react-router-dom";
import {
    PieChart,
    Pie,
    Sector,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { BsBank } from "react-icons/bs";
import { FaBitcoin } from "react-icons/fa";
import { BsCashCoin } from "react-icons/bs";
import { AiOutlineStock, AiOutlinePlusCircle } from "react-icons/ai";
import { MdOutlineAutoGraph } from "react-icons/md";
import { SiMoneygram } from "react-icons/si";
import { BsCoin } from "react-icons/bs";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { primaryColor, secondaryColor } from "../styles/Themes";
import { getColorsBalances, getColorsIncExp } from "../styles/Themes";
import { renderCustomizedLabel } from "../utils/customGraphsInfo";
import { LanguageContext } from "../contexts/LanguageContext";
import { MediaQueryContext } from "../contexts/MediaQueryContext";
import languages from "../data/languages.json";

import {
    StandardPageTitle,
    UpperSection,
    LowerSection,
    SectionDashboard,
    TitleLastAdds,
    CapitalValue,
    GraphsSection,
} from "../styles/MyStyled";

function Dashboard({ theme, userData, isHidden, CustomTick }) {
    const [isLoading, setIsLoading] = useState(true);
    const { language } = useContext(LanguageContext);
    const { isMobileScreen } = useContext(MediaQueryContext);
    const colorsBalances = getColorsBalances(language);
    const colorsIncExp = getColorsIncExp(language);
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

    useEffect(() => {
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
                    setDigitalServicesReal(
                        userData ? userData.digitalServicesReal : 0,
                    );
                    setTotalReal(userData ? userData.totalReal : 0);
                    setExpensesMonth(userData ? userData.expensesArray[0] : 0);
                    setIncomesMonth(userData ? userData.incomesArray[0] : 0);
                    setSavedMonth(
                        userData
                            ? userData.incomesArray[0] -
                                  userData.expensesArray[0]
                            : 0,
                    );

                    setIsLoading(false); // Imposta isLoading su false quando le operazioni sono state completate
                } catch (error) {
                    console.error("Error set balances:", error);
                }
            }
        };

        fetchData();
    }, [userData]);

    //commented to work in local on the dashboard
    // if (isLoading) {
    //     return <div>Caricamento...</div>; // Mostra un indicatore di caricamento durante il recupero dei dati
    // }

    const capitalData = [
        {
            name: languages[language].assets.stocks,
            value: stocksReal >= 0 ? stocksReal : 0,
        },
        {
            name: languages[language].assets.etf,
            value: etfReal >= 0 ? etfReal : 0,
        },
        {
            name: languages[language].assets.bank,
            value: bankReal >= 0 ? bankReal : 0,
        },
        {
            name: languages[language].assets.cash,
            value: cashReal >= 0 ? cashReal : 0,
        },
        {
            name: languages[language].assets.crypto,
            value: cryptoReal >= 0 ? cryptoReal : 0,
        },
        {
            name: languages[language].assets.bitcoin,
            value: bitcoinReal >= 0 ? bitcoinReal : 0,
        },
        {
            name: languages[language].assets.digitalServices,
            value: digitalServicesReal >= 0 ? digitalServicesReal : 0,
        },
    ];

    const capitalShuffleData = [...capitalData].sort(() => Math.random() - 0.5);
    const totalCapitalData = capitalData.reduce(
        (acc, entry) => acc + entry.value,
        0,
    );

    // const fakeCapitalData = [
    //     { name: 'Azioni', value: 1000 },
    //     { name: 'ETF', value: 1000 },
    //     { name: 'Banca', value: 0 },
    //     { name: 'Banconote', value: 1000 },
    //     { name: 'Criptovalute', value: 1000 },
    //     { name: 'Bitcoin', value:1000 },
    //     { name: 'ServiziDigitali', value: 1000 },
    // ];

    // const totalFakeCapitalData = fakeCapitalData.reduce((acc, entry) => acc + entry.value, 0);

    const incExpData = [
        {
            name: languages[language].general.incomes,
            value: incomesMonth >= 0 ? incomesMonth : 0,
        },
        {
            name: languages[language].general.expenses,
            value: expensesMonth >= 0 ? expensesMonth : 0,
        },
        {
            name: languages[language].general.saved,
            value: savedMonth > 0 ? savedMonth : 0,
        },
    ];

    const incExpShuffleData = [...incExpData].sort(() => Math.random() - 0.5);

    // { fill: theme.textColor, formatter: (value) => isHidden ? '****' : value }

    const isAllZero = capitalData.every((entry) => entry.value === 0); //fakeCapitalData to test some change on the pie chart (main data is capitalData)

    // Filtra solo investimenti per il grafico investimenti
    const investmentsData = capitalData.filter(
        (entry) =>
            entry.name !== languages[language].assets.bank &&
            entry.name !== languages[language].assets.cash &&
            entry.name !== languages[language].assets.digitalServices,
    );

    // PieChart: filtra solo valori > 0
    const filteredPieData = (
        isHidden ? capitalShuffleData : capitalData
    ).filter((entry) => entry.value > 0);

    return (
        <SectionDashboard
            theme={theme}
            className="font-roboto pt-8 bg-paciGray px-4 overflow-hidden"
            style={{ 
                paddingBottom: "2rem",
                maxWidth: "100vw",
                boxSizing: "border-box",
                paddingTop: isMobileScreen ? "90px" : "2rem"
            }}
        >
            <StandardPageTitle theme={theme}>
                {languages[language].dashboard.title}
            </StandardPageTitle>
            <CapitalValue theme={theme}>
                {languages[language].dashboard.totalBalance}{" "}
                <span style={{ color: primaryColor }}>
                    {isHidden ? "****" : totalReal.toLocaleString("it-IT")} €
                </span>
            </CapitalValue>
            <UpperSection theme={theme}>
                <div className="analytic">
                    <div className="design">
                        <div
                            className="bankLogoCard mt-3 text-base md:text-2xl "
                            style={{ color: "#0D579B" }}
                        >
                            <BsBank />
                        </div>
                        <div className="actionUpdateBalance absolute top-1 right-1 md:top-2 md:right-2">
                            <Link
                                to="/insert-values"
                                title={
                                    languages[language].dashboard.updateValue
                                }
                            >
                                <AiOutlinePlusCircle
                                    style={{ color: secondaryColor }}
                                />
                            </Link>
                        </div>
                    </div>
                    <div className="bankCardTitle text-xs md:text-base p-2">
                        <h6>{languages[language].general.deposited}</h6>
                        <h6>
                            {languages[language].general.in}{" "}
                            {languages[language].assets.bank}
                        </h6>
                    </div>
                    <div className="bankCardValue">
                        <h5 className="text-xs md:text-base">
                            {isHidden
                                ? "****"
                                : bankReal.toLocaleString("it-IT")}{" "}
                            €
                        </h5>
                    </div>
                </div>

                <div className="analytic">
                    <div className="design">
                        <div
                            className="cashLogoCard mt-3 text-base md:text-2xl "
                            style={{ color: "#329239" }}
                        >
                            <BsCashCoin />
                        </div>
                        <div className="actionUpdateBalance absolute top-1 right-1 md:top-2 md:right-2">
                            <Link
                                to="/insert-values"
                                title={
                                    languages[language].dashboard.updateValue
                                }
                            >
                                <AiOutlinePlusCircle
                                    style={{ color: secondaryColor }}
                                />
                            </Link>
                        </div>
                    </div>
                    <div className="cashCardTitle text-xs md:text-base p-2">
                        <h6>{languages[language].assets.cash}</h6>
                    </div>
                    <div className="cashCardValue">
                        <h5 className="text-xs md:text-base">
                            {isHidden
                                ? "****"
                                : cashReal.toLocaleString("it-IT")}{" "}
                            €
                        </h5>
                    </div>
                </div>

                <div className="analytic">
                    <div className="design">
                        <div
                            className="digitalServicesLogoCard mt-3 text-base md:text-2xl "
                            style={{ color: "#74b9ff" }}
                        >
                            <SiMoneygram />
                        </div>
                        <div className="actionUpdateBalance absolute top-1 right-1 md:top-2 md:right-2">
                            <Link
                                to="/insert-values"
                                title={
                                    languages[language].dashboard.updateValue
                                }
                            >
                                <AiOutlinePlusCircle
                                    style={{ color: secondaryColor }}
                                />
                            </Link>
                        </div>
                    </div>
                    <div className="digitalServicesCardTitle text-xs md:text-base p-2">
                        <h6
                            dangerouslySetInnerHTML={{
                                __html: languages[language].assets
                                    .digitalServices,
                            }}
                        ></h6>
                        {/* <h6>Pagamenti digitali</h6> */}
                    </div>
                    <div className="digitalServicesValue">
                        <h5 className="text-xs md:text-base">
                            {isHidden
                                ? "****"
                                : digitalServicesReal.toLocaleString(
                                      "it-IT",
                                  )}{" "}
                            €
                        </h5>
                    </div>
                </div>
            </UpperSection>
            <LowerSection theme={theme}>
                {stocksReal !== 0 && (
                    <div className="analytic">
                        <div className="design">
                            <div
                                className="stocksLogoCard mt-3 text-base md:text-2xl "
                                style={{ color: "#FF6600" }}
                            >
                                <MdOutlineAutoGraph />
                            </div>
                            <div className="actionUpdateBalance absolute top-1 right-1 md:top-2 md:right-2">
                                <Link
                                    to="/insert-values"
                                    title={
                                        languages[language].dashboard
                                            .updateValue
                                    }
                                >
                                    <AiOutlinePlusCircle
                                        style={{ color: secondaryColor }}
                                    />
                                </Link>
                            </div>
                        </div>
                        <div className="stocksCardTitle text-xs md:text-base p-2">
                            <h6>{languages[language].assets.stocks}</h6>
                        </div>
                        <div className="stocksCardValue">
                            <h5 className="text-xs md:text-base">
                                {isHidden
                                    ? "****"
                                    : stocksReal.toLocaleString("it-IT")}{" "}
                                €
                            </h5>
                        </div>
                    </div>
                )}
                {etfReal !== 0 && (
                    <div className="analytic">
                        <div className="design">
                            <div
                                className="etfLogoCard mt-3 text-base md:text-2xl "
                                style={{ color: "#a29bfe" }}
                            >
                                <AiOutlineStock />
                            </div>
                            <div className="actionUpdateBalance absolute top-1 right-1 md:top-2 md:right-2">
                                <Link
                                    to="/insert-values"
                                    title={
                                        languages[language].dashboard
                                            .updateValue
                                    }
                                >
                                    <AiOutlinePlusCircle
                                        style={{ color: secondaryColor }}
                                    />
                                </Link>
                            </div>
                        </div>
                        <div className="etfCardTitle text-xs md:text-base p-2">
                            <h6>{languages[language].assets.etf}</h6>
                        </div>
                        <div className="etfCardValue">
                            <h5 className="text-xs md:text-base">
                                {isHidden
                                    ? "****"
                                    : etfReal.toLocaleString("it-IT")}{" "}
                                €
                            </h5>
                        </div>
                    </div>
                )}

                {bitcoinReal !== 0 && (
                    <div className="analytic">
                        <div className="design">
                            <div
                                className="bitcoinLogoCard mt-3 text-base md:text-2xl "
                                style={{ color: "#F7B510" }}
                            >
                                <FaBitcoin />
                            </div>
                            <div className="actionUpdateBalance absolute top-1 right-1 md:top-2 md:right-2">
                                <Link
                                    to="/insert-values"
                                    title={
                                        languages[language].dashboard
                                            .updateValue
                                    }
                                >
                                    <AiOutlinePlusCircle
                                        style={{ color: secondaryColor }}
                                    />
                                </Link>
                            </div>
                        </div>
                        <div className="bitcoinCardTitle text-xs md:text-base p-2">
                            <h6>{languages[language].assets.bitcoin}</h6>
                        </div>
                        <div className="bitcoinCardValue">
                            <h5 className="text-xs md:text-base">
                                {isHidden
                                    ? "****"
                                    : bitcoinReal.toLocaleString("it-IT")}{" "}
                                €
                            </h5>
                        </div>
                    </div>
                )}
                {cryptoReal !== 0 && (
                    <div className="analytic">
                        <div className="design">
                            <div
                                className="cryptoLogoCard mt-3 text-base md:text-2xl "
                                style={{ color: "#d63031" }}
                            >
                                <BsCoin />
                            </div>
                            <div className="actionUpdateBalance absolute top-1 right-1 md:top-2 md:right-2">
                                <Link
                                    to="/insert-values"
                                    title={
                                        languages[language].dashboard
                                            .updateValue
                                    }
                                >
                                    <AiOutlinePlusCircle
                                        style={{ color: secondaryColor }}
                                    />
                                </Link>
                            </div>
                        </div>
                        <div className="cryptoCardTitle text-xs md:text-base p-2">
                            <h6>{languages[language].assets.crypto}</h6>
                        </div>
                        <div className="cryptoCardValue">
                            <h5 className="text-xs md:text-base">
                                {isHidden
                                    ? "****"
                                    : cryptoReal.toLocaleString("it-IT")}{" "}
                                €
                            </h5>
                        </div>
                    </div>
                )}
            </LowerSection>
            <GraphsSection theme={theme}>
                <div className="bar-chart-section">
                    <h2 className="text-xs md:text-base">
                        {languages[language].dashboard.titleGraph}
                    </h2>
                    <div className="w-350 h-300 md:w-400 md:h-300">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                width={500}
                                height={300}
                                data={
                                    isHidden
                                        ? investmentsData.map((e) => ({
                                              ...e,
                                              value: Math.floor(
                                                  Math.random() * 1000,
                                              ),
                                          }))
                                        : investmentsData
                                }
                                margin={{
                                    top: 20,
                                    right: 15,
                                }}
                            >
                                <Bar dataKey="value">
                                    {investmentsData.map((entry) => {
                                        const greyScale = Math.floor(
                                            Math.random() * 256,
                                        );
                                        const greyColor = `rgb(${greyScale}, ${greyScale}, ${greyScale})`;
                                        return (
                                            <Cell
                                                key={entry.name}
                                                fill={
                                                    isHidden
                                                        ? greyColor
                                                        : colorsBalances[
                                                              entry.name
                                                          ]
                                                }
                                            />
                                        );
                                    })}
                                </Bar>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="transparent"
                                    vertical={false}
                                />
                                <Tooltip
                                    content={({ payload, label, active }) => {
                                        if (active) {
                                            const value = isHidden
                                                ? "****"
                                                : payload[0].payload.value;
                                            const formattedValue =
                                                new Intl.NumberFormat("it-IT", {
                                                    style: "currency",
                                                    currency: "EUR",
                                                    maximumFractionDigits: 0,
                                                }).format(value);
                                            return (
                                                <div
                                                    style={{
                                                        backgroundColor: "#fff",
                                                        color: "#079164",
                                                        borderRadius: "4px",
                                                        padding: "8px",
                                                    }}
                                                >
                                                    <p>
                                                        {isHidden
                                                            ? "****"
                                                            : label}
                                                    </p>
                                                    <p
                                                        style={{
                                                            color: "black",
                                                        }}
                                                    >
                                                        {isHidden
                                                            ? "****"
                                                            : formattedValue}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <XAxis
                                    dataKey="name"
                                    interval={0}
                                    tick={(props) => (
                                        <CustomTick
                                            {...props}
                                            textAnchor="middle"
                                            fill={theme.textColor}
                                            fontSize="12"
                                            dy="10"
                                        />
                                    )}
                                />
                                <YAxis
                                    tick={({ x, y, payload }) => (
                                        <text
                                            x={x - 18}
                                            y={y + 2}
                                            textAnchor="end"
                                            fill={theme.textColor}
                                            fontSize="11"
                                        >
                                            {payload.value}
                                        </text>
                                    )}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="pie-chart-section">
                    <div className="w-350 h-300 md:w-400 md:h-300">
                        <h2 className="text-xs md:text-base">
                            {languages[language].dashboard.titleGraph2}
                        </h2>
                        <ResponsiveContainer width="100%" height="100%">
                            {isAllZero ? (
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: "center",
                                        alignItems: "center",
                                        width: "100%",
                                        height: "300px",
                                        backgroundColor: "rgba(7, 145, 100, 0.05)",
                                        borderRadius: "16px",
                                        border: "2px dashed #079164",
                                        padding: "2rem",
                                        marginTop: "2rem",
                                        textAlign: "center"
                                    }}
                                >
                                    <div style={{
                                        backgroundColor: "#079164",
                                        borderRadius: "50%",
                                        width: "80px",
                                        height: "80px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: "1.5rem"
                                    }}>
                                        <HiOutlinePencilAlt
                                            style={{ 
                                                fontSize: "36px",
                                                color: "white"
                                            }}
                                        />
                                    </div>
                                    <h2 style={{ 
                                        color: "#079164",
                                        fontSize: "1.5rem",
                                        fontWeight: "600",
                                        marginBottom: "0.5rem",
                                        margin: 0
                                    }}>
                                        {languages[language].dashboard.noData}
                                    </h2>
                                    <p style={{
                                        color: theme.textColor,
                                        fontSize: "1rem",
                                        marginBottom: "2rem",
                                        lineHeight: "1.5",
                                        opacity: 0.8
                                    }}
                                        dangerouslySetInnerHTML={{
                                            __html: languages[language]
                                                .dashboard.noData2,
                                        }}
                                    ></p>
                                    <Link 
                                        to="/insert-values"
                                        style={{
                                            backgroundColor: "#079164",
                                            color: "white",
                                            padding: "12px 24px",
                                            borderRadius: "8px",
                                            textDecoration: "none",
                                            fontSize: "1rem",
                                            fontWeight: "500",
                                            transition: "all 0.3s ease",
                                            boxShadow: "0 4px 12px rgba(7, 145, 100, 0.3)"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 6px 20px rgba(7, 145, 100, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 4px 12px rgba(7, 145, 100, 0.3)';
                                        }}
                                    >
                                        {languages[language].dashboard.updateValue || "Inserisci i tuoi dati"}
                                    </Link>
                                </div>
                            ) : (
                                <PieChart
                                    width={500}
                                    height={550}
                                    margin={{
                                        top: 20,
                                        left: 60,
                                    }}
                                >
                                    <Pie
                                        data={filteredPieData}
                                        cx="25%"
                                        cy="35%"
                                        label={renderCustomizedLabel}
                                        labelLine={false}
                                        outerRadius={130}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {filteredPieData.map((entry) => {
                                            const greyScale = Math.floor(
                                                Math.random() * 256,
                                            );
                                            const greyColor = `rgb(${greyScale}, ${greyScale}, ${greyScale})`;
                                            return (
                                                <Cell
                                                    key={entry.name}
                                                    fill={
                                                        isHidden
                                                            ? greyColor
                                                            : colorsBalances[
                                                                  entry.name
                                                              ]
                                                    }
                                                />
                                            );
                                        })}
                                    </Pie>
                                    <Tooltip
                                        content={({ payload, active }) => {
                                            if (active) {
                                                const data = payload[0].payload;
                                                const value = isHidden
                                                    ? "****"
                                                    : data.value;
                                                const percentage = isHidden
                                                    ? "****"
                                                    : (
                                                          (data.value /
                                                              totalCapitalData) *
                                                          100
                                                      ).toFixed(0);
                                                const formattedValue =
                                                    new Intl.NumberFormat(
                                                        "it-IT",
                                                        {
                                                            style: "currency",
                                                            currency: "EUR",
                                                            maximumFractionDigits: 0,
                                                        },
                                                    ).format(data.value);
                                                return (
                                                    <div
                                                        className="custom-tooltip"
                                                        style={{
                                                            backgroundColor:
                                                                "#fff",
                                                            color: "#079164",
                                                            borderRadius: "4px",
                                                            padding: "8px",
                                                        }}
                                                    >
                                                        <p>
                                                            {isHidden
                                                                ? "****"
                                                                : data.name}
                                                        </p>
                                                        <p
                                                            style={{
                                                                color: "black",
                                                            }}
                                                        >
                                                            {formattedValue}(
                                                            {percentage}%)
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                        contentStyle={{
                                            backgroundColor: "#fff",
                                            color: "#079164",
                                            borderRadius: "4px",
                                            padding: "8px",
                                        }}
                                    />
                                </PieChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bar-chart-section">
                    <h2 className="text-xs md:text-base">
                        {languages[language].dashboard.titleGraph3}
                    </h2>
                    <div style={{ width: 350, height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                width={500}
                                height={300}
                                data={isHidden ? incExpShuffleData : incExpData}
                                margin={{
                                    top: 20,
                                    right: 40,
                                }}
                            >
                                <Bar dataKey="value">
                                    {incExpData.map((entry) => {
                                        const greyScale = Math.floor(
                                            Math.random() * 256,
                                        );
                                        const greyColor = `rgb(${greyScale}, ${greyScale}, ${greyScale})`;
                                        return (
                                            <Cell
                                                key={entry.name}
                                                fill={
                                                    isHidden
                                                        ? greyColor
                                                        : colorsIncExp[
                                                              entry.name
                                                          ]
                                                }
                                            />
                                        );
                                    })}
                                </Bar>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="transparent"
                                    vertical={false}
                                />
                                {/* <XAxis dataKey="name" interval={0} angle={0} textAnchor="middle" tick={{ fill: theme.textColor, fontSize: 14 }} />
                                    <YAxis tick={{ fill: theme.textColor }} /> */}
                                <XAxis
                                    dataKey="name"
                                    interval={0}
                                    tick={(props) => (
                                        <CustomTick
                                            {...props}
                                            textAnchor="middle"
                                            fill={theme.textColor}
                                            fontSize="12"
                                            dy="10"
                                        />
                                    )}
                                />
                                <YAxis
                                    tick={({ x, y, payload }) => (
                                        <text
                                            x={x - 18}
                                            y={y + 2}
                                            textAnchor="end"
                                            fill={theme.textColor}
                                            fontSize="11"
                                        >
                                            {payload.value}
                                        </text>
                                    )}
                                />

                                <Tooltip
                                    content={({ payload, label, active }) => {
                                        if (active) {
                                            const value = isHidden
                                                ? "****"
                                                : payload[0].payload.value;

                                            const formattedValue =
                                                new Intl.NumberFormat("it-IT", {
                                                    style: "currency",
                                                    currency: "EUR",
                                                    maximumFractionDigits: 0,
                                                }).format(value);

                                            return (
                                                <div
                                                    className="custom-tooltip"
                                                    style={{
                                                        backgroundColor: "#fff",
                                                        color: "#079164",
                                                        borderRadius: "4px",
                                                        padding: "8px",
                                                    }}
                                                >
                                                    <p>
                                                        {isHidden
                                                            ? "****"
                                                            : label}
                                                    </p>
                                                    <p
                                                        style={{
                                                            color: "black",
                                                        }}
                                                    >
                                                        {isHidden
                                                            ? "****"
                                                            : formattedValue}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        color: "#079164",
                                        borderRadius: "4px",
                                        padding: "8px",
                                    }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </GraphsSection>
        </SectionDashboard>
    );
}

export default Dashboard;