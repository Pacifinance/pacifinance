import React, { useState, useRef, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CopyToClipboard } from "react-copy-to-clipboard";
import InfoIcon from "@mui/icons-material/Info";
import { ThemeContext } from "../contexts/ThemeContext";
import { LanguageContext } from "../contexts/LanguageContext";
import { useToast } from "../contexts/ToastContext";
import languages from "../data/languages.json";

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

var generated_user_id = "";

// Cloudflare Turnstile configuration
const TURNSTILE_SITE_KEY = process.env.TURNSTILE_SITE_KEY;

// export { generated_user_id };
export default function SignUpForm() {
    const { theme } = useContext(ThemeContext);
    const { language } = useContext(LanguageContext);
    const { showSuccess, showError } = useToast();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState("");
    const [isTurnstileLoaded, setIsTurnstileLoaded] = useState(false);
    const inputRef = useRef(null);
    const turnstileRef = useRef(null);

    const navigate = useNavigate();

    // Turnstile callback functions
    const onTurnstileSuccess = (token) => {
        setTurnstileToken(token);
        setIsTurnstileLoaded(true);
    };

    const onTurnstileError = () => {
        showError(
            `
            <div>
                <strong>Errore di Sicurezza</strong><br/>
                Si è verificato un errore nella verifica di sicurezza. Riprova.
            </div>
        `,
            3000,
        );
        setTurnstileToken("");
        setIsTurnstileLoaded(false);
    };

    const onTurnstileExpired = () => {
        setTurnstileToken("");
        setIsTurnstileLoaded(false);
        // Automatically refresh the challenge
        if (window.turnstile && turnstileRef.current) {
            window.turnstile.reset(turnstileRef.current);
        }
    };

    // Initialize Turnstile when component mounts
    useEffect(() => {
        const initTurnstile = () => {
            if (window.turnstile && turnstileRef.current) {
                window.turnstile.render(turnstileRef.current, {
                    sitekey: TURNSTILE_SITE_KEY,
                    callback: onTurnstileSuccess,
                    "error-callback": onTurnstileError,
                    "expired-callback": onTurnstileExpired,
                    size: "invisible",
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
            if (window.turnstile && turnstileRef.current) {
                try {
                    window.turnstile.remove(turnstileRef.current);
                } catch (error) {
                    console.warn("Error removing Turnstile widget:", error);
                }
            }
        };
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
            if (window.turnstile && turnstileRef.current) {
                window.turnstile.execute(turnstileRef.current);
            }
            return;
        }

        try {
            const response = await axios.post(
                "/registration",
                {
                    user_pwd: password,
                    repeated_pwd: confirmPassword,
                    turnstile_token: turnstileToken,
                },
                { withCredentials: true },
            );
            if (response.status === 200) {
                generated_user_id = response.data.user_id;
                const successMessage = `
                    <div>
                        <strong>${languages[language].header.register.successPopup.title}</strong><br/>
                        ${languages[language].header.register.successPopup.message} ${generated_user_id}.<br/>
                         ${languages[language].header.register.successPopup.securityMessage}
                    </div>
                `;
                showSuccess(successMessage, 6000);
                //window.umami.trackEvent('SignUp');
                // openSuccessModal();
                // alert("Ti sei registrato con successo, Grazie.\n Ora puoi effettuare il login.\n Il tuo id utente è: " + generated_user_id + ".\n Ti consigliamo di salvarlo in un posto sicuro per i prossimi accessi. ");
                // navigate('/sign-in');
            } else {
                // alert("Si è verificato un errore nella registrazione del tuo account. Per favore riprova tra un istante.");
                showError(
                    `
                <div>
                    <strong>${languages[language].header.register.errorPopup.title}</strong><br/>
                    ${languages[language].header.register.errorPopup.message}<br/>
                    ${languages[language].header.register.errorPopup.message2}
                </div>
            `,
                    5000,
                );
            }
        } catch (error) {
            // console.error(error);
            setPassword("");
            setConfirmPassword("");
            setTurnstileToken("");
            setIsTurnstileLoaded(false);

            // Reset Turnstile widget
            if (window.turnstile && turnstileRef.current) {
                window.turnstile.reset(turnstileRef.current);
            }

            showError(
                `
                <div>
                    <strong>${languages[language].header.register.errorPopup.title}</strong><br/>
                    ${languages[language].header.register.errorPopup.message}<br/>
                    ${languages[language].header.register.errorPopup.message2}
                </div>
            `,
                5000,
            );
            //   alert("Si è verificato un errore nella registrazione del tuo account. Per favore riprova tra un istante.");
        }
    };

    return (
        <div>
            <div className="space-y-6">
                <form
                    id="signUp-PasswordConfirm"
                    className="space-y-4"
                    onSubmit={handleSubmit}
                >
                    <MuiCustomTextField
                        theme={theme}
                        id="passwordSignUp"
                        label={languages[language].header.register.password}
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={handlePasswordChange}
                        required
                        fullWidth
                        className="w-1/2"
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
                        label={
                            languages[language].header.register.confirmPassword
                        }
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        required
                        fullWidth
                        className="w-1/2"
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
                    {/* Invisible Turnstile widget */}
                    <div ref={turnstileRef} style={{ display: "none" }}></div>

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
                                : languages[language].header.register
                                      .titleButton}
                        </SignUpButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
