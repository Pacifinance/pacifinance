# AI-Ready Repository Setup
### How to structure any TypeScript/React project for optimal AI-assisted development

> Portable guide. Copy to any repo, adapt paths and project-specific details.
> Companion files in `.github/instructions/`, `.github/prompts/`, `.agents/skills/`.

---

## Why This Matters

AI coding assistants (Copilot, Claude, Cursor) load context on every request. If your instructions are monolithic (1000+ line files), the AI burns most of its context window on rules that don't apply to the current file. This guide structures knowledge so only relevant rules load at the right moment.

**Goal**: Maximize signal-to-noise ratio in every AI prompt.

---

## 1. File Structure

```
.github/
  copilot-instructions.md     # Master file — LEAN (~200 lines max)
  instructions/               # Scoped rules (loaded per file type)
    react-components.instructions.md
    testing.instructions.md
    i18n.instructions.md
    lib-utils.instructions.md
    contexts.instructions.md
    supabase.instructions.md   # Or your backend/DB layer
  prompts/                    # Reusable task templates
    new-feature.prompt.md
    pre-commit.prompt.md
    add-i18n-key.prompt.md
    new-page.prompt.md
.agents/
  skills/                     # Multi-step autonomous workflows
    fix-bug/SKILL.md
    code-review/SKILL.md
    test-driven/SKILL.md
CLAUDE.md                     # Auto-loaded by Claude Code
docs/
  architecture.md
  sync_strategy.md            # Or equivalent
```

---

## 2. The Master Instructions File (`copilot-instructions.md`)

**Rule**: Max ~200 lines. Covers only project-wide invariants. Everything else goes in scoped files.

### What belongs here
- Project identity (1 line)
- Env file access rules
- Non-negotiable post-change workflow (`npm test && npm run build`)
- Core architecture (context hierarchy, directory responsibility table)
- Critical constraints that apply to EVERY file (dates, navigation, toasts, etc.)
- References to scoped files ("full rules in `X.instructions.md`")

### What does NOT belong here
- Long code examples → move to scoped instruction files
- Framework-specific rules → move to `.github/instructions/`
- One-time workflows → move to `.github/prompts/`

### Template structure
```markdown
# Copilot Instructions — [Project Name]

> [One-line project description]. [Stack]. [Deploy target].
> Detailed rules live in scoped `.github/instructions/` files.

---

## Env Files
[2-row table: .env.example safe, .env NEVER]

## After Every Change
[npm test + npm run build — 2 lines]

## Architecture
[Directory responsibility table — 5 rows]

## Critical Rules
[~10 non-negotiable bullets]

## Key Files Reference
[Table of ~10 most-referenced files]

## Scoped Rules
[Table mapping .instructions.md files to applyTo patterns]
```

---

## 3. Scoped Instruction Files

Each file loads ONLY when editing matching files (`applyTo` frontmatter).

```markdown
---
applyTo: "src/components/**, src/pages/**"
---
## Component Rules
[Only rules relevant to components]
```

### Files to create for a React/TypeScript project

| File | `applyTo` | Contents |
|------|-----------|----------|
| `react-components.instructions.md` | `src/components/**,src/pages/**` | Props-only components, no context imports, ARIA, shared utilities list |
| `testing.instructions.md` | `src/test/**` | TDD rules, mock patterns, coverage requirements |
| `lib-utils.instructions.md` | `src/lib/**` | Pure functions, no React, no side effects, reuse over duplicate |
| `contexts.instructions.md` | `src/contexts/**` | Context hierarchy, DI patterns, no cross-context imports |
| `i18n.instructions.md` | `src/i18n/**` | Key naming, locale files, fitness/domain terminology |
| `supabase.instructions.md` | `supabase/**,src/hooks/useSync*` | Column selection, error checking, LWW patterns |

---

## 4. Prompt Files (`.github/prompts/`)

Reusable templates invoked with `Ctrl+Shift+P → Chat: Run Prompt File` (Copilot) or `/file` (Claude).

### Must-have prompts

**`new-feature.prompt.md`** — The full checklist before creating any feature:
- i18n keys to all locales
- At least 1 achievement/gamification hook
- SEO/FAQ update if user-facing
- Export/Import if it stores data
- Tests (negative cases first)
- CHANGELOG entry

**`pre-commit.prompt.md`** — Gate before every commit:
- `npm test && npm run build`
- Self-review checklist (i18n, dates, navigation, tests, CHANGELOG)

**`add-i18n-key.prompt.md`** — Batch-add translation keys across all locales
**`new-page.prompt.md`** — Scaffold a new page with layout, SEO, i18n, route

---

## 5. Skill Files (`.agents/skills/`)

Multi-step workflows the AI executes autonomously. Unlike instructions (passive rules), skills are active procedures.

### Template structure
```markdown
# Skill: [Name]

## Purpose
[One line: what this skills does and why]

## Trigger
Use when: [specific phrases / scenarios that should invoke this skill]

## Instructions
[Numbered phases with concrete steps]

## [Domain-specific tables]
[Known patterns, common errors, etc.]
```

### Must-have skills

**`fix-bug/SKILL.md`**:
1. Reproduce → 2. Diagnose → 3. Fix minimal → 4. Verify no regressions → 5. Document
Include: known bug pattern table (common mistakes in YOUR codebase)

**`code-review/SKILL.md`**:
Correctness → Security (OWASP) → Performance → Conventions → Tests → i18n
Include: auto-fail conditions (hardcoded strings, `any` type, missing error checks)

**`test-driven/SKILL.md`**:
Red → Green → Refactor loop. Negative cases first template. 
Include: domain-specific test examples (your business logic)

---

## 6. CLAUDE.md

Auto-loaded by Claude Code at session start. Compact version of copilot-instructions.md.

**Rules**:
- Max 150 lines
- Ordered: Quick Commands → Architecture → Critical Rules → Key Files → DO NOT list
- No verbose explanations — single-line facts and code snippets only

**Template**:
```markdown
# [Project] — Claude Code Context

## Quick Commands
[4-5 most-used commands]

## Architecture
[Directory tree, context hierarchy]

## Critical Rules
[10-15 non-negotiable bullets with code snippets]

## Key Files
[Table: file → purpose]

## DO NOT
[8-10 hard prohibitions]
```

---

## 7. Testing Strategy (TDD-First)

The AI must be able to verify everything it writes. Tests are the AI's feedback loop.

### Principle: Negative cases define the contract

```
Write tests in this order:
1. Empty / null / invalid input
2. Boundary values (0, 1, max-1, max)
3. Duplicate / repeated / idempotent input
4. Async failure / network error
5. Happy path (last)
```

If a function has an `if`, it has at least 2 tests. If it touches a date or timezone, it has 3.

### Red → Green → Refactor
```
Red:      Write failing test → confirm it fails
Green:    Write minimum code to pass → no extras
Refactor: Clean only after all tests pass
```

**For AI**: "Minimum code" means the test passes. If a hardcoded return value works, use it — the next test will force real logic. This prevents AI from over-engineering early.

### Coverage expectations
| Layer | Target |
|-------|--------|
| `lib/` pure functions | 100% line coverage |
| Business logic (state machines, engines) | >90% |
| Context critical paths | >80% |
| UI components | Smoke test only |

---

## 8. Architecture Principles

### Vertical Slices (MANDATORY)

Never work in horizontal layers. Every feature is complete only when ALL layers ship together.

| ❌ Wrong | ✅ Right |
|---------|---------|
| "First the DB schema" | Schema + sync + UI + test in one pass |
| "Tests come after" | Test written with the feature |
| "I'll wire UI next time" | Full slice or don't start |

**A feature is complete when**: `data model` + `business logic` + `UI` + `i18n keys` + `test`

### Directory responsibilities
```
lib/        → Pure functions. No React. No side effects. Testable in isolation.
hooks/      → Reusable logic. DI via params, not context imports.
contexts/   → State management. No cross-context imports.
components/ → Presentation only. Props, no context.
pages/      → Assembly. Can import everything.
```

### State management hierarchy (enforce strictly)
If you use React Context, define the order and never change it. Cross-context dependencies create circular imports and untestable components.

```
Settings → i18n → Audio → Timer → Reps → MediaPlayer → Achievements → Groups → Plans
```

---

## 9. Code Quality Invariants

These never change regardless of who writes the code (human or AI):

- **TypeScript strict** — `"strict": true` in tsconfig. No `any`. All props are typed interfaces.
- **No hardcoded user-facing strings** — i18n key or nothing.
- **No `useEffect` writing to persisted/synced state** — only explicit save handlers write.
- **Dates always local** — Never `.toISOString().split('T')[0]` (UTC bug at midnight).
- **localStorage before navigate** — Pages read state on mount, not from navigation params.
- **Toasts only for errors** — No success toasts for normal operations.
- **Optimistic updates** — After mutations, update local state. Don't re-fetch.
- **Select columns explicitly** — Never `select('*')` on any DB query.

---

## 10. Adapting This Setup to a New Repo

### Checklist
1. Copy `.github/copilot-instructions.md` → replace project-specific sections
2. Copy `.github/instructions/*.instructions.md` → update `applyTo` paths and project rules
3. Copy `.github/prompts/*.prompt.md` → adapt checklists to project's conventions
4. Copy `.agents/skills/*.SKILL.md` → update known bug patterns table to match your codebase
5. Create/update `CLAUDE.md` in repo root
6. Set `"strict": true` in `tsconfig.json`
7. Configure test coverage thresholds in `vitest.config.ts` or `jest.config.ts`

### Minimum viable setup (30 minutes)
If you can't do everything, prioritize:
1. `copilot-instructions.md` lean master file
2. `testing.instructions.md` with TDD rules
3. `fix-bug/SKILL.md` with your known bug patterns
4. `pre-commit.prompt.md` with your project's gates
5. `CLAUDE.md` with Quick Commands

---

## 11. On the PRD → Kanban → Implementation Workflow

The video-recommended workflow (Idea → Research → Prototype → PRD → Kanban → Implementation → QA) maps naturally to this setup:

| Step | Tool |
|------|------|
| Idea | Discussion / notes |
| Research (optional) | Create `docs/research-[feature].md` to cache findings for AI |
| Prototype (optional) | Temporary branch, throw-away code |
| PRD | `new-feature.prompt.md` generates the spec |
| Kanban | `TODO.md` with `[ROADMAP:key:status]` tags = tickets |
| Implementation | Vertical slice per TODO item |
| QA / Code Review | `code-review/SKILL.md` + `pre-commit.prompt.md` |

**When it's most useful**: Large features (>1 day of work) benefit from writing a PRD first. The AI has full context before writing a single line of code. For small features (< 2 hours), skip PRD and go directly to vertical slice.

---

## 12. Security Baseline (OWASP Top 10)

Integrate into `code-review/SKILL.md`:

| Risk | What to check |
|------|--------------|
| Injection | No string interpolation in DB queries, no `eval`, no `dangerouslySetInnerHTML` without sanitization |
| Auth | Protected routes check session, not just UI-hidden |
| Sensitive data | No secrets in code, no PII in localStorage without encryption |
| XSS | User input never rendered as raw HTML |
| CSRF | State-changing API calls use authenticated sessions |
| Dependency vulnerabilities | `npm audit` in CI |
| Access control | Row-level security on all user data tables (Supabase RLS) |

---

*Generated for ADASTRAfit. Adapt freely to any TypeScript/React project.*