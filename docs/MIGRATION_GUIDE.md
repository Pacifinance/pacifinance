# Guida alla Migrazione dei Componenti al Nuovo Sistema i18n

## 📋 Panoramica

Questa guida mostra come migrare gradualmente i componenti dal vecchio sistema di traduzioni al nuovo sistema i18n, mantenendo piena retrocompatibilità.

## 🔄 Sistemi a Confronto

### Vecchio Sistema (languages.json)

```jsx
import React, { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import languages from '../data/languages.json';

const MyComponent = () => {
  const { language } = useContext(LanguageContext);
  
  return (
    <div>
      <h1>{languages[language].general.title}</h1>
      <p>{languages[language].general.description}</p>
      <button>{languages[language].general.ok}</button>
    </div>
  );
};
```

### Nuovo Sistema (i18n con translations)

```jsx
import React, { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

const MyComponent = () => {
  const { language, translations } = useContext(LanguageContext);
  
  return (
    <div>
      <h1>{translations.general.title}</h1>
      <p>{translations.general.description}</p>
      <button>{translations.general.ok}</button>
    </div>
  );
};
```

## ✅ Vantaggi del Nuovo Sistema

1. **Meno import**: Non serve importare `languages.json`
2. **Più pulito**: Codice più leggibile senza `languages[language]`
3. **Type-safe**: Migliore supporto per TypeScript (se usato in futuro)
4. **Auto-completamento**: IDE fornisce suggerimenti migliori
5. **Meno ripetizioni**: `translations.` invece di `languages[language].`

## 📝 Esempi di Migrazione

### Esempio 1: Componente Semplice

**Prima:**
```jsx
import languages from '../data/languages.json';

const Header = () => {
  const { language } = useContext(LanguageContext);
  
  return (
    <header>
      <h1>{languages[language].header.title}</h1>
      <nav>
        <a href="/">{languages[language].header.home}</a>
        <a href="/about">{languages[language].header.about}</a>
      </nav>
    </header>
  );
};
```

**Dopo:**
```jsx
// Rimuovi l'import di languages.json

const Header = () => {
  const { translations } = useContext(LanguageContext);
  
  return (
    <header>
      <h1>{translations.header.title}</h1>
      <nav>
        <a href="/">{translations.header.home}</a>
        <a href="/about">{translations.header.about}</a>
      </nav>
    </header>
  );
};
```

### Esempio 2: Componente con Fallback

**Prima:**
```jsx
const Button = ({ label }) => {
  const { language } = useContext(LanguageContext);
  
  return (
    <button>
      {languages[language]?.buttons?.[label] || 'Click'}
    </button>
  );
};
```

**Dopo:**
```jsx
const Button = ({ label }) => {
  const { translations } = useContext(LanguageContext);
  
  return (
    <button>
      {translations.buttons?.[label] || 'Click'}
    </button>
  );
};
```

### Esempio 3: Componente con Array/Loop

**Prima:**
```jsx
const MonthSelector = () => {
  const { language } = useContext(LanguageContext);
  const months = languages[language].months;
  
  return (
    <select>
      {Object.keys(months).map(key => (
        <option key={key} value={key}>
          {months[key]}
        </option>
      ))}
    </select>
  );
};
```

**Dopo:**
```jsx
const MonthSelector = () => {
  const { translations } = useContext(LanguageContext);
  const months = translations.months;
  
  return (
    <select>
      {Object.keys(months).map(key => (
        <option key={key} value={key}>
          {months[key]}
        </option>
      ))}
    </select>
  );
};
```

### Esempio 4: Componente con Interpolazione

**Prima:**
```jsx
const Greeting = ({ userName }) => {
  const { language } = useContext(LanguageContext);
  const greeting = languages[language].greeting.welcome;
  
  return <p>{greeting.replace('{name}', userName)}</p>;
};
```

**Dopo:**
```jsx
const Greeting = ({ userName }) => {
  const { translations } = useContext(LanguageContext);
  const greeting = translations.greeting.welcome;
  
  return <p>{greeting.replace('{name}', userName)}</p>;
};
```

## 🔍 Identificare Componenti da Migrare

### Cerca pattern vecchio sistema:
```bash
# Trova tutti i file che importano languages.json
grep -r "import.*languages.*from.*languages.json" src/

# Trova tutti gli usi di languages[language]
grep -r "languages\[language\]" src/
```

### Pattern da cercare:
- `import languages from '../data/languages.json'`
- `languages[language].`
- `languages[language]?.`

## 📋 Checklist Migrazione

Per ogni componente:

- [ ] Rimuovi `import languages from '../data/languages.json'`
- [ ] Aggiungi `translations` alla destrutturazione di `LanguageContext`
- [ ] Sostituisci `languages[language].` con `translations.`
- [ ] Verifica che il componente funzioni correttamente
- [ ] Esegui i test per il componente
- [ ] Commit delle modifiche

## ⚠️ Note Importanti

### Quando NON migrare:
- Se il componente è in fase di refactoring completo
- Se ci sono modifiche urgenti in corso
- Se il componente verrà rimosso a breve

### Cosa NON fare:
- ❌ Non migrare tutti i componenti in un'unica commit gigante
- ❌ Non cambiare la struttura delle traduzioni durante la migrazione
- ❌ Non rimuovere `languages.json` (ancora necessario per retrocompatibilità)

### Cosa fare:
- ✅ Migrare un componente alla volta
- ✅ Testare dopo ogni migrazione
- ✅ Committare frequentemente
- ✅ Documentare eventuali problemi incontrati

## 🧪 Testing

Dopo la migrazione, verifica:

```jsx
// Test che il componente usi translations
import { render, screen } from '@testing-library/react';
import { LanguageContext } from '../contexts/LanguageContext';
import MyComponent from './MyComponent';

const mockTranslations = {
  general: {
    title: 'Test Title',
    ok: 'OK Button'
  }
};

test('uses translations from context', () => {
  render(
    <LanguageContext.Provider value={{ 
      translations: mockTranslations,
      language: 'it'
    }}>
      <MyComponent />
    </LanguageContext.Provider>
  );
  
  expect(screen.getByText('Test Title')).toBeInTheDocument();
  expect(screen.getByText('OK Button')).toBeInTheDocument();
});
```

## 📊 Progress Tracking

Mantieni una lista dei componenti migrati:

### ✅ Migrati
- [Nessuno ancora]

### 🔄 In Corso
- [Nessuno ancora]

### ⏳ Da Migrare
- [ ] ConsentBanner.jsx
- [ ] SidebarMobile.jsx
- [ ] [Altri componenti...]

## 🎯 Priorità di Migrazione

### Alta Priorità
1. Componenti frequentemente modificati
2. Componenti con molti testi
3. Nuovi componenti (usa direttamente il nuovo sistema)

### Media Priorità
1. Componenti UI comuni
2. Componenti di pagina

### Bassa Priorità
1. Componenti legacy
2. Componenti che verranno rimossi
3. Componenti raramente modificati

## 💡 Best Practices

1. **Un componente alla volta**: Evita migrazioni massive
2. **Test immediato**: Verifica dopo ogni migrazione
3. **Commit atomici**: Un componente = un commit
4. **Documentazione**: Annota eventuali problemi
5. **Peer review**: Fai revisionare le modifiche

## 🚀 Esempio Completo: Prima e Dopo

### ConsentBanner.jsx - Prima

```jsx
import React, { useState, useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import languages from '../data/languages.json';

const ConsentBanner = () => {
  const { language } = useContext(LanguageContext);
  const [visible, setVisible] = useState(true);
  
  if (!visible) return null;
  
  return (
    <div className="cookie-banner">
      <h3>{languages[language]?.cookie?.title || 'We use cookies'}</h3>
      <p>{languages[language]?.cookie?.description || 'Description'}</p>
      <button onClick={() => setVisible(false)}>
        {languages[language]?.cookie?.acceptButton || 'Accept'}
      </button>
    </div>
  );
};

export default ConsentBanner;
```

### ConsentBanner.jsx - Dopo

```jsx
import React, { useState, useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

const ConsentBanner = () => {
  const { translations } = useContext(LanguageContext);
  const [visible, setVisible] = useState(true);
  
  if (!visible) return null;
  
  return (
    <div className="cookie-banner">
      <h3>{translations.cookie?.title || 'We use cookies'}</h3>
      <p>{translations.cookie?.description || 'Description'}</p>
      <button onClick={() => setVisible(false)}>
        {translations.cookie?.acceptButton || 'Accept'}
      </button>
    </div>
  );
};

export default ConsentBanner;
```

### Differenze:
- ✅ Rimosso import di `languages.json`
- ✅ Aggiunto `translations` al Context
- ✅ Sostituito `languages[language].` con `translations.`
- ✅ Codice più pulito e leggibile
- ✅ Stessa funzionalità

## 📚 Risorse

- [src/i18n/README.md](README.md) - Documentazione completa i18n
- [src/contexts/LanguageContext.jsx](../contexts/LanguageContext.jsx) - Implementazione Context
- [.github/copilot-instructions.md](../../.github/copilot-instructions.md) - Linee guida progetto

---

**Ricorda**: La migrazione è **opzionale** e può essere fatta **gradualmente**. Il vecchio sistema continuerà a funzionare indefinitamente grazie alla retrocompatibilità!
