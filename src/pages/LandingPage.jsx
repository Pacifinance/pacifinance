import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import { Header } from '../sections/HeaderFooter';
import LandingFooter from '../components/LandingFooter';
import NewLandingContent from '../sections/NewLandingContent';

export default function LandingPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language, toggleLanguage } = useContext(LanguageContext);
  const { isMobileScreen } = useContext(MediaQueryContext);
  const { mode } = theme;

  return (
    <>
      {/* SEO Meta Tags */}
      <title>PaciFinance - Personal Finance Made Simple & Private</title>
      <meta name="description" content="Take control of your personal finances with complete privacy. Track expenses, manage investments, and compare anonymously with similar users. Free forever." />
      <meta name="keywords" content="personal finance, privacy, expense tracking, investment management, financial analytics, anonymous comparison" />
      <meta property="og:title" content="PaciFinance - Personal Finance Made Simple & Private" />
      <meta property="og:description" content="Take control of your personal finances with complete privacy. Track expenses, manage investments, and compare anonymously with similar users." />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      
      <div className="w-full flex overflow-auto min-h-screen items-center flex-col">
        <Header theme={theme} mode={mode} toggleMode={toggleMode} toggleLanguage={toggleLanguage}/>
        <NewLandingContent theme={theme} language={language} isMobileScreen={isMobileScreen}/>
        <LandingFooter theme={theme}/>
      </div>
    </>
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

