import React, { useState, useContext, useEffect } from "react";
import ToggleModeButton from "../components/ToggleModeButton";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LogoPaci from "../components/Logo";
import { LanguageContext } from "../contexts/LanguageContext";
import { UserContext } from "../contexts/UserContext";
import languages from "../data/languages.json";
// import MyStyled from '../contexts/MyStyled';
import { MyButton, ButtonContainer } from "../styles/MyStyled";

function Header({
  theme,
  mode,
  toggleMode,
  toggleLanguage: propToggleLanguage,
}) {
  const { handleSetIsAuthenticated } = useContext(UserContext);
  const [showDemoButton, setShowDemoButton] = useState(false);
  const { language, toggleLanguage } = useContext(LanguageContext);
  const handleLanguageToggle = propToggleLanguage || toggleLanguage;
  const [username, setUsername] = useState("913418");
  const [password, setPassword] = useState("vbwifc9u");
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDemoButton(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const DemoLogin = async (event) => {
    event.preventDefault();
    try {
      handleSetIsAuthenticated(false);
      const response = await axios.post(
        "/login",
        { user_id: username, password: password },
        { withCredentials: true },
      );
      if (response.status === 200) {
        handleSetIsAuthenticated(true);
        navigate("/dashboard");
      } else {
        console.log("Error in the demo login");
      }
    } catch (error) {
      setUsername("");
      setPassword("");
    }
  };

  const handleAuthNavigation = () => {
    navigate("/auth");
  };

  return (
    <div
      className="w-full h-auto flex flex-col items-start relative"
      style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
    >
      <div
        className="flex-auto w-full flex p-4 md:p-2 items-center justify-between"
        style={{
          backgroundColor: theme.backgroundColor,
          color: theme.textColor,
        }}
      >
        <LogoPaci />
        <div className="flex flex-row md:mr-10">
          {showDemoButton && (
            <button
              data-umami-event="tryDemo"
              className={`animate-slide-down border border-white rounded-lg md:rounded items-center cursor-pointer bg-paciGreen text-white text-xs px-1 py-1 text-xs md:text-base md:px-1 md:py-1 md:border shadow-xl mr-2 md:mr-20`}
              onClick={DemoLogin}
            >
              {languages[language].header.demo.titleButton}
            </button>
          )}
          <ButtonContainer>
            <ToggleModeButton mode={mode} toggleMode={toggleMode} />

            <MyButton
              theme={theme}
              data-umami-event="setLanguage"
              onClick={handleLanguageToggle}
            >
              {language === "it" ? "IT" : "EN"}
            </MyButton>
            <MyButton theme={theme} onClick={handleAuthNavigation}>
              Access Account
            </MyButton>
          </ButtonContainer>
        </div>
      </div>
    </div>
  );
}

function Footer({ theme }) {
  const { language } = useContext(LanguageContext);

  return (
    <div
      className="flex-auto left-0 w-full bottom-0 h-18 p-2 flex z-10 fixed items-end justify-center"
      style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
    >
      <p className="text-xs md:text-base">
        {languages[language].footer.rights}
      </p>
    </div>
  );
}

export { Header, Footer };
