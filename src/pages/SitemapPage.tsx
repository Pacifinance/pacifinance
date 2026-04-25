import React, { useContext } from "react";
import { LocalizedLink } from "../components/LocalizedLink";
import { ThemeContext } from "../contexts/ThemeContext";
import { LanguageContext } from "../contexts/LanguageContext";
import { Header } from "../sections/LandingHeader";
import LandingFooter from "../sections/LandingFooter";
import SEOHead from '../components/SEOHead';

export default function SitemapPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language, toggleLanguage } = useContext(LanguageContext);
  const { mode } = theme;

  const pages = [
    { path: "/", name: language === "it" ? "Home" : "Home" },
    { path: "/dashboard", name: language === "it" ? "Dashboard" : "Dashboard" },
    { path: "/faq", name: "FAQ" },
    { path: "/pricing", name: language === "it" ? "Prezzi" : "Pricing" },
    { path: "/privacy-policy", name: "Privacy Policy" },
    {
      path: "/terms-of-service",
      name: language === "it" ? "Termini di Servizio" : "Terms of Service",
    },
    { path: "/cookie-policy", name: "Cookie Policy" },
    { path: "/disclaimer", name: "Disclaimer" },
    {
      path: "/sitemap",
      name: language === "it" ? "Mappa del Sito" : "Sitemap",
    },
  ];

  return (
    <>
      <SEOHead 
        title={language === 'it' ? 'Mappa del Sito | PaciFinance' : 'Sitemap | PaciFinance'}
        description={language === 'it' ? 'Naviga attraverso tutte le pagine di PaciFinance, la piattaforma per la gestione finanziaria privata e sicura.' : 'Navigate through all pages of PaciFinance, our privacy-focused personal finance platform.'}
        keywords={language === 'it' ? 'mappa del sito, navigazione, pagine, PaciFinance' : 'sitemap, navigation, pages, PaciFinance'}
        canonical="/sitemap"
      />

      <div className="w-full flex overflow-auto min-h-screen items-center flex-col" style={{ backgroundColor: theme.backgroundColor }}>
        <Header
          theme={theme}
          mode={mode}
          toggleMode={toggleMode}
          toggleLanguage={toggleLanguage}
        />

        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
          <div 
            className="p-8 rounded-2xl shadow-2xl"
            style={{ 
              background: theme.mode === 'dark' 
                ? `linear-gradient(135deg, ${theme.backgroundColor} 0%, ${theme.primaryColor} 100%)`
                : `linear-gradient(135deg, ${theme.backgroundColor} 0%, #f8f9fa 100%)`,
              color: theme.textColor
            }}
          >
            <h1
              className="text-5xl font-bold mb-12 text-center"
              style={{ 
                color: '#079164',
                textShadow: theme.mode === 'dark' 
                  ? '0 2px 4px rgba(0, 0, 0, 0.3)'
                  : '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              {language === "it" ? "Mappa del Sito" : "Sitemap"}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.map((page, index) => (
                <LocalizedLink
                  key={index}
                  to={page.path}
                  className="block p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl group"
                  style={{
                    borderColor: theme.mode === 'dark' 
                      ? 'rgba(7, 145, 100, 0.3)'
                      : 'rgba(7, 145, 100, 0.2)',
                    backgroundColor: theme.mode === 'dark' 
                      ? 'rgba(7, 145, 100, 0.1)'
                      : 'rgba(7, 145, 100, 0.05)',
                  }}
                >
                  <h3
                    className="font-bold text-lg mb-2 group-hover:text-opacity-80 transition-all"
                    style={{ color: '#079164' }}
                  >
                    {page.name}
                  </h3>
                  <p 
                    className="text-sm font-mono"
                    style={{ 
                      opacity: 0.6,
                      color: theme.textColor
                    }}
                  >
                    {page.path}
                  </p>
                </LocalizedLink>
              ))}
            </div>
          </div>
        </main>

        <LandingFooter theme={theme} />
      </div>
    </>
  );
}
