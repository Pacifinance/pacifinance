import React, { useState, useContext, useEffect } from "react";
import styled from "styled-components";

import LanguageSelector from "../components/LanguageSelector";
import { useLocalizedNavigate } from "../hooks/useLocalizedNavigate";
import LogoPaci from "../components/Logo";
import { LanguageContext } from "../contexts/LanguageContext";
import { useAuth } from "../hooks/useAuth";
import Brightness4Icon from "@mui/icons-material/Brightness3";
import LightModeIcon from "@mui/icons-material/LightMode";

// Shared sizing tokens so every header action (theme toggle, language,
// demo, accedi) lines up on the same height/radius/font scale.
const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;

  @media (min-width: 768px) {
    gap: 0.6rem;
  }
`;

const IconToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 0.6rem;
  border: 1px solid ${(props) => (props.theme.mode === "dark" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)")};
  background: transparent;
  color: ${(props) => props.theme.textColor};
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;

  svg {
    font-size: 1.1rem;
  }

  &:hover {
    background: ${(props) => (props.theme.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)")};
  }

  &:active {
    transform: scale(0.94);
  }

  @media (min-width: 768px) {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.7rem;

    svg {
      font-size: 1.3rem;
    }
  }
`;

const LanguageSelectorWrap = styled.div`
  > div > button {
    height: 2.1rem !important;
    padding: 0 0.6rem !important;
    border-radius: 0.6rem !important;
    font-size: 0.78rem !important;
  }

  @media (min-width: 768px) {
    > div > button {
      height: 2.5rem !important;
      padding: 0 0.9rem !important;
      border-radius: 0.7rem !important;
      font-size: 0.85rem !important;
    }
  }
`;

const PillButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.1rem;
  padding: 0 0.85rem;
  border-radius: 0.6rem;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: transform 0.1s ease, filter 0.15s ease, background 0.15s ease;

  &:active {
    transform: scale(0.96);
  }

  @media (min-width: 768px) {
    height: 2.5rem;
    padding: 0 1.25rem;
    border-radius: 0.7rem;
    font-size: 0.9rem;
  }
`;

const DemoButton = styled(PillButton)`
  background: transparent;
  border: 1.5px solid ${(props) => props.theme.buttonBackgroundColor};
  color: ${(props) => props.theme.buttonBackgroundColor};

  &:hover {
    background: ${(props) => `${props.theme.buttonBackgroundColor}14`};
  }
`;

const AccediButton = styled(PillButton)`
  background: ${(props) => props.theme.buttonBackgroundColor};
  border: 1.5px solid ${(props) => props.theme.buttonBackgroundColor};
  color: white;
  box-shadow: 0 2px 10px ${(props) => `${props.theme.buttonBackgroundColor}40`};

  &:hover {
    filter: brightness(1.06);
  }
`;

function Header({
  theme,
  mode,
  toggleMode,
  toggleLanguage: _toggleLanguage,
}) {
  const auth = useAuth();
  const { handleSetIsAuthenticated } = auth;
  const [showDemoButton, setShowDemoButton] = useState(false);
  const { translations } = useContext(LanguageContext);
  const localizedNavigate = useLocalizedNavigate();

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
        <HeaderActions theme={theme}>
          {showDemoButton && (
            <DemoButton
              theme={theme}
              className="animate-slide-down"
              data-umami-event="tryDemo"
              onClick={DemoLogin}
            >
              <span className="md:hidden">Demo</span>
              <span className="hidden md:inline">{translations.header.demo.titleButton}</span>
            </DemoButton>
          )}

          <IconToggleButton
            theme={theme}
            onClick={toggleMode}
            aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            data-umami-event="setTheme"
          >
            {mode === "dark" ? <Brightness4Icon /> : <LightModeIcon />}
          </IconToggleButton>

          <LanguageSelectorWrap>
            <LanguageSelector theme={theme} variant="compact" />
          </LanguageSelectorWrap>

          <AccediButton theme={theme} onClick={handleAuthNavigation}>
            {translations.header.signIn}
          </AccediButton>
        </HeaderActions>
      </div>
    </div>
  );
}

export { Header };
