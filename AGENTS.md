# Pacifinance Agent Instructions

These instructions apply to the entire repository. Keep work correct, scoped,
and economical in tool calls, elapsed time, and tokens.

## Start Here

1. Read the user's request, `git status --short`, the latest relevant commit,
   and the current diff before editing. Preserve all pre-existing work.
2. Inspect only files needed for the task. Prefer `rg`/`rg --files`; if `rg` is
   unavailable, use `grep`/`find`. Do not dump large files when a targeted
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

## Project Rules

- TypeScript: no new `any`; type props and API boundaries explicitly.
- UI text: never hardcode user-facing strings. Add identical key structures to
  every locale under `src/i18n/locales/` and run translation completeness tests.
- Routing: use `LocalizedLink` and `useLocalizedNavigate` for localized routes.
- Currency: database values are EUR; use `CurrencyContext` conversion/formatting
  helpers and never hardcode currency symbols.
- `userData`: access through `src/utils/userDataSelectors.ts`; mirror new fields
  in mock data.
- Preserve the context provider hierarchy documented in the scoped rules.
- API access belongs in services/contexts, not directly in components.
- Backend changes are allowed when required by the user's request; include
  validation, model/route tests, and an idempotent Supabase migration for schema
  changes.
- Never use destructive Git/filesystem commands without explicit authorization.
- Never run `git commit` or `git push` autonomously. The user performs both.

## Handoff

- State what changed, verification performed, warnings or required migrations,
  and any genuinely unfinished work.
- The final line of every completed update must be a single concise,
  imperative, open-source-friendly English commit message with no prefix,
  bullets, code formatting, or text after it.
