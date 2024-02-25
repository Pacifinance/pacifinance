const mongoose = require("mongoose");
const users = require("./users.js");

const deletionQueueSchema = new mongoose.Schema({
    userRef: {type: mongoose.Types.ObjectId, ref: "User", required: true, unique: true, dropDups: true},
    date: {type: Date, required: true}
});

/**
 * Adds a document to the deletion queue
 * @param {Object} data - data of the new DeletionQueue document 
 * @returns DeletionQueue document
 */
async function addOne(data) {
    return (await DeletionQueue.create(data)).toJSON();
}

/**
 * Gets a list of documents that match a filter
 * @param {Object} where - filter to match
 * @param {String} select - fields to return
 * @returns List of DeletionQueue documents
 */
async function get(where, select) {
    return await DeletionQueue.find(where, select).lean().exec();
}

/**
 * Deletes a document from the deletion queue
 * @param {Object} where - filter to match
 * @returns DeleteResult object
 */
async function deleteOne(where) {
    return await DeletionQueue.deleteOne(where).lean().exec();
}

/* ==================== Specific queries ==================== */

/**
 * Adds a new account to the deletion queue
 * @param {String} user_id - ID of the user
 * @param {Date} date - expected deletion date
 */
async function insertNew(user_id, date) {
    const user = await users.getReferenceByUserId(user_id);
    if (user === null)
        return null;
    // Do not add the account to the queue if it's already present
    const docs = await get({userRef: user._id});
    if (docs.length !== 0)
        return null;
    // Add the account to the queue
    const data = {
        userRef: user._id,
        date: date
    };
    return await addOne(data);
}

/**
 * Gets all accounts currently in the deletion queue
 * @returns List of DeletionQueue documents
 */
async function getAllAccountsInQueue() {
    return await get({}, "-__v");
}

/**
 * Removes an account from the deletion queue given a reference to its User document
 * @param {mongoose.ObjectId} user_ref - reference to a User document
 * @returns DeleteResult object
 */
async function removeFromQueueByUserRef(user_ref) {
    return await deleteOne({userRef: user_ref});
}

/**
 * DeletionQueue model
 */
const DeletionQueue = mongoose.model("Deletion", deletionQueueSchema);

module.exports = {
    insertNew,
    getAllAccountsInQueue,
    removeFromQueueByUserRef
};