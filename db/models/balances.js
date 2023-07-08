const mongoose = require("mongoose");
const users = require("./users.js");
const utils = require("../../utils.js");

const balanceSchema = new mongoose.Schema({
    userRef: {type: mongoose.Types.ObjectId, required: true, index: true},
    date: {type: Date, required: true, index: true},
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
 * @param {BigInt} limit - maximum number of results
 * @returns List of Balance documents
 */
async function getLastNSorted(where, select, sort, limit) {
    return await Balance.find(where, select).sort(sort).limit(limit).lean().exec();
}

/* ==================== Specific queries ==================== */

/**
 * Adds a balance associated to a user
 * @param {String} user_id - ID of the user
 * @param {Date} date - timestamp of the insertion
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
    user_id, date, bank, cash, digital_services, stocks_real, stocks_invested,
    etf_real, etf_invested, bitcoin_real, bitcoin_invested, crypto_real, crypto_invested
) {
    const user = await users.getReferenceByUserId(user_id);
    if (user === null)
        return null;
    const data = {
        userRef: user._id,
        date: date,
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
    const res = await getLastNSorted({userRef: user._id}, "-_id -__v -userRef", {date: -1}, 1);
    if (res.length === 0)
        return null;
    return res[0];
}

/**
 * Gets the yearly balance of a user
 * @param {String} user_id - ID of the user
 * @returns List of Balance documents
 */
async function getYearlyBalanceByUserId(user_id) {
    // Get start and end of the current month
    const now = new Date(Date.now());
    let month_start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth()));
    let month_end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth()+1));
    // Find the most recent balance for each one of the last 12 months
    const user = await users.getReferenceByUserId(user_id);
    if (user === null)
        return [];
    let balances = [];
    for (let i = 0; i < 12; i++)
    {
        // Find the balance of the month
        const res = await getLastNSorted({
                userRef: user._id, date: {$gte: month_start, $lt: month_end}
            }, 
            "-_id -__v -userRef", {date: -1}, 1
        );
        // If a balance was found for this month, then add it to the array
        let balance = {};
        if (res.length > 0)
            balance = res[0]; // [0] is the most recent since the query sorts the results by date
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
    getYearlyBalanceByUserId
};