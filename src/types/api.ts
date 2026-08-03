/**
 * Centralized types for every request / response between the frontend and
 * the Pacifinance backend (`server/src/routes/**`).
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
export interface ExpenseBatchAddRequest { expenses: ExpenseDto[]; }
export interface ExpenseBatchAddResponse { inserted: number; }

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
  id: number;
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
  // Prefer { id }: exact, can't match a sibling transaction with the same
  // date/amount/direction. The date/amount/is_expense shape is a legacy
  // fallback for callers that don't have the row id (e.g. import-undo).
  expense: { id: number } | Pick<ExpenseDto, 'date' | 'amount' | 'is_expense'>;
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
  userId?: string;
  user_code?: string;
  username?: string;
  type?: number;
  account_type?: number;
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
  benchmarkConsent?: boolean;
  seenBadges?: string[];
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

export interface BenchmarkConsentRequest { contribute: boolean; }
export interface BenchmarkConsentResponse { benchmarkConsent: boolean; }

/** POST /user/seen-badges — marks gamification badge IDs as already notified. */
export interface SeenBadgesRequest { badge_ids: string[]; }
export interface SeenBadgesResponse { seenBadges: string[]; }

export interface UserSetIdRequest { password: string; }
export interface UserSetIdResponse { new_id: string; }

export interface UserSetPasswordRequest {
  old_pwd: string;
  new_pwd: string;
  repeated_pwd: string;
}

/** POST /user/recovery-code/generate — password-gated, mirrors set-id/set-password. */
export interface UserGenerateRecoveryCodeRequest { password: string; }
export interface UserGenerateRecoveryCodeResponse {
  recovery_code_base32: string;
  recovery_code_words: string;
}

/** POST /user/recovery-code/status — whether a recovery code is currently configured. */
export interface UserRecoveryCodeStatusResponse {
  configured: boolean;
  generated_at: string | null;
}

export interface UserGoalsRequest {
  expenses_limit?: number;
  savings_percent?: number;
  emergency_fund_goal?: number;
  expenses_limit_percent?: number | null;
  expenses_limit_percent_enabled?: boolean;
  savings_amount_goal?: number | null;
  savings_amount_goal_enabled?: boolean;
  emergency_fund_months?: number | null;
  emergency_fund_months_enabled?: boolean;
  fixed_expenses_percent?: number | null;
  category_spending_limits?: Record<string, number>;
  debt_reduction_goal?: number | null;
  position_concentration_limit?: number | null;
  asset_category_concentration_limit?: number | null;
  annual_passive_income_goal?: number | null;
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

export interface RegistrationResponse {
  user_id: string;
  recovery_code_base32: string | null;
  recovery_code_words: string | null;
}

/** POST /recovery/reset-password — public/unauthenticated, no old password needed. */
export interface RecoveryResetPasswordRequest {
  user_id: string;
  recovery_code: string;
  new_pwd: string;
  repeated_pwd: string;
  turnstile_token?: string;
}

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
  assetAllocation: {
    liquid: number;
    investments: number;
    crypto: number;
  } | null;
  distributions?: {
    balances: DistributionSummary;
    expenses: DistributionSummary;
    incomes: DistributionSummary;
    savingsRates: DistributionSummary;
  };
  longitudinal?: LongitudinalBenchmarkPoint[];
  benchmark?: BenchmarkMetadata;
}

export interface DistributionSummary {
  count: number;
  median: number | null;
  firstQuartile: number | null;
  thirdQuartile: number | null;
}

export interface LongitudinalBenchmarkPoint {
  monthsAgo: 3 | 6 | 12;
  asOf: string;
  reliability: 'low' | 'medium' | 'high';
  contributorCount: number;
  balances: number | null;
  incomes: number | null;
  expenses: number | null;
  savingsRates: number | null;
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

/** Response of GET /exchange-rates — currency code -> rate relative to 1 EUR. */
export type ExchangeRatesResponse = Record<string, number>;

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
  /** Which platform/broker export (e.g. "trading212") last produced this holding's totals — null for manually-added holdings. */
  importSource?: string | null;
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

/** Batch ISIN resolution (CSV import) — one round-trip for every position instead of one per ISIN. */
export interface InvestmentInstrumentSearchByIsinsRequest {
  isins: string[];
}

export type InvestmentInstrumentSearchByIsinsResponse = Record<string, InvestmentInstrumentDto | null>;

export type InvestmentHoldingsGetResponse = InvestmentHoldingDto[];

export interface HistoricalPriceBackfillResultDto {
  holdingId: number;
  monthsFilled: number;
}
export type InvestmentHistoricalPriceBackfillResponse = HistoricalPriceBackfillResultDto[];

/** Creates a private, unverified instrument when search finds no verified match — scoped to the creating user only, never shared with other users' searches. */
export interface InvestmentInstrumentManualCreateRequest {
  kind: InvestmentKind;
  symbol: string;
  name: string;
  currency?: string | null;
}

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
  /** Platform/broker this save's totals come from (e.g. "trading212") — null/omitted for manual entry. */
  import_source?: string | null;
  /** Resolves an existing-holding conflict (see InvestmentHoldingConflict): "add" sums both positions, "replace" overwrites. Omit on the first attempt. */
  merge_strategy?: 'add' | 'replace';
}

/** Body of the 409 response saveHolding's endpoint returns when a holding for this instrument already exists from a different/unknown import source. */
export interface InvestmentHoldingConflict {
  existing: InvestmentHoldingDto;
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
  /** Origin of the market value; provider/community values are verified. */
  priceSource?: 'provider' | 'community' | 'manual' | 'imported' | null;
}

export interface InvestmentHoldingHistoryRequest { months?: number; user_date?: string; }
export type InvestmentHoldingHistoryResponse = InvestmentHoldingHistoryDto[];

export interface InvestmentHoldingHistorySaveRequest {
  holding_id: number;
  user_date: string;
  current_value: number | null;
  invested_amount: number | null;
  /** Quantity actually held that month — omit to keep denormalizing from the live holding (e.g. a current-month refresh). */
  quantity?: number | null;
}

export interface InvestmentHoldingHistorySaveBatchRequest {
  entries: InvestmentHoldingHistorySaveRequest[];
}

export interface InvestmentBatchSaveResponse {
  savedCount: number;
  /** One message per row that couldn't be saved — never rejects, callers decide how much to surface. */
  errors: string[];
}

export interface InvestmentSettingsDto {
  monthlyTarget: number | null;
  monthlyTargetPercent: number | null;
}

export interface InvestmentSettingsSaveRequest {
  monthly_target: number | null;
  monthly_target_percent?: number | null;
}

export interface InvestmentDividendDto {
  id: number;
  instrumentId: number;
  holdingId: number | null;
  /** EUR (DB is always EUR). */
  amount: number;
  /** Original currency of the payment, for reference only — null when unknown. */
  currency: string | null;
  /** Original amount before EUR conversion, for reference only. */
  grossAmount: number | null;
  /** "YYYY-MM-DD" */
  paidDate: string;
  externalId: string | null;
  source: string;
  recordedAt: string;
}

export interface InvestmentDividendSaveRequest {
  instrument_id: number;
  holding_id?: number | null;
  amount: number;
  currency?: string | null;
  gross_amount?: number | null;
  paid_date: string;
  external_id?: string | null;
  source: string;
}

export interface InvestmentDividendSaveBatchRequest {
  entries: InvestmentDividendSaveRequest[];
}

export interface InvestmentDividendSummaryDto {
  instrumentId: number;
  symbol: string;
  name: string;
  totalAmount: number;
  paymentCount: number;
  lastPaidDate: string;
}

export type InvestmentDividendSummaryResponse = InvestmentDividendSummaryDto[];

export interface InvestmentTransactionDto {
  id: number;
  instrumentId: number;
  holdingId: number | null;
  side: 'buy' | 'sell';
  quantity: number;
  price: number | null;
  /** Original currency of the price, for reference only — null when unknown. */
  currency: string | null;
  /** EUR (DB is always EUR). */
  total: number | null;
  /** Original currency of the total before EUR conversion, for reference only. */
  totalCurrency: string | null;
  /** "YYYY-MM-DD" */
  tradeDate: string;
  externalId: string | null;
  source: string;
  recordedAt: string;
}

export interface InvestmentTransactionSaveRequest {
  instrument_id: number;
  holding_id?: number | null;
  side: 'buy' | 'sell';
  quantity: number;
  price?: number | null;
  currency?: string | null;
  total?: number | null;
  total_currency?: string | null;
  trade_date: string;
  external_id?: string | null;
  source: string;
}

export interface InvestmentTransactionSaveBatchRequest {
  entries: InvestmentTransactionSaveRequest[];
}

export interface InvestmentTransactionSummaryDto {
  instrumentId: number;
  isin: string | null;
  symbol: string;
  name: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number | null;
  currency: string | null;
  total: number | null;
  totalCurrency: string | null;
  tradeDate: string;
  externalId: string | null;
  /** Which import produced this row (e.g. "trading212", "directa") - lets the UI show where a given purchase/sale actually came from. */
  source: string;
}

export type InvestmentTransactionsGetResponse = InvestmentTransactionSummaryDto[];

/* ═══════════════════════════════════════════════════════════════════════════
 * /investments/community-prices — free, human-verified alternative to paid
 * provider historical candles: a user who actually held an instrument in a
 * given month submits the price they know; once an admin verifies it against
 * a real quote it feeds backfillHistoricalPrices for every user.
 * ═══════════════════════════════════════════════════════════════════════════*/

export type CommunityPriceStatus = 'pending' | 'verified' | 'rejected';

export interface CommunityPriceDto {
  id: number;
  instrumentId: number;
  /** "YYYY-MM" */
  monthKey: string;
  /** Exact market-date supplied by the user (YYYY-MM-DD). */
  referenceDate?: string;
  /** EUR (DB is always EUR). */
  priceEur: number;
  /** As typed by the submitter, for reference only — what an admin checks against a real quote. */
  rawPrice: number;
  rawCurrency: string;
  status: CommunityPriceStatus;
  submittedBy: string;
  submittedAt: string;
  verifiedBy: string | null;
  verifiedAt: string | null;
  rejectionNote: string | null;
}

/** Returned by /community-prices/pending and /community-prices/mine, which join instrument details for display. */
export interface CommunityPriceWithInstrumentDto extends CommunityPriceDto {
  instrument: {id: number; kind: InvestmentKind; symbol: string; name: string; currency: string | null} | null;
}

export interface CommunityPriceSubmitRequest {
  instrument_id: number;
  month_key: string;
  reference_date: string;
  raw_price: number;
  raw_currency: string;
}

/** Body of the 409 response /community-prices/submit returns when an active (pending or verified) submission already exists for this instrument+month. */
export interface CommunityPriceConflict {
  existing: CommunityPriceDto;
}

export type CommunityPricesPendingResponse = CommunityPriceWithInstrumentDto[];
export type CommunityPricesMineResponse = CommunityPriceWithInstrumentDto[];

export interface CommunityPriceVerifyRequest {
  id: number;
  action: 'approve' | 'reject';
  rejection_note?: string | null;
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
  targetPercentOfNetWorth: number | null;
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
  target_percent_of_net_worth?: number | null;
  current_value?: number;
  linked_asset_key?: AssetKey | null;
  deadline?: string | null;
}

export interface GoalDeleteRequest { id: number; }

/* ═══════════════════════════════════════════════════════════════════════════
 * /shared-expenses
 * ═══════════════════════════════════════════════════════════════════════════*/

export type SharedExpenseReceivableStatus = 'pending' | 'partial' | 'settled';

export interface SharedExpenseReceivableDto {
  id: number;
  date: string;
  notes: string;
  totalAmount: number;
  ownShare: number;
  receivableAmount: number;
  settledAmount: number;
  status: SharedExpenseReceivableStatus;
}

export type SharedExpenseReceivablesGetResponse = SharedExpenseReceivableDto[];

export interface SharedExpenseReceivableAddRequest {
  date: string;
  notes?: string;
  total_amount: number;
  own_share: number;
}

export interface SharedExpenseReceivableSettleRequest {
  id: number;
  amount: number;
}

export interface SharedExpenseReceivableDeleteRequest { id: number; }
