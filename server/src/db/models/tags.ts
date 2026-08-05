import supabase from "../supabase"

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
    children: {name: "children", value: 12},
    currency: {name: "currency", value: 13},
}

/**
 * Maps a "tags" row to the public Tag shape used by the frontend.
 * Translations no longer live in the DB: the frontend resolves them from the
 * i18n locales via the label (src/data/tagTranslations.ts).
 */
function toTag(row: {label: string, client_index: number, type: number}) {
    return {label: row.label, index: row.client_index, type: row.type}
}

/* ==================== Specific queries ==================== */

/**
 * Adds a new tag
 * @param label Label of the tag
 * @param index Tag index (client side ID)
 * @param type Type of tag
 * @returns Tag document
 */
async function insertNew(label: string, index: number, type: number) {
    const {data, error} = await supabase.from("tags").insert({
        label, client_index: index, type
    }).select("label, client_index, type").single()
    if (error) console.error("tags.insertNew: failed to insert tag", error)
    if (error || !data) return null
    return toTag(data)
}

/**
 * Gets the object reference of a tag
 * @param index Label index (client side ID)
 * @param type Type of tag
 * @returns {id} object
 */
async function getReferenceByIndexAndType(index: number, type: number) {
    const {data, error} = await supabase.from("tags")
        .select("id")
        .eq("client_index", index).eq("type", type)
        .maybeSingle()
    if (error) console.error("tags.getReferenceByIndexAndType: lookup failed", error)
    if (error || !data) return null
    return {id: data.id as number}
}

/**
 * Gets all tags by type
 * @param type Type of tag
 * @returns List of Tag documents
 */
async function getAllTagsByType(type: number) {
    const {data, error} = await supabase.from("tags")
        .select("label, client_index, type")
        .eq("type", type)
        .order("client_index", {ascending: true})
    if (error) console.error("tags.getAllTagsByType: failed to read tags", error)
    if (error || !data) return []
    return data.map(toTag)
}

/**
 * Gets a tag by reference
 * @param ref Reference (id) to a tag
 * @returns Tag document
 */
async function getTagByReference(ref: number) {
    const {data, error} = await supabase.from("tags")
        .select("label, client_index, type")
        .eq("id", ref)
        .maybeSingle()
    if (error) console.error("tags.getTagByReference: lookup failed", error)
    if (error || !data) return null
    return toTag(data)
}

export default {
    TagType,
    insertNew,
    getReferenceByIndexAndType,
    getAllTagsByType,
    getTagByReference
};
