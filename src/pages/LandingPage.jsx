import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import { Header, Footer } from '../sections/HeaderFooter';
import LandingContent from '../sections/LandingContent';
import SEOHead from '../components/SEOHead';

export default function LandingPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const { isMobileScreen } = useContext(MediaQueryContext);
  const { mode } = theme;

  return (
    <>
      <SEOHead 
        title={language === 'it' ? 'PaciFinance - Gestione Finanziaria Personale' : 'PaciFinance - Personal Finance Management'}
        description={language === 'it' ? 'Gestisci le tue finanze personali con PaciFinance. Dashboard, grafici, statistiche e strumenti per il controllo delle spese e bilanci.' : 'Manage your personal finances with PaciFinance. Dashboard, charts, statistics and tools for expense and budget control.'}
        keywords={language === 'it' ? 'finanze personali, gestione spese, bilancio, dashboard finanziario, controllo spese' : 'personal finance, expense management, budget, financial dashboard, expense control'}
        canonical="/"
        ogTitle={language === 'it' ? 'PaciFinance - La tua piattaforma per la gestione finanziaria' : 'PaciFinance - Your personal finance management platform'}
        ogDescription={language === 'it' ? 'Strumenti professionali per gestire le tue finanze: dashboard, grafici, classifiche e molto altro.' : 'Professional tools to manage your finances: dashboard, charts, leaderboards and much more.'}
      />

      <div className="w-full flex overflow-auto min-h-screen items-center flex-col">
        <Header theme={theme} mode={mode} toggleMode={toggleMode}/>
        <LandingContent theme={theme} language={language} isMobileScreen={isMobileScreen}/>
        <Footer theme={theme}/>
      </div>
    </>
  );
}