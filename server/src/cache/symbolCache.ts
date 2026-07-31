/**
 * Shared, cross-user cache for ISIN -> Finnhub exchange-suffixed symbol
 * resolution (e.g. "IE00B4L5Y983" -> "IWDA.AS"), same "value + expiration"
 * pattern as quoteCache.ts. A listing's Finnhub symbol essentially never
 * changes, so the TTL is much longer than a quote's - the point is mainly to
 * avoid repeating the /search lookup (see finnhubProvider.resolveInternationalSymbol)
 * on every refresh/backfill click, for every user holding that instrument.
 *
 * A `null` value is cached too (an ISIN Finnhub genuinely has no dotted
 * listing for) - without that, an instrument Finnhub simply doesn't cover
 * would re-trigger the search on every single call instead of failing fast.
 */
import redis from "./redisClient"
import { ExtDate } from "../libs/datelib"

// 30 days: long enough that this basically never expires in practice, short
// enough to eventually recover if Finnhub's coverage for an instrument changes.
const SYMBOL_TTL_SEC = 60 * 60 * 24 * 30

type SymbolCacheEntry = { value: string | null; expiration: string }

function keyFor(isin: string): string {
    return `finnhub-symbol:${isin.toUpperCase()}`
}

/**
 * Reads the still-fresh cached resolution for `isin` - `undefined` if never
 * resolved (or expired), `null` if resolved to "no dotted listing found".
 */
export async function getCachedSymbol(isin: string): Promise<string | null | undefined> {
    const entry = await redis.get<SymbolCacheEntry>(keyFor(isin))
    if (!entry) return undefined
    if (ExtDate.fromNow() >= new ExtDate(entry.expiration)) return undefined
    return entry.value
}

/**
 * Stores the resolved Finnhub symbol for `isin` (or `null` for "none found"), valid for SYMBOL_TTL_SEC.
 */
export async function setCachedSymbol(isin: string, symbol: string | null): Promise<void> {
    const expiration = ExtDate.fromNow()
    expiration.moveBySeconds(SYMBOL_TTL_SEC)
    await redis.set(keyFor(isin), { value: symbol, expiration: expiration.toISOString() })
}

export default { getCachedSymbol, setCachedSymbol }
