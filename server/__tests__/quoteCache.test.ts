import { describe, expect, it, vi, beforeEach } from "vitest"

import quoteCache from "../src/cache/quoteCache"
import { mockRedis } from "./setup"

describe("quoteCache", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("returns null when nothing is cached for the symbol", async () => {
        mockRedis.get.mockResolvedValue(null)

        const result = await quoteCache.getCachedQuote("AAPL")

        expect(result).toBeNull()
        expect(mockRedis.get).toHaveBeenCalledWith("quote:AAPL")
    })

    it("returns the cached quote when it hasn't expired yet", async () => {
        const future = new Date(Date.now() + 60_000).toISOString()
        mockRedis.get.mockResolvedValue({ value: { price: 214.5 }, expiration: future })

        const result = await quoteCache.getCachedQuote("aapl")

        expect(result).toEqual({ price: 214.5 })
        expect(mockRedis.get).toHaveBeenCalledWith("quote:AAPL")
    })

    it("returns null (treats it as a miss) when the cached entry has expired", async () => {
        const past = new Date(Date.now() - 60_000).toISOString()
        mockRedis.get.mockResolvedValue({ value: { price: 214.5 }, expiration: past })

        const result = await quoteCache.getCachedQuote("AAPL")

        expect(result).toBeNull()
    })

    it("stores a quote with an expiration timestamp in the future, keyed by uppercased symbol", async () => {
        await quoteCache.setCachedQuote("aapl", { price: 214.5 })

        expect(mockRedis.set).toHaveBeenCalledTimes(1)
        const [key, stored] = mockRedis.set.mock.calls[0]
        expect(key).toBe("quote:AAPL")
        expect(stored.value).toEqual({ price: 214.5 })
        expect(new Date(stored.expiration).getTime()).toBeGreaterThan(Date.now())
    })
})
