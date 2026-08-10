
import React from 'react';
import { Helmet } from 'react-helmet';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../i18n/languagesConfig';

const OG_LOCALE_MAP: Record<string, string> = {
  it: 'it_IT',
  en: 'en_US',
  es: 'es_ES',
  de: 'de_DE',
  fr: 'fr_FR',
  'pt-BR': 'pt_BR',
};

const GEO_REGION_MAP: Record<string, string> = {
  it: 'IT',
  en: 'US',
  es: 'ES',
  de: 'DE',
  fr: 'FR',
  'pt-BR': 'BR',
};

const DEFAULT_FEATURE_LIST = [
  "Multi-platform account aggregation",
  "Anonymous expense comparison",
  "Privacy-first data management",
  "Real-time financial analytics",
  "Investment portfolio tracking"
];

interface HreflangLink {
  lang: string;
  url: string;
}

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  noindex?: boolean;
  language?: string;
  alternateLanguages?: HreflangLink[];
  featureList?: string[];
  license?: string;
}

const SEOHead = ({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  twitterCard = "summary_large_image",
  noindex = false,
  language = DEFAULT_LANGUAGE, // Current page language
  alternateLanguages = [], // Array of {lang, url} for hreflang, overrides the default below
  featureList = DEFAULT_FEATURE_LIST,
  license
}: SEOHeadProps) => {
  const siteUrl = "https://pacifinance.com";
  const defaultImage = `${siteUrl}/PacifinanceLogoPNG3NoBg.webp`;

  // Automatically generate hreflang for every supported language unless overridden
  const hreflangLinks: HreflangLink[] = alternateLanguages.length > 0
    ? alternateLanguages
    : [
        ...SUPPORTED_LANGUAGES.map(({ code }) => ({ lang: code, url: `${siteUrl}/${code}${canonical || '/'}` })),
        { lang: 'x-default', url: `${siteUrl}/${DEFAULT_LANGUAGE}${canonical || '/'}` }
      ];

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonical && <link rel="canonical" href={`${siteUrl}/${language}${canonical}`} />}

      {/* Hreflang for multilingual SEO */}
      {hreflangLinks.map((link) => (
        <link
          key={link.lang}
          rel="alternate"
          hrefLang={link.lang}
          href={link.url}
        />
      ))}

      {/* Robots */}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />

      {/* Open Graph */}
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImage || defaultImage} />
      <meta property="og:url" content={ogUrl || `${siteUrl}/${language}${canonical || ''}`} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Pacifinance" />
      <meta property="og:locale" content={OG_LOCALE_MAP[language] || OG_LOCALE_MAP[DEFAULT_LANGUAGE]} />
      {SUPPORTED_LANGUAGES.filter(({ code }) => code !== language).map(({ code }) => (
        <meta key={code} property="og:locale:alternate" content={OG_LOCALE_MAP[code]} />
      ))}

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitle || title} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={ogImage || defaultImage} />

      {/* Additional SEO */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content={language} />
      <meta name="language" content={language} />
      <meta name="author" content="Pacifinance" />
      <meta name="geo.region" content={GEO_REGION_MAP[language] || GEO_REGION_MAP[DEFAULT_LANGUAGE]} />

      {/* Schema.org structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Pacifinance",
          "description": description,
          "url": `${siteUrl}/${language}${canonical || '/'}`,
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Web Browser",
          "inLanguage": SUPPORTED_LANGUAGES.map(({ code }) => code),
          ...(license ? { license } : {}),
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR"
          },
          "featureList": featureList
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;
