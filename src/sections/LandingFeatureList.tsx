import React, { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import PaidIcon from '@mui/icons-material/Paid';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import type { PacifinanceTheme } from '../types/theme';

interface LandingFeatureListProps {
  theme: PacifinanceTheme;
}

export default function LandingFeatureList({ theme }: LandingFeatureListProps) {
  const { translations } = useContext(LanguageContext);
  const badges = translations.landing.new.featureBadges;

  const items = [
    { icon: PaidIcon, label: badges.free },
    { icon: CurrencyExchangeIcon, label: badges.currencies },
    { icon: ShowChartIcon, label: badges.marketPrices },
    { icon: UploadFileIcon, label: badges.import },
  ];

  return (
    <section
      id="features"
      className="py-10 md:py-14 px-4 border-t"
      style={{
        backgroundColor: theme.backgroundColor,
        borderColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      }}
    >
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {items.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium"
            style={{
              backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.045)' : `${theme.secondaryColor}08`,
              border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : `${theme.secondaryColor}25`}`,
            }}
          >
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
              style={{ backgroundColor: `${theme.secondaryColor}20` }}
            >
              <Icon style={{ color: theme.secondaryColor }} sx={{ fontSize: 17 }} />
            </div>
            {label}
          </div>
        ))}
      </div>
    </section>
  );
}
