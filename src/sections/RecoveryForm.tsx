import React, { useState, useRef, useContext, useEffect } from "react";
import { useLocalizedNavigate } from "../hooks/useLocalizedNavigate";
import { useServices } from "../contexts/ServiceContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { LanguageContext } from "../contexts/LanguageContext";
import { useToast } from "../contexts/ToastContext";
import { UserContext } from "../contexts/UserContext";
import { normalizeTurnstileSiteKey } from "../utils/turnstileConfig";
import {
    MuiCustomTextField,
    MuiCustomInputAdornment,
    MuiCustomIconButton,
    EyeVisibility,
    EyeVisibilityOff,
    SignInButton,
} from "../styles/MyStyled";

// Cloudflare Turnstile configuration — same pattern as SignUpForm.tsx (not
// shared as a hook there either; kept consistent rather than introducing a
// new abstraction for just these two callers).
const TURNSTILE_SITE_KEY = normalizeTurnstileSiteKey(import.meta.env.VITE_TURNSTILE_SITE_KEY);
const IS_DEV = import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true';

interface RecoveryFormProps {
    initialUserId?: string;
    initialCode?: string;
    onBackToSignIn: () => void;
}

export default function RecoveryForm({ initialUserId = "", initialCode = "", onBackToSignIn }: RecoveryFormProps) {
    const { theme } = useContext(ThemeContext);
    const { language, translations } = useContext(LanguageContext);
    const { showError, showSuccess } = useToast();
    const { userService } = useServices();
    const { handleSetIsAuthenticated } = useContext(UserContext);
    const navigate = useLocalizedNavigate();
    const t = translations.header.recovery;

    const [userId, setUserId] = useState(initialUserId);
    const [recoveryCode, setRecoveryCode] = useState(initialCode);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState("");
    const [isTurnstileLoaded, setIsTurnstileLoaded] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const turnstileRef = useRef<any>(null);
    const turnstileWidgetIdRef = useRef<any>(null);

    const onTurnstileSuccess = (token: string) => {
        setTurnstileToken(token);
        setIsTurnstileLoaded(true);
    };

    const onTurnstileError = () => {
        setTurnstileToken("");
        setIsTurnstileLoaded(false);
    };

    const onTurnstileExpired = () => {
        setTurnstileToken("");
        setIsTurnstileLoaded(false);
        if (window.turnstile && turnstileWidgetIdRef.current) {
            window.turnstile.reset(turnstileWidgetIdRef.current);
        }
    };

    useEffect(() => {
        if (!TURNSTILE_SITE_KEY && IS_DEV) {
            setTurnstileToken('dev-bypass-token');
            setIsTurnstileLoaded(true);
            return;
        }

        if (!TURNSTILE_SITE_KEY) {
            console.error("Turnstile configuration error: VITE_TURNSTILE_SITE_KEY is missing or invalid");
            showError(t.errorPopup.turnstileRequired, 7000);
            return;
        }

        const initTurnstile = () => {
            if (window.turnstile && turnstileRef.current && TURNSTILE_SITE_KEY) {
                if (turnstileWidgetIdRef.current) {
                    try {
                        window.turnstile.remove(turnstileWidgetIdRef.current);
                    } catch {
                        // ignore
                    }
                    turnstileWidgetIdRef.current = null;
                }
                try {
                    turnstileWidgetIdRef.current = window.turnstile.render(turnstileRef.current, {
                        sitekey: TURNSTILE_SITE_KEY,
                        callback: onTurnstileSuccess,
                        "error-callback": onTurnstileError,
                        "expired-callback": onTurnstileExpired,
                        theme: theme.mode === "dark" ? "dark" : "light",
                    });
                } catch (error) {
                    console.error("Turnstile widget configuration error", { hostname: window.location.hostname, error });
                    setTurnstileToken("");
                    setIsTurnstileLoaded(false);
                    showError(t.errorPopup.turnstileRequired, 7000);
                }
            }
        };

        if (window.turnstile) {
            initTurnstile();
        } else {
            const checkTurnstile = setInterval(() => {
                if (window.turnstile) {
                    clearInterval(checkTurnstile);
                    initTurnstile();
                }
            }, 100);
            setTimeout(() => clearInterval(checkTurnstile), 10000);
        }

        return () => {
            if (window.turnstile && turnstileWidgetIdRef.current) {
                try {
                    window.turnstile.remove(turnstileWidgetIdRef.current);
                    turnstileWidgetIdRef.current = null;
                } catch {
                    // ignore
                }
            }
        };
    }, [theme.mode]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (newPassword !== confirmPassword) {
            showError(t.errorPopup.passwordMismatch, 4000);
            return;
        }
        if (!turnstileToken) {
            showError(t.errorPopup.turnstileRequired, 3000);
            if (window.turnstile && turnstileWidgetIdRef.current) window.turnstile.execute(turnstileWidgetIdRef.current);
            return;
        }
        setSubmitting(true);
        try {
            const response = await userService.resetPasswordWithRecoveryCode(
                userId.trim(), recoveryCode.trim(), newPassword, confirmPassword, turnstileToken,
            );
            if (response.status === 200) {
                showSuccess(t.successPopup.message, 3000);
                // Auto-login with the new password, same pattern SignUpForm uses after registration.
                try {
                    const loginResponse = await userService.login(userId.trim(), newPassword);
                    if (loginResponse.status === 200) {
                        handleSetIsAuthenticated(true);
                        navigate('/dashboard');
                        return;
                    }
                } catch {
                    // fall through to onBackToSignIn below
                }
                onBackToSignIn();
            } else {
                showError(t.errorPopup.message, 4000);
                if (window.turnstile && turnstileWidgetIdRef.current) window.turnstile.reset(turnstileWidgetIdRef.current);
                setTurnstileToken("");
                setIsTurnstileLoaded(false);
            }
        } catch (error) {
            console.error("Recovery reset error:", error);
            showError(t.errorPopup.message, 4000);
            if (window.turnstile && turnstileWidgetIdRef.current) window.turnstile.reset(turnstileWidgetIdRef.current);
            setTurnstileToken("");
            setIsTurnstileLoaded(false);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-2 text-center">{t.title}</h2>
            <p className="text-sm opacity-80 mb-4 text-center">{t.info}</p>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <MuiCustomTextField
                    theme={theme}
                    id="recoveryUserId"
                    name="username"
                    label={t.userIdLabel}
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                    fullWidth
                    inputProps={{ autoComplete: "username", autoCapitalize: "off", autoCorrect: "off", spellCheck: false }}
                />
                <MuiCustomTextField
                    theme={theme}
                    id="recoveryCode"
                    name="recovery-code"
                    label={t.codeLabel}
                    placeholder={t.codePlaceholder}
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    required
                    fullWidth
                    inputProps={{ autoComplete: "off", autoCapitalize: "off", autoCorrect: "off", spellCheck: false }}
                />
                <MuiCustomTextField
                    theme={theme}
                    id="recoveryNewPassword"
                    name="new-password"
                    label={t.newPasswordLabel}
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    fullWidth
                    inputProps={{ autoComplete: "new-password", autoCapitalize: "off", autoCorrect: "off", spellCheck: false }}
                    InputProps={{
                        endAdornment: (
                            <MuiCustomInputAdornment theme={theme} position="end">
                                <MuiCustomIconButton theme={theme} aria-label="toggle password visibility" onClick={() => setShowNewPassword(!showNewPassword)} onMouseDown={(e) => e.preventDefault()}>
                                    {showNewPassword ? <EyeVisibility /> : <EyeVisibilityOff />}
                                </MuiCustomIconButton>
                            </MuiCustomInputAdornment>
                        ),
                    }}
                />
                <MuiCustomTextField
                    theme={theme}
                    id="recoveryConfirmPassword"
                    name="confirm-password"
                    label={t.confirmPasswordLabel}
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    fullWidth
                    inputProps={{ autoComplete: "new-password", autoCapitalize: "off", autoCorrect: "off", spellCheck: false }}
                    InputProps={{
                        endAdornment: (
                            <MuiCustomInputAdornment theme={theme} position="end">
                                <MuiCustomIconButton theme={theme} aria-label="toggle password visibility" onClick={() => setShowConfirmPassword(!showConfirmPassword)} onMouseDown={(e) => e.preventDefault()}>
                                    {showConfirmPassword ? <EyeVisibility /> : <EyeVisibilityOff />}
                                </MuiCustomIconButton>
                            </MuiCustomInputAdornment>
                        ),
                    }}
                />

                <div ref={turnstileRef} style={{ margin: "10px 0" }}></div>

                <div className="button-wrapper">
                    <SignInButton theme={theme} type="submit" $fullWidth disabled={!isTurnstileLoaded || submitting}>
                        {!isTurnstileLoaded
                            ? (language === "it" ? "Verifica sicurezza..." : "Security check...")
                            : t.submitButton}
                    </SignInButton>
                </div>

                <button
                    type="button"
                    onClick={onBackToSignIn}
                    className="w-full text-center text-sm underline opacity-80"
                    style={{ color: theme.secondaryColor }}
                >
                    {t.backToSignIn}
                </button>
            </form>
        </div>
    );
}
