const TURNSTILE_PLACEHOLDERS = new Set([
    "[sensitive]",
    "your-site-key",
    "your_turnstile_site_key",
    "changeme",
    "replace-me",
]);

// Cloudflare's own published test sitekeys (see .env.example's Turnstile
// section) - always pass/fail regardless of the real token, and their
// siteverify response always reports hostname "example.com" rather than the
// page's real origin. Fine for local testing, worth flagging to a
// self-hoster so they don't mistake the widget's own visible test banner for
// something broken, or ship it to a real deployment by accident.
const TURNSTILE_TEST_SITE_KEYS = new Set([
    "1x00000000000000000000AA",
    "2x00000000000000000000AB",
    "1x00000000000000000000BB",
    "2x00000000000000000000BB",
    "3x00000000000000000000FF",
]);

export function isTurnstileTestSiteKey(value: unknown): boolean {
    return typeof value === "string" && TURNSTILE_TEST_SITE_KEYS.has(value.trim());
}

export function normalizeTurnstileSiteKey(value: unknown): string | null {
    if (typeof value !== "string") return null;

    let normalized = value.trim();
    const hasMatchingQuotes =
        (normalized.startsWith('"') && normalized.endsWith('"')) ||
        (normalized.startsWith("'") && normalized.endsWith("'"));

    if (hasMatchingQuotes) normalized = normalized.slice(1, -1).trim();

    if (!normalized || TURNSTILE_PLACEHOLDERS.has(normalized.toLowerCase())) return null;

    return normalized;
}
