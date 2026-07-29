/**
 * Pure, adaptive portfolio analytics — every function degrades gracefully
 * depending on how much history the user has actually recorded, rather than
 * failing or faking a number. CSV import always backfills invested_amount
 * history, but current_value only exists for months where the user actually
 * refreshed live prices or entered a value by hand — so anything that needs
 * "real growth" (not just cost basis) must explicitly check for that and
 * report back what data is missing, rather than silently substituting cost
 * basis and calling it growth.
 *
 * @module utils/investmentAnalytics
 */
import type { InvestmentHoldingDto, InvestmentHoldingHistoryDto, AssetKey } from '../types/api';

export interface HoldingsSummary {
  count: number;
  totalInvested: number;
  totalCurrent: number;
  /** True if at least one holding has a real current_value (not just cost basis). */
  hasRealCurrentValue: boolean;
  gain: number | null;
  gainPct: number | null;
  best: { symbol: string; gainPct: number } | null;
  worst: { symbol: string; gainPct: number } | null;
}

/** Label/value helper for a holding, matching getHoldingLabel's fallback chain. */
function labelFor(holding: InvestmentHoldingDto): string {
  return holding.instrument?.symbol || holding.instrument?.name || holding.notes || `#${holding.id}`;
}

export function summarizeHoldings(holdings: InvestmentHoldingDto[], assetKey: AssetKey | null): HoldingsSummary {
  const relevant = assetKey ? holdings.filter((h) => h.assetKey === assetKey) : holdings;
  const totalInvested = relevant.reduce((sum, h) => sum + (h.investedAmount ?? 0), 0);
  const totalCurrent = relevant.reduce((sum, h) => sum + (h.currentValue ?? h.investedAmount ?? 0), 0);
  const hasRealCurrentValue = relevant.some((h) => h.currentValue != null);

  const gain = hasRealCurrentValue ? totalCurrent - totalInvested : null;
  const gainPct = gain != null && totalInvested > 0 ? (gain / totalInvested) * 100 : null;

  let best: HoldingsSummary['best'] = null;
  let worst: HoldingsSummary['worst'] = null;
  for (const h of relevant) {
    if (h.currentValue == null || h.investedAmount == null || h.investedAmount === 0) continue;
    const pct = ((h.currentValue - h.investedAmount) / h.investedAmount) * 100;
    const symbol = labelFor(h);
    if (!best || pct > best.gainPct) best = { symbol, gainPct: pct };
    if (!worst || pct < worst.gainPct) worst = { symbol, gainPct: pct };
  }

  return { count: relevant.length, totalInvested, totalCurrent, hasRealCurrentValue, gain, gainPct, best, worst };
}

export interface ContributionEstimate {
  /** Average € added per month across the available history, or null if under 2 distinct months exist. */
  monthlyAverage: number | null;
  monthsAvailable: number;
}

/**
 * Estimates the average monthly amount invested from invested_amount history
 * deltas — this only needs the backfill every CSV import already produces,
 * so it's available far more often than a real growth rate.
 */
export function estimateMonthlyContribution(history: InvestmentHoldingHistoryDto[], assetKey: AssetKey | null): ContributionEstimate {
  const relevant = assetKey ? history.filter((h) => h.assetKey === assetKey) : history;
  const byMonth = new Map<string, number>();
  for (const entry of relevant) {
    if (entry.investedAmount == null) continue;
    const month = entry.userDate.slice(0, 7);
    byMonth.set(month, (byMonth.get(month) ?? 0) + entry.investedAmount);
  }
  const months = Array.from(byMonth.keys()).sort();
  if (months.length < 2) return { monthlyAverage: null, monthsAvailable: months.length };

  let totalDelta = 0;
  for (let i = 1; i < months.length; i++) {
    totalDelta += (byMonth.get(months[i]) ?? 0) - (byMonth.get(months[i - 1]) ?? 0);
  }
  return { monthlyAverage: totalDelta / (months.length - 1), monthsAvailable: months.length };
}

export interface GrowthRateEstimate {
  /** Compound monthly growth rate (e.g. 0.01 = 1%/month), or null if under 2 distinct months have a real current_value. */
  monthlyRate: number | null;
  monthsAvailable: number;
}

/**
 * Estimates a compound monthly growth rate from current_value history — the
 * "real" (market-driven) growth, distinct from estimateMonthlyContribution's
 * cost-basis view. Needs at least 2 distinct months where current_value was
 * actually recorded (via price refresh or manual entry); everything else is
 * cost basis and can't tell growth from new money going in.
 */
export function estimateMonthlyGrowthRate(history: InvestmentHoldingHistoryDto[], assetKey: AssetKey | null): GrowthRateEstimate {
  const relevant = assetKey ? history.filter((h) => h.assetKey === assetKey) : history;
  const byMonth = new Map<string, number>();
  for (const entry of relevant) {
    if (entry.currentValue == null) continue;
    const month = entry.userDate.slice(0, 7);
    byMonth.set(month, (byMonth.get(month) ?? 0) + entry.currentValue);
  }
  const months = Array.from(byMonth.keys()).sort();
  if (months.length < 2) return { monthlyRate: null, monthsAvailable: months.length };

  const first = byMonth.get(months[0]) ?? 0;
  const last = byMonth.get(months[months.length - 1]) ?? 0;
  if (first <= 0 || last <= 0) return { monthlyRate: null, monthsAvailable: months.length };

  const elapsedMonths = months.length - 1;
  const monthlyRate = Math.pow(last / first, 1 / elapsedMonths) - 1;
  return { monthlyRate, monthsAvailable: months.length };
}

export interface GoalProjection {
  alreadyReached: boolean;
  reachable: boolean;
  /** Months until the target is reached, or null if unreachable within a 50-year cap. */
  months: number | null;
  /** Whether a real growth rate was factored in — false means this is a conservative,
   * contribution-only estimate (no market growth assumed). */
  usedGrowthRate: boolean;
}

const MAX_PROJECTION_MONTHS = 600; // 50 years — well past "not realistically reachable"

/**
 * Projects how many months until `targetValue` is reached, compounding
 * `monthlyGrowthRate` (if known) and adding `monthlyContribution` (if known)
 * every month. Both are optional and independent: with neither, the goal is
 * "reachable" only if already met. This is deliberately a simple month-by-month
 * simulation (not a closed-form annuity formula) — easier to reason about and
 * test, and it degrades the same way regardless of which inputs are missing.
 */
export function projectGoalETA(params: {
  currentValue: number;
  targetValue: number;
  monthlyContribution: number | null;
  monthlyGrowthRate: number | null;
}): GoalProjection {
  const { currentValue, targetValue } = params;
  if (currentValue >= targetValue) {
    return { alreadyReached: true, reachable: true, months: 0, usedGrowthRate: false };
  }

  const contribution = params.monthlyContribution ?? 0;
  const rate = params.monthlyGrowthRate ?? 0;
  const usedGrowthRate = params.monthlyGrowthRate != null;

  if (contribution <= 0 && rate <= 0) {
    return { alreadyReached: false, reachable: false, months: null, usedGrowthRate };
  }

  let value = currentValue;
  let months = 0;
  while (value < targetValue && months < MAX_PROJECTION_MONTHS) {
    value = value * (1 + rate) + contribution;
    months++;
  }
  if (value < targetValue) return { alreadyReached: false, reachable: false, months: null, usedGrowthRate };
  return { alreadyReached: false, reachable: true, months, usedGrowthRate };
}
