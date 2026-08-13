#!/usr/bin/env node
/**
 * generateSitemap.js — Generates public/sitemap.xml from PUBLIC_ROUTES below.
 *
 * Usage:
 *   node scripts/generateSitemap.js
 *   npm run sitemap
 *
 * Runs automatically before every build (see "prebuild" in package.json),
 * so the sitemap can't silently drift from the real route list the way the
 * old hand-maintained public/sitemap.xml did (it listed auth-gated routes
 * like /dashboard and /comparison, which a crawler can never actually reach,
 * while missing real public pages added since; its <lastmod> was also frozen
 * at a single date instead of reflecting an actual build).
 *
 * PUBLIC_ROUTES must mirror the un-gated (no <ProtectedRoute>/<AdminRoute>)
 * routes in src/AppRouter.tsx exactly — when adding a new public page there,
 * add it here too.
 */

const { writeFileSync } = require('fs');
const { join } = require('path');

const ROOT = join(__dirname, '..');
const BASE_URL = 'https://pacifinance.com';

// Every language src/i18n/languagesConfig.js supports (URL `code`).
const LANGUAGES = ['it', 'en', 'es', 'de', 'fr', 'pt-BR'];
const DEFAULT_LANGUAGE = 'en';

// Mirrors the un-gated routes in src/AppRouter.tsx's LanguageRoutes.
const PUBLIC_ROUTES = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/auth', priority: '0.5', changefreq: 'monthly' },
    { path: '/faq', priority: '0.7', changefreq: 'monthly' },
    { path: '/pricing', priority: '0.8', changefreq: 'monthly' },
    { path: '/roadmap', priority: '0.7', changefreq: 'weekly' },
    { path: '/contribute', priority: '0.6', changefreq: 'monthly' },
    { path: '/privacy-policy', priority: '0.4', changefreq: 'yearly' },
    { path: '/terms-of-service', priority: '0.4', changefreq: 'yearly' },
    { path: '/cookie-policy', priority: '0.4', changefreq: 'yearly' },
    { path: '/disclaimer', priority: '0.4', changefreq: 'yearly' },
    { path: '/sitemap', priority: '0.3', changefreq: 'monthly' },
];

function generateSitemap() {
    const today = new Date().toISOString().split('T')[0];

    const urlEntries = PUBLIC_ROUTES.flatMap((route) =>
        LANGUAGES.map((lang) => {
            const loc = `${BASE_URL}/${lang}${route.path}`;
            const alternates = LANGUAGES
                .map((altLang) => `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${BASE_URL}/${altLang}${route.path}"/>`)
                .join('\n');
            const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/${DEFAULT_LANGUAGE}${route.path}"/>`;

            return [
                '  <url>',
                `    <loc>${loc}</loc>`,
                alternates,
                xDefault,
                `    <lastmod>${today}</lastmod>`,
                `    <changefreq>${route.changefreq}</changefreq>`,
                `    <priority>${route.priority}</priority>`,
                '  </url>',
            ].join('\n');
        }),
    );

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
        ...urlEntries,
        '</urlset>',
        '',
    ].join('\n');
}

writeFileSync(join(ROOT, 'public', 'sitemap.xml'), generateSitemap());
console.log(`sitemap.xml regenerated: ${PUBLIC_ROUTES.length} routes x ${LANGUAGES.length} languages = ${PUBLIC_ROUTES.length * LANGUAGES.length} URLs`);
