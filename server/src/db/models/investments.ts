import supabase from "../supabase"
import openfigiProvider from "../../libs/providers/openfigiProvider"
import coingeckoProvider from "../../libs/providers/coingeckoProvider"
import finnhubProvider from "../../libs/providers/finnhubProvider"
import { ExtDate, toDateOnly } from "../../libs/datelib"
import { roundCurrency } from "../../libs/money"
import quoteCache from "../../cache/quoteCache"
import symbolCache from "../../cache/symbolCache"

export const INVESTMENT_KINDS = ["stock", "etf", "crypto", "bond", "fund", "commodity", "other"] as const
export const INVESTMENT_ASSET_KEYS = ["stocks", "etf", "bitcoin", "crypto", "bonds", "funds", "commodities"] as const
export const INVESTMENT_POSITION_TYPES = ["single", "pac", "other"] as const

export type InvestmentKind = typeof INVESTMENT_KINDS[number]
export type InvestmentAssetKey = typeof INVESTMENT_ASSET_KEYS[number]
export type InvestmentPositionType = typeof INVESTMENT_POSITION_TYPES[number]

type InstrumentRow = {
    id: number
    kind: InvestmentKind
    symbol: string
    exchange: string | null
    name: string
    currency: string | null
    country: string | null
    sector: string | null
    industry: string | null
    figi: string | null
    isin: string | null
    coingecko_id: string | null
    provider: string
    verified: boolean
    active: boolean
    metadata: Record<string, unknown> | null
    owner_user_id: string | null
}

export type ManualInstrumentInput = {
    kind: InvestmentKind
    symbol: string
    name: string
    currency: string | null
}

type HoldingRow = {
    id: number
    asset_key: InvestmentAssetKey
    position_type: InvestmentPositionType
    quantity: number | null
    average_price: number | null
    current_value: number | null
    invested_amount: number | null
    currency: string
    notes: string
    updated_at: string
    import_source: string | null
    instrument: InstrumentRow | InstrumentRow[] | null
}

export type HoldingInput = {
    instrumentId: number
    assetKey: InvestmentAssetKey
    positionType: InvestmentPositionType
    quantity: number | null
    averagePrice: number | null
    currentValue: number | null
    investedAmount: number | null
    currency: string
    notes: string
    /** Which platform/broker export (e.g. "trading212") last produced this holding's
     * totals - null for manually-added holdings. See insertHolding for how this
     * decides whether a conflicting re-import is a safe overwrite or must be merged. */
    importSource: string | null
}

// 'internal' means "search the local curated catalog only, never call an external
// provider" - used for commodities (see searchInstruments below), which are seeded
// once via seed-commodity-instruments.sql rather than verified live against an API.
export const INVESTMENT_SEARCH_SOURCES = ["figi", "coingecko", "internal"] as const
export type InvestmentSearchSource = typeof INVESTMENT_SEARCH_SOURCES[number]

/** Candidate produced by a provider (OpenFIGI/CoinGecko), ready to be persisted into the shared catalog. */
export type UpsertInstrumentInput = {
    kind: InvestmentKind
    symbol: string
    exchange: string | null
    name: string
    currency: string | null
    country: string | null
    figi?: string | null
    isin?: string | null
    coingeckoId?: string | null
    provider: string
    metadata: Record<string, unknown>
}

/** Below this many local matches, a provider is consulted to enrich the catalog. */
const MIN_LOCAL_RESULTS_BEFORE_PROVIDER = 5

const INSTRUMENT_SELECT = [
    "id",
    "kind",
    "symbol",
    "exchange",
    "name",
    "currency",
    "country",
    "sector",
    "industry",
    "figi",
    "isin",
    "coingecko_id",
    "provider",
    "verified",
    "active",
    "metadata",
    "owner_user_id",
].join(", ")

const HOLDING_SELECT = [
    "id",
    "asset_key",
    "position_type",
    "quantity",
    "average_price",
    "current_value",
    "invested_amount",
    "currency",
    "notes",
    "updated_at",
    "import_source",
    `instrument:investment_instruments(${INSTRUMENT_SELECT})`,
].join(", ")

function toInstrument(row: InstrumentRow) {
    return {
        id: row.id,
        kind: row.kind,
        symbol: row.symbol,
        exchange: row.exchange,
        name: row.name,
        currency: row.currency,
        country: row.country,
        sector: row.sector,
        industry: row.industry,
        figi: row.figi,
        isin: row.isin,
        coingeckoId: row.coingecko_id,
        provider: row.provider,
        verified: row.verified,
        active: row.active,
        metadata: row.metadata ?? {},
    }
}

function toHolding(row: HoldingRow) {
    const instrument = Array.isArray(row.instrument) ? row.instrument[0] : row.instrument
    return {
        id: row.id,
        assetKey: row.asset_key,
        positionType: row.position_type,
        quantity: row.quantity,
        averagePrice: row.average_price,
        currentValue: row.current_value,
        investedAmount: row.invested_amount,
        currency: row.currency,
        notes: row.notes,
        updatedAt: row.updated_at,
        importSource: row.import_source,
        instrument: instrument ? toInstrument(instrument) : null,
    }
}

function toHoldingPayload(user_id: string, input: HoldingInput) {
    return {
        user_id,
        instrument_id: input.instrumentId,
        asset_key: input.assetKey,
        position_type: input.positionType,
        quantity: input.quantity,
        average_price: input.averagePrice,
        current_value: input.currentValue,
        invested_amount: input.investedAmount,
        currency: input.currency,
        notes: input.notes,
        import_source: input.importSource,
    }
}

/**
 * Searches canonical investment instruments already known by the platform (local catalog only).
 * Only ever returns the shared/verified catalog plus the requesting user's own
 * private "manual" instruments — never another user's private ones.
 */
async function searchLocalInstruments(cleanQuery: string, user_id: string, kind?: InvestmentKind, limit = 20) {
    let request = supabase.from("investment_instruments")
        .select(INSTRUMENT_SELECT)
        .eq("active", true)
        .or(`symbol.ilike.%${cleanQuery}%,name.ilike.%${cleanQuery}%,isin.ilike.%${cleanQuery}%,coingecko_id.ilike.%${cleanQuery}%`)
        .or(`owner_user_id.is.null,owner_user_id.eq.${user_id}`)
        .order("verified", {ascending: false})
        .order("symbol", {ascending: true})
        .limit(limit)

    if (kind) request = request.eq("kind", kind)

    const {data, error} = await request
    if (error) console.error("investments.searchLocalInstruments: failed to search instruments", error)
    if (error || !data) return []
    return (data as unknown as InstrumentRow[]).map(toInstrument)
}

/**
 * Finds an existing instrument matching a provider candidate, preferring the strongest
 * identifier available (FIGI, then CoinGecko id, then kind+symbol+exchange).
 */
async function findExistingInstrument(input: UpsertInstrumentInput) {
    if (input.figi) {
        const {data} = await supabase.from("investment_instruments")
            .select(INSTRUMENT_SELECT).eq("figi", input.figi).maybeSingle()
        if (data) return data as unknown as InstrumentRow
    }

    if (input.coingeckoId) {
        const {data} = await supabase.from("investment_instruments")
            .select(INSTRUMENT_SELECT).eq("coingecko_id", input.coingeckoId).maybeSingle()
        if (data) return data as unknown as InstrumentRow
    }

    let request = supabase.from("investment_instruments")
        .select(INSTRUMENT_SELECT).eq("kind", input.kind).eq("symbol", input.symbol)
    request = input.exchange ? request.eq("exchange", input.exchange) : request.is("exchange", null)
    const {data} = await request.maybeSingle()
    return data as unknown as InstrumentRow | null
}

/**
 * Persists a provider-verified candidate into the shared catalog, or returns the
 * already-existing canonical row if one matches (idempotent — safe to call repeatedly
 * as the community catalog grows from user searches).
 */
async function upsertInstrument(input: UpsertInstrumentInput) {
    const existing = await findExistingInstrument(input)
    if (existing) {
        // Backfill the ISIN on rows first discovered via free-text search (which
        // carries no ISIN): without this, an instrument already in the catalog
        // could never be found by ISIN locally, forcing a provider round-trip on
        // every ISIN search for it.
        if (input.isin && !existing.isin) {
            const {data} = await supabase.from("investment_instruments")
                .update({isin: input.isin})
                .eq("id", existing.id)
                .select(INSTRUMENT_SELECT)
                .maybeSingle()
            if (data) return toInstrument(data as unknown as InstrumentRow)
        }
        return toInstrument(existing)
    }

    const payload = {
        kind: input.kind,
        symbol: input.symbol,
        exchange: input.exchange,
        name: input.name,
        currency: input.currency,
        country: input.country,
        figi: input.figi ?? null,
        isin: input.isin ?? null,
        coingecko_id: input.coingeckoId ?? null,
        provider: input.provider,
        verified: true,
        active: true,
        metadata: input.metadata,
    }

    const {data, error} = await supabase.from("investment_instruments")
        .insert(payload).select(INSTRUMENT_SELECT).single()
    if (!error && data) return toInstrument(data as unknown as InstrumentRow)

    if (error?.code === "23505") { // unique violation: a concurrent request won the race
        const retried = await findExistingInstrument(input)
        if (retried) return toInstrument(retried)
    }

    console.error("investments.upsertInstrument: failed to insert instrument", error)
    return null
}

/**
 * Picks between OpenFIGI and Finnhub for stock/ETF/bond/fund lookups so neither provider's
 * per-minute budget gets exhausted by the other's use case. For ISIN queries, OpenFIGI's
 * /v3/mapping is authoritative and tried first, falling back to Finnhub (its /search also
 * accepts ISINs) only if OpenFIGI has nothing. For free-text ticker/name queries, Finnhub is
 * tried first since its free-tier quota (~60/min) is far more generous than OpenFIGI's
 * unauthenticated /v3/search (~4-5/min), falling back to OpenFIGI if Finnhub has nothing.
 */
async function searchFigiSources(query: string, kind: InvestmentKind | undefined, isinQuery: boolean): Promise<UpsertInstrumentInput[]> {
    if (isinQuery) {
        const openfigiResults = await openfigiProvider.searchOpenFigiByIsin(query)
        if (openfigiResults.length > 0) return openfigiResults
        return await finnhubProvider.searchFinnhub(query, kind)
    }
    const finnhubResults = await finnhubProvider.searchFinnhub(query, kind)
    if (finnhubResults.length > 0) return finnhubResults
    return await openfigiProvider.searchOpenFigi(query)
}

/**
 * Searches canonical investment instruments. When `sourceHint` is provided and the local
 * catalog has too few matches, consults the corresponding external provider (OpenFIGI/Finnhub for
 * stocks/ETFs/bonds/funds, CoinGecko for crypto), persists any new candidates via
 * `upsertInstrument`, and re-runs the local search so the growing catalog stays the single
 * source of truth for the response shape.
 */
async function searchInstruments(query: string, user_id: string, kind?: InvestmentKind, limit = 20, sourceHint?: InvestmentSearchSource) {
    const cleanQuery = query.replace(/[%*,]/g, "").trim()
    if (cleanQuery.length < 2) return []

    // An ISIN identifies one exact security the user already owns: ignore the
    // kind filter (an ETF's ISIN typed from the stocks panel must still be
    // found, not silently hidden) and don't let unrelated fuzzy local matches
    // (symbol/name ilike fragments) satisfy the "enough local results" early
    // return below — only a real local ISIN hit counts.
    const isinQuery = sourceHint === "figi" && openfigiProvider.isIsin(cleanQuery)
    const effectiveKind = isinQuery ? undefined : kind

    const localResults = await searchLocalInstruments(cleanQuery, user_id, effectiveKind, limit)
    const localHasIsinMatch = localResults.some((instrument) => instrument.isin?.toUpperCase() === cleanQuery.toUpperCase())
    // Same idea as the ISIN check above: a query that exactly matches a seeded/verified
    // symbol (e.g. typing "AAPL") is as good as it gets — don't let the (heavily
    // rate-limited, ~4-5 req/min without an API key) provider call happen just because
    // fewer than MIN_LOCAL_RESULTS_BEFORE_PROVIDER fuzzy matches exist locally. Without
    // this, a well-seeded catalog still couldn't prevent single-ticker searches from
    // hitting the provider, since one exact hit is normally far below that threshold.
    const localHasExactSymbolMatch = localResults.some((instrument) => instrument.symbol?.toUpperCase() === cleanQuery.toUpperCase())
    // 'internal' (commodities) never consults an external provider - the catalog is
    // fixed/curated (seed-commodity-instruments.sql), so local results are final.
    if (!sourceHint || sourceHint === "internal") return localResults
    if (isinQuery
        ? localHasIsinMatch
        : (localHasExactSymbolMatch || localResults.length >= MIN_LOCAL_RESULTS_BEFORE_PROVIDER)) return localResults

    const candidates = sourceHint === "figi"
        ? await searchFigiSources(cleanQuery, kind, isinQuery)
        : await coingeckoProvider.searchCoingecko(cleanQuery)

    if (candidates.length === 0) return localResults

    // Parallel, not sequential: with up to MAX_RESULTS candidates each costing 1-2
    // Supabase round-trips, a sequential loop could take several seconds and blow
    // through Vercel's serverless function timeout (10s on Hobby). upsertInstrument
    // already handles concurrent-insert races (23505 retry-read), so this is safe.
    await Promise.all(candidates.map((candidate) => upsertInstrument(candidate)))

    return await searchLocalInstruments(cleanQuery, user_id, effectiveKind, limit)
}

/**
 * Batch-resolves multiple ISINs in as few round-trips as possible: one local
 * lookup for all of them, then a single OpenFIGI /v3/mapping call for
 * whatever wasn't already in the catalog. Used by the CSV import wizard,
 * which otherwise has to resolve every position one ISIN at a time via
 * searchInstruments and quickly exhausts OpenFIGI's shared per-minute rate
 * limit on anything beyond a handful of holdings (see searchOpenFigiByIsins).
 * @returns Map of (uppercased) ISIN -> matching instrument, or null when unresolved
 */
async function searchInstrumentsByIsins(isins: string[], user_id: string) {
    const cleanIsins = Array.from(new Set(isins.map((v) => v.trim().toUpperCase()).filter(Boolean)))
    const result: Record<string, ReturnType<typeof toInstrument> | null> = {}
    for (const isin of cleanIsins) result[isin] = null
    if (cleanIsins.length === 0) return result

    const {data, error} = await supabase.from("investment_instruments")
        .select(INSTRUMENT_SELECT)
        .eq("active", true)
        .in("isin", cleanIsins)
        .or(`owner_user_id.is.null,owner_user_id.eq.${user_id}`)
    if (error) console.error("investments.searchInstrumentsByIsins: failed to read local instruments", error)

    for (const row of (!error && data ? (data as unknown as InstrumentRow[]) : [])) {
        if (row.isin) result[row.isin] = toInstrument(row)
    }

    const missing = cleanIsins.filter((isin) => result[isin] === null)
    if (missing.length === 0) return result

    const candidatesByIsin = await openfigiProvider.searchOpenFigiByIsins(missing)
    const toUpsert = missing
        .map((isin) => candidatesByIsin[isin]?.[0])
        .filter((candidate): candidate is UpsertInstrumentInput => Boolean(candidate))
    if (toUpsert.length === 0) return result

    // Parallel, same reasoning as searchInstruments above.
    const upserted = await Promise.all(toUpsert.map((candidate) => upsertInstrument(candidate)))
    for (const instrument of upserted) {
        if (instrument?.isin) result[instrument.isin] = instrument
    }
    return result
}

/**
 * Creates a private, unverified instrument for a user whose search found no
 * verified match — never joins the shared catalog (owner_user_id scopes it to
 * this user only, see searchLocalInstruments) and must never be treated as
 * eligible for cross-user comparisons (callers of anything comparison-related
 * must filter on verified = true).
 */
async function createManualInstrument(user_id: string, input: ManualInstrumentInput) {
    const payload = {
        kind: input.kind,
        symbol: input.symbol,
        exchange: null,
        name: input.name,
        currency: input.currency,
        country: null,
        figi: null,
        isin: null,
        coingecko_id: null,
        provider: "manual",
        verified: false,
        active: true,
        metadata: {},
        owner_user_id: user_id,
    }
    const {data, error} = await supabase.from("investment_instruments")
        .insert(payload).select(INSTRUMENT_SELECT).single()
    if (!error && data) return toInstrument(data as unknown as InstrumentRow)

    if (error?.code === "23505") {
        // Unique violation on (kind, symbol, coalesce(exchange, '')): a verified
        // catalog entry (or another private one) already occupies this exact
        // combination — most commonly because the DB is still enforcing the
        // OLD table-wide unique index instead of the scoped-to-owner_user_id
        // partial one (see supabase/migrations/add-manual-investment-instruments.sql).
        // Surfacing the existing row instead of a 500 is strictly better either
        // way: the user only reached "add as unverified" because search didn't
        // find a match, and one clearly already exists.
        let request = supabase.from("investment_instruments")
            .select(INSTRUMENT_SELECT).eq("kind", payload.kind).eq("symbol", payload.symbol)
        request = payload.exchange ? request.eq("exchange", payload.exchange) : request.is("exchange", null)
        const {data: conflicting} = await request.maybeSingle()
        if (conflicting) return toInstrument(conflicting as unknown as InstrumentRow)
    }

    console.error("investments.createManualInstrument: failed to insert instrument", error)
    return null
}

/**
 * Resolves a canonical instrument by id.
 */
/**
 * Resolves a canonical instrument by id, scoped so a holding can never be
 * linked to another user's private "manual" instrument: only the shared
 * catalog (owner_user_id null) or the requesting user's own private rows are
 * a valid match — anything else resolves to null, same as "not found".
 */
async function getInstrumentById(id: number, user_id: string) {
    const {data, error} = await supabase.from("investment_instruments")
        .select(INSTRUMENT_SELECT)
        .eq("id", id)
        .eq("active", true)
        .or(`owner_user_id.is.null,owner_user_id.eq.${user_id}`)
        .maybeSingle()
    if (error) console.error("investments.getInstrumentById: failed to read instrument", error)
    if (error || !data) return null
    return toInstrument(data as unknown as InstrumentRow)
}

/**
 * Lists the user's detailed investment holdings.
 */
async function getHoldingsByUserId(user_id: string, applyCurrentVerifiedPrice = true) {
    const {data, error} = await supabase.from("user_investment_holdings")
        .select(HOLDING_SELECT)
        .eq("user_id", user_id)
        .order("updated_at", {ascending: false})
    if (error) console.error("investments.getHoldingsByUserId: failed to read holdings", error)
    if (error || !data) return []

    const holdings = (data as unknown as HoldingRow[]).map(toHolding)
    if (!applyCurrentVerifiedPrice) return holdings
    const instrumentIds = Array.from(new Set(holdings
        .map((holding) => holding.instrument?.id)
        .filter((id): id is number => id !== undefined)))
    if (instrumentIds.length === 0) return holdings

    // A verified price for the current month is the best available live value.
    // History already used it, but the dashboard kept reading the stale manual
    // current_value from user_investment_holdings. Overlay it at read time so
    // every balance consumer agrees, without destroying the user's fallback.
    const now = new Date()
    const currentMonthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`
    const {data: verifiedRows, error: verifiedError} = await supabase.from("instrument_historical_prices")
        .select("instrument_id, price_eur")
        .eq("status", "verified")
        .eq("month_key", currentMonthKey)
        .in("instrument_id", instrumentIds)
    if (verifiedError) {
        console.error("investments.getHoldingsByUserId: failed to read current verified prices", verifiedError)
        return holdings
    }

    const verifiedPriceByInstrument = new Map(
        ((verifiedRows ?? []) as unknown as {instrument_id: number; price_eur: number}[])
            .map((row) => [row.instrument_id, row.price_eur] as const),
    )
    return holdings.map((holding) => {
        const instrumentId = holding.instrument?.id
        const verifiedPrice = instrumentId === undefined ? undefined : verifiedPriceByInstrument.get(instrumentId)
        if (verifiedPrice === undefined || holding.quantity === null || holding.quantity <= 0) return holding
        return {...holding, currentValue: roundCurrency(holding.quantity * verifiedPrice)}
    })
}

/**
 * Refreshes current_value for the user's stock/ETF holdings using a live
 * Finnhub quote (crypto/bonds/funds/commodities aren't attempted - Finnhub
 * has no reliable coverage for them here). Quotes come back in the
 * instrument's own trading currency (assumed USD when unknown - matches
 * every researched broker export in this app so far) and are converted to
 * EUR with `eurRates` before being stored, same as every other money value
 * on a holding (see toHoldingPayload) - the user's own display currency is
 * applied later, client-side, via the usual formatAmount()/fromEUR() path,
 * exactly like every other stored amount; nothing display-specific happens
 * here. Best-effort per holding: a missing quote or exchange rate skips just
 * that one holding, never the rest.
 *
 * A symbol's quote is shared across every user holding it (quoteCache.ts):
 * this is what makes it safe for a user to click "refresh" as often as they
 * like - at most one real Finnhub call per symbol per day happens across the
 * WHOLE app, not per click or per user.
 *
 * Also upserts a history entry for the CURRENT month with the fresh
 * current_value - without this, "refresh prices" only ever updated today's
 * live number and never accumulated into "value over time"/growth-rate
 * analysis (see src/utils/investmentAnalytics.ts), so refreshing regularly
 * never actually built up real history. Best-effort: a failed history
 * upsert doesn't undo the holding's own price update.
 */
/**
 * Finds the Finnhub-usable symbol for a stock/ETF instrument whose bare
 * (OpenFIGI) ticker didn't resolve - e.g. a European listing that needs an
 * exchange suffix Finnhub's own /search exposes but OpenFIGI never stores
 * (see finnhubProvider.resolveInternationalSymbol). Cached per ISIN, so this
 * fallback search only ever runs once per instrument across every user and
 * every future refresh/backfill - including the "no dotted listing found"
 * case, which then fails fast instead of re-searching every time.
 */
async function resolveFallbackFinnhubSymbol(isin: string | null): Promise<string | null> {
    if (!isin) return null
    const cached = await symbolCache.getCachedSymbol(isin)
    if (cached !== undefined) return cached
    const resolved = await finnhubProvider.resolveInternationalSymbol(isin)
    await symbolCache.setCachedSymbol(isin, resolved)
    return resolved
}

async function refreshHoldingPrices(user_id: string, eurRates: Record<string, number>) {
    const holdings = await getHoldingsByUserId(user_id, false)
    const refreshable = holdings.filter((h) =>
        h.instrument !== null && (h.instrument.kind === "stock" || h.instrument.kind === "etf") && h.quantity != null)

    const currentMonthStart = ExtDate.fromThisMonthStart()
    const updated: Holding[] = []
    for (const holding of refreshable) {
        const instrument = holding.instrument as NonNullable<typeof holding.instrument>

        let quote = await quoteCache.getCachedQuote(instrument.symbol)
        if (!quote) {
            quote = await finnhubProvider.getQuote(instrument.symbol)
            if (!quote) {
                const fallbackSymbol = await resolveFallbackFinnhubSymbol(instrument.isin)
                if (fallbackSymbol) quote = await finnhubProvider.getQuote(fallbackSymbol)
            }
            if (quote) await quoteCache.setCachedQuote(instrument.symbol, quote)
        }
        if (!quote) continue

        const quoteCurrency = instrument.currency ?? "USD"
        const rate = eurRates[quoteCurrency]
        if (!rate) continue

        const currentValue = roundCurrency((quote.price / rate) * (holding.quantity as number))
        const result = await updateHolding(user_id, holding.id, {
            instrumentId: instrument.id,
            assetKey: holding.assetKey,
            positionType: holding.positionType,
            quantity: holding.quantity,
            averagePrice: holding.averagePrice,
            currentValue,
            investedAmount: holding.investedAmount,
            currency: holding.currency,
            notes: holding.notes,
            importSource: holding.importSource,
        })
        if (!result) continue
        updated.push(result)

        const historyResult = await upsertHoldingHistoryEntry(user_id, holding.id, currentMonthStart, {
            currentValue, investedAmount: holding.investedAmount, priceSource: "provider",
        })
        if (historyResult.status !== "ok") {
            console.error(`investments.refreshHoldingPrices: failed to backfill history for holding ${holding.id}`, historyResult)
        }
    }
    return updated
}

type Holding = ReturnType<typeof toHolding>

export type HoldingSaveResult =
    | {status: "ok"; holding: Holding}
    // A holding for this instrument already exists, sourced from a different
    // (or unknown) import - see insertHolding. Neither overwriting nor merging
    // is safe to assume, so the caller must resolve it explicitly (mergeStrategy).
    | {status: "conflict"; existing: Holding}

/**
 * Combines an existing holding with a new import's totals for the same
 * instrument (mergeStrategy "add") — e.g. the same stock held on both
 * Trading 212 and Degiro: both positions are real and must be summed, never
 * have one silently replace the other. Average price is recomputed as a
 * cost-weighted average of both lots when both are known.
 */
function mergeHoldingInputs(existing: Holding, input: HoldingInput): HoldingInput {
    const quantity = (existing.quantity ?? 0) + (input.quantity ?? 0)
    const existingCost = existing.averagePrice != null && existing.quantity != null ? existing.averagePrice * existing.quantity : null
    const inputCost = input.averagePrice != null && input.quantity != null ? input.averagePrice * input.quantity : null
    const averagePrice = existingCost != null && inputCost != null && quantity > 0
        ? (existingCost + inputCost) / quantity
        : (input.averagePrice ?? existing.averagePrice)

    return {
        ...input,
        quantity,
        averagePrice,
        investedAmount: (existing.investedAmount ?? 0) + (input.investedAmount ?? 0),
        currentValue: input.currentValue ?? existing.currentValue,
        importSource: existing.importSource === input.importSource ? existing.importSource : "mixed",
    }
}

/**
 * Creates a detailed user holding linked to a verified platform instrument.
 * When one already exists for this instrument (unique(user_id, instrument_id) -
 * e.g. re-importing a CSV, or importing a second platform's export for a
 * stock already held elsewhere) the caller must say how to resolve it:
 *  - no mergeStrategy, same importSource as the existing holding: safe to
 *    assume it's the same source re-exported with more history - overwrite.
 *  - no mergeStrategy, different importSource: ambiguous (could be a second
 *    broker's real, separate position) - returns {status: "conflict"} instead
 *    of guessing, so the caller can ask the user.
 *  - mergeStrategy "replace"/"add": the user already resolved the conflict -
 *    overwrite or sum the two positions respectively.
 */
async function insertHolding(user_id: string, input: HoldingInput, mergeStrategy?: "add" | "replace"): Promise<HoldingSaveResult | null> {
    const {data, error} = await supabase.from("user_investment_holdings")
        .insert(toHoldingPayload(user_id, input))
        .select(HOLDING_SELECT)
        .single()
    if (!error && data) return {status: "ok", holding: toHolding(data as unknown as HoldingRow)}

    if (error?.code === "23505") { // unique violation: a holding for this instrument already exists
        const {data: existingRow, error: existingErr} = await supabase.from("user_investment_holdings")
            .select(HOLDING_SELECT).eq("user_id", user_id).eq("instrument_id", input.instrumentId).maybeSingle()
        if (existingErr) console.error("investments.insertHolding: failed to look up conflicting holding", existingErr)

        if (existingRow) {
            const existing = toHolding(existingRow as unknown as HoldingRow)

            if (mergeStrategy === "add") {
                const updated = await updateHolding(user_id, existing.id, mergeHoldingInputs(existing, input))
                return updated ? {status: "ok", holding: updated} : null
            }
            // A holding with no tracked source (manually added, or imported before
            // import_source existed) carries no information that contradicts the
            // new import - safe to treat like a same-source re-import instead of
            // asking, since there's nothing concrete to conflict with.
            const sameOrUnknownSource = existing.importSource === input.importSource || existing.importSource === null
            if (mergeStrategy === "replace" || (!mergeStrategy && sameOrUnknownSource)) {
                const updated = await updateHolding(user_id, existing.id, input)
                return updated ? {status: "ok", holding: updated} : null
            }
            return {status: "conflict", existing}
        }
    }

    console.error("investments.insertHolding: failed to insert holding", error)
    return null
}

/**
 * Updates a detailed user holding, scoped to the owner.
 */
async function updateHolding(user_id: string, holding_id: number, input: HoldingInput): Promise<Holding | null> {
    const {data, error} = await supabase.from("user_investment_holdings")
        .update({
            instrument_id: input.instrumentId,
            asset_key: input.assetKey,
            position_type: input.positionType,
            quantity: input.quantity,
            average_price: input.averagePrice,
            current_value: input.currentValue,
            invested_amount: input.investedAmount,
            currency: input.currency,
            notes: input.notes,
            import_source: input.importSource,
            updated_at: new Date().toISOString(),
        })
        .eq("user_id", user_id)
        .eq("id", holding_id)
        .select(HOLDING_SELECT)
        .single()
    if (error) console.error("investments.updateHolding: failed to update holding", error)
    if (error || !data) return null
    return toHolding(data as unknown as HoldingRow)
}

/**
 * Deletes a detailed holding owned by the user.
 */
async function deleteHolding(user_id: string, holding_id: number) {
    // A holding delete is an explicit reset of the detailed position. Remove
    // its monthly snapshots as well; otherwise the FK's SET NULL behavior
    // leaves orphan history that is picked up again when the same instrument
    // is imported later, doubling quantity/value while transactions remain
    // correct.
    const {data: holdingRow, error: lookupError} = await supabase.from("user_investment_holdings")
        .select("instrument_id").eq("user_id", user_id).eq("id", holding_id).maybeSingle()
    if (lookupError) console.error("investments.deleteHolding: failed to look up instrument", lookupError)
    if (holdingRow?.instrument_id) {
        const {error: historyError} = await supabase.from("user_investment_holding_history")
            .delete().eq("user_id", user_id).eq("instrument_id", holdingRow.instrument_id)
        if (historyError) {
            console.error("investments.deleteHolding: failed to delete holding history", historyError)
            return null
        }
    }
    const {error, count} = await supabase.from("user_investment_holdings")
        .delete({count: "exact"})
        .eq("user_id", user_id)
        .eq("id", holding_id)
    if (error) console.error("investments.deleteHolding: failed to delete holding", error)
    if (error) return null
    return {deletedCount: count ?? 0}
}

async function deleteHoldingHistoryForInstrument(user_id: string, instrument_id: number) {
    const {error, count} = await supabase.from("user_investment_holding_history")
        .delete({count: "exact"}).eq("user_id", user_id).eq("instrument_id", instrument_id)
    if (error) console.error("investments.deleteHoldingHistoryForInstrument: failed", error)
    return error ? null : {deletedCount: count ?? 0}
}

/**
 * Snapshots the user's current holdings into user_investment_holding_history,
 * dated at user_date (the balance month being recorded). Called from the
 * balances/add flow so the history accumulates at the same monthly cadence the
 * user already follows. A single bulk insert regardless of holding count — no
 * per-row round-trips (see the sequential-upsert bug fixed in searchInstruments).
 * Best-effort: logs on failure but never throws, so it can't break /balances/add.
 */
async function snapshotHoldingsForUser(user_id: string, user_date: Date) {
    const holdings = await getHoldingsByUserId(user_id, false)
    const rows = holdings
        .filter((h) => h.instrument !== null)
        .map((h) => ({
            user_id,
            holding_id: h.id,
            instrument_id: (h.instrument as NonNullable<typeof h.instrument>).id,
            asset_key: h.assetKey,
            symbol: (h.instrument as NonNullable<typeof h.instrument>).symbol,
            name: (h.instrument as NonNullable<typeof h.instrument>).name,
            quantity: h.quantity,
            average_price: h.averagePrice,
            current_value: h.currentValue,
            invested_amount: h.investedAmount,
            currency: h.currency,
            user_date: toDateOnly(user_date),
        }))
    if (rows.length === 0) return

    const {error} = await supabase.from("user_investment_holding_history")
        .upsert(rows, {onConflict: "user_id,holding_id,user_date"})
    if (error) console.error("investments.snapshotHoldingsForUser: failed to upsert history rows", error)
}

type HoldingHistoryRow = {
    id: number
    holding_id: number | null
    instrument_id: number
    asset_key: InvestmentAssetKey
    symbol: string
    name: string
    quantity: number | null
    average_price: number | null
    current_value: number | null
    invested_amount: number | null
    currency: string
    user_date: string
    recorded_at: string
    price_source: "provider" | "community" | "manual" | "imported" | null
}

const HOLDING_HISTORY_SELECT = [
    "id", "holding_id", "instrument_id", "asset_key", "symbol", "name",
    "quantity", "average_price", "current_value", "invested_amount", "currency",
    "user_date", "recorded_at", "price_source",
].join(", ")

function toHoldingHistory(row: HoldingHistoryRow) {
    return {
        id: row.id,
        holdingId: row.holding_id,
        instrumentId: row.instrument_id,
        assetKey: row.asset_key,
        symbol: row.symbol,
        name: row.name,
        quantity: row.quantity,
        averagePrice: row.average_price,
        currentValue: row.current_value,
        investedAmount: row.invested_amount,
        currency: row.currency,
        userDate: row.user_date,
        recordedAt: row.recorded_at,
        ...(row.price_source ? {priceSource: row.price_source} : {}),
    }
}

/**
 * Reads the user's holding history, newest first. `userDate` (exact match) takes
 * precedence over `months` (a lookback window) when both are given. No per-month
 * dedup RPC needed beyond that — the unique (user_id, holding_id, user_date) index
 * guarantees at most one row per holding per month.
 */
async function getHoldingHistoryByUserId(user_id: string, months?: number, userDate?: Date) {
    let request = supabase.from("user_investment_holding_history")
        .select(HOLDING_HISTORY_SELECT)
        .eq("user_id", user_id)
        .order("user_date", {ascending: false})
        .order("recorded_at", {ascending: false})

    if (userDate !== undefined) {
        request = request.eq("user_date", toDateOnly(userDate))
    } else if (months !== undefined) {
        const cutoff = ExtDate.fromNow()
        cutoff.moveByMonths(-months)
        request = request.gte("user_date", toDateOnly(cutoff))
    }

    const {data, error} = await request
    if (error) console.error("investments.getHoldingHistoryByUserId: failed to read history", error)
    if (error || !data) return []
    return (data as unknown as HoldingHistoryRow[]).map(toHoldingHistory)
}

// quantity is optional: when provided (the import wizard's monthly backfill
// always knows the real quantity held that month, from buildMonthlyPositionTimeline),
// it's stored as-is instead of being denormalized from today's live holding -
// otherwise every past month's row would show today's quantity, not what was
// actually held then, making a genuine "quantity owned this month" figure
// impossible and silently overstating how much of a historical price move
// applied to the position at the time.
export type HoldingHistoryEntryInput = {
    currentValue: number | null
    investedAmount: number | null
    quantity?: number | null
    priceSource?: "provider" | "community" | "manual" | "imported"
}

// "not_found": the holding truly doesn't exist / isn't owned by this user - a
// client-side problem (stale id, wrong account). "db_error": the query itself
// failed for a reason that has nothing to do with which holding was asked for
// (e.g. a schema issue - see the onConflict clause below, which requires a
// PLAIN, non-partial unique index on (user_id, holding_id, user_date) - see
// supabase/migrations/add-holdings-history-uniqueness.sql for why it must not
// be partial. If that index is missing or wrong, every upsert here fails with
// Postgres error 42P10). Callers must surface these two very differently -
// "not_found" is nothing to worry about, "db_error" means something is
// actually broken.
export type UpsertHistoryResult =
    | {status: "not_found"}
    | {status: "db_error"; message: string}
    | {status: "ok"; entry: ReturnType<typeof toHoldingHistory>}

/**
 * Backfills/updates a single holding's value for a specific month, scoped to
 * the owning user. Denormalizes the current live holding's instrument/quantity
 * fields (same shape snapshotHoldingsForUser already writes), only the value
 * fields are user-authored.
 */
async function upsertHoldingHistoryEntry(user_id: string, holding_id: number, user_date: Date, input: HoldingHistoryEntryInput): Promise<UpsertHistoryResult> {
    const {data: holdingRow, error: holdingErr} = await supabase.from("user_investment_holdings")
        .select(HOLDING_SELECT).eq("user_id", user_id).eq("id", holding_id).maybeSingle()
    if (holdingErr) {
        console.error("investments.upsertHoldingHistoryEntry: failed to read holding", holdingErr)
        return {status: "db_error", message: holdingErr.message}
    }
    if (!holdingRow) {
        console.error(`investments.upsertHoldingHistoryEntry: holding ${holding_id} not found for user ${user_id}`)
        return {status: "not_found"}
    }

    const holding = toHolding(holdingRow as unknown as HoldingRow)
    if (holding.instrument === null) {
        console.error(`investments.upsertHoldingHistoryEntry: holding ${holding_id} has no linked instrument`)
        return {status: "not_found"}
    }

    const row = {
        user_id,
        holding_id,
        instrument_id: holding.instrument.id,
        asset_key: holding.assetKey,
        symbol: holding.instrument.symbol,
        name: holding.instrument.name,
        quantity: input.quantity !== undefined ? input.quantity : holding.quantity,
        average_price: holding.averagePrice,
        current_value: input.currentValue,
        invested_amount: input.investedAmount,
        currency: holding.currency,
        user_date: toDateOnly(user_date),
        price_source: input.currentValue == null ? null : (input.priceSource ?? "manual"),
    }

    const {data, error} = await supabase.from("user_investment_holding_history")
        .upsert(row, {onConflict: "user_id,holding_id,user_date"})
        .select(HOLDING_HISTORY_SELECT)
        .single()
    if (error) {
        console.error("investments.upsertHoldingHistoryEntry: failed to upsert history row", error)
        return {status: "db_error", message: error.message}
    }
    if (!data) return {status: "db_error", message: "upsert returned no row"}
    return {status: "ok", entry: toHoldingHistory(data as unknown as HoldingHistoryRow)}
}

export type HoldingHistoryBatchEntry = {holdingId: number, userDate: Date, currentValue: number | null, investedAmount: number | null, quantity?: number | null}
export interface HoldingHistoryBatchResult {
    savedCount: number
    /** One entry per row that couldn't be saved (unknown holding_id, or a genuine DB error) - never throws, callers decide how much to surface. */
    errors: string[]
}

/**
 * Same as upsertHoldingHistoryEntry, but for many months (possibly across
 * many holdings) in ONE round trip instead of one HTTP request per month.
 * The CSV import wizard backfilling years of history for a whole portfolio
 * used to mean one request per month per holding - hundreds to low thousands
 * of individual Vercel function invocations / Supabase round trips for a
 * single import, a real cost and latency problem, not just a slow UI. Two
 * queries total regardless of how many entries: one to fetch every
 * referenced holding at once, one bulk upsert for every valid row.
 */
async function upsertHoldingHistoryBatch(user_id: string, entries: HoldingHistoryBatchEntry[]): Promise<HoldingHistoryBatchResult> {
    if (entries.length === 0) return {savedCount: 0, errors: []}

    const holdingIds = Array.from(new Set(entries.map((e) => e.holdingId)))
    const {data: holdingRows, error: holdingsErr} = await supabase.from("user_investment_holdings")
        .select(HOLDING_SELECT).eq("user_id", user_id).in("id", holdingIds)
    if (holdingsErr) {
        console.error("investments.upsertHoldingHistoryBatch: failed to read holdings", holdingsErr)
        return {savedCount: 0, errors: [holdingsErr.message]}
    }
    const holdingById = new Map((holdingRows ?? []).map((row) => {
        const holding = toHolding(row as unknown as HoldingRow)
        return [holding.id, holding] as const
    }))

    const errors: string[] = []
    const rows: Record<string, unknown>[] = []
    for (const entry of entries) {
        const holding = holdingById.get(entry.holdingId)
        if (!holding || holding.instrument === null) {
            errors.push(`holding ${entry.holdingId} not found, or not owned by this user`)
            continue
        }
        rows.push({
            user_id,
            holding_id: entry.holdingId,
            instrument_id: holding.instrument.id,
            asset_key: holding.assetKey,
            symbol: holding.instrument.symbol,
            name: holding.instrument.name,
            quantity: entry.quantity !== undefined ? entry.quantity : holding.quantity,
            average_price: holding.averagePrice,
            current_value: entry.currentValue,
            invested_amount: entry.investedAmount,
            currency: holding.currency,
            user_date: toDateOnly(entry.userDate),
            price_source: "imported",
        })
    }
    if (rows.length === 0) return {savedCount: 0, errors}

    const {error} = await supabase.from("user_investment_holding_history")
        .upsert(rows, {onConflict: "user_id,holding_id,user_date"})
    if (error) {
        console.error("investments.upsertHoldingHistoryBatch: failed to upsert history rows", error)
        return {savedCount: 0, errors: [...errors, error.message]}
    }
    return {savedCount: rows.length, errors}
}

export interface HistoricalPriceBackfillResult {
    holdingId: number
    monthsFilled: number
}

function lastDateOfMonth(monthKey: string): string {
    const [year, month] = monthKey.split("-").map(Number)
    return `${monthKey}-${String(new Date(Date.UTC(year, month, 0)).getUTCDate()).padStart(2, "0")}`
}

/**
 * Stores provider prices once per instrument/month for the whole application.
 * A provider observation supersedes an active community candidate, whose row
 * remains available as audit history. Current-month rows are provisional and
 * overwritten on the next daily refresh; closed months are final.
 */
async function saveCanonicalProviderPrices(
    instrumentId: number,
    source: Exclude<HistoricalPriceSource, "community">,
    pricesEUR: Map<string, number>,
): Promise<void> {
    if (pricesEUR.size === 0) return
    const monthKeys = [...pricesEUR.keys()]
    const now = new Date()
    const currentMonthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`
    const today = now.toISOString().slice(0, 10)
    const {data, error} = await supabase.from("instrument_historical_prices")
        .select("id, month_key, source")
        .eq("instrument_id", instrumentId)
        .in("month_key", monthKeys)
        .in("status", ["pending", "verified"])
    if (error) {
        console.error("investments.saveCanonicalProviderPrices: failed to read canonical prices", error)
        return
    }

    const active = (data ?? []) as unknown as {id: number; month_key: string; source: HistoricalPriceSource}[]
    const communityIds = active.filter((row) => row.source === "community").map((row) => row.id)
    if (communityIds.length > 0) {
        const superseded = await supabase.from("instrument_historical_prices")
            .update({status: "superseded", rejection_note: "Superseded by verified provider price"})
            .in("id", communityIds)
        if (superseded.error) {
            console.error("investments.saveCanonicalProviderPrices: failed to supersede community prices", superseded.error)
            return
        }
    }

    const providerByMonth = new Map(active.filter((row) => row.source !== "community").map((row) => [row.month_key, row]))
    const newRows: Record<string, unknown>[] = []
    for (const [monthKey, priceEur] of pricesEUR) {
        const isFinal = monthKey < currentMonthKey
        const payload = {
            reference_date: isFinal ? lastDateOfMonth(monthKey) : today,
            price_eur: roundCurrency(priceEur), raw_price: roundCurrency(priceEur), raw_currency: "EUR",
            status: "verified", source, is_final: isFinal, submitted_by: null,
            verified_at: now.toISOString(), rejection_note: null,
        }
        const existing = providerByMonth.get(monthKey)
        if (existing) {
            const updated = await supabase.from("instrument_historical_prices").update(payload).eq("id", existing.id)
            if (updated.error) console.error("investments.saveCanonicalProviderPrices: failed to refresh provider price", updated.error)
        } else {
            newRows.push({instrument_id: instrumentId, month_key: monthKey, ...payload})
        }
    }
    if (newRows.length > 0) {
        const inserted = await supabase.from("instrument_historical_prices").insert(newRows)
        if (inserted.error) console.error("investments.saveCanonicalProviderPrices: failed to insert provider prices", inserted.error)
    }
}

/**
 * Fills in current_value for PAST months that only have cost-basis
 * (invested_amount) history, using each instrument's own historical monthly
 * closing price (Finnhub for stocks/ETFs, CoinGecko for crypto - already in
 * EUR) multiplied by the quantity actually held that month (see
 * upsertHoldingHistoryEntry's quantity parameter, and the import wizard's
 * backfillHistory, which is what actually stores a real per-month quantity
 * instead of always denormalizing today's). This is what turns "value over
 * time" from a cost-basis-only trend into a real market-value trend for
 * months before the user started using "Refresh prices" regularly.
 *
 * One provider call per instrument (not per month) covers its whole history
 * range. Best-effort and partial by design: months the provider has no data
 * for (unsupported plan/tier, delisted, too far back, or simply an untracked
 * kind) fall back to verified community submissions for that same
 * instrument+month (see getVerifiedCommunityPricesForInstrument), and only
 * then are silently left unfilled - never a hard failure. Never overwrites a
 * month that already has a real current_value (from a manual entry or a
 * previous refresh) - only fills genuine gaps.
 */
async function backfillHistoricalPrices(user_id: string, eurRates: Record<string, number>): Promise<HistoricalPriceBackfillResult[]> {
    const holdings = await getHoldingsByUserId(user_id, false)
    const backfillable = holdings.filter((h) =>
        h.instrument !== null
        && (h.instrument.kind === "stock" || h.instrument.kind === "etf" || h.instrument.kind === "crypto")
        && h.quantity != null && h.quantity > 0)
    if (backfillable.length === 0) return []

    const history = await getHoldingHistoryByUserId(user_id)
    const historyByHoldingId = new Map<number, typeof history>()
    for (const entry of history) {
        if (entry.holdingId === null) continue
        const rows = historyByHoldingId.get(entry.holdingId) ?? []
        rows.push(entry)
        historyByHoldingId.set(entry.holdingId, rows)
    }

    const results: HistoricalPriceBackfillResult[] = []
    for (const holding of backfillable) {
        const instrument = holding.instrument as NonNullable<typeof holding.instrument>
        const now = new Date()
        const currentMonthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`
        const gaps = (historyByHoldingId.get(holding.id) ?? [])
            .filter((row) => (row.currentValue == null || row.priceSource === "community"
                || (row.userDate.slice(0, 7) === currentMonthKey && row.priceSource === "provider"))
                && row.quantity != null && row.quantity > 0)
            .sort((a, b) => a.userDate.localeCompare(b.userDate))
        if (gaps.length === 0) continue

        const fromUnix = Math.floor(new Date(gaps[0].userDate).getTime() / 1000)
        const toUnix = Math.floor(Date.now() / 1000)

        const isCrypto = instrument.kind === "crypto"
        let priceByMonth = (!isCrypto || instrument.coingeckoId)
            ? (isCrypto
                ? await coingeckoProvider.getHistoricalMonthlyPrices(instrument.coingeckoId as string, fromUnix, toUnix)
                : await finnhubProvider.getHistoricalMonthlyPrices(instrument.symbol, fromUnix, toUnix))
            : null
        if (!priceByMonth && !isCrypto) {
            const fallbackSymbol = await resolveFallbackFinnhubSymbol(instrument.isin)
            if (fallbackSymbol) priceByMonth = await finnhubProvider.getHistoricalMonthlyPrices(fallbackSymbol, fromUnix, toUnix)
        }

        const priceCurrency = isCrypto ? "EUR" : (instrument.currency ?? "USD")
        const rate = priceCurrency === "EUR" ? 1 : eurRates[priceCurrency]

        if (priceByMonth && rate) {
            const pricesEUR = new Map([...priceByMonth].map(([monthKey, price]) => [monthKey, roundCurrency(price / rate)]))
            await saveCanonicalProviderPrices(instrument.id, isCrypto ? "coingecko" : "finnhub", pricesEUR)
        }

        // Free, human-verified fallback for whatever the paid provider can't
        // cover (no data for this range, or gated behind a paid tier) - see
        // getVerifiedCommunityPricesForInstrument. Already EUR, so it's never
        // divided by `rate` below, unlike the provider's native-currency price.
        const canonicalByMonth = await getVerifiedCanonicalPricesForInstrument(instrument.id)
        if (!priceByMonth && canonicalByMonth.size === 0) continue

        let monthsFilled = 0
        for (const gap of gaps) {
            const monthKey = gap.userDate.slice(0, 7)
            const price = priceByMonth?.get(monthKey)
            const canonical = canonicalByMonth.get(monthKey)

            let currentValue: number | null = null
            if (price != null && rate) currentValue = roundCurrency((price / rate) * (gap.quantity as number))
            else if (canonical != null) currentValue = roundCurrency(canonical.priceEur * (gap.quantity as number))
            if (currentValue == null) continue

            const result = await upsertHoldingHistoryEntry(user_id, holding.id, new Date(gap.userDate), {
                currentValue, investedAmount: gap.investedAmount, quantity: gap.quantity,
                priceSource: price != null || canonical?.source !== "community" ? "provider" : "community",
            })
            if (result.status === "ok") monthsFilled++
        }
        if (monthsFilled > 0) results.push({holdingId: holding.id, monthsFilled})
    }
    return results
}

export type InvestmentSettings = { monthlyTarget: number | null; monthlyTargetPercent: number | null }

/**
 * Reads the user's "how much would I like to invest each month" € target -
 * a single, optional setting surfaced in Portfolio Insights. Never having set
 * one is the common case (returns monthlyTarget: null), not an error.
 */
async function getInvestmentSettings(user_id: string): Promise<InvestmentSettings> {
    const {data, error} = await supabase.from("user_investment_settings")
        .select("monthly_target, monthly_target_percent").eq("user_id", user_id).maybeSingle()
    if (error) console.error("investments.getInvestmentSettings: failed to read settings", error)
    const row = data as {monthly_target: number | null; monthly_target_percent: number | null} | null
    return {monthlyTarget: row?.monthly_target ?? null, monthlyTargetPercent: row?.monthly_target_percent ?? null}
}

/** onConflict targets the table's own primary key (user_id) - a single row per user, no partial index involved. */
async function saveInvestmentSettings(user_id: string, monthlyTarget: number | null, monthlyTargetPercent: number | null = null): Promise<InvestmentSettings | null> {
    const {data, error} = await supabase.from("user_investment_settings")
        .upsert({user_id, monthly_target: monthlyTarget, monthly_target_percent: monthlyTargetPercent, updated_at: new Date().toISOString()}, {onConflict: "user_id"})
        .select("monthly_target, monthly_target_percent")
        .single()
    if (error) {
        console.error("investments.saveInvestmentSettings: failed to save settings", error)
        return null
    }
    const row = data as {monthly_target: number | null; monthly_target_percent: number | null}
    return {monthlyTarget: row.monthly_target, monthlyTargetPercent: row.monthly_target_percent}
}

type DividendRow = {
    id: number
    instrument_id: number
    holding_id: number | null
    amount: number
    currency: string | null
    gross_amount: number | null
    paid_date: string
    external_id: string | null
    source: string
    recorded_at: string
}

const DIVIDEND_SELECT = [
    "id", "instrument_id", "holding_id", "amount", "currency", "gross_amount",
    "paid_date", "external_id", "source", "recorded_at",
].join(", ")

function toDividend(row: DividendRow) {
    return {
        id: row.id,
        instrumentId: row.instrument_id,
        holdingId: row.holding_id,
        amount: row.amount,
        currency: row.currency,
        grossAmount: row.gross_amount,
        paidDate: row.paid_date,
        externalId: row.external_id,
        source: row.source,
        recordedAt: row.recorded_at,
    }
}

export type DividendInput = {
    instrumentId: number
    holdingId: number | null
    /** Already converted to EUR (DB is always EUR) - see convertAmountToEUR on the frontend. */
    amount: number
    currency: string | null
    grossAmount: number | null
    paidDate: Date
    externalId: string | null
    source: string
}

/**
 * Records a single dividend payment, scoped to the owning user. Idempotent
 * when the broker provides an external id (see the partial unique index in
 * add-investment-dividends.sql): re-importing the same file upserts the
 * already-recorded row instead of creating a duplicate, so a dividend can
 * never be double-counted just because its source file gets re-uploaded.
 * Rows without an external id (some brokers don't provide one) rely on the
 * CSV-side dedup pass instead — same tradeoff already accepted for buy/sell
 * transactions with no order id (see dedupeTransactions).
 */
async function upsertDividend(user_id: string, input: DividendInput) {
    const payload = {
        user_id,
        instrument_id: input.instrumentId,
        holding_id: input.holdingId,
        amount: input.amount,
        currency: input.currency,
        gross_amount: input.grossAmount,
        paid_date: toDateOnly(input.paidDate),
        external_id: input.externalId,
        source: input.source,
    }

    const query = supabase.from("user_investment_dividends")
    const {data, error} = input.externalId
        ? await query.upsert(payload, {onConflict: "user_id,instrument_id,external_id"}).select(DIVIDEND_SELECT).single()
        : await query.insert(payload).select(DIVIDEND_SELECT).single()

    if (error) {
        console.error("investments.upsertDividend: failed to save dividend", error)
        return null
    }
    return data ? toDividend(data as unknown as DividendRow) : null
}

export interface DividendBatchResult {
    savedCount: number
    /** One entry per row that couldn't be saved (unknown/foreign instrument_id, or a genuine DB error) - never throws, callers decide how much to surface. */
    errors: string[]
}

/**
 * Resolves which of the given instrument ids are actually visible to this
 * user (shared catalog or their own private rows) in ONE query - the same
 * scoping getInstrumentById applies one row at a time, but batch callers
 * can't afford one query per row (see upsertHoldingHistoryBatch).
 */
async function getOwnedInstrumentIds(instrumentIds: number[], user_id: string): Promise<Set<number>> {
    if (instrumentIds.length === 0) return new Set()
    const {data, error} = await supabase.from("investment_instruments")
        .select("id").eq("active", true).in("id", instrumentIds)
        .or(`owner_user_id.is.null,owner_user_id.eq.${user_id}`)
    if (error) {
        console.error("investments.getOwnedInstrumentIds: failed to read instruments", error)
        return new Set()
    }
    return new Set((data ?? []).map((row) => (row as {id: number}).id))
}

/**
 * Same as upsertDividend, but for many payments in ONE round trip instead of
 * one HTTP request per dividend - see upsertHoldingHistoryBatch for why this
 * matters at import time. Split into two bulk calls at most (entries with a
 * broker-provided external id upsert together, entries without one insert
 * together) rather than one call per entry - still a small, fixed number of
 * queries regardless of how many dividends a whole portfolio import finds.
 */
async function upsertDividendsBatch(user_id: string, entries: DividendInput[]): Promise<DividendBatchResult> {
    if (entries.length === 0) return {savedCount: 0, errors: []}

    const ownedInstrumentIds = await getOwnedInstrumentIds(Array.from(new Set(entries.map((e) => e.instrumentId))), user_id)
    const errors: string[] = []
    const valid = entries.filter((e) => {
        if (ownedInstrumentIds.has(e.instrumentId)) return true
        errors.push(`instrument ${e.instrumentId} not found, or not owned by this user`)
        return false
    })

    const toPayload = (input: DividendInput) => ({
        user_id, instrument_id: input.instrumentId, holding_id: input.holdingId,
        amount: input.amount, currency: input.currency, gross_amount: input.grossAmount,
        paid_date: toDateOnly(input.paidDate), external_id: input.externalId, source: input.source,
    })
    const withId = valid.filter((e) => e.externalId).map(toPayload)
    const withoutId = valid.filter((e) => !e.externalId).map(toPayload)

    let savedCount = 0
    if (withId.length > 0) {
        const {data, error} = await supabase.from("user_investment_dividends")
            .upsert(withId, {onConflict: "user_id,instrument_id,external_id"}).select("id")
        if (error) {
            console.error("investments.upsertDividendsBatch: failed to upsert dividends with external_id", error)
            errors.push(error.message)
        } else savedCount += (data ?? []).length
    }
    if (withoutId.length > 0) {
        const {data, error} = await supabase.from("user_investment_dividends").insert(withoutId).select("id")
        if (error) {
            console.error("investments.upsertDividendsBatch: failed to insert dividends without external_id", error)
            errors.push(error.message)
        } else savedCount += (data ?? []).length
    }
    return {savedCount, errors}
}

export interface DividendSummaryEntry {
    instrumentId: number
    symbol: string
    name: string
    totalAmount: number
    paymentCount: number
    lastPaidDate: string
}

/**
 * Per-instrument dividend totals for the user — feeds the "dividends
 * received" stat and its comparison against each holding's invested amount
 * (see InvestmentHoldingsPanel). Aggregated in JS rather than a SQL GROUP BY,
 * consistent with how the rest of this file treats Supabase as a plain row
 * store (see getHoldingHistoryByUserId) — a personal-finance app's realistic
 * per-user row count (dozens to low hundreds) is cheap to just sum here.
 */
async function getDividendsSummaryByUserId(user_id: string): Promise<DividendSummaryEntry[]> {
    const {data, error} = await supabase.from("user_investment_dividends")
        .select(`amount, paid_date, instrument:investment_instruments(id, symbol, name)`)
        .eq("user_id", user_id)
    if (error) console.error("investments.getDividendsSummaryByUserId: failed to read dividends", error)
    if (error || !data) return []

    const byInstrument = new Map<number, DividendSummaryEntry>()
    for (const row of data as unknown as {amount: number; paid_date: string; instrument: InstrumentRow | InstrumentRow[] | null}[]) {
        const instrument = Array.isArray(row.instrument) ? row.instrument[0] : row.instrument
        if (!instrument) continue
        const existing = byInstrument.get(instrument.id)
        if (existing) {
            existing.totalAmount += row.amount
            existing.paymentCount += 1
            if (row.paid_date > existing.lastPaidDate) existing.lastPaidDate = row.paid_date
        } else {
            byInstrument.set(instrument.id, {
                instrumentId: instrument.id,
                symbol: instrument.symbol,
                name: instrument.name,
                totalAmount: row.amount,
                paymentCount: 1,
                lastPaidDate: row.paid_date,
            })
        }
    }
    return Array.from(byInstrument.values()).sort((a, b) => b.totalAmount - a.totalAmount)
}

type TransactionRow = {
    id: number
    instrument_id: number
    holding_id: number | null
    side: "buy" | "sell"
    quantity: number
    price: number | null
    currency: string | null
    total: number | null
    total_currency: string | null
    trade_date: string
    external_id: string | null
    source: string
    recorded_at: string
}

const TRANSACTION_SELECT = [
    "id", "instrument_id", "holding_id", "side", "quantity", "price", "currency",
    "total", "total_currency", "trade_date", "external_id", "source", "recorded_at",
].join(", ")

function toTransaction(row: TransactionRow) {
    return {
        id: row.id,
        instrumentId: row.instrument_id,
        holdingId: row.holding_id,
        side: row.side,
        quantity: row.quantity,
        price: row.price,
        currency: row.currency,
        total: row.total,
        totalCurrency: row.total_currency,
        tradeDate: row.trade_date,
        externalId: row.external_id,
        source: row.source,
        recordedAt: row.recorded_at,
    }
}

export type TransactionInput = {
    instrumentId: number
    holdingId: number | null
    side: "buy" | "sell"
    quantity: number
    price: number | null
    currency: string | null
    /** Already converted to EUR (DB is always EUR) - see convertAmountToEUR on the frontend. */
    total: number | null
    totalCurrency: string | null
    tradeDate: Date
    externalId: string | null
    source: string
}

/**
 * Records a single buy/sell transaction, scoped to the owning user. Idempotent
 * when the broker provides an external id (see upsertDividend for the exact
 * same reasoning/tradeoffs) - lets a future import session fetch the complete
 * transaction history (getTransactionsByUserId) and reconcile "is this
 * position now closed" correctly, regardless of which files were uploaded in
 * which session, in which order (see recomputeFromMerged in
 * InvestmentImportWizard.tsx, which is the actual consumer of this).
 */
async function upsertTransaction(user_id: string, input: TransactionInput) {
    const payload = {
        user_id,
        instrument_id: input.instrumentId,
        holding_id: input.holdingId,
        side: input.side,
        quantity: input.quantity,
        price: input.price,
        currency: input.currency,
        total: input.total,
        total_currency: input.totalCurrency,
        trade_date: toDateOnly(input.tradeDate),
        external_id: input.externalId,
        source: input.source,
    }

    const query = supabase.from("user_investment_transactions")
    const {data, error} = input.externalId
        ? await query.upsert(payload, {onConflict: "user_id,instrument_id,external_id"}).select(TRANSACTION_SELECT).single()
        : await query.insert(payload).select(TRANSACTION_SELECT).single()

    if (error) {
        console.error("investments.upsertTransaction: failed to save transaction", error)
        return null
    }
    return data ? toTransaction(data as unknown as TransactionRow) : null
}

export interface TransactionBatchResult {
    savedCount: number
    /** One entry per row that couldn't be saved (unknown/foreign instrument_id, or a genuine DB error) - never throws, callers decide how much to surface. */
    errors: string[]
}

/**
 * Same as upsertTransaction, but for many transactions (possibly across many
 * instruments) in ONE round trip instead of one HTTP request per transaction
 * - see upsertHoldingHistoryBatch for why this matters at import time. A
 * portfolio's full transaction history (every individual buy/sell, not just
 * monthly snapshots) is exactly the case with the most rows: split into two
 * bulk calls at most, same reasoning as upsertDividendsBatch.
 */
async function saveTransactionsBatch(user_id: string, entries: TransactionInput[]): Promise<TransactionBatchResult> {
    if (entries.length === 0) return {savedCount: 0, errors: []}

    const ownedInstrumentIds = await getOwnedInstrumentIds(Array.from(new Set(entries.map((e) => e.instrumentId))), user_id)
    const errors: string[] = []
    const valid = entries.filter((e) => {
        if (ownedInstrumentIds.has(e.instrumentId)) return true
        errors.push(`instrument ${e.instrumentId} not found, or not owned by this user`)
        return false
    })

    const toPayload = (input: TransactionInput) => ({
        user_id, instrument_id: input.instrumentId, holding_id: input.holdingId,
        side: input.side, quantity: input.quantity, price: input.price, currency: input.currency,
        total: input.total, total_currency: input.totalCurrency, trade_date: toDateOnly(input.tradeDate),
        external_id: input.externalId, source: input.source,
    })
    const withId = valid.filter((e) => e.externalId).map(toPayload)
    const withoutId = valid.filter((e) => !e.externalId).map(toPayload)

    let savedCount = 0
    if (withId.length > 0) {
        const {data, error} = await supabase.from("user_investment_transactions")
            .upsert(withId, {onConflict: "user_id,instrument_id,external_id"}).select("id")
        if (error) {
            console.error("investments.saveTransactionsBatch: failed to upsert transactions with external_id", error)
            errors.push(error.message)
        } else savedCount += (data ?? []).length
    }
    if (withoutId.length > 0) {
        const {data, error} = await supabase.from("user_investment_transactions").insert(withoutId).select("id")
        if (error) {
            console.error("investments.saveTransactionsBatch: failed to insert transactions without external_id", error)
            errors.push(error.message)
        } else savedCount += (data ?? []).length
    }
    return {savedCount, errors}
}

export interface TransactionSummaryEntry {
    instrumentId: number
    isin: string | null
    symbol: string
    name: string
    side: "buy" | "sell"
    quantity: number
    price: number | null
    currency: string | null
    total: number | null
    totalCurrency: string | null
    tradeDate: string
    externalId: string | null
    /** Which import produced this row (e.g. "trading212", "directa") - lets
     * the UI show where a given purchase/sale actually came from. */
    source: string
}

/**
 * All of the user's recorded buy/sell transactions, with enough instrument
 * identity (isin/symbol/name) for the CSV import wizard to merge them
 * client-side with a freshly-parsed file's own transactions (same shape as
 * ImportedTransaction) before recomputing closed-position status across
 * EVERY session that has ever imported data, not just the current browser
 * session - see recomputeFromMerged in InvestmentImportWizard.tsx. Unlike
 * getDividendsSummaryByUserId this returns the raw per-transaction rows, not
 * an aggregate: the wizard needs the actual trade dates and sides to
 * reconstruct net quantity correctly, not just a running total.
 */
async function getTransactionsByUserId(user_id: string): Promise<TransactionSummaryEntry[]> {
    const {data, error} = await supabase.from("user_investment_transactions")
        .select(`instrument_id, side, quantity, price, currency, total, total_currency, trade_date, external_id, source, instrument:investment_instruments(isin, symbol, name)`)
        .eq("user_id", user_id)
    if (error) console.error("investments.getTransactionsByUserId: failed to read transactions", error)
    if (error || !data) return []

    type Row = {
        instrument_id: number
        side: "buy" | "sell"
        quantity: number
        price: number | null
        currency: string | null
        total: number | null
        total_currency: string | null
        trade_date: string
        external_id: string | null
        source: string
        instrument: {isin: string | null; symbol: string; name: string} | {isin: string | null; symbol: string; name: string}[] | null
    }

    return (data as unknown as Row[])
        .map((row): TransactionSummaryEntry | null => {
            const instrument = Array.isArray(row.instrument) ? row.instrument[0] : row.instrument
            if (!instrument) return null
            return {
                instrumentId: row.instrument_id,
                isin: instrument.isin,
                symbol: instrument.symbol,
                name: instrument.name,
                side: row.side,
                quantity: row.quantity,
                price: row.price,
                currency: row.currency,
                total: row.total,
                totalCurrency: row.total_currency,
                tradeDate: row.trade_date,
                externalId: row.external_id,
                source: row.source,
            }
        })
        .filter((entry): entry is TransactionSummaryEntry => entry !== null)
}

async function deleteTransactionsForInstrument(user_id: string, instrument_id: number) {
    const {error, count} = await supabase.from("user_investment_transactions")
        .delete({count: "exact"}).eq("user_id", user_id).eq("instrument_id", instrument_id)
    if (error) console.error("investments.deleteTransactionsForInstrument: failed", error)
    return error ? null : {deletedCount: count ?? 0}
}

// ---------- Community-verified historical prices ----------
// Finnhub/CoinGecko gate historical candle data behind a paid tier for most
// users/date-ranges, so backfillHistoricalPrices often finds nothing to fill.
// This is a free, human-verified alternative: a user who actually held an
// instrument in a given month can submit the price they know; it sits as
// 'pending' until an admin checks it against a real quote, at which point it
// becomes visible to every user (see getVerifiedCommunityPricesForInstrument,
// consumed by backfillHistoricalPrices) - not just the submitter.

type CommunityPriceStatus = "pending" | "verified" | "rejected" | "superseded"
type HistoricalPriceSource = "community" | "coingecko" | "finnhub"

type CommunityPriceRow = {
    id: number
    instrument_id: number
    month_key: string
    reference_date: string
    price_eur: number
    raw_price: number
    raw_currency: string
    status: CommunityPriceStatus
    submitted_by: string | null
    submitted_at: string
    verified_by: string | null
    verified_at: string | null
    rejection_note: string | null
    source?: HistoricalPriceSource
    is_final?: boolean
}

const COMMUNITY_PRICE_SELECT = [
    "id", "instrument_id", "month_key", "reference_date", "price_eur", "raw_price", "raw_currency",
    "status", "submitted_by", "submitted_at", "verified_by", "verified_at", "rejection_note", "source", "is_final",
].join(", ")

function toCommunityPrice(row: CommunityPriceRow) {
    return {
        id: row.id,
        instrumentId: row.instrument_id,
        monthKey: row.month_key,
        ...(row.reference_date ? {referenceDate: row.reference_date} : {}),
        priceEur: row.price_eur,
        rawPrice: row.raw_price,
        rawCurrency: row.raw_currency,
        status: row.status,
        submittedBy: row.submitted_by,
        submittedAt: row.submitted_at,
        verifiedBy: row.verified_by,
        verifiedAt: row.verified_at,
        rejectionNote: row.rejection_note,
        source: row.source ?? "community",
        isFinal: row.is_final ?? true,
    }
}
export type CommunityPrice = ReturnType<typeof toCommunityPrice>
export type CommunityPriceWithInstrument = CommunityPrice & {
    instrument: {id: number; kind: InvestmentKind; symbol: string; name: string; currency: string | null} | null
}

/**
 * Whether the user has ever actually held this instrument - checked against
 * both live holdings AND holding history (holding_id is "on delete set null",
 * not cascade, so a manually-added holding's history can outlive the holding
 * itself being deleted) so a real past position is never wrongly rejected.
 */
async function hasHeldInstrument(user_id: string, instrument_id: number): Promise<boolean> {
    const [holdingResult, historyResult] = await Promise.all([
        supabase.from("user_investment_holdings").select("id").eq("user_id", user_id).eq("instrument_id", instrument_id).limit(1).maybeSingle(),
        supabase.from("user_investment_holding_history").select("id").eq("user_id", user_id).eq("instrument_id", instrument_id).limit(1).maybeSingle(),
    ])
    if (holdingResult.error) console.error("investments.hasHeldInstrument: failed to check holdings", holdingResult.error)
    if (historyResult.error) console.error("investments.hasHeldInstrument: failed to check holding history", historyResult.error)
    return holdingResult.data !== null || historyResult.data !== null
}

export type CommunityPriceInput = {
    instrumentId: number
    monthKey: string // "YYYY-MM"
    referenceDate?: string // "YYYY-MM-DD", within monthKey
    rawPrice: number
    rawCurrency: string
}

export type CommunityPriceSubmissionResult =
    | {status: "ok"; submission: CommunityPrice}
    // An active (pending or verified) submission already exists for this
    // instrument+month - same partial-unique-index shape as insertHolding,
    // caller surfaces it instead of silently overwriting someone else's entry.
    | {status: "conflict"; existing: CommunityPrice}
    // The user never actually held this instrument - see hasHeldInstrument.
    | {status: "not_eligible"}
    // A provider already supplied an authoritative value for this user's
    // instrument/month; community input must remain fallback-only.
    | {status: "provider_available"}
    // rawCurrency isn't a known exchange rate (eurRates lookup miss).
    | {status: "unknown_currency"}

/**
 * Records a user's proposed historical price for an instrument+month they
 * actually held. Converts to EUR immediately at submission time (CLAUDE.md:
 * "DB sempre EUR") using the same eurRates cache already used by
 * refresh-prices/backfill-historical-prices - price_eur is the authoritative
 * value, raw_price/raw_currency are kept only as the admin's reference point
 * when checking the submission against a real quote (same shape as
 * user_investment_dividends' amount vs gross_amount/currency).
 */
async function submitCommunityPrice(user_id: string, input: CommunityPriceInput, eurRates: Record<string, number>): Promise<CommunityPriceSubmissionResult | null> {
    const eligible = await hasHeldInstrument(user_id, input.instrumentId)
    if (!eligible) return {status: "not_eligible"}

    const {data: providerHistory, error: providerHistoryError} = await supabase.from("instrument_historical_prices")
        .select("id")
        .eq("instrument_id", input.instrumentId)
        .eq("month_key", input.monthKey)
        .neq("source", "community")
        .eq("status", "verified")
        .limit(1).maybeSingle()
    if (providerHistoryError) console.error("investments.submitCommunityPrice: failed to check provider history", providerHistoryError)
    if (providerHistory) return {status: "provider_available"}

    const rate = input.rawCurrency === "EUR" ? 1 : eurRates[input.rawCurrency]
    if (!rate) return {status: "unknown_currency"}
    const priceEur = roundCurrency(input.rawPrice / rate)

    const [year, month] = input.monthKey.split("-").map(Number)
    const referenceDate = input.referenceDate
        ?? `${input.monthKey}-${String(new Date(Date.UTC(year, month, 0)).getUTCDate()).padStart(2, "0")}`
    const payload = {
        instrument_id: input.instrumentId,
        month_key: input.monthKey,
        reference_date: referenceDate,
        price_eur: priceEur,
        raw_price: input.rawPrice,
        raw_currency: input.rawCurrency,
        submitted_by: user_id,
        source: "community",
        is_final: true,
    }

    const {data, error} = await supabase.from("instrument_historical_prices")
        .insert(payload).select(COMMUNITY_PRICE_SELECT).single()
    if (!error && data) return {status: "ok", submission: toCommunityPrice(data as unknown as CommunityPriceRow)}

    if (error?.code === "23505") { // unique violation: an active submission already exists for this instrument+month
        const {data: existingRow, error: existingErr} = await supabase.from("instrument_historical_prices")
            .select(COMMUNITY_PRICE_SELECT)
            .eq("instrument_id", input.instrumentId).eq("month_key", input.monthKey)
            .in("status", ["pending", "verified"]).maybeSingle()
        if (existingErr) console.error("investments.submitCommunityPrice: failed to look up conflicting submission", existingErr)
        if (existingRow) return {status: "conflict", existing: toCommunityPrice(existingRow as unknown as CommunityPriceRow)}
    }

    console.error("investments.submitCommunityPrice: failed to insert submission", error)
    return null
}

/** All pending submissions awaiting admin review, oldest first (fair queue), with instrument details for display. */
async function getPendingCommunityPrices(): Promise<CommunityPriceWithInstrument[]> {
    const {data, error} = await supabase.from("instrument_historical_prices")
        .select(`${COMMUNITY_PRICE_SELECT}, instrument:investment_instruments(id, kind, symbol, name, currency)`)
        .eq("status", "pending")
        .eq("source", "community")
        .order("submitted_at", {ascending: true})
    if (error) console.error("investments.getPendingCommunityPrices: failed to read pending submissions", error)
    if (error || !data) return []

    type Row = CommunityPriceRow & {instrument: CommunityPriceWithInstrument["instrument"] | CommunityPriceWithInstrument["instrument"][] | null}
    return (data as unknown as Row[]).map((row) => {
        const instrument = Array.isArray(row.instrument) ? row.instrument[0] ?? null : row.instrument
        return {...toCommunityPrice(row), instrument}
    })
}

/** A single user's own submissions across all statuses (pending/verified/rejected), for transparency. */
async function getMyCommunityPriceSubmissions(user_id: string): Promise<CommunityPriceWithInstrument[]> {
    const {data, error} = await supabase.from("instrument_historical_prices")
        .select(`${COMMUNITY_PRICE_SELECT}, instrument:investment_instruments(id, kind, symbol, name, currency)`)
        .eq("submitted_by", user_id)
        .neq("status", "superseded")
        .order("submitted_at", {ascending: false})
    if (error) console.error("investments.getMyCommunityPriceSubmissions: failed to read submissions", error)
    if (error || !data) return []

    type Row = CommunityPriceRow & {instrument: CommunityPriceWithInstrument["instrument"] | CommunityPriceWithInstrument["instrument"][] | null}
    return (data as unknown as Row[]).map((row) => {
        const instrument = Array.isArray(row.instrument) ? row.instrument[0] ?? null : row.instrument
        return {...toCommunityPrice(row), instrument}
    })
}

export type VerifyCommunityPriceResult =
    | {status: "ok"; submission: CommunityPrice}
    | {status: "not_found"}
    | {status: "already_resolved"; submission: CommunityPrice}

async function applyVerifiedCommunityPriceToHistory(submission: CommunityPrice): Promise<void> {
    const [year, month] = submission.monthKey.split("-").map(Number)
    const monthStart = `${submission.monthKey}-01`
    const monthEnd = `${submission.monthKey}-${String(new Date(Date.UTC(year, month, 0)).getUTCDate()).padStart(2, "0")}`
    const {data, error} = await supabase.from("user_investment_holding_history")
        .select("id, quantity, price_source")
        .eq("instrument_id", submission.instrumentId)
        .gte("user_date", monthStart)
        .lte("user_date", monthEnd)
    if (error) {
        console.error("investments.applyVerifiedCommunityPriceToHistory: failed to read matching history", error)
        return
    }

    const rows = (data ?? []) as unknown as {id: number; quantity: number | null; price_source: string | null}[]
    const eligible = rows.filter((row) =>
        row.quantity != null && row.quantity > 0
        && row.price_source !== "provider" && row.price_source !== "community")
    await Promise.all(eligible.map(async (row) => {
        const result = await supabase.from("user_investment_holding_history")
            .update({
                current_value: roundCurrency(submission.priceEur * (row.quantity as number)),
                price_source: "community",
            })
            .eq("id", row.id)
        if (result.error) console.error("investments.applyVerifiedCommunityPriceToHistory: failed to update history row", result.error)
    }))
}

/**
 * Approves or rejects a pending submission. Admin-only - callers must
 * re-check users.isAdmin server-side before calling this, never trust the
 * frontend route guard alone. Approving makes it visible to every user
 * holding that instrument for that month (see getVerifiedCommunityPricesForInstrument).
 */
async function verifyCommunityPrice(admin_user_id: string, id: number, action: "approve" | "reject", rejectionNote: string | null): Promise<VerifyCommunityPriceResult> {
    const {data: existingRow, error: existingErr} = await supabase.from("instrument_historical_prices")
        .select(COMMUNITY_PRICE_SELECT).eq("id", id).maybeSingle()
    if (existingErr) console.error("investments.verifyCommunityPrice: failed to look up submission", existingErr)
    if (!existingRow) return {status: "not_found"}

    const existing = toCommunityPrice(existingRow as unknown as CommunityPriceRow)
    if (existing.status !== "pending") return {status: "already_resolved", submission: existing}

    const {data, error} = await supabase.from("instrument_historical_prices")
        .update({
            status: action === "approve" ? "verified" : "rejected",
            verified_by: admin_user_id,
            verified_at: new Date().toISOString(),
            rejection_note: action === "reject" ? rejectionNote : null,
        })
        .eq("id", id).eq("status", "pending") // guards against a concurrent double-resolve
        .select(COMMUNITY_PRICE_SELECT).maybeSingle()
    if (error) console.error("investments.verifyCommunityPrice: failed to update submission", error)
    if (error || !data) return {status: "not_found"}
    const submission = toCommunityPrice(data as unknown as CommunityPriceRow)
    if (action === "approve") await applyVerifiedCommunityPriceToHistory(submission)
    return {status: "ok", submission}
}

/**
 * Verified community EUR-prices for one instrument, keyed by month - used
 * only by backfillHistoricalPrices as a fallback when the paid provider has
 * no data for a gap month. One query per instrument (not per month), same
 * efficiency backfillHistoricalPrices already applies to its provider calls.
 * Already EUR (see submitCommunityPrice), so callers must NOT apply the
 * provider branch's eurRates division to these values.
 */
async function getVerifiedCommunityPricesForInstrument(instrument_id: number): Promise<Map<string, number>> {
    const {data, error} = await supabase.from("instrument_historical_prices")
        .select("month_key, price_eur")
        .eq("instrument_id", instrument_id)
        .eq("status", "verified")
        .eq("source", "community")
    if (error) console.error("investments.getVerifiedCommunityPricesForInstrument: failed to read verified prices", error)
    if (error || !data) return new Map()
    return new Map((data as unknown as {month_key: string; price_eur: number}[]).map((row) => [row.month_key, row.price_eur]))
}

async function getVerifiedCanonicalPricesForInstrument(instrument_id: number): Promise<Map<string, {priceEur: number; source: HistoricalPriceSource}>> {
    const {data, error} = await supabase.from("instrument_historical_prices")
        .select("month_key, price_eur, source")
        .eq("instrument_id", instrument_id)
        .eq("status", "verified")
    if (error) console.error("investments.getVerifiedCanonicalPricesForInstrument: failed to read canonical prices", error)
    if (error || !Array.isArray(data)) return new Map()
    return new Map((data as unknown as {month_key: string; price_eur: number; source?: HistoricalPriceSource}[])
        .map((row) => [row.month_key, {priceEur: row.price_eur, source: row.source ?? "community"}]))
}

/**
 * Cross-user query (cron only, service-role client) of every instrument with a
 * community price verified since `since` — used by send-reminders to figure out
 * which holders should hear about it, via getOwnedInstrumentIds per candidate,
 * without a per-user round trip through this table.
 */
async function getRecentlyVerifiedCommunityPrices(since: Date): Promise<number[]> {
    const {data, error} = await supabase.from("instrument_historical_prices")
        .select("instrument_id")
        .eq("status", "verified")
        .eq("source", "community")
        .gte("verified_at", since.toISOString())
    if (error) console.error("investments.getRecentlyVerifiedCommunityPrices: failed to read recent verifications", error)
    if (error || !data) return []
    return Array.from(new Set((data as unknown as {instrument_id: number}[]).map((row) => row.instrument_id)))
}

export default {
    INVESTMENT_KINDS,
    INVESTMENT_ASSET_KEYS,
    INVESTMENT_POSITION_TYPES,
    INVESTMENT_SEARCH_SOURCES,
    searchInstruments,
    searchInstrumentsByIsins,
    upsertInstrument,
    createManualInstrument,
    getInstrumentById,
    getHoldingsByUserId,
    getOwnedInstrumentIds,
    refreshHoldingPrices,
    backfillHistoricalPrices,
    insertHolding,
    updateHolding,
    deleteHolding,
    deleteHoldingHistoryForInstrument,
    snapshotHoldingsForUser,
    getHoldingHistoryByUserId,
    upsertHoldingHistoryEntry,
    upsertHoldingHistoryBatch,
    getInvestmentSettings,
    saveInvestmentSettings,
    upsertDividend,
    upsertDividendsBatch,
    getDividendsSummaryByUserId,
    upsertTransaction,
    saveTransactionsBatch,
    getTransactionsByUserId,
    deleteTransactionsForInstrument,
    submitCommunityPrice,
    getPendingCommunityPrices,
    getMyCommunityPriceSubmissions,
    verifyCommunityPrice,
    getVerifiedCommunityPricesForInstrument,
    getRecentlyVerifiedCommunityPrices,
}
