import React, { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import type { PacifinanceTheme } from '../types/theme';

interface LandingCTAProps {
  theme: PacifinanceTheme;
}

export default function LandingCTA({ theme }: LandingCTAProps) {
  const { translations } = useContext(LanguageContext);
  const navigate = useLocalizedNavigate();
  const t = translations.landing.new;
  const cta = t.cta;
  const trust = t.trust;

  const handleGetStarted = () => navigate('/auth');

  return (
    <section className="py-14 md:py-20 px-4" style={{ backgroundColor: theme.backgroundColor }}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 md:mb-6">
          {cta.title} <span style={{ color: theme.secondaryColor }}>{cta.subtitle}</span>?
        </h2>
        <p className="text-base md:text-xl opacity-80 mb-6 md:mb-8 max-w-2xl mx-auto">{cta.description}</p>

        <div className="space-y-3 md:space-y-4">
          <button
            onClick={handleGetStarted}
            className="px-8 md:px-12 py-3 md:py-4 rounded-xl text-white font-semibold text-lg md:text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            style={{ backgroundColor: theme.secondaryColor }}
            data-umami-event="cta-get-started"
          >
            {cta.button}
          </button>
          <p className="text-xs md:text-sm opacity-60">{cta.disclaimer}</p>
        </div>

        {/* Trust signals: real, verifiable claims only */}
        <div
          className="mt-10 md:mt-14 grid grid-cols-3 gap-3 md:gap-6 rounded-2xl px-4 py-5 md:px-8 md:py-6 mx-auto max-w-2xl"
          style={{
            backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.045)' : theme.primaryColor,
            border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.09)' : theme.borderColor + '30'}`,
          }}
        >
          <StatBlock theme={theme} value="AGPLv3" label={trust.license} />
          <StatBlock theme={theme} value="0%" label={trust.dataSold} />
          <StatBlock theme={theme} value="100%" label={trust.freeForever} />
        </div>
      </div>
    </section>
  );
}

function StatBlock({ theme, value, label }: { theme: PacifinanceTheme; value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-lg md:text-2xl font-bold" style={{ color: theme.secondaryColor }}>
        {value}
      </div>
      <div className="text-[11px] md:text-xs opacity-70">{label}</div>
    </div>
  );
}
