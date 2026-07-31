import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"

const { checkAndConsumeRateLimit } = vi.hoisted(() => ({ checkAndConsumeRateLimit: vi.fn() }))
vi.mock("../src/libs/rateLimiter", () => ({ checkAndConsumeRateLimit, default: { checkAndConsumeRateLimit } }))

import { getQuote, getHistoricalMonthlyPrices, resolveInternationalSymbol } from "../src/libs/providers/finnhubProvider"

describe("finnhubProvider.getQuote", () => {
    const originalKey = process.env.FINNHUB_KEY

    beforeEach(() => {
        vi.clearAllMocks()
        checkAndConsumeRateLimit.mockResolvedValue(true)
        process.env.FINNHUB_KEY = "test-key"
    })

    afterEach(() => {
        process.env.FINNHUB_KEY = originalKey
    })

    it("returns null without calling fetch when no API key is configured", async () => {
        delete process.env.FINNHUB_KEY
        const result = await getQuote("AAPL")
        expect(result).toBeNull()
        expect(fetch).not.toHaveBeenCalled()
    })

    it("returns the current price on a successful quote", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ c: 214.5, pc: 210, t: 1735689600 }), { status: 200 }))

        const result = await getQuote("AAPL")

        expect(result).toEqual({ price: 214.5 })
        const [url] = vi.mocked(fetch).mock.calls[0]
        expect(url).toContain("symbol=AAPL")
    })

    it("returns null when Finnhub doesn't recognize the symbol (t: 0)", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ c: 0, pc: 0, t: 0 }), { status: 200 }))

        const result = await getQuote("MYSTOCK")

        expect(result).toBeNull()
    })

    it("returns null (not a throw) on a non-200 response", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response("rate limited", { status: 429 }))

        const result = await getQuote("AAPL")

        expect(result).toBeNull()
    })

    it("returns null without calling fetch when rate-limited", async () => {
        checkAndConsumeRateLimit.mockResolvedValue(false)

        const result = await getQuote("AAPL")

        expect(fetch).not.toHaveBeenCalled()
        expect(result).toBeNull()
    })
})

describe("finnhubProvider.getHistoricalMonthlyPrices", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        checkAndConsumeRateLimit.mockResolvedValue(true)
        process.env.FINNHUB_KEY = "test-key"
    })

    afterEach(() => {
        process.env.FINNHUB_KEY = undefined
    })

    it("returns null without calling fetch when no API key is configured", async () => {
        delete process.env.FINNHUB_KEY
        const result = await getHistoricalMonthlyPrices("AAPL", 1704067200, 1735689600)
        expect(result).toBeNull()
        expect(fetch).not.toHaveBeenCalled()
    })

    it("maps close prices to their calendar month, in one call for the whole range", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({
            s: "ok",
            c: [150.0, 155.5],
            t: [1704067200, 1706745600], // 2024-01-01, 2024-02-01 (UTC)
        }), { status: 200 }))

        const result = await getHistoricalMonthlyPrices("AAPL", 1704067200, 1706745600)

        expect(result).toEqual(new Map([["2024-01", 150.0], ["2024-02", 155.5]]))
        expect(fetch).toHaveBeenCalledTimes(1)
        const [url] = vi.mocked(fetch).mock.calls[0]
        expect(url).toContain("resolution=M")
    })

    it("returns null when Finnhub reports no_data (e.g. delisted symbol, or unsupported for this plan/exchange)", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ s: "no_data" }), { status: 200 }))

        const result = await getHistoricalMonthlyPrices("UNKNOWN", 1704067200, 1706745600)

        expect(result).toBeNull()
    })

    it("returns null (not a throw) on a non-200 response (e.g. a plan/permission rejection)", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response("forbidden", { status: 403 }))

        const result = await getHistoricalMonthlyPrices("AAPL", 1704067200, 1706745600)

        expect(result).toBeNull()
    })

    it("returns null without calling fetch when rate-limited", async () => {
        checkAndConsumeRateLimit.mockResolvedValue(false)

        const result = await getHistoricalMonthlyPrices("AAPL", 1704067200, 1706745600)

        expect(fetch).not.toHaveBeenCalled()
        expect(result).toBeNull()
    })
})

describe("finnhubProvider.resolveInternationalSymbol", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        checkAndConsumeRateLimit.mockResolvedValue(true)
        process.env.FINNHUB_KEY = "test-key"
    })

    afterEach(() => {
        process.env.FINNHUB_KEY = undefined
    })

    it("returns null without calling fetch when no API key is configured", async () => {
        delete process.env.FINNHUB_KEY
        const result = await resolveInternationalSymbol("IE00B4L5Y983")
        expect(result).toBeNull()
        expect(fetch).not.toHaveBeenCalled()
    })

    it("picks the exchange-suffixed listing, ignoring plain unsuffixed cross-listings", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({
            count: 2,
            result: [
                { symbol: "IWDA", description: "ISHARES CORE MSCI WORLD", type: "ETP" },
                { symbol: "IWDA.AS", description: "ISHARES CORE MSCI WORLD - EURONEXT AMSTERDAM", type: "ETP" },
            ],
        }), { status: 200 }))

        const result = await resolveInternationalSymbol("IE00B4L5Y983")

        expect(result).toBe("IWDA.AS")
        const [url] = vi.mocked(fetch).mock.calls[0]
        expect(url).toContain("q=IE00B4L5Y983")
    })

    it("returns null when Finnhub has no dotted (exchange-suffixed) listing at all", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({
            count: 1,
            result: [{ symbol: "IWDA", description: "ISHARES CORE MSCI WORLD", type: "ETP" }],
        }), { status: 200 }))

        const result = await resolveInternationalSymbol("IE00B4L5Y983")

        expect(result).toBeNull()
    })

    it("returns null (not a throw) on a non-200 response", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response("rate limited", { status: 429 }))

        const result = await resolveInternationalSymbol("IE00B4L5Y983")

        expect(result).toBeNull()
    })

    it("returns null without calling fetch when rate-limited", async () => {
        checkAndConsumeRateLimit.mockResolvedValue(false)

        const result = await resolveInternationalSymbol("IE00B4L5Y983")

        expect(fetch).not.toHaveBeenCalled()
        expect(result).toBeNull()
    })
})
