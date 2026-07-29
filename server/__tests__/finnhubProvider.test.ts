import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"

const { checkAndConsumeRateLimit } = vi.hoisted(() => ({ checkAndConsumeRateLimit: vi.fn() }))
vi.mock("../src/libs/rateLimiter", () => ({ checkAndConsumeRateLimit, default: { checkAndConsumeRateLimit } }))

import { getQuote } from "../src/libs/providers/finnhubProvider"

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
