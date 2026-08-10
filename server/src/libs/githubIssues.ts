import { logger } from "./logger"
import githubApp from "./githubApp"

const GITHUB_REPO = "Pacifinance/Pacifinance"
const GITHUB_API_BASE = "https://api.github.com"

export type FeedbackType = "bug" | "idea" | "other"

const LABELS_BY_TYPE: Record<FeedbackType, string> = {
    bug: "bug",
    idea: "enhancement",
    other: "feedback",
}

// Every auto-created issue gets this label too, so maintainers can filter
// for "new, unreviewed community feedback" in one view instead of a bespoke
// private moderation queue - GitHub's own issue tools (edit/close/lock,
// block a user) are the moderation layer, same as any other bot-filed issue.
const TRIAGE_LABEL = "needs-triage"

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
 * Creates a GitHub issue from in-app feedback, posted by our GitHub App's
 * installation - shows up authored by "<app-name>[bot]", never by whichever
 * human's key signs the App's JWT (see githubApp.ts) and never by the
 * submitting user (who has no GitHub identity to begin with - accounts here
 * are anonymous). The issue body only contains what the user typed plus the
 * optional page they were on; no userId or other identifying data.
 *
 * Deliberately a separate credential from GITHUB_TOKEN (server/src/cache/items/githubStats.ts),
 * which is read-only and only raises the anonymous rate-limit ceiling for
 * public repo stats - keeping them separate means that read-only token
 * can't be used to create issues even if it leaked.
 */
async function createIssue(input: CreateIssueInput): Promise<CreateIssueResult | null> {
    const token = await githubApp.getInstallationToken()
    if (!token) {
        logger.info("githubIssues.createIssue: no GitHub App installation token available")
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
                labels: [LABELS_BY_TYPE[input.type], TRIAGE_LABEL],
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
