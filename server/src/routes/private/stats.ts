import express from "express"

import cache from "../../cache/cache"
import { AveragesCachedData } from "../../cache/items/averages"
import users from "../../db/models/users"
import investmentBenchmarks, {type InvestmentBenchmarkMetric} from "../../db/models/investmentBenchmarks"
import {MIN_COHORT} from "../../services/similarUsers"

/* === /stats/* === */

const statsRouter = express.Router()

statsRouter.post("/averages", async (req, res) => {
    const allAverages = await cache.get("userAverages") as AveragesCachedData | null
    
    if (!allAverages) {
        return res.status(503).json({ error: "Averages cache not yet initialized. Try again in a moment." })
    }
    
    const userAverages: AveragesCachedData = {
        all: allAverages.all,
        similar: allAverages[req.userId as string]
    }
    res.status(200).json(userAverages)
})

type MetricKey = Exclude<keyof InvestmentBenchmarkMetric, "userId" | "observedMonths" | "activeMonths">
const summarize = (rows: InvestmentBenchmarkMetric[], key: MetricKey) => {
    const values = rows.map((row) => row[key]).filter((value): value is number => typeof value === "number" && Number.isFinite(value)).sort((a, b) => a - b)
    const median = values.length % 2 ? values[(values.length - 1) / 2] : (values[values.length / 2 - 1] + values[values.length / 2]) / 2
    return {median: values.length ? median : null, contributorCount: values.length}
}

/** Privacy boundary: clients receive the current user's metrics plus cohort medians, never another user's rows. */
statsRouter.post("/investment-benchmark", async (req, res) => {
    const userId = req.userId as string
    const profile = await users.getPublicInfoByUserId(userId)
    const personal = (await investmentBenchmarks.getMetrics([userId]))[0] ?? null
    if (!profile?.benchmarkConsent) {
        return res.status(200).json({personal, comparison: {available: false, reason: "consent_required", minimumCohortSize: MIN_COHORT, cohortSize: 0}})
    }
    const consented = (await users.getAllBenchmarkUserIds()).map((user) => user.id).filter((id) => id !== userId)
    if (consented.length < MIN_COHORT) {
        return res.status(200).json({personal, comparison: {available: false, reason: "minimum_cohort", minimumCohortSize: MIN_COHORT, cohortSize: consented.length}})
    }
    const rows = await investmentBenchmarks.getMetrics(consented)
    const keys: MetricKey[] = ["consistencyPercent", "averageMonthlyContribution", "averageTransactionsPerActiveMonth", "moneyWeightedReturn", "timeWeightedReturn"]
    const metrics = Object.fromEntries(keys.map((key) => [key, summarize(rows, key)]))
    res.status(200).json({
        personal,
        comparison: {
            available: true,
            minimumCohortSize: MIN_COHORT,
            cohortSize: rows.length,
            reliability: rows.length >= MIN_COHORT * 2 ? "high" : "medium",
            metrics
        }
    })
})

export default statsRouter
