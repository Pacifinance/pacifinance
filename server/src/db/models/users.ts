import mongoose from "mongoose"

import { ExtDate } from "../../libs/datelib"

import tags from "./tags"

const userIdLength = 6;
const sessionIdLength = 32;

/**
 * Creates a new invalid ObjectID for mongoDB
 * @returns A new mongoDB ObjectID
 */
function newNullObjectId() {
    return new mongoose.Types.ObjectId(NaN);
}

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
    age: {type: mongoose.Types.ObjectId, ref: "Tag", default: ""},
    livingSituation: {type: mongoose.Types.ObjectId, ref: "Tag", default: ""},
    housingType: {type: mongoose.Types.ObjectId, ref: "Tag", default: ""},
    children: {type: mongoose.Types.ObjectId, ref: "Tag", default: ""},
    country: {type: mongoose.Types.ObjectId, ref: "Tag", default: ""},
    job: {type: mongoose.Types.ObjectId, ref: "Tag", default: ""},
    jobType: {type: mongoose.Types.ObjectId, ref: "Tag", default: ""},
    jobCountry: {type: mongoose.Types.ObjectId, ref: "Tag", default: ""},
    workTime: {type: mongoose.Types.ObjectId, ref: "Tag", default: ""},
    remoteType: {type: mongoose.Types.ObjectId, ref: "Tag", default: ""},
    yearsOfExperience: {type: mongoose.Types.ObjectId, ref: "Tag", default: ""},
    preferredCurrency: {type: mongoose.Types.ObjectId, ref: "Tag", default: ""},
    goals: {type: {
        expensesLimit: {type: Number, required: true},
        savingsPercent: {type: Number, required: true},
        emergencyFundGoal: {type: Number, required: true},
    }, required: true},
    session: {type: {
        sessionId: {type: String, required: true, unique: true, dropDups: true},
        expirationDate: {type: Date, required: true}
    }, required: true}
});

/* ==================== Template queries ==================== */

/**
 * Adds a user
 * @param data Data of the new User document 
 * @returns User document, or null in case of error
 */
async function addOne(data: object) {
    const user = await User.create(data).catch(() => null)
    if (!user || !user._id)
        return null
    return user.toJSON()
}

/**
 * Gets a list of users that match a filter
 * @param where Filter to match
 * @param select Fields to return
 * @returns List of User documents
 */
async function get(where: object, select: string) {
    return await User.find(where, select).lean().exec();
}

/**
 * Gets a user that match a filter
 * @param where Filter to match
 * @param select Fields to return
 * @returns User document
 */
async function getOne(where: object, select: string) {
    return await User.findOne(where, select).lean().exec();
}

/**
 * Gets a user that match a filter, substituting all Tag references with Tag data
 * @param where Filter to match
 * @param select Fields to return
 * @returns User document
 */
async function getOneAndPopulate(where: object, select: string) {
    return await User.findOne(where, select)
    .populate({path: "age", select: "-_id -__v -translations._id"})
    .populate({path: "livingSituation", select: "-_id -__v -translations._id"})
    .populate({path: "housingType", select: "-_id -__v -translations._id"})
    .populate({path: "children", select: "-_id -__v -translations._id"})
    .populate({path: "country", select: "-_id -__v -translations._id"})
    .populate({path: "job", select: "-_id -__v -translations._id"})
    .populate({path: "jobType", select: "-_id -__v -translations._id"})
    .populate({path: "jobCountry", select: "-_id -__v -translations._id"})
    .populate({path: "workTime", select: "-_id -__v -translations._id"})
    .populate({path: "remoteType", select: "-_id -__v -translations._id"})
    .populate({path: "yearsOfExperience", select: "-_id -__v -translations._id"})
    .populate({path: "preferredCurrency", select: "-_id -__v -translations._id"})
    .lean().exec();
}

/**
 * Updates a user that match a filter
 * @param where Filter to match
 * @param update Fields to update
 * @returns User document
 */
async function setOne(where: object, update: object) {
    return await User.findOneAndUpdate(where, {$set: update}).lean().exec();
}

/**
 * Deletes a user that match a filter
 * @param where Filter to match
 * @returns DeleteResult object
 */
async function deleteOne(where: object) {
    return await User.deleteOne(where).lean().exec();
}

/* ==================== Specific queries ==================== */

/**
 * Adds a new user
 * @param user_id ID of the user
 * @param password Hashed password
 * @param type Account type (regular, premium, test, ...)
 */
async function insertNew(user_id: string, password: string, type: number = UserType.regular.value) {
    const data = {
        userId: user_id,
        password: password,
        creationDate: ExtDate.fromNow(),
        type: type,
        nickname: "",
        age: newNullObjectId(),
        livingSituation: newNullObjectId(),
        housingType: newNullObjectId(),
        children: newNullObjectId(),
        country: newNullObjectId(),
        job: newNullObjectId(),
        jobType: newNullObjectId(),
        jobCountry: newNullObjectId(),
        workTime: newNullObjectId(),
        remoteType: newNullObjectId(),
        yearsOfExperience: newNullObjectId(),
        preferredCurrency: newNullObjectId(),
        goals: {
            expensesLimit: -1,
            savingsPercent: -1,
            emergencyFundGoal: -1,
        },
        session: {
            sessionId: user_id, // the first (invalid) sessionId is set to user_id to be unique
            expirationDate: new ExtDate(0)
        }
    }
    return await addOne(data);
}

/**
 * Checks if a user exists in the DB
 * @param user_ref ObjectId of the user
 * @returns true if the user exists, false otherwise
 */
async function userExistsByRef(user_ref: mongoose.Types.ObjectId) {
    const user = await getOne({_id: user_ref}, "");
    return user !== null;
}

/**
 * Gets the object reference of a user
 * @param user_id ID of the user
 * @returns User document
 */
async function getReferenceByUserId(user_id: string) {
    return await getOne({userId: user_id}, "_id");
}

/**
 * Gets all user IDs, filtering by "similar" users if a reference user is provided
 * @param reference_user_id ID or reference of the user to use as a reference for filtering
 * @param ignore_test_users True if test and demo users must be ignored, false otherwise
 * @returns List of User documents
 */
async function getAllUsersIds(reference_user_id: string | undefined = undefined, ignore_test_users: boolean = false) {
    let filter: any = {};
    if (reference_user_id !== undefined) {
        // Get the data of the reference user
        if (reference_user_id.length < 24) // length of a mongodb ObjectID converted to hex string
            var reference_user = await getOne({userId: reference_user_id}, "");
        else
            var reference_user = await getOne({_id: reference_user_id}, "");
        // Create a filter to only retrieve data of "similar" users
        if (reference_user !== null) {
            filter = {
                jobType: reference_user.jobType,
                jobCountry: reference_user.jobCountry,
                workTime: reference_user.workTime
            };
        }
    }
    // If test/demo users must be ignored, add the corresponding filter
    if (ignore_test_users) {
        filter.type = {$lt: UserType.test.value}
    }
    return await get(filter, "_id userId");
}

/**
 * Updates the ID of a user
 * @param old_user_id Current ID of the user
 * @param new_user_id New ID to set
 * @returns User document
 */
async function setUserIdByUserId(old_user_id: string, new_user_id: string) {
    return await setOne({userId: old_user_id}, {userId: new_user_id});
}

/**
 * Gets the password of a user
 * @param user_id ID of the user
 * @returns User document
 */
async function getPasswordByUserId(user_id: string) {
    return await getOne({userId: user_id}, "_id password");
}

/**
 * Updates the password of a user
 * @param user_id ID of the user
 * @param hashed_new_pwd New hashed password to store
 * @returns User document
 */
async function setPasswordOfUserId(user_id: string, hashed_new_pwd: string) {
    return await setOne({userId: user_id}, {password: hashed_new_pwd});
}

/**
 * Updates the nickname of a user
 * @param user_id ID of the user
 * @param nickname Nickname to set
 * @returns User document
 */
async function setNicknameOfUserId(user_id: string, nickname: string) {
    return await setOne({userId: user_id}, {nickname: nickname});
}

/**
 * Gets the type of a user
 * @param user_id ID of the user
 * @returns User document
 */
async function getTypeOfUserId(user_id: string) {
    return await getOne({userId: user_id}, "-_id type");
}

/**
 * Updates the type of a user
 * @param user_id ID of the user
 * @param new_type Index of the type to set
 * @returns User document
 */
async function setTypeOfUserId(user_id: string, new_type: number) {
    return await setOne({userId: user_id}, {type: new_type});
}

/**
 * Gets the session of a user
 * @param user_id ID of the user
 * @returns User document
 */
async function getSessionByUserId(user_id: string) {
    return await getOne({userId: user_id}, "-_id session");
}

/**
 * Updates the session of a user
 * @param user_id ID of the user
 * @param session_id ID of the session
 * @param expiration_date Expiration date of the session
 * @returns User document
 */
async function setSessionOfUserId(user_id: string, session_id: string, expiration_date: Date) {
    return await setOne({userId: user_id}, {session: {
        sessionId: session_id,
        expirationDate: expiration_date
    }});
}

/**
 * Gets all public information of a user
 * @param user_id ID of the user
 * @returns User document
 */
async function getPublicInfoByUserId(user_id: string) {
    return await getOneAndPopulate({userId: user_id}, "-_id -__v -password -session");
}

/**
 * Sets all public information of a user
 * @param user_id ID of the user
 * @param age Index of the age tag to set
 * @param livingSituation Index of the livingSituation tag to set
 * @param housingType Index of the housingType tag to set
 * @param children Index of the children tag to set
 * @param country Index of the country tag to set
 * @param job Index of the job tag to set
 * @param jobType Index of the jobType tag to set
 * @param jobCountry Index of the jobCountry tag to set
 * @param workTime Index of the workTime tag to set
 * @param remoteType Index of the remoteType tag to set
 * @param yearsOfExperience Index of the yearsOfExperience tag to set
 * @param preferredCurrency Index of the preferredCurrency tag to set
 * @returns User document
 */
async function setPublicInfoOfUserId(user_id: string, age: number, livingSituation: number, housingType: number,
    children: number, country: number, job: number, jobType: number, jobCountry: number, workTime: number,
    remoteType: number, yearsOfExperience: number, preferredCurrency: number) {
    // Get the tags references by their index and type
    // If a reference is found, add it to the object that will be used to update the User document
    const valueToTagMapping = [
        {tag: tags.TagType.age, newSelection: age},
        {tag: tags.TagType.livingSituation, newSelection: livingSituation},
        {tag: tags.TagType.housingType, newSelection: housingType},
        {tag: tags.TagType.children, newSelection: children},
        {tag: tags.TagType.country, newSelection: country},
        {tag: tags.TagType.job, newSelection: job},
        {tag: tags.TagType.jobType, newSelection: jobType},
        {tag: tags.TagType.country, newSelection: jobCountry},
        {tag: tags.TagType.workTime, newSelection: workTime},
        {tag: tags.TagType.remoteType, newSelection: remoteType},
        {tag: tags.TagType.yearsOfExperience, newSelection: yearsOfExperience},
        {tag: tags.TagType.currency, newSelection: preferredCurrency},
    ]
    let update_object: any = {};
    for (let curr of valueToTagMapping) {
        const tag_ref = await tags.getReferenceByIndexAndType(curr.newSelection, curr.tag.value);
        if (tag_ref !== null) {
            update_object[curr.tag.name] = tag_ref._id;
        }
    }
    // Update the User document
    return await setOne({userId: user_id}, update_object);
}

/**
 * Sets the goals of a user
 * @param user_id ID of the user
 * @param expensesLimit Limit on expenses
 * @param savingsPercent Goal on savings percentage
 * @param emergencyFundGoal Goal on emergency fund
 * @returns User document
 */
async function setGoalsOfUserId(user_id: string, expensesLimit: number,
    savingsPercent: number, emergencyFundGoal: number) {
    const update_object = {
        goals: {
            expensesLimit: expensesLimit,
            savingsPercent: savingsPercent,
            emergencyFundGoal: emergencyFundGoal,
        }
    }
    return await setOne({userId: user_id}, update_object)
}

/**
 * Deletes a user by its reference
 * @param user_ref ObjectId of the user
 * @returns DeleteResult object
 */
async function deleteUserByRef(user_ref: mongoose.Types.ObjectId) {
    return await deleteOne({_id: user_ref});
}

/**
 * User model
 */
const User = mongoose.model("User", userSchema);

export default {
    userIdLength,
    sessionIdLength,
    UserType,
    insertNew,
    userExistsByRef,
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
    setPublicInfoOfUserId,
    setGoalsOfUserId,
    deleteUserByRef
};