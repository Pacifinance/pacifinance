/**
 * Centralized types for every request / response between the frontend and
 * the PaciFinance backend (`server/src/routes/**`).
 *
 * Naming convention used across this file:
 *   - `*Request`  → payload sent to the server in `req.body`
 *   - `*Response` → shape the server returns (after `res.json(...)`)
 *   - `*Dto`      → domain object that lives in either a request or a response
 *
 * Wire format peculiarity (IMPORTANT, the reason this file exists):
 *   The balance schema uses CAMEL-CASE keys in the DB and in GET responses
 *   (`digitalServices`, `emergencyFund`) but the POST /balances/add endpoint
 *   accepts SNAKE_CASE (`digital_services`, `emergency_fund`). Mixing the two
 *   silently zeroes fields, so the two shapes are modelled as distinct types
 *   here (`BalanceSnapshotDto` vs. `BalanceAddPayload`) and the conversion
 *   MUST go through the helpers in `src/constants/balanceSchema.ts`.
 *
 * @module types/api
 */

/* ═══════════════════════════════════════════════════════════════════════════
 * Assets
 * ═══════════════════════════════════════════════════════════════════════════*/

/** Canonical camelCase asset keys (same as the Mongoose schema). */
export type AssetKey =
  | 'bank'
  | 'cash'
  | 'digitalServices'
  | 'emergencyFund'
  | 'stocks'
  | 'etf'
  | 'bitcoin'
  | 'crypto'
  | 'bonds'
  | 'funds'
  | 'commodities';

/** Snake-case keys accepted by POST /balances/add. */
export type AssetDbKey =
  | 'bank'
  | 'cash'
  | 'digital_services'
  | 'emergency_fund'
  | 'stocks'
  | 'etf'
  | 'bitcoin'
  | 'crypto'
  | 'bonds'
  | 'funds'
  | 'commodities';

/* ═══════════════════════════════════════════════════════════════════════════
 * /balances
 * ═══════════════════════════════════════════════════════════════════════════*/

/**
 * Balance snapshot as it appears in the GET /balances/get response.
 * Keys are camelCase.
 */
export type BalanceSnapshotDto = Record<AssetKey, number> & {
  date: string;      // ISO date set by the server on insert
  userDate: string;  // ISO date picked by the user (canonical month anchor)
};

/** Single element of the GET /balances/get response. */
export interface BalanceMonthDto {
  /** First day of the month this bucket refers to (UTC). */
  date: string;
  /** The most-recent snapshot for this month, or `{}` if none exists. */
  balance: BalanceSnapshotDto | Record<string, never>;
}

/** Full GET /balances/get response — newest-first. 24 months by default; pass
 * `months` (capped) or `"all"` in the request body for a wider/full range. */
export type BalancesGetResponse = BalanceMonthDto[];

/** Body of POST /balances/get. Omit for the default 24-month window. */
export interface BalancesGetRequest {
  months?: number | 'all';
}

/**
 * Body of POST /balances/add. Note the snake_case keys and the flat shape
 * under the `balance` wrapper.
 */
export interface BalanceAddPayload {
  date: string; // ISO date (YYYY-MM-DD); determines the month bucket
  bank: number;
  cash: number;
  digital_services: number;
  emergency_fund: number;
  stocks: number;
  etf: number;
  bitcoin: number;
  crypto: number;
  bonds: number;
  funds: number;
  commodities: number;
}

export interface BalanceAddRequest {
  balance: BalanceAddPayload;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * /expenses
 * ═══════════════════════════════════════════════════════════════════════════*/

/** Optional balance source attached to a transaction at insert time: the
 * balance field (and optionally the specific sub-account) the money was taken
 * from / added to. Lets delete/edit flows propose the exact field to restore. */
export interface ExpenseBalanceSourceDto {
  asset_key: AssetKey;
  detail_type: 'liquidity' | 'investment' | null;
  detail_id: number | null;
}

export interface ExpenseDto {
  date: string;         // ISO
  amount: number;       // in EUR, already rounded server-side
  is_expense: boolean;  // true = outflow, false = income
  notes: string;
  payment_type: number; // index into tags.paymentTags (0 for income)
  category_tag: number; // index into tags.outflowsTags / tags.incomesTags
  /** Optional custom sub-category id (from /categories/get), display-only — stats stay on category_tag. */
  user_category_id?: number | null;
  balance_source?: ExpenseBalanceSourceDto | null;
}

export interface ExpenseAddRequest { expense: ExpenseDto; }

/** Body of POST /expenses/monthly-totals. Omitted `months` -> full history. */
export interface MonthlyTotalsRequest {
  months?: number | 'all';
}

/** One element of the POST /expenses/monthly-totals response — aggregated
 * server-side (SQL SUM/GROUP BY), no per-transaction detail. */
export interface MonthlyTotalDto {
  monthStart: string; // "YYYY-MM-DD"
  totalOutflows: number;
  totalIncomes: number;
}

export type MonthlyTotalsResponse = MonthlyTotalDto[];

/** Single month bucket returned by POST /expenses/get (13-element array). */
export interface ExpensesMonthDto {
  date: string;
  expenses: ExpenseDto[];
}

export type ExpensesGetResponse = ExpensesMonthDto[];

/** One transaction as returned by the server's toExpense() shape (/expenses/get, /expenses/month). */
export interface TransactionDto {
  date: string;
  amount: number;
  isExpense: boolean;
  notes: string;
  paymentType: { label: string; index: number; type: number } | null;
  categoryTag: { label: string; index: number; type: number } | null;
  userCategory: { id: number; label: string } | null;
  balanceAssetKey: AssetKey | null;
  balanceDetailType: 'liquidity' | 'investment' | null;
  balanceDetailId: number | null;
}

/** Body of POST /expenses/month. `month` is 1-12. */
export interface MonthDetailRequest {
  year: number;
  month: number;
}

/** Response of POST /expenses/month — one arbitrary month's tagged transactions
 * (mixed incomes+outflows), for on-demand history beyond the 13-month window
 * loaded by /expenses/get. */
export type MonthDetailResponse = TransactionDto[];

export interface ExpenseDeleteRequest {
  expense: Pick<ExpenseDto, 'date' | 'amount' | 'is_expense'>;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * /recurring-transactions
 * ═══════════════════════════════════════════════════════════════════════════*/

/** A recurring outflow/income template (subscription, rent, salary...). A daily
 * cron turns each due template into a real expenses row — see server/src/db/models/recurringTransactions.ts. */
export interface RecurringTransactionDto {
  id: number;
  isExpense: boolean;
  amount: number;
  notes: string;
  paymentType: { label: string; index: number; type: number } | null;
  categoryTag: { label: string; index: number; type: number } | null;
  userCategory: { id: number; label: string } | null;
  dayOfMonth: number;
  active: boolean;
  nextRunDate: string; // "YYYY-MM-DD"
}

export type RecurringTransactionsGetResponse = RecurringTransactionDto[];

export interface RecurringTransactionSaveRequest {
  id?: number;
  is_expense: boolean;
  amount: number;
  notes?: string;
  payment_type: number; // client index, ignored for incomes
  category_tag: number; // client index
  user_category_id?: number | null;
  day_of_month: number; // 1-28
}

export interface RecurringTransactionSetActiveRequest {
  id: number;
  active: boolean;
}

export interface RecurringTransactionDeleteRequest { id: number; }

/* ═══════════════════════════════════════════════════════════════════════════
 * /user
 * ═══════════════════════════════════════════════════════════════════════════*/

/** GET /user/get — the public information stored on a user. */
export interface UserGetResponse {
  userId: string;
  username?: string;
  type?: number;
  age?: number | null;
  livingSituation?: number | null;
  housingType?: number | null;
  children?: number | null;
  country?: number | null;
  job?: number | null;
  jobType?: number | null;
  jobCountry?: number | null;
  workTime?: number | null;
  remoteType?: number | null;
  yearsOfExperience?: number | null;
  preferredCurrency?: number | null;
}

/** POST /user/set — profile update payload. */
export interface UserSetRequest {
  age?: number | null;
  living_situation?: number | null;
  housing_type?: number | null;
  children?: number | null;
  country?: number | null;
  job?: number | null;
  job_type?: number | null;
  job_country?: number | null;
  work_time?: number | null;
  remote_type?: number | null;
  years_of_experience?: number | null;
  preferred_currency?: number | null;
}

export interface UserSetIdRequest { password: string; }
export interface UserSetIdResponse { new_id: string; }

export interface UserSetPasswordRequest {
  old_pwd: string;
  new_pwd: string;
  repeated_pwd: string;
}

export interface UserGoalsRequest {
  expenses_limit?: number;
  savings_percent?: number;
  emergency_fund_goal?: number;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * /auth (public)
 * ═══════════════════════════════════════════════════════════════════════════*/

export interface LoginRequest {
  user_id: string;
  password: string;
  turnstile_token?: string;
}

export interface RegistrationRequest {
  user_pwd: string;
  repeated_pwd: string;
  turnstile_token?: string;
}

export interface RegistrationResponse { user_id: string; }

/* ═══════════════════════════════════════════════════════════════════════════
 * /tags
 * ═══════════════════════════════════════════════════════════════════════════*/

export interface TagDto {
  /** Numeric index used to reference the tag in expenses/balances. */
  tag: number;
  /** Short key used as i18n lookup (matches `translations.outflowsTags[key]`). */
  name: string;
}

/**
 * Response of POST /tags/get. Keys correspond to `db.tags.TagType` on the
 * server: currently `outflowsTags`, `incomesTags`, `paymentTags`,
 * `currencyTags`, etc.
 */
export type TagsGetResponse = Record<string, TagDto[]>;

/* ═══════════════════════════════════════════════════════════════════════════
 * /categories (user-defined sub-categories, children of an official tag)
 * ═══════════════════════════════════════════════════════════════════════════*/

export interface UserCategoryDto {
  id: number;
  /** Client-facing index of the official parent tag (outflowsTags/incomesTags) — matches TagDto.tag / .index. */
  parentIndex: number;
  /** Official parent type: 0 = expense, 1 = income. */
  parentType: number;
  label: string;
}

export type CategoriesGetResponse = UserCategoryDto[];

export interface CategoryAddRequest {
  label: string;
  /** Client-facing index of the official parent tag (outflowsTags/incomesTags). */
  parent_index: number;
  is_expense: boolean;
}

export interface CategoryDeleteRequest { id: number; }

export interface CategoryRenameRequest {
  id: number;
  label: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * /rank
 * ═══════════════════════════════════════════════════════════════════════════*/

export interface RankBalancesRequest { similar?: boolean; }
export interface RankExpensesRequest {
  /** true → expenses ranking (low is good); false → incomes ranking. */
  expenses: boolean;
  similar?: boolean;
}

/** Both /rank/balances and /rank/expenses return `{ position: number }`. */
export interface RankResponse { position: number; }

/* ═══════════════════════════════════════════════════════════════════════════
 * /stats
 * ═══════════════════════════════════════════════════════════════════════════*/

export interface StatsAverageBucket {
  balances: number | null;
  expenses: number | null;
  incomes: number | null;
  savingsRates: number | null;
  expensesByCategory: Record<string, number> | null;
  benchmark?: BenchmarkMetadata;
}

export interface BenchmarkMetadata {
  generatedAt: string;
  populationSize: number;
  minimumCohortSize: number;
  cohortSizes: {
    balances: number;
    incomes: number;
    expenses: number;
    savingsRates: number;
  };
  averageSimilarity: {
    balances: number | null;
    incomes: number | null;
    expenses: number | null;
    savingsRates: number | null;
  };
}

export interface StatsAveragesResponse {
  all?: StatsAverageBucket;
  general?: StatsAverageBucket; // legacy alias for `all`
  similar?: StatsAverageBucket;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * /prices
 * ═══════════════════════════════════════════════════════════════════════════*/

export interface PriceDto {
  name: string;
  image?: string;
  current: number;
  sparkline?: number[];
}

/** Response of GET /prices/crypto — map keyed by coin id. */
export type PricesResponse = Record<string, PriceDto>;

/* ═══════════════════════════════════════════════════════════════════════════
 * /investments
 * ═══════════════════════════════════════════════════════════════════════════*/

export type InvestmentKind = 'stock' | 'etf' | 'crypto' | 'bond' | 'fund' | 'commodity' | 'other';
export type InvestmentAssetKey = 'stocks' | 'etf' | 'bitcoin' | 'crypto' | 'bonds' | 'funds' | 'commodities';
export type InvestmentPositionType = 'single' | 'pac' | 'other';

export interface InvestmentInstrumentDto {
  id: number;
  kind: InvestmentKind;
  symbol: string;
  exchange?: string | null;
  name: string;
  currency?: string | null;
  country?: string | null;
  sector?: string | null;
  industry?: string | null;
  figi?: string | null;
  isin?: string | null;
  coingeckoId?: string | null;
  provider: string;
  verified: boolean;
  active: boolean;
  metadata: Record<string, unknown>;
}

export interface InvestmentHoldingDto {
  id: number;
  assetKey: InvestmentAssetKey;
  positionType: InvestmentPositionType;
  quantity: number | null;
  averagePrice: number | null;
  currentValue: number | null;
  investedAmount: number | null;
  currency: string;
  notes: string;
  updatedAt: string;
  instrument: InvestmentInstrumentDto | null;
}

export type InvestmentSearchSource = 'figi' | 'coingecko' | 'internal';

export interface InvestmentInstrumentSearchRequest {
  query: string;
  kind?: InvestmentKind;
  limit?: number;
  source?: InvestmentSearchSource;
}

export type InvestmentInstrumentSearchResponse = InvestmentInstrumentDto[];
export type InvestmentHoldingsGetResponse = InvestmentHoldingDto[];

export interface InvestmentHoldingSaveRequest {
  id?: number;
  instrument_id: number;
  asset_key: InvestmentAssetKey;
  position_type?: InvestmentPositionType;
  quantity?: number | null;
  average_price?: number | null;
  current_value?: number | null;
  invested_amount?: number | null;
  currency?: string;
  notes?: string;
}

export interface InvestmentHoldingDeleteRequest { id: number; }

export interface InvestmentHoldingHistoryDto {
  id: number;
  holdingId: number | null;
  instrumentId: number;
  assetKey: InvestmentAssetKey;
  symbol: string;
  name: string;
  quantity: number | null;
  averagePrice: number | null;
  currentValue: number | null;
  investedAmount: number | null;
  currency: string;
  userDate: string;
  recordedAt: string;
}

export interface InvestmentHoldingHistoryRequest { months?: number; user_date?: string; }
export type InvestmentHoldingHistoryResponse = InvestmentHoldingHistoryDto[];

export interface InvestmentHoldingHistorySaveRequest {
  holding_id: number;
  user_date: string;
  current_value: number | null;
  invested_amount: number | null;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * /liquidity-accounts
 * ═══════════════════════════════════════════════════════════════════════════*/

export type LiquidityAssetKey = 'bank' | 'cash' | 'digitalServices' | 'emergencyFund';

export interface LiquidityAccountDto {
  id: number;
  assetKey: LiquidityAssetKey;
  label: string;
  currentValue: number;
  currency: string;
  notes: string;
  updatedAt: string;
}

export type LiquidityAccountsGetResponse = LiquidityAccountDto[];

export interface LiquidityAccountSaveRequest {
  id?: number;
  asset_key: LiquidityAssetKey;
  label: string;
  current_value: number;
  currency?: string;
  notes?: string;
}

export interface LiquidityAccountDeleteRequest { id: number; }

export interface LiquidityAccountHistoryDto {
  id: number;
  accountId: number | null;
  assetKey: LiquidityAssetKey;
  label: string;
  currentValue: number;
  currency: string;
  userDate: string;
  recordedAt: string;
}

export interface LiquidityAccountHistoryRequest { months?: number; user_date?: string; }
export type LiquidityAccountHistoryResponse = LiquidityAccountHistoryDto[];

export interface LiquidityAccountHistorySaveRequest {
  account_id: number;
  user_date: string;
  current_value: number;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * /goals
 * ═══════════════════════════════════════════════════════════════════════════*/

export type GoalType = 'savings' | 'purchase' | 'investment' | 'debt';

export interface GoalDto {
  id: number;
  name: string;
  goalType: GoalType;
  targetValue: number;
  currentValue: number;
  linkedAssetKey: AssetKey | null;
  deadline: string | null;
  updatedAt: string;
}

export type GoalsGetResponse = GoalDto[];

export interface GoalSaveRequest {
  id?: number;
  name: string;
  goal_type: GoalType;
  target_value: number;
  current_value?: number;
  linked_asset_key?: AssetKey | null;
  deadline?: string | null;
}

export interface GoalDeleteRequest { id: number; }
