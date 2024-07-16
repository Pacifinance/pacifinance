const mongoose = require("mongoose");

const cacheSchema = new mongoose.Schema({
    key: {type: String, required: true, unique: true, dropDups: true},
    value: {type: Object, required: true},
    expirationDate: {type: Date, required: true}
});

/* ==================== Template queries ==================== */

/**
 * Gets a list of cached elements that match a filter
 * @param {Object} where - filter to match
 * @param {String} select - fields to return
 * @returns List of Cache documents
 */
async function get(where, select) {
    return await Cache.find(where, select).lean().exec();
}

/**
 * Updates a cached element that matches a filter
 * @param {Object} where - filter to match
 * @param {Object} update - fields to update
 * @returns Cache document
 */
async function setOne(where, update) {
    return await Cache.findOneAndUpdate(where, {$set: update}, {upsert: true}).lean().exec();
}

/* ==================== Specific queries ==================== */

/**
 * Gets all cache elements stored in the database
 * @returns List of Cache documents
 */
async function getAllElements() {
    return await get({}, "-_id -__v")
}

/**
 * Updates the value and the expiration date of a single cached element
 * @param {String} key - Key of the element to update
 * @param {Object} value - New value
 * @param {Date} expiration_date - New expiration date
 * @returns Cache document
 */
async function updateElement(key, value, expiration_date) {
    return await setOne({key: key}, {value: value, expirationDate: expiration_date});
}

/**
 * Cache model
 */
const Cache = mongoose.model("Cache", cacheSchema);

module.exports = {
    getAllElements,
    updateElement
};