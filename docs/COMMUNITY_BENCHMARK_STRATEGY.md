# Community Benchmark Strategy

## Product thesis

Pacifinance should not try to win by adding one more budgeting dashboard. Its
distinctive product is a private, explainable financial benchmark: help people
understand where they differ from genuinely comparable households and turn the
largest differences into questions they can act on.

The promise is not "spend less than everyone". A higher expense can be a
deliberate priority, and correlation does not prove that changing job, city or
investment strategy will improve someone's life. The product should show the
evidence, its sample, its uncertainty and the trade-off, then leave the decision
to the user.

## Competitive position

| Product | Documented strength | Gap Pacifinance can own |
| --- | --- | --- |
| YNAB | Intentional budgeting, targets, spending/net-worth reports | No first-class community cohort benchmark |
| Monarch Money | Polished account aggregation, flexible reports and Sankey cash flow | Reports explain the user's data, not their position among explainable peers |
| Copilot Money | Automated categorisation, budgets, recurring payments and investment tracking | Personal automation, not privacy-first community intelligence |
| Empower | Portfolio allocation, risk, retirement and savings planning | Investment-led and hosted; not an open, self-hostable peer network |
| Actual Budget | Privacy-first local budget and optional self-hosted sync | Strong data ownership, no opt-in community benchmark layer |
| Firefly III | Mature self-hosted personal-finance management and reporting | Single-instance analytics, no federated comparison network |

Sources checked July 2026:

- YNAB features: https://www.ynab.com/features
- Monarch reports: https://help.monarch.com/hc/en-us/articles/21846787088916-Using-Reports
- Copilot quick start: https://help.copilot.money/en/articles/11157550-quick-start-guide
- Empower tools: https://www.empower.com/tools
- Actual Budget reports/self-hosting: https://actualbudget.org/docs/tour/reports and https://actualbudget.org/docs/install/
- Firefly III: https://github.com/firefly-iii/firefly-iii

This comparison is intentionally based on official, publicly documented
features. Competitors may test or release additional functionality later.

## What the user should receive

### Explainable benchmark

Every result must disclose:

- period being compared;
- cohort size and minimum privacy threshold;
- profile dimensions used for that metric;
- update date;
- whether the result is a mean, median, percentile or trend;
- a low-confidence state when the sample is sparse.

Different questions need different cohorts. Career and work location matter
more for income; housing and household composition matter more for outflows;
age and experience matter more for accumulated net worth. The backend already
uses this metric-specific approach.

### Useful, neutral insights

Good insights are specific and traceable:

- "Housing is 14% above your comparable cohort; it explains 62% of your total
  spending gap."
- "Your income percentile improved from 58 to 42 over twelve months among the
  same career cohort."
- "Your savings rate is similar to peers, but your emergency runway is 1.8
  months shorter."
- "People in your work/experience cohort who work remotely report a different
  transport/housing mix." This is observational, not a causal promise.

Avoid generic praise, fabricated percentages and instructions to change job,
move city or buy an asset. Those decisions need scenario tools and explicit
assumptions, not motivational copy.

## Privacy model

The benchmark should be privacy preserving by construction:

1. Never expose users, rows or exact cohort membership to clients.
2. Exclude demo/test accounts and users who did not opt in.
3. Publish no cohort below the k-anonymity threshold (currently 20).
4. Bucket age, geography, experience and money values; do not send free text.
5. Return aggregate statistics only, preferably median and quartiles in
   addition to the mean.
6. Suppress or merge rare intersections that could identify a person.
7. Rate-limit queries and audit repeated cohort slicing to prevent differencing
   attacks.
8. Show consent, retention and deletion controls in plain language.

Differential privacy can be added once the population is large enough. Adding
noise too early can make a small dataset useless; k-anonymity, bucketing and
query controls are the practical first line.

## Hosted and self-hosted architecture

Self-hosting must work without Supabase cloud. Supabase is the current hosted
implementation, not the product's permanent storage contract.

### Fully local mode

- Frontend and API run locally through Docker; PostgreSQL stores all user data.
- Redis is optional. A local in-process cache can cover single-user installs.
- No Pacifinance account and no outbound traffic are required.
- Comparison features remain disabled unless the owner explicitly joins the
  community network.

A later desktop build can package the same frontend with a local API/database
(for example Tauri plus SQLite). Do this after repository interfaces separate
domain logic from Supabase/PostgREST; otherwise it creates a second backend to
maintain.

### Community comparison mode (opt-in)

The local instance computes a monthly contribution locally and sends only:

- schema/protocol version and a rotating installation pseudonym;
- selected demographic buckets;
- preferred currency and comparison period;
- rounded monthly totals and parent-category totals;
- derived ratios such as savings rate and emergency runway;
- data-quality indicators (months available, completeness), never transactions.

The hosted community service validates the payload, rejects impossible values,
aggregates it and returns signed benchmark snapshots. Raw contributions should
have a short retention period; aggregate releases should be versioned so a
self-hosted instance can explain exactly which dataset produced a result.

Users choose separately whether to contribute and whether to download community
benchmarks. Leaving the network deletes the pseudonymous contribution and does
not affect local functionality.

## Delivery roadmap

### Phase 1 - trustworthy comparison foundation

- Show cohort size, factors, privacy threshold and freshness in the UI.
- Remove demo/test accounts and fabricated insight copy.
- Add medians, quartiles and per-metric contributor counts to cached snapshots.
- Add explicit hosted-user consent and a minimum-history requirement.
- Track benchmark availability and usefulness without collecting financial
  values in analytics events.

### Phase 2 - actionable gaps

- Category contribution analysis: rank gaps by impact, not only percentage.
- Trends: compare the user against a stable cohort over 3/6/12 months.
- Emergency runway and fixed-cost ratio benchmarks.
- User-controlled cohort builder with a live sample-size/privacy indicator.
- "Why this cohort?" explanation for every card.

### Phase 3 - career and life scenarios

- Income distributions by job, experience, work arrangement and region.
- Cost-of-living-normalised comparisons, keeping nominal values visible.
- Scenario tool for a move or job change using ranges and assumptions.
- Separate household and individual views.
- Longitudinal, anonymous studies based only on consenting users with stable
  history; never imply causality from observational data.

### Phase 4 - federated community network

- Versioned aggregate contribution protocol for self-hosted installations.
- Signed benchmark snapshots and a public methodology document.
- Sybil resistance, contribution quality scoring and deletion workflow.
- Optional public aggregate datasets only where privacy thresholds permit.
- Community governance for metric definitions and bias audits.

## Defensibility

The code can be copied; trust and a useful longitudinal dataset are harder to
copy. The defensible asset should be the combination of:

- a transparent methodology that users and researchers can inspect;
- a privacy-preserving contribution network usable by hosted and self-hosted
  installations;
- clean canonical categories and investment instruments;
- longitudinal cohorts with consistent definitions;
- a community that improves mappings, bias checks and interpretation.

Do not create lock-in by withholding local functionality. Make participation
valuable because the network is trusted and useful.
