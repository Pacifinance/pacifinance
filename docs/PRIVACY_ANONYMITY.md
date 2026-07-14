# Privacy And Anonymity Model

Pacifinance's differentiator is anonymous financial comparison: helping a user understand how their balances, income, outflows, saving rate, and allocation compare with similar people without exposing anyone's private financial life.

This document is the product and engineering baseline for open-source work. If a feature conflicts with these rules, the feature should change.

## Goals

- Make personal finance understandable without public profiles.
- Support self-hosting without forcing any data contribution to a hosted service.
- Allow optional community benchmarks that are aggregate, anonymous, and explainable.
- Keep examples, tests, docs, and demo data synthetic.

## Data Classes

Private user data includes transactions, notes, merchants, account names, exact balances, salaries, profile fields, imports, exports, and authentication/session data. These values stay local to the user's instance or hosted account and must not be returned as peer data.

Community benchmark data should be derived from private data and transformed before aggregation. That means profile buckets, rounded monthly totals, ratios, parent-category totals, data-quality indicators, and cohort metadata.

Public data includes documentation, source code, synthetic fixtures, aggregate methodology, and release notes. Public data must never include real personal finance records.

## Anonymous Comparison Rules

1. Opt-in first: users must intentionally join any hosted/community benchmark flow.
2. Aggregate only: clients receive cohort metrics, not peer rows.
3. Minimum cohort size: results below the privacy threshold are unavailable, merged, or coarsened.
4. Bucket profile fields: age, experience, geography, work setup, housing, household, and similar fields should be grouped before use.
5. Round financial values: community metrics should use rounded amounts and ratios, not exact raw values.
6. Explain each result: show period, cohort size, freshness, algorithm version, and confidence where available.
7. Resist differencing: rate-limit repeated slicing and avoid arbitrary filters that can isolate a person.
8. Delete and revoke: contribution controls should be clear, reversible, and auditable.

## Similar User Logic

Not every comparison should use the same profile weights.

- Income comparisons should prioritize work country, job field, job type, seniority/experience, employment type, and work arrangement.
- Outflow comparisons should prioritize household, housing type, children, living country, age bucket, and work arrangement.
- Net worth comparisons should prioritize age bucket, experience, household, work/income context, and geography.
- Saving-rate comparisons should balance income context with household and housing context.
- Asset-allocation comparisons should consider age, risk/professional context when available, currency, and investment history quality.

When the user base is small, the system should prefer broader cohorts with honest low-confidence states over narrow cohorts that look precise but risk identification. As the population grows, cohorts can become more specific and metric-specific.

## Open-Source Hygiene

- Do not commit `.env` files, real exports, screenshots with financial data, or database dumps.
- Use synthetic but realistic fixtures for tests and demos.
- Scrub logs before sharing them in issues.
- Avoid examples that combine rare profile fields with exact financial values.
- Document privacy impact in PRs that touch auth, storage, import/export, profile matching, rankings, averages, or analytics.

## Implementation Checklist

Before shipping a benchmark-related change, verify:

- demo/test users are excluded from real aggregates;
- the response contains no raw user identifiers or transaction rows;
- small cohorts are suppressed or coarsened;
- profile fields are bucketed consistently;
- values are rounded or aggregated before leaving the local boundary;
- UI copy explains what is being compared and how reliable it is;
- tests cover privacy threshold behavior and sparse-cohort fallback.

See also [COMMUNITY_STATS_PROTOCOL.md](COMMUNITY_STATS_PROTOCOL.md) and [COMMUNITY_BENCHMARK_STRATEGY.md](COMMUNITY_BENCHMARK_STRATEGY.md).
