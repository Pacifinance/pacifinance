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
        // Pinned close to the requested range (2024-01 to 2024-02) so it
        // stays within the ~365-day lookback the provider clamps to - an
        // unmocked "now" years later would otherwise make the whole range
        // unreachable and return null before ever calling fetch.
        vi.useFakeTimers()
        try {
            vi.setSystemTime(new Date("2024-03-01T00:00:00Z"))
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
        } finally {
            vi.useRealTimers()
        }
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

    it("clamps a `from` older than ~365 days instead of requesting the full range (CoinGecko's free tier rejects the whole request otherwise)", async () => {
        vi.useFakeTimers()
        try {
            vi.setSystemTime(new Date("2026-08-09T12:00:00Z"))
            vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({
                prices: [[Date.now(), 50000]],
            }), { status: 200 }))

            const now = Math.floor(Date.now() / 1000)
            const threeYearsAgo = now - 3 * 365 * 24 * 60 * 60
            await getHistoricalMonthlyPrices("bitcoin", threeYearsAgo, now)

            const [url] = vi.mocked(fetch).mock.calls[0] as [string]
            const fromParam = Number(new URL(url).searchParams.get("from"))
            expect(fromParam).toBe(now - 364 * 24 * 60 * 60)
            expect(fromParam).toBeGreaterThan(threeYearsAgo)
        } finally {
            vi.useRealTimers()
        }
    })
})
