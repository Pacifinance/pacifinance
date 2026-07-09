import supabase from "../supabase"

// Joins the parent tag's client-facing index: the frontend only ever knows
// official tags by their `index` (see db/models/tags.ts), never by the
// internal Postgres id, so the API must expose parentIndex, not parent_tag_id.
const CATEGORY_SELECT = "id, label, parent_tag:tags!user_categories_parent_tag_id_fkey(client_index, type)"

function toCategory(row: any) {
    return {
        id: row.id as number,
        parentIndex: row.parent_tag?.client_index as number,
        parentType: row.parent_tag?.type as number,
        label: row.label as string
    }
}

/**
 * Lists a user's custom categories (children of an official tag)
 * @param user_id uuid of the user
 */
async function getAllByUserId(user_id: string) {
    const {data, error} = await supabase.from("user_categories")
        .select(CATEGORY_SELECT)
        .eq("user_id", user_id)
        .order("label", {ascending: true})
    if (error) console.error("categories.getAllByUserId: failed to read categories", error)
    if (error || !data) return []
    return data.map(toCategory)
}

/**
 * Creates a new custom category for a user, as a child of an existing official tag.
 * Stats/rankings never use this: expenses always keep their official category_tag_id,
 * this is purely a personal display label.
 * @param user_id uuid of the user
 * @param parent_tag_id internal id of the official tag (must be of type expense/income)
 * @param label User-chosen label
 */
async function insertNew(user_id: string, parent_tag_id: number, label: string) {
    const {data, error} = await supabase.from("user_categories")
        .insert({user_id, parent_tag_id, label})
        .select(CATEGORY_SELECT)
        .single()
    if (error) console.error("categories.insertNew: failed to insert category", error)
    if (error || !data) return null
    return toCategory(data)
}

/**
 * Renames a custom category owned by the user. The parent official tag stays
 * unchanged, so existing statistics keep grouping by the same mother category.
 * @param user_id uuid of the user
 * @param category_id id of the custom category to rename
 * @param label New user-facing label
 */
async function renameById(user_id: string, category_id: number, label: string) {
    const {data, error} = await supabase.from("user_categories")
        .update({label})
        .eq("user_id", user_id)
        .eq("id", category_id)
        .select(CATEGORY_SELECT)
        .single()
    if (error) console.error("categories.renameById: failed to rename category", error)
    if (error || !data) return null
    return toCategory(data)
}

/**
 * Deletes a custom category owned by the user. Expenses referencing it keep
 * their official category_tag_id (ON DELETE SET NULL on user_category_id),
 * they just lose the personalized label.
 * @param user_id uuid of the user
 * @param category_id id of the custom category to delete
 */
async function deleteById(user_id: string, category_id: number) {
    const {error, count} = await supabase.from("user_categories")
        .delete({count: "exact"})
        .eq("user_id", user_id)
        .eq("id", category_id)
    if (error) console.error("categories.deleteById: failed to delete category", error)
    if (error) return null
    return {deletedCount: count ?? 0}
}

export default {getAllByUserId, insertNew, renameById, deleteById}
