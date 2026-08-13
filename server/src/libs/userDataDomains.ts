import db from "../db/db"

/**
 * The single source of truth for "what counts as this user's data" — every
 * table with a direct user-ownership FK gets one entry here. Both the
 * data-export endpoint (server/src/routes/private/user.ts, POST /alldata)
 * and server/__tests__/userDataDomains.test.ts read this list, so a domain
 * added here is automatically exported and automatically guarded: forgetting
 * to register a new domain fails that test (see EXCLUDED_MODELS below for
 * the only models allowed to opt out, each with a stated reason) instead of
 * silently shipping an export that's missing a whole feature's data.
 *
 * `model` must match a key of db/db.ts's default export — that's what lets
 * the completeness test cross-check every registered db model against this
 * registry without hand-maintaining a duplicate list.
 */
export interface UserDataDomain {
    /** Key under which this domain's data appears in the /alldata response. */
    key: string
    /** db/db.ts model this domain's data comes from. */
    model: string
    fetch: (userId: string) => Promise<unknown>
}

export const USER_DATA_DOMAINS: UserDataDomain[] = [
    {key: "profile", model: "users", fetch: (userId) => db.users.getPublicInfoByUserId(userId)},
    {key: "balances", model: "balances", fetch: (userId) => db.balances.getAllByUserId(userId)},
    {key: "transactions", model: "transactions", fetch: (userId) => db.transactions.getAllByUserId(userId)},
    {key: "categories", model: "categories", fetch: (userId) => db.categories.getAllByUserId(userId)},
    {key: "investmentHoldings", model: "investments", fetch: (userId) => db.investments.getHoldingsByUserId(userId, false)},
    {key: "investmentHoldingHistory", model: "investments", fetch: (userId) => db.investments.getHoldingHistoryByUserId(userId)},
    {key: "investmentTransactions", model: "investments", fetch: (userId) => db.investments.getTransactionsByUserId(userId)},
    {key: "investmentDividends", model: "investments", fetch: (userId) => db.investments.getDividendsByUserId(userId)},
    {key: "investmentSettings", model: "investments", fetch: (userId) => db.investments.getInvestmentSettings(userId)},
    {key: "manualInstruments", model: "investments", fetch: (userId) => db.investments.getManualInstrumentsByUserId(userId)},
    {key: "communityPriceSubmissions", model: "investments", fetch: (userId) => db.investments.getMyCommunityPriceSubmissions(userId)},
    {key: "liquidityAccounts", model: "liquidityAccounts", fetch: (userId) => db.liquidityAccounts.getAccountsByUserId(userId)},
    {key: "liquidityAccountHistory", model: "liquidityAccounts", fetch: (userId) => db.liquidityAccounts.getAccountHistoryByUserId(userId)},
    {key: "goals", model: "goals", fetch: (userId) => db.goals.getGoalsByUserId(userId)},
    {key: "recurringTransactions", model: "recurringTransactions", fetch: (userId) => db.recurringTransactions.getAllByUserId(userId)},
    {key: "sharedExpenseReceivables", model: "sharedExpenses", fetch: (userId) => db.sharedExpenses.getReceivablesByUserId(userId)},
    {key: "sharedExpenseReimbursements", model: "sharedExpenses", fetch: (userId) => db.sharedExpenses.getReimbursementsByUserId(userId)},
    {key: "notificationPreferences", model: "notifications", fetch: (userId) => db.notifications.getPreferences(userId)},
    {key: "pushSubscriptions", model: "notifications", fetch: async (userId) => (await db.notifications.getSubscriptionsForUsers([userId])).get(userId) ?? []},
    {key: "roadmapVotes", model: "roadmapVotes", fetch: (userId) => db.roadmapVotes.getVotesByUserId(userId)},
    {key: "benchmarkSnapshots", model: "benchmarkSnapshots", fetch: (userId) => db.benchmarkSnapshots.getSnapshotsByUserId(userId)},
]

/**
 * db/db.ts models that intentionally have no export-domain entry, with why.
 * A new model added to db/db.ts must be added either to USER_DATA_DOMAINS
 * or here — see server/__tests__/userDataDomains.test.ts, which fails on
 * any model that's in neither.
 */
export const EXCLUDED_MODELS: {model: string; reason: string}[] = [
    {model: "tags", reason: "Shared/global lookup table (payment types, categories, demographics) - not user-owned data."},
    {model: "delqueue", reason: "Internal deferred-deletion bookkeeping, not user-facing data."},
    {model: "benchmarks", reason: "Read-only RPC aggregation over balances/transactions - no table of its own."},
]
