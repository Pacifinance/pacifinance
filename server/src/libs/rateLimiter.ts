import redis from "../cache/redisClient"

const WINDOW_SEC = 60

/**
 * Fixed-window rate limiter shared across serverless invocations via Redis.
 * Used to keep outbound calls to free-tier third-party APIs (OpenFIGI, CoinGecko)
 * under their published per-minute limits regardless of how many concurrent
 * Vercel function instances are running.
 *
 * Fails open (allows the call) if Redis is unreachable, so a cache outage
 * degrades to "no rate limiting" rather than breaking the search feature.
 *
 * @param bucketKey Identifies the limited resource, e.g. "openfigi" or "coingecko"
 * @param maxCalls  Maximum calls allowed within the current 60s window
 * @returns true if the call is allowed, false if the window's quota is exhausted
 */
export async function checkAndConsumeRateLimit(bucketKey: string, maxCalls: number): Promise<boolean> {
    const windowId = Math.floor(Date.now() / (WINDOW_SEC * 1000))
    const key = `ratelimit:${bucketKey}:${windowId}`

    try {
        const count = await redis.incr(key)
        if (count === 1) await redis.expire(key, WINDOW_SEC)
        return count <= maxCalls
    } catch (error) {
        console.error(`rateLimiter.checkAndConsumeRateLimit: Redis error for bucket "${bucketKey}", failing open`, error)
        return true
    }
}

export default { checkAndConsumeRateLimit }
