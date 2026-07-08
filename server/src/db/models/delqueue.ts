import supabase from "../supabase"

/* ==================== Specific queries ==================== */

/**
 * Adds a new account to the deletion queue
 * @param user_id uuid of the user
 * @param date Expected deletion date
 * @returns {userId, scheduledFor} object, or null if already queued / on error
 */
async function insertNew(user_id: string, date: Date) {
    const {data: existing} = await supabase.from("deletions")
        .select("user_id").eq("user_id", user_id).maybeSingle()
    if (existing !== null)
        return null

    const {data, error} = await supabase.from("deletions").insert({
        user_id, scheduled_for: date
    }).select("user_id, scheduled_for").single()
    if (error) console.error("delqueue.insertNew: failed to insert deletion row", error)
    if (error || !data) return null
    return {userId: data.user_id as string, scheduledFor: new Date(data.scheduled_for)}
}

/**
 * Gets all accounts currently in the deletion queue
 * @returns List of {userId, scheduledFor} objects
 */
async function getAllAccountsInQueue() {
    const {data, error} = await supabase.from("deletions").select("user_id, scheduled_for")
    if (error) console.error("delqueue.getAllAccountsInQueue: failed to read deletion queue", error)
    if (error || !data) return []
    return data.map((row) => ({userId: row.user_id as string, scheduledFor: new Date(row.scheduled_for)}))
}

/**
 * Removes an account from the deletion queue
 * @param user_id uuid of the user
 */
async function removeFromQueueByUserId(user_id: string) {
    const {error} = await supabase.from("deletions").delete().eq("user_id", user_id)
    if (error) console.error("delqueue.removeFromQueueByUserId: failed to delete queue entry", error)
    return error ? null : {userId: user_id}
}

export default {
    insertNew,
    getAllAccountsInQueue,
    removeFromQueueByUserId
};
