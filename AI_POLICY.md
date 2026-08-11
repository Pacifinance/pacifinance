# AI Contribution Policy

Using AI tools (Claude, Copilot, Cursor, ChatGPT, or anything else) to help
write code, tests, or docs for Pacifinance is welcome — this isn't an
anti-AI project, and the maintainers use these tools too. This file exists
so that's clearly stated, and so AI-assisted contributions stay useful
instead of becoming noise for whoever has to review them.

## The bar

- **You are the author, not the AI.** If you can't explain what your change
  does, why it does it that way, and how it interacts with the rest of the
  app without going back to ask the AI again, the PR isn't ready yet.
- **Test it yourself before opening the PR.** `npm run lint && npm test &&
  npm run build` passing is the minimum, not the finish line — actually
  exercise the feature you changed. An AI telling you "this should work" is
  not verification.
- **Respect the project's vision.** Read [`AGENTS.md`](AGENTS.md) and, for
  anything beyond a small fix, [`docs/PRODUCT_VISION.md`](docs/PRODUCT_VISION.md)
  and the [Core Principles](README.md#core-principles) first. Privacy-first,
  anonymous-by-design, self-hostable, deterministic finance with AI never in
  the numbers (see `PRODUCT_VISION.md` §3, §6, §8) — these aren't style
  preferences an AI can talk you out of on its own initiative.
- **Disclose significant AI use** in the PR description: which parts, and
  how much you reviewed or rewrote. A one-line mention is enough — this
  isn't a confession, it's context for the reviewer.
- **No drive-by AI PRs.** If a change is more than a small, obvious fix,
  open an issue first so the direction can be agreed on before code gets
  written, AI-assisted or not.

## What gets closed

PRs that read as unreviewed AI output — inconsistent with the codebase's
actual patterns, changes you can't explain, scope far beyond what was
asked, or tests that were clearly never run — get closed without much
discussion. That's not a penalty for using AI; it's the same bar an
unreviewed human-written PR would fail.
