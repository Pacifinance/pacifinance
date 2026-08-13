import express from "express"
import cookieParser from "cookie-parser"

import rootRouter from "./routes/routes"
import { logger } from "./libs/logger"

/* ==================== Express.js server initialization ==================== */

const app = express()
app.set("trust proxy", 1)
// API responses are JSON, never rendered as HTML/scripts, so they don't need
// a Content-Security-Policy (that's set on the SPA shell itself via
// vercel.json instead) - just the handful of headers that matter for a JSON
// endpoint: don't let a browser MIME-sniff a response into something
// executable, don't allow this origin's API to be framed, and don't leak the
// referrer to third parties.
app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff")
    res.setHeader("X-Frame-Options", "DENY")
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin")
    next()
})
app.use(cookieParser())
app.use((req, res, next) => {
    const supportedLocales = ["en", "it", "de", "es", "fr", "ja", "nl", "zh"]
    const segments = req.path.split("/").filter(Boolean)
    if (supportedLocales.includes(segments[0])) {
        req.url = req.url.replace(`/${segments[0]}`, "") || "/"
        res.locals.locale = segments[0] // change to req.locale
    }
    next()
})
app.use((req, res, next) => {
    const body = req.body
    if (!Buffer.isBuffer(body)) {
        next()
        return
    }

    const rawBody = body.toString("utf8")
    if (rawBody === "") {
        req.body = {}
        next()
        return
    }

    try {
        req.body = JSON.parse(rawBody)
        next()
    } catch {
        res.status(400).send()
    }
})
// Default (100kb) is too small for the investment CSV import wizard's batch
// save endpoints (holdings/history/save-batch, dividends/save-batch,
// transactions/save-batch) - a portfolio with hundreds of transactions spread
// over many years easily exceeds it in one request (see saveTransactionsBatch
// and friends in server/src/db/models/investments.ts, and the batch routes in
// server/src/routes/private/investments.ts). Kept under Vercel's own ~4.5MB
// serverless function body limit, so an oversized request still gets our own
// readable 413 instead of being rejected by the platform first.
app.use(express.json({limit: "4mb"}))

/* ============================ Express.js routes ============================ */

app.use("/api", rootRouter)

/* ========================= Local dev server start ========================= */

// On Vercel, this module is only imported by api/index.ts - the single
// serverless function every /api/* request is rewritten to (see vercel.json)
// - and never listens on a port itself. Locally (npm run dev / tsx), it runs
// as a normal standalone Express server.
if (!process.env.VERCEL) {
    app.listen(process.env.PORT || 3000, () => {
        logger.info("Server is listening...")
    }).on('error', (err) => {
        console.error("Startup error:\n", err)
    })
}

export default app
