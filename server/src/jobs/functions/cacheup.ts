import cache from "../../cache/cache"

/**
 * Periodic job that checks the validity of cache items and invalidates them to force their update
 */
async function checkAndUpdateCache() {
    const cacheItems = cache.getExpectedKeys()
    for (let key of cacheItems) {
        const isExpired = await cache.valueExpired(key)
        if (isExpired)
            await cache.invalidate(key)
    }
}

export default {
    checkAndUpdateCache,
}