import express from "express"

import db from "../../db/mongo"
import common from "../common"

const publicRouter = express.Router()
let registrationTokensCache = new Set<string>()

/**
 * Adds one day to a date
 * @param date Date to increment
 * @returns Incremented date
 */
function incrementDateByOneDay(date: Date) {
    let new_date = new Date(date)
    new_date.setUTCDate(new_date.getUTCDate() + 1)
    return new_date
}

/**
 * Checks if a Turnstile token is valid
 * @param token The token to check
 * @returns A tuple with a boolean verification result and the HTTP status code to use for the response
 */
async function verifyTurnstileToken(token: string): Promise<[boolean, number]> {
    const token_lifetime = 3 * 60 * 1000
    const expected_hostnames = process.env.NODE_ENV === "production"
        ? ["pacifinance.com", "www.pacifinance.com"]
        : ["localhost", "127.0.0.1"]

    // Check if the token has already been used
    if (registrationTokensCache.has(token))
        return [false, 401]

    // Add token to cache and schedule its deletion after few minutes
    registrationTokensCache.add(token)
    setTimeout(() => registrationTokensCache.delete(token), token_lifetime)

    // Verify the token via the Cloudflare Turnstile API
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: 'POST',
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
        body: JSON.stringify({
            secret: process.env.TURNSTILE_SECRET_KEY,
            response: token
        })
    })
    if (response.status != 200) // Bad request
        return [false, 500]

    const verification = await response.json()
    if (!verification.success) // Cloudflare didn't authenticate the token
        return [false, 401]
    if (!expected_hostnames.includes(verification.hostname))
        return [false, 401]

    return [true, 200]
}

publicRouter.get("/health", (req, res) => {
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
    // Generate a random user ID
    const user_id = await common.generateUserId()
    // Hash the password
    const hashed_password = common.hashPassword(user_pwd, Number.parseInt(process.env.SALT_ROUNDS || "0"))
    // Add the user to the DB
    await db.users.insertNew(user_id, hashed_password)
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
    // Check if the user exists in the db. Send status code 401
    // (Unauthorized) if the user does not exist
    const user = await db.users.getPasswordByUserId(user_id)
    if (user === null)
    {
        res.status(401)
        res.send()
        return
    }
    // Check if the password is correct. Send status code 401
    // (Unauthorized) if the password is wrong
    if (!common.checkPassword(user_pwd, user.password))
    {
        res.status(401)
        res.send()
        return
    }
    // The password is correct:
    // Generate a random session ID and set the session expiration date
    const session_id = common.generateRandomString(db.users.sessionIdLength, true)
    const now = new Date(Date.now())
    const expiration_date = incrementDateByOneDay(now)
    // Add the user ID and session information to the cookie
    req.session.userId = user_id
    req.session.sessionId = session_id
    req.session.expirationDate = expiration_date
    // Add the session information to the database
    await db.users.setSessionOfUserId(user_id, session_id, expiration_date)
    // Remove the account from the deletion queue
    await db.delqueue.removeFromQueueByUserRef(user._id)
    // Send status code 200 (OK)
    res.status(200)
    res.send()
})

export default publicRouter