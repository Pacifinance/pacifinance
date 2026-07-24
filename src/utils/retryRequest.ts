/**
 * Retries a read-only request on transient failures (network error / 5xx),
 * with exponential backoff. Never retries 4xx (auth/validation failures don't
 * fix themselves on retry) — only genuinely transient conditions, e.g. a
 * serverless cold start or a momentary DB read hiccup.
 *
 * Only wrap idempotent GET-style calls with this — retrying a POST that
 * mutates data (add/delete/update) could double-apply it.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  { retries = 2, baseDelayMs = 400 }: { retries?: number; baseDelayMs?: number } = {},
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      const isRetryable = status === undefined || status >= 500;
      if (!isRetryable || attempt >= retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * 2 ** attempt));
    }
  }
}
