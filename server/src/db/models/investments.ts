import supabase from "../supabase"

export const INVESTMENT_KINDS = ["stock", "etf", "crypto", "bond", "fund", "commodity", "other"] as const
export const INVESTMENT_ASSET_KEYS = ["stocks", "etf", "bitcoin", "crypto", "bonds", "funds", "gold"] as const
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
}

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
    }
}

/**
 * Searches canonical investment instruments already known by the platform.
 * Provider calls should be layered above this and persisted here after verification.
 */
async function searchInstruments(query: string, kind?: InvestmentKind, limit = 20) {
    const cleanQuery = query.replace(/[%*,]/g, "").trim()
    if (cleanQuery.length < 2) return []

    let request = supabase.from("investment_instruments")
        .select(INSTRUMENT_SELECT)
        .eq("active", true)
        .or(`symbol.ilike.%${cleanQuery}%,name.ilike.%${cleanQuery}%,isin.ilike.%${cleanQuery}%,coingecko_id.ilike.%${cleanQuery}%`)
        .order("verified", {ascending: false})
        .order("symbol", {ascending: true})
        .limit(limit)

    if (kind) request = request.eq("kind", kind)

    const {data, error} = await request
    if (error) console.error("investments.searchInstruments: failed to search instruments", error)
    if (error || !data) return []
    return (data as unknown as InstrumentRow[]).map(toInstrument)
}

/**
 * Resolves a canonical instrument by id.
 */
async function getInstrumentById(id: number) {
    const {data, error} = await supabase.from("investment_instruments")
        .select(INSTRUMENT_SELECT)
        .eq("id", id)
        .eq("active", true)
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
 * Creates a detailed user holding linked to a verified platform instrument.
 */
async function insertHolding(user_id: string, input: HoldingInput) {
    const {data, error} = await supabase.from("user_investment_holdings")
        .insert(toHoldingPayload(user_id, input))
        .select(HOLDING_SELECT)
        .single()
    if (error) console.error("investments.insertHolding: failed to insert holding", error)
    if (error || !data) return null
    return toHolding(data as unknown as HoldingRow)
}

/**
 * Updates a detailed user holding, scoped to the owner.
 */
async function updateHolding(user_id: string, holding_id: number, input: HoldingInput) {
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

export default {
    INVESTMENT_KINDS,
    INVESTMENT_ASSET_KEYS,
    INVESTMENT_POSITION_TYPES,
    searchInstruments,
    getInstrumentById,
    getHoldingsByUserId,
    insertHolding,
    updateHolding,
    deleteHolding,
}
