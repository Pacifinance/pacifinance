import mongoose from "mongoose"

import { ExtDate } from "../../libs/datelib"

import users from "./users"
import tags from "./tags"

const expenseSchema = new mongoose.Schema({
    userRef: {type: mongoose.Types.ObjectId, required: true, index: true},
    date: {type: Date, required: true, index: true},
    amount: {type: Number, required: true},
    isExpense: {type: Boolean, required: true},
    notes: {type: String},
    paymentType: {type: mongoose.Types.ObjectId, ref: "Tag", required: true},
    categoryTag: {type: mongoose.Types.ObjectId, ref: "Tag", required: true}
});

type Tag = Awaited<ReturnType<typeof tags.getAllTagsByType>>[0]
type PopulatedExpense = 
    Omit<typeof Expense, "categoryTag"> & {
        categoryTag: Tag
    }

/* ==================== Template queries ==================== */

/**
 * Adds an expense
 * @param data Data of the new Expense document 
 * @returns Expense document
 */
async function addOne(data: object) {
    return (await Expense.create(data)).toJSON();
}

/**
 * Gets a list of expenses that match a filter
 * @param where Filter to match
 * @param select Fields to return
 * @param sort Fields to sort by and their order
 * @returns List of Expense documents
 */
async function getSorted(where: object, select: string, sort: any) {
    return await Expense.find(where, select)
    .populate({path: "paymentType", select: "-_id -__v -translations._id"}) // substitution of Tag references with Tag data for "paymentType"
    .populate<PopulatedExpense>({path: "categoryTag", select: "-_id -__v -translations._id"}) // substitution of Tag references with Tag data for "categoryTag"
    .sort(sort).lean().exec();
}

/**
 * Deletes all expenses that match a filter
 * @param where Filter to match
 * @returns DeleteResult object
 */
async function deleteMany(where: object) {
    return await Expense.deleteMany(where).lean().exec();
}

/**
 * Deletes an expense that match a filter
 * @param where Filter to match
 * @returns DeleteResult object
 */
async function deleteOne(where: object) {
    return await Expense.deleteOne(where).lean().exec();
}

/* ==================== Specific queries ==================== */

/**
 * Adds an expense associated to a user
 * @param user_id ID of the user
 * @param date Date of the expense
 * @param amount Amount of the expense
 * @param is_expense True if this is entry is an expense, false if it's an income
 * @param notes User notes or description associated to the expense
 * @param payment_type Type of payment (None, Single, Subscription or Installment)
 * @param category_tag Category tag of the expense
 * @returns Expense document
 */
async function insertNew(user_id: string, date: Date, amount: number, is_expense: boolean, 
    notes: string, payment_type: number, category_tag: number) {
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
    if (user === null || payment_type_ref === null || category_tag_ref === null)
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
 * @param user_ref ObjectId of the user
 * @returns true if there are expenses associated to the user, false otherwise
 */
async function expensesExistByUserRef(user_ref: mongoose.Types.ObjectId) {
    const expense = await getSorted({userRef: user_ref}, "", {});
    return expense.length !== 0;
}

/**
 * Gets all the expenses of a user
 * @param user_id ID of the user
 * @returns List of Expense documents
 */
async function getAllByUserId(user_id: string) {
    const user = await users.getReferenceByUserId(user_id)
    if (user === null)
        return null
    // Get all the expenses of the user, sorted by date
    return await getSorted(
        {userRef: user._id},
        "-_id -__v -userRef -paymentType.translations -categoryTag.translations",
        {date: 1}
    )
}

/**
 * Gets the expenses of a user for the month
 * @param user_id ID of the user
 * @param reference_date Date object containing the year and month to look for
 * @param is_expense_filter True to retrieve only expenses, false to retrieve only incomes, undefined for both
 * @returns List of Expense documents
 */
async function getMonthlyExpensesByUserId(user_id: string, reference_date: ExtDate,
    is_expense_filter: boolean | undefined = undefined) {
    const user = await users.getReferenceByUserId(user_id);
    if (user === null)
        return [];
    // Get start and end of the current month
    const month_start = ExtDate.fromReferenceMonthStart(reference_date)
    const month_end = ExtDate.fromReferenceMonthEnd(reference_date)
    // Filter out expenses or incomes depending on input parameters
    let expenses_filter = {
        userRef: user._id,
        date: {$gte: month_start, $lte: month_end},
        isExpense: {$in: [false, true]}
    };
    if (is_expense_filter !== undefined)
        expenses_filter.isExpense = {$in: [is_expense_filter]};
    // Get and return the monthly expenses in descending order of date
    return await getSorted(expenses_filter, "-_id -__v -userRef", {date: -1});
}

/**
 * Gets the expenses of a user for the month and sums all the amounts
 * @param user_id ID of the user
 * @param reference_date Date object containing the year and month to look for
 * @param is_expense_filter True to retrieve only expenses, false to retrieve only incomes, undefined for both
 * @returns Total expenses/incomes of the user for the month
 */
async function getTotalMonthlyExpensesByUserId(user_id: string, reference_date: ExtDate,
    is_expense_filter: boolean | undefined = undefined) {
    // Get the expenses for the month
    const expenses = await getMonthlyExpensesByUserId(user_id, reference_date, is_expense_filter);
    if (expenses.length === 0)
        return null;
    // Sum all the amounts
    return expenses.reduce((accumulator, expense) => accumulator + expense.amount, 0);
}

/**
 * Deletes an expense/income of a user, given the entry date, amount and direction
 * @param user_id ID of the user
 * @param date Date of the expense
 * @param amount Amount of the expense
 * @param is_expense True if this is entry is an expense, false if it's an income
 * @returns DeleteResult object
 */
async function deleteExpenseByData(user_id: string, date: Date, amount: number, is_expense: boolean) {
    // Get the user reference from its ID
    const user = await users.getReferenceByUserId(user_id);
    if (user === null)
        return null;
    // Delete the expense, filtering by user reference, date, amount and expense/income flag
    return await deleteOne({userRef: user._id, date: date, amount: amount, isExpense: is_expense});
}

/**
 * Deletes all expenses/incomes of a user given the reference to that user
 * @param user_ref ObjectId of the user
 * @returns DeleteResult object
 */
async function deleteExpensesByUserRef(user_ref: mongoose.Types.ObjectId) {
    return await deleteMany({userRef: user_ref});
}

/**
 * Expense model
 */
const Expense = mongoose.model("Expense", expenseSchema);

export default {
    insertNew,
    expensesExistByUserRef,
    getAllByUserId,
    getMonthlyExpensesByUserId,
    getTotalMonthlyExpensesByUserId,
    deleteExpenseByData,
    deleteExpensesByUserRef
};