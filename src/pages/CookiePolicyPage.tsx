import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { Header } from '../sections/LandingHeader';
import LandingFooter from '../sections/LandingFooter';
import { PolicyContainer, PolicyHeader } from '../styles/PolicyPages';
import SEOHead from '../components/SEOHead';

export default function CookiePolicyPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language, translations, toggleLanguage } = useContext(LanguageContext);
  const { mode } = theme;
  const { cookies } = translations.legal;

  return (
    <>
      <SEOHead
        title={language === 'it' ? 'Politica sui Cookie | Pacifinance' : 'Cookie Policy | Pacifinance'}
        description={language === 'it' ? 'Politica sui Cookie per Pacifinance - Scopri come utilizziamo i cookie sulla nostra piattaforma finanziaria.' : 'Cookie Policy for Pacifinance - Learn about how we use cookies on our privacy-focused personal finance platform.'}
        keywords={language === 'it' ? 'politica cookie, privacy, gestione cookie, Pacifinance' : 'cookie policy, privacy, cookie management, Pacifinance'}
        canonical="/cookie-policy"
      />

      <div className="w-full flex overflow-auto min-h-screen items-center flex-col" style={{ backgroundColor: theme.backgroundColor }}>
        <Header theme={theme} mode={mode} toggleMode={toggleMode} toggleLanguage={toggleLanguage}/>

        <PolicyContainer theme={theme}>
          <div className="max-w-4xl mx-auto">
            <PolicyHeader theme={theme}>
              <h1 style={{ color: theme.secondaryColor }}>
                {cookies.title}
              </h1>
              <div className="last-updated">Last updated: {new Date().toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}</div>
            </PolicyHeader>

            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.secondaryColor }}>
                  {cookies.whatAreCookies.title}
                </h2>
                <p className="mb-4 leading-relaxed">
                  {cookies.whatAreCookies.content}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.secondaryColor }}>
                  {cookies.howWeUse.title}
                </h2>
                <p className="mb-4 leading-relaxed">
                  {cookies.howWeUse.content}
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  {cookies.howWeUse.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.secondaryColor }}>
                  {cookies.management.title}
                </h2>
                <p className="leading-relaxed">
                  {cookies.management.content}
                </p>
              </section>
            </div>
          </div>
        </PolicyContainer>

        <LandingFooter theme={theme}/>
      </div>
    </>
  );
}
