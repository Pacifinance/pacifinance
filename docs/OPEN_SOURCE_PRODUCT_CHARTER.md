# Pacifinance: product and open-source charter

This document is the decision record for the public project. It keeps the
hosted product, the self-hosted distribution and the community benchmark model
aligned.

## Product promise

Pacifinance helps people understand their money, spending and investments while
keeping their financial records under their control. It is not a trading venue,
broker, financial adviser or social network.

The public positioning is:

> Open-source personal finance analysis with privacy-safe comparisons.

The project competes on clarity, privacy, explainability and self-hosting, not
on the number of bank connections or investment products it can sell.

## Licensing and ownership

- Core application and server: GNU AGPLv3-or-later.
- Documentation: CC BY-SA 4.0 unless a document says otherwise.
- Product name, logo and Pacifinance domains remain project trademarks and are
  not granted by the source-code licence.
- The hosted service may add paid operations, support, backups and integrations
  without changing the licence of the core application.
- Contributions are accepted under the repository licence; no CLA is required
  until a real multi-maintainer governance need exists.

AGPL is intentional: a hosted fork of a modified Pacifinance must provide the
corresponding source to its users. This protects the commons while allowing
commercial hosting, support and integration work.

## Public terminology

Internal implementation names may use `cohort`, but user-facing text must use
**gruppo di confronto** (Italian), **comparison group** (English), or the
equivalent translation in the active locale.

| Internal concept | Public meaning |
| --- | --- |
| comparison group | Anonymous users selected by minimum profile criteria for one metric and period |
| general reference | Aggregate of all eligible consenting users, when the privacy floor is met |
| comparison metric | One question with its own population, period and data-quality rules |
| privacy floor | Minimum number of eligible contributors required before a result is shown |
| ranking | A percentile position among an eligible population, never a score of personal worth |

Every comparison card must state: what is measured, the period, the group size,
the privacy floor, freshness and whether the value is a median, average or
percentile.

## Comparison model

The product has three distinct views:

1. **Tu** — personal values and personal history. Always available.
2. **Gruppo di confronto** — an aggregate group selected from consenting users
   with comparable profile factors. Hidden until the privacy floor is met.
3. **Riferimento generale** — an aggregate community baseline. It is optional,
   less personalised and hidden when the eligible population is below the
   privacy floor.

The UI must never fill an unavailable comparison with a global value. “Not yet
available” is a valid result and is preferable to a misleading comparison.

## Rankings policy

Rankings are useful only for descriptive, stable metrics such as monthly saving
consistency or contribution regularity. They are not suitable for telling users
that they are financially “better” or “worse”.

The current ranking view is therefore transitional. Until its semantics are
rewritten, rankings must:

- use the same privacy floor as comparison groups;
- show period, population and metric direction;
- show `non disponibile` when the user has no eligible group;
- never rank a user against a small or non-consenting population;
- avoid motivational claims based on wealth or income alone.

The preferred long-term replacement is a **metric profile**: personal value,
group median, percentile (where statistically stable), and a neutral
interpretation. Rankings may remain as an optional secondary view, not the
primary product experience.

## Investment comparisons

Investment comparisons are useful when they describe behaviour and portfolio
composition, not when they encourage copying another user.

Suitable aggregate questions:

- percentage of users investing in a broad asset family: equities, ETFs, bonds,
  funds, bitcoin, crypto and commodities;
- median allocation by broad asset family, with a separate “not enough data”
  state;
- investing consistency: active months over the last 12 months;
- median monthly contribution;
- money-weighted return (XIRR) and time-weighted return (TWR), only when the
  history and cash-flow quality are sufficient;
- percentage of portfolios with verified prices versus estimated/manual values.

Avoid exposing:

- exact user holdings or quantities;
- rare instruments or narrow asset combinations;
- individual returns;
- “best investor” leaderboards;
- buy/sell suggestions or copy-trading language.

Asset families are intentionally broad. A group should not be able to infer
that one person owns a particular obscure token or security.

## Sustainability

The hosted service is the primary sustainability path: subscriptions can pay
for infrastructure, support, managed backups, convenience and integrations.
Donations and sponsorships are welcome but are not assumed to fund the whole
project. The self-hosted edition remains complete and useful without the hosted
community network.

## Phase-one release gates

Before a public announcement:

- complete a secret/history scan and rotate any exposed credential;
- verify that `.env*`, dumps, backups and real financial exports are not tracked;
- publish the privacy protocol, threat model and security reporting path;
- provide a reproducible demo mode and a documented self-host path;
- enable CI, dependency alerts, protected `main` and private vulnerability
  reporting;
- keep all public examples synthetic;
- document the hosted/self-hosted boundary and the AGPL notices.

This charter is a product constraint, not marketing copy: changes to
benchmarks, rankings, storage or monetisation should be reviewed against it.
