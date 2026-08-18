import express from "express"

import db from "../../db/db"
import common from "../common"
import { inferTransactionPurpose, isPurposeCompatible } from "../../domain/transactions"
import { sanitizeBalanceSource } from "./transactions"

/* === /recurring-transactions/* === */

const recurringTransactionsRouter = express.Router()

const NOTES_MAX_LENGTH = 64
const MIN_DAY = 1
const MAX_DAY = 28

function parseRecurringPayload(body: Record<string, unknown>) {
    if (body.direction !== undefined && body.direction !== "income" && body.direction !== "outflow") return null
    const isExpense = body.direction !== undefined ? body.direction === "outflow" : Boolean(body.is_expense)
    const amount = common.roundCurrency(Number(body.amount))
    const paymentType = Number(body.payment_type ?? 0)
    const categoryTag = Number(body.category_tag)
    const purpose = inferTransactionPurpose(isExpense ? "outflow" : "income", categoryTag, body.purpose)
    const rawUserCategoryId = body.user_category_id
    const userCategoryId = (rawUserCategoryId !== null && rawUserCategoryId !== undefined && Number.isFinite(Number(rawUserCategoryId)))
        ? Number(rawUserCategoryId) : null
    const dayOfMonth = Math.trunc(Number(body.day_of_month))
    const notes = common.sanitizeInput(String(body.notes ?? "")).slice(0, NOTES_MAX_LENGTH)

    const amountValid = Number.isFinite(amount) && amount > 0
    const categoryValid = Number.isFinite(categoryTag)
    const paymentTypeValid = !isExpense || (Number.isFinite(paymentType) && paymentType !== 0)
    const dayValid = Number.isFinite(dayOfMonth) && dayOfMonth >= MIN_DAY && dayOfMonth <= MAX_DAY

    if (!amountValid || !categoryValid || !paymentTypeValid || !dayValid || purpose === null
        || !isPurposeCompatible(isExpense ? "outflow" : "income", purpose)) return null

    const balanceSource = sanitizeBalanceSource(body.balance_source)

    return {isExpense, purpose, amount, notes, paymentType, categoryTag, userCategoryId, dayOfMonth, balanceSource}
}

recurringTransactionsRouter.post("/get", async (req, res) => {
    const items = await db.recurringTransactions.getAllByUserId(req.userId as string)
    res.status(200).json(items)
})

recurringTransactionsRouter.post("/save", async (req, res) => {
    const payload = parseRecurringPayload(req.body)
    if (payload === null) {
        res.status(400).send()
        return
    }

    const id = req.body.id === undefined || req.body.id === null ? null : Number(req.body.id)
    const item = id === null
        ? await db.recurringTransactions.insertRecurring(req.userId as string, payload)
        : Number.isFinite(id)
            ? await db.recurringTransactions.updateRecurring(req.userId as string, id, payload)
            : null

    if (item === null) {
        res.status(500).send()
        return
    }
    res.status(200).json(item)
})

recurringTransactionsRouter.post("/set-active", async (req, res) => {
    const id = Number(req.body.id)
    const active = Boolean(req.body.active)
    if (!Number.isFinite(id)) {
        res.status(400).send()
        return
    }
    const item = await db.recurringTransactions.setActive(req.userId as string, id, active)
    if (item === null) {
        res.status(500).send()
        return
    }
    res.status(200).json(item)
})

recurringTransactionsRouter.post("/delete", async (req, res) => {
    const id = Number(req.body.id)
    if (!Number.isFinite(id)) {
        res.status(400).send()
        return
    }
    const result = await db.recurringTransactions.deleteRecurring(req.userId as string, id)
    if (result === null || result.deletedCount !== 1) {
        res.status(500).send()
        return
    }
    res.status(200).send()
})

export default recurringTransactionsRouter
