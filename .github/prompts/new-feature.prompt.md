---
mode: agent
description: Implementa una nuova feature completa (vertical slice)
---

Implementa la seguente feature con vertical slice completo:

## Feature da implementare
<!-- descrivi qui la feature -->

---

## Vertical Slice Checklist

Una feature è completa solo quando TUTTI questi layer sono pronti:

### Layer 1 — Data & API
- [ ] Nuovo endpoint o campo API identificato
- [ ] Aggiornato `UserContext.tsx`: chiamata API + set in userData
- [ ] Nuovo/i selector in `src/utils/userDataSelectors.ts`
- [ ] Mirroring in `MockAuthContext.tsx`

### Layer 2 — Business Logic
- [ ] Funzioni pure in `src/utils/` (no React, no context)
- [ ] Test scritti **prima** del codice (negative cases first):
  - null/undefined input
  - valori boundary (0, negativo, max)
  - caso errore API

### Layer 3 — UI
- [ ] Component/Section in `src/components/` o `src/sections/`
- [ ] Nessun testo hardcoded → chiavi i18n
- [ ] Nessun importo hardcoded → `formatAmount()`
- [ ] Nessun colore hardcoded → `getAssetColor()` / `getCategoryColor()`
- [ ] Routing con `LocalizedLink` / `useLocalizedNavigate`
- [ ] Se la feature ha interazioni → `data-umami-event="..."` sui trigger principali
- [ ] Se la feature mostra valori finanziari → compatibile con `PrivacyContext` (`isPrivate`)
- [ ] Se la feature è user-facing → aggiornare SEO (`<Helmet>` title/description)
- [ ] Se la feature salva dati → verificare che esiste export/import in `DataImportWizard`
- [ ] Se la feature è un traguardo/milestone → considerare hook gamification (badge in `GamificationSection`)

### Layer 4 — i18n
- [ ] Tutte le nuove chiavi in `it.json`
- [ ] Tutte le nuove chiavi in `en.json`

### Layer 5 — Roadmap (se user-facing)
- [ ] `scripts/roadmap-items.json` aggiornato
- [ ] `todo.md` aggiornato
- [ ] `npm run roadmap` eseguito

### Verifica finale
```bash
npm run lint && npm test && npm run build
```

## Note
- Mai iniziare il Layer 3 prima che Layer 1+2 siano completi e testati
- Se la feature tocca i saldi/investimenti: verifica compatibilità con `PrivacyContext`
- Se la feature ha grafici: usa `recharts` (già installato), rispetta le palette di `assetColors`/`categoryColors`
