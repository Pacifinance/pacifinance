import express from "express"

import cache from "../../cache/cache"

/* === /prices/* === */

const pricesRouter = express.Router()

pricesRouter.get("/:key", async (req, res) => {
    // Check if the price key is valid is valid. Send status 404
    // (Not Found) if it's not valid
    const key = req.params.key
    if (!["crypto"].includes(key)) {
        res.status(404)
        res.send()
        return
    }
    // Self-refresh on read instead of relying on a cron: Vercel's Hobby plan
    // caps cron jobs at 2 (already used by refresh-user-averages/delete-users)
    // and disallows schedules more frequent than once/day anyway, so an hourly
    // refresh (matching this cache entry's TTL) can't be a cron on Hobby. The
    // first request after the TTL lapses pays the CoinGecko round-trip;
    // fetchCryptoPrices() falls back to the previous cached value on error.
    if (await cache.valueExpired(key))
        await cache.invalidate(key)
    // Retrieve the cached value and send it to the client with status code 200 (OK)
    const value = await cache.get(key)
    res.status(200)
    res.json(value)
})

export default pricesRouter