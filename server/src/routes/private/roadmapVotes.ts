import express from "express"

import db from "../../db/db"
import cache from "../../cache/cache"
import common from "../common"

/* === /roadmap-votes/* ===
 * Public vote counts live at GET /api/roadmap-votes (routes/public/public.ts).
 * These routes need the caller's identity, so they're private. */

const roadmapVotesRouter = express.Router()

// item_id is the stable id from scripts/roadmap-items.json (e.g. "roadmap-voting").
// Not cross-validated against that file (the server doesn't import frontend
// build assets) - just shape-checked to keep out junk/abuse.
const ITEM_ID_PATTERN = /^[a-z0-9-]{1,64}$/

roadmapVotesRouter.get("/mine", async (req, res) => {
    const itemIds = await db.roadmapVotes.getVotesByUserId(req.userId as string)
    res.status(200).json(itemIds)
})

roadmapVotesRouter.post("/toggle", async (req, res) => {
    const itemId = common.sanitizeInput(String(req.body.itemId ?? ""))
    if (!ITEM_ID_PATTERN.test(itemId)) {
        res.status(400).send()
        return
    }

    const voted = await db.roadmapVotes.toggleVote(req.userId as string, itemId)
    if (voted === null) {
        res.status(500).send()
        return
    }

    // Invalidate the public count cache so the voter sees their own vote
    // reflected immediately instead of waiting for the 5-minute TTL.
    await cache.invalidate("roadmapVoteCounts")

    res.status(200).json({ itemId, voted })
})

export default roadmapVotesRouter
