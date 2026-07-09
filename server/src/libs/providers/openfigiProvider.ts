import { getTimeoutMs, withTimeout } from "../timeout"
import { checkAndConsumeRateLimit } from "../rateLimiter"
import type { InvestmentKind } from "../../db/models/investments"
import type { UpsertInstrumentInput } from "../../db/models/investments"

const OPENFIGI_SEARCH_URL = "https://api.openfigi.com/v3/search"
const OPENFIGI_SEARCH_LIMIT_PER_MIN = 4 // stays under the public 5/min search limit; higher once OPENFIGI_KEY is set
const MAX_RESULTS = 20

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
 * Commodities are intentionally never produced here: gold/commodity stays manual-only.
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

function toUpsertInput(result: OpenFigiSearchResult): UpsertInstrumentInput | null {
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
        isin: null,
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
 * Searches OpenFIGI for stocks/ETFs/bonds/funds matching a free-text query.
 * Returns an empty array (never throws) on rate limit, timeout, or upstream error —
 * callers fall back to whatever is already in the local catalog.
 */
export async function searchOpenFigi(query: string): Promise<UpsertInstrumentInput[]> {
    const allowed = await checkAndConsumeRateLimit("openfigi", OPENFIGI_SEARCH_LIMIT_PER_MIN)
    if (!allowed) return []

    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (process.env.OPENFIGI_KEY) headers["X-OPENFIGI-APIKEY"] = process.env.OPENFIGI_KEY

    const controller = new AbortController()
    const timeoutMs = getTimeoutMs("OPENFIGI_TIMEOUT_MS", 10000)
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
            console.error(`openfigiProvider.searchOpenFigi: request failed with status ${response.status}`)
            return []
        }

        const body = await response.json() as OpenFigiSearchResponse
        if (body.error || !Array.isArray(body.data)) return []

        return body.data
            .slice(0, MAX_RESULTS)
            .map(toUpsertInput)
            .filter((candidate): candidate is UpsertInstrumentInput => candidate !== null)
    } catch (error) {
        console.error("openfigiProvider.searchOpenFigi: request failed", error)
        return []
    } finally {
        clearTimeout(timeout)
    }
}

export default { searchOpenFigi }
