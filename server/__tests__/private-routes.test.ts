import { describe, expect, it } from "vitest"

import app from "../src/index"
import { authCookie, request } from "./helpers/http"
import { mockDb, mockSupabase, mockCache } from "./setup"

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

    it("records and revokes explicit hosted benchmark consent", async () => {
        mockDb.users.setBenchmarkConsentByUserId.mockResolvedValue({benchmarkConsent: true})

        const optIn = await request(app, "/api/user/benchmark-consent", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {contribute: true}
        })
        expect(optIn.status).toBe(200)
        expect(optIn.json).toEqual({benchmarkConsent: true})

        mockDb.users.setBenchmarkConsentByUserId.mockResolvedValue({benchmarkConsent: false})
        const revoke = await request(app, "/api/user/benchmark-consent", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {contribute: false}
        })
        expect(revoke.status).toBe(200)
        expect(mockDb.benchmarkSnapshots.deleteProfilesByUserId).toHaveBeenCalledWith("user-uuid")
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
                    commodities: "10",
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
            null,
            null // balance_source: not provided in the payload
        )
    })

    it("persists a valid balance source and drops an invalid one", async () => {
        const addExpense = (balance_source: any) => request(app, "/api/expenses/add", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {
                expense: {
                    date: "2024-05-20T00:00:00.000Z",
                    amount: "10",
                    is_expense: true,
                    payment_type: 1,
                    category_tag: 3,
                    notes: "",
                    balance_source
                }
            }
        })

        // Valid: parent asset + liquidity sub-account
        let response = await addExpense({asset_key: "bank", detail_type: "liquidity", detail_id: 7})
        expect(response.status).toBe(200)
        expect(mockDb.expenses.insertNew).toHaveBeenLastCalledWith(
            "user-uuid", expect.any(Date), 10, true, "", 1, 3, null,
            {asset_key: "bank", detail_type: "liquidity", detail_id: 7}
        )

        // Invalid asset key: the source is dropped, the transaction still inserts
        response = await addExpense({asset_key: "not-an-asset", detail_type: "liquidity", detail_id: 7})
        expect(response.status).toBe(200)
        expect(mockDb.expenses.insertNew).toHaveBeenLastCalledWith(
            "user-uuid", expect.any(Date), 10, true, "", 1, 3, null, null
        )

        // Detail type without id: only the parent key survives
        response = await addExpense({asset_key: "cash", detail_type: "liquidity", detail_id: "abc"})
        expect(response.status).toBe(200)
        expect(mockDb.expenses.insertNew).toHaveBeenLastCalledWith(
            "user-uuid", expect.any(Date), 10, true, "", 1, 3, null,
            {asset_key: "cash", detail_type: null, detail_id: null}
        )
    })

    it("loads dashboard expenses with one batched monthly query", async () => {
        mockDb.expenses.getRecentMonthlyExpensesByUserId.mockResolvedValue([[{amount: 10}]])

        const response = await request(app, "/api/expenses/get", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual([[{amount: 10}]])
        expect(mockDb.expenses.getRecentMonthlyExpensesByUserId).toHaveBeenCalledWith("user-uuid", 13)
        expect(mockDb.expenses.getMonthlyExpensesByUserId).not.toHaveBeenCalled()
    })

    it("renames custom categories without changing their parent category", async () => {
        const response = await request(app, "/api/categories/rename", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {id: 1, label: " Groceries "}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual({id: 1, parentIndex: 0, parentType: 0, label: "Renamed"})
        expect(mockDb.categories.renameById).toHaveBeenCalledWith("user-uuid", 1, "Groceries")
    })

    it("returns all rankings through one aggregate route, read from the precomputed cache", async () => {
        // Rankings are precomputed monthly by the cron (server/src/cache/items/rankings.ts)
        // instead of live-queried per request - see server/src/routes/private/rank.ts.
        mockCache.get.mockImplementation(async (key: string) => key === "userRankings" ? {
            "user-uuid": {
                balance: 50, incomes: 50, outflows: 50,
                balanceSimilar: 100, incomesSimilar: 100, outflowsSimilar: 0
            }
        } : null)

        const response = await request(app, "/api/rank/get", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual({
            balance: 50,
            incomes: 50,
            outflows: 50,
            balanceSimilar: 100,
            incomesSimilar: 100,
            outflowsSimilar: 0
        })
        expect(mockDb.users.getTypeOfUserId).toHaveBeenCalledTimes(1)
        expect(mockCache.get).toHaveBeenCalledWith("userRankings")
        expect(mockDb.balances.getRankingPool).not.toHaveBeenCalled()
        expect(mockDb.expenses.getExpenseRankingPool).not.toHaveBeenCalled()
    })

    it("returns 503 from the rankings route before the cache has been populated", async () => {
        mockCache.get.mockResolvedValue(null)

        const response = await request(app, "/api/rank/get", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {}
        })

        expect(response.status).toBe(503)
    })

    it("serves rankings and averages through one benchmark summary request", async () => {
        const rankings = {balance: 10, incomes: 20, outflows: 30, balanceSimilar: 15, incomesSimilar: 25, outflowsSimilar: 35}
        const averages = {balances: 1000, expenses: 300, incomes: 2000, savingsRates: 40, expensesByCategory: {}, distributions: {}}
        mockCache.get.mockImplementation(async (key) => key === "userRankings"
            ? {"user-uuid": rankings}
            : {all: averages, "user-uuid": averages})

        const response = await request(app, "/api/benchmarks/summary", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual({rankings, averages: {all: averages, similar: averages}})
        expect(mockCache.get).toHaveBeenCalledWith("userRankings")
        expect(mockCache.get).toHaveBeenCalledWith("userAverages")
    })

    it("returns benchmark metadata without exposing cohort members", async () => {
        const benchmark = {
            generatedAt: "2026-07-01T00:00:00.000Z",
            populationSize: 120,
            minimumCohortSize: 20,
            cohortSizes: {balances: 24, incomes: 20, expenses: 22, savingsRates: 21},
            averageSimilarity: {balances: 0.8, incomes: 0.7, expenses: 0.75, savingsRates: 0.72}
        }
        mockCache.get.mockResolvedValue({
            all: {balances: 50000, expenses: 2000, incomes: 3000, savingsRates: 30, expensesByCategory: {}},
            "user-uuid": {balances: 45000, expenses: 1800, incomes: 2800, savingsRates: 32, expensesByCategory: {}, benchmark}
        })

        const response = await request(app, "/api/stats/averages", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {}
        })

        expect(response.status).toBe(200)
        expect(response.json.similar.benchmark).toEqual(benchmark)
        expect(JSON.stringify(response.json)).not.toContain("userIds")
    })

    it("searches canonical investment instruments from the verified catalog", async () => {
        mockDb.investments.searchInstruments.mockResolvedValue([
            {id: 1, kind: "stock", symbol: "AAPL", exchange: "NASDAQ", name: "Apple Inc.", verified: true}
        ])

        const response = await request(app, "/api/investments/instruments/search", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {query: " apple ", kind: "stock", limit: 50}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual([
            {id: 1, kind: "stock", symbol: "AAPL", exchange: "NASDAQ", name: "Apple Inc.", verified: true}
        ])
        expect(mockDb.investments.searchInstruments).toHaveBeenCalledWith("apple", "stock", 30, undefined)
    })

    it("saves detailed investment holdings only for existing instruments", async () => {
        mockDb.investments.insertHolding.mockResolvedValue({
            id: 9,
            assetKey: "stocks",
            positionType: "pac",
            instrument: {id: 1, symbol: "AAPL"}
        })

        const response = await request(app, "/api/investments/holdings/save", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {
                instrument_id: 1,
                asset_key: "stocks",
                position_type: "pac",
                quantity: "2.5",
                average_price: "150",
                current_value: "420",
                invested_amount: "375",
                currency: "eur",
                notes: "<b>long term</b>"
            }
        })

        expect(response.status).toBe(200)
        expect(response.json.id).toBe(9)
        expect(mockDb.investments.getInstrumentById).toHaveBeenCalledWith(1)
        expect(mockDb.investments.insertHolding).toHaveBeenCalledWith("user-uuid", {
            instrumentId: 1,
            assetKey: "stocks",
            positionType: "pac",
            quantity: 2.5,
            averagePrice: 150,
            currentValue: 420,
            investedAmount: 375,
            currency: "EUR",
            notes: "long term"
        })
    })

    it("rejects detailed holdings that reference unknown instruments", async () => {
        mockDb.investments.getInstrumentById.mockResolvedValue(null)

        const response = await request(app, "/api/investments/holdings/save", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {instrument_id: 999, asset_key: "stocks", position_type: "single"}
        })

        expect(response.status).toBe(400)
        expect(mockDb.investments.insertHolding).not.toHaveBeenCalled()
    })
})
