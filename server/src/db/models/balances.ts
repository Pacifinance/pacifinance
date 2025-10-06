import mongoose from "mongoose";

import users from "./users"
import common from "../../routes/common"

const balanceSchema = new mongoose.Schema({
    userRef: {type: mongoose.Types.ObjectId, required: true, index: true},
    date: {type: Date, required: true, index: true},
    userDate: {type: Date, required: true, index: true},
    bank: {type: Number, required: true},
    cash: {type: Number, required: true},
    digitalServices: {type: Number, required: true},
    stocks: {type: Number, required: true},
    etf: {type: Number, required: true},
    bitcoin: {type: Number, required: true},
    crypto: {type: Number, required: true},
    bonds: {type: Number, required: true},
    funds: {type: Number, required: true},
    gold: {type: Number, required: true}
});

/* ==================== Template queries ==================== */

/**
 * Adds a balance
 * @param data Data of the new Balance document 
 * @returns Balance document
 */
async function addOne(data: object) {
    return (await Balance.create(data)).toJSON();
}

/**
 * Gets a balance that matches a filter
 * @param where Filter to match
 * @param select Fields to return
 * @param sort Fields to sort by and their order
 * @returns Balance document
 */
async function getOneSorted(where: object, select: string, sort: any) {
    const res = await Balance.find(where, select).sort(sort).limit(1).lean().exec();
    if (res.length === 0)
        return null;
    return res[0];
}

/**
 * Gets a list of balances that match a filter
 * @param where Filter to match
 * @param select Fields to return
 * @param sort Fields to sort by and their order
 * @returns List of Balance documents
 */
async function getSorted(where: object, select: string, sort: any) {
    return await Balance.find(where, select).sort(sort).lean().exec()
}

/**
 * Deletes all balances that match a filter
 * @param where Filter to match
 * @returns DeleteResult object
 */
async function deleteMany(where: object) {
    return await Balance.deleteMany(where).lean().exec();
}

/* ==================== Specific queries ==================== */

/**
 * Adds a balance associated to a user
 * @param user_id ID of the user
 * @param user_date Month and year inserted by the user
 * @param bank Bank amount
 * @param cash Cash amount
 * @param digital_services Amount on digital services platforms
 * @param stocks Stocks amount
 * @param etf Etf amount
 * @param bitcoin Bitcoin amount
 * @param crypto Crypto amount
 * @param bonds Bonds amount
 * @param funds Funds amount
 * @param gold Gold amount
 * @returns Balance document
 */
async function insertNew(
    user_id: string, user_date: Date, bank: number, cash: number, digital_services: number, stocks: number,
    etf: number, bitcoin: number, crypto: number, bonds: number, funds: number, gold: number
) {
    const user = await users.getReferenceByUserId(user_id);
    if (user === null)
        return null;
    const data = {
        userRef: user._id,
        date: new Date(Date.now()),
        userDate: user_date,
        bank: bank,
        cash: cash,
        digitalServices: digital_services,
        stocks: stocks,
        etf: etf,
        bitcoin: bitcoin,
        crypto: crypto,
        bonds: bonds,
        funds: funds,
        gold: gold
    };
    return await addOne(data);
}

/**
 * Checks if there are balances associated to a user
 * @param user_ref ObjectId of the user
 * @returns true if there are balances associated to the user, false otherwise
 */
async function balancesExistByUserRef(user_ref: mongoose.Types.ObjectId) {
    const balance = await getOneSorted({userRef: user_ref}, "", {});
    return balance !== null;
}

/**
 * Gets all the balances of a user, sorted by user-insterted date
 * @param user_id ID of the user
 * @returns List of Balance documents
 */
async function getAllByUserId(user_id: string) {
    const user = await users.getReferenceByUserId(user_id)
    if (user === null)
        return null
    // Get all the balances of the user, sorted by date
    return await getSorted({userRef: user._id}, "-_id -__v -userRef", {userDate: 1})
}

/**
 * Gets the latest balance of a user
 * @param user_id ID of the user
 * @param limit_date Date after which balances are ignored
 * @returns Balance document
 */
async function getLatestByUserId(user_id: string, limit_date: Date | undefined = undefined) {
    const user = await users.getReferenceByUserId(user_id);
    if (user === null)
        return null;
    // Get the balances with the most recent user-inserted date. Among these balances, the latest one
    // is that with the most recent insertion date (the one that overwrites all the others)
    let filter = {userRef: user._id, userDate: {$lt: new Date(Date.now())}};
    if (limit_date !== undefined)
        filter.userDate = {$lt: limit_date};
    return await getOneSorted(filter, "-_id -__v -userRef", {userDate: -1, date: -1});
}

/**
 * Gets the latest balance of a user and sums all its parts together
 * @param user_id ID of the user
 * @param limit_date Date after which balances are ignored
 * @return Total balance of the user
 */
async function getTotalLatestByUserId(user_id: string, limit_date: Date | undefined = undefined) {
    const balance = await getLatestByUserId(user_id, limit_date);
    if (balance === null)
        return null;
    return (
        balance.bank + balance.cash + balance.digitalServices + balance.stocks +
        balance.etf + balance.bitcoin + balance.crypto + balance.bonds + balance.funds +
        balance.gold
    );
}

/**
 * Gets the balances of a user for the last 24 months
 * @param user_id ID of the user
 * @returns List of Balance documents
 */
async function getYearlyBalanceByUserId(user_id: string) {
    // Get start and end of the current month
    const now = new Date(Date.now());
    let month_start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth()));
    let month_end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth()+1));
    // Find the most recent balance for each one of the last 24 months
    const user = await users.getReferenceByUserId(user_id);
    if (user === null)
        return [];
    let balances = [];
    for (let i = 0; i < 24; i++)
    {
        // Find the most recent balance of the month
        const res = await getOneSorted({
                userRef: user._id, userDate: {$gte: month_start, $lt: month_end}
            }, 
            "-_id -__v -userRef -stocks._id -etf._id -bitcoin._id -crypto._id",
            {userDate: -1, date: -1}
        );
        // If a balance was found for this month, then add it to the array; otherwise, add an empty object
        const balance = (res !== null) ? res : {};
        balances.push({date: month_start, balance: balance});
        // Decrease the month start and end by one month for the next iteration
        month_start = common.decrementDateByOneMonth(month_start);
        month_end = common.decrementDateByOneMonth(month_end);
    }
    return balances;
}

/**
 * Deletes all balances of a user given the reference to that user
 * @param user_ref ObjectId of the user
 * @returns DeleteResult object
 */
async function deleteBalancesByUserRef(user_ref: mongoose.Types.ObjectId) {
    return await deleteMany({userRef: user_ref});
}

/**
 * Balance model
 */
const Balance = mongoose.model("Balance", balanceSchema);

export default {
    insertNew,
    balancesExistByUserRef,
    getAllByUserId,
    getLatestByUserId,
    getTotalLatestByUserId,
    getYearlyBalanceByUserId,
    deleteBalancesByUserRef
};