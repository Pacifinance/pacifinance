import express from "express"
import { SessionData } from "express-session"

import cache from "../../cache/cache"
import { AveragesCachedData } from "../../cache/items/averages"
import users from "../../db/models/users"

/* === /stats/* === */

const statsRouter = express.Router()

statsRouter.post("/averages", async (req, res) => {
    // Retrieve the cached value and send it to the client with status code 200 (OK)

    const session = req.session as SessionData
    const userId = session.userId
    const userData = await users.getReferenceByUserId(userId)
    if (!userData) {
        res.status(500).send()
        return
    }

    const allAverages = await cache.get("userAverages") as AveragesCachedData
    const userRef = userData._id.toString()
    const userAverages: AveragesCachedData = {
        all: allAverages.all,
        similar: allAverages[userRef]
    }
    res.status(200).json(userAverages)
})

export default statsRouter