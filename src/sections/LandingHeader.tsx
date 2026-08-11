import React, { useState, useContext, useEffect } from "react";
import styled from "styled-components";

import { useLocation } from "react-router-dom";
import LanguageSelector from "../components/LanguageSelector";
import { useLocalizedNavigate } from "../hooks/useLocalizedNavigate";
import LogoPaci from "../components/Logo";
import LocalizedLink from "../components/LocalizedLink";
import { LanguageContext } from "../contexts/LanguageContext";
import { useAuth } from "../hooks/useAuth";
import { removeLanguageFromPath } from "../utils/i18nRouting";
import Brightness4Icon from "@mui/icons-material/Brightness3";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

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

const NavRow = styled.nav`
  display: none;

  @media (min-width: 1024px) {
    display: flex;
    align-items: center;
    gap: 1.75rem;
  }
`;

const navLinkStyle = (props) => `
  background: none;
  border: none;
  padding: 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${props.theme.mode === "dark" ? "rgba(248,250,252,0.75)" : "rgba(23,32,51,0.7)"};
  cursor: pointer;
  transition: color 0.15s ease;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    color: ${props.theme.textColor};
  }
`;

const NavButton = styled.button`
  ${(props) => navLinkStyle(props)}
`;

const NavAnchor = styled(LocalizedLink)`
  ${(props) => navLinkStyle(props)}
`;

const MobileMenuButton = styled(IconToggleButton)`
  @media (min-width: 1024px) {
    display: none;
  }
`;

const MobileNavPanel = styled.div`
  width: 100%;
  overflow: hidden;
  max-height: ${(props) => (props.$open ? "20rem" : "0")};
  transition: max-height 0.25s ease;
  border-top: ${(props) => (props.$open ? `1px solid ${props.theme.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}` : "none")};

  @media (min-width: 1024px) {
    display: none;
  }
`;

const MobileNavList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.75rem 1rem 1rem;
  gap: 0.25rem;
`;

const mobileNavLinkStyle = (props) => `
  padding: 0.65rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: ${props.theme.textColor};
  text-decoration: none;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: ${props.theme.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"};
  }
`;

const MobileNavButton = styled.button`
  ${(props) => mobileNavLinkStyle(props)}
`;

const MobileNavAnchor = styled(LocalizedLink)`
  ${(props) => mobileNavLinkStyle(props)}
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { translations } = useContext(LanguageContext);
  const localizedNavigate = useLocalizedNavigate();
  const nav = translations.header.nav;

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

  const location = useLocation();
  const isOnLandingPage = removeLanguageFromPath(location.pathname) === "/";

  const scrollToSection = (id) => () => {
    setMobileNavOpen(false);
    // These anchors only exist on the landing page itself — from anywhere
    // else (e.g. /auth), jump back there and let it pick up the hash.
    if (!isOnLandingPage) {
      localizedNavigate(`/#${id}`);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="w-full h-auto flex flex-col items-start relative"
      style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
    >
      <div
        className="flex-auto w-full flex p-3 md:p-4 items-center justify-between gap-3"
        style={{
          backgroundColor: theme.backgroundColor,
          color: theme.textColor,
        }}
      >
        <div className="flex-shrink-0">
          <LogoPaci />
        </div>

        <NavRow theme={theme}>
          <NavButton theme={theme} onClick={scrollToSection("features")} data-umami-event="nav-features">
            {nav.features}
          </NavButton>
          <NavButton theme={theme} onClick={scrollToSection("pillars")} data-umami-event="nav-why-us">
            {nav.whyUs}
          </NavButton>
          <NavAnchor theme={theme} to="/roadmap" data-umami-event="nav-roadmap">
            {nav.roadmap}
          </NavAnchor>
          <NavButton theme={theme} onClick={scrollToSection("open-source")} data-umami-event="nav-open-source">
            {nav.openSource}
          </NavButton>
        </NavRow>

        <HeaderActions theme={theme}>
          {/* Always mounted so its width is reserved from the first paint —
              toggling only opacity/interactivity avoids the header reflowing
              (and the nav row jumping left) the moment this fades in. */}
          <DemoButton
            theme={theme}
            data-umami-event="tryDemo"
            onClick={DemoLogin}
            aria-hidden={!showDemoButton}
            tabIndex={showDemoButton ? 0 : -1}
            style={{
              opacity: showDemoButton ? 1 : 0,
              pointerEvents: showDemoButton ? 'auto' : 'none',
              transition: 'opacity 0.4s ease',
            }}
          >
            <span className="md:hidden">Demo</span>
            <span className="hidden md:inline">{translations.header.demo.titleButton}</span>
          </DemoButton>

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

          <MobileMenuButton
            theme={theme}
            onClick={() => setMobileNavOpen((open) => !open)}
            aria-label={nav.menu}
            aria-expanded={mobileNavOpen}
            data-umami-event="nav-mobile-toggle"
          >
            {mobileNavOpen ? <CloseIcon /> : <MenuIcon />}
          </MobileMenuButton>
        </HeaderActions>
      </div>

      <MobileNavPanel theme={theme} $open={mobileNavOpen}>
        <MobileNavList>
          <MobileNavButton theme={theme} onClick={scrollToSection("features")}>
            {nav.features}
          </MobileNavButton>
          <MobileNavButton theme={theme} onClick={scrollToSection("pillars")}>
            {nav.whyUs}
          </MobileNavButton>
          <MobileNavAnchor theme={theme} to="/roadmap" onClick={() => setMobileNavOpen(false)}>
            {nav.roadmap}
          </MobileNavAnchor>
          <MobileNavButton theme={theme} onClick={scrollToSection("open-source")}>
            {nav.openSource}
          </MobileNavButton>
        </MobileNavList>
      </MobileNavPanel>
    </div>
  );
}

export { Header };
