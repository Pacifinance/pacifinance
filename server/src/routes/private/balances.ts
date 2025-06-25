import express from "express"
import { SessionData } from "express-session"

import db from "../../db/mongo"
import common from "../common"

/**
 * Checks if a balance is valid
 * @param data Balance to check (sanitized and modified by this function)
 * @returns true if the balance is valid, false otherwise
 */
function isBalanceValid(data: any) {
    // Cast all values to Number for type integrity, then round them to the second decimal digit
    data.bank = common.roundCurrency(Number(data.bank));
    data.cash = common.roundCurrency(Number(data.cash));
    data.digital_services = common.roundCurrency(Number(data.digital_services));
    data.stocks.real = common.roundCurrency(Number(data.stocks.real));
    data.stocks.invested = common.roundCurrency(Number(data.stocks.invested));
    data.etf.real = common.roundCurrency(Number(data.etf.real));
    data.etf.invested = common.roundCurrency(Number(data.stocks.invested));
    data.bitcoin.real = common.roundCurrency(Number(data.bitcoin.real));
    data.bitcoin.invested = common.roundCurrency(Number(data.bitcoin.invested));
    data.crypto.real = common.roundCurrency(Number(data.crypto.real));
    data.crypto.invested = common.roundCurrency(Number(data.crypto.invested));
    // If the date field is not set or invalid, set it to now
    let now = new Date(Date.now());
    data.date = common.toDateObject(data.date);
    if (data.date === undefined || isNaN(data.date) || data.date > now) data.date = now;
    // Return true if all fields exist and they are valid numbers
    return (
        !isNaN(data.bank) && !isNaN(data.cash) && !isNaN(data.digital_services) &&
        !isNaN(data.stocks.real) && !isNaN(data.stocks.invested) &&
        !isNaN(data.etf.real) && !isNaN(data.etf.invested) &&
        !isNaN(data.bitcoin.real) && !isNaN(data.bitcoin.invested) &&
        !isNaN(data.crypto.real) && !isNaN(data.crypto.real)
    );
}

/* === /balances/* === */

const balancesRouter = express.Router()

balancesRouter.use(common.checkSessionMiddleware)

balancesRouter.post("/add", async (req, res) => {
    // Sanitize user input. Send status code 400 (Bad Request)
    // in case of invalid data (not numbers)
    let balance = req.body.balance;
    if (!isBalanceValid(balance))
    {
        res.status(400);
        res.send();
        return;
    }
    // Add the balance to the database
    const session = req.session as SessionData
    const doc = await db.balances.insertNew(
        session.userId, balance.date, balance.bank, balance.cash, balance.digital_services,
        balance.stocks.real, balance.stocks.invested, balance.etf.real, balance.etf.invested,
        balance.bitcoin.real, balance.bitcoin.invested, balance.crypto.real, balance.crypto.invested
    );
    // Check if the document was inserted successfully. Send
    // status code 500 (Internal Server Error) if it failed
    if (doc === null)
    {
        res.status(500);
        res.send();
        return;
    }
    // Send status code 200 (OK)
    res.status(200);
    res.send();
});

balancesRouter.post("/get", async (req, res) => {
    // Get the last 12 month of balances from the database
    const session = req.session as SessionData
    const balances = await db.balances.getYearlyBalanceByUserId(session.userId);
    // Send the data to the client with status code 200 (OK)
    res.status(200);
    res.json(balances);
});

export default balancesRouter