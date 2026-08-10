import db from "../../db/db"

/**
 * Aggregated roadmap vote counts, cached like githubStats.ts so the public
 * /roadmap page doesn't hit the DB on every anonymous visit. Invalidated
 * on-demand right after a successful toggle (see routes/private/roadmapVotes.ts)
 * so a voter sees their own vote reflected immediately, not after the TTL.
 */
async function fetchVoteCounts(): Promise<Record<string, number>> {
    return db.roadmapVotes.getVoteCounts()
}

export default { fetchVoteCounts }
