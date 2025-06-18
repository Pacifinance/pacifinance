
import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { Header } from '../sections/HeaderFooter';
import LandingFooter from '../components/LandingFooter';
import languages from '../data/languages.json';

export default function PrivacyPolicyPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const { mode } = theme;

  return (
    <>
      <title>Privacy Policy - PaciFinance</title>
      <meta name="description" content="Privacy Policy for PaciFinance - Learn how we protect your personal and financial data with complete privacy and anonymity." />
      
      <div className="w-full flex overflow-auto min-h-screen items-center flex-col">
        <Header theme={theme} mode={mode} toggleMode={toggleMode}/>
        
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12" style={{ color: theme.textColor }}>
          <h1 className="text-4xl font-bold mb-8 text-center" style={{ color: theme.secondaryColor }}>
            {languages[language].legal.privacy.title}
          </h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.secondaryColor }}>
                {languages[language].legal.privacy.introduction.title}
              </h2>
              <p className="mb-4 leading-relaxed">
                {languages[language].legal.privacy.introduction.content}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.secondaryColor }}>
                {languages[language].legal.privacy.dataCollection.title}
              </h2>
              <p className="mb-4 leading-relaxed">
                {languages[language].legal.privacy.dataCollection.content}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                {languages[language].legal.privacy.dataCollection.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.secondaryColor }}>
                {languages[language].legal.privacy.dataUsage.title}
              </h2>
              <p className="mb-4 leading-relaxed">
                {languages[language].legal.privacy.dataUsage.content}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.secondaryColor }}>
                {languages[language].legal.privacy.anonymity.title}
              </h2>
              <p className="mb-4 leading-relaxed">
                {languages[language].legal.privacy.anonymity.content}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.secondaryColor }}>
                {languages[language].legal.privacy.contact.title}
              </h2>
              <p className="leading-relaxed">
                {languages[language].legal.privacy.contact.content}
              </p>
            </section>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-sm opacity-70">
              {languages[language].legal.privacy.lastUpdated}: {new Date().toLocaleDateString()}
            </p>
          </div>
        </main>

        <LandingFooter theme={theme}/>
      </div>
    </>
  );
}
