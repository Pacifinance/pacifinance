import { connect as _connect } from "mongoose"
import users from "./models/users"
import balances from "./models/balances"
import expenses from "./models/expenses"
import tags from "./models/tags"
import delqueue from "./models/delqueue"
import cachestorage from "./models/cachestorage"

/**
 * Connects to a database instance
 * @param {string} uri - DB connection URI
 * @returns Promise
 */
async function connect(uri: string) {
    return _connect(uri);
}

export default {connect, users, balances, expenses, tags, delqueue, cachestorage};