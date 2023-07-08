const mongoose = require("mongoose");

const userIdLength = 6;
const sessionIdLength = 32;

const userSchema = new mongoose.Schema({
    userId: {type: String, required: true, unique: true, dropDups: true},
    password: {type: String, required: true},
    creationDate: {type: Date, required: true},
    nickname: {type: String, default: ""},
    nation: {type: String, default: ""},
    occupation: {type: String, default: ""},
    roles: {type: [String], required: true},
    expenseCategories: [{
        name: {type: String, required: true},
        tag: {type: String, required: true}
    }],
    session: {type: {
        sessionId: {type: String, required: true, unique: true, dropDups: true},
        expirationDate: {type: Date, required: true}
    }, required: true}
});

/* ==================== Template queries ==================== */

/**
 * Adds a user
 * @param {Object} data - data of the new User document 
 * @returns User document
 */
async function addOne(data) {
    return (await User.create(data)).toJSON();
}

/**
 * Gets a list of users that match a filter
 * @param {Object} where - filter to match
 * @param {String} select - fields to return
 * @returns List of User documents
 */
async function get(where, select) {
    return await User.find(where, select).lean().exec();
}

/**
 * Gets a user that match a filter
 * @param {Object} where - filter to match
 * @param {String} select - fields to return
 * @returns User document
 */
async function getOne(where, select) {
    return await User.findOne(where, select).lean().exec();
}

/**
 * Updates a user that match a filter
 * @param {Object} where - filter to match
 * @param {Object} update - fields to update
 * @returns User document
 */
async function setOne(where, update) {
    return await User.findOneAndUpdate(where, {$set: update}).lean().exec();
}

/* ==================== Specific queries ==================== */

/**
 * Adds a new user
 * @param {String} user_id - ID of the user
 * @param {String} password - hashed password
 */
async function insertNew(user_id, password) {
    const data = {
        userId: user_id,
        password: password,
        creationDate: new Date(Date.now()),
        nickname: "",
        nation: "",
        occupation: "",
        roles: ["user"],
        expenseCategories: [],
        session: {
            sessionId: user_id, // the first (invalid) sessionId is set to user_id to be unique
            expirationDate: new Date(0)
        }
    }
    return await addOne(data);
}

/**
 * Gets the object reference of a user
 * @param {String} user_id - ID of the user
 * @returns User document
 */
async function getReferenceByUserId(user_id) {
    return await getOne({userId: user_id}, "_id");
}

/**
 * Gets all user IDs
 * @returns List of User documents
 */
async function getAllUsersIds() {
    return await get({}, "-_id userId");
}

/**
 * Updates the ID of a user
 * @param {String} old_user_id - Current ID of the user
 * @param {String} new_user_id - New ID to set
 * @returns User document
 */
async function setUserIdByUserId(old_user_id, new_user_id) {
    return await setOne({userId: old_user_id}, {userId: new_user_id});
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
 * Updates the nickname of a user
 * @param {*} user_id - ID of the user
 * @param {*} nickname - nickname to set
 * @returns User document
 */
async function setNicknameOfUserId(user_id, nickname) {
    return await setOne({userId: user_id}, {nickname: nickname});
}

/**
 * Updates the nation of a user
 * @param {String} user_id - ID of the user
 * @param {String} nickname - nation to set
 * @returns User document
 */
async function setNationOfUserId(user_id, nation) {
    return await setOne({userId: user_id}, {nation: nation});
}

/**
 * Updates the occupation of a user
 * @param {*} user_id - ID of the user
 * @param {*} occupation - occupation to set
 * @returns User document
 */
async function setOccupationOfUserId(user_id, occupation) {
    return await setOne({userId: user_id}, {occupation: occupation});
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
    userIdLength,
    sessionIdLength,
    insertNew,
    getReferenceByUserId,
    getAllUsersIds,
    setUserIdByUserId,
    getPasswordByUserId,
    setPasswordOfUserId,
    setNicknameOfUserId,
    setNationOfUserId,
    setOccupationOfUserId,
    getSessionByUserId,
    setSessionOfUserId
};