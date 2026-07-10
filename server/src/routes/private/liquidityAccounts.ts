import express from "express"

import db from "../../db/db"
import common from "../common"

/* === /liquidity-accounts/* === */

const liquidityAccountsRouter = express.Router()

function isOneOf<T extends readonly string[]>(value: string, allowed: T): value is T[number] {
    return (allowed as readonly string[]).includes(value)
}

function normalizeCurrency(value: unknown) {
    const currency = common.sanitizeInput(String(value ?? "EUR")).toUpperCase()
    return /^[A-Z]{3}$/.test(currency) ? currency : "EUR"
}

function parseAccountPayload(body: Record<string, unknown>) {
    const assetKey = common.sanitizeInput(String(body.asset_key ?? body.assetKey ?? ""))
    const label = common.sanitizeInput(String(body.label ?? "")).slice(0, 60)
    const currentValue = Number(body.current_value ?? body.currentValue)

    if (
        !isOneOf(assetKey, db.liquidityAccounts.LIQUIDITY_ACCOUNT_ASSET_KEYS) ||
        label.length === 0 ||
        !Number.isFinite(currentValue) ||
        currentValue < 0
    ) {
        return null
    }

    return {
        assetKey,
        label,
        currentValue,
        currency: normalizeCurrency(body.currency),
        notes: common.sanitizeInput(String(body.notes ?? "")).slice(0, 240),
    }
}

liquidityAccountsRouter.post("/get", async (req, res) => {
    const accounts = await db.liquidityAccounts.getAccountsByUserId(req.userId as string)
    res.status(200).json(accounts)
})

liquidityAccountsRouter.post("/save", async (req, res) => {
    const payload = parseAccountPayload(req.body)
    if (payload === null) {
        res.status(400).send()
        return
    }

    const accountId = req.body.id === undefined || req.body.id === null ? null : Number(req.body.id)
    const account = accountId === null
        ? await db.liquidityAccounts.insertAccount(req.userId as string, payload)
        : Number.isFinite(accountId)
            ? await db.liquidityAccounts.updateAccount(req.userId as string, accountId, payload)
            : null

    if (account === null) {
        res.status(500).send()
        return
    }
    res.status(200).json(account)
})

liquidityAccountsRouter.post("/delete", async (req, res) => {
    const accountId = Number(req.body.id)
    if (!Number.isFinite(accountId)) {
        res.status(400).send()
        return
    }
    const result = await db.liquidityAccounts.deleteAccount(req.userId as string, accountId)
    if (result === null || result.deletedCount !== 1) {
        res.status(500).send()
        return
    }
    res.status(200).send()
})

liquidityAccountsRouter.post("/history", async (req, res) => {
    const months = Number(req.body.months)
    const userDate = req.body.user_date ? new Date(req.body.user_date) : undefined
    const history = await db.liquidityAccounts.getAccountHistoryByUserId(
        req.userId as string,
        Number.isFinite(months) && months > 0 ? months : undefined,
        userDate && !isNaN(userDate.getTime()) ? userDate : undefined,
    )
    res.status(200).json(history)
})

function parseAccountHistoryPayload(body: Record<string, unknown>) {
    const accountId = Number(body.account_id ?? body.accountId)
    const userDate = new Date(String(body.user_date ?? body.userDate ?? ""))
    const currentValue = Number(body.current_value ?? body.currentValue)
    const now = new Date()

    if (
        !Number.isFinite(accountId) ||
        isNaN(userDate.getTime()) ||
        userDate > now ||
        !Number.isFinite(currentValue) ||
        currentValue < 0
    ) {
        return null
    }

    return {accountId, userDate, currentValue}
}

liquidityAccountsRouter.post("/history/save", async (req, res) => {
    const payload = parseAccountHistoryPayload(req.body)
    if (payload === null) {
        res.status(400).send()
        return
    }

    const entry = await db.liquidityAccounts.upsertAccountHistoryEntry(
        req.userId as string,
        payload.accountId,
        payload.userDate,
        {currentValue: payload.currentValue},
    )
    if (entry === null) {
        res.status(400).send() // account not found, or not owned by this user
        return
    }
    res.status(200).json(entry)
})

export default liquidityAccountsRouter
