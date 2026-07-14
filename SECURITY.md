# Security Policy

Pacifinance handles personal financial data, so security and privacy reports are taken seriously.

## Reporting A Vulnerability

Please do not open a public issue for security vulnerabilities.

Preferred channel: GitHub private vulnerability reporting. Use the "Report a vulnerability" button under the repository's Security tab. This keeps the report private while maintainers investigate and prepare a fix.

If you cannot use GitHub's private reporting, contact the maintainers through the contact options listed on [pacifinance.com](https://www.pacifinance.com).

Please include:

- a description of the issue and its impact;
- steps to reproduce, with a proof of concept if possible;
- affected routes, pages, env vars, or deployment settings;
- any suggested remediation.

Do not include real user data, production secrets, raw financial exports, or screenshots containing personal financial information.

## What To Expect

- We will acknowledge your report as soon as possible, normally within a few days.
- We will keep you informed while we investigate and fix the issue.
- We will credit you in the fix notes unless you prefer to stay anonymous.

## Scope Notes

In scope:

- authentication, session, Turnstile, and rate-limit bypasses;
- Supabase row-level security or API authorization issues;
- exposure of private financial data, profile data, comparison cohorts, or logs;
- community benchmark flaws that could reveal a person through small cohorts or repeated slicing;
- import/export vulnerabilities and stored XSS in user-provided fields.

Out of scope:

- denial-of-service testing against production;
- spam, social engineering, and physical attacks;
- reports based only on outdated browser warnings without exploitability;
- automated scanner output without a reproducible impact.

Please avoid testing against production with real user data. Demo mode and a local setup cover almost everything without touching real accounts.
