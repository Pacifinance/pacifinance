import React, { useState, useContext, useEffect } from "react";
import ToggleModeButton from "../components/ToggleModeButton";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LogoPaci from "../components/Logo";
import { LanguageContext } from "../contexts/LanguageContext";
import { useAuth } from "../hooks/useAuth";
import languages from "../data/languages.json";
// import MyStyled from '../contexts/MyStyled';
import { MyButton, ButtonContainer } from "../styles/MyStyled";

function Header({
  theme,
  mode,
  toggleMode,
  toggleLanguage: propToggleLanguage,
}) {
  const auth = useAuth();
  const { handleSetIsAuthenticated } = auth;
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

    // Check if we're on Replit or localhost for automatic bypass
    const isReplit = window.location.hostname.includes('replit.dev');
    const isLocalhost = window.location.hostname === 'localhost';

    if (isReplit || isLocalhost) {
      // Development/testing environment: bypass authentication
      handleSetIsAuthenticated(true);
      navigate("/dashboard");
      return;
    }

    // Production environment: use original demo login logic
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
              className={`animate-slide-down border border-white rounded items-center cursor-pointer bg-paciGreen text-white px-1.5 py-0.5 text-xs md:text-lg md:px-4 md:py-2 md:border-2 md:rounded-lg shadow-xl mr-2 md:mr-20`}
              onClick={DemoLogin}
            >
              <span className="md:hidden">Demo</span>
              <span className="hidden md:inline">{languages[language].header.demo.titleButton}</span>
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
              {languages[language].header.signIn}
            </MyButton>
          </ButtonContainer>
        </div>
      </div>
    </div>
  );
}

export { Header };