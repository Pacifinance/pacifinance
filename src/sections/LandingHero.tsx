import React, { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import GitHubStatsBar from '../components/GitHubStatsBar';
import { GITHUB_REPO_URL } from '../data/externalLinks';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import LockIcon from '@mui/icons-material/Lock';
import CodeIcon from '@mui/icons-material/Code';
import SpaIcon from '@mui/icons-material/Spa';
import GroupsIcon from '@mui/icons-material/Groups';
import ShieldIcon from '@mui/icons-material/Shield';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import heroBackground from '../assets/landing/hero-background.webp';
import type { PacifinanceTheme } from '../types/theme';

interface LandingHeroProps {
  theme: PacifinanceTheme;
}

// The night hilltop/tree/moon artwork only suits the dark palette it was
// painted for — light mode keeps the original soft gradient instead of a
// mismatched daytime version of a night scene.
const BACKGROUND_ART = heroBackground;

export default function LandingHero({ theme }: LandingHeroProps) {
  const { translations } = useContext(LanguageContext);
  const navigate = useLocalizedNavigate();
  const t = translations.landing.new;
  const isDark = theme.mode === 'dark';

  const handleGetStarted = () => navigate('/auth');
  const handleLearnMore = () =>
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden px-4 sm:px-6 lg:pl-12 lg:pr-8 xl:pl-20 py-16 md:py-20"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      {/* The art is a painted night scene; in light mode it's lightened via
          filter (brighter, desaturated) instead of hidden, so the hero
          keeps its identity in both themes instead of going blank. */}
      <div
        className="hidden lg:block absolute inset-y-0 right-0 w-[58%] max-w-4xl"
        aria-hidden="true"
        style={{
          backgroundImage: `url(${BACKGROUND_ART})`,
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
          filter: isDark ? undefined : 'brightness(1.5) saturate(0.55) contrast(0.95)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 65%)',
          maskImage: 'linear-gradient(to right, transparent 0%, black 65%)',
        }}
      />
      {/* Mobile/tablet: same idea as the desktop panel above, but anchored
          top-right and masked with a corner radial fade instead of a side
          panel - a side mask would either hide under the full-width text
          column or, if narrow, leave barely any tree visible. */}
      <div
        className="lg:hidden absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage: `url(${BACKGROUND_ART})`,
          backgroundSize: 'cover',
          backgroundPosition: 'right top',
          filter: isDark ? undefined : 'brightness(1.5) saturate(0.55) contrast(0.95)',
          WebkitMaskImage: 'radial-gradient(circle at 100% 0%, black 0%, black 38%, transparent 72%)',
          maskImage: 'radial-gradient(circle at 100% 0%, black 0%, black 38%, transparent 72%)',
        }}
      />

      <div className="relative z-10 w-full max-w-7xl">
        <div className="lg:max-w-xl">
          <div
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-5 md:mb-6"
            style={{
              backgroundColor: `${theme.secondaryColor}18`,
              border: `1px solid ${theme.secondaryColor}45`,
              color: theme.secondaryColor,
            }}
          >
            <SpaIcon sx={{ fontSize: 15 }} />
            {t.hero.eyebrow}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 md:mb-5">
            <span style={{ color: theme.textColor }}>{t.hero.title}</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
              {t.hero.subtitle}
            </span>
          </h1>

          <p className="text-base sm:text-lg opacity-80 max-w-md mb-6 md:mb-8">
            {t.hero.description}
          </p>

          <div className="flex flex-wrap gap-4 md:gap-6 mb-7 md:mb-9">
            <FeatureItem theme={theme} data={t.benefits.anonymousComparison}>
              <CompareArrowsIcon style={{ color: theme.secondaryColor }} sx={{ fontSize: 19 }} />
            </FeatureItem>
            <FeatureItem theme={theme} data={t.benefits.privacyFirst}>
              <LockIcon style={{ color: theme.secondaryColor }} sx={{ fontSize: 19 }} />
            </FeatureItem>
            <FeatureItem theme={theme} data={t.benefits.openSource}>
              <CodeIcon style={{ color: theme.secondaryColor }} sx={{ fontSize: 19 }} />
            </FeatureItem>
          </div>

          <div className="flex flex-col items-start sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl text-white font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              style={{ backgroundColor: theme.secondaryColor }}
              data-umami-event="hero-get-started"
            >
              {t.hero.getStarted} →
            </button>
            <button
              onClick={handleLearnMore}
              className="px-2 py-2 font-semibold text-sm md:text-base hover:underline underline-offset-4 transition-all duration-200"
              style={{ color: theme.secondaryColor, background: 'transparent' }}
              data-umami-event="hero-learn-more"
            >
              {t.hero.learnMore} →
            </button>
          </div>

          {/* Social proof: real, verifiable GitHub activity (server-cached /api/github-stats) instead of a generic trust claim */}
          <GitHubStatsBar
            accentColor={theme.secondaryColor}
            repoUrl={GITHUB_REPO_URL}
            labels={{
              stars: t.openSource.stats.stars,
              forks: t.openSource.stats.forks,
              contributors: t.openSource.stats.contributors,
              viewOnGithub: t.openSource.viewOnGithub,
            }}
          />
        </div>

        <div
          className="mt-10 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6 rounded-2xl px-5 py-5 md:px-8 md:py-6 max-w-3xl"
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.045)' : theme.primaryColor,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : theme.borderColor + '30'}`,
          }}
        >
          <StatItem theme={theme} data={t.stats.anonymous}>
            <GroupsIcon sx={{ fontSize: 18 }} />
          </StatItem>
          <StatItem theme={theme} data={t.stats.control}>
            <ShieldIcon sx={{ fontSize: 18 }} />
          </StatItem>
          <StatItem theme={theme} data={t.stats.peace}>
            <NightsStayIcon sx={{ fontSize: 18 }} />
          </StatItem>
          <StatItem theme={theme} data={t.stats.awareness}>
            <TrendingUpIcon sx={{ fontSize: 18 }} />
          </StatItem>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({
  theme,
  data,
  children,
}: {
  theme: PacifinanceTheme;
  data: { title: string; subtitle: string };
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl flex-shrink-0"
        style={{
          backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : `${theme.secondaryColor}12`,
          border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : `${theme.secondaryColor}25`}`,
        }}
      >
        {children}
      </div>
      <div>
        <div className="text-sm font-semibold leading-tight" style={{ color: theme.textColor }}>
          {data.title}
        </div>
        <div className="text-xs opacity-60 leading-tight">{data.subtitle}</div>
      </div>
    </div>
  );
}

function StatItem({
  theme,
  data,
  children,
}: {
  theme: PacifinanceTheme;
  data: { value: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full flex-shrink-0"
        style={{ backgroundColor: `${theme.secondaryColor}20`, color: theme.secondaryColor }}
      >
        {children}
      </div>
      <div>
        <div className="text-sm md:text-base font-bold leading-tight" style={{ color: theme.textColor }}>
          {data.value}
        </div>
        <div className="text-[11px] md:text-xs opacity-60 leading-tight">{data.label}</div>
      </div>
    </div>
  );
}
