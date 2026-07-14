import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { Header } from '../sections/LandingHeader';
import LandingFooter from '../sections/LandingFooter';
import SEOHead from '../components/SEOHead';
import { PolicyContainer, PolicyTitle, /* PolicySection, PolicyText */ } from '../styles/PolicyPages';


export default function PrivacyPolicyPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language, translations, toggleLanguage } = useContext(LanguageContext);
  const { mode } = theme;

  return (
    <div
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        minHeight: '100vh',
      }}
    >
      <SEOHead 
        title={language === 'it' ? 'Privacy Policy | Pacifinance' : 'Privacy Policy | Pacifinance'}
        description={language === 'it' ? 'Leggi la Privacy Policy di Pacifinance per capire come proteggiamo e utilizziamo i tuoi dati personali.' : 'Read Pacifinance Privacy Policy to understand how we protect and use your personal data.'}
        keywords={language === 'it' ? 'privacy policy, protezione dati, GDPR, Pacifinance' : 'privacy policy, data protection, GDPR, Pacifinance'}
        canonical="/privacy-policy"
      />
      <Header
        theme={theme}
        mode={mode}
        toggleMode={toggleMode}
        toggleLanguage={toggleLanguage}
      />

      <PolicyContainer theme={theme}>
      <div className="max-w-4xl mx-auto">
        <PolicyTitle theme={theme}>
          <h1>Privacy Policy</h1>
          <div className="last-updated">Last updated: {new Date().toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}</div>
        </PolicyTitle>

        <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: '#079164' }}>
                {translations.legal.privacy.introduction.title}
              </h2>
              <p className="mb-4 leading-relaxed">
                {translations.legal.privacy.introduction.content}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: '#079164' }}>
                {translations.legal.privacy.dataCollection.title}
              </h2>
              <p className="mb-4 leading-relaxed">
                {translations.legal.privacy.dataCollection.content}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                {translations.legal.privacy.dataCollection.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: '#079164' }}>
                {translations.legal.privacy.dataUsage.title}
              </h2>
              <p className="mb-4 leading-relaxed">
                {translations.legal.privacy.dataUsage.content}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: '#079164' }}>
                {translations.legal.privacy.benchmarkParticipation?.title || 'Community benchmarks'}
              </h2>
              <p className="mb-4 leading-relaxed">
                {translations.legal.privacy.benchmarkParticipation?.content || 'Participation in hosted community benchmarks is optional and can be revoked from your profile at any time.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: '#079164' }}>
                {translations.legal.privacy.anonymity.title}
              </h2>
              <p className="mb-4 leading-relaxed">
                {translations.legal.privacy.anonymity.content}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: '#079164' }}>
                {translations.legal.privacy.contact.title}
              </h2>
              <p className="leading-relaxed">
                {translations.legal.privacy.contact.content}
              </p>
            </section>
          </div>
        </div>
        </PolicyContainer>

        <LandingFooter theme={theme}/>
      </div>
  );
}
