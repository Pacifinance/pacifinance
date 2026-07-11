import express from "express"

import { ExtDate } from "../../libs/datelib"

import db from "../../db/db"
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
    data.stocks = common.roundCurrency(Number(data.stocks));
    data.etf = common.roundCurrency(Number(data.etf));
    data.bitcoin = common.roundCurrency(Number(data.bitcoin));
    data.crypto = common.roundCurrency(Number(data.crypto));
    data.bonds = common.roundCurrency(Number(data.bonds));
    data.funds = common.roundCurrency(Number(data.funds));
    data.commodities = common.roundCurrency(Number(data.commodities));
    data.emergency_fund = common.roundCurrency(Number(data.emergency_fund));
    // If the date field is not set or invalid, set it to now
    const now = ExtDate.fromNow()
    data.date = new ExtDate(data.date);
    if (data.date === undefined || isNaN(data.date.getTime()) || data.date > now) data.date = now;
    // Return true if all fields exist and they are valid numbers
    return (
        !isNaN(data.bank) && !isNaN(data.cash) && !isNaN(data.digital_services) &&
        !isNaN(data.stocks) && !isNaN(data.etf) && !isNaN(data.bitcoin) &&
        !isNaN(data.crypto) && !isNaN(data.bonds) && !isNaN(data.funds) &&
        !isNaN(data.commodities) && !isNaN(data.emergency_fund)
    );
}

/* === /balances/* === */

const balancesRouter = express.Router()

balancesRouter.post("/add", async (req, res) => {
    // Sanitize user input. Send status code 400 (Bad Request)
    // in case of invalid data (not numbers)
    const balance = req.body?.balance;
    if (!balance || !isBalanceValid(balance))
    {
        res.status(400);
        res.send();
        return;
    }
    // Add the balance to the database
    const doc = await db.balances.insertNew(
        req.userId as string, balance.date, balance.bank, balance.cash, balance.digital_services,
        balance.stocks, balance.etf, balance.bitcoin, balance.crypto,
        balance.bonds, balance.funds, balance.commodities, balance.emergency_fund
    );
    // Check if the document was inserted successfully. Send
    // status code 500 (Internal Server Error) if it failed
    if (doc === null)
    {
        res.status(500);
        res.send();
        return;
    }
    // Best-effort snapshot of the user's current detailed holdings/liquidity
    // sub-accounts, dated at this balance's month — builds up history over time
    // without needing a separate user action. Run in parallel (never sequential,
    // see the prod search timeout bug), and awaited (not fire-and-forget) because
    // Vercel may freeze the function shortly after the response is sent, which
    // would silently drop a dangling snapshot write. Each promise catches its own
    // error so a snapshot failure never turns the (already-successful) balance
    // write into a 500.
    await Promise.all([
        db.investments.snapshotHoldingsForUser(req.userId as string, balance.date)
            .catch((error) => console.error("balances/add: failed to snapshot holdings history", error)),
        db.liquidityAccounts.snapshotAccountsForUser(req.userId as string, balance.date)
            .catch((error) => console.error("balances/add: failed to snapshot liquidity history", error)),
    ]);
    // Send status code 200 (OK)
    res.status(200);
    res.send();
});

const DEFAULT_MONTHS = 24
const MAX_MONTHS = 600 // 50 years, safety cap against abuse

balancesRouter.post("/get", async (req, res) => {
    // Optional range: `months` (number, capped) or the string "all" for the entire history.
    // Omitted -> defaults to 24 months (previous fixed behavior, unchanged for existing callers).
    let months: number | undefined
    if (req.body?.months === "all") {
        months = undefined
    } else {
        const requested = Number(req.body?.months)
        months = (Number.isFinite(requested) && requested > 0) ? Math.min(requested, MAX_MONTHS) : DEFAULT_MONTHS
    }
    const balances = await db.balances.getBalanceHistoryByUserId(req.userId as string, months);
    // If a balance is empty, fill it with the data of the most recent
    // non-empty balance
    const isBalanceEmpty = (balance: any) => {
        return Object.keys(balance.balance).length === 0
    }
    let lastValidBalance: any = {}
    for (let i = balances.length - 1; i >= 0; i--) {
        if (isBalanceEmpty(balances[i]))
            balances[i].balance = lastValidBalance
        else
            lastValidBalance = balances[i].balance
    }
    // Send the data to the client with status code 200 (OK)
    res.status(200);
    res.json(balances);
});

export default balancesRouter
