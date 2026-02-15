import express from "express"
import session from "express-session"
import cookieParser from "cookie-parser"
import path from "path"

import routes from "./routes/routes"
import db from "./db/mongo"
import cache from "./cache/cache"
import jobs from "./jobs/jobs"

const day_ms = 24 * 60 * 60 * 1000;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:\n', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:\n', promise, '\nreason:\n', reason);
    process.exit(1);
});

/* ==================== Express.js server initialization ==================== */

const app = express();
app.use(cookieParser());
app.use(session({
    name: '__session',
    secret: process.env.SESSION_SECRET || "",
    saveUninitialized: false,
    resave: false,
    cookie: {maxAge: day_ms}
}));
app.use((req, res, next) => {
    const supportedLocales = ["en", "it", "de", "es", "fr", "ja", "nl", "zh"]
    const segments = req.path.split("/").filter(Boolean)
    if (supportedLocales.includes(segments[0])) {
        req.url = req.url.replace(`/${segments[0]}`, "") || "/"
        res.locals.locale = segments[0] // change to req.locale
    }
    next()
})
app.use(express.static(path.join(__dirname, "../../build")));
app.use(express.json());

/* ============================ Express.js routes ============================ */

app.use("/", routes.publicRouter)
app.use("/user", routes.userRouter)
app.use("/balances", routes.balancesRouter)
app.use("/expenses", routes.expensesRouter)
app.use("/tags", routes.tagsRouter)
app.use("/rank", routes.rankRouter)
app.use("/stats", routes.statsRouter)
app.use("/prices", routes.pricesRouter)

// Refresh handler
app.get("/*splat", (req, res) => {
    res.sendFile(path.join(__dirname, "../../build/index.html"));
});

/* ========================= Express.js server start ========================= */

db.connect(process.env.DB_URI || "")
    .then(async () => {
        console.log("Connected to DB");
        await cache.init();
        jobs.init();
    })
    .catch((err: any) => {
        console.error(err);
        process.exit(1);
    });

// Start the server
app.listen(process.env.PORT || 3000, () => {
    console.log("Server is listening...");
}).on('error', (err) => {
    console.error("Startup error:\n", err);
    process.exit(1);
})