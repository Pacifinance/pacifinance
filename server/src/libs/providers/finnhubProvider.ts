import { getTimeoutMs, withTimeout } from "../timeout"
import { checkAndConsumeRateLimit } from "../rateLimiter"
import type { InvestmentKind, UpsertInstrumentInput } from "../../db/models/investments"

const FINNHUB_SEARCH_URL = "https://finnhub.io/api/v1/search"
// Finnhub's free tier allows 60 requests/minute - stay a few under that
// shared budget so clock-skew between our fixed window and theirs never
// tips a legitimate request into a 429.
const FINNHUB_SEARCH_LIMIT_PER_MIN = 55
const MAX_RESULTS = 8

type FinnhubSearchResult = {
    description?: string
    displaySymbol?: string
    symbol?: string
    type?: string
}

type FinnhubSearchResponse = {
    count?: number
    result?: FinnhubSearchResult[]
}

/**
 * Searches Finnhub for stocks/ETFs/bonds/funds matching a free-text query
 * (ticker or company name) - and, since Finnhub's /search also accepts an
 * ISIN as query text, doubles as a secondary ISIN lookup when OpenFIGI's
 * /v3/mapping doesn't have it either.
 *
 * Deliberately the FIRST stop for free-text symbol/name search (see
 * searchInstruments in db/models/investments.ts): Finnhub's free-tier quota
 * (60/min) is ~12x OpenFIGI's unauthenticated one (~5/min), so routing
 * everyday "type a ticker" searches here first means OpenFIGI's tight budget
 * stays available for what it's actually good at (exact ISIN mapping),
 * instead of getting exhausted by ordinary symbol typing.
 *
 * Instruments found here never carry a FIGI (Finnhub doesn't expose one) -
 * only OpenFIGI-sourced rows do. `kind` is taken from the caller (the asset
 * panel the user searched from - stock/etf/bond/fund all share this same
 * provider) rather than inferred from Finnhub's own `type` field, which
 * isn't granular enough to reliably tell those apart.
 *
 * Returns an empty array (never throws) when no key is configured, on rate
 * limit, timeout, or upstream error - callers fall back to OpenFIGI or
 * whatever's already in the local catalog.
 */
export async function searchFinnhub(query: string, kind: InvestmentKind = "stock"): Promise<UpsertInstrumentInput[]> {
    const apiKey = process.env.FINNHUB_KEY
    if (!apiKey) return []

    const allowed = await checkAndConsumeRateLimit("finnhub-search", FINNHUB_SEARCH_LIMIT_PER_MIN)
    if (!allowed) return []

    const controller = new AbortController()
    const timeoutMs = getTimeoutMs("FINNHUB_TIMEOUT_MS", 6000)
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
        const url = `${FINNHUB_SEARCH_URL}?q=${encodeURIComponent(query)}&token=${apiKey}`
        const response = await withTimeout(
            fetch(url, { signal: controller.signal }),
            timeoutMs,
            "Finnhub search request",
        )

        if (response.status !== 200) {
            console.error(`finnhubProvider.searchFinnhub: request failed with status ${response.status}`)
            return []
        }

        const body = await response.json() as FinnhubSearchResponse
        if (!Array.isArray(body.result)) return []

        return body.result
            // Finnhub's free-text search returns a lot of noise (options
            // contracts, foreign-suffixed cross-listings) mixed in with the
            // primary listing - keep only plain, unsuffixed ticker symbols.
            .filter((r): r is Required<Pick<FinnhubSearchResult, "symbol" | "description">> & FinnhubSearchResult =>
                Boolean(r.symbol) && Boolean(r.description) && !r.symbol!.includes("."))
            .slice(0, MAX_RESULTS)
            .map((r) => ({
                kind,
                symbol: r.symbol!.toUpperCase(),
                exchange: null,
                name: r.description!,
                currency: null,
                country: null,
                figi: null,
                isin: null,
                coingeckoId: null,
                provider: "finnhub",
                metadata: { finnhubType: r.type ?? null },
            }))
    } catch (error) {
        console.error("finnhubProvider.searchFinnhub: request failed", error)
        return []
    } finally {
        clearTimeout(timeout)
    }
}

export default { searchFinnhub }
