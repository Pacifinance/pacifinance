import React, { useContext, lazy, Suspense } from "react";
import { useLocalizedNavigate } from "../hooks/useLocalizedNavigate";
// Lazy import of MUI icons for performance
import {
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Shield as ShieldIcon,
  Analytics as AnalyticsIcon,
  CompareArrows as CompareArrowsIcon,
  TrendingUp as TrendingUpIcon,
  VisibilityOff as VisibilityOffIcon,
  Paid as PaidIcon,
  Code as CodeIcon,
  Storage as StorageIcon,
  Groups as GroupsIcon,
  UploadFile as UploadFileIcon,
  CurrencyExchange as CurrencyExchangeIcon,
  ShowChart as ShowChartIcon
} from "@mui/icons-material";
// Lazy loading of non-critical components for the First Contentful Paint
const ConsentBanner = lazy(() => import("./ConsentBanner"));
const BuyMeACoffeeWidget = lazy(() => import("../components/BuyMeACoffeeWidget"));
import GitHubStatsBar from "../components/GitHubStatsBar";
import { LanguageContext } from "../contexts/LanguageContext";

const GITHUB_REPO_URL = "https://github.com/pacifinance/pacifinance";

export default function NewLandingContent({ theme }) {
  const { translations } = useContext(LanguageContext);
  const navigate = useLocalizedNavigate();
  const t = translations.landing.new;

  const handleGetStarted = () => {
    navigate("/auth");
  };

  const handleLearnMore = () => {
    document.getElementById("features").scrollIntoView({ behavior: "smooth" });
  };

  const featureCardStyle = {
    borderColor: theme.secondaryColor,
    backgroundColor:
      theme.mode === "dark"
        ? `${theme.secondaryColor}10`
        : "rgba(255,255,255,0.5)",
  };

  return (
    <div
      className="relative left-0 w-full overflow-y-hidden"
      style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
    >
      <Suspense fallback={<div></div>}>
        <ConsentBanner />
      </Suspense>

      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center px-4 py-12 md:py-20"
        style={{
          background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.backgroundColor} 100%)`,
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, ${theme.secondaryColor} 2px, transparent 2px), radial-gradient(circle at 75% 75%, ${theme.secondaryColor} 2px, transparent 2px)`,
              backgroundSize: "60px 60px",
            }}
          ></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left space-y-5 md:space-y-8">
            {/* Main Headline */}
            <div className="space-y-3 md:space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span style={{ color: theme.secondaryColor }}>
                  {t.hero.title}
                </span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                  {t.hero.subtitle}
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-2xl opacity-80 max-w-2xl mx-auto lg:mx-0">
                {t.hero.description}
              </p>
            </div>

            {/* Key Benefits - compact on mobile */}
            <div className="flex flex-wrap gap-2 md:gap-4 justify-center lg:justify-start">
              <div
                className="flex items-center space-x-1.5 md:space-x-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full"
                style={{ backgroundColor: `${theme.secondaryColor}20` }}
              >
                <CompareArrowsIcon
                  style={{ color: theme.secondaryColor }}
                  sx={{ fontSize: { xs: 16, md: 20 } }}
                />
                <span className="text-xs md:text-sm font-medium">{t.benefits.anonymousComparison}</span>
              </div>
              <div
                className="flex items-center space-x-1.5 md:space-x-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full"
                style={{ backgroundColor: `${theme.secondaryColor}20` }}
              >
                <LockIcon
                  style={{ color: theme.secondaryColor }}
                  sx={{ fontSize: { xs: 16, md: 20 } }}
                />
                <span className="text-xs md:text-sm font-medium">{t.benefits.privacyFirst}</span>
              </div>
              <div
                className="flex items-center space-x-1.5 md:space-x-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full"
                style={{ backgroundColor: `${theme.secondaryColor}20` }}
              >
                <CodeIcon
                  style={{ color: theme.secondaryColor }}
                  sx={{ fontSize: { xs: 16, md: 20 } }}
                />
                <span className="text-xs md:text-sm font-medium">{t.benefits.openSource}</span>
              </div>
            </div>

            {/* CTA Buttons - tighter on mobile */}
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
                style={{
                  borderColor: theme.secondaryColor,
                  color: theme.secondaryColor,
                  backgroundColor: "transparent",
                }}
                data-umami-event="hero-learn-more"
              >
                {t.hero.learnMore}
              </button>
            </div>

            {/* Social Proof - real, verifiable GitHub activity instead of a generic trust claim */}
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

          {/* Right Column - Hero Image (smaller on mobile) */}
          <div className="flex justify-center lg:justify-end mt-2 md:mt-0">
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-none">
              <picture>
                <source srcSet="/hero.avif" type="image/avif"/>
                <source srcSet="/hero.webp" type="image/webp"/>
                <img
                  src="/hero.webp"
                  alt="Pacifinance Dashboard Preview"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                  width={600}
                  height={400}
                  style={{
                    maxHeight: "500px",
                    objectFit: "contain",
                    backgroundColor: `${theme.secondaryColor}10`,
                    minHeight: "200px",
                  }}
                  loading="eager"
                  fetchPriority="high"
                  decoding="sync"
                  draggable="false"
                  onContextMenu={(e) => e.preventDefault()}
                  onError={(e) => {
                    console.warn('[Hero] Image failed to load:', e.target.src);
                    e.target.style.display = 'none';
                  }}
                />
              </picture>
              {/* Floating Elements - hidden on very small screens */}
              <div
                className="hidden sm:block absolute -top-3 -right-3 md:-top-4 md:-right-4 w-6 h-6 md:w-8 md:h-8 rounded-full animate-bounce"
                style={{ backgroundColor: theme.secondaryColor }}
              ></div>
              <div
                className="hidden sm:block absolute -bottom-3 -left-3 md:-bottom-4 md:-left-4 w-4 h-4 md:w-6 md:h-6 rounded-full animate-pulse"
                style={{ backgroundColor: theme.secondaryColor, opacity: 0.7 }}
              ></div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator - hidden on small mobile */}
        <div className="hidden sm:block absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div
            className="w-6 h-10 border-2 rounded-full flex justify-center"
            style={{ borderColor: theme.secondaryColor }}
          >
            <div
              className="w-1 h-3 rounded-full mt-2"
              style={{ backgroundColor: theme.secondaryColor }}
            ></div>
          </div>
        </div>
      </section>

      {/* Features Section - anonymous comparison, privacy and open source lead
          (the actual problem this product solves), the rest of the feature
          set follows. */}
      <section
        id="features"
        className="py-10 md:py-16 px-4"
        style={{ backgroundColor: theme.primaryColor }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 md:mb-6">
              {t.features.title.split('Pacifinance')[0]}
              <span style={{ color: theme.secondaryColor }}>Pacifinance</span>
              {t.features.title.split('Pacifinance')[1] || '?'}
            </h2>
            <p className="text-base md:text-xl opacity-80 max-w-3xl mx-auto">
              {t.features.subtitle}
            </p>
          </div>

          {/* Features Grid */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-5">
            {/* Feature 1 - Anonymous Comparison (the core problem this product solves) */}
            <div
              className="group p-4 md:p-6 rounded-2xl border border-opacity-20 hover:shadow-lg transition-all duration-300 w-full sm:w-[calc(50%-0.375rem)] lg:w-[calc(33.333%-0.834rem)]"
              style={featureCardStyle}
            >
              <div
                className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <CompareArrowsIcon className="text-white" sx={{ fontSize: { xs: 20, md: 24 } }} />
              </div>
              <h3 className="text-base md:text-lg font-bold mb-1.5 md:mb-2">
                {t.features.comparisons.title}
              </h3>
              <p className="opacity-80 mb-2 md:mb-3 text-sm">
                {t.features.comparisons.description}
              </p>
              <ul className="space-y-1 md:space-y-1.5 text-xs md:text-sm opacity-70">
                {t.features.comparisons.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Feature 2 - Privacy */}
            <div
              className="group p-4 md:p-6 rounded-2xl border border-opacity-20 hover:shadow-lg transition-all duration-300 w-full sm:w-[calc(50%-0.375rem)] lg:w-[calc(33.333%-0.834rem)]"
              style={featureCardStyle}
            >
              <div
                className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <ShieldIcon className="text-white" sx={{ fontSize: { xs: 20, md: 24 } }} />
              </div>
              <h3 className="text-base md:text-lg font-bold mb-1.5 md:mb-2">{t.features.privacy.title}</h3>
              <p className="opacity-80 mb-2 md:mb-3 text-sm">
                {t.features.privacy.description}
              </p>
              <ul className="space-y-1 md:space-y-1.5 text-xs md:text-sm opacity-70">
                {t.features.privacy.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Feature 3 - Open Source & Self-Hostable */}
            <div
              className="group p-4 md:p-6 rounded-2xl border border-opacity-20 hover:shadow-lg transition-all duration-300 w-full sm:w-[calc(50%-0.375rem)] lg:w-[calc(33.333%-0.834rem)]"
              style={featureCardStyle}
            >
              <div
                className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <CodeIcon className="text-white" sx={{ fontSize: { xs: 20, md: 24 } }} />
              </div>
              <h3 className="text-base md:text-lg font-bold mb-1.5 md:mb-2">{t.features.openSource.title}</h3>
              <p className="opacity-80 mb-2 md:mb-3 text-sm">
                {t.features.openSource.description}
              </p>
              <ul className="space-y-1 md:space-y-1.5 text-xs md:text-sm opacity-70">
                {t.features.openSource.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Feature 4 - Analytics */}
            <div
              className="group p-4 md:p-6 rounded-2xl border border-opacity-20 hover:shadow-lg transition-all duration-300 w-full sm:w-[calc(50%-0.375rem)] lg:w-[calc(33.333%-0.834rem)]"
              style={featureCardStyle}
            >
              <div
                className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <AnalyticsIcon className="text-white" sx={{ fontSize: { xs: 20, md: 24 } }} />
              </div>
              <h3 className="text-base md:text-lg font-bold mb-1.5 md:mb-2">{t.features.analytics.title}</h3>
              <p className="opacity-80 mb-2 md:mb-3 text-sm">
                {t.features.analytics.description}
              </p>
              <ul className="space-y-1 md:space-y-1.5 text-xs md:text-sm opacity-70">
                {t.features.analytics.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Feature 5 - Investment Tracking */}
            <div
              className="group p-4 md:p-6 rounded-2xl border border-opacity-20 hover:shadow-lg transition-all duration-300 w-full sm:w-[calc(50%-0.375rem)] lg:w-[calc(33.333%-0.834rem)]"
              style={featureCardStyle}
            >
              <div
                className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <TrendingUpIcon className="text-white" sx={{ fontSize: { xs: 20, md: 24 } }} />
              </div>
              <h3 className="text-base md:text-lg font-bold mb-1.5 md:mb-2">{t.features.investment.title}</h3>
              <p className="opacity-80 mb-2 md:mb-3 text-sm">
                {t.features.investment.description}
              </p>
              <ul className="space-y-1 md:space-y-1.5 text-xs md:text-sm opacity-70">
                {t.features.investment.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Feature 6 - Free Forever */}
            <div
              className="group p-4 md:p-6 rounded-2xl border border-opacity-20 hover:shadow-lg transition-all duration-300 w-full sm:w-[calc(50%-0.375rem)] lg:w-[calc(33.333%-0.834rem)]"
              style={featureCardStyle}
            >
              <div
                className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <PaidIcon className="text-white" sx={{ fontSize: { xs: 20, md: 24 } }} />
              </div>
              <h3 className="text-base md:text-lg font-bold mb-1.5 md:mb-2">{t.features.free.title}</h3>
              <p className="opacity-80 mb-2 md:mb-3 text-sm">
                {t.features.free.description}
              </p>
              <ul className="space-y-1 md:space-y-1.5 text-xs md:text-sm opacity-70">
                {t.features.free.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Feature 7 - Security */}
            <div
              className="group p-4 md:p-6 rounded-2xl border border-opacity-20 hover:shadow-lg transition-all duration-300 w-full sm:w-[calc(50%-0.375rem)] lg:w-[calc(33.333%-0.834rem)]"
              style={featureCardStyle}
            >
              <div
                className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <VisibilityOffIcon className="text-white" sx={{ fontSize: { xs: 20, md: 24 } }} />
              </div>
              <h3 className="text-base md:text-lg font-bold mb-1.5 md:mb-2">{t.features.security.title}</h3>
              <p className="opacity-80 mb-2 md:mb-3 text-sm">
                {t.features.security.description}
              </p>
              <ul className="space-y-1 md:space-y-1.5 text-xs md:text-sm opacity-70">
                {t.features.security.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Feature 8 - Market Prices */}
            <div
              className="group p-4 md:p-6 rounded-2xl border border-opacity-20 hover:shadow-lg transition-all duration-300 w-full sm:w-[calc(50%-0.375rem)] lg:w-[calc(33.333%-0.834rem)]"
              style={featureCardStyle}
            >
              <div
                className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <ShowChartIcon className="text-white" sx={{ fontSize: { xs: 20, md: 24 } }} />
              </div>
              <h3 className="text-base md:text-lg font-bold mb-1.5 md:mb-2">{t.features.marketPrices.title}</h3>
              <p className="opacity-80 mb-2 md:mb-3 text-sm">
                {t.features.marketPrices.description}
              </p>
              <ul className="space-y-1 md:space-y-1.5 text-xs md:text-sm opacity-70">
                {t.features.marketPrices.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Feature 9 - Multi-Currency Support */}
            <div
              className="group p-4 md:p-6 rounded-2xl border border-opacity-20 hover:shadow-lg transition-all duration-300 w-full"
              style={featureCardStyle}
            >
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                <div
                  className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: theme.secondaryColor }}
                >
                  <CurrencyExchangeIcon className="text-white" sx={{ fontSize: { xs: 24, md: 30 } }} />
                </div>
                <div className="text-center md:text-left flex-1">
                  <h3 className="text-base md:text-lg font-bold mb-1.5 md:mb-2">{t.features.currencies.title}</h3>
                  <p className="opacity-80 mb-2 md:mb-3 text-sm">
                    {t.features.currencies.description}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {t.features.currencies.features.map((currency, index) => (
                      <span key={index} className="text-sm px-3 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: theme.mode === 'dark' ? `${theme.secondaryColor}20` : `${theme.secondaryColor}15`,
                          border: `1px solid ${theme.secondaryColor}30`,
                        }}
                      >
                        {currency}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 justify-center md:justify-start">
                    <span className="text-xs opacity-60 flex items-center gap-1">
                      <CheckCircleIcon style={{ color: theme.secondaryColor }} sx={{ fontSize: 14 }} />
                      {t.features.currencies.liveRates}
                    </span>
                    <span className="text-xs opacity-60 flex items-center gap-1">
                      <CheckCircleIcon style={{ color: theme.secondaryColor }} sx={{ fontSize: 14 }} />
                      {t.features.currencies.autoConversion}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 10 - CSV/Excel Import */}
            <div
              className="group p-4 md:p-6 rounded-2xl border border-opacity-20 hover:shadow-lg transition-all duration-300 w-full"
              style={featureCardStyle}
            >
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                <div
                  className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: theme.secondaryColor }}
                >
                  <UploadFileIcon className="text-white" sx={{ fontSize: { xs: 24, md: 30 } }} />
                </div>
                <div className="text-center md:text-left flex-1">
                  <h3 className="text-base md:text-lg font-bold mb-1.5 md:mb-2">{t.features.import.title}</h3>
                  <p className="opacity-80 mb-2 md:mb-3 text-sm">
                    {t.features.import.description}
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    {t.features.import.features.map((feature, index) => (
                      <span key={index} className="text-sm opacity-70 px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: theme.mode === 'dark' ? `${theme.secondaryColor}20` : `${theme.secondaryColor}15`,
                          border: `1px solid ${theme.secondaryColor}30`,
                        }}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Source Deep-Dive Section */}
      <section
        className="py-10 md:py-16 px-4"
        style={{ backgroundColor: theme.backgroundColor }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <span
              className="inline-block text-xs md:text-sm font-semibold px-3 py-1 rounded-full mb-3 md:mb-4"
              style={{ backgroundColor: `${theme.secondaryColor}20`, color: theme.secondaryColor }}
            >
              {t.openSource.badge}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
              {t.openSource.title}
            </h2>
            <p className="text-base md:text-lg opacity-80 max-w-2xl mx-auto">
              {t.openSource.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
            <div
              className="p-4 md:p-6 rounded-2xl border border-opacity-20 text-center"
              style={featureCardStyle}
            >
              <div
                className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full mb-3 md:mb-4 mx-auto"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <CodeIcon className="text-white" sx={{ fontSize: { xs: 20, md: 24 } }} />
              </div>
              <h3 className="text-base md:text-lg font-bold mb-1.5 md:mb-2">{t.openSource.pillars.code.title}</h3>
              <p className="opacity-80 text-sm">{t.openSource.pillars.code.description}</p>
            </div>
            <div
              className="p-4 md:p-6 rounded-2xl border border-opacity-20 text-center"
              style={featureCardStyle}
            >
              <div
                className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full mb-3 md:mb-4 mx-auto"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <StorageIcon className="text-white" sx={{ fontSize: { xs: 20, md: 24 } }} />
              </div>
              <h3 className="text-base md:text-lg font-bold mb-1.5 md:mb-2">{t.openSource.pillars.selfHost.title}</h3>
              <p className="opacity-80 text-sm">{t.openSource.pillars.selfHost.description}</p>
            </div>
            <div
              className="p-4 md:p-6 rounded-2xl border border-opacity-20 text-center"
              style={featureCardStyle}
            >
              <div
                className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full mb-3 md:mb-4 mx-auto"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <GroupsIcon className="text-white" sx={{ fontSize: { xs: 20, md: 24 } }} />
              </div>
              <h3 className="text-base md:text-lg font-bold mb-1.5 md:mb-2">{t.openSource.pillars.communityPrices.title}</h3>
              <p className="opacity-80 text-sm">{t.openSource.pillars.communityPrices.description}</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 md:px-8 py-3 md:py-4 rounded-xl text-white font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              style={{ backgroundColor: theme.secondaryColor }}
              data-umami-event="landing-view-repo"
            >
              {t.openSource.viewOnGithub}
            </a>
            <p className="text-xs md:text-sm opacity-60">{t.openSource.sponsorsComingSoon}</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-12 md:py-20 px-4"
        style={{ backgroundColor: theme.primaryColor }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 md:mb-6">
            {t.cta.title}{" "}
            <span style={{ color: theme.secondaryColor }}>
              {t.cta.subtitle}
            </span>
            ?
          </h2>
          <p className="text-base md:text-xl opacity-80 mb-6 md:mb-8 max-w-2xl mx-auto">
            {t.cta.description}
          </p>

          <div className="space-y-3 md:space-y-4">
            <button
              onClick={handleGetStarted}
              className="px-8 md:px-12 py-3 md:py-4 rounded-xl text-white font-semibold text-lg md:text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              style={{ backgroundColor: theme.secondaryColor }}
              data-umami-event="cta-get-started"
            >
              {t.cta.button}
            </button>

            <p className="text-xs md:text-sm opacity-60">
              {t.cta.disclaimer}
            </p>
          </div>

          {/* Trust Signals - real, verifiable claims only */}
          <div className="mt-8 md:mt-12 grid grid-cols-3 gap-4 md:gap-8 opacity-70">
            <div className="text-center">
              <div
                className="text-xl md:text-3xl font-bold"
                style={{ color: theme.secondaryColor }}
              >
                AGPLv3
              </div>
              <div className="text-xs md:text-sm">{t.trust.license}</div>
            </div>
            <div className="text-center">
              <div
                className="text-xl md:text-3xl font-bold"
                style={{ color: theme.secondaryColor }}
              >
                0%
              </div>
              <div className="text-xs md:text-sm">{t.trust.dataSold}</div>
            </div>
            <div className="text-center">
              <div
                className="text-xl md:text-3xl font-bold"
                style={{ color: theme.secondaryColor }}
              >
                100%
              </div>
              <div className="text-xs md:text-sm">{t.trust.freeForever}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Support Section */}
      <section
        className="py-10 md:py-16 px-4"
        style={{ backgroundColor: theme.primaryColor }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
            {t.donation.title}
          </h3>
          <p className="opacity-80 mb-4 md:mb-6 text-sm md:text-base">
            {t.donation.description}
          </p>
          <Suspense fallback={<div></div>}>
            <BuyMeACoffeeWidget />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
