const mongoose = require("mongoose");
const users = require("./users.js");

let tags = [...[
    "Subscription (digital services)", "Subscription (public transport)", "Gift", "Shopping", "Food", "House", "Social", "Travelling",
    "Investments", "Health", "Taxes and installments", "Vehicle", "Transport"
].sort(), "Other"];

const expenseSchema = new mongoose.Schema({
    userRef: {type: mongoose.Types.ObjectId, required: true, index: true},
    date: {type: Date, required: true, index: true},
    stocks: {type: Number, default: 0},
    bank: {type: Number, default: 0},
    cash: {type: Number, default: 0},
    crypto: {type: Number, default: 0},
    categoryTag: {type: String, required: true}
});

/* ==================== Template queries ==================== */

/**
 * Adds an expense
 * @param {Object} data - data of the new Expense document 
 * @returns Expense document
 */
async function addOne(data) {
    return (await Expense.create(data)).toJSON();
}

/**
 * Gets a list of expenses that match a filter
 * @param {Object} where - filter to match
 * @param {String} select - fields to return
 * @param {Object} sort - fields to sort by and their order
 * @param {BigInt} limit - maximum number of results
 * @returns List of Expense documents
 */
async function getLastNSorted(where, select, sort, limit) {
    return await Expense.find(where, select).sort(sort).limit(limit).lean().exec();
}

/**
 * Updates all expenses that match a filter
 * @param {Object} where - filter to match
 * @param {Object} update - fields to update
 * @returns Query result
 */
async function set(where, update) {
    return await Expense.updateMany(where, {$set: update}).lean().exec();
}

/* ==================== Specific queries ==================== */

/**
 * Adds an expense associated to a user
 * @param {String} user_id - ID of the user
 * @param {Date} date - date of the expense
 * @param {Number} stocks - stocks amount
 * @param {Number} bank - bank amount
 * @param {Number} cash - cash amount
 * @param {Number} crypto - crypto amount
 * @param {String} category_tag - category tag of the expense
 * @returns Expense document
 */
async function insertNew(user_id, date, stocks, bank, cash, crypto, category_tag) {
    const user = await users.getReferenceByUserId(user_id);
    if (user === null)
        return null;
    const data = {
        userId: user._id,
        date: date,
        stocks: stocks,
        bank: bank,
        cash: cash,
        crypto: crypto,
        categoryTag: category_tag
    };
    return await addOne(data);
}

/**
 * Updates all expenses of a user with a new user ID
 * @param {String} old_user_id - Current ID of the user
 * @param {String} new_user_id - New ID to set
 * @returns Query result
 */
async function setUserIdByUserId(old_user_id, new_user_id) {
    return await set({userId: old_user_id}, {userId: new_user_id});
}

/**
 * Gets the most recent expenses of a user
 * @param {String} user_id - ID of the user
 * @returns List of Expense documents
 */
async function getMostRecentByUserId(user_id) {
    return await getLastNSorted({userId: user_id}, "-_id", {date: -1}, 10);
}

/**
 * Expense model
 */
const Expense = mongoose.model("Expense", expenseSchema);

module.exports = {
    tags,
    insertNew,
    setUserIdByUserId,
    getMostRecentByUserId
};