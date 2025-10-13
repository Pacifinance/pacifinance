import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ThemeContext } from "../contexts/ThemeContext";
import { PrivacyContext } from "../contexts/PrivacyContext";
import { LanguageContext } from "../contexts/LanguageContext";
import { UserContext } from "../contexts/UserContext";
import { MediaQueryContext } from "../contexts/MediaQueryContext";
import { useAuth } from "../hooks/useAuth";
import Sidebar from "../sections/Sidebar";
import ToggleModeButton from "../components/ToggleModeButton";
import PrivacyToggleModeButton from "../components/PrivacyToggleModeButton";
import languages from "../data/languages.json";
import { exportToCSV, exportToExcel, exportToJSON, exportToPDF } from "../utils/dataExport";
import {
    Section,
    TitleDashboard,
    MyButton,
    StyledSection,
    TitleSection,
    MuiCustomTextField,
    MuiCustomIconButton,
    MuiCustomInputAdornment,
    EyeVisibility,
    EyeVisibilityOff,
} from "../styles/MyStyled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBars,
    faTrashCan,
    faEye,
    faEyeSlash,
    faDownload,
    faFileExcel,
    faFileCsv,
    faFileAlt,
    faFilePdf,
    faPalette,
    faShieldAlt,
    faUserCog,
    faLanguage,
    faGlobe,
    faKey,
    faUserShield,
    faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";

const SettingsPage = () => {
    const { theme, toggleMode } = useContext(ThemeContext);
    const { mode } = theme;
    const { isHidden, toggleHidden } = useContext(PrivacyContext);
    const { language, toggleLanguage } = useContext(LanguageContext);
    // Usa l'hook unificato che gestisce sia UserContext che MockAuth
    const auth = useAuth();
    const { userData, handleSetIsAuthenticated } = auth;
    const { isMobileScreen } = useContext(MediaQueryContext);
    const navigate = useNavigate();

    const [showChangeID, setShowChangeID] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showDeleteAccount, setShowDeleteAccount] = useState(false);
    const [password, setPassword] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newID, setNewID] = useState("");
    const [showIDResult, setShowIDResult] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [exportLoading, setExportLoading] = useState(false);
    
    // Stati per il filtro dati export
    const [exportFilter, setExportFilter] = useState("all"); // "all", "last12", "specific"
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");

    const userType = userData?.userType || "";

    // Genera opzioni per mesi e anni
    const months = [
        { value: 1, label: language === 'it' ? 'Gennaio' : 'January' },
        { value: 2, label: language === 'it' ? 'Febbraio' : 'February' },
        { value: 3, label: language === 'it' ? 'Marzo' : 'March' },
        { value: 4, label: language === 'it' ? 'Aprile' : 'April' },
        { value: 5, label: language === 'it' ? 'Maggio' : 'May' },
        { value: 6, label: language === 'it' ? 'Giugno' : 'June' },
        { value: 7, label: language === 'it' ? 'Luglio' : 'July' },
        { value: 8, label: language === 'it' ? 'Agosto' : 'August' },
        { value: 9, label: language === 'it' ? 'Settembre' : 'September' },
        { value: 10, label: language === 'it' ? 'Ottobre' : 'October' },
        { value: 11, label: language === 'it' ? 'Novembre' : 'November' },
        { value: 12, label: language === 'it' ? 'Dicembre' : 'December' }
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i); // Ultimi 5 anni

    const handleGenerateID = async (event) => {
        event.preventDefault();
        try {
            const data = { password: password };
            const response = await axios.post("/user/set-id", data, {
                withCredentials: true,
            });
            const newIDValue = response.data.new_id;
            setNewID(newIDValue);
            setShowIDResult(true);
            setPassword("");
            setShowChangeID(false);
            setSuccessMessage(
                languages[language].sidebar.changeID.successPopup.message +
                    newIDValue,
            );
            setTimeout(() => setSuccessMessage(""), 5000);
        } catch (error) {
            console.log(error);
            setErrorMessage("Errore nel cambio ID");
            setTimeout(() => setErrorMessage(""), 5000);
        }
    };

    const handleChangePassword = async (event) => {
        event.preventDefault();
        try {
            if (password === confirmPassword) {
                const data = {
                    old_pwd: oldPassword,
                    new_pwd: password,
                    repeated_pwd: confirmPassword,
                };
                const response = await axios.post("/user/set-password", data, {
                    withCredentials: true,
                });
                if (response.status === 200) {
                    setShowChangePassword(false);
                    setPassword("");
                    setOldPassword("");
                    setConfirmPassword("");
                    setSuccessMessage(
                        languages[language].sidebar.changePassword.successPopup
                            .message,
                    );
                    setTimeout(() => setSuccessMessage(""), 5000);
                } else {
                    setErrorMessage("Cambio password fallito");
                    setTimeout(() => setErrorMessage(""), 5000);
                }
            }
        } catch (error) {
            console.log(error);
            setErrorMessage("Errore nel cambio password");
            setTimeout(() => setErrorMessage(""), 5000);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const response = await axios.post("/user/delete", {
                withCredentials: true,
            });
            if (response.status === 200) {
                handleSetIsAuthenticated(false);
                navigate("/");
            } else {
                setErrorMessage("Eliminazione account fallita");
                setTimeout(() => setErrorMessage(""), 5000);
            }
        } catch (error) {
            console.error(error);
            setErrorMessage("Errore nell'eliminazione account");
            setTimeout(() => setErrorMessage(""), 5000);
        }
    };

    // Funzioni per l'export dei dati
    const handleExportData = async (format) => {
        setExportLoading(true);
        console.log('Settings Export Debug:', {
            format,
            userData,
            userDataKeys: userData ? Object.keys(userData) : 'null',
            userId: userData?.userId,
            userType: userData?.userType,
            isValidUserData: userData && typeof userData === 'object'
        });
        
        try {
            // Verifica che userData sia valido
            if (!userData || typeof userData !== 'object') {
                throw new Error('Dati utente non disponibili per l\'export');
            }

            let completeUserData = userData;

            // Se l'utente è reale (non mock), fai una richiesta API per ottenere tutti i dati
            if (userData.userType !== 'mock') {
                console.log('Fetching complete user data from API...');
                try {
                    const response = await fetch('/user/alldata', {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const apiUserData = await response.json();
                    
                    // Usa direttamente i dati dall'API
                    completeUserData = apiUserData;
                } catch (apiError) {
                    console.error('Error fetching complete user data:', apiError);
                    // Se l'API fallisce, usa i dati già disponibili nel context
                    console.log('Using context data as fallback');
                }
            }
            
            // Prepara il filtro per l'export
            const filterOptions = {
                type: exportFilter,
                month: selectedMonth ? parseInt(selectedMonth) : null,
                year: selectedYear ? parseInt(selectedYear) : null
            };

            switch (format) {
                case 'csv':
                    await exportToCSV(completeUserData, language, filterOptions);
                    break;
                case 'excel':
                    await exportToExcel(completeUserData, language, filterOptions);
                    break;
                case 'json':
                    exportToJSON(completeUserData, language, filterOptions);
                    break;
                case 'pdf':
                    await exportToPDF(completeUserData, language, filterOptions);
                    break;
                default:
                    throw new Error('Formato non supportato');
            }
            setSuccessMessage(
                language === 'it' 
                    ? `Dati esportati con successo in formato ${format.toUpperCase()}!`
                    : `Data successfully exported in ${format.toUpperCase()} format!`
            );
            setTimeout(() => setSuccessMessage(""), 5000);
        } catch (error) {
            console.error('Errore durante l\'export:', error);
            
            let errorMsg = language === 'it' 
                ? 'Errore durante l\'esportazione dei dati' 
                : 'Error during data export';
                
            // Messaggi di errore più specifici
            if (error.message.includes('HTTP error')) {
                errorMsg = language === 'it'
                    ? 'Errore di connessione al server'
                    : 'Server connection error';
            } else if (error.message.includes('Dati utente non disponibili')) {
                errorMsg = language === 'it'
                    ? 'Dati utente non disponibili'
                    : 'User data not available';
            }
            
            setErrorMessage(errorMsg);
            setTimeout(() => setErrorMessage(""), 5000);
        } finally {
            setExportLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            {!isMobileScreen && (
                <Sidebar
                    userData={userData}
                    handleSetIsUpdated={() => {}}
                    handleSetIsAuthenticated={handleSetIsAuthenticated}
                />
            )}

            <Section
                theme={theme}
                style={{
                    marginLeft: "0",
                    width: "100%",
                }}
            >
                {isMobileScreen && (
                    <Sidebar
                        userData={userData}
                        handleSetIsUpdated={() => {}}
                        handleSetIsAuthenticated={handleSetIsAuthenticated}
                    />
                )}

                <StyledSection theme={theme}>
                    <TitleDashboard
                        theme={theme}
                        style={{
                            textAlign: "center",
                            fontSize: isMobileScreen ? "1.8rem" : "2.2rem",
                            marginBottom: "2rem",
                            background: "linear-gradient(135deg, #079164 0%, #0a9c73 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            fontWeight: "bold"
                        }}
                    >
                        <FontAwesomeIcon icon={faUserCog} style={{ marginRight: "0.5rem" }} />
                        {languages[language].sidebar.settings.title}
                    </TitleDashboard>

                    {successMessage && (
                        <div
                            style={{
                                backgroundColor: "#d4edda",
                                color: "#155724",
                                padding: "1rem",
                                borderRadius: "12px",
                                margin: "1rem 0",
                                textAlign: "center",
                                border: "1px solid #c3e6cb",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                            }}
                        >
                            {successMessage}
                        </div>
                    )}

                    {errorMessage && (
                        <div
                            style={{
                                backgroundColor: "#f8d7da",
                                color: "#721c24",
                                padding: "1rem",
                                borderRadius: "12px",
                                margin: "1rem 0",
                                textAlign: "center",
                                border: "1px solid #f5c6cb",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                            }}
                        >
                            {errorMessage}
                        </div>
                    )}

                    <div
                        style={{
                            maxWidth: "900px",
                            margin: "0 auto",
                            padding: isMobileScreen ? "1rem" : "2rem",
                        }}
                    >
                        {/* Data Export Section */}
                        <div
                            style={{
                                marginBottom: "2rem",
                                padding: "2rem",
                                backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
                                borderRadius: "16px",
                                border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                                backdropFilter: "blur(10px)",
                            }}
                        >
                            <h3 style={{ 
                                marginBottom: "1.5rem", 
                                color: theme.textColor,
                                fontSize: "1.4rem",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center"
                            }}>
                                <FontAwesomeIcon icon={faDownload} style={{ 
                                    marginRight: "0.75rem",
                                    color: theme.buttonBackgroundColor 
                                }} />
                                {language === "it" ? "Esportazione Dati" : "Data Export"}
                            </h3>
                            <p style={{ 
                                color: theme.textColor, 
                                marginBottom: "1.5rem",
                                fontSize: "1rem",
                                lineHeight: "1.5"
                            }}>
                                {language === "it" 
                                    ? "Scarica tutti i tuoi dati dalla piattaforma in diversi formati"
                                    : "Download all your platform data in different formats"}
                            </p>

                            {/* Filtri Export */}
                            <div style={{
                                backgroundColor: theme.cardColor,
                                border: `1px solid ${theme.borderColor}`,
                                borderRadius: "12px",
                                padding: "1.5rem",
                                marginBottom: "2rem"
                            }}>
                                <h4 style={{ 
                                    color: theme.textColor, 
                                    marginBottom: "1rem",
                                    fontSize: "1.1rem"
                                }}>
                                    {language === "it" ? "Filtro Dati" : "Data Filter"}
                                </h4>
                                
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: isMobileScreen ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))",
                                    gap: "1rem",
                                    alignItems: "end"
                                }}>
                                    <div>
                                        <label style={{ 
                                            color: theme.textColor, 
                                            fontSize: "0.9rem",
                                            marginBottom: "0.5rem",
                                            display: "block"
                                        }}>
                                            {language === "it" ? "Periodo" : "Period"}
                                        </label>
                                        <select
                                            value={exportFilter}
                                            onChange={(e) => setExportFilter(e.target.value)}
                                            style={{
                                                width: "100%",
                                                padding: "0.75rem",
                                                border: `1px solid ${theme.borderColor}`,
                                                borderRadius: "8px",
                                                backgroundColor: theme.inputBackground,
                                                color: "#000000",
                                                fontSize: "0.9rem"
                                            }}
                                        >
                                            <option value="all" style={{ color: "#000000", backgroundColor: "#ffffff" }}>
                                                {language === "it" ? "Tutti i dati" : "All data"}
                                            </option>
                                            <option value="last12" style={{ color: "#000000", backgroundColor: "#ffffff" }}>
                                                {language === "it" ? "Ultimi 12 mesi" : "Last 12 months"}
                                            </option>
                                            <option value="specific" style={{ color: "#000000", backgroundColor: "#ffffff" }}>
                                                {language === "it" ? "Mese specifico" : "Specific month"}
                                            </option>
                                        </select>
                                    </div>

                                    {exportFilter === "specific" && (
                                        <>
                                            <div>
                                                <label style={{ 
                                                    color: theme.textColor, 
                                                    fontSize: "0.9rem",
                                                    marginBottom: "0.5rem",
                                                    display: "block"
                                                }}>
                                                    {language === "it" ? "Mese" : "Month"}
                                                </label>
                                                <select
                                                    value={selectedMonth}
                                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                                    style={{
                                                        width: "100%",
                                                        padding: "0.75rem",
                                                        border: `1px solid ${theme.borderColor}`,
                                                        borderRadius: "8px",
                                                        backgroundColor: theme.inputBackground,
                                                        color: "#000000",
                                                        fontSize: "0.9rem"
                                                    }}
                                                >
                                                    <option value="" style={{ color: "#000000", backgroundColor: "#ffffff" }}>
                                                        {language === "it" ? "Seleziona mese" : "Select month"}
                                                    </option>
                                                    {months.map(month => (
                                                        <option key={month.value} value={month.value} style={{ color: "#000000", backgroundColor: "#ffffff" }}>
                                                            {month.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label style={{ 
                                                    color: theme.textColor, 
                                                    fontSize: "0.9rem",
                                                    marginBottom: "0.5rem",
                                                    display: "block"
                                                }}>
                                                    {language === "it" ? "Anno" : "Year"}
                                                </label>
                                                <select
                                                    value={selectedYear}
                                                    onChange={(e) => setSelectedYear(e.target.value)}
                                                    style={{
                                                        width: "100%",
                                                        padding: "0.75rem",
                                                        border: `1px solid ${theme.borderColor}`,
                                                        borderRadius: "8px",
                                                        backgroundColor: theme.inputBackground,
                                                        color: "#000000",
                                                        fontSize: "0.9rem"
                                                    }}
                                                >
                                                    <option value="" style={{ color: "#000000", backgroundColor: "#ffffff" }}>
                                                        {language === "it" ? "Seleziona anno" : "Select year"}
                                                    </option>
                                                    {years.map(year => (
                                                        <option key={year} value={year} style={{ color: "#000000", backgroundColor: "#ffffff" }}>
                                                            {year}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: isMobileScreen ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))",
                                gap: "1rem",
                            }}>
                                {/* CSV Export */}
                                <MyButton
                                    onClick={() => handleExportData('csv')}
                                    disabled={exportLoading}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: "1rem",
                                        borderRadius: "12px",
                                        backgroundColor: exportLoading ? "#d3d3d3" : "#28a745",
                                        color: "white",
                                        fontSize: "0.95rem",
                                        fontWeight: "500",
                                        transition: "all 0.3s ease",
                                        boxShadow: "0 4px 15px rgba(40, 167, 69, 0.3)"
                                    }}
                                >
                                    <FontAwesomeIcon icon={faFileCsv} style={{ marginRight: "0.5rem" }} />
                                    CSV
                                </MyButton>

                                {/* Excel Export */}
                                <MyButton
                                    onClick={() => handleExportData('excel')}
                                    disabled={exportLoading}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: "1rem",
                                        borderRadius: "12px",
                                        backgroundColor: exportLoading ? "#d3d3d3" : "#217346",
                                        color: "white",
                                        fontSize: "0.95rem",
                                        fontWeight: "500",
                                        transition: "all 0.3s ease",
                                        boxShadow: "0 4px 15px rgba(33, 115, 70, 0.3)"
                                    }}
                                >
                                    <FontAwesomeIcon icon={faFileExcel} style={{ marginRight: "0.5rem" }} />
                                    Excel
                                </MyButton>

                                {/* JSON Export */}
                                <MyButton
                                    onClick={() => handleExportData('json')}
                                    disabled={exportLoading}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: "1rem",
                                        borderRadius: "12px",
                                        backgroundColor: exportLoading ? "#d3d3d3" : "#17a2b8",
                                        color: "white",
                                        fontSize: "0.95rem",
                                        fontWeight: "500",
                                        transition: "all 0.3s ease",
                                        boxShadow: "0 4px 15px rgba(23, 162, 184, 0.3)"
                                    }}
                                >
                                    <FontAwesomeIcon icon={faFileAlt} style={{ marginRight: "0.5rem" }} />
                                    JSON
                                </MyButton>

                                {/* PDF Export */}
                                <MyButton
                                    onClick={() => handleExportData('pdf')}
                                    disabled={exportLoading}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: "1rem",
                                        borderRadius: "12px",
                                        backgroundColor: exportLoading ? "#d3d3d3" : "#dc3545",
                                        color: "white",
                                        fontSize: "0.95rem",
                                        fontWeight: "500",
                                        transition: "all 0.3s ease",
                                        boxShadow: "0 4px 15px rgba(220, 53, 69, 0.3)"
                                    }}
                                >
                                    <FontAwesomeIcon icon={faFilePdf} style={{ marginRight: "0.5rem" }} />
                                    PDF
                                </MyButton>
                            </div>

                            {exportLoading && (
                                <div style={{
                                    textAlign: "center",
                                    marginTop: "1rem",
                                    color: theme.textColor,
                                    fontSize: "0.9rem",
                                    fontStyle: "italic"
                                }}>
                                    {language === "it" ? "Esportazione in corso..." : "Exporting data..."}
                                </div>
                            )}
                        </div>

                        {/* Theme Settings */}
                        <div
                            style={{
                                marginBottom: "2rem",
                                padding: "2rem",
                                backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
                                borderRadius: "16px",
                                border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                                backdropFilter: "blur(10px)",
                            }}
                        >
                            <h3 style={{ 
                                marginBottom: "1.5rem", 
                                color: theme.textColor,
                                fontSize: "1.4rem",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center"
                            }}>
                                <FontAwesomeIcon icon={faPalette} style={{ 
                                    marginRight: "0.75rem",
                                    color: theme.buttonBackgroundColor 
                                }} />
                                {languages[language].sidebar.settings.themeSection ||
                                    (language === "it" ? "Tema e Aspetto" : "Theme and Appearance")}
                            </h3>
                            
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "1.5rem",
                            }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "1rem",
                                        backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                        borderRadius: "12px",
                                        border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`
                                    }}
                                >
                                    <div>
                                        <label style={{
                                            fontWeight: "600",
                                            color: theme.textColor,
                                            fontSize: "1rem",
                                            display: "block",
                                            marginBottom: "0.25rem"
                                        }}>
                                            {languages[language].sidebar.settings.light}
                                        </label>
                                        <span style={{
                                            color: theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                                            fontSize: "0.85rem"
                                        }}>
                                            {language === "it" ? "Cambia tema scuro/chiaro" : "Switch dark/light theme"}
                                        </span>
                                    </div>
                                    <ToggleModeButton
                                        theme={theme}
                                        mode={mode}
                                        toggleMode={toggleMode}
                                    />
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "1rem",
                                        backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                        borderRadius: "12px",
                                        border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`
                                    }}
                                >
                                    <div>
                                        <label style={{
                                            fontWeight: "600",
                                            color: theme.textColor,
                                            fontSize: "1rem",
                                            display: "block",
                                            marginBottom: "0.25rem"
                                        }}>
                                            {languages[language].sidebar.settings.privacy}
                                        </label>
                                        <span style={{
                                            color: theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                                            fontSize: "0.85rem"
                                        }}>
                                            {language === "it" ? "Nascondi importi nei grafici" : "Hide amounts in charts"}
                                        </span>
                                    </div>
                                    <PrivacyToggleModeButton
                                        theme={theme}
                                        mode={mode}
                                        toggleHidden={toggleHidden}
                                        isHidden={isHidden}
                                    />
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "1rem",
                                        backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                        borderRadius: "12px",
                                        border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`
                                    }}
                                >
                                    <div>
                                        <label style={{
                                            fontWeight: "600",
                                            color: theme.textColor,
                                            fontSize: "1rem",
                                            display: "block",
                                            marginBottom: "0.25rem"
                                        }}>
                                            <FontAwesomeIcon icon={faLanguage} style={{ marginRight: "0.5rem" }} />
                                            {languages[language].sidebar.settings.language}
                                        </label>
                                        <span style={{
                                            color: theme.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                                            fontSize: "0.85rem"
                                        }}>
                                            {language === "it" ? "Cambia lingua interfaccia" : "Change interface language"}
                                        </span>
                                    </div>
                                    <MyButton
                                        theme={theme}
                                        onClick={toggleLanguage}
                                        style={{
                                            padding: "0.75rem 1.5rem",
                                            borderRadius: "10px",
                                            fontWeight: "600",
                                            fontSize: "0.9rem",
                                            minWidth: "80px"
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faGlobe} style={{ marginRight: "0.5rem" }} />
                                        {language === "it" ? "IT" : "EN"}
                                    </MyButton>
                                </div>
                            </div>
                        </div>

                        {/* Security Settings */}
                        <div
                            style={{
                                marginBottom: "2rem",
                                padding: "2rem",
                                backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
                                borderRadius: "16px",
                                border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                                backdropFilter: "blur(10px)",
                            }}
                        >
                            <h3 style={{ 
                                marginBottom: "1.5rem", 
                                color: theme.textColor,
                                fontSize: "1.4rem",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center"
                            }}>
                                <FontAwesomeIcon icon={faUserShield} style={{ 
                                    marginRight: "0.75rem",
                                    color: theme.buttonBackgroundColor 
                                }} />
                                {languages[language].sidebar.settings.securitySection ||
                                    (language === "it" ? "Sicurezza" : "Security")}
                            </h3>

                            <div style={{ marginBottom: "1.5rem" }}>
                                <MyButton
                                    theme={theme}
                                    onClick={() =>
                                        setShowChangeID(!showChangeID)
                                    }
                                    disabled={["test", "demo"].includes(
                                        userType,
                                    )}
                                    style={{
                                        width: "100%",
                                        padding: "1rem",
                                        borderRadius: "12px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "1rem",
                                        fontWeight: "500",
                                        backgroundColor: [
                                            "test",
                                            "demo",
                                        ].includes(userType)
                                            ? "#d3d3d3"
                                            : theme.buttonBackgroundColor,
                                        boxShadow: ["test", "demo"].includes(userType) 
                                            ? "none" 
                                            : "0 4px 15px rgba(7, 145, 100, 0.3)",
                                        transition: "all 0.3s ease"
                                    }}
                                >
                                    <FontAwesomeIcon icon={faKey} style={{ marginRight: "0.75rem" }} />
                                    {languages[language].sidebar.changeID.title}
                                </MyButton>

                                {showChangeID && (
                                    <form
                                        onSubmit={handleGenerateID}
                                        style={{
                                            marginTop: "1rem",
                                            padding: "1rem",
                                            backgroundColor: "white",
                                            borderRadius: "8px",
                                        }}
                                    >
                                        <MuiCustomTextField
                                            theme={theme}
                                            label="Password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            required
                                            fullWidth
                                            InputProps={{
                                                endAdornment: (
                                                    <MuiCustomInputAdornment position="end">
                                                        <MuiCustomIconButton
                                                            theme={theme}
                                                            onClick={() =>
                                                                setShowPassword(
                                                                    !showPassword,
                                                                )
                                                            }
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    showPassword
                                                                        ? faEye
                                                                        : faEyeSlash
                                                                }
                                                            />
                                                        </MuiCustomIconButton>
                                                    </MuiCustomInputAdornment>
                                                ),
                                            }}
                                        />
                                        <MyButton
                                            type="submit"
                                            theme={theme}
                                            style={{ marginTop: "1rem" }}
                                        >
                                            {
                                                languages[language].sidebar
                                                    .changeID.confirmButton
                                            }
                                        </MyButton>
                                    </form>
                                )}
                            </div>

                            <div style={{ marginBottom: "1.5rem" }}>
                                <MyButton
                                    theme={theme}
                                    onClick={() =>
                                        setShowChangePassword(
                                            !showChangePassword,
                                        )
                                    }
                                    disabled={["test", "demo"].includes(
                                        userType,
                                    )}
                                    style={{
                                        width: "100%",
                                        padding: "1rem",
                                        borderRadius: "12px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "1rem",
                                        fontWeight: "500",
                                        backgroundColor: [
                                            "test",
                                            "demo",
                                        ].includes(userType)
                                            ? "#d3d3d3"
                                            : theme.buttonBackgroundColor,
                                        boxShadow: ["test", "demo"].includes(userType) 
                                            ? "none" 
                                            : "0 4px 15px rgba(7, 145, 100, 0.3)",
                                        transition: "all 0.3s ease"
                                    }}
                                >
                                    <FontAwesomeIcon icon={faShieldAlt} style={{ marginRight: "0.75rem" }} />
                                    {languages[language].sidebar.changePassword.title}
                                </MyButton>

                                {showChangePassword && (
                                    <form
                                        onSubmit={handleChangePassword}
                                        style={{
                                            marginTop: "1rem",
                                            padding: "1rem",
                                            backgroundColor: "white",
                                            borderRadius: "8px",
                                        }}
                                    >
                                        <MuiCustomTextField
                                            theme={theme}
                                            label={
                                                languages[language].sidebar
                                                    .changePassword.oldPassword
                                            }
                                            type={
                                                showOldPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={oldPassword}
                                            onChange={(e) =>
                                                setOldPassword(e.target.value)
                                            }
                                            required
                                            fullWidth
                                            style={{ marginBottom: "1rem" }}
                                            InputProps={{
                                                endAdornment: (
                                                    <MuiCustomInputAdornment position="end">
                                                        <MuiCustomIconButton
                                                            theme={theme}
                                                            onClick={() =>
                                                                setShowOldPassword(
                                                                    !showOldPassword,
                                                                )
                                                            }
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    showOldPassword
                                                                        ? faEye
                                                                        : faEyeSlash
                                                                }
                                                            />
                                                        </MuiCustomIconButton>
                                                    </MuiCustomInputAdornment>
                                                ),
                                            }}
                                        />
                                        <MuiCustomTextField
                                            theme={theme}
                                            label={
                                                languages[language].sidebar
                                                    .changePassword.newPassword
                                            }
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            required
                                            fullWidth
                                            style={{ marginBottom: "1rem" }}
                                            InputProps={{
                                                endAdornment: (
                                                    <MuiCustomInputAdornment position="end">
                                                        <MuiCustomIconButton
                                                            theme={theme}
                                                            onClick={() =>
                                                                setShowPassword(
                                                                    !showPassword,
                                                                )
                                                            }
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    showPassword
                                                                        ? faEye
                                                                        : faEyeSlash
                                                                }
                                                            />
                                                        </MuiCustomIconButton>
                                                    </MuiCustomInputAdornment>
                                                ),
                                            }}
                                        />
                                        <MuiCustomTextField
                                            theme={theme}
                                            label={
                                                languages[language].sidebar
                                                    .changePassword
                                                    .confirmPassword
                                            }
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={confirmPassword}
                                            onChange={(e) =>
                                                setConfirmPassword(
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            fullWidth
                                            style={{ marginBottom: "1rem" }}
                                            InputProps={{
                                                endAdornment: (
                                                    <MuiCustomInputAdornment position="end">
                                                        <MuiCustomIconButton
                                                            theme={theme}
                                                            onClick={() =>
                                                                setShowConfirmPassword(
                                                                    !showConfirmPassword,
                                                                )
                                                            }
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    showConfirmPassword
                                                                        ? faEye
                                                                        : faEyeSlash
                                                                }
                                                            />
                                                        </MuiCustomIconButton>
                                                    </MuiCustomInputAdornment>
                                                ),
                                            }}
                                        />
                                        <MyButton type="submit" theme={theme}>
                                            {
                                                languages[language].sidebar
                                                    .changePassword
                                                    .confirmButton
                                            }
                                        </MyButton>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div
                            style={{
                                marginBottom: "2rem",
                                padding: "2rem",
                                backgroundColor: theme.mode === 'dark' ? 'rgba(220, 53, 69, 0.1)' : '#fff5f5',
                                borderRadius: "16px",
                                border: `2px solid ${theme.mode === 'dark' ? 'rgba(220, 53, 69, 0.3)' : '#feb2b2'}`,
                                boxShadow: "0 8px 32px rgba(220, 53, 69, 0.15)",
                            }}
                        >
                            <h3 style={{
                                marginBottom: "1.5rem",
                                color: "#dc3545",
                                fontSize: "1.4rem",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center"
                            }}>
                                <FontAwesomeIcon icon={faExclamationTriangle} style={{ 
                                    marginRight: "0.75rem",
                                    color: "#dc3545" 
                                }} />
                                {languages[language].sidebar.settings.dangerZone ||
                                    (language === "it" ? "Zona Pericolosa" : "Danger Zone")}
                            </h3>
                            
                            <div style={{
                                backgroundColor: theme.mode === 'dark' ? 'rgba(220, 53, 69, 0.05)' : 'rgba(220, 53, 69, 0.05)',
                                padding: "1rem",
                                borderRadius: "12px",
                                marginBottom: "1.5rem",
                                border: `1px solid ${theme.mode === 'dark' ? 'rgba(220, 53, 69, 0.2)' : 'rgba(220, 53, 69, 0.1)'}`
                            }}>
                                <p style={{
                                    color: "#dc3545",
                                    fontSize: "0.9rem",
                                    margin: "0",
                                    fontWeight: "500"
                                }}>
                                    {language === "it" 
                                        ? "⚠️ Attenzione: L'eliminazione dell'account è irreversibile e cancellerà tutti i tuoi dati."
                                        : "⚠️ Warning: Account deletion is irreversible and will delete all your data."}
                                </p>
                            </div>

                            <MyButton
                                onClick={() =>
                                    setShowDeleteAccount(!showDeleteAccount)
                                }
                                disabled={["test", "demo"].includes(userType)}
                                style={{
                                    width: "100%",
                                    padding: "1rem",
                                    borderRadius: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1rem",
                                    fontWeight: "600",
                                    backgroundColor: ["test", "demo"].includes(userType)
                                        ? "#d3d3d3"
                                        : "#dc3545",
                                    color: "white",
                                    border: "none",
                                    boxShadow: ["test", "demo"].includes(userType) 
                                        ? "none" 
                                        : "0 4px 15px rgba(220, 53, 69, 0.4)",
                                    transition: "all 0.3s ease"
                                }}
                            >
                                <FontAwesomeIcon
                                    icon={faTrashCan}
                                    style={{ marginRight: "0.75rem" }}
                                />
                                {languages[language].sidebar.settings.deleteAccount}
                            </MyButton>

                            {showDeleteAccount && (
                                <div
                                    style={{
                                        marginTop: "1rem",
                                        padding: "1rem",
                                        backgroundColor: "white",
                                        borderRadius: "8px",
                                    }}
                                >
                                    <p
                                        style={{
                                            color: "#dc3545",
                                            marginBottom: "1rem",
                                        }}
                                    >
                                        {
                                            languages[language].sidebar
                                                .deleteAccount.info
                                        }
                                    </p>
                                    <div
                                        style={{ display: "flex", gap: "1rem" }}
                                    >
                                        <MyButton
                                            onClick={handleDeleteAccount}
                                            style={{
                                                backgroundColor: "#dc3545",
                                                color: "white",
                                            }}
                                        >
                                            {
                                                languages[language].sidebar
                                                    .deleteAccount.confirmButton
                                            }
                                        </MyButton>
                                        <MyButton
                                            onClick={() =>
                                                setShowDeleteAccount(false)
                                            }
                                            theme={theme}
                                        >
                                            {
                                                languages[language].sidebar
                                                    .deleteAccount.cancelButton
                                            }
                                        </MyButton>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ 
                            textAlign: "center",
                            marginTop: "3rem",
                            padding: "2rem",
                            backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                            borderRadius: "16px",
                            border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                        }}>
                            <MyButton
                                theme={theme}
                                onClick={() => navigate("/dashboard")}
                                style={{
                                    padding: "1rem 2rem",
                                    borderRadius: "12px",
                                    fontSize: "1.1rem",
                                    fontWeight: "600",
                                    boxShadow: "0 6px 20px rgba(7, 145, 100, 0.3)",
                                    transition: "all 0.3s ease"
                                }}
                            >
                                {languages[language].sidebar.settings.backToDashboard || "Torna alla Dashboard"}
                            </MyButton>
                        </div>
                    </div>
                </StyledSection>
            </Section>
        </div>
    );
};

export default SettingsPage;
