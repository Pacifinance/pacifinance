# Guide to Migrating Components to the New i18n System

## 📋 Overview

This guide shows how to gradually migrate components from the old translation system to the new i18n system, while maintaining full backward compatibility.

## 🔄 Systems Compared

### Old System (languages.json)

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

### New System (i18n with translations)

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

## ✅ Advantages of the New System

1. **Fewer imports**: no need to import `languages.json`
2. **Cleaner**: more readable code without `languages[language]`
3. **Type-safe**: better TypeScript support (if used in the future)
4. **Autocompletion**: the IDE provides better suggestions
5. **Less repetition**: `translations.` instead of `languages[language].`

## 📝 Migration Examples

### Example 1: Simple Component

**Before:**
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

**After:**
```jsx
// Remove the languages.json import

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

### Example 2: Component with Fallback

**Before:**
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

**After:**
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

### Example 3: Component with Array/Loop

**Before:**
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

**After:**
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

### Example 4: Component with Interpolation

**Before:**
```jsx
const Greeting = ({ userName }) => {
  const { language } = useContext(LanguageContext);
  const greeting = languages[language].greeting.welcome;
  
  return <p>{greeting.replace('{name}', userName)}</p>;
};
```

**After:**
```jsx
const Greeting = ({ userName }) => {
  const { translations } = useContext(LanguageContext);
  const greeting = translations.greeting.welcome;
  
  return <p>{greeting.replace('{name}', userName)}</p>;
};
```

## 🔍 Identifying Components to Migrate

### Search for old system patterns:
```bash
# Find all files that import languages.json
grep -r "import.*languages.*from.*languages.json" src/

# Find all uses of languages[language]
grep -r "languages\[language\]" src/
```

### Patterns to look for:
- `import languages from '../data/languages.json'`
- `languages[language].`
- `languages[language]?.`

## 📋 Migration Checklist

For each component:

- [ ] Remove `import languages from '../data/languages.json'`
- [ ] Add `translations` to the `LanguageContext` destructuring
- [ ] Replace `languages[language].` with `translations.`
- [ ] Verify the component works correctly
- [ ] Run the tests for the component
- [ ] Commit the changes

## ⚠️ Important Notes

### When NOT to migrate:
- If the component is undergoing a full refactor
- If there are urgent changes in progress
- If the component will be removed soon

### What NOT to do:
- ❌ Do not migrate all components in a single giant commit
- ❌ Do not change the translation structure during migration
- ❌ Do not remove `languages.json` (still needed for backward compatibility)

### What to do:
- ✅ Migrate one component at a time
- ✅ Test after each migration
- ✅ Commit frequently
- ✅ Document any issues encountered

## 🧪 Testing

After migrating, verify:

```jsx
// Test that the component uses translations
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

Update this table as components are migrated.

## 🎯 Migration Priority

### High Priority
1. Frequently modified components
2. Components with a lot of text
3. New components (use the new system directly)

### Medium Priority
1. Common UI components
2. Page components

### Low Priority
1. Legacy components
2. Components that will be removed
3. Rarely modified components

## 💡 Best Practices

1. **One component at a time**: avoid mass migrations
2. **Immediate testing**: verify after each migration
3. **Atomic commits**: one component = one commit
4. **Documentation**: note any issues
5. **Peer review**: have the changes reviewed

## 🚀 Full Example: Before and After

### ConsentBanner.jsx - Before

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

### ConsentBanner.jsx - After

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

### Differences:
- ✅ Removed the `languages.json` import
- ✅ Added `translations` from the Context
- ✅ Replaced `languages[language].` with `translations.`
- ✅ Cleaner, more readable code
- ✅ Same functionality

## 📚 Resources

- [src/i18n/README.md](../src/i18n/README.md) - Full i18n documentation
- [src/contexts/LanguageContext.tsx](../src/contexts/LanguageContext.tsx) - Context implementation
- [.github/copilot-instructions.md](../.github/copilot-instructions.md) - Project guidelines

---

**Remember**: migration is **optional** and can be done **gradually**. The old system will continue to work indefinitely thanks to backward compatibility!
