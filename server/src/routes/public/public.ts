import express from "express"
import crypto from "crypto"

import db from "../../db/db"
import common from "../common"
import authCookies from "../authCookies"
import supabase from "../../db/supabase"
import redis from "../../cache/redisClient"
import cache from "../../cache/cache"
import { TimeoutError, getTimeoutMs, withTimeout } from "../../libs/timeout"
import { checkAndConsumeRateLimit } from "../../libs/rateLimiter"
import { generateRecoveryCode, hashRecoveryCode, parseRecoveryCodeInput } from "../../db/recoveryCode"
import { logger } from "../../libs/logger"

const publicRouter = express.Router()

type DependencyHealth = {
    redis: {
        configured: boolean
        ok: boolean
        error?: "timeout" | "unreachable"
    }
    supabase: {
        configured: boolean
        ok: boolean
        error?: "auth_error" | "timeout" | "unreachable"
    }
    coingecko: {
        configured: boolean
    }
}

function classifySupabaseHealthError(error: unknown): DependencyHealth["supabase"]["error"] {
    if (error instanceof TimeoutError)
        return "timeout"

    if (error && typeof error === "object") {
        const maybeStatus = "status" in error ? Number(error.status) : undefined
        if (maybeStatus === 401 || maybeStatus === 403)
            return "auth_error"

        const message = "message" in error ? String(error.message).toLowerCase() : ""
        if (message.includes("jwt") || message.includes("unauthorized") || message.includes("forbidden") || message.includes("api key"))
            return "auth_error"
    }

    return "unreachable"
}

/**
 * Checks if a Turnstile token is valid
 * @param token The token to check
 * @returns A tuple with a boolean verification result and the HTTP status code to use for the response
 */
async function verifyTurnstileToken(token: string): Promise<[boolean, number]> {
    const token_lifetime_sec = 3 * 60
    const expected_hostnames = process.env.NODE_ENV === "production"
        ? (process.env.TURNSTILE_ALLOWED_HOSTNAMES?.split(",").map(h => h.trim().toLowerCase()).filter(Boolean) ?? ["pacifinance.com", "www.pacifinance.com"])
        : ["localhost", "127.0.0.1"]

    // Check if the token has already been used. The key is created only if it doesn't
    // exist yet (NX) with the given TTL: a non-null result means this is the first use.
    const firstUse = await withTimeout(
        redis.set(`turnstile:${token}`, "1", {nx: true, ex: token_lifetime_sec}),
        getTimeoutMs("REGISTRATION_STEP_TIMEOUT_MS", 10000),
        "turnstile anti-replay check"
    )
    if (firstUse === null)
        return [false, 401]

    // Verify the token via the Cloudflare Turnstile API
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), getTimeoutMs("TURNSTILE_VERIFY_TIMEOUT_MS", 10000))
    let response: Response
    try {
        response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: 'POST',
            headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
            body: JSON.stringify({
                secret: process.env.TURNSTILE_SECRET_KEY,
                response: token
            }),
            signal: controller.signal
        })
    } finally {
        clearTimeout(timeout)
    }
    if (response.status !== 200) { // Bad request
        console.error(`verifyTurnstileToken: siteverify request failed with status ${response.status}`)
        return [false, 500]
    }

    const verification = await response.json()
    if (!verification.success) { // Cloudflare didn't authenticate the token
        console.error("verifyTurnstileToken: token rejected by Cloudflare", {
            errorCodes: verification["error-codes"],
            hostname: verification.hostname
        })
        return [false, 401]
    }
    const hostname = String(verification.hostname || "").toLowerCase()
    if (!expected_hostnames.includes(hostname)) {
        console.error(`verifyTurnstileToken: hostname mismatch, got "${hostname}", expected one of [${expected_hostnames.join(", ")}]`)
        return [false, 401]
    }

    return [true, 200]
}

async function getDependencyHealth(): Promise<DependencyHealth> {
    const dependencies: DependencyHealth = {
        redis: {
            configured: Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
            ok: false
        },
        supabase: {
            configured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
            ok: false
        },
        coingecko: {
            configured: Boolean(process.env.CG_KEY)
        }
    }

    if (dependencies.redis.configured) {
        try {
            dependencies.redis.ok = await withTimeout(
                redis.ping().then((result) => result === "PONG"),
                getTimeoutMs("DEPENDENCY_HEALTH_TIMEOUT_MS", 3000),
                "redis health check"
            )
        } catch (error) {
            dependencies.redis.error = error instanceof TimeoutError ? "timeout" : "unreachable"
        }
    }

    if (dependencies.supabase.configured) {
        try {
            const {error} = await withTimeout(
                supabase.auth.admin.listUsers({page: 1, perPage: 1}),
                getTimeoutMs("DEPENDENCY_HEALTH_TIMEOUT_MS", 3000),
                "supabase health check"
            )
            dependencies.supabase.ok = !error
            if (error)
                dependencies.supabase.error = classifySupabaseHealthError(error)
        } catch (error) {
            dependencies.supabase.error = classifySupabaseHealthError(error)
        }
    }

    return dependencies
}

async function dependencyHealthHandler(_: express.Request, res: express.Response) {
    const dependencies = await getDependencyHealth()
    const unhealthy = (dependencies.redis.configured && !dependencies.redis.ok)
        || (dependencies.supabase.configured && !dependencies.supabase.ok)
    res.status(unhealthy ? 503 : 200).json(dependencies)
}

publicRouter.get("/health", (_, res) => {
    res.status(200).send("OK")
})

publicRouter.get("/health/dependencies", dependencyHealthHandler)
publicRouter.get("/health-dependencies", dependencyHealthHandler)

// Public GitHub repo stats (stars/forks/contributors) for the landing page's
// open-source section - self-refreshes on read past its TTL, same pattern as
// the crypto price cache (see server/src/cache/items/githubStats.ts).
publicRouter.get("/github-stats", async (_, res) => {
    if (await cache.valueExpired("githubStats")) await cache.invalidate("githubStats")
    const value = await cache.get("githubStats")
    res.status(200).json(value)
})

// Aggregated roadmap vote counts { [itemId]: count }, public since the
// /roadmap page is visible logged out. Cached like the entries above; a
// successful vote toggle (routes/private/roadmapVotes.ts) invalidates it
// so the voter sees their own vote reflected without waiting for the TTL.
publicRouter.get("/roadmap-votes", async (_, res) => {
    if (await cache.valueExpired("roadmapVoteCounts")) await cache.invalidate("roadmapVoteCounts")
    const value = await cache.get("roadmapVoteCounts")
    res.status(200).json(value ?? {})
})

publicRouter.post("/registration", async (req, res) => {
    try {
        // Sanitize user input. Send status code 400 (Bad Request)
        // in case of invalid data (empty strings after sanitization)
        // or if the two passwords don't match
        let user_pwd = req.body?.user_pwd
        let repeated_pwd = req.body?.repeated_pwd
        const turnstile_token = req.body?.turnstile_token
        user_pwd = common.sanitizeInput(user_pwd)
        repeated_pwd = common.sanitizeInput(repeated_pwd)
        if (user_pwd === "" || repeated_pwd === "" || user_pwd !== repeated_pwd || turnstile_token == null)
        {
            res.status(400)
            res.send()
            return
        }
        // Verify Cloudflare Turnstile token. Send status code 401 (Unauthorized) if
        // the verification failed, or 500 (Internal Server Error) if Cloudflare
        // responded with an error status code
        logger.info("registration: verifying Turnstile token")
        const [verified, response_code] = await verifyTurnstileToken(turnstile_token)
        if (!verified) {
            res.status(response_code).send()
            return
        }
        // Generate a random public user ID
        logger.info("registration: generating user code")
        const user_id = await withTimeout(
            common.generateUserId(db.users.userIdLength),
            getTimeoutMs("REGISTRATION_STEP_TIMEOUT_MS", 10000),
            "registration user code generation"
        )
        // Register the account: creates the Supabase Auth user (password hashing is
        // handled internally by Supabase Auth) and the corresponding profile row.
        // Send status code 500 (Internal Server Error) in case of error
        logger.info(`registration: creating Supabase user for code ${user_id}`)
        const insertion = await withTimeout(
            db.users.insertNew(user_id, user_pwd),
            getTimeoutMs("REGISTRATION_STEP_TIMEOUT_MS", 10000),
            "registration Supabase user creation"
        )
        if (insertion === null)
        {
            logger.info("Error while trying to insert a new user in the database")
            res.status(500).send()
            return
        }
        // Generate an account-recovery code as part of registration (no
        // extra step/friction for the user) — shown once in the response,
        // only its hash is persisted. See db/recoveryCode.ts.
        const recoveryCode = generateRecoveryCode()
        const recoverySaved = await db.users.setRecoveryCodeHash(insertion.id, hashRecoveryCode(recoveryCode.bytes))
        if (recoverySaved === null)
            console.error(`registration: failed to store recovery code hash for user ${user_id} (account still usable, just without a recovery code yet)`)
        logger.info(`User ${user_id} registered`)
        // Send the user ID and recovery code to the client with status code 200 (OK)
        res.status(200)
        res.json({
            user_id: user_id,
            recovery_code_base32: recoverySaved ? recoveryCode.base32 : null,
            recovery_code_words: recoverySaved ? recoveryCode.words : null,
        })
    } catch (error) {
        if (error instanceof TimeoutError || (error instanceof Error && error.name === "AbortError")) {
            console.error("registration: external dependency timed out", error)
            res.status(504).send()
            return
        }

        console.error("registration: unexpected failure", error)
        res.status(500).send()
    }
})

publicRouter.post("/login", async (req, res) => {
    // Sanitize user input. Send status code 400 (Bad Request)
    // in case of invalid data (empty strings after sanitization)
    let user_id = req.body?.user_id
    let user_pwd = req.body?.password
    user_id = common.sanitizeInput(user_id)
    user_pwd = common.sanitizeInput(user_pwd)
    if (user_id === "" || user_pwd === "")
    {
        res.status(400)
        res.send()
        return
    }
    // Attempt sign-in via Supabase Auth using the internal synthetic email
    // derived from the public user ID. Send status code 401 (Unauthorized)
    // if the ID doesn't exist or the password is wrong
    const {data, error} = await supabase.auth.signInWithPassword({
        email: db.users.emailForUserCode(user_id),
        password: user_pwd
    })
    if (error || !data.session || !data.user)
    {
        res.status(401)
        res.send()
        return
    }
    // Set the session tokens as httpOnly cookies
    authCookies.setAuthCookies(res, data.session)
    // Remove the account from the deletion queue, if present
    await db.delqueue.removeFromQueueByUserId(data.user.id)
    // Send status code 200 (OK)
    res.status(200)
    res.send()
})

publicRouter.post("/recovery/reset-password", async (req, res) => {
    try {
        let user_id = req.body?.user_id
        let recovery_code = req.body?.recovery_code
        let new_pwd = req.body?.new_pwd
        let repeated_pwd = req.body?.repeated_pwd
        const turnstile_token = req.body?.turnstile_token
        user_id = common.sanitizeInput(user_id)
        recovery_code = common.sanitizeInput(recovery_code)
        new_pwd = common.sanitizeInput(new_pwd)
        repeated_pwd = common.sanitizeInput(repeated_pwd)
        if (user_id === "" || recovery_code === "" || new_pwd === "" || repeated_pwd === "" || new_pwd !== repeated_pwd || turnstile_token == null)
        {
            res.status(400)
            res.send()
            return
        }

        // Rate-limited both per-IP and per-account, before touching the hash:
        // this endpoint bypasses the password entirely, so it needs at least
        // as much protection as a login attempt, if not more.
        const ip = req.ip ?? "unknown"
        const [ipAllowed, accountAllowed] = await Promise.all([
            checkAndConsumeRateLimit(`recovery-reset:ip:${ip}`, 20),
            checkAndConsumeRateLimit(`recovery-reset:user:${user_id}`, 5),
        ])
        if (!ipAllowed || !accountAllowed) {
            res.status(429).send()
            return
        }

        const [verified, response_code] = await verifyTurnstileToken(turnstile_token)
        if (!verified) {
            res.status(response_code).send()
            return
        }

        // Generic 401 on any failure below (wrong id, wrong code, no code
        // configured) — never reveal which part failed.
        const record = await db.users.getRecoveryCodeHashByUserCode(user_id)
        if (!record || !record.recoveryCodeHash) {
            res.status(401).send()
            return
        }
        const suppliedBytes = parseRecoveryCodeInput(recovery_code)
        if (!suppliedBytes) {
            res.status(401).send()
            return
        }
        const suppliedHash = Buffer.from(hashRecoveryCode(suppliedBytes), "hex")
        const storedHash = Buffer.from(record.recoveryCodeHash, "hex")
        if (suppliedHash.length !== storedHash.length || !crypto.timingSafeEqual(suppliedHash, storedHash)) {
            res.status(401).send()
            return
        }

        const updated = await db.users.setPasswordOfUserId(record.id, new_pwd)
        if (updated === null) {
            res.status(500).send()
            return
        }
        // Single-use: invalidate immediately so a code exposed during
        // recovery (e.g. a shared/public computer) doesn't stay valid. A
        // fresh one is generated right away (same as at registration) so the
        // user isn't left without a recovery path after using this one.
        const nextRecoveryCode = generateRecoveryCode()
        const nextRecoverySaved = await db.users.setRecoveryCodeHash(record.id, hashRecoveryCode(nextRecoveryCode.bytes))
        if (nextRecoverySaved === null)
            console.error(`recovery/reset-password: failed to store the new recovery code hash for user ${user_id} (password reset still succeeded)`)

        res.status(200).json({
            recovery_code_base32: nextRecoverySaved ? nextRecoveryCode.base32 : null,
            recovery_code_words: nextRecoverySaved ? nextRecoveryCode.words : null,
        })
    } catch (error) {
        if (error instanceof TimeoutError || (error instanceof Error && error.name === "AbortError")) {
            console.error("recovery/reset-password: external dependency timed out", error)
            res.status(504).send()
            return
        }

        console.error("recovery/reset-password: unexpected failure", error)
        res.status(500).send()
    }
})

export default publicRouter
