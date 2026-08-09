
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

  // Dynamically update the HTML lang attribute
  useHTMLLang(language);

  // Dynamic metadata for each language
  const getMetadata = () => {
    if (language === 'it') {
      return {
        title: "Pacifinance - Finanza Personale Open Source e Privacy-First",
        description: "Capisci la tua situazione finanziaria e confrontati in modo completamente anonimo con altri utenti, senza condividere i tuoi dati. App gratuita, open source (AGPLv3) e auto-ospitabile con Docker.",
        locale: "it_IT",
        languageCode: "it",
        keywords: "app finanza personale open source, gestione finanziaria privacy-first, confronto anonimo finanze, self hosted finance app, app finanze gratuita, budget open source, tracciamento spese, portafoglio investimenti, storico prezzi verificato dalla community, AGPL, Docker self-hosting, unificare conti bancari, multi-valuta, EUR, USD, GBP, CHF, JPY, CAD, AUD, SEK, NOK, DKK, PLN, CZK, HUF, RON, BGN, BRL, INR, CNY, TRY"
      };
    }
    return {
      title: "Pacifinance - Open Source, Privacy-First Personal Finance",
      description: "Understand your financial situation and compare yourself completely anonymously with other users, without sharing your data. Free, open source (AGPLv3) app, self-hostable with Docker.",
      locale: "en_US",
      languageCode: "en",
      keywords: "open source personal finance app, privacy-first finance management, anonymous financial comparison, self-hosted finance app, free budget app, open source budgeting, expense tracking, investment portfolio, community-verified price history, AGPL, Docker self-hosting, unify bank accounts, multi-currency, EUR, USD, GBP, CHF, JPY, CAD, AUD, SEK, NOK, DKK, PLN, CZK, HUF, RON, BGN, BRL, INR, CNY, TRY"
    };
  };

  const metadata = getMetadata();

  return (
    <>
      {/* Performance Resource Hints - moved to index.html for earlier discovery */}
      
      <Helmet>
        {/* Canonical URL */}
        <link rel="canonical" href="https://pacifinance.com/" />
        
        {/* SEO Meta Tags - Dynamic for Current Language */}
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
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
        <meta property="og:image:alt" content="Pacifinance - Open Source Privacy-First Personal Finance" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Pacifinance" />
        <meta property="og:locale" content={metadata.locale} />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@pacifinance" />
        <meta name="twitter:creator" content="@pacifinance" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content="https://pacifinance.com/PacifinanceLogoPNG3NoBg.webp" />
        <meta name="twitter:image:alt" content="Pacifinance - Unified Financial Dashboard" />
        
        {/* Schema.org Structured Data - Multilingual Support */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Pacifinance",
            "description": metadata.description,
            "url": "https://pacifinance.com/",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": ["Web Browser", "iOS", "Android"],
            "inLanguage": ["en", "it"],
            "license": "https://github.com/pacifinance/pacifinance/blob/main/LICENSE",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR"
            },
            "author": {
              "@type": "Organization",
              "name": "Pacifinance",
              "url": "https://pacifinance.com",
              "sameAs": [
                "https://twitter.com/pacifinance",
                "https://github.com/pacifinance/pacifinance"
              ]
            },
            "featureList": [
              language === 'it' ? "Confronto finanziario anonimo" : "Anonymous financial comparison",
              language === 'it' ? "Open source (AGPLv3), codice pubblico su GitHub" : "Open source (AGPLv3), public code on GitHub",
              language === 'it' ? "Auto-ospitabile con Docker" : "Self-hostable with Docker",
              language === 'it' ? "Storico prezzi verificato dalla community" : "Community-verified price history",
              language === 'it' ? "Unificazione conti bancari" : "Bank account unification",
              language === 'it' ? "Gestione investimenti" : "Investment management",
              language === 'it' ? "Analisi spese" : "Expense analytics",
              language === 'it' ? "Prezzi di mercato crypto in tempo reale" : "Real-time crypto market prices",
              language === 'it' ? "Supporto 19 valute" : "19 currencies supported",
              language === 'it' ? "Importazione CSV e Excel" : "CSV and Excel import"
            ]
          })}
        </script>

        {/* Additional Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Pacifinance",
            "url": "https://pacifinance.com",
            "logo": "https://pacifinance.com/PacifinanceLogoPNG3NoBg.webp",
            "sameAs": [
              "https://twitter.com/pacifinance",
              "https://github.com/pacifinance/pacifinance"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "availableLanguage": ["English", "Italian"]
            }
          })}
        </script>
      </Helmet>
      
      {/* Critical CSS for Above-the-fold */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .hero-section { min-height: 100vh; display: flex; align-items: center; }
          .hero-gradient { background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%); }
          .text-gradient { background: linear-gradient(to right, #10b981, #059669); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          img[loading="eager"] { display: block; max-width: 100%; height: auto; }
        `
      }} />
      
      <div className="w-full flex overflow-auto min-h-screen items-center flex-col relative">
        <Header theme={theme} mode={mode} toggleMode={toggleMode}/>
        <NewLandingContent theme={theme} language={language} isMobileScreen={isMobileScreen}/>
        <LandingFooter theme={theme}/>
      </div>
    </>
  );
}
