import { ExtDate } from "../libs/datelib"

import cachestorage from "../db/models/cachestorage"
import averages from "./items/averages"
import prices from "./items/prices"

interface CacheItemInfo {
    durationSec: number
    fetch: () => Promise<object | null>
}

interface CacheItemData {
    value: any
    expiration: ExtDate
}

/**
 * Dictionary of expected keys of the cache
 */
const expectedItems: {[key: string]: CacheItemInfo} = {
    "userAverages": { durationSec: 86400, fetch: averages.fetchUserAverages },
    "crypto": { durationSec: 3600, fetch: prices.fetchCryptoPrices }
};

/**
 * Cached values
 */
let cache: {[key: string]: CacheItemData} = {};

/**
 * Gets the list of expected cache items keys
 * @returns List of keys
 */
function getExpectedKeys() {
    return Object.keys(expectedItems);
}

/**
 * Checks if a cache element is expired
 * @param key Key of the element to check
 * @returns true if the element is expired, false otherwise
 */
function valueExpired(key: string) {
    let now = ExtDate.fromNow()
    return (now >= cache[key].expiration);
}

/**
 * Initializes the cache
 */
async function init() {
    if (Object.keys(cache).length !== 0)    // initialize the cache only if it isn't already initialized
        return;

    let stored_elements = await cachestorage.getAllElements();
    let stored_cache: any = {};
    for (let element of stored_elements)    // list of DB elements is converted to the same structure of the cache
        stored_cache[element.key] = {value: element.value, expiration: element.expirationDate};

    // Restore the cache, element by element, by checking the expected items
    for (let key of Object.keys(expectedItems)) {
        cache[key] = {value: stored_cache[key].value, expiration: stored_cache[key].expiration};
        if (!Object.keys(stored_cache).includes(key) || valueExpired(key))
            await invalidate(key);
    }
}

/**
 * Invalidates one or all elements of the cache
 * @param key Key of the element to invalidate, or 'undefined' to invalidate all
 */
async function invalidate(key: string | undefined = undefined) {
    if (key === undefined) {
        for (let k of Object.keys(expectedItems))
            invalidate(k);
        return;
    }

    if ((!Object.keys(cache).includes(key)) || (!Object.keys(expectedItems).includes(key)))
        return;

    const new_value = await expectedItems[key].fetch();
    if (new_value !== null)
        await set(key, new_value);
}

/**
 * Retrieves the value of a cache element by key
 * @param key Key of the element to get
 * @returns Cached value
 */
function get(key: string) {
    if (!Object.keys(cache).includes(key))
        return null;

    return cache[key].value;
}

/**
 * Stores a new value in the cache and in the database by key
 * @param key Key of the element to set
 * @param value New value to set
 */
async function set(key: string, value: object) {
    if ((!Object.keys(cache).includes(key)) || (!Object.keys(expectedItems).includes(key)) || (!value))
        return;

    let new_expiration = ExtDate.fromNow()
    new_expiration.moveBySeconds(expectedItems[key].durationSec)

    cache[key] = {value: value, expiration: new_expiration};

    await cachestorage.updateElement(key, value, new_expiration);
}

export default {
    getExpectedKeys,
    valueExpired,
    init,
    invalidate,
    get,
    set
};