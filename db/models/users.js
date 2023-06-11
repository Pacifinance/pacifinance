const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userId: String,
    password: String,
    roles: [String],
    insertRights: Boolean,
    session: {
        sessionId: String,
        expirationDate: Date
    }
});

/* ==================== Template queries ==================== */

userSchema.statics.get = async function(where, select) {
    let users = [];
    const result = await this.find(where, select).exec();
    for (let r of result)
        users.push(r)
    return users;
}

userSchema.statics.getOne = async function(where, select) {
    return await this.findOne(where, select);
}

userSchema.statics.setOne = async function(where, update) {
    return await this.findOneAndUpdate(where, {$set: update});
}

/* ==================== Specific queries ==================== */

userSchema.statics.getAllUsersIds = async function() {
    return await this.get({}, "userId");
}

userSchema.statics.getPasswordByUserId = async function(user_id) {
    return await this.getOne({userId: user_id}, "password");
}

userSchema.statics.setPasswordOfUserId = async function(user_id, hashed_new_pwd) {
    await this.setOne({userId: user_id}, {password: hashed_new_pwd});
}

userSchema.statics.getRightsByUserId = async function(user_id) {
    return await this.getOne({userId: user_id}, "insertRights");
}

userSchema.statics.getSessionByUserId = async function(user_id) {
    return await this.getOne({userId: user_id}, "session");
}

userSchema.statics.setSessionOfUserId = async function(user_id, session_id, expiration_date) {
    return await this.setOne({userId: user_id}, {session: {
        sessionId: session_id,
        expirationDate: expiration_date
    }});
}

const User = mongoose.model("User", userSchema);

module.exports = User;