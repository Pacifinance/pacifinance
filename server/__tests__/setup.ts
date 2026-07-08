import { beforeEach, vi } from "vitest"

type MockDb = {
    users: Record<string, any>
    balances: Record<string, any>
    expenses: Record<string, any>
    tags: Record<string, any>
    categories: Record<string, any>
    delqueue: Record<string, any>
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
            insertNew: vi.fn(),
            getTypeOfUserId: vi.fn(),
            verifyPassword: vi.fn(),
            setUserIdByUserId: vi.fn(),
            setPasswordOfUserId: vi.fn(),
            getPublicInfoByUserId: vi.fn(),
            setPublicInfoOfUserId: vi.fn(),
            setGoalsOfUserId: vi.fn(),
            deleteUserById: vi.fn()
        },
        balances: {
            insertNew: vi.fn(),
            getBalanceHistoryByUserId: vi.fn(),
            getAllByUserId: vi.fn(),
            getRankingPool: vi.fn()
        },
        expenses: {
            insertNew: vi.fn(),
            getMonthlyExpensesByUserId: vi.fn(),
            getMonthlyTotalsByUserId: vi.fn(),
            getAllByUserId: vi.fn(),
            deleteExpenseByData: vi.fn(),
            getExpenseRankingPool: vi.fn()
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
            deleteById: vi.fn()
        },
        delqueue: {
            removeFromQueueByUserId: vi.fn(),
            getAllAccountsInQueue: vi.fn(),
            insertNew: vi.fn()
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

    const redis = {
        get: vi.fn(),
        set: vi.fn(),
        ping: vi.fn()
    }

    const cache = {
        getExpectedKeys: vi.fn(),
        valueExpired: vi.fn(),
        invalidate: vi.fn(),
        get: vi.fn(),
        set: vi.fn()
    }

    return {db, supabase, redis, cache}
})

vi.mock("../src/db/db", () => ({default: mocks.db}))
vi.mock("../src/db/models/users", () => ({default: mocks.db.users}))
vi.mock("../src/db/supabase", () => ({default: mocks.supabase}))
vi.mock("../src/cache/redisClient", () => ({default: mocks.redis}))
vi.mock("../src/cache/cache", () => ({default: mocks.cache}))

process.env.VERCEL = "1"

export const mockDb = mocks.db
export const mockSupabase = mocks.supabase
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
    mockDb.users.insertNew.mockResolvedValue({id: "user-uuid", userId: "123456"})
    mockDb.users.getTypeOfUserId.mockResolvedValue({type: mockDb.users.UserType.regular.value})
    mockDb.users.verifyPassword.mockResolvedValue(true)
    mockDb.users.getPublicInfoByUserId.mockResolvedValue({userId: "123456"})
    mockDb.users.setPublicInfoOfUserId.mockResolvedValue({id: "user-uuid"})
    mockDb.users.setGoalsOfUserId.mockResolvedValue({id: "user-uuid"})
    mockDb.users.deleteUserById.mockResolvedValue({id: "user-uuid"})

    mockDb.balances.insertNew.mockResolvedValue({id: 1})
    mockDb.balances.getBalanceHistoryByUserId.mockResolvedValue([])
    mockDb.balances.getAllByUserId.mockResolvedValue([])
    mockDb.balances.getRankingPool.mockResolvedValue([])

    mockDb.expenses.insertNew.mockResolvedValue({id: 1})
    mockDb.expenses.getMonthlyExpensesByUserId.mockResolvedValue([])
    mockDb.expenses.getMonthlyTotalsByUserId.mockResolvedValue([])
    mockDb.expenses.getAllByUserId.mockResolvedValue([])
    mockDb.expenses.deleteExpenseByData.mockResolvedValue({deletedCount: 1})
    mockDb.expenses.getExpenseRankingPool.mockResolvedValue([])

    mockDb.tags.getAllTagsByType.mockResolvedValue([])
    mockDb.tags.getReferenceByIndexAndType.mockResolvedValue({id: 10})
    mockDb.categories.getAllByUserId.mockResolvedValue([])
    mockDb.categories.insertNew.mockResolvedValue({id: 1, parentIndex: 0, label: "Custom"})
    mockDb.categories.deleteById.mockResolvedValue({deletedCount: 1})
    mockDb.delqueue.removeFromQueueByUserId.mockResolvedValue({})
    mockDb.delqueue.getAllAccountsInQueue.mockResolvedValue([])
    mockDb.delqueue.insertNew.mockResolvedValue({id: 1})

    mockRedis.get.mockResolvedValue(null)
    mockRedis.set.mockResolvedValue("OK")
    mockRedis.ping.mockResolvedValue("PONG")

    mockCache.getExpectedKeys.mockReturnValue(["userAverages", "crypto"])
    mockCache.valueExpired.mockResolvedValue(false)
    mockCache.invalidate.mockResolvedValue(undefined)
    mockCache.get.mockResolvedValue(null)
    mockCache.set.mockResolvedValue(undefined)

    vi.stubGlobal("fetch", vi.fn())
}

beforeEach(() => {
    resetServerMocks()
})
