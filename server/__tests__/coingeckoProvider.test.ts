import { describe, expect, it, vi, beforeEach } from "vitest"

const { checkAndConsumeRateLimit } = vi.hoisted(() => ({ checkAndConsumeRateLimit: vi.fn() }))
vi.mock("../src/libs/rateLimiter", () => ({ checkAndConsumeRateLimit, default: { checkAndConsumeRateLimit } }))

import { getHistoricalMonthlyPrices } from "../src/libs/providers/coingeckoProvider"

describe("coingeckoProvider.getHistoricalMonthlyPrices", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        checkAndConsumeRateLimit.mockResolvedValue(true)
    })

    it("keeps only the latest price point within each calendar month, in one call for the whole range", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({
            prices: [
                [1704067200000, 42000], // 2024-01-01
                [1706227200000, 43500], // 2024-01-26 (later in January - should win over the 1st)
                [1706745600000, 45000], // 2024-02-01
            ],
        }), { status: 200 }))

        const result = await getHistoricalMonthlyPrices("bitcoin", 1704067200, 1706745600)

        expect(result).toEqual(new Map([["2024-01", 43500], ["2024-02", 45000]]))
        expect(fetch).toHaveBeenCalledTimes(1)
        const [url] = vi.mocked(fetch).mock.calls[0]
        expect(url).toContain("vs_currency=eur")
        expect(url).toContain("bitcoin")
    })

    it("returns null on an empty or malformed prices array", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ prices: [] }), { status: 200 }))
        expect(await getHistoricalMonthlyPrices("bitcoin", 1704067200, 1706745600)).toBeNull()

        vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }))
        expect(await getHistoricalMonthlyPrices("bitcoin", 1704067200, 1706745600)).toBeNull()
    })

    it("returns null (not a throw) on a non-200 response", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response("rate limited", { status: 429 }))

        const result = await getHistoricalMonthlyPrices("bitcoin", 1704067200, 1706745600)

        expect(result).toBeNull()
    })

    it("returns null without calling fetch when rate-limited", async () => {
        checkAndConsumeRateLimit.mockResolvedValue(false)

        const result = await getHistoricalMonthlyPrices("bitcoin", 1704067200, 1706745600)

        expect(fetch).not.toHaveBeenCalled()
        expect(result).toBeNull()
    })

    it("returns null when the range is empty or inverted", async () => {
        const result = await getHistoricalMonthlyPrices("bitcoin", 1706745600, 1704067200)
        expect(result).toBeNull()
        expect(fetch).not.toHaveBeenCalled()
    })
})
