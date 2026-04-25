import { useEffect } from 'react';

/**
 * Hook per aggiornare dinamicamente l'attributo lang dell'elemento HTML
 * Questo aiuta i motori di ricerca e i browser a riconoscere la lingua attiva
 */
export const useHTMLLang = (language) => {
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (htmlElement) {
      htmlElement.lang = language === 'it' ? 'it' : 'en';
      
      // Aggiorna anche l'attributo dir per lingue RTL (futuro supporto)
      htmlElement.dir = 'ltr';
      
      // Meta tag per Content-Language (backup per browser vecchi)
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