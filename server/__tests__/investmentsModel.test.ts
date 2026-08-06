import { describe, expect, it, vi, beforeEach } from "vitest"

import investments from "../src/db/models/investments"
import { mockSupabase } from "./setup"

vi.mock("../src/libs/providers/openfigiProvider", () => ({
    default: { searchOpenFigi: vi.fn(), searchOpenFigiByIsin: vi.fn(), searchOpenFigiByIsins: vi.fn(), isIsin: vi.fn() },
}))
vi.mock("../src/libs/providers/coingeckoProvider", () => ({
    default: { searchCoingecko: vi.fn(), getHistoricalMonthlyPrices: vi.fn() },
}))
vi.mock("../src/libs/providers/finnhubProvider", () => ({
    default: { searchFinnhub: vi.fn(), getQuote: vi.fn(), getHistoricalMonthlyPrices: vi.fn(), resolveInternationalSymbol: vi.fn() },
}))
vi.mock("../src/cache/quoteCache", () => ({
    default: { getCachedQuote: vi.fn(), setCachedQuote: vi.fn() },
}))
vi.mock("../src/cache/symbolCache", () => ({
    default: { getCachedSymbol: vi.fn(), setCachedSymbol: vi.fn() },
}))

import openfigiProvider from "../src/libs/providers/openfigiProvider"
import finnhubProvider from "../src/libs/providers/finnhubProvider"
import coingeckoProvider from "../src/libs/providers/coingeckoProvider"
import quoteCache from "../src/cache/quoteCache"
import symbolCache from "../src/cache/symbolCache"

/** Minimal chainable Supabase query-builder stub: every filter method returns
 * itself, `.single()`/`.maybeSingle()` resolve to the configured result, and
 * the chain is itself awaitable (for calls with no terminal method). */
function makeChain(result: { data: unknown; error: unknown }) {
    const chain: Record<string, unknown> = {}
    for (const method of ["select", "eq", "neq", "in", "or", "is", "gte", "lte", "order", "limit", "insert", "update", "delete", "upsert"]) {
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

    describe("getHoldingsByUserId", () => {
        const holdingRow = {
            id: 10, user_id: "user-1", instrument_id: 42, asset_key: "etf", position_type: "single",
            quantity: 63.001192, average_price: 98.17, current_value: 6185.07, invested_amount: 6185.07,
            currency: "EUR", notes: "", updated_at: "2026-07-31", import_source: null,
            instrument: {id: 42, kind: "etf", symbol: "IWDA", isin: "IE00B4L5Y983", exchange: "AMS", name: "IWDA", currency: "EUR", country: null, sector: null, industry: null, figi: null, coingecko_id: null, provider: "openfigi", verified: true, active: true, metadata: {}, owner_user_id: null},
        }

        it("uses a verified current-month price for the live holding value", async () => {
            mockSupabase.from
                .mockReturnValueOnce(makeChain({data: [holdingRow], error: null}))
                .mockReturnValueOnce(makeChain({data: [{instrument_id: 42, price_eur: 124.62}], error: null}))

            const result = await investments.getHoldingsByUserId("user-1")

            expect(result[0].currentValue).toBe(7851.2)
        })

        it("keeps the persisted fallback when no verified current-month price exists", async () => {
            mockSupabase.from
                .mockReturnValueOnce(makeChain({data: [holdingRow], error: null}))
                .mockReturnValueOnce(makeChain({data: [], error: null}))

            const result = await investments.getHoldingsByUserId("user-1")

            expect(result[0].currentValue).toBe(6185.07)
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

        const holdingRow = {
            id: 16, user_id: "user-1", instrument_id: 1, asset_key: "stocks", position_type: "single",
            quantity: 15, average_price: 100, current_value: null, invested_amount: 1500, currency: "EUR",
            notes: "", updated_at: "2026-01-01", import_source: "trading212",
            instrument: {id: 1, kind: "stock", symbol: "AAPL", exchange: null, name: "Apple Inc.", currency: "USD", country: null, sector: null, industry: null, figi: null, isin: null, coingecko_id: null, provider: "openfigi", verified: true, active: true, metadata: {}, owner_user_id: null},
        }

        it("uses the given quantity for a past month, instead of denormalizing today's live quantity", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: holdingRow, error: null}))
            const upsertChain = makeChain({data: {...holdingRow, quantity: 10, user_date: "2024-01-01"}, error: null})
            mockSupabase.from.mockReturnValueOnce(upsertChain)

            await investments.upsertHoldingHistoryEntry("user-1", 16, new Date("2024-01-15"), {currentValue: null, investedAmount: 1000, quantity: 10})

            expect(upsertChain.upsert).toHaveBeenCalledWith(
                expect.objectContaining({quantity: 10}),
                expect.anything(),
            )
        })

        it("falls back to the live holding's quantity when none is given (e.g. a current-month price refresh)", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: holdingRow, error: null}))
            const upsertChain = makeChain({data: holdingRow, error: null})
            mockSupabase.from.mockReturnValueOnce(upsertChain)

            await investments.upsertHoldingHistoryEntry("user-1", 16, new Date("2026-07-01"), {currentValue: 2000, investedAmount: 1500})

            expect(upsertChain.upsert).toHaveBeenCalledWith(
                expect.objectContaining({quantity: 15, price_source: "manual"}),
                expect.anything(),
            )
        })

        it("records provider/community provenance for a verified historical price", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: holdingRow, error: null}))
            const upsertChain = makeChain({data: {...holdingRow, price_source: "community"}, error: null})
            mockSupabase.from.mockReturnValueOnce(upsertChain)

            await investments.upsertHoldingHistoryEntry("user-1", 16, new Date("2024-01-01"), {
                currentValue: 1400, investedAmount: 1000, priceSource: "community",
            })

            expect(upsertChain.upsert).toHaveBeenCalledWith(
                expect.objectContaining({price_source: "community"}),
                expect.anything(),
            )
        })
    })

    describe("upsertHoldingHistoryBatch", () => {
        it("returns immediately without querying Supabase when given no entries", async () => {
            const result = await investments.upsertHoldingHistoryBatch("user-1", [])

            expect(result).toEqual({savedCount: 0, errors: []})
            expect(mockSupabase.from).not.toHaveBeenCalled()
        })

        const holdingRow = {
            id: 16, user_id: "user-1", instrument_id: 1, asset_key: "stocks", position_type: "single",
            quantity: 15, average_price: 100, current_value: null, invested_amount: 1500, currency: "EUR",
            notes: "", updated_at: "2026-01-01", import_source: "trading212",
            instrument: {id: 1, kind: "stock", symbol: "AAPL", exchange: null, name: "Apple Inc.", currency: "USD", country: null, sector: null, industry: null, figi: null, isin: null, coingecko_id: null, provider: "openfigi", verified: true, active: true, metadata: {}, owner_user_id: null},
        }

        it("fetches every referenced holding in one query, then upserts all valid rows in one call", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [holdingRow], error: null}))
            const upsertChain = makeChain({data: null, error: null})
            mockSupabase.from.mockReturnValueOnce(upsertChain)

            const result = await investments.upsertHoldingHistoryBatch("user-1", [
                {holdingId: 16, userDate: new Date("2026-01-01"), currentValue: null, investedAmount: 1000, quantity: 10},
                {holdingId: 16, userDate: new Date("2026-02-01"), currentValue: null, investedAmount: 1200, quantity: 12},
            ])

            expect(mockSupabase.from).toHaveBeenCalledTimes(2)
            expect(upsertChain.upsert).toHaveBeenCalledWith(
                [
                    expect.objectContaining({holding_id: 16, quantity: 10, invested_amount: 1000}),
                    expect.objectContaining({holding_id: 16, quantity: 12, invested_amount: 1200, price_source: "imported"}),
                ],
                {onConflict: "user_id,holding_id,user_date"},
            )
            expect(result).toEqual({savedCount: 2, errors: []})
        })

        it("reports an error for an entry whose holding isn't found or isn't owned by this user, without dropping the other valid rows", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [holdingRow], error: null}))
            const upsertChain = makeChain({data: null, error: null})
            mockSupabase.from.mockReturnValueOnce(upsertChain)

            const result = await investments.upsertHoldingHistoryBatch("user-1", [
                {holdingId: 16, userDate: new Date("2026-01-01"), currentValue: null, investedAmount: 1000},
                {holdingId: 999, userDate: new Date("2026-01-01"), currentValue: null, investedAmount: 500},
            ])

            expect(result.savedCount).toBe(1)
            expect(result.errors).toEqual(["holding 999 not found, or not owned by this user"])
            expect(upsertChain.upsert).toHaveBeenCalledWith(
                [expect.objectContaining({holding_id: 16})],
                expect.anything(),
            )
        })

        it("returns an error and saves nothing if the holdings lookup itself fails", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: {code: "500", message: "boom"}}))

            const result = await investments.upsertHoldingHistoryBatch("user-1", [
                {holdingId: 16, userDate: new Date("2026-01-01"), currentValue: null, investedAmount: 1000},
            ])

            expect(result).toEqual({savedCount: 0, errors: ["boom"]})
            expect(mockSupabase.from).toHaveBeenCalledTimes(1)
        })

        it("returns an error and no saved rows when the bulk upsert itself fails", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [holdingRow], error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: {code: "42P10", message: "no unique or exclusion constraint"}}))

            const result = await investments.upsertHoldingHistoryBatch("user-1", [
                {holdingId: 16, userDate: new Date("2026-01-01"), currentValue: null, investedAmount: 1000},
            ])

            expect(result).toEqual({savedCount: 0, errors: ["no unique or exclusion constraint"]})
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

        it("falls back to Finnhub's exchange-suffixed symbol when the bare ticker has no quote (e.g. a European ETF)", async () => {
            const euHolding = {
                ...stockHoldingRow,
                instrument: {...stockHoldingRow.instrument, kind: "etf", symbol: "IWDA", currency: "EUR", isin: "IE00B4L5Y983"},
            }
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [euHolding], error: null}))
            vi.mocked(quoteCache.getCachedQuote).mockResolvedValue(null)
            vi.mocked(finnhubProvider.getQuote)
                .mockResolvedValueOnce(null) // bare symbol fails
                .mockResolvedValueOnce({price: 90}) // resolved exchange-suffixed symbol succeeds
            vi.mocked(symbolCache.getCachedSymbol).mockResolvedValue(undefined) // not cached yet
            vi.mocked(finnhubProvider.resolveInternationalSymbol).mockResolvedValue("IWDA.AS")
            mockSupabase.from.mockReturnValueOnce(makeChain({data: {...euHolding, current_value: 900}, error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: euHolding, error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {id: 50, holding_id: 16, instrument_id: 1, asset_key: "etf", symbol: "IWDA", name: "Apple Inc.", quantity: 10, average_price: 100, current_value: 900, invested_amount: 1000, currency: "EUR", user_date: "2026-07-01", recorded_at: "2026-07-01"},
                error: null,
            }))

            const result = await investments.refreshHoldingPrices("user-1", {EUR: 1})

            expect(finnhubProvider.getQuote).toHaveBeenNthCalledWith(1, "IWDA")
            expect(finnhubProvider.resolveInternationalSymbol).toHaveBeenCalledWith("IE00B4L5Y983")
            expect(finnhubProvider.getQuote).toHaveBeenNthCalledWith(2, "IWDA.AS")
            expect(symbolCache.setCachedSymbol).toHaveBeenCalledWith("IE00B4L5Y983", "IWDA.AS")
            expect(quoteCache.setCachedQuote).toHaveBeenCalledWith("IWDA", {price: 90})
            expect(result[0]).toMatchObject({currentValue: 900})
        })

        it("reuses a cached international symbol resolution without searching Finnhub again", async () => {
            const euHolding = {
                ...stockHoldingRow,
                instrument: {...stockHoldingRow.instrument, kind: "etf", symbol: "IWDA", currency: "EUR", isin: "IE00B4L5Y983"},
            }
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [euHolding], error: null}))
            vi.mocked(quoteCache.getCachedQuote).mockResolvedValue(null)
            vi.mocked(finnhubProvider.getQuote)
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({price: 90})
            vi.mocked(symbolCache.getCachedSymbol).mockResolvedValue("IWDA.AS") // already cached from a previous resolution
            mockSupabase.from.mockReturnValueOnce(makeChain({data: {...euHolding, current_value: 900}, error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: euHolding, error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {id: 50, holding_id: 16, instrument_id: 1, asset_key: "etf", symbol: "IWDA", name: "Apple Inc.", quantity: 10, average_price: 100, current_value: 900, invested_amount: 1000, currency: "EUR", user_date: "2026-07-01", recorded_at: "2026-07-01"},
                error: null,
            }))

            await investments.refreshHoldingPrices("user-1", {EUR: 1})

            expect(finnhubProvider.resolveInternationalSymbol).not.toHaveBeenCalled()
            expect(symbolCache.setCachedSymbol).not.toHaveBeenCalled()
            expect(finnhubProvider.getQuote).toHaveBeenNthCalledWith(2, "IWDA.AS")
        })

        it("gives up (and caches the negative result) when Finnhub has no international listing for the ISIN either", async () => {
            const euHolding = {
                ...stockHoldingRow,
                instrument: {...stockHoldingRow.instrument, kind: "etf", symbol: "IWDA", currency: "EUR", isin: "IE00B4L5Y983"},
            }
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [euHolding], error: null}))
            vi.mocked(quoteCache.getCachedQuote).mockResolvedValue(null)
            vi.mocked(finnhubProvider.getQuote).mockResolvedValue(null)
            vi.mocked(symbolCache.getCachedSymbol).mockResolvedValue(undefined)
            vi.mocked(finnhubProvider.resolveInternationalSymbol).mockResolvedValue(null)

            const result = await investments.refreshHoldingPrices("user-1", {EUR: 1})

            expect(symbolCache.setCachedSymbol).toHaveBeenCalledWith("IE00B4L5Y983", null)
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

    describe("backfillHistoricalPrices", () => {
        const holdingRow = {
            id: 16, user_id: "user-1", instrument_id: 1, asset_key: "stocks", position_type: "single",
            quantity: 15, average_price: 100, current_value: 2000, invested_amount: 1500, currency: "EUR",
            notes: "", updated_at: "2026-01-01", import_source: "trading212",
            instrument: {id: 1, kind: "stock", symbol: "AAPL", exchange: null, name: "Apple Inc.", currency: "USD", country: null, sector: null, industry: null, figi: null, isin: null, coingecko_id: null, provider: "openfigi", verified: true, active: true, metadata: {}, owner_user_id: null},
        }
        const gapRow = (overrides: Record<string, unknown>) => ({
            id: 1, holding_id: 16, instrument_id: 1, asset_key: "stocks", symbol: "AAPL", name: "Apple Inc.",
            average_price: 100, current_value: null, invested_amount: 1000, currency: "EUR",
            user_date: "2024-01-01", recorded_at: "2024-01-01", ...overrides,
        })

        it("fills current_value for gap months using the historical price times the quantity held that month", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [holdingRow], error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: [gapRow({quantity: 5, user_date: "2024-01-01"}), gapRow({id: 2, quantity: 10, user_date: "2024-02-01"})],
                error: null,
            }))
            vi.mocked(finnhubProvider.getHistoricalMonthlyPrices).mockResolvedValue(new Map([["2024-01", 100], ["2024-02", 110]]))
            // getVerifiedCommunityPricesForInstrument's query - no community prices for this instrument.
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [], error: null}))
            // upsertHoldingHistoryEntry's own holding lookup + upsert, once per gap month.
            mockSupabase.from.mockReturnValueOnce(makeChain({data: holdingRow, error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: {...gapRow({quantity: 5}), current_value: 500}, error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: holdingRow, error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: {...gapRow({quantity: 10}), current_value: 1100}, error: null}))

            const result = await investments.backfillHistoricalPrices("user-1", {EUR: 1, USD: 1.1})

            expect(finnhubProvider.getHistoricalMonthlyPrices).toHaveBeenCalledWith("AAPL", expect.any(Number), expect.any(Number))
            expect(result).toEqual([{holdingId: 16, monthsFilled: 2}])
        })

        it("skips an instrument the provider has no historical data for, without failing the whole backfill", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [holdingRow], error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [gapRow({quantity: 5})], error: null}))
            vi.mocked(finnhubProvider.getHistoricalMonthlyPrices).mockResolvedValue(null)
            // getVerifiedCommunityPricesForInstrument's query - no community fallback either, so the gap stays unfilled.
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [], error: null}))

            const result = await investments.backfillHistoricalPrices("user-1", {EUR: 1, USD: 1.1})

            expect(result).toEqual([])
        })

        it("retries with Finnhub's exchange-suffixed symbol when the bare ticker has no historical data (e.g. a European ETF)", async () => {
            const euHoldingRow = {
                ...holdingRow,
                instrument: {...holdingRow.instrument, kind: "etf", symbol: "IWDA", currency: "EUR", isin: "IE00B4L5Y983"},
            }
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [euHoldingRow], error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [gapRow({quantity: 5, user_date: "2024-01-01"})], error: null}))
            vi.mocked(finnhubProvider.getHistoricalMonthlyPrices)
                .mockResolvedValueOnce(null) // bare symbol fails
                .mockResolvedValueOnce(new Map([["2024-01", 90]])) // resolved exchange-suffixed symbol succeeds
            vi.mocked(symbolCache.getCachedSymbol).mockResolvedValue(undefined)
            vi.mocked(finnhubProvider.resolveInternationalSymbol).mockResolvedValue("IWDA.AS")
            // getVerifiedCommunityPricesForInstrument's query - not reached for this month since the fallback already filled it.
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [], error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: euHoldingRow, error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: {...gapRow({quantity: 5}), current_value: 450}, error: null}))

            const result = await investments.backfillHistoricalPrices("user-1", {EUR: 1})

            expect(finnhubProvider.getHistoricalMonthlyPrices).toHaveBeenNthCalledWith(1, "IWDA", expect.any(Number), expect.any(Number))
            expect(finnhubProvider.resolveInternationalSymbol).toHaveBeenCalledWith("IE00B4L5Y983")
            expect(finnhubProvider.getHistoricalMonthlyPrices).toHaveBeenNthCalledWith(2, "IWDA.AS", expect.any(Number), expect.any(Number))
            expect(result).toEqual([{holdingId: 16, monthsFilled: 1}])
        })

        it("falls back to a verified community price when the provider has no data for that month", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [holdingRow], error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [gapRow({quantity: 5, user_date: "2024-01-01"})], error: null}))
            vi.mocked(finnhubProvider.getHistoricalMonthlyPrices).mockResolvedValue(null)
            // getVerifiedCommunityPricesForInstrument's query - a verified community price covers the gap month.
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [{month_key: "2024-01", price_eur: 90}], error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: holdingRow, error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: {...gapRow({quantity: 5}), current_value: 450}, error: null}))

            const result = await investments.backfillHistoricalPrices("user-1", {EUR: 1, USD: 1.1})

            expect(result).toEqual([{holdingId: 16, monthsFilled: 1}])
        })

        it("uses CoinGecko (already in EUR) instead of Finnhub for crypto holdings", async () => {
            const cryptoHolding = {
                ...holdingRow, asset_key: "crypto",
                instrument: {...holdingRow.instrument, kind: "crypto", symbol: "BTC", currency: null, coingecko_id: "bitcoin"},
            }
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [cryptoHolding], error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [gapRow({quantity: 1})], error: null}))
            vi.mocked(coingeckoProvider.getHistoricalMonthlyPrices).mockResolvedValue(new Map([["2024-01", 40000]]))
            // getVerifiedCommunityPricesForInstrument's query - no community prices for this instrument.
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [], error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: cryptoHolding, error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: {...gapRow({quantity: 1}), current_value: 40000}, error: null}))

            const result = await investments.backfillHistoricalPrices("user-1", {EUR: 1})

            expect(coingeckoProvider.getHistoricalMonthlyPrices).toHaveBeenCalledWith("bitcoin", expect.any(Number), expect.any(Number))
            expect(finnhubProvider.getHistoricalMonthlyPrices).not.toHaveBeenCalled()
            expect(result).toEqual([{holdingId: 16, monthsFilled: 1}])
        })

        it("returns an empty array when there are no holdings to backfill", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [], error: null}))

            const result = await investments.backfillHistoricalPrices("user-1", {EUR: 1})

            expect(result).toEqual([])
            expect(finnhubProvider.getHistoricalMonthlyPrices).not.toHaveBeenCalled()
        })
    })

    describe("submitCommunityPrice", () => {
        const input = {instrumentId: 1, monthKey: "2024-01", rawPrice: 150, rawCurrency: "USD"}

        it("returns not_eligible without inserting when the user never held the instrument", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: null})) // holdings check
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: null})) // history check

            const result = await investments.submitCommunityPrice("user-1", input, {EUR: 1, USD: 1.1})

            expect(result).toEqual({status: "not_eligible"})
            expect(mockSupabase.from).toHaveBeenCalledTimes(2)
        })

        it("still counts as eligible via holding history alone (a manually-added holding later deleted)", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: null})) // no live holding
            mockSupabase.from.mockReturnValueOnce(makeChain({data: {id: 3}, error: null})) // but history exists
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: null})) // no provider price for this month
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {id: 1, instrument_id: 1, month_key: "2024-01", price_eur: 136.36, raw_price: 150, raw_currency: "USD", status: "pending", submitted_by: "user-1", submitted_at: "2026-01-01T00:00:00Z", verified_by: null, verified_at: null, rejection_note: null},
                error: null,
            }))

            const result = await investments.submitCommunityPrice("user-1", input, {EUR: 1, USD: 1.1})

            expect(result).toMatchObject({status: "ok"})
        })

        it("returns unknown_currency when there's no exchange rate for the submitted currency", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: {id: 5}, error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: null})) // no provider price

            const result = await investments.submitCommunityPrice("user-1", {...input, rawCurrency: "GBP"}, {EUR: 1, USD: 1.1})

            expect(result).toEqual({status: "unknown_currency"})
        })

        it("converts to EUR at submission time and inserts a pending submission", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: {id: 5}, error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: null})) // no provider price
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {id: 1, instrument_id: 1, month_key: "2024-01", price_eur: 136.36, raw_price: 150, raw_currency: "USD", status: "pending", submitted_by: "user-1", submitted_at: "2026-01-01T00:00:00Z", verified_by: null, verified_at: null, rejection_note: null},
                error: null,
            }))

            const result = await investments.submitCommunityPrice("user-1", input, {EUR: 1, USD: 1.1})

            expect(result).toMatchObject({status: "ok", submission: {priceEur: 136.36, rawPrice: 150, rawCurrency: "USD", status: "pending"}})
        })

        it("returns the existing active submission as a conflict instead of overwriting it", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: {id: 5}, error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: null})) // no provider price
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: {code: "23505", message: "duplicate key"}}))
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {id: 9, instrument_id: 1, month_key: "2024-01", price_eur: 100, raw_price: 100, raw_currency: "EUR", status: "verified", submitted_by: "user-2", submitted_at: "2026-01-01T00:00:00Z", verified_by: "admin-1", verified_at: "2026-01-02T00:00:00Z", rejection_note: null},
                error: null,
            }))

            const result = await investments.submitCommunityPrice("user-1", input, {EUR: 1, USD: 1.1})

            expect(result).toMatchObject({status: "conflict", existing: {id: 9, status: "verified"}})
        })

        it("rejects a community proposal when the provider already verified that month", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: {id: 5}, error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: {id: 44}, error: null}))

            const result = await investments.submitCommunityPrice("user-1", input, {EUR: 1, USD: 1.1})

            expect(result).toEqual({status: "provider_available"})
            expect(mockSupabase.from).toHaveBeenCalledTimes(3)
        })
    })

    describe("getPendingCommunityPrices", () => {
        it("returns pending submissions joined with instrument details", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: [{
                    id: 1, instrument_id: 1, month_key: "2024-01", price_eur: 100, raw_price: 110, raw_currency: "USD",
                    status: "pending", submitted_by: "user-1", submitted_at: "2026-01-01T00:00:00Z", verified_by: null, verified_at: null, rejection_note: null,
                    instrument: {id: 1, kind: "stock", symbol: "AAPL", name: "Apple Inc.", currency: "USD"},
                }],
                error: null,
            }))

            const result = await investments.getPendingCommunityPrices()

            expect(result).toEqual([{
                id: 1, instrumentId: 1, monthKey: "2024-01", priceEur: 100, rawPrice: 110, rawCurrency: "USD",
                status: "pending", submittedBy: "user-1", submittedAt: "2026-01-01T00:00:00Z", verifiedBy: null, verifiedAt: null, rejectionNote: null,
                instrument: {id: 1, kind: "stock", symbol: "AAPL", name: "Apple Inc.", currency: "USD"},
            }])
        })

        it("returns an empty array when the query fails", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: {code: "500", message: "boom"}}))

            const result = await investments.getPendingCommunityPrices()

            expect(result).toEqual([])
        })
    })

    describe("getMyCommunityPriceSubmissions", () => {
        it("returns the user's own submissions across every status", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: [{
                    id: 2, instrument_id: 1, month_key: "2024-02", price_eur: 90, raw_price: 90, raw_currency: "EUR",
                    status: "rejected", submitted_by: "user-1", submitted_at: "2026-01-01T00:00:00Z", verified_by: "admin-1", verified_at: "2026-01-02T00:00:00Z", rejection_note: "Doesn't match provider quote",
                    instrument: {id: 1, kind: "stock", symbol: "AAPL", name: "Apple Inc.", currency: "USD"},
                }],
                error: null,
            }))

            const result = await investments.getMyCommunityPriceSubmissions("user-1")

            expect(result).toMatchObject([{id: 2, status: "rejected", rejectionNote: "Doesn't match provider quote"}])
        })
    })

    describe("verifyCommunityPrice", () => {
        const pendingRow = {
            id: 1, instrument_id: 1, month_key: "2024-01", price_eur: 100, raw_price: 110, raw_currency: "USD",
            status: "pending", submitted_by: "user-1", submitted_at: "2026-01-01T00:00:00Z", verified_by: null, verified_at: null, rejection_note: null,
        }

        it("returns not_found when the submission doesn't exist", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: null}))

            const result = await investments.verifyCommunityPrice("admin-1", 999, "approve", null)

            expect(result).toEqual({status: "not_found"})
        })

        it("returns already_resolved without re-updating a submission that isn't pending anymore", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: {...pendingRow, status: "verified"}, error: null}))

            const result = await investments.verifyCommunityPrice("admin-1", 1, "approve", null)

            expect(result).toMatchObject({status: "already_resolved", submission: {status: "verified"}})
        })

        it("approves a pending submission", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: pendingRow, error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {...pendingRow, status: "verified", verified_by: "admin-1", verified_at: "2026-01-02T00:00:00Z"},
                error: null,
            }))
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [], error: null}))

            const result = await investments.verifyCommunityPrice("admin-1", 1, "approve", null)

            expect(result).toMatchObject({status: "ok", submission: {status: "verified", verifiedBy: "admin-1"}})
        })

        it("applies an approved community price to matching unverified history values", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: pendingRow, error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {...pendingRow, status: "verified", verified_by: "admin-1", verified_at: "2026-01-02T00:00:00Z"},
                error: null,
            }))
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: [
                    {id: 41, quantity: 2, price_source: "manual"},
                    {id: 42, quantity: 3, price_source: "provider"},
                ],
                error: null,
            }))
            const updateChain = makeChain({data: null, error: null})
            mockSupabase.from.mockReturnValueOnce(updateChain)

            await investments.verifyCommunityPrice("admin-1", 1, "approve", null)

            expect(updateChain.update).toHaveBeenCalledWith({current_value: 200, price_source: "community"})
            expect(updateChain.eq).toHaveBeenCalledWith("id", 41)
            expect(mockSupabase.from).toHaveBeenCalledTimes(4)
        })

        it("rejects a pending submission and stores the rejection note", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: pendingRow, error: null}))
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {...pendingRow, status: "rejected", verified_by: "admin-1", verified_at: "2026-01-02T00:00:00Z", rejection_note: "Doesn't match Yahoo Finance"},
                error: null,
            }))

            const result = await investments.verifyCommunityPrice("admin-1", 1, "reject", "Doesn't match Yahoo Finance")

            expect(result).toMatchObject({status: "ok", submission: {status: "rejected", rejectionNote: "Doesn't match Yahoo Finance"}})
        })
    })

    describe("getVerifiedCommunityPricesForInstrument", () => {
        it("returns a month -> EUR price map of verified submissions", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: [{month_key: "2024-01", price_eur: 100}, {month_key: "2024-02", price_eur: 105}],
                error: null,
            }))

            const result = await investments.getVerifiedCommunityPricesForInstrument(1)

            expect(result).toEqual(new Map([["2024-01", 100], ["2024-02", 105]]))
        })

        it("returns an empty map when the query fails", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: {code: "500", message: "boom"}}))

            const result = await investments.getVerifiedCommunityPricesForInstrument(1)

            expect(result).toEqual(new Map())
        })
    })

    describe("getInvestmentSettings", () => {
        it("returns null monthlyTarget when the user has never set one", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: null}))

            const result = await investments.getInvestmentSettings("user-1")

            expect(result).toEqual({monthlyTarget: null, monthlyTargetPercent: null})
        })

        it("returns the stored monthlyTarget", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: {monthly_target: 300, monthly_target_percent: 15}, error: null}))

            const result = await investments.getInvestmentSettings("user-1")

            expect(result).toEqual({monthlyTarget: 300, monthlyTargetPercent: 15})
        })
    })

    describe("saveInvestmentSettings", () => {
        it("upserts and returns the saved monthlyTarget", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: {monthly_target: 250, monthly_target_percent: 10}, error: null}))

            const result = await investments.saveInvestmentSettings("user-1", 250, 10)

            expect(result).toEqual({monthlyTarget: 250, monthlyTargetPercent: 10})
        })

        it("returns null when the upsert fails", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: {code: "500", message: "boom"}}))

            const result = await investments.saveInvestmentSettings("user-1", 250)

            expect(result).toBeNull()
        })
    })

    describe("upsertDividend", () => {
        const dividendInput = {
            instrumentId: 1, holdingId: 10, amount: 0.29, currency: "EUR", grossAmount: 0.29,
            paidDate: new Date("2026-06-01"), externalId: "EXT-1", source: "trading212",
        }

        it("upserts on the (user, instrument, external_id) key when an external id is provided", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {id: 1, instrument_id: 1, holding_id: 10, amount: 0.29, currency: "EUR", gross_amount: 0.29, paid_date: "2026-06-01", external_id: "EXT-1", source: "trading212", recorded_at: "2026-06-01T00:00:00Z"},
                error: null,
            }))

            const result = await investments.upsertDividend("user-1", dividendInput)

            expect(result).toMatchObject({id: 1, amount: 0.29, externalId: "EXT-1", source: "trading212"})
        })

        it("plain inserts when no external id is available (broker didn't provide one)", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {id: 2, instrument_id: 1, holding_id: 10, amount: 20.95, currency: "EUR", gross_amount: 20.95, paid_date: "2025-01-15", external_id: null, source: "directa", recorded_at: "2025-01-15T00:00:00Z"},
                error: null,
            }))

            const result = await investments.upsertDividend("user-1", {...dividendInput, externalId: null, source: "directa"})

            expect(result).toMatchObject({id: 2, externalId: null, source: "directa"})
        })

        it("returns null when the save fails", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: {code: "500", message: "boom"}}))

            const result = await investments.upsertDividend("user-1", dividendInput)

            expect(result).toBeNull()
        })
    })

    describe("upsertDividendsBatch", () => {
        it("returns immediately without querying Supabase when given no entries", async () => {
            const result = await investments.upsertDividendsBatch("user-1", [])

            expect(result).toEqual({savedCount: 0, errors: []})
            expect(mockSupabase.from).not.toHaveBeenCalled()
        })

        const dividendInputs = [
            {instrumentId: 1, holdingId: 10, amount: 0.29, currency: "EUR", grossAmount: 0.29, paidDate: new Date("2026-06-01"), externalId: "EXT-1", source: "trading212"},
            {instrumentId: 1, holdingId: 10, amount: 20.95, currency: "EUR", grossAmount: 20.95, paidDate: new Date("2025-01-15"), externalId: null, source: "directa"},
        ]

        it("splits entries with/without an external id into an upsert and a plain insert, scoped to instruments this user actually owns", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [{id: 1}], error: null}))
            const upsertChain = makeChain({data: [{id: 1}], error: null})
            const insertChain = makeChain({data: [{id: 2}], error: null})
            mockSupabase.from.mockReturnValueOnce(upsertChain)
            mockSupabase.from.mockReturnValueOnce(insertChain)

            const result = await investments.upsertDividendsBatch("user-1", dividendInputs)

            expect(upsertChain.upsert).toHaveBeenCalledWith(
                [expect.objectContaining({external_id: "EXT-1"})],
                {onConflict: "user_id,instrument_id,external_id"},
            )
            expect(insertChain.insert).toHaveBeenCalledWith([expect.objectContaining({external_id: null, source: "directa"})])
            expect(result).toEqual({savedCount: 2, errors: []})
        })

        it("skips (and reports an error for) entries whose instrument isn't owned by this user", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [], error: null}))

            const result = await investments.upsertDividendsBatch("user-1", [dividendInputs[0]])

            expect(result).toEqual({savedCount: 0, errors: ["instrument 1 not found, or not owned by this user"]})
            expect(mockSupabase.from).toHaveBeenCalledTimes(1)
        })
    })

    describe("getDividendsSummaryByUserId", () => {
        it("sums payments per instrument and tracks the most recent paid date", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: [
                    {amount: 0.29, paid_date: "2026-03-01", instrument: {id: 1, symbol: "V", name: "Visa"}},
                    {amount: 0.31, paid_date: "2026-06-01", instrument: {id: 1, symbol: "V", name: "Visa"}},
                    {amount: 5, paid_date: "2026-01-01", instrument: {id: 2, symbol: "AAPL", name: "Apple Inc"}},
                ],
                error: null,
            }))

            const result = await investments.getDividendsSummaryByUserId("user-1")

            expect(result).toEqual([
                {instrumentId: 2, symbol: "AAPL", name: "Apple Inc", totalAmount: 5, paymentCount: 1, lastPaidDate: "2026-01-01"},
                {instrumentId: 1, symbol: "V", name: "Visa", totalAmount: 0.6, paymentCount: 2, lastPaidDate: "2026-06-01"},
            ])
        })

        it("returns an empty array when the query fails", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: {code: "500", message: "boom"}}))

            const result = await investments.getDividendsSummaryByUserId("user-1")

            expect(result).toEqual([])
        })
    })

    describe("upsertTransaction", () => {
        const transactionInput = {
            instrumentId: 1, holdingId: 10, side: "buy" as const, quantity: 2, price: 150, currency: "USD",
            total: 279.5, totalCurrency: "USD", tradeDate: new Date("2022-01-13"), externalId: "EXT-9", source: "trading212",
        }

        it("upserts on the (user, instrument, external_id) key when an external id is provided", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {
                    id: 1, instrument_id: 1, holding_id: 10, side: "buy", quantity: 2, price: 150, currency: "USD",
                    total: 279.5, total_currency: "USD", trade_date: "2022-01-13", external_id: "EXT-9", source: "trading212",
                    recorded_at: "2022-01-13T00:00:00Z",
                },
                error: null,
            }))

            const result = await investments.upsertTransaction("user-1", transactionInput)

            expect(result).toMatchObject({id: 1, side: "buy", quantity: 2, externalId: "EXT-9", source: "trading212"})
        })

        it("plain inserts when no external id is available (broker didn't provide one)", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: {
                    id: 2, instrument_id: 1, holding_id: 10, side: "sell", quantity: 1, price: 155, currency: "USD",
                    total: 155, total_currency: "USD", trade_date: "2022-02-01", external_id: null, source: "directa",
                    recorded_at: "2022-02-01T00:00:00Z",
                },
                error: null,
            }))

            const result = await investments.upsertTransaction("user-1", {...transactionInput, side: "sell", externalId: null, source: "directa"})

            expect(result).toMatchObject({id: 2, side: "sell", externalId: null, source: "directa"})
        })

        it("returns null when the save fails", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: {code: "500", message: "boom"}}))

            const result = await investments.upsertTransaction("user-1", transactionInput)

            expect(result).toBeNull()
        })
    })

    describe("saveTransactionsBatch", () => {
        it("returns immediately without querying Supabase when given no entries", async () => {
            const result = await investments.saveTransactionsBatch("user-1", [])

            expect(result).toEqual({savedCount: 0, errors: []})
            expect(mockSupabase.from).not.toHaveBeenCalled()
        })

        const transactionInputs = [
            {instrumentId: 1, holdingId: 10, side: "buy" as const, quantity: 2, price: 150, currency: "USD", total: 279.5, totalCurrency: "USD", tradeDate: new Date("2022-01-13"), externalId: "EXT-9", source: "trading212"},
            {instrumentId: 1, holdingId: 10, side: "sell" as const, quantity: 1, price: 160, currency: "USD", total: 160, totalCurrency: "USD", tradeDate: new Date("2023-05-01"), externalId: null, source: "trading212"},
        ]

        it("splits entries with/without an external id into an upsert and a plain insert, scoped to instruments this user actually owns", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [{id: 1}], error: null}))
            const upsertChain = makeChain({data: [{id: 1}], error: null})
            const insertChain = makeChain({data: [{id: 2}], error: null})
            mockSupabase.from.mockReturnValueOnce(upsertChain)
            mockSupabase.from.mockReturnValueOnce(insertChain)

            const result = await investments.saveTransactionsBatch("user-1", transactionInputs)

            expect(upsertChain.upsert).toHaveBeenCalledWith(
                [expect.objectContaining({external_id: "EXT-9", side: "buy"})],
                {onConflict: "user_id,instrument_id,external_id"},
            )
            expect(insertChain.insert).toHaveBeenCalledWith([expect.objectContaining({external_id: null, side: "sell"})])
            expect(result).toEqual({savedCount: 2, errors: []})
        })

        it("skips (and reports an error for) entries whose instrument isn't owned by this user", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: [], error: null}))

            const result = await investments.saveTransactionsBatch("user-1", [transactionInputs[0]])

            expect(result).toEqual({savedCount: 0, errors: ["instrument 1 not found, or not owned by this user"]})
        })
    })

    describe("getTransactionsByUserId", () => {
        it("returns every transaction with its instrument identity attached", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: [
                    {
                        instrument_id: 1, side: "buy", quantity: 2, price: 150, currency: "USD", total: 279.5,
                        total_currency: "USD", trade_date: "2022-01-13", external_id: "EXT-9",
                        instrument: {isin: "US0378331005", symbol: "AAPL", name: "Apple"},
                    },
                    {
                        instrument_id: 1, side: "sell", quantity: 1, price: 160, currency: "USD", total: 160,
                        total_currency: "USD", trade_date: "2022-03-01", external_id: null,
                        instrument: {isin: "US0378331005", symbol: "AAPL", name: "Apple"},
                    },
                ],
                error: null,
            }))

            const result = await investments.getTransactionsByUserId("user-1")

            expect(result).toEqual([
                {
                    instrumentId: 1, isin: "US0378331005", symbol: "AAPL", name: "Apple", side: "buy", quantity: 2,
                    price: 150, currency: "USD", total: 279.5, totalCurrency: "USD", tradeDate: "2022-01-13", externalId: "EXT-9",
                },
                {
                    instrumentId: 1, isin: "US0378331005", symbol: "AAPL", name: "Apple", side: "sell", quantity: 1,
                    price: 160, currency: "USD", total: 160, totalCurrency: "USD", tradeDate: "2022-03-01", externalId: null,
                },
            ])
        })

        it("drops rows whose instrument no longer exists (join comes back null)", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({
                data: [
                    {
                        instrument_id: 1, side: "buy", quantity: 2, price: 150, currency: "USD", total: 279.5,
                        total_currency: "USD", trade_date: "2022-01-13", external_id: "EXT-9", instrument: null,
                    },
                ],
                error: null,
            }))

            const result = await investments.getTransactionsByUserId("user-1")

            expect(result).toEqual([])
        })

        it("returns an empty array when the query fails", async () => {
            mockSupabase.from.mockReturnValueOnce(makeChain({data: null, error: {code: "500", message: "boom"}}))

            const result = await investments.getTransactionsByUserId("user-1")

            expect(result).toEqual([])
        })
    })
})
