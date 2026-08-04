const TURNSTILE_PLACEHOLDERS = new Set([
    "[sensitive]",
    "your-site-key",
    "your_turnstile_site_key",
    "changeme",
    "replace-me",
]);

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
