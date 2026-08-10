import { describe, expect, it } from "vitest"

import app from "../src/index"
import { authCookie, request } from "./helpers/http"
import { mockDb, mockCache } from "./setup"

describe("roadmap votes routes", () => {
    describe("GET /api/roadmap-votes (public)", () => {
        it("returns the cached vote counts without requiring auth", async () => {
            mockCache.get.mockResolvedValue({ "roadmap-voting": 3, "feedback-system": 1 })

            const response = await request(app, "/api/roadmap-votes")

            expect(response.status).toBe(200)
            expect(response.json).toEqual({ "roadmap-voting": 3, "feedback-system": 1 })
        })

        it("falls back to an empty object when nothing is cached yet", async () => {
            mockCache.get.mockResolvedValue(null)

            const response = await request(app, "/api/roadmap-votes")

            expect(response.status).toBe(200)
            expect(response.json).toEqual({})
        })

        it("refreshes the cache when the cached value is expired", async () => {
            mockCache.valueExpired.mockResolvedValue(true)
            mockCache.get.mockResolvedValue({})

            await request(app, "/api/roadmap-votes")

            expect(mockCache.invalidate).toHaveBeenCalledWith("roadmapVoteCounts")
        })
    })

    describe("GET /api/roadmap-votes/mine (private)", () => {
        it("requires an access-token cookie", async () => {
            const response = await request(app, "/api/roadmap-votes/mine")

            expect(response.status).toBe(401)
            expect(mockDb.roadmapVotes.getVotesByUserId).not.toHaveBeenCalled()
        })

        it("returns the authenticated user's voted item ids", async () => {
            mockDb.roadmapVotes.getVotesByUserId.mockResolvedValue(["roadmap-voting"])

            const response = await request(app, "/api/roadmap-votes/mine", {
                headers: { cookie: authCookie }
            })

            expect(response.status).toBe(200)
            expect(response.json).toEqual(["roadmap-voting"])
            expect(mockDb.roadmapVotes.getVotesByUserId).toHaveBeenCalledWith("user-uuid")
        })
    })

    describe("POST /api/roadmap-votes/toggle (private)", () => {
        it("requires an access-token cookie", async () => {
            const response = await request(app, "/api/roadmap-votes/toggle", {
                method: "POST",
                body: { itemId: "roadmap-voting" }
            })

            expect(response.status).toBe(401)
            expect(mockDb.roadmapVotes.toggleVote).not.toHaveBeenCalled()
        })

        it("rejects malformed item ids", async () => {
            const response = await request(app, "/api/roadmap-votes/toggle", {
                method: "POST",
                headers: { cookie: authCookie },
                body: { itemId: "not a valid id!!" }
            })

            expect(response.status).toBe(400)
            expect(mockDb.roadmapVotes.toggleVote).not.toHaveBeenCalled()
        })

        it("toggles the vote and invalidates the public count cache", async () => {
            mockDb.roadmapVotes.toggleVote.mockResolvedValue(true)

            const response = await request(app, "/api/roadmap-votes/toggle", {
                method: "POST",
                headers: { cookie: authCookie },
                body: { itemId: "roadmap-voting" }
            })

            expect(response.status).toBe(200)
            expect(response.json).toEqual({ itemId: "roadmap-voting", voted: true })
            expect(mockDb.roadmapVotes.toggleVote).toHaveBeenCalledWith("user-uuid", "roadmap-voting")
            expect(mockCache.invalidate).toHaveBeenCalledWith("roadmapVoteCounts")
        })

        it("returns 500 when the DB toggle fails", async () => {
            mockDb.roadmapVotes.toggleVote.mockResolvedValue(null)

            const response = await request(app, "/api/roadmap-votes/toggle", {
                method: "POST",
                headers: { cookie: authCookie },
                body: { itemId: "roadmap-voting" }
            })

            expect(response.status).toBe(500)
            expect(mockCache.invalidate).not.toHaveBeenCalled()
        })
    })
})
