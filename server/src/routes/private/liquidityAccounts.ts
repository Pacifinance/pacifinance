import express from "express"

import db from "../../db/db"
import common, { isOneOf, normalizeCurrency } from "../common"

/* === /liquidity-accounts/* === */

const liquidityAccountsRouter = express.Router()

function parseAccountPayload(body: Record<string, unknown>) {
    const assetKey = common.sanitizeInput(String(body.asset_key ?? body.assetKey ?? ""))
    const label = common.sanitizeInput(String(body.label ?? "")).slice(0, 60)
    const currentValue = Number(body.current_value ?? body.currentValue)
    const rawLinkedBankKey = body.linked_bank_key ?? body.linkedBankKey
    const linkedBankKey = rawLinkedBankKey ? common.sanitizeInput(String(rawLinkedBankKey)).slice(0, 40) : null
    const rawUnitValue = body.unit_value ?? body.unitValue
    const unitValue = rawUnitValue === null || rawUnitValue === undefined || rawUnitValue === "" ? null : Number(rawUnitValue)
    const rawFallbackId = body.fallback_account_id ?? body.fallbackAccountId
    const fallbackAccountId = rawFallbackId === null || rawFallbackId === undefined || rawFallbackId === "" ? null : Number(rawFallbackId)

    if (
        !isOneOf(assetKey, db.liquidityAccounts.LIQUIDITY_ACCOUNT_ASSET_KEYS) ||
        label.length === 0 ||
        !Number.isFinite(currentValue) ||
        (unitValue !== null && (!Number.isFinite(unitValue) || unitValue <= 0)) ||
        (fallbackAccountId !== null && !Number.isFinite(fallbackAccountId))
    ) {
        return null
    }

    return {
        assetKey,
        label,
        currentValue,
        currency: normalizeCurrency(body.currency),
        notes: common.sanitizeInput(String(body.notes ?? "")).slice(0, 240),
        linkedBankKey: linkedBankKey || null,
        unitValue,
        fallbackAccountId,
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

    // fallback_account_id is a soft self-reference within the same table: the
    // FK constraint alone doesn't enforce it belongs to this user (FK checks
    // bypass RLS), and it can't reference the account being saved itself.
    if (payload.fallbackAccountId !== null) {
        if (payload.fallbackAccountId === accountId) {
            res.status(400).send()
            return
        }
        const ownAccounts = await db.liquidityAccounts.getAccountsByUserId(req.userId as string)
        if (!ownAccounts.some((account) => account.id === payload.fallbackAccountId)) {
            res.status(400).send()
            return
        }
    }

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

    const result = await db.liquidityAccounts.upsertAccountHistoryEntry(
        req.userId as string,
        payload.accountId,
        payload.userDate,
        {currentValue: payload.currentValue},
    )
    if (result.status === "not_found") {
        res.status(400).json({error: "account not found, or not owned by this user"})
        return
    }
    if (result.status === "db_error") {
        res.status(500).json({error: result.message})
        return
    }
    res.status(200).json(result.entry)
})

export default liquidityAccountsRouter
