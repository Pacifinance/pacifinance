import { getTimeoutMs, withTimeout } from "../timeout"
import { checkAndConsumeRateLimit } from "../rateLimiter"
import cache from "../../cache/cache"
import type { UpsertInstrumentInput } from "../../db/models/investments"

const CG_SEARCH_URL = "https://api.coingecko.com/api/v3/search"
const COINGECKO_SEARCH_LIMIT_PER_MIN = 25 // stays under the 30/min CoinGecko demo-plan limit
const MAX_RESULTS = 20

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

    const cachedPrices = await cache.get("crypto") as CryptoCache | null
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
    const timeoutMs = getTimeoutMs("CG_TIMEOUT_MS", 10000)
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

export default { searchCoingecko }
