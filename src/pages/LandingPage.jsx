
import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import { Header } from '../sections/HeaderFooter';
import LandingFooter from '../components/LandingFooter';
import NewLandingContent from '../sections/LandingContent';

export default function NewLandingPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
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
        <Header theme={theme} mode={mode} toggleMode={toggleMode}/>
        <NewLandingContent theme={theme} language={language} isMobileScreen={isMobileScreen}/>
        <LandingFooter theme={theme}/>
      </div>
    </>
  );
}
