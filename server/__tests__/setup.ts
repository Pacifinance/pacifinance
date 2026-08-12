import { beforeEach, vi } from "vitest"

type MockDb = {
    users: Record<string, any>
    balances: Record<string, any>
    transactions: Record<string, any>
    tags: Record<string, any>
    categories: Record<string, any>
    investments: Record<string, any>
    liquidityAccounts: Record<string, any>
    goals: Record<string, any>
    delqueue: Record<string, any>
    recurringTransactions: Record<string, any>
    benchmarks: Record<string, any>
    benchmarkSnapshots: Record<string, any>
    sharedExpenses: Record<string, any>
    roadmapVotes: Record<string, any>
    notifications: Record<string, any>
}

const mocks = vi.hoisted(() => {
    const db: MockDb = {
        users: {
            userIdLength: 6,
            UserType: {
                regular: {name: "regular", value: 0},
                premium: {name: "premium", value: 1},
                test: {name: "test", value: 2},
                demo: {name: "demo", value: 3}
            },
            emailForUserCode: vi.fn((userCode: string) => `${userCode}@users.pacifinance.internal`),
            userCodeExists: vi.fn(),
            getIdByUserCode: vi.fn(),
            insertNew: vi.fn(),
            getTypeOfUserId: vi.fn(),
            verifyPassword: vi.fn(),
            getAllBenchmarkUserIds: vi.fn(),
            setUserIdByUserId: vi.fn(),
            setPasswordOfUserId: vi.fn(),
            setRecoveryCodeHash: vi.fn(),
            getRecoveryCodeHashByUserCode: vi.fn(),
            getRecoveryCodeStatusByUserId: vi.fn(),
            getPublicInfoByUserId: vi.fn(),
            setBenchmarkConsentByUserId: vi.fn(),
            setSeenBadgesByUserId: vi.fn(),
            setPublicInfoOfUserId: vi.fn(),
            setGoalsOfUserId: vi.fn(),
            isAdmin: vi.fn(),
            deleteUserById: vi.fn()
        },
        balances: {
            insertNew: vi.fn(),
            getBalanceHistoryByUserId: vi.fn(),
            getAllByUserId: vi.fn(),
            getRankingPool: vi.fn()
        },
        transactions: {
            insertNew: vi.fn(),
            updateExisting: vi.fn(),
            insertBatch: vi.fn(),
            getMonthlyTransactionsByUserId: vi.fn(),
            getRecentMonthlyTransactionsByUserId: vi.fn(),
            getMonthlyTotalsByUserId: vi.fn(),
            getAllByUserId: vi.fn(),
            deleteTransactionByData: vi.fn(),
            deleteTransactionById: vi.fn(),
            getTransactionRankingPool: vi.fn()
        },
        tags: {
            TagType: {
                expense: {name: "expense", value: 0},
                income: {name: "income", value: 1},
                payment: {name: "payment", value: 2},
                country: {name: "country", value: 3},
                job: {name: "job", value: 4},
                jobType: {name: "jobType", value: 5},
                workTime: {name: "workTime", value: 6},
                remoteType: {name: "remoteType", value: 7},
                yearsOfExperience: {name: "yearsOfExperience", value: 8},
                age: {name: "age", value: 9},
                livingSituation: {name: "livingSituation", value: 10},
                housingType: {name: "housingType", value: 11},
                children: {name: "children", value: 12},
                currency: {name: "currency", value: 13}
            },
            getAllTagsByType: vi.fn(),
            getReferenceByIndexAndType: vi.fn()
        },
        categories: {
            getAllByUserId: vi.fn(),
            insertNew: vi.fn(),
            renameById: vi.fn(),
            deleteById: vi.fn()
        },
        investments: {
            INVESTMENT_KINDS: ["stock", "etf", "crypto", "bond", "fund", "commodity", "other"],
            INVESTMENT_ASSET_KEYS: ["stocks", "etf", "bitcoin", "crypto", "bonds", "funds", "commodities"],
            INVESTMENT_POSITION_TYPES: ["single", "pac", "other"],
            INVESTMENT_SEARCH_SOURCES: ["figi", "coingecko"],
            searchInstruments: vi.fn(),
            searchInstrumentsByIsins: vi.fn(),
            createManualInstrument: vi.fn(),
            getInstrumentById: vi.fn(),
            getHoldingsByUserId: vi.fn(),
            refreshHoldingPrices: vi.fn(),
            backfillHistoricalPrices: vi.fn(),
            insertHolding: vi.fn(),
            updateHolding: vi.fn(),
            deleteHolding: vi.fn(),
            snapshotHoldingsForUser: vi.fn(),
            getHoldingHistoryByUserId: vi.fn(),
            upsertHoldingHistoryEntry: vi.fn(),
            upsertHoldingHistoryBatch: vi.fn(),
            getInvestmentSettings: vi.fn(),
            saveInvestmentSettings: vi.fn(),
            upsertDividend: vi.fn(),
            upsertDividendsBatch: vi.fn(),
            getDividendsSummaryByUserId: vi.fn(),
            upsertTransaction: vi.fn(),
            saveTransactionsBatch: vi.fn(),
            getTransactionsByUserId: vi.fn(),
            submitCommunityPrice: vi.fn(),
            getPendingCommunityPrices: vi.fn(),
            getMyCommunityPriceSubmissions: vi.fn(),
            verifyCommunityPrice: vi.fn(),
            getVerifiedCommunityPricesForInstrument: vi.fn()
        },
        liquidityAccounts: {
            LIQUIDITY_ACCOUNT_ASSET_KEYS: ["bank", "cash", "digitalServices", "emergencyFund"],
            getAccountsByUserId: vi.fn(),
            insertAccount: vi.fn(),
            updateAccount: vi.fn(),
            deleteAccount: vi.fn(),
            snapshotAccountsForUser: vi.fn(),
            getAccountHistoryByUserId: vi.fn()
        },
        goals: {
            GOAL_TYPES: ["savings", "purchase", "investment", "debt"],
            GOAL_LINKED_ASSET_KEYS: ["bank", "cash", "digitalServices", "emergencyFund", "stocks", "etf", "bitcoin", "crypto", "bonds", "funds", "commodities"],
            getGoalsByUserId: vi.fn(),
            insertGoal: vi.fn(),
            updateGoal: vi.fn(),
            deleteGoal: vi.fn()
        },
        delqueue: {
            removeFromQueueByUserId: vi.fn(),
            getAllAccountsInQueue: vi.fn(),
            insertNew: vi.fn()
        },
        recurringTransactions: {
            getAllByUserId: vi.fn(),
            insertRecurring: vi.fn(),
            updateRecurring: vi.fn(),
            setActive: vi.fn(),
            deleteRecurring: vi.fn(),
            runAllDue: vi.fn()
        },
        benchmarks: {
            getMetricRows: vi.fn()
        },
        benchmarkSnapshots: {
            getProfiles: vi.fn(),
            saveProfiles: vi.fn(),
            deleteProfilesByUserId: vi.fn()
        },
        sharedExpenses: {
            getReceivablesByUserId: vi.fn(),
            insertReceivable: vi.fn(),
            settleReceivable: vi.fn(),
            deleteReceivable: vi.fn(),
            insertImportedReceivables: vi.fn(),
            insertImportedReimbursements: vi.fn(),
            linkExistingExpense: vi.fn(),
            linkExistingReimbursement: vi.fn()
        },
        roadmapVotes: {
            getVoteCounts: vi.fn(),
            getVotesByUserId: vi.fn(),
            toggleVote: vi.fn()
        },
        notifications: {
            getPreferences: vi.fn(),
            savePreferences: vi.fn(),
            saveSubscription: vi.fn(),
            deleteSubscription: vi.fn(),
            getSubscriptionsForUsers: vi.fn()
        }
    }

    const supabase = {
        auth: {
            getClaims: vi.fn(),
            refreshSession: vi.fn(),
            signInWithPassword: vi.fn(),
            admin: {
                signOut: vi.fn(),
                listUsers: vi.fn(),
                createUser: vi.fn(),
                deleteUser: vi.fn(),
                updateUserById: vi.fn()
            }
        },
        from: vi.fn(),
        rpc: vi.fn()
    }

    const similarUsers = {
        getSimilarUserIds: vi.fn()
    }

    const redis = {
        get: vi.fn(),
        set: vi.fn(),
        ping: vi.fn(),
        incr: vi.fn(),
        expire: vi.fn()
    }

    const cache = {
        getExpectedKeys: vi.fn(),
        valueExpired: vi.fn(),
        invalidate: vi.fn(),
        get: vi.fn(),
        set: vi.fn()
    }

    return {db, supabase, similarUsers, redis, cache}
})

vi.mock("../src/db/db", () => ({default: mocks.db}))
vi.mock("../src/db/models/users", () => ({default: mocks.db.users}))
vi.mock("../src/db/supabase", () => ({default: mocks.supabase}))
// Only the default export's getSimilarUserIds is mocked (route-level tests use this);
// named exports (similarityScore, selectCohort, ...) stay real for similarUsers.test.ts.
vi.mock("../src/services/similarUsers", async (importOriginal) => {
    const actual = await importOriginal() as object
    return {...actual, default: {...(actual as {default: object}).default, getSimilarUserIds: mocks.similarUsers.getSimilarUserIds}}
})
vi.mock("../src/cache/redisClient", () => ({default: mocks.redis}))
vi.mock("../src/cache/cache", () => ({default: mocks.cache}))

process.env.VERCEL = "1"

export const mockDb = mocks.db
export const mockSupabase = mocks.supabase
export const mockSimilarUsers = mocks.similarUsers
export const mockRedis = mocks.redis
export const mockCache = mocks.cache

export function resetServerMocks() {
    process.env.VERCEL = "1"
    process.env.NODE_ENV = "test"
    process.env.CRON_SECRET = "test-cron-secret"
    process.env.REGISTRATION_STEP_TIMEOUT_MS = "10000"
    process.env.TURNSTILE_VERIFY_TIMEOUT_MS = "10000"
    process.env.SUPABASE_FETCH_TIMEOUT_MS = "10000"
    process.env.DEPENDENCY_HEALTH_TIMEOUT_MS = "3000"
    process.env.UPSTASH_REDIS_REST_URL = "https://redis.example"
    process.env.UPSTASH_REDIS_REST_TOKEN = "redis-token"
    process.env.SUPABASE_URL = "https://supabase.example"
    process.env.SUPABASE_SERVICE_ROLE_KEY = "supabase-service-role"
    vi.clearAllMocks()

    mockSupabase.auth.getClaims.mockResolvedValue({
        data: {claims: {sub: "user-uuid"}},
        error: null
    })
    mockSupabase.auth.refreshSession.mockResolvedValue({
        data: {session: null, user: null},
        error: {message: "not refreshed"}
    })
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {session: null, user: null},
        error: {message: "invalid credentials"}
    })
    mockSupabase.auth.admin.signOut.mockResolvedValue({})
    mockSupabase.auth.admin.listUsers.mockResolvedValue({data: {users: []}, error: null})

    mockDb.users.userCodeExists.mockResolvedValue(false)
    mockDb.users.getIdByUserCode.mockResolvedValue("user-uuid")
    mockDb.users.insertNew.mockResolvedValue({id: "user-uuid", userId: "123456"})
    mockDb.users.getTypeOfUserId.mockResolvedValue({type: mockDb.users.UserType.regular.value})
    mockDb.users.verifyPassword.mockResolvedValue(true)
    mockDb.users.getAllBenchmarkUserIds.mockResolvedValue([])
    mockDb.users.setRecoveryCodeHash.mockResolvedValue({id: "user-uuid"})
    mockDb.users.getRecoveryCodeHashByUserCode.mockResolvedValue(null)
    mockDb.users.getRecoveryCodeStatusByUserId.mockResolvedValue({configured: false, generatedAt: null})
    mockDb.users.getPublicInfoByUserId.mockResolvedValue({userId: "123456"})
    mockDb.users.setBenchmarkConsentByUserId.mockResolvedValue({benchmarkConsent: false})
    mockDb.users.setSeenBadgesByUserId.mockResolvedValue({seenBadges: []})
    mockDb.users.setPublicInfoOfUserId.mockResolvedValue({id: "user-uuid"})
    mockDb.users.setGoalsOfUserId.mockResolvedValue({id: "user-uuid"})
    mockDb.users.deleteUserById.mockResolvedValue({id: "user-uuid"})

    mockDb.balances.insertNew.mockResolvedValue({id: 1})
    mockDb.balances.getBalanceHistoryByUserId.mockResolvedValue([])
    mockDb.balances.getAllByUserId.mockResolvedValue([])
    mockDb.balances.getRankingPool.mockResolvedValue([])

    mockDb.transactions.insertNew.mockResolvedValue({id: 1})
    mockDb.transactions.insertBatch.mockResolvedValue([])
    mockDb.transactions.getMonthlyTransactionsByUserId.mockResolvedValue([])
    mockDb.transactions.getRecentMonthlyTransactionsByUserId.mockResolvedValue([])
    mockDb.transactions.getMonthlyTotalsByUserId.mockResolvedValue([])
    mockDb.transactions.getAllByUserId.mockResolvedValue([])
    mockDb.transactions.deleteTransactionByData.mockResolvedValue({deletedCount: 1})
    mockDb.transactions.getTransactionRankingPool.mockResolvedValue([])

    mockSimilarUsers.getSimilarUserIds.mockResolvedValue({userIds: [], insufficientData: true})

    mockDb.tags.getAllTagsByType.mockResolvedValue([])
    mockDb.tags.getReferenceByIndexAndType.mockResolvedValue({id: 10})
    mockDb.categories.getAllByUserId.mockResolvedValue([])
    mockDb.categories.insertNew.mockResolvedValue({id: 1, parentIndex: 0, parentType: 0, label: "Custom"})
    mockDb.categories.renameById.mockResolvedValue({id: 1, parentIndex: 0, parentType: 0, label: "Renamed"})
    mockDb.categories.deleteById.mockResolvedValue({deletedCount: 1})
    mockDb.investments.searchInstruments.mockResolvedValue([])
    mockDb.investments.searchInstrumentsByIsins.mockResolvedValue({})
    mockDb.investments.createManualInstrument.mockResolvedValue({
        id: 2,
        kind: "stock",
        symbol: "MYSTOCK",
        name: "My Stock",
        provider: "manual",
        verified: false,
        active: true
    })
    mockDb.investments.getInstrumentById.mockResolvedValue({
        id: 1,
        kind: "stock",
        symbol: "AAPL",
        exchange: "NASDAQ",
        name: "Apple Inc.",
        verified: true,
        active: true
    })
    mockDb.investments.getHoldingsByUserId.mockResolvedValue([])
    mockDb.investments.refreshHoldingPrices.mockResolvedValue([])
    mockDb.investments.insertHolding.mockResolvedValue({id: 1})
    mockDb.investments.updateHolding.mockResolvedValue({id: 1})
    mockDb.investments.deleteHolding.mockResolvedValue({deletedCount: 1})
    mockDb.investments.snapshotHoldingsForUser.mockResolvedValue(undefined)
    mockDb.investments.getHoldingHistoryByUserId.mockResolvedValue([])
    mockDb.investments.upsertHoldingHistoryEntry.mockResolvedValue({status: "ok", entry: {id: 1}})
    mockDb.investments.upsertHoldingHistoryBatch.mockResolvedValue({savedCount: 0, errors: []})
    mockDb.investments.upsertDividendsBatch.mockResolvedValue({savedCount: 0, errors: []})
    mockDb.investments.saveTransactionsBatch.mockResolvedValue({savedCount: 0, errors: []})

    mockDb.liquidityAccounts.getAccountsByUserId.mockResolvedValue([])
    mockDb.liquidityAccounts.insertAccount.mockResolvedValue({id: 1})
    mockDb.liquidityAccounts.updateAccount.mockResolvedValue({id: 1})
    mockDb.liquidityAccounts.deleteAccount.mockResolvedValue({deletedCount: 1})
    mockDb.liquidityAccounts.snapshotAccountsForUser.mockResolvedValue(undefined)
    mockDb.liquidityAccounts.getAccountHistoryByUserId.mockResolvedValue([])

    mockDb.goals.getGoalsByUserId.mockResolvedValue([])
    mockDb.goals.insertGoal.mockResolvedValue({id: 1})
    mockDb.goals.updateGoal.mockResolvedValue({id: 1})
    mockDb.goals.deleteGoal.mockResolvedValue({deletedCount: 1})
    mockDb.delqueue.removeFromQueueByUserId.mockResolvedValue({})
    mockDb.delqueue.getAllAccountsInQueue.mockResolvedValue([])
    mockDb.delqueue.insertNew.mockResolvedValue({id: 1})

    mockDb.recurringTransactions.getAllByUserId.mockResolvedValue([])
    mockDb.recurringTransactions.insertRecurring.mockResolvedValue({id: 1})
    mockDb.recurringTransactions.updateRecurring.mockResolvedValue({id: 1})
    mockDb.recurringTransactions.setActive.mockResolvedValue({id: 1})
    mockDb.recurringTransactions.deleteRecurring.mockResolvedValue({deletedCount: 1})
    mockDb.recurringTransactions.runAllDue.mockResolvedValue({due: 0, ran: 0})
    mockDb.benchmarks.getMetricRows.mockResolvedValue([])
    mockDb.benchmarkSnapshots.getProfiles.mockResolvedValue([])
    mockDb.benchmarkSnapshots.saveProfiles.mockResolvedValue(undefined)
    mockDb.benchmarkSnapshots.deleteProfilesByUserId.mockResolvedValue(undefined)

    mockDb.sharedExpenses.getReceivablesByUserId.mockResolvedValue([])
    mockDb.sharedExpenses.insertReceivable.mockResolvedValue({id: 1})
    mockDb.sharedExpenses.settleReceivable.mockResolvedValue({id: 1})
    mockDb.sharedExpenses.deleteReceivable.mockResolvedValue({deletedCount: 1})
    mockDb.sharedExpenses.linkExistingExpense.mockResolvedValue({id: 1})
    mockDb.sharedExpenses.linkExistingReimbursement.mockResolvedValue([])

    mockDb.roadmapVotes.getVoteCounts.mockResolvedValue({})
    mockDb.roadmapVotes.getVotesByUserId.mockResolvedValue([])
    mockDb.roadmapVotes.toggleVote.mockResolvedValue(true)

    mockDb.notifications.getPreferences.mockResolvedValue(null)
    mockDb.notifications.saveSubscription.mockResolvedValue({id: 1})
    mockDb.notifications.deleteSubscription.mockResolvedValue({deleted: true})
    mockDb.notifications.getSubscriptionsForUsers.mockResolvedValue(new Map())

    mockRedis.get.mockResolvedValue(null)
    mockRedis.set.mockResolvedValue("OK")
    mockRedis.ping.mockResolvedValue("PONG")
    mockRedis.incr.mockResolvedValue(1)
    mockRedis.expire.mockResolvedValue(1)

    mockCache.getExpectedKeys.mockReturnValue(["userAverages", "userRankings", "crypto"])
    mockCache.valueExpired.mockResolvedValue(false)
    mockCache.invalidate.mockResolvedValue(undefined)
    mockCache.get.mockResolvedValue(null)
    mockCache.set.mockResolvedValue(undefined)

    vi.stubGlobal("fetch", vi.fn())
}

beforeEach(() => {
    resetServerMocks()
})
