# GitHub Copilot Instructions - PaciFinance Frontend

## 🎯 Project Overview

PaciFinance is a **personal finance management web application** built with React. It provides users with a unified view of their financial situation, including assets, expenses, incomes, and anonymous comparisons with similar users.

**Key Features:**
- Multi-platform asset tracking (bank, stocks, ETF, crypto, etc.)
- Expense and income categorization
- Anonymous comparisons with similar users
- Multi-language support (Italian/English)
- Privacy-focused design (data anonymization)
- PWA-ready with service worker

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/            # React Context providers (state management)
├── data/               # Static data (colors, icons, translations)
├── hooks/              # Custom React hooks
├── pages/              # Page-level components (route endpoints)
├── sections/           # Major page sections/features
├── styles/             # Styled-components and themes
└── utils/              # Utility functions and helpers

server/                  # Backend (managed separately - DO NOT modify)
public/                  # Static assets
build/                   # Production build output
```

---

## 🚨 CRITICAL RULES - ALWAYS FOLLOW

### 1. **Language Files (MANDATORY)**
Every time you add user-facing text, you **MUST** update both language entries in:
```
src/data/languages.json
```

**Structure:**
```json
{
  "it": {
    "sectionName": {
      "key": "Testo italiano"
    }
  },
  "en": {
    "sectionName": {
      "key": "English text"
    }
  }
}
```

**Usage in components:**
```jsx
import { LanguageContext } from '../contexts/LanguageContext';
import languages from '../data/languages.json';

const { language } = useContext(LanguageContext);
const text = languages[language].sectionName.key;
```

### 2. **Mock Data for Testing (MANDATORY)**
When adding new data structures or features, you **MUST** update the mock user data in:
```
src/contexts/MockAuthContext.jsx
```

The `mockUserData` object must mirror the structure returned by the API in `UserContext.jsx`. This allows local development without database connection.

### 3. **Data Selectors (MANDATORY)**
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

### 4. **Tests (MANDATORY)**
After adding new functionality:
1. Create or update tests in `src/__tests__/`
2. Run all tests: `npm test`
3. Ensure all tests pass before committing

### 5. **Build Verification (MANDATORY)**
After any change:
1. Run `npm run lint` - fix any errors
2. Run `npm run build` - ensure production build succeeds
3. Run `npm test` - ensure all tests pass

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
npm run build         # Creates production build in /build
npm run preview       # Preview production build locally
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
- Italian (`it`)
- English (`en`)

### Adding New Text
1. Open `src/data/languages.json`
2. Add key to both `it` and `en` sections
3. Use nested structure for organization:
```json
{
  "it": {
    "pageName": {
      "sectionName": {
        "elementName": "Testo"
      }
    }
  },
  "en": {
    "pageName": {
      "sectionName": {
        "elementName": "Text"
      }
    }
  }
}
```

### Never Hardcode Text
```jsx
// ❌ WRONG
<button>Submit</button>

// ✅ CORRECT
<button>{languages[language].form.submitButton}</button>
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
