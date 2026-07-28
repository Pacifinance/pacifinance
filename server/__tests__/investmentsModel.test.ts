import { describe, expect, it, vi, beforeEach } from "vitest"

import investments from "../src/db/models/investments"
import { mockSupabase } from "./setup"

vi.mock("../src/libs/providers/openfigiProvider", () => ({
    default: { searchOpenFigi: vi.fn(), searchOpenFigiByIsin: vi.fn(), searchOpenFigiByIsins: vi.fn(), isIsin: vi.fn() },
}))
vi.mock("../src/libs/providers/coingeckoProvider", () => ({
    default: { searchCoingecko: vi.fn() },
}))

import openfigiProvider from "../src/libs/providers/openfigiProvider"

/** Minimal chainable Supabase query-builder stub: every filter method returns
 * itself, `.single()`/`.maybeSingle()` resolve to the configured result, and
 * the chain is itself awaitable (for calls with no terminal method). */
function makeChain(result: { data: unknown; error: unknown }) {
    const chain: Record<string, unknown> = {}
    for (const method of ["select", "eq", "in", "or", "is", "order", "limit", "insert", "update", "delete"]) {
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
            vi.mocked(openfigiProvider.searchOpenFigi).mockResolvedValue([])

            await investments.searchInstruments("AAPL", "user-1", "stock", 20, "figi")

            expect(openfigiProvider.searchOpenFigi).toHaveBeenCalledWith("AAPL")
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
})
