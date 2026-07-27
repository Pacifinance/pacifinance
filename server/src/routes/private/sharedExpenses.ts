import express from "express"

import db from "../../db/db"
import common from "../common"

/* === /shared-expenses/* === */

const sharedExpensesRouter = express.Router()

const NOTES_MAX_LENGTH = 64

function parseReceivablePayload(body: Record<string, unknown>) {
    const occurredAt = new Date(String(body.date ?? ""))
    const now = new Date()
    const totalAmount = common.roundCurrency(Number(body.total_amount))
    const ownShare = common.roundCurrency(Number(body.own_share))
    const notes = common.sanitizeInput(String(body.notes ?? "")).slice(0, NOTES_MAX_LENGTH)

    const dateValid = !isNaN(occurredAt.getTime()) && occurredAt <= now
    const amountsValid = Number.isFinite(totalAmount) && totalAmount > 0
        && Number.isFinite(ownShare) && ownShare >= 0 && ownShare < totalAmount

    if (!dateValid || !amountsValid) return null
    return {occurredAt, notes, totalAmount, ownShare}
}

sharedExpensesRouter.post("/get", async (req, res) => {
    const receivables = await db.sharedExpenses.getReceivablesByUserId(req.userId as string)
    res.status(200).json(receivables)
})

sharedExpensesRouter.post("/add", async (req, res) => {
    const payload = parseReceivablePayload(req.body)
    if (payload === null) {
        res.status(400).send()
        return
    }

    const receivable = await db.sharedExpenses.insertReceivable(req.userId as string, payload)
    if (receivable === null) {
        res.status(500).send()
        return
    }
    res.status(200).json(receivable)
})

sharedExpensesRouter.post("/settle", async (req, res) => {
    const id = Number(req.body.id)
    const amount = common.roundCurrency(Number(req.body.amount))
    if (!Number.isFinite(id) || !Number.isFinite(amount) || amount <= 0) {
        res.status(400).send()
        return
    }

    const receivable = await db.sharedExpenses.settleReceivable(req.userId as string, id, amount)
    if (receivable === null) {
        res.status(500).send()
        return
    }
    res.status(200).json(receivable)
})

sharedExpensesRouter.post("/delete", async (req, res) => {
    const id = Number(req.body.id)
    if (!Number.isFinite(id)) {
        res.status(400).send()
        return
    }
    const result = await db.sharedExpenses.deleteReceivable(req.userId as string, id)
    if (result === null || result.deletedCount !== 1) {
        res.status(500).send()
        return
    }
    res.status(200).send()
})

export default sharedExpensesRouter
