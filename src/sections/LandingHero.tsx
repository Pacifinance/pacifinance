import React, { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import GitHubStatsBar from '../components/GitHubStatsBar';
import { GITHUB_REPO_URL } from '../data/externalLinks';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import LockIcon from '@mui/icons-material/Lock';
import CodeIcon from '@mui/icons-material/Code';
import type { PacifinanceTheme } from '../types/theme';

interface LandingHeroProps {
  theme: PacifinanceTheme;
}

export default function LandingHero({ theme }: LandingHeroProps) {
  const { translations } = useContext(LanguageContext);
  const navigate = useLocalizedNavigate();
  const t = translations.landing.new;

  const handleGetStarted = () => navigate('/auth');
  const handleLearnMore = () =>
    document.getElementById('pillars')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      className="relative min-h-screen flex items-center justify-center px-4 py-12 md:py-20"
      style={{ background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.backgroundColor} 100%)` }}
    >
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, ${theme.secondaryColor} 2px, transparent 2px), radial-gradient(circle at 75% 75%, ${theme.secondaryColor} 2px, transparent 2px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
        <div className="text-center lg:text-left space-y-5 md:space-y-8">
          <div className="space-y-3 md:space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span style={{ color: theme.secondaryColor }}>{t.hero.title}</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                {t.hero.subtitle}
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-2xl opacity-80 max-w-2xl mx-auto lg:mx-0">
              {t.hero.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 md:gap-4 justify-center lg:justify-start">
            <HeroPill theme={theme} label={t.benefits.anonymousComparison}>
              <CompareArrowsIcon style={{ color: theme.secondaryColor }} sx={{ fontSize: { xs: 16, md: 20 } }} />
            </HeroPill>
            <HeroPill theme={theme} label={t.benefits.privacyFirst}>
              <LockIcon style={{ color: theme.secondaryColor }} sx={{ fontSize: { xs: 16, md: 20 } }} />
            </HeroPill>
            <HeroPill theme={theme} label={t.benefits.openSource}>
              <CodeIcon style={{ color: theme.secondaryColor }} sx={{ fontSize: { xs: 16, md: 20 } }} />
            </HeroPill>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
            <button
              onClick={handleGetStarted}
              className="px-6 md:px-8 py-3 md:py-4 rounded-xl text-white font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              style={{ backgroundColor: theme.secondaryColor }}
              data-umami-event="hero-get-started"
            >
              {t.hero.getStarted}
            </button>
            <button
              onClick={handleLearnMore}
              className="px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg border-2 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              style={{ borderColor: theme.secondaryColor, color: theme.secondaryColor, backgroundColor: 'transparent' }}
              data-umami-event="hero-learn-more"
            >
              {t.hero.learnMore}
            </button>
          </div>

          {/* Social proof: real, verifiable GitHub activity (server-cached /api/github-stats) instead of a generic trust claim */}
          <div className="flex justify-center lg:justify-start">
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
        </div>

        <div className="flex justify-center lg:justify-end mt-2 md:mt-0">
          <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-none">
            <DashboardMockup theme={theme} />
            <div
              className="hidden sm:block absolute -top-3 -right-3 md:-top-4 md:-right-4 w-6 h-6 md:w-8 md:h-8 rounded-full animate-bounce"
              style={{ backgroundColor: theme.secondaryColor }}
            />
            <div
              className="hidden sm:block absolute -bottom-3 -left-3 md:-bottom-4 md:-left-4 w-4 h-4 md:w-6 md:h-6 rounded-full animate-pulse"
              style={{ backgroundColor: theme.secondaryColor, opacity: 0.7 }}
            />
          </div>
        </div>
      </div>

      <div className="hidden sm:block absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 rounded-full flex justify-center" style={{ borderColor: theme.secondaryColor }}>
          <div className="w-1 h-3 rounded-full mt-2" style={{ backgroundColor: theme.secondaryColor }} />
        </div>
      </div>
    </section>
  );
}

function HeroPill({ theme, label, children }: { theme: PacifinanceTheme; label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex items-center space-x-1.5 md:space-x-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full"
      style={{ backgroundColor: `${theme.secondaryColor}20` }}
    >
      {children}
      <span className="text-xs md:text-sm font-medium">{label}</span>
    </div>
  );
}

/**
 * Hand-drawn placeholder standing in for a real product screenshot (account
 * cards, a spending chart, an anonymous-comparison percentile curve) — swap
 * for an actual dashboard screenshot once one is ready. Inline SVG (no
 * network request), themable, replaces the old generic decorative artwork
 * that had no visual relation to the product.
 */
function DashboardMockup({ theme }: { theme: PacifinanceTheme }) {
  const stroke = theme.mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)';
  const panelBg = theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f4f6f5';
  const cardBg = theme.mode === 'dark' ? '#1a222c' : '#ffffff';
  const barHeights = [38, 66, 52, 86, 62, 96, 76];

  return (
    <svg
      viewBox="0 0 560 420"
      className="w-full h-auto rounded-2xl shadow-2xl"
      role="img"
      aria-label="Pacifinance dashboard preview"
    >
      <rect x="1" y="1" width="558" height="418" rx="20" fill={cardBg} stroke={stroke} />

      <circle cx="30" cy="28" r="6" fill={theme.secondaryColor} opacity="0.6" />
      <rect x="48" y="22" width="90" height="12" rx="6" fill={stroke} />
      <rect x="420" y="18" width="110" height="20" rx="10" fill={`${theme.secondaryColor}25`} />

      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${30 + i * 175}, 60)`}>
          <rect width="155" height="80" rx="14" fill={panelBg} stroke={stroke} />
          <rect x="16" y="16" width="60" height="8" rx="4" fill={stroke} />
          <rect x="16" y="40" width="90" height="16" rx="6" fill={theme.secondaryColor} opacity={i === 1 ? 1 : 0.55} />
        </g>
      ))}

      <g transform="translate(30,165)">
        <rect width="330" height="150" rx="14" fill={panelBg} stroke={stroke} />
        {barHeights.map((h, i) => (
          <rect
            key={i}
            x={20 + i * 42}
            y={130 - h}
            width="22"
            height={h}
            rx="4"
            fill={theme.secondaryColor}
            opacity={0.35 + (i / barHeights.length) * 0.5}
          />
        ))}
      </g>

      <g transform="translate(380,165)">
        <rect width="150" height="150" rx="14" fill={`${theme.secondaryColor}12`} stroke={`${theme.secondaryColor}40`} />
        <rect x="18" y="18" width="80" height="8" rx="4" fill={stroke} />
        <path
          d="M18 112 C 45 70, 90 66, 132 28"
          stroke={theme.secondaryColor}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="104" cy="42" r="6" fill={theme.secondaryColor} />
        <rect x="18" y="124" width="56" height="10" rx="5" fill={stroke} />
      </g>
    </svg>
  );
}
