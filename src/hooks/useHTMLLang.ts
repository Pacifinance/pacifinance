import { useEffect } from 'react';

/**
 * Hook to dynamically update the HTML element's lang attribute.
 * Helps search engines and browsers recognize the active language.
 */
export const useHTMLLang = (language) => {
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (htmlElement) {
      htmlElement.lang = language === 'it' ? 'it' : 'en';

      // Also update the dir attribute for RTL languages (future support)
      htmlElement.dir = 'ltr';

      // Content-Language meta tag (fallback for older browsers)
      let contentLangMeta = document.querySelector('meta[http-equiv="Content-Language"]');
      if (!contentLangMeta) {
        contentLangMeta = document.createElement('meta');
        contentLangMeta.httpEquiv = 'Content-Language';
        document.head.appendChild(contentLangMeta);
      }
      contentLangMeta.content = language === 'it' ? 'it' : 'en';
    }
  }, [language]);
};