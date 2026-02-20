import express from "express"
import { SessionData } from "express-session"

import publicRouter from "./public/public"
import userRouter from "./private/user"
import balancesRouter from "./private/balances"
import expensesRouter from "./private/expenses"
import tagsRouter from "./private/tags"
import rankRouter from "./private/rank"
import statsRouter from "./private/stats"
import pricesRouter from "./private/prices"

/**
 * Root-level express router
 */
const rootRouter = express.Router()

/* ========== Public routes ========== */

rootRouter.use("/", publicRouter)

/* ========== Private routes ========== */

// Middleware to check session validity before accessing private routes
rootRouter.use((req, res, next) => {
    // Check if the session is valid. Send status code 401
    // (Unauthorized) if it's not valid
    const session = req.session as SessionData
    if (!session || !session.userId) {
        res.status(401).send()
        return
    }

    next()
})

rootRouter.use("/user", userRouter)
rootRouter.use("/balances", balancesRouter)
rootRouter.use("/expenses", expensesRouter)
rootRouter.use("/tags", tagsRouter)
rootRouter.use("/rank", rankRouter)
rootRouter.use("/stats", statsRouter)
rootRouter.use("/prices", pricesRouter)

export default rootRouter
