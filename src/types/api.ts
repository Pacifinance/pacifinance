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
  | 'gold';

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
  | 'gold';

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

/** Full GET /balances/get response — 24 months oldest-last / newest-first. */
export type BalancesGetResponse = BalanceMonthDto[];

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
  gold: number;
}

export interface BalanceAddRequest {
  balance: BalanceAddPayload;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * /expenses
 * ═══════════════════════════════════════════════════════════════════════════*/

export interface ExpenseDto {
  date: string;         // ISO
  amount: number;       // in EUR, already rounded server-side
  is_expense: boolean;  // true = outflow, false = income
  notes: string;
  payment_type: number; // index into tags.paymentTags (0 for income)
  category_tag: number; // index into tags.outflowsTags / tags.incomesTags
}

export interface ExpenseAddRequest { expense: ExpenseDto; }

/** Single month bucket returned by POST /expenses/get (13-element array). */
export interface ExpensesMonthDto {
  date: string;
  expenses: ExpenseDto[];
}

export type ExpensesGetResponse = ExpensesMonthDto[];

export interface ExpenseDeleteRequest {
  expense: Pick<ExpenseDto, 'date' | 'amount' | 'is_expense'>;
}

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
