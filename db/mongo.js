const mongoose = require("mongoose");
const users = require("./models/users.js");
const balances = require("./models/balances.js");
const expenses = require("./models/expenses.js");
const tags = require("./models/tags.js")
const delqueue = require("./models/delqueue.js");
const cachestorage = require("./models/cache.js");

async function connect(uri) {
    return mongoose.connect(uri);
}

module.exports = {connect, users, balances, expenses, tags, delqueue, cachestorage};