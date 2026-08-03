import React, { useState, useRef, useContext, useEffect } from "react";
import { useLocalizedNavigate } from "../hooks/useLocalizedNavigate";
import { useServices } from "../contexts/ServiceContext";
// import { CopyToClipboard } from "react-copy-to-clipboard";
import InfoIcon from "@mui/icons-material/Info";
import { ThemeContext } from "../contexts/ThemeContext";
import { LanguageContext } from "../contexts/LanguageContext";
import { useToast } from "../contexts/ToastContext";
import { UserContext } from "../contexts/UserContext";
import { openPrintableRecoveryCard, downloadRecoveryCardText } from "../utils/recoveryCard";

//for the modal and styled components
import {
    SignUp,
    SignUpButton,
    MuiCustomDialog,
    MuiCustomButton,
    MuiCustomDialogTitle,
    MuiCustomDialogContent,
    MuiCustomDialogContentText,
    MuiCustomDialogActions,
    MuiCustomTextField,
    MuiCustomIconButton,
    MuiCustomInputAdornment,
    EyeVisibility,
    EyeVisibilityOff,
} from "../styles/MyStyled";

let generated_user_id = "";
let generated_recovery_base32 = "";
let generated_recovery_words = "";

// Cloudflare Turnstile configuration
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || import.meta.env.REACT_APP_TURNSTILE_SITE_KEY;
const IS_DEV = import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true';

// export { generated_user_id };
export default function SignUpForm() {
    const { theme } = useContext(ThemeContext);
    const { language, translations } = useContext(LanguageContext);
    const { showError } = useToast();
    const { userService } = useServices();
    const { handleSetIsAuthenticated } = useContext(UserContext);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [copiedCodeField, setCopiedCodeField] = useState<"block" | "words" | null>(null);
    const [turnstileToken, setTurnstileToken] = useState("");
    const [isTurnstileLoaded, setIsTurnstileLoaded] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const turnstileRef = useRef<any>(null);
    const turnstileWidgetIdRef = useRef<any>(null);

    const navigate = useLocalizedNavigate();

    // Turnstile callback functions
    const onTurnstileSuccess = (token) => {
        setTurnstileToken(token);
        setIsTurnstileLoaded(true);
    };

    const onTurnstileError = (errorCode) => {
        const isDomainError = String(errorCode) === "110200";
        const message = isDomainError
            ? "Dominio non autorizzato per questa chiave Cloudflare Turnstile. Controlla sitekey e Hostname Management."
            : "Si e' verificato un errore nella verifica di sicurezza. Riprova." + (errorCode ? " Codice: " + errorCode : "");

        console.error("Turnstile error", {
            code: errorCode,
            hostname: window.location.hostname,
            sitekeyPrefix: TURNSTILE_SITE_KEY ? String(TURNSTILE_SITE_KEY).slice(0, 8) + "..." : "missing",
        });
        showError(
            `
            <div>
                <strong>Errore di Sicurezza</strong><br/>
                ${message}
            </div>
        `,
            isDomainError ? 7000 : 3000,
        );
        setTurnstileToken("");
        setIsTurnstileLoaded(false);
    };

    const onTurnstileExpired = () => {
        setTurnstileToken("");
        setIsTurnstileLoaded(false);
        // Automatically refresh the challenge
        if (window.turnstile && turnstileWidgetIdRef.current) {
            window.turnstile.reset(turnstileWidgetIdRef.current);
        }
    };

    // Initialize Turnstile when component mounts
    useEffect(() => {
        // Skip Turnstile in dev mode if no site key is configured
        if (!TURNSTILE_SITE_KEY && IS_DEV) {
            console.warn('[Dev] Turnstile sitekey not set — bypassing captcha');
            setTurnstileToken('dev-bypass-token');
            setIsTurnstileLoaded(true);
            return;
        }

        const initTurnstile = () => {
            if (window.turnstile && turnstileRef.current && TURNSTILE_SITE_KEY) {
                if (turnstileWidgetIdRef.current) {
                    try {
                        window.turnstile.remove(turnstileWidgetIdRef.current);
                    } catch (error) {
                        console.warn("Error removing previous Turnstile widget:", error);
                    }
                    turnstileWidgetIdRef.current = null;
                }

                turnstileWidgetIdRef.current = window.turnstile.render(turnstileRef.current, {
                    sitekey: TURNSTILE_SITE_KEY,
                    callback: onTurnstileSuccess,
                    "error-callback": onTurnstileError,
                    "expired-callback": onTurnstileExpired,
                    theme: theme.mode === "dark" ? "dark" : "light",
                });
            }
        };

        // Check if Turnstile is already loaded
        if (window.turnstile) {
            initTurnstile();
        } else {
            // Wait for Turnstile to load
            const checkTurnstile = setInterval(() => {
                if (window.turnstile) {
                    clearInterval(checkTurnstile);
                    initTurnstile();
                }
            }, 100);

            // Cleanup interval after 10 seconds
            setTimeout(() => {
                clearInterval(checkTurnstile);
                if (!window.turnstile) {
                    showError(
                        `
                        <div>
                            <strong>Errore di Caricamento</strong><br/>
                            Impossibile caricare il sistema di sicurezza. Ricarica la pagina.
                        </div>
                    `,
                        5000,
                    );
                }
            }, 10000);
        }

        return () => {
            // Cleanup on unmount
            if (window.turnstile && turnstileWidgetIdRef.current) {
                try {
                    window.turnstile.remove(turnstileWidgetIdRef.current);
                    turnstileWidgetIdRef.current = null;
                } catch (error) {
                    console.warn("Error removing Turnstile widget:", error);
                }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [theme.mode]);

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleConfirmPasswordChange = (event) => {
        setConfirmPassword(event.target.value);
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleToggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const copyToClipboard = () => {
        if ("clipboard" in navigator) {
            navigator.clipboard.writeText(generated_user_id);
            setIsCopied(true);
        }
        setIsCopied(true);
    };

    const copyRecoveryCode = (field: "block" | "words") => {
        const value = field === "block" ? generated_recovery_base32 : generated_recovery_words;
        if ("clipboard" in navigator) navigator.clipboard.writeText(value);
        setCopiedCodeField(field);
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

    const handleDownloadCard = () => {
        openPrintableRecoveryCard(
            { userId: generated_user_id, base32: generated_recovery_base32, words: generated_recovery_words },
            recoveryCardLabels(),
        );
    };

    const handleDownloadText = () => {
        downloadRecoveryCardText(
            { userId: generated_user_id, base32: generated_recovery_base32, words: generated_recovery_words },
            recoveryCardLabels(),
        );
    };

    const handleCloseSuccessModal = async () => {
        setShowSuccessModal(false);
        try {
            // Auto-login with the just-registered credentials
            const response = await userService.login(generated_user_id, password);
            if (response.status === 200) {
                handleSetIsAuthenticated(true);
                navigate('/dashboard');
            } else {
                navigate('/sign-in');
            }
        } catch (_error) {
            // If auto-login fails, redirect to sign-in page
            navigate('/sign-in');
        }
    };

    const handleCopyAndClose = () => {
        copyToClipboard();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Check if Turnstile verification is complete
        if (!turnstileToken) {
            showError(
                `
                <div>
                    <strong>Verifica di Sicurezza Richiesta</strong><br/>
                    Attendi il completamento della verifica di sicurezza.
                </div>
            `,
                3000,
            );

            // Try to execute the challenge if not already done
            if (window.turnstile && turnstileWidgetIdRef.current) {
                window.turnstile.execute(turnstileWidgetIdRef.current);
            }
            return;
        }

        try {
            const response = await userService.register(password, confirmPassword, turnstileToken);
            if (response.status === 200) {
                generated_user_id = response.data.user_id;
                generated_recovery_base32 = response.data.recovery_code_base32 || "";
                generated_recovery_words = response.data.recovery_code_words || "";
                setShowSuccessModal(true);
                //window.umami.trackEvent('SignUp');
            } else {
                // alert("Si è verificato un errore nella registrazione del tuo account. Per favore riprova tra un istante.");
                showError(
                    `
                <div>
                    <strong>${translations.header.register.errorPopup.title}</strong><br/>
                    ${translations.header.register.errorPopup.message}<br/>
                    ${translations.header.register.errorPopup.message2}
                </div>
            `,
                    5000,
                );
            }
        } catch (_error) {
            // console.error(error);
            setPassword("");
            setConfirmPassword("");
            setTurnstileToken("");
            setIsTurnstileLoaded(false);

            // Reset Turnstile widget
            if (window.turnstile && turnstileWidgetIdRef.current) {
                window.turnstile.reset(turnstileWidgetIdRef.current);
            }

            showError(
                `
                <div>
                    <strong>${translations.header.register.errorPopup.title}</strong><br/>
                    ${translations.header.register.errorPopup.message}<br/>
                    ${translations.header.register.errorPopup.message2}
                </div>
            `,
                5000,
            );
            //   alert("Si è verificato un errore nella registrazione del tuo account. Per favore riprova tra un istante.");
        }
    };

    return (
        <div>
            {/* Registration Process Explanation */}
            <div 
                className="mb-6 p-4 rounded-lg border-l-4"
                style={{ 
                    borderLeftColor: theme.secondaryColor,
                    backgroundColor: theme.mode === "dark" ? `${theme.secondaryColor}15` : `${theme.secondaryColor}10`,
                    border: `1px solid ${theme.secondaryColor}30`
                }}
            >
                <div className="flex items-start space-x-3">
                    <InfoIcon 
                        style={{ color: theme.secondaryColor, marginTop: '2px' }} 
                        fontSize="small" 
                    />
                    <div className="text-sm">
                        <h4 className="font-semibold mb-2" style={{ color: theme.secondaryColor }}>
                            {language === 'it' ? 'Come funziona la registrazione' : 'How registration works'}
                        </h4>
                        <p className="opacity-90 mb-2">
                            {language === 'it' 
                                ? '🔐 Inserisci solo una password sicura - nessuna email richiesta'
                                : '🔐 Just enter a secure password - no email required'
                            }
                        </p>
                        <p className="opacity-90 mb-2">
                            {language === 'it'
                                ? '🎲 Il sistema genererà automaticamente un ID utente casuale'
                                : '🎲 The system will automatically generate a random User ID'
                            }
                        </p>
                        <p className="opacity-90">
                            {language === 'it'
                                ? '💾 Salva entrambi (ID + password) per accedere in futuro'
                                : '💾 Save both (ID + password) to access your account later'
                            }
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <form
                    id="signUp-PasswordConfirm"
                    className="space-y-4"
                    onSubmit={handleSubmit}
                >
                    <MuiCustomTextField
                        theme={theme}
                        id="passwordSignUp"
                        name="new-password"
                        label={translations.header.register.password}
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={handlePasswordChange}
                        required
                        fullWidth
                        inputProps={{
                            autoComplete: "new-password",
                            autoCapitalize: "off",
                            autoCorrect: "off",
                            spellCheck: false,
                        }}
                        InputProps={{
                            endAdornment: (
                                <MuiCustomInputAdornment
                                    theme={theme}
                                    position="end"
                                >
                                    <MuiCustomIconButton
                                        theme={theme}
                                        aria-label="toggle password visibility"
                                        onClick={handleTogglePasswordVisibility}
                                        onMouseDown={handleMouseDownPassword}
                                        className=""
                                    >
                                        {showPassword ? (
                                            <EyeVisibility />
                                        ) : (
                                            <EyeVisibilityOff />
                                        )}
                                    </MuiCustomIconButton>
                                </MuiCustomInputAdornment>
                            ),
                        }}
                    />
                    <MuiCustomTextField
                        theme={theme}
                        id="confirmPassword"
                        name="confirm-password"
                        label={
                            translations.header.register.confirmPassword
                        }
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        required
                        fullWidth
                        inputProps={{
                            autoComplete: "new-password",
                            autoCapitalize: "off",
                            autoCorrect: "off",
                            spellCheck: false,
                        }}
                        InputProps={{
                            endAdornment: (
                                <MuiCustomInputAdornment
                                    theme={theme}
                                    position="end"
                                >
                                    <MuiCustomIconButton
                                        theme={theme}
                                        aria-label="toggle password visibility"
                                        onClick={
                                            handleToggleConfirmPasswordVisibility
                                        }
                                        onMouseDown={handleMouseDownPassword}
                                        className=""
                                    >
                                        {showConfirmPassword ? (
                                            <EyeVisibility />
                                        ) : (
                                            <EyeVisibilityOff />
                                        )}
                                    </MuiCustomIconButton>
                                </MuiCustomInputAdornment>
                            ),
                        }}
                    />
                    {/* Cloudflare Turnstile widget (Managed mode) */}
                    <div ref={turnstileRef} style={{ margin: "10px 0" }}></div>

                    <div className="button-wrapper">
                        <SignUpButton
                            theme={theme}
                            data-umami-event="newUser"
                            type="submit"
                            disabled={!isTurnstileLoaded}
                            style={{
                                marginTop: "20px",
                                alignSelf: "center",
                                opacity: isTurnstileLoaded ? 1 : 0.7,
                                cursor: isTurnstileLoaded
                                    ? "pointer"
                                    : "not-allowed",
                            }}
                        >
                            {!isTurnstileLoaded
                                ? language === "it"
                                    ? "Verifica sicurezza..."
                                    : "Security check..."
                                : translations.header.register
                                      .titleButton}
                        </SignUpButton>
                    </div>
                </form>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <MuiCustomDialog
                    theme={theme}
                    open={showSuccessModal}
                    onClose={() => {}} // Prevent closing by clicking outside
                    aria-labelledby="success-dialog-title"
                    aria-describedby="success-dialog-description"
                    maxWidth="sm"
                    fullWidth
                >
                    <MuiCustomDialogTitle id="success-dialog-title">
                        {translations.header.register.successPopup.title}
                    </MuiCustomDialogTitle>
                    <MuiCustomDialogContent theme={theme}>
                        <MuiCustomDialogContentText id="success-dialog-description">
                            <div className="space-y-4">
                                <p>{translations.header.register.successPopup.message}</p>
                                
                                {/* ID Display Box */}
                                <div 
                                    className="p-4 rounded-lg border-2 text-center"
                                    style={{ 
                                        backgroundColor: theme.mode === "dark" ? `${theme.secondaryColor}15` : `${theme.secondaryColor}10`,
                                        borderColor: theme.secondaryColor,
                                        borderStyle: 'dashed'
                                    }}
                                >
                                    <div className="text-sm opacity-70 mb-1">
                                        {language === 'it' ? 'Il tuo ID utente generato:' : 'Your generated User ID:'}
                                    </div>
                                    <div 
                                        className="text-lg font-mono font-bold"
                                        style={{ color: theme.secondaryColor }}
                                    >
                                        {generated_user_id}
                                    </div>
                                </div>
                                
                                {/* Recovery Code Display Box */}
                                {generated_recovery_base32 && (
                                    <div
                                        className="p-4 rounded-lg border-2 text-center"
                                        style={{
                                            backgroundColor: theme.mode === "dark" ? `${theme.secondaryColor}15` : `${theme.secondaryColor}10`,
                                            borderColor: theme.secondaryColor,
                                            borderStyle: 'dashed'
                                        }}
                                    >
                                        <div className="text-sm opacity-70 mb-2">
                                            {translations.header.register.successPopup.recoveryIntro}
                                        </div>
                                        <div className="text-xs opacity-60 mb-1">{translations.header.register.successPopup.recoveryBlockLabel}</div>
                                        <div className="text-base font-mono font-bold mb-3" style={{ color: theme.secondaryColor }}>
                                            {generated_recovery_base32}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => copyRecoveryCode("block")}
                                            className="text-xs underline mb-3"
                                            style={{ color: theme.secondaryColor }}
                                        >
                                            {copiedCodeField === "block"
                                                ? translations.header.register.successPopup.copiedCode
                                                : translations.header.register.successPopup.copyCode}
                                        </button>
                                        <div className="text-xs opacity-60 mb-1">{translations.header.register.successPopup.recoveryWordsLabel}</div>
                                        <div className="text-sm font-mono font-bold mb-1" style={{ color: theme.secondaryColor }}>
                                            {generated_recovery_words}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => copyRecoveryCode("words")}
                                            className="text-xs underline"
                                            style={{ color: theme.secondaryColor }}
                                        >
                                            {copiedCodeField === "words"
                                                ? translations.header.register.successPopup.copiedCode
                                                : translations.header.register.successPopup.copyCode}
                                        </button>

                                        <div className="flex gap-2 justify-center mt-4">
                                            <button
                                                type="button"
                                                onClick={handleDownloadCard}
                                                className="text-xs px-3 py-2 rounded-lg font-semibold"
                                                style={{ backgroundColor: theme.secondaryColor, color: 'white' }}
                                            >
                                                {translations.header.register.successPopup.downloadCardButton}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleDownloadText}
                                                className="text-xs px-3 py-2 rounded-lg font-semibold border"
                                                style={{ borderColor: theme.secondaryColor, color: theme.secondaryColor }}
                                            >
                                                {translations.header.register.successPopup.downloadTextButton}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Warning */}
                                <div
                                    className="p-3 rounded-lg border-l-4 bg-orange-50 dark:bg-orange-900/20"
                                    style={{ borderLeftColor: '#ff9800' }}
                                >
                                    <div className="flex items-start space-x-2">
                                        <InfoIcon style={{ color: '#ff9800', fontSize: '20px', marginTop: '2px' }} />
                                        <div className="text-sm">
                                            <strong className="text-orange-600 dark:text-orange-400">
                                                {language === 'it' ? '⚠️ Importante!' : '⚠️ Important!'}
                                            </strong>
                                            <p className="mt-1 text-orange-700 dark:text-orange-300">
                                                {language === 'it'
                                                    ? 'Salva questo ID insieme alla password e al recovery code in un gestore di password sicuro (o scarica la scheda di recupero qui sopra).'
                                                    : 'Save this ID together with the password and recovery code in a secure password manager (or download the recovery card above).'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div dangerouslySetInnerHTML={{
                                    __html: translations.header.register.successPopup.securityMessage
                                }} />
                            </div>
                        </MuiCustomDialogContentText>
                    </MuiCustomDialogContent>
                    <MuiCustomDialogActions>
                        <MuiCustomButton onClick={handleCopyAndClose} autoFocus>
                            {isCopied ? 
                                (language === "it" ? "Copiato!" : "Copied!") : 
                                (language === "it" ? "Copia ID" : "Copy ID")
                            }
                        </MuiCustomButton>
                        <MuiCustomButton onClick={handleCloseSuccessModal}>
                            {language === "it" ? "Chiudi" : "Close"}
                        </MuiCustomButton>
                    </MuiCustomDialogActions>
                </MuiCustomDialog>
            )}
        </div>
    );
}
