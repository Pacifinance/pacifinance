/**
 * Pure data transformation functions extracted from UserContext.
 *
 * Each function takes raw API data and returns the shape consumed by the
 * rest of the application. Because they are pure functions (no React, no
 * side-effects) they are trivially unit-testable.
 *
 * @module utils/userDataTransformers
 */

import {
  DEFAULT_MONTHLY_SPENDING_LIMIT,
  DEFAULT_SAVINGS_GOAL_PERCENTAGE,
  DEFAULT_EMERGENCY_FUND_TARGET,
} from '../data/financeDefaults';

import { translateTagObject, translateTag as translateTagDirect } from '../data/tagTranslations';
import { addCurrency } from './money';
import type { TagsGetResponse, BalanceMonthDto } from '../types/api';

/** Raw tag object as it arrives from the user-profile API (nested in profile fields). */
interface RawTagObject {
  index?: number | null;
  label?: string | null;
  translations?: Record<string, string> | null;
  [key: string]: unknown;
}

/** Shape of the user info object as received from GET /user/get. */
interface RawUserInfoData {
  userId?: unknown;
  user_code?: unknown;
  nickname?: unknown;
  type?: unknown;
  account_type?: unknown;
  userType?: unknown;
  preferredCurrency?: unknown;
  benchmarkConsent?: unknown;
  seenBadges?: unknown;
  isAdmin?: unknown;
  country?: RawTagObject | null;
  jobCountry?: RawTagObject | null;
  job?: RawTagObject | null;
  jobType?: RawTagObject | null;
  workTime?: RawTagObject | null;
  remoteType?: RawTagObject | null;
  age?: RawTagObject | null;
  livingSituation?: RawTagObject | null;
  housingType?: RawTagObject | null;
  children?: RawTagObject | null;
  yearsOfExperience?: RawTagObject | null;
}

/** Currency tag as returned by GET /tags/get. */
interface RawCurrencyTag {
  index?: unknown;
  label?: unknown;
}

/** Raw goals object from GET /user/goals. */
interface RawGoals {
  expensesLimit?: number | null;
  savingsPercent?: number | null;
  emergencyFundGoal?: number | null;
  expensesLimitPercent?: number | null;
  expensesLimitPercentEnabled?: boolean;
  savingsAmountGoal?: number | null;
  savingsAmountGoalEnabled?: boolean;
  emergencyFundMonths?: number | null;
  emergencyFundMonthsEnabled?: boolean;
  fixedExpensesPercent?: number | null;
  categorySpendingLimits?: Record<string, number> | null;
  debtReductionGoal?: number | null;
  positionConcentrationLimit?: number | null;
  assetCategoryConcentrationLimit?: number | null;
  annualPassiveIncomeGoal?: number | null;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProfileField {
  key: number;
  value: string;
}

export interface TransformedProfile {
  userId: string;
  userType: string;
  username: string;
  preferredCurrencyCode: string;
  preferredCurrencyKey: number;
  benchmarkConsent: boolean;
  seenBadges: string[];
  isAdmin: boolean;
  profile: Record<string, ProfileField | number | { key: number; value: string }> & {
    completionPercentage: number;
    preferredCurrency: { key: number; value: string };
  };
  profileCompletionPercentage: number;
}

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
  totalValue?: number;
}

export interface BalanceMonth {
  date: string | null;
  balance: BalanceSnapshot;
}

export interface Asset {
  typology: string;
  value: number;
}

export interface ChartDatum extends BalanceSnapshot {
  month: string;
  date: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────

/**
 * Get a translated label from a tag object with fallback chain.
 * Prefers local translations (tagTranslations.js), then DB `.translations` field.
 */
export const getTranslation = (
  obj: RawTagObject | null | undefined,
  language: string,
  fallback: string,
  type?: string,
): string => translateTagObject(obj, language, fallback, type);

// ─── Tags ────────────────────────────────────────────────────────────

/** Extract categorised tag arrays from the raw `/tags/get` response. */
export const transformTags = (tagsData: TagsGetResponse) => ({
  outflowsTags: tagsData.expense || [],
  incomesTags: tagsData.income || [],
  paymentTags: tagsData.payment || [],
  nationalityTags: tagsData.country || [],
  jobTags: tagsData.job || [],
  jobTypeTags: tagsData.jobType || [],
  workTimeTags: tagsData.workTime || [],
  remoteTypeTags: tagsData.remoteType || [],
  ageTags: tagsData.age || [],
  livingSituationTags: tagsData.livingSituation || [],
  housingTypeTags: tagsData.housingType || [],
  childrenTags: tagsData.children || [],
  yearsOfExperienceTags: tagsData.yearsOfExperience || [],
  currencyTags: tagsData.currency || [],
});

// ─── User Profile ────────────────────────────────────────────────────

/** Enum mapping for user type index → string */
const USER_TYPE_DICT: Record<number, string> = {
  0: 'regular',
  1: 'premium',
  2: 'test',
  3: 'demo',
};

/** Map raw `/user/get` response to a structured profile object. */
export const transformUserProfile = (
  infoData: RawUserInfoData,
  currencyTags: unknown[],
  language: string,
): TransformedProfile => {
  const rawUserId = infoData.userId ?? infoData.user_code;
  const userId = rawUserId === null || rawUserId === undefined || rawUserId === ''
    ? ''
    : String(rawUserId);
  const rawUserType = infoData.type ?? infoData.account_type ?? infoData.userType;
  const numericUserType = Number(rawUserType);
  const userType = USER_TYPE_DICT[numericUserType]
    || (typeof rawUserType === 'string' && rawUserType ? rawUserType : 'regular');
  const username = String(infoData.nickname ?? 'Username non impostato');

  // Resolve preferred currency
  const preferredCurrencyIndex = infoData.preferredCurrency;
  let preferredCurrencyCode = 'EUR';
  let preferredCurrencyKey = -1;
  const normalizedPreferredCurrencyIndex = Number(preferredCurrencyIndex);
  if (Number.isFinite(normalizedPreferredCurrencyIndex) && currencyTags.length > 0) {
    const matchedTag = (currencyTags as Array<Record<string, unknown>>).find(tag => Number(tag['index']) === normalizedPreferredCurrencyIndex);
    const matchedLabel = matchedTag?.['label'];
    if (typeof matchedLabel === 'string' && matchedLabel) {
      preferredCurrencyCode = matchedLabel.toUpperCase();
      preferredCurrencyKey = Number(matchedTag?.['index']);
    }
  }

  const fields: Record<string, ProfileField> = {
    nationality: { key: infoData.country?.index ?? -1, value: getTranslation(infoData.country, language, 'Nazionalità non impostata') },
    whereWorks: { key: infoData.jobCountry?.index ?? -1, value: getTranslation(infoData.jobCountry, language, 'Dove lavora non impostato') },
    job: { key: infoData.job?.index ?? -1, value: getTranslation(infoData.job, language, 'Lavoro non impostato') },
    jobType: { key: infoData.jobType?.index ?? -1, value: getTranslation(infoData.jobType, language, 'Tipo di lavoro non impostato') },
    workTime: { key: infoData.workTime?.index ?? -1, value: getTranslation(infoData.workTime, language, 'Tipologia contratto non impostato') },
    remoteType: { key: infoData.remoteType?.index ?? -1, value: getTranslation(infoData.remoteType, language, 'Tipologia lavoro non impostata') },
    age: { key: infoData.age?.index ?? -1, value: getTranslation(infoData.age, language, 'Età non impostata') },
    livingSituation: { key: infoData.livingSituation?.index ?? -1, value: getTranslation(infoData.livingSituation, language, 'Situazione abitativa non impostata') },
    housingType: { key: infoData.housingType?.index ?? -1, value: getTranslation(infoData.housingType, language, 'Tipologia abitazione non impostata') },
    children: { key: infoData.children?.index ?? -1, value: getTranslation(infoData.children, language, 'Figli non impostato') },
    yearsOfExperience: { key: infoData.yearsOfExperience?.index ?? -1, value: getTranslation(infoData.yearsOfExperience, language, 'Anni di esperienza non impostati') },
  };

  const completionPercentage = calculateProfileCompletion(Object.values(fields));

  return {
    userId,
    userType,
    username,
    preferredCurrencyCode,
    preferredCurrencyKey,
    benchmarkConsent: infoData.benchmarkConsent === true,
    seenBadges: Array.isArray(infoData.seenBadges) ? infoData.seenBadges as string[] : [],
    isAdmin: infoData.isAdmin === true,
    profile: {
      ...fields,
      completionPercentage,
      preferredCurrency: { key: preferredCurrencyKey, value: preferredCurrencyCode },
    },
    profileCompletionPercentage: completionPercentage,
  };
};

// ─── Profile Completion ──────────────────────────────────────────────

/** Calculate profile completion percentage (0-100). */
export const calculateProfileCompletion = (fields: Array<{ key: number }>): number => {
  const completed = fields.filter(f => f.key !== -1).length;
  return Math.round((completed / fields.length) * 100);
};

// ─── Goals & Limits ──────────────────────────────────────────────────

export interface GoalsAndLimits {
  goals: unknown[];
  limits: {
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
  };
}

/** Build goals and limits structure with defaults. */
export const buildGoalsAndLimits = (userGoals: RawGoals | null | undefined): GoalsAndLimits => {
  const g = userGoals || { expensesLimit: -1, savingsPercent: -1, emergencyFundGoal: -1 };
  return {
    goals: [],
    limits: {
      monthlySpendingLimit: (g.expensesLimit != null && g.expensesLimit !== -1) ? g.expensesLimit : DEFAULT_MONTHLY_SPENDING_LIMIT,
      monthlySpendingLimitEnabled: g.expensesLimit !== -1,
      savingsGoalPercentage: (g.savingsPercent != null && g.savingsPercent !== -1) ? g.savingsPercent : DEFAULT_SAVINGS_GOAL_PERCENTAGE,
      savingsGoalPercentageEnabled: g.savingsPercent !== -1,
      emergencyFundTarget: (g.emergencyFundGoal != null && g.emergencyFundGoal !== -1) ? g.emergencyFundGoal : DEFAULT_EMERGENCY_FUND_TARGET,
      emergencyFundTargetEnabled: g.emergencyFundGoal !== -1,
      expensesLimitPercent: g.expensesLimitPercent ?? null,
      expensesLimitPercentEnabled: g.expensesLimitPercentEnabled ?? true,
      savingsAmountGoal: g.savingsAmountGoal ?? null,
      savingsAmountGoalEnabled: g.savingsAmountGoalEnabled ?? true,
      emergencyFundMonths: g.emergencyFundMonths ?? null,
      emergencyFundMonthsEnabled: g.emergencyFundMonthsEnabled ?? true,
      fixedExpensesPercent: g.fixedExpensesPercent ?? null,
      categorySpendingLimits: g.categorySpendingLimits ?? {},
      debtReductionGoal: g.debtReductionGoal ?? null,
      positionConcentrationLimit: g.positionConcentrationLimit ?? null,
      assetCategoryConcentrationLimit: g.assetCategoryConcentrationLimit ?? null,
      annualPassiveIncomeGoal: g.annualPassiveIncomeGoal ?? null,
      notificationsEnabled: true,
    },
  };
};

// ─── Balances ────────────────────────────────────────────────────────

/** Sum all asset fields in a balance object. */
export const calculateTotal = (balance: BalanceSnapshot | null | undefined): number => {
  if (!balance) return 0;
  return addCurrency(
    balance.cash || 0,
    balance.bank || 0,
    balance.emergencyFund || 0,
    balance.digitalServices || 0,
    balance.stocks || 0,
    balance.etf || 0,
    balance.bitcoin || 0,
    balance.crypto || 0,
    balance.bonds || 0,
    balance.funds || 0,
    balance.commodities || 0
  );
};

/** Normalise raw balance data from the API. */
export const transformBalances = (rawData: BalanceMonthDto[]): BalanceMonth[] => {
  const balancesData: BalanceMonth[] = rawData.map(monthData => ({
    date: monthData?.date || null,
    balance: monthData?.balance || {},
  }));
  balancesData.forEach(monthData => {
    monthData.balance.totalValue = calculateTotal(monthData.balance);
  });
  return balancesData;
};

// ─── Outflows Aggregation ────────────────────────────────────────────

/** Shape of a single transaction entry as stored in allOutflows / allIncomes arrays. */
interface RawTransactionEntry {
  isExpense?: unknown;
  amount?: unknown;
  categoryTag?: RawTagObject | null;
  userCategory?: { label?: string | null } | null;
  excludeFromStatistics?: unknown;
}

/** Aggregate outflows by category for each month. */
export const aggregateOutflowsByCategory = (
  allOutflowsIncomesArray: RawTransactionEntry[][],
): Record<number, Record<string, number>> => {
  const result: Record<number, Record<string, number>> = {};
  allOutflowsIncomesArray.forEach((month, index) => {
    const perCategory: Record<string, number> = {};
    if (!Array.isArray(month)) { result[index] = perCategory; return; }
    month.forEach(entry => {
      if (entry?.isExpense && !entry.excludeFromStatistics) {
        const parentCategory =
          translateTagDirect(entry.categoryTag?.label, 'en', 'expense') ||
          entry.categoryTag?.translations?.en ||
          entry.categoryTag?.label ||
          'Unknown';
        const customCategory = entry.userCategory?.label;
        const categoryKey = customCategory ? `${parentCategory} / ${customCategory}` : parentCategory;
        const amount = Number(entry.amount) || 0;
        perCategory[categoryKey] = (perCategory[categoryKey] || 0) + amount;
      }
    });
    result[index] = perCategory;
  });
  return result;
};

// ─── Monthly Arrays ──────────────────────────────────────────────────

/** Build monthly income / outflow sum arrays (13 months). */
export const buildMonthlyArrays = (
  allOutflowsIncomesArray: RawTransactionEntry[][],
): { incomesArray: number[]; outflowsArray: number[] } => {
  const incomesArray = Array(13).fill(0);
  const outflowsArray = Array(13).fill(0);
  allOutflowsIncomesArray.forEach((outerItem, index) => {
    if (!Array.isArray(outerItem)) return;
    outerItem.forEach(innerItem => {
      if (!innerItem) return;
      if (innerItem.excludeFromStatistics) return;
      const amount = Number(innerItem.amount) || 0;
      if (innerItem.isExpense) {
        outflowsArray[index] += amount;
      } else {
        incomesArray[index] += amount;
      }
    });
  });
  return { incomesArray, outflowsArray };
};

// ─── Chart Data ──────────────────────────────────────────────────────

/**
 * Format balance data for the chart. Defaults to the last 12 months; pass
 * `monthsBack` explicitly (e.g. from `userData.balances.length` once a wider
 * fetch has completed) to widen the window for the "2Y"/"ALL" period selectors.
 */
export const buildChartData = (
  balancesData: BalanceMonth[] | null | undefined,
  currentDate: Date,
  monthsBack: number = 12,
): ChartDatum[] => {
  // Index snapshots by (year, month) using the snapshot's real date so the
  // window aligns by date rather than by array position.
  const byMonth = new Map<string, BalanceMonth>();
  for (const entry of balancesData || []) {
    if (!entry?.date) continue;
    const d = new Date(entry.date);
    if (Number.isNaN(d.getTime())) continue;
    byMonth.set(`${d.getFullYear()}-${d.getMonth() + 1}`, entry);
  }
  const months = monthsBack;
  const out: ChartDatum[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    const monthString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const entry = byMonth.get(key);
    out.push({
      ...(entry?.balance || {}),
      month: monthString,
      date: entry?.date || null,
    });
  }
  return out;
};

// ─── Assets ──────────────────────────────────────────────────────────

/** Create an assets array from the current balance (non-zero entries only). */
export const buildAssetsFromBalance = (balance: BalanceSnapshot | null | undefined): Asset[] => {
  const b = balance || {};
  return [
    { typology: 'cash', value: b.cash || 0 },
    { typology: 'bank', value: b.bank || 0 },
    { typology: 'digitalServices', value: b.digitalServices || 0 },
    { typology: 'stocks', value: b.stocks || 0 },
    { typology: 'etf', value: b.etf || 0 },
    { typology: 'bitcoin', value: b.bitcoin || 0 },
    { typology: 'crypto', value: b.crypto || 0 },
    { typology: 'bonds', value: b.bonds || 0 },
    { typology: 'funds', value: b.funds || 0 },
    { typology: 'commodities', value: b.commodities || 0 },
  ].filter(asset => asset.value > 0);
};

// ─── Incomes / Outflows Split ────────────────────────────────────────

/** Split the raw expenses-and-incomes matrix into two separate arrays. */
export const splitIncomesOutflows = (
  allOutflowsIncomesArray: Record<string, unknown>[][],
): { allOutflows: Record<string, unknown>[][]; allIncomes: Record<string, unknown>[][] } => ({
  allOutflows: allOutflowsIncomesArray.map(m => Array.isArray(m) ? m.filter(d => d?.isExpense) : []),
  allIncomes: allOutflowsIncomesArray.map(m => Array.isArray(m) ? m.filter(d => d && !d.isExpense) : []),
});
