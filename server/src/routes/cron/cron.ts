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
 *
 * Also runs due recurring transactions (subscriptions, rent, salary...),
 * turning each due template into a real expenses row. Piggybacks on this
 * daily slot rather than getting its own cron entry: Vercel Hobby caps cron
 * jobs at 2 (see refresh-user-averages below for the same constraint), and
 * this task is daily anyway.
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

    const recurring = await db.recurringTransactions.runAllDue(now)

    res.status(200).json({deleted, recurring})
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
 *
 * The two invalidations run concurrently (not one after the other), so the
 * combined wall time is the slower of the two. Each job uses bulk Supabase
 * aggregates and in-memory cohort selection; this keeps the path within the
 * serverless timeout as the transaction history grows.
 *
 * ?target=averages|rankings restricts the run to just one of the two - useful
 * to manually force-populate a cold cache in two smaller, faster requests
 * instead of one combined one when the user count makes even the parallel
 * version tight against the timeout.
 */
cronRouter.get("/refresh-user-averages", async (req, res) => {
    const force = req.query.force === "true"
    const target = req.query.target // "averages" | "rankings" | undefined (both)

    const jobs: Promise<void>[] = []
    if (target !== "rankings") {
        jobs.push((async () => {
            if (force || await cache.valueExpired("userAverages"))
                await cache.invalidate("userAverages")
        })())
    }
    if (target !== "averages") {
        jobs.push((async () => {
            if (force || await cache.valueExpired("userRankings"))
                await cache.invalidate("userRankings")
        })())
    }
    await Promise.all(jobs)

    res.status(200).send()
})

export default cronRouter
