import React, { useContext, lazy, Suspense } from "react";
import { useLocalizedNavigate } from "../hooks/useLocalizedNavigate";
// Lazy import delle icone MUI per performance
import { 
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon, 
  Shield as ShieldIcon,
  Analytics as AnalyticsIcon,
  CompareArrows as CompareArrowsIcon,
  TrendingUp as TrendingUpIcon,
  VisibilityOff as VisibilityOffIcon,
  Paid as PaidIcon,
  Star as StarIcon,
  UploadFile as UploadFileIcon,
  CurrencyExchange as CurrencyExchangeIcon
} from "@mui/icons-material";
// Hero image served from public/ for preload discoverability in index.html
const LandingPageImage = "/PacifinanceArt2NoBg.webp";
import Logo from "../assets/Brand/PacifinanceLogoPNG3NoBg.webp";

// Lazy loading dei componenti non critici per il First Contentful Paint
const ConsentBanner = lazy(() => import("../components/ConsentBanner"));
const BuyMeACoffeeWidget = lazy(() => import("../components/BuyMeACoffeeWidget"));
import { LanguageContext } from "../contexts/LanguageContext";

export default function NewLandingContent({ theme }) {
  const { translations } = useContext(LanguageContext);
  const navigate = useLocalizedNavigate();

  const handleGetStarted = () => {
    navigate("/auth");
  };

  const handleLearnMore = () => {
    document.getElementById("features").scrollIntoView({ behavior: "smooth" });
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
                  {translations.landing.new.hero.title}
                </span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                  {translations.landing.new.hero.subtitle}
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-2xl opacity-80 max-w-2xl mx-auto lg:mx-0">
                {translations.landing.new.hero.description}
              </p>
            </div>

            {/* Key Benefits - compact on mobile */}
            <div className="flex flex-wrap gap-2 md:gap-4 justify-center lg:justify-start">
              <div
                className="flex items-center space-x-1.5 md:space-x-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full"
                style={{ backgroundColor: `${theme.secondaryColor}20` }}
              >
                <CheckCircleIcon
                  style={{ color: theme.secondaryColor }}
                  sx={{ fontSize: { xs: 16, md: 20 } }}
                />
                <span className="text-xs md:text-sm font-medium">{translations.landing.new.benefits.freeForever}</span>
              </div>
              <div
                className="flex items-center space-x-1.5 md:space-x-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full"
                style={{ backgroundColor: `${theme.secondaryColor}20` }}
              >
                <LockIcon
                  style={{ color: theme.secondaryColor }}
                  sx={{ fontSize: { xs: 16, md: 20 } }}
                />
                <span className="text-xs md:text-sm font-medium">{translations.landing.new.benefits.privacyFirst}</span>
              </div>
              <div
                className="flex items-center space-x-1.5 md:space-x-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full"
                style={{ backgroundColor: `${theme.secondaryColor}20` }}
              >
                <AnalyticsIcon
                  style={{ color: theme.secondaryColor }}
                  sx={{ fontSize: { xs: 16, md: 20 } }}
                />
                <span className="text-xs md:text-sm font-medium">{translations.landing.new.benefits.smartAnalytics}</span>
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
                {translations.landing.new.hero.getStarted}
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
                {translations.landing.new.hero.learnMore}
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center space-x-3 md:space-x-4 justify-center lg:justify-start opacity-70">
              <div className="flex items-center space-x-0.5">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    style={{ color: "#FFD700" }}
                    sx={{ fontSize: { xs: 16, md: 20 } }}
                  />
                ))}
              </div>
              <span className="text-xs md:text-sm">
                {translations.landing.new.hero.socialProof}
              </span>
            </div>
          </div>

          {/* Right Column - Hero Image (smaller on mobile) */}
          <div className="flex justify-center lg:justify-end mt-2 md:mt-0">
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-none">
              <img
                src={LandingPageImage}
                alt="PaciFinance Dashboard Preview"
                className="w-full h-auto rounded-2xl shadow-2xl"
                width={600}
                height={400}
                style={{ maxHeight: "500px", objectFit: "contain" }}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                sizes="(max-width: 480px) 280px, (max-width: 768px) 380px, 600px"
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
              />
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

      {/* Features Section */}
      <section
        id="features"
        className="py-12 md:py-20 px-4"
        style={{ backgroundColor: theme.primaryColor }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 md:mb-6">
              {translations.landing.new.features.title.split('PaciFinance')[0]}
              <span style={{ color: theme.secondaryColor }}>PaciFinance</span>
              {translations.landing.new.features.title.split('PaciFinance')[1] || '?'}
            </h2>
            <p className="text-base md:text-xl opacity-80 max-w-3xl mx-auto">
              {translations.landing.new.features.subtitle}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {/* Feature 1 - Privacy */}
            <div
              className="group p-5 md:p-8 rounded-2xl border border-opacity-20 hover:shadow-xl transition-all duration-300"
              style={{
                borderColor: theme.secondaryColor,
                backgroundColor:
                  theme.mode === "dark"
                    ? `${theme.secondaryColor}10`
                    : "rgba(255,255,255,0.5)",
              }}
            >
              <div
                className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <ShieldIcon className="text-white" sx={{ fontSize: { xs: 24, md: 30 } }} />
              </div>
              <h3 className="text-lg md:text-2xl font-bold mb-2 md:mb-4">{translations.landing.new.features.privacy.title}</h3>
              <p className="opacity-80 mb-3 md:mb-4 text-sm md:text-base">
                {translations.landing.new.features.privacy.description}
              </p>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm opacity-70">
                {translations.landing.new.features.privacy.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Feature 2 - Analytics */}
            <div
              className="group p-5 md:p-8 rounded-2xl border border-opacity-20 hover:shadow-xl transition-all duration-300"
              style={{
                borderColor: theme.secondaryColor,
                backgroundColor:
                  theme.mode === "dark"
                    ? `${theme.secondaryColor}10`
                    : "rgba(255,255,255,0.5)",
              }}
            >
              <div
                className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <AnalyticsIcon className="text-white" sx={{ fontSize: { xs: 24, md: 30 } }} />
              </div>
              <h3 className="text-lg md:text-2xl font-bold mb-2 md:mb-4">{translations.landing.new.features.analytics.title}</h3>
              <p className="opacity-80 mb-3 md:mb-4 text-sm md:text-base">
                {translations.landing.new.features.analytics.description}
              </p>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm opacity-70">
                {translations.landing.new.features.analytics.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Feature 3 - Comparisons */}
            <div
              className="group p-5 md:p-8 rounded-2xl border border-opacity-20 hover:shadow-xl transition-all duration-300"
              style={{
                borderColor: theme.secondaryColor,
                backgroundColor:
                  theme.mode === "dark"
                    ? `${theme.secondaryColor}10`
                    : "rgba(255,255,255,0.5)",
              }}
            >
              <div
                className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <CompareArrowsIcon className="text-white" sx={{ fontSize: { xs: 24, md: 30 } }} />
              </div>
              <h3 className="text-lg md:text-2xl font-bold mb-2 md:mb-4">
                {translations.landing.new.features.comparisons.title}
              </h3>
              <p className="opacity-80 mb-3 md:mb-4 text-sm md:text-base">
                {translations.landing.new.features.comparisons.description}
              </p>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm opacity-70">
                {translations.landing.new.features.comparisons.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Feature 4 - Investment Tracking */}
            <div
              className="group p-5 md:p-8 rounded-2xl border border-opacity-20 hover:shadow-xl transition-all duration-300"
              style={{
                borderColor: theme.secondaryColor,
                backgroundColor:
                  theme.mode === "dark"
                    ? `${theme.secondaryColor}10`
                    : "rgba(255,255,255,0.5)",
              }}
            >
              <div
                className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <TrendingUpIcon className="text-white" sx={{ fontSize: { xs: 24, md: 30 } }} />
              </div>
              <h3 className="text-lg md:text-2xl font-bold mb-2 md:mb-4">{translations.landing.new.features.investment.title}</h3>
              <p className="opacity-80 mb-3 md:mb-4 text-sm md:text-base">
                {translations.landing.new.features.investment.description}
              </p>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm opacity-70">
                {translations.landing.new.features.investment.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Feature 5 - Free Forever */}
            <div
              className="group p-5 md:p-8 rounded-2xl border border-opacity-20 hover:shadow-xl transition-all duration-300"
              style={{
                borderColor: theme.secondaryColor,
                backgroundColor:
                  theme.mode === "dark"
                    ? `${theme.secondaryColor}10`
                    : "rgba(255,255,255,0.5)",
              }}
            >
              <div
                className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <PaidIcon className="text-white" sx={{ fontSize: { xs: 24, md: 30 } }} />
              </div>
              <h3 className="text-lg md:text-2xl font-bold mb-2 md:mb-4">{translations.landing.new.features.free.title}</h3>
              <p className="opacity-80 mb-3 md:mb-4 text-sm md:text-base">
                {translations.landing.new.features.free.description}
              </p>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm opacity-70">
                {translations.landing.new.features.free.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Feature 6 - Security */}
            <div
              className="group p-5 md:p-8 rounded-2xl border border-opacity-20 hover:shadow-xl transition-all duration-300"
              style={{
                borderColor: theme.secondaryColor,
                backgroundColor:
                  theme.mode === "dark"
                    ? `${theme.secondaryColor}10`
                    : "rgba(255,255,255,0.5)",
              }}
            >
              <div
                className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <VisibilityOffIcon className="text-white" sx={{ fontSize: { xs: 24, md: 30 } }} />
              </div>
              <h3 className="text-lg md:text-2xl font-bold mb-2 md:mb-4">{translations.landing.new.features.security.title}</h3>
              <p className="opacity-80 mb-3 md:mb-4 text-sm md:text-base">
                {translations.landing.new.features.security.description}
              </p>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm opacity-70">
                {translations.landing.new.features.security.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Feature 7 - Multi-Currency Support */}
            <div
              className="group p-5 md:p-8 rounded-2xl border border-opacity-20 hover:shadow-xl transition-all duration-300 sm:col-span-2 lg:col-span-3"
              style={{
                borderColor: theme.secondaryColor,
                backgroundColor:
                  theme.mode === "dark"
                    ? `${theme.secondaryColor}10`
                    : "rgba(255,255,255,0.5)",
              }}
            >
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                <div
                  className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: theme.secondaryColor }}
                >
                  <CurrencyExchangeIcon className="text-white" sx={{ fontSize: { xs: 24, md: 30 } }} />
                </div>
                <div className="text-center md:text-left flex-1">
                  <h3 className="text-lg md:text-2xl font-bold mb-1.5 md:mb-2">{translations.landing.new.features.currencies.title}</h3>
                  <p className="opacity-80 mb-2 md:mb-3 text-sm md:text-base">
                    {translations.landing.new.features.currencies.description}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {translations.landing.new.features.currencies.features.map((currency, index) => (
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
                      {translations.landing.new.features.currencies.liveRates}
                    </span>
                    <span className="text-xs opacity-60 flex items-center gap-1">
                      <CheckCircleIcon style={{ color: theme.secondaryColor }} sx={{ fontSize: 14 }} />
                      {translations.landing.new.features.currencies.autoConversion}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 8 - CSV/Excel Import */}
            <div
              className="group p-5 md:p-8 rounded-2xl border border-opacity-20 hover:shadow-xl transition-all duration-300 sm:col-span-2 lg:col-span-3"
              style={{
                borderColor: theme.secondaryColor,
                backgroundColor:
                  theme.mode === "dark"
                    ? `${theme.secondaryColor}10`
                    : "rgba(255,255,255,0.5)",
              }}
            >
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                <div
                  className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: theme.secondaryColor }}
                >
                  <UploadFileIcon className="text-white" sx={{ fontSize: { xs: 24, md: 30 } }} />
                </div>
                <div className="text-center md:text-left flex-1">
                  <h3 className="text-lg md:text-2xl font-bold mb-1.5 md:mb-2">{translations.landing.new.features.import.title}</h3>
                  <p className="opacity-80 mb-2 md:mb-3 text-sm md:text-base">
                    {translations.landing.new.features.import.description}
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    {translations.landing.new.features.import.features.map((feature, index) => (
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

      {/* CTA Section */}
      <section
        className="py-12 md:py-20 px-4"
        style={{ backgroundColor: theme.backgroundColor }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 md:mb-6">
            {translations.landing.new.cta.title}{" "}
            <span style={{ color: theme.secondaryColor }}>
              {translations.landing.new.cta.subtitle}
            </span>
            ?
          </h2>
          <p className="text-base md:text-xl opacity-80 mb-6 md:mb-8 max-w-2xl mx-auto">
            {translations.landing.new.cta.description}
          </p>

          <div className="space-y-3 md:space-y-4">
            <button
              onClick={handleGetStarted}
              className="px-8 md:px-12 py-3 md:py-4 rounded-xl text-white font-semibold text-lg md:text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              style={{ backgroundColor: theme.secondaryColor }}
              data-umami-event="cta-get-started"
            >
              {translations.landing.new.cta.button}
            </button>

            <p className="text-xs md:text-sm opacity-60">
              {translations.landing.new.cta.disclaimer}
            </p>
          </div>

          {/* Trust Signals */}
          <div className="mt-8 md:mt-12 grid grid-cols-3 gap-4 md:gap-8 opacity-70">
            <div className="text-center">
              <div
                className="text-xl md:text-3xl font-bold"
                style={{ color: theme.secondaryColor }}
              >
                480-bit
              </div>
              <div className="text-xs md:text-sm">{translations.landing.new.trust.encryption}</div>
            </div>
            <div className="text-center">
              <div
                className="text-xl md:text-3xl font-bold"
                style={{ color: theme.secondaryColor }}
              >
                0%
              </div>
              <div className="text-xs md:text-sm">{translations.landing.new.trust.dataCollection}</div>
            </div>
            <div className="text-center">
              <div
                className="text-xl md:text-3xl font-bold"
                style={{ color: theme.secondaryColor }}
              >
                100%
              </div>
              <div className="text-xs md:text-sm">{translations.landing.new.trust.freeForever}</div>
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
            {translations.landing.new.donation.title}
          </h3>
          <p className="opacity-80 mb-4 md:mb-6 text-sm md:text-base">
            {translations.landing.new.donation.description}
          </p>
          <Suspense fallback={<div></div>}>
            <BuyMeACoffeeWidget showLink={true} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
