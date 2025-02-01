import mongoose from "mongoose";

const cacheSchema = new mongoose.Schema({
    key: {type: String, required: true, unique: true, dropDups: true},
    value: {type: Object, required: true},
    expirationDate: {type: Date, required: true}
});

/* ==================== Template queries ==================== */

/**
 * Gets a list of cached elements that match a filter
 * @param where Filter to match
 * @param select Fields to return
 * @returns List of Cache documents
 */
async function get(where: object, select: string) {
    return await Cache.find(where, select).lean().exec();
}

/**
 * Updates a cached element that matches a filter
 * @param where Filter to match
 * @param update Fields to update
 * @returns Cache document
 */
async function setOne(where: object, update: object) {
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
 * @param key Key of the element to update
 * @param value New value
 * @param expiration_date New expiration date
 * @returns Cache document
 */
async function updateElement(key: string, value: object, expiration_date: Date) {
    return await setOne({key: key}, {value: value, expirationDate: expiration_date});
}

/**
 * Cache model
 */
const Cache = mongoose.model("Cache", cacheSchema);

export default {
    getAllElements,
    updateElement
};