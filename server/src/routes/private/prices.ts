import express from "express"

import cache from "../../cache/cache"
import common from "../common"

/* === /prices/* === */

const pricesRouter = express.Router()

pricesRouter.use(common.checkSessionMiddleware)

pricesRouter.get("/:key", async (req, res) => {
    // Check if the price key is valid is valid. Send status 404
    // (Not Found) if it's not valid
    const key = req.params.key
    if (!["crypto"].includes(key)) {
        res.status(404)
        res.send()
        return
    }
    // Retrieve the cached value and send it to the client with status code 200 (OK)
    const value = await cache.get(key)
    res.status(200)
    res.json(value)
})

export default pricesRouter