/**
 * Shared, cross-user cache for live stock/ETF quotes (Finnhub), keyed per
 * symbol — same fixed-window-free "value + expiration" pattern as cache.ts,
 * but with a dynamic keyspace (one entry per symbol) instead of a small fixed
 * dictionary, since the set of symbols isn't known ahead of time.
 *
 * A quote is the same for every user holding that instrument, so caching it
 * here (not per-user) means N users refreshing the same symbol only ever
 * costs ONE real Finnhub call per TTL window, no matter how many times any of
 * them click "refresh" - the whole point: without this, a user repeatedly
 * refreshing (or several users doing so around the same time) burns through
 * Finnhub's shared per-minute rate limit for everyone.
 */
import redis from "./redisClient"
import { ExtDate } from "../libs/datelib"

// Once a day: a portfolio tracker doesn't need intraday prices, and it keeps
// external calls to an absolute minimum regardless of refresh frequency.
const QUOTE_TTL_SEC = 86400

export type CachedQuote = { price: number }

type QuoteCacheEntry = { value: CachedQuote; expiration: string }

function keyFor(symbol: string): string {
    return `quote:${symbol.toUpperCase()}`
}

/**
 * Reads a still-fresh cached quote for `symbol`, or null if missing/expired.
 */
export async function getCachedQuote(symbol: string): Promise<CachedQuote | null> {
    const entry = await redis.get<QuoteCacheEntry>(keyFor(symbol))
    if (!entry) return null
    if (ExtDate.fromNow() >= new ExtDate(entry.expiration)) return null
    return entry.value
}

/**
 * Stores a freshly-fetched quote for `symbol`, valid for QUOTE_TTL_SEC.
 */
export async function setCachedQuote(symbol: string, quote: CachedQuote): Promise<void> {
    const expiration = ExtDate.fromNow()
    expiration.moveBySeconds(QUOTE_TTL_SEC)
    await redis.set(keyFor(symbol), { value: quote, expiration: expiration.toISOString() })
}

export default { getCachedQuote, setCachedQuote }
