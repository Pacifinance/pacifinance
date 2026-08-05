import webpush from "web-push"

import db from "../db/db"

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
const vapidContact = process.env.VAPID_CONTACT || "mailto:support@pacifinance.com"

if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(vapidContact, vapidPublicKey, vapidPrivateKey)
}

export interface PushPayload {
    title: string
    body: string
    url: string
    tag?: string
}

interface PushTarget {
    userId: string
    endpoint: string
    p256dh: string
    auth: string
}

/**
 * Sends one Web Push message. Returns true on success. A 404/410 response
 * means the browser/OS unsubscribed this endpoint on its own (uninstall,
 * permission revoked, etc.) — that's expected and cleaned up here rather than
 * logged as an error, since sending will keep failing for it otherwise.
 */
async function sendPush(target: PushTarget, payload: PushPayload): Promise<boolean> {
    if (!vapidPublicKey || !vapidPrivateKey) {
        console.error("webPush.sendPush: VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY are not configured")
        return false
    }
    try {
        await webpush.sendNotification(
            {endpoint: target.endpoint, keys: {p256dh: target.p256dh, auth: target.auth}},
            JSON.stringify(payload),
        )
        return true
    } catch (error) {
        const statusCode = (error as {statusCode?: number}).statusCode
        if (statusCode === 404 || statusCode === 410) {
            await db.notifications.deleteSubscription(target.userId, target.endpoint)
        } else {
            console.error("webPush.sendPush: failed to deliver push notification", error)
        }
        return false
    }
}

export default {sendPush}
