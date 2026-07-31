import express from "express"

import db from "../../db/db"
import common, { isOneOf } from "../common"

/* === /goals/* === */

const goalsRouter = express.Router()

function parseGoalPayload(body: Record<string, unknown>) {
    const name = common.sanitizeInput(String(body.name ?? "")).slice(0, 80)
    const goalType = common.sanitizeInput(String(body.goal_type ?? body.goalType ?? "savings"))
    const targetValue = Number(body.target_value ?? body.targetValue)
    const rawTargetPercent = body.target_percent_of_net_worth ?? body.targetPercentOfNetWorth
    const targetPercentOfNetWorth = rawTargetPercent === undefined || rawTargetPercent === null || rawTargetPercent === ""
        ? null : Number(rawTargetPercent)
    const currentValue = Number(body.current_value ?? body.currentValue ?? 0)
    const rawLinkedAssetKey = common.sanitizeInput(String(body.linked_asset_key ?? body.linkedAssetKey ?? ""))
    const rawDeadline = common.sanitizeInput(String(body.deadline ?? ""))

    if (
        name.length === 0 ||
        !isOneOf(goalType, db.goals.GOAL_TYPES) ||
        !Number.isFinite(targetValue) || targetValue < 0 ||
        !Number.isFinite(currentValue) || currentValue < 0 ||
        (targetPercentOfNetWorth !== null && (!Number.isFinite(targetPercentOfNetWorth) || targetPercentOfNetWorth < 0 || targetPercentOfNetWorth > 100))
    ) {
        return null
    }

    if (rawLinkedAssetKey !== "" && !isOneOf(rawLinkedAssetKey, db.goals.GOAL_LINKED_ASSET_KEYS)) return null

    return {
        name,
        goalType,
        targetValue,
        targetPercentOfNetWorth,
        currentValue,
        linkedAssetKey: rawLinkedAssetKey === "" ? null : rawLinkedAssetKey,
        deadline: rawDeadline === "" ? null : rawDeadline,
    }
}

goalsRouter.post("/get", async (req, res) => {
    const goals = await db.goals.getGoalsByUserId(req.userId as string)
    res.status(200).json(goals)
})

goalsRouter.post("/save", async (req, res) => {
    const payload = parseGoalPayload(req.body)
    if (payload === null) {
        res.status(400).send()
        return
    }

    const goalId = req.body.id === undefined || req.body.id === null ? null : Number(req.body.id)
    const goal = goalId === null
        ? await db.goals.insertGoal(req.userId as string, payload)
        : Number.isFinite(goalId)
            ? await db.goals.updateGoal(req.userId as string, goalId, payload)
            : null

    if (goal === null) {
        res.status(500).send()
        return
    }
    res.status(200).json(goal)
})

goalsRouter.post("/delete", async (req, res) => {
    const goalId = Number(req.body.id)
    if (!Number.isFinite(goalId)) {
        res.status(400).send()
        return
    }
    const result = await db.goals.deleteGoal(req.userId as string, goalId)
    if (result === null || result.deletedCount !== 1) {
        res.status(500).send()
        return
    }
    res.status(200).send()
})

export default goalsRouter
