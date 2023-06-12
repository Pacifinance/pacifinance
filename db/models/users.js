const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userId: {type: String, default: "0"},
    password: {type: String, default: "*"},
    roles: {type: [String], default: ["user"]},
    insertRights: {type: Boolean, default: false},
    session: {
        sessionId: {type: String, default: "0"},
        expirationDate: {type: Date, default: new Date(0)}
    }
});

/* ==================== Template queries ==================== */

async function get(where, select) {
    let users = [];
    const result = await User.find(where, select).exec();
    for (let r of result)
        users.push(r)
    return users;
}

async function getOne(where, select) {
    return await User.findOne(where, select);
}

async function setOne(where, update) {
    return await User.findOneAndUpdate(where, {$set: update});
}

/* ==================== Specific queries ==================== */

async function getAllUsersIds() {
    return await get({}, "userId");
}

async function getPasswordByUserId(user_id) {
    return await getOne({userId: user_id}, "password");
}

async function setPasswordOfUserId(user_id, hashed_new_pwd) {
    await setOne({userId: user_id}, {password: hashed_new_pwd});
}

async function getRightsByUserId(user_id) {
    return await getOne({userId: user_id}, "insertRights");
}

async function getSessionByUserId(user_id) {
    return await getOne({userId: user_id}, "session");
}

async function setSessionOfUserId(user_id, session_id, expiration_date) {
    return await setOne({userId: user_id}, {session: {
        sessionId: session_id,
        expirationDate: expiration_date
    }});
}

const User = mongoose.model("User", userSchema);

module.exports = {
    User,
    getAllUsersIds,
    getPasswordByUserId,
    setPasswordOfUserId,
    getRightsByUserId,
    getSessionByUserId,
    setSessionOfUserId
};