import { describe, expect, it } from "vitest"

import app from "../src/index"
import { authCookie, request } from "./helpers/http"
import { mockDb, mockSupabase } from "./setup"

describe("private backend routes", () => {
    it("requires an access-token cookie for private routes", async () => {
        const response = await request(app, "/api/user/get", {method: "POST"})

        expect(response.status).toBe(401)
        expect(mockDb.users.getPublicInfoByUserId).not.toHaveBeenCalled()
    })

    it("accepts valid Supabase claims and exposes req.userId to route handlers", async () => {
        mockDb.users.getPublicInfoByUserId.mockResolvedValue({userId: "123456", nickname: "Test"})

        const response = await request(app, "/api/user/get", {
            method: "POST",
            headers: {cookie: authCookie}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual({userId: "123456", nickname: "Test"})
        expect(mockSupabase.auth.getClaims).toHaveBeenCalledWith("access-token")
        expect(mockDb.users.getPublicInfoByUserId).toHaveBeenCalledWith("user-uuid")
    })

    it("refreshes expired sessions and sets replacement cookies", async () => {
        mockSupabase.auth.getClaims.mockResolvedValue({data: null, error: {message: "expired"}})
        mockSupabase.auth.refreshSession.mockResolvedValue({
            data: {
                session: {
                    access_token: "new-access",
                    refresh_token: "new-refresh",
                    expires_in: 120
                },
                user: {id: "refreshed-user"}
            },
            error: null
        })
        mockDb.users.getPublicInfoByUserId.mockResolvedValue({userId: "654321"})

        const response = await request(app, "/api/user/get", {
            method: "POST",
            headers: {cookie: authCookie}
        })

        expect(response.status).toBe(200)
        expect(mockSupabase.auth.refreshSession).toHaveBeenCalledWith({refresh_token: "refresh-token"})
        expect(mockDb.users.getPublicInfoByUserId).toHaveBeenCalledWith("refreshed-user")
        expect(response.cookies.join("; ")).toContain("sb-access-token=new-access")
        expect(response.cookies.join("; ")).toContain("sb-refresh-token=new-refresh")
    })

    it("validates and normalizes balance inserts", async () => {
        const response = await request(app, "/api/balances/add", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {
                balance: {
                    date: "2024-05-20T00:00:00.000Z",
                    bank: "10.999",
                    cash: "5.2",
                    digital_services: "3",
                    stocks: "4",
                    etf: "5",
                    bitcoin: "6",
                    crypto: "7",
                    bonds: "8",
                    funds: "9",
                    gold: "10",
                    emergency_fund: 99
                }
            }
        })

        expect(response.status).toBe(200)
        expect(mockDb.balances.insertNew).toHaveBeenCalledWith(
            "user-uuid",
            expect.any(Date),
            10.99,
            5.2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
            99
        )
    })

    it("returns 400 for missing balance and expense payloads", async () => {
        await expect(request(app, "/api/balances/add", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {}
        })).resolves.toMatchObject({status: 400})

        await expect(request(app, "/api/expenses/add", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {}
        })).resolves.toMatchObject({status: 400})
    })

    it("forces income payment type to none before insertion", async () => {
        const response = await request(app, "/api/expenses/add", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {
                expense: {
                    date: "2024-05-20T00:00:00.000Z",
                    amount: "25.999",
                    is_expense: false,
                    payment_type: 2,
                    category_tag: 3,
                    notes: "monthly salary"
                }
            }
        })

        expect(response.status).toBe(200)
        expect(mockDb.expenses.insertNew).toHaveBeenCalledWith(
            "user-uuid",
            expect.any(Date),
            25.99,
            false,
            "monthly salary",
            0,
            3,
            null
        )
    })
})
