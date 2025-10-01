import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { Header } from '../sections/LandingHeader';
import LandingFooter from '../sections/LandingFooter';
import { PolicyContainer, PolicyHeader } from '../styles/PolicyPages';
import languages from '../data/languages.json';
import SEOHead from '../components/SEOHead';

export default function CookiePolicyPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language, toggleLanguage } = useContext(LanguageContext);
  const { mode } = theme;

  return (
    <>
      <SEOHead 
        title={language === 'it' ? 'Politica sui Cookie | PaciFinance' : 'Cookie Policy | PaciFinance'}
        description={language === 'it' ? 'Politica sui Cookie per PaciFinance - Scopri come utilizziamo i cookie sulla nostra piattaforma finanziaria.' : 'Cookie Policy for PaciFinance - Learn about how we use cookies on our privacy-focused personal finance platform.'}
        keywords={language === 'it' ? 'politica cookie, privacy, gestione cookie, PaciFinance' : 'cookie policy, privacy, cookie management, PaciFinance'}
        canonical="/cookie-policy"
      />

      <div className="w-full flex overflow-auto min-h-screen items-center flex-col" style={{ backgroundColor: theme.backgroundColor }}>
        <Header theme={theme} mode={mode} toggleMode={toggleMode} toggleLanguage={toggleLanguage}/>

        <PolicyContainer theme={theme}>
          <div className="max-w-4xl mx-auto">
            <PolicyHeader theme={theme}>
              <h1 style={{ color: '#079164' }}>
                {language === 'it' ? 'Politica sui Cookie' : 'Cookie Policy'}
              </h1>
              <div className="last-updated">Last updated: {new Date().toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}</div>
            </PolicyHeader>

            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#079164' }}>
                  {language === 'it' ? 'Cosa sono i Cookie' : 'What are Cookies'}
                </h2>
                <p className="mb-4 leading-relaxed">
                  {language === 'it' 
                    ? 'I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo quando visiti un sito web. Vengono utilizzati per migliorare la tua esperienza di navigazione.'
                    : 'Cookies are small text files that are stored on your device when you visit a website. They are used to improve your browsing experience.'
                  }
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#079164' }}>
                  {language === 'it' ? 'Come Utilizziamo i Cookie' : 'How We Use Cookies'}
                </h2>
                <p className="mb-4 leading-relaxed">
                  {language === 'it'
                    ? 'PaciFinance utilizza solo cookie tecnici necessari per il funzionamento del sito e cookie analitici anonimi per migliorare il servizio.'
                    : 'PaciFinance only uses technical cookies necessary for the site to function and anonymous analytics cookies to improve the service.'
                  }
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>{language === 'it' ? 'Cookie tecnici necessari' : 'Necessary technical cookies'}</li>
                  <li>{language === 'it' ? 'Cookie analitici (Umami Analytics)' : 'Analytics cookies (Umami Analytics)'}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#079164' }}>
                  {language === 'it' ? 'Gestione dei Cookie' : 'Cookie Management'}
                </h2>
                <p className="leading-relaxed">
                  {language === 'it'
                    ? 'Puoi gestire le tue preferenze sui cookie utilizzando il banner dei cookie che appare alla prima visita del sito. Puoi modificare le tue preferenze in qualsiasi momento.'
                    : 'You can manage your cookie preferences using the cookie banner that appears on your first visit to the site. You can change your preferences at any time.'
                  }
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