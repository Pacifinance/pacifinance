import supabase from "../supabase"
import { ExtDate } from "../../libs/datelib"

const ALGORITHM_VERSION = "similarity-v1"
const PROFILE_COLUMNS = [
    "job_country_tag_id", "job_tag_id", "job_type_tag_id", "work_time_tag_id", "remote_type_tag_id",
    "living_situation_tag_id", "housing_type_tag_id", "children_tag_id", "country_tag_id",
    "age_tag_id", "years_of_experience_tag_id"
]

type SnapshotProfile = { id: string, account_type: number, benchmark_consent?: boolean } & Record<string, number | null | string | boolean>

function monthStart(date: ExtDate) {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-01`
}

async function getProfiles(date: ExtDate): Promise<SnapshotProfile[]> {
    const {data, error} = await supabase.from("benchmark_profile_snapshots")
        .select(`user_id, account_type, ${PROFILE_COLUMNS.join(", ")}`)
        .eq("month_start", monthStart(date))
    if (error) console.error("benchmarkSnapshots.getProfiles: failed to read monthly snapshot", error)
    if (error || !data) return []
    return data.map((row: any) => ({...row, id: row.user_id as string})) as SnapshotProfile[]
}

async function saveProfiles(date: ExtDate, profiles: SnapshotProfile[]) {
    if (profiles.length === 0) return
    const month_start = monthStart(date)
    const {error: runError} = await supabase.from("benchmark_runs").upsert({
        month_start,
        algorithm_version: ALGORITHM_VERSION,
        contributor_count: profiles.length
    }, {onConflict: "month_start", ignoreDuplicates: true})
    if (runError) {
        console.error("benchmarkSnapshots.saveProfiles: failed to create benchmark run", runError)
        return
    }

    const rows = profiles.map((profile) => {
        const row: Record<string, unknown> = {month_start, user_id: profile.id, account_type: profile.account_type}
        for (const column of PROFILE_COLUMNS) row[column] = profile[column] ?? null
        return row
    })
    const {error} = await supabase.from("benchmark_profile_snapshots")
        .upsert(rows, {onConflict: "month_start,user_id", ignoreDuplicates: true})
    if (error) console.error("benchmarkSnapshots.saveProfiles: failed to save profile snapshot", error)
}

/** Delete all stored community-profile buckets when a user revokes consent. */
async function deleteProfilesByUserId(userId: string) {
    const {data: affectedSnapshots, error: readError} = await supabase.from("benchmark_profile_snapshots")
        .select("month_start")
        .eq("user_id", userId)
    if (readError) console.error("benchmarkSnapshots.deleteProfilesByUserId: failed to read snapshots", readError)

    const {error} = await supabase.from("benchmark_profile_snapshots").delete().eq("user_id", userId)
    if (error) console.error("benchmarkSnapshots.deleteProfilesByUserId: failed to delete snapshots", error)
    if (error || readError) return false

    // This path is rare (a consent revocation), so recounting affected months
    // keeps the displayed contributor count exact without complicating writes.
    const months = new Set((affectedSnapshots ?? []).map((snapshot: any) => snapshot.month_start as string))
    for (const month_start of months) {
        const {count, error: countError} = await supabase.from("benchmark_profile_snapshots")
            .select("user_id", {count: "exact", head: true})
            .eq("month_start", month_start)
        if (countError) {
            console.error("benchmarkSnapshots.deleteProfilesByUserId: failed to recount snapshots", countError)
            continue
        }
        const {error: updateError} = await supabase.from("benchmark_runs")
            .update({contributor_count: count ?? 0})
            .eq("month_start", month_start)
        if (updateError) console.error("benchmarkSnapshots.deleteProfilesByUserId: failed to update contributor count", updateError)
    }
    return !error
}

/**
 * All monthly community-benchmark profile-bucket snapshots stored for a
 * user — used by the data-export endpoint. getProfiles above is scoped by
 * month (for computing one month's cohorts); this is scoped by user, the
 * same way deleteProfilesByUserId already reads this table.
 */
async function getSnapshotsByUserId(user_id: string) {
    const {data, error} = await supabase.from("benchmark_profile_snapshots")
        .select(`month_start, account_type, ${PROFILE_COLUMNS.join(", ")}`)
        .eq("user_id", user_id)
        .order("month_start", {ascending: false})
    if (error) console.error("benchmarkSnapshots.getSnapshotsByUserId: failed to read snapshots", error)
    if (error || !data) return []
    return data
}

export default { getProfiles, saveProfiles, deleteProfilesByUserId, getSnapshotsByUserId }
