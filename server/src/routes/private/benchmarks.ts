import express from "express"

import cache from "../../cache/cache"
import type { AveragesCachedData } from "../../cache/items/averages"
import type { RankingsCachedData } from "../../cache/items/rankings"

const benchmarksRouter = express.Router()

/** One cached community-comparison response, replacing two initial requests. */
benchmarksRouter.post("/summary", async (req, res) => {
    const [allRankings, allAverages] = await Promise.all([
        cache.get("userRankings") as Promise<RankingsCachedData | null>,
        cache.get("userAverages") as Promise<AveragesCachedData | null>
    ])
    const userId = req.userId as string
    const rankings = allRankings?.[userId]
    const averages = allAverages ? {all: allAverages.all, similar: allAverages[userId]} : null
    if (!rankings && !averages) {
        res.status(503).json({error: "Community benchmark cache not yet initialized. Try again in a moment."})
        return
    }
    res.status(200).json({rankings: rankings ?? null, averages})
})

export default benchmarksRouter
