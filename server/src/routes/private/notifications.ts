import express from "express"
import db from "../../db/db"

const router = express.Router()

const isBoolean = (value: unknown): value is boolean => typeof value === "boolean"

router.get("/public-key", (_req, res) => {
    res.status(200).json({publicKey: process.env.VAPID_PUBLIC_KEY || null})
})

router.get("/preferences", async (req, res) => {
    const preferences = await db.notifications.getPreferences(req.userId as string)
    if (!preferences) return res.status(500).send()
    res.status(200).json(preferences)
})

router.put("/preferences", async (req, res) => {
    const body = req.body || {}
    const booleans = ["enabled", "monthlySummary", "dataUpdateReminder", "recurringDue", "sharedExpenseUpdates", "communityPriceUpdates"]
    if (!booleans.every((key) => isBoolean(body[key]))) return res.status(400).send()
    const reminderDay = Number(body.reminderDay)
    const reminderHour = Number(body.reminderHour)
    if (!Number.isInteger(reminderDay) || reminderDay < 1 || reminderDay > 28 || !Number.isInteger(reminderHour) || reminderHour < 0 || reminderHour > 23) return res.status(400).send()
    if (typeof body.timezone !== "string" || body.timezone.length > 80 || typeof body.language !== "string" || body.language.length > 10) return res.status(400).send()
    try { new Intl.DateTimeFormat("en", {timeZone: body.timezone}).format() } catch { return res.status(400).send() }
    const saved = await db.notifications.savePreferences(req.userId as string, {...body, reminderDay, reminderHour})
    if (!saved) return res.status(500).send()
    res.status(200).json(saved)
})

router.post("/subscriptions", async (req, res) => {
    const {endpoint, keys} = req.body || {}
    if (typeof endpoint !== "string" || endpoint.length > 4096 || typeof keys?.p256dh !== "string" || typeof keys?.auth !== "string") return res.status(400).send()
    const saved = await db.notifications.saveSubscription(req.userId as string, {endpoint, p256dh: keys.p256dh, auth: keys.auth, userAgent: req.get("user-agent")})
    if (!saved) return res.status(500).send()
    res.status(201).json(saved)
})

router.delete("/subscriptions", async (req, res) => {
    if (typeof req.body?.endpoint !== "string") return res.status(400).send()
    const deleted = await db.notifications.deleteSubscription(req.userId as string, req.body.endpoint)
    if (!deleted) return res.status(500).send()
    res.status(200).json(deleted)
})

export default router
