const mongoose = require("mongoose");
const users = require("./users.js");
const utils = require("../../utils.js");

const balanceSchema = new mongoose.Schema({
    userRef: {type: mongoose.Types.ObjectId, required: true, index: true},
    date: {type: Date, required: true, index: true},
    userDate: {type: Date, required: true, index: true},
    bank: {type: Number, required: true},
    cash: {type: Number, required: true},
    digitalServices: {type: Number, required: true},
    stocks: {type: {
        real: {type: Number, required: true},
        invested: {type: Number, required: true}
    }, required: true},
    etf: {type: {
        real: {type: Number, required: true},
        invested: {type: Number, required: true}
    }, required: true},
    bitcoin: {type: {
        real: {type: Number, required: true},
        invested: {type: Number, required: true}
    }, required: true},
    crypto: {type: {
        real: {type: Number, required: true},
        invested: {type: Number, required: true}
    }, required: true}
});

/* ==================== Template queries ==================== */

/**
 * Adds a balance
 * @param {Object} data - data of the new Balance document 
 * @returns Balance document
 */
async function addOne(data) {
    return (await Balance.create(data)).toJSON();
}

/**
 * Gets a list of balances that match a filter
 * @param {Object} where - filter to match
 * @param {String} select - fields to return
 * @param {Object} sort - fields to sort by and their order
 * @returns Balance document
 */
async function getOneSorted(where, select, sort) {
    const res = await Balance.find(where, select).sort(sort).limit(1).lean().exec();
    if (res.length === 0)
        return null;
    return res[0];
}

/* ==================== Specific queries ==================== */

/**
 * Adds a balance associated to a user
 * @param {String} user_id - ID of the user
 * @param {Date} user_date - month and year inserted by the user
 * @param {Number} bank - bank amount
 * @param {Number} cash - cash amount
 * @param {Number} digital_services - amount on digital services platforms
 * @param {Number} stocks_real - real stocks amount
 * @param {Number} stocks_invested - invested stocks amount
 * @param {Number} etf_real - real etf amount
 * @param {Number} etf_invested - invested etf amount
 * @param {Number} bitcoin_real - real bitcoin amount
 * @param {Number} bitcoin_invested - invested bitcoin amount
 * @param {Number} crypto_real - real crypto amount
 * @param {Number} crypto_invested - invested crypto amount
 * @returns Balance document
 */
async function insertNew(
    user_id, user_date, bank, cash, digital_services, stocks_real, stocks_invested,
    etf_real, etf_invested, bitcoin_real, bitcoin_invested, crypto_real, crypto_invested
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
        stocks: {
            real: stocks_real,
            invested: stocks_invested
        },
        etf: {
            real: etf_real,
            invested: etf_invested
        },
        bitcoin: {
            real: bitcoin_real,
            invested: bitcoin_invested
        },
        crypto: {
            real: crypto_real,
            invested: crypto_invested
        }
    };
    return await addOne(data);
}

/**
 * Gets the latest balance of a user
 * @param {String} user_id - ID of the user
 * @returns Balance document
 */
async function getLatestByUserId(user_id) {
    const user = await users.getReferenceByUserId(user_id);
    if (user === null)
        return null;
    // Get the balances with the most recent user-inserted date. Among these balances, the latest one
    // is that with the most recent insertion date (the one that overwrites all the others)
    return await getOneSorted({userRef: user._id}, "-_id -__v -userRef", {userDate: -1, date: -1});
}

/**
 * Gets the latest balance of a user and sums all its parts together
 * @param {String} user_id - ID of the user
 * @return Total balance of the user
 */
async function getTotalLatestByUserId(user_id) {
    const balance = await getLatestByUserId(user_id);
    if (balance === null)
        return null;
    return (
        balance.bank + balance.cash + balance.digitalServices + balance.stocks.real +
        balance.etf.real + balance.bitcoin.real + balance.crypto.real
    );
}

/**
 * Gets the balances of a user for the last 24 months
 * @param {String} user_id - ID of the user
 * @returns List of Balance documents
 */
async function getYearlyBalanceByUserId(user_id) {
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
            "-_id -__v -userRef", {userDate: -1, date: -1}
        );
        // If a balance was found for this month, then add it to the array; otherwise, add an empty object
        const balance = (res !== null) ? res : {};
        balances.push({date: month_start, balance: balance});
        // Decrease the month start and end by one month for the next iteration
        month_start = utils.decrementDateByOneMonth(month_start);
        month_end = utils.decrementDateByOneMonth(month_end);
    }
    return balances;
}

/**
 * Balance model
 */
const Balance = mongoose.model("Balance", balanceSchema);

module.exports = {
    insertNew,
    getLatestByUserId,
    getTotalLatestByUserId,
    getYearlyBalanceByUserId
};