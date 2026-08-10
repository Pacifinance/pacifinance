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
    <section className="py-8 md:py-10 px-4" style={{ backgroundColor: theme.backgroundColor }}>
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-3 md:gap-4">
        {items.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{
              backgroundColor: theme.mode === 'dark' ? `${theme.secondaryColor}15` : `${theme.secondaryColor}10`,
              border: `1px solid ${theme.secondaryColor}30`,
            }}
          >
            <Icon style={{ color: theme.secondaryColor }} sx={{ fontSize: 18 }} />
            {label}
          </div>
        ))}
      </div>
    </section>
  );
}
