import React, { useState, useContext, useEffect } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import { LanguageContext } from "../contexts/LanguageContext";
import { UserContext } from "../contexts/UserContext";
import { useToast } from "../contexts/ToastContext";
import { useServices } from "../contexts/ServiceContext";
import { useLocalizedNavigate } from "../hooks/useLocalizedNavigate";
import { parseRecoveryDeepLink } from "../utils/recoveryCard";
import { trackAnalyticsEvent } from "../services/analyticsService";
import RecoveryForm from "./RecoveryForm";
import {
  MuiCustomDialog,
  MuiCustomDialogTitle,
  MuiCustomDialogContent,
  MuiCustomDialogContentText,
  MuiCustomDialogActions,
  MuiCustomButton,
  MuiCustomTextField,
  MuiCustomInputAdornment,
  MuiCustomIconButton,
  EyeVisibility,
  EyeVisibilityOff,
  SignInButton,
} from "../styles/MyStyled";

// import MyStyled from '../contexts/MyStyled';

// const handleUsernameChange = (setUsername, event) => {
//   setUsername(event.target.value);
// };

// const handlePasswordChange = (event) => {
//     setPassword(event.target.value);
// };

export default function SignInForm() {
  const { theme } = useContext(ThemeContext);
  const { translations } = useContext(LanguageContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showUsername, setShowUsername] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const { handleSetIsAuthenticated } = useContext(UserContext);
  const navigate = useLocalizedNavigate();
  const { showError } = useToast();
  const { userService } = useServices();

  // "Recover account" flow — either opened manually via the link below, or
  // automatically when landing here from a recovery-card QR scan (the QR
  // encodes a #recover&id=...&code=... URL fragment, never sent to any
  // server, only readable here).
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryPrefill, setRecoveryPrefill] = useState<{ userId: string; code: string } | null>(null);

  useEffect(() => {
    const deepLink = parseRecoveryDeepLink(window.location.hash);
    if (deepLink) {
      setRecoveryPrefill({ userId: deepLink.userId, code: deepLink.base32 });
      setShowRecovery(true);
    }
  }, []);

  const handleCloseModal = () => {
    setShowErrorModal(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowUsername = () => {
    setShowUsername(!showUsername);
  };

  const handleMouseDown = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    trackAnalyticsEvent("auth-sign-in-submitted", { method: "password" });
    try {
      handleSetIsAuthenticated(false); //to be sure that the user will se his data
      //navigate('/dashboard'); //must be commented for production
      //username could be user_id o username
      const response = await userService.login(username, password);
      if (response.status === 200) {
        trackAnalyticsEvent("auth-sign-in-succeeded", { method: "password" });
        handleSetIsAuthenticated(true); // Set the user's authentication to true
        navigate("/dashboard"); //direct redirect
        //window.umami.trackEvent('signIn', 'SignIn');
      } else {
        trackAnalyticsEvent("auth-sign-in-failed", { reason: "rejected" });
        showError(translations.header.login.errorPopup.message, 4000);
      }
    } catch (error) {
      trackAnalyticsEvent("auth-sign-in-failed", { reason: "request-error" });
      console.error("Login error:", error);
      showError(translations.header.login.errorPopup.message, 4000);
    }
  };

  if (showRecovery) {
    return (
      <RecoveryForm
        initialUserId={recoveryPrefill?.userId || ""}
        initialCode={recoveryPrefill?.code || ""}
        onBackToSignIn={() => setShowRecovery(false)}
      />
    );
  }

  return (
    <div>
      <div className="space-y-6">
        <form
          id="signIn-IdPassword"
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <MuiCustomTextField
            theme={theme}
            id="username"
            name="username"
            label={translations.header.login.username}
            type={showUsername ? "text" : "password"}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            fullWidth
            required
            inputProps={{
              autoComplete: "username",
              autoCapitalize: "off",
              autoCorrect: "off",
              spellCheck: false,
            }}
            InputProps={{
              endAdornment: (
                <MuiCustomInputAdornment theme={theme} position="end">
                  <MuiCustomIconButton
                    theme={theme}
                    aria-label="toggle username visibility"
                    onClick={handleClickShowUsername}
                    onMouseDown={handleMouseDown}
                    className=""
                  >
                    {showUsername ? <EyeVisibility /> : <EyeVisibilityOff />}
                  </MuiCustomIconButton>
                </MuiCustomInputAdornment>
              ),
            }}
          />
          <MuiCustomTextField
            theme={theme}
            id="passwordSignIn"
            name="password"
            label={translations.header.login.password}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            fullWidth
            inputProps={{
              autoComplete: "current-password",
              autoCapitalize: "off",
              autoCorrect: "off",
              spellCheck: false,
            }}
            InputProps={{
              endAdornment: (
                <MuiCustomInputAdornment theme={theme} position="end">
                  <MuiCustomIconButton
                    theme={theme}
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDown}
                    className=""
                  >
                    {showPassword ? <EyeVisibility /> : <EyeVisibilityOff />}
                  </MuiCustomIconButton>
                </MuiCustomInputAdornment>
              ),
            }}
          />
          <div className="button-wrapper">
            <SignInButton theme={theme} type="submit" $fullWidth>
              {translations.header.login.titleButton}
            </SignInButton>
          </div>
          <button
            type="button"
            onClick={() => setShowRecovery(true)}
            className="w-full text-center text-sm underline opacity-80"
            style={{ color: theme.secondaryColor }}
          >
            {translations.header.recovery.linkText}
          </button>
        </form>
      </div>
      {showErrorModal && (
        <MuiCustomDialog
          open={showErrorModal}
          onClose={handleCloseModal}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <MuiCustomDialogTitle id="alert-dialog-title">
            {translations.header.login.errorPopup.title}
          </MuiCustomDialogTitle>
          <MuiCustomDialogContent>
            <MuiCustomDialogContentText
              id="alert-dialog-description"
              dangerouslySetInnerHTML={{
                __html: translations.header.login.errorPopup.message,
              }}
            ></MuiCustomDialogContentText>
          </MuiCustomDialogContent>
          <MuiCustomDialogActions>
            <MuiCustomButton onClick={handleCloseModal} autoFocus>
              {translations.header.login.errorPopup.okButton}
            </MuiCustomButton>
          </MuiCustomDialogActions>
        </MuiCustomDialog>
      )}
    </div>
  );
}
