# Pacifinance i18n System

## 📁 Structure

```
src/i18n/
├── index.js                # Main export and configuration
├── locales/
│   ├── it.json            # Italian translations
│   └── en.json            # English translations
├── README.md              # This documentation
└── extract-languages.js   # Utility script for migration
```

## 🌍 URL-based i18n System

Pacifinance implements a URL-based internationalization system to improve SEO and UX.

### URL Structure
```
pacifinance.com/it/           # Italian homepage
pacifinance.com/en/dashboard  # English dashboard
pacifinance.com/it/profile    # Italian profile
```

### Routing Utilities

The routing utilities are in `src/utils/i18nRouting.js`:

```javascript
import { 
  getLanguageFromPath,      // Extracts language from URL
  removeLanguageFromPath,    // Removes the language prefix
  addLanguageToPath,         // Adds the language prefix
  getLocalizedPath,          // Full path with language
  getInitialLanguage,        // Determines the initial language
  isValidLanguage            // Validates the language code
} from '../utils/i18nRouting';
```

## 🚀 Usage in Code

## 🚀 Usage in Code

### 1. In Components - Accessing Translations

**Recommended Method (new):**
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

**Legacy Method (still supported):**
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

### 2. Links and Navigation

**ALWAYS use LocalizedLink:**
```jsx
import { LocalizedLink } from '../components/LocalizedLink';

<LocalizedLink to="/dashboard">Dashboard</LocalizedLink>
// Renders: /it/dashboard or /en/dashboard automatically
```

**ALWAYS use useLocalizedNavigate:**
```jsx
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';

const navigate = useLocalizedNavigate();
navigate('/profile'); // Navigates to /it/profile or /en/profile
```

### 3. Changing Language

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
    
    // 1. Update the context
    setLanguage(newLang);
    
    // 2. Update the URL
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

## 📝 Adding a New Language

## ✅ Advantages of the Current Structure

1. **URL-based routing**: SEO-optimized with language-specific URLs
2. **Scalability**: easy to add new languages
3. **Maintainability**: separate files for each language
4. **Performance**: lazy loading possible
5. **Industry standard**: follows i18n best practices
6. **Tree-shaking**: automatic build optimization
7. **Backward compatible**: works with existing code
8. **User Experience**: shareable URLs with a specific language

## 🧪 Testing

Tests available for the i18n system:
```bash
# Routing utilities tests
npm test src/__tests__/utils/i18nRouting.test.js

# LocalizedLink tests
npm test src/__tests__/components/LocalizedLink.test.jsx

# useLocalizedNavigate tests
npm test src/__tests__/hooks/useLocalizedNavigate.test.js
```

## 📚 Full Documentation

- **Main README**: [/README.md](../../README.md)

## 🔄 Gradual Migration

There is no need to update all files right away. The system is backward compatible:

1. Old way (still works):
   ```jsx
   import languages from '../data/languages.json';
   ```

2. New way (recommended for new components):
   ```jsx
   import { getTranslations } from '../i18n';
   ```

## 📝 How to add a new language

1. Create `src/i18n/locales/es.json` (Spanish example)
2. Copy the structure from `it.json` and translate
3. Update `src/i18n/index.js`:
   ```js
   import es from './locales/es.json';
   
   const languages = {
     it,
     en,
     es  // New
   };
   ```
4. Done! The new language is now available
