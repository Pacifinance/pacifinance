const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userId: {type: String, default: "0"},
    password: {type: String, default: "*"},
    roles: {type: [String], default: ["user"]},
    insertRights: {type: Boolean, default: false},
    session: {
        sessionId: {type: String, default: "0"},
        expirationDate: {type: Date, default: new Date(0)}
    }
});

/* ==================== Template queries ==================== */

/**
 * Gets a list of users that match a filter
 * @param {Object} where - filter to match
 * @param {String} select - fields to return
 * @returns List of User documents
 */
async function get(where, select) {
    let users = [];
    const result = await User.find(where, select).exec();
    for (let r of result)
        users.push(r)
    return users;
}

/**
 * Gets a user that match a filter
 * @param {Object} where - filter to match
 * @param {String} select - fields to return
 * @returns User document
 */
async function getOne(where, select) {
    return await User.findOne(where, select).exec();
}

/**
 * Updates a user that match a filter
 * @param {Object} where - filter to match
 * @param {Object} update - fields to update
 * @returns User document
 */
async function setOne(where, update) {
    return await User.findOneAndUpdate(where, {$set: update}).exec();
}

/* ==================== Specific queries ==================== */

/**
 * Gets all user IDs
 * @returns List of User documents
 */
async function getAllUsersIds() {
    return await get({}, "-_id userId");
}

/**
 * Gets the password of a user
 * @param {String} user_id - ID of the user
 * @returns User document
 */
async function getPasswordByUserId(user_id) {
    return await getOne({userId: user_id}, "-_id password");
}

/**
 * Updates the password of a user
 * @param {String} user_id - ID of the user
 * @param {String} hashed_new_pwd - new hashed password to store
 * @returns User document
 */
async function setPasswordOfUserId(user_id, hashed_new_pwd) {
    return await setOne({userId: user_id}, {password: hashed_new_pwd});
}

/**
 * Gets the rights of a user
 * @param {String} user_id - ID of the user
 * @returns User document
 */
async function getRightsByUserId(user_id) {
    return await getOne({userId: user_id}, "-_id insertRights");
}

/**
 * Gets the session of a user
 * @param {String} user_id - ID of the user
 * @returns User document
 */
async function getSessionByUserId(user_id) {
    return await getOne({userId: user_id}, "-_id session");
}

/**
 * Updates the session of a user
 * @param {String} user_id - ID of the user
 * @param {String} session_id - ID of the session
 * @param {Date} expiration_date - expiration date of the session
 * @returns User document
 */
async function setSessionOfUserId(user_id, session_id, expiration_date) {
    return await setOne({userId: user_id}, {session: {
        sessionId: session_id,
        expirationDate: expiration_date
    }});
}

/**
 * User model
 */
const User = mongoose.model("User", userSchema);

module.exports = {
    User,
    getAllUsersIds,
    getPasswordByUserId,
    setPasswordOfUserId,
    getRightsByUserId,
    getSessionByUserId,
    setSessionOfUserId
};