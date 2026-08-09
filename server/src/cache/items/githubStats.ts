import { logger } from "../../libs/logger"

const GITHUB_REPO = "pacifinance/pacifinance"
const GITHUB_API_BASE = "https://api.github.com"

export type GitHubStatsData = {
    stars: number
    forks: number
    openIssues: number
    contributors: number
    updatedAt: string
}

type GitHubRepoResponse = {
    stargazers_count: number
    forks_count: number
    open_issues_count: number
}

/** GitHub paginates the contributors list; with per_page=1 the "last" page
 * number in the Link header IS the total contributor count, avoiding a full
 * list fetch just to count entries. Falls back to the response body's own
 * length (0 or 1) when there's no Link header, i.e. one page total. */
function parseLastPageFromLinkHeader(linkHeader: string | null): number | null {
    if (!linkHeader) return null
    const lastLink = linkHeader.split(",").find((part) => part.includes('rel="last"'))
    if (!lastLink) return null
    const match = lastLink.match(/[?&]page=(\d+)/)
    return match ? Number(match[1]) : null
}

async function fetchContributorsCount(headers: Record<string, string>): Promise<number> {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contributors?per_page=1&anon=true`, {headers})
    if (response.status !== 200) return 0
    const lastPage = parseLastPageFromLinkHeader(response.headers.get("link"))
    if (lastPage !== null) return lastPage
    const body = await response.json() as unknown[]
    return Array.isArray(body) ? body.length : 0
}

/**
 * Public GitHub repository stats (stars, forks, open issues, contributors)
 * shown on the landing page as a concrete, verifiable signal of an active
 * open-source project. Unauthenticated GitHub API calls are capped at 60/hr
 * per IP, but this runs once per cache TTL regardless of visitor traffic
 * (see cache.ts's expectedItems) - real usage never gets close to that
 * limit. GITHUB_TOKEN is optional and only raises the rate-limit ceiling,
 * never required for this to work.
 */
async function fetchGitHubStats(): Promise<GitHubStatsData | null> {
    const headers: Record<string, string> = {accept: "application/vnd.github+json"}
    if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`

    try {
        const repoResponse = await fetch(`${GITHUB_API_BASE}/repos/${GITHUB_REPO}`, {headers})
        if (repoResponse.status !== 200) {
            logger.info(`githubStats.fetchGitHubStats: repo request failed with status ${repoResponse.status}`)
            return null
        }
        const repo = await repoResponse.json() as GitHubRepoResponse
        const contributors = await fetchContributorsCount(headers)

        return {
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            openIssues: repo.open_issues_count,
            contributors,
            updatedAt: new Date().toISOString(),
        }
    } catch (error) {
        logger.info(`githubStats.fetchGitHubStats: request failed: ${String(error)}`)
        return null
    }
}

export default { fetchGitHubStats }
