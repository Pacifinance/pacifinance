import React, { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import type { PacifinanceTheme } from '../types/theme';

interface LandingFeatureListProps {
  theme: PacifinanceTheme;
}

// Concrete, in-app capabilities - deliberately distinct from the "why choose
// Pacifinance" pillars (privacy/anonymity/open source) covered elsewhere on
// the page. Icon order here must match translations.landing.new.features.items.
const ICONS = [
  DashboardCustomizeIcon,
  ShowChartIcon,
  CurrencyExchangeIcon,
  UploadFileIcon,
  AutorenewIcon,
  TrackChangesIcon,
  QueryStatsIcon,
  EmojiEventsIcon,
];

export default function LandingFeatureList({ theme }: LandingFeatureListProps) {
  const { translations } = useContext(LanguageContext);
  const navigate = useLocalizedNavigate();
  const f = translations.landing.new.features;
  const isDark = theme.mode === 'dark';

  return (
    <section
      id="features"
      className="py-14 md:py-20 px-4 border-t"
      style={{
        backgroundColor: theme.backgroundColor,
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <span
            className="inline-block text-xs md:text-sm font-semibold px-3 py-1 rounded-full mb-3 md:mb-4"
            style={{ backgroundColor: `${theme.secondaryColor}20`, color: theme.secondaryColor }}
          >
            {f.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 md:mb-6">{f.title}</h2>
          <p className="text-base md:text-xl opacity-80 max-w-2xl mx-auto">{f.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {f.items.map((item, i) => {
            const Icon = ICONS[i];
            return (
              <div
                key={item.title}
                className="p-5 rounded-2xl border hover:-translate-y-1 transition-transform duration-300"
                style={{
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : `${theme.secondaryColor}25`,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.7)',
                }}
              >
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-xl mb-3"
                  style={{ backgroundColor: `${theme.secondaryColor}20` }}
                >
                  <Icon style={{ color: theme.secondaryColor }} sx={{ fontSize: 20 }} />
                </div>
                <h3 className="text-sm md:text-base font-bold mb-1">{item.title}</h3>
                <p className="text-xs md:text-sm opacity-70">{item.description}</p>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => navigate('/roadmap')}
          className="w-full mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-center px-5 py-4 rounded-2xl border border-dashed text-sm md:text-base transition-colors duration-200"
          style={{
            borderColor: `${theme.secondaryColor}50`,
            color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
          }}
          data-umami-event="landing-features-roadmap-click"
        >
          <span>{f.future.text}</span>
          <span className="font-semibold" style={{ color: theme.secondaryColor }}>
            {f.future.cta} →
          </span>
        </button>
      </div>
    </section>
  );
}
