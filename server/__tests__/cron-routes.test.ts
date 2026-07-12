import { describe, expect, it } from "vitest"

import app from "../src/index"
import { request } from "./helpers/http"
import { mockCache, mockDb } from "./setup"

describe("cron backend routes", () => {
    it("rejects cron calls without the shared Vercel secret", async () => {
        const response = await request(app, "/api/cron/delete-users")

        expect(response.status).toBe(401)
        expect(mockDb.delqueue.getAllAccountsInQueue).not.toHaveBeenCalled()
    })

    it("deletes only queued users whose scheduled date has passed", async () => {
        mockDb.delqueue.getAllAccountsInQueue.mockResolvedValue([
            {userId: "expired-user", scheduledFor: new Date("2024-01-01T00:00:00.000Z")},
            {userId: "future-user", scheduledFor: new Date("2999-01-01T00:00:00.000Z")}
        ])

        const response = await request(app, "/api/cron/delete-users", {
            headers: {authorization: "Bearer test-cron-secret"}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual({deleted: 1, recurring: {due: 0, ran: 0}})
        expect(mockDb.users.deleteUserById).toHaveBeenCalledTimes(1)
        expect(mockDb.users.deleteUserById).toHaveBeenCalledWith("expired-user")
    })

    it("also runs due recurring transactions on the same daily slot", async () => {
        mockDb.recurringTransactions.runAllDue.mockResolvedValue({due: 3, ran: 3})

        const response = await request(app, "/api/cron/delete-users", {
            headers: {authorization: "Bearer test-cron-secret"}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual({deleted: 0, recurring: {due: 3, ran: 3}})
        expect(mockDb.recurringTransactions.runAllDue).toHaveBeenCalledTimes(1)
    })

    it("invalidates user averages and rankings only when the cache item is expired", async () => {
        mockCache.valueExpired.mockResolvedValue(true)

        const response = await request(app, "/api/cron/refresh-user-averages", {
            headers: {authorization: "Bearer test-cron-secret"}
        })

        expect(response.status).toBe(200)
        expect(mockCache.valueExpired).toHaveBeenCalledWith("userAverages")
        expect(mockCache.valueExpired).toHaveBeenCalledWith("userRankings")
        expect(mockCache.invalidate).toHaveBeenCalledWith("userAverages")
        expect(mockCache.invalidate).toHaveBeenCalledWith("userRankings")
    })

    it("forces a user averages and rankings recompute via ?force=true even when the cache isn't expired yet", async () => {
        mockCache.valueExpired.mockResolvedValue(false)

        const response = await request(app, "/api/cron/refresh-user-averages", {
            headers: {authorization: "Bearer test-cron-secret"},
            query: {force: "true"}
        })

        expect(response.status).toBe(200)
        expect(mockCache.invalidate).toHaveBeenCalledWith("userAverages")
        expect(mockCache.invalidate).toHaveBeenCalledWith("userRankings")
    })
})
