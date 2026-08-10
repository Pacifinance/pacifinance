import { afterEach, describe, expect, it } from "vitest"

import app from "../src/index"
import { authCookie, request } from "./helpers/http"
import { mockRedis } from "./setup"

describe("POST /api/feedback", () => {
    afterEach(() => {
        delete process.env.GITHUB_ISSUE_TOKEN
    })

    it("requires an access-token cookie", async () => {
        const response = await request(app, "/api/feedback", {
            method: "POST",
            body: { type: "bug", title: "Something broke", description: "Steps to reproduce..." }
        })

        expect(response.status).toBe(401)
    })

    it("rejects an unknown feedback type", async () => {
        const response = await request(app, "/api/feedback", {
            method: "POST",
            headers: { cookie: authCookie },
            body: { type: "rant", title: "Title", description: "Description" }
        })

        expect(response.status).toBe(400)
    })

    it("rejects an empty title or description", async () => {
        const response = await request(app, "/api/feedback", {
            method: "POST",
            headers: { cookie: authCookie },
            body: { type: "bug", title: "", description: "Description" }
        })

        expect(response.status).toBe(400)
    })

    it("rate-limits repeated submissions from the same user", async () => {
        process.env.GITHUB_ISSUE_TOKEN = "test-token"
        mockRedis.incr.mockResolvedValue(999)

        const response = await request(app, "/api/feedback", {
            method: "POST",
            headers: { cookie: authCookie },
            body: { type: "bug", title: "Title", description: "Description" }
        })

        expect(response.status).toBe(429)
    })

    it("returns 502 without crashing when GITHUB_ISSUE_TOKEN isn't configured", async () => {
        delete process.env.GITHUB_ISSUE_TOKEN

        const response = await request(app, "/api/feedback", {
            method: "POST",
            headers: { cookie: authCookie },
            body: { type: "bug", title: "Title", description: "Description" }
        })

        expect(response.status).toBe(502)
    })

    it("creates a GitHub issue and never includes the user's id in the request", async () => {
        process.env.GITHUB_ISSUE_TOKEN = "test-token"
        const fetchMock = global.fetch as unknown as ReturnType<typeof import("vitest").vi.fn>
        // @ts-expect-error - test stub, real Response shape not needed
        fetchMock.mockResolvedValueOnce({
            status: 201,
            json: async () => ({ html_url: "https://github.com/Pacifinance/Pacifinance/issues/42", number: 42 })
        })

        const response = await request(app, "/api/feedback", {
            method: "POST",
            headers: { cookie: authCookie },
            body: { type: "idea", title: "Add dark mode", description: "Would love a dark theme", page: "/settings" }
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual({
            issueUrl: "https://github.com/Pacifinance/Pacifinance/issues/42",
            issueNumber: 42
        })

        expect(fetchMock).toHaveBeenCalledTimes(1)
        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe("https://api.github.com/repos/Pacifinance/Pacifinance/issues")
        expect(init.headers.authorization).toBe("Bearer test-token")
        const sentBody = JSON.parse(init.body)
        expect(sentBody.title).toBe("Add dark mode")
        expect(sentBody.labels).toEqual(["enhancement"])
        expect(JSON.stringify(sentBody)).not.toContain("user-uuid")
    })

    it("returns 502 when the GitHub API call fails", async () => {
        process.env.GITHUB_ISSUE_TOKEN = "test-token"
        const fetchMock = global.fetch as unknown as ReturnType<typeof import("vitest").vi.fn>
        // @ts-expect-error - test stub, real Response shape not needed
        fetchMock.mockResolvedValueOnce({ status: 403 })

        const response = await request(app, "/api/feedback", {
            method: "POST",
            headers: { cookie: authCookie },
            body: { type: "bug", title: "Title", description: "Description" }
        })

        expect(response.status).toBe(502)
    })
})
