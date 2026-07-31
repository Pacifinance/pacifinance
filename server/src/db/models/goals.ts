import supabase from "../supabase"
import balances from "./balances"

export const GOAL_TYPES = ["savings", "purchase", "investment", "debt"] as const
export const GOAL_LINKED_ASSET_KEYS = [
    "bank", "cash", "digitalServices", "emergencyFund",
    "stocks", "etf", "bitcoin", "crypto", "bonds", "funds", "commodities",
] as const

export type GoalType = typeof GOAL_TYPES[number]
export type GoalLinkedAssetKey = typeof GOAL_LINKED_ASSET_KEYS[number]

type GoalRow = {
    id: number
    name: string
    goal_type: GoalType
    target_value: number
    target_percent_of_net_worth: number | null
    current_value: number
    linked_asset_key: GoalLinkedAssetKey | null
    deadline: string | null
    updated_at: string
}

export type GoalInput = {
    name: string
    goalType: GoalType
    targetValue: number
    targetPercentOfNetWorth: number | null
    currentValue: number
    linkedAssetKey: GoalLinkedAssetKey | null
    deadline: string | null
}

const GOAL_SELECT = ["id", "name", "goal_type", "target_value", "target_percent_of_net_worth", "current_value", "linked_asset_key", "deadline", "updated_at"].join(", ")

function toGoal(row: GoalRow) {
    return {
        id: row.id,
        name: row.name,
        goalType: row.goal_type,
        targetValue: row.target_value,
        targetPercentOfNetWorth: row.target_percent_of_net_worth,
        currentValue: row.current_value,
        linkedAssetKey: row.linked_asset_key,
        deadline: row.deadline,
        updatedAt: row.updated_at,
    }
}

function toGoalPayload(user_id: string, input: GoalInput) {
    return {
        user_id,
        name: input.name,
        goal_type: input.goalType,
        target_value: input.targetValue,
        target_percent_of_net_worth: input.targetPercentOfNetWorth,
        current_value: input.currentValue,
        linked_asset_key: input.linkedAssetKey,
        deadline: input.deadline,
    }
}

/**
 * Lists the user's goals. Linked goals (linked_asset_key set) get their
 * currentValue overridden with the live value from the latest balance
 * snapshot instead of the stored column — a single extra query, not one per goal.
 */
async function getGoalsByUserId(user_id: string) {
    const {data, error} = await supabase.from("user_goals")
        .select(GOAL_SELECT)
        .eq("user_id", user_id)
        .order("updated_at", {ascending: false})
    if (error) console.error("goals.getGoalsByUserId: failed to read goals", error)
    if (error || !data) return []

    const goals = (data as unknown as GoalRow[]).map(toGoal)
    const hasLinkedGoal = goals.some((goal) => goal.linkedAssetKey !== null)
    if (!hasLinkedGoal) return goals

    const latestBalance = await balances.getLatestByUserId(user_id)
    if (!latestBalance) return goals

    return goals.map((goal) => {
        if (!goal.linkedAssetKey) return goal
        const liveValue = (latestBalance as unknown as Record<string, number>)[goal.linkedAssetKey]
        return {...goal, currentValue: typeof liveValue === "number" ? liveValue : goal.currentValue}
    })
}

/**
 * Creates a goal.
 */
async function insertGoal(user_id: string, input: GoalInput) {
    const {data, error} = await supabase.from("user_goals")
        .insert(toGoalPayload(user_id, input))
        .select(GOAL_SELECT)
        .single()
    if (error) console.error("goals.insertGoal: failed to insert goal", error)
    if (error || !data) return null
    return toGoal(data as unknown as GoalRow)
}

/**
 * Updates a goal, scoped to the owner.
 */
async function updateGoal(user_id: string, goal_id: number, input: GoalInput) {
    const {data, error} = await supabase.from("user_goals")
        .update({
            name: input.name,
            goal_type: input.goalType,
            target_value: input.targetValue,
            target_percent_of_net_worth: input.targetPercentOfNetWorth,
            current_value: input.currentValue,
            linked_asset_key: input.linkedAssetKey,
            deadline: input.deadline,
            updated_at: new Date().toISOString(),
        })
        .eq("user_id", user_id)
        .eq("id", goal_id)
        .select(GOAL_SELECT)
        .single()
    if (error) console.error("goals.updateGoal: failed to update goal", error)
    if (error || !data) return null
    return toGoal(data as unknown as GoalRow)
}

/**
 * Deletes a goal owned by the user.
 */
async function deleteGoal(user_id: string, goal_id: number) {
    const {error, count} = await supabase.from("user_goals")
        .delete({count: "exact"})
        .eq("user_id", user_id)
        .eq("id", goal_id)
    if (error) console.error("goals.deleteGoal: failed to delete goal", error)
    if (error) return null
    return {deletedCount: count ?? 0}
}

export default {
    GOAL_TYPES,
    GOAL_LINKED_ASSET_KEYS,
    getGoalsByUserId,
    insertGoal,
    updateGoal,
    deleteGoal,
}
