const balances = require("../db/models/balances.js");
const delqueue = require("../db/models/delqueue.js");
const expenses = require("../db/models/expenses.js");
const users = require("../db/models/users.js");

async function checkDeletion(user_ref) {

}

async function deleteUserData(user_ref) {
    // Delete user account and all its associated data
    await users.deleteUserByRef(user_ref);
    await balances.deleteBalancesByUserRef(user_ref);
    await expenses.deleteExpensesByUserRef(user_ref);
}

async function deleteUsers() {
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
    deleteUsers,
};