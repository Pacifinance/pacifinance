# Future Feature Designs

Technical proposals for features that are not yet implemented. Kept here so a
contributor who wants to pick one up has a starting design instead of a blank
page — none of this is a commitment or a promise, just a sketch that's already
been thought through once.

---

## Encrypted Optional Email (Account Recovery)

### Current state

Pacifinance authentication is intentionally minimal: the user picks only a
password, the system generates a random `userId`, and login uses `userId` +
password. No email or other identifying data is collected.

The tradeoff: if a user loses their ID or password, there is currently no way
to recover the account other than the recovery code generated at sign-up (see
`header.register.successPopup` in the i18n files) — there's no way to contact
the user or verify their identity.

### Goal

An **optional** email system that:
1. Enables account recovery (password reset, ID recovery)
2. Keeps privacy intact — the email must never be readable directly in the DB
3. Unlocks future features — monthly reminder emails, magic-link login
4. Stays compatible with the "we don't know our users" principle

### Proposed design: encrypted email with a deterministic hash

Two separate fields per user:

```
┌─────────────────────────────────────────────────────────────────┐
│ User document                                                    │
├─────────────────────────────────────────────────────────────────┤
│ userId:         "abc123"                                         │
│ passwordHash:   "$2b$10$..." (bcrypt)                            │
│ emailHash:      sha256(normalize(email) + PEPPER)   — for lookup │
│ emailEncrypted: AES-256-GCM(email, SERVER_KEY)     — for sending │
│ emailVerified:  true/false                                       │
└─────────────────────────────────────────────────────────────────┘
```

| Field | Purpose | Algorithm | Reversible? |
|---|---|---|---|
| `emailHash` | Lookup/matching (e.g. "is this email already registered?", BMC webhook matching) | SHA-256 + pepper | No (one-way) |
| `emailEncrypted` | Sending actual emails (password reset, reminders) | AES-256-GCM, server-held key | Yes (only the server can decrypt) |

### Flows

**Registration (email optional)**
1. User submits password + email (optional)
2. `POST /auth/register { password, email? }`
3. Backend: generates `userId`, hashes password, and if an email was
   provided computes `emailHash`/`emailEncrypted` and sends a verification
   link (JWT token, 24h expiry)
4. Returns `{ userId }`

**Forgot password**
1. `POST /auth/forgot-password { email }`
2. Backend computes `emailHash`, looks up the user, and if found + verified
   decrypts `emailEncrypted` and emails a reset link (JWT, 1h expiry)
3. The response is always the generic "if this email is registered, you'll
   receive a link" — never reveals whether the email exists
4. User resets the password from the link

**Recover user ID** — same pattern: hash the submitted email, look it up,
email the `userId` if found, same generic response either way.

### Email normalization

Needed for deterministic hash matching (e.g. Gmail dot/plus aliasing):

```javascript
function normalizeEmail(email) {
  email = email.trim().toLowerCase();
  const [local, domain] = email.split('@');
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    return local.replace(/\./g, '').split('+')[0] + '@gmail.com';
  }
  return local.split('+')[0] + '@' + domain;
}
```

### Compatibility with other future features

| Feature | Compatible? | How |
|---|---|---|
| Monthly reminder email | Yes | Server decrypts `emailEncrypted` to send it; opt-in toggle in Settings |
| Magic-link login | Partial | Possible, but the email effectively becomes the user's identity, which cuts against "we don't know our users" — only viable as an additional opt-in method, never a replacement for ID+password |
| BuyMeACoffee webhook matching | Yes | `emailHash` matching never exposes the email in plaintext |
| Email 2FA | Yes | Alternative to a TOTP app |

### Implementation notes

- `EMAIL_HASH_PEPPER` and `EMAIL_ENCRYPTION_KEY` must be separate env vars,
  never in code or the DB. A compromised encryption key allows decrypting
  every stored email, so it deserves the same protection as any other
  production secret.
- Add an `encryptionVersion` field up front to support key rotation later
  (decrypt with the old key, re-encrypt with the new one, batch job).
- Be explicit with users: *"Your email is encrypted in our database — nobody
  can read it directly. We use it only for: password recovery, ID recovery,
  and reminders (if enabled). You can use Pacifinance without an email, but
  we won't be able to help you recover a lost account."*

### Estimated scope

Backend ~2-3 days (crypto, endpoints, email service, templates), frontend
~1-2 days (forms, recovery pages, settings). Roughly 3-5 days total.

---

## BuyMeACoffee Donations → "Supporter" Badge

BuyMeACoffee exposes webhooks that notify a server in real time when someone
donates.

**Flow**: register a webhook endpoint (e.g. `POST /api/webhooks/bmc`) →
BuyMeACoffee sends a JSON payload with the supporter's email → the server
compares its `emailHash` against registered users' `emailHash` (requires the
same email on both BMC and Pacifinance) → on a match, sets `hasDonated: true`
on the user document → the frontend unlocks the "Supporter" badge from that
flag.

No payment data is ever stored — no amount, no card, no transaction, just a
boolean flag. Matching happens via hash, so the email is never stored in
plaintext. The frontend gamification system already has a slot ready for this
(`useGamification.js`, just needs `check: (data) => data.hasDonated === true`)
— this is blocked only on the encrypted-email system above, since matching
needs `emailHash` to exist.

Simpler alternative without a webhook: the user donates on BMC, then clicks
"I donated" in Pacifinance; the server verifies against BMC's `/supporters`
API endpoint instead of waiting for a webhook.

---

## PWA Push Notifications (Monthly Data-Entry Reminder)

Goal: notify a user (e.g. day 1-3 of the month) if they haven't logged any
data for the current month yet.

```
Browser (Push API) → subscribe → Backend (cron) → web-push → Push Service → Notification
```

| Piece | Status | Work |
|---|---|---|
| Service worker (`sw.js`) | Already present | Add `push` and `notificationclick` listeners |
| Push API (frontend) | Not started | `reg.pushManager.subscribe(...)` with a VAPID key |
| VAPID keys | Not started | `web-push generate-vapid-keys` (one-time) |
| Subscription endpoint | Not started | `POST /api/push/subscribe` + a DB table |
| Monthly cron job | Not started | Sends a push to anyone without entries this month |
| Settings toggle | Not started | Enable/disable in SettingsPage |

Browser support: solid on Chrome/Firefox/Edge (desktop + Android, works even
with the browser closed); iOS Safari only from 16.4+ and only if the PWA is
installed to the home screen; limited on desktop Safari.

**Alternative — email reminder** (needs the encrypted-email system above): a
cron job decrypts emails and sends a reminder if no data was entered. Zero
frontend changes beyond a toggle, works identically on every device, and
typically has a much higher open rate (~40%) than web push (~20%). If the
email system ships first, it's the simpler and more effective option —
push notifications remain a nice-to-have on top, not a prerequisite.

---

## In-App Feedback Form (Phase 1)

Phase 0 (done): a direct link to GitHub Issues in SettingsPage and the Info
page.

Phase 1 (proposed): an in-app form that creates a GitHub Issue via the
backend, so a user never has to leave the app or have a GitHub account.

```
User → clicks "Feedback" → picks a type (Bug / Idea / Other)
→ fills in title + description → submits
→ backend creates a GitHub Issue with the right label
→ user sees a confirmation + link to the issue
```

Fields: type (select), title (max 100 chars), description (max 1000 chars),
related page (optional select). The backend posts as a bot account, so the
issue never exposes any user-identifying information.
