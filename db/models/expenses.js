const mongoose = require("mongoose");
const users = require("./users.js");
const tags = require("./tags.js");

const expenseSchema = new mongoose.Schema({
    userRef: {type: mongoose.Types.ObjectId, required: true, index: true},
    date: {type: Date, required: true, index: true},
    amount: {type: Number, required: true},
    isExpense: {type: Boolean, required: true},
    notes: {type: String},
    paymentType: {type: mongoose.Types.ObjectId, ref: "Tag", required: true},
    categoryTag: {type: mongoose.Types.ObjectId, ref: "Tag", required: true}
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
    return await Expense.find(where, select)
    .populate({path: "paymentType", select: "-_id -__v -translations._id"}) // substitution of Tag references with Tag data for "paymentType"
    .populate({path: "categoryTag", select: "-_id -__v -translations._id"}) // substitution of Tag references with Tag data for "categoryTag"
    .sort(sort).lean().exec();
}

/**
 * Deletes all expenses that match a filter
 * @param {Object} where - filter to match
 * @returns DeleteResult object
 */
async function deleteMany(where) {
    return await Expense.deleteMany(where).lean().exec();
}

/**
 * Deletes an expense that match a filter
 * @param {Object} where - filter to match
 * @returns DeleteResult object
 */
async function deleteOne(where) {
    return await Expense.deleteOne(where).lean().exec();
}

/* ==================== Specific queries ==================== */

/**
 * Adds an expense associated to a user
 * @param {String} user_id - ID of the user
 * @param {Date} date - date of the expense
 * @param {Number} amount - amount of the expense
 * @param {Boolean} is_expense - true if this is entry is an expense, false if it's an income
 * @param {String} notes - user notes or description associated to the expense
 * @param {Number} payment_type - type of payment (None, Single, Subscription or Installment)
 * @param {Number} category_tag - category tag of the expense
 * @returns Expense document
 */
async function insertNew(user_id, date, amount, is_expense, notes, payment_type, category_tag) {
    // Get the user reference
    const user = await users.getReferenceByUserId(user_id);
    // If this is an expense, get the payment type reference and the expense category reference
    let payment_type_ref = null;
    let category_tag_ref = null;
    if (is_expense)
    {
        // For an expense the payment type cannot be zero
        if (payment_type === 0) return null;
        payment_type_ref = await tags.getReferenceByIndexAndType(payment_type, tags.TagType.payment.value);
        category_tag_ref = await tags.getReferenceByIndexAndType(category_tag, tags.TagType.expense.value);
    }
    // Otherwise, if it's an income, get the income category reference only
    else
    {
        payment_type_ref = await tags.getReferenceByIndexAndType(0, tags.TagType.payment.value);
        category_tag_ref = await tags.getReferenceByIndexAndType(category_tag, tags.TagType.income.value);
    }
    // If any of the queries fail, return null
    if (user === null || payment_type_ref === null || payment_type_ref === null)
        return null;
    // Create and insert the new entry
    const data = {
        userRef: user._id,
        date: date,
        amount: amount,
        isExpense: is_expense,
        notes: notes,
        paymentType: payment_type_ref._id,
        categoryTag: category_tag_ref._id
    };
    return await addOne(data);
}

/**
 * Checks if there are expenses associated to a user
 * @param {mongoose.ObjectId} user_ref - ObjectId of the user
 * @returns true if there are expenses associated to the user, false otherwise
 */
async function expensesExistByUserRef(user_ref) {
    const expense = await getSorted({userRef: user_ref});
    return expense.length !== 0;
}

/**
 * Gets the expenses of a user for the month
 * @param {String} user_id - ID of the user
 * @param {Date} reference_date - Date object containing the year and month to look for
 * @param {Boolean | undefined} is_expense_filter - True to retrieve only expenses, false to retrieve only incomes, undefined for both
 * @returns List of Expense documents
 */
async function getMonthlyExpensesByUserId(user_id, reference_date, is_expense_filter=undefined) {
    const user = await users.getReferenceByUserId(user_id);
    if (user === null)
        return [];
    // Get start and end of the current month
    const month_start = new Date(Date.UTC(reference_date.getUTCFullYear(), reference_date.getUTCMonth()));
    const month_end = new Date(Date.UTC(reference_date.getUTCFullYear(), reference_date.getUTCMonth()+1));
    // Filter out expenses or incomes depending on input parameters
    let expenses_filter = {
        userRef: user._id,
        date: {$gte: month_start, $lt: month_end}
    };
    if (is_expense_filter !== undefined)
        expenses_filter.isExpense = is_expense_filter;
    // Get and return the monthly expenses in descending order of date
    return await getSorted(expenses_filter, "-_id -__v -userRef", {date: -1});
}

/**
 * Gets the expenses of a user for the month and sums all the amounts
 * @param {String} user_id - ID of the user
 * @param {Date} reference_date - Date object containing the year and month to look for
 * @param {Boolean | undefined} is_expense_filter - True to retrieve only expenses, false to retrieve only incomes, undefined for both
 * @returns Total expenses/incomes of the user for the month
 */
async function getTotalMonthlyExpensesByUserId(user_id, reference_date, is_expense_filter=undefined) {
    // Get the expenses for the month
    const expenses = await getMonthlyExpensesByUserId(user_id, reference_date, is_expense_filter);
    if (expenses.length === 0)
        return null;
    // Sum all the amounts
    return expenses.reduce((accumulator, expense) => accumulator + expense.amount, 0);
}

/**
 * Deletes an expense/income of a user, given the entry date, amount and direction
 * @param {String} user_id - ID of the user
 * @param {Date} date - date of the expense
 * @param {Number} amount - amount of the expense
 * @param {Boolean} is_expense - true if this is entry is an expense, false if it's an income
 * @returns DeleteResult object
 */
async function deleteExpenseByData(user_id, date, amount, is_expense) {
    // Get the user reference from its ID
    const user = await users.getReferenceByUserId(user_id);
    // Delete the expense, filtering by user reference, date, amount and expense/income flag
    return await deleteOne({userRef: user._id, date: date, amount: amount, isExpense: is_expense});
}

/**
 * Deletes all expenses/incomes of a user given the reference to that user
 * @param {mongoose.ObjectId} user_ref - ObjectId of the user
 * @returns DeleteResult object
 */
async function deleteExpensesByUserRef(user_ref) {
    return await deleteMany({userRef: user_ref});
}

/**
 * Expense model
 */
const Expense = mongoose.model("Expense", expenseSchema);

module.exports = {
    insertNew,
    expensesExistByUserRef,
    getMonthlyExpensesByUserId,
    getTotalMonthlyExpensesByUserId,
    deleteExpenseByData,
    deleteExpensesByUserRef
};