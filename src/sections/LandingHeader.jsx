import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ToggleModeButton from "../components/ToggleModeButton";
import { useLocalizedNavigate } from "../hooks/useLocalizedNavigate";
import LogoPaci from "../components/Logo";
import { LanguageContext } from "../contexts/LanguageContext";
import { useAuth } from "../hooks/useAuth";
import { addLanguageToPath, removeLanguageFromPath } from "../utils/i18nRouting";
import { MyButton, ButtonContainer } from "../styles/MyStyled";

function Header({
  theme,
  mode,
  toggleMode,
  toggleLanguage: _toggleLanguage,
}) {
  const auth = useAuth();
  const { handleSetIsAuthenticated } = auth;
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDemoButton(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const DemoLogin = async (event) => {
    event.preventDefault();

    // Demo mode: entirely client-side, no API calls
    // Set demo flag in sessionStorage and navigate to dashboard
    sessionStorage.setItem('pacifinance-demo', 'true');
    handleSetIsAuthenticated(true);
    localizedNavigate("/dashboard");
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