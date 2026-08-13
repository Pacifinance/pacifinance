import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../sections/LandingHeader';
import LandingFooter from '../sections/LandingFooter';
import { LocalizedLink } from '../components/LocalizedLink';
import SEOHead from '../components/SEOHead';

/**
 * Rendered by the in-language catch-all route (AppRouter.tsx) for any
 * unmatched path. Previously that route silently redirected to the language
 * root, so a mistyped or dead link never told the visitor (or a crawler)
 * anything went wrong — this renders a real page instead, marked noindex.
 */
export default function NotFoundPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language, toggleLanguage } = useContext(LanguageContext);
  const { isAuthenticated } = useAuth();
  const { mode } = theme;

  return (
    <>
      <SEOHead
        title={language === 'it' ? 'Pagina non trovata | Pacifinance' : 'Page not found | Pacifinance'}
        description={language === 'it' ? 'La pagina richiesta non esiste o è stata spostata.' : 'The page you requested does not exist or has moved.'}
        canonical="/404"
        noindex
      />

      <div className="w-full flex overflow-auto min-h-screen items-center flex-col" style={{ backgroundColor: theme.backgroundColor }}>
        <Header theme={theme} mode={mode} toggleMode={toggleMode} toggleLanguage={toggleLanguage} />

        <div className="flex-1 w-full flex items-center justify-center px-4" style={{ minHeight: '60vh' }}>
          <div className="max-w-lg text-center">
            <div style={{ fontSize: '5rem', fontWeight: 800, lineHeight: 1, color: theme.secondaryColor }}>
              404
            </div>
            <h1 className="text-2xl font-bold mt-4 mb-3" style={{ color: theme.textColor }}>
              {language === 'it' ? 'Pagina non trovata' : 'Page not found'}
            </h1>
            <p className="mb-8 leading-relaxed" style={{ color: theme.textColor, opacity: 0.75 }}>
              {language === 'it'
                ? 'Il link potrebbe essere sbagliato o la pagina è stata spostata.'
                : 'The link may be wrong, or the page has moved.'}
            </p>
            <LocalizedLink
              to={isAuthenticated ? '/dashboard' : '/'}
              data-umami-event="404-back-home"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.85rem 2rem',
                borderRadius: '0.75rem',
                fontWeight: 700,
                textDecoration: 'none',
                color: 'white',
                background: `linear-gradient(135deg, ${theme.buttonBackgroundColor} 0%, #0ba374 100%)`,
                boxShadow: `0 8px 25px ${theme.buttonBackgroundColor}55`,
              }}
            >
              {isAuthenticated
                ? (language === 'it' ? 'Torna alla Dashboard' : 'Back to Dashboard')
                : (language === 'it' ? 'Torna alla Home' : 'Back to Home')}
            </LocalizedLink>
          </div>
        </div>

        <LandingFooter theme={theme} />
      </div>
    </>
  );
}
