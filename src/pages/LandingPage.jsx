
import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import { Header } from '../sections/LandingHeader';
import LandingFooter from '../sections/LandingFooter';
import NewLandingContent from '../sections/LandingContent';
import { useHTMLLang } from '../hooks/useHTMLLang';

export default function NewLandingPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const { isMobileScreen } = useContext(MediaQueryContext);
  const { mode } = theme;

  // Aggiorna dinamicamente l'attributo lang dell'HTML
  useHTMLLang(language);

  // Metadata dinamici per ogni lingua
  const getMetadata = () => {
    if (language === 'it') {
      return {
        title: "Unifica le Tue Finanze - Dashboard Multi-Piattaforma PaciFinance",
        description: "Unifica le tue finanze in un'unica piattaforma. Traccia conti di diverse banche, confronta spese anonimamente e gestisci investimenti. Supporto per 19 valute con tassi di cambio in tempo reale: EUR, USD, GBP, CHF, JPY, CAD, AUD, SEK, NOK, DKK, PLN, CZK, HUF, RON, BGN, BRL, INR, CNY, TRY.",
        locale: "it_IT",
        languageCode: "it",
        keywords: "unificare finanze, dashboard multi-piattaforma, gestione finanziaria, confronto anonimo, tracciamento spese, portafoglio investimenti, aggregazione conti bancari, analisi finanziaria, importare transazioni CSV, importare Excel spese, multi-valuta, conversione valute, tassi di cambio, EUR, USD, GBP, CHF, JPY, CAD, AUD, SEK, NOK, DKK, PLN, CZK, HUF, RON, BGN, BRL, INR, CNY, TRY, 19 valute supportate"
      };
    }
    return {
      title: "Unify Your Finances - PaciFinance Multi-Platform Dashboard",
      description: "Unify your finances in one platform. Track accounts across multiple banks, compare spending anonymously, and manage investments. Support for 19 currencies with live exchange rates: EUR, USD, GBP, CHF, JPY, CAD, AUD, SEK, NOK, DKK, PLN, CZK, HUF, RON, BGN, BRL, INR, CNY, TRY.",
      locale: "en_US",
      languageCode: "en", 
      keywords: "unify finances, multi-platform dashboard, financial management, anonymous comparison, expense tracking, investment portfolio, bank account aggregation, financial analytics, import CSV transactions, import Excel expenses, multi-currency, currency conversion, exchange rates, EUR, USD, GBP, CHF, JPY, CAD, AUD, SEK, NOK, DKK, PLN, CZK, HUF, RON, BGN, BRL, INR, CNY, TRY, 19 currencies supported"
    };
  };

  const metadata = getMetadata();

  return (
    <>
      {/* Performance Resource Hints - moved to index.html for earlier discovery */}
      
      <Helmet>
        {/* Canonical URL */}
        <link rel="canonical" href="https://pacifinance.com/" />
        
        {/* SEO Meta Tags - Dinamici per Lingua Attuale */}
        <title>{metadata.title}</title>
        <meta name="description" content={`${metadata.description} ${language === 'it' ? 'Dashboard finanziario gratuito multi-piattaforma.' : 'Free multi-platform financial dashboard.'}`} />
        <meta name="keywords" content={metadata.keywords} />
        <meta httpEquiv="Content-Language" content={metadata.languageCode} />
        <meta name="language" content={metadata.languageCode} />
        <meta name="robots" content="index, follow" />
        <meta name="google" content="notranslate" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://pacifinance.com/" />
        <meta property="og:image" content="https://pacifinance.com/PacifinanceLogoPNG3NoBg.webp" />
        <meta property="og:image:alt" content="PaciFinance - Unified Financial Dashboard" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="PaciFinance" />
        <meta property="og:locale" content={metadata.locale} />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@pacifinance" />
        <meta name="twitter:creator" content="@pacifinance" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content="https://pacifinance.com/PacifinanceLogoPNG3NoBg.webp" />
        <meta name="twitter:image:alt" content="PaciFinance - Unified Financial Dashboard" />
        
        {/* Schema.org Structured Data - Supporto Multilingua */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "PaciFinance",
            "description": metadata.description,
            "url": "https://pacifinance.com/",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": ["Web Browser", "iOS", "Android"],
            "inLanguage": ["en", "it"],
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "author": {
              "@type": "Organization",
              "name": "PaciFinance",
              "url": "https://pacifinance.com",
              "sameAs": [
                "https://twitter.com/pacifinance"
              ]
            },
            "featureList": [
              language === 'it' ? "Unificazione conti bancari" : "Bank account unification",
              language === 'it' ? "Confronti anonimi" : "Anonymous comparisons", 
              language === 'it' ? "Gestione investimenti" : "Investment management",
              language === 'it' ? "Analisi spese" : "Expense analytics",
              language === 'it' ? "Supporto 19 valute (EUR, USD, GBP, CHF, JPY, CAD, AUD, SEK, NOK, DKK, PLN, CZK, HUF, RON, BGN, BRL, INR, CNY, TRY)" : "19 currencies supported (EUR, USD, GBP, CHF, JPY, CAD, AUD, SEK, NOK, DKK, PLN, CZK, HUF, RON, BGN, BRL, INR, CNY, TRY)",
              language === 'it' ? "Tassi di cambio in tempo reale" : "Live exchange rates",
              language === 'it' ? "Importazione CSV e Excel" : "CSV and Excel import"
            ]
          })}
        </script>

        {/* Additional Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "PaciFinance",
            "url": "https://pacifinance.com",
            "logo": "https://pacifinance.com/PacifinanceLogoPNG3NoBg.webp",
            "sameAs": [
              "https://twitter.com/pacifinance"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "availableLanguage": ["English", "Italian"]
            }
          })}
        </script>
      </Helmet>
      
      {/* Critical CSS per Above-the-fold */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .hero-section { min-height: 100vh; display: flex; align-items: center; }
          .hero-gradient { background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%); }
          .text-gradient { background: linear-gradient(to right, #10b981, #059669); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          img[loading="eager"] { display: block; max-width: 100%; height: auto; }
        `
      }} />
      
      <div className="w-full flex overflow-auto min-h-screen items-center flex-col">
        <Header theme={theme} mode={mode} toggleMode={toggleMode}/>
        <NewLandingContent theme={theme} language={language} isMobileScreen={isMobileScreen}/>
        <LandingFooter theme={theme}/>
      </div>
    </>
  );
}
