import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { Header } from '../sections/HeaderFooter';
import LandingFooter from '../components/LandingFooter';
import { PolicyContainer, PolicyHeader } from '../styles/PolicyPages';

export default function DisclaimerPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language, toggleLanguage } = useContext(LanguageContext);
  const { mode } = theme;

  return (
    <>
      <title>Disclaimer - PaciFinance</title>
      <meta name="description" content="Disclaimer for PaciFinance - Important information about using our personal finance platform." />

      <div className="w-full flex overflow-auto min-h-screen items-center flex-col">
        <Header theme={theme} mode={mode} toggleMode={toggleMode} toggleLanguage={toggleLanguage}/>

        <PolicyContainer theme={theme}>
          <div className="max-w-4xl mx-auto">
            <PolicyHeader theme={theme}>
              <h1 style={{ color: '#079164' }}>
                {language === 'it' ? 'Disclaimer' : 'Disclaimer'}
              </h1>
              <div className="last-updated">Last updated: {new Date().toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}</div>
            </PolicyHeader>

            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#079164' }}>
                  {language === 'it' ? 'Informazioni Generali' : 'General Information'}
                </h2>
                <p className="mb-4 leading-relaxed">
                  {language === 'it'
                    ? 'PaciFinance è uno strumento di gestione finanziaria personale fornito gratuitamente. Non costituisce consulenza finanziaria professionale.'
                    : 'PaciFinance is a personal financial management tool provided free of charge. It does not constitute professional financial advice.'
                  }
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#079164' }}>
                  {language === 'it' ? 'Limitazioni di Responsabilità' : 'Limitations of Liability'}
                </h2>
                <p className="mb-4 leading-relaxed">
                  {language === 'it'
                    ? 'L\'utilizzo di PaciFinance è a tuo rischio. Non siamo responsabili per eventuali perdite finanziarie derivanti dall\'uso della piattaforma.'
                    : 'Use of PaciFinance is at your own risk. We are not responsible for any financial losses resulting from the use of the platform.'
                  }
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#079164' }}>
                  {language === 'it' ? 'Accuratezza dei Dati' : 'Data Accuracy'}
                </h2>
                <p className="mb-4 leading-relaxed">
                  {language === 'it'
                    ? 'Sebbene ci impegniamo a fornire strumenti accurati, non garantiamo l\'accuratezza completa di tutti i calcoli e le analisi.'
                    : 'While we strive to provide accurate tools, we do not guarantee the complete accuracy of all calculations and analyses.'
                  }
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#079164' }}>
                  {language === 'it' ? 'Consulenza Professionale' : 'Professional Advice'}
                </h2>
                <p className="leading-relaxed">
                  {language === 'it'
                    ? 'Per decisioni finanziarie importanti, ti consigliamo sempre di consultare un consulente finanziario professionale qualificato.'
                    : 'For important financial decisions, we always recommend consulting a qualified professional financial advisor.'
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