import express from "express"

import db from "../../db/db"
import common from "../common"
import authCookies from "../authCookies"
import supabase from "../../db/supabase"
import redis from "../../cache/redisClient"

const publicRouter = express.Router()

/**
 * Checks if a Turnstile token is valid
 * @param token The token to check
 * @returns A tuple with a boolean verification result and the HTTP status code to use for the response
 */
async function verifyTurnstileToken(token: string): Promise<[boolean, number]> {
    const token_lifetime_sec = 3 * 60
    const expected_hostnames = process.env.NODE_ENV === "production"
        ? (process.env.TURNSTILE_ALLOWED_HOSTNAMES?.split(",").map(h => h.trim()) ?? ["pacifinance.com", "www.pacifinance.com"])
        : ["localhost", "127.0.0.1"]

    // Check if the token has already been used. The key is created only if it doesn't
    // exist yet (NX) with the given TTL: a non-null result means this is the first use.
    const firstUse = await redis.set(`turnstile:${token}`, "1", {nx: true, ex: token_lifetime_sec})
    if (firstUse === null)
        return [false, 401]

    // Verify the token via the Cloudflare Turnstile API
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: 'POST',
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
        body: JSON.stringify({
            secret: process.env.TURNSTILE_SECRET_KEY,
            response: token
        })
    })
    if (response.status != 200) { // Bad request
        console.error(`verifyTurnstileToken: siteverify request failed with status ${response.status}`)
        return [false, 500]
    }

    const verification = await response.json()
    if (!verification.success) { // Cloudflare didn't authenticate the token
        console.error("verifyTurnstileToken: token rejected by Cloudflare", verification["error-codes"])
        return [false, 401]
    }
    if (!expected_hostnames.includes(verification.hostname)) {
        console.error(`verifyTurnstileToken: hostname mismatch, got "${verification.hostname}", expected one of [${expected_hostnames.join(", ")}]`)
        return [false, 401]
    }

    return [true, 200]
}

publicRouter.get("/health", (_, res) => {
    res.status(200).send("OK")
})

publicRouter.post("/registration", async (req, res) => {
    // Sanitize user input. Send status code 400 (Bad Request)
    // in case of invalid data (empty strings after sanitization)
    // or if the two passwords don't match
    let user_pwd = req.body.user_pwd
    let repeated_pwd = req.body.repeated_pwd
    let turnstile_token = req.body.turnstile_token
    user_pwd = common.sanitizeInput(user_pwd)
    repeated_pwd = common.sanitizeInput(repeated_pwd)
    if (user_pwd === "" || repeated_pwd === "" || user_pwd !== repeated_pwd || turnstile_token == undefined)
    {
        res.status(400)
        res.send()
        return
    }
    // Verify Cloudflare Turnstile token. Send status code 401 (Unauthorized) if
    // the verification failed, or 500 (Internal Server Error) if Cloudflare
    // responded with an error status code
    const [verified, response_code] = await verifyTurnstileToken(turnstile_token)
    if (!verified) {
        res.status(response_code).send()
        return
    }
    // Generate a random public user ID
    const user_id = await common.generateUserId(db.users.userIdLength)
    // Register the account: creates the Supabase Auth user (password hashing is
    // handled internally by Supabase Auth) and the corresponding profile row.
    // Send status code 500 (Internal Server Error) in case of error
    const insertion = await db.users.insertNew(user_id, user_pwd)
    if (insertion === null)
    {
        console.log("Error while trying to insert a new user in the database")
        res.status(500).send()
        return
    }
    console.log(`User ${user_id} registered`)
    // Send the user ID to the client with status code 200 (OK)
    res.status(200)
    res.json({user_id: user_id})
})

publicRouter.post("/login", async (req, res) => {
    // Sanitize user input. Send status code 400 (Bad Request)
    // in case of invalid data (empty strings after sanitization)
    let user_id = req.body.user_id
    let user_pwd = req.body.password
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

export default publicRouter
