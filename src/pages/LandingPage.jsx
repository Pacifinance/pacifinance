
import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { MediaQueryContext } from '../contexts/MediaQueryContext';
import { Header } from '../sections/LandingHeader';
import LandingFooter from '../sections/LandingFooter';
import NewLandingContent from '../sections/LandingContent';

export default function NewLandingPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const { isMobileScreen } = useContext(MediaQueryContext);
  const { mode } = theme;

  return (
    <>
      {/* Performance Resource Hints */}
      <link rel="preload" href="/src/assets/LandingPage/PacifinanceArt2NoBg.webp" as="image" />
      <link rel="preload" href="/src/assets/Brand/PacifinanceLogoPNG3NoBg.webp" as="image" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link rel="dns-prefetch" href="https://api.pacifinance.com" />
      
      {/* SEO Meta Tags */}
      <title>Unify Your Finances - PaciFinance Multi-Platform Dashboard</title>
      <meta name="description" content="Unify your finances in one platform. Track accounts across multiple banks, compare spending anonymously, and manage investments. Free multi-platform financial dashboard." />
      <meta name="keywords" content="unify finances, multi-platform dashboard, financial management, anonymous comparison, expense tracking, investment portfolio, bank account aggregation, financial analytics" />
      <meta property="og:title" content="Unify Your Finances - PaciFinance Multi-Platform Dashboard" />
      <meta property="og:description" content="Unify your finances in one platform. Track accounts across multiple banks, compare spending anonymously, and manage investments." />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      
      {/* Critical CSS per Above-the-fold */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .hero-section { min-height: 100vh; display: flex; align-items: center; }
          .hero-gradient { background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%); }
          .text-gradient { background: linear-gradient(to right, #10b981, #059669); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          img[loading="eager"] { display: block; max-width: 100%; height: auto; }
        `
      }} />
      
      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "PaciFinance",
          "description": "Unify your finances in one platform. Track accounts across multiple banks, compare spending anonymously, and manage investments.",
          "url": "https://pacifinance.com",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": ["Web Browser", "iOS", "Android"],
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "author": {
            "@type": "Organization",
            "name": "PaciFinance"
          },
        })}
      </script>
      
      <div className="w-full flex overflow-auto min-h-screen items-center flex-col">
        <Header theme={theme} mode={mode} toggleMode={toggleMode}/>
        <NewLandingContent theme={theme} language={language} isMobileScreen={isMobileScreen}/>
        <LandingFooter theme={theme}/>
      </div>
    </>
  );
}
