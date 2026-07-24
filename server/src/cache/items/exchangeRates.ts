/**
 * EUR-based currency exchange rates, fetched from Frankfurter (ECB reference
 * rates) and cached server-side — see cache.ts. Previously the frontend
 * called Frankfurter directly from the browser; besides the extra
 * client-side dependency (ad blockers, per-user rate limiting), that meant
 * every user's browser repeated the same request instead of sharing one
 * cached daily value.
 */

const FRANKFURTER_URL = "https://api.frankfurter.app/latest?from=EUR"

type ExchangeRates = Record<string, number>

/**
 * Fetches the latest EUR exchange rates from Frankfurter.
 * @returns Map of currency code -> rate relative to 1 EUR (EUR itself always 1), or null on failure
 */
async function fetchExchangeRates(): Promise<ExchangeRates | null> {
    const res = await fetch(FRANKFURTER_URL)
    if (!res.ok) {
        console.error("exchangeRates.fetchExchangeRates: Frankfurter request failed", res.status)
        return null
    }
    const data = await res.json() as { rates?: Record<string, number> }
    if (!data?.rates) return null
    return {EUR: 1, ...data.rates}
}

export default {fetchExchangeRates}
