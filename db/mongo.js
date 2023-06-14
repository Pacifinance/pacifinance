const mongoose = require("mongoose");
const users = require("./models/users.js");
const balances = require("./models/balances.js");

async function connect(uri) {
    return mongoose.connect(uri);
}

module.exports = {connect, users, balances};