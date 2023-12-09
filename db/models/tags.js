const mongoose = require("mongoose");
const utils = require("../../utils.js")

const TagType = {
    expense: {name: "expense", value: 0},
    income: {name: "income", value: 1},
    payment: {name: "payment", value: 2},
    country: {name: "country", value: 3},
    job: {name: "job", value: 4},
    jobType: {name: "jobType", value: 5},
    workTime: {name: "workTime", value: 6},
    remoteType: {name: "remoteType", value: 7}
}

const tagsSchema = new mongoose.Schema({
    label: {type: String, required: true},
    index: {type: Number, required: true},
    type: {type: Number, required: true},
    translations: {type: {
        en: {type: String},
        it: {type: String}
    }, required: true}
});

/* ==================== Template queries ==================== */

/**
 * Adds a tag
 * @param {Object} data - data of the new Tag document 
 * @returns Tag document
 */
async function addOne(data) {
    return (await Tag.create(data)).toJSON();
}

/**
 * Gets a list of tags that match a filter
 * @param {Object} where - filter to match
 * @param {String} select - fields to return
 * @param {Object} sort - fields to sort by and their order
 * @returns List of Tags documents
 */
async function getSorted(where, select, sort) {
    return await Tag.find(where, select).sort(sort).lean().exec();
}

/**
 * Gets a tag that match a filter
 * @param {Object} where - filter to match
 * @param {String} select - fields to return
 * @returns Tag document
 */
async function getOne(where, select) {
    return await Tag.findOne(where, select).lean().exec();
}

/**
 * Updates a tag that match a filter
 * @param {Object} where - filter to match
 * @param {Object} update - fields to update
 * @returns Tag document
 */
async function setOne(where, update) {
    return await Tag.findOneAndUpdate(where, {$set: update}).lean().exec();
}

/* ==================== Specific queries ==================== */

/**
 * Adds a new tag
 * @param {String} label - Label of the tag
 * @param {Number} index - Tag index (client side ID)
 * @param {TagType} type - Type of tag
 * @returns Tag document
 */
async function insertNew(label, index, type) {
    const data = {
        label: label,
        index: index,
        type: type,
        translations: {
            en: utils.capitalizeFirst(label)
        }
    }
    return await addOne(data);
}

/**
 * Gets the object reference of a tag
 * @param {Number} index - Label index (client side ID)
 * @param {Number} type - Type of tag
 * @returns Tag document
 */
async function getReferenceByIndexAndType(index, type) {
    return await getOne({index: index, type: type}, "_id");
}

/**
 * Gets all tags by type
 * @param {Number} type - Type of tag
 * @returns List of Tag documents
 */
async function getAllTagsByType(type) {
    return await getSorted({type: type}, "-_id -__v -translations._id", {index: 1});
}

/**
 * Gets a tag by reference
 * @param {mongoose.Types.ObjectId} ref Reference to a tag
 * @returns Tag document
 */
async function getTagByReference(ref) {
    return await getOne({_id: ref}, "-_id -__v");
}

/**
 * Adds or updates the translation of a tag for a given language
 * @param {Number} index - Label index (client side ID)
 * @param {Number} type - Type of tag
 * @param {String} lang - Language (two letters format)
 * @param {String} translation - Translation to set
 * @returns 
 */
async function setTranslationByIndexAndType(index, type, lang, translation) {
    const field = "translations." + lang;
    return await setOne({index: index, type: type}, {[field]: translation});
}

/**
 * Tags model
 */
const Tag = mongoose.model("Tag", tagsSchema);

module.exports = {
    TagType,
    insertNew,
    getReferenceByIndexAndType,
    getAllTagsByType,
    getTagByReference,
    setTranslationByIndexAndType
};