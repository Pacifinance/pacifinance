import { describe, expect, it, vi, beforeEach } from "vitest"

import investments from "../src/db/models/investments"
import { mockSupabase } from "./setup"

vi.mock("../src/libs/providers/openfigiProvider", () => ({
    default: { searchOpenFigi: vi.fn(), searchOpenFigiByIsin: vi.fn(), searchOpenFigiByIsins: vi.fn(), isIsin: vi.fn() },
}))
vi.mock("../src/libs/providers/coingeckoProvider", () => ({
    default: { searchCoingecko: vi.fn() },
}))
vi.mock("../src/libs/providers/finnhubProvider", () => ({
    default: { searchFinnhub: vi.fn(), getQuote: vi.fn() },
}))
vi.mock("../src/cache/quoteCache", () => ({
    default: { getCachedQuote: vi.fn(), setCachedQuote: vi.fn() },
}))

import openfigiProvider from "../src/libs/providers/openfigiProvider"
import finnhubProvider from "../src/libs/providers/finnhubProvider"
import quoteCache from "../src/cache/quoteCache"

/** Minimal chainable Supabase query-builder stub: every filter method returns
 * itself, `.single()`/`.maybeSingle()` resolve to the configured result, and
 * the chain is itself awaitable (for calls with no terminal method). */
function makeChain(result: { data: unknown; error: unknown }) {
    const chain: Record<string, unknown> = {}
    for (const method of ["select", "eq", "in", "or", "is", "order", "limit", "insert", "update", "delete", "upsert"]) {
        chain[method] = vi.fn(() => chain)
    }
    chain.single = vi.fn(() => Promise.resolve(result))
    chain.maybeSingle = vi.fn(() => Promise.resolve(result))
    chain.then = (resolve: (value: typeof result) => unknown) => Promise.resolve(result).then(resolve)
    return chain
}

describe("investments model", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe("searchInstrumentsByIsins", () => {
        it("returns an empty map without querying Supabase when given no ISINs", async () => {
            const result = await investments.searchInstrumentsByIsins([], "user-1")
            expect(result).toEqual({})
            expect(mockSupabase.from).not.toHaveBeenCalled()
        })

        it("resolves everything from the local catalog in a single query", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: [
                    {id: 1, kind: "stock", symbol: "AAPL", isin: "US0378331005", exchange: null, name: "Apple Inc.", currency: "USD", country: null, sector: null, industry: null, figi: null, coingecko_id: null, provider: "openfigi", verified: true, active: true, metadata: {}, owner_user_id: null},
                ],
                error: null,
            }))

            const result = await investments.searchInstrumentsByIsins(["us0378331005"], "user-1")

            expect(result.US0378331005).toMatchObject({symbol: "AAPL", isin: "US0378331005"})
            expect(openfigiProvider.searchOpenFigiByIsins).not.toHaveBeenCalled()
        })

        it("dedupes and uppercases the requested ISINs before querying", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [], error: null}))
            vi.mocked(openfigiProvider.searchOpenFigiByIsins).mockResolvedValue({})

            await investments.searchInstrumentsByIsins(["us0378331005", "US0378331005"], "user-1")

            expect(openfigiProvider.searchOpenFigiByIsins).toHaveBeenCalledWith(["US0378331005"])
        })

        it("leaves an ISIN unresolved (null) when neither the local catalog nor OpenFIGI have it", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [], error: null}))
            vi.mocked(openfigiProvider.searchOpenFigiByIsins).mockResolvedValue({US0378331005: []})

            const result = await investments.searchInstrumentsByIsins(["US0378331005"], "user-1")

            expect(result).toEqual({US0378331005: null})
        })
    })

    describe("searchInstruments", () => {
        it("returns the local exact symbol match without calling the provider", async () => {
            vi.mocked(openfigiProvider.isIsin).mockReturnValue(false)
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: [
                    {id: 1, kind: "stock", symbol: "AAPL", isin: "US0378331005", exchange: "US", name: "Apple Inc", currency: null, country: null, sector: null, industry: null, figi: "BBG000B9XRY4", coingecko_id: null, provider: "openfigi", verified: true, active: true, metadata: {}, owner_user_id: null},
                ],
                error: null,
            }))

            const result = await investments.searchInstruments("AAPL", "user-1", "stock", 20, "figi")

            expect(result).toHaveLength(1)
            expect(result[0]).toMatchObject({symbol: "AAPL"})
            expect(openfigiProvider.searchOpenFigi).not.toHaveBeenCalled()
        })

        it("still consults the provider when there's no exact symbol match and too few fuzzy results", async () => {
            vi.mocked(openfigiProvider.isIsin).mockReturnValue(false)
            // Only a loose, non-exact fuzzy hit locally — not an exact symbol match,
            // and well under MIN_LOCAL_RESULTS_BEFORE_PROVIDER, so the provider must
            // still be consulted. (candidates=[] short-circuits before any re-query.)
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: [
                    {id: 2, kind: "stock", symbol: "AAPLX", isin: null, exchange: "US", name: "Some Apple-adjacent fund", currency: null, country: null, sector: null, industry: null, figi: null, coingecko_id: null, provider: "openfigi", verified: true, active: true, metadata: {}, owner_user_id: null},
                ],
                error: null,
            }))
            vi.mocked(finnhubProvider.searchFinnhub).mockResolvedValue([])
            vi.mocked(openfigiProvider.searchOpenFigi).mockResolvedValue([])

            await investments.searchInstruments("AAPL", "user-1", "stock", 20, "figi")

            expect(finnhubProvider.searchFinnhub).toHaveBeenCalledWith("AAPL", "stock")
            expect(openfigiProvider.searchOpenFigi).toHaveBeenCalledWith("AAPL")
        })

        it("prefers Finnhub over OpenFIGI for free-text queries and skips OpenFIGI when Finnhub already has results", async () => {
            vi.mocked(openfigiProvider.isIsin).mockReturnValue(false)
            // Catch-all for every Supabase round-trip in this run (local search,
            // then upsertInstrument's existing-row lookup + insert) - the exact
            // count isn't the point of this test, only the provider ordering is.
            mockSupabase.from.mockReturnValue(makeChain({data: [], error: null}))
            vi.mocked(finnhubProvider.searchFinnhub).mockResolvedValue([
                {kind: "stock", symbol: "AAPL", exchange: null, name: "Apple Inc", currency: null, country: null, figi: null, isin: null, coingeckoId: null, provider: "finnhub", metadata: {}},
            ])

            await investments.searchInstruments("AAPL", "user-1", "stock", 20, "figi")

            expect(finnhubProvider.searchFinnhub).toHaveBeenCalledWith("AAPL", "stock")
            expect(openfigiProvider.searchOpenFigi).not.toHaveBeenCalled()
        })

        it("prefers OpenFIGI over Finnhub for ISIN queries and skips Finnhub when OpenFIGI already has results", async () => {
            vi.mocked(openfigiProvider.isIsin).mockReturnValue(true)
            mockSupabase.from.mockReturnValue(makeChain({data: [], error: null}))
            vi.mocked(openfigiProvider.searchOpenFigiByIsin).mockResolvedValue([
                {kind: "stock", symbol: "AAPL", exchange: null, name: "Apple Inc", currency: null, country: null, figi: "BBG000B9XRY4", isin: "US0378331005", coingeckoId: null, provider: "openfigi", metadata: {}},
            ])

            await investments.searchInstruments("US0378331005", "user-1", "stock", 20, "figi")

            expect(openfigiProvider.searchOpenFigiByIsin).toHaveBeenCalledWith("US0378331005")
            expect(finnhubProvider.searchFinnhub).not.toHaveBeenCalled()
        })

        it("falls back to Finnhub when OpenFIGI has nothing for an ISIN query", async () => {
            vi.mocked(openfigiProvider.isIsin).mockReturnValue(true)
            mockSupabase.from.mockReturnValue(makeChain({data: [], error: null}))
            vi.mocked(openfigiProvider.searchOpenFigiByIsin).mockResolvedValue([])
            vi.mocked(finnhubProvider.searchFinnhub).mockResolvedValue([
                {kind: "stock", symbol: "AAPL", exchange: null, name: "Apple Inc", currency: null, country: null, figi: null, isin: null, coingeckoId: null, provider: "finnhub", metadata: {}},
            ])

            await investments.searchInstruments("US0378331005", "user-1", "stock", 20, "figi")

            expect(openfigiProvider.searchOpenFigiByIsin).toHaveBeenCalledWith("US0378331005")
            expect(finnhubProvider.searchFinnhub).toHaveBeenCalledWith("US0378331005", "stock")
        })
    })

    describe("createManualInstrument", () => {
        it("inserts and returns the new private instrument", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {id: 5, kind: "stock", symbol: "MYSTOCK", exchange: null, name: "My Stock", currency: "EUR", country: null, sector: null, industry: null, figi: null, isin: null, coingecko_id: null, provider: "manual", verified: false, active: true, metadata: {}, owner_user_id: "user-1"},
                error: null,
            }))

            const result = await investments.createManualInstrument("user-1", {kind: "stock", symbol: "MYSTOCK", name: "My Stock", currency: "EUR"})

            expect(result).toMatchObject({symbol: "MYSTOCK", provider: "manual", verified: false})
        })

        it("returns the existing conflicting row instead of failing on a unique violation", async () => {
            // First call: the insert, rejected by a unique constraint (e.g. the DB
            // is still enforcing the old table-wide index instead of the
            // owner_user_id-scoped partial one).
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: {code: "23505", message: "duplicate key"}}))
            // Second call: the conflict-recovery lookup by kind+symbol+exchange.
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {id: 1, kind: "stock", symbol: "AAPL", exchange: null, name: "Apple Inc.", currency: "USD", country: null, sector: null, industry: null, figi: "BBG000B9XRY4", isin: "US0378331005", coingecko_id: null, provider: "openfigi", verified: true, active: true, metadata: {}, owner_user_id: null},
                error: null,
            }))

            const result = await investments.createManualInstrument("user-1", {kind: "stock", symbol: "AAPL", name: "Apple", currency: "USD"})

            expect(result).toMatchObject({symbol: "AAPL", verified: true, provider: "openfigi"})
        })

        it("returns null when the insert fails for a reason other than a unique violation", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: {code: "500", message: "boom"}}))

            const result = await investments.createManualInstrument("user-1", {kind: "stock", symbol: "MYSTOCK", name: "My Stock", currency: "EUR"})

            expect(result).toBeNull()
        })
    })

    describe("insertHolding", () => {
        const holdingInput = {
            instrumentId: 42, assetKey: "stocks" as const, positionType: "single" as const,
            quantity: 1, averagePrice: 100, currentValue: null, investedAmount: 100, currency: "EUR", notes: "",
            importSource: "trading212",
        }

        it("inserts and returns a new holding", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {id: 10, user_id: "user-1", instrument_id: 42, asset_key: "stocks", position_type: "single", quantity: 1, average_price: 100, current_value: null, invested_amount: 100, currency: "EUR", notes: "", updated_at: "2026-01-01", import_source: "trading212", instrument: null},
                error: null,
            }))

            const result = await investments.insertHolding("user-1", holdingInput)

            expect(result).toMatchObject({status: "ok", holding: {id: 10, quantity: 1}})
        })

        it("auto-replaces the existing holding when re-importing the same source (e.g. a fuller CSV export)", async () => {
            // First call: the insert, rejected by the unique(user_id, instrument_id) constraint.
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: {code: "23505", message: "duplicate key"}}))
            // Second call: looks up the conflicting holding — same import_source as the new save.
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {id: 7, user_id: "user-1", instrument_id: 42, asset_key: "stocks", position_type: "single", quantity: 1, average_price: 100, current_value: null, invested_amount: 100, currency: "EUR", notes: "", updated_at: "2026-01-01", import_source: "trading212", instrument: null},
                error: null,
            }))
            // Third call: the update that refreshes it with the new totals.
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {id: 7, user_id: "user-1", instrument_id: 42, asset_key: "stocks", position_type: "single", quantity: 2, average_price: 110, current_value: null, invested_amount: 220, currency: "EUR", notes: "", updated_at: "2026-01-01", import_source: "trading212", instrument: null},
                error: null,
            }))

            const result = await investments.insertHolding("user-1", {...holdingInput, quantity: 2, investedAmount: 220})

            expect(result).toMatchObject({status: "ok", holding: {id: 7, quantity: 2, investedAmount: 220}})
        })

        it("auto-replaces instead of conflicting when the existing holding has no tracked source (manual entry, or imported before import_source existed)", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: {code: "23505", message: "duplicate key"}}))
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {id: 7, user_id: "user-1", instrument_id: 42, asset_key: "stocks", position_type: "single", quantity: 1, average_price: 100, current_value: null, invested_amount: 100, currency: "EUR", notes: "", updated_at: "2026-01-01", import_source: null, instrument: null},
                error: null,
            }))
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {id: 7, user_id: "user-1", instrument_id: 42, asset_key: "stocks", position_type: "single", quantity: 2, average_price: 110, current_value: null, invested_amount: 220, currency: "EUR", notes: "", updated_at: "2026-01-01", import_source: "trading212", instrument: null},
                error: null,
            }))

            const result = await investments.insertHolding("user-1", {...holdingInput, quantity: 2, investedAmount: 220})

            expect(result).toMatchObject({status: "ok", holding: {id: 7, quantity: 2, investedAmount: 220}})
        })

        it("returns a conflict instead of guessing when the existing holding is from a different import source", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: {code: "23505", message: "duplicate key"}}))
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {id: 7, user_id: "user-1", instrument_id: 42, asset_key: "stocks", position_type: "single", quantity: 5, average_price: 90, current_value: null, invested_amount: 450, currency: "EUR", notes: "", updated_at: "2026-01-01", import_source: "degiro", instrument: null},
                error: null,
            }))

            const result = await investments.insertHolding("user-1", holdingInput)

            expect(result).toMatchObject({status: "conflict", existing: {id: 7, importSource: "degiro"}})
        })

        it("sums quantity/invested amount when the user resolves a conflict with mergeStrategy 'add'", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: {code: "23505", message: "duplicate key"}}))
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {id: 7, user_id: "user-1", instrument_id: 42, asset_key: "stocks", position_type: "single", quantity: 5, average_price: 90, current_value: null, invested_amount: 450, currency: "EUR", notes: "", updated_at: "2026-01-01", import_source: "degiro", instrument: null},
                error: null,
            }))
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {id: 7, user_id: "user-1", instrument_id: 42, asset_key: "stocks", position_type: "single", quantity: 6, average_price: 91.67, current_value: null, invested_amount: 550, currency: "EUR", notes: "", updated_at: "2026-01-01", import_source: "mixed", instrument: null},
                error: null,
            }))

            const result = await investments.insertHolding("user-1", {...holdingInput, quantity: 1, averagePrice: 100, investedAmount: 100}, "add")

            expect(result).toMatchObject({status: "ok", holding: {id: 7, quantity: 6, investedAmount: 550}})
        })

        it("overwrites the existing holding when the user resolves a conflict with mergeStrategy 'replace'", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: {code: "23505", message: "duplicate key"}}))
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {id: 7, user_id: "user-1", instrument_id: 42, asset_key: "stocks", position_type: "single", quantity: 5, average_price: 90, current_value: null, invested_amount: 450, currency: "EUR", notes: "", updated_at: "2026-01-01", import_source: "degiro", instrument: null},
                error: null,
            }))
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {id: 7, user_id: "user-1", instrument_id: 42, asset_key: "stocks", position_type: "single", quantity: 1, average_price: 100, current_value: null, invested_amount: 100, currency: "EUR", notes: "", updated_at: "2026-01-01", import_source: "trading212", instrument: null},
                error: null,
            }))

            const result = await investments.insertHolding("user-1", holdingInput, "replace")

            expect(result).toMatchObject({status: "ok", holding: {id: 7, quantity: 1, investedAmount: 100}})
        })

        it("returns null when the insert fails for a reason other than a unique violation", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: {code: "500", message: "boom"}}))

            const result = await investments.insertHolding("user-1", holdingInput)

            expect(result).toBeNull()
        })
    })

    describe("upsertHoldingHistoryEntry", () => {
        it("reports not_found without upserting when the holding doesn't exist for this user", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: null}))

            const result = await investments.upsertHoldingHistoryEntry("user-1", 999, new Date("2026-01-15"), {currentValue: null, investedAmount: 50})

            expect(result).toEqual({status: "not_found"})
        })

        it("reports a db_error (distinct from not_found) when the upsert itself fails, e.g. a missing unique constraint", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {id: 16, user_id: "user-1", instrument_id: 1, asset_key: "stocks", position_type: "single", quantity: 1, average_price: 100, current_value: null, invested_amount: 100, currency: "EUR", notes: "", updated_at: "2026-01-01", import_source: "trading212", instrument: {id: 1, kind: "stock", symbol: "AAPL", exchange: null, name: "Apple Inc.", currency: "USD", country: null, sector: null, industry: null, figi: null, isin: null, coingecko_id: null, provider: "openfigi", verified: true, active: true, metadata: {}, owner_user_id: null}},
                error: null,
            }))
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: null,
                error: {code: "42P10", message: "there is no unique or exclusion constraint matching the ON CONFLICT specification"},
            }))

            const result = await investments.upsertHoldingHistoryEntry("user-1", 16, new Date("2026-07-01"), {currentValue: null, investedAmount: 12.44})

            expect(result).toEqual({status: "db_error", message: "there is no unique or exclusion constraint matching the ON CONFLICT specification"})
        })
    })

    describe("refreshHoldingPrices", () => {
        const stockHoldingRow = {
            id: 16, user_id: "user-1", instrument_id: 1, asset_key: "stocks", position_type: "single",
            quantity: 10, average_price: 100, current_value: null, invested_amount: 1000, currency: "EUR",
            notes: "", updated_at: "2026-01-01", import_source: "trading212",
            instrument: {id: 1, kind: "stock", symbol: "AAPL", exchange: null, name: "Apple Inc.", currency: "USD", country: null, sector: null, industry: null, figi: null, isin: "US0378331005", coingecko_id: null, provider: "openfigi", verified: true, active: true, metadata: {}, owner_user_id: null},
        }

        it("converts a USD quote to EUR and updates current_value, caching the quote for other users, and backfills this month's history", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [stockHoldingRow], error: null}))
            vi.mocked(quoteCache.getCachedQuote).mockResolvedValue(null)
            vi.mocked(finnhubProvider.getQuote).mockResolvedValue({price: 200})
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {...stockHoldingRow, current_value: 1739.13},
                error: null,
            }))
            // upsertHoldingHistoryEntry's own holding lookup + history upsert.
            mockSupabase.from.mockReturnValueOnce(makeChain({data: stockHoldingRow, error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {id: 50, holding_id: 16, instrument_id: 1, asset_key: "stocks", symbol: "AAPL", name: "Apple Inc.", quantity: 10, average_price: 100, current_value: 1739.13, invested_amount: 1000, currency: "EUR", user_date: "2026-07-01", recorded_at: "2026-07-01"},
                error: null,
            }))

            const result = await investments.refreshHoldingPrices("user-1", {EUR: 1, USD: 1.15})

            expect(finnhubProvider.getQuote).toHaveBeenCalledWith("AAPL")
            expect(quoteCache.setCachedQuote).toHaveBeenCalledWith("AAPL", {price: 200})
            expect(result).toHaveLength(1)
            expect(result[0]).toMatchObject({id: 16, currentValue: 1739.13})
        })

        it("uses an already-cached quote instead of calling Finnhub again", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [stockHoldingRow], error: null}))
            vi.mocked(quoteCache.getCachedQuote).mockResolvedValue({price: 200})
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {...stockHoldingRow, current_value: 1739.13},
                error: null,
            }))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: stockHoldingRow, error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {id: 50, holding_id: 16, instrument_id: 1, asset_key: "stocks", symbol: "AAPL", name: "Apple Inc.", quantity: 10, average_price: 100, current_value: 1739.13, invested_amount: 1000, currency: "EUR", user_date: "2026-07-01", recorded_at: "2026-07-01"},
                error: null,
            }))

            const result = await investments.refreshHoldingPrices("user-1", {EUR: 1, USD: 1.15})

            expect(quoteCache.getCachedQuote).toHaveBeenCalledWith("AAPL")
            expect(finnhubProvider.getQuote).not.toHaveBeenCalled()
            expect(quoteCache.setCachedQuote).not.toHaveBeenCalled()
            expect(result[0]).toMatchObject({id: 16, currentValue: 1739.13})
        })

        it("skips holdings whose kind Finnhub doesn't cover (e.g. crypto)", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: [{...stockHoldingRow, asset_key: "crypto", instrument: {...stockHoldingRow.instrument, kind: "crypto", symbol: "BTC"}}],
                error: null,
            }))

            const result = await investments.refreshHoldingPrices("user-1", {EUR: 1, USD: 1.15})

            expect(finnhubProvider.getQuote).not.toHaveBeenCalled()
            expect(result).toEqual([])
        })

        it("skips a holding when Finnhub has no quote for its symbol", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [stockHoldingRow], error: null}))
            vi.mocked(quoteCache.getCachedQuote).mockResolvedValue(null)
            vi.mocked(finnhubProvider.getQuote).mockResolvedValue(null)

            const result = await investments.refreshHoldingPrices("user-1", {EUR: 1, USD: 1.15})

            expect(result).toEqual([])
        })

        it("skips a holding when there's no exchange rate for its trading currency", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [stockHoldingRow], error: null}))
            vi.mocked(quoteCache.getCachedQuote).mockResolvedValue(null)
            vi.mocked(finnhubProvider.getQuote).mockResolvedValue({price: 200})

            const result = await investments.refreshHoldingPrices("user-1", {EUR: 1})

            expect(result).toEqual([])
        })
    })

    describe("getInvestmentSettings", () => {
        it("returns null monthlyTarget when the user has never set one", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: null}))

            const result = await investments.getInvestmentSettings("user-1")

            expect(result).toEqual({monthlyTarget: null})
        })

        it("returns the stored monthlyTarget", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: {monthly_target: 300}, error: null}))

            const result = await investments.getInvestmentSettings("user-1")

            expect(result).toEqual({monthlyTarget: 300})
        })
    })

    describe("saveInvestmentSettings", () => {
        it("upserts and returns the saved monthlyTarget", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: {monthly_target: 250}, error: null}))

            const result = await investments.saveInvestmentSettings("user-1", 250)

            expect(result).toEqual({monthlyTarget: 250})
        })

        it("returns null when the upsert fails", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: {code: "500", message: "boom"}}))

            const result = await investments.saveInvestmentSettings("user-1", 250)

            expect(result).toBeNull()
        })
    })
})
