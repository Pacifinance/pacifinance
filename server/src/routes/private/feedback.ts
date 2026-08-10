import express from "express"

import common, { isOneOf } from "../common"
import { checkAndConsumeRateLimit } from "../../libs/rateLimiter"
import githubIssues, { type FeedbackType } from "../../libs/githubIssues"

/* === /feedback === */

const feedbackRouter = express.Router()

const FEEDBACK_TYPES = ["bug", "idea", "other"] as const
const TITLE_MAX = 100
const DESCRIPTION_MAX = 1000
const PAGE_MAX = 200
// checkAndConsumeRateLimit's window is a fixed 60s (see rateLimiter.ts) - this
// caps rapid-fire/accidental double submissions, not a true hourly quota.
const MAX_SUBMISSIONS_PER_MINUTE = 2

feedbackRouter.post("/", async (req, res) => {
    const allowed = await checkAndConsumeRateLimit(`feedback:${req.userId}`, MAX_SUBMISSIONS_PER_MINUTE)
    if (!allowed) {
        res.status(429).send()
        return
    }

    const type = common.sanitizeInput(String(req.body.type ?? ""))
    const title = common.sanitizeInput(String(req.body.title ?? "")).slice(0, TITLE_MAX)
    const description = common.sanitizeInput(String(req.body.description ?? "")).slice(0, DESCRIPTION_MAX)
    const page = req.body.page ? common.sanitizeInput(String(req.body.page)).slice(0, PAGE_MAX) : undefined

    if (!isOneOf(type, FEEDBACK_TYPES) || title.length === 0 || description.length === 0) {
        res.status(400).send()
        return
    }

    const result = await githubIssues.createIssue({ type: type as FeedbackType, title, description, page })
    if (result === null) {
        res.status(502).send()
        return
    }

    res.status(200).json(result)
})

export default feedbackRouter
