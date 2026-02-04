
import React from 'react';
import { Helmet } from 'react-helmet';

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
  language = 'en', // Lingua corrente della pagina
  alternateLanguages = [] // Array di {lang, url} per hreflang
}) => {
  const siteUrl = "https://pacifinance.com";
  const defaultImage = `${siteUrl}/PacifinanceLogoPNG3NoBg.webp`;
  
  // Genera automaticamente hreflang se non fornito
  const hreflangLinks = alternateLanguages.length > 0 
    ? alternateLanguages
    : [
        { lang: 'it', url: `${siteUrl}/it${canonical || '/'}` },
        { lang: 'en', url: `${siteUrl}/en${canonical || '/'}` },
        { lang: 'x-default', url: `${siteUrl}/en${canonical || '/'}` }
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
      <meta property="og:site_name" content="PaciFinance" />
      <meta property="og:locale" content={language === 'it' ? 'it_IT' : 'en_US'} />
      <meta property="og:locale:alternate" content={language === 'it' ? 'en_US' : 'it_IT'} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitle || title} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={ogImage || defaultImage} />
      
      {/* Additional SEO */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content={language} />
      <meta name="language" content={language} />
      <meta name="author" content="PaciFinance" />
      <meta name="geo.region" content={language === 'it' ? 'IT' : 'US'} />
      
      {/* Schema.org structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "PaciFinance",
          "description": description,
          "url": `${siteUrl}/${language}${canonical || '/'}`,
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Web Browser",
          "inLanguage": [language, ...(language === 'it' ? ['en'] : ['it'])],
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR"
          },
          "featureList": [
            "Multi-platform account aggregation",
            "Anonymous expense comparison",
            "Privacy-first data management",
            "Real-time financial analytics",
            "Investment portfolio tracking"
          ]
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;
