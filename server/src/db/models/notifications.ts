import supabase from "../supabase"

export interface NotificationPreferencesInput {
    enabled: boolean
    monthlySummary: boolean
    dataUpdateReminder: boolean
    recurringDue: boolean
    sharedExpenseUpdates: boolean
    communityPriceUpdates: boolean
    reminderDay: number
    reminderHour: number
    timezone: string
    language: string
}

const DEFAULTS: NotificationPreferencesInput = {
    enabled: false,
    monthlySummary: true,
    dataUpdateReminder: true,
    recurringDue: true,
    sharedExpenseUpdates: true,
    communityPriceUpdates: true,
    reminderDay: 1,
    reminderHour: 18,
    timezone: "UTC",
    language: "it",
}

const mapPreferences = (row: Record<string, unknown> | null) => row ? ({
    enabled: row.enabled === true,
    monthlySummary: row.monthly_summary !== false,
    dataUpdateReminder: row.data_update_reminder !== false,
    recurringDue: row.recurring_due !== false,
    sharedExpenseUpdates: row.shared_expense_updates !== false,
    communityPriceUpdates: row.community_price_updates !== false,
    reminderDay: Number(row.reminder_day || 1),
    reminderHour: Number(row.reminder_hour ?? 18),
    timezone: String(row.timezone || "UTC"),
    language: String(row.language || "it"),
}) : DEFAULTS

async function getPreferences(userId: string) {
    const {data, error} = await supabase.from("notification_preferences").select("*").eq("user_id", userId).maybeSingle()
    if (error) console.error("notifications.getPreferences: failed", error)
    if (error) return null
    return mapPreferences(data as Record<string, unknown> | null)
}

async function savePreferences(userId: string, input: NotificationPreferencesInput) {
    const {data, error} = await supabase.from("notification_preferences").upsert({
        user_id: userId,
        enabled: input.enabled,
        monthly_summary: input.monthlySummary,
        data_update_reminder: input.dataUpdateReminder,
        recurring_due: input.recurringDue,
        shared_expense_updates: input.sharedExpenseUpdates,
        community_price_updates: input.communityPriceUpdates,
        reminder_day: input.reminderDay,
        reminder_hour: input.reminderHour,
        timezone: input.timezone,
        language: input.language,
        updated_at: new Date().toISOString(),
    }, {onConflict: "user_id"}).select("*").single()
    if (error) console.error("notifications.savePreferences: failed", error)
    return error || !data ? null : mapPreferences(data as Record<string, unknown>)
}

interface PushSubscriptionInput { endpoint: string; p256dh: string; auth: string; userAgent?: string }

async function saveSubscription(userId: string, input: PushSubscriptionInput) {
    const {data, error} = await supabase.from("push_subscriptions").upsert({
        user_id: userId,
        endpoint: input.endpoint,
        p256dh: input.p256dh,
        auth: input.auth,
        user_agent: input.userAgent || null,
        updated_at: new Date().toISOString(),
    }, {onConflict: "endpoint"}).select("id").single()
    if (error) console.error("notifications.saveSubscription: failed", error)
    return error || !data ? null : {id: data.id}
}

async function deleteSubscription(userId: string, endpoint: string) {
    const {error} = await supabase.from("push_subscriptions").delete().eq("user_id", userId).eq("endpoint", endpoint)
    if (error) console.error("notifications.deleteSubscription: failed", error)
    return error ? null : {deleted: true}
}

export interface EnabledPreferencesRow extends NotificationPreferencesInput {
    userId: string
    lastSent: Record<string, string>
}

export interface PushSubscriptionRow {
    id: number
    endpoint: string
    p256dh: string
    auth: string
    userAgent: string | null
}

/**
 * Cross-user query (cron only, service-role client — see
 * server/src/routes/cron/cron.ts for the shared-secret auth gate) of every
 * user with reminders turned on. send-reminders then narrows this down to
 * whoever is actually due right now (day/hour/timezone) and has something to say.
 */
async function getEnabledPreferences(): Promise<EnabledPreferencesRow[]> {
    const {data, error} = await supabase.from("notification_preferences").select("*").eq("enabled", true)
    if (error) console.error("notifications.getEnabledPreferences: failed", error)
    if (error || !data) return []
    return (data as Record<string, unknown>[]).map((row) => ({
        ...mapPreferences(row),
        userId: row.user_id as string,
        lastSent: (row.last_sent as Record<string, string>) || {},
    }))
}

/** Every push subscription (possibly several, one per device/browser) for the given users. */
async function getSubscriptionsForUsers(userIds: string[]): Promise<Map<string, PushSubscriptionRow[]>> {
    const map = new Map<string, PushSubscriptionRow[]>()
    if (userIds.length === 0) return map
    const {data, error} = await supabase.from("push_subscriptions").select("*").in("user_id", userIds)
    if (error) console.error("notifications.getSubscriptionsForUsers: failed", error)
    if (error || !data) return map
    for (const row of data as Record<string, unknown>[]) {
        const userId = row.user_id as string
        const list = map.get(userId) || []
        list.push({id: row.id as number, endpoint: row.endpoint as string, p256dh: row.p256dh as string, auth: row.auth as string, userAgent: (row.user_agent as string) || null})
        map.set(userId, list)
    }
    return map
}

/** Persists the idempotency watermark after a send-reminders pass for one user. */
async function updateLastSent(userId: string, lastSent: Record<string, string>) {
    const {error} = await supabase.from("notification_preferences")
        .update({last_sent: lastSent, updated_at: new Date().toISOString()})
        .eq("user_id", userId)
    if (error) console.error("notifications.updateLastSent: failed", error)
    return !error
}

export default {
    getPreferences,
    savePreferences,
    saveSubscription,
    deleteSubscription,
    getEnabledPreferences,
    getSubscriptionsForUsers,
    updateLastSent,
}
