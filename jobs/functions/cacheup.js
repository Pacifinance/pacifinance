const cache = require("../../cache/cache.js");

/**
 * Periodic job that checks the validity of cache items and invalidates them to force their update
 */
async function checkAndUpdateCache() {
    const cacheItems = cache.getExpectedKeys();
    for (let key of cacheItems) {
        if (cache.valueExpired(key))
            cache.invalidate(key);
    }
}

module.exports = {
    checkAndUpdateCache,
};