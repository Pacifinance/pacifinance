---
mode: agent
description: Implements a complete new feature (vertical slice)
---

Implement the following feature as a complete vertical slice:

## Feature to implement
<!-- describe the feature here -->

---

## Vertical Slice Checklist

A feature is complete only when ALL of these layers are ready:

### Layer 1 — Data & API
- [ ] New endpoint or API field identified
- [ ] `UserContext.tsx` updated: API call + set in userData
- [ ] New selector(s) in `src/utils/userDataSelectors.ts`
- [ ] Mirrored in `MockAuthContext.tsx`

### Layer 2 — Business Logic
- [ ] Pure functions in `src/utils/` (no React, no context)
- [ ] Tests written **before** the code (negative cases first):
  - null/undefined input
  - boundary values (0, negative, max)
  - API error case

### Layer 3 — UI
- [ ] Component/Section in `src/components/` or `src/sections/`
- [ ] No hardcoded text → i18n keys
- [ ] No hardcoded amount → `formatAmount()`
- [ ] No hardcoded color → `getAssetColor()` / `getCategoryColor()`
- [ ] Routing with `LocalizedLink` / `useLocalizedNavigate`
- [ ] If the feature has interactions → `data-umami-event="..."` on the main triggers
- [ ] If the feature shows financial values → compatible with `PrivacyContext` (`isPrivate`)
- [ ] If the feature is user-facing → update SEO (`<Helmet>` title/description)
- [ ] If the feature saves data → verify that export/import exists in `DataImportWizard`
- [ ] If the feature is an achievement/milestone → consider a gamification hook (badge in `GamificationSection`)

### Layer 4 — i18n
- [ ] All new keys in `it.json`
- [ ] All new keys in `en.json`

### Layer 5 — Roadmap (if user-facing)
- [ ] `scripts/roadmap-items.json` updated
- [ ] `todo.md` updated
- [ ] `npm run roadmap` executed

### Final verification
```bash
npm run lint && npm test && npm run build
```

## Notes
- Never start Layer 3 before Layer 1+2 are complete and tested
- If the feature touches balances/investments: verify compatibility with `PrivacyContext`
- If the feature has charts: use `recharts` (already installed), respect the palettes from `assetColors`/`categoryColors`
