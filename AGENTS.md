# Pacifinance Agent Instructions

These instructions apply to the entire repository and to every AI coding
tool working in it (this file is read natively by most of them; see
"For tool-specific files" at the bottom for the rest). Keep work correct,
scoped, and economical in tool calls, elapsed time, and tokens.

## Start Here

1. Read the user's request, `git status --short`, the latest relevant commit,
   and the current diff before editing. Preserve all pre-existing work.
2. Inspect only files needed for the task. Prefer `rg`/`rg --files`; if `rg`
   is unavailable, use `grep`/`find`. Do not dump large files when a targeted
   range or search is enough.
3. Read the matching scoped rule only when touching its area:
   - React UI: `.github/instructions/react-components.instructions.md`
   - Contexts: `.github/instructions/contexts.instructions.md`
   - i18n: `.github/instructions/i18n.instructions.md`
   - Utils/data: `.github/instructions/utils-data.instructions.md`
   - Tests: `.github/instructions/testing.instructions.md`
4. Use a repository skill from `.agents/skills/` only when the request clearly
   matches it. Do not load unrelated skills or references.

## Cost- and Token-Efficient Workflow

- Make reasonable, reversible assumptions; ask only when a missing decision
  would materially change the result or risk data.
- Batch independent read-only searches and checks. Avoid repeating commands or
  rereading unchanged content.
- Do not browse the web when repository code/docs can answer the question.
- Do not start the dev server, browser, Playwright, screenshots, or broad
  exploratory tooling unless the user explicitly requests it.
- Do not delegate to sub-agents unless the user explicitly asks for parallel
  agent work.
- Prefer the smallest complete change. Reuse existing components, services,
  types, translations, tests, and migrations instead of duplicating them.
- During iteration, run the narrowest relevant tests/lint. Before handing off a
  substantial completed change, run `npm run lint`, `npm test`, and
  `npm run build`. Do not rerun a successful check unless subsequent edits can
  affect it. Report pre-existing warnings separately from failures.
- Keep commentary short: state discoveries, blockers, and verification results;
  do not narrate routine commands. Keep the final response outcome-first.

## Architecture

```
src/
  components/   # Generic UI, reusable across unrelated features
  pages/        # Routes — assembles contexts + sections
  sections/     # Feature blocks tied to one domain/page
  contexts/     # Global state
  hooks/        # Reusable logic
  utils/        # Pure functions (selectors, routing, math)
  data/         # Static config (colors, icons, currencies, tags)
  i18n/         # locales/it.json, en.json, es.json, de.json, fr.json, pt-BR.json
  __tests__/    # Mirrors src/
scripts/        # Build-time automation (roadmap, versioning)
server/         # Express + Supabase backend — a normal part of the codebase,
                # not off-limits; see "Project Rules" below for its own bar
```

**components/ vs sections/ — the test isn't "does it use a context?", it's
"which domain does it belong to?"** A component can live in `components/`
even while reading a context, as long as that context is cross-cutting/UI-level
(`LanguageContext`, `ThemeContext`, `ToastContext`) and not business data
(`UserContext`, data from a specific domain like investments/transactions).
The real criterion:
- **`components/`** — generic, reusable across unrelated features (e.g.
  `LocalizedLink`, `ThemedSelect`, `AvatarIcon`, `CategoryPicker`,
  `LanguageSelector`, `ScrollNavigationIndicator`, `PWAInstallGuide`,
  `ImportPlatformGuide`). If it reads a context, it must be only for a
  cross-cutting need (language/theme/toast), never to fetch domain data (e.g.
  `useDemoServices`, calls to `services/*`).
- **`sections/`** — tied to a specific domain/feature (transactions,
  investments, goals), even if reused in 2+ places within the same domain
  (e.g. `InvestmentHoldingsPanel` is reused but stays investment-specific →
  stays in `sections/`).

When adding a new file or moving an existing one, apply this test instead of
just checking whether it imports a context.

**Context hierarchy (fixed order):**
```
MediaQuery > Language > Theme > DevMode > User > Currency > Page > Privacy > Toast
```

## Project Rules

1. **i18n** — every UI string in all six `src/i18n/locales/*.json` files
   (`it`, `en`, `es`, `de`, `fr`, `pt-BR`). Never hardcoded. Run the
   translation-completeness tests after adding keys.
2. **Routing** — `LocalizedLink` (not `Link`), `useLocalizedNavigate` (not
   `useNavigate`).
3. **Currency** — DB is always EUR. Display via `formatAmount()` from
   `CurrencyContext`. Never hardcode `€`.
4. **Selectors** — access `userData` only via
   `src/utils/userDataSelectors.ts`.
5. **Mock & demo data** — every new `userData` field → update `MockAuthContext.tsx` (local dev). Every new feature that reads through `useDemoServices()` (`src/hooks/useDemoServices.ts`) or `generateDemoData()` (`src/data/demoData.ts`) → add realistic populated data for it there too, not an empty array. The public demo account (`/dashboard` via "Try Demo") is how a stranger decides whether to sign up — it must stay full, not just structurally correct. An empty state in the demo isn't neutral, it reads as "this feature doesn't work."
6. **Colors/Icons** — `getAssetColor()`, `getCategoryColor()` from
   `src/data/`. Never hardcoded.
7. **Outflows not expenses** — always "outflows". Use "expenses" only when
   investments are excluded.
8. **Roadmap** — completed user-facing feature → `roadmap-items.json` +
   `todo.md` + `npm run roadmap`.
9. **Changelog** — every user-facing change → a line under `[Unreleased]` in
   `CHANGELOG.md`. Release steps (version bump + tag) are documented there
   under "Versioning policy".
10. **No `any`** — TypeScript strict. Props as `interface`.
11. **Backend** — `server/` is a normal part of the codebase, not
    off-limits. Backend changes are allowed when the request needs them;
    include validation, model/route tests, and an idempotent Supabase
    migration for schema changes.
12. **User-owned data domains** — a new table with a `user_id`/owner FK to
    `auth.users` (a new feature's data) must: (a) get an entry in
    `server/src/libs/userDataDomains.ts` (`USER_DATA_DOMAINS`, or
    `EXCLUDED_MODELS` with a stated reason) — this is what drives the GDPR
    data-export endpoint (`POST /api/user/alldata`) and is checked by
    `server/__tests__/userDataDomains.test.ts`, which fails if a `db/db.ts`
    model is registered in neither list; (b) use `on delete cascade` on that
    FK, checked by `server/__tests__/userDataCascadeGuard.test.ts` (account
    deletion is one Supabase Auth delete relying entirely on cascades — no
    per-table cleanup code exists to remember to write). Both tests exist
    because both flows silently drifted out of sync with the schema over
    time before this rule; don't let it happen again by skipping either
    entry when adding a table.
13. **Git** — never run `git commit`, `git push`, or create/push git tags
    autonomously; the user performs all three. The final line of every
    completed update must be a single concise, imperative,
    open-source-friendly English commit message, no prefix, bullets, code
    formatting, or text after it.

## Key Files

| File | Purpose |
|---|---|
| `src/AppRouter.tsx` | All routes (lazy-loaded for non-critical pages) |
| `src/contexts/UserContext.tsx` | All API calls + the `userData` shape |
| `src/contexts/MockAuthContext.tsx` | Dev mock — mirrors `UserContext` |
| `src/utils/userDataSelectors.ts` | The only access point for `userData` |
| `src/utils/i18nRouting.ts` | `LocalizedLink`, `useLocalizedNavigate` |
| `src/i18n/languagesConfig.js` | Single source of truth for supported languages |
| `src/data/currencyConfig.ts` | 19 currencies + fallback rates |
| `scripts/roadmap-items.json` | Public roadmap source |
| `CHANGELOG.md` | Version history + release process |
| `server/src/libs/userDataDomains.ts` | Registry of every user-owned data domain — drives GDPR export + cascade-delete guard tests |

## userData Shape

```ts
{ userId, userType, currency,
  profile: { nationality, job, age, preferredCurrency: { key, value } },
  balances: [{ date, balance: { bank, cash, stocks, etf, crypto, realEstate, other } }],
  expenses: { allOutflows, outflowsArray, totalOutflowsPerCategoryPerMonth },
  incomes: { allIncomes, incomesArray },
  tags: { outflowsTags, incomesTags, paymentTags, currencyTags },
  rankings: { balance, incomes, outflows, balanceSimilar, ... },
  dates: { current, preMonth, preYearSameMonth },
  goals, limits, assets, averages }
```

## Do Not

- Use `Link` or `useNavigate` directly (use the localized wrappers).
- Hardcode `€`, `EUR`, or hex colors for financial data or UI text.
- Access `userData.property` without a selector.
- Make API calls outside `UserContext.tsx`.
- Add success toasts for normal operations.
- Use `.toISOString().split('T')[0]` (UTC midnight bug).
- End an update without a final commit message in English.
- Never run `git commit`, `git push`, or create/push git tags autonomously.The user performs both.
- Start the dev server / browser on your own initiative for extra checks —
  only if explicitly requested.

## Handoff

- State what changed, verification performed, warnings or required
  migrations, and any genuinely unfinished work.
- The final line of every completed update must be a single concise,
  imperative, open-source-friendly English commit message with no prefix,
  bullets, code formatting, or text after it.

## For tool-specific files

`CLAUDE.md` and `.github/copilot-instructions.md` both just import this file
(`@AGENTS.md`) plus whatever their tool needs on top of it (Copilot also
uses path-scoped `.github/instructions/*.instructions.md` and reusable
`.github/prompts/*.prompt.md`, which AGENTS.md doesn't have a mechanism
for). If your tool doesn't read AGENTS.md natively, read this file directly.
