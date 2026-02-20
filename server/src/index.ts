import express from "express"
import session from "express-session"
import cookieParser from "cookie-parser"
import path from "path"
import { createClient } from "redis"
import { RedisStore } from "connect-redis"

import rootRouter from "./routes/routes"
import db from "./db/mongo"
import cache from "./cache/cache"
import jobs from "./jobs/jobs"

const day_ms = 24 * 60 * 60 * 1000

/**
 * Redis client for user sessions
 */
const sessionsClient = createClient({url: process.env.REDIS_URI})
sessionsClient.on("connect", () => console.log("Redis sessions client connected"))
sessionsClient.on("error", (err: Error) => console.log("Redis sessions client error: ", err))
;(async () => { await sessionsClient.connect() })() // workaround to have top-level async without breaking vite build

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:\n', err)
    process.exit(1)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:\n', promise, '\nreason:\n', reason)
    process.exit(1)
})

/* ==================== Express.js server initialization ==================== */

const app = express()
app.set("trust proxy", 1)
app.use(cookieParser())
app.use(session({
    name: '__session',
    secret: process.env.SESSION_SECRET || "",
    store: new RedisStore({client: sessionsClient}),
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: day_ms,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }
}))
app.use((req, res, next) => {
    const supportedLocales = ["en", "it", "de", "es", "fr", "ja", "nl", "zh"]
    const segments = req.path.split("/").filter(Boolean)
    if (supportedLocales.includes(segments[0])) {
        req.url = req.url.replace(`/${segments[0]}`, "") || "/"
        res.locals.locale = segments[0] // change to req.locale
    }
    next()
})
app.use(express.static(path.join(__dirname, "../../build")))
app.use(express.json())

/* ============================ Express.js routes ============================ */

app.use("/api", rootRouter)

// Refresh handler
app.get("/*splat", (req, res) => {
    res.sendFile(path.join(__dirname, "../../build/index.html"))
})

/* ========================= Express.js server start ========================= */

db.connect(process.env.DB_URI || "")
    .then(async () => {
        console.log("Connected to DB")
        await cache.init()
        jobs.init()
    })
    .catch((err: any) => {
        console.error(err)
        process.exit(1)
    })

// Start the server
app.listen(process.env.PORT || 3000, () => {
    console.log("Server is listening...")
}).on('error', (err) => {
    console.error("Startup error:\n", err)
    process.exit(1)
})