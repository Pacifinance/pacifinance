import { logger } from "./logger"

const GITHUB_REPO = "Pacifinance/Pacifinance"
const GITHUB_API_BASE = "https://api.github.com"

export type FeedbackType = "bug" | "idea" | "other"

const LABELS_BY_TYPE: Record<FeedbackType, string> = {
    bug: "bug",
    idea: "enhancement",
    other: "feedback",
}

export type CreateIssueInput = {
    type: FeedbackType
    title: string
    description: string
    page?: string
}

export type CreateIssueResult = {
    issueUrl: string
    issueNumber: number
}

/**
 * Creates a GitHub issue from in-app feedback, posted by the bot account
 * that owns GITHUB_ISSUE_TOKEN - never the submitting user's identity. The
 * issue body only contains what the user typed plus the optional page they
 * were on; no userId or other identifying data.
 *
 * Deliberately a separate token from GITHUB_TOKEN (server/src/cache/items/githubStats.ts),
 * which is read-only and only raises the anonymous rate-limit ceiling. This
 * one needs "Issues: write" (or classic public_repo) scope - keeping them
 * separate means a leaked read-only token can't be used to create issues.
 */
async function createIssue(input: CreateIssueInput): Promise<CreateIssueResult | null> {
    const token = process.env.GITHUB_ISSUE_TOKEN
    if (!token) {
        logger.info("githubIssues.createIssue: GITHUB_ISSUE_TOKEN not configured")
        return null
    }

    const bodyLines = [
        input.description,
        "",
        "---",
        `Submitted via the in-app feedback form${input.page ? ` (page: ${input.page})` : ""}.`,
    ]

    try {
        const response = await fetch(`${GITHUB_API_BASE}/repos/${GITHUB_REPO}/issues`, {
            method: "POST",
            headers: {
                accept: "application/vnd.github+json",
                authorization: `Bearer ${token}`,
                "content-type": "application/json",
            },
            body: JSON.stringify({
                title: input.title,
                body: bodyLines.join("\n"),
                labels: [LABELS_BY_TYPE[input.type]],
            }),
        })

        if (response.status !== 201) {
            logger.info(`githubIssues.createIssue: GitHub API returned status ${response.status}`)
            return null
        }

        const issue = await response.json() as { html_url: string; number: number }
        return { issueUrl: issue.html_url, issueNumber: issue.number }
    } catch (error) {
        logger.info(`githubIssues.createIssue: request failed: ${String(error)}`)
        return null
    }
}

export default { createIssue }
