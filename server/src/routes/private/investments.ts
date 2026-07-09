import express from "express"

import db from "../../db/db"
import common from "../common"

/* === /investments/* === */

const investmentsRouter = express.Router()

function isOneOf<T extends readonly string[]>(value: string, allowed: T): value is T[number] {
    return (allowed as readonly string[]).includes(value)
}

function optionalNumber(value: unknown) {
    if (value === undefined || value === null || value === "") return null
    const n = Number(value)
    return Number.isFinite(n) && n >= 0 ? n : undefined
}

function normalizeCurrency(value: unknown) {
    const currency = common.sanitizeInput(String(value ?? "EUR")).toUpperCase()
    return /^[A-Z]{3}$/.test(currency) ? currency : "EUR"
}

async function parseHoldingPayload(body: any) {
    const instrumentId = Number(body.instrument_id ?? body.instrumentId)
    const assetKey = common.sanitizeInput(body.asset_key ?? body.assetKey)
    const positionType = common.sanitizeInput(body.position_type ?? body.positionType) || "single"
    const quantity = optionalNumber(body.quantity)
    const averagePrice = optionalNumber(body.average_price ?? body.averagePrice)
    const currentValue = optionalNumber(body.current_value ?? body.currentValue)
    const investedAmount = optionalNumber(body.invested_amount ?? body.investedAmount)

    if (
        !Number.isFinite(instrumentId) ||
        !isOneOf(assetKey, db.investments.INVESTMENT_ASSET_KEYS) ||
        !isOneOf(positionType, db.investments.INVESTMENT_POSITION_TYPES) ||
        quantity === undefined ||
        averagePrice === undefined ||
        currentValue === undefined ||
        investedAmount === undefined
    ) {
        return null
    }

    const instrument = await db.investments.getInstrumentById(instrumentId)
    if (instrument === null) return null

    return {
        instrumentId,
        assetKey,
        positionType,
        quantity,
        averagePrice,
        currentValue,
        investedAmount,
        currency: normalizeCurrency(body.currency),
        notes: common.sanitizeInput(body.notes).slice(0, 240),
    }
}

investmentsRouter.post("/instruments/search", async (req, res) => {
    const query = common.sanitizeInput(req.body.query).slice(0, 80)
    const kind = common.sanitizeInput(req.body.kind)
    const limit = Math.min(Math.max(Number(req.body.limit) || 20, 1), 30)

    if (query.length < 2) {
        res.status(200).json([])
        return
    }

    if (kind !== "" && !isOneOf(kind, db.investments.INVESTMENT_KINDS)) {
        res.status(400).send()
        return
    }

    const instruments = await db.investments.searchInstruments(query, kind === "" ? undefined : kind, limit)
    res.status(200).json(instruments)
})

investmentsRouter.post("/holdings/get", async (req, res) => {
    const holdings = await db.investments.getHoldingsByUserId(req.userId as string)
    res.status(200).json(holdings)
})

investmentsRouter.post("/holdings/save", async (req, res) => {
    const payload = await parseHoldingPayload(req.body)
    if (payload === null) {
        res.status(400).send()
        return
    }

    const holdingId = req.body.id === undefined || req.body.id === null ? null : Number(req.body.id)
    const holding = holdingId === null
        ? await db.investments.insertHolding(req.userId as string, payload)
        : Number.isFinite(holdingId)
            ? await db.investments.updateHolding(req.userId as string, holdingId, payload)
            : null

    if (holding === null) {
        res.status(500).send()
        return
    }
    res.status(200).json(holding)
})

investmentsRouter.post("/holdings/delete", async (req, res) => {
    const holdingId = Number(req.body.id)
    if (!Number.isFinite(holdingId)) {
        res.status(400).send()
        return
    }
    const result = await db.investments.deleteHolding(req.userId as string, holdingId)
    if (result === null || result.deletedCount !== 1) {
        res.status(500).send()
        return
    }
    res.status(200).send()
})

export default investmentsRouter
