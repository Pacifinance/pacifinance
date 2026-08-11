/**
 * Sitemap Generator for Multilingual URLs
 * Generates dynamic sitemap.xml with proper hreflang alternate links
 */

export const availableLanguages = ['it', 'en'];

// All application routes (without language prefix)
export const appRoutes = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/dashboard', priority: '1.0', changefreq: 'daily', requiresAuth: true },
  { path: '/comparison', priority: '0.9', changefreq: 'weekly', requiresAuth: true },
  { path: '/insert', priority: '0.9', changefreq: 'weekly', requiresAuth: true },
  { path: '/profile', priority: '0.8', changefreq: 'weekly', requiresAuth: true },
  { path: '/goals-and-limits', priority: '0.8', changefreq: 'weekly', requiresAuth: true },
  { path: '/stats-and-charts', priority: '0.8', changefreq: 'weekly', requiresAuth: true },
  { path: '/settings', priority: '0.7', changefreq: 'monthly', requiresAuth: true },
  
  // Public pages
  { path: '/info', priority: '0.7', changefreq: 'monthly' },
  { path: '/knowledge', priority: '0.8', changefreq: 'weekly' },
  { path: '/pricing', priority: '0.9', changefreq: 'monthly' },
  { path: '/faq', priority: '0.7', changefreq: 'monthly' },
  { path: '/tips-and-updates', priority: '0.7', changefreq: 'weekly' },
  
  // Legal pages
  { path: '/privacy-policy', priority: '0.4', changefreq: 'yearly' },
  { path: '/cookie-policy', priority: '0.4', changefreq: 'yearly' },
  { path: '/terms-of-service', priority: '0.4', changefreq: 'yearly' },
  { path: '/disclaimer', priority: '0.4', changefreq: 'yearly' },
  { path: '/sitemap-page', priority: '0.3', changefreq: 'monthly' }
];

/**
 * Generates a complete XML sitemap string
 * @param {boolean} includeAuthPages - Include pages that require authentication
 * @returns {string} XML sitemap
 */
export function generateSitemap(includeAuthPages = false) {
  const baseUrl = 'https://pacifinance.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const routes = includeAuthPages 
    ? appRoutes 
    : appRoutes.filter(route => !route.requiresAuth);
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
  
  routes.forEach(route => {
    availableLanguages.forEach(lang => {
      const localizedUrl = `${baseUrl}/${lang}${route.path}`;
      
      xml += '  <url>\n';
      xml += `    <loc>${localizedUrl}</loc>\n`;
      
      // Add hreflang alternate links
      availableLanguages.forEach(altLang => {
        const altUrl = `${baseUrl}/${altLang}${route.path}`;
        xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altUrl}"/>\n`;
      });
      
      // Add x-default pointing to English
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/en${route.path}"/>\n`;
      
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += '  </url>\n';
    });
  });
  
  xml += '</urlset>';
  
  return xml;
}

/**
 * Generates a sitemap index for large sites (future use)
 * @returns {string} XML sitemap index
 */
export function generateSitemapIndex() {
  const baseUrl = 'https://pacifinance.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  availableLanguages.forEach(lang => {
    xml += '  <sitemap>\n';
    xml += `    <loc>${baseUrl}/sitemap-${lang}.xml</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += '  </sitemap>\n';
  });
  
  xml += '</sitemapindex>';
  
  return xml;
}

/**
 * Get all localized URLs for a specific path
 * @param {string} path - Base path without language prefix
 * @returns {Array<{lang: string, url: string}>}
 */
export function getLocalizedUrls(path) {
  const baseUrl = 'https://pacifinance.com';
  
  return availableLanguages.map(lang => ({
    lang,
    url: `${baseUrl}/${lang}${path}`
  }));
}
