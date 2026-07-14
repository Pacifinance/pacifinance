---
applyTo: "src/__tests__/**"
---

# Testing — Pacifinance Rules

## Test Location
```
src/__tests__/
  components/    # Component smoke tests
  contexts/      # Context unit tests
  hooks/         # Hook tests
  utils/         # Pure function tests (100% coverage target)
  integration/   # Multi-layer flows
```
Mirror the `src/` structure. Test file: `MyThing.test.ts` (or `.tsx`).

## TDD Order — Negative Cases First
```
1. null / undefined / empty input
2. Boundary values (0, 1, max-1, max)
3. Invalid types / wrong shape
4. Async failure / network error
5. Happy path (last)
```
> If a function has an `if`, it needs ≥2 tests. Date-touching functions need ≥3.

## Coverage Targets
| Layer | Target |
|---|---|
| `utils/` pure functions | 100% lines |
| selectors | 100% lines |
| Contexts (critical paths) | >80% |
| Components | Smoke test (renders without crash) |

## Mock Patterns
```ts
// UserContext mock — use MockAuthContext shape
vi.mock('../contexts/UserContext', () => ({
  UserContext: { userData: mockUserData, isAuthenticated: true }
}));

// CurrencyContext mock
const mockFormatAmount = vi.fn((v: number) => `${v} €`);

// API mock
vi.mock('axios');
(axios.get as vi.Mock).mockResolvedValue({ data: mockResponse });
```

## Selector Tests Pattern
```ts
describe('getBankValue', () => {
  it('returns 0 for null userData', () => {
    expect(getBankValue(null)).toBe(0);
  });
  it('returns 0 for empty balances', () => {
    expect(getBankValue({ balances: [] })).toBe(0);
  });
  it('returns bank value from first balance', () => {
    expect(getBankValue(mockUserData)).toBe(1000);
  });
});
```

## i18n in Tests
```ts
// Don't test translation strings — test keys exist
import it from '../../i18n/locales/it.json';
import en from '../../i18n/locales/en.json';

it('has same keys in it and en', () => {
  expect(Object.keys(it.dashboard)).toEqual(Object.keys(en.dashboard));
});
```

## Currency in Tests
```ts
// Always use the mock, never real formatter
const formatAmount = (v: number) => `${v} €`;
// Or import from currencyConfig fallback rates
```

## Running Tests
```bash
npm test                       # all tests
npm test -- --watch            # watch mode
npm test -- --coverage         # with coverage
npm test -- MyComponent        # single file pattern
```

## Anti-patterns to Avoid
- ❌ Don't test implementation details (internal state, private methods)
- ❌ Don't mock the module under test
- ❌ Don't skip negative cases "for now"
- ❌ Don't hardcode translated strings (test key existence, not value)
- ❌ Don't `console.log` in tests — use `expect` assertions
