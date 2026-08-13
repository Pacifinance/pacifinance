import React, { useContext, useState, useEffect, lazy, Suspense } from "react";

import { useLocalizedNavigate } from "../hooks/useLocalizedNavigate";
import { useDemoServices } from "../hooks/useDemoServices";
import { useAccountActions } from "../hooks/useAccountActions";
import { useToast } from "../contexts/ToastContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { PrivacyContext } from "../contexts/PrivacyContext";
import { LanguageContext } from "../contexts/LanguageContext";
import { CurrencyContext } from "../contexts/CurrencyContext";
import { UserContext } from "../contexts/UserContext";
import { CURRENCIES } from "../data/currencyConfig";
import { MESSAGE_AUTO_DISMISS_MS } from "../data/financeDefaults";
import { MediaQueryContext } from "../contexts/MediaQueryContext";
import { useAuth } from "../hooks/useAuth";
import { getCustomCategories, getIncomesTags, getOutflowsTags } from "../utils/userDataSelectors";
import { translateTag } from "../data/tagTranslations";

import Sidebar from "../sections/Sidebar";
import ToggleModeButton from "../components/ToggleModeButton";
import PWAInstallGuide from "../components/PWAInstallGuide";
import NotificationPreferences from "../sections/NotificationPreferences";
import LanguageSelector from "../components/LanguageSelector";
import SettingsGroup, { SettingsSubHeading, SettingsDivider } from "../components/SettingsGroup";
import SettingsRow from "../components/SettingsRow";
import { exportToCSV, exportToExcel, exportToJSON, exportToPDF } from "../utils/dataExport";
import Tooltip from "@mui/material/Tooltip";

const DataImportWizard = lazy(() => import("../sections/DataImportWizard"));
import {
    Section,
    TitleDashboard,
    MyButton,
    StyledSection,
    MuiCustomTextField,
    MuiCustomIconButton,
    MuiCustomInputAdornment,
    PrivacyToggleButton,
} from "../styles/MyStyled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
    faExclamationTriangle,
    faUpload,
    faCoins,
    faBug,
    faMobileScreen,
    faHistory,
    faTag,
    faPen,
    faCheck,
    faLifeRing
} from "@fortawesome/free-solid-svg-icons";
import { openPrintableRecoveryCard, downloadRecoveryCardText } from "../utils/recoveryCard";
import { usePastDateBalancePref, PAST_DATE_BALANCE_CHOICES } from "../hooks/usePastDateBalancePref";
import { usePrivacyDefaultPref, PRIVACY_DEFAULT_CHOICES } from "../hooks/usePrivacyDefaultPref";
import { useCryptoGroupingPref } from "../hooks/useCryptoGroupingPref";
import CryptoGroupingToggle from "../components/CryptoGroupingToggle";
import { GITHUB_ISSUES_URL } from "../data/externalLinks";

const SettingsPage = () => {
    const { theme, toggleMode } = useContext(ThemeContext);
    const { mode } = theme;
    const { isHidden, toggleHidden } = useContext(PrivacyContext);
    const { language, translations } = useContext(LanguageContext);
    const { currency, setCurrency, formatAmount, currencySymbol } = useContext(CurrencyContext);
    const auth = useAuth();
    const { userData, handleSetIsAuthenticated } = auth;
    const userContext = useContext(UserContext) || {};
    const { addCustomCategory, renameCustomCategory, deleteCustomCategory } = userContext;
    const { isMobileScreen } = useContext(MediaQueryContext);
    const navigate = useLocalizedNavigate();

    const { userService } = useDemoServices();
    const { showSuccess, showError } = useToast();

    // Past-date balance preference (used by insert flows)
    const { pref: pastDatePref, setPref: setPastDatePref } = usePastDateBalancePref();

    // Privacy mode default at login (secure by default; opt-in to remember the last choice)
    const { pref: privacyDefaultPref, setPref: setPrivacyDefaultPref } = usePrivacyDefaultPref();
    const { mode: cryptoGroupingMode, setMode: setCryptoGroupingMode } = useCryptoGroupingPref();

    // Shared account actions via DI hook
    const accountActions = useAccountActions({
        onSuccess: (key, value) => {
            if (key === 'recoveryCodeGenerated') {
                setRecoveryCodeResult(value);
                setRecoveryStatus({ configured: true, generatedAt: new Date().toISOString() });
                setSuccessMessage(translations.sidebar.recoveryCode.successPopup.message);
                setTimeout(() => setSuccessMessage(""), MESSAGE_AUTO_DISMISS_MS);
                return;
            }
            const messages = {
                passwordChanged: translations.sidebar.changePassword.successPopup.message,
                idGenerated: translations.sidebar.changeID.successPopup.message + value,
            };
            setSuccessMessage(messages[key] || '');
            setTimeout(() => setSuccessMessage(""), MESSAGE_AUTO_DISMISS_MS);
        },
        onError: (key) => {
            const messages = {
                deleteAccountFailed: translations.sidebar?.account?.errorDeleteAccount || "Eliminazione account fallita",
                deleteAccountError: translations.sidebar?.account?.errorDeleteAccount || "Errore nell'eliminazione account",
                passwordMismatch: translations.sidebar?.changePassword?.errorMismatch || "Le password non corrispondono",
                changePasswordFailed: translations.sidebar?.changePassword?.error || "Cambio password fallito",
                changePasswordError: translations.sidebar?.changePassword?.error || "Errore nel cambio password",
                generateIdError: translations.sidebar?.changeID?.error || "Errore nel cambio ID",
                generateRecoveryCodeError: translations.sidebar?.recoveryCode?.errorPopup?.message || "Errore nella generazione del recovery code",
            };
            setErrorMessage(messages[key] || key);
            setTimeout(() => setErrorMessage(""), MESSAGE_AUTO_DISMISS_MS);
        },
        onLogout: () => {
            handleSetIsAuthenticated(false);
            navigate("/");
        },
    });

    const [showChangeID, setShowChangeID] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showGenerateRecoveryCode, setShowGenerateRecoveryCode] = useState(false);
    // Its own password field — kept separate from Change ID/Change Password's
    // shared `password` state so the three forms can't clobber each other.
    const [recoveryPassword, setRecoveryPassword] = useState("");
    const [showRecoveryPassword, setShowRecoveryPassword] = useState(false);
    const [recoveryCodeResult, setRecoveryCodeResult] = useState(null);
    const [recoveryStatus, setRecoveryStatus] = useState(null);
    const [showDeleteAccount, setShowDeleteAccount] = useState(false);
    const [password, setPassword] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [exportLoading, setExportLoading] = useState(false);
    const [showImportWizard, setShowImportWizard] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editingCategoryLabel, setEditingCategoryLabel] = useState("");
    const [categoryBusyId, setCategoryBusyId] = useState(null);
    const [pendingDeleteCategoryId, setPendingDeleteCategoryId] = useState(null);
    const [newCategoryType, setNewCategoryType] = useState("expense");
    const [newCategoryParentIndex, setNewCategoryParentIndex] = useState("");
    const [newCategoryLabel, setNewCategoryLabel] = useState("");
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    // State for the export data filter
    const [exportFilter, setExportFilter] = useState("all");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");

    const userType = userData?.userType || "";
    const customCategories = getCustomCategories(userData);
    const outflowTags = getOutflowsTags(userData);
    const incomeTags = getIncomesTags(userData);

    const isDemo = ["test", "demo"].includes(userType);
    const demoTooltip = translations?.header?.demo?.disabledTooltip || 'This feature is disabled in the demo account. Sign up for free to unlock it!';

    useEffect(() => {
        if (isDemo) return;
        userService.getRecoveryCodeStatus()
            .then((status) => setRecoveryStatus({ configured: status.configured, generatedAt: status.generated_at }))
            .catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDemo]);

    // Guard to make sure theme and translations are available
    if (!theme || !translations || !translations.sidebar?.settings) {
        return null;
    }

    // Generate month and year options
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

    const getCategoryParentLabel = (category) => {
        const isIncome = category.parentType === 1;
        const parentTags = isIncome ? incomeTags : outflowTags;
        const parent = parentTags.find(tag => tag.index === category.parentIndex);
        if (!parent) return isIncome
            ? (language === "it" ? "Entrata" : "Income")
            : (language === "it" ? "Spesa" : "Expense");
        return translateTag(parent.label, language, isIncome ? "income" : "expense");
    };

    const categoryParentOptions = newCategoryType === "income" ? incomeTags : outflowTags;

    const handleCreateCategory = async () => {
        const label = newCategoryLabel.trim();
        const parentIndex = Number(newCategoryParentIndex);
        if (!label || !Number.isFinite(parentIndex) || !addCustomCategory) {
            showError(language === "it"
                ? "Scegli una categoria madre e inserisci un nome."
                : "Choose a parent category and enter a name.");
            return;
        }
        setIsCreatingCategory(true);
        try {
            await addCustomCategory({
                label,
                parent_index: parentIndex,
                is_expense: newCategoryType === "expense",
            });
            setNewCategoryLabel("");
            showSuccess(language === "it" ? "Categoria creata." : "Category created.");
        } catch {
            showError(language === "it" ? "Impossibile creare la categoria." : "Could not create category.");
        } finally {
            setIsCreatingCategory(false);
        }
    };

    const startRenamingCategory = (category) => {
        setEditingCategoryId(category.id);
        setEditingCategoryLabel(category.label);
        setPendingDeleteCategoryId(null);
    };

    const handleRenameCategory = async (category) => {
        const label = editingCategoryLabel.trim();
        if (!label || !renameCustomCategory) return;
        setCategoryBusyId(category.id);
        try {
            await renameCustomCategory({ id: category.id, label });
            setEditingCategoryId(null);
            setEditingCategoryLabel("");
            setPendingDeleteCategoryId(null);
            showSuccess(language === "it" ? "Categoria aggiornata." : "Category updated.");
        } catch {
            showError(language === "it" ? "Impossibile rinominare la categoria." : "Could not rename category.");
        } finally {
            setCategoryBusyId(null);
        }
    };

    const handleDeleteCategory = async (category) => {
        if (!deleteCustomCategory) return;
        if (pendingDeleteCategoryId !== category.id) {
            setPendingDeleteCategoryId(category.id);
            return;
        }
        setCategoryBusyId(category.id);
        try {
            await deleteCustomCategory(category.id);
            setPendingDeleteCategoryId(null);
            showSuccess(language === "it" ? "Categoria eliminata." : "Category deleted.");
        } catch {
            showError(language === "it" ? "Impossibile eliminare la categoria." : "Could not delete category.");
        } finally {
            setCategoryBusyId(null);
        }
    };

    const handleGenerateID = async (event) => {
        event.preventDefault();
        const newIdValue = await accountActions.generateNewId(password);
        if (newIdValue) {
            setPassword("");
            setShowChangeID(false);
        }
    };

    const handleChangePassword = async (event) => {
        event.preventDefault();
        const ok = await accountActions.changePassword(oldPassword, password, confirmPassword);
        if (ok) {
            setShowChangePassword(false);
            setPassword("");
            setOldPassword("");
            setConfirmPassword("");
        }
    };

    const handleDeleteAccount = async () => {
        await accountActions.deleteAccount();
    };

    const handleGenerateRecoveryCode = async (event) => {
        event.preventDefault();
        const code = await accountActions.generateRecoveryCode(recoveryPassword);
        if (code) {
            setRecoveryPassword("");
            // Keep the section open so the user can see/download the new code —
            // unlike Change ID/Change Password, which reset and collapse.
        }
    };

    const recoveryCardLabels = () => ({
        documentTitle: translations.recoveryCard.documentTitle,
        userIdLabel: translations.recoveryCard.userIdLabel,
        blockCodeLabel: translations.recoveryCard.blockCodeLabel,
        wordPhraseLabel: translations.recoveryCard.wordPhraseLabel,
        qrHint: translations.recoveryCard.qrHint,
        warningTitle: translations.recoveryCard.warningTitle,
        warningBody: translations.recoveryCard.warningBody,
        generatedOnLabel: translations.recoveryCard.generatedOnLabel,
    });

    const handleDownloadRecoveryCard = () => {
        if (!recoveryCodeResult) return;
        openPrintableRecoveryCard(
            { userId: userData?.userId || "", base32: recoveryCodeResult.base32, words: recoveryCodeResult.words },
            recoveryCardLabels(),
        );
    };

    const handleDownloadRecoveryText = () => {
        if (!recoveryCodeResult) return;
        downloadRecoveryCardText(
            { userId: userData?.userId || "", base32: recoveryCodeResult.base32, words: recoveryCodeResult.words },
            recoveryCardLabels(),
        );
    };

    // Data export functions
    const handleExportData = async (format) => {
        setExportLoading(true);

        try {
            if (!userData || typeof userData !== 'object') {
                throw new Error('User data not available for export');
            }

            let completeUserData = userData;

            // If the user is real (not mock), fetch all data from the API
            if (userData.userType !== 'mock') {
                try {
                    completeUserData = await userService.getAllData();
                } catch {
                    // If the API call fails, fall back to the data already in context
                    completeUserData = userData;
                }
            }

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
                    await exportToPDF(completeUserData, language, filterOptions, formatAmount, currencySymbol);
                    break;
                default:
                    throw new Error('Unsupported format');
            }
            showSuccess(
                language === 'it'
                    ? `Dati esportati con successo in formato ${format.toUpperCase()}!`
                    : `Data successfully exported in ${format.toUpperCase()} format!`
            );
        } catch (error) {
            let errorMsg = language === 'it'
                ? 'Errore durante l\'esportazione dei dati'
                : 'Error during data export';

            if (error.message?.includes('HTTP error') || error.message?.includes('Network')) {
                errorMsg = language === 'it'
                    ? 'Errore di connessione al server'
                    : 'Server connection error';
            } else if (error.message?.includes('User data not available')) {
                errorMsg = language === 'it'
                    ? 'Dati utente non disponibili'
                    : 'User data not available';
            }

            showError(errorMsg);
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
                            fontSize: isMobileScreen ? "1.4rem" : "1.7rem",
                            marginBottom: "1.25rem",
                            background: `linear-gradient(135deg, ${theme.secondaryColor} 0%, #0a9c73 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            fontWeight: "bold"
                        }}
                    >
                        <FontAwesomeIcon icon={faUserCog} style={{ marginRight: "0.5rem" }} />
                        {translations.sidebar.settings.title}
                    </TitleDashboard>

                    {successMessage && (
                        <div
                            style={{
                                backgroundColor: "#d4edda",
                                color: "#155724",
                                padding: "0.7rem 1rem",
                                borderRadius: "10px",
                                margin: "0.5rem 0",
                                textAlign: "center",
                                border: "1px solid #c3e6cb",
                                fontSize: "0.85rem",
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
                                padding: "0.7rem 1rem",
                                borderRadius: "10px",
                                margin: "0.5rem 0",
                                textAlign: "center",
                                border: "1px solid #f5c6cb",
                                fontSize: "0.85rem",
                            }}
                        >
                            {errorMessage}
                        </div>
                    )}

                    <div
                        style={{
                            maxWidth: "700px",
                            margin: "0 auto",
                            padding: isMobileScreen ? "0.5rem" : "1rem",
                        }}
                    >
                        {/* ═══ 1. Preferenze Generali — lingua, valuta, tema, comportamento inserimento ═══ */}
                        <SettingsGroup
                            theme={theme}
                            icon={faGlobe}
                            title={translations.sidebar.settings.generalSection || (language === "it" ? "Preferenze Generali" : "General Preferences")}
                        >
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                <SettingsRow
                                    theme={theme}
                                    icon={faLanguage}
                                    label={translations.sidebar.settings.language}
                                    subtitle={translations.sidebar?.settings?.languageSubtitle || "Change interface language"}
                                >
                                    <LanguageSelector theme={theme} variant="full" />
                                </SettingsRow>

                                <SettingsRow
                                    theme={theme}
                                    icon={faCoins}
                                    label={translations.sidebar.settings.currency}
                                    subtitle={translations.sidebar.settings.currencySubtitle}
                                >
                                    <select
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        style={{
                                            padding: "0.45rem 0.7rem",
                                            borderRadius: "8px",
                                            fontWeight: "600",
                                            fontSize: "0.8rem",
                                            border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                                            background: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#f5f5f5',
                                            color: theme.mode === 'dark' ? '#fff' : '#1a1a2e',
                                            cursor: "pointer",
                                            minWidth: "95px"
                                        }}
                                    >
                                        {Object.values(CURRENCIES).map(c => (
                                            <option key={c.code} value={c.code} style={{ color: "#1a1a2e", backgroundColor: "#ffffff" }}>
                                                {c.flag} {c.code} ({c.symbol})
                                            </option>
                                        ))}
                                    </select>
                                </SettingsRow>

                                <SettingsRow
                                    theme={theme}
                                    icon={faPalette}
                                    label={translations.sidebar.settings.light}
                                    subtitle={language === "it" ? "Cambia tema scuro/chiaro" : "Switch dark/light theme"}
                                >
                                    <ToggleModeButton
                                        theme={theme}
                                        mode={mode}
                                        toggleMode={toggleMode}
                                    />
                                </SettingsRow>
                            </div>

                            <SettingsDivider theme={theme} />

                            <SettingsSubHeading
                                theme={theme}
                                icon={faCoins}
                                description={translations.cryptoGrouping.settingsDescription}
                            >
                                {translations.cryptoGrouping.settingsTitle}
                            </SettingsSubHeading>
                            <CryptoGroupingToggle
                                theme={theme}
                                mode={cryptoGroupingMode}
                                onChange={setCryptoGroupingMode}
                                separateLabel={translations.cryptoGrouping.separate}
                                combinedLabel={translations.cryptoGrouping.combined}
                                explanation={translations.cryptoGrouping.explanation}
                            />

                            <SettingsDivider theme={theme} />

                            <NotificationPreferences theme={theme} />

                            <SettingsDivider theme={theme} />

                            <SettingsSubHeading
                                theme={theme}
                                icon={faHistory}
                                description={translations.sidebar.settings.pastDateBalanceSubtitle || (language === "it" ? "Scegli cosa succede quando inserisci spese o entrate con date di mesi precedenti" : "Choose what happens when you insert expenses or incomes with dates in previous months")}
                            >
                                {translations.sidebar.settings.pastDateBalance || (language === "it" ? "Impatto bilancio per date passate" : "Past-date balance impact")}
                            </SettingsSubHeading>
                            <select
                                value={pastDatePref}
                                onChange={(e) => setPastDatePref(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "0.6rem 0.75rem",
                                    borderRadius: "10px",
                                    border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
                                    backgroundColor: theme.mode === 'dark' ? '#1a1f2e' : '#ffffff',
                                    color: theme.mode === 'dark' ? '#ffffff' : '#1a1a2e',
                                    fontSize: "0.88rem",
                                    fontFamily: "inherit",
                                    cursor: "pointer",
                                }}
                            >
                                <option
                                    value={PAST_DATE_BALANCE_CHOICES.ASK}
                                    style={{ backgroundColor: theme.mode === 'dark' ? '#1a1f2e' : '#ffffff', color: theme.mode === 'dark' ? '#ffffff' : '#1a1a2e' }}
                                >
                                    {translations.sidebar.settings.pastDateBalanceAsk || (language === "it" ? "Chiedi ogni volta" : "Ask every time")}
                                </option>
                                <option
                                    value={PAST_DATE_BALANCE_CHOICES.NONE}
                                    style={{ backgroundColor: theme.mode === 'dark' ? '#1a1f2e' : '#ffffff', color: theme.mode === 'dark' ? '#ffffff' : '#1a1a2e' }}
                                >
                                    {translations.sidebar.settings.pastDateBalanceNone || (language === "it" ? "Nessun impatto sul bilancio" : "No balance impact")}
                                </option>
                                <option
                                    value={PAST_DATE_BALANCE_CHOICES.PAST_MONTH}
                                    style={{ backgroundColor: theme.mode === 'dark' ? '#1a1f2e' : '#ffffff', color: theme.mode === 'dark' ? '#ffffff' : '#1a1a2e' }}
                                >
                                    {translations.sidebar.settings.pastDateBalancePastMonth || (language === "it" ? "Aggiorna bilancio del mese" : "Update that month's balance")}
                                </option>
                            </select>
                        </SettingsGroup>

                        {/* ═══ 2. Privacy — hide amounts now + default at login ═══ */}
                        <SettingsGroup
                            theme={theme}
                            icon={faEyeSlash}
                            title={translations.sidebar.settings.privacySection || (language === "it" ? "Privacy" : "Privacy")}
                        >
                            <SettingsRow
                                theme={theme}
                                label={translations.sidebar.settings.privacy}
                                subtitle={translations.sidebar.settings.privacySubtitle || (language === "it" ? "Nascondi importi nei grafici" : "Hide amounts in charts")}
                            >
                                <PrivacyToggleButton
                                    theme={theme}
                                    $active={isHidden}
                                    onClick={toggleHidden}
                                    data-umami-event="setPrivacy-settings"
                                    aria-label={translations.sidebar.settings.privacy}
                                >
                                    <FontAwesomeIcon key={isHidden ? 'hidden' : 'visible'} icon={isHidden ? faEyeSlash : faEye} />
                                </PrivacyToggleButton>
                            </SettingsRow>

                            <SettingsDivider theme={theme} />

                            <SettingsSubHeading
                                theme={theme}
                                description={translations.sidebar.settings.privacyDefaultSubtitle || (language === "it" ? "Scegli se gli importi devono partire nascosti ogni volta che accedi" : "Choose whether amounts should start hidden every time you log in")}
                            >
                                {translations.sidebar.settings.privacyDefault || (language === "it" ? "Privacy all'accesso" : "Privacy at login")}
                            </SettingsSubHeading>
                            <select
                                value={privacyDefaultPref}
                                onChange={(e) => setPrivacyDefaultPref(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "0.6rem 0.75rem",
                                    borderRadius: "10px",
                                    border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
                                    backgroundColor: theme.mode === 'dark' ? '#1a1f2e' : '#ffffff',
                                    color: theme.mode === 'dark' ? '#ffffff' : '#1a1a2e',
                                    fontSize: "0.88rem",
                                    fontFamily: "inherit",
                                    cursor: "pointer",
                                }}
                            >
                                <option
                                    value={PRIVACY_DEFAULT_CHOICES.ALWAYS_HIDDEN}
                                    style={{ backgroundColor: theme.mode === 'dark' ? '#1a1f2e' : '#ffffff', color: theme.mode === 'dark' ? '#ffffff' : '#1a1a2e' }}
                                >
                                    {translations.sidebar.settings.privacyDefaultAlwaysHidden || (language === "it" ? "Nascondi sempre all'accesso (consigliato)" : "Always hidden at login (recommended)")}
                                </option>
                                <option
                                    value={PRIVACY_DEFAULT_CHOICES.REMEMBER_LAST}
                                    style={{ backgroundColor: theme.mode === 'dark' ? '#1a1f2e' : '#ffffff', color: theme.mode === 'dark' ? '#ffffff' : '#1a1a2e' }}
                                >
                                    {translations.sidebar.settings.privacyDefaultRememberLast || (language === "it" ? "Ricorda l'ultima scelta" : "Remember last choice")}
                                </option>
                            </select>
                        </SettingsGroup>

                        {/* ═══ 3. Categorie personalizzate — richiudibile, così tante voci non spingono giù il resto ═══ */}
                        <SettingsGroup
                            theme={theme}
                            icon={faTag}
                            title={language === "it" ? "Categorie personalizzate" : "Custom categories"}
                            description={language === "it"
                                ? "Puoi crearle mentre inserisci una spesa o un'entrata. Qui puoi rinominarle o eliminarle: le statistiche restano sempre sulla categoria madre."
                                : "Create them while adding an expense or income. Here you can rename or delete them: statistics always stay linked to the parent category."}
                            collapsible
                            defaultOpen={customCategories.length === 0}
                            badge={customCategories.length > 0 ? customCategories.length : undefined}
                        >
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: isMobileScreen ? "1fr" : "0.8fr 1.1fr 1.4fr auto",
                                gap: "0.5rem",
                                alignItems: "end",
                                padding: "0.7rem",
                                marginBottom: "0.75rem",
                                borderRadius: "10px",
                                backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}`
                            }}>
                                <div>
                                    <label style={{ display: "block", marginBottom: "0.25rem", color: theme.textColor, fontSize: "0.75rem", fontWeight: 600 }}>
                                        {language === "it" ? "Tipo" : "Type"}
                                    </label>
                                    <select
                                        value={newCategoryType}
                                        onChange={(e) => {
                                            setNewCategoryType(e.target.value);
                                            setNewCategoryParentIndex("");
                                        }}
                                        disabled={isCreatingCategory}
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem 0.6rem",
                                            borderRadius: "8px",
                                            border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.16)'}`,
                                            background: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#fff',
                                            color: theme.textColor,
                                            fontSize: "0.82rem"
                                        }}
                                    >
                                        <option value="expense" style={{ color: "#1a1a2e" }}>{language === "it" ? "Spesa" : "Expense"}</option>
                                        <option value="income" style={{ color: "#1a1a2e" }}>{language === "it" ? "Entrata" : "Income"}</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", marginBottom: "0.25rem", color: theme.textColor, fontSize: "0.75rem", fontWeight: 600 }}>
                                        {language === "it" ? "Categoria madre" : "Parent category"}
                                    </label>
                                    <select
                                        value={newCategoryParentIndex}
                                        onChange={(e) => setNewCategoryParentIndex(e.target.value)}
                                        disabled={isCreatingCategory}
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem 0.6rem",
                                            borderRadius: "8px",
                                            border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.16)'}`,
                                            background: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#fff',
                                            color: theme.textColor,
                                            fontSize: "0.82rem"
                                        }}
                                    >
                                        <option value="" style={{ color: "#1a1a2e" }}>
                                            {language === "it" ? "Scegli..." : "Choose..."}
                                        </option>
                                        {categoryParentOptions.map(tag => (
                                            <option key={`${newCategoryType}-${tag.index}`} value={tag.index} style={{ color: "#1a1a2e" }}>
                                                {translateTag(tag.label, language, newCategoryType)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", marginBottom: "0.25rem", color: theme.textColor, fontSize: "0.75rem", fontWeight: 600 }}>
                                        {language === "it" ? "Nome" : "Name"}
                                    </label>
                                    <input
                                        value={newCategoryLabel}
                                        onChange={(e) => setNewCategoryLabel(e.target.value)}
                                        maxLength={40}
                                        disabled={isCreatingCategory}
                                        placeholder={language === "it" ? "Es. Spesa casa" : "E.g. Home groceries"}
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem 0.6rem",
                                            borderRadius: "8px",
                                            border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.16)'}`,
                                            background: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#fff',
                                            color: theme.textColor,
                                            fontSize: "0.82rem",
                                            boxSizing: "border-box"
                                        }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCreateCategory}
                                    disabled={isCreatingCategory || !newCategoryLabel.trim() || newCategoryParentIndex === ""}
                                    style={{
                                        border: "none",
                                        borderRadius: "8px",
                                        padding: "0.55rem 0.9rem",
                                        background: theme.buttonBackgroundColor,
                                        color: "#fff",
                                        fontWeight: 700,
                                        cursor: isCreatingCategory ? "default" : "pointer",
                                        opacity: isCreatingCategory || !newCategoryLabel.trim() || newCategoryParentIndex === "" ? 0.6 : 1
                                    }}
                                >
                                    {language === "it" ? "Crea" : "Create"}
                                </button>
                            </div>

                            {customCategories.length === 0 ? (
                                <div style={{
                                    padding: "0.7rem 0.75rem",
                                    borderRadius: "10px",
                                    backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                    color: theme.mode === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)',
                                    fontSize: "0.82rem"
                                }}>
                                    {language === "it"
                                        ? "Nessuna categoria personalizzata. La prima la puoi creare dal menu categoria durante l'inserimento."
                                        : "No custom categories yet. Create the first one from the category menu while inserting a transaction."}
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    {customCategories.map(category => {
                                        const isEditing = editingCategoryId === category.id;
                                        const busy = categoryBusyId === category.id;
                                        return (
                                            <div
                                                key={category.id}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    gap: "0.75rem",
                                                    padding: "0.6rem 0.75rem",
                                                    backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                                    borderRadius: "10px",
                                                    border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}`
                                                }}
                                            >
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    {isEditing ? (
                                                        <input
                                                            value={editingCategoryLabel}
                                                            onChange={(e) => setEditingCategoryLabel(e.target.value)}
                                                            maxLength={40}
                                                            disabled={busy}
                                                            style={{
                                                                width: "100%",
                                                                padding: "0.45rem 0.6rem",
                                                                borderRadius: "8px",
                                                                border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.16)'}`,
                                                                background: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#fff',
                                                                color: theme.textColor,
                                                                fontSize: "0.85rem"
                                                            }}
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <>
                                                            <div style={{
                                                                color: theme.textColor,
                                                                fontSize: "0.9rem",
                                                                fontWeight: 600,
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                whiteSpace: "nowrap"
                                                            }}>
                                                                {category.label}
                                                            </div>
                                                            <div style={{
                                                                color: theme.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
                                                                fontSize: "0.72rem",
                                                                marginTop: "0.15rem"
                                                            }}>
                                                                {language === "it" ? "Madre:" : "Parent:"} {getCategoryParentLabel(category)}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                <div style={{ display: "flex", gap: "0.35rem", flexShrink: 0 }}>
                                                    {isEditing ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRenameCategory(category)}
                                                            disabled={busy || editingCategoryLabel.trim() === ""}
                                                            style={{
                                                                border: "none",
                                                                borderRadius: "8px",
                                                                padding: "0.45rem 0.6rem",
                                                                background: theme.buttonBackgroundColor,
                                                                color: "#fff",
                                                                cursor: busy ? "default" : "pointer"
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faCheck} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => startRenamingCategory(category)}
                                                            disabled={busy}
                                                            style={{
                                                                border: "none",
                                                                borderRadius: "8px",
                                                                padding: "0.45rem 0.6rem",
                                                                background: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                                                color: theme.textColor,
                                                                cursor: busy ? "default" : "pointer"
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faPen} />
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteCategory(category)}
                                                        disabled={busy}
                                                        style={{
                                                            border: "none",
                                                            borderRadius: "8px",
                                                            padding: "0.45rem 0.6rem",
                                                            background: theme.mode === 'dark' ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.1)',
                                                            color: theme.dangerColor,
                                                            cursor: busy ? "default" : "pointer"
                                                        }}
                                                    >
                                                        {pendingDeleteCategoryId === category.id
                                                            ? (language === "it" ? "Conferma" : "Confirm")
                                                            : <FontAwesomeIcon icon={faTrashCan} />}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </SettingsGroup>

                        {/* ═══ 4. Data Management — export / import ═══ */}
                        <SettingsGroup
                            theme={theme}
                            icon={faDownload}
                            title={translations.sidebar.settings.dataSection || (language === "it" ? "Gestione Dati" : "Data Management")}
                        >
                            <SettingsSubHeading
                                theme={theme}
                                description={language === "it" ? "Scarica i tuoi dati in diversi formati" : "Download your data in different formats"}
                            >
                                {language === "it" ? "Esporta" : "Export"}
                            </SettingsSubHeading>

                            <div style={{
                                backgroundColor: theme.cardColor,
                                border: `1px solid ${theme.borderColor}`,
                                borderRadius: "10px",
                                padding: "0.75rem",
                                marginBottom: "0.75rem"
                            }}>
                                <h4 style={{
                                    color: theme.textColor,
                                    marginBottom: "0.5rem",
                                    fontSize: "0.9rem"
                                }}>
                                    {language === "it" ? "Filtro Dati" : "Data Filter"}
                                </h4>

                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: isMobileScreen ? "1fr" : "repeat(auto-fit, minmax(160px, 1fr))",
                                    gap: "0.5rem",
                                    alignItems: "end"
                                }}>
                                    <div>
                                        <label style={{
                                            color: theme.textColor,
                                            fontSize: "0.8rem",
                                            marginBottom: "0.3rem",
                                            display: "block"
                                        }}>
                                            {language === "it" ? "Periodo" : "Period"}
                                        </label>
                                        <select
                                            value={exportFilter}
                                            onChange={(e) => setExportFilter(e.target.value)}
                                            style={{
                                                width: "100%",
                                                padding: "0.5rem",
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
                                gridTemplateColumns: isMobileScreen ? "1fr 1fr" : "repeat(4, 1fr)",
                                gap: "0.5rem",
                            }}>
                                {/* CSV Export */}
                                <MyButton
                                    onClick={() => handleExportData('csv')}
                                    disabled={exportLoading}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: "0.6rem",
                                        borderRadius: "8px",
                                        backgroundColor: exportLoading ? "#d3d3d3" : "#28a745",
                                        color: "white",
                                        fontSize: "0.8rem",
                                        fontWeight: "500",
                                        transition: "all 0.3s ease",
                                        boxShadow: "0 2px 8px rgba(40, 167, 69, 0.2)"
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
                                        padding: "0.6rem",
                                        borderRadius: "8px",
                                        backgroundColor: exportLoading ? "#d3d3d3" : "#217346",
                                        color: "white",
                                        fontSize: "0.8rem",
                                        fontWeight: "500",
                                        transition: "all 0.3s ease",
                                        boxShadow: "0 2px 8px rgba(33, 115, 70, 0.2)"
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
                                        padding: "0.6rem",
                                        borderRadius: "8px",
                                        backgroundColor: exportLoading ? "#d3d3d3" : "#17a2b8",
                                        color: "white",
                                        fontSize: "0.8rem",
                                        fontWeight: "500",
                                        transition: "all 0.3s ease",
                                        boxShadow: "0 2px 8px rgba(23, 162, 184, 0.2)"
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
                                        padding: "0.6rem",
                                        borderRadius: "8px",
                                        backgroundColor: exportLoading ? "#d3d3d3" : "#dc3545",
                                        color: "white",
                                        fontSize: "0.8rem",
                                        fontWeight: "500",
                                        transition: "all 0.3s ease",
                                        boxShadow: "0 2px 8px rgba(220, 53, 69, 0.2)"
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

                            <SettingsDivider theme={theme} />

                            <SettingsSubHeading
                                theme={theme}
                                description={translations.dataImport?.subtitle || (language === "it"
                                    ? "Importa le tue transazioni da CSV o Excel"
                                    : "Import your transactions from CSV or Excel")}
                            >
                                {translations.dataImport?.title || (language === "it" ? "Importa" : "Import")}
                            </SettingsSubHeading>

                            {!showImportWizard ? (
                                <MyButton
                                    theme={theme}
                                    onClick={() => setShowImportWizard(true)}
                                    style={{
                                        backgroundColor: theme.secondaryColor,
                                        color: "white",
                                        border: "none",
                                        padding: "0.8rem 1.5rem",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                    }}
                                    data-umami-event="import-wizard-opened"
                                >
                                    <FontAwesomeIcon icon={faUpload} />
                                    {translations.dataImport?.openWizard || (language === "it" ? "Importa da file" : "Import from file")}
                                </MyButton>
                            ) : (
                                <>
                                    <div style={{ textAlign: "right", marginBottom: "1rem" }}>
                                        <button
                                            onClick={() => setShowImportWizard(false)}
                                            style={{
                                                background: "none", border: "none", cursor: "pointer",
                                                color: theme.textColor, opacity: 0.5, fontSize: "0.85rem",
                                                textDecoration: "underline",
                                            }}
                                        >
                                            ✕ {language === "it" ? "Chiudi" : "Close"}
                                        </button>
                                    </div>
                                    <Suspense fallback={
                                        <div style={{ textAlign: "center", padding: "2rem", color: theme.textColor }}>
                                            {language === "it" ? "Caricamento..." : "Loading..."}
                                        </div>
                                    }>
                                        <DataImportWizard
                                            onClose={() => setShowImportWizard(false)}
                                            onImportComplete={() => setShowImportWizard(false)}
                                        />
                                    </Suspense>
                                </>
                            )}
                        </SettingsGroup>

                        {/* ═══ 5. Sicurezza — cambio ID e password ═══ */}
                        <SettingsGroup
                            theme={theme}
                            icon={faUserShield}
                            title={translations.sidebar.settings.securitySection || (language === "it" ? "Sicurezza" : "Security")}
                        >
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                <div>
                                    <Tooltip title={isDemo ? demoTooltip : ''} arrow placement="top">
                                    <span style={{ display: 'block', width: '100%' }}>
                                    <MyButton
                                        theme={theme}
                                        onClick={() =>
                                            setShowChangeID(!showChangeID)
                                        }
                                        disabled={isDemo}
                                        style={{
                                            width: "100%",
                                            padding: "0.7rem",
                                            borderRadius: "10px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "0.85rem",
                                            fontWeight: "500",
                                            backgroundColor: isDemo
                                                ? "#d3d3d3"
                                                : theme.buttonBackgroundColor,
                                            boxShadow: isDemo
                                                ? "none"
                                                : "0 2px 8px rgba(7, 145, 100, 0.25)",
                                            transition: "all 0.3s ease",
                                            pointerEvents: isDemo ? 'none' : 'auto'
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faKey} style={{ marginRight: "0.5rem" }} />
                                        {translations.sidebar.changeID.title}
                                    </MyButton>
                                    </span>
                                    </Tooltip>

                                {showChangeID && (
                                    <form
                                        onSubmit={handleGenerateID}
                                        style={{
                                            marginTop: "1rem",
                                            padding: "1rem",
                                            backgroundColor: theme.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)",
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
                                                translations.sidebar
                                                    .changeID.confirmButton
                                            }
                                        </MyButton>
                                    </form>
                                )}
                                </div>

                                <div>
                                    <Tooltip title={isDemo ? demoTooltip : ''} arrow placement="top">
                                    <span style={{ display: 'block', width: '100%' }}>
                                    <MyButton
                                        theme={theme}
                                        onClick={() =>
                                            setShowChangePassword(
                                                !showChangePassword,
                                            )
                                        }
                                        disabled={isDemo}
                                        style={{
                                            width: "100%",
                                            padding: "0.7rem",
                                            borderRadius: "10px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "0.85rem",
                                            fontWeight: "500",
                                            backgroundColor: isDemo
                                                ? "#d3d3d3"
                                                : theme.buttonBackgroundColor,
                                            boxShadow: isDemo
                                                ? "none"
                                                : "0 2px 8px rgba(7, 145, 100, 0.25)",
                                            transition: "all 0.3s ease",
                                            pointerEvents: isDemo ? 'none' : 'auto'
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faShieldAlt} style={{ marginRight: "0.5rem" }} />
                                        {translations.sidebar.changePassword.title}
                                    </MyButton>
                                    </span>
                                    </Tooltip>

                                {showChangePassword && (
                                    <form
                                        onSubmit={handleChangePassword}
                                        style={{
                                            marginTop: "1rem",
                                            padding: "1rem",
                                            backgroundColor: theme.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)",
                                            borderRadius: "8px",
                                        }}
                                    >
                                        <MuiCustomTextField
                                            theme={theme}
                                            label={
                                                translations.sidebar
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
                                                translations.sidebar
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
                                                translations.sidebar
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
                                                translations.sidebar
                                                    .changePassword
                                                    .confirmButton
                                            }
                                        </MyButton>
                                    </form>
                                )}
                                </div>

                                <div>
                                    <Tooltip title={isDemo ? demoTooltip : ''} arrow placement="top">
                                    <span style={{ display: 'block', width: '100%' }}>
                                    <MyButton
                                        theme={theme}
                                        onClick={() => setShowGenerateRecoveryCode(!showGenerateRecoveryCode)}
                                        disabled={isDemo}
                                        style={{
                                            width: "100%",
                                            padding: "0.7rem",
                                            borderRadius: "10px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "0.85rem",
                                            fontWeight: "500",
                                            backgroundColor: isDemo
                                                ? "#d3d3d3"
                                                : theme.buttonBackgroundColor,
                                            boxShadow: isDemo
                                                ? "none"
                                                : "0 2px 8px rgba(7, 145, 100, 0.25)",
                                            transition: "all 0.3s ease",
                                            pointerEvents: isDemo ? 'none' : 'auto'
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faLifeRing} style={{ marginRight: "0.5rem" }} />
                                        {translations.sidebar.recoveryCode.title}
                                    </MyButton>
                                    </span>
                                    </Tooltip>

                                {showGenerateRecoveryCode && (
                                    <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: theme.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)", borderRadius: "8px" }}>
                                        <p style={{ fontSize: "0.85rem", marginBottom: "0.8rem", color: "#333" }}>
                                            {recoveryStatus?.configured
                                                ? translations.sidebar.recoveryCode.statusConfigured.replace(
                                                    '{date}',
                                                    recoveryStatus.generatedAt ? new Date(recoveryStatus.generatedAt).toLocaleDateString() : ''
                                                )
                                                : translations.sidebar.recoveryCode.statusNotConfigured}
                                        </p>

                                        {!recoveryCodeResult && (
                                            <form onSubmit={handleGenerateRecoveryCode}>
                                                <MuiCustomTextField
                                                    theme={theme}
                                                    label={translations.sidebar.recoveryCode.passwordLabel}
                                                    type={showRecoveryPassword ? "text" : "password"}
                                                    value={recoveryPassword}
                                                    onChange={(e) => setRecoveryPassword(e.target.value)}
                                                    required
                                                    fullWidth
                                                    InputProps={{
                                                        endAdornment: (
                                                            <MuiCustomInputAdornment position="end">
                                                                <MuiCustomIconButton
                                                                    theme={theme}
                                                                    onClick={() => setShowRecoveryPassword(!showRecoveryPassword)}
                                                                >
                                                                    <FontAwesomeIcon icon={showRecoveryPassword ? faEye : faEyeSlash} />
                                                                </MuiCustomIconButton>
                                                            </MuiCustomInputAdornment>
                                                        ),
                                                    }}
                                                />
                                                {recoveryStatus?.configured && (
                                                    <p style={{ fontSize: "0.78rem", color: "#b45309", marginTop: "0.6rem" }}>
                                                        {translations.sidebar.recoveryCode.regenerateWarning}
                                                    </p>
                                                )}
                                                <MyButton type="submit" theme={theme} style={{ marginTop: "1rem" }}>
                                                    {recoveryStatus?.configured
                                                        ? translations.sidebar.recoveryCode.regenerateButton
                                                        : translations.sidebar.recoveryCode.generateButton}
                                                </MyButton>
                                            </form>
                                        )}

                                        {recoveryCodeResult && (
                                            <div
                                                className="p-3 rounded-lg border-2 text-center"
                                                style={{ borderColor: theme.buttonBackgroundColor, borderStyle: 'dashed' }}
                                            >
                                                <div style={{ fontSize: "0.75rem", opacity: 0.7, marginBottom: 4 }}>
                                                    {translations.recoveryCard.blockCodeLabel}
                                                </div>
                                                <div style={{ fontFamily: "monospace", fontWeight: 700, marginBottom: 8, color: theme.buttonBackgroundColor }}>
                                                    {recoveryCodeResult.base32}
                                                </div>
                                                <div style={{ fontSize: "0.75rem", opacity: 0.7, marginBottom: 4 }}>
                                                    {translations.recoveryCard.wordPhraseLabel}
                                                </div>
                                                <div style={{ fontFamily: "monospace", fontWeight: 700, marginBottom: 12, color: theme.buttonBackgroundColor, fontSize: "0.85rem" }}>
                                                    {recoveryCodeResult.words}
                                                </div>
                                                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                                                    <MyButton theme={theme} onClick={handleDownloadRecoveryCard} style={{ fontSize: "0.78rem", padding: "0.4rem 0.8rem" }}>
                                                        {translations.header.register.successPopup.downloadCardButton}
                                                    </MyButton>
                                                    <MyButton theme={theme} onClick={handleDownloadRecoveryText} style={{ fontSize: "0.78rem", padding: "0.4rem 0.8rem" }}>
                                                        {translations.header.register.successPopup.downloadTextButton}
                                                    </MyButton>
                                                    <MyButton theme={theme} onClick={() => setRecoveryCodeResult(null)} style={{ fontSize: "0.78rem", padding: "0.4rem 0.8rem" }}>
                                                        {translations.sidebar.recoveryCode.doneButton}
                                                    </MyButton>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                </div>
                            </div>
                        </SettingsGroup>

                        {/* ═══ 6. App e Assistenza — PWA install + bug report ═══ */}
                        <SettingsGroup
                            theme={theme}
                            icon={faMobileScreen}
                            title={translations.sidebar.settings.appSupportSection || (language === "it" ? "App e Assistenza" : "App & Support")}
                        >
                            <SettingsSubHeading
                                theme={theme}
                                description={translations.sidebar.settings.installAppSubtitle || (language === "it" ? "Aggiungi Pacifinance alla schermata home" : "Add Pacifinance to your home screen")}
                            >
                                {translations.sidebar.settings.installApp || (language === "it" ? "Installa come App" : "Install as App")}
                            </SettingsSubHeading>
                            <PWAInstallGuide variant="compact" />

                            <SettingsDivider theme={theme} />

                            <SettingsRow
                                theme={theme}
                                icon={faBug}
                                label={translations.sidebar.settings.bugReport || (language === "it" ? "Segnala un bug" : "Report a bug")}
                                subtitle={translations.sidebar.settings.bugReportSubtitle || (language === "it" ? "Apri una segnalazione su GitHub" : "Open a report on GitHub")}
                                href={GITHUB_ISSUES_URL}
                                external
                            />
                        </SettingsGroup>

                        {/* ═══ 7. Zona Pericolosa — eliminazione account ═══ */}
                        <SettingsGroup
                            theme={theme}
                            icon={faExclamationTriangle}
                            title={translations.sidebar.settings.dangerZone || (language === "it" ? "Zona Pericolosa" : "Danger Zone")}
                            danger
                        >
                            <div style={{
                                backgroundColor: theme.mode === 'dark' ? 'rgba(220, 53, 69, 0.05)' : 'rgba(220, 53, 69, 0.05)',
                                padding: "0.6rem 0.75rem",
                                borderRadius: "8px",
                                marginBottom: "0.75rem",
                                border: `1px solid ${theme.mode === 'dark' ? 'rgba(220, 53, 69, 0.2)' : 'rgba(220, 53, 69, 0.1)'}`
                            }}>
                                <p style={{
                                    color: "#dc3545",
                                    fontSize: "0.8rem",
                                    margin: "0",
                                    fontWeight: "500"
                                }}>
                                    {language === "it"
                                        ? "⚠️ Attenzione: L'eliminazione dell'account è irreversibile e cancellerà tutti i tuoi dati."
                                        : "⚠️ Warning: Account deletion is irreversible and will delete all your data."}
                                </p>
                            </div>

                            <Tooltip title={isDemo ? demoTooltip : ''} arrow placement="top">
                            <span style={{ display: 'block', width: '100%' }}>
                            <MyButton
                                onClick={() =>
                                    setShowDeleteAccount(!showDeleteAccount)
                                }
                                disabled={isDemo}
                                style={{
                                    width: "100%",
                                    padding: "0.7rem",
                                    borderRadius: "10px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.85rem",
                                    fontWeight: "600",
                                    backgroundColor: isDemo
                                        ? "#d3d3d3"
                                        : "#dc3545",
                                    color: "white",
                                    border: "none",
                                    boxShadow: isDemo
                                        ? "none"
                                        : "0 2px 8px rgba(220, 53, 69, 0.3)",
                                    transition: "all 0.3s ease",
                                    pointerEvents: isDemo ? 'none' : 'auto'
                                }}
                            >
                                <FontAwesomeIcon
                                    icon={faTrashCan}
                                    style={{ marginRight: "0.5rem" }}
                                />
                                {translations.sidebar.settings.deleteAccount}
                            </MyButton>
                            </span>
                            </Tooltip>

                            {showDeleteAccount && (
                                <div
                                    style={{
                                        marginTop: "1rem",
                                        padding: "1rem",
                                        backgroundColor: theme.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)",
                                        borderRadius: "8px",
                                    }}
                                >
                                    <p
                                        style={{
                                            color: theme.textColor,
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                                        {
                                            translations.sidebar
                                                .deleteAccount.info
                                        }
                                    </p>
                                    <ul
                                        style={{
                                            color: theme.textColor,
                                            fontSize: "0.85rem",
                                            paddingLeft: "1.2rem",
                                            marginBottom: "0.75rem",
                                        }}
                                    >
                                        {translations.sidebar.deleteAccount.consequences.map((item, index) => (
                                            <li key={index} style={{ marginBottom: "0.35rem", lineHeight: 1.4 }}>{item}</li>
                                        ))}
                                    </ul>
                                    <p
                                        style={{
                                            color: theme.textColor,
                                            fontSize: "0.85rem",
                                            marginBottom: "1rem",
                                        }}
                                    >
                                        {translations.sidebar.deleteAccount.dataKept}
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
                                                translations.sidebar
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
                                                translations.sidebar
                                                    .deleteAccount.cancelButton
                                            }
                                        </MyButton>
                                    </div>
                                </div>
                            )}
                        </SettingsGroup>
                    </div>
                </StyledSection>
            </Section>
        </div>
    );
};

export default SettingsPage;
