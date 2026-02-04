# Sistema i18n di PaciFinance

## 📁 Struttura

```
src/i18n/
├── index.js                # Export principale e configurazione
├── locales/
│   ├── it.json            # Traduzioni italiane
│   └── en.json            # Traduzioni inglesi
├── README.md              # Questa documentazione
└── extract-languages.js   # Script utility per migrazione
```

## 🌍 Sistema URL-based i18n

PaciFinance implementa un sistema di internazionalizzazione basato su URL per migliorare SEO e UX.

### URL Structure
```
pacifinance.com/it/           # Homepage italiana
pacifinance.com/en/dashboard  # Dashboard inglese
pacifinance.com/it/profile    # Profilo italiano
```

### Routing Utilities

Le utilities di routing sono in `src/utils/i18nRouting.js`:

```javascript
import { 
  getLanguageFromPath,      // Estrae lingua da URL
  removeLanguageFromPath,    // Rimuove prefisso lingua
  addLanguageToPath,         // Aggiunge prefisso lingua
  getLocalizedPath,          // Path completo con lingua
  getInitialLanguage,        // Determina lingua iniziale
  isValidLanguage            // Valida codice lingua
} from '../utils/i18nRouting';
```

## 🚀 Uso nel Codice

## 🚀 Uso nel Codice

### 1. Nei Componenti - Accesso Traduzioni

**Metodo Consigliato (nuovo):**
```jsx
import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

const MyComponent = () => {
  const { language, translations } = useContext(LanguageContext);
  
  return (
    <h1>{translations.general.welcome}</h1>
  );
};
```

**Metodo Legacy (ancora supportato):**
```jsx
import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import languages from '../data/languages.json';

const MyComponent = () => {
  const { language } = useContext(LanguageContext);
  
  return (
    <h1>{languages[language].general.welcome}</h1>
  );
};
```

### 2. Link e Navigazione

**SEMPRE usare LocalizedLink:**
```jsx
import { LocalizedLink } from '../components/LocalizedLink';

<LocalizedLink to="/dashboard">Dashboard</LocalizedLink>
// Renderizza: /it/dashboard o /en/dashboard automaticamente
```

**SEMPRE usare useLocalizedNavigate:**
```jsx
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';

const navigate = useLocalizedNavigate();
navigate('/profile'); // Naviga a /it/profile o /en/profile
```

### 3. Cambio Lingua

```jsx
import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { LanguageContext } from '../contexts/LanguageContext';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { addLanguageToPath, removeLanguageFromPath } from '../utils/i18nRouting';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useContext(LanguageContext);
  const location = useLocation();
  const navigate = useLocalizedNavigate();
  
  const toggleLanguage = () => {
    const newLang = language === 'it' ? 'en' : 'it';
    
    // 1. Aggiorna il context
    setLanguage(newLang);
    
    // 2. Aggiorna l'URL
    const currentPath = removeLanguageFromPath(location.pathname);
    const newPath = addLanguageToPath(currentPath, newLang);
    navigate(newPath, { replace: true });
  };
  
  return (
    <button onClick={toggleLanguage}>
      {language === 'it' ? 'EN 🇬🇧' : 'IT 🇮🇹'}
    </button>
  );
};
```

## 📝 Aggiungere una Nuova Lingua

## ✅ Vantaggi della Struttura Attuale

1. **URL-based routing**: SEO ottimizzato con URL specifici per lingua
2. **Scalabilità**: Facile aggiungere nuove lingue
3. **Manutenibilità**: File separati per ogni lingua
4. **Performance**: Possibilità di lazy loading
5. **Standard industry**: Segue best practice i18n
6. **Tree-shaking**: Ottimizzazione build automatica
7. **Backward compatible**: Funziona con codice esistente
8. **User Experience**: URL condivisibili con lingua specifica

## 🧪 Testing

Test disponibili per il sistema i18n:
```bash
# Test utilities routing
npm test src/__tests__/utils/i18nRouting.test.js

# Test LocalizedLink
npm test src/__tests__/components/LocalizedLink.test.jsx

# Test useLocalizedNavigate
npm test src/__tests__/hooks/useLocalizedNavigate.test.js
```

## 📚 Documentazione Completa

- **README principale**: [/README.md](../../README.md)
- **Guida migrazione**: [/MIGRATION_I18N_ROUTING.md](../../MIGRATION_I18N_ROUTING.md)
- **FAQ**: [/FAQ_I18N_ROUTING.md](../../FAQ_I18N_ROUTING.md)
- **Checklist**: [/CHECKLIST.md](../../CHECKLIST.md)
- **Esempi**: [/src/examples/I18nRoutingExamples.jsx](../examples/I18nRoutingExamples.jsx)

## 🔄 Migrazione Graduale

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
