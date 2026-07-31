/**
 * Frontend UserData shape — the canonical "logged-in user snapshot" consumed
 * by contexts, hooks and components. This is the *post-transformation*
 * shape (see `src/utils/userDataTransformers.ts`), not the raw API response.
 *
 * For the raw server contract see `src/types/api.ts`.
 *
 * @module types/user
 */

import type { BalanceMonthDto, CommunityPriceWithInstrumentDto, ExpenseDto, InvestmentTransactionSummaryDto, StatsAverageBucket, TagDto, TransactionDto } from './api';
import type { KeyValue } from './common';

// ─── Profile ─────────────────────────────────────────────────────────

export type UserType = 'regular' | 'premium' | 'test' | 'demo';

export interface UserProfile {
  nationality: KeyValue;
  whereWorks: KeyValue;
  job: KeyValue;
  jobType: KeyValue;
  workTime: KeyValue;
  remoteType: KeyValue;
  age: KeyValue;
  livingSituation: KeyValue;
  housingType: KeyValue;
  children: KeyValue;
  yearsOfExperience: KeyValue;
  preferredCurrency: KeyValue<number, string>;
  completionPercentage: number;
}

// ─── Balances / Expenses / Incomes ───────────────────────────────────

export interface BalanceSnapshot {
  cash?: number;
  bank?: number;
  emergencyFund?: number;
  digitalServices?: number;
  stocks?: number;
  etf?: number;
  bitcoin?: number;
  crypto?: number;
  bonds?: number;
  funds?: number;
  commodities?: number;
  /** Computed sum of all assets; attached by `calculateTotal`. */
  totalValue?: number;
}

/** A `{date, balance}` entry. Alias for the API DTO for now. */
export type BalanceEntry = BalanceMonthDto;

export interface Expenses {
  allOutflows: ExpenseDto[][];
  outflowsArray: number[];
  totalOutflowsPerCategoryPerMonth: Record<string, Record<string, number>>;
  totalOutflowsMonth?: number;
}

export interface Incomes {
  allIncomes: ExpenseDto[][];
  incomesArray: number[];
  totalIncomesMonth?: number;
}

// ─── Tags ────────────────────────────────────────────────────────────

export interface UserTags {
  outflowsTags: TagDto[];
  incomesTags: TagDto[];
  paymentTags: TagDto[];
  nationalityTags: TagDto[];
  jobTags: TagDto[];
  jobTypeTags: TagDto[];
  workTimeTags: TagDto[];
  remoteTypeTags: TagDto[];
  ageTags: TagDto[];
  livingSituationTags: TagDto[];
  housingTypeTags: TagDto[];
  childrenTags: TagDto[];
  yearsOfExperienceTags: TagDto[];
  currencyTags: TagDto[];
}

// ─── Rankings / Goals / Limits / Dates ───────────────────────────────

export interface Rankings {
  balance: number;
  incomes: number;
  outflows: number;
  balanceSimilar: number;
  incomesSimilar: number;
  outflowsSimilar: number;
}

export interface Limits {
  monthlySpendingLimit: number;
  monthlySpendingLimitEnabled: boolean;
  savingsGoalPercentage: number;
  savingsGoalPercentageEnabled: boolean;
  emergencyFundTarget: number;
  emergencyFundTargetEnabled: boolean;
  notificationsEnabled: boolean;
  expensesLimitPercent: number | null;
  expensesLimitPercentEnabled: boolean;
  savingsAmountGoal: number | null;
  savingsAmountGoalEnabled: boolean;
  emergencyFundMonths: number | null;
  emergencyFundMonthsEnabled: boolean;
  fixedExpensesPercent: number | null;
  categorySpendingLimits: Record<string, number>;
  debtReductionGoal: number | null;
  positionConcentrationLimit: number | null;
  assetCategoryConcentrationLimit: number | null;
  annualPassiveIncomeGoal: number | null;
}

export interface UserDates {
  current: string;
  preMonth: string;
  preYearSameMonth: string;
}

// ─── Root ────────────────────────────────────────────────────────────

export interface UserData {
  userId: string;
  userType: UserType;
  username: string;
  /** Resolved currency code (e.g. `'EUR'`), derived from `profile.preferredCurrency`. */
  currency: string;
  profile: UserProfile;
  profileCompletionPercentage: number;
  balances: BalanceEntry[];
  expenses: Expenses;
  incomes: Incomes;
  tags: UserTags;
  rankings: Rankings;
  dates: UserDates;
  goals: unknown[];
  limits: Limits;
  assets: Array<{ typology: string; value: number }>;
  averages: {
    all: StatsAverageBucket;
    similar: StatsAverageBucket;
  };
  /** On-demand-fetched single months beyond the loaded window, keyed by 'YYYY-MM' — see fetchMonthDetail in UserContext. */
  extraMonths?: Record<string, TransactionDto[]>;
  /** Badge IDs the user has already been notified about (server-side, so it doesn't replay on a new device/browser). */
  seenBadges?: string[];
  /** Elevated permission to moderate community-submitted historical prices — see getIsAdmin. */
  isAdmin?: boolean;
  activity?: {
    investmentTransactions: InvestmentTransactionSummaryDto[];
    communityPriceSubmissions: CommunityPriceWithInstrumentDto[];
  };
}
