import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ThemeContext } from "../contexts/ThemeContext";
import { PrivacyContext } from "../contexts/PrivacyContext";
import { LanguageContext } from "../contexts/LanguageContext";
import { UserContext } from "../contexts/UserContext";
import { MediaQueryContext } from "../contexts/MediaQueryContext";
import Sidebar from "../sections/Sidebar";
import ToggleModeButton from "../components/ToggleModeButton";
import PrivacyToggleModeButton from "../components/PrivacyToggleModeButton";
import languages from "../data/languages.json";
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
} from "@fortawesome/free-solid-svg-icons";

const SettingsPage = () => {
    const { theme, toggleMode } = useContext(ThemeContext);
    const { mode } = theme;
    const { isHidden, toggleHidden } = useContext(PrivacyContext);
    const { language, toggleLanguage } = useContext(LanguageContext);
    const { userData, handleSetIsAuthenticated } = useContext(UserContext);
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

    const userType = userData?.userType || "";

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
                    marginLeft: isMobileScreen ? "0" : "6vw",
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
                            fontSize: isMobileScreen ? "1.2rem" : "1.5rem",
                        }}
                    >
                        {languages[language].sidebar.settings.title}
                    </TitleDashboard>

                    {successMessage && (
                        <div
                            style={{
                                backgroundColor: theme.buttonBackgroundColor,
                                color: "white",
                                padding: "1rem",
                                borderRadius: "8px",
                                margin: "1rem 0",
                                textAlign: "center",
                            }}
                        >
                            {successMessage}
                        </div>
                    )}

                    {errorMessage && (
                        <div
                            style={{
                                backgroundColor: "#dc3545",
                                color: "white",
                                padding: "1rem",
                                borderRadius: "8px",
                                margin: "1rem 0",
                                textAlign: "center",
                            }}
                        >
                            {errorMessage}
                        </div>
                    )}

                    <div
                        style={{
                            maxWidth: "800px",
                            margin: "0 auto",
                            padding: "2rem",
                            backgroundColor: "white",
                            borderRadius: "12px",
                            border: `2px solid ${theme.buttonBackgroundColor}`,
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        {/* Theme Settings */}
                        <div
                            style={{
                                marginBottom: "2rem",
                                padding: "1.5rem",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "8px",
                            }}
                        >
                            <h3 style={{ marginBottom: "1rem", color: "#333" }}>
                                {languages[language].sidebar.settings
                                    .themeSection ||
                                    (language === "it"
                                        ? "Tema e Aspetto"
                                        : "Theme and Appearance")}
                            </h3>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: "1rem",
                                }}
                            >
                                <label
                                    style={{
                                        fontWeight: "bold",
                                        color: "#333",
                                        marginRight: "1rem",
                                    }}
                                >
                                    {languages[language].sidebar.settings.light}
                                </label>
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
                                    marginBottom: "1rem",
                                }}
                            >
                                <label
                                    style={{
                                        fontWeight: "bold",
                                        color: "#333",
                                        marginRight: "1rem",
                                    }}
                                >
                                    {
                                        languages[language].sidebar.settings
                                            .privacy
                                    }
                                </label>
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
                                }}
                            >
                                <label
                                    style={{
                                        fontWeight: "bold",
                                        color: "#333",
                                        marginRight: "2rem",
                                    }}
                                >
                                    {
                                        languages[language].sidebar.settings
                                            .language
                                    }
                                </label>
                                <MyButton
                                    theme={theme}
                                    onClick={toggleLanguage}
                                >
                                    {language === "it" ? "IT" : "EN"}
                                </MyButton>
                            </div>
                        </div>

                        {/* Security Settings */}
                        <div
                            style={{
                                marginBottom: "2rem",
                                padding: "1.5rem",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "8px",
                            }}
                        >
                            <h3 style={{ marginBottom: "1rem", color: "#333" }}>
                                {languages[language].sidebar.settings
                                    .securitySection ||
                                    (language === "it"
                                        ? "Sicurezza"
                                        : "Security")}
                            </h3>

                            <div style={{ marginBottom: "1rem" }}>
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
                                        marginBottom: "0.5rem",
                                        backgroundColor: [
                                            "test",
                                            "demo",
                                        ].includes(userType)
                                            ? "#d3d3d3"
                                            : theme.buttonBackgroundColor,
                                    }}
                                >
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

                            <div style={{ marginBottom: "1rem" }}>
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
                                        marginBottom: "0.5rem",
                                        backgroundColor: [
                                            "test",
                                            "demo",
                                        ].includes(userType)
                                            ? "#d3d3d3"
                                            : theme.buttonBackgroundColor,
                                    }}
                                >
                                    {
                                        languages[language].sidebar
                                            .changePassword.title
                                    }
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
                                padding: "1.5rem",
                                backgroundColor: "#fff5f5",
                                borderRadius: "8px",
                                border: "1px solid #feb2b2",
                            }}
                        >
                            <h3
                                style={{
                                    marginBottom: "1rem",
                                    color: "#dc3545",
                                }}
                            >
                                {languages[language].sidebar.settings
                                    .dangerZone ||
                                    (language === "it"
                                        ? "Zona Pericolosa"
                                        : "Danger Zone")}
                            </h3>
                            <MyButton
                                onClick={() =>
                                    setShowDeleteAccount(!showDeleteAccount)
                                }
                                disabled={["test", "demo"].includes(userType)}
                                style={{
                                    backgroundColor: ["test", "demo"].includes(
                                        userType,
                                    )
                                        ? "#d3d3d3"
                                        : "#dc3545",
                                    color: "white",
                                    width: "100%",
                                }}
                            >
                                <FontAwesomeIcon
                                    icon={faTrashCan}
                                    style={{ marginRight: "0.5rem" }}
                                />
                                {
                                    languages[language].sidebar.settings
                                        .deleteAccount
                                }
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

                        <div style={{ textAlign: "center" }}>
                            <MyButton
                                theme={theme}
                                onClick={() => navigate("/dashboard")}
                            >
                                {languages[language].sidebar.settings
                                    .backToDashboard || "Torna alla Dashboard"}
                            </MyButton>
                        </div>
                    </div>
                </StyledSection>
            </Section>
        </div>
    );
};

export default SettingsPage;
