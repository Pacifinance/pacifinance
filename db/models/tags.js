const mongoose = require("mongoose");
const utils = require("../../utils.js")

const TagType = {
    expense: 0,
    income: 1,
    payment: 2,
    job: 3
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
 * @returns List of Tags documents
 */
async function get(where, select) {
    return await Tag.find(where, select).lean().exec();
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
 * @returns Tag document
 */
async function getReferenceByIndex(index) {
    return await getOne({index: index}, "_id");
}

/**
 * Gets all tags by type
 * @param {TagType} type - Type of tag
 * @returns List of Tag documents
 */
async function getAllTagsByType(type) {
    return await get({type: type}, "-_id -__v");
}

/**
 * Adds or updates the translation of a tag for a given language
 * @param {Number} index - Label index (client side ID)
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
    getReferenceByIndex,
    getAllTagsByType,
    setTranslationByIndexAndType
};