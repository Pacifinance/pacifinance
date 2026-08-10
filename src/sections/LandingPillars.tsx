import React, { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShieldIcon from '@mui/icons-material/Shield';
import type { PacifinanceTheme } from '../types/theme';

interface LandingPillarsProps {
  theme: PacifinanceTheme;
}

interface PillarData {
  title: string;
  description: string;
  features: string[];
}

export default function LandingPillars({ theme }: LandingPillarsProps) {
  const { translations } = useContext(LanguageContext);
  const pillars = translations.landing.new.pillars;

  return (
    <section id="pillars" className="py-14 md:py-20 px-4" style={{ backgroundColor: theme.primaryColor }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 md:mb-6">{pillars.title}</h2>
          <p className="text-base md:text-xl opacity-80 max-w-3xl mx-auto">{pillars.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
          <PillarCard theme={theme} data={pillars.comparison} illustration={<PercentileIllustration theme={theme} />}>
            <CompareArrowsIcon className="text-white" sx={{ fontSize: 24 }} />
          </PillarCard>
          <PillarCard theme={theme} data={pillars.unifiedView} illustration={<UnifiedViewIllustration theme={theme} />}>
            <TrendingUpIcon className="text-white" sx={{ fontSize: 24 }} />
          </PillarCard>
          <PillarCard theme={theme} data={pillars.privacy} illustration={<PrivacyIllustration theme={theme} />}>
            <ShieldIcon className="text-white" sx={{ fontSize: 24 }} />
          </PillarCard>
        </div>
      </div>
    </section>
  );
}

function PillarCard({
  theme,
  data,
  children,
  illustration,
}: {
  theme: PacifinanceTheme;
  data: PillarData;
  children: React.ReactNode;
  illustration?: React.ReactNode;
}) {
  return (
    <div
      className="group p-6 md:p-7 rounded-2xl border border-opacity-20 hover:shadow-lg transition-all duration-300 flex flex-col"
      style={{
        borderColor: theme.secondaryColor,
        backgroundColor: theme.mode === 'dark' ? `${theme.secondaryColor}10` : 'rgba(255,255,255,0.6)',
      }}
    >
      <div
        className="flex items-center justify-center w-12 h-12 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300"
        style={{ backgroundColor: theme.secondaryColor }}
      >
        {children}
      </div>
      <h3 className="text-lg font-bold mb-2">{data.title}</h3>
      <p className="opacity-80 mb-3 text-sm">{data.description}</p>
      <ul className="space-y-1.5 text-sm opacity-70 mb-4">
        {data.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      {illustration && <div className="mt-auto pt-2">{illustration}</div>}
    </div>
  );
}

/**
 * Placeholder illustration for the anonymous-comparison pillar: a stylized
 * percentile curve with a "you are here" marker. Inline SVG, themable,
 * zero network requests.
 */
function PercentileIllustration({ theme }: { theme: PacifinanceTheme }) {
  const stroke = theme.mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)';
  const barHeights = [18, 30, 48, 66, 80, 60, 34, 20];
  const markerIndex = 4;

  return (
    <svg viewBox="0 0 260 100" className="w-full h-auto" role="img" aria-hidden="true">
      <rect x="0" y="0" width="260" height="100" rx="12" fill={`${theme.secondaryColor}0d`} />
      {barHeights.map((h, i) => (
        <rect
          key={i}
          x={16 + i * 30}
          y={82 - h}
          width="18"
          height={h}
          rx="3"
          fill={i === markerIndex ? theme.secondaryColor : stroke}
        />
      ))}
      <circle cx={16 + markerIndex * 30 + 9} cy={82 - barHeights[markerIndex] - 10} r="4" fill={theme.secondaryColor} />
    </svg>
  );
}

/**
 * Placeholder illustration for the unified-view pillar: three separate
 * account cards converging into one consolidated total.
 */
function UnifiedViewIllustration({ theme }: { theme: PacifinanceTheme }) {
  const stroke = theme.mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)';

  return (
    <svg viewBox="0 0 260 100" className="w-full h-auto" role="img" aria-hidden="true">
      <rect x="0" y="0" width="260" height="100" rx="12" fill={`${theme.secondaryColor}0d`} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={36 + i * 70} y="14" width="50" height="26" rx="6" fill={stroke} />
      ))}
      {[0, 1, 2].map((i) => (
        <line
          key={i}
          x1={36 + i * 70 + 25}
          y1="42"
          x2="130"
          y2="68"
          stroke={theme.secondaryColor}
          strokeWidth="2"
          opacity="0.45"
        />
      ))}
      <circle cx="130" cy="78" r="15" fill={theme.secondaryColor} />
    </svg>
  );
}

/**
 * Placeholder illustration for the privacy pillar: a shield with a
 * checkmark, flanked by scattered dots standing in for anonymized data.
 */
function PrivacyIllustration({ theme }: { theme: PacifinanceTheme }) {
  const stroke = theme.mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)';
  const dots = [
    [40, 28], [56, 58], [34, 74],
    [220, 28], [204, 58], [226, 74],
  ];

  return (
    <svg viewBox="0 0 260 100" className="w-full h-auto" role="img" aria-hidden="true">
      <rect x="0" y="0" width="260" height="100" rx="12" fill={`${theme.secondaryColor}0d`} />
      {dots.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill={stroke} />
      ))}
      <path
        d="M130 12 L163 24 V52 C163 72 148 84 130 89 C112 84 97 72 97 52 V24 Z"
        fill={`${theme.secondaryColor}22`}
        stroke={theme.secondaryColor}
        strokeWidth="2"
      />
      <path
        d="M118 51 L127 60 L145 39"
        stroke={theme.secondaryColor}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
