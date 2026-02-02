import React, { useContext, useState } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { Header } from '../sections/LandingHeader';
import LandingFooter from '../sections/LandingFooter';
import SEOHead from '../components/SEOHead';

export default function FAQPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language, translations, toggleLanguage } = useContext(LanguageContext);
  const { mode } = theme;
  const [openQuestion, setOpenQuestion] = useState(null);

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  return (
    <>
      <SEOHead 
        title={language === 'it' ? 'FAQ - Domande Frequenti | PaciFinance' : 'FAQ - Frequently Asked Questions | PaciFinance'}
        description={language === 'it' ? 'Trova le risposte alle domande più frequenti su PaciFinance, la piattaforma per la gestione delle finanze personali.' : 'Find answers to the most frequently asked questions about PaciFinance, the personal finance management platform.'}
        keywords={language === 'it' ? 'FAQ, domande frequenti, aiuto, supporto, PaciFinance' : 'FAQ, frequently asked questions, help, support, PaciFinance'}
        canonical="/faq"
      />

      <div className="w-full flex overflow-auto min-h-screen items-center flex-col" style={{ backgroundColor: theme.backgroundColor }}>
        <Header theme={theme} mode={mode} toggleMode={toggleMode} toggleLanguage={toggleLanguage}/>

        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
          <div 
            className="p-8 rounded-2xl shadow-2xl"
            style={{ 
              background: theme.mode === 'dark' 
                ? `linear-gradient(135deg, ${theme.backgroundColor} 0%, ${theme.primaryColor} 100%)`
                : `linear-gradient(135deg, ${theme.backgroundColor} 0%, #f8f9fa 100%)`,
              color: theme.textColor
            }}
          >
            <h1 
              className="text-5xl font-bold mb-12 text-center"
              style={{ 
                color: '#079164',
                textShadow: theme.mode === 'dark' 
                  ? '0 2px 4px rgba(0, 0, 0, 0.3)'
                  : '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              {translations.faq.title}
            </h1>

            <div className="space-y-6">
              {translations.faq.questions.map((faq, index) => (
                <div 
                  key={index}
                  className="border-2 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl"
                  style={{ 
                    borderColor: theme.mode === 'dark' 
                      ? 'rgba(7, 145, 100, 0.3)'
                      : 'rgba(7, 145, 100, 0.2)'
                  }}
                >
                  <button
                    className="w-full px-8 py-6 text-left flex justify-between items-center transition-all duration-300 hover:bg-opacity-80"
                    style={{ 
                      backgroundColor: theme.mode === 'dark' 
                        ? 'rgba(7, 145, 100, 0.2)'
                        : 'rgba(7, 145, 100, 0.1)',
                      color: theme.textColor
                    }}
                    onClick={() => toggleQuestion(index)}
                  >
                    <span className="font-semibold text-lg">{faq.question}</span>
                    <span 
                      className="text-3xl font-bold transition-transform duration-300"
                      style={{ 
                        transform: openQuestion === index ? 'rotate(45deg)' : 'rotate(0deg)',
                        color: '#079164'
                      }}
                    >
                      {openQuestion === index ? '×' : '+'}
                    </span>
                  </button>
                  {openQuestion === index && (
                    <div 
                      className="px-8 py-6 border-t-2"
                      style={{ 
                        backgroundColor: theme.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(255, 255, 255, 0.8)',
                        borderColor: theme.mode === 'dark' 
                          ? 'rgba(7, 145, 100, 0.2)'
                          : 'rgba(7, 145, 100, 0.1)'
                      }}
                    >
                      <p className="leading-relaxed text-lg">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div 
              className="mt-16 text-center p-8 rounded-2xl shadow-lg"
              style={{ 
                background: theme.mode === 'dark' 
                  ? 'linear-gradient(135deg, rgba(7, 145, 100, 0.2) 0%, rgba(7, 145, 100, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(7, 145, 100, 0.1) 0%, rgba(7, 145, 100, 0.05) 100%)',
                border: `2px solid ${theme.mode === 'dark' ? 'rgba(7, 145, 100, 0.3)' : 'rgba(7, 145, 100, 0.2)'}`
              }}
            >
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#079164' }}>
                {translations.faq.stillHaveQuestions}
              </h3>
              <p className="text-lg" style={{ opacity: 0.8 }}>
                {translations.faq.contactInfo}
              </p>
            </div>
          </div>
        </main>

        <LandingFooter theme={theme}/>
      </div>
    </>
  );
}