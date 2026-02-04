# 🌿 PaciFinance - Personal Finance Management Platform

<div align="center">

**Unify your finances in one platform**

[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.1.6-646CFF?logo=vite)](https://vitejs.dev/)
[![Styled Components](https://img.shields.io/badge/Styled_Components-6.1.19-DB7093?logo=styled-components)](https://styled-components.com/)
[![License](https://img.shields.io/badge/License-Private-red)]()

[🚀 Features](#-features) • [📦 Installation](#-installation) • [🏗️ Architecture](#️-architecture) • [🌍 i18n URL Routing](#-internationalization) • [🧪 Testing](#-testing) • [🤝 Contributing](#-contributing)

</div>

---

> **🆕 NEW:** Sistema URL Multilingua implementato! Vedi [DOCS_INDEX.md](DOCS_INDEX.md) per iniziare.

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Project Structure](#-project-structure)
- [Architecture](#️-architecture)
- [State Management](#-state-management)
- [Internationalization](#-internationalization)
- [Testing](#-testing)
- [Development Workflow](#-development-workflow)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

**PaciFinance** is a personal finance management web application that provides users with a unified view of their financial situation. The goal is to break the money taboo by enabling anonymous comparisons with similar users based on age, job, and situation.

### Why PaciFinance?

- 📊 **Unified View**: All your accounts (banks, investments, crypto) in a single dashboard
- 🔒 **Privacy First**: Completely anonymous comparisons, no personal data shared
- 🆓 **100% Free**: Community supported, no subscription required
- 🌍 **Multi-language**: Full support for Italian and English

---

## ✨ Features

### Dashboard
- Real-time total wealth overview
- Asset distribution charts (liquidity, investments, crypto)
- Monthly income/expense trends
- Automatic financial insights

### Data Entry
- Quick expense and income entry
- Automatic categorization
- Balance management by asset type
- Tables with advanced filters and sorting

### Statistics & Charts
- Interactive charts with Recharts
- Category analysis
- Time comparison (previous month, previous year)
- Data export to Excel/CSV

### Comparisons
- Anonymous comparison with all users
- Comparison with similar users (same job, age, situation)
- Percentile ranking for wealth, income, expenses
- Savings rate and asset allocation

### Profile & Settings
- User profile management
- Dark/light mode theme
- Language selection IT/EN
- Privacy mode (hides values)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.1 | UI Framework |
| Vite | 7.1.6 | Build Tool |
| styled-components | 6.1.19 | CSS-in-JS |
| Recharts | 3.2.1 | Charts |
| React Router | 7.9.1 | Routing |
| Axios | 1.12.2 | HTTP Client |
| MUI | 7.3.2 | Icon Components |

### Backend (Separate Repository)
| Technology | Version | Purpose |
|------------|---------|---------|
| Express | 5.1.0 | API Server |
| MongoDB/Mongoose | 8.18.1 | Database |
| TypeScript | 5.9.2 | Type Safety |

### Dev Tools
| Tool | Purpose |
|------|---------|
| ESLint | Code Linting |
| Vitest | Unit Testing |
| Tailwind CSS | Utility CSS |

---

## 📦 Installation

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Quick Start

```bash
# Clone repository
git clone https://github.com/your-org/pacifinance.git
cd pacifinance

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser at http://localhost:5173
```

### Development Mode (with Mock Data)

To develop without database connection:

```bash
# Start dev server and open browser with mock data
npm run dev -- --open
# Then add ?dev=true to the URL: http://localhost:5173?dev=true
```

Or manually:
1. Start the development server: `npm run dev`
2. Open `http://localhost:5173?dev=true`
3. The app will use mock data from `MockAuthContext.jsx`

> **Quick tip**: The `?dev=true` query parameter activates `MockAuthContext` which provides sample data for all features without requiring backend connection.

### Available Scripts

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm test           # Run tests
npm test:coverage  # Run tests with coverage
npm test:ui        # Run tests with UI
```

---

## 📁 Project Structure

```
pacifinance/
├── 📁 .github/
│   └── copilot-instructions.md  # GitHub Copilot AI guidelines
│
├── 📁 public/
│   ├── sw.js                    # Service Worker (PWA)
│   ├── site.webmanifest         # PWA manifest
│   └── favicon*/                # Favicon assets
│
├── 📁 server/                   # ⚠️ Backend - Managed separately
│   ├── src/
│   │   ├── routes/              # API endpoints
│   │   ├── db/                  # Database models
│   │   └── jobs/                # Cron jobs
│   └── build/                   # Compiled backend
│
├── 📁 src/
│   ├── 📁 assets/               # Static assets (images, fonts)
│   │
│   ├── 📁 components/           # Reusable UI components
│   │   ├── BalanceSection.jsx
│   │   ├── IncomeSection.jsx
│   │   ├── OutflowSection.jsx
│   │   └── ...
│   │
│   ├── 📁 contexts/             # React Context providers
│   │   ├── UserContext.jsx      # User data & auth
│   │   ├── ThemeContext.jsx     # Dark/Light mode
│   │   ├── LanguageContext.jsx  # i18n
│   │   ├── PrivacyContext.jsx   # Hide values mode
│   │   ├── MockAuthContext.jsx  # Mock data for dev
│   │   └── ...
│   │
│   ├── 📁 data/                 # Static configuration data
│   │   ├── languages.json       # 🌍 Translations (Italian/English)
│   │   ├── assetColors.js       # Asset color palette
│   │   ├── categoryColors.js    # Category color palette
│   │   └── assetIcons.js        # Asset icons mapping
│   │
│   ├── 📁 hooks/                # Custom React hooks
│   │   ├── useAuth.js
│   │   └── useScrollNavigation.js
│   │
│   ├── 📁 pages/                # Route page components
│   │   ├── DashboardPage.jsx
│   │   ├── InsertPage.jsx
│   │   ├── ComparisonPage.jsx
│   │   └── ...
│   │
│   ├── 📁 sections/             # Page section components
│   │   ├── Dashboard.jsx
│   │   ├── InsertValues.jsx
│   │   ├── Comparison.jsx
│   │   └── ...
│   │
│   ├── 📁 styles/               # Styled components & themes
│   │   ├── Themes.jsx           # Theme definitions
│   │   └── ModernDashboardStyled.jsx
│   │
│   ├── 📁 utils/                # Utility functions
│   │   ├── userDataSelectors.js # Data selectors
│   │   ├── calculations.js      # Financial calculations
│   │   └── dataExport.jsx       # Export utilities
│   │
│   ├── 📁 __tests__/            # Test files
│   │   ├── utils/
│   │   ├── components/
│   │   └── contexts/
│   │
│   ├── AppRouter.jsx            # Route definitions
│   ├── index.jsx                # App entry point
│   └── index.css                # Global styles
│
├── 📄 package.json
├── 📄 vite.config.mjs           # Vite configuration
├── 📄 eslint.config.js          # ESLint configuration
└── 📄 README.md                 # This file
```

---

## 🏗️ Architecture

### Component Hierarchy

```
App
├── ThemeProvider
│   └── LanguageProvider
│       └── DevModeProvider
│           ├── UserProvider (Production)
│           └── MockAuthProvider (Development)
│               └── PageProvider
│                   └── PrivacyProvider
│                       └── ToastProvider
│                           └── Router
│                               └── AppRouter
│                                   ├── DashboardPage
│                                   ├── InsertPage
│                                   ├── ComparisonPage
│                                   └── ...
```

### Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Backend   │────▶│  UserContext │────▶│  Components │
│    API      │     │   (State)    │     │    (UI)     │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Selectors  │
                    │ (Data Access)│
                    └──────────────┘
```

### Authentication Flow

```
┌─────────┐    ┌────────────┐    ┌─────────────┐
│  Login  │───▶│ /user/get  │───▶│ Session OK  │
│  Page   │    │   (API)    │    │ ──────────▶ │
└─────────┘    └────────────┘    │  Dashboard  │
                                 └─────────────┘
```

---

## 🔄 State Management

### Context Providers

| Context | Purpose | Key Values |
|---------|---------|------------|
| `UserContext` | User data & auth | `userData`, `isAuthenticated`, `setUserData` |
| `ThemeContext` | Visual theme | `theme`, `toggleMode` |
| `LanguageContext` | i18n | `language`, `setLanguage` |
| `PrivacyContext` | Hide values | `isHidden`, `togglePrivacy` |
| `PageContext` | Current page | `currentPage`, `setPage` |
| `ToastContext` | Notifications | `showToast`, `hideToast` |
| `MediaQueryContext` | Responsive | `isMobileScreen`, `isTabletScreen` |

### userData Structure

```javascript
userData = {
  // Core info
  userId: string,
  userType: 'regular' | 'premium' | 'test' | 'demo',
  username: string,
  
  // Profile
  profile: {
    nationality: { key: number, value: string },
    job: { key: number, value: string },
    age: { key: number, value: string },
    // ... other profile fields
  },
  
  // Financial data
  balances: [{
    date: string,
    balance: {
      bank: number,
      cash: number,
      stocks: number,
      etf: number,
      bitcoin: number,
      crypto: number,
      bonds: number,
      funds: number,
      gold: number,
      digitalServices: number,
      emergencyFund: number,
      totalValue: number
    }
  }],
  
  expenses: {
    allOutflows: Array[],        // Raw expense transactions
    outflowsArray: number[],     // Monthly totals
    totalOutflowsPerCategoryPerMonth: Object
  },
  
  incomes: {
    allIncomes: Array[],
    incomesArray: number[]
  },
  
  // Rankings
  rankings: {
    balance: number,            // Percentile compared to all users
    incomes: number,
    expenses: number,
    balanceSimilar: number,     // Percentile compared to similar users
    incomesSimilar: number,
    expensesSimilar: number
  },
  
  // Averages (used for comparisons)
  averages: {
    general: { balances, expenses, incomes },
    similar: { balances, expenses, incomes }
  }
}
```

---

## 🌍 Internationalization

### Supported Languages
- 🇮🇹 Italian (it) - Auto-detected for Italian browsers
- 🇬🇧 English (en) - Default fallback

### Modern i18n Structure
```
src/i18n/
├── index.js              # Centralized i18n system
├── locales/
│   ├── it.json          # Italian translations
│   └── en.json          # English translations
└── README.md            # Complete i18n documentation
```

### Key Features
- ✅ **Auto-detection**: Automatically detects browser language
- ✅ **User Priority**: Saved user preference overrides auto-detection
- ✅ **Scalable**: Easy to add new languages
- ✅ **Backward Compatible**: Old import method still works

### 🆕 URL-based Language Routing (SEO Optimized)

PaciFinance implements **URL-based internationalization** for improved SEO and user experience:

#### URL Structure
```
pacifinance.com/it/           # Italian homepage
pacifinance.com/en/dashboard  # English dashboard
pacifinance.com/it/profile    # Italian profile page
```

#### How It Works

1. **Automatic Language Detection**
   - Browser language detected on first visit
   - URL automatically updated: `pacifinance.com/` → `pacifinance.com/it/`

2. **URL-based Language Switching**
   - Changing URL changes language: `/it/dashboard` → `/en/dashboard`
   - User preference saved to localStorage

3. **Settings Integration**
   - Language change in settings updates both:
     - Current language state
     - URL path (without reload)
   - Preference persists across sessions

4. **Priority System**
   ```
   1. URL parameter (/it/, /en/)
   2. localStorage (user preference)
   3. Browser language detection
   4. Default fallback (en)
   ```

#### For Developers

**Using LocalizedLink** (instead of regular Link):
```jsx
import { LocalizedLink } from '../components/LocalizedLink';

// Automatically adds language prefix
<LocalizedLink to="/dashboard">Dashboard</LocalizedLink>
// Renders: <a href="/it/dashboard">Dashboard</a> (if language is Italian)
```

**Using useLocalizedNavigate** (instead of useNavigate):
```jsx
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';

const navigate = useLocalizedNavigate();
navigate('/profile'); // Navigates to /it/profile (if language is Italian)
```

**Migration Helper**:
A migration script is available to convert existing code:
```bash
bash migrate-i18n-routing.sh
```

#### Benefits
- 🔍 **Better SEO**: Search engines can index language-specific pages
- 🔗 **Shareable Links**: Users can share language-specific URLs
- 🌐 **User Experience**: URL reflects current language
- 💾 **Persistent**: Language preference saved in localStorage
- ✅ **Professional Structure**: Follows industry standards

### Usage in Components

**Recommended way (using Context):**
```jsx
import { LanguageContext } from '../contexts/LanguageContext';

function MyComponent() {
  const { language, translations } = useContext(LanguageContext);
  
  return (
    <button>{translations.form.submitButton}</button>
  );
}
```

**Alternative way (backward compatible):**
```jsx
import languages from '../data/languages.json';
import { LanguageContext } from '../contexts/LanguageContext';

const { language } = useContext(LanguageContext);
const text = languages[language].form.submitButton;
```

### Adding New Translations
1. Edit `src/i18n/locales/it.json` for Italian
2. Edit `src/i18n/locales/en.json` for English
3. Use nested structure:
```json
{
  "pageName": {
    "sectionName": {
      "elementName": "Translated text"
    }
  }
}
```

### Adding a New Language
1. Create `src/i18n/locales/es.json` (example: Spanish)
2. Copy structure from `it.json` and translate
3. Update `src/i18n/index.js`:
```js
import es from './locales/es.json';
const languages = { it, en, es };
```
4. Update auto-detection in `LanguageContext.jsx` if needed

### Never Hardcode Text
```jsx
// ❌ WRONG
<button>Submit</button>

// ✅ CORRECT
const { translations } = useContext(LanguageContext);
<button>{translations.form.submitButton}</button>
```

### Language Auto-Detection Flow
1. Check localStorage for saved preference → **Use if found**
2. Detect browser language (`navigator.language`)
3. Match with supported languages (it, en)
4. Fallback to 'en' if not supported
5. Save detected language for future visits

---

## 🧪 Testing

### Test Structure

```
src/__tests__/
├── utils/
│   ├── userDataSelectors.test.js
│   ├── calculations.test.js
│   └── sortingUtils.test.js
├── components/
│   ├── BalanceSection.test.jsx
│   └── ...
├── contexts/
│   ├── UserContext.test.jsx
│   └── ...
└── integration/
    └── Dashboard.test.jsx
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# Run specific test file
npm test -- userDataSelectors
```

### Writing Tests

```javascript
import { describe, it, expect } from 'vitest';
import { getBankValue, getTotalValue } from '../utils/userDataSelectors';
import { mockUserData } from '../contexts/MockAuthContext';

describe('userDataSelectors', () => {
  it('should return bank value from userData', () => {
    const result = getBankValue(mockUserData);
    expect(result).toBe(20000);
  });
  
  it('should return 0 when userData is null', () => {
    const result = getBankValue(null);
    expect(result).toBe(0);
  });
});
```

---

## 👨‍💻 Development Workflow

### Setting Up Development

1. **Clone and install**
   ```bash
   git clone <repo-url>
   npm install
   ```

2. **Start with mock data**
   ```bash
   npm run dev
   # Open http://localhost:5173?dev=true
   ```

3. **Start with real backend**
   ```bash
   # Terminal 1: Start backend (in server/ folder)
   cd server && npm run dev
   
   # Terminal 2: Start frontend
   npm run dev
   ```

### Adding New Features

1. **Create component** in appropriate folder
2. **Update languages.json** with translations
3. **Update MockAuthContext.jsx** if new data structures
4. **Create/update selectors** in userDataSelectors.js
5. **Write tests** for new functionality
6. **Run checks**:
   ```bash
   npm run lint
   npm test
   npm run build
   ```

### Code Style

- Use **functional components** with hooks
- Use **styled-components** for styling
- Follow **ES6+** conventions
- Add **JSDoc comments** for complex functions
- Use **semantic HTML** elements

---

## 🔌 API Reference

### Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/user/get` | Get user info |
| POST | `/balances/get` | Get balance history |
| POST | `/expenses/get` | Get expenses/incomes |
| POST | `/tags/get` | Get category tags |
| POST | `/rank/balances` | Get balance ranking |
| POST | `/rank/expenses` | Get expenses ranking |
| POST | `/stats/averages` | Get averages for comparison |
| POST | `/balances/insert` | Insert new balance |
| POST | `/expenses/insert` | Insert expense/income |

### Request Pattern

```javascript
const response = await axios.post(
  '/endpoint',
  { data: 'payload' },
  { withCredentials: true }
);
```

---

## 🚀 Deployment

### Production Build

```bash
# Create optimized build
npm run build

# Output will be in /build folder
```

### Build Configuration

Vite is configured with:
- Code splitting (lazy loading)
- Terser minification
- Console log removal in production
- Chunk optimization

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY build/ ./build/
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## 🤝 Contributing

### Before Contributing

1. Read `.github/copilot-instructions.md`
2. Understand the project structure
3. Follow the coding standards

### Pull Request Checklist

- [ ] Code follows project style guidelines
- [ ] `languages.json` updated (if applicable)
- [ ] `MockAuthContext.jsx` updated (if applicable)
- [ ] `userDataSelectors.js` updated (if applicable)
- [ ] Tests added/updated
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] `npm run build` succeeds
- [ ] README updated (if architecture changed)

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates

---

## 🔧 Troubleshooting

### Common Issues

#### "userData is null"
- Ensure component is wrapped in UserProvider
- Check if user is authenticated
- In dev mode, add `?dev=true` to URL

#### "language key undefined"
- Check if key exists in both IT and EN sections
- Verify correct nesting structure in languages.json

#### "Build failing"
```bash
npm run lint    # Check for syntax errors
npm test        # Check for failing tests
```

#### "Tests failing after changes"
- Update `mockUserData` in MockAuthContext.jsx
- Ensure selectors have fallback values

#### "Styles not applying"
- Check if `theme` prop is passed to styled components
- Verify ThemeContext is wrapping the component

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 📞 Contact

- **Issues**: Use GitHub Issues for bug reports
- **Questions**: Contact the development team

---

<div align="center">

Made with 💚 by the PaciFinance Team

</div>
