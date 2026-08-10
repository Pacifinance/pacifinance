# Skill: Test-Driven Development

## Purpose
Implement functionality following the Red → Green → Refactor cycle, with negative tests before the happy path.

## Trigger
Use when: *write tests first*, *TDD*, *test-driven*, *test before code*, *add tests*.

---

## Instructions

### The TDD Cycle
```
Red    → Write a test that FAILS → confirm the failure
Green  → Write the MINIMUM code to make it pass
Refactor → Clean up only after all tests pass
```
"Minimum code" means: if a hardcoded value makes the test pass, use it — the next test will force the real logic. This prevents premature over-engineering.

---

### Phase 1 — Test Plan
Before writing code, list the test cases in this order:

```ts
// Template: write these empty stubs as the plan
describe('functionName', () => {
  // 1. null/undefined input
  it('returns default for null input', () => {});

  // 2. Invalid input / wrong shape
  it('returns default for malformed input', () => {});

  // 3. Boundary values
  it('returns 0 for empty array', () => {});
  it('handles single item', () => {});

  // 4. Async error (if applicable)
  it('handles API failure gracefully', () => {});

  // 5. Happy path (last)
  it('returns correct value for valid input', () => {});
});
```

### Phase 2 — Red (failing test)
```bash
npm test -- FileName   # ← must fail
```
If the test does NOT fail, the test is wrong — fix it before proceeding.

### Phase 3 — Green (minimum code)
Implement the minimum to make the current test pass. Only that.

```bash
npm test -- FileName   # ← must pass
```

### Phase 4 — Refactor
Only after ALL tests pass:
- Remove duplication
- Improve variable names
- Extract helper functions

```bash
npm test               # ← all tests, no regressions
```

---

### Pacifinance Domain Examples

#### Selector (utils)
```ts
// RED: write first
it('getBankValue returns 0 for null', () => {
  expect(getBankValue(null)).toBe(0);
});
// GREEN: implement
export const getBankValue = (u: UserData | null) => u?.balances?.[0]?.balance?.bank ?? 0;
```

#### Financial calculation
```ts
// Order: null → 0 → negative → empty month → happy path
describe('getMonthlyDelta', () => {
  it('returns 0 for null userData', () => ...);
  it('returns 0 when no balances', () => ...);
  it('handles negative delta (expenses > income)', () => ...);
  it('returns correct delta for current month', () => ...);
});
```

#### Function with dates
```ts
// Minimum 3 tests: normal date, midnight, month change
describe('formatDate', () => {
  it('formats a midday date correctly', () => ...);
  it('does not shift midnight date (UTC bug)', () => ...);
  it('handles month boundary correctly', () => ...);
});
```

#### Component with mocked Context
```ts
const renderWithMocks = (ui: ReactElement) =>
  render(ui, {
    wrapper: ({ children }) => (
      <MockUserContext value={{ userData: mockUserData, isLoading: false }}>
        <MockCurrencyContext value={{ formatAmount: v => `${v} €` }}>
          {children}
        </MockCurrencyContext>
      </MockUserContext>
    )
  });

// Test order: loading state → no data state → happy path
it('shows skeleton when loading', () => ...);
it('shows empty state when no userData', () => ...);
it('renders balance correctly', () => ...);
```

---

### Invariant Rules
- **Never write code without a failing test first** (in pure logic/selectors)
- **Never skip negative tests** — they define the function's contract
- **"If it has an `if`, it has ≥2 tests"** — one per branch
- **"If it touches a date, it has ≥3 tests"** — normal, midnight, boundary
- **Coverage target**: `utils/` and selectors → 100% lines
