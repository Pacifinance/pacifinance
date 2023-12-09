const mongoose = require("mongoose");
const tags = require("./tags.js");
const utils = require("../../utils.js");

const userIdLength = 6;
const sessionIdLength = 32;

const UserType = {
    regular: {name: "regular", value: 0},
    premium: {name: "premium", value: 1},
    test: {name: "test", value: 2},
    demo: {name: "demo", value: 3}
};

const userSchema = new mongoose.Schema({
    userId: {type: String, required: true, unique: true, dropDups: true},
    password: {type: String, required: true},
    creationDate: {type: Date, required: true},
    type: {type: Number, required: true},
    nickname: {type: String, default: ""},
    country: {type: mongoose.Types.ObjectId, ref: "Tag", default: ""},
    job: {type: mongoose.Types.ObjectId, ref: "Tag", default: ""},
    jobType: {type: mongoose.Types.ObjectId, ref: "Tag", default: ""},
    jobCountry: {type: mongoose.Types.ObjectId, ref: "Tag", default: ""},
    workTime: {type: mongoose.Types.ObjectId, ref: "Tag", default: ""},
    remoteType: {type: mongoose.Types.ObjectId, ref: "Tag", default: ""},
    session: {type: {
        sessionId: {type: String, required: true, unique: true, dropDups: true},
        expirationDate: {type: Date, required: true}
    }, required: true}
});

/* ==================== Template queries ==================== */

/**
 * Adds a user
 * @param {Object} data - data of the new User document 
 * @returns User document
 */
async function addOne(data) {
    return (await User.create(data)).toJSON();
}

/**
 * Gets a list of users that match a filter
 * @param {Object} where - filter to match
 * @param {String} select - fields to return
 * @returns List of User documents
 */
async function get(where, select) {
    return await User.find(where, select).lean().exec();
}

/**
 * Gets a user that match a filter
 * @param {Object} where - filter to match
 * @param {String} select - fields to return
 * @returns User document
 */
async function getOne(where, select) {
    return await User.findOne(where, select).lean().exec();
}

/**
 * Gets a user that match a filter, substituting all Tag references with Tag data
 * @param {Object} where - filter to match
 * @param {String} select - fields to return
 * @returns User document
 */
async function getOneAndPopulate(where, select) {
    return await User.findOne(where, select)
    .populate({path: "country", select: "-_id -__v -translations._id"}) // substitution of Tag references with Tag data for "country"
    .populate({path: "job", select: "-_id -__v -translations._id"}) // substitution of Tag references with Tag data for "job"
    .populate({path: "jobType", select: "-_id -__v -translations._id"}) // substitution of Tag references with Tag data for "jobType"
    .populate({path: "jobCountry", select: "-_id -__v -translations._id"}) // substitution of Tag references with Tag data for "jobCountry"
    .populate({path: "workTime", select: "-_id -__v -translations._id"}) // substitution of Tag references with Tag data for "workTime"
    .populate({path: "remoteType", select: "-_id -__v -translations._id"}) // substitution of Tag references with Tag data for "remoteType"
    .lean().exec();
}

/**
 * Updates a user that match a filter
 * @param {Object} where - filter to match
 * @param {Object} update - fields to update
 * @returns User document
 */
async function setOne(where, update) {
    return await User.findOneAndUpdate(where, {$set: update}).lean().exec();
}

/* ==================== Specific queries ==================== */

/**
 * Adds a new user
 * @param {String} user_id - ID of the user
 * @param {String} password - hashed password
 * @param {Number} type - account type (regular, premium, test, ...)
 */
async function insertNew(user_id, password, type=UserType.regular.value) {
    const data = {
        userId: user_id,
        password: password,
        creationDate: new Date(Date.now()),
        type: type,
        nickname: "",
        country: utils.newNullObjectId(),
        job: utils.newNullObjectId(),
        jobType: utils.newNullObjectId(),
        jobCountry: utils.newNullObjectId(),
        workTime: utils.newNullObjectId(),
        remoteType: utils.newNullObjectId(),
        session: {
            sessionId: user_id, // the first (invalid) sessionId is set to user_id to be unique
            expirationDate: new Date(0)
        }
    }
    return await addOne(data);
}

/**
 * Gets the object reference of a user
 * @param {String} user_id - ID of the user
 * @returns User document
 */
async function getReferenceByUserId(user_id) {
    return await getOne({userId: user_id}, "_id");
}

/**
 * Gets all user IDs, filtering by "similar" users if a reference user is provided
 * @param {String} reference_user_id - ID of the user to use as a reference for filtering
 * @returns List of User documents
 */
async function getAllUsersIds(reference_user_id=undefined) {
    let filter = {};
    if (reference_user_id !== undefined) {
        // Get the data of the reference user
        const reference_user = await getOne({userId: reference_user_id}, "");
        // Create a filter to only retrieve data of "similar" users
        if (reference_user !== null) {
            filter = {
                jobType: reference_user.jobType,
                jobCountry: reference_user.jobCountry,
                workTime: reference_user.workTime
            };
        }
    }
    return await get(filter, "-_id userId");
}

/**
 * Updates the ID of a user
 * @param {String} old_user_id - Current ID of the user
 * @param {String} new_user_id - New ID to set
 * @returns User document
 */
async function setUserIdByUserId(old_user_id, new_user_id) {
    return await setOne({userId: old_user_id}, {userId: new_user_id});
}

/**
 * Gets the password of a user
 * @param {String} user_id - ID of the user
 * @returns User document
 */
async function getPasswordByUserId(user_id) {
    return await getOne({userId: user_id}, "-_id password");
}

/**
 * Updates the password of a user
 * @param {String} user_id - ID of the user
 * @param {String} hashed_new_pwd - new hashed password to store
 * @returns User document
 */
async function setPasswordOfUserId(user_id, hashed_new_pwd) {
    return await setOne({userId: user_id}, {password: hashed_new_pwd});
}

/**
 * Updates the nickname of a user
 * @param {String} user_id - ID of the user
 * @param {String} nickname - nickname to set
 * @returns User document
 */
async function setNicknameOfUserId(user_id, nickname) {
    return await setOne({userId: user_id}, {nickname: nickname});
}

/**
 * Gets the type of a user
 * @param {String} user_id - ID of the user
 * @returns User document
 */
async function getTypeOfUserId(user_id) {
    return await getOne({userId: user_id}, "-_id type");
}

/**
 * Updates the type of a user
 * @param {String} user_id - ID of the user
 * @param {Number} new_type - Index of the type to set
 * @returns User document
 */
async function setTypeOfUserId(user_id, new_type) {
    return await setOne({userId: user_id}, {type: new_type});
}

/**
 * Gets the session of a user
 * @param {String} user_id - ID of the user
 * @returns User document
 */
async function getSessionByUserId(user_id) {
    return await getOne({userId: user_id}, "-_id session");
}

/**
 * Updates the session of a user
 * @param {String} user_id - ID of the user
 * @param {String} session_id - ID of the session
 * @param {Date} expiration_date - expiration date of the session
 * @returns User document
 */
async function setSessionOfUserId(user_id, session_id, expiration_date) {
    return await setOne({userId: user_id}, {session: {
        sessionId: session_id,
        expirationDate: expiration_date
    }});
}

/**
 * Gets all public information of a user
 * @param {String} user_id - ID of the user
 * @returns User document
 */
async function getPublicInfoByUserId(user_id) {
    return await getOneAndPopulate({userId: user_id}, "-_id -__v -password -session");
}

/**
 * Sets all public information of a user
 * @param {String} user_id - ID of the user
 * @param {Number} country - Index of the country tag to set
 * @param {Number} job - Index of the job tag to set
 * @param {Number} job_type - Index of the jobType tag to set
 * @param {Number} job_country - Index of the jobCountry tag to set
 * @param {Number} work_time - Index of the workTime tag to set
 * @param {Number} remote_type - Index of the remoteType tag to set
 * @returns User document
 */
async function setPublicInfoOfUserId(user_id, country, job, job_type, job_country, work_time, remote_type) {
    // Get the tags references by their index and type
    // If a reference is found, add it to the object that will be used to update the User document
    let tags_indeces = [country, job, job_type, job_country, work_time, remote_type];
    let tags_types = [tags.TagType.country, tags.TagType.job, tags.TagType.jobType, tags.TagType.country, tags.TagType.workTime, tags.TagType.remoteType];
    let user_fields = ["country", "job", "jobType", "jobCountry", "workTime", "remoteType"];
    let update_object = {};
    for (let i = 0; i < tags_indeces.length; i++) {
        const tag_ref = await tags.getReferenceByIndexAndType(tags_indeces[i], tags_types[i].value);
        if (tag_ref !== null) {
            update_object[user_fields[i]] = tag_ref._id;
        }
    }
    // Update the User document
    return await setOne({userId: user_id}, update_object);
}

/**
 * User model
 */
const User = mongoose.model("User", userSchema);

module.exports = {
    userIdLength,
    sessionIdLength,
    insertNew,
    getReferenceByUserId,
    getAllUsersIds,
    setUserIdByUserId,
    getPasswordByUserId,
    setPasswordOfUserId,
    setNicknameOfUserId,
    getTypeOfUserId,
    setTypeOfUserId,
    getSessionByUserId,
    setSessionOfUserId,
    getPublicInfoByUserId,
    setPublicInfoOfUserId
};