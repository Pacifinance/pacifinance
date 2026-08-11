
import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { Header } from '../sections/LandingHeader';
import LandingFooter from '../sections/LandingFooter';
import NewLandingContent from '../sections/LandingContent';
import SEOHead from '../components/SEOHead';
import { GITHUB_REPO_URL } from '../data/externalLinks';
import { useHTMLLang } from '../hooks/useHTMLLang';

export default function NewLandingPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const { mode } = theme;

  // Dynamically update the HTML lang attribute
  useHTMLLang(language);

  // Dynamic metadata for each language
  const getMetadata = () => {
    if (language === 'it') {
      return {
        title: "Pacifinance - Finanza Personale Open Source e Privacy-First",
        description: "Capisci la tua situazione finanziaria e confrontati in modo completamente anonimo con altri utenti, senza condividere i tuoi dati. App gratuita, open source (AGPLv3) e auto-ospitabile con Docker.",
        keywords: "app finanza personale open source, gestione finanziaria privacy-first, confronto anonimo finanze, self hosted finance app, app finanze gratuita, budget open source, tracciamento spese, portafoglio investimenti, storico prezzi verificato dalla community, AGPL, Docker self-hosting, unificare conti bancari, multi-valuta, EUR, USD, GBP, CHF, JPY, CAD, AUD, SEK, NOK, DKK, PLN, CZK, HUF, RON, BGN, BRL, INR, CNY, TRY",
        featureList: [
          "Confronto finanziario anonimo",
          "Open source (AGPLv3), codice pubblico su GitHub",
          "Auto-ospitabile con Docker",
          "Storico prezzi verificato dalla community",
          "Unificazione conti bancari",
          "Gestione investimenti",
          "Analisi spese",
          "Prezzi di mercato crypto in tempo reale",
          "Supporto 19 valute",
          "Importazione CSV e Excel"
        ],
      };
    }
    return {
      title: "Pacifinance - Open Source, Privacy-First Personal Finance",
      description: "Understand your financial situation and compare yourself completely anonymously with other users, without sharing your data. Free, open source (AGPLv3) app, self-hostable with Docker.",
      keywords: "open source personal finance app, privacy-first finance management, anonymous financial comparison, self-hosted finance app, free budget app, open source budgeting, expense tracking, investment portfolio, community-verified price history, AGPL, Docker self-hosting, unify bank accounts, multi-currency, EUR, USD, GBP, CHF, JPY, CAD, AUD, SEK, NOK, DKK, PLN, CZK, HUF, RON, BGN, BRL, INR, CNY, TRY",
      featureList: [
        "Anonymous financial comparison",
        "Open source (AGPLv3), public code on GitHub",
        "Self-hostable with Docker",
        "Community-verified price history",
        "Bank account unification",
        "Investment management",
        "Expense analytics",
        "Real-time crypto market prices",
        "19 currencies supported",
        "CSV and Excel import"
      ],
    };
  };

  const metadata = getMetadata();

  return (
    <>
      <SEOHead
        title={metadata.title}
        description={metadata.description}
        keywords={metadata.keywords}
        canonical="/"
        language={language}
        featureList={metadata.featureList}
        license={`${GITHUB_REPO_URL}/blob/main/LICENSE`}
      />

      {/* Organization schema: real, verifiable data only (name/url/logo/contact) —
          no aggregateRating here, since no genuine reviews exist to back one. */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Pacifinance",
            "url": "https://pacifinance.com",
            "logo": "https://pacifinance.com/og-image.webp",
            "sameAs": [
              "https://twitter.com/pacifinance",
              GITHUB_REPO_URL
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "availableLanguage": ["English", "Italian", "Spanish", "German", "French", "Portuguese"]
            }
          })}
        </script>
      </Helmet>

      <div className="w-full flex overflow-auto min-h-screen items-center flex-col relative">
        <Header theme={theme} mode={mode} toggleMode={toggleMode}/>
        <NewLandingContent theme={theme}/>
        <LandingFooter theme={theme}/>
      </div>
    </>
  );
}
