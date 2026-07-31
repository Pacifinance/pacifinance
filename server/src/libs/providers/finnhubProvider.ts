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

/**
 * Resolves the exchange-suffixed Finnhub symbol for an instrument that
 * doesn't trade on a plain US listing (e.g. "IWDA.AS" for Euronext
 * Amsterdam) - getQuote/getHistoricalMonthlyPrices need this exact form,
 * not the bare ticker OpenFIGI returns (searchInstruments only ever stores
 * `result.ticker`, with no exchange suffix - see openfigiProvider.toUpsertInput).
 * Reuses /search with the ISIN as query (same trick searchFinnhub's own
 * docstring notes), but instead of filtering out dotted/cross-listing
 * symbols as noise, picks exactly one of them - the ISIN already narrows the
 * match to one instrument, so any suffixed result is a real, specific
 * listing. Only called as a fallback when the bare symbol's own quote call
 * has already come back empty - callers are expected to cache the result
 * (a listing's Finnhub symbol essentially never changes) so this search
 * doesn't repeat on every refresh/backfill for instruments Finnhub simply
 * doesn't cover under any symbol.
 */
export async function resolveInternationalSymbol(isin: string): Promise<string | null> {
    const apiKey = process.env.FINNHUB_KEY
    if (!apiKey) return null

    const allowed = await checkAndConsumeRateLimit("finnhub-search", FINNHUB_SEARCH_LIMIT_PER_MIN)
    if (!allowed) return null

    const controller = new AbortController()
    const timeoutMs = getTimeoutMs("FINNHUB_TIMEOUT_MS", 6000)
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
        const url = `${FINNHUB_SEARCH_URL}?q=${encodeURIComponent(isin)}&token=${apiKey}`
        const response = await withTimeout(
            fetch(url, { signal: controller.signal }),
            timeoutMs,
            "Finnhub ISIN search request",
        )
        if (response.status !== 200) {
            console.error(`finnhubProvider.resolveInternationalSymbol: request failed with status ${response.status} for ${isin}`)
            return null
        }

        const body = await response.json() as FinnhubSearchResponse
        if (!Array.isArray(body.result)) return null

        const match = body.result.find((r): r is Required<Pick<FinnhubSearchResult, "symbol">> & FinnhubSearchResult =>
            Boolean(r.symbol) && r.symbol!.includes("."))
        return match?.symbol ?? null
    } catch (error) {
        console.error(`finnhubProvider.resolveInternationalSymbol: request failed for ${isin}`, error)
        return null
    } finally {
        clearTimeout(timeout)
    }
}

const FINNHUB_QUOTE_URL = "https://finnhub.io/api/v1/quote"
// Separate bucket from search: refreshing a whole portfolio's prices (one
// quote call per holding) must never compete with, or be starved by, ordinary
// symbol search - they're both well under Finnhub's 60/min free-tier budget
// individually, but sharing one bucket would let either one exhaust it for
// the other during a refresh.
const FINNHUB_QUOTE_LIMIT_PER_MIN = 55

type FinnhubQuoteResponse = {
    c?: number // current price
    pc?: number // previous close
    t?: number // quote timestamp (0 if the symbol is unknown to Finnhub)
}

export interface Quote {
    /** Current price, in the instrument's own trading currency (see the caller for the EUR conversion). */
    price: number
}

/**
 * Fetches a single real-time (free-tier: ~15-20min delayed) quote from
 * Finnhub. Only ever called for stocks/ETFs - Finnhub has no crypto/commodity
 * coverage in our usage. Returns null (never throws) when no key is
 * configured, on rate limit, timeout, upstream error, or when Finnhub simply
 * doesn't recognize the symbol (t: 0 with no other fields - happens for
 * manually-entered/unverified symbols it has never heard of).
 */
export async function getQuote(symbol: string): Promise<Quote | null> {
    const apiKey = process.env.FINNHUB_KEY
    if (!apiKey) return null

    const allowed = await checkAndConsumeRateLimit("finnhub-quote", FINNHUB_QUOTE_LIMIT_PER_MIN)
    if (!allowed) return null

    const controller = new AbortController()
    const timeoutMs = getTimeoutMs("FINNHUB_TIMEOUT_MS", 6000)
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
        const url = `${FINNHUB_QUOTE_URL}?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`
        const response = await withTimeout(
            fetch(url, { signal: controller.signal }),
            timeoutMs,
            "Finnhub quote request",
        )

        if (response.status !== 200) {
            console.error(`finnhubProvider.getQuote: request failed with status ${response.status}`)
            return null
        }

        const body = await response.json() as FinnhubQuoteResponse
        if (!body.t || typeof body.c !== "number" || body.c <= 0) return null

        return { price: body.c }
    } catch (error) {
        console.error("finnhubProvider.getQuote: request failed", error)
        return null
    } finally {
        clearTimeout(timeout)
    }
}

const FINNHUB_CANDLE_URL = "https://finnhub.io/api/v1/stock/candle"
// Separate bucket again - a historical backfill runs once per instrument (not
// per user click, unlike quote/search), but must still never compete with
// them for the shared 60/min free-tier budget.
const FINNHUB_CANDLE_LIMIT_PER_MIN = 55

type FinnhubCandleResponse = {
    c?: number[] // close prices
    t?: number[] // candle open times, unix seconds
    s?: string // "ok" | "no_data"
}

/**
 * Fetches one monthly closing price per calendar month Finnhub has data for,
 * between `fromUnix` and `toUnix` (unix seconds) - a single call covers the
 * whole range (resolution=M), not one call per month, so backfilling years of
 * history costs one request per instrument, not one per instrument-month.
 *
 * NOTE: Finnhub's free tier has historically restricted /stock/candle to paid
 * plans for at least some exchanges/symbols - this isn't guaranteed to work
 * on every account. Returns null (never throws) when no key is configured, on
 * rate limit, timeout, a non-200 response (including a plan/permission
 * rejection), or when Finnhub reports "no_data" for the symbol/range -
 * callers must treat a null result as "this instrument's historical prices
 * aren't available", not as an error to alarm the user with.
 */
export async function getHistoricalMonthlyPrices(symbol: string, fromUnix: number, toUnix: number): Promise<Map<string, number> | null> {
    const apiKey = process.env.FINNHUB_KEY
    if (!apiKey) return null
    if (fromUnix >= toUnix) return null

    const allowed = await checkAndConsumeRateLimit("finnhub-candle", FINNHUB_CANDLE_LIMIT_PER_MIN)
    if (!allowed) return null

    const controller = new AbortController()
    const timeoutMs = getTimeoutMs("FINNHUB_TIMEOUT_MS", 6000)
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
        const url = `${FINNHUB_CANDLE_URL}?symbol=${encodeURIComponent(symbol)}&resolution=M&from=${fromUnix}&to=${toUnix}&token=${apiKey}`
        const response = await withTimeout(
            fetch(url, { signal: controller.signal }),
            timeoutMs,
            "Finnhub candle request",
        )

        if (response.status !== 200) {
            console.error(`finnhubProvider.getHistoricalMonthlyPrices: request failed with status ${response.status} for ${symbol} (may require a paid Finnhub plan)`)
            return null
        }

        const body = await response.json() as FinnhubCandleResponse
        if (body.s !== "ok" || !Array.isArray(body.c) || !Array.isArray(body.t) || body.c.length === 0) return null

        const byMonth = new Map<string, number>()
        for (let i = 0; i < body.c.length; i++) {
            const price = body.c[i]
            const timestamp = body.t[i]
            if (typeof price !== "number" || price <= 0 || typeof timestamp !== "number") continue
            const candleDate = new Date(timestamp * 1000)
            const monthKey = `${candleDate.getUTCFullYear()}-${String(candleDate.getUTCMonth() + 1).padStart(2, "0")}`
            byMonth.set(monthKey, price)
        }
        return byMonth.size > 0 ? byMonth : null
    } catch (error) {
        console.error(`finnhubProvider.getHistoricalMonthlyPrices: request failed for ${symbol}`, error)
        return null
    } finally {
        clearTimeout(timeout)
    }
}

export default { searchFinnhub, getQuote, getHistoricalMonthlyPrices, resolveInternationalSymbol }
