# Product Vision & Long-Term Roadmap

This document is the long-term vision for Pacifinance: what the product should
become beyond tracking balances, income and outflows, and a guide for
contributors and supporters deciding where to invest effort. It is not a
sprint plan.

- For near-term, already-scheduled work, see [todo.md](../todo.md) (phase-based, tracks what ships next).
- For ready-to-implement technical sketches, see [FUTURE_DESIGNS.md](FUTURE_DESIGNS.md).
- For the benchmark/comparison product strategy specifically, see [COMMUNITY_BENCHMARK_STRATEGY.md](COMMUNITY_BENCHMARK_STRATEGY.md).
- For the decided product/licensing/comparison-model constraints, see [OPEN_SOURCE_PRODUCT_CHARTER.md](OPEN_SOURCE_PRODUCT_CHARTER.md).

Everything below is a direction, not a promise. Priorities can move as the
user base, data volume and contributor availability change.

## Vision statement

Pacifinance should grow from "this is what you did" into a system that also
explains *why it matters* and *what would change it*: simulate decisions
before making them, keep a real history of a financial life, and turn raw
numbers into explainable facts — with or without AI.

## Now / Next / Later / Research

A flat TODO list stops being useful once it has thirty items that all look
equally urgent. This roadmap uses four buckets instead:

| Bucket | Meaning |
| --- | --- |
| **Now** | Actively planned for the current cycle — tracked in [todo.md](../todo.md), not repeated here. |
| **Next** | Agreed direction, design not finalized. A contributor can start here. |
| **Later** | Valuable, but depends on a Next-tier foundation landing first. |
| **Research** | Exploratory. No commitment yet — needs more users, more data, or more design work before it can move to Later. |

---

## 1. Complete net worth: generic assets — **Next**

Today's balance model (`bank`, `cash`, `stocks`, `etf`, `crypto`, `realEstate`,
`other` — see the `userData` shape in [CLAUDE.md](../CLAUDE.md)) covers
liquidity and financial instruments well, but has no place for personal
property with real, if illiquid, value.

Build one generic **Asset** entity instead of separate models per property
type. Initial categories: real estate, vehicles, collectibles, trading cards,
watches, jewelry, art, electronics, tools, other.

Each asset should carry: custom name, category, subcategory/tags,
description, estimated value, currency, purchase price, purchase date,
last-valuation date, liquidity level, optional encrypted notes, and room for
photos/documents later.

Valuation is manual by design — nobody needs an automatic Rolex price feed.
The user updates the estimate whenever they want ("Rolex Submariner — €8,000 —
updated 3 months ago"). On top of the manual value, add: a valuation history,
a value-over-time chart, an optional reminder for stale valuations, and a
"last valued X months ago" indicator.

This feeds directly into net worth (§2): `Net Worth = total assets − total
liabilities`, with liquid vs. illiquid, composition, concentration and
month/year deltas shown from one place.

## 2. Personal scenario simulations — **Next / Later**

A **Scenario / Sandbox** mode, fully separate from real data: nothing here
touches the actual financial profile.

Simulate: a raise or pay cut; a new recurring income; a new recurring
expense; removing or shrinking an expense; a change in savings rate; a new
monthly investment; buying or selling an asset; paying down or increasing a
debt; a change in housing costs; building an emergency fund.

Every scenario always shows **current situation vs. scenario**, with: net
worth, liquidity, investments, monthly/annual savings, cash flow, a future
timeline, and the absolute + percentage difference. Scenarios can be saved,
renamed, duplicated and compared against each other.

This depends on the Financial Context Engine (§3) for its inputs — build
enough of that engine to get consistent numbers before scenarios ship.

## 3. Financial Context Engine — **Next / Later**

Likely the single most important architectural piece here: a central module
that turns raw rows into financial *facts*, instead of every consumer
recomputing its own version of "savings rate" or "emergency fund".

Instead of handing 900 raw transactions to a dashboard widget (or an AI
prompt), the engine produces statements like:

```
Savings rate: 17.3%
Last 3 months: +2.1 points
Restaurants: +18% vs. personal yearly average
Emergency fund: 4.2 months
```

Consumers: the dashboard, the Opportunity Engine (§6), scenario simulations
(§2), benchmarks, notifications, and — only as one more consumer, never the
source of truth — AI (§8). Keeping financial logic in this engine, and out of
any AI call, is what makes the numbers verifiable and provider-independent.

## 4. Financial timeline & Financial Replay — **Later**

**Timeline**: a real story of a financial life, built from a generic
`financial_events` system (auto-generated or user-entered) — new job, raise,
job loss/change, home purchase, asset bought/sold, a significant investment,
a goal reached, new debt, debt paid off, a large net-worth swing, a savings
milestone. Frontend: a vertical/chronological timeline with filters, year/
month zoom, and milestone highlighting.

**Financial Replay**: answer "what did my finances look like on January 1st,
2025?" via periodic snapshots and historical-state reconstruction — net
worth, cash flow, investments, assets, debts, and whichever benchmarks were
available at that time — plus a built-in "today vs. one year ago" comparison.

## 5. Financial Health Engine — **Later**

Avoid a mysterious "score: 72/100" — a black-box number nobody can act on.
Prefer separate, explainable indicators: savings rate, emergency fund,
debt-to-income, fixed costs / income, available liquidity, asset
diversification, net worth growth, asset concentration, and recurring-expense
sustainability.

Every indicator must explain: **value → what it means → how it evolved →
benchmark**. No indicator ships without that explanation attached.

## 6. Opportunity Engine — **Later**

Moves the product from "here is what you did" to "here is what would move
the needle most." Examples: "cutting X by 10% would save €Y/year"; "selling
this asset would raise your liquidity by X"; "this recurring expense is Y% of
your income"; "saving an extra €100/month would hit goal X, N months
sooner."

Must be **rule-based and deterministic** at first — no AI in the loop for
these numbers, for the same reason as §3.

## 7. Context-based & community simulations — **Later** (extends the existing benchmark roadmap)

City, country, job/sector and salary-band comparisons, cost-of-living
normalization, income/spending distribution comparisons, and the geographic
"Financial Twin"/Community Insights concept are largely already scoped in
[COMMUNITY_BENCHMARK_STRATEGY.md](COMMUNITY_BENCHMARK_STRATEGY.md) (see
"Phase 3 — career and life scenarios" and "Phase 4 — federated community
network") and in [todo.md](../todo.md) Phase 4. This vision adds one
sourcing detail worth keeping: seed cost-of-living and income comparisons
from public official datasets (ISTAT, Eurostat, or equivalent per-country
sources) before Pacifinance's own cohorts are large enough to be
statistically meaningful, and always label a comparison with its source,
year, sample size and reliability — regardless of whether the source is
public data or a Pacifinance cohort. Only surface a Pacifinance-only
benchmark once the cohort clears the same privacy floor already defined in
[PRIVACY_ANONYMITY.md](PRIVACY_ANONYMITY.md).

## 8. AI: optional, local-first, bring-your-own — **Research / Later**

Foundational principle: **Pacifinance must work completely without AI.** AI
is an extension, never a dependency of a core feature.

Pipeline (also see §3 and §14-equivalent principle below):

```
Database → Financial Engine → deterministic results → Context Engine → AI → explanation
```

The code computes; AI interprets and communicates. This bounds hallucination
risk and avoids provider lock-in, because the numbers never depend on what
the model says.

**Local AI**: support local providers behind a common API shape (e.g.
Ollama-compatible endpoints) first. Needs: an `AIProvider` interface, local
endpoint configuration, model selection, a connection test, timeout/
fallback behavior, a full-disable switch, and a hard guarantee that no data
leaves the device in this mode.

**Bring Your Own AI** (hosted/web version): the user supplies their own API
key; Pacifinance does not pay for or proxy inference cost. Providers are
adapters behind the same interface (`LocalProvider`, `OpenAIProvider`,
`AnthropicProvider`, others). Before first activation, show explicitly:
*"You are about to send financial information to an external service."*
Default: AI disabled. Offer graduated sharing levels — aggregate statistics
only; statistics + benchmark; or user-selected financial details — and avoid
sending raw transactions by default at every level.

## 9. Self-hosting & privacy architecture — **Research / Later** (extends existing docs)

The privacy rules, cohort thresholds and opt-in community-stats protocol for
self-hosted instances are already specified in
[PRIVACY_ANONYMITY.md](PRIVACY_ANONYMITY.md) and
[COMMUNITY_STATS_PROTOCOL.md](COMMUNITY_STATS_PROTOCOL.md), and the "fully
local mode" target (Docker, local Postgres, Redis optional, zero outbound
traffic unless the owner opts into the community network) is described in
[COMMUNITY_BENCHMARK_STRATEGY.md](COMMUNITY_BENCHMARK_STRATEGY.md).

The fully-local gap is closed: `scripts/self-host-local.sh` runs Supabase's
own self-hosting stack plus local Redis (`redis`/`redis-http` in
`docker-compose.yml`) alongside Pacifinance, so a self-hosted instance no
longer needs a cloud Supabase or Upstash account (see the README's "Fully
local Supabase" section). `DEPLOYMENT_MODE`/`DeploymentContext` now let the
frontend tell a self-hosted instance apart from the official deployment,
used today to give the Comparison page's benchmark opt-in card honest
self-hosted-instance copy instead of the hosted-community wording.

What's still open: the actual cross-instance community-stats network
transport. `server/src/services/communityStatsContribution.ts` maps
already-bucketed, already-rounded inputs into the envelope shape from
COMMUNITY_STATS_PROTOCOL.md, but nothing derives real privacy-safe buckets
from raw profile tags yet, there's no `installationPseudonym` generation or
signing, and pacifinance.com has no receiving endpoint to send a
contribution to. That remains real infrastructure work plus a privacy/
security review, not something to build without one.

---

## Contributor principles

[README.md](../README.md#core-principles) already states: privacy first,
anonymous by design, explainable benchmarks, self-hostable by default, and
open source with responsibility. The items below extend that list for
architecture and AI-adjacent work, and apply to anything under this
document:

- **Local-first when possible** — sensitive processing should be able to run
  entirely on the user's own instance.
- **Deterministic finance** — financial calculations that matter must be
  verifiable code, not a model's output. See §3, §6, §8.
- **AI optional** — no core feature may depend on an LLM being configured or
  reachable.
- **Provider agnostic** — avoid hard architectural dependence on Supabase,
  Vercel, or any single AI provider where a reasonable alternative exists.

A feature proposal under this roadmap should be able to name which of these
principles it relies on, and which it might strain.
