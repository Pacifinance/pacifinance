# Pacifinance threat model

## Assets

- transactions, balances, investments, goals and exports;
- authentication sessions, recovery codes and integration credentials;
- anonymous benchmark contributions and their metadata;
- price history integrity and source provenance.

## Trust boundaries

1. Browser to hosted API: the browser is untrusted and may be modified by the user.
2. API to Supabase: service-role operations must never be exposed to the browser.
3. API to third-party providers: CoinGecko, Redis and email/push providers are external dependencies.
4. Benchmark aggregation: only consented, bucketed and thresholded aggregates may cross this boundary.

## Main threats and controls

| Threat | Control | Verification |
|---|---|---|
| Cross-user data access | Supabase RLS, user-scoped queries, no raw benchmark rows | Run the RLS checklist before release |
| Session theft | HttpOnly cookies, secure cookie settings, Turnstile/rate limits | Auth and cookie tests |
| Small-cohort inference | Explicit consent, minimum cohort, aggregate-only responses | Benchmark endpoint tests |
| Malicious imports/XSS | Validation, escaped rendering, synthetic fixtures | Import and security tests |
| Price manipulation | Source/provenance fields and verified-price precedence | Price-history tests |
| Provider outage | Cached values and graceful degradation | Failure-mode tests |
| Data loss | User export plus scheduled database backup and restore drill | Backup runbook |

## Residual risks

RLS policy correctness, Supabase project configuration, backups and production secrets still require an operator audit. The repository includes the required checklist but cannot inspect a private Supabase project automatically.
