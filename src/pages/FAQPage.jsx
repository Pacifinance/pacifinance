
import React, { useContext, useState } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { Header } from '../sections/HeaderFooter';
import LandingFooter from '../components/LandingFooter';
import languages from '../data/languages.json';

export default function FAQPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language, toggleLanguage } = useContext(LanguageContext);
  const { mode } = theme;
  const [openQuestion, setOpenQuestion] = useState(null);

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  return (
    <>
      <title>FAQ - PaciFinance</title>
      <meta name="description" content="Frequently Asked Questions about PaciFinance - Learn about privacy, security, features, and how to use our personal finance platform." />
      
      <div className="w-full flex overflow-auto min-h-screen items-center flex-col">
        <Header theme={theme} mode={mode} toggleMode={toggleMode} toggleLanguage={toggleLanguage}/>
        
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12" style={{ color: theme.textColor }}>
          <h1 className="text-4xl font-bold mb-8 text-center" style={{ color: theme.secondaryColor }}>
            {languages[language].faq.title}
          </h1>
          
          <div className="space-y-4">
            {languages[language].faq.questions.map((faq, index) => (
              <div 
                key={index}
                className="border rounded-lg overflow-hidden"
                style={{ borderColor: theme.borderColor }}
              >
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: theme.primaryColor }}
                  onClick={() => toggleQuestion(index)}
                >
                  <span className="font-semibold">{faq.question}</span>
                  <span className="text-2xl">{openQuestion === index ? '−' : '+'}</span>
                </button>
                {openQuestion === index && (
                  <div className="px-6 py-4" style={{ backgroundColor: theme.backgroundColor }}>
                    <p className="leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center p-6 rounded-lg" style={{ backgroundColor: theme.primaryColor }}>
            <h3 className="text-xl font-semibold mb-2" style={{ color: theme.secondaryColor }}>
              {languages[language].faq.stillHaveQuestions}
            </h3>
            <p className="opacity-80">
              {languages[language].faq.contactInfo}
            </p>
          </div>
        </main>

        <LandingFooter theme={theme}/>
      </div>
    </>
  );
}
