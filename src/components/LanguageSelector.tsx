// Belongs in components/ despite reading LanguageContext: it's a generic language
// switcher, not tied to one business domain (see CONTRIBUTING.md's
// components/ vs sections/ rule).
import React, { useState, useContext, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LanguageContext } from '../contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../i18n/languagesConfig';
import { addLanguageToPath, removeLanguageFromPath } from '../utils/i18nRouting';

/**
 * LanguageSelector — dropdown menu to switch between supported languages.
 *
 * @param {Object}  props
 * @param {Object}  props.theme         - current theme object
 * @param {string}  [props.variant]     - "compact" (header) | "full" (settings)
 * @param {Object}  [props.buttonStyle] - extra inline styles for the trigger button
 */
export default function LanguageSelector({ theme, variant = 'compact', buttonStyle = {} }) {
  const { language, setLanguage } = useContext(LanguageContext);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const rawNavigate = useNavigate();
  const location = useLocation();

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const switchTo = (code) => {
    if (code === language) { setOpen(false); return; }
    setLanguage(code);
    const currentPath = removeLanguageFromPath(location.pathname);
    const newPath = addLanguageToPath(currentPath, code);
    rawNavigate(newPath, { replace: true });
    setOpen(false);
  };

  /* ───── compact variant (header / small buttons) ───── */
  if (variant === 'compact') {
    return (
      <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
        <button
          data-umami-event="setLanguage"
          onClick={() => setOpen(o => !o)}
          style={{
            background: 'transparent',
            border: `1px solid ${theme.borderColor || 'rgba(255,255,255,0.25)'}`,
            color: theme.textColor,
            borderRadius: '6px',
            padding: '0.3rem 0.55rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            ...buttonStyle,
          }}
        >
          <span style={{ fontSize: '1rem' }}>{currentLang.flag}</span>
          <span>{currentLang.code.toUpperCase()}</span>
          <span style={{ fontSize: '0.6rem', marginLeft: '0.1rem' }}>{open ? '▲' : '▼'}</span>
        </button>

        {open && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 4px)',
              backgroundColor: theme.mode === 'dark' ? '#1e1e2e' : '#fff',
              border: `1px solid ${theme.borderColor || 'rgba(0,0,0,0.12)'}`,
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              zIndex: 9999,
              minWidth: '160px',
              overflow: 'hidden',
            }}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchTo(lang.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.55rem 0.85rem',
                  border: 'none',
                  background: language === lang.code
                    ? (theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')
                    : 'transparent',
                  color: theme.textColor,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: language === lang.code ? 700 : 400,
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (language !== lang.code)
                    e.currentTarget.style.background = theme.mode === 'dark'
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.03)';
                }}
                onMouseLeave={(e) => {
                  if (language !== lang.code)
                    e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{lang.flag}</span>
                <span>{lang.name}</span>
                {language === lang.code && (
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.6 }}>✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ───── full variant (settings page — select-style) ───── */
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        data-umami-event="setLanguage"
        onClick={() => setOpen(o => !o)}
        style={{
          padding: '0.5rem 1.1rem',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '0.8rem',
          minWidth: '120px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          border: `1px solid ${theme.borderColor || 'rgba(0,0,0,0.12)'}`,
          color: theme.textColor,
          cursor: 'pointer',
          ...buttonStyle,
        }}
      >
        <span style={{ fontSize: '1rem' }}>{currentLang.flag}</span>
        <span>{currentLang.name}</span>
        <span style={{ fontSize: '0.55rem', marginLeft: 'auto' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 4px)',
            backgroundColor: theme.mode === 'dark' ? '#1e1e2e' : '#fff',
            border: `1px solid ${theme.borderColor || 'rgba(0,0,0,0.12)'}`,
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            zIndex: 9999,
            minWidth: '180px',
            overflow: 'hidden',
            maxHeight: '280px',
            overflowY: 'auto',
          }}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchTo(lang.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.6rem 0.9rem',
                border: 'none',
                background: language === lang.code
                  ? (theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')
                  : 'transparent',
                color: theme.textColor,
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: language === lang.code ? 700 : 400,
                textAlign: 'left',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (language !== lang.code)
                  e.currentTarget.style.background = theme.mode === 'dark'
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.03)';
              }}
              onMouseLeave={(e) => {
                if (language !== lang.code)
                  e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{lang.flag}</span>
              <span>{lang.name}</span>
              {language === lang.code && (
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.6 }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
