---
mode: agent
description: Complete scaffolding of a new Pacifinance page
---

Create a new Pacifinance page following this vertical checklist (all in a single pass):

## Required inputs
- **Page name**: (e.g. `AnalysisPage`)
- **Route path**: (e.g. `/analysis`)
- **Description**: what the page does

---

## Steps to execute

### 1. Create the page file
`src/pages/{PageName}.tsx`

Minimal structure:
```tsx
import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { Helmet } from 'react-helmet-async';

const {PageName} = () => {
  const { userData, isLoading } = useContext(UserContext);
  const { translations } = useContext(LanguageContext);
  const { formatAmount } = useContext(CurrencyContext);

  if (isLoading || !userData) return <div>Loading...</div>;

  return (
    <>
      <Helmet>
        <title>{translations.{section}.pageTitle} — Pacifinance</title>
        <meta name="description" content={translations.{section}.pageDescription} />
      </Helmet>
      {/* content */}
    </>
  );
};

export default {PageName};
```

### 2. Add the route in `src/AppRouter.tsx`
```tsx
const {PageName} = React.lazy(() => import('./pages/{PageName}'));
// In the Routes definition:
<Route path="/:lang/{route-path}" element={<{PageName} />} />
```

### 3. Add i18n keys in both files
`src/i18n/locales/it.json`:
```json
"{section}": {
  "pageTitle": "...",
  "pageDescription": "..."
}
```
`src/i18n/locales/en.json`: same structure, text in English

### 4. Add navigation (if needed)
In `BottomNavBar.tsx` or in existing links — use `<LocalizedLink to="/{route-path}">`.

### 5. Create the smoke test
`src/__tests__/pages/{PageName}.test.tsx`:
```tsx
it('renders without crashing with mock data', () => {
  render(<{PageName} />, { wrapper: MockProviders });
  expect(screen.getByRole('main')).toBeInTheDocument();
});
```

### 6. Final verification
```bash
npm run lint && npm test && npm run build
```
