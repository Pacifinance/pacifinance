import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ShieldIcon from "@mui/icons-material/Shield";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import PaidIcon from "@mui/icons-material/Paid";
import StarIcon from "@mui/icons-material/Star";
import LandingPageImage from "../assets/LandingPage/PacifinanceArt2NoBg.webp";
import Logo from "../assets/Brand/PacifinanceLogoPNG3NoBg.webp";
import ConsentBanner from "../components/ConsentBanner";
import BuyMeACoffeeWidget from "../components/BuyMeACoffeeWidget";
import { LanguageContext } from "../contexts/LanguageContext";
import languages from "../data/languages.json";

export default function NewLandingContent({ theme }) {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

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
      <ConsentBanner />

      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center px-4 py-20"
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

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Logo */}
            {/* <div className="flex justify-center lg:justify-start mb-6">
              <img src={Logo} alt="PaciFinance Logo" className="h-16 w-auto" />
            </div> */}

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span style={{ color: theme.secondaryColor }}>
                  {languages[language].landing.new.hero.title}
                </span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                  {languages[language].landing.new.hero.subtitle}
                </span>
              </h1>

              <p className="text-xl md:text-2xl opacity-80 max-w-2xl">
                {languages[language].landing.new.hero.description}
              </p>
            </div>

            {/* Key Benefits */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <div
                className="flex items-center space-x-2 px-4 py-2 rounded-full"
                style={{ backgroundColor: `${theme.secondaryColor}20` }}
              >
                <CheckCircleIcon
                  style={{ color: theme.secondaryColor }}
                  fontSize="small"
                />
                <span className="text-sm font-medium">{languages[language].landing.new.benefits.freeForever}</span>
              </div>
              <div
                className="flex items-center space-x-2 px-4 py-2 rounded-full"
                style={{ backgroundColor: `${theme.secondaryColor}20` }}
              >
                <LockIcon
                  style={{ color: theme.secondaryColor }}
                  fontSize="small"
                />
                <span className="text-sm font-medium">{languages[language].landing.new.benefits.privacyFirst}</span>
              </div>
              <div
                className="flex items-center space-x-2 px-4 py-2 rounded-full"
                style={{ backgroundColor: `${theme.secondaryColor}20` }}
              >
                <AnalyticsIcon
                  style={{ color: theme.secondaryColor }}
                  fontSize="small"
                />
                <span className="text-sm font-medium">{languages[language].landing.new.benefits.smartAnalytics}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 rounded-lg text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                style={{ backgroundColor: theme.secondaryColor }}
                data-umami-event="hero-get-started"
              >
                {languages[language].landing.new.hero.getStarted}
              </button>
              <button
                onClick={handleLearnMore}
                className="px-8 py-4 rounded-lg font-semibold text-lg border-2 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                style={{
                  borderColor: theme.secondaryColor,
                  color: theme.secondaryColor,
                  backgroundColor: "transparent",
                }}
                data-umami-event="hero-learn-more"
              >
                {languages[language].landing.new.hero.learnMore}
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center space-x-4 justify-center lg:justify-start opacity-70">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    style={{ color: "#FFD700" }}
                    fontSize="small"
                  />
                ))}
              </div>
              <span className="text-sm">
                {languages[language].landing.new.hero.socialProof}
              </span>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <img
                src={LandingPageImage}
                alt="PaciFinance Dashboard Preview"
                className="max-w-full h-auto rounded-2xl shadow-2xl"
                style={{ maxHeight: "600px" }}
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
              />
              {/* Floating Elements */}
              <div
                className="absolute -top-4 -right-4 w-8 h-8 rounded-full animate-bounce"
                style={{ backgroundColor: theme.secondaryColor }}
              ></div>
              <div
                className="absolute -bottom-4 -left-4 w-6 h-6 rounded-full animate-pulse"
                style={{ backgroundColor: theme.secondaryColor, opacity: 0.7 }}
              ></div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
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
        className="py-20 px-4"
        style={{ backgroundColor: theme.primaryColor }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {languages[language].landing.new.features.title.split('PaciFinance')[0]}
              <span style={{ color: theme.secondaryColor }}>PaciFinance</span>
              {languages[language].landing.new.features.title.split('PaciFinance')[1] || '?'}
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              {languages[language].landing.new.features.subtitle}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - Privacy */}
            <div
              className="group p-8 rounded-2xl border border-opacity-20 hover:shadow-xl transition-all duration-300"
              style={{
                borderColor: theme.secondaryColor,
                backgroundColor:
                  theme.mode === "dark"
                    ? `${theme.secondaryColor}10`
                    : "rgba(255,255,255,0.5)",
              }}
            >
              <div
                className="flex items-center justify-center w-16 h-16 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <ShieldIcon className="text-white" fontSize="large" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{languages[language].landing.new.features.privacy.title}</h3>
              <p className="opacity-80 mb-4">
                {languages[language].landing.new.features.privacy.description}
              </p>
              <ul className="space-y-2 text-sm opacity-70">
                {languages[language].landing.new.features.privacy.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Feature 2 - Analytics */}
            <div
              className="group p-8 rounded-2xl border border-opacity-20 hover:shadow-xl transition-all duration-300"
              style={{
                borderColor: theme.secondaryColor,
                backgroundColor:
                  theme.mode === "dark"
                    ? `${theme.secondaryColor}10`
                    : "rgba(255,255,255,0.5)",
              }}
            >
              <div
                className="flex items-center justify-center w-16 h-16 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <AnalyticsIcon className="text-white" fontSize="large" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{languages[language].landing.new.features.analytics.title}</h3>
              <p className="opacity-80 mb-4">
                {languages[language].landing.new.features.analytics.description}
              </p>
              <ul className="space-y-2 text-sm opacity-70">
                {languages[language].landing.new.features.analytics.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Feature 3 - Comparisons */}
            <div
              className="group p-8 rounded-2xl border border-opacity-20 hover:shadow-xl transition-all duration-300"
              style={{
                borderColor: theme.secondaryColor,
                backgroundColor:
                  theme.mode === "dark"
                    ? `${theme.secondaryColor}10`
                    : "rgba(255,255,255,0.5)",
              }}
            >
              <div
                className="flex items-center justify-center w-16 h-16 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <CompareArrowsIcon className="text-white" fontSize="large" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                {languages[language].landing.new.features.comparisons.title}
              </h3>
              <p className="opacity-80 mb-4">
                {languages[language].landing.new.features.comparisons.description}
              </p>
              <ul className="space-y-2 text-sm opacity-70">
                {languages[language].landing.new.features.comparisons.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Feature 4 - Investment Tracking */}
            <div
              className="group p-8 rounded-2xl border border-opacity-20 hover:shadow-xl transition-all duration-300"
              style={{
                borderColor: theme.secondaryColor,
                backgroundColor:
                  theme.mode === "dark"
                    ? `${theme.secondaryColor}10`
                    : "rgba(255,255,255,0.5)",
              }}
            >
              <div
                className="flex items-center justify-center w-16 h-16 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <TrendingUpIcon className="text-white" fontSize="large" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{languages[language].landing.new.features.investment.title}</h3>
              <p className="opacity-80 mb-4">
                {languages[language].landing.new.features.investment.description}
              </p>
              <ul className="space-y-2 text-sm opacity-70">
                {languages[language].landing.new.features.investment.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Feature 5 - Free Forever */}
            <div
              className="group p-8 rounded-2xl border border-opacity-20 hover:shadow-xl transition-all duration-300"
              style={{
                borderColor: theme.secondaryColor,
                backgroundColor:
                  theme.mode === "dark"
                    ? `${theme.secondaryColor}10`
                    : "rgba(255,255,255,0.5)",
              }}
            >
              <div
                className="flex items-center justify-center w-16 h-16 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <PaidIcon className="text-white" fontSize="large" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{languages[language].landing.new.features.free.title}</h3>
              <p className="opacity-80 mb-4">
                {languages[language].landing.new.features.free.description}
              </p>
              <ul className="space-y-2 text-sm opacity-70">
                {languages[language].landing.new.features.free.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Feature 6 - Security */}
            <div
              className="group p-8 rounded-2xl border border-opacity-20 hover:shadow-xl transition-all duration-300"
              style={{
                borderColor: theme.secondaryColor,
                backgroundColor:
                  theme.mode === "dark"
                    ? `${theme.secondaryColor}10`
                    : "rgba(255,255,255,0.5)",
              }}
            >
              <div
                className="flex items-center justify-center w-16 h-16 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <VisibilityOffIcon className="text-white" fontSize="large" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{languages[language].landing.new.features.security.title}</h3>
              <p className="opacity-80 mb-4">
                {languages[language].landing.new.features.security.description}
              </p>
              <ul className="space-y-2 text-sm opacity-70">
                {languages[language].landing.new.features.security.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20 px-4"
        style={{ backgroundColor: theme.backgroundColor }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {languages[language].landing.new.cta.title}{" "}
            <span style={{ color: theme.secondaryColor }}>
              {languages[language].landing.new.cta.subtitle}
            </span>
            ?
          </h2>
          <p className="text-xl opacity-80 mb-8 max-w-2xl mx-auto">
            {languages[language].landing.new.cta.description}
          </p>

          <div className="space-y-4">
            <button
              onClick={handleGetStarted}
              className="px-12 py-4 rounded-lg text-white font-semibold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              style={{ backgroundColor: theme.secondaryColor }}
              data-umami-event="cta-get-started"
            >
              {languages[language].landing.new.cta.button}
            </button>

            <p className="text-sm opacity-60">
              {languages[language].landing.new.cta.disclaimer}
            </p>
          </div>

          {/* Trust Signals */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 opacity-70">
            <div className="text-center">
              <div
                className="text-3xl font-bold"
                style={{ color: theme.secondaryColor }}
              >
                256-bit
              </div>
              <div className="text-sm">{languages[language].landing.new.trust.encryption}</div>
            </div>
            <div className="text-center">
              <div
                className="text-3xl font-bold"
                style={{ color: theme.secondaryColor }}
              >
                0%
              </div>
              <div className="text-sm">{languages[language].landing.new.trust.dataCollection}</div>
            </div>
            <div className="text-center">
              <div
                className="text-3xl font-bold"
                style={{ color: theme.secondaryColor }}
              >
                100%
              </div>
              <div className="text-sm">{languages[language].landing.new.trust.freeForever}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Support Section */}
      <section
        className="py-16 px-4"
        style={{ backgroundColor: theme.primaryColor }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">
            {languages[language].landing.new.donation.title}
          </h3>
          <p className="opacity-80 mb-6">
            {languages[language].landing.new.donation.description}
          </p>
          <BuyMeACoffeeWidget showLink={true} />
        </div>
      </section>
    </div>
  );
}
