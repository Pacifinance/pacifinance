import { describe, expect, it, vi, beforeEach } from "vitest"

const { checkAndConsumeRateLimit } = vi.hoisted(() => ({ checkAndConsumeRateLimit: vi.fn() }))
vi.mock("../src/libs/rateLimiter", () => ({ checkAndConsumeRateLimit, default: { checkAndConsumeRateLimit } }))

import { searchOpenFigiByIsins } from "../src/libs/providers/openfigiProvider"

function figiResult(overrides: Partial<{ figi: string; ticker: string; name: string; marketSector: string }> = {}) {
    return {
        figi: overrides.figi ?? "BBG000B9XRY4",
        ticker: overrides.ticker ?? "AAPL",
        name: overrides.name ?? "Apple Inc",
        marketSector: overrides.marketSector ?? "Equity",
    }
}

describe("openfigiProvider.searchOpenFigiByIsins", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        checkAndConsumeRateLimit.mockResolvedValue(true)
    })

    it("returns an empty map without calling fetch when given no ISINs", async () => {
        const result = await searchOpenFigiByIsins([])
        expect(result).toEqual({})
        expect(fetch).not.toHaveBeenCalled()
    })

    it("resolves multiple ISINs with a single batched /v3/mapping request", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify([
            { data: [figiResult({ figi: "BBG000B9XRY4", ticker: "AAPL", name: "Apple Inc" })] },
            { data: [figiResult({ figi: "BBG000BPH459", ticker: "MSFT", name: "Microsoft Corp" })] },
        ]), { status: 200 }))

        const result = await searchOpenFigiByIsins(["US0378331005", "US5949181045"])

        expect(fetch).toHaveBeenCalledTimes(1)
        expect(checkAndConsumeRateLimit).toHaveBeenCalledTimes(1)
        const [url, init] = vi.mocked(fetch).mock.calls[0]
        expect(url).toBe("https://api.openfigi.com/v3/mapping")
        expect(JSON.parse(init.body as string)).toEqual([
            { idType: "ID_ISIN", idValue: "US0378331005" },
            { idType: "ID_ISIN", idValue: "US5949181045" },
        ])

        expect(result.US0378331005).toHaveLength(1)
        expect(result.US0378331005[0]).toMatchObject({ symbol: "AAPL", isin: "US0378331005", kind: "stock" })
        expect(result.US5949181045).toHaveLength(1)
        expect(result.US5949181045[0]).toMatchObject({ symbol: "MSFT", isin: "US5949181045", kind: "stock" })
    })

    it("maps a per-job error or missing data to an empty array for that ISIN only", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify([
            { data: [figiResult()] },
            { error: "No identifier found." },
        ]), { status: 200 }))

        const result = await searchOpenFigiByIsins(["US0378331005", "XX0000000000"])

        expect(result.US0378331005).toHaveLength(1)
        expect(result.XX0000000000).toEqual([])
    })

    it("dedupes and uppercases input ISINs", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify([
            { data: [figiResult()] },
        ]), { status: 200 }))

        await searchOpenFigiByIsins(["us0378331005", "US0378331005"])

        const [, init] = vi.mocked(fetch).mock.calls[0]
        expect(JSON.parse(init.body as string)).toEqual([{ idType: "ID_ISIN", idValue: "US0378331005" }])
    })

    it("returns empty results without calling fetch when rate-limited", async () => {
        checkAndConsumeRateLimit.mockResolvedValue(false)

        const result = await searchOpenFigiByIsins(["US0378331005", "US5949181045"])

        expect(fetch).not.toHaveBeenCalled()
        expect(result).toEqual({ US0378331005: [], US5949181045: [] })
    })

    it("returns empty results (not a throw) on a non-200 response", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response("rate limited", { status: 429 }))

        const result = await searchOpenFigiByIsins(["US0378331005"])

        expect(result).toEqual({ US0378331005: [] })
    })

    it("chunks batches of more than 10 ISINs without an API key (OpenFIGI rejects >10 jobs with 413)", async () => {
        const isins = Array.from({ length: 14 }, (_, i) => `US${String(i).padStart(9, "0")}${i % 10}`)
        vi.mocked(fetch).mockImplementation(async (_url, init) => {
            const jobs = JSON.parse((init as { body: string }).body) as Array<{ idValue: string }>
            return new Response(JSON.stringify(jobs.map(() => ({ data: [figiResult()] }))), { status: 200 })
        })

        const result = await searchOpenFigiByIsins(isins)

        // 14 ISINs over a 10-per-request cap must take exactly 2 requests (10 + 4),
        // not 1 (which would get the whole batch rejected with 413 on the real API).
        expect(fetch).toHaveBeenCalledTimes(2)
        const firstBatch = JSON.parse((vi.mocked(fetch).mock.calls[0][1] as { body: string }).body)
        const secondBatch = JSON.parse((vi.mocked(fetch).mock.calls[1][1] as { body: string }).body)
        expect(firstBatch).toHaveLength(10)
        expect(secondBatch).toHaveLength(4)
        for (const isin of isins) expect(result[isin]).toHaveLength(1)
    })
})
