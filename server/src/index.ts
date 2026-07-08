import express from "express"
import cookieParser from "cookie-parser"

import rootRouter from "./routes/routes"

/* ==================== Express.js server initialization ==================== */

const app = express()
app.set("trust proxy", 1)
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
    const body = (req as any).body
    if (!Buffer.isBuffer(body)) {
        next()
        return
    }

    const rawBody = body.toString("utf8")
    if (rawBody === "") {
        (req as any).body = {}
        next()
        return
    }

    try {
        (req as any).body = JSON.parse(rawBody)
        next()
    } catch {
        res.status(400).send()
    }
})
app.use(express.json())

/* ============================ Express.js routes ============================ */

app.use("/api", rootRouter)

/* ========================= Local dev server start ========================= */

// On Vercel, this module is only imported by api/[...path].ts (wrapped with
// serverless-http) and never listens on a port itself. Locally (npm run dev
// / tsx), it runs as a normal standalone Express server.
if (!process.env.VERCEL) {
    app.listen(process.env.PORT || 3000, () => {
        console.log("Server is listening...")
    }).on('error', (err) => {
        console.error("Startup error:\n", err)
    })
}

export default app
