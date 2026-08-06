import express from "express"

import { ExtDate } from "../../libs/datelib"

import db from "../../db/db"
import cache from "../../cache/cache"
import similarUsers from "../../services/similarUsers"
import customBenchmark from "../../services/customBenchmark"
import { computeRankOfUser, rankFromBalancePool, rankFromTransactionPool } from "../../services/ranking"
import type { RankingsCachedData } from "../../cache/items/rankings"

/* === /rank/* === */

const rankRouter = express.Router()

/**
 * Now a cache read instead of a live computation: rankings are precomputed
 * once a month by the same cron that refreshes userAverages (see
 * server/src/cache/items/rankings.ts), since a per-session live computation
 * re-read the entire profiles table 3x per request - the single worst
 * per-request cost driver found while auditing for Vercel Hobby-plan limits.
 */
rankRouter.post("/get", async (req, res) => {
    const target_user = req.userId as string;
    const user_type = await db.users.getTypeOfUserId(target_user);
    if (user_type === null || user_type.type >= db.users.UserType.test.value)
    {
        res.status(200).json({
            balance: 50,
            incomes: 75,
            outflows: 25,
            balanceSimilar: 50,
            incomesSimilar: 75,
            outflowsSimilar: 25,
        });
        return;
    }

    const allRankings = await cache.get("userRankings") as RankingsCachedData | null
    const userRankings = allRankings ? allRankings[target_user] : null
    if (!userRankings) {
        res.status(503).json({ error: "Rankings cache not yet initialized. Try again in a moment." })
        return
    }

    res.status(200).json(userRankings)
})

/**
 * Recalculates a peer cohort after the user changes comparison factors. The
 * result is cached briefly in Redis; it must never be called during initial
 * dashboard loading.
 */
rankRouter.post("/custom", async (req, res) => {
    try {
        const benchmark = await customBenchmark.getCustomBenchmark(req.userId as string, req.body?.factors)
        res.status(200).json(benchmark)
    } catch (error) {
        console.error("rank.custom: failed to compute custom benchmark", error)
        res.status(503).json({ error: "Custom benchmark is temporarily unavailable." })
    }
})

/** Lightweight live cohort preview for the comparison-factor selector. */
rankRouter.post("/custom-preview", async (req, res) => {
    try {
        const preview = await customBenchmark.previewCustomBenchmark(req.userId as string, req.body?.factors)
        res.status(200).json(preview)
    } catch (error) {
        console.error("rank.custom-preview: failed to compute cohort preview", error)
        res.status(503).json({error: "Cohort preview is temporarily unavailable."})
    }
})

rankRouter.post("/balances", async (req, res) => {
    // If the user is of test/demo type, assign some random values
    const target_user = req.userId as string;
    const user_type = await db.users.getTypeOfUserId(target_user);
    if (user_type === null || user_type.type >= db.users.UserType.test.value)
    {
        const fake_balances = [
            {user: "0"}, {user: "1"}, {user: target_user}, {user: "2"}
        ];
        const fake_rank = computeRankOfUser(fake_balances, target_user);
        res.status(200);
        res.json(fake_rank);
        return;
    }
    // Check if the ranking is requested among all users or only similar users
    let user_ids = undefined;
    if (req.body && req.body.similar)
        user_ids = (await similarUsers.getSimilarUserIds(target_user, "balance")).userIds;
    if (user_ids) user_ids = [...user_ids, target_user]
    // Get the latest-balance pool in a single aggregate query (RPC) instead
    // of one query per user
    const pool = await db.balances.getRankingPool(user_ids, true);
    const rank = {position: rankFromBalancePool(pool, target_user)};
    // Send the data to the client with status code 200 (OK)
    res.status(200);
    res.json(rank);
});

const rankTransactions = (directionFromRoute?: "income" | "outflow") => async (req: express.Request, res: express.Response) => {
    // If the user is of test/demo type, assign some random values
    const target_user = req.userId as string;
    const user_type = await db.users.getTypeOfUserId(target_user);
    if (user_type === null || user_type.type >= db.users.UserType.test.value)
    {
        const fakeTransactions = [
            {user: "0"}, {user: target_user}, {user: "1"}, {user: "2"}
        ];
        const fake_rank = computeRankOfUser(fakeTransactions, target_user);
        res.status(200);
        res.json(fake_rank);
        return;
    }
    // Get the outflows/incomes-of-last-month pool in a single aggregate query
    // (RPC) instead of one query per user
    const reference_date = ExtDate.fromNow(); reference_date.moveByMonths(-1)
    // `expenses` is accepted only by the deprecated /expenses compatibility route.
    const direction = directionFromRoute ?? (req.body.expenses ? "outflow" : "income")
    const isOutflow = direction === "outflow"
    // Check if the ranking is requested among all users or only similar users
    let user_ids = undefined;
    if (req.body && req.body.similar)
        user_ids = (await similarUsers.getSimilarUserIds(target_user, isOutflow ? "outflows" : "incomes")).userIds;
    if (user_ids) user_ids = [...user_ids, target_user]
    const pool = await db.transactions.getTransactionRankingPool(user_ids, isOutflow, reference_date);
    const rank = {position: rankFromTransactionPool(pool, target_user, isOutflow)};
    // Send the data to the client with status code 200 (OK)
    res.status(200);
    res.json(rank);
}

rankRouter.post("/outflows", rankTransactions("outflow"));
rankRouter.post("/incomes", rankTransactions("income"));
rankRouter.post("/expenses", rankTransactions());

export default rankRouter
