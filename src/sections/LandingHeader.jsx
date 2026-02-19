import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ToggleModeButton from "../components/ToggleModeButton";
import { useServices } from "../contexts/ServiceContext";
import { useLocalizedNavigate } from "../hooks/useLocalizedNavigate";
import LogoPaci from "../components/Logo";
import { LanguageContext } from "../contexts/LanguageContext";
import { useAuth } from "../hooks/useAuth";
import { addLanguageToPath, removeLanguageFromPath } from "../utils/i18nRouting";
// import MyStyled from '../contexts/MyStyled';
import { MyButton, ButtonContainer } from "../styles/MyStyled";

function Header({
  theme,
  mode,
  toggleMode,
  toggleLanguage: _toggleLanguage,
}) {
  const auth = useAuth();
  const { handleSetIsAuthenticated } = auth;
  const { userService } = useServices();
  const [showDemoButton, setShowDemoButton] = useState(false);
  const { language, translations, setLanguage } = useContext(LanguageContext);
  const localizedNavigate = useLocalizedNavigate();
  const rawNavigate = useNavigate();
  const location = useLocation();
  
  // Handle language toggle with URL update
  const handleLanguageToggle = () => {
    const newLanguage = language === 'it' ? 'en' : 'it';
    setLanguage(newLanguage);
    
    // Update URL with new language (use rawNavigate since path already has language prefix)
    const currentPath = removeLanguageFromPath(location.pathname);
    const newPath = addLanguageToPath(currentPath, newLanguage);
    rawNavigate(newPath, { replace: true });
  };
  
  const [username, setUsername] = useState("913418");
  const [password, setPassword] = useState("vbwifc9u");

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
      localizedNavigate("/dashboard");
      return;
    }

    // Production environment: use original demo login logic
    try {
      handleSetIsAuthenticated(false);
      const response = await userService.login(username, password);
      if (response.status === 200) {
        handleSetIsAuthenticated(true);
        localizedNavigate("/dashboard");
      } else {
        console.warn("Error in the demo login");
      }
    } catch (_error) {
      setUsername("");
      setPassword("");
    }
  };

  const handleAuthNavigation = () => {
    localizedNavigate("/auth");
  };

  return (
    <div
      className="w-full h-auto flex flex-col items-start relative"
      style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
    >
      <div
        className="flex-auto w-full flex p-3 md:p-4 items-center justify-between"
        style={{
          backgroundColor: theme.backgroundColor,
          color: theme.textColor,
        }}
      >
        <LogoPaci />
        <div className="flex flex-row items-center gap-1.5 md:gap-2 md:mr-10">
          {showDemoButton && (
            <button
              data-umami-event="tryDemo"
              className={`animate-slide-down border border-white rounded items-center cursor-pointer bg-paciGreen text-white px-1.5 py-0.5 text-xs md:text-lg md:px-4 md:py-2 md:border-2 md:rounded-lg shadow-xl`}
              onClick={DemoLogin}
            >
              <span className="md:hidden">Demo</span>
              <span className="hidden md:inline">{translations.header.demo.titleButton}</span>
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
              {translations.header.signIn}
            </MyButton>
          </ButtonContainer>
        </div>
      </div>
    </div>
  );
}

export { Header };