import crypto from "crypto"

import { logger } from "./logger"
import redis from "../cache/redisClient"

const GITHUB_API_BASE = "https://api.github.com"
// GitHub allows up to 10 minutes; stay comfortably under it and start the
// clock slightly in the past to tolerate clock drift between us and GitHub.
const JWT_LIFETIME_SEC = 9 * 60
const JWT_CLOCK_DRIFT_SEC = 60
// Installation tokens are valid 1h; cache for less than that so we always
// refresh before GitHub would reject it.
const INSTALLATION_TOKEN_CACHE_SEC = 50 * 60
const INSTALLATION_TOKEN_CACHE_KEY = "githubAppInstallationToken"

function base64url(input: Buffer | string): string {
    return (Buffer.isBuffer(input) ? input : Buffer.from(input))
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "")
}

/**
 * Signs a GitHub App JWT (RS256) by hand with Node's built-in crypto module -
 * no jsonwebtoken/jose dependency needed for this one fixed-shape token.
 * Returns null if the app isn't configured or signing fails (malformed key).
 */
function signAppJwt(): string | null {
    const appId = process.env.GITHUB_APP_ID
    const rawPrivateKey = process.env.GITHUB_APP_PRIVATE_KEY
    if (!appId || !rawPrivateKey) return null

    const now = Math.floor(Date.now() / 1000)
    const header = { alg: "RS256", typ: "JWT" }
    const payload = { iat: now - JWT_CLOCK_DRIFT_SEC, exp: now + JWT_LIFETIME_SEC, iss: appId }
    const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`

    try {
        // The private key downloaded from GitHub is a PEM file; env vars often
        // need literal "\n" escaped, so normalize them back to real newlines.
        const privateKey = rawPrivateKey.replace(/\\n/g, "\n")
        const signature = crypto.sign("RSA-SHA256", Buffer.from(signingInput), privateKey)
        return `${signingInput}.${base64url(signature)}`
    } catch (error) {
        logger.info(`githubApp.signAppJwt: failed to sign JWT: ${String(error)}`)
        return null
    }
}

/**
 * Short-lived installation access token, used to call the GitHub API as the
 * app's installation on our repo (issues created with it are authored by
 * "<app-name>[bot]", never by whichever human owns the signing key). Cached
 * in Redis (shared across serverless invocations) since GitHub only allows
 * requesting a fresh one so often and it's valid for an hour anyway.
 */
async function getInstallationToken(): Promise<string | null> {
    const cached = await redis.get<string>(INSTALLATION_TOKEN_CACHE_KEY).catch(() => null)
    if (cached) return cached

    const jwt = signAppJwt()
    const installationId = process.env.GITHUB_APP_INSTALLATION_ID
    if (!jwt || !installationId) {
        logger.info("githubApp.getInstallationToken: GITHUB_APP_ID/GITHUB_APP_PRIVATE_KEY/GITHUB_APP_INSTALLATION_ID not fully configured")
        return null
    }

    try {
        const response = await fetch(`${GITHUB_API_BASE}/app/installations/${installationId}/access_tokens`, {
            method: "POST",
            headers: {
                accept: "application/vnd.github+json",
                authorization: `Bearer ${jwt}`,
            },
        })
        if (response.status !== 201) {
            logger.info(`githubApp.getInstallationToken: GitHub API returned status ${response.status}`)
            return null
        }

        const data = await response.json() as { token: string }
        await redis.set(INSTALLATION_TOKEN_CACHE_KEY, data.token, { ex: INSTALLATION_TOKEN_CACHE_SEC }).catch(() => {})
        return data.token
    } catch (error) {
        logger.info(`githubApp.getInstallationToken: request failed: ${String(error)}`)
        return null
    }
}

export default { getInstallationToken }
