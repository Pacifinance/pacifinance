import express from "express"

import db from "../../db/db"
import cache from "../../cache/cache"
import users from "../../db/models/users"

/**
 * Cron endpoints, meant to be invoked by Vercel Cron (see vercel.json) instead
 * of the in-process "cron" package job scheduler used on the previous
 * always-on server. Authenticated via a shared secret header instead of a
 * user session.
 */
const cronRouter = express.Router()

function isAuthorized(req: express.Request) {
    const expected = process.env.CRON_SECRET
    if (!expected) return false
    return req.headers.authorization === `Bearer ${expected}`
}

cronRouter.use((req, res, next) => {
    if (!isAuthorized(req)) {
        res.status(401).send()
        return
    }
    next()
})

/**
 * Deletes all users whose deletion date (in the deletion queue) has passed.
 * Deleting the Supabase Auth user cascades to profile/balances/expenses/queue
 * rows automatically (all foreign keys are ON DELETE CASCADE), so there's no
 * need to delete them one by one as the previous MongoDB job did.
 */
cronRouter.get("/delete-users", async (_, res) => {
    const queued = await db.delqueue.getAllAccountsInQueue()
    const now = new Date()
    let deleted = 0
    for (const entry of queued) {
        if (entry.scheduledFor > now)
            continue
        const result = await users.deleteUserById(entry.userId)
        if (result !== null)
            deleted++
    }
    res.status(200).json({deleted})
})

/**
 * Refreshes the crypto prices cache entry if expired
 */
cronRouter.get("/refresh-crypto-prices", async (_, res) => {
    if (await cache.valueExpired("crypto"))
        await cache.invalidate("crypto")
    res.status(200).send()
})

/**
 * Refreshes the user averages and rankings cache entries if expired. Both
 * share this single monthly cron slot (Vercel Hobby caps cron jobs at 2, and
 * disallows more-than-daily schedules anyway) since both need the same
 * per-user "similar users" cohorts. Vercel Cron always hits this without
 * ?force - the query param exists so a maintainer can trigger an immediate
 * recompute (e.g. right after a similarUsers.ts logic change) instead of
 * waiting for the entries' monthly TTL to lapse.
 */
cronRouter.get("/refresh-user-averages", async (req, res) => {
    const force = req.query.force === "true"
    if (force || await cache.valueExpired("userAverages"))
        await cache.invalidate("userAverages")
    if (force || await cache.valueExpired("userRankings"))
        await cache.invalidate("userRankings")
    res.status(200).send()
})

export default cronRouter
