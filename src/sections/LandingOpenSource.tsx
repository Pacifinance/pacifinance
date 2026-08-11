import React, { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { GITHUB_REPO_URL } from '../data/externalLinks';
import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import GroupsIcon from '@mui/icons-material/Groups';
import type { PacifinanceTheme } from '../types/theme';

interface LandingOpenSourceProps {
  theme: PacifinanceTheme;
}

export default function LandingOpenSource({ theme }: LandingOpenSourceProps) {
  const { translations } = useContext(LanguageContext);
  const t = translations.landing.new;
  const os = t.openSource;

  const cardStyle = {
    borderColor: theme.secondaryColor,
    backgroundColor: theme.mode === 'dark' ? `${theme.secondaryColor}10` : 'rgba(255,255,255,0.5)',
  };

  return (
    <section id="open-source" className="py-14 md:py-20 px-4" style={{ backgroundColor: theme.backgroundColor }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <span
            className="inline-block text-xs md:text-sm font-semibold px-3 py-1 rounded-full mb-3 md:mb-4"
            style={{ backgroundColor: `${theme.secondaryColor}20`, color: theme.secondaryColor }}
          >
            {os.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">{os.title}</h2>
          <p className="text-base md:text-lg opacity-80 max-w-2xl mx-auto">{os.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
          <OpenSourcePillar theme={theme} cardStyle={cardStyle} data={os.pillars.code}>
            <CodeIcon className="text-white" sx={{ fontSize: 24 }} />
          </OpenSourcePillar>
          <OpenSourcePillar theme={theme} cardStyle={cardStyle} data={os.pillars.selfHost}>
            <StorageIcon className="text-white" sx={{ fontSize: 24 }} />
          </OpenSourcePillar>
          <OpenSourcePillar theme={theme} cardStyle={cardStyle} data={os.pillars.communityPrices}>
            <GroupsIcon className="text-white" sx={{ fontSize: 24 }} />
          </OpenSourcePillar>
        </div>

        <div className="flex flex-col items-center gap-3 mb-10 md:mb-14">
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 md:px-8 py-3 md:py-4 rounded-xl text-white font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            style={{ backgroundColor: theme.secondaryColor }}
            data-umami-event="landing-view-repo"
          >
            {os.viewOnGithub}
          </a>
        </div>

        {/* Support/donation button already lives in the footer right below —
            keep just the context here, not a second copy of the same button. */}
        <div className="text-center pt-8 border-t" style={{ borderColor: theme.borderColor }}>
          <h3 className="text-lg md:text-xl font-bold mb-2">{t.donation.title}</h3>
          <p className="opacity-80 mb-2 text-sm md:text-base">{t.donation.description}</p>
          <p className="text-xs md:text-sm opacity-60">{os.sponsorsComingSoon}</p>
        </div>
      </div>
    </section>
  );
}

function OpenSourcePillar({
  theme,
  cardStyle,
  data,
  children,
}: {
  theme: PacifinanceTheme;
  cardStyle: React.CSSProperties;
  data: { title: string; description: string };
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 md:p-6 rounded-2xl border border-opacity-20 text-center" style={cardStyle}>
      <div
        className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full mb-3 md:mb-4 mx-auto"
        style={{ backgroundColor: theme.secondaryColor }}
      >
        {children}
      </div>
      <h3 className="text-base md:text-lg font-bold mb-1.5 md:mb-2">{data.title}</h3>
      <p className="opacity-80 text-sm">{data.description}</p>
    </div>
  );
}
