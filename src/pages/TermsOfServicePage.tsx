import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { Header } from '../sections/LandingHeader';
import LandingFooter from '../sections/LandingFooter';
import { PolicyContainer, PolicyHeader } from '../styles/PolicyPages';
import SEOHead from '../components/SEOHead';

export default function TermsOfServicePage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language, translations, toggleLanguage } = useContext(LanguageContext);
  const { mode } = theme;
  const { terms } = translations.legal;

  return (
    <>
      <SEOHead
        title={language === 'it' ? 'Termini di Servizio | Pacifinance' : 'Terms of Service | Pacifinance'}
        description={language === 'it' ? 'Termini di Servizio per Pacifinance - Comprendi i tuoi diritti e responsabilità utilizzando la nostra piattaforma finanziaria.' : 'Terms of Service for Pacifinance - Understanding your rights and responsibilities when using our privacy-focused personal finance platform.'}
        keywords={language === 'it' ? 'termini di servizio, condizioni, diritti, open source, AGPL, self-hosted, Pacifinance' : 'terms of service, conditions, rights, open source, AGPL, self-hosted, Pacifinance'}
        canonical="/terms-of-service"
      />

      <div className="w-full flex overflow-auto min-h-screen items-center flex-col" style={{ backgroundColor: theme.backgroundColor }}>
        <Header theme={theme} mode={mode} toggleMode={toggleMode} toggleLanguage={toggleLanguage}/>

        <PolicyContainer theme={theme}>
          <div className="max-w-4xl mx-auto">
            <PolicyHeader theme={theme}>
              <h1 style={{ color: theme.secondaryColor }}>
                {terms.title}
              </h1>
              <div className="last-updated">Last updated: {new Date().toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}</div>
            </PolicyHeader>

          <div className="space-y-8">
              <section
                className="p-6 rounded-xl"
                style={{
                  background: theme.mode === 'dark'
                    ? 'rgba(7, 145, 100, 0.1)'
                    : 'rgba(7, 145, 100, 0.05)',
                  border: `2px solid ${theme.mode === 'dark' ? 'rgba(7, 145, 100, 0.2)' : 'rgba(7, 145, 100, 0.15)'}`
                }}
              >
                <h2 className="text-3xl font-bold mb-6" style={{ color: theme.secondaryColor }}>
                  {terms.acceptance.title}
                </h2>
                <p className="mb-4 leading-relaxed text-lg">
                  {terms.acceptance.content}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.secondaryColor }}>
                  {terms.useOfService.title}
                </h2>
                <p className="mb-4 leading-relaxed">
                  {terms.useOfService.content}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.secondaryColor }}>
                  {terms.privacyAndData.title}
                </h2>
                <p className="mb-4 leading-relaxed">
                  {terms.privacyAndData.content}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.secondaryColor }}>
                  {terms.liability.title}
                </h2>
                <p className="leading-relaxed">
                  {terms.liability.content}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.secondaryColor }}>
                  {terms.openSource.title}
                </h2>
                <p className="leading-relaxed">
                  {terms.openSource.content}
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
