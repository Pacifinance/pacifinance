import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { Header } from '../sections/LandingHeader';
import SEOHead from '../components/SEOHead';
import LandingFooter from '../sections/LandingFooter';
import BuyMeACoffeeWidget from '../components/BuyMeACoffeeWidget';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import type { PacifinanceTheme } from '../types/theme';

interface PlanData {
  title: string;
  price: string;
  period: string;
  features: string[];
  button: string;
}

export default function PricingPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language, translations, toggleLanguage } = useContext(LanguageContext);
  const navigate = useLocalizedNavigate();
  const { mode } = theme;
  const p = translations.pricing;

  return (
    <div className="w-full flex flex-col min-h-screen overflow-auto" style={{ backgroundColor: theme.backgroundColor }}>
      <SEOHead
        title={language === 'it' ? 'Prezzi e Piani | Pacifinance' : 'Pricing and Plans | Pacifinance'}
        description={language === 'it' ? 'Scopri i piani e i prezzi di Pacifinance per la gestione delle tue finanze personali. Scegli il piano più adatto alle tue esigenze.' : 'Discover Pacifinance plans and pricing for managing your personal finances. Choose the plan that best suits your needs.'}
        keywords={language === 'it' ? 'prezzi, piani, abbonamento, Pacifinance, finanze personali, costo app finanze, piano gratuito, piano premium' : 'pricing, plans, subscription, Pacifinance, personal finance, finance app cost, free plan, premium plan'}
        canonical="/pricing"
        language={language}
      />
      <Header theme={theme} mode={mode} toggleMode={toggleMode} toggleLanguage={toggleLanguage} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-14 md:py-20" style={{ color: theme.textColor }}>
        <div className="text-center mb-16 md:mb-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">{p.title}</h1>
          <p className="text-lg md:text-xl opacity-80 max-w-lg mx-auto">{p.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-14 md:mb-20 items-stretch pt-4">
          <PlanCard
            theme={theme}
            data={p.freePlan}
            badge={p.popular}
            real
            onAction={() => navigate('/auth')}
          />
          <PlanCard theme={theme} data={p.premiumPlan} />
          <PlanCard theme={theme} data={p.enterprisePlan} onAction={() => document.getElementById('donate')?.scrollIntoView({ behavior: 'smooth' })} />
        </div>

        <div
          id="donate"
          className="text-center p-8 md:p-10 rounded-2xl w-full max-w-2xl mx-auto scroll-mt-24"
          style={{
            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.045)' : theme.primaryColor,
            border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.09)' : theme.borderColor + '30'}`,
          }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: theme.secondaryColor }}>
            {p.donation.title}
          </h2>
          <p className="text-base md:text-lg mb-6 opacity-80">{p.donation.description}</p>
          <div className="flex flex-col items-center gap-4">
            <BuyMeACoffeeWidget />
            <p className="text-sm opacity-70 max-w-md">
              {language === 'it'
                ? 'Il tuo supporto ci aiuta a mantenere Pacifinance gratuito per tutti. Ogni donazione, anche piccola, fa la differenza!'
                : 'Your support helps us keep Pacifinance free for everyone. Every donation, no matter how small, makes a difference!'}
            </p>
          </div>
          <p className="text-xs mt-5 opacity-60">{p.donation.disclaimer}</p>
        </div>
      </main>
      <LandingFooter theme={theme} />
    </div>
  );
}

function PlanCard({
  theme,
  data,
  badge,
  real = false,
  onAction,
}: {
  theme: PacifinanceTheme;
  data: PlanData;
  badge?: string;
  real?: boolean;
  onAction?: () => void;
}) {
  const isDark = theme.mode === 'dark';

  return (
    <div
      className="relative rounded-2xl p-7 md:p-8 flex flex-col text-center transition-transform duration-300"
      style={{
        border: real
          ? `1.5px solid ${theme.secondaryColor}`
          : `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'}`,
        backgroundColor: real
          ? (isDark ? `${theme.secondaryColor}12` : `${theme.secondaryColor}08`)
          : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)'),
        boxShadow: real ? `0 8px 30px ${theme.secondaryColor}20` : 'none',
      }}
    >
      {badge && (
        <span
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap"
          style={{ backgroundColor: theme.secondaryColor, color: 'white' }}
        >
          {badge}
        </span>
      )}

      <h3
        className="text-xl font-bold mb-3"
        style={{ color: real ? theme.secondaryColor : theme.textColor, opacity: real ? 1 : 0.6 }}
      >
        {data.title}
      </h3>

      <div className="mb-6">
        <span
          className={`text-5xl font-bold ${real ? '' : 'line-through opacity-40'}`}
          style={{ color: real ? theme.secondaryColor : theme.textColor }}
        >
          {data.price}
        </span>
        <span className="text-sm opacity-50 ml-1.5">{data.period}</span>
      </div>

      <ul className="space-y-2.5 mb-8 flex-1">
        {data.features.map((feature) => (
          <li key={feature} className="flex items-center justify-center gap-2 text-sm" style={{ opacity: real ? 0.85 : 0.55 }}>
            {real ? (
              <CheckIcon sx={{ fontSize: 16 }} style={{ color: theme.secondaryColor, flexShrink: 0 }} />
            ) : (
              <CloseIcon sx={{ fontSize: 16 }} style={{ opacity: 0.5, flexShrink: 0 }} />
            )}
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onAction}
        disabled={!real && !onAction}
        className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200"
        style={
          real
            ? { backgroundColor: theme.secondaryColor, color: 'white' }
            : onAction
              ? { backgroundColor: 'transparent', color: theme.secondaryColor, border: `1px solid ${theme.secondaryColor}50` }
              : { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', color: theme.textColor, opacity: 0.5, cursor: 'not-allowed' }
        }
      >
        {data.button}
      </button>
    </div>
  );
}
