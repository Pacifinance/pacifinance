---
mode: agent
description: Scaffolding completo di una nuova pagina PaciFinance
---

Crea una nuova pagina PaciFinance seguendo questo checklist verticale (tutto in un'unica pass):

## Input richiesti
- **Nome pagina**: (es. `AnalysisPage`)
- **Route path**: (es. `/analysis`)
- **Descrizione**: cosa fa la pagina

---

## Steps da eseguire

### 1. Crea il file pagina
`src/pages/{NomePagina}.tsx`

Struttura minima:
```tsx
import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { CurrencyContext } from '../contexts/CurrencyContext';
import { Helmet } from 'react-helmet-async';

const {NomePagina} = () => {
  const { userData, isLoading } = useContext(UserContext);
  const { translations } = useContext(LanguageContext);
  const { formatAmount } = useContext(CurrencyContext);

  if (isLoading || !userData) return <div>Loading...</div>;

  return (
    <>
      <Helmet>
        <title>{translations.{sezione}.pageTitle} — PaciFinance</title>
        <meta name="description" content={translations.{sezione}.pageDescription} />
      </Helmet>
      {/* contenuto */}
    </>
  );
};

export default {NomePagina};
```

### 2. Aggiungi la route in `src/AppRouter.tsx`
```tsx
const {NomePagina} = React.lazy(() => import('./pages/{NomePagina}'));
// Nella definizione Routes:
<Route path="/:lang/{route-path}" element={<{NomePagina} />} />
```

### 3. Aggiungi i18n keys in entrambi i file
`src/i18n/locales/it.json`:
```json
"{sezione}": {
  "pageTitle": "...",
  "pageDescription": "..."
}
```
`src/i18n/locales/en.json`: stessa struttura, testo in inglese

### 4. Aggiungi navigazione (se serve)
In `BottomNavBar.tsx` o nei link esistenti — usa `<LocalizedLink to="/{route-path}">`.

### 5. Crea il test smoke
`src/__tests__/pages/{NomePagina}.test.tsx`:
```tsx
it('renders without crashing with mock data', () => {
  render(<{NomePagina} />, { wrapper: MockProviders });
  expect(screen.getByRole('main')).toBeInTheDocument();
});
```

### 6. Verifica finale
```bash
npm run lint && npm test && npm run build
```
