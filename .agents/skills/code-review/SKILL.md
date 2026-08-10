# Skill: Code Review

## Purpose
Systematic review of Pacifinance code for correctness, security, conventions, and quality.

## Trigger
Use when: *PR review*, *code review*, *check this file*, *is this correct?*

---

## Instructions

### Review Checklist (in priority order)

#### 🔴 Auto-fail — blocks the merge
- [ ] Hardcoded UI text (not in `it.json`/`en.json`)
- [ ] Hardcoded `€` or `EUR` in JSX
- [ ] `any` in TypeScript
- [ ] Direct access to `userData.property` without a selector
- [ ] Direct `useNavigate()` or `<Link>` instead of the localized equivalents
- [ ] API call outside `UserContext.tsx`
- [ ] Change to `server/` (backend — off limits)
- [ ] `dangerouslySetInnerHTML` without sanitization
- [ ] Hardcoded secrets/API keys in the code

#### 🟡 Warning — fix as soon as possible
- [ ] New `userData` field not added to `MockAuthContext.tsx`
- [ ] Utility function without a corresponding test
- [ ] Component with state/logic that should be in a hook
- [ ] `useEffect` that writes to persistent state (dangerous pattern)
- [ ] Hardcoded color/icon for financial data
- [ ] Missing `if (!userData)` guard in authenticated pages
- [ ] `console.log` forgotten in production

#### 🟢 Best practice — suggest
- [ ] Lazy loading for non-critical pages
- [ ] Privacy mode: use `isPrivate` from `PrivacyContext` for sensitive values
- [ ] Umami analytics on interactive actions: `data-umami-event="..."`
- [ ] ARIA labels on interactive elements
- [ ] Explicit loading/error state handling

### OWASP Check (for code touching auth/data)
| Risk | What to check |
|---|---|
| XSS | User input never in raw `innerHTML` |
| Auth bypass | Protected routes check `isAuthenticated`, not just `userData` |
| Info exposure | No sensitive data in unencrypted localStorage |
| CSRF | API calls use `withCredentials: true` (HTTP-only cookie) |

### Review response format
```
## Auto-fail ❌
- [file:line] Problem description + suggested fix

## Warning ⚠️  
- [file:line] Description + suggestion

## OK ✅
- Positive aspects (briefly)

## Suggestions 💡
- Non-blocking improvements
```
