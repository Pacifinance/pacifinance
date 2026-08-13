import React, { useContext } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { addLanguageToPath } from '../utils/i18nRouting';

const Bar = styled.div`
  display: none;

  @media (max-width: 767px) {
    display: flex;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 40;
    padding: 0.65rem 1rem calc(0.65rem + env(safe-area-inset-bottom));
    background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(13,15,19,0.92)' : 'rgba(255,255,255,0.92)')};
    backdrop-filter: blur(10px);
    border-top: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')};
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.85rem;
  border: none;
  border-radius: 0.75rem;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  background: ${(p) => p.theme.secondaryColor};
  box-shadow: 0 6px 18px ${(p) => p.theme.secondaryColor}55;
`;

/**
 * Persistent "Get Started" CTA on mobile, where the hero's own CTA scrolls
 * out of view almost immediately and there was previously nothing else
 * fixed on screen except the cookie banner. Desktop already keeps the header
 * CTA in view via its own layout, so this only renders below 768px (see the
 * media query in `Bar`, not a JS viewport check, so it's correct on resize).
 *
 * ConsentBanner (`src/sections/ConsentBanner.tsx`) reserves extra bottom
 * clearance on mobile specifically so the two fixed bars don't overlap
 * whenever both are visible (first-time visitor, before a cookie choice).
 */
export default function StickyMobileCTA() {
  const { theme } = useContext(ThemeContext);
  const { language, translations } = useContext(LanguageContext);
  const navigate = useNavigate();

  return (
    <Bar theme={theme}>
      <Button
        type="button"
        theme={theme}
        onClick={() => navigate(addLanguageToPath('/auth', language))}
        data-umami-event="sticky-mobile-get-started"
      >
        {translations?.landing?.new?.hero?.getStarted || (language === 'it' ? 'Inizia ora' : 'Get Started')} →
      </Button>
    </Bar>
  );
}
