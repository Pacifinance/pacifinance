/**
 * Runs `fn` over `items` with at most `concurrency` in flight at once,
 * preserving result order. Used by the monthly averages/rankings cache
 * computation (server/src/cache/items/{averages,rankings}.ts) to keep it
 * inside Vercel's function timeout: those jobs do several DB round trips per
 * user, and running them one user at a time made the whole computation scale
 * linearly with the user count until it exceeded the timeout. A bounded
 * concurrency (rather than unbounded Promise.all) avoids overwhelming the
 * Postgres connection pool as the user base grows.
 */
export async function mapWithConcurrency<T, R>(
    items: T[],
    concurrency: number,
    fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
    const results: R[] = new Array(items.length)
    let nextIndex = 0

    async function worker() {
        while (true) {
            const i = nextIndex++
            if (i >= items.length) return
            results[i] = await fn(items[i], i)
        }
    }

    const workerCount = Math.max(1, Math.min(concurrency, items.length))
    await Promise.all(Array.from({length: workerCount}, () => worker()))

    return results
}
