import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { Header } from '../sections/HeaderFooter';
import LandingFooter from '../components/LandingFooter';
import languages from '../data/languages.json';

export default function PrivacyPolicyPage() {
  const { theme } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);

  return (
    <PolicyContainer theme={theme}>
      <div className="max-w-4xl mx-auto">
        <PolicyHeader theme={theme}>
          <h1>Privacy Policy</h1>
          <div className="last-updated">Last updated: {new Date().toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}</div>
        </PolicyHeader>

        <div className="space-y-6">
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
    </PolicyContainer>
  );
}