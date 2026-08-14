import type { ComparisonFactorGroup } from "./similarUsers"
import type { AssetAllocation } from "../db/models/benchmarks"

/**
 * Shape-mapper for the cross-instance community-stats contribution envelope
 * specified in docs/COMMUNITY_STATS_PROTOCOL.md ("a protocol draft, not an
 * enabled network endpoint" - see that doc and docs/PRIVACY_ANONYMITY.md).
 *
 * This is deliberately NOT a complete pipeline:
 * - It does not derive privacy-safe profile buckets from raw tag ids. No
 *   such coarsening logic exists yet; designing it is real, unreviewed work
 *   against PRIVACY_ANONYMITY.md's bucketing/rare-combination rules, out of
 *   scope here. Callers must supply already-bucketed values.
 * - It does not generate `installationPseudonym`. No concept of a stable,
 *   rotating per-installation identifier exists anywhere in this codebase
 *   yet; callers supply it as a typed input.
 * - It does not sign the envelope or send it anywhere. There is no hosted
 *   receiving endpoint on pacifinance.com yet (todo.md Phase 4). A future
 *   change adds the actual transport once one exists.
 *
 * In short: this turns already-computed, already-anonymized inputs into the
 * exact JSON shape the protocol expects, and nothing else.
 */

export const PROTOCOL_VERSION = "1"
export const ALGORITHM_VERSION = "similarity-v1"

/**
 * Rounding granularity for currency amounts before they'd ever leave an
 * instance, per the protocol doc's "amounts are rounded to a documented
 * granularity" requirement (which never states the number). This is a
 * first-pass, tunable choice, not final privacy policy - revisit once the
 * transport/signing side of the protocol is actually designed.
 */
const CURRENCY_ROUNDING_STEP = 50
const RATIO_ROUNDING_STEP = 1

export type CommunityStatsQuality = {
    monthsOfHistory: number
    completeness: "complete" | "partial"
}

export type CommunityStatsMetrics = {
    netWorth: number
    monthlyIncome: number
    monthlyOutflows: number
    savingRate: number
    emergencyRunwayMonths: number
    fixedCostRatio: number
    assetAllocation: AssetAllocation
}

export type ContributionEnvelope = {
    protocolVersion: string
    algorithmVersion: string
    /** "YYYY-MM" */
    period: string
    installationPseudonym: string
    profileBuckets: Record<ComparisonFactorGroup, string>
    metrics: CommunityStatsMetrics
    quality: CommunityStatsQuality
}

function roundToStep(value: number, step: number): number {
    return Math.round(value / step) * step
}

/** Rounds every metric to CURRENCY_ROUNDING_STEP/RATIO_ROUNDING_STEP. Exported
 * separately so a future caller can round once and inspect the result before
 * deciding whether to include it in an envelope. */
export function roundMetrics(metrics: CommunityStatsMetrics): CommunityStatsMetrics {
    return {
        netWorth: roundToStep(metrics.netWorth, CURRENCY_ROUNDING_STEP),
        monthlyIncome: roundToStep(metrics.monthlyIncome, CURRENCY_ROUNDING_STEP),
        monthlyOutflows: roundToStep(metrics.monthlyOutflows, CURRENCY_ROUNDING_STEP),
        savingRate: roundToStep(metrics.savingRate, RATIO_ROUNDING_STEP),
        emergencyRunwayMonths: roundToStep(metrics.emergencyRunwayMonths, RATIO_ROUNDING_STEP),
        fixedCostRatio: roundToStep(metrics.fixedCostRatio, RATIO_ROUNDING_STEP),
        assetAllocation: {
            liquid: roundToStep(metrics.assetAllocation.liquid, RATIO_ROUNDING_STEP),
            investments: roundToStep(metrics.assetAllocation.investments, RATIO_ROUNDING_STEP),
            crypto: roundToStep(metrics.assetAllocation.crypto, RATIO_ROUNDING_STEP),
        }
    }
}

export type BuildContributionEnvelopeInput = {
    period: string
    installationPseudonym: string
    profileBuckets: Record<ComparisonFactorGroup, string>
    metrics: CommunityStatsMetrics
    quality: CommunityStatsQuality
}

/**
 * Pure function: maps already-bucketed, already-computed inputs into the
 * protocol's envelope shape. Rounds metrics via roundMetrics() - callers
 * should not pre-round. No network call, no signature.
 */
export function buildContributionEnvelope(input: BuildContributionEnvelopeInput): ContributionEnvelope {
    return {
        protocolVersion: PROTOCOL_VERSION,
        algorithmVersion: ALGORITHM_VERSION,
        period: input.period,
        installationPseudonym: input.installationPseudonym,
        profileBuckets: input.profileBuckets,
        metrics: roundMetrics(input.metrics),
        quality: input.quality
    }
}

export default { buildContributionEnvelope, roundMetrics, PROTOCOL_VERSION, ALGORITHM_VERSION }
