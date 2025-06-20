import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { Header, Footer } from '../sections/HeaderFooter';
import SEOHead from '../components/SEOHead';
import { PageWrapper } from '../styles/MyStyled';
import languages from '../data/languages.json';

export default function PricingPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language, toggleLanguage } = useContext(LanguageContext);
  const { mode } = theme;

  return (
    <PageWrapper theme={theme}>
      <SEOHead 
        title={language === 'it' ? 'Prezzi e Piani | PaciFinance' : 'Pricing and Plans | PaciFinance'}
        description={language === 'it' ? 'Scopri i piani e i prezzi di PaciFinance per la gestione delle tue finanze personali. Scegli il piano più adatto alle tue esigenze.' : 'Discover PaciFinance plans and pricing for managing your personal finances. Choose the plan that best suits your needs.'}
        keywords={language === 'it' ? 'prezzi, piani, abbonamento, PaciFinance, finanze personali' : 'pricing, plans, subscription, PaciFinance, personal finance'}
        canonical="/pricing"
      />
      <Header
        theme={theme}
        mode={mode}
        toggleMode={toggleMode}
        toggleLanguage={toggleLanguage}
      />

      <main
        className="flex-1 w-full max-w-6xl mx-auto px-4 py-12"
        style={{ color: theme.textColor }}
      >
        <h1
          className="text-4xl font-bold mb-8 text-center"
          style={{ color: theme.secondaryColor }}
        >
          {languages[language].pricing.title}
        </h1>

        <p
          className="text-xl text-center mb-12 opacity-80"
          style={{ color: mode === "dark" ? "#000000" : theme.textColor }}
        >
          {languages[language].pricing.subtitle}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Free Plan (Only Plan) */}
          <div className="relative">
            <div
              className="border-2 rounded-lg p-8 text-center h-full"
              style={{
                borderColor: theme.secondaryColor,
                backgroundColor: theme.primaryColor,
              }}
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span
                  className="px-4 py-2 rounded-full text-sm font-bold"
                  style={{
                    backgroundColor: theme.secondaryColor,
                    color: "white",
                  }}
                >
                  {languages[language].pricing.popular}
                </span>
              </div>

              <h3
                className="text-2xl font-bold mb-4"
                style={{ color: theme.secondaryColor }}
              >
                {languages[language].pricing.freePlan.title}
              </h3>

              <div className="mb-6">
                <span
                  className="text-6xl font-bold"
                  style={{ color: theme.secondaryColor }}
                >
                  {languages[language].pricing.freePlan.price}
                </span>
                <span className="text-lg opacity-60">
                  {languages[language].pricing.freePlan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {languages[language].pricing.freePlan.features.map(
                  (feature, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-center"
                    >
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ),
                )}
              </ul>

              <button
                className="w-full py-3 rounded-lg font-semibold transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: theme.secondaryColor,
                  color: "white",
                }}
              >
                {languages[language].pricing.freePlan.button}
              </button>
            </div>
          </div>

          {/* "Premium" Plan (Joke) */}
          <div>
            <div
              className="border rounded-lg p-8 text-center h-full opacity-50"
              style={{
                borderColor: theme.borderColor,
                backgroundColor: theme.backgroundColor,
              }}
            >
              <h3
                className="text-2xl font-bold mb-4"
                style={{ color: theme.textColor }}
              >
                {languages[language].pricing.premiumPlan.title}
              </h3>

              <div className="mb-6">
                <span
                  className="text-6xl font-bold line-through"
                  style={{ color: theme.textColor }}
                >
                  {languages[language].pricing.premiumPlan.price}
                </span>
                <span className="text-lg opacity-60">
                  {languages[language].pricing.premiumPlan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {languages[language].pricing.premiumPlan.features.map(
                  (feature, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-center opacity-60"
                    >
                      <span className="text-red-500 mr-2">✗</span>
                      {feature}
                    </li>
                  ),
                )}
              </ul>

              <button
                className="w-full py-3 rounded-lg font-semibold cursor-not-allowed"
                style={{
                  backgroundColor: theme.borderColor,
                  color: theme.textColor,
                }}
                disabled
              >
                {languages[language].pricing.premiumPlan.button}
              </button>
            </div>
          </div>

          {/* "Enterprise" Plan (Another Joke) */}
          <div>
            <div
              className="border rounded-lg p-8 text-center h-full opacity-50"
              style={{
                borderColor: theme.borderColor,
                backgroundColor: theme.backgroundColor,
              }}
            >
              <h3
                className="text-2xl font-bold mb-4"
                style={{ color: theme.textColor }}
              >
                {languages[language].pricing.enterprisePlan.title}
              </h3>

              <div className="mb-6">
                <span
                  className="text-6xl font-bold line-through"
                  style={{ color: theme.textColor }}
                >
                  {languages[language].pricing.enterprisePlan.price}
                </span>
                <span className="text-lg opacity-60">
                  {languages[language].pricing.enterprisePlan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {languages[language].pricing.enterprisePlan.features.map(
                  (feature, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-center opacity-60"
                    >
                      <span className="text-red-500 mr-2">✗</span>
                      {feature}
                    </li>
                  ),
                )}
              </ul>

              <button
                className="w-full py-3 rounded-lg font-semibold cursor-not-allowed"
                style={{
                  backgroundColor: theme.borderColor,
                  color: theme.textColor,
                }}
                disabled
              >
                {languages[language].pricing.enterprisePlan.button}
              </button>
            </div>
          </div>
        </div>

        {/* Donation Section */}
        <div
          className="text-center p-8 rounded-lg"
          style={{ backgroundColor: theme.primaryColor }}
        >
          <h2
            className="text-3xl font-bold mb-4"
            style={{ color: theme.secondaryColor }}
          >
            {languages[language].pricing.donation.title}
          </h2>
          <p className="text-lg mb-6 opacity-80">
            {languages[language].pricing.donation.description}
          </p>
          <div className="flex flex-col items-center space-y-4 mb-5">
            <BuyMeACoffeeWidget />
            <p className="text-sm opacity-70 text-center max-w-md">
              {language === "it"
                ? "Il tuo supporto ci aiuta a mantenere PaciFinance gratuito per tutti. Ogni donazione, anche piccola, fa la differenza!"
                : "Your support helps us keep PaciFinance free for everyone. Every donation, no matter how small, makes a difference!"}
            </p>
          </div>
          <BuyMeACoffeeWidget showLink={true} />
          <p className="text-xs mt-4 opacity-60">
            {languages[language].pricing.donation.disclaimer}
          </p>
        </div>
      </main>

      <Footer theme={theme} />
    </PageWrapper>
  );
}