import express from "express"

import cache from "../../cache/cache"
import { AveragesCachedData } from "../../cache/items/averages"

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

export default statsRouter
