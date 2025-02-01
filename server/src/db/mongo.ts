import { connect as _connect } from "mongoose";
import users from "./models/users.js";
import balances from "./models/balances.js";
import expenses from "./models/expenses.js";
import tags from "./models/tags.js";
import delqueue from "./models/delqueue.js";
import cachestorage from "./models/cachestorage.js";

/**
 * Connects to a database instance
 * @param {string} uri - DB connection URI
 * @returns Promise
 */
async function connect(uri: string) {
    return _connect(uri);
}

export default {connect, users, balances, expenses, tags, delqueue, cachestorage};