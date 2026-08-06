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

    it("persists the set of already-notified gamification badges", async () => {
        mockDb.users.setSeenBadgesByUserId.mockResolvedValue({seenBadges: ["firstMonth", "firstSave"]})

        const response = await request(app, "/api/user/seen-badges", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {badge_ids: ["firstMonth", "firstSave"]}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual({seenBadges: ["firstMonth", "firstSave"]})
        expect(mockDb.users.setSeenBadgesByUserId).toHaveBeenCalledWith("user-uuid", ["firstMonth", "firstSave"])
    })

    it("rejects seen-badges payloads that aren't an array of strings", async () => {
        const response = await request(app, "/api/user/seen-badges", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {badge_ids: "not-an-array"}
        })

        expect(response.status).toBe(400)
        expect(mockDb.users.setSeenBadgesByUserId).not.toHaveBeenCalled()
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

    it("returns 400 for missing balance and transaction payloads", async () => {
        await expect(request(app, "/api/balances/add", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {}
        })).resolves.toMatchObject({status: 400})

        await expect(request(app, "/api/transactions/add", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {}
        })).resolves.toMatchObject({status: 400})
    })

    it("forces income payment type to none before insertion", async () => {
        const response = await request(app, "/api/transactions/add", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {
                transaction: {
                    date: "2024-05-20T00:00:00.000Z",
                    amount: "25.999",
                    direction: "income",
                    payment_type: 2,
                    category_tag: 3,
                    notes: "monthly salary"
                }
            }
        })

        expect(response.status).toBe(200)
        expect(mockDb.transactions.insertNew).toHaveBeenCalledWith(
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

    it("keeps the legacy expenses route as a compatibility alias", async () => {
        const response = await request(app, "/api/expenses/add", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {expense: {
                date: "2024-05-20T00:00:00.000Z",
                amount: 10,
                is_expense: true,
                payment_type: 1,
                category_tag: 3,
                notes: "legacy client",
            }},
        })

        expect(response.status).toBe(200)
        expect(mockDb.transactions.insertNew).toHaveBeenCalledWith(
            "user-uuid", expect.any(Date), 10, true, "legacy client", 1, 3, null, null,
        )
    })

    it("updates a transaction and its shared split through one backend operation", async () => {
        mockDb.transactions.updateExisting.mockResolvedValue({id: 42})

        const response = await request(app, "/api/transactions/update", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {transaction: {
                id: 42,
                date: "2026-07-18",
                amount: 24.96,
                direction: "outflow",
                payment_type: 2,
                category_tag: 3,
                notes: "Uber",
                shared_expense: {enabled: true, total_amount: 24.96, own_share: 6.24},
            }}
        })

        expect(response.status).toBe(200)
        expect(mockDb.transactions.updateExisting).toHaveBeenCalledWith("user-uuid", expect.objectContaining({
            id: 42,
            amount: 6.24,
            sharedMode: "set",
            sharedTotal: 24.96,
            sharedOwnShare: 6.24,
        }))
    })

    it("rejects an invalid shared split before updating the transaction", async () => {
        const response = await request(app, "/api/transactions/update", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {transaction: {
                id: 42, date: "2026-07-18", amount: 20, direction: "outflow",
                payment_type: 2, category_tag: 3, notes: "Uber",
                shared_expense: {enabled: true, total_amount: 20, own_share: 20},
            }}
        })

        expect(response.status).toBe(400)
        expect(mockDb.transactions.updateExisting).not.toHaveBeenCalled()
    })

    it("validates and inserts a transaction import as one batch", async () => {
        mockDb.transactions.insertBatch.mockResolvedValue([{id: 1}, {id: 2}])
        mockDb.sharedExpenses.insertImportedReceivables.mockResolvedValue([])
        mockDb.sharedExpenses.insertImportedReimbursements.mockResolvedValue([])
        const response = await request(app, "/api/transactions/batch-add", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {transactions: [
                {date: "2026-08-01", amount: "12.345", direction: "outflow", payment_type: 1, category_tag: 4, notes: "Lunch"},
                {date: "2026-08-02", amount: "20", direction: "income", payment_type: 3, category_tag: 0, notes: "Refund"},
            ]}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual({inserted: 2, transaction_ids: [1, 2], link_failures: 0})
        expect(mockDb.transactions.insertBatch).toHaveBeenCalledTimes(1)
        expect(mockDb.transactions.insertBatch).toHaveBeenCalledWith("user-uuid", [
            expect.objectContaining({amount: 12.34, isExpense: true, paymentType: 1, categoryTag: 4}),
            expect.objectContaining({amount: 20, isExpense: false, paymentType: 0, categoryTag: 0}),
        ])
    })

    it("persists shared-expense and reimbursement links in the same import request", async () => {
        mockDb.transactions.insertBatch.mockResolvedValue([{id: 10}, {id: 11}])
        mockDb.sharedExpenses.insertImportedReceivables.mockResolvedValue([{id: 4}])
        mockDb.sharedExpenses.insertImportedReimbursements.mockResolvedValue([{id: 5}])
        const response = await request(app, "/api/transactions/batch-add", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {transactions: [
                {date: "2026-08-01", amount: 40, cash_amount: 100, direction: "outflow", payment_type: 1,
                    category_tag: 4, notes: "Dinner", shared_expense: {own_share: 40}},
                {date: "2026-08-02", amount: 30, direction: "income", payment_type: 0,
                    category_tag: 0, notes: "Refund", reimbursement_receivable_id: 7},
            ]},
        })

        expect(response.status).toBe(200)
        expect(mockDb.transactions.insertBatch).toHaveBeenCalledWith("user-uuid", [
            expect.objectContaining({amount: 40, cashAmount: 100, excludeFromStatistics: false}),
            expect.objectContaining({amount: 30, excludeFromStatistics: true}),
        ])
        expect(mockDb.sharedExpenses.insertImportedReceivables).toHaveBeenCalledWith("user-uuid", [
            expect.objectContaining({expenseId: 10, totalAmount: 100, ownShare: 40}),
        ])
        expect(mockDb.sharedExpenses.insertImportedReimbursements).toHaveBeenCalledWith("user-uuid", [
            {expenseId: 11, receivableId: 7, amount: 30},
        ])
    })

    it("links a reimbursement to a shared expense created by the same batch", async () => {
        mockDb.transactions.insertBatch.mockResolvedValue([{id: 20}, {id: 21}])
        mockDb.sharedExpenses.insertImportedReceivables.mockResolvedValue([{id: 9}])
        mockDb.sharedExpenses.insertImportedReimbursements.mockResolvedValue([{id: 10}])
        const response = await request(app, "/api/transactions/batch-add", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {transactions: [
                {date: "2026-08-01", amount: 40, cash_amount: 100, direction: "outflow", payment_type: 1,
                    category_tag: 4, notes: "Dinner", shared_expense: {own_share: 40, client_ref: "shared:3"}},
                {date: "2026-08-02", amount: 30, direction: "income", payment_type: 0,
                    category_tag: 0, notes: "Refund", reimbursement_shared_expense_ref: "shared:3"},
            ]},
        })

        expect(response.status).toBe(200)
        expect(mockDb.sharedExpenses.insertImportedReimbursements).toHaveBeenCalledWith("user-uuid", [
            {expenseId: 21, sharedRef: "shared:3", receivableId: 9, amount: 30},
        ])
    })

    it("rejects empty, oversized, or partially invalid transaction batches", async () => {
        const callBatch = (transactions: unknown[]) => request(app, "/api/transactions/batch-add", {
            method: "POST", headers: {cookie: authCookie}, body: {transactions}
        })
        await expect(callBatch([])).resolves.toMatchObject({status: 400})
        await expect(callBatch(Array.from({length: 501}, () => ({})))).resolves.toMatchObject({status: 400})
        await expect(callBatch([
            {date: "2026-08-01", amount: 10, direction: "outflow", payment_type: 1, category_tag: 4},
            {date: "2026-08-01", amount: "invalid", direction: "outflow", payment_type: 1, category_tag: 4},
        ])).resolves.toMatchObject({status: 400})
        expect(mockDb.transactions.insertBatch).not.toHaveBeenCalled()
    })

    it("persists a valid balance source and drops an invalid one", async () => {
        const addTransaction = (balance_source: any) => request(app, "/api/transactions/add", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {
                transaction: {
                    date: "2024-05-20T00:00:00.000Z",
                    amount: "10",
                    direction: "outflow",
                    payment_type: 1,
                    category_tag: 3,
                    notes: "",
                    balance_source
                }
            }
        })

        // Valid: parent asset + liquidity sub-account
        let response = await addTransaction({asset_key: "bank", detail_type: "liquidity", detail_id: 7})
        expect(response.status).toBe(200)
        expect(mockDb.transactions.insertNew).toHaveBeenLastCalledWith(
            "user-uuid", expect.any(Date), 10, true, "", 1, 3, null,
            {asset_key: "bank", detail_type: "liquidity", detail_id: 7}
        )

        // Invalid asset key: the source is dropped, the transaction still inserts
        response = await addTransaction({asset_key: "not-an-asset", detail_type: "liquidity", detail_id: 7})
        expect(response.status).toBe(200)
        expect(mockDb.transactions.insertNew).toHaveBeenLastCalledWith(
            "user-uuid", expect.any(Date), 10, true, "", 1, 3, null, null
        )

        // Detail type without id: only the parent key survives
        response = await addTransaction({asset_key: "cash", detail_type: "liquidity", detail_id: "abc"})
        expect(response.status).toBe(200)
        expect(mockDb.transactions.insertNew).toHaveBeenLastCalledWith(
            "user-uuid", expect.any(Date), 10, true, "", 1, 3, null,
            {asset_key: "cash", detail_type: null, detail_id: null}
        )
    })

    it("loads dashboard transactions with one batched monthly query", async () => {
        mockDb.transactions.getRecentMonthlyTransactionsByUserId.mockResolvedValue([[{amount: 10}]])

        const response = await request(app, "/api/transactions/get", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual([[{amount: 10}]])
        expect(mockDb.transactions.getRecentMonthlyTransactionsByUserId).toHaveBeenCalledWith("user-uuid", 13)
        expect(mockDb.transactions.getMonthlyTransactionsByUserId).not.toHaveBeenCalled()
    })

    it("reports a server error instead of empty months when the batched monthly query fails", async () => {
        // A genuine DB read failure must surface as an error, not silently look
        // like "the user has no transactions this month" (which would zero out
        // the whole dashboard instead of prompting a retry).
        mockDb.transactions.getRecentMonthlyTransactionsByUserId.mockResolvedValue(null)

        const response = await request(app, "/api/transactions/get", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {}
        })

        expect(response.status).toBe(500)
    })

    it("serves cached exchange rates, refreshing the cache when expired", async () => {
        mockCache.valueExpired.mockResolvedValueOnce(true)
        mockCache.get.mockResolvedValueOnce({EUR: 1, USD: 1.08})

        const response = await request(app, "/api/exchange-rates", {
            method: "GET",
            headers: {cookie: authCookie}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual({EUR: 1, USD: 1.08})
        expect(mockCache.valueExpired).toHaveBeenCalledWith("exchangeRates")
        expect(mockCache.invalidate).toHaveBeenCalledWith("exchangeRates")
        expect(mockCache.get).toHaveBeenCalledWith("exchangeRates")
    })

    it("skips refreshing exchange rates when the cached value is still fresh", async () => {
        mockCache.valueExpired.mockResolvedValueOnce(false)
        mockCache.get.mockResolvedValueOnce({EUR: 1, USD: 1.08})

        const response = await request(app, "/api/exchange-rates", {
            method: "GET",
            headers: {cookie: authCookie}
        })

        expect(response.status).toBe(200)
        expect(mockCache.invalidate).not.toHaveBeenCalled()
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
        expect(mockDb.transactions.getTransactionRankingPool).not.toHaveBeenCalled()
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
        expect(mockDb.investments.searchInstruments).toHaveBeenCalledWith("apple", "user-uuid", "stock", 30, undefined)
    })

    it("batch-resolves multiple ISINs in one call", async () => {
        mockDb.investments.searchInstrumentsByIsins.mockResolvedValue({
            US0378331005: {id: 1, kind: "stock", symbol: "AAPL", verified: true},
            US5949181045: null
        })

        const response = await request(app, "/api/investments/instruments/search-by-isins", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {isins: ["US0378331005", "US5949181045"]}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual({
            US0378331005: {id: 1, kind: "stock", symbol: "AAPL", verified: true},
            US5949181045: null
        })
        expect(mockDb.investments.searchInstrumentsByIsins).toHaveBeenCalledWith(["US0378331005", "US5949181045"], "user-uuid")
    })

    it("returns an empty map for a batch ISIN search with no isins, without querying the DB", async () => {
        const response = await request(app, "/api/investments/instruments/search-by-isins", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {isins: []}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual({})
        expect(mockDb.investments.searchInstrumentsByIsins).not.toHaveBeenCalled()
    })

    it("creates a private, unverified instrument when search finds no match", async () => {
        const response = await request(app, "/api/investments/instruments/manual", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {kind: "stock", symbol: "mystock", name: "My Stock", currency: "eur"}
        })

        expect(response.status).toBe(200)
        expect(response.json).toMatchObject({provider: "manual", verified: false})
        expect(mockDb.investments.createManualInstrument).toHaveBeenCalledWith("user-uuid", {
            kind: "stock", symbol: "mystock", name: "My Stock", currency: "EUR"
        })
    })

    it("rejects a manual instrument request with an invalid kind or empty symbol/name", async () => {
        const response = await request(app, "/api/investments/instruments/manual", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {kind: "not-a-kind", symbol: "X", name: "Y"}
        })

        expect(response.status).toBe(400)
        expect(mockDb.investments.createManualInstrument).not.toHaveBeenCalled()
    })

    it("saves detailed investment holdings only for existing instruments", async () => {
        mockDb.investments.insertHolding.mockResolvedValue({
            status: "ok",
            holding: {
                id: 9,
                assetKey: "stocks",
                positionType: "pac",
                instrument: {id: 1, symbol: "AAPL"}
            }
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
        expect(mockDb.investments.getInstrumentById).toHaveBeenCalledWith(1, "user-uuid")
        expect(mockDb.investments.insertHolding).toHaveBeenCalledWith("user-uuid", {
            instrumentId: 1,
            assetKey: "stocks",
            positionType: "pac",
            quantity: 2.5,
            averagePrice: 150,
            currentValue: 420,
            investedAmount: 375,
            currency: "EUR",
            notes: "long term",
            importSource: null
        }, undefined)
    })

    it("rejects detailed holdings that reference unknown or inaccessible instruments (getInstrumentById scopes to public + own private rows)", async () => {
        mockDb.investments.getInstrumentById.mockResolvedValue(null)

        const response = await request(app, "/api/investments/holdings/save", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {instrument_id: 999, asset_key: "stocks", position_type: "single"}
        })

        expect(response.status).toBe(400)
        expect(mockDb.investments.insertHolding).not.toHaveBeenCalled()
    })

    it("backfills a holding's monthly history", async () => {
        mockDb.investments.upsertHoldingHistoryEntry.mockResolvedValue({
            status: "ok",
            entry: {id: 20, holdingId: 16, userDate: "2026-07-01", currentValue: null, investedAmount: 12.44}
        })

        const response = await request(app, "/api/investments/holdings/history/save", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {holding_id: 16, user_date: "2026-07-01", current_value: null, invested_amount: 12.44}
        })

        expect(response.status).toBe(200)
        expect(response.json).toMatchObject({id: 20})
        expect(mockDb.investments.upsertHoldingHistoryEntry).toHaveBeenCalledWith(
            "user-uuid", 16, new Date("2026-07-01"), {currentValue: null, investedAmount: 12.44}
        )
    })

    it("passes an explicit quantity through for a monthly backfill (the import wizard's own reconstructed quantity for that month)", async () => {
        mockDb.investments.upsertHoldingHistoryEntry.mockResolvedValue({
            status: "ok",
            entry: {id: 21, holdingId: 16, userDate: "2024-01-01", currentValue: null, investedAmount: 1000, quantity: 10}
        })

        const response = await request(app, "/api/investments/holdings/history/save", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {holding_id: 16, user_date: "2024-01-01", current_value: null, invested_amount: 1000, quantity: 10}
        })

        expect(response.status).toBe(200)
        expect(mockDb.investments.upsertHoldingHistoryEntry).toHaveBeenCalledWith(
            "user-uuid", 16, new Date("2024-01-01"), {currentValue: null, investedAmount: 1000, quantity: 10}
        )
    })

    it("omits quantity (denormalize from the live holding) when the request doesn't send one", async () => {
        mockDb.investments.upsertHoldingHistoryEntry.mockResolvedValue({
            status: "ok",
            entry: {id: 22, holdingId: 16, userDate: "2026-07-01", currentValue: 2000, investedAmount: 1500}
        })

        await request(app, "/api/investments/holdings/history/save", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {holding_id: 16, user_date: "2026-07-01", current_value: 2000, invested_amount: 1500}
        })

        const call = mockDb.investments.upsertHoldingHistoryEntry.mock.calls[0]
        expect(call[3].quantity).toBeUndefined()
    })

    it("rejects a history save with an invalid quantity", async () => {
        const response = await request(app, "/api/investments/holdings/history/save", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {holding_id: 16, user_date: "2024-01-01", current_value: null, invested_amount: 1000, quantity: -5}
        })

        expect(response.status).toBe(400)
        expect(mockDb.investments.upsertHoldingHistoryEntry).not.toHaveBeenCalled()
    })

    it("rejects a history save with a reason when the payload is malformed", async () => {
        const response = await request(app, "/api/investments/holdings/history/save", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {holding_id: "not-a-number", user_date: "2026-07-01", current_value: null, invested_amount: 12.44}
        })

        expect(response.status).toBe(400)
        expect(response.json).toEqual({error: "invalid holding_id"})
        expect(mockDb.investments.upsertHoldingHistoryEntry).not.toHaveBeenCalled()
    })

    it("rejects a history save dated in the future, with a reason", async () => {
        const response = await request(app, "/api/investments/holdings/history/save", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {holding_id: 16, user_date: "2999-01-01", current_value: null, invested_amount: 12.44}
        })

        expect(response.status).toBe(400)
        expect(response.json).toEqual({error: "user_date is in the future"})
    })

    it("returns a reason when the holding doesn't exist or isn't owned by this user", async () => {
        mockDb.investments.upsertHoldingHistoryEntry.mockResolvedValue({status: "not_found"})

        const response = await request(app, "/api/investments/holdings/history/save", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {holding_id: 999, user_date: "2026-07-01", current_value: null, invested_amount: 12.44}
        })

        expect(response.status).toBe(400)
        expect(response.json).toEqual({error: "holding not found, or not owned by this user"})
    })

    it("returns 500 with the real reason when the history upsert fails for a DB-level reason (e.g. missing unique constraint)", async () => {
        mockDb.investments.upsertHoldingHistoryEntry.mockResolvedValue({
            status: "db_error", message: "there is no unique or exclusion constraint matching the ON CONFLICT specification"
        })

        const response = await request(app, "/api/investments/holdings/history/save", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {holding_id: 16, user_date: "2026-07-01", current_value: null, invested_amount: 12.44}
        })

        expect(response.status).toBe(500)
        expect(response.json).toEqual({error: "there is no unique or exclusion constraint matching the ON CONFLICT specification"})
    })

    it("saves a whole batch of monthly history rows in one request", async () => {
        mockDb.investments.upsertHoldingHistoryBatch.mockResolvedValue({savedCount: 2, errors: []})

        const response = await request(app, "/api/investments/holdings/history/save-batch", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {
                entries: [
                    {holding_id: 16, user_date: "2024-01-01", current_value: null, invested_amount: 1000, quantity: 10},
                    {holding_id: 16, user_date: "2024-02-01", current_value: null, invested_amount: 1200, quantity: 12},
                ]
            }
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual({savedCount: 2, errors: []})
        expect(mockDb.investments.upsertHoldingHistoryBatch).toHaveBeenCalledWith("user-uuid", [
            {holdingId: 16, userDate: new Date("2024-01-01"), currentValue: null, investedAmount: 1000, quantity: 10},
            {holdingId: 16, userDate: new Date("2024-02-01"), currentValue: null, investedAmount: 1200, quantity: 12},
        ])
    })

    it("skips malformed rows in a history batch (reporting them) instead of rejecting the whole request", async () => {
        mockDb.investments.upsertHoldingHistoryBatch.mockResolvedValue({savedCount: 1, errors: []})

        const response = await request(app, "/api/investments/holdings/history/save-batch", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {
                entries: [
                    {holding_id: 16, user_date: "2024-01-01", current_value: null, invested_amount: 1000},
                    {holding_id: "not-a-number", user_date: "2024-02-01", current_value: null, invested_amount: 500},
                ]
            }
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual({savedCount: 1, errors: ["invalid holding_id"]})
        expect(mockDb.investments.upsertHoldingHistoryBatch).toHaveBeenCalledWith(
            "user-uuid", [{holdingId: 16, userDate: new Date("2024-01-01"), currentValue: null, investedAmount: 1000}],
        )
    })

    it("treats a missing/non-array entries field as an empty batch", async () => {
        mockDb.investments.upsertHoldingHistoryBatch.mockResolvedValue({savedCount: 0, errors: []})

        const response = await request(app, "/api/investments/holdings/history/save-batch", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {}
        })

        expect(response.status).toBe(200)
        expect(mockDb.investments.upsertHoldingHistoryBatch).toHaveBeenCalledWith("user-uuid", [])
    })

    it("saves a dividend payment", async () => {
        mockDb.investments.getInstrumentById.mockResolvedValue({id: 1, symbol: "V", name: "Visa"})
        mockDb.investments.upsertDividend.mockResolvedValue({
            id: 5, instrumentId: 1, holdingId: 16, amount: 0.29, currency: "EUR", grossAmount: 0.29,
            paidDate: "2026-06-01", externalId: "EXT-1", source: "trading212", recordedAt: "2026-06-01T00:00:00Z"
        })

        const response = await request(app, "/api/investments/dividends/save", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {
                instrument_id: 1, holding_id: 16, amount: 0.29, currency: "eur", gross_amount: 0.29,
                paid_date: "2026-06-01", external_id: "EXT-1", source: "trading212"
            }
        })

        expect(response.status).toBe(200)
        expect(response.json).toMatchObject({id: 5, amount: 0.29})
        expect(mockDb.investments.upsertDividend).toHaveBeenCalledWith("user-uuid", {
            instrumentId: 1, holdingId: 16, amount: 0.29, currency: "EUR", grossAmount: 0.29,
            paidDate: new Date("2026-06-01"), externalId: "EXT-1", source: "trading212"
        })
    })

    it("rejects a dividend save with a reason when the payload is malformed", async () => {
        const response = await request(app, "/api/investments/dividends/save", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {instrument_id: 1, amount: -5, paid_date: "2026-06-01", source: "trading212"}
        })

        expect(response.status).toBe(400)
        expect(response.json).toEqual({error: "amount must be a non-negative number"})
        expect(mockDb.investments.upsertDividend).not.toHaveBeenCalled()
    })

    it("rejects a dividend save for an instrument that doesn't exist or isn't owned by this user", async () => {
        mockDb.investments.getInstrumentById.mockResolvedValue(null)

        const response = await request(app, "/api/investments/dividends/save", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {instrument_id: 999, amount: 1, paid_date: "2026-06-01", source: "trading212"}
        })

        expect(response.status).toBe(400)
        expect(mockDb.investments.upsertDividend).not.toHaveBeenCalled()
    })

    it("saves a whole batch of dividend payments in one request", async () => {
        mockDb.investments.upsertDividendsBatch.mockResolvedValue({savedCount: 2, errors: []})

        const response = await request(app, "/api/investments/dividends/save-batch", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {
                entries: [
                    {instrument_id: 1, holding_id: 16, amount: 0.29, currency: "eur", gross_amount: 0.29, paid_date: "2026-06-01", external_id: "EXT-1", source: "trading212"},
                    {instrument_id: 1, holding_id: 16, amount: 20.95, currency: "eur", gross_amount: 20.95, paid_date: "2025-01-15", source: "directa"},
                ]
            }
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual({savedCount: 2, errors: []})
        expect(mockDb.investments.upsertDividendsBatch).toHaveBeenCalledWith("user-uuid", [
            {instrumentId: 1, holdingId: 16, amount: 0.29, currency: "EUR", grossAmount: 0.29, paidDate: new Date("2026-06-01"), externalId: "EXT-1", source: "trading212"},
            {instrumentId: 1, holdingId: 16, amount: 20.95, currency: "EUR", grossAmount: 20.95, paidDate: new Date("2025-01-15"), externalId: null, source: "directa"},
        ])
    })

    it("skips malformed rows in a dividend batch (reporting them) instead of rejecting the whole request", async () => {
        mockDb.investments.upsertDividendsBatch.mockResolvedValue({savedCount: 0, errors: []})

        const response = await request(app, "/api/investments/dividends/save-batch", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {entries: [{instrument_id: 1, amount: -5, paid_date: "2026-06-01", source: "trading212"}]}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual({savedCount: 0, errors: ["amount must be a non-negative number"]})
        expect(mockDb.investments.upsertDividendsBatch).toHaveBeenCalledWith("user-uuid", [])
    })

    it("returns the per-instrument dividends summary", async () => {
        mockDb.investments.getDividendsSummaryByUserId.mockResolvedValue([
            {instrumentId: 1, symbol: "V", name: "Visa", totalAmount: 0.6, paymentCount: 2, lastPaidDate: "2026-06-01"}
        ])

        const response = await request(app, "/api/investments/dividends/summary", {
            method: "POST",
            headers: {cookie: authCookie}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual([
            {instrumentId: 1, symbol: "V", name: "Visa", totalAmount: 0.6, paymentCount: 2, lastPaidDate: "2026-06-01"}
        ])
    })

    it("saves a buy/sell transaction", async () => {
        mockDb.investments.getInstrumentById.mockResolvedValue({id: 1, symbol: "AAPL", name: "Apple"})
        mockDb.investments.upsertTransaction.mockResolvedValue({
            id: 7, instrumentId: 1, holdingId: 16, side: "buy", quantity: 2, price: 150, currency: "USD",
            total: 279.5, totalCurrency: "USD", tradeDate: "2022-01-13", externalId: "EXT-9", source: "trading212",
            recordedAt: "2022-01-13T00:00:00Z"
        })

        const response = await request(app, "/api/investments/transactions/save", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {
                instrument_id: 1, holding_id: 16, side: "buy", quantity: 2, price: 150, currency: "usd",
                total: 279.5, total_currency: "usd", trade_date: "2022-01-13", external_id: "EXT-9", source: "trading212"
            }
        })

        expect(response.status).toBe(200)
        expect(response.json).toMatchObject({id: 7, side: "buy", quantity: 2})
        expect(mockDb.investments.upsertTransaction).toHaveBeenCalledWith("user-uuid", {
            instrumentId: 1, holdingId: 16, side: "buy", quantity: 2, price: 150, currency: "USD",
            total: 279.5, totalCurrency: "USD", tradeDate: new Date("2022-01-13"), externalId: "EXT-9", source: "trading212"
        })
    })

    it("rejects a transaction save with a reason when the payload is malformed", async () => {
        const response = await request(app, "/api/investments/transactions/save", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {instrument_id: 1, side: "hold", quantity: 2, trade_date: "2022-01-13", source: "trading212"}
        })

        expect(response.status).toBe(400)
        expect(response.json).toEqual({error: "side must be 'buy' or 'sell'"})
        expect(mockDb.investments.upsertTransaction).not.toHaveBeenCalled()
    })

    it("rejects a transaction save for an instrument that doesn't exist or isn't owned by this user", async () => {
        mockDb.investments.getInstrumentById.mockResolvedValue(null)

        const response = await request(app, "/api/investments/transactions/save", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {instrument_id: 999, side: "buy", quantity: 2, trade_date: "2022-01-13", source: "trading212"}
        })

        expect(response.status).toBe(400)
        expect(mockDb.investments.upsertTransaction).not.toHaveBeenCalled()
    })

    it("saves a whole batch of buy/sell transactions in one request", async () => {
        mockDb.investments.saveTransactionsBatch.mockResolvedValue({savedCount: 2, errors: []})

        const response = await request(app, "/api/investments/transactions/save-batch", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {
                entries: [
                    {instrument_id: 1, holding_id: 16, side: "buy", quantity: 2, price: 150, currency: "usd", total: 279.5, total_currency: "usd", trade_date: "2022-01-13", external_id: "EXT-9", source: "trading212"},
                    {instrument_id: 1, holding_id: 16, side: "sell", quantity: 1, price: 160, currency: "usd", total: 160, total_currency: "usd", trade_date: "2023-05-01", source: "trading212"},
                ]
            }
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual({savedCount: 2, errors: []})
        expect(mockDb.investments.saveTransactionsBatch).toHaveBeenCalledWith("user-uuid", [
            {instrumentId: 1, holdingId: 16, side: "buy", quantity: 2, price: 150, currency: "USD", total: 279.5, totalCurrency: "USD", tradeDate: new Date("2022-01-13"), externalId: "EXT-9", source: "trading212"},
            {instrumentId: 1, holdingId: 16, side: "sell", quantity: 1, price: 160, currency: "USD", total: 160, totalCurrency: "USD", tradeDate: new Date("2023-05-01"), externalId: null, source: "trading212"},
        ])
    })

    it("skips malformed rows in a transaction batch (reporting them) instead of rejecting the whole request", async () => {
        mockDb.investments.saveTransactionsBatch.mockResolvedValue({savedCount: 0, errors: []})

        const response = await request(app, "/api/investments/transactions/save-batch", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {entries: [{instrument_id: 1, side: "hold", quantity: 2, trade_date: "2022-01-13", source: "trading212"}]}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual({savedCount: 0, errors: ["side must be 'buy' or 'sell'"]})
        expect(mockDb.investments.saveTransactionsBatch).toHaveBeenCalledWith("user-uuid", [])
    })

    it("returns the full transaction history for the user", async () => {
        mockDb.investments.getTransactionsByUserId.mockResolvedValue([
            {
                instrumentId: 1, isin: "US0378331005", symbol: "AAPL", name: "Apple", side: "buy", quantity: 2,
                price: 150, currency: "USD", total: 279.5, totalCurrency: "USD", tradeDate: "2022-01-13", externalId: "EXT-9"
            }
        ])

        const response = await request(app, "/api/investments/transactions/get", {
            method: "POST",
            headers: {cookie: authCookie}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual([
            {
                instrumentId: 1, isin: "US0378331005", symbol: "AAPL", name: "Apple", side: "buy", quantity: 2,
                price: 150, currency: "USD", total: 279.5, totalCurrency: "USD", tradeDate: "2022-01-13", externalId: "EXT-9"
            }
        ])
    })

    it("refreshes holding prices using cached exchange rates, refreshing the cache when expired", async () => {
        mockCache.valueExpired.mockResolvedValueOnce(true)
        mockCache.get.mockResolvedValueOnce({EUR: 1, USD: 1.08})
        mockDb.investments.refreshHoldingPrices.mockResolvedValue([
            {id: 16, currentValue: 1739.13}
        ])

        const response = await request(app, "/api/investments/holdings/refresh-prices", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual([{id: 16, currentValue: 1739.13}])
        expect(mockCache.invalidate).toHaveBeenCalledWith("exchangeRates")
        expect(mockDb.investments.refreshHoldingPrices).toHaveBeenCalledWith("user-uuid", {EUR: 1, USD: 1.08})
    })

    it("returns 503 for a price refresh when exchange rates aren't available", async () => {
        mockCache.valueExpired.mockResolvedValueOnce(true)
        mockCache.get.mockResolvedValueOnce(null)

        const response = await request(app, "/api/investments/holdings/refresh-prices", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {}
        })

        expect(response.status).toBe(503)
        expect(mockDb.investments.refreshHoldingPrices).not.toHaveBeenCalled()
    })

    it("backfills historical prices using cached exchange rates", async () => {
        mockCache.valueExpired.mockResolvedValueOnce(false)
        mockCache.get.mockResolvedValueOnce({EUR: 1, USD: 1.08})
        mockDb.investments.backfillHistoricalPrices.mockResolvedValue([{holdingId: 16, monthsFilled: 12}])

        const response = await request(app, "/api/investments/holdings/backfill-historical-prices", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual([{holdingId: 16, monthsFilled: 12}])
        expect(mockDb.investments.backfillHistoricalPrices).toHaveBeenCalledWith("user-uuid", {EUR: 1, USD: 1.08})
    })

    it("returns 503 for a historical price backfill when exchange rates aren't available", async () => {
        mockCache.valueExpired.mockResolvedValueOnce(true)
        mockCache.get.mockResolvedValueOnce(null)

        const response = await request(app, "/api/investments/holdings/backfill-historical-prices", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {}
        })

        expect(response.status).toBe(503)
        expect(mockDb.investments.backfillHistoricalPrices).not.toHaveBeenCalled()
    })

    it("reads the monthly investment target setting", async () => {
        mockDb.investments.getInvestmentSettings.mockResolvedValue({monthlyTarget: 300})

        const response = await request(app, "/api/investments/settings/get", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual({monthlyTarget: 300})
        expect(mockDb.investments.getInvestmentSettings).toHaveBeenCalledWith("user-uuid")
    })

    it("saves the monthly investment target setting", async () => {
        mockDb.investments.saveInvestmentSettings.mockResolvedValue({monthlyTarget: 250})

        const response = await request(app, "/api/investments/settings/save", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {monthly_target: 250}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual({monthlyTarget: 250})
        expect(mockDb.investments.saveInvestmentSettings).toHaveBeenCalledWith("user-uuid", 250, null)
    })

    it("allows clearing the monthly investment target by sending an empty value", async () => {
        mockDb.investments.saveInvestmentSettings.mockResolvedValue({monthlyTarget: null})

        const response = await request(app, "/api/investments/settings/save", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {monthly_target: null}
        })

        expect(response.status).toBe(200)
        expect(mockDb.investments.saveInvestmentSettings).toHaveBeenCalledWith("user-uuid", null, null)
    })

    it("saves both monthly investment thresholds", async () => {
        mockDb.investments.saveInvestmentSettings.mockResolvedValue({monthlyTarget: 250, monthlyTargetPercent: 15})
        const response = await request(app, "/api/investments/settings/save", {
            method: "POST", headers: {cookie: authCookie}, body: {monthly_target: 250, monthly_target_percent: 15},
        })
        expect(response.status).toBe(200)
        expect(mockDb.investments.saveInvestmentSettings).toHaveBeenCalledWith("user-uuid", 250, 15)
    })

    it("rejects an invalid (non-numeric) monthly investment target", async () => {
        const response = await request(app, "/api/investments/settings/save", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {monthly_target: "not-a-number"}
        })

        expect(response.status).toBe(400)
        expect(mockDb.investments.saveInvestmentSettings).not.toHaveBeenCalled()
    })

    it("returns 500 when saving the monthly investment target fails", async () => {
        mockDb.investments.saveInvestmentSettings.mockResolvedValue(null)

        const response = await request(app, "/api/investments/settings/save", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {monthly_target: 250}
        })

        expect(response.status).toBe(500)
    })

    it("submits a community price, converting it to EUR using cached exchange rates", async () => {
        mockDb.investments.getInstrumentById.mockResolvedValue({id: 1, kind: "stock", symbol: "AAPL", name: "Apple Inc", currency: "USD"})
        mockCache.valueExpired.mockResolvedValueOnce(false)
        mockCache.get.mockResolvedValueOnce({EUR: 1, USD: 1.1})
        mockDb.investments.submitCommunityPrice.mockResolvedValue({
            status: "ok",
            submission: {id: 1, instrumentId: 1, monthKey: "2020-01", priceEur: 136.36, rawPrice: 150, rawCurrency: "USD", status: "pending", submittedBy: "user-uuid", submittedAt: "2026-01-01T00:00:00Z", verifiedBy: null, verifiedAt: null, rejectionNote: null},
        })

        const response = await request(app, "/api/investments/community-prices/submit", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {instrument_id: 1, month_key: "2020-01", reference_date: "2020-01-31", raw_price: 150, raw_currency: "USD"}
        })

        expect(response.status).toBe(200)
        expect(response.json).toMatchObject({status: "pending", rawPrice: 150})
        expect(mockDb.investments.submitCommunityPrice).toHaveBeenCalledWith(
            "user-uuid", {instrumentId: 1, monthKey: "2020-01", referenceDate: "2020-01-31", rawPrice: 150, rawCurrency: "USD"}, {EUR: 1, USD: 1.1},
        )
    })

    it("rejects a community price submission for a month in the future", async () => {
        const response = await request(app, "/api/investments/community-prices/submit", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {instrument_id: 1, month_key: "2099-01", raw_price: 150, raw_currency: "USD"}
        })

        expect(response.status).toBe(400)
        expect(mockDb.investments.submitCommunityPrice).not.toHaveBeenCalled()
    })

    it("rejects a community price submission until the current month has closed", async () => {
        const now = new Date()
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
        const response = await request(app, "/api/investments/community-prices/submit", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {instrument_id: 1, month_key: currentMonthKey, raw_price: 150, raw_currency: "USD"}
        })

        expect(response.status).toBe(400)
        expect(mockDb.investments.submitCommunityPrice).not.toHaveBeenCalled()
    })

    it("rejects a community price submission for a kind backfillHistoricalPrices doesn't cover (e.g. bond)", async () => {
        mockDb.investments.getInstrumentById.mockResolvedValue({id: 2, kind: "bond", symbol: "BND", name: "Some Bond", currency: "EUR"})

        const response = await request(app, "/api/investments/community-prices/submit", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {instrument_id: 2, month_key: "2020-01", raw_price: 100, raw_currency: "EUR"}
        })

        expect(response.status).toBe(400)
        expect(mockDb.investments.submitCommunityPrice).not.toHaveBeenCalled()
    })

    it("returns 403 for a community price submission when the user never held the instrument", async () => {
        mockDb.investments.getInstrumentById.mockResolvedValue({id: 1, kind: "stock", symbol: "AAPL", name: "Apple Inc", currency: "USD"})
        mockCache.valueExpired.mockResolvedValueOnce(false)
        mockCache.get.mockResolvedValueOnce({EUR: 1, USD: 1.1})
        mockDb.investments.submitCommunityPrice.mockResolvedValue({status: "not_eligible"})

        const response = await request(app, "/api/investments/community-prices/submit", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {instrument_id: 1, month_key: "2020-01", raw_price: 150, raw_currency: "USD"}
        })

        expect(response.status).toBe(403)
    })

    it("returns 409 with the existing submission when an active one already exists for that instrument+month", async () => {
        mockDb.investments.getInstrumentById.mockResolvedValue({id: 1, kind: "stock", symbol: "AAPL", name: "Apple Inc", currency: "USD"})
        mockCache.valueExpired.mockResolvedValueOnce(false)
        mockCache.get.mockResolvedValueOnce({EUR: 1, USD: 1.1})
        const existing = {id: 9, instrumentId: 1, monthKey: "2020-01", priceEur: 100, rawPrice: 100, rawCurrency: "EUR", status: "verified", submittedBy: "another-user", submittedAt: "2026-01-01T00:00:00Z", verifiedBy: "admin-1", verifiedAt: "2026-01-02T00:00:00Z", rejectionNote: null}
        mockDb.investments.submitCommunityPrice.mockResolvedValue({status: "conflict", existing})

        const response = await request(app, "/api/investments/community-prices/submit", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {instrument_id: 1, month_key: "2020-01", raw_price: 150, raw_currency: "USD"}
        })

        expect(response.status).toBe(409)
        expect(response.json).toEqual({existing})
    })

    it("rejects a community price when a provider price already exists", async () => {
        mockDb.investments.getInstrumentById.mockResolvedValue({id: 1, kind: "crypto", symbol: "BTC", name: "Bitcoin", currency: null})
        mockCache.valueExpired.mockResolvedValueOnce(false)
        mockCache.get.mockResolvedValueOnce({EUR: 1})
        mockDb.investments.submitCommunityPrice.mockResolvedValue({status: "provider_available"})

        const response = await request(app, "/api/investments/community-prices/submit", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {instrument_id: 1, month_key: "2020-01", raw_price: 8000, raw_currency: "EUR"}
        })

        expect(response.status).toBe(403)
        expect(response.json).toEqual({error: "provider_price_already_available"})
    })

    it("returns the current user's own community price submissions", async () => {
        mockDb.investments.getMyCommunityPriceSubmissions.mockResolvedValue([
            {id: 1, instrumentId: 1, monthKey: "2020-01", priceEur: 100, rawPrice: 110, rawCurrency: "USD", status: "pending", submittedBy: "user-uuid", submittedAt: "2026-01-01T00:00:00Z", verifiedBy: null, verifiedAt: null, rejectionNote: null, instrument: null},
        ])

        const response = await request(app, "/api/investments/community-prices/mine", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {}
        })

        expect(response.status).toBe(200)
        expect(mockDb.investments.getMyCommunityPriceSubmissions).toHaveBeenCalledWith("user-uuid")
    })

    it("blocks a non-admin from listing pending community price submissions", async () => {
        mockDb.users.isAdmin.mockResolvedValue(false)

        const response = await request(app, "/api/investments/community-prices/pending", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {}
        })

        expect(response.status).toBe(403)
        expect(mockDb.investments.getPendingCommunityPrices).not.toHaveBeenCalled()
    })

    it("lets an admin list pending community price submissions", async () => {
        mockDb.users.isAdmin.mockResolvedValue(true)
        mockDb.investments.getPendingCommunityPrices.mockResolvedValue([{id: 1, status: "pending"}])

        const response = await request(app, "/api/investments/community-prices/pending", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {}
        })

        expect(response.status).toBe(200)
        expect(response.json).toEqual([{id: 1, status: "pending"}])
    })

    it("blocks a non-admin from approving/rejecting a community price submission", async () => {
        mockDb.users.isAdmin.mockResolvedValue(false)

        const response = await request(app, "/api/investments/community-prices/verify", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {id: 1, action: "approve"}
        })

        expect(response.status).toBe(403)
        expect(mockDb.investments.verifyCommunityPrice).not.toHaveBeenCalled()
    })

    it("lets an admin approve a pending community price submission", async () => {
        mockDb.users.isAdmin.mockResolvedValue(true)
        mockDb.investments.verifyCommunityPrice.mockResolvedValue({
            status: "ok",
            submission: {id: 1, status: "verified", verifiedBy: "user-uuid"},
        })

        const response = await request(app, "/api/investments/community-prices/verify", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {id: 1, action: "approve"}
        })

        expect(response.status).toBe(200)
        expect(mockDb.investments.verifyCommunityPrice).toHaveBeenCalledWith("user-uuid", 1, "approve", null)
    })

    it("requires an explanation when an admin rejects a community price", async () => {
        mockDb.users.isAdmin.mockResolvedValue(true)

        const response = await request(app, "/api/investments/community-prices/verify", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {id: 1, action: "reject", rejection_note: ""}
        })

        expect(response.status).toBe(400)
        expect(response.json).toEqual({error: "rejection_note_required"})
        expect(mockDb.investments.verifyCommunityPrice).not.toHaveBeenCalled()
    })

    it("rejects an invalid action for community price verification", async () => {
        mockDb.users.isAdmin.mockResolvedValue(true)

        const response = await request(app, "/api/investments/community-prices/verify", {
            method: "POST",
            headers: {cookie: authCookie},
            body: {id: 1, action: "delete"}
        })

        expect(response.status).toBe(400)
        expect(mockDb.investments.verifyCommunityPrice).not.toHaveBeenCalled()
    })

    describe("/user/recovery-code", () => {
        it("generates a recovery code after verifying the current password", async () => {
            const response = await request(app, "/api/user/recovery-code/generate", {
                method: "POST",
                headers: {cookie: authCookie},
                body: {password: "correct-password"}
            })

            expect(response.status).toBe(200)
            expect(response.json.recovery_code_base32).toMatch(/^[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/)
            expect(response.json.recovery_code_words.split("-")).toHaveLength(10)
            expect(mockDb.users.verifyPassword).toHaveBeenCalledWith("user-uuid", "correct-password")
            expect(mockDb.users.setRecoveryCodeHash).toHaveBeenCalledWith("user-uuid", expect.stringMatching(/^[0-9a-f]{64}$/))
        })

        it("rejects generation with the wrong current password", async () => {
            mockDb.users.verifyPassword.mockResolvedValue(false)

            const response = await request(app, "/api/user/recovery-code/generate", {
                method: "POST",
                headers: {cookie: authCookie},
                body: {password: "wrong-password"}
            })

            expect(response.status).toBe(401)
            expect(mockDb.users.setRecoveryCodeHash).not.toHaveBeenCalled()
        })

        it("blocks demo accounts from generating a recovery code", async () => {
            mockDb.users.getTypeOfUserId.mockResolvedValue({type: mockDb.users.UserType.demo.value})

            const response = await request(app, "/api/user/recovery-code/generate", {
                method: "POST",
                headers: {cookie: authCookie},
                body: {password: "correct-password"}
            })

            expect(response.status).toBe(403)
        })

        it("reports whether a recovery code is currently configured", async () => {
            mockDb.users.getRecoveryCodeStatusByUserId.mockResolvedValue({
                configured: true, generatedAt: "2026-08-01T00:00:00.000Z"
            })

            const response = await request(app, "/api/user/recovery-code/status", {
                method: "POST",
                headers: {cookie: authCookie},
                body: {}
            })

            expect(response.status).toBe(200)
            expect(response.json).toEqual({configured: true, generated_at: "2026-08-01T00:00:00.000Z"})
        })
    })
})
