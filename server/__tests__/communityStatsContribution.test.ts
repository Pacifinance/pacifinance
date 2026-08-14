import { describe, expect, it } from "vitest"

import { buildContributionEnvelope, roundMetrics, PROTOCOL_VERSION, ALGORITHM_VERSION } from "../src/services/communityStatsContribution"

const metrics = {
    netWorth: 25123,
    monthlyIncome: 3012,
    monthlyOutflows: 1789,
    savingRate: 40.4,
    emergencyRunwayMonths: 6.2,
    fixedCostRatio: 27.6,
    assetAllocation: {liquid: 39.6, investments: 50.1, crypto: 10.3}
}

describe("communityStatsContribution", () => {
    it("rounds currency metrics to the nearest 50 and ratios to the nearest whole number", () => {
        expect(roundMetrics(metrics)).toEqual({
            netWorth: 25100,
            monthlyIncome: 3000,
            monthlyOutflows: 1800,
            savingRate: 40,
            emergencyRunwayMonths: 6,
            fixedCostRatio: 28,
            assetAllocation: {liquid: 40, investments: 50, crypto: 10}
        })
    })

    it("builds an envelope matching docs/COMMUNITY_STATS_PROTOCOL.md's shape from caller-supplied inputs", () => {
        const envelope = buildContributionEnvelope({
            period: "2026-06",
            installationPseudonym: "rotating-monthly-id",
            profileBuckets: {career: "bucket-1", location: "bucket-2", lifeStage: "bucket-3", household: "bucket-4"},
            metrics,
            quality: {monthsOfHistory: 14, completeness: "complete"}
        })

        expect(envelope).toEqual({
            protocolVersion: PROTOCOL_VERSION,
            algorithmVersion: ALGORITHM_VERSION,
            period: "2026-06",
            installationPseudonym: "rotating-monthly-id",
            profileBuckets: {career: "bucket-1", location: "bucket-2", lifeStage: "bucket-3", household: "bucket-4"},
            metrics: roundMetrics(metrics),
            quality: {monthsOfHistory: 14, completeness: "complete"}
        })
    })

    it("does not mutate the input metrics object", () => {
        const original = {...metrics, assetAllocation: {...metrics.assetAllocation}}
        roundMetrics(metrics)
        expect(metrics).toEqual(original)
    })
})
