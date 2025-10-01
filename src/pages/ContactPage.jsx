import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { Header } from '../sections/LandingHeader';
import LandingFooter from '../sections/LandingFooter';
import { PolicyContainer, PolicyHeader } from '../styles/PolicyPages';
import languages from '../data/languages.json';
import SEOHead from '../components/SEOHead';

export default function ContactPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language, toggleLanguage } = useContext(LanguageContext);
  const { mode } = theme;

  return (
    <>
      <SEOHead 
        title={language === 'it' ? 'Contatti | PaciFinance' : 'Contact Us | PaciFinance'}
        description={language === 'it' ? 'Contatta il team di PaciFinance per supporto, domande o suggerimenti sulla nostra piattaforma di gestione finanziaria.' : 'Contact the PaciFinance team for support, questions or suggestions about our financial management platform.'}
        keywords={language === 'it' ? 'contatti, supporto, aiuto, PaciFinance' : 'contact, support, help, PaciFinance'}
        canonical="/contact"
      />

      <div className="w-full flex overflow-auto min-h-screen items-center flex-col" style={{ backgroundColor: theme.backgroundColor }}>
        <Header theme={theme} mode={mode} toggleMode={toggleMode} toggleLanguage={toggleLanguage}/>

        <PolicyContainer theme={theme}>
          <div className="max-w-4xl mx-auto">
            <PolicyHeader theme={theme}>
              <h1 style={{ color: '#079164' }}>
                {language === 'it' ? 'Contatti' : 'Contact'}
              </h1>
              <div className="last-updated">
                {language === 'it' ? 'Siamo qui per aiutarti' : 'We are here to help you'}
              </div>
            </PolicyHeader>

            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#079164' }}>
                  {language === 'it' ? 'Supporto Tecnico' : 'Technical Support'}
                </h2>
                <p className="mb-4 leading-relaxed">
                  {language === 'it'
                    ? 'Per qualsiasi problema tecnico o domanda sul funzionamento di PaciFinance, contattaci:'
                    : 'For any technical issues or questions about PaciFinance functionality, contact us:'
                  }
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="font-semibold text-lg" style={{ color: '#079164' }}>
                    📧 support@pacifinance.com
                  </p>
                  <p className="text-sm mt-2 opacity-70">
                    {language === 'it'
                      ? 'Tempo di risposta: 24-48 ore lavorative'
                      : 'Response time: 24-48 business hours'
                    }
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#079164' }}>
                  {language === 'it' ? 'Domande Frequenti' : 'Frequently Asked Questions'}
                </h2>
                <p className="mb-4 leading-relaxed">
                  {language === 'it'
                    ? 'Prima di contattarci, controlla la nostra sezione FAQ dove potresti trovare la risposta alla tua domanda.'
                    : 'Before contacting us, check our FAQ section where you might find the answer to your question.'
                  }
                </p>
                <Link 
                  to="/faq" 
                  className="inline-block px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{ backgroundColor: '#079164', color: 'white' }}
                >
                  {language === 'it' ? 'Visita le FAQ' : 'Visit FAQ'}
                </Link>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#079164' }}>
                  {language === 'it' ? 'Feedback e Suggerimenti' : 'Feedback and Suggestions'}
                </h2>
                <p className="mb-4 leading-relaxed">
                  {language === 'it'
                    ? 'I tuoi feedback sono preziosi per migliorare PaciFinance. Condividi con noi le tue idee e suggerimenti.'
                    : 'Your feedback is valuable for improving PaciFinance. Share your ideas and suggestions with us.'
                  }
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="font-semibold text-lg" style={{ color: '#079164' }}>
                    💡 feedback@pacifinance.com
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#079164' }}>
                  {language === 'it' ? 'Informazioni Generali' : 'General Information'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#079164' }}>
                      {language === 'it' ? 'Orari di Supporto' : 'Support Hours'}
                    </h3>
                    <p className="text-sm">
                      {language === 'it'
                        ? 'Lunedì - Venerdì: 9:00 - 18:00 (CET)'
                        : 'Monday - Friday: 9:00 AM - 6:00 PM (CET)'
                      }
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#079164' }}>
                      {language === 'it' ? 'Tempo di Risposta' : 'Response Time'}
                    </h3>
                    <p className="text-sm">
                      {language === 'it'
                        ? 'Entro 48 ore lavorative'
                        : 'Within 48 business hours'
                      }
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#079164' }}>
                  {language === 'it' ? 'Prima di Contattarci' : 'Before Contacting Us'}
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    {language === 'it'
                      ? 'Controlla la sezione FAQ per risposte immediate'
                      : 'Check the FAQ section for immediate answers'
                    }
                  </li>
                  <li>
                    {language === 'it'
                      ? 'Assicurati di utilizzare l\'ultima versione dell\'applicazione'
                      : 'Make sure you are using the latest version of the application'
                    }
                  </li>
                  <li>
                    {language === 'it'
                      ? 'Fornisci dettagli specifici sul problema riscontrato'
                      : 'Provide specific details about the issue you encountered'
                    }
                  </li>
                  <li>
                    {language === 'it'
                      ? 'Includi screenshot se pertinenti al problema'
                      : 'Include screenshots if relevant to the issue'
                    }
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </PolicyContainer>

        <LandingFooter theme={theme}/>
      </div>
    </>
  );
}