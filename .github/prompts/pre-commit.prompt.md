---
mode: ask
description: Complete checklist before committing a new feature
---

Before committing, check every point of this gate:

## 1. Build & Quality
- [ ] `npm run lint` — zero errors
- [ ] `npm test` — all tests pass
- [ ] `npm run build` — production build completed

## 2. i18n
- [ ] Every new UI string is in `src/i18n/locales/it.json`
- [ ] Every new UI string is in `src/i18n/locales/en.json`
- [ ] No hardcoded text (`"Salva"`, `"Save"`, etc.)

## 3. Currency
- [ ] No hardcoded `€` or `EUR` in JSX/TSX
- [ ] All amounts use `formatAmount()` from `CurrencyContext`
- [ ] User input converted with `toEUR()` before sending to the API

## 4. Data & State
- [ ] No direct access to `userData.balances[x]...` — use selectors
- [ ] If a field was added to `userData` → `MockAuthContext.tsx` also updated
- [ ] No API call outside `UserContext.tsx`

## 5. Routing
- [ ] No direct `<Link to="...">` — use `<LocalizedLink>`
- [ ] No direct `useNavigate()` — use `useLocalizedNavigate()`

## 6. Tests
- [ ] New tests added for the new functions in `utils/`
- [ ] Negative tests written before the happy path
- [ ] Selectors tested with null/undefined input

## 7. User-Facing Feature
- [ ] If the feature is visible to the user:
  - [ ] `scripts/roadmap-items.json` updated with `completedDate`
  - [ ] `todo.md` updated with `[x]` and `<!-- roadmap:id -->`
  - [ ] `npm run roadmap` executed → `src/data/roadmapData.js` regenerated

## 8. TypeScript
- [ ] No `any` — use explicit types or `unknown` + type guard
- [ ] Component props defined as `interface`

## 9. Commit Message
- [ ] The last line of the AI's response contains a short commit message in English, ready for the open source repository
- [ ] The commit message is clear, imperative, and describes the outcome of the update

If all points are ✅, you are ready to commit.
