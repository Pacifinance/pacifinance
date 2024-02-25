const balances = require("../db/models/balances.js");
const delqueue = require("../db/models/delqueue.js");
const expenses = require("../db/models/expenses.js");
const users = require("../db/models/users.js");

/**
 * Checks if all user data has been deleted
 * @param {String} user_ref - ObjectId of the user
 * @returns true if all user data has been deleted, false otherwise
 */
async function checkDeletion(user_ref) {
    const userExists = await users.userExistsByRef(user_ref);
    const balancesExist = await balances.balancesExistByUserRef(user_ref);
    const expensesExist = await expenses.expensesExistByUserRef(user_ref);
    return ((!userExists) && (!balancesExist) && (!expensesExist));
}

/**
 * Deletes all data of a user from the DB
 * @param {String} user_ref - ObjectId of the user
 */
async function deleteUserData(user_ref) {
    // Delete user account and all its associated data
    await users.deleteUserByRef(user_ref);
    await balances.deleteBalancesByUserRef(user_ref);
    await expenses.deleteExpensesByUserRef(user_ref);
}

/**
 * Periodic job that removes all data of users that must be deleted
 */
async function deleteUsersJob() {
    // Get all users in the deletion queue
    const users = await delqueue.getAllAccountsInQueue();
    // Check all users in the queue
    const now = new Date(Date.now());
    for (let user of users) {
        // If the deletion date has not passed, ignore this user
        if (user.date > now)
            continue;
        // Otherwise, delete all user data
        await deleteUserData(user.userRef);
        // Check if all user data was deleted. If so, remove the user from the deletion queue
        const deletionWasOk = await checkDeletion(user.userRef);
        if (deletionWasOk)
            await delqueue.removeFromQueueByUserRef(user.userRef);
    }
}

module.exports = {
    deleteUsersJob,
};