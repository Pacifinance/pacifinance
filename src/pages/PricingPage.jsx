import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { Header } from '../sections/LandingHeader';
import SEOHead from '../components/SEOHead';
import { PageWrapper } from '../styles/MyStyled';
import LandingFooter from '../sections/LandingFooter';
import BuyMeACoffeeWidget from '../components/BuyMeACoffeeWidget';

export default function PricingPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language, translations, toggleLanguage } = useContext(LanguageContext);
  const { mode } = theme;

  return (
    <div className="w-full flex flex-col min-h-screen overflow-auto" style={{ background: theme.backgroundColor }}>
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

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-10 flex flex-col items-center" style={{ color: theme.textColor }}>
        <h1 className="text-4xl font-bold mb-8 text-center" style={{ color: theme.secondaryColor }}>
          {translations.pricing.title}
        </h1>

        <p className="text-xl text-center mb-10 opacity-80" style={{ color: theme.textColor, maxWidth: 600, margin: '0 auto' }}>
          {translations.pricing.subtitle}
        </p>

        {/* Plans Section - always centered, responsive */}
        <div className="w-full flex flex-col md:flex-row md:justify-center gap-8 mb-12 items-center">
          {/* Free Plan (Main) */}
          <div className="flex-1 flex justify-center w-full max-w-md">
            <div
              className="relative border-2 rounded-lg p-8 text-center min-h-[480px] flex flex-col justify-between w-full max-w-md"
              style={{
                borderColor: theme.secondaryColor,
                backgroundColor: theme.primaryColor,
                color: theme.textColor,
                boxShadow: '0 2px 16px 0 rgba(0,0,0,0.07)',
                position: 'relative',
              }}
            >
              <div className="absolute -top-4 left-1/2" style={{ transform: 'translateX(-50%)' }}>
                <span
                  className="px-4 py-2 rounded-full text-sm font-bold"
                  style={{
                    backgroundColor: theme.secondaryColor,
                    color: "white",
                  }}
                >
                  {translations.pricing.popular}
                </span>
              </div>

              <h3 className="text-2xl font-bold mb-4 mt-6" style={{ color: theme.secondaryColor }}>
                {translations.pricing.freePlan.title}
              </h3>

              <div className="mb-6">
                <span className="text-6xl font-bold" style={{ color: theme.secondaryColor }}>
                  {translations.pricing.freePlan.price}
                </span>
                <span className="text-lg opacity-60 ml-2" style={{ color: theme.textColor }}>
                  {translations.pricing.freePlan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {translations.pricing.freePlan.features.map(
                  (feature, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-center"
                      style={{ color: theme.textColor }}
                    >
                      <span className="text-green-500 mr-2">✓</span>
                      <span>{feature}</span>
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
                {translations.pricing.freePlan.button}
              </button>
            </div>
          </div>

          {/* "Premium" Plan (Joke) - only on desktop */}
          <div className="hidden md:flex flex-1 justify-center w-full max-w-md">
            <div
              className="border rounded-lg p-8 text-center opacity-50 min-h-[480px] flex flex-col justify-between w-full max-w-md"
              style={{
                borderColor: theme.borderColor,
                backgroundColor: theme.backgroundColor,
              }}
            >
              <h3 className="text-2xl font-bold mb-4" style={{ color: theme.textColor }}>
                {translations.pricing.premiumPlan.title}
              </h3>

              <div className="mb-6">
                <span className="text-6xl font-bold line-through" style={{ color: theme.textColor }}>
                  {translations.pricing.premiumPlan.price}
                </span>
                <span className="text-lg opacity-60 ml-2" style={{ color: theme.textColor }}>
                  {translations.pricing.premiumPlan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {translations.pricing.premiumPlan.features.map(
                  (feature, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-center opacity-60"
                    >
                      <span className="text-red-500 mr-2">✗</span>
                      <span style={{ color: theme.textColor }}>{feature}</span>
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
                {translations.pricing.premiumPlan.button}
              </button>
            </div>
          </div>

          {/* "Enterprise" Plan (Another Joke) - only on desktop */}
          <div className="hidden md:flex flex-1 justify-center w-full max-w-md">
            <div
              className="border rounded-lg p-8 text-center opacity-50 min-h-[480px] flex flex-col justify-between w-full max-w-md"
              style={{
                borderColor: theme.borderColor,
                backgroundColor: theme.backgroundColor,
              }}
            >
              <h3 className="text-2xl font-bold mb-4" style={{ color: theme.textColor }}>
                {translations.pricing.enterprisePlan.title}
              </h3>

              <div className="mb-6">
                <span className="text-6xl font-bold line-through" style={{ color: theme.textColor }}>
                  {translations.pricing.enterprisePlan.price}
                </span>
                <span className="text-lg opacity-60 ml-2" style={{ color: theme.textColor }}>
                  {translations.pricing.enterprisePlan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {translations.pricing.enterprisePlan.features.map(
                  (feature, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-center opacity-60"
                    >
                      <span className="text-red-500 mr-2">✗</span>
                      <span style={{ color: theme.textColor }}>{feature}</span>
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
                {translations.pricing.enterprisePlan.button}
              </button>
            </div>
          </div>
        </div>

        {/* Donation Section */}
        <div className="text-center p-8 rounded-lg w-full max-w-2xl mx-auto" style={{ backgroundColor: theme.primaryColor, marginBottom: 32 }}>
          <h2 className="text-3xl font-bold mb-4" style={{ color: theme.secondaryColor }}>
            {translations.pricing.donation.title}
          </h2>
          <p className="text-lg mb-6 opacity-80" style={{ color: theme.textColor }}>
            {translations.pricing.donation.description}
          </p>
          <div className="flex flex-col items-center space-y-4 mb-5">
            <BuyMeACoffeeWidget />
            <p className="text-sm opacity-70 text-center max-w-md" style={{ color: theme.textColor }}>
              {language === "it"
                ? "Il tuo supporto ci aiuta a mantenere PaciFinance gratuito per tutti. Ogni donazione, anche piccola, fa la differenza!"
                : "Your support helps us keep PaciFinance free for everyone. Every donation, no matter how small, makes a difference!"}
            </p>
          </div>
          <BuyMeACoffeeWidget showLink={true} />
          <p className="text-xs mt-4 opacity-60" style={{ color: theme.textColor }}>
            {translations.pricing.donation.disclaimer}
          </p>
        </div>
      </main>
      <LandingFooter theme={theme} />
    </div>
  );
}