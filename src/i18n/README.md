# Struttura i18n di PaciFinance

## 📁 Struttura

```
src/i18n/
├── index.js                # Export principale
├── locales/
│   ├── it.json            # Traduzioni italiane
│   └── en.json            # Traduzioni inglesi
└── extract-languages.js   # Script per estrarre le lingue dal vecchio formato
```

## 🚀 Come completare la migrazione

### Passo 1: Estrarre i file lingua

Esegui da terminale:

```bash
cd /workspaces/Pacifinance/src/i18n
node extract-languages.js
```

Questo creerà automaticamente `it.json` e `en.json` nella cartella `locales/`.

### Passo 2: Aggiornare LanguageContext

Il file `src/contexts/LanguageContext.jsx` deve essere aggiornato per usare la nuova struttura:

```jsx
import React, { useState, createContext, useEffect } from 'react';
import { getTranslations } from '../i18n';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        const savedLanguage = localStorage.getItem('pacifinance-language');
        return savedLanguage || 'en';
    });

    // Carica le traduzioni per la lingua corrente
    const translations = getTranslations(language);

    useEffect(() => {
        localStorage.setItem('pacifinance-language', language);
    }, [language]);

    const toggleLanguage = () => {
        setLanguage(prevLanguage => prevLanguage === 'it' ? 'en' : 'it');
    };

    const setLanguageWithPersistence = (newLanguage) => {
        setLanguage(newLanguage);
        localStorage.setItem('pacifinance-language', newLanguage);
    };
  
    return (
      <LanguageContext.Provider value={{ 
        language, 
        translations, // Nuovo: fornisce le traduzioni direttamente
        setLanguage: setLanguageWithPersistence, 
        toggleLanguage 
      }}>
        {children}
      </LanguageContext.Provider>
    );
};
```

### Passo 3: Aggiornare i componenti (opzionale - backward compatible)

I componenti possono continuare a usare il vecchio metodo:

```jsx
import languages from '../data/languages.json';
const text = languages[language].general.ok;
```

Oppure usare il nuovo metodo (consigliato):

```jsx
const { language, translations } = useContext(LanguageContext);
const text = translations.general.ok;
```

## ✅ Vantaggi della nuova struttura

1. **Scalabilità**: Facile aggiungere nuove lingue creando un nuovo file `xx.json`
2. **Manutenibilità**: File separati sono più facili da gestire e modificare
3. **Performance**: Possibilità di lazy loading delle lingue
4. **Standard industry**: Segue le best practice per i18n
5. **Tree-shaking**: Build tool possono ottimizzare meglio
6. **Backward compatible**: Funziona con il codice esistente

## 🔄 Migrazione graduale

Non è necessario aggiornare tutti i file subito. Il sistema è backward compatible:

1. Vecchio modo (continua a funzionare):
   ```jsx
   import languages from '../data/languages.json';
   ```

2. Nuovo modo (raccomandato per nuovi componenti):
   ```jsx
   import { getTranslations } from '../i18n';
   ```

## 📝 Come aggiungere una nuova lingua

1. Crea `src/i18n/locales/es.json` (esempio spagnolo)
2. Copia la struttura da `it.json` e traduci
3. Aggiorna `src/i18n/index.js`:
   ```js
   import es from './locales/es.json';
   
   const languages = {
     it,
     en,
     es  // Nuovo
   };
   ```
4. Fatto! La nuova lingua è disponibile
