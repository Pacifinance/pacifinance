import express from "express"

import db from "../../db/db"
import common, { isOneOf, normalizeCurrency } from "../common"

/* === /investments/* === */

const investmentsRouter = express.Router()

function optionalNumber(value: unknown) {
    if (value === undefined || value === null || value === "") return null
    const n = Number(value)
    return Number.isFinite(n) && n >= 0 ? n : undefined
}

async function parseHoldingPayload(body: any, user_id: string) {
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

    const instrument = await db.investments.getInstrumentById(instrumentId, user_id)
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
        importSource: common.sanitizeInput(body.import_source ?? body.importSource) || null,
    }
}

investmentsRouter.post("/instruments/search", async (req, res) => {
    const query = common.sanitizeInput(req.body.query).slice(0, 80)
    const kind = common.sanitizeInput(req.body.kind)
    const source = common.sanitizeInput(req.body.source)
    const limit = Math.min(Math.max(Number(req.body.limit) || 20, 1), 30)

    if (query.length < 2) {
        res.status(200).json([])
        return
    }

    if (kind !== "" && !isOneOf(kind, db.investments.INVESTMENT_KINDS)) {
        res.status(400).send()
        return
    }

    if (source !== "" && !isOneOf(source, db.investments.INVESTMENT_SEARCH_SOURCES)) {
        res.status(400).send()
        return
    }

    const instruments = await db.investments.searchInstruments(
        query,
        req.userId as string,
        kind === "" ? undefined : kind,
        limit,
        source === "" ? undefined : source,
    )
    res.status(200).json(instruments)
})

investmentsRouter.post("/instruments/search-by-isins", async (req, res) => {
    const rawIsins = Array.isArray(req.body.isins) ? req.body.isins : []
    const isins = rawIsins
        .map((v: unknown) => common.sanitizeInput(String(v ?? "")))
        .filter((v: string) => v !== "")
        .slice(0, 200)

    if (isins.length === 0) {
        res.status(200).json({})
        return
    }

    const matches = await db.investments.searchInstrumentsByIsins(isins, req.userId as string)
    res.status(200).json(matches)
})

investmentsRouter.post("/instruments/manual", async (req, res) => {
    const kind = common.sanitizeInput(req.body.kind)
    const symbol = common.sanitizeInput(req.body.symbol).slice(0, 20)
    const name = common.sanitizeInput(req.body.name).slice(0, 120)
    const currency = req.body.currency ? normalizeCurrency(req.body.currency) : null

    if (!isOneOf(kind, db.investments.INVESTMENT_KINDS) || symbol === "" || name === "") {
        res.status(400).send()
        return
    }

    const instrument = await db.investments.createManualInstrument(req.userId as string, {kind, symbol, name, currency})
    if (instrument === null) {
        res.status(500).send()
        return
    }
    res.status(200).json(instrument)
})

investmentsRouter.post("/holdings/get", async (req, res) => {
    const holdings = await db.investments.getHoldingsByUserId(req.userId as string)
    res.status(200).json(holdings)
})

investmentsRouter.post("/holdings/save", async (req, res) => {
    const payload = await parseHoldingPayload(req.body, req.userId as string)
    if (payload === null) {
        res.status(400).send()
        return
    }

    const holdingId = req.body.id === undefined || req.body.id === null ? null : Number(req.body.id)

    if (holdingId === null) {
        const mergeStrategyRaw = common.sanitizeInput(req.body.merge_strategy ?? req.body.mergeStrategy)
        const mergeStrategy = mergeStrategyRaw === "add" || mergeStrategyRaw === "replace" ? mergeStrategyRaw : undefined
        const result = await db.investments.insertHolding(req.userId as string, payload, mergeStrategy)
        if (result === null) {
            res.status(500).send()
            return
        }
        if (result.status === "conflict") {
            // Ambiguous: a holding for this instrument already exists from a different
            // (or unknown) source - the client must resolve it explicitly (merge_strategy)
            // instead of the server silently guessing whether to overwrite or sum it.
            res.status(409).json({existing: result.existing})
            return
        }
        res.status(200).json(result.holding)
        return
    }

    const holding = Number.isFinite(holdingId)
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

investmentsRouter.post("/holdings/history", async (req, res) => {
    const months = Number(req.body.months)
    const userDate = req.body.user_date ? new Date(req.body.user_date) : undefined
    const history = await db.investments.getHoldingHistoryByUserId(
        req.userId as string,
        Number.isFinite(months) && months > 0 ? months : undefined,
        userDate && !isNaN(userDate.getTime()) ? userDate : undefined,
    )
    res.status(200).json(history)
})

function parseHoldingHistoryPayload(body: any) {
    const holdingId = Number(body.holding_id ?? body.holdingId)
    const userDate = new Date(body.user_date ?? body.userDate)
    const currentValue = optionalNumber(body.current_value ?? body.currentValue)
    const investedAmount = optionalNumber(body.invested_amount ?? body.investedAmount)
    const now = new Date()

    if (
        !Number.isFinite(holdingId) ||
        isNaN(userDate.getTime()) ||
        userDate > now ||
        currentValue === undefined ||
        investedAmount === undefined
    ) {
        return null
    }

    return {holdingId, userDate, currentValue, investedAmount}
}

investmentsRouter.post("/holdings/history/save", async (req, res) => {
    const payload = parseHoldingHistoryPayload(req.body)
    if (payload === null) {
        res.status(400).send()
        return
    }

    const entry = await db.investments.upsertHoldingHistoryEntry(
        req.userId as string,
        payload.holdingId,
        payload.userDate,
        {currentValue: payload.currentValue, investedAmount: payload.investedAmount},
    )
    if (entry === null) {
        res.status(400).send() // holding not found, or not owned by this user
        return
    }
    res.status(200).json(entry)
})

export default investmentsRouter
