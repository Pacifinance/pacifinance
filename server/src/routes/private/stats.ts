import express from "express"

import cache from "../../cache/cache"
import { AveragesCachedData } from "../../cache/items/averages"
import users from "../../db/models/users"
import investmentBenchmarks, {type InvestmentBenchmarkMetric} from "../../db/models/investmentBenchmarks"
import supabase from "../../db/supabase"
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

type BehaviourMetric = "savingConsistency" | "investmentRegularity" | "contributionFrequency" | "goalProgress"
const percentile = (value: number, values: number[]) => {
    if (!values.length) return null
    return Math.round(values.filter((candidate) => candidate <= value).length / values.length * 100)
}

/** Privacy-safe behavioural indicators; unlike wealth rankings these describe habits, not financial size. */
statsRouter.post("/behaviour-benchmark", async (req, res) => {
    const userId = req.userId as string
    const profile = await users.getPublicInfoByUserId(userId)
    const personalMetrics = (await investmentBenchmarks.getMetrics([userId]))[0] ?? null
    if (!profile?.benchmarkConsent) return res.json({available: false, reason: "consent_required", minimumCohortSize: MIN_COHORT})
    const ids = (await users.getAllBenchmarkUserIds()).map((user) => user.id).filter((id) => id !== userId)
    if (ids.length < MIN_COHORT) return res.json({available: false, reason: "minimum_cohort", minimumCohortSize: MIN_COHORT, cohortSize: ids.length})
    const rows = await investmentBenchmarks.getMetrics([userId, ...ids])
    const values: Record<BehaviourMetric, number[]> = {
        savingConsistency: rows.map((row) => row.consistencyPercent),
        investmentRegularity: rows.map((row) => row.activeMonths / Math.max(row.observedMonths, 1) * 100),
        contributionFrequency: rows.map((row) => row.averageTransactionsPerActiveMonth),
        goalProgress: [],
    }
    const goals = await supabase.from("user_goals").select("user_id, target_value, current_value").in("user_id", [userId, ...ids])
    if (!goals.error) {
        const byUser = new Map<string, number[]>()
        for (const row of (goals.data ?? []) as Array<{user_id: string; target_value: number | null; current_value: number | null}>) {
            const target = Number(row.target_value ?? 0)
            if (target > 0) {
                const list = byUser.get(row.user_id) ?? []
                list.push(Math.min(100, Math.max(0, Number(row.current_value ?? 0) / target * 100)))
                byUser.set(row.user_id, list)
            }
        }
        for (const id of [userId, ...ids]) values.goalProgress.push((byUser.get(id) ?? []).reduce((sum, value, _, list) => sum + value / list.length, 0))
    }
    const personal = {
        savingConsistency: personalMetrics?.consistencyPercent ?? null,
        investmentRegularity: personalMetrics ? personalMetrics.activeMonths / Math.max(personalMetrics.observedMonths, 1) * 100 : null,
        contributionFrequency: personalMetrics?.averageTransactionsPerActiveMonth ?? null,
        goalProgress: values.goalProgress[0] ?? null,
    }
    const rankings = Object.fromEntries((Object.keys(personal) as BehaviourMetric[]).map((key) => {
        const cohort = key === "goalProgress" ? values.goalProgress.slice(1) : values[key].slice(1)
        return [key, personal[key] == null ? null : percentile(personal[key] as number, cohort)]
    }))
    return res.json({available: true, minimumCohortSize: MIN_COHORT, cohortSize: ids.length, personal, rankings, metricDefinitions: {savingConsistency: "percentage of observed months with a positive saving flow", investmentRegularity: "percentage of observed months with at least one investment", contributionFrequency: "average investment transactions in active months", goalProgress: "average progress toward active goals"}})
})

export default statsRouter
