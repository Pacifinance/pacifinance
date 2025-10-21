import mongoose from "mongoose";

const TagType = {
    expense: {name: "expense", value: 0},
    income: {name: "income", value: 1},
    payment: {name: "payment", value: 2},
    country: {name: "country", value: 3},
    job: {name: "job", value: 4},
    jobType: {name: "jobType", value: 5},
    workTime: {name: "workTime", value: 6},
    remoteType: {name: "remoteType", value: 7},
    yearsOfExperience: {name: "yearsOfExperience", value: 8},
    age: {name: "age", value: 9},
    livingSituation: {name: "livingSituation", value: 10},
    housingType: {name: "housingType", value: 11},
    children: {name: "children", value: 12}
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

/**
 * Capitalizes the first character of a string
 * @param str Target string
 * @returns The same string but with the first character capitalized
 */
function capitalizeFirst(str: string) {
    str = str.toLowerCase()
    return str[0].toUpperCase() + str.slice(1)
}

/* ==================== Template queries ==================== */

/**
 * Adds a tag
 * @param data Data of the new Tag document 
 * @returns Tag document
 */
async function addOne(data: object) {
    return (await Tag.create(data)).toJSON();
}

/**
 * Gets a list of tags that match a filter
 * @param where Filter to match
 * @param select Fields to return
 * @param sort Fields to sort by and their order
 * @returns List of Tags documents
 */
async function getSorted(where: object, select: string, sort: any) {
    return await Tag.find(where, select).sort(sort).lean().exec();
}

/**
 * Gets a tag that match a filter
 * @param where Filter to match
 * @param select Fields to return
 * @returns Tag document
 */
async function getOne(where: object, select: string) {
    return await Tag.findOne(where, select).lean().exec();
}

/**
 * Updates a tag that match a filter
 * @param where Filter to match
 * @param update Fields to update
 * @returns Tag document
 */
async function setOne(where: object, update: object) {
    return await Tag.findOneAndUpdate(where, {$set: update}).lean().exec();
}

/* ==================== Specific queries ==================== */

/**
 * Adds a new tag
 * @param label Label of the tag
 * @param index Tag index (client side ID)
 * @param type Type of tag
 * @returns Tag document
 */
async function insertNew(label: string, index: number, type: typeof TagType) {
    const data = {
        label: label,
        index: index,
        type: type,
        translations: {
            en: capitalizeFirst(label)
        }
    }
    return await addOne(data);
}

/**
 * Gets the object reference of a tag
 * @param index Label index (client side ID)
 * @param type Type of tag
 * @returns Tag document
 */
async function getReferenceByIndexAndType(index: number, type: number) {
    return await getOne({index: index, type: type}, "_id");
}

/**
 * Gets all tags by type
 * @param type Type of tag
 * @returns List of Tag documents
 */
async function getAllTagsByType(type: number) {
    return await getSorted({type: type}, "-_id -__v -translations._id", {index: 1});
}

/**
 * Gets a tag by reference
 * @param ref Reference to a tag
 * @returns Tag document
 */
async function getTagByReference(ref: mongoose.ObjectId) {
    return await getOne({_id: ref}, "-_id -__v");
}

/**
 * Adds or updates the translation of a tag for a given language
 * @param index Label index (client side ID)
 * @param type Type of tag
 * @param lang Language (two letters format)
 * @param translation Translation to set
 * @returns 
 */
async function setTranslationByIndexAndType(index: number, type: number, lang: string, translation: string) {
    const field = "translations." + lang;
    return await setOne({index: index, type: type}, {[field]: translation});
}

/**
 * Tags model
 */
const Tag = mongoose.model("Tag", tagsSchema);

export default {
    TagType,
    insertNew,
    getReferenceByIndexAndType,
    getAllTagsByType,
    getTagByReference,
    setTranslationByIndexAndType
};