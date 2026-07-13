# Security Policy

PaciFinance handles personal financial data, so we take security reports seriously.

## Reporting a vulnerability

Please do **not** open a public issue for security vulnerabilities.

Preferred channel: **GitHub private vulnerability reporting** — use the
"Report a vulnerability" button under the repository's *Security* tab.
This keeps the report private while we work on a fix.

If you cannot use GitHub's private reporting, contact the maintainers through
the contact options listed on [pacifinance.com](https://www.pacifinance.com).

Please include:

- A description of the issue and its impact
- Steps to reproduce (proof of concept if possible)
- Any suggested remediation

## What to expect

- We will acknowledge your report as soon as possible (normally within a few days).
- We will keep you informed while we investigate and fix the issue.
- We will credit you in the fix notes unless you prefer to stay anonymous.

## Scope notes

- The production instance and this codebase are both in scope.
- Please avoid testing against production with real user data; the demo mode
  and a local setup (see [CONTRIBUTING.md](CONTRIBUTING.md)) cover almost
  everything without touching real accounts.
- Denial-of-service, spam, and social engineering reports are out of scope.
