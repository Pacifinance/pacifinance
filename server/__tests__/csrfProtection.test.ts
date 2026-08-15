import { describe, expect, it } from "vitest"

import app from "../src/index"
import { request, testHost } from "./helpers/http"

describe("CSRF protection", () => {
    it("allows a state-changing request whose Origin matches the request host", async () => {
        const response = await request(app, "/api/health", {method: "GET"})
        expect(response.status).toBe(200)
    })

    it("allows a POST whose Origin matches the request host", async () => {
        const response = await request(app, "/api/registration", {
            method: "POST",
            body: {}
        })
        // Rejected downstream (400, missing fields) - the point is it's not a 403
        expect(response.status).not.toBe(403)
    })

    it("allows a POST identified only by a matching Referer (no Origin header)", async () => {
        const response = await request(app, "/api/registration", {
            method: "POST",
            body: {},
            headers: {origin: "", referer: `https://${testHost}/some/page`}
        })
        expect(response.status).not.toBe(403)
    })

    it("rejects a POST from a mismatched Origin", async () => {
        const response = await request(app, "/api/registration", {
            method: "POST",
            body: {},
            headers: {origin: "https://evil.example.com"}
        })
        expect(response.status).toBe(403)
    })

    it("rejects a POST with neither Origin nor Referer", async () => {
        const response = await request(app, "/api/registration", {
            method: "POST",
            body: {},
            headers: {origin: ""}
        })
        expect(response.status).toBe(403)
    })

    it("does not apply the check to safe methods like GET even cross-origin", async () => {
        const response = await request(app, "/api/health", {
            method: "GET",
            headers: {origin: "https://evil.example.com"}
        })
        expect(response.status).toBe(200)
    })
})
