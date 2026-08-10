# Pacifinance — Architecture Guide

> This document describes the high-level architecture, design patterns, and conventions used in Pacifinance. It is intended for contributors and maintainers.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Directory Structure](#directory-structure)
3. [Architecture Diagram](#architecture-diagram)
4. [Dependency Injection](#dependency-injection)
5. [State Management](#state-management)
6. [Service Layer](#service-layer)
7. [Data Flow](#data-flow)
8. [Internationalization](#internationalization)
9. [Testing Strategy](#testing-strategy)
10. [Code Quality Standards](#code-quality-standards)
11. [Contributing Guidelines](#contributing-guidelines)

---

## System Overview

Pacifinance is a privacy-first personal finance management SPA built with **React 19**. Key architectural decisions:

| Aspect | Choice | Rationale |
|---|---|---|
| **UI Framework** | React 19 + Vite 7 | Fast HMR, modern build pipeline |
| **State Management** | React Context API | No external state library needed at current scale |
| **Styling** | styled-components + Tailwind utility classes | Component-scoped styles with utility helpers |
| **Routing** | react-router-dom v7 | URL-based i18n with language prefix |
| **HTTP** | axios | Interceptors for session management |
| **Testing** | Vitest + Testing Library | Fast, React-optimized |
| **DI Pattern** | Factory functions + Context injection | Testable service layer |

---

## Directory Structure

```
src/
├── services/            # ← API abstraction layer (DI-injectable)
│   ├── apiClient.js     #    Configured axios instance factory
│   ├── userService.js   #    User/auth API calls
│   ├── financeService.js#    Balance/expense/income API calls
│   ├── rankingService.js#    Ranking comparison calls
│   ├── statsService.js  #    Statistics/averages calls
│   └── index.js         #    Barrel export
│
├── contexts/            # React Context providers (state + DI)
│   ├── ServiceContext.jsx  # ← DI container (injects services)
│   ├── UserContext.jsx     #   User data & authentication
│   ├── CurrencyContext.jsx #   Multi-currency conversion
│   ├── LanguageContext.jsx #   i18n state
│   ├── ThemeContext.jsx    #   Dark/light mode
│   ├── MediaQueryContext.jsx # Responsive breakpoints
│   ├── PageContext.jsx     #   Active page state
│   ├── PrivacyContext.jsx  #   Privacy mode (hide values)
│   ├── ToastContext.jsx    #   Toast notifications
│   ├── MockAuthContext.jsx #   Mock data for dev mode
│   └── DevModeProvider.jsx #   Dev/prod mode switch
│
├── hooks/               # Custom React hooks
├── components/          # Reusable UI components
├── pages/               # Route-level page components
├── sections/            # Major page sub-sections
├── utils/               # Pure utility functions
├── data/                # Static data (colors, icons, currency config)
├── i18n/                # Internationalization config & locale files
├── styles/              # Theme definitions & global styles
└── __tests__/           # Test suite organized by category
    ├── services/        # Service layer tests
    ├── contexts/        # Context provider tests
    ├── components/      # Component tests
    ├── hooks/           # Hook tests
    ├── utils/           # Utility function tests
    └── integration/     # Cross-cutting integration tests
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     React App Tree                       │
│                                                          │
│  ┌──────────────┐                                        │
│  │ ServiceProvider │ ← Creates & injects all services    │
│  │  (DI Container) │                                     │
│  └───────┬──────┘                                        │
│          │                                               │
│  ┌───────▼──────┐    ┌──────────────┐                   │
│  │MediaQueryProv.│    │LanguageProv. │                   │
│  └───────┬──────┘    └──────┬───────┘                   │
│          │                  │                            │
│  ┌───────▼──────────────────▼───────┐                   │
│  │         ThemeProvider             │                   │
│  └───────────────┬──────────────────┘                   │
│                  │                                       │
│  ┌───────────────▼──────────────────┐                   │
│  │   DevModeProvider (Mock/Real)     │                   │
│  └───────────────┬──────────────────┘                   │
│                  │                                       │
│  ┌───────────────▼──────────────────┐                   │
│  │        UserProvider               │ ← Consumes       │
│  │   (fetches data via services)     │   services        │
│  └───────────────┬──────────────────┘                   │
│                  │                                       │
│  ┌───────────────▼──────────────────┐                   │
│  │      CurrencyProvider             │                   │
│  └───────────────┬──────────────────┘                   │
│                  │                                       │
│  ┌───────────────▼──────────────────┐                   │
│  │  Page/Privacy/Toast Providers     │                   │
│  └───────────────┬──────────────────┘                   │
│                  │                                       │
│          ┌───────▼──────┐                                │
│          │   AppRouter   │                               │
│          │  (Pages →     │                               │
│          │   Components) │                               │
│          └──────────────┘                                │
└─────────────────────────────────────────────────────────┘

                        ↕ HTTP (axios)

┌─────────────────────────────────────────────────────────┐
│                    Backend API                           │
│   (Express, same repo under server/ — Supabase/Postgres, │
│    Upstash Redis for caching, deployed as Vercel          │
│    serverless functions)                                  │
└─────────────────────────────────────────────────────────┘
```

---

## Dependency Injection

### Why DI in a React App?

React's Context API provides a natural mechanism for Dependency Injection. We use it to solve three problems:

1. **Testability** — Components can be tested with mock services without intercepting network calls
2. **Loose Coupling** — Components don't know *how* API calls are made, just *what* they return
3. **Environment Flexibility** — Swap implementations for SSR, offline-first, or different backends

### How It Works

```
                  ┌──────────────────┐
                  │  createApiClient  │  Factory: produces configured axios instance
                  └────────┬─────────┘
                           │ injected into
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
    ┌─────────────┐ ┌──────────────┐ ┌──────────────┐
    │ userService  │ │financeService│ │rankingService│  ... Factory functions
    └──────┬──────┘ └──────┬───────┘ └──────┬───────┘
           │               │               │
           └───────────────┼───────────────┘
                           ▼
                  ┌──────────────────┐
                  │ ServiceContext    │  React Context (DI container)
                  │  (ServiceProvider)│
                  └──────────────────┘
                           │ useServices()
                           ▼
                  ┌──────────────────┐
                  │   Components      │  Consume services via hook
                  └──────────────────┘
```

### Usage in Components

```jsx
import { useServices } from '../contexts/ServiceContext';

const MyComponent = () => {
  const { userService } = useServices();

  const handleSave = async (data) => {
    await userService.updateProfile(data);
  };
};
```

### Usage in Tests

```jsx
const mockServices = {
  apiClient: {},
  userService: { updateProfile: vi.fn().mockResolvedValue({ ok: true }) },
  financeService: { getBalances: vi.fn().mockResolvedValue([]) },
  rankingService: { getAllRankings: vi.fn() },
  statsService: { getAverages: vi.fn() },
};

render(
  <ServiceContext.Provider value={mockServices}>
    <MyComponent />
  </ServiceContext.Provider>
);
```

### DI Coverage Tests

The file `src/__tests__/integration/diCoverage.test.js` tracks:
- Service contract completeness (all methods present)
- Factory isolation (no shared state)
- Barrel export completeness
- **Audit of direct axios usage** — monitors files still using `import axios` directly

As the codebase migrates, the audit count should trend toward zero.

---

## State Management

### Context Responsibilities

| Context | Purpose | Persistence |
|---|---|---|
| `ServiceContext` | DI container for API services | Memory only |
| `UserContext` | Auth state + user data | HTTP-only cookies (backend) |
| `CurrencyContext` | Display currency + exchange rates | localStorage (24h cache) |
| `LanguageContext` | Active language + translations | localStorage + URL |
| `ThemeContext` | Dark/light theme | Memory (resets on reload) |
| `MediaQueryContext` | Responsive breakpoint flags | Reactive (live) |
| `PageContext` | Active sidebar icon | Memory only |
| `PrivacyContext` | Hide/show sensitive values | Memory only |
| `ToastContext` | Toast notification queue | Memory only |

### Provider Hierarchy (Order Matters)

```
ServiceProvider        ← Must be outermost (services needed everywhere)
  MediaQueryProvider
    LanguageProvider
      ThemeProvider
        DevModeProvider  ← Switches between MockAuth and real UserProvider
          UserProvider   ← Needs services for API calls
            CurrencyProvider  ← Needs userData for preferred currency
              PageProvider
                PrivacyProvider
                  ToastProvider
                    App
```

---

## Service Layer

### Contracts

Each service is a **factory function** that receives an `apiClient` and returns an object with async methods:

```javascript
// Pattern:
export const createXxxService = (apiClient) => ({
  async methodName(params) {
    const res = await apiClient.post('/endpoint', params);
    return res.data;
  },
});
```

### Available Services

| Service | Methods | Endpoints |
|---|---|---|
| `userService` | `checkSession`, `getTags`, `getUserInfo`, `updateProfile`, `login`, `register`, `logout`, `deleteAccount`, `changeUserId`, `changePassword`, `resetUsername`, `saveGoals` | `/user/*`, `/tags/get` |
| `financeService` | `getBalances`, `addBalance`, `getExpensesAndIncomes`, `addExpenseOrIncome`, `deleteExpenseOrIncome` | `/balances/*`, `/expenses/*` |
| `rankingService` | `getAllRankings` | `/rank/*` |
| `statsService` | `getAverages` | `/stats/averages` |

---

## Data Flow

```
User Action → Component → Service Method → API Client → Backend
                                                            │
Backend Response → API Client → Service Method → Context setState → Re-render
```

### UserContext Data Lifecycle

1. App mounts → `UserProvider` calls `checkSession()` via cookie
2. If authenticated → fetches tags, user info, balances, expenses, rankings, stats
3. All data assembled into `userData` object
4. Components access via `useAuth()` or `useContext(UserContext)`
5. Data selectors in `utils/userDataSelectors.js` provide safe access

---

## Internationalization

- **URL-based routing**: `/it/dashboard`, `/en/profile`
- **Config source of truth**: `src/i18n/languagesConfig.js`
- **Translation files**: `src/i18n/locales/{lang}.json`
- Always use `LocalizedLink` and `useLocalizedNavigate` — NEVER raw `Link`/`useNavigate`
- All user-facing text must use translation keys, never hardcoded strings

---

## Quick Reference Facts

- **Mobile breakpoint**: `max-width: 839px` (`MediaQueryContext`'s `isMobileScreen`)
- **CSS breakpoint**: most `styled-components` use `max-width: 768px`
- **BottomNavBar height**: 66px + `safe-area-inset-bottom`
- **Routing**: every route is language-prefixed (`/it/dashboard`, `/en/dashboard`)
- **Current auth model**: system-generated user ID + password — no email collected
- **Sessions**: HTTP-only cookies; an axios interceptor handles 401s with automatic logout
- **Monetary values in the DB**: always stored in EUR, converted at display time via `CurrencyContext`
- **`preferredCurrency`**: stored in the DB as an index, mapped to a currency code via currency tags from `/tags/get`

---

## Testing Strategy

### Pyramid

```
          ╱╲
         ╱  ╲     Integration tests (cross-cutting, DI coverage)
        ╱────╲
       ╱      ╲   Context tests (providers, state)
      ╱────────╲
     ╱          ╲  Hook tests (custom hooks)
    ╱────────────╲
   ╱              ╲ Component tests (UI behavior)
  ╱────────────────╲
 ╱                  ╲ Unit tests (utils, services, calculations)
╱────────────────────╲
```

### Key Patterns

1. **Services** — Test with mock `apiClient` (injected via factory)
2. **Contexts** — Test with `<Provider>` wrappers and test consumers
3. **Components** — Test with `@testing-library/react`, mock contexts
4. **Utils** — Pure function tests, no mocking needed
5. **DI Coverage** — `diCoverage.test.js` audits architecture health

### Running Tests

```bash
npm test                # All tests
npm run test:coverage   # With coverage report
npm run test:utils      # Only utility tests
npm run test:contexts   # Only context tests
npm run test:components # Only component tests
```

---

## Code Quality Standards

### Mandatory Rules

1. **i18n** — All user-facing text in both `it.json` and `en.json`
2. **Selectors** — Access `userData` only through `userDataSelectors.js`
3. **Mock data** — Update `MockAuthContext.jsx` for new data structures
4. **Centralized colors/icons** — Use `assetColors.js`, `categoryColors.js`, etc.
5. **Currency** — Use `CurrencyContext` (never hardcode `€` or `EUR`)
6. **Outflows** — Use "outflows" (not "expenses") unless investments are excluded
7. **Routing** — Use `LocalizedLink` and `useLocalizedNavigate`
8. **API calls** — Use service layer via `useServices()` (not direct `axios`)

### Before Committing

```bash
npm run lint    # ✅ No lint errors
npm test        # ✅ All tests pass
npm run build   # ✅ Production build succeeds
```

---

## Contributing Guidelines

### Adding a New API Endpoint

1. Add method to appropriate service in `src/services/`
2. Add test in `src/__tests__/services/`
3. Update `diCoverage.test.js` if it's a new required method
4. Use via `useServices()` in components

### Adding a New Feature

1. Create component in `src/components/` or page in `src/pages/`
2. Add translations to both `it.json` and `en.json`
3. Use selectors for `userData` access
4. Use `CurrencyContext` for monetary values
5. Add tests
6. Update `MockAuthContext.jsx` if new data is needed

### Adding a New Context

1. Create in `src/contexts/`
2. Add to provider hierarchy in `src/index.jsx` (order matters!)
3. Add tests in `src/__tests__/contexts/`
4. Document purpose in this file
