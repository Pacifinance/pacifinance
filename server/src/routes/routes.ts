import express from "express"

import publicRouter from "./public/public"
import cronRouter from "./cron/cron"
import userRouter from "./private/user"
import balancesRouter from "./private/balances"
import expensesRouter from "./private/expenses"
import tagsRouter from "./private/tags"
import categoriesRouter from "./private/categories"
import rankRouter from "./private/rank"
import statsRouter from "./private/stats"
import pricesRouter from "./private/prices"
import investmentsRouter from "./private/investments"
import liquidityAccountsRouter from "./private/liquidityAccounts"
import recurringTransactionsRouter from "./private/recurringTransactions"
import goalsRouter from "./private/goals"
import benchmarksRouter from "./private/benchmarks"
import exchangeRatesRouter from "./private/exchangeRates"
import sharedExpensesRouter from "./private/sharedExpenses"
import notificationsRouter from "./private/notifications"

import supabase from "../db/supabase"
import authCookies from "./authCookies"

/**
 * Root-level express router
 */
const rootRouter = express.Router()

/* ========== Public routes ========== */

rootRouter.use("/", publicRouter)

/* ========== Cron routes (secret-header authenticated, not session-based) ========== */

rootRouter.use("/cron", cronRouter)

/* ========== Private routes ========== */

// Middleware to check the Supabase Auth session validity before accessing private routes.
// Reads the access token cookie and verifies it; if expired, tries to refresh it using the
// refresh token cookie. Sends status code 401 (Unauthorized) if neither is valid.
//
// Uses getClaims() rather than getUser(): on projects with asymmetric JWT signing keys it
// verifies the token locally (WebCrypto, cached JWKS) instead of a network round-trip to
// Supabase Auth on every private request. Projects still on a symmetric secret transparently
// fall back to the same getUser()-based network check as before.
rootRouter.use(async (req, res, next) => {
    const {accessToken, refreshToken} = authCookies.getAuthCookies(req)
    if (!accessToken) {
        res.status(401).send()
        return
    }

    const {data, error} = await supabase.auth.getClaims(accessToken)
    if (!error && data?.claims.sub) {
        req.userId = data.claims.sub
        next()
        return
    }

    if (!refreshToken) {
        res.status(401).send()
        return
    }
    const refreshed = await supabase.auth.refreshSession({refresh_token: refreshToken})
    if (refreshed.error || !refreshed.data.session || !refreshed.data.user) {
        authCookies.clearAuthCookies(res)
        res.status(401).send()
        return
    }
    authCookies.setAuthCookies(res, refreshed.data.session)
    req.userId = refreshed.data.user.id
    next()
})

rootRouter.use("/user", userRouter)
rootRouter.use("/balances", balancesRouter)
rootRouter.use("/expenses", expensesRouter)
rootRouter.use("/tags", tagsRouter)
rootRouter.use("/categories", categoriesRouter)
rootRouter.use("/rank", rankRouter)
rootRouter.use("/stats", statsRouter)
rootRouter.use("/prices", pricesRouter)
rootRouter.use("/investments", investmentsRouter)
rootRouter.use("/liquidity-accounts", liquidityAccountsRouter)
rootRouter.use("/recurring-transactions", recurringTransactionsRouter)
rootRouter.use("/goals", goalsRouter)
rootRouter.use("/benchmarks", benchmarksRouter)
rootRouter.use("/exchange-rates", exchangeRatesRouter)
rootRouter.use("/shared-expenses", sharedExpensesRouter)
rootRouter.use("/notifications", notificationsRouter)

export default rootRouter
