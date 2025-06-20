import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import { LanguageContext } from "../contexts/LanguageContext";
import { Header } from "../sections/LandingHeader";
import LandingFooter from "../components/LandingFooter";

export default function SitemapPage() {
  const { theme, toggleMode } = useContext(ThemeContext);
  const { language, toggleLanguage } = useContext(LanguageContext);
  const { mode } = theme;

  const pages = [
    { path: "/", name: language === "it" ? "Home" : "Home" },
    { path: "/dashboard", name: language === "it" ? "Dashboard" : "Dashboard" },
    { path: "/faq", name: "FAQ" },
    { path: "/pricing", name: language === "it" ? "Prezzi" : "Pricing" },
    { path: "/privacy-policy", name: "Privacy Policy" },
    {
      path: "/terms-of-service",
      name: language === "it" ? "Termini di Servizio" : "Terms of Service",
    },
    { path: "/cookie-policy", name: "Cookie Policy" },
    { path: "/disclaimer", name: "Disclaimer" },
    {
      path: "/sitemap",
      name: language === "it" ? "Mappa del Sito" : "Sitemap",
    },
  ];

  return (
    <>
      <title>Sitemap - PaciFinance</title>
      <meta
        name="description"
        content="Sitemap for PaciFinance - Navigate through all pages of our privacy-focused personal finance platform."
      />

      <div className="w-full flex overflow-auto min-h-screen items-center flex-col">
        <Header
          theme={theme}
          mode={mode}
          toggleMode={toggleMode}
          toggleLanguage={toggleLanguage}
        />

        <main
          className="flex-1 w-full max-w-4xl mx-auto px-4 py-12"
          style={{ color: theme.textColor }}
        >
          <h1
            className="text-4xl font-bold mb-8 text-center"
            style={{ color: theme.secondaryColor }}
          >
            {language === "it" ? "Mappa del Sito" : "Sitemap"}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pages.map((page, index) => (
              <Link
                key={index}
                to={page.path}
                className="block p-4 rounded-lg border hover:opacity-80 transition-opacity"
                style={{
                  borderColor: theme.borderColor,
                  backgroundColor: theme.primaryColor,
                }}
              >
                <h3
                  className="font-semibold"
                  style={{ color: theme.secondaryColor }}
                >
                  {page.name}
                </h3>
                <p className="text-sm opacity-60">{page.path}</p>
              </Link>
            ))}
          </div>
        </main>

        <LandingFooter theme={theme} />
      </div>
    </>
  );
}
