import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { Header } from '../sections/LandingHeader';
import LandingFooter from '../sections/LandingFooter';
import { PolicyContainer, PolicyHeader } from '../styles/PolicyPages';
import SEOHead from '../components/SEOHead';

export default function DisclaimerPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language, toggleLanguage } = useContext(LanguageContext);
  const { mode } = theme;

  return (
    <>
      <SEOHead 
        title={language === 'it' ? 'Disclaimer | Pacifinance' : 'Disclaimer | Pacifinance'}
        description={language === 'it' ? 'Disclaimer per Pacifinance - Informazioni importanti sull\'utilizzo della nostra piattaforma di gestione finanziaria.' : 'Disclaimer for Pacifinance - Important information about using our personal finance platform.'}
        keywords={language === 'it' ? 'disclaimer, limitazioni, responsabilità, Pacifinance' : 'disclaimer, limitations, liability, Pacifinance'}
        canonical="/disclaimer"
      />

      <div className="w-full flex overflow-auto min-h-screen items-center flex-col" style={{ backgroundColor: theme.backgroundColor }}>
        <Header theme={theme} mode={mode} toggleMode={toggleMode} toggleLanguage={toggleLanguage}/>

        <PolicyContainer theme={theme}>
          <div className="max-w-4xl mx-auto">
            <PolicyHeader theme={theme}>
              <h1 style={{ color: '#079164' }}>
                {language === 'it' ? 'Disclaimer' : 'Disclaimer'}
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
                <h2 className="text-3xl font-bold mb-6" style={{ color: '#079164' }}>
                  {language === 'it' ? 'Informazioni Generali' : 'General Information'}
                </h2>
                <p className="mb-4 leading-relaxed text-lg">
                  {language === 'it'
                    ? 'Pacifinance è uno strumento di gestione finanziaria personale fornito gratuitamente. Non costituisce consulenza finanziaria professionale.'
                    : 'Pacifinance is a personal financial management tool provided free of charge. It does not constitute professional financial advice.'
                  }
                </p>
              </section>

              <section 
                className="p-6 rounded-xl"
                style={{
                  background: theme.mode === 'dark' 
                    ? 'rgba(7, 145, 100, 0.1)'
                    : 'rgba(7, 145, 100, 0.05)',
                  border: `2px solid ${theme.mode === 'dark' ? 'rgba(7, 145, 100, 0.2)' : 'rgba(7, 145, 100, 0.15)'}`
                }}
              >
                <h2 className="text-3xl font-bold mb-6" style={{ color: '#079164' }}>
                  {language === 'it' ? 'Limitazioni di Responsabilità' : 'Limitations of Liability'}
                </h2>
                <p className="mb-4 leading-relaxed text-lg">
                  {language === 'it'
                    ? 'L\'utilizzo di Pacifinance è a tuo rischio. Non siamo responsabili per eventuali perdite finanziarie derivanti dall\'uso della piattaforma.'
                    : 'Use of Pacifinance is at your own risk. We are not responsible for any financial losses resulting from the use of the platform.'
                  }
                </p>
              </section>

              <section 
                className="p-6 rounded-xl"
                style={{
                  background: theme.mode === 'dark' 
                    ? 'rgba(7, 145, 100, 0.1)'
                    : 'rgba(7, 145, 100, 0.05)',
                  border: `2px solid ${theme.mode === 'dark' ? 'rgba(7, 145, 100, 0.2)' : 'rgba(7, 145, 100, 0.15)'}`
                }}
              >
                <h2 className="text-3xl font-bold mb-6" style={{ color: '#079164' }}>
                  {language === 'it' ? 'Accuratezza dei Dati' : 'Data Accuracy'}
                </h2>
                <p className="mb-4 leading-relaxed text-lg">
                  {language === 'it'
                    ? 'Sebbene ci impegniamo a fornire strumenti accurati, non garantiamo l\'accuratezza completa di tutti i calcoli e le analisi.'
                    : 'While we strive to provide accurate tools, we do not guarantee the complete accuracy of all calculations and analyses.'
                  }
                </p>
              </section>

              <section 
                className="p-6 rounded-xl"
                style={{
                  background: theme.mode === 'dark' 
                    ? 'rgba(7, 145, 100, 0.1)'
                    : 'rgba(7, 145, 100, 0.05)',
                  border: `2px solid ${theme.mode === 'dark' ? 'rgba(7, 145, 100, 0.2)' : 'rgba(7, 145, 100, 0.15)'}`
                }}
              >
                <h2 className="text-3xl font-bold mb-6" style={{ color: '#079164' }}>
                  {language === 'it' ? 'Consulenza Professionale' : 'Professional Advice'}
                </h2>
                <p className="leading-relaxed text-lg">
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