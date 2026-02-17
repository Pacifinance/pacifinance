import { createClient, RedisJSON } from "redis"

import { ExtDate } from "../libs/datelib"

import averages from "./items/averages"
import prices from "./items/prices"

interface CacheItemInfo {
    durationSec: number
    fetch: () => Promise<RedisJSON | null>
}

type CacheItemData = {
    value: RedisJSON
    expiration: string
}

/**
 * Dictionary of expected keys of the cache
 */
const expectedItems: {[key: string]: CacheItemInfo} = {
    "userAverages": { durationSec: 86400, fetch: averages.fetchUserAverages },
    "crypto": { durationSec: 3600, fetch: prices.fetchCryptoPrices }
}

/**
 * Redis client for caching values
 */
const cacheClient = createClient({url: process.env.REDIS_URI})
cacheClient.on("error", err => console.log("Redis cache client error: ", err))

/**
 * Gets the list of expected cache items keys
 * @returns List of keys
 */
function getExpectedKeys() {
    return Object.keys(expectedItems)
}

/**
 * Retrieves the data from the cache associated to the given key, and parses it as JSON
 * @param key Key of the element to get
 * @returns Cached data for the given key, or null if no data was found for the key
 */
async function getCachedItemData(key: string): Promise<CacheItemData | null> {
    return await cacheClient.json.get(key) as CacheItemData | null
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
 * Initializes the cache
 */
async function init() {
    // Connect the client
    if (cacheClient.isReady)
        return
    await cacheClient.connect()

    // Check for expired entries
    for (let key of Object.keys(expectedItems)) {
        const isExpired = await valueExpired(key)
        if (isExpired)
            await invalidate(key)
    }
}

/**
 * Invalidates one or all elements of the cache
 * @param key Key of the element to invalidate, or 'undefined' to invalidate all
 */
async function invalidate(key: string | undefined = undefined) {
    if (key === undefined) {
        for (let k of Object.keys(expectedItems))
            invalidate(k)
        return
    }

    if (!Object.keys(expectedItems).includes(key))
        return

    const new_value = await expectedItems[key].fetch()
    if (new_value !== null)
        await set(key, new_value)
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
 * Stores a new value in the cache and in the database by key
 * @param key Key of the element to set
 * @param value New value to set
 */
async function set(key: string, value: RedisJSON) {
    if ((!Object.keys(expectedItems).includes(key)) || (!value))
        return

    let new_expiration = ExtDate.fromNow()
    new_expiration.moveBySeconds(expectedItems[key].durationSec)

    const newCacheItemData: CacheItemData = {
        value: value,
        expiration: new_expiration.toISOString()
    }

    await cacheClient.json.set(key, "$", newCacheItemData)
}

export default {
    getExpectedKeys,
    valueExpired,
    init,
    invalidate,
    get,
    set
}