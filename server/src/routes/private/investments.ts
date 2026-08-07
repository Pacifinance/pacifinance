import express from "express"

import db from "../../db/db"
import cache from "../../cache/cache"
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

investmentsRouter.post("/holdings/refresh-prices", async (req, res) => {
    if (await cache.valueExpired("exchangeRates")) await cache.invalidate("exchangeRates")
    const eurRates = await cache.get("exchangeRates")
    if (!eurRates) {
        res.status(503).send()
        return
    }
    const holdings = await db.investments.refreshHoldingPrices(req.userId as string, eurRates)
    res.status(200).json(holdings)
})

investmentsRouter.post("/holdings/backfill-historical-prices", async (req, res) => {
    if (await cache.valueExpired("exchangeRates")) await cache.invalidate("exchangeRates")
    const eurRates = await cache.get("exchangeRates")
    if (!eurRates) {
        res.status(503).send()
        return
    }
    const results = await db.investments.backfillHistoricalPrices(req.userId as string, eurRates)
    res.status(200).json(results)
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

investmentsRouter.post("/holdings/history/delete-instrument", async (req, res) => {
    const instrumentId = Number(req.body.instrument_id ?? req.body.instrumentId)
    if (!Number.isFinite(instrumentId)) { res.status(400).send(); return }
    const result = await db.investments.deleteHoldingHistoryForInstrument(req.userId as string, instrumentId)
    if (result === null) { res.status(500).send(); return }
    res.status(200).json(result)
})

function parseHoldingHistoryPayload(body: any): {holdingId: number, userDate: Date, currentValue: number | null, investedAmount: number | null, quantity?: number | null} | {error: string} {
    const holdingId = Number(body.holding_id ?? body.holdingId)
    const userDate = new Date(body.user_date ?? body.userDate)
    const currentValue = optionalNumber(body.current_value ?? body.currentValue)
    const investedAmount = optionalNumber(body.invested_amount ?? body.investedAmount)
    const now = new Date()

    if (!Number.isFinite(holdingId)) return {error: "invalid holding_id"}
    if (isNaN(userDate.getTime())) return {error: "invalid user_date"}
    if (userDate > now) return {error: "user_date is in the future"}
    if (currentValue === undefined) return {error: "current_value must be a non-negative number or null"}
    if (investedAmount === undefined) return {error: "invested_amount must be a non-negative number or null"}

    // Distinguishes "not sent at all" (denormalize from the live holding, the
    // pre-existing behavior) from "sent, even if null" (the import wizard's
    // monthly backfill, which always knows the real quantity held that month).
    const rawQuantity = body.quantity ?? body.holdingQuantity
    if (rawQuantity === undefined) return {holdingId, userDate, currentValue, investedAmount}
    const quantity = optionalNumber(rawQuantity)
    if (quantity === undefined) return {error: "quantity must be a non-negative number or null"}

    return {holdingId, userDate, currentValue, investedAmount, quantity}
}

investmentsRouter.post("/holdings/history/save", async (req, res) => {
    const parsed = parseHoldingHistoryPayload(req.body)
    if ("error" in parsed) {
        res.status(400).json({error: parsed.error})
        return
    }

    const result = await db.investments.upsertHoldingHistoryEntry(
        req.userId as string,
        parsed.holdingId,
        parsed.userDate,
        {currentValue: parsed.currentValue, investedAmount: parsed.investedAmount, quantity: parsed.quantity},
    )
    if (result.status === "not_found") {
        res.status(400).json({error: "holding not found, or not owned by this user"})
        return
    }
    if (result.status === "db_error") {
        // A genuine server-side failure (e.g. a schema mismatch), not a bad
        // request - 500, not 400, so it isn't mistaken for one.
        res.status(500).json({error: result.message})
        return
    }
    res.status(200).json(result.entry)
})

investmentsRouter.post("/holdings/history/save-batch", async (req, res) => {
    const rawEntries = Array.isArray(req.body.entries) ? req.body.entries : []
    const errors: string[] = []
    const valid: {holdingId: number, userDate: Date, currentValue: number | null, investedAmount: number | null, quantity?: number | null}[] = []
    for (const raw of rawEntries) {
        const parsed = parseHoldingHistoryPayload(raw)
        if ("error" in parsed) errors.push(parsed.error)
        else valid.push(parsed)
    }

    const result = await db.investments.upsertHoldingHistoryBatch(req.userId as string, valid)
    res.status(200).json({savedCount: result.savedCount, errors: [...errors, ...result.errors]})
})

function parseDividendPayload(body: any): {instrumentId: number, holdingId: number | null, amount: number, currency: string | null, grossAmount: number | null, paidDate: Date, externalId: string | null, source: string} | {error: string} {
    const instrumentId = Number(body.instrument_id ?? body.instrumentId)
    const holdingIdRaw = body.holding_id ?? body.holdingId
    const holdingId = holdingIdRaw === undefined || holdingIdRaw === null || holdingIdRaw === "" ? null : Number(holdingIdRaw)
    const amount = Number(body.amount)
    const grossAmount = optionalNumber(body.gross_amount ?? body.grossAmount)
    const paidDate = new Date(body.paid_date ?? body.paidDate)
    const now = new Date()
    const source = common.sanitizeInput(body.source).slice(0, 40)

    if (!Number.isFinite(instrumentId)) return {error: "invalid instrument_id"}
    if (holdingId !== null && !Number.isFinite(holdingId)) return {error: "invalid holding_id"}
    if (!Number.isFinite(amount) || amount < 0) return {error: "amount must be a non-negative number"}
    if (grossAmount === undefined) return {error: "gross_amount must be a non-negative number or null"}
    if (isNaN(paidDate.getTime())) return {error: "invalid paid_date"}
    if (paidDate > now) return {error: "paid_date is in the future"}
    if (source === "") return {error: "source is required"}

    return {
        instrumentId,
        holdingId,
        amount,
        currency: body.currency ? normalizeCurrency(body.currency) : null,
        grossAmount,
        paidDate,
        externalId: common.sanitizeInput(body.external_id ?? body.externalId).slice(0, 120) || null,
        source,
    }
}

investmentsRouter.post("/dividends/save", async (req, res) => {
    const parsed = parseDividendPayload(req.body)
    if ("error" in parsed) {
        res.status(400).json({error: parsed.error})
        return
    }

    // Scoped the same way holdings are: getInstrumentById only returns the shared
    // catalog plus this user's own private instruments, never another user's.
    const instrument = await db.investments.getInstrumentById(parsed.instrumentId, req.userId as string)
    if (instrument === null) {
        res.status(400).json({error: "instrument not found, or not owned by this user"})
        return
    }

    const dividend = await db.investments.upsertDividend(req.userId as string, parsed)
    if (dividend === null) {
        res.status(500).send()
        return
    }
    res.status(200).json(dividend)
})

investmentsRouter.post("/dividends/save-batch", async (req, res) => {
    const rawEntries = Array.isArray(req.body.entries) ? req.body.entries : []
    const errors: string[] = []
    const valid: {instrumentId: number, holdingId: number | null, amount: number, currency: string | null, grossAmount: number | null, paidDate: Date, externalId: string | null, source: string}[] = []
    for (const raw of rawEntries) {
        const parsed = parseDividendPayload(raw)
        if ("error" in parsed) errors.push(parsed.error)
        else valid.push(parsed)
    }

    const result = await db.investments.upsertDividendsBatch(req.userId as string, valid)
    res.status(200).json({savedCount: result.savedCount, errors: [...errors, ...result.errors]})
})

investmentsRouter.post("/dividends/summary", async (req, res) => {
    const summary = await db.investments.getDividendsSummaryByUserId(req.userId as string)
    res.status(200).json(summary)
})

function parseTransactionPayload(body: any): {instrumentId: number, holdingId: number | null, side: "buy" | "sell", quantity: number, price: number | null, currency: string | null, total: number | null, totalCurrency: string | null, tradeDate: Date, externalId: string | null, source: string} | {error: string} {
    const instrumentId = Number(body.instrument_id ?? body.instrumentId)
    const holdingIdRaw = body.holding_id ?? body.holdingId
    const holdingId = holdingIdRaw === undefined || holdingIdRaw === null || holdingIdRaw === "" ? null : Number(holdingIdRaw)
    const side = common.sanitizeInput(body.side)
    const quantity = Number(body.quantity)
    const price = optionalNumber(body.price)
    const total = optionalNumber(body.total)
    const tradeDate = new Date(body.trade_date ?? body.tradeDate)
    const now = new Date()
    const source = common.sanitizeInput(body.source).slice(0, 40)

    if (!Number.isFinite(instrumentId)) return {error: "invalid instrument_id"}
    if (holdingId !== null && !Number.isFinite(holdingId)) return {error: "invalid holding_id"}
    if (side !== "buy" && side !== "sell") return {error: "side must be 'buy' or 'sell'"}
    if (!Number.isFinite(quantity) || quantity <= 0) return {error: "quantity must be a positive number"}
    if (price === undefined) return {error: "price must be a non-negative number or null"}
    if (total === undefined) return {error: "total must be a non-negative number or null"}
    if (isNaN(tradeDate.getTime())) return {error: "invalid trade_date"}
    if (tradeDate > now) return {error: "trade_date is in the future"}
    if (source === "") return {error: "source is required"}

    return {
        instrumentId,
        holdingId,
        side,
        quantity,
        price,
        currency: body.currency ? normalizeCurrency(body.currency) : null,
        total,
        totalCurrency: (body.total_currency ?? body.totalCurrency) ? normalizeCurrency(body.total_currency ?? body.totalCurrency) : null,
        tradeDate,
        externalId: common.sanitizeInput(body.external_id ?? body.externalId).slice(0, 120) || null,
        source,
    }
}

investmentsRouter.post("/transactions/save", async (req, res) => {
    const parsed = parseTransactionPayload(req.body)
    if ("error" in parsed) {
        res.status(400).json({error: parsed.error})
        return
    }

    const instrument = await db.investments.getInstrumentById(parsed.instrumentId, req.userId as string)
    if (instrument === null) {
        res.status(400).json({error: "instrument not found, or not owned by this user"})
        return
    }

    const transaction = await db.investments.upsertTransaction(req.userId as string, parsed)
    if (transaction === null) {
        res.status(500).send()
        return
    }
    res.status(200).json(transaction)
})

investmentsRouter.post("/transactions/save-batch", async (req, res) => {
    const rawEntries = Array.isArray(req.body.entries) ? req.body.entries : []
    const errors: string[] = []
    const valid: {instrumentId: number, holdingId: number | null, side: "buy" | "sell", quantity: number, price: number | null, currency: string | null, total: number | null, totalCurrency: string | null, tradeDate: Date, externalId: string | null, source: string}[] = []
    for (const raw of rawEntries) {
        const parsed = parseTransactionPayload(raw)
        if ("error" in parsed) errors.push(parsed.error)
        else valid.push(parsed)
    }

    const result = await db.investments.saveTransactionsBatch(req.userId as string, valid)
    res.status(200).json({savedCount: result.savedCount, errors: [...errors, ...result.errors]})
})

investmentsRouter.post("/transactions/get", async (req, res) => {
    const transactions = await db.investments.getTransactionsByUserId(req.userId as string)
    res.status(200).json(transactions)
})

investmentsRouter.post("/settings/get", async (req, res) => {
    const settings = await db.investments.getInvestmentSettings(req.userId as string)
    res.status(200).json(settings)
})

investmentsRouter.post("/settings/save", async (req, res) => {
    const monthlyTarget = optionalNumber(req.body.monthly_target ?? req.body.monthlyTarget)
    const monthlyTargetPercent = optionalNumber(req.body.monthly_target_percent ?? req.body.monthlyTargetPercent)
    if (monthlyTarget === undefined || monthlyTargetPercent === undefined || (monthlyTargetPercent !== null && monthlyTargetPercent > 100)) {
        res.status(400).send()
        return
    }
    const result = await db.investments.saveInvestmentSettings(req.userId as string, monthlyTarget, monthlyTargetPercent)
    if (result === null) {
        res.status(500).send()
        return
    }
    res.status(200).json(result)
})

// ---------- /community-prices/* ----------
// Free, human-verified alternative to paid provider historical candles - see
// db.investments' "Community-verified historical prices" section for the
// full model. Every write here is gated by re-checking db.users.isAdmin
// server-side; the frontend's AdminRoute guard is convenience only, never
// trusted as the actual permission check.

const COMMUNITY_PRICE_KINDS = ["stock", "etf", "crypto"] as const

function isValidMonthKey(value: string): boolean {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return false
    const now = new Date()
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    // Monthly community prices represent a stable month-end observation.
    // The current month remains editable in the user's private portfolio, but
    // cannot enter the moderation queue until the month has fully closed.
    return value < currentMonthKey
}

investmentsRouter.post("/community-prices/submit", async (req, res) => {
    const instrumentId = Number(req.body.instrument_id ?? req.body.instrumentId)
    const monthKey = common.sanitizeInput(req.body.month_key ?? req.body.monthKey)
    const suppliedReferenceDate = common.sanitizeInput(req.body.reference_date ?? req.body.referenceDate)
    const [referenceYear, referenceMonth] = monthKey.split("-").map(Number)
    const referenceDate = suppliedReferenceDate || `${monthKey}-${String(new Date(Date.UTC(referenceYear, referenceMonth, 0)).getUTCDate()).padStart(2, "0")}`
    const rawPrice = Number(req.body.raw_price ?? req.body.rawPrice)
    const rawCurrency = normalizeCurrency(req.body.raw_currency ?? req.body.rawCurrency)

    const validReferenceDate = /^\d{4}-\d{2}-\d{2}$/.test(referenceDate)
        && referenceDate.slice(0, 7) === monthKey
        && !Number.isNaN(Date.parse(`${referenceDate}T00:00:00.000Z`))
    if (!Number.isFinite(instrumentId) || !isValidMonthKey(monthKey) || !validReferenceDate || !Number.isFinite(rawPrice) || rawPrice <= 0) {
        res.status(400).send()
        return
    }

    const instrument = await db.investments.getInstrumentById(instrumentId, req.userId as string)
    if (instrument === null || !isOneOf(instrument.kind, COMMUNITY_PRICE_KINDS)) {
        res.status(400).send()
        return
    }

    if (await cache.valueExpired("exchangeRates")) await cache.invalidate("exchangeRates")
    const eurRates = await cache.get("exchangeRates")
    if (!eurRates) {
        res.status(503).send()
        return
    }

    const result = await db.investments.submitCommunityPrice(
        req.userId as string, {instrumentId, monthKey, referenceDate, rawPrice, rawCurrency}, eurRates,
    )
    if (result === null) {
        res.status(500).send()
        return
    }
    if (result.status === "not_eligible") {
        res.status(403).send()
        return
    }
    if (result.status === "provider_available") {
        res.status(403).json({error: "provider_price_already_available"})
        return
    }
    if (result.status === "unknown_currency") {
        res.status(400).send()
        return
    }
    if (result.status === "conflict") {
        // Ambiguous, same shape as /holdings/save's conflict: an active submission for
        // this instrument+month already exists - the client shows it, doesn't overwrite it.
        res.status(409).json({existing: result.existing})
        return
    }
    res.status(200).json(result.submission)
})

investmentsRouter.post("/community-prices/mine", async (req, res) => {
    const submissions = await db.investments.getMyCommunityPriceSubmissions(req.userId as string)
    res.status(200).json(submissions)
})

investmentsRouter.post("/community-prices/pending", async (req, res) => {
    if (!(await db.users.isAdmin(req.userId as string))) {
        res.status(403).send()
        return
    }
    const submissions = await db.investments.getPendingCommunityPrices()
    res.status(200).json(submissions)
})

investmentsRouter.post("/community-prices/verify", async (req, res) => {
    if (!(await db.users.isAdmin(req.userId as string))) {
        res.status(403).send()
        return
    }

    const id = Number(req.body.id)
    const action = common.sanitizeInput(req.body.action)
    const rejectionNote = common.sanitizeInput(req.body.rejection_note ?? req.body.rejectionNote).slice(0, 240) || null

    if (!Number.isFinite(id) || !isOneOf(action, ["approve", "reject"] as const)) {
        res.status(400).send()
        return
    }
    if (action === "reject" && !rejectionNote) {
        res.status(400).json({error: "rejection_note_required"})
        return
    }

    const result = await db.investments.verifyCommunityPrice(req.userId as string, id, action, rejectionNote)
    if (result.status === "not_found") {
        res.status(404).send()
        return
    }
    if (result.status === "already_resolved") {
        res.status(409).json({submission: result.submission})
        return
    }
    res.status(200).json(result.submission)
})

export default investmentsRouter
