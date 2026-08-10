# Pacifinance Backend - TODO

> Last updated: 2026-04-17
> Full historical/completed backend notes have been archived privately during
> the docs cleanup — this file only tracks what's still open.

## Open Items

### User Similarity & Rankings
- [ ] Add a periodic job/cache for behavioral rankings, to avoid frequent live recalculation as the user base grows.
- [ ] Let a user control how "users similar to them" are calculated — checkboxes in the client that map to the profiling booleans the backend already uses.
- [ ] Backend support for the roadmap priority-voting feature (frontend side tracked as `roadmap-voting` in the root [todo.md](../todo.md)).
- [ ] Referral/invite badge system (frontend gamification slot exists; needs a backend method to detect and reward referrals).

### User Profile
- [ ] Evaluate adding an optional email to the profile for bot prevention, password recovery, and support — see the encrypted-email design in [docs/FUTURE_DESIGNS.md](../docs/FUTURE_DESIGNS.md).
- [ ] Auto-generated nickname (profile backend).

### Income & Outflows
- [ ] Add a monthly income goal field to the DB (needs product discussion first).

### Price Data
- [ ] Stocks API route (may already be partially covered by the Finnhub live-price refresh — verify before starting).
- [ ] ETF API route.

### Auth
- [ ] "Smart login": cache session info client-side and let the backend distinguish between the two login modes.

### Code Quality
- [ ] Review backend naming conventions, especially data/field formats in routes.
- [ ] General code-quality pass with open-sourcing in mind (this is happening now — good time to do it).

### Performance
- [ ] Enable server-side text compression — see [web.dev: uses-text-compression](https://developer.chrome.com/docs/lighthouse/performance/uses-text-compression/).
