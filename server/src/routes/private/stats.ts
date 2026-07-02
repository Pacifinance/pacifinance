import express from "express"

import cache from "../../cache/cache"
import { AveragesCachedData } from "../../cache/items/averages"

/* === /stats/* === */

const statsRouter = express.Router()

statsRouter.post("/averages", async (req, res) => {
    // Retrieve the cached value and send it to the client with status code 200 (OK)
    const allAverages = await cache.get("userAverages") as AveragesCachedData
    const userAverages: AveragesCachedData = {
        all: allAverages.all,
        similar: allAverages[req.userId as string]
    }
    res.status(200).json(userAverages)
})

export default statsRouter
