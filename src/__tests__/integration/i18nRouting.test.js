/**
 * Integration tests for URL-based i18n routing
 * Verifies that all main routes work with language prefixes
 */

import { describe, it, expect } from 'vitest';
import {
  getLanguageFromPath, 
  removeLanguageFromPath,
  getLocalizedPath,
  isValidLanguage
} from '../../utils/i18nRouting';

describe('URL-based i18n - Route Integration', () => {
  const mainRoutes = [
    '/dashboard',
    '/charts-statistics',
    '/insert-values',
    '/comparison',
    '/profile',
    '/goals-limits',
    '/settings',
    '/auth',
    '/faq',
    '/pricing',
    '/contact',
    '/sitemap',
    '/privacy-policy',
    '/terms-of-service',
    '/cookie-policy',
    '/disclaimer'
  ];

  const languages = ['it', 'en'];

  describe('Main routes with language prefixes', () => {
    languages.forEach(lang => {
      mainRoutes.forEach(route => {
        it(`should handle ${route} with ${lang} prefix`, () => {
          const localizedPath = getLocalizedPath(route, lang);
          expect(localizedPath).toBe(`/${lang}${route}`);
          expect(getLanguageFromPath(localizedPath)).toBe(lang);
        });
      });
    });
  });

  describe('Routes with query strings', () => {
    const routesWithQuery = [
      '/insert-values?section=balance',
      '/insert-values?section=income',
      '/insert-values?section=outflow',
      '/dashboard?tab=overview',
      '/profile?edit=true'
    ];

    languages.forEach(lang => {
      routesWithQuery.forEach(route => {
        it(`should preserve query string for ${route} with ${lang}`, () => {
          const localizedPath = getLocalizedPath(route, lang);
          const [path, query] = route.split('?');
          expect(localizedPath).toContain(query);
          expect(localizedPath).toMatch(new RegExp(`^/${lang}${path}\\?${query}$`));
        });
      });
    });
  });

  describe('Routes with hashes', () => {
    const routesWithHash = [
      '/profile#settings',
      '/profile#security',
      '/faq#payments',
      '/dashboard#balance'
    ];

    languages.forEach(lang => {
      routesWithHash.forEach(route => {
        it(`should preserve hash for ${route} with ${lang}`, () => {
          const localizedPath = getLocalizedPath(route, lang);
          const [path, hash] = route.split('#');
          expect(localizedPath).toContain(`#${hash}`);
          expect(localizedPath).toMatch(new RegExp(`^/${lang}${path}#${hash}$`));
        });
      });
    });
  });

  describe('Complex routes', () => {
    it('should handle route with both query and hash', () => {
      const route = '/dashboard?tab=overview#section';
      const localizedIt = getLocalizedPath(route, 'it');
      const localizedEn = getLocalizedPath(route, 'en');
      
      expect(localizedIt).toBe('/it/dashboard?tab=overview#section');
      expect(localizedEn).toBe('/en/dashboard?tab=overview#section');
    });

    it('should handle multiple query parameters', () => {
      const route = '/insert-values?section=balance&amount=1000&currency=EUR';
      const localized = getLocalizedPath(route, 'it');
      
      expect(localized).toBe('/it/insert-values?section=balance&amount=1000&currency=EUR');
    });

    it('should handle URL encoding in query strings', () => {
      const route = '/search?q=personal%20finance';
      const localized = getLocalizedPath(route, 'en');
      
      expect(localized).toBe('/en/search?q=personal%20finance');
    });
  });

  describe('Edge cases', () => {
    it('should handle root path for each language', () => {
      expect(getLocalizedPath('/', 'it')).toBe('/it');
      expect(getLocalizedPath('/', 'en')).toBe('/en');
    });

    it('should handle empty string', () => {
      expect(getLocalizedPath('', 'it')).toBe('/it');
      expect(getLocalizedPath('', 'en')).toBe('/en');
    });

    it('should remove existing language before adding new one', () => {
      const path = '/it/dashboard';
      const localized = getLocalizedPath(removeLanguageFromPath(path), 'en');
      expect(localized).toBe('/en/dashboard');
    });

    it('should not add language prefix to already localized paths', () => {
      const path = '/it/dashboard';
      const cleaned = removeLanguageFromPath(path);
      expect(cleaned).toBe('/dashboard');
      
      const relocalized = getLocalizedPath(cleaned, 'en');
      expect(relocalized).toBe('/en/dashboard');
    });
  });

  describe('Invalid language codes', () => {
    it('should handle invalid language gracefully', () => {
      const path = '/fr/dashboard'; // French not supported
      const lang = getLanguageFromPath(path);
      expect(lang).toBeNull();
    });

    it('should validate language codes', () => {
      expect(isValidLanguage('it')).toBe(true);
      expect(isValidLanguage('en')).toBe(true);
      expect(isValidLanguage('fr')).toBe(false);
      expect(isValidLanguage('de')).toBe(false);
      expect(isValidLanguage('')).toBe(false);
      expect(isValidLanguage(null)).toBe(false);
    });
  });
});
