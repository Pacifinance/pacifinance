import { getTimeoutMs, withTimeout } from "../timeout"
import { checkAndConsumeRateLimit } from "../rateLimiter"
import type { InvestmentKind } from "../../db/models/investments"
import type { UpsertInstrumentInput } from "../../db/models/investments"

const OPENFIGI_SEARCH_URL = "https://api.openfigi.com/v3/search"
const OPENFIGI_MAPPING_URL = "https://api.openfigi.com/v3/mapping"
const OPENFIGI_SEARCH_LIMIT_PER_MIN = 4 // stays under the public 5/min search limit
// Separate bucket from free-text search: a burst of manual searches (holdings
// panel) must never starve a CSV import's batch ISIN lookups, and vice versa —
// they used to share one "openfigi" bucket, so a handful of retries during
// debugging could keep BOTH permanently rate-limited within the same minute,
// making every ISIN lookup return "not found" even though OpenFIGI itself
// resolves them instantly. Raised when OPENFIGI_KEY is set (higher authenticated tier).
const OPENFIGI_MAPPING_LIMIT_PER_MIN = process.env.OPENFIGI_KEY ? 20 : 8
const MAX_RESULTS = 8 // bounds the upsertInstrument() fan-out — keep well under Vercel's function timeout
// /v3/mapping rejects the whole request with HTTP 413 once the job count exceeds
// this — confirmed against the live API: 10 jobs -> 200, 11 -> 413. Without a key
// the cap is 10; an authenticated key raises it to the documented 100. Getting this
// wrong doesn't degrade gracefully - a single oversized batch fails ALL of its ISINs
// at once (the whole request is rejected, not just the ones over the limit), which
// is exactly what silently broke CSV imports with more than 10 distinct ISINs.
const OPENFIGI_MAPPING_BATCH_SIZE = process.env.OPENFIGI_KEY ? 100 : 10

// 2-letter country code + 9 alphanumeric + 1 check digit. OpenFIGI's free-text
// /v3/search endpoint doesn't reliably match ISINs - exact identifier lookups
// need /v3/mapping instead (see searchOpenFigiByIsin).
const ISIN_PATTERN = /^[A-Z]{2}[A-Z0-9]{9}\d$/

type OpenFigiSearchResult = {
    figi: string
    name: string
    ticker: string
    exchCode?: string
    compositeFIGI?: string
    securityType?: string
    securityType2?: string
    marketSector?: string
}

type OpenFigiSearchResponse = {
    data?: OpenFigiSearchResult[]
    error?: string
}

/**
 * Maps OpenFIGI's marketSector/securityType taxonomy onto our internal InvestmentKind.
 * Commodities are intentionally never produced here: OpenFIGI doesn't cover them well
 * enough to verify, so the 'commodity' kind is only ever populated from the internal
 * curated catalog (see seed-commodity-instruments.sql), never from this provider.
 */
function mapToKind(marketSector: string | undefined, securityType: string | undefined, securityType2: string | undefined): InvestmentKind {
    const combinedType = `${securityType ?? ""} ${securityType2 ?? ""}`.toLowerCase()

    if (marketSector === "Equity") {
        if (combinedType.includes("etf") || combinedType.includes("etp") || combinedType.includes("fund")) return "etf"
        return "stock"
    }
    if (marketSector === "Corp" || marketSector === "Govt" || marketSector === "Muni") return "bond"
    if (combinedType.includes("fund")) return "fund"
    return "other"
}

function toUpsertInput(result: OpenFigiSearchResult, isin: string | null = null): UpsertInstrumentInput | null {
    const figi = result.compositeFIGI || result.figi
    if (!figi || !result.ticker || !result.name) return null

    return {
        kind: mapToKind(result.marketSector, result.securityType, result.securityType2),
        symbol: result.ticker,
        exchange: result.exchCode ?? null,
        name: result.name,
        currency: null,
        country: null,
        figi,
        isin,
        coingeckoId: null,
        provider: "openfigi",
        metadata: {
            securityType: result.securityType ?? null,
            securityType2: result.securityType2 ?? null,
            marketSector: result.marketSector ?? null,
        },
    }
}

/**
 * True if `query` is shaped like an ISIN (not a guarantee it exists) - used to
 * route the search to the exact-match /v3/mapping endpoint instead of the
 * free-text /v3/search one.
 */
export function isIsin(query: string): boolean {
    return ISIN_PATTERN.test(query.toUpperCase())
}

/**
 * Searches OpenFIGI for stocks/ETFs/bonds/funds matching a free-text query.
 * Returns an empty array (never throws) on rate limit, timeout, or upstream error —
 * callers fall back to whatever is already in the local catalog.
 */
export async function searchOpenFigi(query: string): Promise<UpsertInstrumentInput[]> {
    const allowed = await checkAndConsumeRateLimit("openfigi-search", OPENFIGI_SEARCH_LIMIT_PER_MIN)
    if (!allowed) return []

    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (process.env.OPENFIGI_KEY) headers["X-OPENFIGI-APIKEY"] = process.env.OPENFIGI_KEY

    const controller = new AbortController()
    const timeoutMs = getTimeoutMs("OPENFIGI_TIMEOUT_MS", 6000)
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
        const response = await withTimeout(
            fetch(OPENFIGI_SEARCH_URL, {
                method: "POST",
                headers,
                body: JSON.stringify({ query }),
                signal: controller.signal,
            }),
            timeoutMs,
            "OpenFIGI search request",
        )

        if (response.status !== 200) {
            const bodyText = await response.text().catch(() => "")
            console.error(`openfigiProvider.searchOpenFigi: request failed with status ${response.status}: ${bodyText}`)
            return []
        }

        const body = await response.json() as OpenFigiSearchResponse
        if (body.error || !Array.isArray(body.data)) return []

        return body.data
            .slice(0, MAX_RESULTS)
            .map((result) => toUpsertInput(result))
            .filter((candidate): candidate is UpsertInstrumentInput => candidate !== null)
    } catch (error) {
        console.error("openfigiProvider.searchOpenFigi: request failed", error)
        return []
    } finally {
        clearTimeout(timeout)
    }
}

type OpenFigiMappingJobResult = {
    data?: OpenFigiSearchResult[]
    error?: string
}

/**
 * Exact-match lookup by ISIN via OpenFIGI's /v3/mapping endpoint - unlike
 * /v3/search (free-text), this reliably resolves a specific identifier.
 * Same rate-limit/timeout/error-swallowing behavior as searchOpenFigi.
 */
export async function searchOpenFigiByIsin(isin: string): Promise<UpsertInstrumentInput[]> {
    const allowed = await checkAndConsumeRateLimit("openfigi-mapping", OPENFIGI_MAPPING_LIMIT_PER_MIN)
    if (!allowed) return []

    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (process.env.OPENFIGI_KEY) headers["X-OPENFIGI-APIKEY"] = process.env.OPENFIGI_KEY

    const controller = new AbortController()
    const timeoutMs = getTimeoutMs("OPENFIGI_TIMEOUT_MS", 6000)
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    const normalizedIsin = isin.toUpperCase()

    try {
        const response = await withTimeout(
            fetch(OPENFIGI_MAPPING_URL, {
                method: "POST",
                headers,
                body: JSON.stringify([{ idType: "ID_ISIN", idValue: normalizedIsin }]),
                signal: controller.signal,
            }),
            timeoutMs,
            "OpenFIGI mapping request",
        )

        if (response.status !== 200) {
            const bodyText = await response.text().catch(() => "")
            console.error(`openfigiProvider.searchOpenFigiByIsin: request failed with status ${response.status}: ${bodyText}`)
            return []
        }

        const body = await response.json() as OpenFigiMappingJobResult[]
        const job = body[0]
        if (!job || job.error || !Array.isArray(job.data)) return []

        return job.data
            .slice(0, MAX_RESULTS)
            .map((result) => toUpsertInput(result, normalizedIsin))
            .filter((candidate): candidate is UpsertInstrumentInput => candidate !== null)
    } catch (error) {
        console.error("openfigiProvider.searchOpenFigiByIsin: request failed", error)
        return []
    } finally {
        clearTimeout(timeout)
    }
}

/**
 * Batch exact-match lookup for multiple ISINs via one-or-more /v3/mapping
 * requests, chunked to OPENFIGI_MAPPING_BATCH_SIZE jobs each (10 without a
 * key, 100 with one — see that constant) — consumes one rate-limit slot per
 * chunk instead of one per ISIN. Resolving a CSV import's positions one ISIN
 * at a time exhausts the shared per-minute budget well before a real
 * portfolio (10+ holdings) finishes, silently marking well-known,
 * easily-resolvable stocks as "not found".
 */
export async function searchOpenFigiByIsins(isins: string[]): Promise<Record<string, UpsertInstrumentInput[]>> {
    const cleanIsins = Array.from(new Set(isins.map((v) => v.toUpperCase())))
    const result: Record<string, UpsertInstrumentInput[]> = {}
    for (const isin of cleanIsins) result[isin] = []
    if (cleanIsins.length === 0) return result

    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (process.env.OPENFIGI_KEY) headers["X-OPENFIGI-APIKEY"] = process.env.OPENFIGI_KEY

    const timeoutMs = getTimeoutMs("OPENFIGI_TIMEOUT_MS", 6000)

    for (let i = 0; i < cleanIsins.length; i += OPENFIGI_MAPPING_BATCH_SIZE) {
        const allowed = await checkAndConsumeRateLimit("openfigi-mapping", OPENFIGI_MAPPING_LIMIT_PER_MIN)
        if (!allowed) break

        const batch = cleanIsins.slice(i, i + OPENFIGI_MAPPING_BATCH_SIZE)
        // A fresh controller/timeout per chunk - reusing one across multiple
        // chunks meant the first chunk's timer kept counting down against
        // later chunks too, so a slow-but-healthy 2nd/3rd request could be
        // aborted purely because an earlier one had already used up the budget.
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), timeoutMs)
        try {
            const response = await withTimeout(
                fetch(OPENFIGI_MAPPING_URL, {
                    method: "POST",
                    headers,
                    body: JSON.stringify(batch.map((isin) => ({ idType: "ID_ISIN", idValue: isin }))),
                    signal: controller.signal,
                }),
                timeoutMs,
                "OpenFIGI batch mapping request",
            )

            if (response.status !== 200) {
                const bodyText = await response.text().catch(() => "")
                console.error(`openfigiProvider.searchOpenFigiByIsins: request failed with status ${response.status}: ${bodyText}`)
                continue
            }

            const body = await response.json() as OpenFigiMappingJobResult[]
            batch.forEach((isin, idx) => {
                const job = body[idx]
                if (!job || job.error || !Array.isArray(job.data)) return
                result[isin] = job.data
                    .slice(0, MAX_RESULTS)
                    .map((r) => toUpsertInput(r, isin))
                    .filter((candidate): candidate is UpsertInstrumentInput => candidate !== null)
            })
        } catch (error) {
            console.error("openfigiProvider.searchOpenFigiByIsins: request failed", error)
        } finally {
            clearTimeout(timeout)
        }
    }
    return result
}

export default { searchOpenFigi, searchOpenFigiByIsin, searchOpenFigiByIsins, isIsin }
