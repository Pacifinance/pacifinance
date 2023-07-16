const mongoose = require("mongoose");
const users = require("./users.js");

let tags = [...[
    "Digital services", "Gift", "Shopping", "Food", "House", "Social", "Travelling", "Investments", "Health", "Taxes", "Vehicle", "Transports"
].sort(), "Other"];

const payment_types = [0, 1, 2, 3];

const expenseSchema = new mongoose.Schema({
    userRef: {type: mongoose.Types.ObjectId, required: true, index: true},
    date: {type: Date, required: true, index: true},
    amount: {type: Number, required: true},
    isExpense: {type: Boolean, required: true},
    paymentType: {type: Number, required: true}, // 0=None, 1=Single, 2=Subscription, 3=Installment
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
 * @returns List of Expense documents
 */
async function getSorted(where, select, sort) {
    return await Expense.find(where, select).sort(sort).lean().exec();
}

/* ==================== Specific queries ==================== */

/**
 * Adds an expense associated to a user
 * @param {String} user_id - ID of the user
 * @param {Date} date - date of the expense
 * @param {Number} amount - amount of the expense
 * @param {Boolean} is_expense - true if this is entry is an expense, false if it's an income
 * @param {Number} payment_type - type of payment (None, Single, Subscription or Installment) as an integer [0;3]
 * @param {String} category_tag - category tag of the expense
 * @returns Expense document
 */
async function insertNew(user_id, date, amount, is_expense, payment_type, category_tag) {
    const user = await users.getReferenceByUserId(user_id);
    if (user === null)
        return null;
    const data = {
        userRef: user._id,
        date: date,
        amount: amount,
        isExpense: is_expense,
        paymentType: payment_type,
        categoryTag: category_tag
    };
    return await addOne(data);
}

/**
 * Gets the most recent expenses of a user
 * @param {String} user_id - ID of the user
 * @param {Date} reference_date - Date object containing the year and month to look for
 * @returns List of Expense documents
 */
async function getMonthlyExpensesByUserId(user_id, reference_date) {
    const user = await users.getReferenceByUserId(user_id);
    if (user === null)
        return [];
    // Get start and end of the current month
    const month_start = new Date(Date.UTC(reference_date.getUTCFullYear(), reference_date.getUTCMonth()));
    const month_end = new Date(Date.UTC(reference_date.getUTCFullYear(), reference_date.getUTCMonth()+1));
    // Get and return the monthly expenses in descending order of date
    return await getSorted({userRef: user._id, date: {$gte: month_start, $lt: month_end}}, "-_id -__v -userRef", {date: -1});
}

/**
 * Expense model
 */
const Expense = mongoose.model("Expense", expenseSchema);

module.exports = {
    tags,
    payment_types,
    insertNew,
    getMonthlyExpensesByUserId
};