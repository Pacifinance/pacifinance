const mongoose = require("mongoose");
const users = require("./models/users.js");
const balances = require("./models/balances.js");
const expenses = require("./models/expenses.js");

async function connect(uri) {
    return mongoose.connect(uri);
}

/**
 * Updates the user ID of all documents associated to a user
 * @param {String} old_user_id - Current ID of the user
 * @param {String} new_user_id - New ID to set
 * @returns Raw command response or undefined
 */
async function updateUserIdOfUserId(old_user_id, new_user_id) {
    // Open a MongoDB session and start a transaction
    const session = await mongoose.startSession();
    return session.withTransaction(async () => {
        // Update the user ID in the users collection
        await users.setUserIdByUserId(old_user_id, new_user_id);
        // Update the user ID of all balances of that user
        await balances.setUserIdByUserId(old_user_id, new_user_id);
        // Update the user ID of all expenses of that user
        await expenses.setUserIdByUserId(old_user_id, new_user_id);
    });
}

module.exports = {connect, updateUserIdOfUserId, users, balances, expenses};