import express from "express"
import { SessionData } from "express-session"

import cache from "../../cache/cache";
import common from "../common";
import users from "../../db/models/users"

/* === /stats/* === */

const statsRouter = express.Router()

statsRouter.use(common.checkSessionMiddleware)

statsRouter.post("/averages", async (req, res) => {
    // Retrieve the cached value and send it to the client with status code 200 (OK)

    const session = req.session as SessionData
    const userId = session.userId;
    const userData = await users.getReferenceByUserId(userId)
    var userRef = undefined
    if (userData !== null)
        userRef = userData._id.toString()

    const allAverages = cache.get("userAverages");
    let userAverages = {all: allAverages.all, similar: 0}
    if (userRef)
        userAverages.similar = allAverages[userRef]

    res.status(200).json(userAverages);
});

export default statsRouter