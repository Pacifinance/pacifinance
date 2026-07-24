import { ExtDate } from "../libs/datelib"

import redis from "./redisClient"
import averages from "./items/averages"
import rankings from "./items/rankings"
import prices from "./items/prices"
import exchangeRates from "./items/exchangeRates"

interface CacheItemInfo {
    durationSec: number
    fetch: () => Promise<any>
}

type CacheItemData = {
    value: any
    expiration: string
}

// A bit over 31 days: comfortably longer than any calendar month, so by the
// time the monthly cron (vercel.json, 1st of the month) fires again, the
// previous value is guaranteed expired and gets recomputed.
const MONTHLY_DURATION_SEC = 32 * 86400

/**
 * Dictionary of expected keys of the cache
 */
const expectedItems: {[key: string]: CacheItemInfo} = {
    "userAverages": { durationSec: MONTHLY_DURATION_SEC, fetch: averages.fetchUserAverages },
    "userRankings": { durationSec: MONTHLY_DURATION_SEC, fetch: rankings.fetchUserRankings },
    "crypto": { durationSec: 3600, fetch: prices.fetchCryptoPrices },
    "exchangeRates": { durationSec: 86400, fetch: exchangeRates.fetchExchangeRates }
}

/**
 * Gets the list of expected cache items keys
 * @returns List of keys
 */
function getExpectedKeys() {
    return Object.keys(expectedItems)
}

/**
 * Retrieves the data from the cache associated to the given key
 * @param key Key of the element to get
 * @returns Cached data for the given key, or null if no data was found for the key
 */
async function getCachedItemData(key: string): Promise<CacheItemData | null> {
    return await redis.get<CacheItemData>(key)
}

/**
 * Checks if a cache element is expired
 * @param key Key of the element to check
 * @returns true if the element is expired, false otherwise
 */
async function valueExpired(key: string) {
    const data = await getCachedItemData(key)
    if (!data)
        return true

    const now = ExtDate.fromNow()
    const expirationDate = new ExtDate(data.expiration)
    return (now >= expirationDate)
}

/**
 * Invalidates one or all elements of the cache, refetching their value
 * @param key Key of the element to invalidate, or 'undefined' to invalidate all
 */
async function invalidate(key: string | undefined = undefined) {
    if (key === undefined) {
        for (const k of Object.keys(expectedItems))
            await invalidate(k)
        return
    }

    if (!Object.keys(expectedItems).includes(key))
        return

    const new_value = await expectedItems[key].fetch()
    if (new_value !== null)
        await set(key, new_value)
    else
        console.error(`cache.invalidate: fetch for "${key}" returned null, keeping stale cached value`)
}

/**
 * Retrieves the value of a cache element by key
 * @param key Key of the element to get
 * @returns Cached value
 */
async function get(key: string) {
    if (!Object.keys(expectedItems).includes(key))
        return null

    const data = await getCachedItemData(key)
    if (!data)
        return null
    return data.value
}

/**
 * Stores a new value in the cache by key
 * @param key Key of the element to set
 * @param value New value to set
 */
async function set(key: string, value: any) {
    if ((!Object.keys(expectedItems).includes(key)) || (!value))
        return

    const new_expiration = ExtDate.fromNow()
    new_expiration.moveBySeconds(expectedItems[key].durationSec)

    const newCacheItemData: CacheItemData = {
        value: value,
        expiration: new_expiration.toISOString()
    }

    await redis.set(key, newCacheItemData)
}

export default {
    getExpectedKeys,
    valueExpired,
    invalidate,
    get,
    set
}
