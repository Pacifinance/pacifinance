import { describe, expect, it, vi } from "vitest"

import app from "../src/index"
import { request } from "./helpers/http"
import { mockDb, mockRedis, mockSupabase } from "./setup"
import { generateRecoveryCode, hashRecoveryCode } from "../src/db/recoveryCode"

describe("public backend routes", () => {
    it("serves health checks under /api and locale-prefixed URLs", async () => {
        await expect(request(app, "/api/health")).resolves.toMatchObject({status: 200, text: "OK"})
        await expect(request(app, "/it/api/health")).resolves.toMatchObject({status: 200, text: "OK"})
    })

    it("reports dependency health without exposing secrets", async () => {
        const response = await request(app, "/api/health/dependencies")
        const aliasResponse = await request(app, "/api/health-dependencies")

        expect(response.status).toBe(200)
        expect(response.json).toEqual({
            redis: {configured: true, ok: true},
            supabase: {configured: true, ok: true},
            coingecko: {configured: false}
        })
        expect(aliasResponse.status).toBe(200)
        expect(aliasResponse.json).toEqual(response.json)
        expect(mockRedis.ping).toHaveBeenCalledTimes(2)
        expect(mockSupabase.auth.admin.listUsers).toHaveBeenCalledTimes(2)
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
        // Registration also generates and returns a one-time recovery code
        // (only its hash is persisted, via setRecoveryCodeHash).
        expect(response.json.recovery_code_base32).toMatch(/^[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/)
        expect(response.json.recovery_code_words.split("-")).toHaveLength(10)
        expect(mockDb.users.setRecoveryCodeHash).toHaveBeenCalledWith("user-uuid", expect.stringMatching(/^[0-9a-f]{64}$/))
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

    describe("/recovery/reset-password", () => {
        const turnstileOk = () => {
            mockRedis.set.mockResolvedValue("OK")
            vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({
                success: true,
                hostname: "localhost"
            }), {status: 200, headers: {"content-type": "application/json"}}))
        }

        it("rejects payloads with missing fields", async () => {
            const response = await request(app, "/api/recovery/reset-password", {
                method: "POST",
                body: {user_id: "123456", turnstile_token: "token"}
            })
            expect(response.status).toBe(400)
            expect(mockDb.users.getRecoveryCodeHashByUserCode).not.toHaveBeenCalled()
        })

        it("rejects mismatched new passwords", async () => {
            const response = await request(app, "/api/recovery/reset-password", {
                method: "POST",
                body: {
                    user_id: "123456", recovery_code: "whatever",
                    new_pwd: "newpass1", repeated_pwd: "newpass2",
                    turnstile_token: "token"
                }
            })
            expect(response.status).toBe(400)
        })

        it("resets the password when the recovery code matches (block-code format) and invalidates it", async () => {
            turnstileOk()
            const code = generateRecoveryCode()
            mockDb.users.getRecoveryCodeHashByUserCode.mockResolvedValue({
                id: "user-uuid",
                recoveryCodeHash: hashRecoveryCode(code.bytes),
                recoveryCodeGeneratedAt: new Date().toISOString()
            })
            mockDb.users.setPasswordOfUserId.mockResolvedValue({id: "user-uuid"})

            const response = await request(app, "/api/recovery/reset-password", {
                method: "POST",
                body: {
                    user_id: "123456", recovery_code: code.base32,
                    new_pwd: "brandNewPassword1", repeated_pwd: "brandNewPassword1",
                    turnstile_token: "turnstile-token"
                }
            })

            expect(response.status).toBe(200)
            expect(mockDb.users.setPasswordOfUserId).toHaveBeenCalledWith("user-uuid", "brandNewPassword1")
            expect(mockDb.users.setRecoveryCodeHash).toHaveBeenCalledWith("user-uuid", null)
        })

        it("resets the password when the recovery code matches (word-phrase format)", async () => {
            turnstileOk()
            const code = generateRecoveryCode()
            mockDb.users.getRecoveryCodeHashByUserCode.mockResolvedValue({
                id: "user-uuid",
                recoveryCodeHash: hashRecoveryCode(code.bytes),
                recoveryCodeGeneratedAt: new Date().toISOString()
            })
            mockDb.users.setPasswordOfUserId.mockResolvedValue({id: "user-uuid"})

            const response = await request(app, "/api/recovery/reset-password", {
                method: "POST",
                body: {
                    user_id: "123456", recovery_code: code.words,
                    new_pwd: "brandNewPassword1", repeated_pwd: "brandNewPassword1",
                    turnstile_token: "turnstile-token"
                }
            })

            expect(response.status).toBe(200)
            expect(mockDb.users.setPasswordOfUserId).toHaveBeenCalledWith("user-uuid", "brandNewPassword1")
        })

        it("rejects a wrong recovery code without revealing why", async () => {
            turnstileOk()
            const code = generateRecoveryCode()
            const wrongCode = generateRecoveryCode()
            mockDb.users.getRecoveryCodeHashByUserCode.mockResolvedValue({
                id: "user-uuid",
                recoveryCodeHash: hashRecoveryCode(code.bytes),
                recoveryCodeGeneratedAt: new Date().toISOString()
            })

            const response = await request(app, "/api/recovery/reset-password", {
                method: "POST",
                body: {
                    user_id: "123456", recovery_code: wrongCode.base32,
                    new_pwd: "brandNewPassword1", repeated_pwd: "brandNewPassword1",
                    turnstile_token: "turnstile-token"
                }
            })

            expect(response.status).toBe(401)
            expect(mockDb.users.setPasswordOfUserId).not.toHaveBeenCalled()
        })

        it("rejects when no recovery code is configured for the account", async () => {
            turnstileOk()
            mockDb.users.getRecoveryCodeHashByUserCode.mockResolvedValue({
                id: "user-uuid", recoveryCodeHash: null, recoveryCodeGeneratedAt: null
            })

            const response = await request(app, "/api/recovery/reset-password", {
                method: "POST",
                body: {
                    user_id: "123456", recovery_code: "ABCD-EFGH-JKMN-PQRS",
                    new_pwd: "brandNewPassword1", repeated_pwd: "brandNewPassword1",
                    turnstile_token: "turnstile-token"
                }
            })

            expect(response.status).toBe(401)
        })

        it("rate-limits repeated attempts against the same account", async () => {
            turnstileOk()
            const code = generateRecoveryCode()
            mockDb.users.getRecoveryCodeHashByUserCode.mockResolvedValue({
                id: "user-uuid",
                recoveryCodeHash: hashRecoveryCode(code.bytes),
                recoveryCodeGeneratedAt: new Date().toISOString()
            })
            mockRedis.incr.mockResolvedValue(999)

            const response = await request(app, "/api/recovery/reset-password", {
                method: "POST",
                body: {
                    user_id: "123456", recovery_code: code.base32,
                    new_pwd: "brandNewPassword1", repeated_pwd: "brandNewPassword1",
                    turnstile_token: "turnstile-token"
                }
            })

            expect(response.status).toBe(429)
            expect(mockDb.users.getRecoveryCodeHashByUserCode).not.toHaveBeenCalled()
        })
    })
})
