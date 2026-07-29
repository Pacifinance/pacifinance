import { getTimeoutMs, withTimeout } from "../timeout"
import { checkAndConsumeRateLimit } from "../rateLimiter"
import cache from "../../cache/cache"
import type { UpsertInstrumentInput } from "../../db/models/investments"

const CG_SEARCH_URL = "https://api.coingecko.com/api/v3/search"
const COINGECKO_SEARCH_LIMIT_PER_MIN = 25 // stays under the 30/min CoinGecko demo-plan limit
const MAX_RESULTS = 8 // bounds the upsertInstrument() fan-out — keep well under Vercel's function timeout

type CryptoCacheEntry = {
    name: string
}

type CryptoCache = {
    [coinId: string]: CryptoCacheEntry
}

type CoinGeckoSearchCoin = {
    id: string
    symbol: string
    name: string
    market_cap_rank?: number | null
}

type CoinGeckoSearchResponse = {
    coins?: CoinGeckoSearchCoin[]
}

function toUpsertInput(coinId: string, symbol: string, name: string, marketCapRank: number | null): UpsertInstrumentInput {
    return {
        kind: "crypto",
        symbol: symbol.toUpperCase(),
        exchange: null,
        name,
        currency: null,
        country: null,
        figi: null,
        isin: null,
        coingeckoId: coinId,
        provider: "coingecko",
        metadata: { marketCapRank },
    }
}

/**
 * Searches for crypto instruments matching a free-text query.
 *
 * Checks the already-cached CoinGecko price data (server/src/cache/items/prices.ts,
 * refreshed hourly for a fixed list of ~31 coins) first — a match there costs zero
 * extra API calls. Only falls back to CoinGecko's /search endpoint for coins outside
 * that fixed list, and only within the shared rate-limit budget.
 */
export async function searchCoingecko(query: string): Promise<UpsertInstrumentInput[]> {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []

    let cachedPrices: CryptoCache | null = null
    try {
        cachedPrices = await cache.get("crypto") as CryptoCache | null
    } catch (error) {
        console.error("coingeckoProvider.searchCoingecko: failed to read price cache, falling back to live search", error)
    }
    if (cachedPrices) {
        const cacheMatches = Object.entries(cachedPrices)
            .filter(([coinId, coin]) => coinId.includes(q) || coin.name.toLowerCase().includes(q))
            .slice(0, MAX_RESULTS)
            .map(([coinId, coin]) => toUpsertInput(coinId, coinId, coin.name, null))

        if (cacheMatches.length > 0) return cacheMatches
    }

    const allowed = await checkAndConsumeRateLimit("coingecko", COINGECKO_SEARCH_LIMIT_PER_MIN)
    if (!allowed) return []

    const controller = new AbortController()
    const timeoutMs = getTimeoutMs("CG_TIMEOUT_MS", 6000)
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
        const response = await withTimeout(
            fetch(`${CG_SEARCH_URL}?query=${encodeURIComponent(query)}`, {
                method: "GET",
                headers: { accept: "application/json", "x-cg-demo-api-key": process.env.CG_KEY ?? "" },
                signal: controller.signal,
            }),
            timeoutMs,
            "CoinGecko search request",
        )

        if (response.status !== 200) {
            console.error(`coingeckoProvider.searchCoingecko: request failed with status ${response.status}`)
            return []
        }

        const body = await response.json() as CoinGeckoSearchResponse
        if (!Array.isArray(body.coins)) return []

        return body.coins
            .slice(0, MAX_RESULTS)
            .map((coin) => toUpsertInput(coin.id, coin.symbol, coin.name, coin.market_cap_rank ?? null))
    } catch (error) {
        console.error("coingeckoProvider.searchCoingecko: request failed", error)
        return []
    } finally {
        clearTimeout(timeout)
    }
}

const CG_RANGE_URL = "https://api.coingecko.com/api/v3/coins"
// Separate bucket from search - a historical backfill runs once per coin (not
// per user click), but must still never compete with search for the shared
// demo-plan budget.
const COINGECKO_HISTORY_LIMIT_PER_MIN = 25

type CoinGeckoRangeResponse = {
    prices?: [number, number][] // [unix ms, price]
}

/**
 * Fetches one price point per calendar month between `fromUnix` and `toUnix`
 * (unix seconds), directly in EUR (no separate exchange-rate conversion
 * needed, unlike Finnhub's stock quotes). A single call covers the whole
 * range - CoinGecko returns daily granularity automatically for ranges over
 * ~90 days, and this keeps only the last data point of each month.
 *
 * NOTE: CoinGecko's free/demo tier has, at various points, limited how far
 * back a single range request can go - this isn't guaranteed to return the
 * instrument's full history. Returns null (never throws) when no key is
 * configured for demo auth, on rate limit, timeout, or a non-200/malformed
 * response - callers must treat a null result as "not available", not an error.
 */
export async function getHistoricalMonthlyPrices(coinId: string, fromUnix: number, toUnix: number): Promise<Map<string, number> | null> {
    if (fromUnix >= toUnix) return null

    const allowed = await checkAndConsumeRateLimit("coingecko-history", COINGECKO_HISTORY_LIMIT_PER_MIN)
    if (!allowed) return null

    const controller = new AbortController()
    const timeoutMs = getTimeoutMs("CG_TIMEOUT_MS", 6000)
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
        const url = `${CG_RANGE_URL}/${encodeURIComponent(coinId)}/market_chart/range?vs_currency=eur&from=${fromUnix}&to=${toUnix}`
        const response = await withTimeout(
            fetch(url, {
                method: "GET",
                headers: { accept: "application/json", "x-cg-demo-api-key": process.env.CG_KEY ?? "" },
                signal: controller.signal,
            }),
            timeoutMs,
            "CoinGecko historical range request",
        )

        if (response.status !== 200) {
            console.error(`coingeckoProvider.getHistoricalMonthlyPrices: request failed with status ${response.status} for ${coinId}`)
            return null
        }

        const body = await response.json() as CoinGeckoRangeResponse
        if (!Array.isArray(body.prices) || body.prices.length === 0) return null

        // Keep only the latest data point within each calendar month - an
        // approximate "monthly close" from CoinGecko's daily series.
        const byMonth = new Map<string, number>()
        for (const [timestampMs, price] of body.prices) {
            if (typeof price !== "number" || price <= 0) continue
            const pointDate = new Date(timestampMs)
            const monthKey = `${pointDate.getUTCFullYear()}-${String(pointDate.getUTCMonth() + 1).padStart(2, "0")}`
            byMonth.set(monthKey, price) // later (more recent) points overwrite earlier ones in the same month
        }
        return byMonth.size > 0 ? byMonth : null
    } catch (error) {
        console.error(`coingeckoProvider.getHistoricalMonthlyPrices: request failed for ${coinId}`, error)
        return null
    } finally {
        clearTimeout(timeout)
    }
}

export default { searchCoingecko, getHistoricalMonthlyPrices }
