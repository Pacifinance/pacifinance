import { describe, expect, it, vi } from "vitest"

import app from "../src/index"
import { request } from "./helpers/http"
import { mockDb, mockRedis, mockSupabase } from "./setup"

describe("public backend routes", () => {
    it("serves health checks under /api and locale-prefixed URLs", async () => {
        await expect(request(app, "/api/health")).resolves.toMatchObject({status: 200, text: "OK"})
        await expect(request(app, "/it/api/health")).resolves.toMatchObject({status: 200, text: "OK"})
    })

    it("reports dependency health without exposing secrets", async () => {
        const response = await request(app, "/api/health/dependencies")

        expect(response.status).toBe(200)
        expect(response.json).toEqual({
            redis: {configured: true, ok: true},
            supabase: {configured: true},
            coingecko: {configured: false}
        })
        expect(mockRedis.ping).toHaveBeenCalled()
        expect(JSON.stringify(response.json)).not.toContain("redis-token")
        expect(JSON.stringify(response.json)).not.toContain("supabase-service-role")
    })

    it("rejects registration payloads with missing credentials", async () => {
        const response = await request(app, "/api/registration", {
            method: "POST",
            body: {turnstile_token: "token"}
        })

        expect(response.status).toBe(400)
        expect(mockRedis.set).not.toHaveBeenCalled()
        expect(mockDb.users.insertNew).not.toHaveBeenCalled()
    })

    it("registers a user after Turnstile verification and anti-replay storage", async () => {
        mockRedis.set.mockResolvedValue("OK")
        vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({
            success: true,
            hostname: "localhost"
        }), {status: 200, headers: {"content-type": "application/json"}}))

        const response = await request(app, "/api/registration", {
            method: "POST",
            body: {
                user_pwd: " password ",
                repeated_pwd: "password",
                turnstile_token: "turnstile-token"
            }
        })

        expect(response.status).toBe(200)
        expect(response.json.user_id).toMatch(/^\d{6}$/)
        expect(mockRedis.set).toHaveBeenCalledWith("turnstile:turnstile-token", "1", {nx: true, ex: 180})
        expect(mockDb.users.insertNew).toHaveBeenCalledWith(expect.stringMatching(/^\d{6}$/), "password")
    })

    it("returns 504 instead of hanging when Supabase registration does not resolve", async () => {
        process.env.REGISTRATION_STEP_TIMEOUT_MS = "20"
        mockRedis.set.mockResolvedValue("OK")
        mockDb.users.insertNew.mockReturnValue(new Promise(() => {}))
        vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({
            success: true,
            hostname: "localhost"
        }), {status: 200, headers: {"content-type": "application/json"}}))

        const response = await request(app, "/api/registration", {
            method: "POST",
            body: {
                user_pwd: "password",
                repeated_pwd: "password",
                turnstile_token: "turnstile-token"
            }
        })

        expect(response.status).toBe(504)
    })

    it("rejects replayed Turnstile tokens before calling Cloudflare", async () => {
        mockRedis.set.mockResolvedValue(null)

        const response = await request(app, "/api/registration", {
            method: "POST",
            body: {
                user_pwd: "password",
                repeated_pwd: "password",
                turnstile_token: "turnstile-token"
            }
        })

        expect(response.status).toBe(401)
        expect(fetch).not.toHaveBeenCalled()
    })

    it("sets auth cookies on login and clears deletion queue", async () => {
        mockSupabase.auth.signInWithPassword.mockResolvedValue({
            data: {
                session: {
                    access_token: "access",
                    refresh_token: "refresh",
                    expires_in: 3600
                },
                user: {id: "user-uuid"}
            },
            error: null
        })

        const response = await request(app, "/api/login", {
            method: "POST",
            body: {user_id: " 123456 ", password: " password "}
        })

        expect(response.status).toBe(200)
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
            email: "123456@users.pacifinance.internal",
            password: "password"
        })
        expect(mockDb.delqueue.removeFromQueueByUserId).toHaveBeenCalledWith("user-uuid")
        expect(response.cookies.join("; ")).toContain("sb-access-token=access")
        expect(response.cookies.join("; ")).toContain("sb-refresh-token=refresh")
    })
})
