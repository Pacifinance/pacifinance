import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { Header } from '../sections/HeaderFooter';
import LandingFooter from '../components/LandingFooter';
import { PolicyContainer, PolicyHeader } from '../styles/PolicyPages';

export default function TermsOfServicePage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language, toggleLanguage } = useContext(LanguageContext);
  const { mode } = theme;

  return (
    <>
      <title>Terms of Service - PaciFinance</title>
      <meta name="description" content="Terms of Service for PaciFinance - Understanding your rights and responsibilities when using our privacy-focused personal finance platform." />

      <div className="w-full flex overflow-auto min-h-screen items-center flex-col">
        <Header theme={theme} mode={mode} toggleMode={toggleMode} toggleLanguage={toggleLanguage}/>

        <PolicyContainer theme={theme}>
          <div className="max-w-4xl mx-auto">
            <PolicyHeader theme={theme}>
              <h1 style={{ color: '#079164' }}>
                {language === 'it' ? 'Termini di Servizio' : 'Terms of Service'}
              </h1>
              <div className="last-updated">Last updated: {new Date().toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}</div>
            </PolicyHeader>

          <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#079164' }}>
                  {language === 'it' ? '1. Accettazione dei Termini' : '1. Acceptance of Terms'}
                </h2>
                <p className="mb-4 leading-relaxed">
                  {language === 'it' 
                    ? 'Utilizzando PaciFinance, accetti questi termini di servizio. Se non accetti questi termini, non utilizzare la piattaforma.'
                    : 'By using PaciFinance, you accept these terms of service. If you do not accept these terms, do not use the platform.'
                  }
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#079164' }}>
                  {language === 'it' ? '2. Uso del Servizio' : '2. Use of Service'}
                </h2>
                <p className="mb-4 leading-relaxed">
                  {language === 'it'
                    ? 'PaciFinance è fornito gratuitamente per uso personale. Non è consentito utilizzare la piattaforma per scopi commerciali non autorizzati.'
                    : 'PaciFinance is provided free of charge for personal use. You may not use the platform for unauthorized commercial purposes.'
                  }
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#079164' }}>
                  {language === 'it' ? '3. Privacy e Dati' : '3. Privacy and Data'}
                </h2>
                <p className="mb-4 leading-relaxed">
                  {language === 'it'
                    ? 'I tuoi dati sono sempre anonimi e protetti. Consulta la nostra Privacy Policy per maggiori dettagli.'
                    : 'Your data is always anonymous and protected. See our Privacy Policy for more details.'
                  }
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#079164' }}>
                  {language === 'it' ? '4. Limitazione di Responsabilità' : '4. Limitation of Liability'}
                </h2>
                <p className="leading-relaxed">
                  {language === 'it'
                    ? 'PaciFinance è fornito "così com\'è". Non garantiamo che il servizio sia sempre disponibile o privo di errori.'
                    : 'PaciFinance is provided "as is". We do not guarantee that the service will always be available or error-free.'
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