import supabase from "../supabase"
import openfigiProvider from "../../libs/providers/openfigiProvider"
import coingeckoProvider from "../../libs/providers/coingeckoProvider"
import finnhubProvider from "../../libs/providers/finnhubProvider"
import { ExtDate, toDateOnly } from "../../libs/datelib"
import { roundCurrency } from "../../libs/money"
import quoteCache from "../../cache/quoteCache"

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
async function getHoldingsByUserId(user_id: string) {
    const {data, error} = await supabase.from("user_investment_holdings")
        .select(HOLDING_SELECT)
        .eq("user_id", user_id)
        .order("updated_at", {ascending: false})
    if (error) console.error("investments.getHoldingsByUserId: failed to read holdings", error)
    if (error || !data) return []
    return (data as unknown as HoldingRow[]).map(toHolding)
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
 */
async function refreshHoldingPrices(user_id: string, eurRates: Record<string, number>) {
    const holdings = await getHoldingsByUserId(user_id)
    const refreshable = holdings.filter((h) =>
        h.instrument !== null && (h.instrument.kind === "stock" || h.instrument.kind === "etf") && h.quantity != null)

    const updated: Holding[] = []
    for (const holding of refreshable) {
        const instrument = holding.instrument as NonNullable<typeof holding.instrument>

        let quote = await quoteCache.getCachedQuote(instrument.symbol)
        if (!quote) {
            quote = await finnhubProvider.getQuote(instrument.symbol)
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
        if (result) updated.push(result)
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
    const {error, count} = await supabase.from("user_investment_holdings")
        .delete({count: "exact"})
        .eq("user_id", user_id)
        .eq("id", holding_id)
    if (error) console.error("investments.deleteHolding: failed to delete holding", error)
    if (error) return null
    return {deletedCount: count ?? 0}
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
    const holdings = await getHoldingsByUserId(user_id)
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
}

const HOLDING_HISTORY_SELECT = [
    "id", "holding_id", "instrument_id", "asset_key", "symbol", "name",
    "quantity", "average_price", "current_value", "invested_amount", "currency",
    "user_date", "recorded_at",
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

export type HoldingHistoryEntryInput = { currentValue: number | null, investedAmount: number | null }

// "not_found": the holding truly doesn't exist / isn't owned by this user - a
// client-side problem (stale id, wrong account). "db_error": the query itself
// failed for a reason that has nothing to do with which holding was asked for
// (e.g. a schema issue - see the onConflict clause below, which requires a
// unique index on (user_id, holding_id, user_date) that a past migration adds
// SEPARATELY from the table's own creation; if that migration was never run
// against a given database, every upsert here fails with Postgres error
// 42P10). Callers must surface these two very differently - "not_found" is
// nothing to worry about, "db_error" means something is actually broken.
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
        quantity: holding.quantity,
        average_price: holding.averagePrice,
        current_value: input.currentValue,
        invested_amount: input.investedAmount,
        currency: holding.currency,
        user_date: toDateOnly(user_date),
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
    refreshHoldingPrices,
    insertHolding,
    updateHolding,
    deleteHolding,
    snapshotHoldingsForUser,
    getHoldingHistoryByUserId,
    upsertHoldingHistoryEntry,
}
