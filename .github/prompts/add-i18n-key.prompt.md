---
mode: agent
description: Adds one or more translation keys to it.json and en.json
---

Add the following translation keys to both locale files:

## Keys to add
<!-- list the keys and values here: -->
- `section.subkey` — IT: "..." / EN: "..."

---

## Process

1. **Read the context** — check whether the section already exists in `it.json` and `en.json`
2. **Add to `src/i18n/locales/it.json`** — in the correct section (do not duplicate sections)
3. **Add to `src/i18n/locales/en.json`** — same key path, text in English
4. **Verify structure** — the keys must exist identically in both files
5. **Use the new keys** in the component: `translations.section.subkey`

## Key rules
- camelCase for all levels: `dashboard.weeklyChart.noData`
- Existing sections: `common`, `errors`, `navigation`, `dashboard`, `profile`, `settings`, 
  `auth`, `goals`, `limits`, `assets`, `incomes`, `outflows`, `rankings`, `roadmap`, `landing`
- If the section does not exist, add it as a new object

## Verification
```bash
# Check that the keys are balanced (same number of keys in both files)
npm run lint
```
