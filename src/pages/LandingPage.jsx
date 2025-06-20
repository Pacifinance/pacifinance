import React, { useContext, useEffect } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { Header, Footer } from '../sections/HeaderFooter';
import LandingContent from '../sections/LandingContent';
import BuyMeACoffeeWidget from '../components/BuyMeACoffeeWidget';
import CookieBanner from '../components/CookieBanner';
import SEOHead from '../components/SEOHead';
import languages from '../data/languages.json';

export default function LandingPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language, toggleLanguage } = useContext(LanguageContext);
  const { mode } = theme;

  return (
    <div
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        minHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      <SEOHead 
        title={language === 'it' ? 'PaciFinance - Gestione Finanziaria Personale' : 'PaciFinance - Personal Finance Management'}
        description={language === 'it' ? 'Gestisci le tue finanze personali con PaciFinance. Dashboard, grafici, statistiche e strumenti per il controllo delle spese e bilanci.' : 'Manage your personal finances with PaciFinance. Dashboard, charts, statistics and tools for expense and budget control.'}
        keywords={language === 'it' ? 'finanze personali, gestione spese, bilancio, dashboard finanziario, controllo spese' : 'personal finance, expense management, budget, financial dashboard, expense control'}
        canonical="/"
        ogTitle={language === 'it' ? 'PaciFinance - La tua piattaforma per la gestione finanziaria' : 'PaciFinance - Your personal finance management platform'}
        ogDescription={language === 'it' ? 'Strumenti professionali per gestire le tue finanze: dashboard, grafici, classifiche e molto altro.' : 'Professional tools to manage your finances: dashboard, charts, leaderboards and much more.'}
      />

      <Header theme={theme} mode={mode} toggleMode={toggleMode} toggleLanguage={toggleLanguage}/>
      <LandingContent theme={theme} language={language} />
      <BuyMeACoffeeWidget theme={theme} language={language} />
      <CookieBanner theme={theme} language={language} />
      <Footer theme={theme} language={language} />
    </div>
  );
}

  // Chiamata per caricare i dati dell'utente
  // const loadUserData = () => {
  //   handleSetIsUpdated(false); // Forza il re-render di UserProvider
  // };

  // useEffect(() => {
  //   loadUserData(); // Chiamata iniziale per caricare i dati dell'utente al caricamento della pagina
  // }, []);

  // Matomo Tag Manager
  // React.useEffect(() => {
  //   var _mtm = window._mtm = window._mtm || [];
  //   _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
  //   var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  //   g.async=true; g.src='https://cdn.matomo.cloud/pacifinance.matomo.cloud/container_geUS8Fsk.js'; s.parentNode.insertBefore(g,s);
  // }, [])