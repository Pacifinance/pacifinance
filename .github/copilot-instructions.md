# GitHub Copilot Instructions - PaciFinance Frontend

## 🎯 Project Overview

PaciFinance is a **personal finance management web application** built with React. It provides users with a unified view of their financial situation, including assets, expenses, incomes, and anonymous comparisons with similar users.

**Key Features:**
- Multi-platform asset tracking (bank, stocks, ETF, crypto, etc.)
- Expense and income categorization
- Anonymous comparisons with similar users
- Multi-language support (Italian/English)
- Multi-currency support (19 currencies with live exchange rates)
- Public roadmap page with kanban layout
- CSV/Excel data import wizard
- Privacy-focused design (data anonymization)
- PWA-ready with service worker

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/            # React Context providers (state management)
├── data/               # Static data (colors, icons, translations, currency config)
├── hooks/              # Custom React hooks
├── i18n/               # Internationalization (locales, config)
├── pages/              # Page-level components (route endpoints)
├── sections/           # Major page sections/features
├── styles/             # Styled-components and themes
└── utils/              # Utility functions and helpers

scripts/                 # Build-time automation scripts
server/                  # Backend (managed separately - DO NOT modify)
public/                  # Static assets
build/                   # Production build output
```

---

## 🚨 CRITICAL RULES - ALWAYS FOLLOW

### 1. **Internationalization (i18n) - MANDATORY**
Every time you add user-facing text, you **MUST** update both language files:
```
src/i18n/locales/it.json
src/i18n/locales/en.json
```

**File Structure:**
```
src/i18n/
├── index.js           # Centralized i18n export
├── languagesConfig.js # SINGLE SOURCE OF TRUTH for languages
├── locales/
│   ├── it.json       # Italian translations
│   └── en.json       # English translations
└── README.md         # i18n documentation
```

**Translation File Structure:**
```json
{
  "sectionName": {
    "key": "Testo tradotto"
  }
}
```

**Usage in components (RECOMMENDED):**
```jsx
import { LanguageContext } from '../contexts/LanguageContext';

const { language, translations } = useContext(LanguageContext);
const text = translations.sectionName.key;
```

**Alternative usage (backward compatible):**
```jsx
import languages from '../data/languages.json';
const { language } = useContext(LanguageContext);
const text = languages[language].sectionName.key;
```

**Adding a new language:**
1. Create `src/i18n/locales/xx.json` with translations
2. Add import in `src/i18n/index.js`:
   ```js
   import xx from './locales/xx.json';
   const languages = { it, en, xx };
   ```
3. Update `LanguageContext` if needed for auto-detection

**Auto-detection:**
The system automatically detects browser language on first visit. User preferences saved in localStorage always take priority.

### 2. **URL-based Language Routing (MANDATORY)**

PaciFinance uses **URL-based internationalization** for SEO and UX. All routes must include language prefix.

**URL Structure:**
```
/it/                  # Italian root
/en/dashboard         # English dashboard
/it/profile           # Italian profile
```

**ALWAYS use LocalizedLink instead of Link:**
```jsx
// ❌ WRONG
import { Link } from 'react-router-dom';
<Link to="/dashboard">Dashboard</Link>

// ✅ CORRECT
import { LocalizedLink } from '../components/LocalizedLink';
<LocalizedLink to="/dashboard">Dashboard</LocalizedLink>
// Auto-renders: /it/dashboard or /en/dashboard based on current language
```

**ALWAYS use useLocalizedNavigate instead of useNavigate:**
```jsx
// ❌ WRONG
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/dashboard');

// ✅ CORRECT
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
const navigate = useLocalizedNavigate();
navigate('/dashboard'); // Auto-navigates to /it/dashboard or /en/dashboard
```

**Available i18n routing utilities:**
```javascript
// From src/utils/i18nRouting.js
import { 
  getLanguageFromPath,      // Extract language from URL
  removeLanguageFromPath,    // Remove language prefix
  addLanguageToPath,         // Add language prefix
  getLocalizedPath,          // Get full localized path
  isValidLanguage            // Validate language code
} from '../utils/i18nRouting';
```

**When changing language in settings:**
```jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { addLanguageToPath, removeLanguageFromPath } from '../utils/i18nRouting';

const handleLanguageChange = (newLanguage) => {
  setLanguage(newLanguage);
  const currentPath = removeLanguageFromPath(location.pathname);
  const newPath = addLanguageToPath(currentPath, newLanguage);
  navigate(newPath, { replace: true });
};
```

**Priority System:**
1. URL parameter (`/it/`, `/en/`)
2. localStorage (user preference)
3. Browser language detection
4. Default fallback (`en`)

### 3. **Mock Data for Testing (MANDATORY)**
When adding new data structures or features, you **MUST** update the mock user data in:
```
src/contexts/MockAuthContext.jsx
```

The `mockUserData` object must mirror the structure returned by the API in `UserContext.jsx`. This allows local development without database connection.

### 4. **Data Selectors (MANDATORY)**
When accessing userData properties, **ALWAYS** use or create selectors in:
```
src/utils/userDataSelectors.js
```

**DO NOT** access userData properties directly. Use selectors:
```jsx
// ❌ WRONG
const balance = userData.balances[0].balance.bank;

// ✅ CORRECT
import { getBankValue } from '../utils/userDataSelectors';
const balance = getBankValue(userData);
```

### 5. **Tests (MANDATORY)**
After adding new functionality:
1. Create or update tests in `src/__tests__/`
2. Run all tests: `npm test`
3. Ensure all tests pass before committing

### 6. **Build Verification (MANDATORY)**
After any change:
1. Run `npm run lint` - fix any errors
2. Run `npm run build` - ensure production build succeeds
3. Run `npm test` - ensure all tests pass

### 7. **Use Centralized Colors and Icons (MANDATORY)**
When displaying assets or categories, **ALWAYS** use the centralized color and icon files:

```jsx
// ❌ WRONG - Hardcoded colors
const categoryColors = { 'Food': '#e74c3c', 'House': '#9b59b6' };
const color = categoryColors[category];

// ✅ CORRECT - Use centralized colors
import { getCategoryColor } from '../data/categoryColors';
const color = getCategoryColor(category);

// ❌ WRONG - Hardcoded asset colors
const assetColor = '#27ae60';

// ✅ CORRECT - Use centralized asset colors
import { getAssetColor } from '../data/assetColors';
const color = getAssetColor('stocks');

// ✅ CORRECT - Use centralized icons
import { getAssetIcon } from '../data/assetIcons';
import { getCategoryIcon } from '../data/categoryIcons';
const icon = getAssetIcon('etf');
const catIcon = getCategoryIcon('Food');
```

**Available files:**
- `src/data/assetColors.js` - Colors for assets (bank, stocks, ETF, crypto, etc.)
- `src/data/assetIcons.js` - Icons for assets
- `src/data/categoryColors.js` - Colors for income/outflow categories
- `src/data/categoryIcons.js` - Icons for categories

---

## 📍 Where to Put New Code

### New Component
```
src/components/MyComponent.jsx
```
- Export as named export if utility component
- Export as default if main component

### New Page (route)
```
src/pages/MyPage.jsx
```
- Add route in `src/AppRouter.jsx`
- Use lazy loading for non-critical pages

### New Section (part of a page)
```
src/sections/MySection.jsx
```

### New Hook
```
src/hooks/useMyHook.js
```

### New Utility Function
```
src/utils/myUtils.js
```
- Add corresponding tests in `src/__tests__/utils/`

### New Context
```
src/contexts/MyContext.jsx
```
- Wrap in provider tree in `src/index.jsx`

### New Asset Colors/Icons
```
src/data/assetColors.js
src/data/assetIcons.js
```

### New Category Colors/Icons
```
src/data/categoryColors.js
src/data/categoryIcons.js
```

### 6. **Use Centralized Colors and Icons (MANDATORY)**
When displaying assets or categories, **ALWAYS** use the centralized color and icon files:

```jsx
// ❌ WRONG - Hardcoded colors
const categoryColors = { 'Food': '#e74c3c', 'House': '#9b59b6' };
const color = categoryColors[category];

// ✅ CORRECT - Use centralized colors
import { getCategoryColor } from '../data/categoryColors';
const color = getCategoryColor(category);

// ❌ WRONG - Hardcoded asset colors
const assetColor = '#27ae60';

// ✅ CORRECT - Use centralized asset colors
import { getAssetColor } from '../data/assetColors';
const color = getAssetColor('stocks');

// ✅ CORRECT - Use centralized icons
import { getAssetIcon } from '../data/assetIcons';
import { getCategoryIcon } from '../data/categoryIcons';
const icon = getAssetIcon('etf');
const catIcon = getCategoryIcon('Food');
```

**Available files:**
- `src/data/assetColors.js` - Colors for assets (bank, stocks, ETF, crypto, etc.)
- `src/data/assetIcons.js` - Icons for assets
- `src/data/categoryColors.js` - Colors for income/outflow categories
- `src/data/categoryIcons.js` - Icons for categories

---

## 🎨 Styling Guidelines

### Use styled-components
```jsx
import styled from 'styled-components';

const MyComponent = styled.div`
  background: ${props => props.theme.backgroundColor};
  color: ${props => props.theme.textColor};
  
  @media (max-width: 768px) {
    // Mobile styles
  }
`;
```

### Theme Access
```jsx
import { ThemeContext } from '../contexts/ThemeContext';
const { theme } = useContext(ThemeContext);
```

### Color Constants
- Use colors from `src/data/assetColors.js` for assets
- Use colors from `src/data/categoryColors.js` for categories
- Use theme colors for UI elements

---

## 🔄 Data Flow

### User Data Structure (from UserContext)
```javascript
userData = {
  userId, userType, username,
  profile: { nationality, job, age, ... },
  balances: [{ date, balance: { bank, cash, stocks, ... } }, ...],
  expenses: { allOutflows, outflowsArray, totalOutflowsPerCategoryPerMonth },
  incomes: { allIncomes, incomesArray },
  tags: { outflowsTags, incomesTags, paymentTags, ... },
  rankings: { balance, incomes, expenses, balanceSimilar, ... },
  dates: { current, preMonth, preYearSameMonth },
  goals, limits, assets, averages
}
```

### API Calls
All API calls are made in `UserContext.jsx`. To add new data:
1. Add API call in UserContext
2. Update userData structure
3. Create selector in userDataSelectors.js
4. Update mockUserData in MockAuthContext

---

## 🧪 Testing Guidelines

### Test File Location
```
src/__tests__/
├── components/      # Component tests
├── contexts/        # Context tests
├── hooks/           # Hook tests
├── utils/           # Utility function tests
└── integration/     # Integration tests
```

### Test Naming
```
MyComponent.test.jsx
useMyHook.test.js
myUtils.test.js
```

### Required Tests for New Features
1. Unit tests for utility functions
2. Component tests for new components
3. Integration tests for complex features

### Running Tests
```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage  # With coverage report
```

---

## 🏗️ Build & Deploy

### Development
```bash
npm run dev           # Start development server
npm run dev -- --host # Expose to network
```

### Production Build
```bash
npm run build         # Creates production build in /build (auto-generates roadmap)
npm run preview       # Preview production build locally
npm run roadmap       # Manually regenerate roadmap data
```

### Linting
```bash
npm run lint          # Run ESLint
```

---

## 📝 Commit Checklist

Before every commit, ensure:

- [ ] `languages.json` updated with new text (IT and EN)
- [ ] `MockAuthContext.jsx` updated with new data structures
- [ ] `userDataSelectors.js` updated with new selectors
- [ ] Currency amounts use `CurrencyContext` (no hardcoded € or EUR)
- [ ] New tests added for new functionality
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] `npm run build` succeeds
- [ ] README.md updated if architecture changed

---

## 🔒 Backend Separation

**IMPORTANT:** The `server/` folder contains the backend code and is managed separately.

- **DO NOT** modify files in `server/` when working on frontend
- Frontend communicates with backend via REST API
- All API endpoints are called with `axios` and `withCredentials: true`

---

## 🌐 Internationalization (i18n)

### Supported Languages
Languages are configured centrally in `src/i18n/languagesConfig.js`. Currently supported:
- Italian (`it`) 🇮🇹
- English (`en`) 🇬🇧

### URL-based Language Routing
PaciFinance uses **URL-based internationalization** for SEO and UX. All routes include a language prefix.

**URL Structure:**
```
/it/                  # Italian root
/en/dashboard         # English dashboard
/it/profile           # Italian profile
```

**ALWAYS use LocalizedLink instead of Link:**
```jsx
// ❌ WRONG
import { Link } from 'react-router-dom';
<Link to="/dashboard">Dashboard</Link>

// ✅ CORRECT
import { LocalizedLink } from '../components/LocalizedLink';
<LocalizedLink to="/dashboard">Dashboard</LocalizedLink>
// Auto-renders: /it/dashboard or /en/dashboard based on current language
```

**ALWAYS use useLocalizedNavigate instead of useNavigate:**
```jsx
// ❌ WRONG
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/dashboard');

// ✅ CORRECT
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
const navigate = useLocalizedNavigate();
navigate('/dashboard'); // Auto-navigates to /it/dashboard or /en/dashboard
```

**Language Detection Priority:**
1. URL parameter (`/it/`, `/en/`)
2. localStorage (user preference)
3. Browser language detection
4. Default fallback (`en`)

### 🆕 Adding a New Language - COMPLETE CHECKLIST

When adding a new language (e.g., Spanish `es`), follow these steps **in order**:

#### Step 1: Create Translation File
Create `src/i18n/locales/es.json` by copying an existing translation file:
```bash
cp src/i18n/locales/en.json src/i18n/locales/es.json
```
Then translate all strings in the new file.

#### Step 2: Update Language Configuration (SINGLE SOURCE OF TRUTH)
Edit `src/i18n/languagesConfig.js` and add the new language:
```javascript
export const SUPPORTED_LANGUAGES = [
  { code: 'it', name: 'Italiano', englishName: 'Italian', flag: '🇮🇹', isRTL: false },
  { code: 'en', name: 'English', englishName: 'English', flag: '🇬🇧', isRTL: false },
  // Add new language here:
  { code: 'es', name: 'Español', englishName: 'Spanish', flag: '🇪🇸', isRTL: false }
];
```

#### Step 3: Import Translation in i18n Index
Edit `src/i18n/index.js`:
```javascript
import it from './locales/it.json';
import en from './locales/en.json';
import es from './locales/es.json'; // Add import

const languages = {
  it,
  en,
  es  // Add to languages object
};
```

#### Step 4: Verify Automatic Updates
The following components will **automatically** pick up the new language:
- ✅ Landing page footer (shows available languages)
- ✅ URL routing (`/es/dashboard` will work)
- ✅ Language detection from browser
- ✅ SEO components
- ✅ Language selector in settings

#### Step 5: Test the New Language
```bash
npm run lint          # Check for errors
npm run build         # Verify build
npm test              # Run tests
```

Then manually test:
- Navigate to `/{newLang}/` URL
- Check language selector shows new language
- Verify translations appear correctly
- Test language switching

### Translation File Structure
```json
{
  "sectionName": {
    "key": "Translated text"
  }
}
```

### Using Translations in Components
```jsx
import { LanguageContext } from '../contexts/LanguageContext';

const { language, translations } = useContext(LanguageContext);
const text = translations.sectionName.key;
```

### i18n Routing Utilities
Available from `src/utils/i18nRouting.js`:
```javascript
import { 
  getLanguageFromPath,      // Extract language from URL
  removeLanguageFromPath,    // Remove language prefix
  addLanguageToPath,         // Add language prefix
  getLocalizedPath,          // Get full localized path
  isValidLanguage,           // Validate language code
  supportedLanguages,        // Full language config array
  availableLanguages,        // Language codes array
  defaultLanguage            // Default language code
} from '../utils/i18nRouting';
```

### Language Configuration Exports
Available from `src/i18n/languagesConfig.js`:
```javascript
import { 
  SUPPORTED_LANGUAGES,      // Array of language objects
  DEFAULT_LANGUAGE,         // Default language code ('en')
  getLanguageCodes,         // Returns ['it', 'en', ...]
  getLanguageByCode,        // Get full config by code
  isValidLanguage,          // Check if code is valid
  getLanguageName,          // Get native name
  getLanguageFlag           // Get flag emoji
} from '../i18n/languagesConfig';
```

### Never Hardcode Text
```jsx
// ❌ WRONG
<button>Submit</button>

// ✅ CORRECT
<button>{translations.form.submitButton}</button>
```

---

## 🧩 Component Patterns

### Page Component
```jsx
import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { UserContext } from '../contexts/UserContext';
import { LanguageContext } from '../contexts/LanguageContext';
import languages from '../data/languages.json';

const MyPage = () => {
  const { theme } = useContext(ThemeContext);
  const { userData } = useContext(UserContext);
  const { language } = useContext(LanguageContext);
  
  return (
    <Section theme={theme}>
      {/* content */}
    </Section>
  );
};

export default MyPage;
```

### Reusable Component
```jsx
import styled from 'styled-components';

const StyledComponent = styled.div`
  /* styles */
`;

export const MyComponent = ({ theme, ...props }) => {
  return <StyledComponent theme={theme} {...props} />;
};
```

---

## 🐛 Common Issues & Solutions

### "userData is null"
- Ensure component is wrapped in UserProvider
- Check if user is authenticated
- In dev mode, ensure MockAuthProvider is active

### "language key undefined"
- Check if key exists in both IT and EN sections of languages.json
- Verify correct nesting structure

### "Tests failing"
- Update mockUserData to match new data structures
- Ensure all selectors have fallback values

### "Build failing"
- Run `npm run lint` to identify syntax issues
- Check for circular dependencies
- Verify all imports are correct

---

## 📊 Analytics

Using Umami Analytics. Add tracking to interactive elements:
```jsx
<button data-umami-event="button-name-clicked">
  Click me
</button>
```

---

## 🔄 State Management

Using React Context for global state:
- `ThemeContext` - Dark/Light mode
- `LanguageContext` - IT/EN language
- `UserContext` - User data and authentication
- `CurrencyContext` - Multi-currency support (19 currencies, exchange rates, formatting)
- `PageContext` - Current page state
- `PrivacyContext` - Privacy mode (hide values)
- `ToastContext` - Toast notifications
- `MediaQueryContext` - Responsive breakpoints

---

## 💡 Best Practices

1. **Always use TypeScript types** when available
2. **Prefer functional components** with hooks
3. **Use lazy loading** for non-critical pages
4. **Keep components small** and focused
5. **Use semantic HTML** elements
6. **Follow accessibility guidelines** (ARIA labels, keyboard navigation)
7. **Test edge cases** (empty data, errors, loading states)
8. **Document complex logic** with comments
9. **Use constants** for magic numbers/strings
10. **Handle loading and error states** gracefully

---

## 💱 Multi-Currency Support (MANDATORY)

PaciFinance supports 19 currencies. All values in the database are stored in EUR. Conversion happens at display-time.

### Architecture
- **DB currency**: EUR (always)
- **Display currency**: user's choice (default EUR)
- **API**: frankfurter.app for live exchange rates, cached 24h in localStorage
- **Fallback**: static rates in `currencyConfig.js` when API is unavailable

### Key Files
- `src/data/currencyConfig.js` - Currency definitions, fallback rates, validation utilities
- `src/contexts/CurrencyContext.jsx` - Context provider with conversion/formatting functions

### ALWAYS use CurrencyContext for amounts (MANDATORY)
```jsx
// ❌ WRONG - Hardcoded € symbol
<span>{value.toLocaleString('it-IT')} €</span>

// ❌ WRONG - Hardcoded Intl with EUR
new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)

// ✅ CORRECT - Use CurrencyContext
import { CurrencyContext } from '../contexts/CurrencyContext';
const { formatAmount, formatNumber, currencySymbol, fromEUR, toEUR } = useContext(CurrencyContext);

// Display a value from DB (EUR) in user's currency:
<span>{formatAmount(eurValue)}</span>

// Display just the number (no symbol):
<span>{formatNumber(eurValue)}</span>

// Show currency symbol in a form:
<label>Amount ({currencySymbol})</label>

// Convert user input to EUR before sending to API:
const eurValue = toEUR(userInputValue);

// Convert EUR from API to display currency:
const displayValue = fromEUR(eurValueFromDB);
```

### Provider Hierarchy
```
MediaQueryProvider > LanguageProvider > ThemeProvider > DevModeProvider > UserProvider > CurrencyProvider > PageProvider > PrivacyProvider > ToastProvider
```

### Supported Currencies
EUR, USD, GBP, CHF, JPY, CAD, AUD, SEK, NOK, DKK, PLN, CZK, HUF, RON, BGN, BRL, INR, CNY, TRY

---

## 🗺️ Roadmap Automation

The public roadmap page at `/roadmap` is auto-generated from project data.

### How It Works
1. `scripts/roadmap-items.json` — curated list of roadmap entries with bilingual titles/descriptions
2. `scripts/generateRoadmap.js` — reads `roadmap-items.json` + `todo.md`, infers status, generates `src/data/roadmapData.js`
3. `npm run roadmap` — runs the generator manually
4. `npm run build` — auto-runs via `prebuild` hook

### Adding a Roadmap Item
1. Add entry to `scripts/roadmap-items.json` with `todoMatch` string
2. Run `npm run roadmap` to regenerate
3. The item will appear on the roadmap page with status inferred from `todo.md`

### Excluding from Roadmap
Items NOT in `roadmap-items.json` are automatically excluded from the public roadmap.

---

## 📛 Naming Convention: "Outflows" vs "Expenses" (MANDATORY)

**ALWAYS use "outflows" (Uscite) and NEVER "expenses" (Spese)** when referring to money leaving the user's wallet, because outflows include both regular expenses AND investments.

The concept is: money that **exits** the wallet → **outflow** (Uscita), regardless of whether it's a grocery bill or a stock purchase.

**The ONLY exception:** You may use "expenses" (Spese) **if and only if** investments are explicitly excluded in that specific part of the code.

### In translation keys:
```json
// ✅ CORRECT
"rankings": { "outflows": "Uscite" }
"descriptions": { "outflows": { ... } }

// ❌ WRONG
"rankings": { "expenses": "Uscite" }
```

### In code (variable names, data properties, selectors):
```javascript
// ✅ CORRECT - includes investments
rankings: { outflows: ..., outflowsSimilar: ... }
getPercentageRankOnOutflows(userData)
categoryKey = isExpense ? 'outflows' : category;

// ❌ WRONG - "expenses" implies only spending, but investments are included
rankings: { expenses: ..., expensesSimilar: ... }
getPercentageRankOnExpenses(userData)
categoryKey = isExpense ? 'expenses' : category;
```

### When "expenses" IS acceptable:
```javascript
// ✅ OK - investments are explicitly excluded here
const pureExpenses = allOutflows.filter(item => item.type !== 'investment');
const monthlySpendingLimit = ...; // spending = expenses without investments
```
