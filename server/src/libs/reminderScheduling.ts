import db from "../db/db"
import { buildContent, monthLabel } from "./notificationContent"
import type { EnabledPreferencesRow } from "../db/models/notifications"

const DATA_UPDATE_STALE_DAYS = 5
const RECEIVABLE_STALE_DAYS = 14
const RECURRING_LOOKAHEAD_DAYS = 3
const DAY_MS = 24 * 60 * 60 * 1000

export interface OutgoingMessage {
    userId: string
    type: string
    title: string
    body: string
    url: string
}

/** The user's local hour/day/month/year in their stored IANA timezone, falling
 *  back to UTC if the stored value is somehow invalid (e.g. never validated). */
function localParts(now: Date, timezone: string) {
    try {
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone, hour: "numeric", hour12: false, day: "numeric", month: "numeric", year: "numeric",
        }).formatToParts(now)
        const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
        return {hour: get("hour") % 24, day: get("day"), month: get("month"), year: get("year")}
    } catch {
        return {hour: now.getUTCHours(), day: now.getUTCDate(), month: now.getUTCMonth() + 1, year: now.getUTCFullYear()}
    }
}

/**
 * Figures out which of one user's enabled reminder types are due right now
 * (their local reminderHour, and — for the daily-ish types — not already sent
 * today; for the monthly one, their reminderDay and not already sent this
 * month) and actually have something to say, fetching each type's content
 * from the matching domain model. `recentlyVerifiedInstrumentIds` is computed
 * once per cron run (not per user) and passed in.
 *
 * Returns the messages to send plus the updated last_sent watermark. Every
 * enabled type that was evaluated this hour advances its watermark even when
 * there was nothing to say, so an empty day doesn't get silently re-checked.
 */
export async function evaluateUser(
    pref: EnabledPreferencesRow,
    now: Date,
    recentlyVerifiedInstrumentIds: number[],
): Promise<{messages: OutgoingMessage[]; lastSent: Record<string, string>}> {
    const {hour, day, month, year} = localParts(now, pref.timezone)
    const lastSent = {...pref.lastSent}
    const messages: OutgoingMessage[] = []

    if (hour !== pref.reminderHour) {
        return {messages, lastSent}
    }

    const todayKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const monthKey = `${year}-${String(month).padStart(2, "0")}`

    if (pref.monthlySummary && day === pref.reminderDay && lastSent.monthlySummary !== monthKey) {
        const previousMonthStart = new Date(Date.UTC(year, month - 2, 1))
        const previousMonthKey = previousMonthStart.toISOString().slice(0, 7)
        const totals = await db.expenses.getMonthlyTotalsByUserId(pref.userId, 2)
        const match = (totals || []).find((t) => t.monthStart.slice(0, 7) === previousMonthKey)
        if (match && (match.totalOutflows > 0 || match.totalIncomes > 0)) {
            const {title, body} = buildContent("monthlySummary", pref.language, {
                monthLabel: monthLabel(previousMonthStart, pref.language),
                totalOutflows: match.totalOutflows,
                totalIncomes: match.totalIncomes,
            })
            messages.push({userId: pref.userId, type: "monthlySummary", title, body, url: "/dashboard"})
        }
        lastSent.monthlySummary = monthKey
    }

    if (pref.dataUpdateReminder && lastSent.dataUpdateReminder !== todayKey) {
        const [lastExpense, lastBalance] = await Promise.all([
            db.expenses.getLastActivityDateByUserId(pref.userId),
            db.balances.getLatestByUserId(pref.userId),
        ])
        const timestamps = [lastExpense, lastBalance?.date].filter(Boolean).map((d) => new Date(d as string).getTime())
        const mostRecent = timestamps.length > 0 ? Math.max(...timestamps) : null
        if (mostRecent === null || now.getTime() - mostRecent > DATA_UPDATE_STALE_DAYS * DAY_MS) {
            const {title, body} = buildContent("dataUpdateReminder", pref.language, {})
            messages.push({userId: pref.userId, type: "dataUpdateReminder", title, body, url: "/insert-values"})
        }
        lastSent.dataUpdateReminder = todayKey
    }

    if (pref.recurringDue && lastSent.recurringDue !== todayKey) {
        const count = await db.recurringTransactions.getUpcomingCountForUser(pref.userId, now, RECURRING_LOOKAHEAD_DAYS)
        if (count > 0) {
            const {title, body} = buildContent("recurringDue", pref.language, {count})
            messages.push({userId: pref.userId, type: "recurringDue", title, body, url: "/insert-values"})
        }
        lastSent.recurringDue = todayKey
    }

    if (pref.sharedExpenseUpdates && lastSent.sharedExpenseUpdates !== todayKey) {
        const receivables = await db.sharedExpenses.getReceivablesByUserId(pref.userId)
        const hasStalePending = (receivables || []).some(
            (r) => r.status !== "settled" && now.getTime() - new Date(r.date).getTime() > RECEIVABLE_STALE_DAYS * DAY_MS,
        )
        if (hasStalePending) {
            const {title, body} = buildContent("sharedExpenseUpdates", pref.language, {})
            messages.push({userId: pref.userId, type: "sharedExpenseUpdates", title, body, url: "/dashboard"})
        }
        lastSent.sharedExpenseUpdates = todayKey
    }

    if (pref.communityPriceUpdates && lastSent.communityPriceUpdates !== todayKey) {
        if (recentlyVerifiedInstrumentIds.length > 0) {
            const owned = await db.investments.getOwnedInstrumentIds(recentlyVerifiedInstrumentIds, pref.userId)
            if (owned.size > 0) {
                const {title, body} = buildContent("communityPriceUpdates", pref.language, {count: owned.size})
                messages.push({userId: pref.userId, type: "communityPriceUpdates", title, body, url: "/market-prices"})
            }
        }
        lastSent.communityPriceUpdates = todayKey
    }

    return {messages, lastSent}
}
