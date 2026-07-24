import express from "express"

import cache from "../../cache/cache"

/* === /exchange-rates === */

const exchangeRatesRouter = express.Router()

exchangeRatesRouter.get("/", async (_req, res) => {
    // Self-refresh on read, same pattern as /prices/:key — see prices.ts for why.
    if (await cache.valueExpired("exchangeRates"))
        await cache.invalidate("exchangeRates")
    const value = await cache.get("exchangeRates")
    res.status(200)
    res.json(value)
})

export default exchangeRatesRouter
