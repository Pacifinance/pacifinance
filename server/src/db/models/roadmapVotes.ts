import supabase from "../supabase"

/**
 * One vote per user per roadmap item (see supabase/migrations/add-roadmap-votes.sql).
 * item_id is the stable id from scripts/roadmap-items.json, not a DB foreign key.
 */

type VoteRow = {
    item_id: string
}

/**
 * Aggregated vote count per item, for every item that has at least one vote.
 * Items with zero votes simply don't appear in the returned map.
 */
async function getVoteCounts(): Promise<Record<string, number>> {
    const {data, error} = await supabase.from("roadmap_votes").select("item_id")
    if (error) {
        console.error("roadmapVotes.getVoteCounts: failed to read votes", error)
        return {}
    }

    const counts: Record<string, number> = {}
    for (const row of (data as unknown as VoteRow[] ?? [])) {
        counts[row.item_id] = (counts[row.item_id] ?? 0) + 1
    }
    return counts
}

/**
 * Item ids the given user has voted for.
 */
async function getVotesByUserId(user_id: string): Promise<string[]> {
    const {data, error} = await supabase.from("roadmap_votes")
        .select("item_id")
        .eq("user_id", user_id)
    if (error) {
        console.error("roadmapVotes.getVotesByUserId: failed to read votes", error)
        return []
    }
    return (data as unknown as VoteRow[] ?? []).map((row) => row.item_id)
}

/**
 * Toggles a user's vote for an item: inserts if absent, deletes if present.
 * Returns the resulting voted state, or null on a DB error.
 */
async function toggleVote(user_id: string, item_id: string): Promise<boolean | null> {
    const {data: existing, error: selectError} = await supabase.from("roadmap_votes")
        .select("id")
        .eq("user_id", user_id)
        .eq("item_id", item_id)
        .maybeSingle()

    if (selectError) {
        console.error("roadmapVotes.toggleVote: failed to check existing vote", selectError)
        return null
    }

    if (existing) {
        const {error: deleteError} = await supabase.from("roadmap_votes")
            .delete()
            .eq("user_id", user_id)
            .eq("item_id", item_id)
        if (deleteError) {
            console.error("roadmapVotes.toggleVote: failed to remove vote", deleteError)
            return null
        }
        return false
    }

    const {error: insertError} = await supabase.from("roadmap_votes")
        .insert({user_id, item_id})
    if (insertError) {
        console.error("roadmapVotes.toggleVote: failed to insert vote", insertError)
        return null
    }
    return true
}

export default {
    getVoteCounts,
    getVotesByUserId,
    toggleVote,
}
